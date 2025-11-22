// api/chat.js

const Groq = require("groq-sdk").default; // NOTE: .default is important!

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    // Read and parse JSON body
    let body = "";
    await new Promise((resolve, reject) => {
      req.on("data", (chunk) => (body += chunk));
      req.on("end", resolve);
      req.on("error", reject);
    });

    let parsed;
    try {
      parsed = JSON.parse(body || "{}");
    } catch (e) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Invalid JSON body" }));
      return;
    }

    const { messages } = parsed;

    if (!messages || !Array.isArray(messages)) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ error: "Missing or invalid 'messages' array" })
      );
      return;
    }

    if (!process.env.GROQ_API_KEY) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "GROQ_API_KEY is not set" }));
      return;
    }

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
    console.error("GROQ ERROR:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Groq API error",
        details: err.message || String(err),
      })
    );
  }
};
