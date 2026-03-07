---
title: "Graceful Shutdown: 백엔드 서버의 우아한 종료 전략"
shortTitle: "Graceful Shutdown"
date: "2026-03-07"
tags: ["graceful-shutdown", "backend-server", "system-reliability", "spring-boot", "process-management"]
category: "Backend"
summary: "서버 애플리케이션의 안전한 종료를 위한 Graceful Shutdown 구현 방법과 필요성을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/190"
references: ["https://docs.spring.io/spring-boot/docs/current/reference/html/web.html#web.graceful-shutdown", "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/", "https://man7.org/linux/man-pages/man7/signal.7.html"]
---

## Graceful Shutdown이란?

Graceful Shutdown(우아한 종료)은 애플리케이션이 종료될 때 즉시 프로세스를 끝내는 것이 아니라, 현재 처리 중인 작업을 완료하고 리소스를 정리한 후 안전하게 종료하는 방식입니다.

서버 애플리케이션에서는 SIGTERM 신호를 받았을 때 새로운 요청 수락을 중단하고, 기존 처리 중인 요청들이 모두 완료되기를 기다린 후 프로세스를 종료합니다. 이는 갑작스러운 서버 종료로 인한 데이터 손실, 트랜잭션 롤백, 사용자 경험 저하를 방지하기 위해 필수적입니다.

반면 강제 종료(SIGKILL)는 실행 중인 모든 작업을 즉시 중단시켜 예상치 못한 부작용을 일으킬 수 있습니다.

## 핵심 개념

### 1. 시그널 기반 종료 메커니즘

Unix/Linux 시스템에서 프로세스 종료는 시그널을 통해 이루어집니다:

```bash
# SIGTERM: 우아한 종료 요청
kill -TERM <PID>

# SIGKILL: 강제 종료 (핸들링 불가)
kill -KILL <PID>
```

SIGTERM은 프로세스가 시그널을 핸들링할 수 있어 정리 작업을 수행할 기회를 제공하지만, SIGKILL은 즉시 프로세스를 종료시킵니다.

### 2. Spring Boot에서의 Graceful Shutdown

Spring Boot는 내장된 Graceful Shutdown 기능을 제공합니다:

```yaml
# application.yml
server:
  shutdown: graceful

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s
```

```java
@Component
public class GracefulShutdownConfig {
    
    @EventListener
    public void handleContextClosing(ContextClosedEvent event) {
        log.info("애플리케이션 종료 시작");
        // 정리 작업 수행
        cleanupResources();
    }
    
    private void cleanupResources() {
        // 데이터베이스 연결 종료
        // 캐시 플러시
        // 외부 서비스 연결 해제
    }
}
```

### 3. 컨테이너 환경에서의 고려사항

Kubernetes와 같은 컨테이너 환경에서는 Pod 종료 시 다음 순서를 따릅니다:

```yaml
# deployment.yaml
spec:
  template:
    spec:
      terminationGracePeriodSeconds: 60
      containers:
      - name: app
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 15"]
```

```java
@RestController
public class HealthController {
    
    private volatile boolean ready = true;
    
    @GetMapping("/health/ready")
    public ResponseEntity<String> readiness() {
        return ready ? 
            ResponseEntity.ok("READY") : 
            ResponseEntity.status(503).body("NOT_READY");
    }
    
    @EventListener
    public void onShutdown(ContextClosedEvent event) {
        ready = false; // 헬스체크 실패로 트래픽 차단
    }
}
```

### 4. 데이터베이스 트랜잭션 처리

진행 중인 트랜잭션의 안전한 처리가 중요합니다:

```java
@Service
@Transactional
public class OrderService {
    
    @PreDestroy
    public void cleanup() {
        log.info("진행 중인 주문 처리 완료 대기");
        // 활성 트랜잭션 완료 대기
        waitForActiveTransactions();
    }
    
    private void waitForActiveTransactions() {
        // 구현: 활성 트랜잭션 모니터링 및 대기
    }
}
```

## 정리

| 구분 | 내용 |
|------|------|
| **목적** | 데이터 무결성 보장, 사용자 경험 향상, 시스템 안정성 확보 |
| **핵심 원리** | SIGTERM 시그널 핸들링, 새 요청 차단, 기존 요청 완료 대기 |
| **Spring 설정** | `server.shutdown=graceful`, timeout 설정 |
| **주요 고려사항** | 무한 대기 방지를 위한 타임아웃, 헬스체크 연동, 리소스 정리 |

Graceful Shutdown은 현대 백엔드 시스템에서 무중단 서비스와 데이터 안정성을 보장하는 핵심 요소입니다. 특히 마이크로서비스 아키텍처와 컨테이너 환경에서는 서비스 재시작이 빈번하므로, 적절한 종료 전략 수립이 필수적입니다.