---
title: "스프링 트랜잭션 AOP 동작 흐름"
shortTitle: "트랜잭션 AOP"
date: "2026-03-06"
tags: ["spring", "aop", "transaction", "backend"]
category: "Backend"
summary: "스프링 트랜잭션 AOP의 핵심 구성 요소와 동작 흐름을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/181"
references:
  - "https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html"
  - "https://docs.spring.io/spring-framework/reference/core/aop.html"
---

## 스프링 트랜잭션 AOP란?

스프링 트랜잭션 AOP는 `@Transactional` 어노테이션을 통한 선언적 트랜잭션 관리(Declarative Transaction Management) 방식입니다. 개발자가 트랜잭션 시작, 커밋, 롤백 등의 세부 구현을 직접 작성하지 않고도 트랜잭션을 관리할 수 있게 해줍니다.

이 방식은 프록시 패턴을 활용하여 메서드 호출 전후에 트랜잭션 관련 로직을 투명하게 처리합니다. 비즈니스 로직과 트랜잭션 관리 코드를 분리함으로써 코드의 가독성과 유지보수성을 크게 향상시킵니다.

## 핵심 개념

### 1. 트랜잭션 AOP 프록시

트랜잭션 AOP 프록시는 `@Transactional`이 적용된 메서드 호출을 가로채는 역할을 합니다.

```java
@Service
public class UserService {
    
    @Transactional
    public void createUser(User user) {
        // 비즈니스 로직
        userRepository.save(user);
        profileRepository.save(user.getProfile());
    }
}
```

스프링이 생성한 프록시 객체가 실제 서비스 객체를 감싸고, 메서드 호출 시 트랜잭션을 시작하고 종료하는 코드를 자동으로 추가합니다. JDK Dynamic Proxy 또는 CGLIB를 사용하여 프록시를 생성합니다.

### 2. 트랜잭션 매니저 (PlatformTransactionManager)

트랜잭션 매니저는 실제 트랜잭션 시작, 커밋, 롤백을 담당하는 추상화된 인터페이스입니다.

```java
@Configuration
public class TransactionConfig {
    
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

데이터 액세스 기술에 따라 다른 구현체를 사용합니다:
- JDBC: `DataSourceTransactionManager`
- JPA: `JpaTransactionManager`
- JTA: `JtaTransactionManager`

### 3. 트랜잭션 동기화 매니저

트랜잭션 동기화 매니저는 현재 스레드에서 사용 중인 트랜잭션 리소스를 ThreadLocal을 통해 관리합니다.

```java
// 내부적으로 이런 방식으로 동작
public class TransactionSynchronizationManager {
    private static final ThreadLocal<Map<Object, Object>> resources = 
        new NamedThreadLocal<>("Transactional resources");
    
    public static void bindResource(Object key, Object value) {
        // 현재 스레드에 리소스 바인딩
    }
}
```

이를 통해 서비스 메서드 내에서 여러 데이터 액세스 메서드를 호출할 때도 동일한 데이터베이스 커넥션을 사용할 수 있습니다.

### 4. 전체 동작 흐름

트랜잭션 AOP의 전체 동작 과정은 다음과 같습니다:

```java
// 1. 클라이언트 요청
userService.createUser(user);

// 2. 프록시가 요청을 가로채고 트랜잭션 시작
TransactionStatus status = transactionManager.getTransaction(definition);

// 3. 동기화 매니저에 커넥션 저장
TransactionSynchronizationManager.bindResource(dataSource, connection);

// 4. 실제 비즈니스 메서드 실행
target.createUser(user);

// 5. 성공 시 커밋, 예외 시 롤백
if (success) {
    transactionManager.commit(status);
} else {
    transactionManager.rollback(status);
}
```

## 정리

| 구성요소 | 역할 | 특징 |
|---------|------|------|
| **AOP 프록시** | 메서드 호출 가로채기 | JDK Dynamic Proxy 또는 CGLIB 사용 |
| **트랜잭션 매니저** | 트랜잭션 시작/커밋/롤백 | 데이터 액세스 기술별 구현체 제공 |
| **동기화 매니저** | 트랜잭션 리소스 관리 | ThreadLocal을 통한 스레드 안전성 보장 |

스프링 트랜잭션 AOP는 세 가지 핵심 구성 요소가 유기적으로 연동되어 선언적 트랜잭션 관리를 가능하게 합니다. 이를 통해 개발자는 비즈니스 로직에만 집중할 수 있으며, 트랜잭션의 일관성과 안정성을 보장받을 수 있습니다.