---
title: "JavaScript 이터러블 프로토콜"
shortTitle: "이터러블 프로토콜"
date: "2026-04-10"
tags: ["iterable", "iterator", "protocol", "javascript", "data-structure"]
category: "Frontend"
summary: "다양한 자료구조를 통일된 방식으로 순회할 수 있게 하는 JavaScript의 이터러블 프로토콜을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/286"
references: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols", "https://tc39.es/ecma262/#sec-iteration", "https://javascript.info/iterable"]
---

## 이터러블 프로토콜이란?

이터러블 프로토콜은 JavaScript에서 데이터를 순차적으로 순회할 수 있도록 정의한 표준 인터페이스입니다. 이 프로토콜을 통해 배열, 문자열, Set, Map 등 서로 다른 자료구조를 동일한 방식으로 순회할 수 있습니다.

ES6에서 도입된 이 프로토콜의 핵심 목적은 "순회 가능한 객체"의 공통 인터페이스를 제공하여 일관된 데이터 접근 방식을 보장하는 것입니다. 덕분에 개발자는 자료구조마다 다른 순회 방식을 학습하지 않아도 되며, `for...of`, 스프레드 연산자, `Array.from()` 등의 문법을 통일적으로 사용할 수 있습니다.

## 핵심 개념

### 1. 이터러블과 이터레이터의 구조

이터러블 프로토콜은 두 가지 핵심 개념으로 구성됩니다:

**이터러블 객체**: `Symbol.iterator` 메서드를 가진 객체입니다.

```typescript
interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}
```

**이터레이터 객체**: `next()` 메서드를 가지고 있으며, 호출 시 `{value, done}` 형태의 결과를 반환합니다.

```typescript
interface Iterator<T> {
  next(): IteratorResult<T>;
}

interface IteratorResult<T> {
  value: T;
  done: boolean;
}
```

### 2. 내장 이터러블 객체들

JavaScript의 여러 내장 객체들이 이터러블 프로토콜을 구현하고 있습니다:

```typescript
// 배열
const arr = [1, 2, 3];
for (const item of arr) {
  console.log(item); // 1, 2, 3
}

// 문자열
const str = "Hello";
for (const char of str) {
  console.log(char); // H, e, l, l, o
}

// Set
const set = new Set(['a', 'b', 'c']);
for (const value of set) {
  console.log(value); // a, b, c
}

// Map
const map = new Map([['key1', 'value1'], ['key2', 'value2']]);
for (const [key, value] of map) {
  console.log(key, value); // key1 value1, key2 value2
}
```

### 3. 커스텀 이터러블 구현

직접 이터러블 객체를 만들어 원하는 순회 로직을 구현할 수 있습니다:

```typescript
class NumberRange {
  constructor(private start: number, private end: number) {}

  [Symbol.iterator](): Iterator<number> {
    let current = this.start;
    const end = this.end;

    return {
      next(): IteratorResult<number> {
        if (current <= end) {
          return { value: current++, done: false };
        } else {
          return { value: undefined, done: true };
        }
      }
    };
  }
}

const range = new NumberRange(1, 5);
console.log([...range]); // [1, 2, 3, 4, 5]

for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}
```

### 4. 활용 패턴과 사례

이터러블 프로토콜을 활용하는 다양한 JavaScript 기능들:

```typescript
const iterable = [1, 2, 3];

// 스프레드 연산자
const copied = [...iterable];

// 구조 분해 할당
const [first, second] = iterable;

// Array.from()
const fromArray = Array.from(iterable);

// Promise.all()
const promises = iterable.map(x => Promise.resolve(x));
Promise.all(promises);

// 제너레이터와의 조합
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
console.log(fib.next().value); // 0
console.log(fib.next().value); // 1
```

## 정리

| 개념 | 설명 | 요구사항 |
|------|------|----------|
| **이터러블** | 순회 가능한 객체 | `Symbol.iterator` 메서드 구현 |
| **이터레이터** | 실제 순회를 담당하는 객체 | `next()` 메서드가 `{value, done}` 반환 |
| **활용 문법** | `for...of`, 스프레드 연산자, 구조분해 | 이터러블 프로토콜 준수 객체 |

**핵심 장점:**
- 다양한 자료구조의 **통일된 순회 인터페이스** 제공
- **지연 평가(lazy evaluation)** 가능 (제너레이터와 함께)
- **메모리 효율성** - 필요한 시점에만 값 생성
- **조합 가능성** - 다른 이터러블과 쉽게 연결 및 변환