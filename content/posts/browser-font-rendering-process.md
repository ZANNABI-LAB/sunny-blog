---
title: "브라우저 폰트 렌더링 과정과 최적화 방법"
shortTitle: "폰트 렌더링"
date: "2026-03-19"
tags: ["font-rendering", "web-fonts", "font-display", "performance", "fout-foit"]
category: "Frontend"
summary: "브라우저가 웹 폰트를 로드하고 렌더링하는 과정과 FOUT/FOIT 현상을 해결하는 최적화 방법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/223"
references: ["https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face", "https://web.dev/font-display/", "https://fonts.google.com/knowledge/glossary/fout"]
---

## 브라우저 폰트 렌더링 과정이란?

브라우저가 웹 페이지에서 폰트를 적용하는 과정은 여러 단계를 거쳐 진행됩니다. HTML과 CSS를 파싱한 후, 지정된 폰트 파일을 로드하고 텍스트에 적용하는 복잡한 과정입니다.

이 과정에서 폰트가 로드되기 전까지 텍스트가 어떻게 렌더링될지 결정하는 것이 중요합니다. 잘못 처리하면 FOUT(Flash of Unstyled Text)나 FOIT(Flash of Invisible Text) 현상이 발생하여 사용자 경험을 해칠 수 있습니다.

## 핵심 개념

### 1. 폰트 파일 로드 과정

브라우저는 HTML 문서를 파싱하면서 CSS를 분석하고, `@font-face` 선언을 발견하면 폰트 파일의 위치를 파악합니다.

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom-font.woff2') format('woff2'),
       url('/fonts/custom-font.woff') format('woff');
  font-display: swap;
}

.title {
  font-family: 'CustomFont', 'Arial', sans-serif;
}
```

브라우저는 폰트가 실제로 필요한 시점(텍스트 렌더링 시)에 폰트 파일을 다운로드합니다. WOFF2, WOFF 같은 압축된 형식을 우선적으로 사용하여 네트워크 효율성을 높입니다.

### 2. font-display 속성과 렌더링 전략

`font-display` 속성은 폰트가 로드되는 동안 텍스트를 어떻게 표시할지 결정합니다.

```css
/* 각각 다른 렌더링 전략 */
.swap-font {
  font-display: swap; /* fallback → 웹폰트 교체 */
}

.block-font {
  font-display: block; /* 텍스트 숨김 → 웹폰트 표시 */
}

.optional-font {
  font-display: optional; /* 빠른 로드시에만 웹폰트 적용 */
}
```

- **swap**: fallback 폰트를 먼저 표시하고 웹 폰트 로드 후 교체 (FOUT 발생 가능)
- **block**: 웹 폰트가 로드될 때까지 텍스트 숨김 (FOIT 발생 가능)
- **optional**: 네트워크가 빠른 경우에만 웹 폰트 적용, 그렇지 않으면 fallback 유지

### 3. 폰트 사전 로딩과 성능 최적화

폰트 파일을 미리 로드하여 렌더링 지연을 최소화할 수 있습니다.

```html
<!-- HTML head에서 폰트 사전 로딩 -->
<link rel="preload" as="font" type="font/woff2" 
      href="/fonts/main-font.woff2" crossorigin>

<!-- 중요한 폰트는 더 높은 우선순위로 -->
<link rel="preload" as="font" type="font/woff2" 
      href="/fonts/title-font.woff2" crossorigin fetchpriority="high">
```

JavaScript를 사용한 동적 폰트 로딩도 가능합니다.

```javascript
// Font Loading API 사용
const font = new FontFace('CustomFont', 'url(/fonts/custom.woff2)');

font.load().then(() => {
  document.fonts.add(font);
  document.body.classList.add('font-loaded');
}).catch((error) => {
  console.error('Font loading failed:', error);
});
```

### 4. FOUT/FOIT 현상 해결 방법

렌더링 과정에서 발생하는 시각적 깜빡임을 최소화하는 전략들입니다.

```css
/* CSS로 부드러운 폰트 전환 */
.text-content {
  font-family: 'WebFont', Arial, sans-serif;
  font-display: optional;
  transition: font-family 0.3s ease;
}

/* 폰트 로딩 상태에 따른 스타일 조정 */
.font-loading .text-content {
  visibility: hidden;
}

.font-loaded .text-content {
  visibility: visible;
}
```

시스템 폰트를 fallback으로 사용하여 레이아웃 변화를 최소화합니다.

```css
.optimized-text {
  font-family: 'WebFont', 
               -apple-system, 
               BlinkMacSystemFont, 
               'Segoe UI', 
               system-ui, 
               sans-serif;
}
```

## 정리

| 단계 | 설명 | 최적화 방법 |
|------|------|-------------|
| **파싱** | CSS에서 `@font-face` 발견 | 필요한 폰트만 선언 |
| **로딩** | 폰트 파일 다운로드 | `preload`로 사전 로딩 |
| **렌더링** | 텍스트에 폰트 적용 | `font-display` 속성 활용 |
| **최적화** | FOUT/FOIT 현상 방지 | `optional` 또는 fallback 전략 |

**핵심 권장사항:**
- 중요한 텍스트는 `font-display: optional` 사용
- 장식적 요소는 `font-display: swap` 허용
- 시스템 폰트를 적절한 fallback으로 설정
- `preload`를 통한 선택적 사전 로딩 적용