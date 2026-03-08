---
title: "Redis 분산 잠금: 동시성 제어의 핵심 메커니즘"
shortTitle: "Redis 분산 잠금"
date: "2026-03-08"
tags: ["redis", "distributed-lock", "concurrency", "backend", "redlock"]
category: "Backend"
summary: "Redis SET 명령어와 RedLock 알고리즘을 활용한 분산 환경 잠금 구현 방법을 다룹니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/194"
references: ["https://redis.io/docs/manual/patterns/distributed-locks/", "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html"]
---

## Redis 분산 잠금이란?

분산 시스템에서 여러 서버가 동일한 자원에 동시 접근하는 것을 방지하기 위해 Redis를 활용한 잠금 메커니즘입니다. 단일 서버 환경에서는 메모리 기반 뮤텍스나 세마포어로 충분하지만, 분산 환경에서는 모든 서버가 공유할 수 있는 중앙 집중화된 잠금 저장소가 필요합니다.

Redis는 원자적 연산을 제공하고 높은 성능을 보장하므로, 분산 잠금 구현에 적합한 선택입니다. 특히 SET 명령어의 NX 옵션을 활용하면 간단하면서도 효과적인 분산 잠금을 구현할 수 있습니다.

## 핵심 개념

### 1. SET 명령어를 활용한 기본 구현

Redis의 SET 명령어에 NX(Not eXists) 옵션을 사용하여 분산 잠금을 구현합니다:

```typescript
import Redis from 'ioredis';

class DistributedLock {
  private redis: Redis;
  
  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }
  
  async acquireLock(lockKey: string, lockValue: string, ttlSeconds: number): Promise<boolean> {
    // SET key value NX EX ttl
    const result = await this.redis.set(lockKey, lockValue, 'NX', 'EX', ttlSeconds);
    return result === 'OK';
  }
  
  async releaseLock(lockKey: string, lockValue: string): Promise<boolean> {
    const script = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;
    
    const result = await this.redis.eval(script, 1, lockKey, lockValue);
    return result === 1;
  }
}

// 사용 예시
const lock = new DistributedLock('redis://localhost:6379');
const lockKey = 'order:12345';
const lockValue = `${process.pid}-${Date.now()}`;

if (await lock.acquireLock(lockKey, lockValue, 30)) {
  try {
    // 크리티컬 섹션 실행
    console.log('잠금 획득 성공, 작업 수행 중...');
    await processOrder();
  } finally {
    await lock.releaseLock(lockKey, lockValue);
  }
} else {
  console.log('잠금 획득 실패');
}
```

### 2. 레플리케이션 환경의 한계점

마스터-슬레이브 구조에서는 잠금 데이터 유실 위험이 존재합니다:

```typescript
// 문제 시나리오
async function problematicScenario() {
  // 1. 서버 A가 마스터에서 잠금 획득
  const lockAcquired = await redis.set('resource:lock', 'server-A', 'NX', 'EX', 60);
  
  // 2. 마스터 노드 장애 발생 (복제 전)
  // 3. 슬레이브가 마스터로 승격
  // 4. 서버 B가 동일한 잠금 획득 시도 -> 성공 (상호 배제 실패)
  
  // 결과: 두 서버가 동시에 크리티컬 섹션 실행
}
```

이러한 문제를 해결하기 위해 복제 지연을 고려한 대기 시간을 두거나, 더 강력한 일관성을 보장하는 RedLock 알고리즘을 사용할 수 있습니다.

### 3. RedLock 알고리즘 구현

여러 독립적인 Redis 노드에서 과반수 잠금을 획득하는 방식입니다:

```typescript
class RedLock {
  private redisNodes: Redis[];
  
  constructor(redisUrls: string[]) {
    this.redisNodes = redisUrls.map(url => new Redis(url));
  }
  
  async acquireRedLock(lockKey: string, lockValue: string, ttlMs: number): Promise<boolean> {
    const startTime = Date.now();
    const promises = this.redisNodes.map(redis => 
      this.tryLock(redis, lockKey, lockValue, ttlMs)
    );
    
    const results = await Promise.allSettled(promises);
    const successCount = results.filter(
      result => result.status === 'fulfilled' && result.value
    ).length;
    
    const elapsedTime = Date.now() - startTime;
    const isLockValid = successCount >= Math.floor(this.redisNodes.length / 2) + 1;
    const hasValidTtl = elapsedTime < ttlMs;
    
    if (isLockValid && hasValidTtl) {
      return true;
    }
    
    // 잠금 획득 실패 시 획득한 잠금들 해제
    await this.releaseRedLock(lockKey, lockValue);
    return false;
  }
  
  private async tryLock(redis: Redis, key: string, value: string, ttl: number): Promise<boolean> {
    try {
      const result = await redis.set(key, value, 'NX', 'PX', ttl);
      return result === 'OK';
    } catch (error) {
      return false;
    }
  }
  
  async releaseRedLock(lockKey: string, lockValue: string): Promise<void> {
    const script = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;
    
    const promises = this.redisNodes.map(redis =>
      redis.eval(script, 1, lockKey, lockValue).catch(() => 0)
    );
    
    await Promise.allSettled(promises);
  }
}

// 5개 노드로 RedLock 구성
const redLock = new RedLock([
  'redis://node1:6379',
  'redis://node2:6379',
  'redis://node3:6379',
  'redis://node4:6379',
  'redis://node5:6379'
]);
```

### 4. 잠금 안전성 보장 방법

잠금의 안전성을 높이기 위한 추가 고려사항들입니다:

```typescript
class SafeDistributedLock {
  private redis: Redis;
  
  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }
  
  async executeCriticalSection<T>(
    lockKey: string,
    operation: () => Promise<T>,
    options: { ttl: number; retryAttempts: number; retryDelay: number }
  ): Promise<T | null> {
    const lockValue = this.generateLockValue();
    
    // 재시도 로직
    for (let attempt = 0; attempt < options.retryAttempts; attempt++) {
      if (await this.acquireLock(lockKey, lockValue, options.ttl)) {
        try {
          // TTL 모니터링으로 안전성 강화
          const result = await this.executeWithTtlCheck(lockKey, lockValue, operation, options.ttl);
          return result;
        } finally {
          await this.releaseLock(lockKey, lockValue);
        }
      }
      
      await this.sleep(options.retryDelay);
    }
    
    return null; // 잠금 획득 실패
  }
  
  private async executeWithTtlCheck<T>(
    lockKey: string,
    lockValue: string,
    operation: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    const startTime = Date.now();
    
    const result = await operation();
    
    // 실행 시간이 TTL에 근접하면 경고
    const executionTime = Date.now() - startTime;
    if (executionTime > ttl * 0.8) {
      console.warn(`Operation took ${executionTime}ms, close to TTL ${ttl}ms`);
    }
    
    return result;
  }
  
  private generateLockValue(): string {
    return `${process.pid}-${Date.now()}-${Math.random()}`;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## 정리

| 구분 | 기본 Redis 잠금 | RedLock 알고리즘 |
|------|----------------|------------------|
| **구현 복잡도** | 단순 | 복잡 |
| **노드 구성** | 단일/마스터-슬레이브 | 다중 독립 노드 |
| **장애 허용성** | 마스터 장애 시 잠금 유실 위험 | 과반수 노드 생존 시 안전 |
| **성능** | 높음 | 상대적으로 낮음 |
| **사용 사례** | 일반적인 동시성 제어 | 높은 일관성 요구 사항 |

**핵심 구현 요소:**
- **원자적 연산**: SET NX EX 명령어로 잠금 획득과 TTL 설정을 원자적으로 처리
- **고유 식별자**: 잠금 해제 시 본인이 획득한 잠금인지 확인
- **TTL 설정**: 데드락 방지를 위한 자동 만료 시간
- **재시도 메커니즘**: 잠금 경합 상황에서의 백오프 전략
- **모니터링**: 잠금 보유 시간과 TTL 간 관계 추적