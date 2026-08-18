---
title: "코루틴이 스레드보다 가벼운 이유"
shortTitle: "코루틴 성능"
date: "2026-04-17"
tags: ["coroutine", "thread", "concurrency", "performance", "backend"]
category: "Backend.Concurrency"
summary: "코루틴이 스레드 방식보다 메모리 효율적이고 가벼운 이유를 메모리 사용량, 컨텍스트 스위칭, 일시 중단 메커니즘 관점에서 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/308"
references: ["https://kotlinlang.org/docs/coroutines-basics.html", "https://docs.oracle.com/en/java/javase/17/core/virtual-threads.html", "https://projectloom.wiki.openjdk.org/"]
---

## 코루틴이란?

코루틴(Coroutine)은 협력적 멀티태스킹을 지원하는 경량 스레드입니다. 기존 스레드와 달리 운영체제 수준이 아닌 사용자 공간에서 실행되며, 일시 중단과 재개가 가능한 함수로 구현됩니다.

코루틴의 핵심은 블로킹 작업에서 스레드를 차단하지 않고 실행을 일시 중단한 뒤, 다른 코루틴이 해당 스레드를 활용할 수 있도록 하는 것입니다. 이를 통해 수천 개의 동시 작업을 소수의 스레드로 효율적으로 처리할 수 있습니다.

## 핵심 개념

### 1. 메모리 사용량 차이

스레드는 각각 독립적인 스택 메모리가 필요합니다. JVM 환경에서 기본 스레드 스택 크기는 약 1MB이며, 이 메모리는 스레드 생성 시점에 미리 할당되어 종료까지 유지됩니다.

```kotlin
// 1000개 스레드 생성 시 약 1GB 메모리 사용
for (i in 1..1000) {
    Thread {
        Thread.sleep(5000) // 5초간 블로킹
        println("Thread $i completed")
    }.start()
}
```

반면 코루틴은 스레드 내에서 실행되는 경량 객체로, 일반적으로 몇 KB의 메모리만 사용합니다. 코루틴의 상태는 힙 메모리에 저장되며 필요할 때만 할당됩니다.

```kotlin
runBlocking {
    // 1000개 코루틴 생성해도 몇 MB만 사용
    for (i in 1..1000) {
        launch {
            delay(5000) // 코루틴만 일시 중단
            println("Coroutine $i completed")
        }
    }
}
```

### 2. 컨텍스트 스위칭 비용

스레드 간 컨텍스트 스위칭은 운영체제 커널이 담당하며, CPU 레지스터, 메모리 맵, 프로그램 카운터 등의 상태를 저장하고 복원해야 합니다. 이 과정에서 상당한 오버헤드가 발생합니다.

```java
// 스레드 컨텍스트 스위칭 (OS 수준)
// 1. 현재 스레드 상태 저장 (레지스터, 스택 포인터 등)
// 2. 새 스레드 상태 복원
// 3. 메모리 맵 전환
// 4. CPU 캐시 플러시 (성능 저하 요인)
```

코루틴의 컨텍스트 스위칭은 사용자 공간에서 발생하며, 실행 지점(continuation)과 로컬 변수 상태만 저장하면 됩니다.

```kotlin
suspend fun userSpaceContextSwitch() {
    // 컨텍스트 스위칭 시 저장되는 정보
    // 1. 실행 중단 지점 (continuation)
    // 2. 로컬 변수 상태
    // 3. 코루틴 스코프 정보
    delay(100) // 여기서 일시 중단
    // CPU 캐시나 OS 리소스 변경 없음
}
```

### 3. 일시 중단 메커니즘

스레드는 블로킹 I/O 작업 중에 완전히 차단되어 다른 작업을 수행할 수 없습니다. 이는 스레드 풀 고갈로 이어질 수 있습니다.

```java
// 스레드 블로킹 방식
ExecutorService executor = Executors.newFixedThreadPool(10);
for (int i = 0; i < 1000; i++) {
    executor.submit(() -> {
        try {
            Thread.sleep(1000); // 스레드 완전 차단
            // 이 시간 동안 스레드는 다른 작업 불가
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    });
}
```

코루틴은 `suspend` 함수를 통해 실행을 일시 중단하고 스레드를 해제합니다. 해당 스레드는 즉시 다른 코루틴을 실행할 수 있습니다.

```kotlin
suspend fun nonBlockingOperation() {
    // 네트워크 요청 시뮬레이션
    delay(1000) // 스레드 해제, 다른 코루틴 실행 가능
    
    // I/O 완료 후 원래 또는 다른 스레드에서 재개
    println("Operation completed")
}

// 수천 개 코루틴이 소수의 스레드에서 효율적 실행
runBlocking {
    repeat(10000) {
        launch {
            nonBlockingOperation()
        }
    }
}
```

### 4. 생성 및 관리 비용

스레드 생성은 운영체제에 시스템 호출을 요구하며, 커널 수준의 리소스가 할당됩니다. 스레드 생성 비용은 일반적으로 수십 마이크로초에서 수 밀리초까지 소요됩니다.

코루틴 생성은 단순한 객체 할당과 유사하며, 나노초 단위의 시간만 필요합니다. 운영체제 리소스를 직접 소비하지 않아 훨씬 빠른 생성이 가능합니다.

```kotlin
// 코루틴 생성 성능 비교
val time1 = measureTimeMillis {
    runBlocking {
        repeat(100000) {
            launch {
                // 빠른 코루틴 생성
            }
        }
    }
}

val time2 = measureTimeMillis {
    repeat(1000) { // 스레드는 1000개만
        Thread {
            // 상대적으로 느린 스레드 생성
        }.start()
    }
}
```

## 정리

| 구분 | 스레드 | 코루틴 |
|------|--------|--------|
| **메모리 사용량** | ~1MB per thread | 몇 KB per coroutine |
| **컨텍스트 스위칭** | OS 수준, 높은 비용 | 사용자 공간, 낮은 비용 |
| **생성 비용** | 시스템 호출 필요 | 객체 할당 수준 |
| **블로킹 처리** | 스레드 완전 차단 | 일시 중단 후 스레드 해제 |
| **확장성** | 제한적 (메모리/OS 한계) | 높음 (수만 개 동시 실행) |
| **CPU 캐시** | 스위칭 시 플러시 | 캐시 친화적 |

코루틴의 이러한 특성으로 인해 높은 동시성이 필요한 I/O 집약적 애플리케이션에서 스레드 대비 현저히 높은 성능과 효율성을 제공합니다.