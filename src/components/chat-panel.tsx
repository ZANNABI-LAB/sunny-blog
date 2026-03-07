"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatReferencePost } from "@/types/chat";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  references?: ChatReferencePost[];
  isStreaming?: boolean;
  isError?: boolean;
};

type ChatPanelProps = {
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
  isClosing?: boolean;
};

const TypingIndicator = () => (
  <div className="flex items-start gap-2">
    <div className="rounded-2xl rounded-bl-sm border border-white/5 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-1">
        <span
          className="inline-block h-2 w-2 animate-bounce rounded-full bg-amber-400"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="inline-block h-2 w-2 animate-bounce rounded-full bg-amber-400"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="inline-block h-2 w-2 animate-bounce rounded-full bg-amber-400"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  </div>
);

const ChatReferences = ({
  references,
}: {
  references: ChatReferencePost[];
}) => {
  if (references.length === 0) return null;
  return (
    <div className="mt-2 border-t border-white/5 pt-2">
      <span className="text-[10px] uppercase tracking-wide text-zinc-400">
        참고 포스트
      </span>
      <div className="mt-1 flex flex-col gap-1">
        {references.map((ref) => (
          <a
            key={ref.slug}
            href={`/tech/${ref.slug}`}
            className="text-xs text-amber-400 transition-colors hover:text-amber-300"
          >
            {ref.title}
          </a>
        ))}
      </div>
    </div>
  );
};

const BotMessage = ({ message }: { message: Message }) => (
  <div className="flex items-start gap-2">
    <div
      className={`max-w-[85%] rounded-2xl rounded-bl-sm border px-4 py-3 ${
        message.isError
          ? "border-red-400/20 bg-red-400/5 text-red-400/80"
          : "border-white/5 bg-white/5 text-zinc-200"
      }`}
    >
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {message.content}
        {message.isStreaming && (
          <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-amber-400" />
        )}
      </p>
      {message.references && message.references.length > 0 && (
        <ChatReferences references={message.references} />
      )}
    </div>
  </div>
);

const UserMessage = ({ message }: { message: Message }) => (
  <div className="flex justify-end">
    <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-amber-400/20 bg-amber-500/15 px-4 py-3 text-zinc-200">
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {message.content}
      </p>
    </div>
  </div>
);

const ChatPanel = ({ messages, isLoading, onSend, onClose, isClosing }: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;

        const focusableSelector =
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const focusable = Array.from(
          panel.querySelectorAll<HTMLElement>(focusableSelector)
        ).filter((el) => !el.hasAttribute("disabled"));

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Deep Thought AI 채팅"
      onKeyDown={handleKeyDown}
      className="fixed inset-4 z-[60] flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl shadow-black/50 backdrop-blur-sm sm:inset-auto sm:bottom-40 sm:right-6 sm:h-[520px] sm:w-[380px]"
      style={
        isClosing
          ? { animation: "slide-down 0.3s ease-in forwards" }
          : { animation: "slide-up 0.2s ease-out" }
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="font-display text-sm font-bold text-amber-400"
            style={{ textShadow: "0 0 8px rgba(245,158,11,0.4)" }}
          >
            42
          </span>
          <span className="font-display text-sm font-semibold text-white tracking-wider">Deep Thought</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="채팅 닫기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        className="chat-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4"
        role="log"
        aria-live="polite"
        aria-label="대화 내용"
      >
        {messages.map((msg) =>
          msg.role === "bot" ? (
            <BotMessage key={msg.id} message={msg} />
          ) : (
            <UserMessage key={msg.id} message={msg} />
          )
        )}
        {isLoading &&
          !messages.some((m) => m.isStreaming) && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-white/10 px-4 py-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="질문을 입력하세요..."
          disabled={isLoading}
          aria-label="메시지 입력"
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-zinc-500 transition-colors focus:border-amber-400/50 focus:outline-none focus:ring-1 focus:ring-amber-400/30 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-white transition-colors hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500"
          aria-label="전송"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
