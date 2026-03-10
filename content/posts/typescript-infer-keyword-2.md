---
title: "TypeScript infer 키워드: 조건부 타입에서 타입 추론하기"
shortTitle: "TypeScript infer"
date: "2026-03-10"
tags: ["typescript", "conditional-types", "type-inference", "generics"]
category: "Frontend"
summary: "TypeScript의 infer 키워드를 사용하여 조건부 타입에서 타입을 추론하는 방법을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/198"
references: ["https://www.typescriptlang.org/docs/handbook/2/conditional-types.html", "https://www.typescriptlang.org/docs/handbook/2/generics.html"]
---

## TypeScript infer 키워드란?

`infer` 키워드는 TypeScript의 조건부 타입(Conditional Types) 내에서 특정 타입을 추론하는 데 사용되는 기능입니다. 타입을 직접 지정하는 대신 TypeScript가 컨텍스트에서 해당 타입을 자동으로 유추할 수 있도록 돕습니다.

`infer`는 반드시 `extends`와 함께 조건부 타입 안에서만 사용할 수 있으며, 복잡한 타입을 분해하여 그 일부를 추출하거나 변환할 때 강력한 도구가 됩니다. 이를 통해 재사용 가능한 유틸리티 타입을 만들거나 기존 타입에서 필요한 정보만 추출할 수 있습니다.

## 핵심 개념

### 1. 기본 문법과 사용법

`infer` 키워드는 조건부 타입의 `extends` 절에서 사용되며, 추론하고자 하는 타입을 변수처럼 선언합니다.

```typescript
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 사용 예시
type StringFunction = () => string;
type NumberFunction = (x: number) => number;

type Result1 = GetReturnType<StringFunction>; // string
type Result2 = GetReturnType<NumberFunction>; // number
type Result3 = GetReturnType<string>; // never (함수가 아닌 경우)
```

위 예시에서 `infer R`은 함수의 반환 타입을 추론하여 `R`이라는 타입 변수에 저장합니다. 조건이 참이면 추론된 타입을 반환하고, 거짓이면 `never`를 반환합니다.

### 2. 배열과 튜플 타입 추론

`infer`는 배열이나 튜플에서 특정 요소의 타입을 추출할 때도 유용합니다.

```typescript
// 배열의 첫 번째 요소 타입 추출
type Head<T> = T extends readonly [infer H, ...any[]] ? H : never;

// 배열의 마지막 요소 타입 추출
type Tail<T> = T extends readonly [...any[], infer L] ? L : never;

// 배열 요소 타입 추출
type ElementType<T> = T extends (infer U)[] ? U : never;

// 사용 예시
type FirstElement = Head<[string, number, boolean]>; // string
type LastElement = Tail<[string, number, boolean]>; // boolean
type ArrayElement = ElementType<number[]>; // number
```

### 3. 객체 속성 타입 추론

객체나 클래스에서 특정 속성의 타입을 추론할 때도 `infer`를 활용할 수 있습니다.

```typescript
// Promise의 해결 값 타입 추출
type Awaited<T> = T extends Promise<infer U> ? U : T;

// 함수 매개변수 타입 추출
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// 객체의 특정 키 값 타입 추출
type ValueOf<T, K extends keyof T> = T extends { [Key in K]: infer V } ? V : never;

// 사용 예시
type PromiseValue = Awaited<Promise<string>>; // string
type FuncParams = Parameters<(a: string, b: number) => void>; // [string, number]

interface User {
  name: string;
  age: number;
}
type UserName = ValueOf<User, 'name'>; // string
```

### 4. 고급 패턴과 실무 활용

복잡한 타입 변환이나 유틸리티 타입 구현에서 `infer`를 조합하여 사용할 수 있습니다.

```typescript
// 중첩된 배열 평면화
type Flatten<T> = T extends readonly (infer U)[]
  ? U extends readonly any[]
    ? Flatten<U>
    : U
  : T;

// 함수 체이닝을 위한 타입
type ChainableFunction<T> = T extends (...args: infer P) => infer R
  ? (...args: P) => ChainableFunction<R>
  : never;

// 조건부 타입과 매핑된 타입 결합
type OptionalKeys<T> = {
  [K in keyof T]: T extends { [P in K]: infer U }
    ? undefined extends U
      ? K
      : never
    : never;
}[keyof T];

// 사용 예시
type NestedArray = [[[string]]];
type FlatType = Flatten<NestedArray>; // string

interface PartialUser {
  name: string;
  age?: number;
  email?: string;
}
type OptionalUserKeys = OptionalKeys<PartialUser>; // "age" | "email"
```

## 정리

| 특징 | 설명 | 예시 |
|------|------|------|
| **사용 위치** | 조건부 타입의 `extends` 절에서만 사용 | `T extends (...args: any[]) => infer R` |
| **주요 용도** | 타입 분해, 추출, 변환 | 함수 반환 타입, 배열 요소 타입 추출 |
| **추론 범위** | 함수, 배열, 객체, Promise 등 다양한 타입 | `Promise<infer U>`, `(infer T)[]` |
| **조건부 처리** | 추론 성공 시 해당 타입, 실패 시 대체 타입 반환 | `? InferredType : never` |
| **고급 활용** | 재귀적 타입 정의, 유틸리티 타입 구현 | 중첩 배열 평면화, 체이닝 타입 |

`infer` 키워드는 TypeScript의 타입 시스템을 최대한 활용하여 타입 안전성을 보장하면서도 유연한 코드를 작성할 수 있게 해주는 강력한 도구입니다. 조건부 타입과 함께 사용하여 복잡한 타입 로직을 구현할 수 있으며, 라이브러리나 프레임워크에서 제공하는 고급 타입들의 내부 구현을 이해하는 데도 도움이 됩니다.