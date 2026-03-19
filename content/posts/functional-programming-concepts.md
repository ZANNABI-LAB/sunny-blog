---
title: "함수형 프로그래밍의 핵심 개념과 프론트엔드 적용"
shortTitle: "함수형 프로그래밍"
date: "2026-03-19"
tags: ["functional-programming", "javascript", "immutability", "pure-function"]
category: "Frontend"
summary: "순수 함수와 불변성을 기반으로 한 함수형 프로그래밍의 핵심 개념과 프론트엔드 개발에서의 실용적 적용 방법을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/224"
references: ["https://developer.mozilla.org/en-US/docs/Glossary/First-class_Function", "https://github.com/MostlyAdequate/mostly-adequate-guide"]
---

## 함수형 프로그래밍이란?

함수형 프로그래밍은 프로그래밍 패러다임 중 하나로, 순수 함수와 불변성을 강조하는 방식입니다. 어떻게(how) 구현할지보다는 무엇(what)을 해결할지에 집중하며, 함수를 일급 객체로 다루어 조합하는 형태로 코드를 작성합니다.

절차적 프로그래밍이 단계별 실행 과정을 명시한다면, 함수형 프로그래밍은 데이터 변환과 함수 조합을 통해 결과를 도출합니다. 특히 프론트엔드에서는 React의 함수형 컴포넌트, Redux의 리듀서, 배열 메서드 체이닝 등에서 함수형 개념을 광범위하게 활용합니다.

## 핵심 개념

### 1. 순수 함수 (Pure Function)

순수 함수는 동일한 입력에 대해 항상 동일한 결과를 반환하며, 외부 상태를 변경하지 않는 함수입니다. 부수 효과(side effect)가 없어 예측 가능하고 테스트하기 쉬운 특징을 가집니다.

```typescript
// 순수 함수
function add(a: number, b: number): number {
  return a + b;
}

function multiply(numbers: number[], factor: number): number[] {
  return numbers.map(num => num * factor);
}

// 순수하지 않은 함수 (외부 상태 변경)
let count = 0;
function impureIncrement(): number {
  count++; // 외부 상태 변경
  return count;
}

// 순수하지 않은 함수 (외부 의존성)
function getCurrentTime(): string {
  return new Date().toISOString(); // 시간에 따라 결과 변경
}
```

### 2. 불변성 (Immutability)

불변성은 데이터를 직접 수정하지 않고, 기존 데이터를 기반으로 새로운 데이터를 생성하는 원칙입니다. 이를 통해 상태 변경으로 인한 예상치 못한 버그를 방지할 수 있습니다.

```typescript
// 불변성을 지키는 배열 조작
const numbers = [1, 2, 3];

// 나쁜 예: 원본 배열 변경
numbers.push(4);

// 좋은 예: 새로운 배열 생성
const newNumbers = [...numbers, 4];
const filteredNumbers = numbers.filter(num => num > 1);
const mappedNumbers = numbers.map(num => num * 2);

// 객체 불변성
const user = { name: 'John', age: 30 };

// 나쁜 예: 원본 객체 변경
user.age = 31;

// 좋은 예: 새로운 객체 생성
const updatedUser = { ...user, age: 31 };
```

### 3. 고차 함수 (Higher-Order Function)

고차 함수는 다른 함수를 인자로 받거나 함수를 반환하는 함수입니다. JavaScript의 `map`, `filter`, `reduce` 같은 배열 메서드가 대표적인 고차 함수입니다.

```typescript
// 고차 함수 예제
function withLogging<T extends any[], R>(
  fn: (...args: T) => R
): (...args: T) => R {
  return (...args: T) => {
    console.log('함수 실행:', fn.name, '인자:', args);
    const result = fn(...args);
    console.log('실행 결과:', result);
    return result;
  };
}

const add = (a: number, b: number) => a + b;
const loggedAdd = withLogging(add);
loggedAdd(2, 3); // 로그와 함께 실행

// 함수 조합
const compose = <T, U, V>(f: (x: U) => V, g: (x: T) => U) => 
  (x: T) => f(g(x));

const addOne = (x: number) => x + 1;
const multiplyTwo = (x: number) => x * 2;
const addThenMultiply = compose(multiplyTwo, addOne);

console.log(addThenMultiply(3)); // (3 + 1) * 2 = 8
```

### 4. 선언적 프로그래밍

함수형 프로그래밍은 선언적 스타일을 추구합니다. 어떻게 해야 하는지보다 무엇을 원하는지를 명확히 표현합니다.

```typescript
const users = [
  { name: 'Alice', age: 25, active: true },
  { name: 'Bob', age: 30, active: false },
  { name: 'Charlie', age: 35, active: true }
];

// 명령형 스타일
function getActiveUserNamesImperative(users: typeof users): string[] {
  const result: string[] = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].active) {
      result.push(users[i].name);
    }
  }
  return result;
}

// 선언적 스타일 (함수형)
const getActiveUserNames = (users: typeof users): string[] =>
  users
    .filter(user => user.active)
    .map(user => user.name);

console.log(getActiveUserNames(users)); // ['Alice', 'Charlie']
```

## 정리

함수형 프로그래밍은 프론트엔드 개발에서 다음과 같은 이점을 제공합니다:

| 특징 | 장점 | 프론트엔드 적용 예 |
|------|------|-------------------|
| **순수 함수** | 예측 가능하고 테스트 용이 | React 함수형 컴포넌트, 유틸리티 함수 |
| **불변성** | 상태 관리 안전성, 디버깅 용이 | Redux 리듀서, useState 업데이트 |
| **고차 함수** | 코드 재사용성, 조합 가능 | HOC, 커스텀 훅, 배열 메서드 체이닝 |
| **선언적 스타일** | 가독성 향상, 유지보수성 | JSX, 조건부 렌더링, 리스트 렌더링 |

함수형 프로그래밍 원칙을 적용하면 더 안정적이고 유지보수하기 쉬운 프론트엔드 코드를 작성할 수 있습니다. 특히 React, Vue와 같은 현대 프론트엔드 프레임워크는 함수형 개념을 적극적으로 도입하여 개발자 경험을 향상시키고 있습니다.