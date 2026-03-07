import { generateEmbedding } from "../../src/lib/embedding";
import { preprocessContent } from "../../src/lib/korean-utils";
import { createSupabaseClient } from "../../src/lib/supabase";

// ─── 타입 ───────────────────────────────────────────────

export interface EmbeddingInput {
  slug: string;
  title: string;
  summary: string;
  content: string;
}

// ─── 공통 유틸 ──────────────────────────────────────────

/**
 * 임베딩용 텍스트를 조합합니다.
 * title, summary, content를 줄바꿈 2개로 연결합니다.
 */
export const buildEmbeddingText = (input: EmbeddingInput): string => {
  return [input.title, input.summary, input.content].join("\n\n");
};

/**
 * 단일 포스트의 임베딩을 생성하고 Supabase에 upsert합니다.
 * rate limit 재시도 로직은 호출 측에서 처리합니다.
 */
export const upsertEmbedding = async (input: EmbeddingInput): Promise<void> => {
  const supabase = createSupabaseClient();
  const text = buildEmbeddingText(input);
  const embedding = await generateEmbedding(text);

  // FTS용 전처리 텍스트 생성 (한국어 조사 제거)
  const processedText = preprocessContent(text);

  const { error } = await supabase.from("post_embeddings").upsert(
    {
      slug: input.slug,
      title: input.title,
      content: text,
      embedding: JSON.stringify(embedding),
      content_preprocessed: processedText,
    },
    { onConflict: "slug" }
  );

  if (error) {
    throw new Error(`Supabase upsert 실패: ${error.message}`);
  }
};
