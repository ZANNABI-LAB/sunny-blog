import { NextRequest, NextResponse } from "next/server";

import { generateEmbedding } from "@/lib/embedding";
import { createSupabaseClient } from "@/lib/supabase";
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

    const embedding = await generateEmbedding(query);

    const supabase = createSupabaseClient();
    const { data, error } = await supabase.rpc("match_posts", {
      query_embedding: embedding,
      match_count: MATCH_COUNT,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      return NextResponse.json(
        { error: "검색 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    const results: SearchResult[] = (data ?? []).map(
      (row: { slug: string; title: string; content: string; similarity: number }) => ({
        slug: row.slug,
        title: row.title,
        summary: truncateContent(row.content),
        score: row.similarity,
      })
    );

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
};
