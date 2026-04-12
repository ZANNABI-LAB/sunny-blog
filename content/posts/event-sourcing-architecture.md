---
title: "이벤트 소싱: 상태가 아닌 변화를 저장하는 아키텍처 패턴"
shortTitle: "이벤트 소싱"
date: "2026-04-12"
tags: ["event-sourcing", "architecture-pattern", "data-storage", "cqrs", "domain-driven-design"]
category: "Architecture"
summary: "데이터의 최종 상태 대신 상태 변경 이벤트들을 저장하여 시스템의 모든 변화를 추적할 수 있는 아키텍처 패턴입니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/292"
references: ["https://martinfowler.com/eaaDev/EventSourcing.html", "https://microservices.io/patterns/data/event-sourcing.html", "https://docs.microsoft.com/en-us/azure/architecture/patterns/event-sourcing"]
---

## 이벤트 소싱이란?

이벤트 소싱(Event Sourcing)은 데이터의 현재 상태를 직접 저장하는 대신, 상태를 변경시킨 모든 이벤트들의 순차적 기록을 저장하는 아키텍처 패턴입니다. 전통적인 CRUD 방식에서는 데이터의 최종 상태만 유지하지만, 이벤트 소싱에서는 "무엇이 일어났는지"에 대한 완전한 히스토리를 보존합니다.

체스 게임을 예로 들면, 현재 체스판의 말 배치 상태를 저장하는 대신 "백색 폰이 e2에서 e4로 이동", "흑색 나이트가 b8에서 c6으로 이동"과 같은 모든 수(move)를 기록하는 방식입니다. 이러한 이벤트들을 순서대로 재생(replay)하면 언제든지 체스판의 현재 상태를 재구성할 수 있습니다.

이벤트 소싱은 특히 도메인의 비즈니스 로직이 복잡하고, 변화의 추적이 중요한 시스템에서 강력한 패턴으로 활용됩니다.

## 핵심 개념

### 1. 이벤트 스토어와 이벤트 스트림

이벤트 소싱의 핵심은 이벤트 스토어(Event Store)입니다. 모든 도메인 이벤트는 발생 순서대로 append-only 방식으로 저장됩니다.

```typescript
// 이벤트 인터페이스
interface DomainEvent {
  eventId: string;
  aggregateId: string;
  eventType: string;
  eventData: any;
  timestamp: Date;
  version: number;
}

// 은행 계좌 이벤트 예시
interface AccountCreated extends DomainEvent {
  eventType: 'AccountCreated';
  eventData: {
    accountId: string;
    initialBalance: number;
    ownerId: string;
  };
}

interface MoneyDeposited extends DomainEvent {
  eventType: 'MoneyDeposited';
  eventData: {
    amount: number;
    description: string;
  };
}

interface MoneyWithdrawn extends DomainEvent {
  eventType: 'MoneyWithdrawn';
  eventData: {
    amount: number;
    description: string;
  };
}
```

### 2. 이벤트 재생(Event Replay)과 상태 재구성

저장된 이벤트들을 순차적으로 적용하여 애그리게이트의 현재 상태를 복원합니다.

```typescript
class BankAccount {
  private accountId: string;
  private balance: number = 0;
  private ownerId: string;
  private version: number = 0;

  // 이벤트로부터 상태 복원
  static fromEvents(events: DomainEvent[]): BankAccount {
    const account = new BankAccount();
    
    events.forEach(event => {
      account.apply(event);
    });
    
    return account;
  }

  private apply(event: DomainEvent): void {
    switch (event.eventType) {
      case 'AccountCreated':
        const created = event as AccountCreated;
        this.accountId = created.eventData.accountId;
        this.balance = created.eventData.initialBalance;
        this.ownerId = created.eventData.ownerId;
        break;
        
      case 'MoneyDeposited':
        const deposited = event as MoneyDeposited;
        this.balance += deposited.eventData.amount;
        break;
        
      case 'MoneyWithdrawn':
        const withdrawn = event as MoneyWithdrawn;
        this.balance -= withdrawn.eventData.amount;
        break;
    }
    
    this.version = event.version;
  }

  getBalance(): number {
    return this.balance;
  }
}
```

### 3. 스냅샷(Snapshot)을 통한 성능 최적화

이벤트가 많아질수록 재생 시간이 길어지는 문제를 해결하기 위해 주기적으로 스냅샷을 생성합니다.

```typescript
interface Snapshot {
  aggregateId: string;
  version: number;
  timestamp: Date;
  data: any;
}

class EventStore {
  async loadAggregate(aggregateId: string): Promise<BankAccount> {
    // 최신 스냅샷 조회
    const snapshot = await this.getLatestSnapshot(aggregateId);
    
    let account: BankAccount;
    let fromVersion = 0;
    
    if (snapshot) {
      account = BankAccount.fromSnapshot(snapshot);
      fromVersion = snapshot.version + 1;
    } else {
      account = new BankAccount();
    }
    
    // 스냅샷 이후의 이벤트만 재생
    const events = await this.getEventsFromVersion(aggregateId, fromVersion);
    events.forEach(event => account.apply(event));
    
    return account;
  }

  async saveSnapshot(aggregateId: string, account: BankAccount): Promise<void> {
    const snapshot: Snapshot = {
      aggregateId,
      version: account.getVersion(),
      timestamp: new Date(),
      data: account.toSnapshot()
    };
    
    await this.storeSnapshot(snapshot);
  }
}
```

### 4. CQRS 패턴과의 결합

이벤트 소싱은 종종 CQRS(Command Query Responsibility Segregation) 패턴과 함께 사용됩니다. 명령(Command) 처리는 이벤트 소싱으로, 조회(Query)는 별도의 읽기 전용 모델로 분리합니다.

```typescript
// Command Side - 이벤트 소싱
class AccountCommandHandler {
  constructor(private eventStore: EventStore) {}

  async handleDeposit(command: DepositCommand): Promise<void> {
    const account = await this.eventStore.loadAggregate(command.accountId);
    
    // 비즈니스 로직 실행
    const event = account.deposit(command.amount, command.description);
    
    // 이벤트 저장
    await this.eventStore.saveEvent(command.accountId, event);
  }
}

// Query Side - 프로젝션
class AccountQueryHandler {
  constructor(private readModel: AccountReadModel) {}

  async getAccountBalance(accountId: string): Promise<number> {
    return await this.readModel.getBalance(accountId);
  }

  async getTransactionHistory(accountId: string): Promise<Transaction[]> {
    return await this.readModel.getTransactions(accountId);
  }
}
```

## 정리

| 측면 | 장점 | 단점 |
|------|------|------|
| **데이터 추적** | 완전한 감사 로그, 과거 상태 복원 가능 | 저장 공간 증가 |
| **성능** | 쓰기 성능 우수 (append-only) | 읽기 성능 저하 (재생 필요) |
| **유연성** | 비즈니스 로직 변경에 유연, 새로운 프로젝션 생성 가능 | 복잡한 구현 |
| **디버깅** | 문제 상황 재현 용이, 상세한 히스토리 | 이벤트 스키마 변경 어려움 |

**적용 고려사항:**
- 도메인이 복잡하고 변화 추적이 중요한 경우
- 감사(audit) 요구사항이 강한 금융, 의료 등의 도메인
- 높은 쓰기 처리량이 필요한 시스템
- 스냅샷과 CQRS 패턴을 함께 고려하여 구현