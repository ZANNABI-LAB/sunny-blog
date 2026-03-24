---
title: "CSS 명시도(Specificity)와 스타일 우선순위"
shortTitle: "CSS 명시도"
date: "2026-03-24"
tags: ["css", "specificity", "frontend", "styling", "selector"]
category: "Frontend"
summary: "CSS 명시도 계산 방식과 스타일 우선순위 결정 원리를 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/238"
references: ["https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity", "https://www.w3.org/TR/CSS22/cascade.html#specificity"]
---

## CSS 명시도란?

CSS 명시도(Specificity)는 동일한 HTML 요소에 여러 CSS 규칙이 적용될 때, 브라우저가 어떤 스타일을 최종적으로 적용할지 결정하는 우선순위 시스템입니다. 웹 개발에서 스타일이 예상과 다르게 적용되는 문제의 대부분은 명시도를 제대로 이해하지 못해서 발생합니다.

명시도는 선택자의 조합에 따라 점수를 계산하며, 가장 높은 점수를 가진 규칙이 적용됩니다. 이는 CSS 캐스케이딩의 핵심 원리 중 하나로, 스타일 충돌을 체계적으로 해결하는 메커니즘을 제공합니다.

## 핵심 개념

### 1. 명시도 계산 방식

CSS 명시도는 네 자리 숫자로 계산되며, 각 자리는 선택자의 종류에 따라 결정됩니다:

```css
/* 명시도 계산 예시 */
* { }                    /* 0,0,0,0 */
li { }                   /* 0,0,0,1 */
li:first-line { }        /* 0,0,0,2 */
ul li { }                /* 0,0,0,2 */
ul ol+li { }             /* 0,0,0,3 */
h1 + *[rel=up] { }       /* 0,0,1,1 */
ul ol li.red { }         /* 0,0,1,3 */
li.red.level { }         /* 0,0,2,1 */
#x34y { }                /* 0,1,0,0 */
style="" { }             /* 1,0,0,0 */
```

각 자리의 의미는 다음과 같습니다:
- 천의 자리: 인라인 스타일
- 백의 자리: ID 선택자 개수
- 십의 자리: 클래스, 속성, 가상클래스 선택자 개수
- 일의 자리: 요소, 가상요소 선택자 개수

### 2. 우선순위 규칙과 실제 적용

명시도가 높은 순서대로 스타일이 적용되며, 동일한 명시도인 경우 나중에 선언된 스타일이 우선됩니다:

```html
<div id="container" class="main highlighted">
  <p class="text">Hello World</p>
</div>
```

```css
/* 명시도: 0,0,0,1 */
p { color: black; }

/* 명시도: 0,0,1,0 */
.text { color: blue; }

/* 명시도: 0,0,1,1 */
div.main p { color: red; }

/* 명시도: 0,1,0,1 */
#container p { color: green; }

/* 명시도: 0,1,1,1 */
#container .text { color: purple; }
```

위 예시에서 `<p>` 요소는 가장 높은 명시도를 가진 `#container .text` 규칙에 따라 보라색으로 표시됩니다.

### 3. !important와 예외 상황

`!important` 선언은 일반적인 명시도 규칙을 무시하고 최고 우선순위를 가집니다:

```css
.text { 
  color: blue !important; 
}

#container .text { 
  color: red; /* !important가 없으므로 적용되지 않음 */
}

/* 여러 !important가 충돌하는 경우 */
.text { color: green !important; }     /* 0,0,1,0 + !important */
#main .text { color: orange !important; } /* 0,1,1,0 + !important - 이것이 적용됨 */
```

### 4. 실무에서의 명시도 관리

명시도를 효율적으로 관리하는 방법들:

```css
/* BEM 방법론 활용 */
.card { }
.card__title { }
.card__content { }
.card--featured { }

/* 낮은 명시도로 시작하여 필요시 점진적 증가 */
.button { background: blue; }
.sidebar .button { background: gray; }
.modal .sidebar .button { background: red; }

/* CSS 커스텀 속성으로 유연성 확보 */
.theme-dark {
  --text-color: white;
  --bg-color: black;
}

.content {
  color: var(--text-color, black);
  background: var(--bg-color, white);
}
```

## 정리

| 구분 | 명시도 가중치 | 예시 | 실무 활용 팁 |
|------|--------------|------|-------------|
| 인라인 스타일 | 1,0,0,0 | `style="color: red"` | 가급적 사용 금지 |
| ID 선택자 | 0,1,0,0 | `#header` | 레이아웃 컨테이너에만 제한적 사용 |
| 클래스/속성/가상클래스 | 0,0,1,0 | `.nav`, `[type="text"]`, `:hover` | 주요 스타일링 방법 |
| 요소/가상요소 | 0,0,0,1 | `div`, `::before` | 기본 스타일 정의 |
| !important | 최고 우선순위 | `color: red !important` | 최후의 수단으로만 사용 |

**핵심 원칙:**
- 낮은 명시도부터 시작하여 필요시 단계적으로 증가
- BEM 등의 방법론으로 일관된 명명 규칙 유지
- !important는 최소한으로 사용하고 문서화
- 브라우저 개발자 도구로 명시도 충돌 상황 디버깅