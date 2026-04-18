---
title: "레이어드 아키텍처: 관심사 분리를 통한 체계적인 소프트웨어 설계"
shortTitle: "레이어드 아키텍처"
date: "2026-04-18"
tags: ["layered-architecture", "software-architecture", "separation-of-concerns", "backend-design"]
category: "Architecture"
summary: "소프트웨어를 관심사별로 계층화하여 유지보수성과 확장성을 높이는 레이어드 아키텍처 패턴을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/310"
references: ["https://docs.spring.io/spring-framework/docs/current/reference/html/core.html", "https://martinfowler.com/eaaCatalog/serviceLayer.html", "https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/"]
---

## 레이어드 아키텍처란?

레이어드 아키텍처(Layered Architecture)는 소프트웨어를 관심사별로 여러 계층으로 나누어 수직적으로 배열하는 아키텍처 패턴입니다. 각 계층은 특정한 책임을 가지며, 상위 계층에서 하위 계층으로만 의존하는 단방향 흐름을 따릅니다.

이 패턴의 핵심은 관심사의 분리(Separation of Concerns)입니다. 비슷한 책임을 가진 기능들을 같은 계층으로 묶어 관리함으로써, 각 계층이 명확한 역할을 가지게 됩니다. 예를 들어, 데이터베이스 접근 로직은 데이터 소스 계층에, 비즈니스 로직은 도메인 계층에 배치하여 코드의 응집도를 높입니다.

## 핵심 개념

### 1. 주요 계층 구조

일반적인 레이어드 아키텍처는 3개의 주요 계층으로 구성됩니다:

```typescript
// 표현 계층 (Presentation Layer)
@Controller
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get('/orders/:id')
  async getOrder(@Param('id') orderId: string) {
    const order = await this.orderService.getOrder(orderId);
    return {
      id: order.id,
      customerName: order.customerName,
      totalAmount: order.totalAmount
    };
  }
}

// 도메인 계층 (Domain Layer)
@Service
export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async getOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async calculateTotalAmount(order: Order): Promise<number> {
    // 비즈니스 로직: 할인, 세금 계산 등
    return order.items.reduce((sum, item) => sum + item.price, 0);
  }
}

// 데이터 소스 계층 (Data Source Layer)
@Repository
export class OrderRepository {
  async findById(orderId: string): Promise<Order | null> {
    const result = await this.database.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    return result ? this.mapToOrder(result) : null;
  }

  async save(order: Order): Promise<void> {
    await this.database.query(
      'INSERT INTO orders (id, customer_name, total_amount) VALUES (?, ?, ?)',
      [order.id, order.customerName, order.totalAmount]
    );
  }
}
```

### 2. 계층별 책임과 역할

각 계층은 명확히 구분된 책임을 가집니다:

**표현 계층**은 사용자 입력을 처리하고 응답을 반환합니다. HTTP 요청 파싱, 입력 검증, 응답 포맷팅을 담당합니다.

**도메인 계층**은 핵심 비즈니스 로직을 수행합니다. 업무 규칙, 계산 로직, 도메인 객체 간의 상호작용을 관리합니다.

**데이터 소스 계층**은 데이터 저장소와의 상호작용을 담당합니다. 데이터베이스 쿼리, 파일 시스템 접근, 외부 API 호출 등을 수행합니다.

### 3. 의존성 방향과 호출 흐름

레이어드 아키텍처에서는 상위 계층이 하위 계층에만 의존합니다:

```typescript
// 올바른 의존성 방향 (상위 → 하위)
class UserController {
  constructor(private userService: UserService) {} // ✅ 표현 → 도메인
}

class UserService {
  constructor(private userRepository: UserRepository) {} // ✅ 도메인 → 데이터
}

// 잘못된 의존성 방향 (하위 → 상위)
class UserRepository {
  constructor(private userService: UserService) {} // ❌ 데이터 → 도메인
}
```

이러한 단방향 의존성은 순환 참조를 방지하고, 하위 계층의 변경이 상위 계층에 영향을 주지 않도록 보장합니다.

### 4. 싱크홀 안티 패턴과 대응 방안

싱크홀 안티 패턴은 중간 계층이 아무런 처리 없이 요청을 단순히 전달만 하는 현상입니다:

```typescript
// 싱크홀 안티 패턴 예시
@Service
export class OrderService {
  constructor(private orderDao: OrderRepository) {}

  // 아무런 비즈니스 로직 없이 단순 전달만 함
  async getOrder(orderId: string): Promise<Order> {
    return this.orderDao.findById(orderId); // ❌
  }
}

// 개선된 버전
@Service
export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async getOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    
    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    // 비즈니스 로직 추가
    await this.updateLastAccessedTime(order);
    this.validateOrderAccess(order);
    
    return order;
  }
}
```

## 정리

| 구분 | 설명 |
|------|------|
| **핵심 원칙** | 관심사 분리, 단방향 의존성 |
| **주요 계층** | 표현 → 도메인 → 데이터 소스 |
| **장점** | 유지보수성, 테스트 용이성, 독립적 확장 가능 |
| **단점** | 성능 오버헤드, 싱크홀 안티 패턴 위험 |
| **적용 상황** | 복잡한 비즈니스 로직, 장기간 유지보수가 필요한 시스템 |

레이어드 아키텍처는 코드의 구조화와 관심사 분리를 통해 유지보수성을 크게 향상시킵니다. 단, 싱크홀 안티 패턴을 방지하고 프로젝트 특성에 맞는 계층 설계를 하는 것이 중요합니다.