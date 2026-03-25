---
title: "자바 프로그램 실행 흐름과 JVM 동작 원리"
shortTitle: "자바 실행 흐름"
date: "2026-03-25"
tags: ["java", "jvm", "bytecode", "execution-engine"]
category: "Backend"
summary: "자바 코드가 컴파일되고 JVM에서 실행되는 전체 과정을 살펴봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/242"
references: ["https://docs.oracle.com/javase/specs/jvms/se17/html/jvms-5.html", "https://www.oracle.com/webfolder/technetwork/tutorials/obe/java/gc01/index.html"]
---

## 자바 프로그램 실행 흐름이란?

자바 프로그램의 실행 흐름은 소스 코드 작성부터 실제 기계어 실행까지의 전체 과정을 의미합니다. 자바의 "Write Once, Run Anywhere" 철학을 실현하는 핵심 메커니즘이며, 컴파일과 런타임이라는 두 단계로 구분됩니다.

개발자가 작성한 `.java` 파일은 먼저 플랫폼 독립적인 바이트코드로 변환되고, 이후 JVM(Java Virtual Machine)에 의해 각 플랫폼에 맞는 기계어로 번역되어 실행됩니다. 이러한 구조 덕분에 한 번 작성된 자바 코드는 JVM이 설치된 어떤 환경에서든 동일하게 실행될 수 있습니다.

## 핵심 개념

### 1. 컴파일 단계: 소스 코드에서 바이트코드로

자바 컴파일 과정은 JDK에 포함된 `javac` 컴파일러가 담당합니다.

```java
// HelloWorld.java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

```bash
# 컴파일 명령어
javac HelloWorld.java  # HelloWorld.class 파일 생성
```

컴파일러는 소스 코드를 구문 분석하고, 타입 검사를 수행한 후 JVM이 이해할 수 있는 바이트코드로 변환합니다. 생성된 `.class` 파일에는 플랫폼 독립적인 중간 언어 형태의 명령어들이 담겨 있습니다.

### 2. 클래스 로딩: 동적 로드와 3단계 과정

클래스 로더는 필요한 시점에 `.class` 파일을 JVM 메모리에 로드하는 동적 로딩 방식을 사용합니다.

```java
public class DynamicLoading {
    public static void main(String[] args) {
        // 이 시점에 DatabaseConnection 클래스가 로드됨
        DatabaseConnection db = new DatabaseConnection();
        
        // static 메서드 호출 시에도 클래스 로드
        Utils.printMessage();
    }
}
```

클래스 로딩은 세 단계로 진행됩니다:
- **로딩(Loading)**: `.class` 파일을 메모리의 Method Area에 로드
- **링킹(Linking)**: 검증(Verification), 준비(Preparation), 해석(Resolution) 과정
- **초기화(Initialization)**: static 변수 초기화와 static 블록 실행

### 3. 실행 엔진: 인터프리터와 JIT 컴파일러

실행 엔진은 바이트코드를 기계어로 변환하여 실행하는 역할을 담당합니다. 효율적인 실행을 위해 두 가지 방식을 혼합 사용합니다.

```java
public class HotspotExample {
    private static int counter = 0;
    
    // 자주 호출되는 메서드 (Hotspot)
    public static int calculate(int n) {
        int result = 0;
        for (int i = 0; i < n; i++) {
            result += i * i;  // JIT 컴파일러 최적화 대상
        }
        return result;
    }
    
    public static void main(String[] args) {
        // 반복 실행으로 Hotspot 감지
        for (int i = 0; i < 10000; i++) {
            calculate(100);
        }
    }
}
```

**인터프리터**는 바이트코드를 한 줄씩 해석하여 즉시 실행하므로 초기 실행 속도가 빠르지만, 반복 실행 시 매번 해석 과정을 거쳐야 합니다.

**JIT 컴파일러**는 자주 실행되는 코드(Hotspot)를 감지하면 해당 부분을 네이티브 코드로 컴파일하여 캐싱합니다. 컴파일 시간이 필요하지만 반복 실행 시 뛰어난 성능을 제공합니다.

### 4. JVM 메모리 구조와 실행 흐름

JVM은 실행 과정에서 여러 메모리 영역을 사용합니다:

```java
public class MemoryExample {
    private static String staticVar = "Method Area";  // Method Area에 저장
    private String instanceVar = "Heap";              // Heap에 저장
    
    public void method() {
        int localVar = 42;           // Stack에 저장
        String str = "Hello";        // str은 Stack, "Hello"는 Heap
        
        // 메서드 호출 스택 프레임 생성
        anotherMethod(localVar);
    }
    
    private void anotherMethod(int param) {
        // 새로운 스택 프레임 생성
        // param과 지역 변수들이 이 프레임에 저장
    }
}
```

## 정리

| 단계 | 담당 컴포넌트 | 주요 역할 | 결과물 |
|------|---------------|-----------|--------|
| **컴파일** | javac 컴파일러 | 소스 코드를 바이트코드로 변환 | .class 파일 |
| **로딩** | 클래스 로더 | 바이트코드를 메모리에 동적 로드 | Method Area의 클래스 정보 |
| **링킹** | 클래스 로더 | 검증, 준비, 해석 과정 | 실행 준비 완료된 클래스 |
| **초기화** | JVM | static 변수/블록 초기화 | 실행 가능한 상태 |
| **실행** | 실행 엔진 | 인터프리터 + JIT으로 기계어 변환 | 프로그램 실행 |

자바의 실행 흐름은 컴파일 타임과 런타임의 역할 분리를 통해 플랫폼 독립성과 성능 최적화를 동시에 달성합니다. 동적 클래스 로딩으로 메모리를 효율적으로 사용하고, 혼합 실행 방식으로 초기 응답성과 장기 실행 성능을 모두 확보하는 것이 특징입니다.