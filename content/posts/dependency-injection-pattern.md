---
title: "의존성 주입(Dependency Injection)이란 무엇인가요?"
shortTitle: "의존성 주입"
date: "2026-03-06"
tags: ["dependency-injection", "design-pattern", "oop", "spring"]
category: "Backend"
summary: "객체 간 결합도를 낮추고 유연한 설계를 만드는 의존성 주입 패턴을 살펴봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/183"
references: ["https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html", "https://martinfowler.com/articles/injection.html"]
---

## 의존성 주입이란?

의존성 주입(Dependency Injection)은 객체지향 프로그래밍에서 객체 간의 결합도를 낮추기 위한 설계 패턴입니다. A 객체가 B 객체를 필요로 할 때, A가 직접 B를 생성하는 대신 외부에서 B를 생성하여 A에게 전달하는 방식을 말합니다.

이 패턴의 핵심은 '제어의 역전(Inversion of Control)'입니다. 객체가 자신의 의존성을 직접 관리하는 대신, 외부에서 의존성을 주입받아 사용합니다. 이를 통해 코드의 변경 없이 다양한 실행 구조를 만들 수 있어 유연하고 재사용 가능한 설계가 가능합니다.

```typescript
// 의존성 주입 적용 전
class UserService {
  private userRepository: UserRepository;
  
  constructor() {
    this.userRepository = new MySQLUserRepository(); // 직접 생성
  }
}

// 의존성 주입 적용 후
class UserService {
  constructor(private userRepository: UserRepository) {} // 외부에서 주입
}
```

## 핵심 개념

### 1. 의존성 주입의 장점

의존성 주입은 여러 가지 이점을 제공합니다. 먼저 **결합도 감소**를 통해 객체 간의 강한 결합을 약한 결합으로 변경합니다. 또한 **테스트 용이성**이 향상되어 Mock 객체를 쉽게 주입할 수 있습니다.

```typescript
interface PaymentService {
  processPayment(amount: number): boolean;
}

class OrderService {
  constructor(private paymentService: PaymentService) {}
  
  createOrder(amount: number): void {
    if (this.paymentService.processPayment(amount)) {
      // 주문 생성 로직
    }
  }
}

// 테스트에서 Mock 객체 주입 가능
const mockPaymentService = {
  processPayment: jest.fn().mockReturnValue(true)
};
const orderService = new OrderService(mockPaymentService);
```

**확장성**과 **유연성**도 크게 개선됩니다. 새로운 구현체를 추가하거나 기존 구현체를 변경할 때 기존 코드를 수정할 필요가 없습니다.

### 2. 의존성 주입 방식

의존성 주입은 주입 위치에 따라 세 가지 방식으로 구분됩니다.

**생성자 주입(Constructor Injection)**은 가장 일반적이고 권장되는 방식입니다. 객체 생성 시점에 모든 의존성이 주입되어 객체가 완전한 상태로 생성됩니다.

```typescript
class EmailService {
  constructor(
    private smtpClient: SMTPClient,
    private templateEngine: TemplateEngine
  ) {}
}
```

**Setter 주입(Setter Injection)**은 선택적 의존성이나 순환 의존성 해결에 유용합니다.

```typescript
class NotificationService {
  private logger?: Logger;
  
  setLogger(logger: Logger): void {
    this.logger = logger;
  }
}
```

**메서드 주입(Method Injection)**은 실행 시점마다 다른 의존성이 필요한 경우에 사용합니다.

```typescript
class DataProcessor {
  processData(data: any[], validator: DataValidator): void {
    const validData = validator.validate(data);
    // 처리 로직
  }
}
```

### 3. DI 컨테이너와 프레임워크

실제 개발에서는 DI 컨테이너를 사용하여 의존성 주입을 자동화합니다. Spring Framework의 예시를 살펴보겠습니다.

```java
@Service
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;
    
    @Autowired
    public UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
}
```

TypeScript에서는 InversifyJS 같은 라이브러리를 활용할 수 있습니다.

```typescript
@injectable()
class UserController {
  constructor(
    @inject('UserService') private userService: UserService,
    @inject('Logger') private logger: Logger
  ) {}
}
```

### 4. 실전 적용 시 고려사항

의존성 주입 적용 시 몇 가지 주의점이 있습니다. **순환 의존성**을 피해야 하며, 이는 설계 문제일 가능성이 높습니다. **인터페이스 분리 원칙**을 따라 필요한 메서드만 노출하는 인터페이스를 설계해야 합니다.

```typescript
// 좋은 예: 역할별로 인터페이스 분리
interface UserReader {
  findById(id: string): User | null;
}

interface UserWriter {
  save(user: User): void;
}

class UserService {
  constructor(
    private userReader: UserReader,
    private userWriter: UserWriter
  ) {}
}
```

**생성자 주입을 우선적으로 사용**하되, 팀 내 합의된 규칙을 따르는 것이 중요합니다. 과도한 의존성 주입은 오히려 코드 복잡성을 증가시킬 수 있으므로 적절한 균형을 유지해야 합니다.

## 정리

| 구분 | 내용 |
|------|------|
| **핵심 개념** | 외부에서 의존성을 주입하여 객체 간 결합도를 낮추는 패턴 |
| **주요 장점** | 결합도 감소, 테스트 용이성, 확장성, 유연성 향상 |
| **주입 방식** | 생성자 주입(권장), Setter 주입, 메서드 주입 |
| **적용 도구** | Spring Framework, InversifyJS, Angular DI 등 |
| **주의사항** | 순환 의존성 방지, 인터페이스 분리, 적절한 균형 유지 |

의존성 주입은 현대 소프트웨어 개발에서 필수적인 설계 패턴입니다. 초기에는 복잡해 보일 수 있지만, 장기적으로 유지보수성과 확장성 측면에서 큰 이점을 제공합니다. 팀 내 컨벤션을 정하고 일관성 있게 적용하는 것이 성공적인 도입의 핵심입니다.