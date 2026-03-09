---
title: "테스트 더블: 효과적인 단위 테스트를 위한 가짜 객체"
shortTitle: "테스트 더블"
date: "2026-03-09"
tags: ["test-double", "unit-testing", "mock", "stub", "testing-strategy"]
category: "Testing"
summary: "테스트에서 실제 의존성을 대체하는 테스트 더블의 종류와 활용법을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/197"
references: ["https://martinfowler.com/bliki/TestDouble.html", "https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-testing", "https://jestjs.io/docs/mock-functions"]
---

## 테스트 더블이란?

테스트 더블(Test Double)은 테스트 코드에서 실제 의존성을 대체하는 가짜 객체입니다. 영화 촬영에서 배우 대신 위험한 장면을 연기하는 스턴트 더블(Stunt Double)에서 이름을 따왔습니다.

실제 의존성을 테스트에서 사용하면 여러 문제가 발생할 수 있습니다. 외부 API 호출로 인한 네트워크 지연, 데이터베이스 상태 변경으로 인한 부작용, 복잡한 설정이 필요한 외부 시스템 등이 대표적입니다. 테스트 더블은 이러한 문제를 해결하고 빠르고 안정적인 테스트를 가능하게 합니다.

테스트 더블을 활용하면 외부 의존성으로부터 테스트를 격리시키고, 테스트 실행 속도를 향상시키며, 예측 가능한 테스트 결과를 얻을 수 있습니다.

## 핵심 개념

### 1. 더미(Dummy) - 채우기용 객체

더미는 가장 단순한 형태의 테스트 더블로, 인스턴스화는 되지만 실제 동작은 하지 않습니다. 주로 메서드의 매개변수를 채우기 위해 사용됩니다.

```typescript
// 더미 객체 예시
class DummyEmailService implements EmailService {
  sendEmail(to: string, message: string): void {
    // 아무것도 하지 않음
  }
}

// 테스트에서 사용
test('사용자 등록 테스트', () => {
  const dummyEmailService = new DummyEmailService();
  const userService = new UserService(dummyEmailService);
  
  const user = userService.registerUser('test@example.com', 'password');
  
  expect(user.email).toBe('test@example.com');
});
```

### 2. 스텁(Stub) - 미리 준비된 응답

스텁은 호출에 대해 미리 준비된 응답을 반환합니다. 테스트에 필요한 특정 값을 반환하도록 설정할 수 있어 다양한 시나리오를 테스트할 수 있습니다.

```typescript
// 스텁 객체 예시
class StubUserRepository implements UserRepository {
  private users: User[] = [
    { id: 1, email: 'existing@example.com', name: 'John' }
  ];

  findByEmail(email: string): User | null {
    return this.users.find(user => user.email === email) || null;
  }

  save(user: User): User {
    return { ...user, id: this.users.length + 1 };
  }
}

// 테스트에서 활용
test('이미 존재하는 이메일로 등록 시 에러 발생', () => {
  const stubRepository = new StubUserRepository();
  const userService = new UserService(stubRepository);
  
  expect(() => {
    userService.registerUser('existing@example.com', 'password');
  }).toThrow('이미 존재하는 이메일입니다');
});
```

### 3. 스파이(Spy)와 목(Mock) - 검증 가능한 객체

스파이는 호출된 내역을 기록하고, 목은 기대한 상호작용이 발생했는지 검증합니다. 현대의 테스트 프레임워크에서는 둘을 통합하여 제공하는 경우가 많습니다.

```typescript
// Jest를 사용한 스파이/목 예시
test('이메일 발송이 올바르게 호출되는지 확인', () => {
  const mockEmailService = {
    sendEmail: jest.fn()
  };
  
  const userService = new UserService(mockEmailService);
  userService.registerUser('test@example.com', 'password');
  
  // 호출 여부 검증
  expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
    'test@example.com',
    expect.stringContaining('가입을 환영합니다')
  );
  
  // 호출 횟수 검증
  expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
});
```

### 4. 페이크(Fake) - 간단한 실제 구현

페이크는 실제 구현을 갖고 있지만 프로덕션에는 적합하지 않은 간단한 버전입니다. 인메모리 데이터베이스가 대표적인 예입니다.

```typescript
// 페이크 리포지토리 예시
class FakeUserRepository implements UserRepository {
  private users: Map<number, User> = new Map();
  private nextId = 1;

  save(user: User): User {
    const savedUser = { ...user, id: this.nextId++ };
    this.users.set(savedUser.id, savedUser);
    return savedUser;
  }

  findById(id: number): User | null {
    return this.users.get(id) || null;
  }

  findByEmail(email: string): User | null {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }
}

// 통합 테스트에서 활용
test('사용자 생성 후 조회 테스트', () => {
  const fakeRepository = new FakeUserRepository();
  const userService = new UserService(fakeRepository);
  
  const createdUser = userService.registerUser('test@example.com', 'password');
  const foundUser = userService.findUserById(createdUser.id);
  
  expect(foundUser?.email).toBe('test@example.com');
});
```

## 정리

| 테스트 더블 | 목적 | 특징 | 사용 시기 |
|------------|------|------|-----------|
| **더미** | 매개변수 채우기 | 동작하지 않음 | 의존성이 필요하지만 테스트와 무관한 경우 |
| **스텁** | 미리 정의된 응답 | 특정 값 반환 | 다양한 시나리오 테스트 시 |
| **스파이** | 호출 내역 기록 | 상호작용 추적 | 메서드 호출 여부 확인 시 |
| **목** | 행위 검증 | 기대값과 실제값 비교 | 올바른 상호작용 검증 시 |
| **페이크** | 단순한 실제 구현 | 실제 동작하는 구현 | 실제 동작이 필요하지만 단순한 테스트 시 |

테스트 더블을 적절히 활용하면 빠르고 안정적이며 독립적인 테스트를 작성할 수 있습니다. 각 더블의 특성을 이해하고 상황에 맞게 선택하는 것이 효과적인 테스트 작성의 핵심입니다.