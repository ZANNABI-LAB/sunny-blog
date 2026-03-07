/**
 * 하이브리드 검색: 시맨틱(벡터) + 키워드(FTS)를 RRF로 통합
 */

import { generateEmbedding } from "@/lib/embedding";
import { createSupabaseClient } from "@/lib/supabase";
import { preprocessQuery } from "@/lib/korean-utils";

// RRF 상수
const RRF_K = 60;

// 시맨틱 유사도 최소 임계값
const SEMANTIC_THRESHOLD = 0.3;

export type HybridSearchResult = {
  slug: string;
  title: string;
  content: string;
  score: number;
};

type SemanticResult = {
  slug: string;
  title: string;
  content: string;
  similarity: number;
};

type FtsResult = {
  slug: string;
  title: string;
  content: string;
  rank: number;
};

/**
 * DB 레벨 시맨틱 검색 (pgvector cosine distance via RPC)
 */
const semanticSearch = async (
  queryEmbedding: number[],
  matchCount: number
): Promise<SemanticResult[]> => {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase.rpc("match_posts", {
    query_embedding: JSON.stringify(queryEmbedding),
    match_count: matchCount,
  });

  if (error) {
    console.error("Semantic search RPC error:", error);
    throw new Error(`시맨틱 검색 실패: ${error.message}`);
  }

  return (data ?? []) as SemanticResult[];
};

/**
 * DB 레벨 FTS 검색 (PostgreSQL Full-Text Search via RPC)
 */
const ftsSearch = async (
  query: string,
  matchCount: number
): Promise<FtsResult[]> => {
  const supabase = createSupabaseClient();

  // 전처리된 쿼리로 FTS 검색
  const processedQuery = preprocessQuery(query);

  const { data, error } = await supabase.rpc("search_posts_fts", {
    query: processedQuery,
    match_count: matchCount,
  });

  if (error) {
    console.error("FTS search RPC error:", error);
    // FTS 실패 시 빈 배열 반환 (시맨틱만으로 검색 계속)
    return [];
  }

  return (data ?? []) as FtsResult[];
};

/**
 * RRF (Reciprocal Rank Fusion)로 두 검색 결과를 통합합니다.
 *
 * RRF score = sum(1 / (k + rank_i)) for each ranking
 * k=60 (표준값)
 */
const reciprocalRankFusion = (
  semanticResults: SemanticResult[],
  ftsResults: FtsResult[],
  maxResults: number
): HybridSearchResult[] => {
  const scoreMap = new Map<
    string,
    { slug: string; title: string; content: string; rrfScore: number }
  >();

  // 시맨틱 결과: 유사도 임계값 필터링 후 RRF 점수 부여
  semanticResults
    .filter((r) => r.similarity >= SEMANTIC_THRESHOLD)
    .forEach((result, rank) => {
      const rrfScore = 1 / (RRF_K + rank + 1);
      scoreMap.set(result.slug, {
        slug: result.slug,
        title: result.title,
        content: result.content,
        rrfScore,
      });
    });

  // FTS 결과: RRF 점수 합산
  ftsResults.forEach((result, rank) => {
    const rrfScore = 1 / (RRF_K + rank + 1);
    const existing = scoreMap.get(result.slug);
    if (existing) {
      existing.rrfScore += rrfScore;
    } else {
      scoreMap.set(result.slug, {
        slug: result.slug,
        title: result.title,
        content: result.content,
        rrfScore,
      });
    }
  });

  // RRF 점수 기준 정렬 후 상위 N개 반환
  return Array.from(scoreMap.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .slice(0, maxResults)
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      content: item.content,
      score: item.rrfScore,
    }));
};

/**
 * 하이브리드 검색을 실행합니다.
 *
 * 1. 쿼리 임베딩 생성 (Voyage AI)
 * 2. 시맨틱 검색 (pgvector RPC)
 * 3. 키워드 검색 (FTS RPC)
 * 4. RRF로 결과 통합
 */
export const hybridSearch = async (
  query: string,
  matchCount: number = 5
): Promise<HybridSearchResult[]> => {
  // 시맨틱 검색용 임베딩 생성
  const queryEmbedding = await generateEmbedding(query);

  // 시맨틱 + FTS 병렬 실행
  const [semanticResults, ftsResults] = await Promise.all([
    semanticSearch(queryEmbedding, matchCount * 2),
    ftsSearch(query, matchCount * 2),
  ]);

  // RRF 통합
  return reciprocalRankFusion(semanticResults, ftsResults, matchCount);
};
