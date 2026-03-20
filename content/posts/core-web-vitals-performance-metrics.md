---
title: "Core Web Vitals: 웹 성능 최적화의 핵심 지표"
shortTitle: "Core Web Vitals"
date: "2026-03-20"
tags: ["web-performance", "core-web-vitals", "user-experience", "seo", "optimization"]
category: "Frontend"
summary: "구글이 제안한 웹사이트 사용자 경험 평가의 핵심 지표인 Core Web Vitals의 개념과 최적화 방법을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/226"
references: ["https://web.dev/vitals/", "https://developer.mozilla.org/en-US/docs/Web/Performance", "https://developers.google.com/search/docs/appearance/core-web-vitals"]
---

## Core Web Vitals란?

Core Web Vitals는 구글이 웹사이트의 사용자 경험을 평가하기 위해 제안한 핵심 성능 지표입니다. 이 지표들은 실제 사용자가 웹사이트를 이용할 때 경험하는 로딩 속도, 상호작용 반응성, 시각적 안정성을 측정합니다.

단순한 성능 지표를 넘어서, Core Web Vitals는 검색 엔진 최적화(SEO)에도 직접적인 영향을 미칩니다. 구글은 2021년부터 페이지 경험을 검색 순위 요소로 포함시켰으며, Core Web Vitals는 이 페이지 경험의 핵심 구성요소입니다. 따라서 프론트엔드 개발자에게는 필수적으로 이해하고 최적화해야 할 영역입니다.

현재 Core Web Vitals는 LCP(Largest Contentful Paint), INP(Interaction to Next Paint), CLS(Cumulative Layout Shift) 세 가지 지표로 구성됩니다.

## 핵심 개념

### 1. LCP (Largest Contentful Paint) - 로딩 성능

LCP는 페이지의 주요 콘텐츠가 사용자에게 표시되는 속도를 측정하는 지표입니다. 구체적으로는 뷰포트 내에서 가장 큰 텍스트 블록이나 이미지 요소가 렌더링 완료되는 시점을 측정합니다.

```javascript
// LCP 측정 예시
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'largest-contentful-paint') {
      console.log('LCP:', entry.startTime);
    }
  }
});

observer.observe({ type: 'largest-contentful-paint', buffered: true });
```

**최적화 방법:**
- 이미지 최적화: WebP 포맷 사용, 적절한 크기 설정
- 서버 응답 시간 개선: CDN 활용, 서버 성능 최적화
- 리소스 우선순위 설정: `<link rel="preload">` 활용
- 렌더링 차단 리소스 최소화: CSS, JavaScript 최적화

**성능 기준:** 2.5초 이하(우수), 4.0초 이하(개선 필요), 4.0초 초과(불량)

### 2. INP (Interaction to Next Paint) - 상호작용 반응성

INP는 사용자의 상호작용(클릭, 탭, 키 입력)에 대한 페이지의 전반적인 반응성을 측정합니다. 페이지 전체 생명주기 동안 발생하는 모든 상호작용의 지연 시간을 관찰하여, 가장 긴 지연 시간을 기준으로 평가합니다.

```javascript
// INP 측정 예시
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name === 'first-input') {
      const delay = entry.processingStart - entry.startTime;
      console.log('Input delay:', delay);
    }
  }
});

observer.observe({ type: 'first-input', buffered: true });
```

**최적화 방법:**
- JavaScript 실행 최적화: 긴 작업을 작은 단위로 분할
- 코드 스플리팅: 필요한 코드만 로드하여 메인 스레드 부담 감소
- Web Workers 활용: 백그라운드에서 무거운 작업 처리
- 이벤트 핸들러 최적화: 디바운싱, 스로틀링 적용

**성능 기준:** 200ms 이하(우수), 500ms 이하(개선 필요), 500ms 초과(불량)

### 3. CLS (Cumulative Layout Shift) - 시각적 안정성

CLS는 페이지 로딩 과정에서 예상치 못한 레이아웃 이동을 측정하는 지표입니다. 사용자가 콘텐츠를 읽거나 상호작용하려고 할 때, 갑작스러운 레이아웃 변경으로 인한 불편함을 정량화합니다.

```javascript
// CLS 측정 예시
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      console.log('Layout shift score:', entry.value);
    }
  }
});

observer.observe({ type: 'layout-shift', buffered: true });
```

**최적화 방법:**
- 이미지와 동영상에 명시적 크기 속성 설정
- 웹 폰트 최적화: `font-display: swap` 활용
- 동적 콘텐츠를 위한 공간 예약: 스켈레톤 UI 사용
- 광고나 임베드 콘텐츠를 위한 컨테이너 크기 고정

**성능 기준:** 0.1 이하(우수), 0.25 이하(개선 필요), 0.25 초과(불량)

### 4. 측정 및 모니터링 도구

Core Web Vitals는 다양한 도구로 측정할 수 있습니다:

```javascript
// Web Vitals 라이브러리 사용 예시
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

**주요 측정 도구:**
- PageSpeed Insights: 실제 사용자 데이터 기반 분석
- Chrome DevTools: 개발 과정에서의 실시간 측정
- Web Vitals Chrome Extension: 실시간 Core Web Vitals 모니터링
- Search Console: 웹사이트 전체의 Core Web Vitals 현황

## 정리

| 지표 | 측정 대상 | 우수 기준 | 주요 최적화 방법 |
|------|-----------|----------|------------------|
| **LCP** | 주요 콘텐츠 로딩 시간 | 2.5초 이하 | 이미지 최적화, 서버 응답 시간 개선 |
| **INP** | 상호작용 반응성 | 200ms 이하 | JavaScript 최적화, 코드 스플리팅 |
| **CLS** | 시각적 안정성 | 0.1 이하 | 명시적 크기 설정, 폰트 로딩 최적화 |

Core Web Vitals는 단순한 기술적 지표가 아닌, 실제 사용자 경험과 비즈니스 성과에 직결되는 중요한 메트릭입니다. 정기적인 측정과 지속적인 최적화를 통해 사용자에게 더 나은 웹 경험을 제공하고, 검색 엔진에서의 가시성도 개선할 수 있습니다.