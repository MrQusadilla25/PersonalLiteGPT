// api/chat.js

const Groq = require("groq-sdk");

// Client using your env var
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    // Parse the body manually (required on Vercel)
    let body = "";
    await new Promise((resolve, reject) => {
      req.on("data", (chunk) => (body += chunk));
      req.on("end", resolve);
      req.on("error", reject);
    });

    const parsed = JSON.parse(body || "{}");

    const { messages } = parsed;

    if (!messages) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "'messages' missing" }));
      return;
    }

    // Call Groq with Llama 3.1 70B (AMAZING model, totally free)
    const completion = await client.chat.completions.create({
      model: "llama3-70b-8192",
      messages,
      temperature: 0.6,
    });

    const reply = completion.choices[0].message;

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ reply }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Groq API error",
        details: err.message,
      })
    );
  }
};
