---
title: "널 오브젝트 패턴 (Null Object Pattern)"
shortTitle: "널 오브젝트 패턴"
date: "2026-03-31"
tags: ["null-object-pattern", "design-pattern", "java", "null-safety", "clean-code"]
category: "Design Pattern"
summary: "널 값 대신 아무 작업도 수행하지 않는 객체를 사용하여 널 체크 로직을 제거하는 디자인 패턴입니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/259"
references: ["https://martinfowler.com/eaaCatalog/specialCase.html", "https://refactoring.guru/design-patterns/null-object", "https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html"]
---

## 널 오브젝트 패턴이란?

널 오브젝트 패턴(Null Object Pattern)은 널 값을 반환하는 대신 아무런 작업도 수행하지 않는 객체를 반환하는 디자인 패턴입니다. 이 패턴은 반복적인 널 체크 로직을 제거하고, 클라이언트 코드를 더 간결하고 안전하게 만듭니다.

일반적으로 메서드가 객체를 반환할 때 해당 객체가 존재하지 않으면 `null`을 반환하는데, 이로 인해 클라이언트는 항상 널 체크를 해야 합니다. 널 오브젝트 패턴은 이런 번거로움을 해결하여 코드의 가독성과 안정성을 높입니다.

## 핵심 개념

### 1. 기본 구현 방식

널 오브젝트 패턴의 핵심은 공통 인터페이스를 구현하는 두 가지 클래스를 만드는 것입니다:

```java
// 공통 인터페이스
interface Logger {
    void log(String message);
    void error(String message);
}

// 실제 작업을 수행하는 구현체
class FileLogger implements Logger {
    private String fileName;
    
    public FileLogger(String fileName) {
        this.fileName = fileName;
    }
    
    @Override
    public void log(String message) {
        System.out.println("[INFO] " + message + " -> " + fileName);
    }
    
    @Override
    public void error(String message) {
        System.err.println("[ERROR] " + message + " -> " + fileName);
    }
}

// 널 오브젝트 - 아무 작업도 수행하지 않음
class NullLogger implements Logger {
    @Override
    public void log(String message) {
        // 아무것도 하지 않음
    }
    
    @Override
    public void error(String message) {
        // 아무것도 하지 않음
    }
}
```

### 2. 팩토리 메서드를 통한 생성

클라이언트가 널 오브젝트의 존재를 모르도록 팩토리 메서드를 사용할 수 있습니다:

```java
class LoggerFactory {
    public static Logger createLogger(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            return new NullLogger();
        }
        return new FileLogger(fileName);
    }
}

// 클라이언트 코드 - 널 체크가 필요 없음
public class OrderService {
    private Logger logger;
    
    public OrderService(String logFileName) {
        this.logger = LoggerFactory.createLogger(logFileName);
    }
    
    public void processOrder(Order order) {
        logger.log("Processing order: " + order.getId());
        
        // 비즈니스 로직 수행
        processPayment(order);
        
        logger.log("Order processed successfully");
    }
    
    private void processPayment(Order order) {
        // 결제 로직
        logger.log("Payment processed for order: " + order.getId());
    }
}
```

### 3. 특별한 케이스 처리

널 오브젝트 패턴은 단순히 널 값을 대체하는 것뿐만 아니라 특별한 케이스를 처리할 때도 유용합니다:

```java
// 할인 정책 인터페이스
interface DiscountPolicy {
    double calculateDiscount(double amount);
    String getDescription();
}

// 일반적인 할인 정책들
class PercentageDiscount implements DiscountPolicy {
    private double percentage;
    
    public PercentageDiscount(double percentage) {
        this.percentage = percentage;
    }
    
    @Override
    public double calculateDiscount(double amount) {
        return amount * (percentage / 100.0);
    }
    
    @Override
    public String getDescription() {
        return percentage + "% 할인";
    }
}

// 할인이 없는 경우를 위한 널 오브젝트
class NoDiscount implements DiscountPolicy {
    @Override
    public double calculateDiscount(double amount) {
        return 0.0;  // 할인 없음
    }
    
    @Override
    public String getDescription() {
        return "할인 없음";
    }
}

// 사용 예시
public class PriceCalculator {
    public double calculateFinalPrice(double basePrice, DiscountPolicy discount) {
        double discountAmount = discount.calculateDiscount(basePrice);
        return basePrice - discountAmount;
    }
}
```

### 4. 장단점과 주의사항

널 오브젝트 패턴은 코드를 간소화하지만 몇 가지 주의할 점이 있습니다:

```java
// 잠재적 문제: 예외 상황을 숨길 수 있음
public class UserService {
    public void processUser(String userId) {
        User user = userRepository.findById(userId); // NullUser 반환 가능
        
        // 사용자가 실제로 존재하지 않더라도 예외가 발생하지 않음
        user.updateLastLoginTime(); // NullUser는 아무것도 하지 않음
        user.sendWelcomeEmail();    // 이것도 실행되지만 아무 일도 일어나지 않음
    }
}

// 개선된 방식: 명시적으로 널 오브젝트 확인
interface User {
    void updateLastLoginTime();
    void sendWelcomeEmail();
    boolean isNull(); // 널 오브젝트인지 확인하는 메서드
}

class NullUser implements User {
    @Override
    public void updateLastLoginTime() {}
    
    @Override
    public void sendWelcomeEmail() {}
    
    @Override
    public boolean isNull() {
        return true;
    }
}

class RealUser implements User {
    // 실제 구현
    @Override
    public boolean isNull() {
        return false;
    }
}
```

## 정리

널 오브젝트 패턴의 핵심 특징을 정리하면 다음과 같습니다:

| 측면 | 설명 |
|------|------|
| **목적** | 널 체크 로직 제거, 안전한 메서드 호출 |
| **구조** | 공통 인터페이스 + 실제 구현체 + 널 오브젝트 |
| **장점** | 코드 간소화, 널 포인터 예외 방지, 협력 재사용성 |
| **단점** | 예외 상황 은닉 가능성, 추가 클래스 생성 필요 |
| **사용 시기** | 반복적인 널 체크가 필요한 경우, 기본값 동작이 명확한 경우 |

널 오브젝트 패턴은 특히 로깅, 이벤트 처리, 전략 패턴과 조합할 때 유용하며, 현대 언어의 Optional이나 Maybe 타입의 개념적 기반이 되는 패턴입니다.