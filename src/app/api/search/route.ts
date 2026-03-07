import { NextRequest, NextResponse } from "next/server";

import { hybridSearch } from "@/lib/hybrid-search";
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

    const results = await hybridSearch(query, MATCH_COUNT);

    const scored: SearchResult[] = results.map((result) => ({
      slug: result.slug,
      title: result.title,
      summary: truncateContent(result.content),
      score: result.score,
    }));

    return NextResponse.json({ results: scored });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
};
