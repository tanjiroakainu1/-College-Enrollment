import type { VercelRequest, VercelResponse } from "@vercel/node";
import { proxyOpenRouterChat } from "../../server/chatProxy";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY || "";
  const result = await proxyOpenRouterChat((req.body ?? {}) as { messages?: unknown; model?: string }, apiKey);

  if (!result.ok) {
    return res.status(result.status).json({ error: result.error });
  }

  res.setHeader("Content-Type", "application/json");
  return res.status(result.status).send(result.body);
}
