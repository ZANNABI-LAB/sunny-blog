---
title: "Spring 트랜잭션 롤백과 예외 처리"
shortTitle: "트랜잭션 롤백"
date: "2026-04-03"
tags: ["spring", "transaction", "exception", "rollback", "database"]
category: "Backend"
summary: "Spring에서 예외 종류에 따른 트랜잭션 롤백 동작과 커스터마이징 방법을 정리합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/271"
references: ["https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#transaction", "https://docs.oracle.com/javaee/7/api/javax/transaction/Transactional.html"]
---

## Spring 트랜잭션 롤백과 예외란?

Spring의 트랜잭션 관리에서 예외 발생 시 롤백 여부는 예외의 종류에 따라 결정됩니다. 이는 Spring이 예외를 Checked Exception과 Unchecked Exception으로 구분하여 다른 롤백 정책을 적용하기 때문입니다.

Spring은 Unchecked Exception(RuntimeException과 Error)이 발생하면 기본적으로 트랜잭션을 롤백하지만, Checked Exception에 대해서는 롤백하지 않습니다. 이러한 기본 동작은 @Transactional 어노테이션의 속성을 통해 커스터마이징할 수 있습니다.

## 핵심 개념

### 1. Checked Exception과 롤백

Spring은 기본적으로 Checked Exception이 발생해도 트랜잭션을 롤백하지 않습니다. Checked Exception은 컴파일 시점에 예외 처리를 강제하는 예외로, 예상 가능한 정상적인 비즈니스 예외 상황으로 간주하기 때문입니다.

```java
@Service
public class UserService {
    
    @Transactional
    public void createUser(User user) throws UserExistsException {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new UserExistsException("User already exists"); // 롤백 안됨
        }
        userRepository.save(user);
    }
}

// Checked Exception 정의
public class UserExistsException extends Exception {
    public UserExistsException(String message) {
        super(message);
    }
}
```

### 2. Unchecked Exception과 롤백

RuntimeException과 Error 계열의 Unchecked Exception이 발생하면 Spring은 자동으로 트랜잭션을 롤백합니다. 이는 프로그래머의 실수나 시스템 오류로 인한 회복 불가능한 상황으로 판단하기 때문입니다.

```java
@Service
public class OrderService {
    
    @Transactional
    public void processOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found")); // 롤백됨
        
        if (order.getAmount() < 0) {
            throw new RuntimeException("Invalid order amount"); // 롤백됨
        }
        
        order.process();
        orderRepository.save(order);
    }
}
```

### 3. 롤백 동작 커스터마이징

@Transactional 어노테이션의 `rollbackFor`와 `noRollbackFor` 속성을 사용하여 기본 롤백 동작을 재정의할 수 있습니다.

```java
@Service
public class PaymentService {
    
    // Checked Exception에 대해 롤백 강제
    @Transactional(rollbackFor = PaymentException.class)
    public void processPayment(Payment payment) throws PaymentException {
        if (!validatePayment(payment)) {
            throw new PaymentException("Payment validation failed"); // 롤백됨
        }
        paymentRepository.save(payment);
    }
    
    // RuntimeException에 대해 롤백 방지
    @Transactional(noRollbackFor = ValidationException.class)
    public void createUser(User user) {
        if (!isValidUser(user)) {
            throw new ValidationException("Invalid user data"); // 롤백 안됨
        }
        userRepository.save(user);
    }
}
```

### 4. 데이터 접근 예외와 롤백

Spring은 JDBC, JPA, Hibernate 등의 데이터 접근 계층에서 발생하는 다양한 예외를 `DataAccessException` 계층으로 변환합니다. 이는 모두 Unchecked Exception이므로 자동으로 롤백됩니다.

```java
@Service
public class BookService {
    
    @Transactional
    public void updateBook(Book book) {
        try {
            bookRepository.save(book);
        } catch (DataIntegrityViolationException e) {
            // DataAccessException 계열 - 자동 롤백
            log.error("Duplicate key violation", e);
            throw new BookUpdateException("Book update failed");
        }
    }
}

// 프로그래밍 방식 트랜잭션 제어
@Service
public class ManualTransactionService {
    
    private final PlatformTransactionManager transactionManager;
    
    public void processWithManualControl() {
        TransactionStatus status = transactionManager.getTransaction(
            new DefaultTransactionDefinition()
        );
        
        try {
            // 비즈니스 로직 수행
            performBusinessLogic();
            transactionManager.commit(status);
        } catch (Exception e) {
            transactionManager.rollback(status); // 명시적 롤백
            throw e;
        }
    }
}
```

## 정리

| 예외 종류 | 기본 동작 | 커스터마이징 |
|-----------|-----------|--------------|
| **Checked Exception** | 롤백 안함 | `rollbackFor` 속성으로 롤백 강제 |
| **Unchecked Exception** | 롤백함 | `noRollbackFor` 속성으로 롤백 방지 |
| **Error** | 롤백함 | `noRollbackFor` 속성으로 롤백 방지 |
| **DataAccessException** | 롤백함 | Spring이 자동 변환하는 예외 |

Spring의 트랜잭션 롤백 정책을 이해하고 적절히 활용하면, 데이터 일관성을 보장하면서도 예외 상황을 효과적으로 처리할 수 있습니다. 비즈니스 요구사항에 따라 `rollbackFor`와 `noRollbackFor` 속성을 적절히 사용하여 트랜잭션 동작을 세밀하게 제어할 수 있습니다.