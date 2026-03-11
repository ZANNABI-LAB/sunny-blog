# sunny-blog 프로젝트 플랜

## 개요
개인 기술 블로그 — "Deep Thought" 우주 컨셉 (은하수의 히치하이커 모티프), Obsidian 스타일 그래프 뷰, RAG 검색 + AI 챗봇

- GitHub: ZANNABI-LAB/sunny-blog
- 배포: https://deep-thought.space (커스텀 도메인)
- 브랜딩: "DEEP THOUGHT" + "The answer to the ultimate question of life, the universe, and code."
- 디자인 톤: Cosmic Brutalist — 극대화 타이포, 비대칭 레이아웃, amber/gold 악센트

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) + TypeScript |
| 스타일링 | Tailwind CSS v4 |
| 폰트 | Space Mono (display) + Pretendard (body, CDN) |
| 콘텐츠 | Markdown (content/posts/, gray-matter + remark/rehype + rehype-highlight) |
| 그래프 | D3.js (force simulation, SVG) |
| 카테고리 | SWEBOK 기반 7분류 (src/lib/categories.ts — SSOT) |
| 임베딩 | Voyage AI (voyage-3, 1024차원) |
| 벡터 DB | Supabase pgvector |
| 챗봇 | @anthropic-ai/sdk (claude-sonnet-4-20250514) |
| 콘텐츠 생성 | Claude API (매일메일 기반 자동 생성) |
| 배포 | Vercel |

## 카테고리 체계 (SWEBOK 기반)
- Architecture, Design Pattern, Security, Testing, Infrastructure, Backend, Frontend
- 도트 표기법으로 하위 카테고리 확장 가능 (예: "Backend.Spring")
- SSOT: `src/lib/categories.ts` — CATEGORY_COLORS, getCategoryColor(), getCategoryRoot()

## 로드맵

### Phase 1: 프로젝트 기초 세팅 ✅
- PRD-3: Next.js 15 스캐폴딩 + 탭 네비게이션 (PR #1)
- PRD-10: Vercel 배포 설정

### Phase 2: 콘텐츠 시스템 ✅
- PRD-4+5: MD 파싱 시스템 + 플랫 콘텐츠 구조 (PR #2)
- PRD-6+7+8: Tech 목록/상세 + 샘플 포스트 (PR #3)
- PRD-9: GFM 테이블 렌더링 수정
- PRD-11: 상세 페이지 개선 — author + References (PR #4)

### Phase 3: 그래프 뷰 + 메인 디자인 ✅
- PRD-12+13: 그래프 데이터 생성 + D3.js 시각화 (PR #5)
- PRD-17: 전체 레이아웃 개선 — Pretendard + 푸터 (PR #6)
- PRD-16: 메인 페이지 디자인 리뉴얼 — 풀스크린 그래프 + 우주 배경 (PR #7)
- PRD-18: 메인 페이지 보완 — 스크롤 제거 + 풋터 오버레이 (PR #8)
- PRD-14+15: 그래프 인터랙션 — 노드 클릭/호버 (PR #9)

### Phase 4: RAG 검색 + AI 챗봇 ✅
- PRD-19: Supabase + Voyage AI 인프라 셋업
- PRD-20: 임베딩 생성 스크립트 (scripts/generate-embeddings.ts)
- PRD-21: 검색 API (/api/search)
- PRD-22: 검색 UI (SearchBar, 디바운스 + 드롭다운) (PR #11)
- PRD-23: 챗봇 API (/api/chat, RAG + Claude SSE 스트리밍) (PR #11)
- PRD-24: R2-D2 챗봇 UI — 플로팅 버튼 + 채팅 패널 (PR #12)
- PRD-25: 챗봇 UX 완성 — multi-turn 대화, 타이핑 애니메이션, Cmd+K (PR #12)
- PRD-28: 챗봇 디자인 개선 — Deep Thought "42" 아이콘 + 풋터 겹침 수정

### Phase 5: 브랜딩 + 폴리시 ✅
- PRD-26: 브랜딩 변경 — Deep Thought + "42" 모티프

### Phase 6: 검색 고도화 — Canceled (챗봇으로 흡수)
- PRD-27: RAG 검색 성능 개선 → 챗봇 UX 개선으로 대체

### Phase 7: 콘텐츠 자동 생성 파이프라인 ✅
- PRD-29: 매일메일 답변 페이지 파서 (scripts/lib/maeil-mail-parser.ts)
- PRD-30: Claude API 포스트 생성기 (scripts/lib/post-generator.ts)
- PRD-31: 메인 스크립트 (scripts/generate-post.ts)
- PRD-32: GitHub Actions cron 워크플로우 (.github/workflows/generate-content.yml)
- PRD-33: 백필 + 품질 검증 — 10개 포스트 수동 생성

### Phase 8: 카테고리 체계 + 품질 개선 ✅
- PRD-35: 카테고리 계층 체계 + 그래프 허브 노드 + 레전드 UI + Tech 필터 (PR #18)
- PRD-36: 그래프 노드 클릭 시 포스트 상세 이동 수정 (main 직접 push)
- PRD-37: 챗봇 답변 생성 실패 수정 — API 키 교체 + 에러 핸들링 (main 직접 push)
- PRD-38: 포스트 품질 개선 — 생성기 프롬프트 + 레퍼런스/태그 검증 (main 직접 push)
- PRD-34: → PRD-35로 병합 (Canceled)

### Phase 9: 디자인 전수 검사 + UX/접근성 개선 ✅
- PRD-41: 접근성 기반 — reduced-motion + focus-visible + skip-nav + ARIA ✅
- PRD-42: 모바일 UX — 터치 타겟 44px + 색상 대비 + 네비 active 상태 ✅
- PRD-43: Tech 페이지 품질 — prose 커스텀 + 카테고리 뱃지 + References 개선 ✅
- PRD-44: 인터랙션 접근성 — 그래프 키보드 + 검색 ARIA combobox + 챗봇 focus trap ✅
- PRD-45: 우주 컨셉 확산 — Tech 페이지 세계관 연속성 + 브랜드 강화 ✅
- PRD-46: 모바일 반응형 일괄 개선 — 그래프 탭/롱프레스, 레전드 스크롤, SafeArea ✅
- PRD-49: 챗봇 트리거 겹침 버그 + 버튼 리디자인 (42 → Deep Thought pill) ✅

### Phase 10: 탭 확장 + 챗봇 UI + 임베딩 ✅
- PRD-50: 5개 탭 구조 (Main|Profile|Portfolio|Tech|Log) + 모바일 햄버거 네비 + 새 페이지 (PR #25)
- PRD-51: 챗봇 UI 개선 — 42→deepthought 프롬프트, SVG→> 텍스트, 푸터 간격, 모바일 간소화 (PR #26)
- PRD-52: 임베딩 재실행 — 전체 완료
- PRD-53: 카테고리 색상 팔레트 재조정 — 블루/시안 4 : amber/warm 3 비율
- PRD-54: 그래프 노드 탭 시 PostPreview 미표시 버그 수정
- PRD-55: 검색/RAG dead code 삭제 + 임베딩 공통 유틸 추출

### Phase 11: 챗봇 UX 개선 ✅
- PRD-56: 질문 카테고리 칩 + 예시 질문 UI (PR #27)
- PRD-57: 챗봇 카테고리 UI 모바일 최적화 (main 직접 push)

### Phase 12: 테마 + 접근성 + 색상 통합 ✅
- PRD-58: light/dark/system 테마 모드 도입 — CSS 변수 토큰, ThemeProvider + ThemeToggle, 22개 파일 마이그레이션 (PR #28)
- PRD-60: 카테고리 색상 amber 7단계 그라데이션 통합 — 블루/시안+amber 혼합 → amber 단색 팔레트
- PRD-61: 탭 순서 변경 (Main|Tech|Profile|Portfolio|Log) + UI 미세 조정
- PRD-59: UI 접근성·반응형 점검 개선

### Phase 13: 모바일 디자인 분리 + 최적화 ✅
- PRD-64: 모바일 기반 정비 — iOS 줌 방지, z-index 분리(z-[35] PostPreview), safe area 통일, --nav-height 변수, 가로모드, 홈 링크 (PR #33)
- PRD-65: 모바일 메인 + 그래프 터치 — collision/charge 모바일 분기, 햅틱, PostPreview 스와이프, CategoryLegend 동적 fade, TitleOverlay 컴팩트, 챗봇 FAB (PR #34)
- PRD-66: 모바일 챗봇 풀스크린 + 코드블록 — ChatPanel inset-0, visualViewport 키보드, 스와이프 닫기, CodeBlockEnhancer 복사 버튼 (PR #35)

### Phase 14: UX 폴리시 ✅
- PRD-67: 포스트 카드/프리뷰 제목 폰트 Space Mono 통일 + 그래프 노드 outline 제거
- PRD-68: 메인 페이지 스크롤 제거 — LayoutShell 도입 (pathname 기반 Footer 조건부) + 챗봇 FAB bottom-6 전 페이지 통일 (PR #36)
- PRD-69: 모바일 CategoryLegend 아코디언 확장 — 선택 카테고리 이름 표시 (max-w-0 → max-w-[100px])

### Phase 15: 운영 + 수익화 ✅
- PRD-70: Favicon `>_` 터미널 커서 SVG (src/app/icon.svg)
- PRD-71: sitemap.xml + robots.txt 동적 생성 (src/app/sitemap.ts, src/app/robots.ts)
- PRD-72: 메타데이터 강화 + JSON-LD (metadataBase, OG, Article schema)
- PRD-73: OG 이미지 동적 생성 API (src/app/api/og/route.tsx, Edge Runtime)
- PRD-74: Giscus 댓글 + 리액션 (src/components/giscus-comments.tsx)
- PRD-75+77: AdSense 사이드바 + 인라인 광고 (src/components/ad-unit.tsx, src/components/sidebar-layout.tsx)
- PRD-76+79: 커스텀 도메인 deep-thought.space (Vercel)
- PRD-78: 메인 스크롤 제거 + 푸터 오버레이 복원

### 유지보수 (진행 중)
- Profile/Portfolio 페이지 실제 콘텐츠 채우기
- 콘텐츠 지속 추가 (매일메일 자동 생성 파이프라인 운영)
- AdSense 계정 승인 후 환경변수 설정

## 프로젝트 구조

```
sunny-blog/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃 + TabNav + Footer + ChatbotWidget
│   │   ├── page.tsx            # Main (풀스크린 그래프 + 검색)
│   │   ├── profile/            # Profile 탭 (자기소개 placeholder)
│   │   ├── portfolio/          # Portfolio 탭 (프로젝트 카드 그리드)
│   │   ├── tech/               # Tech 탭 (포스트 목록/상세)
│   │   ├── log/                # Log 탭 (TIL/회고 목록/상세)
│   │   └── api/
│   │       └── chat/route.ts   # 챗봇 API (SSE 스트리밍, RAG 통합)
│   ├── components/
│   │   ├── layout-shell.tsx    # LayoutShell (pathname 기반 Footer 조건부 렌더링)
│   │   ├── tab-nav.tsx         # 네비게이션 (5탭 데스크톱 + 모바일 햄버거 드로어)
│   │   ├── footer.tsx          # 풋터
│   │   ├── graph-view.tsx      # D3.js 그래프 (허브+포스트 노드)
│   │   ├── main-hero.tsx       # 메인 히어로 (배경 + 그래프 + 오버레이)
│   │   ├── title-overlay.tsx   # 타이틀 + 서브타이틀
│   │   ├── post-preview.tsx    # 노드 탭 프리뷰 (데스크톱 absolute, 모바일 하단 시트)
│   │   ├── post-card.tsx       # Tech 목록 카드
│   │   ├── category-legend.tsx # 메인 페이지 카테고리 레전드
│   │   ├── category-filter.tsx # Tech 페이지 카테고리 필터 탭
│   │   ├── chatbot-widget.tsx  # 챗봇 상태 관리 + SSE
│   │   ├── chatbot-button.tsx  # > Deep Thought pill 버튼
│   │   ├── chat-panel.tsx      # 채팅 패널 (deepthought>, 모바일 풀스크린, 스와이프 닫기)
│   │   └── code-block-enhancer.tsx # 코드블록 복사 버튼 DOM 주입 (Client Component)
│   ├── lib/
│   │   ├── posts.ts            # 포스트 MD 파싱 유틸
│   │   ├── logs.ts             # 로그 MD 파싱 유틸
│   │   ├── graph.ts            # 그래프 데이터 생성 (허브 노드 포함)
│   │   ├── categories.ts       # 카테고리 SSOT (색상, 분류, 유틸)
│   │   ├── supabase.ts         # Supabase 클라이언트
│   │   ├── embedding.ts        # Voyage AI 임베딩
│   │   └── similarity.ts       # 코사인 유사도
│   └── types/
│       ├── post.ts             # Post 타입
│       ├── graph.ts            # GraphNode (type: post|category), GraphEdge
│       ├── chat.ts             # ChatRequest, ChatEvent
│       └── log.ts              # LogMeta, Log
├── content/
│   ├── posts/                  # 포스트 (플랫 구조, category는 frontmatter)
│   └── logs/                   # TIL/회고 로그
├── scripts/
│   ├── generate-embeddings.ts  # 임베딩 생성 스크립트
│   ├── generate-post.ts        # 콘텐츠 자동 생성 메인 스크립트
│   └── lib/
│       ├── maeil-mail-parser.ts # 매일메일 답변 페이지 파서
│       ├── post-generator.ts    # Claude API 포스트 생성기
│       └── embedding-utils.ts   # 임베딩 생성 + Supabase upsert 공통 유틸
├── .github/workflows/
│   └── generate-content.yml    # 매일 자동 생성 cron
└── .claude/
    ├── plan.md                 # 이 파일
    ├── agents/                 # PM, Designer, Developer, Reviewer
    └── skills/                 # standup, deploy, new-post, retro, create-issue
```

## z-index 체계
```
z-0:    배경 (radial-gradient)
z-[5]:  별 파티클 (StarBackground canvas)
z-10:   그래프 (D3.js SVG)
z-20:   타이틀 오버레이 / 카테고리 레전드
z-30:   풋터
z-[35]: 포스트 프리뷰
z-40:   검색 드롭다운
z-50:   네비게이션 (TabNav)
z-[60]: 챗봇 (버튼 + 패널)
```
