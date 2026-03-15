---
title: "Micrometer 메트릭 라이브러리"
shortTitle: "Micrometer"
date: "2026-03-15"
tags: ["micrometer", "metrics", "monitoring", "spring-boot", "observability"]
category: "Backend"
summary: "벤더 중립적인 메트릭 계측 라이브러리인 Micrometer의 핵심 개념과 Spring Boot에서의 활용법을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/211"
references: ["https://micrometer.io/docs", "https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html"]
---

## Micrometer란?

Micrometer는 Java 애플리케이션에서 사용하는 벤더 중립적인 메트릭 계측 라이브러리입니다. 애플리케이션의 다양한 지표(CPU 사용량, 메모리 소비, HTTP 요청 수 등)를 수집하고, 이를 Prometheus, Datadog, Graphite 등 여러 모니터링 시스템에 전송할 수 있는 통일된 API를 제공합니다.

이 라이브러리는 SLF4J가 로깅에서 파사드 역할을 하듯이, 모니터링 영역에서 파사드 패턴을 구현합니다. 개발자는 Micrometer의 단순한 API만 사용하면 되고, 실제 모니터링 백엔드의 복잡한 클라이언트 구현 세부사항은 신경 쓸 필요가 없습니다.

Spring Boot에서는 Actuator와 긴밀하게 통합되어 기본 메트릭을 자동으로 수집하고 노출할 수 있어, 별도 설정 없이도 애플리케이션 모니터링을 시작할 수 있습니다.

## 핵심 개념

### 1. MeterRegistry와 메트릭 타입

MeterRegistry는 Micrometer의 중심 컴포넌트로, 모든 메트릭을 등록하고 관리하는 역할을 담당합니다. 주요 메트릭 타입은 다음과 같습니다.

```java
@Service
public class MetricsService {
    
    private final MeterRegistry meterRegistry;
    private final Counter orderCounter;
    private final Timer processTimer;
    private final Gauge activeUsers;
    
    public MetricsService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        
        // Counter: 단조 증가하는 값 (주문 수, 에러 수 등)
        this.orderCounter = Counter.builder("orders.total")
            .tag("status", "completed")
            .register(meterRegistry);
            
        // Timer: 시간과 이벤트 수를 동시에 측정
        this.processTimer = Timer.builder("process.duration")
            .tag("operation", "payment")
            .register(meterRegistry);
            
        // Gauge: 증감 가능한 현재 상태값 (활성 사용자, 큐 크기 등)
        this.activeUsers = Gauge.builder("users.active")
            .register(meterRegistry, this, MetricsService::getCurrentActiveUsers);
    }
    
    private double getCurrentActiveUsers() {
        // 실제 활성 사용자 수를 반환하는 로직
        return 150;
    }
}
```

### 2. 태그를 통한 메트릭 분류

태그(Tag)는 메트릭을 세분화하고 필터링할 수 있는 키-값 쌍입니다. 같은 이름의 메트릭도 태그에 따라 별도로 측정됩니다.

```java
@RestController
public class ApiController {
    
    private final Counter requestCounter;
    private final Timer requestTimer;
    
    public ApiController(MeterRegistry meterRegistry) {
        this.requestCounter = meterRegistry.counter("api.requests.total");
        this.requestTimer = meterRegistry.timer("api.request.duration");
    }
    
    @GetMapping("/users/{id}")
    public User getUser(@PathVariable String id) {
        // 엔드포인트별로 태그를 추가하여 메트릭 분류
        Counter.builder("api.requests.total")
            .tag("endpoint", "/users")
            .tag("method", "GET")
            .register(meterRegistry)
            .increment();
            
        return Timer.Sample.start(meterRegistry)
            .stop(Timer.builder("api.request.duration")
                .tag("endpoint", "/users")
                .tag("method", "GET")
                .register(meterRegistry));
    }
}
```

### 3. Spring Boot Actuator 통합

Spring Boot Actuator는 내부적으로 Micrometer를 사용하여 JVM, HTTP, 데이터베이스 등의 메트릭을 자동으로 수집합니다.

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    metrics:
      enabled: true
  metrics:
    export:
      prometheus:
        enabled: true
    tags:
      application: user-service
      environment: production
```

```java
@Configuration
public class MetricsConfiguration {
    
    @Bean
    public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        return registry -> registry.config()
            .commonTags("service", "user-api")
            .commonTags("version", "1.0.0");
    }
    
    // 커스텀 메트릭 빈 등록
    @Bean
    public TimedAspect timedAspect(MeterRegistry registry) {
        return new TimedAspect(registry);
    }
}

@Service
public class UserService {
    
    // @Timed 어노테이션으로 메서드 실행 시간 자동 측정
    @Timed(name = "user.service.findById", description = "Time taken to find user by ID")
    public User findById(Long id) {
        // 사용자 조회 로직
        return userRepository.findById(id);
    }
}
```

### 4. 모니터링 백엔드 연동

Micrometer는 다양한 모니터링 시스템과 연동할 수 있습니다. Prometheus 연동 예시입니다.

```xml
<!-- pom.xml -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

```java
@Configuration
public class PrometheusConfig {
    
    @Bean
    public PrometheusMeterRegistry prometheusMeterRegistry() {
        return new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);
    }
    
    @EventListener
    public void handleContextRefresh(ContextRefreshedEvent event) {
        // 애플리케이션 시작 시점에 커스텀 게이지 등록
        Gauge.builder("app.startup.timestamp")
            .register(prometheusMeterRegistry(), System.currentTimeMillis());
    }
}

@RestController
public class MetricsController {
    
    private final PrometheusMeterRegistry prometheusMeterRegistry;
    
    @GetMapping("/actuator/prometheus")
    public String prometheus() {
        return prometheusMeterRegistry.scrape();
    }
}
```

## 정리

| 구분 | 설명 | 예시 |
|------|------|------|
| **Counter** | 단조 증가하는 누적값 | HTTP 요청 수, 에러 발생 수 |
| **Timer** | 시간 측정과 이벤트 횟수 | API 응답 시간, 데이터베이스 쿼리 시간 |
| **Gauge** | 현재 상태를 나타내는 값 | 활성 커넥션 수, 메모리 사용량 |
| **MeterRegistry** | 메트릭 중앙 관리 | 모든 메트릭의 등록과 백엔드 전송 |
| **Tag** | 메트릭 분류 및 필터링 | endpoint=/api, method=GET |

Micrometer는 애플리케이션의 가시성(Observability)을 높이는 핵심 도구입니다. Spring Boot와의 뛰어난 통합성과 벤더 중립적인 API를 통해, 복잡한 설정 없이도 효과적인 애플리케이션 모니터링 시스템을 구축할 수 있습니다.