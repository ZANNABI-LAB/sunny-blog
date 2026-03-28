---
title: "자바스크립트 메모리 관리"
shortTitle: "메모리 관리"
date: "2026-03-28"
tags: ["javascript", "memory-management", "garbage-collection", "performance", "frontend"]
category: "Frontend"
summary: "자바스크립트의 자동 메모리 할당과 가비지 컬렉션 메커니즘을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/252"
references: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management", "https://v8.dev/blog/free-garbage-collection"]
---

## 자바스크립트 메모리 관리란?

자바스크립트의 메모리 관리는 개발자가 직접 메모리를 할당하고 해제하는 저수준 언어와 달리, 언어 차원에서 자동으로 이루어지는 시스템입니다. C언어의 `malloc()`과 `free()` 같은 함수를 사용할 필요 없이, 변수와 객체의 생성과 소멸이 자동으로 관리됩니다.

이러한 자동 메모리 관리는 개발자의 생산성을 높이지만, 내부 동작 원리를 이해하는 것은 성능 최적화와 메모리 누수 방지에 중요합니다. 특히 SPA나 장시간 실행되는 웹 애플리케이션에서는 메모리 관리의 이해가 필수적입니다.

## 핵심 개념

### 1. 메모리 할당 메커니즘

자바스크립트에서 메모리 할당은 변수나 객체를 생성할 때 자동으로 발생합니다:

```javascript
// 원시 값 - Stack 영역에 저장
const name = "maeil-mail";
const age = 25;
const isActive = true;

// 참조 타입 - Heap 영역에 저장
const user = {
  name: "John",
  profile: {
    email: "john@example.com",
    preferences: ["dark-theme", "notifications"]
  }
};

const numbers = [1, 2, 3, 4, 5];
```

원시 값(string, number, boolean 등)은 **Stack** 영역에 저장되어 고정 크기를 가지며, 컴파일 타임에 크기가 결정되는 정적 데이터입니다. 반면 객체와 배열은 **Heap** 영역에 저장되어 런타임에 동적으로 크기가 변하는 동적 데이터입니다.

### 2. 가비지 컬렉션 (Garbage Collection)

가비지 컬렉션은 더 이상 사용되지 않는 메모리를 자동으로 해제하는 메커니즘입니다:

```javascript
function createUser() {
  const user = { name: "John", age: 30 };
  return user;
}

let userData = createUser(); // user 객체가 userData에서 참조됨
userData = null; // 참조가 끊어지면 GC 대상이 됨
```

가비지 컬렉션의 주요 목표는 도달 불가능한(unreachable) 객체를 찾아 메모리에서 제거하는 것입니다.

### 3. Reference Counting 알고리즘

가장 단순한 GC 알고리즘으로, 객체가 참조되는 횟수를 추적합니다:

```javascript
let obj1 = { data: "value1" }; // 참조 카운트: 1
let obj2 = obj1; // 참조 카운트: 2
obj1 = null; // 참조 카운트: 1
obj2 = null; // 참조 카운트: 0 -> GC 대상
```

하지만 순환 참조 문제가 발생할 수 있습니다:

```javascript
// 문제: 순환 참조
function createCircularRef() {
  const parent = { name: "parent" };
  const child = { name: "child" };
  
  parent.child = child;
  child.parent = parent; // 순환 참조 발생
  
  return parent;
}

let circular = createCircularRef();
circular = null; // parent와 child는 여전히 서로를 참조하므로 GC되지 않음
```

### 4. Mark-and-Sweep 알고리즘

현대 자바스크립트 엔진이 주로 사용하는 알고리즘으로, 루트에서 도달 가능한 모든 객체를 표시(mark)한 후, 표시되지 않은 객체를 제거(sweep)합니다:

```javascript
// Mark-and-Sweep이 해결하는 순환 참조 예시
function handleCircularReference() {
  const parent = { name: "parent" };
  const child = { name: "child" };
  
  parent.child = child;
  child.parent = parent;
  
  // 함수가 끝나면 parent, child 모두 루트에서 도달 불가능
  // Mark-and-Sweep은 순환 참조와 관계없이 둘 다 제거
}

handleCircularReference(); // 함수 종료 시 모든 객체가 GC 대상
```

Mark-and-Sweep의 동작 과정:
1. **Mark 단계**: 루트 객체(전역 변수, 현재 실행 컨텍스트의 지역 변수 등)부터 시작해 도달 가능한 모든 객체를 표시
2. **Sweep 단계**: 표시되지 않은 모든 객체의 메모리를 해제

## 정리

| 구분 | Stack 영역 | Heap 영역 |
|------|------------|-----------|
| 저장 데이터 | 원시 값 (string, number, boolean 등) | 객체, 배열, 함수 |
| 메모리 크기 | 고정 크기 (정적) | 가변 크기 (동적) |
| 할당 시점 | 컴파일 타임 | 런타임 |
| 해제 방식 | 자동 (스코프 종료 시) | 가비지 컬렉션 |

| GC 알고리즘 | 장점 | 단점 |
|-------------|------|------|
| Reference Counting | 구현이 단순함, 즉시 해제 가능 | 순환 참조 처리 불가 |
| Mark-and-Sweep | 순환 참조 해결, 정확한 GC | 실행 중 일시 정지 발생 가능 |

자바스크립트의 자동 메모리 관리는 개발 편의성을 제공하지만, 메모리 누수를 완전히 방지하지는 못합니다. DOM 참조, 이벤트 리스너, 타이머 등은 여전히 개발자가 적절히 정리해야 하는 영역입니다.