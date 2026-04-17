---
title: "싱글턴 패턴: 단일 객체 보장하는 생성 패턴"
shortTitle: "싱글턴 패턴"
date: "2026-04-17"
tags: ["singleton-pattern", "design-pattern", "object-creation", "memory-management", "thread-safety"]
category: "Design Pattern"
summary: "애플리케이션 전체에서 하나의 객체 인스턴스만 생성하고 재사용하는 싱글턴 패턴의 구현 방법과 주의사항을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/309"
references: ["https://docs.oracle.com/javase/tutorial/essential/concurrency/", "https://refactoring.guru/design-patterns/singleton", "https://martinfowler.com/articles/injection.html"]
---

## 싱글턴 패턴이란?

싱글턴 패턴(Singleton Pattern)은 클래스의 인스턴스가 오직 하나만 생성되도록 보장하는 생성 패턴입니다. 생성자를 여러 번 호출하더라도 실제로는 최초 생성된 객체를 반환하여, 애플리케이션 전체에서 동일한 인스턴스를 공유합니다.

이 패턴은 데이터베이스 연결 풀, 로그 객체, 설정 관리자와 같이 전역적으로 하나의 객체만 필요한 경우에 주로 사용됩니다. 메모리 효율성을 높이고 일관된 상태 관리를 제공하지만, 잘못 사용하면 코드의 결합도를 높이고 테스트를 어렵게 만들 수 있습니다.

## 핵심 개념

### 1. 기본 구현 방식

가장 간단한 싱글턴 구현은 Eager Initialization 방식입니다:

```java
public class DatabaseConnection {
    // 클래스 로딩 시점에 인스턴스 생성
    private static final DatabaseConnection INSTANCE = new DatabaseConnection();
    
    // private 생성자로 외부 생성 차단
    private DatabaseConnection() {
        // 초기화 로직
    }
    
    public static DatabaseConnection getInstance() {
        return INSTANCE;
    }
    
    public void connect() {
        System.out.println("Database connected");
    }
}

// 사용 예시
DatabaseConnection db1 = DatabaseConnection.getInstance();
DatabaseConnection db2 = DatabaseConnection.getInstance();
System.out.println(db1 == db2); // true - 동일한 인스턴스
```

### 2. 지연 초기화와 스레드 안전성

멀티스레드 환경에서는 동시성 문제를 고려해야 합니다:

```java
public class LazyLogger {
    private static LazyLogger instance;
    
    private LazyLogger() {}
    
    // synchronized로 스레드 안전성 보장
    public static synchronized LazyLogger getInstance() {
        if (instance == null) {
            instance = new LazyLogger();
        }
        return instance;
    }
}

// Bill Pugh Solution - 권장 방식
public class OptimalSingleton {
    private OptimalSingleton() {}
    
    // 내부 클래스가 로딩될 때까지 인스턴스 생성 지연
    private static class SingletonHelper {
        private static final OptimalSingleton INSTANCE = new OptimalSingleton();
    }
    
    public static OptimalSingleton getInstance() {
        return SingletonHelper.INSTANCE;
    }
}
```

### 3. Enum 기반 싱글턴

Java에서 가장 안전한 싱글턴 구현 방법입니다:

```java
public enum ConfigManager {
    INSTANCE;
    
    private String environment;
    
    public void setEnvironment(String env) {
        this.environment = env;
    }
    
    public String getEnvironment() {
        return environment;
    }
}

// 사용 방법
ConfigManager.INSTANCE.setEnvironment("production");
String env = ConfigManager.INSTANCE.getEnvironment();
```

### 4. 테스트 가능한 싱글턴 설계

테스트 용이성을 위해 인터페이스 기반 설계를 활용할 수 있습니다:

```java
public interface CacheService {
    void put(String key, Object value);
    Object get(String key);
}

public class RedisCacheService implements CacheService {
    private static RedisCacheService instance;
    
    private RedisCacheService() {}
    
    public static RedisCacheService getInstance() {
        if (instance == null) {
            instance = new RedisCacheService();
        }
        return instance;
    }
    
    @Override
    public void put(String key, Object value) {
        // Redis 저장 로직
    }
    
    @Override
    public Object get(String key) {
        // Redis 조회 로직
        return null;
    }
}

// 테스트용 가짜 구현체
public class MockCacheService implements CacheService {
    private Map<String, Object> cache = new HashMap<>();
    
    @Override
    public void put(String key, Object value) {
        cache.put(key, value);
    }
    
    @Override
    public Object get(String key) {
        return cache.get(key);
    }
}
```

## 정리

싱글턴 패턴의 핵심 특징과 고려사항을 정리하면 다음과 같습니다:

| 구분 | 내용 |
|------|------|
| **장점** | 메모리 효율성, 전역 접근, 일관된 상태 관리 |
| **단점** | 높은 결합도, 테스트 어려움, 동시성 문제 가능성 |
| **구현 방식** | Eager, Lazy, Bill Pugh Solution, Enum |
| **스레드 안전성** | synchronized, 내부 클래스, Enum 활용 |
| **테스트 개선** | 인터페이스 기반 설계, 의존성 주입 |

싱글턴 패턴은 강력하지만 신중하게 사용해야 하는 패턴입니다. 전역 상태로 인한 복잡도 증가와 테스트 어려움을 고려하여, 정말 필요한 경우에만 적용하고 가능하면 의존성 주입을 통한 대안을 검토하는 것이 좋습니다.