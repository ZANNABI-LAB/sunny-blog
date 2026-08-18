---
title: "Chrome DevTools로 웹 성능 분석하기"
shortTitle: "DevTools 성능분석"
date: "2026-04-16"
tags: ["chrome-devtools", "web-performance", "performance-analysis", "frontend-optimization"]
category: "Frontend.Performance"
summary: "Chrome DevTools의 Performance, Lighthouse, Network 탭을 활용하여 웹 애플리케이션의 성능을 체계적으로 분석하는 방법을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/306"
references: ["https://developer.chrome.com/docs/devtools/performance/", "https://developers.google.com/web/tools/lighthouse", "https://web.dev/vitals/"]
---

## Chrome DevTools 성능 분석이란?

Chrome DevTools는 웹 애플리케이션의 성능을 종합적으로 분석할 수 있는 강력한 도구입니다. Performance, Lighthouse, Network, Memory, Coverage 탭을 통해 로딩 속도부터 런타임 성능, 메모리 사용량까지 다양한 측면의 성능 지표를 측정하고 개선점을 찾을 수 있습니다.

성능 분석은 사용자 경험 품질을 정량적으로 평가하고, 병목 지점을 식별하여 최적화 우선순위를 결정하는 데 필수적입니다. 특히 모바일 환경과 저사양 기기에서도 원활한 서비스를 제공하기 위해서는 체계적인 성능 모니터링이 반드시 필요합니다.

## 핵심 분석 영역

### 1. Performance 탭 - Core Web Vitals 측정

Performance 탭에서는 페이지 로딩과 런타임 성능을 시각적으로 분석할 수 있습니다. 주요 지표들을 확인해보겠습니다:

```javascript
// Performance Observer로 Core Web Vitals 측정
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    switch (entry.entryType) {
      case 'paint':
        console.log(`${entry.name}: ${entry.startTime}ms`);
        break;
      case 'largest-contentful-paint':
        console.log(`LCP: ${entry.startTime}ms`);
        break;
      case 'layout-shift':
        console.log(`CLS: ${entry.value}`);
        break;
    }
  });
});

observer.observe({
  entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift']
});
```

**핵심 지표 기준:**
- **FCP (First Contentful Paint)**: 1.8초 이하 권장
- **LCP (Largest Contentful Paint)**: 2.5초 이하 권장  
- **TTI (Time to Interactive)**: 3.8초 이하 권장
- **TBT (Total Blocking Time)**: 200ms 이하 권장
- **CLS (Cumulative Layout Shift)**: 0.1 이하 권장

### 2. Lighthouse 탭 - 종합 성능 진단

Lighthouse는 성능, 접근성, 모범 사례, SEO를 종합적으로 평가합니다:

```javascript
// Lighthouse CI 설정 예시
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', {minScore: 0.9}],
        'categories:accessibility': ['error', {minScore: 0.9}]
      }
    }
  }
};
```

Lighthouse는 각 영역별로 0-100점 스코어를 제공하며, 개선 제안사항과 함께 구체적인 최적화 방향을 제시합니다.

### 3. Network 탭 - 리소스 로딩 최적화

Network 탭에서는 각 리소스의 다운로드 성능을 분석합니다:

```javascript
// Resource Hints로 중요 리소스 우선 로딩
// HTML head 섹션에 추가
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/hero-image.webp" as="image">
<link rel="prefetch" href="/next-page.js">

// 이미지 최적화
<img 
  src="/image.webp" 
  alt="description"
  loading="lazy"
  decoding="async"
  width="800" 
  height="600"
>
```

**주요 확인 사항:**
- **TTFB (Time to First Byte)**: 서버 응답 시간
- **리소스 크기**: 불필요하게 큰 파일 식별
- **압축**: gzip/brotli 적용 여부
- **캐싱**: 적절한 Cache-Control 헤더 설정

### 4. Memory 및 Coverage 탭 - 리소스 효율성

Memory 탭으로 메모리 누수를 진단하고, Coverage 탭으로 불필요한 코드를 식별합니다:

```javascript
// 메모리 누수 방지 패턴
class ComponentManager {
  constructor() {
    this.listeners = new WeakMap();
    this.observers = new Set();
  }
  
  addListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.listeners.set(element, { event, handler });
  }
  
  cleanup() {
    // 이벤트 리스너 정리
    this.listeners.forEach((config, element) => {
      element.removeEventListener(config.event, config.handler);
    });
    
    // Observer 정리
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Code Splitting으로 번들 최적화
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

## 정리

Chrome DevTools의 성능 분석은 다음과 같이 체계적으로 진행합니다:

| 탭 | 주요 지표 | 최적화 목표 |
|---|---|---|
| **Performance** | FCP, LCP, TTI, TBT, CLS | Core Web Vitals 기준 달성 |
| **Lighthouse** | 종합 점수 (0-100) | 각 영역 90점 이상 |
| **Network** | TTFB, 리소스 크기, 캐싱 | 로딩 시간 단축 |
| **Memory** | Heap 사용량, Detached DOM | 메모리 누수 방지 |
| **Coverage** | 미사용 코드 비율 | 번들 크기 최적화 |

성능 분석은 일회성이 아닌 지속적인 모니터링이 중요하며, 사용자 환경을 고려한 다양한 조건에서 테스트해야 합니다. 특히 3G 네트워크와 저사양 기기에서의 성능 확인을 통해 모든 사용자에게 일관된 경험을 제공할 수 있습니다.