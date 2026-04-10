---
title: "JavaScript 제네레이터 함수 완전 가이드"
shortTitle: "제네레이터 함수"
date: "2026-04-10"
tags: ["javascript", "generator", "iterator", "es6", "functional-programming"]
category: "Frontend"
summary: "함수 실행을 중단하고 재개할 수 있는 JavaScript 제네레이터 함수의 동작 원리와 활용법을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/287"
references: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator", "https://javascript.info/generators", "https://tc39.es/ecma262/#sec-generator-objects"]
---

## 제네레이터 함수란?

제네레이터 함수는 JavaScript ES6에서 도입된 특별한 함수로, 일반 함수와 달리 실행을 중단했다가 나중에 재개할 수 있는 기능을 제공합니다. `function*` 키워드로 정의하며, 내부에서 `yield` 키워드를 사용해 값을 순차적으로 반환합니다.

일반 함수는 호출되면 끝까지 실행되지만, 제네레이터 함수는 `yield` 지점에서 실행을 멈추고 제어권을 호출자에게 돌려줍니다. 이러한 특성 덕분에 메모리 효율적인 데이터 처리, 비동기 플로우 제어, 커스텀 이터레이터 구현 등에 활용됩니다.

## 핵심 개념

### 1. 기본 문법과 동작 방식

제네레이터 함수는 `function*` 키워드로 선언하며, 호출 시 제네레이터 객체를 반환합니다. 이 객체는 `next()` 메서드를 통해 순차적으로 값을 가져올 수 있습니다.

```javascript
function* numberGenerator() {
  console.log('제네레이터 시작');
  yield 1;
  console.log('첫 번째 yield 이후');
  yield 2;
  console.log('두 번째 yield 이후');
  yield 3;
  console.log('제네레이터 종료');
  return 'done';
}

const gen = numberGenerator();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: 'done', done: true }
```

### 2. 이터레이터 프로토콜과 이터러블

제네레이터 객체는 이터레이터 프로토콜과 이터러블 프로토콜을 모두 구현합니다. 이는 `for...of` 루프, 스프레드 연산자, 구조분해 할당 등에서 직접 사용할 수 있음을 의미합니다.

```javascript
function* fibonacciGenerator(limit) {
  let a = 0, b = 1;
  while (a <= limit) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// for...of로 순회
for (const num of fibonacciGenerator(20)) {
  console.log(num); // 0, 1, 1, 2, 3, 5, 8, 13
}

// 배열로 변환
const fibArray = [...fibonacciGenerator(10)]; // [0, 1, 1, 2, 3, 5, 8]

// 구조분해 할당
const [first, second, third] = fibonacciGenerator(100);
console.log(first, second, third); // 0, 1, 1
```

### 3. 양방향 통신과 yield 표현식

제네레이터는 `next()` 메서드에 값을 전달하여 `yield` 표현식의 결과로 사용할 수 있습니다. 이를 통해 외부에서 제네레이터의 실행 흐름에 영향을 줄 수 있습니다.

```javascript
function* interactiveGenerator() {
  const input1 = yield '첫 번째 값을 입력하세요';
  console.log(`받은 값: ${input1}`);
  
  const input2 = yield '두 번째 값을 입력하세요';
  console.log(`받은 값: ${input2}`);
  
  return input1 + input2;
}

const gen = interactiveGenerator();
console.log(gen.next().value); // '첫 번째 값을 입력하세요'
console.log(gen.next(10).value); // '두 번째 값을 입력하세요'
console.log(gen.next(20)); // { value: 30, done: true }
```

### 4. 실용적인 활용 사례

제네레이터는 대용량 데이터 처리, 비동기 작업 관리, 상태 머신 구현 등에 활용할 수 있습니다. 특히 지연 평가(Lazy Evaluation)를 통해 메모리 효율성을 높일 수 있습니다.

```javascript
// 조건부 필터링 제네레이터
function* filterValidData(data) {
  for (const item of data) {
    if (item && typeof item.id === 'number' && item.name) {
      yield item;
    }
  }
}

// 페이지네이션 데이터 처리
function* paginatedFetch(apiUrl, pageSize = 10) {
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = fetch(`${apiUrl}?page=${page}&size=${pageSize}`);
    const data = yield response; // 비동기 처리를 위해 Promise 반환
    
    if (data.length < pageSize) {
      hasMore = false;
    }
    page++;
  }
}

// 무한 시퀀스 생성
function* infiniteCounter(start = 0) {
  let current = start;
  while (true) {
    yield current++;
  }
}

const counter = infiniteCounter(100);
console.log(counter.next().value); // 100
console.log(counter.next().value); // 101
```

## 정리

| 특징 | 일반 함수 | 제네레이터 함수 |
|------|----------|----------------|
| 선언 방식 | `function name()` | `function* name()` |
| 실행 방식 | 한 번에 완료 | 단계별 실행 |
| 반환값 | 직접 값 반환 | 제네레이터 객체 반환 |
| 메모리 효율성 | 모든 데이터 한번에 처리 | 필요시점에 값 생성 |
| 제어 흐름 | 단방향 | 양방향 통신 가능 |

제네레이터 함수의 핵심 장점:
- **메모리 효율성**: 필요한 시점에만 값을 생성하는 지연 평가
- **실행 제어**: `yield`로 함수 실행을 중단하고 재개
- **양방향 통신**: `next()` 메서드를 통한 외부 값 전달
- **이터레이터 호환성**: 표준 순회 인터페이스와 완벽 호환