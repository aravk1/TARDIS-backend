import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Vercel serverless function handler
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { messages } = req.body;

  if (!messages) {
    res.status(400).json({ error: "Missing messages in request body" });
    return;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages
    });

    res.status(200).json({ reply: response.choices[0].message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
