import Anthropic from "@anthropic-ai/sdk";
import matter from "gray-matter";

import type { MaeilMailQuestion } from "./maeil-mail-parser";

export interface GeneratedPost {
  slug: string;
  filename: string;
  frontmatter: {
    title: string;
    shortTitle: string;
    date: string;
    tags: string[];
    category: string;
    summary: string;
    author: string;
    source: string;
    sourceUrl: string;
  };
  content: string;
}

const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 4096;
const MAX_RETRIES = 2;

const CATEGORY_MAP: Record<string, string> = {
  "백엔드": "Backend",
  "프론트엔드": "Frontend",
  "인프라": "Infra",
  CS: "CS",
};

const mapCategory = (korean: string): string => {
  return CATEGORY_MAP[korean] ?? korean;
};

const SYSTEM_PROMPT = `당신은 기술 블로그 포스트 작성 전문가입니다.
매일메일(maeil-mail.kr)의 기술 질문과 답변을 참고하여, 블로그 포스트를 작성합니다.

## 포스트 스타일 가이드

### 구조 (반드시 이 순서를 따르세요)
1. \`## {주제}란?\` — 핵심 개념을 간결하게 소개 (2~3문단)
2. \`## 핵심 개념\` — 2~4개의 하위 섹션 (\`### 1. 소제목\` 형식)으로 상세 설명
3. \`## 정리\` — 핵심 요약 (표 또는 불릿 포인트)

### 톤 & 스타일
- 기술 설명체 사용 (~입니다, ~합니다)
- 간결하고 실용적으로 작성
- 불필요한 수식어나 감탄사 제거
- 코드 예시 필수 (TypeScript 우선, 주제에 따라 다른 언어 가능)
- 100~170줄 분량 (frontmatter 제외)

### frontmatter 형식 (YAML)
\`\`\`yaml
---
title: "제목"
shortTitle: "짧은 제목 (그래프 노드용, 2~3단어)"
date: "YYYY-MM-DD"
tags: ["tag1", "tag2", "tag3"]
category: "Backend"
summary: "한 줄 요약 (~합니다 체)"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/{id}"
---
\`\`\`

### slug 규칙
- kebab-case 영문 (예: db-replication, nextjs-app-router)
- 주제를 명확히 나타내는 2~4단어

## 출력 형식
반드시 다음 JSON 형식으로 출력하세요. JSON 외 다른 텍스트를 포함하지 마세요.
\`\`\`json
{
  "slug": "example-slug",
  "content": "---\\ntitle: \\"제목\\"\\n...\\n---\\n\\n## 주제란?\\n\\n본문..."
}
\`\`\`

content 필드에는 frontmatter를 포함한 전체 마크다운 파일 내용을 넣으세요.`;

const buildUserPrompt = (
  question: MaeilMailQuestion,
  existingSlugs: string[]
): string => {
  const slugWarning =
    existingSlugs.length > 0
      ? `\n\n기존 slug 목록 (중복 금지): ${existingSlugs.join(", ")}`
      : "";

  return `다음 매일메일 질문과 답변을 참고하여 블로그 포스트를 작성해주세요.

## 매일메일 질문
- ID: ${question.id}
- 카테고리: ${question.category}
- 질문: ${question.question}
- 원본 URL: ${question.sourceUrl}

## 매일메일 답변
${question.answer}

## 지시사항
- 매일메일 답변을 참고하되, 단순 복사가 아닌 재구성 및 확장을 해주세요.
- category는 "${mapCategory(question.category)}"로 설정하세요.
- date는 "${new Date().toISOString().split("T")[0]}"로 설정하세요.
- sourceUrl은 "${question.sourceUrl}"로 설정하세요.
- author는 "신중선"으로 설정하세요.
- source는 "maeil-mail"로 설정하세요.${slugWarning}`;
};

/**
 * Claude API 응답에서 JSON을 파싱한다.
 */
const parseClaudeResponse = (
  text: string
): { slug: string; content: string } | null => {
  // JSON 코드 블록에서 추출 시도
  const jsonBlockMatch = text.match(/```json\s*\n?([\s\S]*?)\n?```/);
  const jsonStr = jsonBlockMatch ? jsonBlockMatch[1] : text;

  try {
    const parsed = JSON.parse(jsonStr.trim());
    if (
      typeof parsed.slug === "string" &&
      typeof parsed.content === "string"
    ) {
      return { slug: parsed.slug, content: parsed.content };
    }
  } catch {
    // JSON 파싱 실패 — raw text에서 직접 추출 시도
    const slugMatch = text.match(/"slug"\s*:\s*"([^"]+)"/);
    const contentMatch = text.match(/"content"\s*:\s*"([\s\S]+)"\s*\}$/);
    if (slugMatch && contentMatch) {
      try {
        const content = JSON.parse(`"${contentMatch[1]}"`);
        return { slug: slugMatch[1], content };
      } catch {
        // 최종 실패
      }
    }
  }

  return null;
};

/**
 * frontmatter를 검증한다.
 */
const validateFrontmatter = (
  content: string
): GeneratedPost["frontmatter"] | null => {
  try {
    const { data } = matter(content);

    const required = [
      "title",
      "shortTitle",
      "date",
      "tags",
      "category",
      "summary",
      "author",
      "source",
      "sourceUrl",
    ];

    for (const field of required) {
      if (!(field in data) || data[field] === undefined || data[field] === "") {
        console.warn(`[생성기] frontmatter 누락 필드: ${field}`);
        return null;
      }
    }

    if (!Array.isArray(data.tags) || data.tags.length === 0) {
      console.warn("[생성기] tags가 비어있거나 배열이 아닙니다.");
      return null;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date as string)) {
      console.warn(`[생성기] date 형식 오류: ${data.date}`);
      return null;
    }

    return {
      title: data.title as string,
      shortTitle: data.shortTitle as string,
      date: data.date as string,
      tags: data.tags as string[],
      category: data.category as string,
      summary: data.summary as string,
      author: data.author as string,
      source: data.source as string,
      sourceUrl: data.sourceUrl as string,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[생성기] frontmatter 파싱 실패: ${message}`);
    return null;
  }
};

/**
 * 매일메일 질문을 기반으로 블로그 포스트를 생성한다.
 */
export const generatePost = async (
  question: MaeilMailQuestion,
  options?: { existingSlugs?: string[] }
): Promise<GeneratedPost> => {
  const existingSlugs = options?.existingSlugs ?? [];
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  if (!anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  const client = new Anthropic({ apiKey: anthropicApiKey });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      console.log(`[생성기] 재시도 ${attempt}/${MAX_RETRIES}...`);
    }

    try {
      const message = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: buildUserPrompt(question, existingSlugs),
          },
        ],
      });

      const textBlock = message.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("Claude 응답에 텍스트 블록이 없습니다.");
      }

      const parsed = parseClaudeResponse(textBlock.text);
      if (!parsed) {
        throw new Error("Claude 응답을 JSON으로 파싱할 수 없습니다.");
      }

      // frontmatter 검증
      const frontmatter = validateFrontmatter(parsed.content);
      if (!frontmatter) {
        throw new Error("frontmatter 검증 실패");
      }

      // slug 중복 처리
      let slug = parsed.slug;
      if (existingSlugs.includes(slug)) {
        slug = `${slug}-2`;
        console.warn(
          `[생성기] slug 중복 발견, 변경: ${parsed.slug} → ${slug}`
        );
      }

      const filename = `${slug}.md`;

      // content에서 slug가 변경된 경우 반영하지 않아도 됨 (파일명만 변경)
      return {
        slug,
        filename,
        frontmatter,
        content: parsed.content,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(
        `[생성기] 시도 ${attempt + 1} 실패: ${lastError.message}`
      );
    }
  }

  throw new Error(
    `포스트 생성 실패 (${MAX_RETRIES + 1}회 시도): ${lastError?.message}`
  );
};
