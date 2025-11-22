// api/chat.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Missing or invalid 'messages' array" });
      return;
    }

    // Call OpenAI (you can change model to whatever you like)
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini", // or a bigger model if you want
      messages,
    });

    const reply = completion.choices[0].message;

    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Something went wrong", details: err.message });
  }
}
