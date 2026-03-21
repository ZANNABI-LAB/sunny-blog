---
title: "TypeScript satisfies 키워드로 타입 안전성 확보하기"
shortTitle: "satisfies 키워드"
date: "2026-03-21"
tags: ["typescript", "type-safety", "satisfies", "type-inference", "frontend"]
category: "Frontend"
summary: "TypeScript satisfies 키워드를 통해 기존 타입 정보를 유지하면서 타입 조건을 검사하는 방법을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/231"
references: ["https://www.typescriptlang.org/docs/handbook/2/narrowing.html", "https://devblogs.microsoft.com/typescript/announcing-typescript-4-9/"]
---

## satisfies 키워드란?

TypeScript 4.9에서 도입된 `satisfies` 키워드는 기존 타입 정보를 유지하면서 해당 값이 특정 타입 조건을 충족하는지 확인할 때 사용됩니다. 전통적인 타입 어노테이션과 달리, `satisfies`는 값의 구체적인 타입을 보존하면서도 타입 안전성을 보장합니다.

이는 특히 유니온 타입을 다룰 때 타입이 의도보다 넓게 추론되는 문제를 해결하며, 더 정확한 타입 추론을 가능하게 합니다. 코드의 타입 안전성을 높이면서도 TypeScript 컴파일러의 강력한 추론 능력을 활용할 수 있습니다.

## 핵심 개념

### 1. 기존 타입 어노테이션의 한계

전통적인 타입 어노테이션은 값의 타입을 특정 타입으로 제한하지만, 때로는 타입이 필요 이상으로 넓게 추론됩니다.

```typescript
type Color = "red" | "green" | "blue";
type RGB = [red: number, green: number, blue: number];

const palette: Record<Color, string | RGB> = {
    red: [255, 0, 0],
    green: "#00ff00",
    blue: [0, 0, 255]
};

// ❌ 타입 오류: string | RGB에는 toUpperCase가 없음
const greenNormalized = palette.green.toUpperCase();
```

위 예제에서 `palette.green`의 타입은 `string | RGB`로 추론되어, 실제로는 문자열임에도 불구하고 `toUpperCase()` 메서드 호출이 불가능합니다.

### 2. satisfies로 해결하기

`satisfies` 키워드를 사용하면 타입 검사는 수행하되 구체적인 타입 정보를 유지할 수 있습니다.

```typescript
const palette = {
    red: [255, 0, 0],
    green: "#00ff00",
    blue: [0, 0, 255]
} satisfies Record<Color, string | RGB>;

// ✅ 정상 동작: palette.green의 타입이 string으로 추론
const greenNormalized = palette.green.toUpperCase();

// ✅ 정상 동작: palette.red의 타입이 [number, number, number]으로 추론
const redValue = palette.red[0];
```

`satisfies`를 사용하면 각 프로퍼티의 구체적인 타입이 유지되어 타입 안전한 메서드 호출이 가능합니다.

### 3. 객체 리터럴 확장성

`satisfies`는 객체가 필수 타입을 만족하면서도 추가 프로퍼티를 허용하는 상황에서도 유용합니다.

```typescript
interface Config {
    apiUrl: string;
    timeout: number;
}

const appConfig = {
    apiUrl: "https://api.example.com",
    timeout: 5000,
    debugMode: true, // 추가 프로퍼티
    retryCount: 3    // 추가 프로퍼티
} satisfies Config;

// ✅ 추가 프로퍼티에도 접근 가능
console.log(appConfig.debugMode);

// ✅ 필수 프로퍼티 타입 검사도 수행
console.log(appConfig.apiUrl.toUpperCase());
```

### 4. as const와 함께 사용

`satisfies`를 `as const`와 결합하면 리터럴 타입의 정확성을 더욱 높일 수 있습니다.

```typescript
const themes = {
    light: {
        primary: "#007bff",
        secondary: "#6c757d"
    },
    dark: {
        primary: "#0056b3",
        secondary: "#495057"
    }
} as const satisfies Record<string, Record<string, string>>;

// ✅ 정확한 리터럴 타입: "#007bff"
type PrimaryColor = typeof themes.light.primary;

// ✅ 모든 테마 키에 대한 유니온: "light" | "dark"
type ThemeNames = keyof typeof themes;
```

## 정리

| 특징 | 타입 어노테이션 | satisfies |
|------|----------------|-----------|
| 타입 검사 | ✅ | ✅ |
| 구체적 타입 유지 | ❌ | ✅ |
| 추가 프로퍼티 허용 | ❌ | ✅ |
| 타입 추론 정확성 | 보통 | 높음 |

**satisfies를 사용해야 하는 경우:**
- 유니온 타입에서 구체적인 타입 정보가 필요한 경우
- 객체가 특정 인터페이스를 만족하되 추가 프로퍼티도 가져야 하는 경우
- 타입 안전성과 타입 추론의 정확성을 모두 확보하고 싶은 경우

`satisfies` 키워드는 TypeScript의 타입 시스템을 더욱 유연하고 강력하게 만들어주는 도구입니다.