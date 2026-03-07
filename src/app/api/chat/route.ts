import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

import { hybridSearch } from "@/lib/hybrid-search";
import type { ChatReferencePost } from "@/types/chat";

const MAX_MESSAGE_LENGTH = 500;
const MATCH_COUNT = 3;
const CONTENT_TRUNCATE_LENGTH = 3000;
const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1024;
const MAX_HISTORY_TURNS = 6;

const SYSTEM_PROMPT = `당신은 Deep Thought 블로그의 AI 어시스턴트입니다.
블로그에 있는 기술 포스트를 기반으로 질문에 답변합니다.

규칙:
- 한국어로 답변합니다.
- 제공된 블로그 포스트 내용을 기반으로만 답변합니다.
- 블로그에 관련 내용이 없으면 솔직하게 "관련 포스트를 찾지 못했습니다"라고 답변합니다.
- 친절하고 간결하게 답변합니다.
- 마크다운 형식을 사용할 수 있습니다.`;

const truncateContent = (content: string): string => {
  if (content.length <= CONTENT_TRUNCATE_LENGTH) {
    return content;
  }
  return content.slice(0, CONTENT_TRUNCATE_LENGTH) + "...";
};

const sendSSE = (
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  data: string
) => {
  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
};

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

const validateHistory = (
  history: unknown
): HistoryMessage[] => {
  if (!Array.isArray(history)) return [];
  const valid = history
    .filter(
      (item): item is HistoryMessage =>
        typeof item === "object" &&
        item !== null &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim().length > 0
    )
    .slice(-(MAX_HISTORY_TURNS * 2));
  return valid;
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return new Response(
        JSON.stringify({ error: "메시지를 입력해주세요." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({
          error: `메시지는 ${MAX_MESSAGE_LENGTH}자 이하로 입력해주세요.`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({
          error: "ANTHROPIC_API_KEY가 설정되지 않았습니다.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate history
    const history = validateHistory(body.history);

    // Hybrid search (semantic + FTS with RRF)
    let scored: { slug: string; title: string; content: string; score: number }[];
    try {
      scored = await hybridSearch(message, MATCH_COUNT);
    } catch (err) {
      console.error("Hybrid search error:", err);
      return new Response(
        JSON.stringify({ error: "검색 중 오류가 발생했습니다." }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const references: ChatReferencePost[] = scored.map((post) => ({
      slug: post.slug,
      title: post.title,
    }));

    // Build context from matched posts
    const context = scored
      .map(
        (post) =>
          `## ${post.title}\n\n${truncateContent(post.content)}`
      )
      .join("\n\n---\n\n");

    const userMessage = `다음은 블로그 포스트 내용입니다:\n\n${context}\n\n---\n\n사용자 질문: ${message}`;

    // Build messages array with history
    const claudeMessages: { role: "user" | "assistant"; content: string }[] = [
      ...history,
      { role: "user", content: userMessage },
    ];

    // Stream response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const client = new Anthropic({ apiKey: anthropicApiKey });
          const messageStream = client.messages.stream({
            model: CLAUDE_MODEL,
            max_tokens: MAX_TOKENS,
            system: SYSTEM_PROMPT,
            messages: claudeMessages,
          });

          for await (const event of messageStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              sendSSE(
                controller,
                encoder,
                JSON.stringify({ type: "delta", content: event.delta.text })
              );
            }
          }

          // Send references
          sendSSE(
            controller,
            encoder,
            JSON.stringify({ type: "references", posts: references })
          );

          // Done
          sendSSE(controller, encoder, "[DONE]");
        } catch (err) {
          console.error("Streaming error:", err);
          let errorMessage = "응답 생성 중 오류가 발생했습니다.";
          if (err instanceof Anthropic.AuthenticationError) {
            errorMessage = "API 인증에 실패했습니다.";
          } else if (err instanceof Anthropic.RateLimitError) {
            errorMessage = "요청 한도를 초과했습니다.";
          } else if (err instanceof Anthropic.APIConnectionError) {
            errorMessage = "AI 서비스에 연결할 수 없습니다.";
          } else if (
            err instanceof Error &&
            err.message.toLowerCase().includes("credit")
          ) {
            errorMessage = "API 크레딧이 부족합니다.";
          }
          sendSSE(
            controller,
            encoder,
            JSON.stringify({
              type: "error",
              message: errorMessage,
            })
          );
          sendSSE(controller, encoder, "[DONE]");
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(
      JSON.stringify({ error: "채팅 처리 중 오류가 발생했습니다." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
