---
title: "코드 커버리지: 테스트 품질을 측정하는 핵심 지표"
shortTitle: "코드 커버리지"
date: "2026-03-06"
tags: ["testing", "code-coverage", "quality-assurance", "backend"]
category: "Backend"
summary: "테스트가 프로덕션 코드를 얼마나 실행했는지 측정하는 코드 커버리지의 개념과 종류를 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/185"
references: ["https://www.jacoco.org/jacoco/trunk/doc/", "https://martinfowler.com/bliki/TestCoverage.html"]
---

## 코드 커버리지란?

코드 커버리지(Code Coverage)는 테스트 케이스들이 프로덕션 코드를 실행한 정도를 수치로 나타낸 지표입니다. 쉽게 말해, 작성한 테스트가 실제 코드의 얼마나 많은 부분을 검증했는지를 측정합니다.

예를 들어, 100줄의 코드가 있고 테스트를 통해 80줄이 실행되었다면 코드 커버리지는 80%입니다. 이는 테스트의 완전성을 평가하고, 테스트되지 않은 코드 영역을 찾아내는 데 유용한 도구로 활용됩니다.

하지만 높은 커버리지가 반드시 높은 테스트 품질을 의미하는 것은 아닙니다. 커버리지는 코드가 실행되었는지만 확인할 뿐, 올바른 결과를 검증했는지는 보장하지 않습니다.

## 핵심 개념

### 1. 구문 커버리지 (Statement Coverage)

구문 커버리지는 라인 커버리지라고도 불리며, 프로덕션 코드의 각 라인이 테스트에 의해 실행되었는지를 측정합니다.

```typescript
function calculateDiscount(price: number, membership: string): number {
  let discount = 0;
  
  if (price > 100) {
    discount = price * 0.1;  // 라인 1
  }
  
  if (membership === 'premium') {
    discount += 50;  // 라인 2
  }
  
  return discount;  // 라인 3
}

// 테스트 케이스
describe('calculateDiscount', () => {
  it('should calculate discount for premium member', () => {
    expect(calculateDiscount(200, 'premium')).toBe(70);
    // 모든 라인이 실행됨 → 100% 구문 커버리지
  });
});
```

구문 커버리지는 가장 기본적인 커버리지 측정 방식이지만, 조건문의 모든 분기를 검증하지는 못합니다.

### 2. 결정 커버리지 (Decision Coverage)

결정 커버리지는 브랜치 커버리지라고도 불리며, 프로덕션 코드의 모든 조건식이 참과 거짓으로 최소 한 번씩 평가되는지를 확인합니다.

```typescript
function isValidUser(age: number, hasLicense: boolean): boolean {
  if (age >= 18 && hasLicense) {  // 조건식
    return true;
  }
  return false;
}

// 결정 커버리지를 만족하는 테스트
describe('isValidUser', () => {
  it('should return true for valid user', () => {
    expect(isValidUser(20, true)).toBe(true);  // 조건식이 true
  });
  
  it('should return false for invalid user', () => {
    expect(isValidUser(16, false)).toBe(false);  // 조건식이 false
  });
});
```

결정 커버리지는 코드 내에서 실행 흐름이 분기되는 모든 경로를 테스트하는 것을 목표로 합니다.

### 3. 조건 커버리지 (Condition Coverage)

조건 커버리지는 조건식 내의 각 개별 조건이 참과 거짓으로 모두 평가되는지를 확인합니다.

```typescript
function canAccess(isAdmin: boolean, isActive: boolean): boolean {
  if (isAdmin && isActive) {  // 두 개의 개별 조건
    return true;
  }
  return false;
}

// 조건 커버리지를 만족하는 테스트
describe('canAccess', () => {
  it('should test all individual conditions', () => {
    expect(canAccess(true, false)).toBe(false);   // isAdmin=true, isActive=false
    expect(canAccess(false, true)).toBe(false);   // isAdmin=false, isActive=true
    // 각 조건이 true/false로 평가됨
  });
});
```

주목할 점은 조건 커버리지를 만족해도 결정 커버리지를 만족하지 못할 수 있다는 것입니다. 위 예시에서는 전체 조건식이 `true`로 평가되는 케이스가 없습니다.

### 4. 커버리지의 한계와 올바른 활용

코드 커버리지는 유용한 지표이지만 맹신해서는 안 됩니다. 높은 커버리지가 반드시 좋은 테스트를 의미하지는 않습니다.

```typescript
function divide(a: number, b: number): number {
  return a / b;  // 0으로 나누기 예외 처리 없음
}

// 높은 커버리지지만 부족한 테스트
describe('divide', () => {
  it('should divide numbers', () => {
    expect(divide(10, 2)).toBe(5);  // 100% 커버리지
    // 하지만 divide(10, 0) 케이스는 테스트하지 않음
  });
});
```

커버리지는 코드가 실행되었는지만 확인할 뿐, 예외 상황이나 경계 조건을 제대로 다뤘는지는 보장하지 못합니다.

## 정리

| 커버리지 종류 | 측정 기준 | 장점 | 한계 |
|---|---|---|---|
| **구문 커버리지** | 실행된 코드 라인 수 | 측정이 간단함 | 분기 조건 미검증 |
| **결정 커버리지** | 조건식의 true/false 평가 | 실행 경로 검증 | 개별 조건 미검증 |
| **조건 커버리지** | 각 조건의 true/false 평가 | 세밀한 조건 검증 | 복잡성 증가 |

**핵심 원칙**
- 커버리지는 테스트 품질의 참고 지표일 뿐입니다
- 100% 커버리지보다 의미 있는 테스트 케이스 작성이 중요합니다
- 예외 상황과 경계 조건을 포함한 종합적인 테스트 전략이 필요합니다
- 커버리지 도구를 활용해 테스트되지 않은 영역을 찾아내고 개선합니다