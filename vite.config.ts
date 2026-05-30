import { defineConfig, loadEnv, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { proxyOpenRouterChat } from "./server/chatProxy";

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

    try {
      const raw = await readBody(req);
      const payload = JSON.parse(raw || "{}") as { messages?: unknown; model?: string };
      const result = await proxyOpenRouterChat(payload, apiKey);

      res.setHeader("Content-Type", "application/json");
      if (!result.ok) {
        res.statusCode = result.status;
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.statusCode = result.status;
      res.end(result.body);
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
