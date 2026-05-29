import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import {
  CHATBOT_NAME,
  CHATBOT_TAGLINE,
  ChatMessage,
  ChatRole,
  QUICK_QUESTIONS,
  WELCOME_MESSAGES,
} from "../core/chatContext";
import { sendChatMessage } from "../core/chatService";
import { useAppStore } from "../core/store";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function resolveRole(pathname: string, userRole?: "admin" | "student"): ChatRole {
  if (pathname.startsWith("/admin") || userRole === "admin") return "admin";
  if (pathname.startsWith("/student") || userRole === "student") return "student";
  return "guest";
}

export function FloatingChatbot() {
  const { currentUser } = useAppStore();
  const { pathname } = useLocation();
  const role = resolveRole(pathname, currentUser?.role);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [initializedRole, setInitializedRole] = useState<ChatRole | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickQuestions = useMemo(() => QUICK_QUESTIONS[role], [role]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (initializedRole !== role) {
      setMessages([{ id: uid(), role: "assistant", content: WELCOME_MESSAGES[role] }]);
      setInitializedRole(role);
      setError("");
    }
  }, [role, initializedRole]);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages, loading]);

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError("");
    setInput("");
    const userMsg: ChatMessage = { id: uid(), role: "user", content: trimmed };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setLoading(true);

    try {
      const reply = await sendChatMessage(role, messages, trimmed);
      setMessages((prev) => [...prev, { id: uid(), role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  const clearChat = () => {
    setMessages([{ id: uid(), role: "assistant", content: WELCOME_MESSAGES[role] }]);
    setError("");
  };

  if (!mounted) return null;

  return createPortal(
    <div className="campus-ai-root" aria-live="polite">
      {open && (
        <section className="campus-ai-panel" role="dialog" aria-label={`${CHATBOT_NAME} chat`}>
          <header className="campus-ai-header">
            <div className="campus-ai-header-main">
              <div className="campus-ai-avatar" aria-hidden>
                🍬
              </div>
              <div>
                <p className="campus-ai-title">{CHATBOT_NAME}</p>
                <p className="campus-ai-sub">{CHATBOT_TAGLINE}</p>
              </div>
            </div>
            <div className="campus-ai-header-actions">
              <button type="button" className="campus-ai-icon-btn" onClick={clearChat} title="Clear chat">
                ↺
              </button>
              <button type="button" className="campus-ai-icon-btn" onClick={() => setOpen(false)} title="Close">
                ✕
              </button>
            </div>
          </header>

          <div className="campus-ai-role-pill">
            <span className="campus-ai-role-dot" />
            {role === "guest" ? "Guest mode" : role === "admin" ? "Admin assistant" : "Student assistant"}
          </div>

          <div className="campus-ai-quick">
            <p className="campus-ai-quick-label">Quick questions</p>
            <div className="campus-ai-quick-grid">
              {quickQuestions.map((q) => (
                <button key={q} type="button" className="campus-ai-chip" onClick={() => void ask(q)} disabled={loading}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div ref={scrollRef} className="campus-ai-messages">
            {messages.map((m) => (
              <div key={m.id} className={`campus-ai-msg campus-ai-msg-${m.role}`}>
                {m.role === "assistant" && <span className="campus-ai-msg-avatar">🤖</span>}
                <div className="campus-ai-bubble">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="campus-ai-msg campus-ai-msg-assistant">
                <span className="campus-ai-msg-avatar">🤖</span>
                <div className="campus-ai-bubble campus-ai-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>

          {error && <p className="campus-ai-error">{error}</p>}

          <form className="campus-ai-form" onSubmit={submit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about enrollment or anything..."
              className="campus-ai-input"
              disabled={loading}
            />
            <button type="submit" className="campus-ai-send" disabled={loading || !input.trim()}>
              ➤
            </button>
          </form>

          <p className="campus-ai-foot">Powered by Campus AI · Developed by Raminder Jangao</p>
        </section>
      )}

      <button
        type="button"
        className={`campus-ai-fab ${open ? "campus-ai-fab-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close Campus AI" : "Open Campus AI"}
      >
        <span className="campus-ai-fab-icon">{open ? "✕" : "🍬"}</span>
        {!open && <span className="campus-ai-fab-pulse" aria-hidden />}
        {!open && <span className="campus-ai-fab-label">Ask Campus AI</span>}
      </button>
    </div>,
    document.body,
  );
}
