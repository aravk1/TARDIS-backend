import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // --- CORS SETUP ---
  const allowedOrigins = [
    "https://aravk1.github.io", // your GitHub Pages domain
    // "https://your-custom-domain.com", // add later if needed
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // --- Handle preflight (OPTIONS) requests ---
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // --- Block non-POST requests ---
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // --- Validate input ---
  const { messages } = req.body;
  if (!messages) {
    res.status(400).json({ error: "Missing messages in request body" });
    return;
  }

  // --- Call OpenAI ---
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });

    res.status(200).json({ reply: response.choices[0].message });
  } catch (err) {
    console.error("OpenAI Error:", err);
    res.status(500).json({ error: err.message });
  }
}
