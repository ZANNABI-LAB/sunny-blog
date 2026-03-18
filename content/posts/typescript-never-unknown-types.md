---
title: "TypeScript의 never와 unknown 타입"
shortTitle: "never unknown 타입"
date: "2026-03-18"
tags: ["typescript", "type-system", "frontend", "type-safety", "javascript"]
category: "Frontend"
summary: "TypeScript의 never와 unknown 타입의 특징과 활용 방법을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/222"
references: ["https://www.typescriptlang.org/docs/handbook/2/narrowing.html", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error", "https://www.typescriptlang.org/docs/handbook/basic-types.html"]
---

## never와 unknown 타입이란?

TypeScript는 정적 타입 검사를 통해 JavaScript의 런타임 에러를 줄이는 언어입니다. 이 과정에서 특수한 상황을 나타내는 두 가지 타입이 있습니다. `never`는 절대 발생할 수 없는 값을 나타내며, `unknown`은 타입을 알 수 없는 값을 안전하게 다루기 위한 타입입니다.

이 두 타입은 TypeScript 타입 시스템의 양 극단에 위치합니다. `never`는 "bottom type"으로 모든 타입의 하위 타입이며, `unknown`은 "top type"으로 모든 타입의 상위 타입입니다. 이러한 특성을 이해하면 더 안전하고 표현력 있는 코드를 작성할 수 있습니다.

## 핵심 개념

### 1. never 타입의 활용

`never` 타입은 절대 발생할 수 없는 값을 나타냅니다. 주로 예외를 던지는 함수나 무한 루프를 도는 함수의 반환 타입으로 사용됩니다.

```typescript
// 예외를 던지는 함수
function throwError(message: string): never {
    throw new Error(message);
}

// 무한 루프 함수
function infiniteLoop(): never {
    while (true) {
        // 무한 루프
    }
}

// exhaustive check를 위한 활용
type Status = 'pending' | 'success' | 'error';

function handleStatus(status: Status) {
    switch (status) {
        case 'pending':
            return '대기중';
        case 'success':
            return '성공';
        case 'error':
            return '에러';
        default:
            // 모든 케이스가 처리되었음을 보장
            const exhaustiveCheck: never = status;
            return exhaustiveCheck;
    }
}
```

### 2. unknown 타입의 안전한 사용

`unknown` 타입은 `any`보다 안전한 대안으로, 타입을 좁혀야만 사용할 수 있습니다. 외부 API 응답이나 동적 콘텐츠를 다룰 때 유용합니다.

```typescript
// API 응답 처리
async function fetchData(): Promise<unknown> {
    const response = await fetch('/api/data');
    return response.json();
}

// 타입 가드를 사용한 안전한 처리
function processApiData(data: unknown) {
    if (typeof data === 'object' && data !== null) {
        if ('name' in data && typeof data.name === 'string') {
            console.log(`이름: ${data.name}`);
        }
        if ('age' in data && typeof data.age === 'number') {
            console.log(`나이: ${data.age}`);
        }
    }
}

// 사용자 정의 타입 가드
function isUser(value: unknown): value is { name: string; age: number } {
    return (
        typeof value === 'object' &&
        value !== null &&
        'name' in value &&
        'age' in value &&
        typeof (value as any).name === 'string' &&
        typeof (value as any).age === 'number'
    );
}

function handleUserData(data: unknown) {
    if (isUser(data)) {
        // 여기서 data는 { name: string; age: number } 타입
        console.log(`사용자: ${data.name}, ${data.age}세`);
    }
}
```

### 3. void와 never의 차이점

`void`와 `never`는 모두 반환 타입으로 사용되지만, 의미가 다릅니다.

```typescript
// void: 값을 반환하지 않지만 정상적으로 종료
function logMessage(message: string): void {
    console.log(message);
    // 암시적으로 undefined 반환
}

// never: 절대 정상적으로 반환되지 않음
function panic(message: string): never {
    throw new Error(message);
    // 이 지점에 도달하지 않음
}

// 실제 사용 예시
function processValue(value: string | null): string {
    if (value === null) {
        panic('값이 null입니다'); // never 반환
        // 여기서 TypeScript는 이후 코드가 실행되지 않음을 알음
    }
    
    return value.toUpperCase(); // string 타입으로 안전하게 처리
}
```

### 4. 실제 프로젝트에서의 활용

실제 프로젝트에서 이 타입들을 어떻게 활용할 수 있는지 살펴보겠습니다.

```typescript
// Redux 액션 타입 체크
type Action = 
    | { type: 'INCREMENT'; payload: number }
    | { type: 'DECREMENT'; payload: number }
    | { type: 'RESET' };

function reducer(state: number, action: Action): number {
    switch (action.type) {
        case 'INCREMENT':
            return state + action.payload;
        case 'DECREMENT':
            return state - action.payload;
        case 'RESET':
            return 0;
        default:
            // 새로운 액션 타입이 추가되면 컴파일 에러 발생
            const exhaustiveCheck: never = action;
            throw new Error(`처리되지 않은 액션: ${exhaustiveCheck}`);
    }
}

// 외부 라이브러리 응답 처리
interface ApiResponse<T> {
    success: boolean;
    data: T | unknown;
    error?: string;
}

function handleApiResponse<T>(response: ApiResponse<T>, validator: (data: unknown) => data is T): T {
    if (!response.success) {
        // never를 반환하는 함수 호출
        throw new Error(response.error || '알 수 없는 오류');
    }
    
    if (validator(response.data)) {
        return response.data;
    }
    
    throw new Error('응답 데이터 형식이 올바르지 않습니다');
}
```

## 정리

| 타입 | 의미 | 특징 | 주요 용도 |
|------|------|------|----------|
| `never` | 절대 발생하지 않는 값 | Bottom type, 모든 타입의 하위 타입 | 예외 발생 함수, exhaustive check |
| `unknown` | 알 수 없는 타입의 값 | Top type, 타입 좁히기 필수 | 외부 API 응답, 동적 콘텐츠 |

**핵심 포인트:**
- `never`는 도달할 수 없는 코드나 완전성 검사에 활용합니다
- `unknown`은 `any` 대신 사용하여 타입 안전성을 높입니다
- 두 타입 모두 TypeScript의 정적 타입 검사를 강화하는 도구입니다
- 타입 가드와 함께 사용하면 더욱 안전한 코드를 작성할 수 있습니다