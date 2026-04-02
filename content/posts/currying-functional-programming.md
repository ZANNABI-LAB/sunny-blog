---
title: "커링(Currying): 함수형 프로그래밍의 핵심 패턴"
shortTitle: "커링 패턴"
date: "2026-04-02"
tags: ["currying", "functional-programming", "javascript", "typescript", "code-reusability"]
category: "Frontend"
summary: "여러 인자를 받는 함수를 단일 인자 함수들의 체인으로 변환하는 커링 기법과 실전 활용법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/266"
references: ["https://developer.mozilla.org/en-US/docs/Glossary/Currying", "https://javascript.info/currying-partials", "https://www.typescriptlang.org/docs/handbook/functions.html"]
---

## 커링이란?

커링(Currying)은 여러 개의 인자를 받는 함수를 단일 인자를 받는 함수들의 연속으로 변환하는 함수형 프로그래밍 기법입니다. 이름은 수학자 하스켈 커리(Haskell Curry)에서 따왔습니다.

일반적인 함수가 `add(a, b)`처럼 모든 인자를 한 번에 받는다면, 커링된 함수는 `add(a)(b)`처럼 인자를 하나씩 받아 새로운 함수를 반환합니다. 이를 통해 부분 적용(partial application)과 함수 재사용성을 크게 향상시킬 수 있습니다.

## 핵심 개념

### 1. 기본 커링 구현

가장 기본적인 커링 패턴은 클로저를 활용한 함수 체인입니다.

```typescript
// 일반 함수
function add(a: number, b: number): number {
  return a + b;
}

// 커링된 함수
function curriedAdd(a: number) {
  return function(b: number) {
    return a + b;
  };
}

// 화살표 함수로 더 간결하게
const curriedAddArrow = (a: number) => (b: number) => a + b;

// 사용법
const result1 = add(2, 3); // 5
const result2 = curriedAdd(2)(3); // 5

// 부분 적용
const addTwo = curriedAdd(2);
const result3 = addTwo(3); // 5
const result4 = addTwo(7); // 9
```

### 2. 실전 활용 - 배열 처리

커링은 고차 함수와 함께 사용할 때 진가를 발휘합니다.

```typescript
// 비교 조건을 커링으로 만들기
const isGreaterThan = (min: number) => (value: number) => value > min;
const isLessThan = (max: number) => (value: number) => value < max;
const multiply = (factor: number) => (value: number) => value * factor;

const numbers = [1, 5, 10, 15, 20, 25];

// 재사용 가능한 필터 함수들
const over10 = numbers.filter(isGreaterThan(10)); // [15, 20, 25]
const under15 = numbers.filter(isLessThan(15)); // [1, 5, 10]

// 재사용 가능한 변환 함수들
const doubled = numbers.map(multiply(2)); // [2, 10, 20, 30, 40, 50]
const tripled = numbers.map(multiply(3)); // [3, 15, 30, 45, 60, 75]
```

### 3. 함수 합성과 파이프라인

커링된 함수들은 함수 합성과 파이프라인 패턴에서 매우 유용합니다.

```typescript
// 유틸리티 함수들
const add = (a: number) => (b: number) => a + b;
const multiply = (a: number) => (b: number) => a * b;
const subtract = (a: number) => (b: number) => b - a;

// 파이프 함수 구현
const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T) =>
  fns.reduce((acc, fn) => fn(acc), value);

// 복합 연산 파이프라인
const calculate = pipe(
  add(10),        // x + 10
  multiply(2),    // (x + 10) * 2
  subtract(5)     // ((x + 10) * 2) - 5
);

console.log(calculate(3)); // ((3 + 10) * 2) - 5 = 21

// 문자열 처리 파이프라인
const trim = (str: string) => str.trim();
const toLowerCase = (str: string) => str.toLowerCase();
const addPrefix = (prefix: string) => (str: string) => `${prefix}${str}`;

const processText = pipe(
  trim,
  toLowerCase,
  addPrefix("processed: ")
);

console.log(processText("  HELLO WORLD  ")); // "processed: hello world"
```

### 4. 제네릭 커링 유틸리티

TypeScript에서는 제네릭을 활용하여 범용적인 커링 함수를 만들 수 있습니다.

```typescript
// 2개 인자 함수용 커링 유틸리티
function curry2<A, B, R>(fn: (a: A, b: B) => R) {
  return (a: A) => (b: B) => fn(a, b);
}

// 3개 인자 함수용 커링 유틸리티
function curry3<A, B, C, R>(fn: (a: A, b: B, c: C) => R) {
  return (a: A) => (b: B) => (c: C) => fn(a, b, c);
}

// 실제 사용
const normalAdd = (a: number, b: number) => a + b;
const normalFormat = (template: string, name: string, age: number) => 
  template.replace('{name}', name).replace('{age}', age.toString());

const curriedAdd = curry2(normalAdd);
const curriedFormat = curry3(normalFormat);

// 부분 적용으로 재사용 가능한 함수 생성
const addFive = curriedAdd(5);
const userTemplate = curriedFormat("Hello {name}, you are {age} years old");
const greetUser = userTemplate("Alice");

console.log(addFive(3)); // 8
console.log(greetUser(25)); // "Hello Alice, you are 25 years old"
```

## 정리

| 특징 | 설명 | 활용 사례 |
|------|------|-----------|
| **부분 적용** | 인자 일부만 미리 설정하여 새 함수 생성 | 설정 함수, 검증 함수 |
| **함수 합성** | 단일 인자 함수들을 조합하여 복잡한 로직 구성 | 데이터 변환 파이프라인 |
| **재사용성** | 공통 로직을 커링으로 추상화하여 재사용 | 필터링, 정렬, 포맷팅 |
| **가독성** | 함수의 의도를 명확하게 표현 | 비즈니스 로직 구현 |

**주의사항**
- 과도한 커링은 오히려 코드 복잡성을 증가시킬 수 있습니다
- 디버깅 시 함수 체인 추적이 어려울 수 있습니다
- 런타임 오버헤드가 발생할 수 있으므로 성능이 중요한 부분에서는 신중하게 사용해야 합니다