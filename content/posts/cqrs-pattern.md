---
title: "CQRS 패턴: 명령과 조회의 책임 분리"
shortTitle: "CQRS 패턴"
date: "2026-03-06"
tags: ["CQRS", "아키텍처", "백엔드"]
category: "Architecture"
summary: "명령과 조회를 분리하여 시스템의 복잡성을 해결하는 CQRS 패턴의 개념과 구현 방법을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/187"
---

## CQRS 패턴이란?

CQRS(Command Query Responsibility Segregation)는 명령 쿼리 책임 분리 패턴으로, 시스템에서 상태를 변경하는 명령(Command)과 데이터를 조회하는 쿼리(Query)를 서로 다른 모델로 분리하는 아키텍처 패턴입니다.

일반적으로 애플리케이션에서는 주문 처리, 결제, 사용자 등록과 같은 상태 변경 작업과 주문 목록 조회, 사용자 정보 조회와 같은 데이터 읽기 작업이 함께 존재합니다. CQRS 패턴은 이 두 가지 책임을 명확히 구분하여 각각에 최적화된 모델과 데이터 저장소를 사용할 수 있게 합니다.

## 핵심 개념

### 1. 명령 모델과 조회 모델의 분리

CQRS 패턴에서는 하나의 도메인 객체를 두 개의 별도 모델로 분리합니다.

```typescript
// 명령용 모델 - 비즈니스 로직과 상태 변경에 집중
class Order {
  private id: string;
  private customerId: string;
  private items: OrderItem[];
  private status: OrderStatus;

  public cancel(): void {
    if (this.status === OrderStatus.SHIPPED) {
      throw new Error('배송된 주문은 취소할 수 없습니다.');
    }
    this.status = OrderStatus.CANCELLED;
  }

  public addItem(item: OrderItem): void {
    this.items.push(item);
  }
}

// 조회용 모델 - 데이터 표현에 최적화
interface OrderView {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  itemCount: number;
}
```

### 2. 서로 다른 데이터 저장소 활용

명령 모델과 조회 모델은 각각의 특성에 맞는 데이터 저장소를 사용할 수 있습니다.

```typescript
// 명령 처리 서비스
class OrderCommandService {
  constructor(
    private orderRepository: OrderRepository, // RDB 사용
    private eventPublisher: EventPublisher
  ) {}

  async createOrder(command: CreateOrderCommand): Promise<void> {
    const order = new Order(command);
    await this.orderRepository.save(order);
    
    // 이벤트 발행으로 조회 모델 업데이트
    this.eventPublisher.publish(new OrderCreatedEvent(order));
  }
}

// 조회 처리 서비스
class OrderQueryService {
  constructor(
    private orderViewRepository: OrderViewRepository // NoSQL 사용
  ) {}

  async getOrderList(customerId: string): Promise<OrderView[]> {
    return this.orderViewRepository.findByCustomerId(customerId);
  }
}
```

### 3. 이벤트 기반 동기화

명령 모델의 변경사항을 조회 모델에 반영하기 위해 이벤트 기반 아키텍처를 활용합니다.

```typescript
// 이벤트 핸들러
class OrderViewUpdateHandler {
  constructor(private orderViewRepository: OrderViewRepository) {}

  @EventHandler(OrderCreatedEvent)
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    const orderView: OrderView = {
      id: event.orderId,
      customerName: event.customerName,
      totalAmount: event.totalAmount,
      status: event.status,
      createdAt: event.createdAt,
      itemCount: event.items.length
    };
    
    await this.orderViewRepository.save(orderView);
  }

  @EventHandler(OrderCancelledEvent)
  async handleOrderCancelled(event: OrderCancelledEvent): Promise<void> {
    await this.orderViewRepository.updateStatus(
      event.orderId, 
      'CANCELLED'
    );
  }
}
```

### 4. 기술 스택의 분리

각 모델의 특성에 맞는 기술을 선택할 수 있습니다.

```typescript
// 명령 모델 - JPA/Hibernate 활용
@Entity
class OrderEntity {
  @Id
  private id: string;
  
  @OneToMany(cascade = CascadeType.ALL)
  private items: List<OrderItemEntity>;
  
  // 비즈니스 로직 메서드들...
}

// 조회 모델 - MyBatis나 직접 SQL 활용
interface OrderQueryRepository {
  @Select("SELECT o.id, c.name as customer_name, " +
          "SUM(oi.price * oi.quantity) as total_amount " +
          "FROM orders o " +
          "JOIN customers c ON o.customer_id = c.id " +
          "JOIN order_items oi ON o.id = oi.order_id " +
          "WHERE o.customer_id = #{customerId} " +
          "GROUP BY o.id")
  List<OrderView> findOrderViewsByCustomerId(String customerId);
}
```

## 정리

| 구분 | 명령 모델 | 조회 모델 |
|------|-----------|-----------|
| **목적** | 상태 변경, 비즈니스 로직 | 데이터 조회, 표현 |
| **데이터 저장소** | RDB (트랜잭션 지원) | NoSQL (조회 성능) |
| **기술 스택** | JPA, Hibernate | MyBatis, 직접 SQL |
| **최적화 방향** | 일관성, 무결성 | 성능, 확장성 |

**CQRS 패턴의 장점:**
- 읽기와 쓰기 작업을 독립적으로 최적화 가능
- 복잡한 조회 쿼리와 비즈니스 로직의 분리
- 각 모델에 최적화된 기술 스택 선택 가능
- 시스템의 확장성과 유지보수성 향상

**CQRS 패턴의 단점:**
- 구현 복잡도 증가
- 데이터 일관성 관리의 어려움
- 추가적인 인프라와 기술 스택 필요
- 개발 및 운영 비용 증가

CQRS 패턴은 시스템의 복잡성이 증가하고 읽기와 쓰기 요구사항이 크게 다를 때 도입을 고려해야 합니다. 단순한 CRUD 애플리케이션에는 과도한 복잡성을 가져올 수 있으므로, 비용 대비 효과를 신중히 검토한 후 적용해야 합니다.