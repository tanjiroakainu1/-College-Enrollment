import { defineConfig, loadEnv, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function readBody(req: import("http").IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function aiChatProxy(apiKey: string): Plugin {
  const handler = async (
    req: import("http").IncomingMessage,
    res: import("http").ServerResponse,
    next: () => void,
  ) => {
    if (!req.url?.startsWith("/api/ai/chat")) {
      next();
      return;
    }

    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    if (!apiKey) {
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Campus AI is not configured yet." }));
      return;
    }

    try {
      const raw = await readBody(req);
      const payload = JSON.parse(raw || "{}") as { messages?: unknown; model?: string };

      if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Messages are required" }));
        return;
      }

      const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: payload.model || "openrouter/free",
          messages: payload.messages,
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      const text = await upstream.text();
      res.statusCode = upstream.status;
      res.setHeader("Content-Type", "application/json");
      res.end(text);
    } catch {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Campus AI is temporarily unavailable." }));
    }
  };

  return {
    name: "campus-ai-proxy",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss(), aiChatProxy(env.OPENROUTER_API_KEY || "")],
  };
});
