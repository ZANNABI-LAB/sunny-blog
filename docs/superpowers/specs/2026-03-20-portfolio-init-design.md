# PRD-105: 포트폴리오 초기화 — Notion 의존 제거

## 배경

현재 포트폴리오 페이지가 Notion API를 통해 데이터를 가져오고 있으나, Notion을 더 이상 사용하지 않기로 결정. 블로그 포스트와 동일한 Markdown 기반 구조로 전환한다.

## 설계

### 데이터 소스

`content/portfolios/` 디렉토리에 Markdown 파일로 관리. 블로그 포스트(`content/posts/`)와 동일한 패턴.

### Frontmatter 스키마 (간소화)

```yaml
---
name: "프로젝트 이름"
description: "한 줄 설명"
techStack: ["Next.js", "TypeScript"]
period:
  start: "2026-03"
  end: null
thumbnail: "/images/portfolios/project-thumb.png"
githubUrl: "https://github.com/..."
deployUrl: "https://..."
published: true
---
```

기존 Notion 스키마에서 status, category, role, linearUrl, notionUrl 제거.

### 변경 범위

| 작업 | 파일 |
|------|------|
| 삭제 | `src/lib/notion.ts` |
| 삭제 | `docs/plans/2026-03-11-notion-portfolio-design.md` |
| 수정 | `src/types/portfolio.ts` — 간소화된 타입 |
| 신규 | `src/lib/portfolio.ts` — Markdown 파싱 (gray-matter) |
| 수정 | `src/app/portfolio/page.tsx` — Markdown 기반 + 빈 상태 플레이스홀더 |
| 정리 | `.env.local` — NOTION 관련 변수 제거 |
| 디렉토리 | `content/portfolios/` 생성 |

### 빈 상태 UI

포트폴리오가 없을 때 Cosmic Brutalist 스타일 "Coming Soon" 플레이스홀더 표시.
