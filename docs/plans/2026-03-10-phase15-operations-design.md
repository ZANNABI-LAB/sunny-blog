# Phase 15: 운영 + 수익화 설계

## 개요
DEEP THOUGHT 블로그의 운영 인프라 구축 및 수익화 기반 마련.
SEO, 댓글, 광고, 커스텀 도메인, favicon을 한 페이즈에서 처리한다.

## 1. SEO 최적화

### sitemap.xml
- `src/app/sitemap.ts` — Next.js App Router 규약 파일
- 동적 생성: 정적 페이지(/, /tech, /profile, /portfolio, /log) + 포스트 + 로그
- `lastModified`는 파일 기반 날짜 사용

### robots.txt
- `src/app/robots.ts` — Next.js 규약 파일
- sitemap 위치 명시, 전체 허용

### 메타데이터 강화
- 루트 `layout.tsx`: OG 기본값 (title, description, siteName, locale, type)
- 포스트 상세 `tech/[slug]/page.tsx`: 동적 `generateMetadata()` — title, description, og:image, article 타입
- 로그 상세도 동일 적용

### OG 이미지 동적 생성
- `src/app/api/og/route.tsx` — `next/og` (Satori) 사용
- 쿼리 파라미터: `?title=...&category=...`
- 디자인: DEEP THOUGHT 브랜드 (dark 배경 #070709, amber 악센트, Space Mono 폰트)
- 레이아웃: 타이틀 중앙, 카테고리 뱃지, "DEEP THOUGHT" 워드마크

### JSON-LD 구조화 데이터
- 포스트 상세에 Article schema 삽입
- author, datePublished, description, headline 포함

## 2. 댓글 + 좋아요 (Giscus)

### 구성
- GitHub Discussions 기반 Giscus 위젯
- 리포지토리: ZANNABI-LAB/sunny-blog
- 매핑: pathname 기반
- 리액션(좋아요/👍 등) 기본 내장

### 컴포넌트
- `src/components/giscus-comments.tsx` — Client Component
- Tech 포스트 상세 페이지 하단에 배치 (`tech/[slug]/page.tsx`)
- next-themes 연동: dark/light 테마 자동 동기화

### 사전 작업
- GitHub 리포지토리 Settings → Discussions 활성화
- Giscus 앱 설치 (giscus.app에서 설정)

## 3. AdSense (사이드바)

### 배치
- Tech 목록 페이지 (`/tech`) — 사이드바 광고
- Tech 상세 페이지 (`/tech/[slug]`) — 사이드바 광고
- 메인 페이지 제외
- 모바일: 사이드바 없으므로 콘텐츠 하단 폴백 또는 숨김

### 레이아웃 변경
- Tech 목록/상세에 2컬럼 레이아웃 도입 (콘텐츠 + 사이드바)
- 사이드바는 `lg:` 이상에서만 표시

### 컴포넌트
- `src/components/ad-unit.tsx` — 광고 슬롯 컴포넌트
- AdSense 스크립트: `layout.tsx`에 `<Script>` 태그 (환경변수로 ID 관리)

### 사전 작업
- Google AdSense 계정 신청 + 사이트 승인 (시간 소요)
- 승인 전에는 placeholder로 구현

## 4. 커스텀 도메인

### 설정
- `deep-thought.dev` — Vercel에서 구매
- Vercel 프로젝트 Settings → Domains에서 추가 (자동 DNS/SSL)
- sitemap, OG 이미지 URL에 도메인 반영

### 코드 변경
- `next.config.ts`에 도메인 관련 설정 (필요시)
- 메타데이터 baseUrl을 `deep-thought.dev`로 변경

## 5. Favicon

### 디자인
- `>_` 터미널 커서 모양
- SVG 기반, amber 악센트 (#fbbf24)
- dark 배경에 어울리는 심플한 디자인

### 파일
- `src/app/icon.svg` — Next.js App Router 자동 인식
- 또는 `src/app/favicon.ico` + `apple-icon.png` 다중 포맷

## 구현 순서
1. favicon (독립적, 간단)
2. SEO (sitemap, robots, 메타데이터, OG 이미지, JSON-LD)
3. Giscus 댓글
4. AdSense 사이드바
5. 커스텀 도메인 (Vercel 구매 후 설정)
