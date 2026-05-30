/** @param {import('@vercel/node').VercelRequest} req */
/** @param {import('@vercel/node').VercelResponse} res */
export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      return res.status(204).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(503).json({
        error:
          "Campus AI is not configured. Add OPENROUTER_API_KEY in Vercel → Settings → Environment Variables, then redeploy.",
      });
    }

    let payload = req.body;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {
        return res.status(400).json({ error: "Invalid JSON body" });
      }
    }
    payload = payload || {};

    if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
      return res.status(400).json({ error: "Messages are required" });
    }

    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://college-enrollment.vercel.app",
        "X-Title": "College Enrollment System",
      },
      body: JSON.stringify({
        model: payload.model || "openrouter/free",
        messages: payload.messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const text = await upstream.text();
    res.setHeader("Content-Type", "application/json");
    return res.status(upstream.status).send(text);
  } catch {
    return res.status(500).json({ error: "Campus AI server error. Please try again in a moment." });
  }
}
