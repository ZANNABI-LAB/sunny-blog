---
title: "전략 패턴 (Strategy Pattern) - 행위를 동적으로 변경하는 디자인 패턴"
shortTitle: "전략 패턴"
date: "2026-03-06"
tags: ["strategy-pattern", "design-pattern", "oop", "backend"]
category: "Backend"
summary: "객체의 행위를 런타임에 동적으로 변경할 수 있는 전략 패턴을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/177"
references: ["https://refactoring.guru/design-patterns/strategy", "https://en.wikipedia.org/wiki/Strategy_pattern"]
---

## 전략 패턴이란?

전략 패턴(Strategy Pattern)은 객체의 행위를 동적으로 변경하고 싶을 때 사용하는 행위 디자인 패턴입니다. 코드를 직접 수정하지 않고도 추상화된 전략의 구현체만 교체하여 객체의 동작을 바꿀 수 있습니다.

이 패턴은 특히 동일한 문제를 해결하는 여러 알고리즘이 존재할 때 유용합니다. 각 알고리즘을 별도의 클래스로 캡슐화하고, 런타임에 원하는 전략을 선택하여 사용할 수 있게 해줍니다.

## 핵심 개념

### 1. 전략 패턴의 구조

전략 패턴은 다음 세 가지 요소로 구성됩니다:

```typescript
// Strategy: 전략을 추상화한 인터페이스
interface PaymentStrategy {
  pay(amount: number): void;
}

// ConcreteStrategy: 구체적인 전략 구현체들
class CreditCardPayment implements PaymentStrategy {
  private cardNumber: string;
  
  constructor(cardNumber: string) {
    this.cardNumber = cardNumber;
  }
  
  pay(amount: number): void {
    console.log(`신용카드 ${this.cardNumber}로 ${amount}원 결제`);
  }
}

class KakaoPayPayment implements PaymentStrategy {
  pay(amount: number): void {
    console.log(`카카오페이로 ${amount}원 결제`);
  }
}

// Context: 전략을 사용하는 클라이언트
class ShoppingCart {
  private paymentStrategy: PaymentStrategy;
  
  setPaymentStrategy(strategy: PaymentStrategy): void {
    this.paymentStrategy = strategy;
  }
  
  checkout(amount: number): void {
    this.paymentStrategy.pay(amount);
  }
}
```

### 2. 실제 사용 예시

자동차 움직임을 결정하는 전략을 구현해보겠습니다:

```java
// 전략 인터페이스
interface MoveStrategy {
    boolean isMovable(int input);
}

// 구체적인 전략들
class EvenNumberMoveStrategy implements MoveStrategy {
    @Override
    public boolean isMovable(int input) {
        return (input % 2) == 0;
    }
}

class OddNumberMoveStrategy implements MoveStrategy {
    @Override
    public boolean isMovable(int input) {
        return (input % 2) != 0;
    }
}

class PrimeNumberMoveStrategy implements MoveStrategy {
    @Override
    public boolean isMovable(int input) {
        if (input < 2) return false;
        for (int i = 2; i <= Math.sqrt(input); i++) {
            if (input % i == 0) return false;
        }
        return true;
    }
}

// Context 클래스
class Car {
    private final MoveStrategy strategy;
    private final int position;
    
    public Car(MoveStrategy strategy, int position) {
        this.strategy = strategy;
        this.position = position;
    }
    
    public Car move(int input) {
        if (strategy.isMovable(input)) {
            return new Car(strategy, position + 1);
        }
        return this;
    }
    
    public int getPosition() {
        return position;
    }
}
```

### 3. 전략 패턴의 장점과 활용

**주요 장점:**
- **개방-폐쇄 원칙**: 새로운 전략을 추가할 때 기존 코드를 수정하지 않음
- **단일 책임 원칙**: 각 전략이 하나의 책임만 가짐
- **런타임 전략 변경**: 실행 중에 전략을 동적으로 교체 가능

**실제 활용 사례:**
```typescript
// 정렬 전략
interface SortStrategy {
  sort(data: number[]): number[];
}

class BubbleSort implements SortStrategy {
  sort(data: number[]): number[] {
    // 버블 정렬 구현
    const arr = [...data];
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - 1 - i; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    return arr;
  }
}

class QuickSort implements SortStrategy {
  sort(data: number[]): number[] {
    // 퀵 정렬 구현
    if (data.length <= 1) return data;
    const pivot = data[0];
    const left = data.slice(1).filter(x => x < pivot);
    const right = data.slice(1).filter(x => x >= pivot);
    return [...this.sort(left), pivot, ...this.sort(right)];
  }
}

class DataProcessor {
  private sortStrategy: SortStrategy;
  
  constructor(strategy: SortStrategy) {
    this.sortStrategy = strategy;
  }
  
  setSortStrategy(strategy: SortStrategy): void {
    this.sortStrategy = strategy;
  }
  
  process(data: number[]): number[] {
    return this.sortStrategy.sort(data);
  }
}
```

### 4. 주의사항과 고려사항

전략 패턴을 사용할 때 고려해야 할 점들입니다:

```typescript
// 잘못된 예시: 전략이 너무 간단한 경우
interface StringProcessor {
  process(str: string): string;
}

class UpperCaseProcessor implements StringProcessor {
  process(str: string): string {
    return str.toUpperCase(); // 너무 단순한 로직
  }
}

// 개선된 예시: 복잡한 비즈니스 로직을 캡슐화
interface DiscountStrategy {
  calculateDiscount(price: number, customerType: string): number;
}

class VIPDiscountStrategy implements DiscountStrategy {
  calculateDiscount(price: number, customerType: string): number {
    // 복잡한 VIP 할인 로직
    if (price > 100000) return price * 0.15;
    if (price > 50000) return price * 0.10;
    return price * 0.05;
  }
}
```

## 정리

| 구성 요소 | 역할 | 특징 |
|-----------|------|------|
| **Strategy** | 전략 인터페이스 | 모든 구체적 전략이 구현해야 하는 공통 인터페이스 |
| **ConcreteStrategy** | 구체적 전략 | Strategy 인터페이스를 구현하는 실제 알고리즘 |
| **Context** | 전략 사용자 | 전략을 참조하고 실행하는 클라이언트 클래스 |

**전략 패턴을 사용해야 하는 경우:**
- 동일한 문제에 대한 여러 해결 방법이 존재할 때
- 런타임에 알고리즘을 동적으로 변경해야 할 때
- 복잡한 조건문을 객체로 대체하고 싶을 때
- 각 알고리즘을 독립적으로 테스트하고 유지보수하고 싶을 때

전략 패턴은 코드의 유연성과 확장성을 크게 향상시키는 강력한 디자인 패턴입니다. 특히 다양한 알고리즘이나 비즈니스 규칙을 다뤄야 하는 백엔드 시스템에서 매우 유용하게 활용할 수 있습니다.