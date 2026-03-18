---
title: "JPA @OneToOne 연관관계에서 Lazy Loading 설정 시 주의점"
shortTitle: "OneToOne Lazy Loading"
date: "2026-03-18"
tags: ["jpa", "hibernate", "lazy-loading", "onetoone", "database"]
category: "Backend"
summary: "양방향 @OneToOne 연관관계에서 연관관계 주인이 아닌 엔티티 조회 시 Lazy Loading이 동작하지 않는 문제와 해결방안을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/220"
references: ["https://docs.jboss.org/hibernate/orm/6.0/userguide/html_single/Hibernate_User_Guide.html#associations-one-to-one", "https://vladmihalcea.com/the-best-way-to-map-a-onetoone-relationship-with-jpa-and-hibernate/"]
---

## @OneToOne Lazy Loading이란?

JPA의 @OneToOne 연관관계에서 Lazy Loading은 연관된 엔티티를 실제로 사용할 때까지 로딩을 지연시키는 기법입니다. 이를 통해 불필요한 데이터 조회를 방지하고 성능을 최적화할 수 있습니다.

하지만 @OneToOne 관계에서는 다른 연관관계(@ManyToOne, @OneToMany)와 달리 특별한 제약사항이 존재합니다. 특히 양방향 관계에서 연관관계 주인이 아닌 쪽을 조회할 때 Lazy Loading이 의도대로 동작하지 않는 경우가 발생합니다.

## 핵심 개념

### 1. 연관관계 주인과 FK 소유권

@OneToOne 양방향 관계에서는 반드시 한 쪽이 연관관계의 주인이 되어 Foreign Key를 소유합니다.

```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 연관관계 주인이 아닌 쪽 (mappedBy 사용)
    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private Account account;
}

@Entity
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 연관관계 주인 (FK 소유)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
```

Account 테이블이 `user_id` FK를 가지므로 Account가 연관관계의 주인입니다.

### 2. Lazy Loading 실패 원인

연관관계 주인이 아닌 엔티티(User)를 조회할 때 JPA는 다음과 같은 딜레마에 직면합니다:

```java
// User 조회 시 account 필드를 어떻게 초기화할까?
User user = userRepository.findById(1L).get();
```

JPA는 account 필드를 null 또는 프록시 객체 중 하나로 초기화해야 하는데, User 테이블에는 Account와의 연관관계 정보(FK)가 없어서 연관된 Account의 존재 여부를 알 수 없습니다.

### 3. 추가 쿼리 발생 메커니즘

결과적으로 JPA는 연관관계 존재 여부를 확인하기 위해 추가 쿼리를 실행합니다:

```sql
-- User 조회 쿼리
SELECT * FROM users WHERE id = 1;

-- Account 존재 여부 확인을 위한 추가 쿼리 (Lazy Loading 실패)
SELECT 1 FROM account WHERE user_id = 1;
```

이로 인해 fetch = FetchType.LAZY 설정이 무시되고 즉시 로딩과 같은 결과가 발생합니다.

### 4. 해결방안

**단방향 관계로 모델링**
```java
@Entity
public class User {
    @Id
    private Long id;
    // account 참조 제거
}

@Entity
public class Account {
    @Id
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // 단방향 관계 유지
}
```

**@LazyToOne(LazyToOneOption.NO_PROXY) 사용**
```java
@Entity
public class User {
    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    @LazyToOne(LazyToOneOption.NO_PROXY)
    private Account account;
}
```

**별도 조회 메서드 활용**
```java
@Repository
public class UserRepository {
    
    public Optional<Account> findAccountByUserId(Long userId) {
        return accountRepository.findByUserId(userId);
    }
}
```

## 정리

| 구분 | 내용 |
|------|------|
| **문제** | 양방향 @OneToOne에서 연관관계 주인이 아닌 엔티티 조회 시 Lazy Loading 실패 |
| **원인** | FK가 없어 연관관계 존재 여부를 판단할 수 없어 추가 쿼리 실행 |
| **해결방안** | 단방향 관계 설계, @LazyToOne 어노테이션, 별도 조회 로직 분리 |
| **권장사항** | 성능이 중요한 경우 단방향 관계 우선 고려 |

@OneToOne 연관관계에서 Lazy Loading을 효과적으로 활용하려면 연관관계 설계 단계부터 신중하게 접근하고, 필요에 따라 단방향 관계나 별도 조회 로직을 고려하는 것이 바람직합니다.