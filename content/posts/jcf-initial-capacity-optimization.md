---
title: "JCF 자료구조의 초기 용량 설정과 성능 최적화"
shortTitle: "JCF 초기 용량"
date: "2026-03-23"
tags: ["java", "jcf", "performance", "memory-optimization"]
category: "Backend"
summary: "JCF 자료구조의 초기 용량을 설정하여 리사이징 비용을 줄이고 메모리를 효율적으로 사용하는 방법을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/235"
references: ["https://docs.oracle.com/javase/8/docs/api/java/util/ArrayList.html", "https://docs.oracle.com/javase/8/docs/api/java/util/HashMap.html"]
---

## JCF 초기 용량 설정이란?

Java Collections Framework(JCF)에서 ArrayList, HashMap과 같은 가변 크기 자료구조는 데이터 추가 시 내부 배열이 가득 차면 자동으로 크기를 확장합니다. 초기 용량 설정은 이런 자료구조를 생성할 때 예상되는 데이터 크기를 미리 지정하여 불필요한 리사이징을 방지하는 최적화 기법입니다.

기본적으로 ArrayList는 용량이 10으로 시작하여 필요시 1.5배씩 증가하고, HashMap은 용량이 16으로 시작하여 로드 팩터 0.75를 초과하면 2배씩 증가합니다. 대량의 데이터를 다룰 때 이런 동적 확장은 상당한 성능 오버헤드와 메모리 낭비를 초래할 수 있습니다.

## 핵심 개념

### 1. ArrayList 리사이징 메커니즘

ArrayList는 내부적으로 Object 배열을 사용하며, 용량이 부족하면 새로운 배열을 생성하고 기존 데이터를 복사합니다.

```java
public class ArrayListCapacityExample {
    private static final int MAX = 5_000_000;
    
    public static void main(String[] args) {
        // 기본 용량(10)으로 생성 - 여러 번 리사이징 발생
        List<String> defaultList = new ArrayList<>();
        long startTime = System.currentTimeMillis();
        
        for (int i = 0; i < MAX; i++) {
            defaultList.add("data" + i);
        }
        
        long defaultTime = System.currentTimeMillis() - startTime;
        System.out.println("기본 용량 생성 시간: " + defaultTime + "ms");
        
        // 초기 용량 설정 - 리사이징 없음
        List<String> preAllocatedList = new ArrayList<>(MAX);
        startTime = System.currentTimeMillis();
        
        for (int i = 0; i < MAX; i++) {
            preAllocatedList.add("data" + i);
        }
        
        long preAllocatedTime = System.currentTimeMillis() - startTime;
        System.out.println("초기 용량 설정 시간: " + preAllocatedTime + "ms");
        System.out.println("성능 개선: " + (defaultTime - preAllocatedTime) + "ms");
    }
}
```

### 2. HashMap 로드 팩터와 임계점

HashMap은 로드 팩터(Load Factor)를 사용하여 리사이징 시점을 결정합니다. 로드 팩터는 현재 저장된 요소 수와 전체 용량의 비율입니다.

```java
public class HashMapCapacityExample {
    public static void main(String[] args) {
        // 기본 설정: 초기 용량 16, 로드 팩터 0.75
        Map<String, Integer> defaultMap = new HashMap<>();
        
        // 예상 데이터 크기에 맞는 초기 용량 설정
        int expectedSize = 1000;
        int optimalCapacity = (int) (expectedSize / 0.75) + 1;
        Map<String, Integer> optimizedMap = new HashMap<>(optimalCapacity);
        
        System.out.println("예상 크기: " + expectedSize);
        System.out.println("최적 초기 용량: " + optimalCapacity);
        
        // 성능 비교
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < expectedSize; i++) {
            defaultMap.put("key" + i, i);
        }
        long defaultTime = System.currentTimeMillis() - startTime;
        
        startTime = System.currentTimeMillis();
        for (int i = 0; i < expectedSize; i++) {
            optimizedMap.put("key" + i, i);
        }
        long optimizedTime = System.currentTimeMillis() - startTime;
        
        System.out.println("기본 설정 시간: " + defaultTime + "ms");
        System.out.println("최적화된 설정 시간: " + optimizedTime + "ms");
    }
}
```

### 3. 메모리 사용량 최적화

초기 용량 설정은 메모리 사용량도 크게 개선합니다. 리사이징 과정에서 발생하는 임시 배열과 불필요한 여유 공간을 줄일 수 있습니다.

```java
public class MemoryOptimizationExample {
    public static void main(String[] args) {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        
        // 메모리 사용량 측정 헬퍼 메서드
        Runnable printMemory = () -> {
            System.gc(); // 정확한 측정을 위한 가비지 컬렉션
            MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
            System.out.println("사용 메모리: " + heapUsage.getUsed() / 1024 / 1024 + "MB");
        };
        
        System.out.println("=== 기본 용량으로 생성 ===");
        printMemory.run();
        
        List<String> defaultList = new ArrayList<>();
        for (int i = 0; i < 1_000_000; i++) {
            defaultList.add("data");
        }
        printMemory.run();
        
        System.out.println("=== 초기 용량 설정으로 생성 ===");
        defaultList = null; // 이전 리스트 제거
        System.gc();
        printMemory.run();
        
        List<String> preAllocatedList = new ArrayList<>(1_000_000);
        for (int i = 0; i < 1_000_000; i++) {
            preAllocatedList.add("data");
        }
        printMemory.run();
    }
}
```

### 4. 다양한 JCF 자료구조 최적화

다른 JCF 자료구조들도 초기 용량 설정을 지원합니다.

```java
public class CollectionOptimizationExamples {
    public static void main(String[] args) {
        int expectedSize = 10000;
        
        // ArrayList - 예상 크기로 초기화
        List<String> arrayList = new ArrayList<>(expectedSize);
        
        // HashMap - 로드 팩터 고려한 초기화
        Map<String, String> hashMap = new HashMap<>((int)(expectedSize / 0.75) + 1);
        
        // HashSet - HashMap과 동일한 로직
        Set<String> hashSet = new HashSet<>((int)(expectedSize / 0.75) + 1);
        
        // LinkedHashMap - 순서 보장하면서 초기 용량 설정
        Map<String, String> linkedHashMap = new LinkedHashMap<>((int)(expectedSize / 0.75) + 1);
        
        // StringBuilder - 문자열 길이 예상 시
        int expectedStringLength = 1000;
        StringBuilder stringBuilder = new StringBuilder(expectedStringLength);
        
        System.out.println("모든 컬렉션이 최적화된 초기 용량으로 생성되었습니다.");
    }
}
```

## 정리

| 자료구조 | 기본 초기 용량 | 확장 방식 | 최적화 방법 |
|---------|-------------|----------|-----------|
| ArrayList | 10 | 1.5배 증가 | `new ArrayList<>(예상크기)` |
| HashMap | 16 | 2배 증가 | `new HashMap<>(예상크기/0.75 + 1)` |
| HashSet | 16 | 2배 증가 | `new HashSet<>(예상크기/0.75 + 1)` |
| StringBuilder | 16 | 2배 증가 | `new StringBuilder(예상길이)` |

**핵심 이점:**
- **성능 향상**: 리사이징으로 인한 배열 복사 작업 제거
- **메모리 효율성**: 불필요한 여유 공간과 임시 배열 최소화  
- **예측 가능한 성능**: 동적 확장으로 인한 성능 변동성 감소
- **GC 부하 감소**: 임시 객체 생성 최소화로 가비지 컬렉션 부담 경감

대량의 데이터를 다루는 애플리케이션에서는 초기 용량 설정이 필수적인 최적화 기법입니다.