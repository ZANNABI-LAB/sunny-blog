---
title: "멀티태스킹 시스템의 한계와 스레드의 등장"
shortTitle: "멀티태스킹 한계"
date: "2026-03-22"
tags: ["multitasking", "thread", "process", "concurrency", "operating-system"]
category: "Backend"
summary: "멀티태스킹 시스템의 한계를 분석하고 스레드가 이를 어떻게 해결하는지 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/234"
references: ["https://docs.oracle.com/javase/tutorial/essential/concurrency/", "https://www.kernel.org/doc/html/latest/kernel-hacking/locking.html"]
---

## 멀티태스킹 시스템의 한계란?

멀티태스킹 시스템은 여러 프로세스가 CPU 시간을 나눠 사용하여 동시에 실행되는 것처럼 보이게 하는 시스템입니다. 하지만 전통적인 멀티태스킹 시스템에는 성능과 자원 효율성 측면에서 근본적인 한계가 존재합니다.

이러한 한계는 주로 프로세스 기반 동시성 처리에서 발생하며, 무거운 컨텍스트 스위칭, 메모리 격리로 인한 데이터 공유 어려움, 그리고 프로세스 관리 오버헤드가 주요 문제점으로 지적됩니다. 이를 해결하기 위해 등장한 것이 바로 스레드(Thread) 개념입니다.

## 핵심 개념

### 1. 프로세스 기반 멀티태스킹의 문제점

전통적인 멀티태스킹 시스템에서는 각 프로세스가 독립적인 메모리 공간을 가지며, 이로 인해 여러 한계가 발생합니다.

```java
// 프로세스 생성 예시 - Java ProcessBuilder
ProcessBuilder pb1 = new ProcessBuilder("task1.exe");
ProcessBuilder pb2 = new ProcessBuilder("task2.exe");

Process process1 = pb1.start(); // 새로운 프로세스 생성
Process process2 = pb2.start(); // 또 다른 프로세스 생성

// 각 프로세스는 독립적인 메모리 공간을 가짐
// 프로세스 간 데이터 공유가 복잡함
```

하나의 프로세스는 동시에 여러 작업을 수행할 수 없으며, 여러 프로세스를 생성하면 메모리 사용량이 급격히 증가합니다. 또한 프로세스 간 컨텍스트 스위칭은 CPU 레지스터 상태, 메모리 맵, 파일 디스크립터 등 많은 정보를 저장하고 복원해야 하므로 비용이 큽니다.

### 2. 컨텍스트 스위칭의 오버헤드

프로세스 간 컨텍스트 스위칭은 운영체제에게 상당한 부담을 주는 작업입니다.

```c
// 프로세스 컨텍스트 스위칭 시 저장되는 정보들
typedef struct process_context {
    int pid;                    // 프로세스 ID
    cpu_registers_t registers;  // CPU 레지스터 상태
    memory_map_t memory_map;    // 메모리 맵
    file_descriptor_t* fd_table; // 파일 디스크립터 테이블
    signal_handler_t signals;   // 시그널 핸들러
    // ... 더 많은 정보들
} process_context_t;
```

이러한 정보들을 모두 저장하고 복원하는 과정은 시간과 메모리를 많이 소모하며, 특히 메모리 관리 단위(MMU) 설정 변경으로 인한 캐시 무효화가 성능에 큰 영향을 미칩니다.

### 3. 스레드를 통한 한계 극복

스레드는 프로세스 내에서 독립적으로 실행되는 실행 단위로, 멀티태스킹의 한계를 효과적으로 해결합니다.

```java
// 스레드를 사용한 동시 작업 처리
public class MultiThreadExample {
    public static void main(String[] args) {
        // 같은 프로세스 내에서 여러 스레드 생성
        Thread thread1 = new Thread(() -> {
            // 작업 1 수행
            processTask("Task 1");
        });
        
        Thread thread2 = new Thread(() -> {
            // 작업 2 수행
            processTask("Task 2");
        });
        
        thread1.start(); // 스레드 1 시작
        thread2.start(); // 스레드 2 시작
        
        // 메모리 공유를 통한 데이터 전달
        SharedData sharedData = new SharedData();
        // 두 스레드가 같은 객체에 접근 가능
    }
    
    private static void processTask(String taskName) {
        System.out.println(taskName + " executed by " + 
                          Thread.currentThread().getName());
    }
}
```

### 4. 스레드 기반 멀티태스킹의 장점

스레드는 같은 프로세스 내에서 힙 메모리를 공유하면서도 각자의 스택과 프로그램 카운터를 가집니다.

```typescript
// Node.js Worker Threads를 활용한 스레드 예시
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

if (isMainThread) {
    // 메인 스레드
    const worker = new Worker(__filename, {
        workerData: { numbers: [1, 2, 3, 4, 5] }
    });
    
    worker.on('message', (result) => {
        console.log('계산 결과:', result); // 스레드 간 데이터 공유
    });
} else {
    // 워커 스레드
    const { numbers } = workerData;
    const sum = numbers.reduce((a, b) => a + b, 0);
    parentPort?.postMessage(sum); // 메인 스레드로 결과 전송
}
```

스레드 간 컨텍스트 스위칭은 스택 포인터와 프로그램 카운터만 변경하면 되므로 프로세스 간 스위칭보다 훨씬 빠르고 효율적입니다.

## 정리

| 구분 | 프로세스 기반 | 스레드 기반 |
|------|-------------|------------|
| **메모리 공유** | 독립적 메모리 공간 | 힙 메모리 공유 |
| **컨텍스트 스위칭** | 무거움 (전체 상태 저장/복원) | 가벼움 (스택, PC만 변경) |
| **데이터 공유** | IPC 필요 (복잡) | 직접 메모리 접근 (단순) |
| **자원 사용** | 높음 (프로세스별 독립 자원) | 낮음 (프로세스 내 공유) |
| **생성 비용** | 높음 | 낮음 |
| **안정성** | 높음 (프로세스 간 격리) | 낮음 (스레드 간 영향) |

스레드의 등장으로 멀티태스킹 시스템은 더욱 효율적이고 확장 가능한 형태로 발전했습니다. 현대의 멀티코어 프로세서에서는 멀티프로세싱과 멀티스레딩을 함께 활용하여 진정한 병렬 처리를 구현하고 있습니다.