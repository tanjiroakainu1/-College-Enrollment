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
    error?: { message?: string } | string;
  };

  if (typeof payload.error === "string") {
    throw new Error(payload.error);
  }
  if (payload.error?.message) {
    throw new Error(payload.error.message);
  }

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Campus AI returned an empty reply. Please try again.");
  }

  return content;
}

function parseErrorBody(text: string, status: number): string {
  if (text.includes("FUNCTION_INVOCATION_FAILED")) {
    return "Campus AI server crashed on Vercel. Redeploy the latest code from GitHub.";
  }
  try {
    const json = JSON.parse(text) as { error?: string };
    if (json.error) return json.error;
  } catch {
    /* not json */
  }
  if (status === 404) {
    return "Campus AI endpoint not found. Redeploy and ensure api/ai/chat is deployed.";
  }
  if (status === 503) {
    return "Campus AI is not configured. Add OPENROUTER_API_KEY in Vercel Environment Variables.";
  }
  return "Campus AI is temporarily unavailable.";
}

export async function sendChatMessage(role: ChatRole, history: ChatMessage[], userMessage: string): Promise<string> {
  const messages: ApiMessage[] = toApiMessages(role, [...history, { id: "pending", role: "user", content: userMessage }]);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  const text = await res.text();

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(parseErrorBody(text, res.status));
  }

  if (!res.ok) {
    const err = data as { error?: string };
    throw new Error(err.error || parseErrorBody(text, res.status));
  }

  return extractReply(data);
}
