---
title: "TypeScript infer 키워드: 타입 추론의 핵심"
shortTitle: "infer 키워드"
date: "2026-03-09"
tags: ["typescript", "type-inference", "conditional-types", "advanced-types", "frontend"]
category: "Frontend"
summary: "TypeScript의 infer 키워드를 활용한 조건부 타입에서의 타입 추론 기법을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/198"
references: ["https://www.typescriptlang.org/docs/handbook/2/conditional-types.html", "https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md"]
---

## TypeScript infer 키워드란?

TypeScript의 `infer` 키워드는 조건부 타입(Conditional Types)에서 특정 타입을 추론하는 데 사용되는 강력한 도구입니다. 직접 타입을 지정하는 대신, TypeScript 컴파일러가 문맥에 따라 타입을 자동으로 유추할 수 있도록 돕는 역할을 합니다.

`infer`는 반드시 `extends` 키워드와 함께 조건부 타입 안에서만 사용할 수 있습니다. 이를 통해 복잡한 타입을 분해하고, 필요한 부분만 추출하여 새로운 유틸리티 타입을 만들 수 있습니다. 특히 함수의 반환 타입, 매개변수 타입, 배열의 요소 타입 등을 추출하는 데 매우 유용합니다.

## 핵심 개념

### 1. 기본 문법과 동작 원리

`infer` 키워드는 조건부 타입의 `extends` 절에서 사용되며, 추론할 타입에 대한 플레이스홀더 역할을 합니다.

```typescript
type BasicInfer<T> = T extends infer U ? U : never;

// 기본적인 함수 반환 타입 추출
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type StringReturn = GetReturnType<() => string>; // string
type NumberReturn = GetReturnType<(x: number) => number>; // number
type VoidReturn = GetReturnType<() => void>; // void
```

### 2. 함수 타입에서의 활용

함수의 매개변수와 반환 타입을 추출하는 것은 `infer`의 가장 일반적인 사용 사례입니다.

```typescript
// 첫 번째 매개변수 타입 추출
type GetFirstParam<T> = T extends (first: infer P, ...rest: any[]) => any ? P : never;

// 모든 매개변수 타입 추출
type GetParameters<T> = T extends (...args: infer P) => any ? P : never;

// 실제 사용 예시
type ExampleFunc = (name: string, age: number, active: boolean) => User;

type FirstParam = GetFirstParam<ExampleFunc>; // string
type AllParams = GetParameters<ExampleFunc>; // [string, number, boolean]
```

### 3. 배열과 객체 타입 추론

`infer`는 배열의 요소 타입이나 객체의 프로퍼티 타입을 추출하는 데도 활용됩니다.

```typescript
// 배열 요소 타입 추출
type ArrayElement<T> = T extends (infer U)[] ? U : never;
type StringArray = ArrayElement<string[]>; // string

// Promise 내부 타입 추출
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type ResolvedType = UnwrapPromise<Promise<User>>; // User

// 객체의 값 타입 추출
type ObjectValues<T> = T extends { [key: string]: infer V } ? V : never;
type ConfigValue = ObjectValues<{ api: string; port: number }>; // string | number
```

### 4. 고급 패턴과 실전 활용

여러 개의 `infer`를 조합하거나 중첩된 구조에서 타입을 추출할 수 있습니다.

```typescript
// 함수 체인에서 마지막 반환 타입 추출
type GetFinalReturnType<T> = T extends (...args: any[]) => infer R
  ? R extends (...args: any[]) => infer S
    ? GetFinalReturnType<R>
    : R
  : never;

// 튜플의 첫 번째와 나머지 분리
type Head<T> = T extends [infer H, ...any[]] ? H : never;
type Tail<T> = T extends [any, ...infer T] ? T : never;

type Numbers = [1, 2, 3, 4];
type First = Head<Numbers>; // 1
type Rest = Tail<Numbers>; // [2, 3, 4]

// 재귀적 타입 변환
type Flatten<T> = T extends (infer U)[]
  ? U extends any[]
    ? Flatten<U>
    : U
  : T;

type Nested = [[string, number], [boolean]];
type Flattened = Flatten<Nested>; // string | number | boolean
```

## 정리

| 특징 | 설명 | 예시 |
|------|------|------|
| **사용 위치** | 조건부 타입의 extends 절에서만 사용 | `T extends infer U ? U : never` |
| **주요 용도** | 함수 반환/매개변수, 배열 요소, Promise 내부 타입 추출 | `GetReturnType<T>`, `ArrayElement<T>` |
| **추론 방식** | TypeScript 컴파일러가 문맥에 따라 자동 추론 | 함수 시그니처에서 반환 타입 자동 감지 |
| **활용 범위** | 유틸리티 타입 제작, 타입 변환, 제네릭 제약 조건 | `UnwrapPromise<T>`, `Flatten<T>` |

`infer` 키워드는 TypeScript의 타입 시스템을 최대한 활용하여 타입 안전성을 보장하면서도 유연한 코드를 작성할 수 있게 해주는 핵심 기능입니다. 특히 라이브러리나 프레임워크에서 복잡한 타입 추론이 필요한 경우 필수적인 도구로 활용됩니다.