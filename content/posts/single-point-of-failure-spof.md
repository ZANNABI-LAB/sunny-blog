---
title: "단일 장애 지점(SPOF)이란 무엇인가요?"
shortTitle: "SPOF"
date: "2026-03-06"
tags: ["spof", "high-availability", "system-architecture"]
category: "Infrastructure"
summary: "시스템의 단일 장애 지점을 식별하고 해결하여 고가용성을 구현하는 방법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/175"
references:
  - "https://learn.microsoft.com/en-us/azure/architecture/framework/resiliency/overview"
  - "https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/"
---

## 단일 장애 지점(SPOF)이란?

단일 장애 지점(Single Point of Failure, SPOF)은 전체 시스템에서 특정 구성 요소가 제대로 동작하지 않을 경우, 전체 시스템이 중단되는 지점을 의미합니다. 즉, 하나의 부품이 고장나면 전체 서비스가 멈춰버리는 취약한 지점입니다.

시스템의 가용성(Availability)은 정상적인 사용 시간(Uptime)을 전체 시간으로 나눈 값으로 측정됩니다. 99.999%처럼 높은 가용성을 고가용성(High Availability, HA)이라 하며, 이를 달성하기 위해서는 SPOF를 식별하고 제거하는 작업이 필수적입니다.

## 핵심 개념

### 1. SPOF 식별과 분석

시스템에서 SPOF를 찾기 위해서는 각 구성 요소를 체계적으로 분석해야 합니다.

```typescript
// SPOF 분석 예시
interface SystemComponent {
  name: string;
  isSinglePoint: boolean;
  failureImpact: 'critical' | 'major' | 'minor';
  redundancyLevel: number;
}

const systemAnalysis: SystemComponent[] = [
  {
    name: 'API Server',
    isSinglePoint: true,  // 1대만 운영
    failureImpact: 'critical',
    redundancyLevel: 1
  },
  {
    name: 'Master DB',
    isSinglePoint: true,  // Master는 1대
    failureImpact: 'critical',
    redundancyLevel: 1
  },
  {
    name: 'Replica DB',
    isSinglePoint: false, // 3대로 구성
    failureImpact: 'minor',
    redundancyLevel: 3
  }
];
```

### 2. 서버 이중화와 로드 밸런싱

단일 API 서버는 대표적인 SPOF입니다. 서버 이중화와 로드 밸런서를 통해 이를 해결할 수 있습니다.

```typescript
// 로드 밸런서 설정 예시
interface LoadBalancerConfig {
  algorithm: 'round-robin' | 'least-connections' | 'weighted';
  healthCheck: {
    interval: number;
    timeout: number;
    path: string;
  };
  servers: ServerNode[];
}

interface ServerNode {
  id: string;
  host: string;
  port: number;
  weight?: number;
  status: 'healthy' | 'unhealthy';
}

const loadBalancerConfig: LoadBalancerConfig = {
  algorithm: 'round-robin',
  healthCheck: {
    interval: 30000, // 30초마다 체크
    timeout: 5000,
    path: '/health'
  },
  servers: [
    { id: 'api-1', host: '10.0.1.10', port: 8080, status: 'healthy' },
    { id: 'api-2', host: '10.0.1.11', port: 8080, status: 'healthy' },
    { id: 'api-3', host: '10.0.1.12', port: 8080, status: 'healthy' }
  ]
};
```

### 3. 이중화 시 고려사항

서버 이중화를 구현할 때 다음 사항들을 점검해야 합니다.

```typescript
// 분산 환경에서의 동시성 제어
class DistributedLockService {
  private redisClient: RedisClient;

  async acquireLock(key: string, ttl: number = 30000): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const lockValue = `${Date.now()}-${Math.random()}`;
    
    const result = await this.redisClient.set(
      lockKey, 
      lockValue, 
      'PX', ttl, 
      'NX'
    );
    
    return result === 'OK';
  }

  async releaseLock(key: string, lockValue: string): Promise<void> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    
    await this.redisClient.eval(script, 1, `lock:${key}`, lockValue);
  }
}

// 세션 관리 개선
interface SessionConfig {
  store: 'redis' | 'database' | 'memory';
  cluster: boolean;
  sticky: boolean;
  ttl: number;
}

const sessionConfig: SessionConfig = {
  store: 'redis',     // 외부 세션 저장소 사용
  cluster: true,      // 세션 클러스터링
  sticky: false,      // 스티키 세션 비활성화
  ttl: 1800          // 30분
};
```

### 4. 모니터링과 장애 복구

이중화된 시스템에서는 통합 모니터링과 자동 복구 메커니즘이 중요합니다.

```typescript
// 헬스체크 및 자동 복구
class HealthMonitor {
  private servers: ServerNode[];
  private alertThreshold: number = 2; // 연속 실패 횟수

  async performHealthCheck(server: ServerNode): Promise<boolean> {
    try {
      const response = await fetch(`http://${server.host}:${server.port}/health`, {
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.error(`Health check failed for ${server.id}:`, error);
      return false;
    }
  }

  async monitorServers(): Promise<void> {
    for (const server of this.servers) {
      const isHealthy = await this.performHealthCheck(server);
      
      if (!isHealthy) {
        server.failureCount = (server.failureCount || 0) + 1;
        
        if (server.failureCount >= this.alertThreshold) {
          await this.markServerUnhealthy(server);
          await this.sendAlert(server);
        }
      } else {
        server.failureCount = 0;
        if (server.status === 'unhealthy') {
          await this.markServerHealthy(server);
        }
      }
    }
  }

  private async markServerUnhealthy(server: ServerNode): Promise<void> {
    server.status = 'unhealthy';
    console.log(`Server ${server.id} marked as unhealthy`);
  }

  private async sendAlert(server: ServerNode): Promise<void> {
    // 알림 발송 로직
    console.log(`ALERT: Server ${server.id} is down!`);
  }
}
```

## 정리

| 구분 | SPOF 요소 | 해결 방안 |
|------|-----------|-----------|
| **인프라** | 단일 서버 | 서버 이중화 + 로드 밸런서 |
| **데이터베이스** | Master DB | Master-Master 구성 또는 자동 Failover |
| **네트워크** | 단일 네트워크 경로 | 다중 네트워크 경로 구성 |
| **애플리케이션** | 동시성 제어 | 분산 락 또는 DB 락 활용 |
| **세션 관리** | 서버별 세션 저장 | 외부 세션 저장소 또는 토큰 기반 인증 |

**핵심 체크포인트:**
- 시스템 구성 요소별 SPOF 식별
- 적절한 이중화 전략 수립
- 로드 밸런싱 알고리즘 선택
- 분산 환경에서의 동시성 처리
- 통합 모니터링 및 자동 복구 체계 구축

SPOF 제거는 단순히 서버 개수를 늘리는 것이 아니라, 시스템 전반의 아키텍처를 고려한 체계적인 접근이 필요합니다.