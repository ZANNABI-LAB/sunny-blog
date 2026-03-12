---
title: "테스트하기 쉬운 코드의 조건"
shortTitle: "테스트 가능한 코드"
date: "2026-03-12"
tags: ["testing", "clean-code", "software-quality", "test-driven-development"]
category: "Testing"
summary: "순수 함수, 단일 책임 원칙, 예측 가능성을 통해 테스트하기 쉬운 코드를 작성하는 방법을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/204"
references: ["https://martinfowler.com/articles/practical-test-pyramid.html", "https://testing-library.com/docs/guiding-principles/", "https://jestjs.io/docs/testing-frameworks"]
---

## 테스트하기 쉬운 코드란?

테스트하기 쉬운 코드는 예측 가능하고, 격리된 환경에서 검증할 수 있으며, 명확한 책임을 가진 코드입니다. 이러한 코드는 개발자가 자신감을 가지고 기능을 수정하거나 확장할 수 있게 해주며, 버그를 조기에 발견할 수 있도록 돕습니다.

테스트하기 어려운 코드는 보통 외부 의존성이 강하고, 여러 책임을 동시에 수행하며, 예측하기 어려운 동작을 포함합니다. 반대로 테스트하기 쉬운 코드는 이러한 복잡성을 제거하고 명확한 구조를 가집니다.

## 핵심 조건

### 1. 순수 함수 지향

순수 함수는 동일한 입력에 대해 항상 동일한 출력을 반환하며, 부수 효과가 없는 함수입니다. 이러한 함수는 테스트하기 가장 이상적입니다.

```typescript
// 테스트하기 어려운 비순수 함수
function calculatePriceWithTax(price: number): number {
  const taxRate = Math.random() * 0.1; // 예측 불가능한 값
  const now = new Date(); // 외부 상태 의존
  console.log(`계산 시간: ${now}`); // 부수 효과
  return price * (1 + taxRate);
}

// 테스트하기 쉬운 순수 함수
function calculatePriceWithTax(price: number, taxRate: number): number {
  return price * (1 + taxRate);
}

// 순수 함수의 테스트
describe('calculatePriceWithTax', () => {
  it('세금이 포함된 가격을 계산한다', () => {
    expect(calculatePriceWithTax(100, 0.1)).toBe(110);
    expect(calculatePriceWithTax(200, 0.05)).toBe(210);
  });
});
```

### 2. 단일 책임 원칙 준수

하나의 함수나 모듈은 하나의 명확한 책임만 가져야 합니다. 여러 책임을 가진 코드는 테스트 시나리오가 복잡해지고 실패 원인을 파악하기 어렵습니다.

```typescript
// 테스트하기 어려운 다중 책임 함수
async function processUserData(userId: string): Promise<void> {
  const user = await fetchUser(userId); // 데이터 가져오기
  const validUser = validateUser(user); // 검증
  const formattedUser = formatUserData(validUser); // 포맷팅
  await saveUser(formattedUser); // 저장
  sendNotification(formattedUser.email); // 알림 발송
}

// 테스트하기 쉬운 단일 책임 분리
class UserProcessor {
  constructor(
    private userRepository: UserRepository,
    private userValidator: UserValidator,
    private userFormatter: UserFormatter,
    private notificationService: NotificationService
  ) {}

  async processUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    const validUser = this.userValidator.validate(user);
    const formattedUser = this.userFormatter.format(validUser);
    await this.userRepository.save(formattedUser);
    await this.notificationService.send(formattedUser.email);
  }
}

// 각 구성 요소를 개별적으로 테스트 가능
describe('UserValidator', () => {
  it('유효한 사용자를 검증한다', () => {
    const validator = new UserValidator();
    const user = { name: 'John', email: 'john@example.com' };
    expect(validator.validate(user)).toEqual(user);
  });
});
```

### 3. 의존성 주입과 격리

외부 의존성을 직접 생성하지 않고 주입받도록 설계하면, 테스트 시 목(mock)이나 스텁(stub)으로 대체할 수 있습니다.

```typescript
// 테스트하기 어려운 강결합 코드
class OrderService {
  async createOrder(orderData: OrderData): Promise<Order> {
    const paymentGateway = new PaymentGateway(); // 직접 생성
    const emailService = new EmailService(); // 직접 생성
    
    const payment = await paymentGateway.process(orderData.payment);
    const order = new Order(orderData, payment);
    await emailService.sendConfirmation(order);
    
    return order;
  }
}

// 테스트하기 쉬운 의존성 주입 코드
class OrderService {
  constructor(
    private paymentGateway: PaymentGateway,
    private emailService: EmailService
  ) {}

  async createOrder(orderData: OrderData): Promise<Order> {
    const payment = await this.paymentGateway.process(orderData.payment);
    const order = new Order(orderData, payment);
    await this.emailService.sendConfirmation(order);
    
    return order;
  }
}

// 모킹을 통한 격리된 테스트
describe('OrderService', () => {
  it('주문을 성공적으로 생성한다', async () => {
    const mockPaymentGateway = {
      process: jest.fn().mockResolvedValue({ id: 'payment-123' })
    };
    const mockEmailService = {
      sendConfirmation: jest.fn().mockResolvedValue(undefined)
    };

    const orderService = new OrderService(mockPaymentGateway, mockEmailService);
    const order = await orderService.createOrder(orderData);

    expect(order).toBeDefined();
    expect(mockPaymentGateway.process).toHaveBeenCalledWith(orderData.payment);
    expect(mockEmailService.sendConfirmation).toHaveBeenCalledWith(order);
  });
});
```

### 4. 예측 가능한 구조

명확한 네이밍, 일관된 패턴, 예상 가능한 동작을 통해 코드의 예측 가능성을 높입니다.

```typescript
// 예측하기 어려운 코드
function processData(data: any): any {
  if (data.type === 'A') {
    return { ...data, processed: true, value: data.val * 2 };
  } else if (data.type === 'B') {
    return { ...data, processed: true, value: data.val + 10 };
  }
  return data;
}

// 예측 가능한 명확한 코드
interface ProcessableData {
  type: 'INCREMENT' | 'MULTIPLY';
  value: number;
}

interface ProcessedData extends ProcessableData {
  processed: true;
}

function processDataByType(data: ProcessableData): ProcessedData {
  switch (data.type) {
    case 'MULTIPLY':
      return { ...data, processed: true, value: data.value * 2 };
    case 'INCREMENT':
      return { ...data, processed: true, value: data.value + 10 };
    default:
      throw new Error(`Unsupported data type: ${data.type}`);
  }
}
```

## 정리

테스트하기 쉬운 코드의 핵심 조건들을 다음과 같이 정리할 수 있습니다:

| 조건 | 특징 | 효과 |
|------|------|------|
| **순수 함수** | 부수 효과 없음, 예측 가능한 출력 | 격리된 테스트 가능 |
| **단일 책임** | 한 가지 역할만 수행 | 테스트 시나리오 단순화 |
| **의존성 주입** | 외부 의존성 분리 | 모킹/스텁을 통한 격리 |
| **예측 가능성** | 명확한 구조와 네이밍 | 테스트 작성 용이성 증대 |

테스트를 위해 코드를 과도하게 수정하는 것은 지양해야 하지만, 테스트하기 어려운 코드는 대부분 설계상의 문제를 내포하고 있습니다. 따라서 테스트 용이성을 고려한 설계는 결과적으로 더 나은 코드 품질로 이어집니다.