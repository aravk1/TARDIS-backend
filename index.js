import express from 'express';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

// POST /chat endpoint
app.post('/chat', async (req, res) => {
  const { messages } = req.body; // messages = [{ role: "user", content: "..." }]
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });
    res.json({ reply: response.choices[0].message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Run server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
