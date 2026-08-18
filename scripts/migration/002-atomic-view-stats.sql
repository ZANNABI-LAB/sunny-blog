-- 리뉴얼 Phase 3: 뷰 카운트 원자화 + 방문자 통계 집계 RPC
-- 실행 방법: Supabase SQL Editor에서 순서대로 실행
--
-- 배경:
--   1) /api/views POST가 select -> update로 조회수를 올려 동시 요청 시 카운트가 유실됨
--   2) /api/stats GET이 visitors 전체 fingerprint를 클라이언트로 가져와 Set 크기를 계산
--      (행 수 증가에 따라 선형 악화)

-- 0. page_views.slug 유니크 보장 (ON CONFLICT 대상)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'page_views_slug_key'
  ) AND NOT EXISTS (
    -- slug가 이미 PK인 경우도 통과
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'page_views'
      AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
      AND ccu.column_name = 'slug'
  ) THEN
    ALTER TABLE page_views ADD CONSTRAINT page_views_slug_key UNIQUE (slug);
  END IF;
END $$;

-- 1. 원자적 조회수 증가 RPC
CREATE OR REPLACE FUNCTION increment_view(p_slug text)
RETURNS integer
LANGUAGE sql
AS $$
  INSERT INTO page_views (slug, view_count, updated_at)
  VALUES (p_slug, 1, now())
  ON CONFLICT (slug)
  DO UPDATE SET
    view_count = page_views.view_count + 1,
    updated_at = now()
  RETURNING view_count;
$$;

-- 2. 총 유니크 방문자 수 집계 RPC (DB에서 COUNT DISTINCT)
CREATE OR REPLACE FUNCTION count_unique_visitors()
RETURNS bigint
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(DISTINCT fingerprint) FROM visitors;
$$;
