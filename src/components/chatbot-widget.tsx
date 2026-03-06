"use client";

import { useState, useCallback, useEffect } from "react";
import ChatbotButton from "@/components/chatbot-button";
import ChatPanel from "@/components/chat-panel";
import type { ChatReferencePost, ChatEvent } from "@/types/chat";

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
    "안녕하세요! Sunny Blog의 AI 어시스턴트 R2-D2입니다. 블로그 포스트에 대해 궁금한 점이 있으면 질문해주세요.",
};

const MAX_HISTORY_TURNS = 6;

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_GREETING]);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Cmd+K / Ctrl+K toggle
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
      role: (m.role === "user" ? "user" : "assistant") as
        | "user"
        | "assistant",
      content: m.content,
    }));
    // Keep last N turns
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
          throw new Error(
            errorData?.error || `HTTP ${response.status}`
          );
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
                    m.id === botId
                      ? { ...m, references: event.posts }
                      : m
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

  return (
    <>
      {isOpen && (
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onSend={handleSend}
          onClose={() => setIsOpen(false)}
        />
      )}
      <ChatbotButton isOpen={isOpen} onClick={toggle} />
    </>
  );
};

export default ChatbotWidget;
