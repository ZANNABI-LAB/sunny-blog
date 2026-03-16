---
title: "CSS 뷰포트 높이 단위 dvh, svh, lvh"
shortTitle: "뷰포트 높이 단위"
date: "2026-03-16"
tags: ["css", "viewport", "mobile-web", "responsive-design", "frontend"]
category: "Frontend"
summary: "모바일 환경에서 동적으로 변하는 뷰포트 높이를 정확히 다루는 새로운 CSS 단위들을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/216"
references: ["https://developer.mozilla.org/en-US/docs/Web/CSS/length", "https://www.w3.org/TR/css-values-4/#viewport-relative-units"]
---

## 뷰포트 높이 단위란?

CSS의 뷰포트 높이 단위는 브라우저 창의 높이를 기준으로 요소의 크기를 설정하는 단위입니다. 기존의 `vh`(viewport height)는 뷰포트 높이의 1%를 나타내지만, 모바일 환경에서는 주소창이나 네비게이션 바가 동적으로 나타나고 사라지면서 정확한 높이 계산에 어려움이 있었습니다.

이런 문제를 해결하기 위해 CSS Values and Units Module Level 4에서 새로운 뷰포트 단위들이 도입되었습니다. `dvh`, `svh`, `lvh`는 각각 동적, 최소, 최대 뷰포트 높이를 나타내며, 모바일 웹에서 더욱 정확하고 일관된 레이아웃을 구현할 수 있게 해줍니다.

## 핵심 개념

### 1. dvh (Dynamic Viewport Height)

`dvh`는 실시간으로 변하는 뷰포트 높이를 반영합니다. 사용자가 스크롤하거나 모바일 브라우저의 UI 요소가 변할 때마다 동적으로 재계산됩니다.

```css
.full-screen {
  height: 100dvh; /* 현재 뷰포트 높이에 맞춰 동적 조정 */
}

.hero-section {
  min-height: 80dvh; /* 뷰포트 변화에 따라 자연스럽게 조정 */
}
```

모바일에서 주소창이 사라질 때 뷰포트가 확장되면, `dvh`를 사용한 요소들도 함께 늘어나 화면을 효율적으로 활용할 수 있습니다.

### 2. svh (Small Viewport Height)

`svh`는 뷰포트가 가장 작을 때의 높이를 기준으로 합니다. 모바일에서 주소창, 툴바 등 모든 UI가 표시된 상태의 최소 높이를 나타냅니다.

```css
.critical-content {
  height: 100svh; /* 항상 화면에 완전히 보이도록 보장 */
}

.modal-overlay {
  min-height: 100svh; /* UI 변화에 관계없이 안정적인 높이 */
}
```

중요한 콘텐츠나 모달이 UI 변화로 인해 잘리는 것을 방지하고 싶을 때 유용합니다.

### 3. lvh (Large Viewport Height)

`lvh`는 뷰포트가 가장 클 때의 높이를 기준으로 합니다. 모바일에서 주소창과 네비게이션 바가 모두 숨겨진 전체 화면 상태의 최대 높이를 나타냅니다.

```css
.immersive-view {
  height: 100lvh; /* 전체 화면을 최대한 활용 */
}

.video-player {
  max-height: 60lvh; /* 큰 화면에서 적절한 비율 유지 */
}
```

게임이나 비디오 플레이어처럼 화면 공간을 최대한 활용하고 싶은 컨텐츠에 적합합니다.

### 4. 사용 시나리오별 선택 기준

각 단위는 구체적인 용도에 따라 선택해야 합니다:

```css
/* 자연스러운 반응형 레이아웃 */
.adaptive-layout {
  height: 100dvh; /* 사용자 경험 우선 */
}

/* 성능과 안정성이 중요한 경우 */
.stable-layout {
  height: 100svh; /* 레이아웃 안정성 우선 */
}

/* 몰입형 컨텐츠 */
.fullscreen-content {
  height: 100lvh; /* 화면 활용도 우선 */
}

/* 조건부 사용 예시 */
@media (max-width: 768px) {
  .mobile-hero {
    height: 100svh; /* 모바일에서는 안정적인 높이 */
  }
}

@media (min-width: 769px) {
  .desktop-hero {
    height: 100dvh; /* 데스크톱에서는 동적 높이 */
  }
}
```

## 정리

| 단위 | 기준 | 사용 시기 | 장점 | 단점 |
|------|------|-----------|------|------|
| `dvh` | 실시간 뷰포트 높이 | 자연스러운 사용자 경험 필요 시 | 반응적, 직관적 | 성능 오버헤드, 레이아웃 흔들림 |
| `svh` | 최소 뷰포트 높이 | 안정적인 레이아웃 필요 시 | 안정성, 성능 | 공간 활용도 부족 |
| `lvh` | 최대 뷰포트 높이 | 화면 공간 최대 활용 시 | 몰입감, 공간 효율성 | 콘텐츠 잘림 위험 |

새로운 뷰포트 단위들은 모바일 웹의 복잡한 UI 환경을 고려한 솔루션입니다. 프로젝트 요구사항과 사용자 경험을 고려하여 적절한 단위를 선택하면, 더욱 완성도 높은 반응형 레이아웃을 구현할 수 있습니다.