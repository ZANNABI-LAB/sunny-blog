import { NextRequest, NextResponse } from "next/server";

import { generateEmbedding } from "@/lib/embedding";
import { createSupabaseClient } from "@/lib/supabase";
import { cosineSimilarity } from "@/lib/similarity";
import type {
  SearchResult,
  SearchResponse,
  SearchErrorResponse,
} from "@/types/search";

const MAX_QUERY_LENGTH = 200;
const MATCH_COUNT = 5;
const SUMMARY_TRUNCATE_LENGTH = 200;

const truncateContent = (content: string): string => {
  if (content.length <= SUMMARY_TRUNCATE_LENGTH) {
    return content;
  }
  return content.slice(0, SUMMARY_TRUNCATE_LENGTH) + "...";
};

export const POST = async (
  request: NextRequest
): Promise<NextResponse<SearchResponse | SearchErrorResponse>> => {
  try {
    const body = await request.json();
    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (!query) {
      return NextResponse.json(
        { error: "검색어를 입력해주세요." },
        { status: 400 }
      );
    }

    if (query.length > MAX_QUERY_LENGTH) {
      return NextResponse.json(
        { error: `검색어는 ${MAX_QUERY_LENGTH}자 이하로 입력해주세요.` },
        { status: 400 }
      );
    }

    const queryEmbedding = await generateEmbedding(query);

    const supabase = createSupabaseClient();
    const { data: posts, error } = await supabase
      .from("post_embeddings")
      .select("slug, title, content, embedding");

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "검색 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    const scored = (posts ?? [])
      .map((post: { slug: string; title: string; content: string; embedding: string }) => {
        const postEmbedding: number[] = JSON.parse(post.embedding);
        return {
          slug: post.slug,
          title: post.title,
          summary: truncateContent(post.content),
          score: cosineSimilarity(queryEmbedding, postEmbedding),
        };
      })
      .sort((a: SearchResult, b: SearchResult) => b.score - a.score)
      .slice(0, MATCH_COUNT);

    return NextResponse.json({ results: scored });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
};
