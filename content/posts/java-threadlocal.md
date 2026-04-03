---
title: "Java ThreadLocal: 스레드별 독립 변수 관리"
shortTitle: "ThreadLocal"
date: "2026-04-03"
tags: ["threadlocal", "java", "concurrency", "spring", "thread-safety"]
category: "Backend"
summary: "Java ThreadLocal의 동작 원리와 Spring에서의 활용, 그리고 주의사항을 살펴봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/269"
references: ["https://docs.oracle.com/javase/8/docs/api/java/lang/ThreadLocal.html", "https://spring.io/blog/2020/09/24/spring-tips-context-propagation-with-project-reactor", "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/core/NamedThreadLocal.html"]
---

## ThreadLocal이란?

ThreadLocal은 Java에서 각 스레드마다 독립적인 변수 공간을 제공하는 클래스입니다. 멀티스레드 환경에서 공유 자원으로 인한 동시성 문제를 해결하는 핵심 도구 중 하나로, 각 스레드가 자신만의 데이터를 안전하게 관리할 수 있도록 합니다.

일반적인 static 변수나 인스턴스 변수는 여러 스레드가 공유하기 때문에 synchronized 블록이나 Lock을 사용해야 하지만, ThreadLocal은 각 스레드별로 독립된 저장소를 제공하여 동기화 없이도 thread-safe한 프로그래밍을 가능하게 합니다.

Spring Framework에서는 ThreadLocal을 활용하여 트랜잭션 관리, 보안 컨텍스트 관리, 웹 요청별 데이터 관리 등 다양한 기능을 구현하고 있어, 백엔드 개발에서 필수적으로 이해해야 할 개념입니다.

## 핵심 개념

### 1. ThreadLocal 동작 원리

ThreadLocal의 핵심은 각 Thread가 자신만의 ThreadLocalMap을 갖는다는 점입니다:

```java
public class ThreadLocalExample {
    private static ThreadLocal<String> userContext = new ThreadLocal<>();
    
    public static void setUser(String user) {
        userContext.set(user);
    }
    
    public static String getUser() {
        return userContext.get();
    }
    
    public static void main(String[] args) throws InterruptedException {
        // 스레드 1
        Thread thread1 = new Thread(() -> {
            setUser("Alice");
            System.out.println("Thread 1: " + getUser()); // Alice
        });
        
        // 스레드 2
        Thread thread2 = new Thread(() -> {
            setUser("Bob");
            System.out.println("Thread 2: " + getUser()); // Bob
        });
        
        thread1.start();
        thread2.start();
        thread1.join();
        thread2.join();
    }
}
```

각 스레드는 ThreadLocal 인스턴스를 키로 사용하여 자신의 ThreadLocalMap에 값을 저장합니다. 따라서 같은 ThreadLocal 객체를 사용하더라도 스레드별로 다른 값을 가질 수 있습니다.

### 2. Spring에서의 ThreadLocal 활용

Spring은 ThreadLocal을 활용하여 다양한 컨텍스트를 관리합니다:

```java
// 트랜잭션 동기화 관리
public class TransactionSynchronizationManager {
    private static final ThreadLocal<Map<Object, Object>> resources =
        new NamedThreadLocal<>("Transactional resources");
    
    private static final ThreadLocal<Set<TransactionSynchronization>> synchronizations =
        new NamedThreadLocal<>("Transaction synchronizations");
}

// 보안 컨텍스트 관리
public class SecurityContextHolder {
    private static final ThreadLocal<SecurityContext> contextHolder = 
        new ThreadLocal<>();
    
    public static void setContext(SecurityContext context) {
        contextHolder.set(context);
    }
    
    public static SecurityContext getContext() {
        return contextHolder.get();
    }
}

// 웹 요청 컨텍스트 관리
public class RequestContextHolder {
    private static final ThreadLocal<RequestAttributes> requestAttributesHolder =
        new NamedThreadLocal<>("Request attributes");
    
    public static void setRequestAttributes(RequestAttributes attributes) {
        requestAttributesHolder.set(attributes);
    }
}
```

이러한 구조 덕분에 Service 계층에서 별도의 파라미터 전달 없이도 현재 사용자 정보나 트랜잭션 상태에 접근할 수 있습니다.

### 3. ThreadLocal 주의사항과 메모리 누수 방지

ThreadLocal 사용 시 가장 중요한 것은 적절한 정리(cleanup)입니다:

```java
public class ThreadLocalMemoryLeakExample {
    private static final ThreadLocal<List<String>> dataHolder = new ThreadLocal<>();
    
    public void processRequest() {
        try {
            // ThreadLocal에 데이터 설정
            List<String> data = new ArrayList<>();
            data.add("important data");
            dataHolder.set(data);
            
            // 비즈니스 로직 수행
            performBusinessLogic();
            
        } finally {
            // 반드시 정리해야 함
            dataHolder.remove();
        }
    }
    
    private void performBusinessLogic() {
        List<String> data = dataHolder.get();
        // 비즈니스 로직 수행
    }
}
```

스레드풀 환경에서는 스레드가 재사용되기 때문에, 이전 요청의 ThreadLocal 값이 남아있을 수 있습니다. 이를 방지하기 위해 반드시 `remove()` 메서드를 호출해야 합니다.

### 4. 비동기 처리와 ThreadLocal

비동기 처리에서 ThreadLocal은 예상대로 동작하지 않을 수 있습니다:

```java
@Service
public class AsyncService {
    private static final ThreadLocal<String> userContext = new ThreadLocal<>();
    
    public void processWithAsync() {
        userContext.set("currentUser");
        
        // 이 비동기 메서드는 새로운 스레드에서 실행됨
        asyncMethod(); // userContext.get()은 null을 반환
    }
    
    @Async
    public void asyncMethod() {
        String user = userContext.get(); // null!
        System.out.println("Current user: " + user);
    }
}
```

이 문제를 해결하기 위해 Spring에서는 TaskDecorator를 제공합니다:

```java
@Configuration
public class AsyncConfig implements AsyncConfigurer {
    
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setTaskDecorator(new ContextCopyingDecorator());
        executor.initialize();
        return executor;
    }
    
    public static class ContextCopyingDecorator implements TaskDecorator {
        @Override
        public Runnable decorate(Runnable runnable) {
            String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
            
            return () -> {
                try {
                    // 비동기 스레드에 컨텍스트 복사
                    SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(currentUser, null));
                    runnable.run();
                } finally {
                    SecurityContextHolder.clearContext();
                }
            };
        }
    }
}
```

## 정리

| 측면 | 설명 |
|------|------|
| **핵심 개념** | 각 스레드별 독립적인 변수 저장소 제공 |
| **동작 원리** | Thread마다 ThreadLocalMap 보유, ThreadLocal을 키로 값 저장 |
| **장점** | - 스레드 안전성 보장<br>- 동기화 불필요<br>- 컨텍스트 정보 전역 접근 |
| **Spring 활용** | - TransactionSynchronizationManager<br>- SecurityContextHolder<br>- RequestContextHolder |
| **주의사항** | - 메모리 누수 방지를 위한 remove() 호출 필수<br>- 스레드풀 환경에서 값 재사용 위험<br>- 비동기 처리 시 컨텍스트 전파 문제 |
| **대안** | - 메서드 파라미터 전달<br>- ConcurrentHashMap 활용<br>- @RequestScope 어노테이션 |

ThreadLocal은 강력한 도구이지만 적절한 관리가 필요합니다. 특히 웹 애플리케이션에서는 요청 처리 완료 후 반드시 정리하고, 비동기 처리 시에는 컨텍스트 전파 방안을 고려해야 합니다.