// /api/voice.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // --- CORS SETUP ---
  const allowedOrigins = [
    "https://aravk1.github.io",  // your GitHub Pages domain
    "https://localtardis.org",   // your custom domain if applicable
    "http://localhost:8000",     // for local testing
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text input" });
    }

    const speechResponse = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts", // realistic voice model
      voice: "alloy",           // "alloy" is expressive; others: "verse", "soft", etc.
      input: text,
      format: "mp3",
    });

    // Convert returned stream to a buffer
    const buffer = Buffer.from(await speechResponse.arrayBuffer());

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.length);
    res.status(200).send(buffer);
  } catch (err) {
    console.error("TTS Error:", err);
    res.status(500).json({ error: err.message });
  }
}
