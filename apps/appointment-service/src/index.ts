import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import amqp from 'amqplib';

const app = express();
const prisma = new PrismaClient();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// --- RABBITMQ SETUP WITH DLQ (The Safety Net) ---
let channel: amqp.Channel | null = null;

async function connectRabbit() {
  try {
    console.log("⏳ Appointment Service connecting to RabbitMQ...");
    const connection = await amqp.connect("amqp://admin:password123@rabbitmq:5672");
    channel = await connection.createChannel();

    // 1. Create the Dead Letter Exchange (DLX)
    await channel.assertExchange('dlx_exchange', 'direct', { durable: true });

    // 2. Create the Dead Letter Queue (DLQ) - Where failed messages go
    await channel.assertQueue('appointments_dlq', { durable: true });

    // 3. Bind DLQ to DLX
    await channel.bindQueue('appointments_dlq', 'dlx_exchange', 'refund_key');

    // 4. Create Main Queue linked to DLX
    await channel.assertQueue("appointments", { 
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'dlx_exchange', // If fail, send here
        'x-dead-letter-routing-key': 'refund_key' // With this label
      } 
    });
    
    console.log("✅ Appointment Service Connected (DLQ Configured)");

    connection.on("close", () => {
      console.error("RabbitMQ connection closed. Retrying...");
      setTimeout(connectRabbit, 5000);
    });

  } catch (err) {
    console.error("❌ RabbitMQ Connection Failed. Retrying in 5s...", err);
    setTimeout(connectRabbit, 5000);
  }
}

connectRabbit();

// --- API ROUTES ---

app.get('/health', (req, res) => {
  res.json({ service: "Appointment Service", status: "Active" });
});

app.post('/book', async (req, res) => {
  try {
    // 1. Extract paymentIntentId (Expected from Frontend after Stripe payment)
    const { patientId, doctorId, startTime, reason, paymentIntentId } = req.body;


    if (!patientId || !doctorId || !startTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!paymentIntentId) {
    return res.status(400).json({ 
      error: "Payment ID is missing. Cannot process booking safely." 
    });
  }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + 30 * 60000); 

    // 2. Check Availability
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: doctorId,
        startTime: { gte: start, lt: end },
        status: 'SCHEDULED'
      }
    });

    if (conflict) {
      return res.status(409).json({ error: "Doctor is already booked at this time" });
    }

    // 3. Create Booking
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        startTime: start,
        endTime: end,
        reason,
        status: 'SCHEDULED'
      }
    });

    // 4. Publish Event (Include paymentID for potential refunds)
    if (channel) {
      const eventData = {
        type: 'APPOINTMENT_CONFIRMED',
        appointmentId: appointment.id,
        patientId,
        doctorId,
        time: start,
        paymentIntentId: paymentIntentId || null // <--- CRITICAL FOR REFUND
      };
      
      channel.sendToQueue("appointments", Buffer.from(JSON.stringify(eventData)), { persistent: true });
      console.log("📢 Event published to RabbitMQ");
    }

    res.json(appointment);

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});


// API: GET MY APPOINTMENTS
// API: GET MY APPOINTMENTS (Updated with Relations)
app.get('/my-appointments/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { patientId: Number(userId) },
          { doctorId: Number(userId) }
        ]
      },
      orderBy: { startTime: 'asc' }
    });

    res.json(appointments);
  } catch (error) {
    console.error("Fetch Appointments Error:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// apps/appointment-service/src/index.ts

// NEW API: Get Available Slots
// apps/appointment-service/src/index.ts

app.get('/availability', async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    
    if (!doctorId || !date) {
      return res.status(400).json({ error: "Doctor ID and Date are required" });
    }

    // --- CHANGE 1: Update Range to 0 - 24 (Full Day) ---
    const startHourIST = 0;  // 12:00 AM
    const endHourIST = 24;   // 12:00 AM (Next Day) - Loop stops before this
    const slotDuration = 30; 

    // 2. Parse the date
    const searchDate = new Date(date as string);
    
    // Create range for DB filtering (Whole Day)
    // We use UTC 00:00 to 23:59 to ensure we catch all bookings for that calendar date
    const startOfDay = new Date(searchDate); startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate); endOfDay.setUTCHours(23, 59, 59, 999);

    const existingBookings = await prisma.appointment.findMany({
      where: {
        doctorId: Number(doctorId),
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: 'SCHEDULED'
      }
    });

    // 3. Generate Slots (FIXED FOR IST)
    const slots = [];
    
    // Start base time
    let currentTime = new Date(searchDate);
    
    // Set to 00:00 UTC first
    currentTime.setUTCHours(startHourIST, 0, 0, 0); 

    // Shift Time BACK by 5.5 Hours to convert IST -> UTC
    // 00:00 IST is 18:30 UTC on the previous day
    currentTime.setMinutes(currentTime.getMinutes() - 330); 

    // Calculate End Time (Add 24 hours to the start time)
    const endTime = new Date(currentTime);
    endTime.setHours(endTime.getHours() + (endHourIST - startHourIST));

    while (currentTime < endTime) {
      
      const isBooked = existingBookings.some(booking => {
        const bookingTime = new Date(booking.startTime);
        return bookingTime.getTime() === currentTime.getTime();
      });

      slots.push({
        time: currentTime.toISOString(), 
        // Display in IST format
        displayTime: currentTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata' 
        }),
        available: !isBooked
      });

      currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
    }

    res.json(slots);

  } catch (error) {
    console.error("Availability Error:", error);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

// apps/appointment-service/src/index.ts

// API: SAVE PRESCRIPTION (Doctor uses this)
app.post('/prescription', async (req, res) => {
  try {
    const { appointmentId, diagnosis, remarks, medicines } = req.body;

    if (!appointmentId || !medicines || medicines.length === 0) {
      return res.status(400).json({ error: "Missing prescription details" });
    }

    // Transaction: Save Prescription + Update Appointment Status
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Create the Prescription Header
      const prescription = await tx.prescription.create({
        data: {
          appointmentId: Number(appointmentId),
          diagnosis,
          remarks,
          // Prisma allows creating related items in one go!
          medicines: {
            create: medicines.map((med: any) => ({
              name: med.name,
              quantity: med.quantity,
              instructions: med.instructions
            }))
          }
        },
        include: { medicines: true }
      });

      // 2. Mark Appointment as COMPLETED
      await tx.appointment.update({
        where: { id: Number(appointmentId) },
        data: { status: 'COMPLETED' }
      });

      return prescription;
    });

    console.log(`💊 Prescription saved for Appointment ${appointmentId}`);
    res.json(result);

  } catch (error) {
    console.error("Prescription Error:", error);
    res.status(500).json({ error: "Failed to save prescription" });
  }
});

// API: GET PRESCRIPTION (Patient/Doctor views this)
app.get('/prescription/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const prescription = await prisma.prescription.findUnique({
      where: { appointmentId: Number(appointmentId) },
      include: { medicines: true }
    });

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch prescription" });
  }
});

app.listen(PORT, () => {
  console.log(`Appointment Service running on port ${PORT}`);
});