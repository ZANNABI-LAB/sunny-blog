# sunny-blog

개인 기술 블로그 — "Deep Thought" 우주 컨셉, 은하수의 히치하이커 모티프, Obsidian 스타일 그래프 뷰

## 기술 스택
- **프레임워크**: Next.js 15 (App Router) + TypeScript
- **스타일링**: Tailwind CSS
- **콘텐츠**: Markdown 파일 (Git 관리, `content/posts/`)
- **그래프 시각화**: D3.js (force simulation, SVG)
- **RAG 검색**: Voyage AI (임베딩) + Supabase pgvector
- **콘텐츠 생성**: Claude API (매일메일 기반 자동 생성)
- **배포**: Vercel
- **알림**: Slack Webhook

## 프로젝트 구조
```
sunny-blog/
├── src/
│   ├── app/              # App Router 페이지
│   │   ├── layout.tsx     # 루트 레이아웃 + TabNav + Footer + ChatbotWidget
│   │   ├── page.tsx       # Main (풀스크린 그래프 + 챗봇)
│   │   ├── profile/       # Profile 탭 (자기소개)
│   │   ├── portfolio/     # Portfolio 탭 (프로젝트)
│   │   ├── tech/          # Tech 탭 (포스트 목록/상세)
│   │   ├── log/           # Log 탭 (TIL/회고)
│   │   └── api/chat/      # 챗봇 API (SSE 스트리밍, RAG)
│   └── components/
│       ├── layout-shell.tsx         # LayoutShell (pathname 기반 Footer 조건부 렌더링)
│       ├── code-block-enhancer.tsx  # 코드블록 복사 버튼 (Client, DOM 주입)
│       └── ...
├── content/
│   ├── posts/             # 플랫 구조 (카테고리는 frontmatter로 관리)
│   └── logs/              # TIL/회고 로그
├── scripts/               # 콘텐츠 생성 파이프라인 스크립트
├── .github/workflows/     # GitHub Actions (자동 생성 cron)
└── .claude/
    └── plan.md            # 프로젝트 플랜
```

## 컨벤션

### 코드
- TypeScript strict 모드
- 컴포넌트: 함수형 + arrow function
- 파일명: kebab-case (`graph-view.tsx`)
- 컴포넌트명: PascalCase (`GraphView`)
- import alias: `@/` (src 기준)

### 커밋 메시지
- `feat:` 새 기능
- `fix:` 버그 수정
- `refactor:` 리팩토링
- `style:` UI/스타일 변경
- `docs:` 문서
- `chore:` 설정/빌드
- `content:` 블로그 콘텐츠 추가/수정

### 브랜치
- `main`: 프로덕션 (Vercel 자동 배포)
- `feat/*`: 기능 개발
- `content/*`: 콘텐츠 관련

## 개발 명령어
```bash
npm run dev      # 로컬 개발 서버
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
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

## 참고
- 플랜: `.claude/plan.md`
- 매일메일 발신자: `noreply@maeil-mail.kr`
- 매일메일 답변 URL 패턴: `https://www.maeil-mail.kr/question/{id}`
