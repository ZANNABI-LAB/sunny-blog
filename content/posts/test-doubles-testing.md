---
title: "테스트 더블: 테스트에서 의존성을 대체하는 방법"
shortTitle: "테스트 더블"
date: "2026-03-10"
tags: ["test-double", "unit-testing", "mocking", "stub", "testing-strategy"]
category: "Testing"
summary: "테스트 더블의 종류와 각각의 역할을 알아보고, 언제 어떤 테스트 더블을 사용해야 하는지 학습합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/197"
references: ["https://martinfowler.com/bliki/TestDouble.html", "https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-testing", "https://jestjs.io/docs/mock-functions"]
---

## 테스트 더블이란?

테스트 더블(Test Double)은 테스트 코드에서 실제 의존성을 대체하는 가짜 객체입니다. 영화에서 배우 대신 위험한 장면을 연기하는 스턴트 더블에서 이름을 따왔습니다.

실제 의존성을 테스트에서 그대로 사용하면 여러 문제가 발생합니다. 외부 시스템에 부수 효과를 일으키거나, 네트워크나 데이터베이스 상태에 따라 테스트 결과가 달라질 수 있습니다. 또한 복잡한 설정이 필요하거나 실행 시간이 오래 걸릴 수도 있습니다.

테스트 더블은 이러한 문제를 해결하여 안정적이고 빠른 테스트를 작성할 수 있게 해줍니다. 테스트로부터 외부 세계를 보호하고, 반대로 외부 환경으로부터 테스트를 보호하는 역할을 합니다.

## 핵심 개념

### 1. 더미(Dummy)

더미는 가장 단순한 형태의 테스트 더블로, 아무런 동작도 하지 않습니다. 단순히 메서드 파라미터를 채우거나 객체 인스턴스가 필요한 경우에만 사용됩니다.

```typescript
interface EmailService {
  send(to: string, subject: string, body: string): void;
}

class DummyEmailService implements EmailService {
  send(to: string, subject: string, body: string): void {
    // 아무것도 하지 않음
  }
}

// 사용 예시
test('user registration', () => {
  const emailService = new DummyEmailService(); // 실제로는 사용되지 않음
  const userService = new UserService(emailService);
  
  const user = userService.createUser('john', 'john@example.com');
  
  expect(user.name).toBe('john');
});
```

### 2. 스텁(Stub)과 페이크(Fake)

스텁은 미리 정의된 답변을 반환하는 테스트 더블입니다. 페이크는 실제로 동작하지만 운영 환경에는 적합하지 않은 단순한 구현체입니다.

```typescript
// 스텁 예시
class StubPaymentService implements PaymentService {
  process(amount: number): PaymentResult {
    // 항상 성공 응답 반환
    return { success: true, transactionId: 'test-123' };
  }
}

// 페이크 예시
class FakeUserRepository implements UserRepository {
  private users: User[] = [];
  
  save(user: User): User {
    this.users.push(user);
    return user;
  }
  
  findById(id: string): User | null {
    return this.users.find(u => u.id === id) || null;
  }
}

test('payment processing', () => {
  const paymentService = new StubPaymentService();
  const orderService = new OrderService(paymentService);
  
  const result = orderService.processOrder({ amount: 1000 });
  
  expect(result.status).toBe('completed');
});
```

### 3. 스파이(Spy)와 목(Mock)

스파이는 호출된 내역을 기록하는 테스트 더블입니다. 목은 기대하는 상호작용이 일어나는지 검증하며, 기대와 다르면 예외를 발생시킵니다.

```typescript
// 스파이 예시
class SpyEmailService implements EmailService {
  public sentEmails: Array<{to: string, subject: string, body: string}> = [];
  
  send(to: string, subject: string, body: string): void {
    this.sentEmails.push({ to, subject, body });
  }
}

// 목 예시 (Jest 사용)
test('user registration sends welcome email', () => {
  const mockEmailService = {
    send: jest.fn()
  };
  
  const userService = new UserService(mockEmailService);
  
  userService.registerUser('john', 'john@example.com');
  
  // 호출 검증
  expect(mockEmailService.send).toHaveBeenCalledWith(
    'john@example.com',
    'Welcome!',
    'Welcome to our service'
  );
  expect(mockEmailService.send).toHaveBeenCalledTimes(1);
});

// 엄격한 목 예시
test('order processing with strict mock', () => {
  const mockPaymentService = jest.fn();
  mockPaymentService.mockReturnValue({ success: true, id: '123' });
  
  const orderService = new OrderService({ process: mockPaymentService });
  
  orderService.processOrder({ amount: 1000, currency: 'USD' });
  
  // 정확한 파라미터로 호출되었는지 검증
  expect(mockPaymentService).toHaveBeenCalledWith(
    expect.objectContaining({
      amount: 1000,
      currency: 'USD'
    })
  );
});
```

### 4. 테스트 더블 선택 기준

각 테스트 더블은 다른 상황에서 사용됩니다:

```typescript
// 상태 검증이 중요한 경우 - Fake 사용
test('user repository operations', () => {
  const fakeRepo = new FakeUserRepository();
  const userService = new UserService(fakeRepo);
  
  userService.createUser('alice', 'alice@example.com');
  
  const savedUser = fakeRepo.findById('alice');
  expect(savedUser).toBeDefined();
  expect(savedUser?.email).toBe('alice@example.com');
});

// 상호작용 검증이 중요한 경우 - Mock 사용
test('notification service integration', () => {
  const mockNotificationService = jest.fn();
  const userService = new UserService(mockNotificationService);
  
  userService.deleteUser('user123');
  
  expect(mockNotificationService).toHaveBeenCalledWith({
    type: 'user-deleted',
    userId: 'user123'
  });
});

// 단순한 의존성 주입 - Dummy 사용
test('user validation logic', () => {
  const dummyLogger = { log: () => {} };
  const validator = new UserValidator(dummyLogger);
  
  const isValid = validator.validate({ email: 'invalid-email' });
  
  expect(isValid).toBe(false);
});
```

## 정리

| 테스트 더블 | 목적 | 사용 시점 |
|-------------|------|-----------|
| **Dummy** | 객체 인스턴스만 필요 | 의존성이 실제로 사용되지 않을 때 |
| **Stub** | 미리 정의된 응답 반환 | 특정 응답값이 필요할 때 |
| **Fake** | 단순한 실제 구현 제공 | 상태 기반 테스트에서 복잡한 설정을 피하고 싶을 때 |
| **Spy** | 호출 내역 기록 | 메서드 호출 여부나 횟수를 확인할 때 |
| **Mock** | 기대 행위 검증 | 정확한 상호작용을 강제하고 검증할 때 |

테스트 더블을 적절히 활용하면 외부 의존성으로부터 독립적인 단위 테스트를 작성할 수 있습니다. 각 테스트 더블의 특성을 이해하고, 테스트 목적에 맞는 적절한 더블을 선택하는 것이 핵심입니다.