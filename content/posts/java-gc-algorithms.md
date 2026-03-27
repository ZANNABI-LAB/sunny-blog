---
title: "Java GC 알고리즘 종류와 특징"
shortTitle: "GC 알고리즘"
date: "2026-03-27"
tags: ["java", "garbage-collection", "jvm", "memory-management", "performance"]
category: "Backend"
summary: "Java의 다양한 GC 알고리즘들의 특징과 적용 시나리오를 살펴봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/249"
references: ["https://docs.oracle.com/en/java/javase/17/gctuning/", "https://openjdk.org/jeps/333", "https://www.oracle.com/technical-resources/articles/java/g1gc.html"]
---

## Java GC 알고리즘이란?

Java의 가비지 컬렉션(Garbage Collection)은 JVM이 힙 메모리에서 더 이상 사용되지 않는 객체를 자동으로 회수하는 메모리 관리 기법입니다. 다양한 GC 알고리즘들이 개발되어 왔으며, 각각은 서로 다른 성능 특성과 적용 시나리오를 가집니다.

GC 알고리즘의 선택은 애플리케이션의 처리량, 응답 시간, 메모리 사용량에 직접적인 영향을 미치므로, 시스템 요구사항에 맞는 적절한 알고리즘을 선택하는 것이 중요합니다.

## 핵심 개념

### 1. 초기 GC 알고리즘들

**Serial GC**는 JDK에 최초로 도입된 가장 단순한 형태의 가비지 컬렉터입니다. 단일 스레드로 동작하여 GC 수행 중 모든 애플리케이션 스레드가 정지되는 Stop-The-World 현상이 가장 길게 발생합니다.

```bash
# Serial GC 사용 설정
java -XX:+UseSerialGC -jar application.jar
```

**Parallel GC**는 Java 5부터 8까지 기본 가비지 컬렉터로 사용되었으며, Young 영역에서 멀티 스레드를 활용하여 처리량을 개선했습니다. Throughput GC라고도 불리며, CPU 코어가 많은 환경에서 효과적입니다.

**Parallel Old GC**는 Parallel GC의 향상된 버전으로, Old 영역에서도 멀티 스레드를 활용하여 전체적인 GC 성능을 개선했습니다.

### 2. 저지연 목적의 GC 알고리즘

**CMS(Concurrent Mark-Sweep) GC**는 애플리케이션 스레드와 병렬로 실행되어 Stop-The-World 시간을 최소화하도록 설계되었습니다. 하지만 메모리 단편화 문제와 높은 CPU 사용량으로 인해 Java 14에서 완전히 제거되었습니다.

```bash
# CMS GC 사용 (Java 8 이하에서만 가능)
java -XX:+UseConcMarkSweepGC -jar application.jar
```

**G1(Garbage First) GC**는 Java 9부터 기본 가비지 컬렉터이며, 힙을 여러 개의 region으로 나누어 논리적으로 Young, Old 영역을 구분합니다. 처리량과 Stop-The-World 시간의 균형을 유지하며, 32GB 이하의 힙에서 가장 효과적입니다.

```bash
# G1 GC 사용 설정
java -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -jar application.jar
```

### 3. 차세대 GC 알고리즘

**ZGC**는 Java 11부터 도입된 초저지연 가비지 컬렉터로, 10ms 이하의 Stop-The-World 시간을 목표로 합니다. 대용량 힙(8MB~16TB)을 처리할 수 있으며, 힙 크기에 관계없이 일정한 성능을 보장합니다.

```bash
# ZGC 사용 설정
java -XX:+UseZGC -jar application.jar
```

**Shenandoah GC**는 Red Hat에서 개발한 가비지 컬렉터로 Java 12부터 도입되었습니다. ZGC와 마찬가지로 저지연과 대용량 힙 처리를 목표로 하며, concurrent evacuation 기술을 사용합니다.

**Epsilon GC**는 실제로 가비지 컬렉션을 수행하지 않는 실험용 컬렉터입니다. 성능 테스트에서 GC 영향을 분리하거나 메모리 사용량 분석에 사용되지만, 프로덕션 환경에는 적합하지 않습니다.

### 4. GC 선택과 최적화

JVM은 시스템 사양에 따라 자동으로 GC를 선택합니다. Server-Class Machine(CPU 2개 이상, 메모리 2GB 이상)에서는 G1 GC가, 그렇지 않은 경우 Serial GC가 선택됩니다.

```bash
# 현재 사용 중인 GC 확인
jcmd <PID> VM.info | grep "garbage collector"

# JVM 정보 확인
jinfo <PID>
```

G1 GC에서는 Humongous 객체(region 크기의 50% 이상)가 특별히 관리됩니다. 이러한 객체는 바로 Old 영역에 할당되어 Full GC 빈도를 증가시킬 수 있으므로, region 크기 조정이나 객체 분할을 고려해야 합니다.

```bash
# G1 region 크기 조정
java -XX:+UseG1GC -XX:G1HeapRegionSize=32m -jar application.jar
```

## 정리

| GC 알고리즘 | 특징 | 적용 시나리오 |
|-------------|------|---------------|
| **Serial GC** | 단일 스레드, 단순함 | 작은 힙, 단일 CPU 환경 |
| **Parallel GC** | 멀티 스레드, 높은 처리량 | CPU 집약적, 배치 처리 |
| **G1 GC** | 처리량과 지연시간 균형 | 일반적인 서버 애플리케이션 |
| **ZGC** | 초저지연(10ms 이하) | 대용량 힙, 실시간 애플리케이션 |
| **Shenandoah GC** | 저지연, concurrent evacuation | 응답성이 중요한 애플리케이션 |

GC 알고리즘 선택 시 애플리케이션의 특성(처리량 vs 응답성), 힙 크기, 하드웨어 사양을 종합적으로 고려해야 합니다. 성능 테스트를 통해 실제 워크로드에서의 최적 설정을 찾는 것이 중요합니다.