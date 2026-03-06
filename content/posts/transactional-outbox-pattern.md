---
title: "트랜잭셔널 아웃박스 패턴 완벽 가이드"
shortTitle: "아웃박스 패턴"
date: "2026-03-06"
tags: ["transactional-outbox", "distributed-system", "event-driven"]
category: "Architecture"
summary: "분산 시스템에서 데이터 정합성을 보장하는 트랜잭셔널 아웃박스 패턴을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/171"
---

## 트랜잭셔널 아웃박스 패턴이란?

트랜잭셔널 아웃박스 패턴(Transactional Outbox Pattern)은 분산 시스템에서 데이터베이스 쓰기와 메시지 발행이 함께 발생할 때 생기는 이중 쓰기 문제를 해결하는 설계 패턴입니다.

마이크로서비스 환경에서 하나의 비즈니스 로직이 실행될 때, 데이터베이스에 데이터를 저장하면서 동시에 다른 서비스에 이벤트를 발행해야 하는 경우가 많습니다. 이때 데이터 저장은 성공했지만 이벤트 발행은 실패하거나, 반대로 이벤트는 발행됐지만 데이터베이스 커밋이 실패하는 상황이 발생할 수 있습니다.

트랜잭셔널 아웃박스 패턴은 이러한 문제를 데이터베이스의 트랜잭션 원자성을 활용해 해결합니다. 외부 시스템으로 발행할 이벤트를 별도의 아웃박스 테이블에 저장하고, 별도 프로세스에서 이를 처리하여 데이터 정합성을 보장합니다.

## 핵심 개념

### 1. 이중 쓰기 문제

기존의 문제가 있는 코드를 살펴보겠습니다:

```java
@Transactional
public void createProduct() {
    // 1. 데이터베이스에 상품 저장
    Product product = new Product("신규 상품");
    productRepository.save(product);
    
    // 2. 외부 시스템에 이벤트 발행
    eventPublisher.publish(new ProductCreatedEvent(product.getId()));
}
```

이 코드는 다음과 같은 문제점을 가지고 있습니다:

```typescript
// 실제 트랜잭션 처리 과정
async function executeTransaction() {
  try {
    await transaction.begin();
    
    // 데이터베이스 쓰기 성공
    await productRepository.save(product);
    
    // 이벤트 발행 실패 가능성
    await eventPublisher.publish(event); // 실패 시 데이터는 이미 저장됨
    
    await transaction.commit(); // 커밋 실패 가능성
  } catch (error) {
    await transaction.rollback();
  }
}
```

### 2. 아웃박스 테이블 설계

아웃박스 패턴의 핵심은 이벤트를 저장할 별도 테이블을 만드는 것입니다:

```sql
CREATE TABLE product_outbox (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    aggregate_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    status VARCHAR(20) DEFAULT 'PENDING'
);
```

```java
@Entity
public class ProductOutbox {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String aggregateId;
    private String eventType;
    
    @Column(columnDefinition = "JSON")
    private String payload;
    
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
    
    @Enumerated(EnumType.STRING)
    private OutboxStatus status;
}
```

### 3. 패턴 구현 방식

아웃박스 패턴을 적용한 개선된 코드입니다:

```java
@Transactional
public void createProduct() {
    // 1. 비즈니스 로직 실행
    Product product = new Product("신규 상품");
    productRepository.save(product);
    
    // 2. 같은 트랜잭션 내에서 아웃박스에 이벤트 저장
    ProductOutbox outboxEvent = new ProductOutbox(
        product.getId().toString(),
        "PRODUCT_CREATED",
        createEventPayload(product)
    );
    outboxRepository.save(outboxEvent);
}
```

별도의 이벤트 발행 서비스:

```java
@Component
public class OutboxEventPublisher {
    
    @Scheduled(fixedDelay = 5000)
    public void publishPendingEvents() {
        List<ProductOutbox> pendingEvents = outboxRepository
            .findByStatusOrderByCreatedAt(OutboxStatus.PENDING);
            
        for (ProductOutbox event : pendingEvents) {
            try {
                eventPublisher.publish(createEvent(event));
                
                // 발행 성공 시 상태 업데이트
                event.markAsProcessed();
                outboxRepository.save(event);
                
            } catch (Exception e) {
                // 실패 시 재시도 로직
                handlePublishFailure(event, e);
            }
        }
    }
}
```

### 4. 고급 구현 전략

더 효율적인 이벤트 발행을 위한 CDC(Change Data Capture) 방식:

```typescript
// Debezium을 활용한 CDC 기반 아웃박스
interface OutboxEvent {
  id: string;
  aggregateId: string;
  eventType: string;
  payload: any;
  createdAt: Date;
}

class CDCOutboxProcessor {
  async processChangeLog(changeLog: any) {
    if (changeLog.table === 'product_outbox' && changeLog.operation === 'INSERT') {
      const event = this.mapToEvent(changeLog.data);
      await this.publishEvent(event);
      
      // 처리 완료 후 레코드 삭제 또는 상태 업데이트
      await this.markAsProcessed(event.id);
    }
  }
  
  private async publishEvent(event: OutboxEvent) {
    // Kafka, RabbitMQ 등으로 이벤트 발행
    await this.messageProducer.send(event.eventType, event.payload);
  }
}
```

## 정리

| 구성요소 | 역할 | 구현 방법 |
|---------|------|----------|
| **아웃박스 테이블** | 이벤트 임시 저장소 | 메인 DB와 같은 트랜잭션에 포함 |
| **이벤트 발행기** | 저장된 이벤트 처리 | 폴링 또는 CDC 방식 |
| **재시도 메커니즘** | 실패 이벤트 처리 | 백오프 전략, 데드레터 큐 |

**주요 장점:**
- 데이터 정합성 보장 (원자성)
- 이벤트 발행 실패에 대한 복구 가능
- 순서 보장 및 중복 처리 방지

**고려사항:**
- 추가 테이블 관리 필요
- 폴링 방식의 지연 시간
- 처리된 이벤트 정리 전략 필요

트랜잭셔널 아웃박스 패턴은 분산 시스템에서 데이터 일관성을 보장하는 핵심 패턴입니다. 초기 구현 복잡도는 있지만, 시스템의 안정성과 신뢰성을 크게 향상시킵니다.