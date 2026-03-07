"use client";

import { useState, useRef, useEffect } from "react";
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
};

const TypingIndicator = () => (
  <div className="flex items-start gap-2">
    <div className="rounded-2xl rounded-bl-sm border border-white/5 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-1">
        <span
          className="inline-block h-2 w-2 animate-bounce rounded-full bg-indigo-400"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="inline-block h-2 w-2 animate-bounce rounded-full bg-indigo-400"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="inline-block h-2 w-2 animate-bounce rounded-full bg-indigo-400"
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
            className="text-xs text-indigo-400 transition-colors hover:text-indigo-300"
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
          <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-indigo-400" />
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
    <div className="max-w-[85%] rounded-2xl rounded-br-sm border border-indigo-400/20 bg-indigo-500/20 px-4 py-3 text-zinc-200">
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        {message.content}
      </p>
    </div>
  </div>
);

const ChatPanel = ({ messages, isLoading, onSend, onClose }: ChatPanelProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <div
      className="fixed inset-4 z-[60] flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl shadow-black/50 backdrop-blur-sm sm:inset-auto sm:bottom-40 sm:right-6 sm:h-[520px] sm:w-[380px]"
      style={{ animation: "slide-up 0.2s ease-out" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 64 64" fill="none">
            <path d="M16 28C16 17.5 23.2 10 32 10C40.8 10 48 17.5 48 28H16Z" fill="#C0C8D8" />
            <circle cx="32" cy="21" r="5" fill="#1a1a2e" stroke="#6366f1" strokeWidth="2" />
            <circle cx="32" cy="21" r="2.5" fill="#6366f1" opacity="0.8" />
            <rect x="16" y="28" width="32" height="22" rx="3" fill="#E8ECF2" />
            <rect x="24" y="31" width="16" height="16" rx="2" fill="#6366f1" opacity="0.15" />
          </svg>
          <span className="text-sm font-semibold text-white">R2-D2</span>
          <span className="text-xs text-zinc-400">AI Assistant</span>
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
      <div className="chat-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4">
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
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-zinc-500 transition-colors focus:border-indigo-400/50 focus:outline-none focus:ring-1 focus:ring-indigo-400/30 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white transition-colors hover:bg-indigo-400 disabled:opacity-30 disabled:hover:bg-indigo-500"
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
