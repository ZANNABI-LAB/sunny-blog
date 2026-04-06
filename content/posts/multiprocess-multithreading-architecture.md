---
title: "멀티 프로세스와 멀티 스레드: 시스템 아키텍처의 두 가지 접근법"
shortTitle: "멀티 프로세스 vs 멀티 스레드"
date: "2026-04-06"
tags: ["multiprocess", "multithreading", "system-architecture", "concurrency", "performance"]
category: "Architecture"
summary: "멀티 프로세스와 멀티 스레드의 차이점과 각각의 장단점, 적용 사례를 살펴봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/273"
references: ["https://docs.oracle.com/javase/tutorial/essential/concurrency/", "https://developer.mozilla.org/en-US/docs/Web/API/Worker", "https://nodejs.org/en/docs/guides/dont-block-the-event-loop/"]
---

## 멀티 프로세스와 멀티 스레드란?

멀티 프로세스와 멀티 스레드는 컴퓨터 시스템에서 여러 작업을 동시에 처리하기 위한 두 가지 핵심 아키텍처 패턴입니다. 두 접근법 모두 시스템 자원을 효율적으로 활용하여 성능을 개선하지만, 메모리 공유 방식과 안정성 측면에서 서로 다른 특성을 보입니다.

멀티 프로세스는 각 작업을 독립된 프로세스로 실행하여 높은 안정성을 제공하며, 멀티 스레드는 하나의 프로세스 내에서 여러 스레드가 메모리를 공유하며 빠른 처리 속도를 제공합니다. 현대 소프트웨어 아키텍처에서는 상황에 따라 두 방식을 적절히 조합하여 사용합니다.

## 핵심 개념

### 1. 멀티 프로세스 아키텍처

멀티 프로세스는 하나의 애플리케이션이 여러 개의 독립적인 프로세스를 생성하여 작업을 분산 처리하는 구조입니다. 각 프로세스는 고유한 메모리 공간(Virtual Memory Space)을 할당받아 완전히 격리된 환경에서 실행됩니다.

```typescript
// Node.js에서 멀티 프로세스 생성 예시
import { fork } from 'child_process';

const child1 = fork('./worker.js');
const child2 = fork('./worker.js');

// 각 프로세스는 독립된 메모리 공간을 가짐
child1.send({ task: 'process-data-1' });
child2.send({ task: 'process-data-2' });

child1.on('message', (result) => {
  console.log('Child 1 result:', result);
});
```

가장 대표적인 예시는 Chrome 브라우저의 멀티 프로세스 아키텍처입니다. 각 탭이 별도의 프로세스로 실행되어, 하나의 탭에서 무한루프나 크래시가 발생해도 다른 탭에는 영향을 주지 않습니다.

### 2. 멀티 스레드 아키텍처

멀티 스레드는 하나의 프로세스 내에서 여러 스레드가 메모리 공간을 공유하며 동시에 작업을 수행하는 구조입니다. 스레드 간 데이터 공유가 쉽고 빠르지만, 동기화 문제가 발생할 수 있습니다.

```typescript
// Web Worker를 활용한 멀티 스레드 구현
const worker1 = new Worker('./calculate-worker.js');
const worker2 = new Worker('./calculate-worker.js');

// 메인 스레드에서 워커 스레드로 데이터 전송
worker1.postMessage({ numbers: [1, 2, 3, 4, 5] });
worker2.postMessage({ numbers: [6, 7, 8, 9, 10] });

worker1.onmessage = (event) => {
  console.log('Worker 1 result:', event.data);
};
```

Java에서는 ExecutorService를 통해 스레드 풀을 관리합니다:

```java
ExecutorService executor = Executors.newFixedThreadPool(4);

// 여러 스레드가 동시에 작업 처리
for (int i = 0; i < 10; i++) {
    final int taskId = i;
    executor.submit(() -> {
        // 공유 메모리에 접근하는 작업
        processTask(taskId);
    });
}
```

### 3. 메모리 관리와 통신 방식

두 아키텍처의 가장 큰 차이점은 메모리 관리와 프로세스/스레드 간 통신 방식입니다.

멀티 프로세스는 IPC(Inter-Process Communication)를 통해 데이터를 주고받습니다:

```typescript
// 프로세스 간 통신 예시
process.on('message', (data) => {
  const result = heavyComputation(data);
  process.send(result); // 부모 프로세스로 결과 전송
});
```

멀티 스레드는 공유 메모리를 통해 직접적인 데이터 접근이 가능합니다:

```java
// 스레드 간 공유 데이터
private volatile int counter = 0;
private final Object lock = new Object();

public void incrementCounter() {
    synchronized(lock) {
        counter++; // 동기화를 통한 안전한 접근
    }
}
```

### 4. 성능과 안정성 트레이드오프

멀티 프로세스는 높은 안정성을 제공하지만 자원 소모가 큽니다. 각 프로세스마다 별도의 메모리를 할당받고, 프로세스 생성 비용이 높습니다. 반면 멀티 스레드는 빠른 생성과 메모리 효율성을 제공하지만, 하나의 스레드 오류가 전체 프로세스에 영향을 줄 수 있습니다.

```typescript
// 성능 비교 예시
console.time('Process Creation');
const childProcess = fork('./worker.js');
console.timeEnd('Process Creation'); // 보통 10-50ms

console.time('Thread Creation');
const worker = new Worker('./worker.js');
console.timeEnd('Thread Creation'); // 보통 1-5ms
```

## 정리

| 특성 | 멀티 프로세스 | 멀티 스레드 |
|------|---------------|-------------|
| **메모리 공유** | 독립적인 메모리 공간 | 메모리 공간 공유 |
| **안정성** | 높음 (프로세스 간 격리) | 낮음 (공유 자원 충돌 위험) |
| **성능** | 무겁고 느림 | 가볍고 빠름 |
| **통신 방식** | IPC (복잡함) | 공유 메모리 (간단함) |
| **자원 소모** | 높음 | 낮음 |
| **적용 사례** | 브라우저 탭, 마이크로서비스 | 웹 서버, 게임 엔진 |

현대 아키텍처에서는 두 방식을 상황에 맞게 조합하여 사용합니다. 안정성이 중요한 경우 멀티 프로세스를, 성능과 효율성이 우선인 경우 멀티 스레드를 선택하며, 하이브리드 접근법으로 두 방식의 장점을 모두 활용하는 것이 일반적입니다.