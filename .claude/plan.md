# sunny-blog 프로젝트 계획

## Context
PRD에서 목표한 "AI Native 워크플로우 통합"의 첫 실전 프로젝트로 개인 기술 블로그를 만든다.
Next.js + TypeScript 스택으로, Claude Code를 허브로 한 개발 워크플로우를 직접 체험하는 것이 핵심.

## 컨셉
- **테마**: "Sunny" = 태양/별 — 검은 우주 배경 위에 포스트가 별처럼 빛나는 그래프 뷰
- **메인 페이지**: Obsidian 스타일 그래프 뷰 + 타이틀 + RAG 검색창
- **그래프 연결**: 태그 + 카테고리 기반으로 포스트 간 연결선 표시
- **탭 구성**: Main (그래프 뷰 + 검색) | Tech (기술 아티클) | Portfolio (프로젝트/자기소개)
- **콘텐츠 자동 생성**: 매일메일(maeil-mail.kr) CS 질문 기반 → Claude API로 포스트 생성

## 기술 스택
| 영역 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js (App Router) + TypeScript | |
| 스타일링 | Tailwind CSS | |
| 콘텐츠 | Markdown 파일 (Git 관리) | `content/posts/` 디렉토리 |
| 그래프 시각화 | D3.js 또는 react-force-graph | 노드 = 포스트, 엣지 = 태그/카테고리 공유 |
| 임베딩 | Voyage AI | Anthropic 파트너 |
| 벡터 DB | Supabase pgvector | PostgreSQL + 벡터 검색 통합 |
| AI 챗봇 | Claude API | RAG 기반 R2-D2 챗봇 + 콘텐츠 생성 |
| 콘텐츠 생성 | Claude API | 매일메일 답변 + 출처 조합 |
| 배포 | Vercel | 기본 도메인 → 추후 커스텀 도메인 |
| 알림 | Slack Webhook | 포스트 생성 알림 |
| 댓글 (추후) | giscus | GitHub Discussions 기반 |
| 수익화 (추후) | Google AdSense | |
| SEO (추후) | next-sitemap, 메타태그 | |

## 환경
- GitHub: `SHINJUNGSUN/sunny-blog`
- 로컬: `/Users/sunny/deep-thought/workspace/sunny-blog/`
- Node.js: v25.6.1, npm: 11.9.0

## 구현 단계

### Phase 1: 프로젝트 기초 세팅
- [x] Step 1.1: GitHub 레포 생성 및 로컬 연결
- [x] Step 1.2: Next.js 프로젝트 스캐폴딩 (TypeScript, App Router, Tailwind CSS, ESLint, src/)
- [x] Step 1.3: 기본 레이아웃 및 탭 네비게이션 (Main / Tech / Portfolio)
- [x] Step 1.4: 첫 커밋 & push

### Phase 2: 콘텐츠 시스템
- [x] Step 2.1: Markdown 파싱 시스템 구축 (gray-matter + remark/rehype)
- [x] Step 2.2: `content/posts/` 디렉토리 구조 설계 (frontmatter: title, date, tags, category)
- [x] Step 2.3: Tech 탭 — 포스트 목록 페이지
- [x] Step 2.4: 포스트 상세 페이지 (`/tech/[slug]`)
- [x] Step 2.5: 샘플 포스트 2~3개 작성

### Phase 3: 그래프 뷰 (메인 페이지)
- [x] Step 3.1: 그래프 데이터 생성 (포스트 → 노드, 태그/카테고리 공유 → 엣지)
- [x] Step 3.2: 그래프 시각화 컴포넌트 (검은 배경, 별처럼 빛나는 노드)
- [x] Step 3.3: 노드 클릭 → 포스트 이동 인터랙션
- [x] Step 3.4: 노드 호버 시 포스트 미리보기

### Phase 4: RAG 검색 + AI 챗봇
- [x] Step 4.1: Supabase 프로젝트 생성 + pgvector 확장 활성화 + Voyage AI 셋업
- [ ] Step 4.2: 빌드 타임 임베딩 생성 스크립트 (Voyage AI → Supabase 저장)
- [ ] Step 4.3: 검색 API 라우트 (`/api/search`) — 쿼리 임베딩 → 벡터 유사도 검색
- [ ] Step 4.4: 메인 페이지 검색 UI — RAG 자동완성 → 포스트 이동
- [ ] Step 4.5: 챗봇 API 라우트 (`/api/chat`) — RAG + Claude API 스트리밍 답변
- [ ] Step 4.6: R2-D2 챗봇 UI — 우측 하단 플로팅 버튼 + 채팅 패널
- [ ] Step 4.7: 챗봇 UX 완성 — 대화 이력, 포스트 참조 링크, 타이핑 애니메이션

### Phase 5: 콘텐츠 자동 생성 파이프라인
- [ ] Step 5.1: 매일메일 파싱 스크립트 (Gmail API → 질문 추출 + 답변 페이지 URL)
- [ ] Step 5.2: 답변 페이지 크롤링 (본문 + 출처 추출)
- [ ] Step 5.3: Claude API 연동 — 답변 + 출처 조합하여 블로그 톤 MD 포스트 생성
- [ ] Step 5.4: 태그/카테고리 자동 분류 (Claude API)
- [ ] Step 5.5: GitHub Actions 스케줄 워크플로우 (매일 자동 실행)
- [ ] Step 5.6: 자동 PR 생성 (draft 포스트 → PR)
- [ ] Step 5.7: Slack Webhook 알림 (PR 링크 포함)

### Phase 6: Portfolio 탭
- [ ] Step 6.1: 자기소개 섹션
- [ ] Step 6.2: 프로젝트 카드 목록 (sunny-whisper 등)

### Phase 7: 디벨롭 (추후)
- [ ] Step 7.1: SEO (next-sitemap, 메타태그, OG 이미지)
- [ ] Step 7.2: giscus 댓글
- [ ] Step 7.3: Google AdSense
- [ ] Step 7.4: 커스텀 도메인 연결

## 콘텐츠 구조
```
content/
└── posts/
    ├── cs/
    │   ├── db-replication.md          ← 매일메일 자동 생성
    │   ├── record-dto.md
    │   └── ...
    └── tech/
        ├── nextjs-app-router.md       ← 직접 작성
        └── ...
```

### Frontmatter 예시
```yaml
---
title: "DB Replication에 대해서 설명해주세요"
date: "2026-03-04"
tags: ["database", "replication", "backend"]
category: "Backend"
summary: "DB Replication의 개념, 바이너리 로그 방식, 복제 과정 정리"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/109"
---
```

## 콘텐츠 자동 생성 파이프라인
```
[매일 22:07] 매일메일 수신
    ↓
[GitHub Actions - 매일 cron]
    ↓
Gmail API → 최신 매일메일 파싱 (질문 + 답변 URL)
    ↓
답변 페이지 크롤링 (본문 + 출처)
    ↓
Claude API → MD 포스트 생성 (답변 + 출처 조합, 태그/카테고리 자동 분류)
    ↓
content/posts/cs/{slug}.md 생성
    ↓
자동 PR 생성 (draft)
    ↓
Slack Webhook → "오늘의 CS 포스트가 생성되었습니다! [PR 링크]"
    ↓
중선님 리뷰/수정 → 머지 = 배포
```

## 검증
- `npm run dev`로 로컬 실행 확인
- 메인 페이지: 그래프 뷰 렌더링 + 검색창 동작
- Tech 탭: 포스트 목록 + 상세 페이지 렌더링
- Portfolio 탭: 자기소개 + 프로젝트 카드
- 콘텐츠 파이프라인: 매일메일 → MD 생성 → PR → Slack 알림
- GitHub 레포에 push 성공 확인
- Vercel 배포 확인
