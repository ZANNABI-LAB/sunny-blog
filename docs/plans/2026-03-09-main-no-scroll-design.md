# 메인 페이지 스크롤 제거 설계

## 문제
- 메인 페이지에서 Footer가 불필요하게 렌더링되어 document 높이 > viewport
- `-mb-[104px]` 매직넘버와 `body.overflow = "hidden"` 해킹으로 보완 중
- 모바일 챗봇 FAB이 `bottom-24` (96px)로 너무 높음

## 해결

### 1. LayoutShell Client Component
- layout.tsx (Server) → LayoutShell (Client)로 Footer/ChatbotWidget 감싸기
- `usePathname()`으로 메인(`/`) 판별
- 메인 페이지: Footer 렌더링 안 함

### 2. page.tsx 정리
- `-mx-4 -mt-8 -mb-[104px]` 마진 해킹 제거
- MainHero가 정확히 `100dvh - nav-height` 채움

### 3. MainHero 정리
- `body.style.overflow = "hidden"` useEffect 제거
- 컨테이너 자체가 viewport에 맞으므로 불필요

### 4. 챗봇 버튼 위치
- 메인 페이지: `bottom-6` (24px + safe-bottom)
- 다른 페이지: `bottom-24` 유지 (Footer 겹침 방지)
- ChatbotWidget에 isMainPage prop 전달

## 변경 파일
- `src/app/layout.tsx` — LayoutShell 도입
- `src/components/layout-shell.tsx` — 새 Client Component
- `src/app/page.tsx` — 마진 해킹 제거
- `src/components/main-hero.tsx` — overflow hidden useEffect 제거
- `src/components/chatbot-button.tsx` — 조건부 bottom 위치
- `src/components/chatbot-widget.tsx` — isMainPage prop 전달
