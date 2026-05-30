import { buildSystemPrompt, ChatMessage, ChatRole } from "./chatContext";

type ApiMessage = { role: "system" | "user" | "assistant"; content: string };

const ENDPOINT = "/api/ai/chat";

function toApiMessages(role: ChatRole, history: ChatMessage[]): ApiMessage[] {
  return [
    { role: "system", content: buildSystemPrompt(role) },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];
}

function extractReply(data: unknown): string {
  if (!data || typeof data !== "object") {
    throw new Error("Unexpected AI response");
  }

  const payload = data as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (payload.error?.message) {
    throw new Error(payload.error.message);
  }

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Campus AI returned an empty reply. Please try again.");
  }

  return content;
}

export async function sendChatMessage(role: ChatRole, history: ChatMessage[], userMessage: string): Promise<string> {
  const messages: ApiMessage[] = toApiMessages(role, [...history, { id: "pending", role: "user", content: userMessage }]);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    if (res.status === 404) {
      throw new Error("Campus AI endpoint not found. Redeploy the latest code and add OPENROUTER_API_KEY in Vercel Environment Variables.");
    }
    throw new Error("Campus AI could not read the server response.");
  }

  if (!res.ok) {
    const err = data as { error?: string };
    throw new Error(err.error || "Campus AI is temporarily unavailable.");
  }

  return extractReply(data);
}
