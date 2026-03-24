---
title: "JavaScript 메모리 누수 발생 원인과 해결 방법"
shortTitle: "메모리 누수 방지"
date: "2026-03-24"
tags: ["memory-leak", "javascript", "performance", "garbage-collection", "event-listener"]
category: "Frontend"
summary: "JavaScript에서 메모리 누수가 발생하는 주요 원인들과 예방 방법을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/239"
references: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management", "https://web.dev/articles/memory-leaks-web", "https://developer.chrome.com/docs/devtools/memory-problems/"]
---

## JavaScript 메모리 누수란?

메모리 누수(Memory Leak)는 더 이상 사용하지 않는 메모리가 가비지 컬렉션되지 않고 계속 점유되는 현상입니다. JavaScript는 자동 메모리 관리를 제공하지만, 개발자가 의도치 않게 참조를 유지하면 메모리 누수가 발생할 수 있습니다.

웹 애플리케이션에서 메모리 누수는 페이지 성능 저하, 브라우저 응답성 감소, 심지어 탭 크래시까지 유발할 수 있습니다. 특히 SPA(Single Page Application)에서는 페이지 이동 시에도 메모리가 계속 누적되어 심각한 문제가 될 수 있습니다.

## 핵심 개념

### 1. 이벤트 리스너 미해제

가장 흔한 메모리 누수 원인 중 하나입니다. DOM 요소를 제거할 때 등록된 이벤트 리스너를 함께 제거하지 않으면 메모리 누수가 발생합니다.

```javascript
// 문제가 되는 코드
function createButton() {
  const button = document.createElement('button');
  const data = new Array(1000000).fill('memory-heavy-data');
  
  button.addEventListener('click', () => {
    console.log(data.length); // data에 대한 참조 유지
  });
  
  document.body.appendChild(button);
  
  // 버튼 제거 시 이벤트 리스너가 남아있음
  setTimeout(() => {
    document.body.removeChild(button); // 메모리 누수 발생
  }, 5000);
}

// 올바른 해결책
function createButtonCorrect() {
  const button = document.createElement('button');
  const data = new Array(1000000).fill('memory-heavy-data');
  
  const clickHandler = () => {
    console.log(data.length);
  };
  
  button.addEventListener('click', clickHandler);
  document.body.appendChild(button);
  
  setTimeout(() => {
    button.removeEventListener('click', clickHandler); // 리스너 제거
    document.body.removeChild(button);
  }, 5000);
}
```

### 2. 클로저로 인한 참조 유지

클로저는 외부 스코프의 변수를 참조할 수 있지만, 잘못 사용하면 불필요한 메모리를 계속 점유하게 됩니다.

```javascript
// 문제가 되는 코드
function createHandler() {
  const heavyData = new Array(1000000).fill('data');
  const element = document.getElementById('some-element');
  
  return function() {
    // heavyData를 직접 사용하지 않지만 클로저로 인해 참조 유지
    element.style.color = 'red';
  };
}

// 개선된 코드
function createHandlerCorrect() {
  const element = document.getElementById('some-element');
  
  // 필요한 데이터만 클로저에 포함
  return function() {
    element.style.color = 'red';
  };
}

// 또는 WeakMap 사용
const elementData = new WeakMap();

function createHandlerWithWeakMap() {
  const heavyData = new Array(1000000).fill('data');
  const element = document.getElementById('some-element');
  
  elementData.set(element, heavyData);
  
  return function() {
    const data = elementData.get(element);
    element.style.color = 'red';
  };
}
```

### 3. 전역 변수와 순환 참조

전역 변수나 순환 참조는 가비지 컬렉션을 방해하여 메모리 누수를 일으킵니다.

```javascript
// 문제가 되는 코드
let globalCache = {}; // 전역 변수로 인한 메모리 누수

function storeData(key, data) {
  globalCache[key] = data; // 계속 누적
}

// 순환 참조 예시
function createCircularReference() {
  const obj1 = {};
  const obj2 = {};
  
  obj1.ref = obj2;
  obj2.ref = obj1; // 순환 참조
  
  return obj1;
}

// 개선된 코드
class DataCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, data);
  }
  
  clear() {
    this.cache.clear();
  }
}

// WeakMap/WeakSet 사용으로 자동 정리
const weakCache = new WeakMap();

function storeDataCorrect(element, data) {
  weakCache.set(element, data); // element가 GC되면 자동 제거
}
```

### 4. 메모리 누수 감지와 디버깅

Chrome DevTools를 활용한 메모리 누수 감지 방법입니다.

```javascript
// Performance 측정 코드
class MemoryTracker {
  constructor() {
    this.measurements = [];
  }
  
  measureMemory(label) {
    if (performance.memory) {
      this.measurements.push({
        label,
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        timestamp: Date.now()
      });
    }
  }
  
  getMemoryTrend() {
    return this.measurements.map((m, i) => ({
      ...m,
      growth: i > 0 ? m.used - this.measurements[i-1].used : 0
    }));
  }
}

// 사용 예시
const tracker = new MemoryTracker();

function testMemoryLeakFunction() {
  tracker.measureMemory('before');
  
  // 메모리를 많이 사용하는 작업
  const data = new Array(100000).fill('test');
  
  tracker.measureMemory('after');
  
  console.table(tracker.getMemoryTrend());
}

// 정리 함수 패턴
class ComponentManager {
  constructor() {
    this.cleanup = [];
  }
  
  addEventListeners() {
    const handler = () => console.log('clicked');
    document.addEventListener('click', handler);
    
    // 정리 함수 등록
    this.cleanup.push(() => {
      document.removeEventListener('click', handler);
    });
  }
  
  destroy() {
    // 등록된 모든 정리 함수 실행
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];
  }
}
```

## 정리

JavaScript 메모리 누수 방지를 위한 핵심 원칙들을 정리하면 다음과 같습니다:

| 구분 | 문제 상황 | 해결 방법 |
|------|----------|-----------|
| **이벤트 리스너** | DOM 제거 시 리스너 미해제 | `removeEventListener()` 호출 |
| **클로저** | 불필요한 변수 참조 유지 | 필요한 데이터만 클로저에 포함 |
| **전역 변수** | 과도한 전역 데이터 저장 | 지역 스코프 활용, 정리 로직 구현 |
| **순환 참조** | 객체 간 상호 참조 | `WeakMap`, `WeakSet` 활용 |
| **디버깅** | 메모리 누수 감지 어려움 | Chrome DevTools Memory 탭 활용 |

**핵심 실천 사항**
- 컴포넌트 언마운트 시 정리 로직 구현
- `WeakMap`과 `WeakSet` 적극 활용
- Chrome DevTools로 정기적인 메모리 프로파일링
- 이벤트 리스너는 항상 쌍으로 등록/해제
- 전역 변수 사용 최소화 및 적절한 생명주기 관리