import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import amqp from 'amqplib'; // Need to install: npm install amqplib

dotenv.config();

const app = express();
const PORT = 3005;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: '2023-10-16', 
});

app.use(cors());
app.use(express.json());

// --- BACKGROUND WORKER: HANDLE REFUNDS (The Consumer) ---
async function startRefundWorker() {
  try {
    const rabbitUrl = "amqp://admin:password123@rabbitmq:5672";
    const connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();

    // Ensure the Dead Letter Queue exists
    const queueName = 'appointments_dlq';
    await channel.assertQueue(queueName, { durable: true });

    console.log(`🐰 Payment Service listening on ${queueName} for failures...`);

    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        console.warn(`⚠️ REFUND TRIGGERED for Patient: ${content.patientId}`);

        try {
          if (content.paymentIntentId) {
            // 💰 EXECUTE REFUND VIA STRIPE
            const refund = await stripe.refunds.create({
              payment_intent: content.paymentIntentId,
              reason: 'requested_by_customer', // marks as system generated refund
            });
            console.log(`✅ Refund Successful: ${refund.id} ($${refund.amount / 100})`);
          } else {
            console.log("ℹ️ No Payment ID found. Skipping refund.");
          }

          // Acknowledge the DLQ message so it doesn't get processed again
          channel.ack(msg);

        } catch (error: any) {
          console.error("❌ Refund Failed (Manual Intervention Needed):", error.message);
          // Still ACK to prevent infinite loop, but log critical error
          channel.ack(msg); 
        }
      }
    });

  } catch (error) {
    console.error("❌ Refund Worker Connection Failed:", error);
  }
}

// --- STANDARD API ROUTES ---

app.get('/health', (req, res) => {
  res.json({ service: 'Payment Service', status: 'Active' });
});

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;
    if (!amount) return res.status(400).json({ error: "Amount is required" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: currency || 'usd',
      automatic_payment_methods: { enabled: true },
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// START SERVER AND WORKER
app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
  // Start the background RabbitMQ listener
  startRefundWorker(); 
});