# Main Hero UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 메인 히어로 UI를 개선한다 — 검색+챗봇 통합(터미널 스타일), 레전드 위치 변경, amber 모노톤, 블랙 배경

**Architecture:** 기존 SearchBar를 제거하고 ChatbotWidget에 인라인 트리거 모드를 추가한다. 메인 페이지에서는 우측 하단 고정 입력창으로 챗봇을 열고, 다른 페이지에서는 기존 42 플로팅 버튼을 유지한다. ChatPanel은 CLI 프롬프트 스타일(you>/42>)로 메시지를 표시한다.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS, TypeScript

---

### Task 1: Amber 모노톤 색상 팔레트

**Files:**
- Modify: `src/lib/categories.ts`

**Step 1: 색상 팔레트 변경**

```typescript
export const CATEGORY_COLORS: Record<Category, string> = {
  Architecture: "#fbbf24",
  "Design Pattern": "#f59e0b",
  Security: "#fcd34d",
  Testing: "#b45309",
  Infrastructure: "#92400e",
  Backend: "#d97706",
  Frontend: "#eab308",
};

const DEFAULT_COLOR = "#d4a017";
```

**Step 2: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공 (색상은 런타임에서만 사용)

**Step 3: Commit**

```bash
git add src/lib/categories.ts
git commit -m "style: 그래프 노드 색상을 amber 모노톤으로 통일"
```

---

### Task 2: 배경 블랙 톤 강화

**Files:**
- Modify: `src/app/globals.css` (line 37-40 nebula opacity, line 120-125 glow)
- Modify: `src/app/layout.tsx` (line 41 body bg)
- Modify: `src/components/main-hero.tsx` (line 39 radial gradient)
- Modify: `src/components/category-legend.tsx` (line 17 bg color)

**Step 1: globals.css — nebula opacity 50% 감소**

`nebula-bg::after` 배경 그라디언트 opacity 변경:
```css
background:
  radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.02) 0%, transparent 40%),
  radial-gradient(ellipse at 60% 80%, rgba(245, 158, 11, 0.015) 0%, transparent 45%);
```

**Step 2: layout.tsx — body bg 변경**

```
bg-[#0a0a0f] → bg-[#070709]
```

**Step 3: main-hero.tsx — radial gradient 어둡게**

```
#0f1729 → #0a0f1a, #0a0a0f → #070709
```

**Step 4: category-legend.tsx — bg 색상 맞춤**

```
bg-[#0a0a0f]/70 → bg-[#070709]/70
```

**Step 5: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공

**Step 6: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/components/main-hero.tsx src/components/category-legend.tsx
git commit -m "style: 배경 블랙 톤 강화 — bg #070709, nebula opacity 50% 감소"
```

---

### Task 3: TitleOverlay "42" 워터마크 제거

**Files:**
- Modify: `src/components/title-overlay.tsx` (line 21-27 삭제)

**Step 1: 42 워터마크 div 제거**

`title-overlay.tsx`에서 `{/* 42 accent */}` 주석 이하 `<div>42</div>` 블록 전체 삭제.

**Step 2: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공

**Step 3: Commit**

```bash
git add src/components/title-overlay.tsx
git commit -m "style: TitleOverlay 42 워터마크 제거 — 챗봇과 중복"
```

---

### Task 4: CategoryLegend 좌측 하단 이동

**Files:**
- Modify: `src/components/category-legend.tsx` (line 17 위치 클래스)

**Step 1: 위치 클래스 변경**

```
bottom-24 right-4 md:right-8 → bottom-24 left-6 md:left-12
```

**Step 2: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공

**Step 3: Commit**

```bash
git add src/components/category-legend.tsx
git commit -m "style: CategoryLegend 좌측 하단으로 이동 — 챗봇 버튼 겹침 해소"
```

---

### Task 5: ChatPanel CLI 스타일 변환

**Files:**
- Modify: `src/components/chat-panel.tsx`

**Step 1: BotMessage에 "42>" 프롬프트 추가**

`BotMessage` 컴포넌트에서 메시지 content 앞에 amber 색상 `42>` 프롬프트를 표시:

```tsx
const BotMessage = ({ message }: { message: Message }) => (
  <div className="flex items-start gap-2">
    <div
      className={`max-w-[85%] rounded-lg border px-4 py-3 ${
        message.isError
          ? "border-red-400/20 bg-red-400/5 text-red-400/80"
          : "border-white/5 bg-white/5 text-zinc-200"
      }`}
    >
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        <span className="font-display text-amber-400 mr-1">42&gt;</span>
        {message.content}
        {message.isStreaming && (
          <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-amber-400" />
        )}
      </p>
      {message.references && message.references.length > 0 && (
        <ChatReferences references={message.references} />
      )}
    </div>
  </div>
);
```

**Step 2: UserMessage에 "you>" 프롬프트 추가**

```tsx
const UserMessage = ({ message }: { message: Message }) => (
  <div className="flex justify-end">
    <div className="max-w-[85%] rounded-lg border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-zinc-200">
      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        <span className="font-display text-zinc-500 mr-1">you&gt;</span>
        {message.content}
      </p>
    </div>
  </div>
);
```

**Step 3: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공

**Step 4: Commit**

```bash
git add src/components/chat-panel.tsx
git commit -m "style: ChatPanel CLI 프롬프트 스타일 — you>/42> 프롬프트"
```

---

### Task 6: ChatbotWidget 인라인 트리거 모드

**Files:**
- Modify: `src/components/chatbot-widget.tsx`
- Modify: `src/components/chatbot-button.tsx`

**Step 1: ChatbotWidget에 pathname 감지 + 인라인 트리거 추가**

`chatbot-widget.tsx`에서 `usePathname()`으로 메인 페이지 판별.
메인(`/`)이면 인라인 트리거 입력창 렌더, 42 버튼 숨김.
다른 페이지면 기존 42 버튼 유지.

인라인 트리거: 우측 하단 고정 입력창. 포커스/타이핑 시 챗봇 패널 열림.
입력값이 있으면 패널 열면서 자동 전송.

```tsx
// chatbot-widget.tsx 변경 핵심
import { usePathname } from "next/navigation";

const ChatbotWidget = () => {
  const pathname = usePathname();
  const isMainPage = pathname === "/";
  const [triggerInput, setTriggerInput] = useState("");

  const handleTriggerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = triggerInput.trim();
    setIsOpen(true);
    if (trimmed) {
      // 패널 열리면서 자동 전송
      setTimeout(() => handleSend(trimmed), 100);
      setTriggerInput("");
    }
  };

  const handleTriggerFocus = () => {
    if (!triggerInput.trim()) {
      setIsOpen(true);
    }
  };

  return (
    <>
      {(isOpen || isClosing) && (
        <ChatPanel ... />
      )}
      {isMainPage ? (
        <form onSubmit={handleTriggerSubmit} className="fixed bottom-6 right-6 md:right-12 z-[60]">
          <div className="flex items-center gap-2 bg-[#070709]/80 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
            <span className="font-display text-amber-400 text-xs">&gt;</span>
            <input
              type="text"
              value={triggerInput}
              onChange={(e) => setTriggerInput(e.target.value)}
              onFocus={handleTriggerFocus}
              placeholder="Ask Deep Thought..."
              className="font-display w-48 md:w-64 bg-transparent text-sm text-white placeholder:text-zinc-600 tracking-wider outline-none"
            />
            <kbd className="hidden md:inline text-[10px] text-zinc-600 border border-zinc-700 rounded px-1">⌘K</kbd>
          </div>
        </form>
      ) : (
        <ChatbotButton isOpen={isOpen} onClick={toggle} ref={buttonRef} />
      )}
    </>
  );
};
```

**Step 2: ChatPanel 위치 조정 — 메인에서는 우측 하단 위로 열림**

ChatPanel의 위치를 `sm:bottom-40 sm:right-6` → `sm:bottom-16 sm:right-6`으로 조정하여 트리거 입력창 바로 위에서 열리도록 함.

**Step 3: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공

**Step 4: Commit**

```bash
git add src/components/chatbot-widget.tsx src/components/chatbot-button.tsx
git commit -m "feat: 검색+챗봇 통합 — 메인 인라인 트리거, 타 페이지 42 버튼 유지"
```

---

### Task 7: MainHero에서 SearchBar 제거

**Files:**
- Modify: `src/components/main-hero.tsx` (SearchBar import/사용 제거)

**Step 1: SearchBar import 및 JSX 제거**

`main-hero.tsx`에서:
- `import SearchBar` 줄 삭제
- SearchBar를 감싸는 `<div className="absolute bottom-32 left-6 ...">` 블록 삭제

**Step 2: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공

**Step 3: Commit**

```bash
git add src/components/main-hero.tsx
git commit -m "refactor: MainHero에서 SearchBar 제거 — 챗봇으로 통합"
```

---

### Task 8: 최종 검증 + dev 서버 확인

**Step 1: 전체 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공, 에러 없음

**Step 2: dev 서버로 시각적 확인**

Run: `npm run dev`

확인 사항:
- [ ] 메인: DEEP THOUGHT 타이틀 (42 워터마크 없음)
- [ ] 메인: 좌측 하단에 CategoryLegend
- [ ] 메인: 우측 하단에 `> Ask Deep Thought...` 입력창
- [ ] 메인: 입력창 클릭 시 챗봇 패널 위로 열림
- [ ] 메인: 42> / you> CLI 프롬프트 스타일
- [ ] 메인: 42 플로팅 버튼 없음
- [ ] Tech 페이지: 42 플로팅 버튼 있음
- [ ] 그래프: amber 모노톤 노드
- [ ] 배경: 더 어두운 블랙 톤
- [ ] ⌘K 단축키 작동

**Step 3: Lint 확인**

Run: `npm run lint`
Expected: 에러 없음
