---
title: "Tailwind CSS v4: 달라진 점과 마이그레이션 가이드"
date: "2026-03-04"
tags: ["tailwind", "css", "frontend", "nextjs"]
category: "Frontend"
summary: "Tailwind CSS v4의 주요 변경점과 v3에서 마이그레이션하는 방법을 실전 예시와 함께 정리합니다."
---

## Tailwind CSS v4란?

Tailwind CSS v4는 **Rust 기반 엔진(Oxide)**으로 완전히 재작성된 메이저 버전이다. 빌드 성능이 10배 이상 빨라졌으며, 설정 방식이 근본적으로 변경되었다.

### 핵심 변경점 요약

- `tailwind.config.ts` 제거 → **CSS-first 설정**
- `@apply` 대신 CSS 변수 활용 권장
- `@plugin` 디렉티브로 플러그인 등록
- 새로운 `@theme` 디렉티브로 디자인 토큰 정의

## 설정 방식의 변화

### v3: JavaScript 설정

```typescript
// tailwind.config.ts (v3)
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
```

### v4: CSS-first 설정

```css
/* globals.css (v4) */
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --color-primary: #6366f1;
}
```

v4에서는 `tailwind.config.ts` 파일이 **완전히 사라진다**. 모든 설정을 CSS 파일에서 직접 관리한다.

## @plugin 디렉티브

플러그인 등록 방식이 가장 크게 달라졌다.

| 항목 | v3 | v4 |
|------|----|----|
| 설정 위치 | `tailwind.config.ts` | `globals.css` |
| 문법 | `plugins: [require(...)]` | `@plugin "..."` |
| 타입 | JavaScript | CSS 디렉티브 |

```css
/* 플러그인 등록 예시 */
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@plugin "@tailwindcss/forms";
```

## @theme으로 디자인 토큰 정의

v3의 `theme.extend`를 대체하는 `@theme` 디렉티브:

```css
@theme {
  /* 색상 */
  --color-space-black: #0a0a0f;
  --color-accent: #818cf8;

  /* 폰트 */
  --font-display: "Space Grotesk", sans-serif;

  /* 간격 */
  --spacing-18: 4.5rem;
}
```

정의된 토큰은 Tailwind 유틸리티에서 바로 사용 가능하다:

```html
<div class="bg-space-black text-accent font-display p-18">
  커스텀 토큰 사용 예시
</div>
```

## Next.js 15에서 v4 사용하기

Next.js 15와 Tailwind CSS v4의 조합은 공식 지원된다.

### 1. 설치

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

### 2. PostCSS 설정

```javascript
// postcss.config.mjs
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### 3. CSS 진입점

```css
/* src/app/globals.css */
@import "tailwindcss";
```

> v3에서 사용하던 `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;` 디렉티브는 v4에서 `@import "tailwindcss"` 하나로 통합되었다.

## 마이그레이션 체크리스트

v3에서 v4로 마이그레이션할 때 확인할 사항:

1. **`tailwind.config.ts` 제거** → `globals.css`로 설정 이전
2. **`@tailwind` 디렉티브 교체** → `@import "tailwindcss"`
3. **플러그인 이전** → `@plugin` 디렉티브 사용
4. **커스텀 테마** → `@theme` 디렉티브로 변환
5. **`darkMode` 설정** → v4는 `@media (prefers-color-scheme: dark)` 기본 지원
6. **`content` 배열 제거** → v4는 자동 콘텐츠 감지

## 성능 비교

Rust 기반 Oxide 엔진 도입으로 빌드 성능이 대폭 개선되었다:

- **초기 빌드**: ~3.5초 → ~0.3초
- **증분 빌드**: ~150ms → ~5ms
- **메모리 사용량**: 50% 이상 감소

## 정리

Tailwind CSS v4는 단순한 버전 업이 아니라 **패러다임 전환**이다. CSS-first 설정, Oxide 엔진, `@theme`/`@plugin` 디렉티브 등은 기존 방식과 완전히 다르다. 이 블로그 프로젝트 자체가 v4 기반으로 구축되어 있으니, 실제 코드를 참고하며 익혀보자.
