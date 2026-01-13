import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const PORT = 3005;

// Initialize Stripe with Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: '2023-10-16', // Use latest API version
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ service: 'Payment Service', status: 'Active' });
});

// API: Create Payment Intent
// Frontend calls this BEFORE showing the credit card form
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in CENTS (e.g., $50.00 = 5000)
      currency: currency || 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Send the "client_secret" to the frontend.
    // The frontend uses this key to confirm the payment securely with Stripe.
    res.send({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error: any) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});