// api/voice.js
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  const allowedOrigins = [
    "https://aravk1.github.io",
    "https://localtardis.org",
    "http://localhost:8000",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: "Missing text input" });

    const region = process.env.AZURE_SPEECH_REGION;  // e.g. "eastus"
    const key    = process.env.AZURE_SPEECH_KEY;
    const voice  = process.env.AZURE_VOICE || "en-US-AriaNeural";

    const ssml = `
      <speak version="1.0" xml:lang="en-US">
        <voice name="${voice}">${text}</voice>
      </speak>
    `.trim();

    const r = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3"
      },
      body: ssml
    });

    if (!r.ok) {
      const msg = await r.text();
      return res.status(r.status).send(msg);
    }

    const buffer = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.length);
    return res.status(200).send(buffer);

  } catch (err) {
    console.error("Azure TTS Error:", err);
    return res.status(500).json({ error: "Azure TTS failed" });
  }
}
