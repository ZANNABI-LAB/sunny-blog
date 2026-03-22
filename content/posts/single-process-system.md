---
title: "단일 프로세스 시스템의 개념과 한계점"
shortTitle: "단일 프로세스 시스템"
date: "2026-03-22"
tags: ["operating-system", "process", "cpu-utilization", "multitasking", "multiprogramming"]
category: "Backend"
summary: "단일 프로세스 시스템의 동작 원리와 CPU 효율성 문제, 멀티프로그래밍과 멀티태스킹을 통한 개선 방법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/233"
references: ["https://docs.oracle.com/javase/tutorial/essential/concurrency/procthread.html", "https://www.kernel.org/doc/html/latest/scheduler/", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API"]
---

## 단일 프로세스 시스템이란?

단일 프로세스 시스템은 한 번에 하나의 프로그램만 실행할 수 있는 시스템입니다. 현재 실행 중인 프로그램이 완전히 종료되어야만 다른 프로그램을 실행할 수 있습니다.

이는 초기 컴퓨터 시스템에서 사용되던 방식으로, CPU가 한 번에 하나의 작업에만 집중합니다. 프로그램이 실행되면 해당 프로그램이 모든 시스템 자원을 독점적으로 사용하며, 작업이 완료될 때까지 다른 프로그램은 대기해야 합니다.

## 핵심 개념

### 1. CPU 사용률 문제

단일 프로세스 시스템의 가장 큰 문제는 **CPU 사용률의 비효율성**입니다.

```typescript
// 단일 프로세스에서의 작업 예시
async function processData() {
  // CPU 집약적 작업
  const result = performCalculation();
  
  // I/O 작업 시작 - CPU가 대기 상태가 됨
  const data = await readFromDatabase();
  
  // 다시 CPU 작업
  return processResult(result, data);
}
```

프로세스가 I/O 작업(파일 읽기, 네트워크 통신 등)을 수행할 때 CPU는 아무런 일을 하지 않고 대기합니다. 이는 전체 시스템 성능을 크게 저하시킵니다.

### 2. 멀티프로그래밍을 통한 개선

멀티프로그래밍은 **CPU 사용률 극대화**를 목표로 합니다. 하나의 프로세스가 I/O 작업으로 대기 상태에 들어가면, 다른 프로세스가 CPU를 사용하도록 합니다.

```typescript
// 멀티프로그래밍 개념 예시
class MultiprogrammingScheduler {
  private processes: Process[] = [];
  
  scheduleNext() {
    // 현재 프로세스가 I/O 대기 상태가 되면
    const currentProcess = this.getCurrentProcess();
    if (currentProcess.isWaitingForIO()) {
      // 다른 실행 가능한 프로세스를 찾아 실행
      const nextProcess = this.findReadyProcess();
      this.switchTo(nextProcess);
    }
  }
}
```

### 3. 멀티태스킹의 등장

멀티프로그래밍의 한계는 CPU 집약적인 프로세스가 CPU를 독점할 수 있다는 점입니다. 멀티태스킹은 **응답 시간 최소화**를 목표로 이 문제를 해결합니다.

```typescript
// 타임 슬라이스 기반 멀티태스킹
class MultitaskingScheduler {
  private readonly TIME_QUANTUM = 10; // 10ms
  
  executeWithTimeSlicing() {
    const processes = this.getReadyProcesses();
    
    processes.forEach(process => {
      // 각 프로세스를 정해진 시간만큼만 실행
      this.executeForDuration(process, this.TIME_QUANTUM);
      
      // 시간이 끝나면 다음 프로세스로 전환
      this.contextSwitch();
    });
  }
}
```

### 4. 멀티프로그래밍 vs 멀티태스킹

두 방식의 핵심 차이점은 **CPU 시간 할당 방식**입니다:

```typescript
// 멀티프로그래밍: I/O 대기 시에만 전환
class Multiprogramming {
  schedule() {
    while (true) {
      if (currentProcess.isBlocked()) {
        switchToNextReadyProcess();
      }
      // CPU 작업 중에는 전환하지 않음
    }
  }
}

// 멀티태스킹: 정해진 시간마다 강제 전환
class Multitasking {
  schedule() {
    while (true) {
      executeProcess(TIME_QUANTUM);
      // 시간이 끝나면 강제로 다음 프로세스로 전환
      forceContextSwitch();
    }
  }
}
```

## 정리

| 시스템 유형 | 주요 목적 | 특징 | 한계점 |
|------------|-----------|------|--------|
| **단일 프로세스** | 단순성 | 한 번에 하나만 실행 | CPU 사용률 낮음 |
| **멀티프로그래밍** | CPU 사용률 극대화 | I/O 대기 시 프로세스 전환 | CPU 독점 가능 |
| **멀티태스킹** | 응답 시간 최소화 | 타임 슬라이스 기반 전환 | 컨텍스트 스위치 오버헤드 |

현대의 운영체제는 멀티태스킹을 기반으로 하여 사용자에게 여러 프로그램이 동시에 실행되는 듯한 경험을 제공합니다. 이는 시분할 시스템의 핵심 원리로, 반응성과 효율성을 모두 확보하는 방법입니다.