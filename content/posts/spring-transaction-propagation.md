---
title: "스프링 트랜잭션 전파 속성"
shortTitle: "트랜잭션 전파"
date: "2026-03-13"
tags: ["spring", "transaction", "propagation", "backend"]
category: "Backend"
summary: "스프링에서 메서드 간 트랜잭션 호출 시 동작을 제어하는 7가지 전파 속성을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/205"
references: ["https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-propagation.html", "https://docs.spring.io/spring-framework/reference/data-access/transaction.html"]
---

## 트랜잭션 전파 속성이란?

스프링의 트랜잭션 전파(Transaction Propagation)는 이미 진행 중인 트랜잭션 상황에서 새로운 트랜잭션이 시작될 때의 동작을 정의하는 속성입니다. `@Transactional` 어노테이션이 붙은 메서드를 호출할 때, 기존 트랜잭션이 있다면 재사용할지, 새로 생성할지, 아니면 예외를 던질지를 결정합니다.

이는 마이크로서비스 환경이나 복잡한 비즈니스 로직에서 여러 서비스 계층이 상호작용할 때 데이터 일관성을 보장하는 핵심 메커니즘입니다. 전파 속성을 올바르게 설정하지 않으면 의도치 않은 트랜잭션 경계로 인해 데이터 무결성 문제가 발생할 수 있습니다.

## 핵심 개념

### 1. 기본 전파 속성 (REQUIRED, SUPPORTS, MANDATORY)

**REQUIRED**는 가장 일반적으로 사용되는 기본값입니다. 기존 트랜잭션이 있으면 참여하고, 없으면 새로 생성합니다.

```java
@Service
public class OrderService {
    @Transactional(propagation = Propagation.REQUIRED)
    public void createOrder(Order order) {
        orderRepository.save(order);
        // 기존 트랜잭션이 있으면 참여, 없으면 새로 시작
    }
}
```

**SUPPORTS**는 트랜잭션이 있으면 사용하지만, 없어도 정상 실행됩니다. 주로 읽기 전용 작업에 사용됩니다.

```java
@Transactional(propagation = Propagation.SUPPORTS, readOnly = true)
public List<Order> findOrders() {
    return orderRepository.findAll();
    // 트랜잭션 없이도 실행 가능
}
```

**MANDATORY**는 기존 트랜잭션이 반드시 있어야 하며, 없으면 `IllegalTransactionStateException`을 발생시킵니다.

### 2. 독립 실행 속성 (REQUIRES_NEW, NOT_SUPPORTED, NEVER)

**REQUIRES_NEW**는 항상 새로운 트랜잭션을 생성합니다. 기존 트랜잭션이 있으면 일시 중단하고 독립적인 트랜잭션을 실행합니다.

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void sendNotification(String message) {
    notificationRepository.save(new Notification(message));
    // 외부 트랜잭션 롤백과 무관하게 독립 실행
}
```

**NOT_SUPPORTED**는 트랜잭션을 사용하지 않습니다. 기존 트랜잭션이 있으면 일시 중단합니다.

**NEVER**는 트랜잭션이 있으면 예외를 발생시킵니다. 트랜잭션 없이만 실행되어야 하는 작업에 사용됩니다.

### 3. 중첩 트랜잭션 (NESTED)

**NESTED**는 기존 트랜잭션 내에서 SAVEPOINT를 생성하여 중첩 트랜잭션을 시작합니다. 중첩 트랜잭션이 롤백되어도 외부 트랜잭션에 영향을 주지 않습니다.

```java
@Transactional
public void processOrder(Order order) {
    orderRepository.save(order);
    
    try {
        auditService.recordAudit(order.getId()); // NESTED 전파
    } catch (Exception e) {
        // 감사 로그 실패해도 주문은 정상 처리
        log.warn("Audit recording failed", e);
    }
}

@Transactional(propagation = Propagation.NESTED)
public void recordAudit(Long orderId) {
    auditRepository.save(new Audit(orderId));
}
```

### 4. 실제 사용 시나리오

트랜잭션 전파는 계층화된 서비스 구조에서 특히 중요합니다.

```java
@Service
public class PaymentService {
    @Transactional
    public void processPayment(Payment payment) {
        paymentRepository.save(payment);
        
        // 알림은 독립적으로 처리 (REQUIRES_NEW)
        notificationService.sendPaymentConfirmation(payment);
        
        // 포인트 적립은 선택사항 (NESTED)
        loyaltyService.addPoints(payment.getUserId(), payment.getAmount());
    }
}
```

## 정리

| 전파 속성 | 기존 트랜잭션 있음 | 기존 트랜잭션 없음 | 주요 용도 |
|-----------|-------------------|-------------------|-----------|
| REQUIRED | 참여 | 새로 생성 | 기본값, 일반적인 비즈니스 로직 |
| REQUIRES_NEW | 중단 후 신규 생성 | 새로 생성 | 독립적인 작업 (로깅, 알림) |
| MANDATORY | 참여 | 예외 발생 | 반드시 트랜잭션 내에서 실행 |
| SUPPORTS | 참여 | 트랜잭션 없이 실행 | 읽기 전용 작업 |
| NOT_SUPPORTED | 중단 후 실행 | 트랜잭션 없이 실행 | 트랜잭션이 불필요한 작업 |
| NEVER | 예외 발생 | 트랜잭션 없이 실행 | 트랜잭션 금지 영역 |
| NESTED | SAVEPOINT 생성 | 새로 생성 | 부분 롤백이 필요한 작업 |

트랜잭션 전파 속성을 적절히 활용하면 복잡한 비즈니스 로직에서도 데이터 일관성을 보장하면서 시스템의 견고성을 높일 수 있습니다.