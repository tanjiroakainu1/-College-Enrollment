export type ChatProxyPayload = {
  messages?: unknown;
  model?: string;
};

export type ChatProxyResult =
  | { ok: true; status: number; body: string }
  | { ok: false; status: number; error: string };

export async function proxyOpenRouterChat(payload: ChatProxyPayload, apiKey: string): Promise<ChatProxyResult> {
  if (!apiKey) {
    return { ok: false, status: 503, error: "Campus AI is not configured yet. Add OPENROUTER_API_KEY in Vercel Environment Variables." };
  }

  if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
    return { ok: false, status: 400, error: "Messages are required" };
  }

  try {
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

    const body = await upstream.text();
    return { ok: true, status: upstream.status, body };
  } catch {
    return { ok: false, status: 502, error: "Campus AI is temporarily unavailable." };
  }
}
