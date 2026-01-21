import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

import amqp from 'amqplib';


// RABBITMQ SETUP (Updated with Retry Logic)
let channel: amqp.Channel | null = null;

async function connectRabbit() {
  try {
    console.log("⏳ Appointment Service connecting to RabbitMQ...");
    // 1. Connect
    const connection = await amqp.connect("amqp://admin:password123@rabbitmq:5672");
    
    // 2. Create Channel
    channel = await connection.createChannel();
    
    // 3. Assert Queue
    await channel.assertQueue("appointments", { durable: true });
    
    console.log("✅ Appointment Service Connected to RabbitMQ");

    // Handle connection close (e.g., if RabbitMQ restarts)
    connection.on("close", () => {
      console.error("RabbitMQ connection closed. Retrying...");
      setTimeout(connectRabbit, 5000);
    });

  } catch (err) {
    console.error("❌ RabbitMQ Connection Failed. Retrying in 5s...", err);
    // 4. THE FIX: Retry after 5 seconds
    setTimeout(connectRabbit, 5000);
  }
}

connectRabbit(); // Start the process

const app = express();
const prisma = new PrismaClient();
const PORT = 3002; // Note: Different port from Auth (3001)

// ... rest of the file ...

app.use(cors());
app.use(express.json()); // We MUST use this here (Gateway passes raw stream)

// HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ service: "Appointment Service", status: "Active" });
});

// API: BOOK AN APPOINTMENT
app.post('/book', async (req, res) => {
  try {
    const { patientId, doctorId, startTime, reason } = req.body;

    // 1. Basic Validation
    if (!patientId || !doctorId || !startTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + 30 * 60000); // Add 30 minutes

    // 2. Check Availability (Is the doctor already booked?)
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: doctorId,
        startTime: {
          gte: start, // Greater than or equal to requested start
          lt: end     // Less than calculated end
        },
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

    if (channel) {
      const eventData = {
        type: 'APPOINTMENT_CONFIRMED',
        patientId: patientId,
        doctorId: doctorId,
        time: start
      };
      channel.sendToQueue("appointments", Buffer.from(JSON.stringify(eventData)));
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

    // 1. Define Doctor's Schedule in IST (9 AM to 12 PM)
    const startHourIST = 9;
    const endHourIST = 12; 
    const slotDuration = 30; 

    // 2. Parse the date
    const searchDate = new Date(date as string);
    
    // Create range for DB filtering (Whole Day)
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
    
    // Start at 9:00 AM UTC first
    let currentTime = new Date(date as string);
    currentTime.setUTCHours(3, 30, 0, 0);

    // Shift Time BACK by 5.5 Hours to convert IST -> UTC
    // 9:00 AM IST = 3:30 AM UTC
    currentTime.setMinutes(currentTime.getMinutes() - 330); 

    // Calculate End Time in UTC (12:00 PM IST - 5.5 hours)
    const endTime = new Date(currentTime);
    endTime.setHours(endTime.getHours() + (endHourIST - startHourIST));

    while (currentTime < endTime) {
      
      const isBooked = existingBookings.some(booking => {
        const bookingTime = new Date(booking.startTime);
        return bookingTime.getTime() === currentTime.getTime();
      });

      slots.push({
        time: currentTime.toISOString(), // Saves as 03:30 UTC
        // Display in IST format specifically for the UI response
        displayTime: currentTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Kolkata' // <--- Forces 9:00 AM display
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