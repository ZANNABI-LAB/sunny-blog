---
title: "객체 지향 프로그래밍의 핵심 개념과 설계 원칙"
shortTitle: "객체 지향 프로그래밍"
date: "2026-03-30"
tags: ["object-oriented", "programming-paradigm", "design-principles", "java", "encapsulation"]
category: "Backend"
summary: "객체 지향 프로그래밍의 4가지 핵심 특징과 TDA 원칙을 통한 올바른 객체 설계 방법을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/258"
references: ["https://docs.oracle.com/javase/tutorial/java/concepts/", "https://refactoring.guru/design-patterns/what-is-pattern"]
---

## 객체 지향 프로그래밍이란?

객체 지향 프로그래밍(OOP, Object-Oriented Programming)은 상태(필드)와 행위(메서드)를 가진 객체를 중심으로 프로그램을 설계하는 프로그래밍 패러다임입니다. 객체에 역할과 책임을 부여하고, 이 객체들이 서로 협력하는 방식으로 프로그램을 구성합니다.

전통적인 절차 지향 프로그래밍이 함수와 데이터를 분리하여 처리한다면, 객체 지향 프로그래밍은 관련된 데이터와 함수를 하나의 객체로 묶어서 관리합니다. 이를 통해 코드의 재사용성, 확장성, 유지보수성을 크게 향상시킬 수 있습니다.

## 핵심 개념

### 1. 캡슐화 (Encapsulation)

캡슐화는 객체의 상태와 행위를 하나의 단위로 묶고, 내부 구현은 숨기면서 외부에서 접근할 수 있는 인터페이스만 제공하는 것입니다.

```java
public class BankAccount {
    private BigDecimal balance; // private으로 데이터 은닉
    
    public BankAccount(BigDecimal initialBalance) {
        this.balance = initialBalance;
    }
    
    // 외부에서 접근할 수 있는 인터페이스만 제공
    public void withdraw(BigDecimal amount) {
        if (balance.compareTo(amount) < 0) {
            throw new IllegalStateException("잔액이 부족합니다.");
        }
        this.balance = balance.subtract(amount);
    }
    
    public BigDecimal getBalance() {
        return balance;
    }
}
```

캡슐화를 통해 객체의 무결성을 보호하고, 내부 구현을 변경하더라도 외부 코드에 영향을 주지 않습니다.

### 2. 추상화 (Abstraction)

추상화는 불필요한 세부 사항을 감추고 핵심적인 기능만 간추려내는 것입니다. 인터페이스나 추상 클래스를 통해 구현합니다.

```java
// 인터페이스를 통한 추상화
public interface PaymentProcessor {
    void processPayment(BigDecimal amount);
}

// 구체적인 구현
public class CreditCardProcessor implements PaymentProcessor {
    @Override
    public void processPayment(BigDecimal amount) {
        // 신용카드 결제 로직
        System.out.println("신용카드로 " + amount + "원 결제");
    }
}

public class BankTransferProcessor implements PaymentProcessor {
    @Override
    public void processPayment(BigDecimal amount) {
        // 계좌이체 결제 로직
        System.out.println("계좌이체로 " + amount + "원 결제");
    }
}
```

### 3. 상속 (Inheritance)

상속은 상위 클래스의 특징을 하위 클래스가 물려받아 확장하는 것입니다. 코드의 재사용성과 확장성을 높입니다.

```java
public abstract class Animal {
    protected String name;
    
    public Animal(String name) {
        this.name = name;
    }
    
    public void eat() {
        System.out.println(name + "이(가) 먹고 있습니다.");
    }
    
    public abstract void makeSound();
}

public class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }
    
    @Override
    public void makeSound() {
        System.out.println(name + "이(가) 멍멍 짖습니다.");
    }
    
    public void wagTail() {
        System.out.println(name + "이(가) 꼬리를 흔듭니다.");
    }
}
```

### 4. 다형성 (Polymorphism)

다형성은 하나의 인터페이스가 여러 형태로 동작할 수 있는 것입니다. 오버로딩과 오버라이딩을 통해 구현됩니다.

```java
public class Calculator {
    // 오버로딩: 같은 메서드명, 다른 매개변수
    public int add(int a, int b) {
        return a + b;
    }
    
    public double add(double a, double b) {
        return a + b;
    }
    
    public int add(int a, int b, int c) {
        return a + b + c;
    }
}

// 오버라이딩: 상위 클래스 메서드 재정의
List<Animal> animals = Arrays.asList(
    new Dog("멍멍이"),
    new Cat("야옹이")
);

for (Animal animal : animals) {
    animal.makeSound(); // 각 객체의 구현에 따라 다르게 동작
}
```

### 5. TDA 원칙 (Tell, Don't Ask)

TDA 원칙은 객체의 데이터를 직접 요청하지 말고, 객체에게 필요한 동작을 수행하도록 메시지를 보내라는 원칙입니다.

```java
// TDA 원칙 위반 (Bad)
public class OrderService {
    public void processOrder(Order order) {
        if (order.getStatus().equals("PENDING")) { // 데이터를 물어봄
            order.setStatus("PROCESSING"); // 데이터를 직접 변경
            // 추가 처리 로직...
        }
    }
}

// TDA 원칙 준수 (Good)
public class Order {
    private OrderStatus status;
    
    public void process() { // 객체에게 처리를 요청
        if (status == OrderStatus.PENDING) {
            this.status = OrderStatus.PROCESSING;
            // 내부에서 상태 변경 및 관련 로직 처리
        }
    }
    
    public boolean canProcess() {
        return status == OrderStatus.PENDING;
    }
}

public class OrderService {
    public void processOrder(Order order) {
        order.process(); // 객체에게 행동을 지시
    }
}
```

## 정리

| 특징 | 목적 | 핵심 개념 |
|------|------|-----------|
| **캡슐화** | 데이터 보호 및 인터페이스 제공 | 정보 은닉, 접근 제어 |
| **추상화** | 핵심 기능 추출 및 복잡성 감소 | 인터페이스, 추상 클래스 |
| **상속** | 코드 재사용 및 기능 확장 | is-a 관계, 계층 구조 |
| **다형성** | 하나의 인터페이스, 여러 구현 | 오버로딩, 오버라이딩 |

**TDA 원칙의 장점:**
- 캡슐화 강화로 객체 무결성 보장
- 높은 응집도와 낮은 결합도 달성
- 객체 책임의 명확한 분리
- 유지보수성 및 확장성 향상

객체 지향 프로그래밍은 단순히 클래스와 객체를 사용하는 것이 아니라, 객체 간의 협력을 통해 문제를 해결하는 사고방식입니다. 각 객체가 자신의 책임을 다하고, 필요할 때 다른 객체와 메시지를 주고받으며 협력하는 구조로 설계해야 합니다.