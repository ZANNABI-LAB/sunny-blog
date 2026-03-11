# Notion 포트폴리오 연동 설계

> 2026-03-11 | ai-native-workflow + sunny-blog

## 개요

프로젝트 완료 시 AI가 코드/이슈/PR을 분석하여 Notion에 개발 문서를 자동 생성하고, 블로그 포트폴리오 페이지에서 Notion DB를 읽어 프로젝트 목록을 동적 렌더링한다. 상세 문서는 Notion 페이지로 이동.

## 아키텍처

```
[프로젝트 완료]
    ↓ /publish-portfolio 스킬 실행
[AI 분석] → Linear 이슈 + GitHub 커밋/PR + 코드
    ↓
[Notion 페이지 자동 생성] → Portfolio DB에 행 + 본문
    ↓
[사용자 검토] → 스크린샷 추가, Published ✅ 체크
    ↓
[블로그 포트폴리오] ← Notion API (ISR 1시간) ← Portfolio DB (Published=✅)
    ↓ 카드 클릭
[Notion 페이지] (외부 링크)
```

## Part A — Notion 구조

### Portfolio DB 스키마

| 속성명 | 타입 | 용도 | 예시 |
|---|---|---|---|
| Name | Title | 프로젝트명 | Deep Thought |
| Description | Text | 한 줄 설명 | AI Native 개인 기술 블로그 |
| Tech Stack | Multi-select | 기술 태그 | Next.js, D3.js, Claude API |
| Status | Select | 상태 | 완료 / 진행중 / 중단 |
| Category | Select | 분류 | 웹 / 모바일 / 인프라 / AI |
| Period | Date | 기간 (range) | 2026.02 ~ 2026.03 |
| Role | Multi-select | 역할 | 기획, 디자인, 풀스택 |
| Thumbnail | Files & media | 대표 이미지 | 스크린샷 |
| GitHub URL | URL | 레포 링크 | |
| Deploy URL | URL | 배포 주소 | |
| Linear URL | URL | 프로젝트 링크 | |
| Published | Checkbox | 블로그 노출 여부 | ✅ |

### 페이지 본문 템플릿

```
## 개요
## 목적 (배경 / 동기)
## 주요 기능
## 기술 스택 & 아키텍처
## 설계 결정 (트레이드오프 / 선택 이유)
## 성과 & 배운 점
```

## Part B — `/publish-portfolio` 스킬

### 위치

```
~/.claude/skills/publish-portfolio/SKILL.md
```

전역 스킬 — 어떤 프로젝트에서든 실행 가능. 현재 작업 디렉토리의 프로젝트를 자동 감지.

### 실행 흐름

1. **프로젝트 컨텍스트 수집**
   - Linear 이슈 (Done) 목록
   - GitHub 커밋/PR 히스토리
   - package.json (기술 스택)
   - docs/plans/ (설계 문서)
   - CLAUDE.md, plan.md (프로젝트 구조)
   - README.md

2. **AI 분석 → 문서 초안 생성**
   - 개요, 목적, 주요 기능, 기술 스택, 설계 결정, 성과

3. **사용자에게 초안 보여주기** → 수정 요청 가능

4. **확정 후 Notion에 생성**
   - DB에 행 추가 (메타데이터)
   - 페이지 본문 작성 (블록 단위)
   - Published = false (수동 확인 후 체크)

### 설계 결정

- Published 기본값 `false` — 스크린샷 추가 등 수동 검토 후 공개
- Notion 연동은 Notion MCP 활용 — Claude Code에서 바로 호출
- 생성 전 사용자 승인 — 품질 보장
- 스크린샷 자동 캡처 제외 — 오버엔지니어링

## Part C — 블로그 포트폴리오 연동

### 구현 방식

- `@notionhq/client` SDK로 Notion DB 쿼리
- ISR (revalidate: 3600) — 1시간 주기 재생성
- 환경변수: `NOTION_API_KEY`, `NOTION_PORTFOLIO_DB_ID`

### 카드 표시 정보

이름, 설명, 기술 스택, 상태, 기간, 썸네일

### 상세 이동

Notion 페이지 public URL로 `target="_blank"` 이동

### 기존 코드 변경

- 하드코딩된 Deep Thought 카드 제거
- Notion DB에서 동적 렌더링으로 전환
- 빈 상태 시 "More coming soon" 유지

## Part D — ai-native-workflow 레포

### 위치

```
~/deep-thought/workspace/ai-native-workflow/
```

나만의 AI 네이티브 워크플로우 하네스. 전역 스킬, 공용 에이전트 템플릿, 워크플로우 문서를 관리.

### 초기 구조

```
ai-native-workflow/
├── README.md
├── skills/
│   └── publish-portfolio/
│       └── SKILL.md
├── docs/
│   └── (워크플로우 문서)
└── CLAUDE.md
```

전역 스킬(`~/.claude/skills/`)은 이 레포의 `skills/`에서 개발 → symlink 또는 복사로 배포.

## 구현 순서

| 순서 | 작업 | 프로젝트 | 의존성 |
|---|---|---|---|
| A-1 | Notion Portfolio DB 생성 (수동) | - | 없음 |
| A-2 | ai-native-workflow 레포 초기화 + `/publish-portfolio` 스킬 개발 | ai-native-workflow | A-1 |
| A-3 | Deep Thought 프로젝트로 스킬 테스트 | ai-native-workflow | A-2 |
| B-1 | 블로그 포트폴리오 Notion API 연동 | sunny-blog | A-1 |

A-2와 B-1은 병렬 가능 (A-1만 완료되면).

## 스코프 아웃

- GitHub Actions 자동 트리거
- 스크린샷 자동 캡처
- Notion 문서 버전 관리
