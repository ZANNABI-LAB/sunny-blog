---
title: "JavaScript 이벤트 루프와 Promise 실행 순서"
shortTitle: "이벤트 루프"
date: "2026-03-16"
tags: ["event-loop", "promise", "async", "microtask", "macrotask"]
category: "Frontend"
summary: "JavaScript의 이벤트 루프 동작 원리와 Promise, setTimeout의 실행 순서를 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/214"
references: ["https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide", "https://javascript.info/event-loop", "https://web.dev/articles/javascript-this"]
---

## JavaScript 이벤트 루프란?

JavaScript는 싱글 스레드 언어지만 비동기 작업을 효율적으로 처리할 수 있습니다. 이는 이벤트 루프(Event Loop)가 있기 때문입니다. 이벤트 루프는 콜 스택, 태스크 큐, 마이크로태스크 큐를 관리하여 비동기 코드의 실행 순서를 결정합니다.

특히 Promise와 setTimeout이 함께 사용될 때 실행 순서를 예측하기 어려울 수 있습니다. 이는 마이크로태스크와 매크로태스크의 우선순위 차이 때문입니다.

## 핵심 개념

### 1. 태스크 큐의 종류와 우선순위

JavaScript는 두 가지 주요 태스크 큐를 가지고 있습니다:

```typescript
// 마이크로태스크 (높은 우선순위)
Promise.resolve().then(() => console.log('마이크로태스크'));
queueMicrotask(() => console.log('마이크로태스크 2'));

// 매크로태스크 (낮은 우선순위)
setTimeout(() => console.log('매크로태스크'), 0);
setInterval(() => console.log('매크로태스크 2'), 1000);
```

마이크로태스크는 매크로태스크보다 항상 먼저 실행됩니다. 이는 이벤트 루프가 매크로태스크를 하나 처리한 후, 마이크로태스크 큐가 완전히 비워질 때까지 모든 마이크로태스크를 처리하기 때문입니다.

### 2. 이벤트 루프의 실행 과정

이벤트 루프는 다음과 같은 순서로 작업을 처리합니다:

```typescript
// 실행 과정 예시
console.log('1. 동기 코드'); // 즉시 실행

Promise.resolve().then(() => {
  console.log('3. 마이크로태스크'); // 동기 코드 후 실행
});

setTimeout(() => {
  console.log('4. 매크로태스크'); // 마이크로태스크 후 실행
}, 0);

console.log('2. 동기 코드'); // 즉시 실행
```

1. **동기 코드 실행**: 콜 스택의 모든 동기 코드를 순차 처리
2. **마이크로태스크 처리**: 마이크로태스크 큐가 비워질 때까지 모든 작업 실행
3. **매크로태스크 처리**: 매크로태스크 큐에서 하나의 작업만 처리
4. **반복**: 1번 단계로 돌아가 과정 반복

### 3. 복합 비동기 코드의 실행 분석

실제 복잡한 비동기 코드의 실행 순서를 단계별로 분석해보겠습니다:

```typescript
setTimeout(() => {
    console.log('1')
    setTimeout(() => { console.log('2') })
    Promise.resolve().then(() => console.log('3'))
    console.log('4')
})

Promise.resolve().then(() => {
    console.log('5')
    setTimeout(() => { console.log('6') })
    Promise.resolve().then(() => console.log('7'))
    console.log('8')
})

console.log('9')
```

**실행 순서 분석:**
1. `console.log('9')` - 전역 동기 코드 (출력: 9)
2. 전역 Promise.then() 실행 - 마이크로태스크 (출력: 5, 8)
3. 중첩된 Promise.then() 실행 - 마이크로태스크 (출력: 7)
4. 첫 번째 setTimeout() 실행 - 매크로태스크 (출력: 1, 4)
5. setTimeout() 내부 Promise.then() 실행 - 마이크로태스크 (출력: 3)
6. 나머지 setTimeout() 실행 - 매크로태스크 (출력: 6, 2)

**최종 출력**: 9 → 5 → 8 → 7 → 1 → 4 → 3 → 6 → 2

### 4. 실무에서의 활용

이벤트 루프 이해는 다음과 같은 상황에서 중요합니다:

```typescript
// 상태 업데이트 후 DOM 조작
function updateUI() {
  setState(newValue);
  
  // DOM 업데이트를 보장하기 위해 마이크로태스크 사용
  Promise.resolve().then(() => {
    // DOM이 업데이트된 후 실행됨
    const element = document.getElementById('updated-element');
    element.scrollIntoView();
  });
}

// 무거운 작업을 청크 단위로 분할
function processLargeData(data: any[], callback: Function) {
  const chunks = chunkArray(data, 1000);
  
  function processChunk(index: number) {
    if (index >= chunks.length) {
      callback();
      return;
    }
    
    // 현재 청크 처리
    processData(chunks[index]);
    
    // 다음 청크를 매크로태스크로 스케줄링
    setTimeout(() => processChunk(index + 1), 0);
  }
  
  processChunk(0);
}
```

## 정리

| 구분 | 우선순위 | 예시 | 특징 |
|------|----------|------|------|
| **동기 코드** | 최고 | `console.log()` | 즉시 실행 |
| **마이크로태스크** | 높음 | `Promise.then()`, `queueMicrotask()` | 매크로태스크보다 먼저 실행 |
| **매크로태스크** | 낮음 | `setTimeout()`, `setInterval()` | 한 번에 하나씩 실행 |

**핵심 원칙:**
- 동기 코드 → 모든 마이크로태스크 → 하나의 매크로태스크 순으로 실행
- 마이크로태스크 큐는 완전히 비워질 때까지 처리
- 매크로태스크는 한 번에 하나씩만 처리
- 각 매크로태스크 실행 후 마이크로태스크 큐 확인

이벤트 루프의 동작 원리를 이해하면 비동기 코드의 실행 순서를 정확히 예측할 수 있고, 성능 최적화와 사용자 경험 개선에 활용할 수 있습니다.