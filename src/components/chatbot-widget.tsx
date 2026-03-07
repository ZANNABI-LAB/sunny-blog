"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import ChatbotButton from "@/components/chatbot-button";
import ChatPanel from "@/components/chat-panel";
import type { ChatReferencePost, ChatEvent } from "@/types/chat";

const KbdShortcut = () => {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);
  return (
    <kbd className="hidden md:inline text-[10px] text-zinc-600 border border-zinc-700 rounded px-1 py-0.5 select-none">
      {isMac ? "⌘" : "Ctrl+"}K
    </kbd>
  );
};

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  references?: ChatReferencePost[];
  isStreaming?: boolean;
  isError?: boolean;
};

const INITIAL_GREETING: Message = {
  id: "greeting",
  role: "bot",
  content:
    "750만 년간의 연산 끝에 도착했습니다. Deep Thought입니다. 블로그 포스트에 대해 궁금한 점이 있으면 질문해주세요.",
};

const MAX_HISTORY_TURNS = 6;

const ChatbotWidget = () => {
  const pathname = usePathname();
  const isMainPage = pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_GREETING]);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerInput, setTriggerInput] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const triggerInputRef = useRef<HTMLInputElement>(null);
  const pendingSendRef = useRef<string | null>(null);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleClose = useCallback(() => {
    if (prefersReducedMotionRef.current) {
      setIsOpen(false);
      setIsClosing(false);
      if (isMainPage) {
        triggerInputRef.current?.focus();
      } else {
        buttonRef.current?.focus();
      }
      return;
    }
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      if (isMainPage) {
        triggerInputRef.current?.focus();
      } else {
        buttonRef.current?.focus();
      }
    }, 300);
  }, [isMainPage]);

  const toggle = useCallback(() => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  }, [isOpen, handleClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  const buildHistory = (
    msgs: Message[]
  ): { role: "user" | "assistant"; content: string }[] => {
    const historyMessages = msgs.filter(
      (m) => m.id !== "greeting" && !m.isError
    );
    const turns = historyMessages.map((m) => ({
      role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
      content: m.content,
    }));
    return turns.slice(-MAX_HISTORY_TURNS * 2);
  };

  const handleSend = useCallback(
    async (text: string) => {
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      const botId = `bot-${Date.now()}`;
      const botMsg: Message = {
        id: botId,
        role: "bot",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, botMsg]);

      try {
        const history = buildHistory([...messages, userMsg]);

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: history.length > 0 ? history : undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || `HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const data = trimmed.slice(6);

            if (data === "[DONE]") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botId ? { ...m, isStreaming: false } : m
                )
              );
              continue;
            }

            try {
              const event: ChatEvent = JSON.parse(data);
              if (event.type === "delta") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botId
                      ? { ...m, content: m.content + event.content }
                      : m
                  )
                );
              } else if (event.type === "references") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botId ? { ...m, references: event.posts } : m
                  )
                );
              } else if (event.type === "error") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botId
                      ? {
                          ...m,
                          content: event.message,
                          isStreaming: false,
                          isError: true,
                        }
                      : m
                  )
                );
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? {
                  ...m,
                  content: `오류: ${errorMessage}`,
                  isStreaming: false,
                  isError: true,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  // Send pending message after panel opens
  useEffect(() => {
    if (isOpen && pendingSendRef.current) {
      const text = pendingSendRef.current;
      pendingSendRef.current = null;
      handleSend(text);
    }
  }, [isOpen, handleSend]);

  const handleTriggerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = triggerInput.trim();
    if (trimmed) {
      pendingSendRef.current = trimmed;
      setTriggerInput("");
    }
    setIsOpen(true);
  };

  return (
    <>
      {(isOpen || isClosing) && (
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onSend={handleSend}
          onClose={handleClose}
          isClosing={isClosing}
        />
      )}
      {!isOpen && !isClosing && (
        isMainPage ? (
          <form
            onSubmit={handleTriggerSubmit}
            className="fixed bottom-24 right-6 md:right-12 z-[60]"
            style={{ marginBottom: "var(--safe-bottom)" }}
          >
            <div className="flex items-center gap-2 bg-[#070709]/80 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 transition-colors hover:border-white/20">
              <span className="font-display text-amber-400 text-xs select-none">&gt;</span>
              <input
                ref={triggerInputRef}
                type="text"
                value={triggerInput}
                onChange={(e) => setTriggerInput(e.target.value)}
                placeholder="Ask..."
                aria-label="Deep Thought에게 질문하기"
                className="font-display w-[calc(100vw-10rem)] max-w-[12rem] md:w-64 md:max-w-[16rem] bg-transparent text-sm text-white placeholder:text-zinc-600 tracking-wider outline-none"
              />
              <KbdShortcut />
            </div>
          </form>
        ) : (
          <ChatbotButton isOpen={isOpen} onClick={toggle} ref={buttonRef} />
        )
      )}
    </>
  );
};

export default ChatbotWidget;
