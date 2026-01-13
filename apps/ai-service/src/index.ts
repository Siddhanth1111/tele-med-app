import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import axios from 'axios'; // We will use axios directly
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = 3004;

app.use(cors());
app.use(express.json());

// API: Get Chat History
app.get('/history/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    let session = await prisma.chatSession.findFirst({
      where: { patientId: Number(patientId) },
      include: { messages: { orderBy: { timestamp: 'asc' } } }
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: { patientId: Number(patientId) },
        include: { messages: true }
      });
    }
    res.json(session);
  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// API: Send Message (The Fix)
app.post('/chat', async (req, res) => {
  try {
    const { patientId, text } = req.body;
    if (!text) return res.status(400).json({ error: "Message text is required" });

    // 1. Get Session
    let session = await prisma.chatSession.findFirst({
      where: { patientId: Number(patientId) }
    });
    if (!session) {
      session = await prisma.chatSession.create({ data: { patientId: Number(patientId) } });
    }

    // 2. Save USER Message
    await prisma.message.create({
      data: { chatId: session.id, sender: 'user', text: text }
    });

    // 3. Call Gemini API via HTTP (No Library)
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const aiRes = await axios.post(url, {
      contents: [{
        parts: [{ text: `You are a helpful medical assistant. The patient says: "${text}". Provide brief guidance.` }]
      }]
    });

    // Extract the text safely
    const aiText = aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't understand that.";

    // 4. Save AI Message
    const aiMessage = await prisma.message.create({
      data: { chatId: session.id, sender: 'ai', text: aiText }
    });

    res.json(aiMessage);

  } catch (error: any) {
    console.error("Chat Error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI Service failed" });
  }
});

app.listen(PORT, () => {
  console.log(`AI Service running on port ${PORT}`);
});