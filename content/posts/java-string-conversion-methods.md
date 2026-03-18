---
title: "자바 String 변환: 타입 캐스팅 vs String.valueOf() 차이점"
shortTitle: "String 변환 방법"
date: "2026-03-18"
tags: ["java", "type-casting", "string-conversion", "null-safety"]
category: "Backend"
summary: "자바에서 Object를 String으로 변환하는 두 가지 방법의 차이점과 안전한 사용법을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/221"
references: ["https://docs.oracle.com/javase/8/docs/api/java/lang/String.html#valueOf-java.lang.Object-", "https://docs.oracle.com/javase/tutorial/java/nutsandbolts/op2.html"]
---

## String 변환이란?

자바에서 Object 타입의 값을 String으로 변환하는 방법에는 타입 캐스팅 `(String) value`와 `String.valueOf(value)` 메서드 사용이 있습니다. 두 방법 모두 String 타입을 얻는다는 목적은 동일하지만, 내부 동작 방식과 예외 처리에서 중요한 차이점이 있습니다.

타입 캐스팅은 컴파일 타임에 타입을 강제로 변환하는 방식이고, String.valueOf()는 런타임에 안전하게 문자열 표현을 생성하는 방식입니다. 이러한 차이로 인해 null 처리와 예외 발생 상황에서 서로 다른 결과를 보입니다.

## 핵심 개념

### 1. 타입 캐스팅의 동작 방식

타입 캐스팅 `(String) value`는 value가 실제로 String 타입인지 런타임에 검증합니다. 만약 다른 타입이라면 ClassCastException이 발생합니다.

```java
// 성공하는 경우
Object stringValue = "Hello";
String str1 = (String) stringValue; // "Hello"

// 실패하는 경우
Object intValue = 10;
String str2 = (String) intValue; // ClassCastException 발생

// null 처리
Object nullValue = null;
String str3 = (String) nullValue; // null 반환 (캐스팅은 성공)
```

타입 캐스팅의 가장 큰 위험은 null 값을 그대로 반환한다는 점입니다. 이후 해당 변수에 메서드를 호출하면 NullPointerException이 발생할 수 있습니다.

### 2. String.valueOf()의 동작 방식

`String.valueOf(value)`는 내부적으로 다음과 같은 로직을 수행합니다:

```java
public static String valueOf(Object obj) {
    return (obj == null) ? "null" : obj.toString();
}
```

이 메서드는 null에 대해 안전하게 "null" 문자열을 반환하고, 다른 타입의 객체에 대해서는 toString() 메서드를 호출합니다.

```java
// 다양한 타입 변환
Object intValue = 10;
String str1 = String.valueOf(intValue); // "10"

Object boolValue = true;
String str2 = String.valueOf(boolValue); // "true"

Object nullValue = null;
String str3 = String.valueOf(nullValue); // "null"
str3.concat("test"); // "nulltest" (NullPointerException 없음)
```

### 3. 안전한 타입 캐스팅 방법

ClassCastException을 방지하려면 instanceof 연산자를 사용하여 타입을 먼저 확인해야 합니다:

```java
Object value = 10;

// Java 14+ 패턴 매칭 사용
if (value instanceof String str) {
    System.out.println("문자열: " + str);
} else {
    System.out.println("문자열이 아님: " + String.valueOf(value));
}

// 전통적인 방식
if (value instanceof String) {
    String str = (String) value;
    System.out.println("문자열: " + str);
} else {
    System.out.println("문자열이 아님: " + String.valueOf(value));
}
```

### 4. null 처리 전략

String.valueOf()가 null을 "null" 문자열로 변환하는 것이 문제가 될 수 있습니다. 특히 JSON 직렬화나 데이터베이스 저장 시 의도치 않은 결과를 낳을 수 있습니다:

```java
// 문제가 될 수 있는 상황
Object nullValue = null;
String jsonValue = String.valueOf(nullValue); // "null"
// JSON에서 null과 "null"은 다른 의미

// 안전한 처리 방법
public static String safeStringValueOf(Object obj) {
    return obj != null ? obj.toString() : "";
}

// Objects.toString() 활용
String result = Objects.toString(nullValue, "기본값");
```

## 정리

| 구분 | 타입 캐스팅 (String) | String.valueOf() |
|------|---------------------|------------------|
| **타입 안정성** | 런타임 예외 가능 | 항상 String 반환 |
| **null 처리** | null 그대로 반환 | "null" 문자열 반환 |
| **다른 타입** | ClassCastException | toString() 호출 |
| **성능** | 빠름 (타입 확인만) | 약간 느림 (메서드 호출) |
| **안전성** | 낮음 | 높음 |

**선택 기준:**
- 확실히 String 타입인 경우: 타입 캐스팅 사용
- 타입이 불확실하거나 null 가능성이 있는 경우: String.valueOf() 사용
- 더 안전한 null 처리가 필요한 경우: Objects.toString() 또는 직접 null 체크