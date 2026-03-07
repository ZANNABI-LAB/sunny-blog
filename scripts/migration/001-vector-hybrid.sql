-- PRD-27: 하이브리드 검색을 위한 DB 마이그레이션
-- 실행 방법: Supabase SQL Editor에서 순서대로 실행

-- 1. pgvector extension 확인
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. embedding 컬럼: text → vector(1024)
-- 2a. 새 컬럼 추가
ALTER TABLE post_embeddings ADD COLUMN embedding_vec vector(1024);

-- 2b. 기존 데이터 변환 (text → vector)
UPDATE post_embeddings SET embedding_vec = embedding::vector(1024);

-- 2c. 이전 컬럼 삭제 + rename
ALTER TABLE post_embeddings DROP COLUMN embedding;
ALTER TABLE post_embeddings RENAME COLUMN embedding_vec TO embedding;

-- 3. FTS 지원: content_preprocessed 컬럼 (전처리된 텍스트) + content_tsv (tsvector)
ALTER TABLE post_embeddings ADD COLUMN content_preprocessed text;
ALTER TABLE post_embeddings ADD COLUMN content_tsv tsvector;
CREATE INDEX idx_content_tsv ON post_embeddings USING GIN(content_tsv);

-- 4. content_preprocessed 변경 시 content_tsv 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_content_tsv()
RETURNS TRIGGER AS $$
BEGIN
  NEW.content_tsv := to_tsvector('simple', COALESCE(NEW.content_preprocessed, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_content_tsv
  BEFORE INSERT OR UPDATE OF content_preprocessed ON post_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_content_tsv();

-- 5. 기존 데이터의 content_tsv 초기화 (content 기반)
UPDATE post_embeddings SET content_preprocessed = content;

-- 6. 시맨틱 검색 RPC 함수 (pgvector cosine distance)
CREATE OR REPLACE FUNCTION match_posts(
  query_embedding text,
  match_count int DEFAULT 5
) RETURNS TABLE(slug text, title text, content text, similarity float) AS $$
BEGIN
  RETURN QUERY
  SELECT pe.slug, pe.title, pe.content,
    1 - (pe.embedding <=> query_embedding::vector(1024)) as similarity
  FROM post_embeddings pe
  ORDER BY pe.embedding <=> query_embedding::vector(1024)
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- 7. FTS 검색 RPC 함수
CREATE OR REPLACE FUNCTION search_posts_fts(
  query text,
  match_count int DEFAULT 10
) RETURNS TABLE(slug text, title text, content text, rank float) AS $$
BEGIN
  RETURN QUERY
  SELECT pe.slug, pe.title, pe.content,
    ts_rank(pe.content_tsv, plainto_tsquery('simple', query)) as rank
  FROM post_embeddings pe
  WHERE pe.content_tsv @@ plainto_tsquery('simple', query)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
