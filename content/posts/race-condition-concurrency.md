---
title: "경쟁 상태와 동시성 문제 해결"
shortTitle: "Race Condition"
date: "2026-03-12"
tags: ["race-condition", "concurrency", "thread-safety", "atomicity", "visibility"]
category: "Backend"
summary: "경쟁 상태를 해결하기 위해 원자성과 가시성을 보장하는 방법을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/203"
references: ["https://docs.oracle.com/javase/tutorial/essential/concurrency/", "https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/package-summary.html"]
---

## 경쟁 상태란?

경쟁 상태(Race Condition)는 두 개 이상의 스레드가 공유 자원에 동시에 접근할 때 스레드 간의 실행 순서에 따라 결과가 달라지는 현상입니다. 멀티스레드 환경에서 예측할 수 없는 결과를 만들어내는 대표적인 동시성 문제로, 프로그램의 정확성을 크게 해칠 수 있습니다.

이를 해결하려면 **원자성(Atomicity)**과 **가시성(Visibility)** 두 가지 속성이 모두 보장되어야 합니다. 단순히 하나의 속성만 보장하는 것으로는 완전한 해결이 어렵습니다.

## 핵심 개념

### 1. 원자성이 필요한 이유

원자성은 공유 자원에 대한 작업이 더 이상 쪼갤 수 없는 하나의 연산처럼 동작하는 성질입니다. 간단해 보이는 `i++` 연산도 실제로는 세 단계로 분리됩니다:

```java
// i++ 연산의 내부 동작
public class Counter {
    private int count = 0;
    
    public void increment() {
        // 1. Read: count 값을 읽음
        int temp = count;
        // 2. Modify: 값에 1을 더함
        temp = temp + 1;
        // 3. Write: 결과를 다시 count에 할당
        count = temp;
    }
}
```

두 스레드가 동시에 `increment()`를 호출하면 다음과 같은 문제가 발생할 수 있습니다:

```java
// Thread 1과 Thread 2가 동시에 실행될 때
// count 초기값: 0

// Thread 1: count 값 0을 읽음
// Thread 2: count 값 0을 읽음 (Thread 1의 변경사항 반영 전)
// Thread 1: 0 + 1 = 1, count에 1 저장
// Thread 2: 0 + 1 = 1, count에 1 저장

// 결과: count = 1 (기대값: 2)
```

### 2. 가시성이 필요한 이유

가시성은 한 스레드에서 변경한 값이 다른 스레드에서 즉시 확인 가능한 성질입니다. 현대 CPU는 성능 최적화를 위해 각 코어마다 별도의 캐시를 사용합니다:

```java
public class VisibilityExample {
    private boolean flag = false;
    
    // Thread 1에서 실행
    public void setFlag() {
        flag = true; // CPU1의 캐시에만 반영될 수 있음
    }
    
    // Thread 2에서 실행
    public void checkFlag() {
        while (!flag) { // CPU2의 캐시에서 읽어서 계속 false일 수 있음
            // 무한 루프 가능성
        }
        System.out.println("Flag is true!");
    }
}
```

Thread 1에서 `flag`를 `true`로 변경했지만, 이 변경사항이 메인 메모리에 즉시 반영되지 않으면 Thread 2는 계속해서 `false` 값을 읽게 됩니다.

### 3. Java에서의 해결 방법

**synchronized 키워드**로 원자성과 가시성을 모두 보장할 수 있습니다:

```java
public class SafeCounter {
    private int count = 0;
    
    public synchronized void increment() {
        count++; // 원자성 보장
    }
    
    public synchronized int getCount() {
        return count; // 가시성 보장
    }
}
```

**Atomic 클래스**를 사용하면 CAS(Compare-And-Swap) 알고리즘으로 락 없이 동기화할 수 있습니다:

```java
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicCounter {
    private final AtomicInteger count = new AtomicInteger(0);
    
    public void increment() {
        count.incrementAndGet(); // 원자적 연산
    }
    
    public int getCount() {
        return count.get();
    }
}
```

**volatile 키워드**는 가시성만 보장합니다. 하나의 스레드만 쓰기를 수행할 때 사용합니다:

```java
public class VolatileExample {
    private volatile boolean flag = false;
    
    public void setFlag() { // 한 스레드에서만 호출
        flag = true;
    }
    
    public boolean isFlag() { // 여러 스레드에서 호출 가능
        return flag;
    }
}
```

### 4. 성능 고려사항

각 동기화 방식은 성능 특성이 다릅니다:

```java
// 성능 비교 예시
public class PerformanceComparison {
    private int syncCount = 0;
    private final AtomicInteger atomicCount = new AtomicInteger(0);
    private volatile int volatileCount = 0;
    
    // 가장 무거움 - 락 획득/해제 오버헤드
    public synchronized void syncIncrement() {
        syncCount++;
    }
    
    // 중간 - CAS 재시도 가능성
    public void atomicIncrement() {
        atomicCount.incrementAndGet();
    }
    
    // 가장 가벼움 - 읽기만 수행시
    public int getVolatileCount() {
        return volatileCount;
    }
}
```

## 정리

| 해결 방법 | 원자성 | 가시성 | 성능 | 사용 상황 |
|-----------|---------|---------|------|-----------|
| `synchronized` | ✅ | ✅ | 낮음 | 복잡한 임계 영역 |
| `Atomic 클래스` | ✅ | ✅ | 중간 | 단순한 원자적 연산 |
| `volatile` | ❌ | ✅ | 높음 | 한 스레드 쓰기, 다수 읽기 |
| `Lock 클래스` | ✅ | ✅ | 중간 | 세밀한 락 제어 필요 |

경쟁 상태를 완전히 해결하려면 원자성과 가시성이 모두 보장되어야 합니다. 성능과 복잡성을 고려하여 상황에 맞는 동기화 방식을 선택하는 것이 중요합니다.