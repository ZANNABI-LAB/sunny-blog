---
name: standup
description: Linear 이슈를 읽고 서브에이전트를 순차 배정하여 개발 파이프라인을 실행하는 스킬. "/standup", "스탠드업", "오늘 작업 시작" 요청에 사용.
---

# Standup Skill

Linear 이슈 기반으로 PM -> Designer -> Developer -> Reviewer 서브에이전트를 순차 실행하는 워크플로우 스킬.

## When to Use
- 새로운 기능 개발을 시작할 때
- Linear에 등록된 이슈를 코드로 전환할 때
- 워크플로우 파이프라인을 실행할 때

## Workflow

```
[Linear 이슈 조회 + 선택 (복수 가능)]
       |
       v
[이슈별 순차 파이프라인]
  ├── [PM Agent] --- 이슈 분석 -> 요구사항 스펙
  │       | 사용자 확인
  ├── [Designer Agent] --- 스펙 -> 컴포넌트 설계
  │       | 사용자 확인
  ├── [Developer Agent] --- 스펙 + 설계 -> 코드 구현
  │       | 사용자 확인
  └── [Reviewer Agent] --- 코드 리뷰 -> PR 생성
       |
       v
[전체 완료 보고]
```

## Step 1: Linear 이슈 선택

Linear MCP로 현재 할당된 이슈를 조회한다. 현재 프로젝트(CLAUDE.md 또는 사용자 지정)의 Backlog, Todo, In Progress 상태 이슈를 대상으로 한다.

```
mcp__linear__list_issues(project: "{current_project}", assignee: "me", state: "Backlog", limit: 20)
mcp__linear__list_issues(project: "{current_project}", assignee: "me", state: "Todo", limit: 20)
mcp__linear__list_issues(project: "{current_project}", assignee: "me", state: "In Progress", limit: 20)
```

프로젝트 이름은 CLAUDE.md에서 확인하거나, 사용자에게 질문한다.

### 이슈가 0개인 경우
작업 가능한 이슈가 없음을 알리고 종료한다.

### 이슈가 1개인 경우
자동 선택하고 사용자에게 해당 이슈로 진행할지 확인만 받는다. (AskUserQuestion options 최소 2개 제약 우회)

```
"이슈가 1개 있습니다: {이슈 ID}: {제목}. 이 이슈로 파이프라인을 시작합니다."
```

### 이슈가 2개 이상인 경우
multiSelect: true로 복수 선택을 허용한다.

```
AskUserQuestion(
  questions=[{
    "question": "작업할 이슈를 선택하세요 (복수 선택 가능)",
    "header": "Linear 이슈",
    "multiSelect": true,
    "options": [
      {"label": "{이슈 ID}: {제목}", "description": "{라벨} | {우선순위}"},
      ...
    ]
  }]
)
```

선택된 이슈들의 Linear 상태를 In Progress로 변경한다.

### 인프라 이슈 감지
선택된 이슈의 라벨이 "infra", "setup", "config" 이거나, 제목/설명에 아래 키워드가 포함된 경우 **인프라 이슈**로 판별한다:
- 환경변수 설정/추가, API 키 발급
- Supabase 셋업 (테이블 생성, RLS, pgvector 확장)
- Vercel 배포 설정, 도메인 설정
- DB 마이그레이션, SQL 스키마 변경
- CI/CD 파이프라인, GitHub Actions 설정
- GitHub Actions cron/workflow, GitHub Secrets 설정
- 콘텐츠 자동 생성 파이프라인, post-generator, 매일메일 파서
- 벡터 임베딩 재생성 (generate-embeddings.ts 재실행, rate limit 대응)

인프라 이슈는 PM → Designer → Developer 파이프라인이 부적합하므로, 다음 간소화 경로를 따른다:
1. **PM만 실행**: 필요한 설정 항목, 환경변수, SQL 스키마 등을 정리
2. **사용자와 직접 수행**: API 키 발급, SQL 실행, 환경변수 설정 등을 대화형으로 진행
3. **검증 후 완료**: 설정이 정상 동작하는지 확인 후 이슈 상태를 Done으로 변경

```
AskUserQuestion(
  questions=[{
    "question": "인프라 이슈입니다. 간소화 경로로 진행할까요?",
    "header": "인프라 이슈",
    "options": [
      {"label": "간소화 경로 (Recommended)", "description": "PM 분석 → 사용자와 직접 설정 수행"},
      {"label": "전체 파이프라인", "description": "PM → Designer → Developer → Reviewer 전체 실행"}
    ]
  }]
)
```

## 경량 이슈 감지

선택된 이슈가 아래 조건에 해당하면 **경량 이슈**로 판별한다:
- 라벨이 "style", "docs", "chore" 이거나
- 변경 범위가 텍스트 수정, 설정 변경 등 순수 코드 로직 변경이 아닌 경우
- 이슈 설명에서 새 컴포넌트 설계가 필요 없는 경우

경량 이슈는 Designer를 건너뛰고 **PM → Developer → Reviewer** 경로를 따른다.

```
AskUserQuestion(
  questions=[{
    "question": "경량 이슈입니다. Designer를 건너뛸까요?",
    "header": "경량 이슈",
    "options": [
      {"label": "건너뛰기 (Recommended)", "description": "PM → Developer → Reviewer 직행"},
      {"label": "전체 파이프라인", "description": "PM → Designer → Developer → Reviewer"}
    ]
  }]
)
```

## superpowers 스킬 연동

파이프라인 각 단계에서 superpowers 플러그인 스킬이 자동으로 적용된다:
- **Designer**: `frontend-design` 스킬로 미적 방향 결정 → `ui-ux-pro-max`으로 디자인 DB 조회
- **Developer**: `superpowers:systematic-debugging` (버그 시), `superpowers:verification-before-completion` (완료 전 빌드 검증)
- **Reviewer**: `superpowers:requesting-code-review` (SHA 기반 리뷰), `superpowers:verification-before-completion` (PR 전 빌드 검증)

이 스킬들은 각 에이전트 `.md`에 내장되어 있으므로 별도 호출 불요.

## Step 2~5: 이슈별 순차 파이프라인

선택된 이슈를 하나씩 순차적으로 파이프라인에 통과시킨다.
각 이슈마다 PM → Designer → Developer → Reviewer 순서로 실행한다.

### Step 2: PM Agent 실행

선택된 이슈를 PM 에이전트에게 전달하여 요구사항 스펙을 작성한다.

```
Agent(
  subagent_type="pm",
  description="PM: 요구사항 분석",
  prompt="""
## 맥락
sunny-blog 프로젝트의 Linear 이슈를 분석하여 요구사항 스펙을 작성합니다.

## Linear 이슈
- 제목: {이슈 제목}
- 설명: {이슈 설명}
- 라벨: {라벨}
- 우선순위: {우선순위}

## 지시사항
.claude/agents/pm.md의 역할 정의에 따라 요구사항 스펙을 작성하세요.
.claude/plan.md를 참조하여 프로젝트 플랜과의 연관성을 파악하세요.
"""
)
```

**사용자 확인**: PM 결과를 보여주고 승인/수정 요청을 받는다.

```
AskUserQuestion(
  questions=[{
    "question": "PM 스펙을 확인해주세요. 진행할까요?",
    "header": "PM 결과",
    "options": [
      {"label": "승인, 다음 단계로 (Recommended)", "description": "Designer에게 전달"},
      {"label": "수정 필요", "description": "스펙을 수정합니다"},
      {"label": "중단", "description": "파이프라인을 중단합니다"}
    ]
  }]
)
```

### Step 3: Designer Agent 실행

PM 스펙을 Designer에게 전달하여 컴포넌트 설계를 작성한다.

```
Agent(
  subagent_type="designer",
  description="Designer: 컴포넌트 설계",
  prompt="""
## 맥락
sunny-blog 프로젝트의 컴포넌트를 설계합니다.

## PM 요구사항 스펙
{pm_result}

## 지시사항
.claude/agents/designer.md의 역할 정의에 따라 컴포넌트 설계서를 작성하세요.
기존 코드베이스의 패턴을 분석하고 일관성을 유지하세요.
"""
)
```

**사용자 확인**: Designer 결과를 보여주고 승인/수정 요청을 받는다.

### Step 4: Developer Agent 실행

PM 스펙 + Designer 설계를 Developer에게 전달하여 코드를 구현한다.
Developer는 worktree 격리 환경에서 작업한다.

```
Agent(
  subagent_type="developer",
  description="Developer: 코드 구현",
  isolation="worktree",
  prompt="""
## 맥락
sunny-blog 프로젝트의 기능을 구현합니다.

## PM 요구사항 스펙
{pm_result}

## Designer 컴포넌트 설계
{designer_result}

## 지시사항
.claude/agents/developer.md의 역할 정의에 따라 코드를 구현하세요.
CLAUDE.md의 컨벤션을 반드시 따르세요.
구현 후 npm run build로 빌드 에러가 없는지 확인하세요.
브랜치명: feat/{이슈 슬러그}
"""
)
```

**사용자 확인**: Developer 결과를 보여주고 승인/수정 요청을 받는다.

#### Worktree 정리 절차 (승인 후)
1. worktree에서 커밋 hash 확인: `git log --oneline -1` (worktree 디렉토리에서)
2. 메인 작업 디렉토리에서 cherry-pick: `git cherry-pick {hash}`
   - `git checkout -- files` 방식은 신규 파일이 git에 등록되지 않아 실패할 수 있으므로 **cherry-pick을 사용**
3. cherry-pick 후 `npm install` 실행 (새 패키지 추가된 경우 필수)
4. worktree 제거: `git worktree remove {path} --force`
5. 임시 브랜치 삭제: `git branch -D worktree-agent-{id}` (자동 생성된 worktree 브랜치)
   - 참고: `feat/{슬러그}` 브랜치는 worktree 내부에서만 사용되며, worktree 제거 시 함께 정리됨

### Step 5: Reviewer Agent 실행

구현된 코드를 Reviewer에게 전달하여 리뷰 + PR 생성을 수행한다.

```
Agent(
  subagent_type="reviewer",
  description="Reviewer: 코드 리뷰 + PR",
  prompt="""
## 맥락
sunny-blog 프로젝트의 코드 리뷰를 수행하고 PR을 생성합니다.

## PM 요구사항 스펙 (수용 기준 확인용)
{pm_result}

## Developer 구현 결과
{developer_result}

## 지시사항
.claude/agents/reviewer.md의 역할 정의에 따라 코드를 리뷰하세요.
Critical 이슈가 없으면 gh pr create로 PR을 생성하세요.

Linear 이슈: {이슈 ID}
"""
)
```

## Step 6: 완료 처리 + 보고

### 6-1. Linear 상태 변경
파이프라인을 통과한 모든 이슈의 상태를 **Done**으로 변경한다.
```
mcp__linear__save_issue(id: "{이슈 ID}", state: "Done")
```

### 6-2. 복수 이슈 묶어서 PR (선택)
관련된 이슈들이 같은 브랜치에서 작업된 경우, Reviewer가 단일 PR로 묶어서 생성한다.
- 예: PRD-6 + PRD-7 → 하나의 PR로 묶어서 `feat: Phase 2.3+2.4 ...`
- 이 경우 마지막 이슈의 Reviewer에서만 PR을 생성하고, 이전 이슈의 Reviewer는 리뷰만 수행

### 6-3. 메모리 업데이트
완료된 이슈를 MEMORY.md에 반영한다 (완료 Phase 갱신, 다음 작업 갱신).

### 6-4. 완료 보고

모든 이슈의 파이프라인 결과를 종합 요약한다.

### 단일 이슈인 경우

```markdown
## Standup 완료: {이슈 제목}

| 단계 | 에이전트 | 결과 |
|------|----------|------|
| 분석 | PM | {요약} |
| 설계 | Designer | {요약} |
| 구현 | Developer | {생성/수정 파일 수} |
| 리뷰 | Reviewer | {APPROVE/REQUEST CHANGES} |

### 산출물
- PR: {PR URL}
- 브랜치: {브랜치명}
```

### 복수 이슈인 경우

```markdown
## Standup 완료: {N}개 이슈

| 이슈 | PR | 리뷰 결과 |
|------|-----|----------|
| {이슈1 ID}: {제목} | {PR URL} | APPROVE |
| {이슈2 ID}: {제목} | {PR URL} | APPROVE |

### 요약
- 처리: {N}개 이슈
- PR: {N}개 생성
- 브랜치: {목록}
```

## Error Handling

| 상황 | 대응 |
|------|------|
| Linear 이슈 조회 토큰 초과 | `limit: 20` 파라미터 추가하여 재조회. 상태별로 분리 조회하여 토큰 절약 |
| Linear 이슈 조회 실패 | Linear MCP 연결 상태 확인 안내 |
| 이슈가 0개 | 작업 가능한 이슈가 없음을 알리고 종료 |
| 사용자가 "수정 필요" 선택 | 해당 에이전트를 다시 실행 |
| 사용자가 "중단" 선택 | 현재까지의 결과를 요약하고 종료. 복수 이슈 중 중단 시 나머지 이슈는 건너뜀 |
| Reviewer가 REQUEST CHANGES | 사용자에게 피드백을 보여주고 확인 후, Developer를 재실행 (최대 2회). 2회 초과 시 사용자에게 직접 판단 요청 |
| 빌드 실패 | Developer에게 에러 로그 전달 후 재실행. 2회 초과 시 사용자에게 직접 판단 요청 |
| cherry-pick 전 로컬 변경사항 | main에 unstaged/staged 변경사항이 있으면 cherry-pick 실패. 아래 **Stash Pop 충돌 해결** 절차를 따른다 |
| cherry-pick 충돌 | 충돌 파일을 `Read`로 확인 → `Edit`으로 수동 해결 → `git add {files}` + `git cherry-pick --continue`. `git add -A` 사용 금지 (불필요 파일 포함 위험). 충돌 10개+ 파일이면 cherry-pick 포기 → main에서 직접 Edit 적용 |
| PR base 브랜치 삭제로 auto-close | 복수 이슈를 별도 PR로 만들 때 base를 `main`으로 설정. 선행 PR이 먼저 merge되어야 하는 경우, main에 직접 cherry-pick + push로 우회 |
| 복수 PR이 동일 파일 수정 (대규모 충돌) | cherry-pick 충돌이 10개+ 파일이면 cherry-pick 포기. 대신 general-purpose 에이전트로 변경사항을 main에 직접 Edit으로 적용 → `git add {files}` + `git commit` + `git push`. PR 있으면 close 처리 |
| 병렬 서브에이전트 동일 파일 수정 (변경 유실) | 동일 파일을 여러 서브에이전트가 병렬 수정하면 마지막 에이전트의 변경만 남고 나머지 유실됨. **동일 파일 수정이 필요한 태스크는 반드시 순차 실행**하거나, 병렬 실행 후 `git diff`로 모든 변경이 반영되었는지 검증해야 함. 1-2줄 소규모 변경도 예외 아님 |
| PR 없이 main 직접 push 필요 | 버그 수정 등 소규모 변경이 선행 PR과 충돌할 때, worktree/PR 경로 대신 main에서 직접 코드 수정 → commit → push. Linear 상태는 동일하게 Done 처리 |

### Stash Pop 충돌 해결 절차
cherry-pick 전 로컬 변경사항이 있을 때:
1. `git stash` → cherry-pick 실행
2. `git stash pop` 시도
3. 충돌 발생 시: `Read`로 충돌 파일 확인 → `Edit`으로 수동 해결 → `git add {files}` + `git stash drop`
4. 충돌 없으면 정상 진행

### REQUEST CHANGES 재실행 절차
1. Reviewer의 Critical 피드백을 Developer 프롬프트에 추가하여 재실행
2. Developer가 수정 커밋 후, 다시 Reviewer에게 전달
3. 최대 2회 반복 후에도 해결 안 되면 사용자에게 직접 판단 요청
```
Developer 재실행 prompt 추가:
## Reviewer 피드백 (수정 필요)
{reviewer_critical_feedback}
위 피드백을 반영하여 코드를 수정하세요.
```

## Quick Reference

```
/standup
  -> Linear 이슈 조회 (Backlog + Todo + In Progress)
  -> 이슈 선택 (1개: 자동, 2개+: multiSelect)
  -> 이슈별 순차 실행:
     -> PM (분석) -> 사용자 확인
     -> Designer (설계) -> 사용자 확인
     -> Developer (구현, worktree) -> 사용자 확인
     -> Reviewer (리뷰 + PR)
  -> 전체 완료 보고
```
