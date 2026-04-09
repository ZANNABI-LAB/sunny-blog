---
title: "최종적 일관성(Eventual Consistency)이란?"
shortTitle: "최종적 일관성"
date: "2026-04-09"
tags: ["eventual-consistency", "distributed-systems", "database-replication", "consistency-models", "high-availability"]
category: "Backend"
summary: "분산 시스템에서 고가용성을 위해 사용하는 일관성 모델로, 일시적 데이터 불일치를 허용하되 결국 모든 노드가 동일한 데이터를 갖게 되는 방식입니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/284"
references: ["https://aws.amazon.com/builders-library/challenges-with-distributed-systems/", "https://docs.microsoft.com/en-us/azure/architecture/patterns/event-sourcing", "https://martinfowler.com/articles/patterns-of-distributed-systems/"]
---

## 최종적 일관성이란?

최종적 일관성(Eventual Consistency)은 분산 시스템에서 고가용성을 유지하기 위해 사용하는 일관성 모델입니다. 데이터가 변경되면 그 내용이 비동기적으로 다른 노드에 전파되어, 일시적으로 각 노드의 데이터가 다를 수 있지만 시간이 지나면 모든 노드가 동일한 데이터를 갖게 됩니다.

이는 CAP 정리에서 일관성(Consistency)보다 가용성(Availability)과 분할 허용성(Partition tolerance)을 우선시하는 접근법으로, 대규모 분산 시스템에서 널리 사용됩니다. NoSQL 데이터베이스나 분산 캐시 시스템에서 주로 채택하는 모델입니다.

## 핵심 개념

### 1. 비동기 데이터 복제

최종적 일관성에서는 데이터 변경이 즉시 모든 노드에 반영되지 않습니다. 마스터 노드에서 데이터가 변경되면, 백그라운드에서 다른 복제본들에게 변경사항을 전파합니다.

```typescript
// 예시: Redis 클러스터에서 데이터 복제
class RedisCluster {
  private masterNode: RedisNode;
  private replicaNodes: RedisNode[];

  async writeData(key: string, value: string): Promise<void> {
    // 마스터 노드에 즉시 쓰기
    await this.masterNode.set(key, value);
    
    // 복제본들에 비동기적으로 전파
    this.replicateAsync(key, value);
  }

  private async replicateAsync(key: string, value: string): Promise<void> {
    // 별도 스레드에서 복제 실행
    Promise.all(
      this.replicaNodes.map(replica => 
        replica.set(key, value).catch(err => this.handleReplicationError(err))
      )
    );
  }
}
```

### 2. 읽기 일관성의 다양한 수준

최종적 일관성 모델에서는 읽기 일관성의 수준을 조정할 수 있습니다. 시스템 요구사항에 따라 적절한 수준을 선택해야 합니다.

```typescript
enum ReadConsistency {
  EVENTUAL = 'eventual',     // 언젠가는 일관성 보장
  READ_YOUR_WRITES = 'ryw',  // 자신이 쓴 데이터는 즉시 읽기 가능
  MONOTONIC_READ = 'mr',     // 한 번 읽은 버전 이후로만 읽기 가능
  CAUSAL = 'causal'          // 인과관계가 있는 연산은 순서 보장
}

class EventuallyConsistentDB {
  async read(key: string, consistency: ReadConsistency): Promise<string> {
    switch (consistency) {
      case ReadConsistency.EVENTUAL:
        return this.readFromAnyReplica(key);
      case ReadConsistency.READ_YOUR_WRITES:
        return this.readFromMasterIfRecentWrite(key);
      case ReadConsistency.MONOTONIC_READ:
        return this.readFromSameOrNewerReplica(key);
      default:
        return this.readFromAnyReplica(key);
    }
  }
}
```

### 3. 강한 일관성과의 비교

강한 일관성(Strong Consistency)은 모든 읽기 연산이 최신 데이터를 반환하도록 보장합니다. 반면 최종적 일관성은 성능과 가용성을 위해 일시적인 불일치를 허용합니다.

```typescript
// 강한 일관성: 동기식 복제
class StrongConsistentDB {
  async write(key: string, value: string): Promise<void> {
    const promises = this.allNodes.map(node => node.write(key, value));
    await Promise.all(promises); // 모든 노드 쓰기 완료까지 대기
  }
}

// 최종적 일관성: 비동기식 복제
class EventualConsistentDB {
  async write(key: string, value: string): Promise<void> {
    await this.primaryNode.write(key, value); // 주 노드만 완료되면 반환
    this.replicateInBackground(key, value);   // 백그라운드에서 복제
  }
}
```

### 4. 실제 구현 사례

Amazon DynamoDB, Cassandra, MongoDB 등에서 최종적 일관성을 구현하는 방식을 살펴보면 공통적인 패턴을 발견할 수 있습니다.

```typescript
// DynamoDB 스타일의 최종적 일관성
interface DynamoDBConfig {
  readConsistency: 'eventual' | 'strong';
  writeConsistency: number; // W + R > N 공식
}

class DynamoTable {
  async getItem(key: string, consistent?: boolean): Promise<Item> {
    if (consistent) {
      // 강한 일관성: 모든 복제본에서 읽기
      return this.readFromMajority(key);
    } else {
      // 최종적 일관성: 임의의 복제본에서 읽기 (기본값)
      return this.readFromAnyReplica(key);
    }
  }
}
```

## 정리

| 특성 | 최종적 일관성 | 강한 일관성 |
|------|---------------|-------------|
| **데이터 정합성** | 일시적 불일치 허용 | 항상 최신 데이터 보장 |
| **가용성** | 높음 (부분 실패 시에도 서비스 가능) | 낮음 (일부 노드 실패 시 서비스 중단) |
| **성능** | 빠름 (즉시 응답) | 느림 (모든 노드 동기화 대기) |
| **복잡성** | 애플리케이션에서 불일치 처리 필요 | 간단한 프로그래밍 모델 |
| **사용 사례** | 소셜 미디어, 추천 시스템, 캐싱 | 금융 거래, 재고 관리 |

최종적 일관성은 현대 분산 시스템에서 확장성과 가용성을 확보하기 위한 핵심 전략입니다. 비즈니스 요구사항에 따라 적절한 일관성 수준을 선택하고, 불일치 상황에 대한 처리 로직을 구현하는 것이 중요합니다.