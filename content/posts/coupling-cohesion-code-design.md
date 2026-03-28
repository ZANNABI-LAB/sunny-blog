---
title: "결합도와 응집도: 좋은 코드 설계의 핵심 원칙"
shortTitle: "결합도와 응집도"
date: "2026-03-28"
tags: ["coupling", "cohesion", "code-design", "software-architecture", "clean-code"]
category: "Design Pattern"
summary: "결합도는 낮추고 응집도는 높여서 유지보수하기 쉬운 코드를 만드는 방법을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/250"
references: ["https://refactoring.guru/design-patterns", "https://martinfowler.com/articles/cohesion.html", "https://en.wikipedia.org/wiki/Coupling_(computer_science)"]
---

## 결합도와 응집도란?

결합도(Coupling)와 응집도(Cohesion)는 소프트웨어 설계의 품질을 측정하는 핵심 지표입니다. 결합도는 서로 다른 모듈 간의 의존 정도를 나타내고, 응집도는 모듈 내부 요소들이 얼마나 밀접하게 관련되어 있는지를 의미합니다.

좋은 소프트웨어 설계의 황금률은 "낮은 결합도, 높은 응집도"입니다. 이 원칙을 따르면 변경에 유연하고, 재사용 가능하며, 테스트하기 쉬운 코드를 작성할 수 있습니다. 두 개념은 서로 밀접한 관계가 있으며, 일반적으로 반비례하는 경향을 보입니다.

## 핵심 개념

### 1. 결합도(Coupling)의 이해

결합도는 모듈 간의 상호 의존 정도를 나타냅니다. 결합도가 높으면 한 모듈의 변경이 다른 모듈에 연쇄적인 영향을 미치므로, 가능한 한 낮추는 것이 중요합니다.

```typescript
// 높은 결합도 (Bad)
class EmailService {
  private database = new MySQLDatabase(); // 구체 클래스에 직접 의존
  
  sendEmail(userId: string, message: string) {
    const user = this.database.findUser(userId); // 데이터베이스 구현에 강하게 결합
    console.log(`Sending email to ${user.email}: ${message}`);
  }
}

// 낮은 결합도 (Good)
interface UserRepository {
  findUser(userId: string): User;
}

class EmailService {
  constructor(private userRepository: UserRepository) {} // 인터페이스에 의존
  
  sendEmail(userId: string, message: string) {
    const user = this.userRepository.findUser(userId);
    console.log(`Sending email to ${user.email}: ${message}`);
  }
}
```

결합도를 낮추면 테스트가 용이해지고, 다른 데이터베이스로 쉽게 교체할 수 있습니다.

### 2. 응집도(Cohesion)의 중요성

응집도는 모듈 내부 요소들이 단일한 목적을 위해 얼마나 잘 협력하는지를 나타냅니다. 높은 응집도를 가진 모듈은 명확한 책임을 가지며 이해하기 쉽습니다.

```typescript
// 낮은 응집도 (Bad)
class UserManager {
  validateEmail(email: string): boolean {
    return email.includes('@');
  }
  
  sendNotification(message: string): void {
    console.log(`Notification: ${message}`);
  }
  
  calculateTax(amount: number): number {
    return amount * 0.1;
  }
  
  formatDate(date: Date): string {
    return date.toISOString();
  }
}

// 높은 응집도 (Good)
class EmailValidator {
  validate(email: string): boolean {
    return email.includes('@') && email.includes('.');
  }
  
  isValidDomain(email: string): boolean {
    const domain = email.split('@')[1];
    return domain && domain.length > 0;
  }
}

class NotificationService {
  send(message: string): void {
    console.log(`Notification: ${message}`);
  }
  
  sendBatch(messages: string[]): void {
    messages.forEach(message => this.send(message));
  }
}
```

각 클래스가 명확하고 단일한 책임을 가지므로 유지보수가 쉬워집니다.

### 3. React 컴포넌트에서의 적용

프론트엔드 개발에서도 결합도와 응집도 원칙이 중요합니다. 특히 React 컴포넌트 설계에서 이 원칙들을 잘 적용할 수 있습니다.

```tsx
// 높은 결합도, 낮은 응집도 (Bad)
const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState(null);
  
  useEffect(() => {
    // 여러 API 호출이 한 컴포넌트에서 처리
    fetchUser(userId).then(setUser);
    fetchNotifications(userId).then(setNotifications);
    fetchSettings(userId).then(setSettings);
  }, [userId]);
  
  return (
    <div>
      <div>{user?.name}</div>
      <div>{notifications.length} notifications</div>
      <div>Settings: {settings?.theme}</div>
    </div>
  );
};

// 낮은 결합도, 높은 응집도 (Good)
const UserInfo = ({ user }: { user: User }) => (
  <div className="user-info">
    <h2>{user.name}</h2>
    <p>{user.email}</p>
  </div>
);

const NotificationBadge = ({ count }: { count: number }) => (
  <div className="notification-badge">
    {count} notifications
  </div>
);

const UserProfile = ({ userId }: { userId: string }) => {
  const { user, notifications, settings } = useUserData(userId);
  
  return (
    <div className="user-profile">
      <UserInfo user={user} />
      <NotificationBadge count={notifications.length} />
      <SettingsPanel settings={settings} />
    </div>
  );
};
```

### 4. 모듈 간 의존성 관리

의존성 주입(Dependency Injection)과 인터페이스 활용을 통해 결합도를 효과적으로 낮출 수 있습니다.

```typescript
// 결합도를 낮추는 패턴들
interface Logger {
  log(message: string): void;
}

interface PaymentGateway {
  processPayment(amount: number): Promise<boolean>;
}

class OrderService {
  constructor(
    private logger: Logger,
    private paymentGateway: PaymentGateway
  ) {}
  
  async processOrder(order: Order): Promise<void> {
    this.logger.log(`Processing order ${order.id}`);
    
    const success = await this.paymentGateway.processPayment(order.total);
    
    if (success) {
      this.logger.log(`Order ${order.id} completed`);
    } else {
      this.logger.log(`Order ${order.id} failed`);
    }
  }
}

// 구체적인 구현체들
class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(message);
  }
}

class StripePaymentGateway implements PaymentGateway {
  async processPayment(amount: number): Promise<boolean> {
    // Stripe API 호출
    return true;
  }
}
```

## 정리

| 구분 | 결합도 (Coupling) | 응집도 (Cohesion) |
|------|------------------|------------------|
| **정의** | 모듈 간 의존 정도 | 모듈 내부 요소들의 관련성 |
| **목표** | 낮게 유지 | 높게 유지 |
| **장점** | 독립성, 재사용성, 유지보수성 향상 | 명확한 책임, 가독성, 예측 가능성 |
| **구현 방법** | 인터페이스, 의존성 주입, 추상화 | 단일 책임 원칙, 기능별 분리 |
| **측정 기준** | 다른 모듈 변경 시 영향 범위 | 모듈 내 기능들의 일관성 |

**핵심 원칙**: 모듈 간에는 느슨하게 연결하고(낮은 결합도), 모듈 내부는 긴밀하게 협력하도록(높은 응집도) 설계하는 것이 좋은 소프트웨어 아키텍처의 기반입니다.