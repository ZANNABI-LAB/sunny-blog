---
title: "CQRS 패턴이란 무엇인가요?"
shortTitle: "CQRS 패턴"
date: "2026-03-06"
tags: ["CQRS", "아키텍처", "패턴"]
category: "무엇인가요?백엔드"
summary: "명령과 조회의 책임을 분리하여 시스템의 복잡성을 관리하는 CQRS 패턴을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/187"
---

## CQRS 패턴이란?

CQRS(Command Query Responsibility Segregation)는 명령 쿼리 책임 분리 패턴으로, 시스템에서 데이터를 변경하는 명령(Command)과 데이터를 조회하는 쿼리(Query)의 책임을 분리하는 아키텍처 패턴입니다.

일반적으로 시스템은 상태 변경과 조회 기능을 동시에 제공합니다. 주문 생성, 결제 처리는 상태 변경에 해당하고, 주문 내역 조회, 사용자 정보 조회는 조회에 해당합니다. CQRS 패턴은 이 두 영역을 명확히 분리하여 각각에 최적화된 모델과 기술을 적용할 수 있게 합니다.

## 핵심 개념

### 1. 명령과 조회 모델 분리

CQRS 패턴의 핵심은 하나의 리소스에 대해 두 개의 별도 모델을 유지하는 것입니다.

```typescript
// 명령용 모델 - 비즈니스 로직과 상태 변경에 최적화
class Order {
  constructor(
    private id: string,
    private customerId: string,
    private status: OrderStatus
  ) {}

  cancel(): void {
    if (this.status === OrderStatus.SHIPPED) {
      throw new Error('배송된 주문은 취소할 수 없습니다.');
    }
    this.status = OrderStatus.CANCELLED;
  }

  confirm(): void {
    this.status = OrderStatus.CONFIRMED;
  }
}

// 조회용 모델 - 표현과 조회 성능에 최적화
interface OrderData {
  id: string;
  customerName: string;
  orderDate: Date;
  totalAmount: number;
  status: string;
  items: OrderItemData[];
}
```

### 2. 서로 다른 데이터 저장소 활용

명령 모델과 조회 모델은 각각의 특성에 맞는 다른 데이터베이스를 사용할 수 있습니다.

```typescript
// 명령 서비스 - 트랜잭션이 중요한 RDB 사용
class OrderCommandService {
  constructor(private orderRepository: OrderRepository) {}

  async createOrder(command: CreateOrderCommand): Promise<void> {
    const order = new Order(command.id, command.customerId);
    await this.orderRepository.save(order);
    
    // 조회 모델 동기화를 위한 이벤트 발행
    await this.eventPublisher.publish(new OrderCreatedEvent(order));
  }
}

// 조회 서비스 - 읽기 성능이 중요한 NoSQL 사용
class OrderQueryService {
  constructor(private orderDataRepository: OrderDataRepository) {}

  async getOrderHistory(customerId: string): Promise<OrderData[]> {
    return await this.orderDataRepository.findByCustomerId(customerId);
  }

  async getOrderSummary(orderId: string): Promise<OrderSummary> {
    return await this.orderDataRepository.getSummary(orderId);
  }
}
```

### 3. 데이터 동기화 전략

명령 모델의 변경사항을 조회 모델에 반영하는 동기화 메커니즘이 필요합니다.

```typescript
// 이벤트 기반 동기화
class OrderEventHandler {
  constructor(private orderDataRepository: OrderDataRepository) {}

  @EventHandler(OrderCreatedEvent)
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    const orderData: OrderData = {
      id: event.orderId,
      customerName: await this.getCustomerName(event.customerId),
      orderDate: event.createdAt,
      status: event.status,
      totalAmount: event.totalAmount,
      items: event.items
    };

    await this.orderDataRepository.save(orderData);
  }

  @EventHandler(OrderStatusChangedEvent)
  async handleOrderStatusChanged(event: OrderStatusChangedEvent): Promise<void> {
    await this.orderDataRepository.updateStatus(event.orderId, event.newStatus);
  }
}
```

### 4. 기술 스택 분리

단일 데이터베이스 환경에서도 명령과 조회에 서로 다른 기술을 적용할 수 있습니다.

```typescript
// 명령 모델 - JPA/Hibernate 사용
@Entity
class Order {
  @Id
  private id: string;
  
  @Embedded
  private orderInfo: OrderInfo;
  
  public void cancel() {
    this.orderInfo.cancel();
  }
}

// 조회 모델 - MyBatis나 순수 SQL 사용
@Mapper
interface OrderDataMapper {
  @Select("""
    SELECT o.id, c.name as customer_name, o.order_date,
           SUM(oi.price * oi.quantity) as total_amount
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.customer_id = #{customerId}
    GROUP BY o.id, c.name, o.order_date
  """)
  List<OrderData> findOrdersByCustomerId(@Param("customerId") String customerId);
}
```

## 정리

| 구분 | 장점 | 단점 |
|------|------|------|
| **유지보수성** | 명령과 조회 로직 분리로 복잡성 감소 | 구현 코드량 증가 |
| **성능 최적화** | 각 용도에 맞는 데이터베이스/기술 선택 가능 | 데이터 동기화 복잡성 |
| **확장성** | 명령과 조회 모델 독립적 확장 | 더 많은 기술 스택 필요 |
| **개발 복잡도** | 각 모델의 책임 명확화 | 초기 설계 비용 증가 |

**CQRS 패턴 도입 고려사항:**
- 단일 모델의 복잡성 > 이중 모델의 복잡성인 경우에만 도입
- 명령과 조회의 성능 요구사항이 크게 다른 경우
- 읽기와 쓰기 트래픽 패턴이 현저히 다른 경우
- 팀의 기술적 역량과 유지보수 비용을 충분히 고려