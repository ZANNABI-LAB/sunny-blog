---
title: "헬스체크로 서버 상태 모니터링하기"
shortTitle: "헬스체크"
date: "2026-04-18"
tags: ["health-check", "monitoring", "load-balancer", "spring-actuator", "server-management"]
category: "Backend"
summary: "서버의 상태를 실시간으로 확인하고 장애를 사전에 감지하는 헬스체크 구현 방법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/311"
references: ["https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html", "https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/"]
---

## 헬스체크란?

헬스체크(Health Check)는 서버나 애플리케이션의 현재 상태가 정상적으로 동작하는지 확인하는 모니터링 기법입니다. 주기적으로 서버의 상태를 점검하여 장애를 조기에 발견하고, 문제가 있는 서버를 자동으로 트래픽에서 제외시키는 역할을 합니다.

일반적으로 HTTP 엔드포인트 호출이나 TCP 포트 연결 시도를 통해 서버의 응답성을 확인합니다. 성공적인 응답을 받으면 서버가 정상 상태로 판단하고, 응답이 없거나 오류가 발생하면 비정상 상태로 간주합니다.

## 핵심 개념

### 1. 헬스체크의 필요성

헬스체크는 서비스 안정성 확보에 필수적입니다. 새로운 코드 배포 시 배포가 성공적으로 완료되었는지 확인할 수 있으며, 런타임 중 발생하는 장애를 빠르게 감지할 수 있습니다.

```typescript
// Express.js 헬스체크 예시
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION
  };
  
  res.status(200).json(healthStatus);
});
```

CPU, 메모리, 디스크 I/O 등 시스템 자원의 고갈이나 내부 오류 상태를 조기에 감지하여 전체 시스템의 안정성을 보장합니다.

### 2. 로드밸런서와의 연동

로드밸런서는 헬스체크 결과를 기반으로 트래픽 분산을 조절합니다. 여러 서버 중 일부가 비정상 상태일 때, 해당 서버를 자동으로 트래픽에서 제외시켜 사용자 요청을 정상 서버로만 전달합니다.

```java
// Spring Boot Actuator 헬스체크 커스터마이징
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    
    @Autowired
    private DataSource dataSource;
    
    @Override
    public Health health() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(1)) {
                return Health.up()
                    .withDetail("database", "Available")
                    .build();
            }
        } catch (SQLException e) {
            return Health.down()
                .withDetail("database", "Connection failed")
                .withException(e)
                .build();
        }
        return Health.down().build();
    }
}
```

이러한 자동 장애 조치를 통해 전체 시스템의 가용성을 높이고 사용자 경험을 개선할 수 있습니다.

### 3. 헬스체크 구현 방식

헬스체크는 단순한 응답 확인부터 복합적인 상태 점검까지 다양한 방식으로 구현할 수 있습니다. 가장 기본적인 형태는 특정 엔드포인트에서 HTTP 200 응답을 반환하는 것입니다.

```typescript
// 복합 헬스체크 구현
interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: {
    database: boolean;
    redis: boolean;
    externalApi: boolean;
  };
  responseTime: number;
}

async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  const [dbStatus, redisStatus, apiStatus] = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkExternalApi()
  ]);
  
  const checks = {
    database: dbStatus.status === 'fulfilled',
    redis: redisStatus.status === 'fulfilled',
    externalApi: apiStatus.status === 'fulfilled'
  };
  
  const healthyCount = Object.values(checks).filter(Boolean).length;
  let status: HealthCheckResult['status'];
  
  if (healthyCount === 3) status = 'healthy';
  else if (healthyCount >= 2) status = 'degraded';
  else status = 'unhealthy';
  
  return {
    status,
    checks,
    responseTime: Date.now() - startTime
  };
}
```

Spring Boot의 경우 Actuator를 통해 기본적인 헬스체크 기능을 제공하며, 데이터베이스, 메시징 시스템 등 다양한 컴포넌트의 상태를 종합적으로 확인할 수 있습니다.

### 4. 헬스체크 모범 사례

효과적인 헬스체크를 위해서는 적절한 타임아웃 설정과 재시도 정책이 필요합니다. 너무 짧은 타임아웃은 일시적인 지연을 장애로 오인할 수 있고, 너무 긴 타임아웃은 실제 장애 감지를 지연시킬 수 있습니다.

```java
// Spring Boot application.yml 설정
management:
  health:
    probes:
      enabled: true
    livenessstate:
      enabled: true
    readinessstate:
      enabled: true
  endpoint:
    health:
      show-details: always
      probes:
        enabled: true
```

또한 헬스체크 자체가 시스템에 부하를 주지 않도록 가벼운 작업으로 구성하고, 핵심 기능의 가용성을 정확히 반영할 수 있도록 설계해야 합니다.

## 정리

| 구분 | 내용 |
|------|------|
| **목적** | 서버 상태 실시간 모니터링 및 장애 조기 감지 |
| **구현 방법** | HTTP 엔드포인트, TCP 연결, Spring Actuator |
| **핵심 기능** | 자동 트래픽 제외, 배포 상태 확인, 시스템 자원 모니터링 |
| **모범 사례** | 적절한 타임아웃, 경량화된 점검 로직, 종합적 상태 확인 |

헬스체크는 현대 분산 시스템에서 서비스 안정성을 보장하는 핵심 메커니즘입니다. 로드밸런서와 연동하여 장애 서버를 자동으로 격리하고, 시스템 전체의 가용성을 향상시킵니다.