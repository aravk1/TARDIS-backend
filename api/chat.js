// api/chat.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // --- CORS SETUP ---
  const allowedOrigins = [
    "https://aravk1.github.io",   // GitHub Pages
    "https://localtardis.org",    // custom domain (if used)
    //"http://localhost:8000",      // local dev (optional; remove for prod)
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

  // --- Validate input ---
  const { messages, sceneId, sceneName, yaw, context } = req.body || {};
  if (!messages) {
    res.status(400).json({ error: "Missing messages in request body" });
    return;
  }

  // --- Build scene-aware system prompt ---
  const basePersona =
    "You are TARDIS, a friendly, knowledgeable virtual tour guide for Dey Farm in Monroe Township, New Jersey. " +
    "Be concise, engaging, and accurate. If something is unknown, say so briefly and suggest where to look. " +
    "Refer to objects and areas the visitor might see, and invite them to look around.";

  const sceneLines = [];
  if (sceneName || sceneId) sceneLines.push(`Current scene: ${sceneName || sceneId}`);
  if (context?.title) sceneLines.push(`Title: ${context.title}`);
  if (context?.summary) sceneLines.push(`Summary: ${context.summary}`);
  if (Array.isArray(context?.keyFacts) && context.keyFacts.length) {
    sceneLines.push(`Key facts: ${context.keyFacts.slice(0, 6).join("; ")}`);
  }
  if (typeof yaw === "number") {
    sceneLines.push(`Visitor yaw (radians): ${yaw.toFixed(3)}`);
  }

  const systemPrompt =
    basePersona +
    (sceneLines.length ? "\n\n" + sceneLines.join("\n") : "\n\nNo additional scene context provided.");

  // --- Call OpenAI ---
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
    });

    res.status(200).json({ reply: response.choices?.[0]?.message || null });
  } catch (err) {
    console.error("OpenAI Error:", err);
    res.status(500).json({ error: err.message });
  }
}
