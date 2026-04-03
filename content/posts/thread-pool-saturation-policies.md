---
title: "스레드 풀 포화 정책(Thread Pool Saturation Policies)"
shortTitle: "스레드 풀 포화"
date: "2026-04-03"
tags: ["thread-pool", "concurrent-programming", "java", "backend", "performance"]
category: "Backend"
summary: "스레드 풀이 포화 상태일 때 새로운 작업 요청을 처리하는 정책들에 대해 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/270"
references: ["https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ThreadPoolExecutor.html", "https://www.baeldung.com/java-rejectedexecutionhandler"]
---

## 스레드 풀 포화 정책이란?

스레드 풀 포화 정책(Saturation Policies)은 스레드 풀이 포화 상태에 도달했을 때 새로운 작업 요청을 어떻게 처리할지 결정하는 정책입니다. Java의 `ThreadPoolExecutor`에서는 `RejectedExecutionHandler` 인터페이스를 통해 이러한 정책을 구현합니다.

스레드 풀의 포화 상태란 다음 조건을 모두 만족하는 상황을 의미합니다: 활성 스레드 수가 `maximumPoolSize`에 도달하고, 작업 대기열(`workQueue`)이 가득 찬 상태에서 새로운 작업이 요청되는 경우입니다. 이때 포화 정책이 실행되어 시스템의 안정성을 보장합니다.

## 핵심 개념

### 1. 기본 제공 포화 정책들

Java는 4가지 기본 포화 정책을 제공합니다:

```java
// AbortPolicy: 예외를 발생시켜 요청을 거부
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    2, 4, 60, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(2),
    new ThreadPoolExecutor.AbortPolicy() // 기본값
);

// CallerRunsPolicy: 호출한 스레드에서 직접 실행
executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());

// DiscardPolicy: 새로운 작업을 조용히 폐기
executor.setRejectedExecutionHandler(new ThreadPoolExecutor.DiscardPolicy());

// DiscardOldestPolicy: 가장 오래된 작업을 제거하고 새 작업 추가
executor.setRejectedExecutionHandler(new ThreadPoolExecutor.DiscardOldestPolicy());
```

각 정책의 동작 방식은 다음과 같습니다:
- **AbortPolicy**: `RejectedExecutionException` 예외 발생
- **CallerRunsPolicy**: 요청 스레드가 작업을 직접 수행하여 백프레셔 효과 제공
- **DiscardPolicy**: 새 작업을 무시하고 계속 진행
- **DiscardOldestPolicy**: 대기열의 헤드 작업을 제거 후 새 작업 삽입

### 2. 커스텀 포화 정책 구현

특별한 요구사항이 있는 경우 `RejectedExecutionHandler`를 직접 구현할 수 있습니다:

```java
public class LoggingRejectionHandler implements RejectedExecutionHandler {
    private static final Logger logger = LoggerFactory.getLogger(LoggingRejectionHandler.class);
    
    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
        logger.warn("Task rejected: {}, Active: {}, Pool size: {}, Queue size: {}",
                   r.toString(),
                   executor.getActiveCount(),
                   executor.getPoolSize(),
                   executor.getQueue().size());
        
        // 대안 처리 로직 (예: 별도 큐에 저장, 나중에 재시도 등)
        handleRejectedTask(r);
    }
    
    private void handleRejectedTask(Runnable task) {
        // 커스텀 처리 로직
    }
}
```

### 3. 포화 정책 선택 가이드

각 정책은 서로 다른 사용 사례에 적합합니다:

```java
// 웹 서버: 빠른 실패로 클라이언트에게 즉시 피드백
ThreadPoolExecutor webServerPool = new ThreadPoolExecutor(
    10, 20, 60, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100),
    new ThreadPoolExecutor.AbortPolicy()
);

// 배치 처리: 백프레셔를 통한 자연스러운 흐름 제어
ThreadPoolExecutor batchProcessor = new ThreadPoolExecutor(
    5, 10, 60, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(50),
    new ThreadPoolExecutor.CallerRunsPolicy()
);

// 로그 처리: 일부 로그 손실보다 시스템 안정성 우선
ThreadPoolExecutor logProcessor = new ThreadPoolExecutor(
    2, 4, 60, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(1000),
    new ThreadPoolExecutor.DiscardOldestPolicy()
);
```

### 4. 모니터링과 튜닝

포화 정책의 효과를 측정하고 최적화하는 것이 중요합니다:

```java
public class ThreadPoolMonitor {
    public void monitorThreadPool(ThreadPoolExecutor executor) {
        ScheduledExecutorService monitor = Executors.newScheduledThreadPool(1);
        
        monitor.scheduleAtFixedRate(() -> {
            logger.info("Pool Stats - Active: {}, Pool Size: {}, Queue Size: {}, Completed: {}",
                       executor.getActiveCount(),
                       executor.getPoolSize(),
                       executor.getQueue().size(),
                       executor.getCompletedTaskCount());
        }, 0, 10, TimeUnit.SECONDS);
    }
}
```

## 정리

| 정책 | 동작 방식 | 사용 사례 | 장점 | 단점 |
|------|-----------|-----------|------|------|
| AbortPolicy | 예외 발생 | 웹 서버, API | 빠른 실패 감지 | 예외 처리 필요 |
| CallerRunsPolicy | 호출자 실행 | 배치 처리 | 백프레셔 효과 | 호출자 스레드 블로킹 |
| DiscardPolicy | 작업 폐기 | 로그, 모니터링 | 시스템 안정성 | 작업 손실 |
| DiscardOldestPolicy | 오래된 작업 제거 | 실시간 데이터 | 최신성 보장 | 작업 손실 |

적절한 포화 정책 선택은 애플리케이션의 특성과 요구사항을 고려해야 합니다. 중요한 작업의 경우 AbortPolicy로 예외를 통해 재처리를 보장하고, 손실이 허용되는 작업은 Discard 계열 정책을 사용하여 시스템 안정성을 확보할 수 있습니다.