---
title: "JPA Fetch Join과 페이징 함께 사용 시 주의점"
shortTitle: "Fetch Join 페이징"
date: "2026-03-31"
tags: ["jpa", "fetch-join", "pagination", "performance", "n-plus-one"]
category: "Backend"
summary: "JPA에서 ToMany 관계의 Fetch Join과 페이징을 함께 사용할 때 발생하는 메모리 문제와 해결 방안을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/261"
references: ["https://docs.spring.io/spring-data/jpa/docs/current/reference/html/", "https://hibernate.org/orm/documentation/", "https://docs.oracle.com/javaee/7/tutorial/persistence-querylanguage.htm"]
---

## JPA Fetch Join과 페이징 조합의 문제점이란?

JPA에서 연관 엔티티를 효율적으로 조회하기 위해 Fetch Join을 사용하고, 대용량 데이터를 처리하기 위해 페이징을 적용하는 것은 일반적인 패턴입니다. 하지만 ToMany(일대다) 관계에서 이 두 기능을 함께 사용하면 예상치 못한 성능 문제가 발생할 수 있습니다.

특히 컬렉션 연관관계에서 Fetch Join과 페이징을 동시에 사용하면, 하이버네이트가 전체 결과를 메모리에 로드한 후 애플리케이션 레벨에서 페이징을 처리하게 됩니다. 이는 OutOfMemoryError를 유발할 수 있는 심각한 문제입니다.

## 핵심 개념

### 1. 카티션 프로덕트와 메모리 문제

ToMany 관계에서 Fetch Join을 사용하면 조인 결과로 인해 데이터가 중복됩니다:

```java
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "product", cascade = CascadeType.PERSIST)
    private List<ProductCategory> categories = new ArrayList<>();
}

@Entity
public class ProductCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    private Category category;
}

// 문제가 되는 쿼리
@Query("""
    select p
    from Product p
    join fetch p.categories pc
    join fetch pc.category c
    order by p.id desc
    """)
Slice<Product> findProductWithSlice(Pageable pageable);
```

이 쿼리 실행 시 하이버네이트는 다음 경고를 출력합니다:
```
HHH000104: firstResult/maxResults specified with collection fetch; applying in memory
```

### 2. 실제 SQL 실행 과정

페이징이 적용되지 않고 전체 데이터를 조회하는 SQL이 실행됩니다:

```sql
SELECT p.id, pc.product_id, pc.id, c.id, c.name 
FROM product p 
JOIN product_category pc ON p.id = pc.product_id 
JOIN category c ON c.id = pc.category_id 
ORDER BY p.id DESC
-- LIMIT, OFFSET 절이 없음
```

Product 1개에 Category 10개가 연결되어 있다면, 조인 결과는 10개 행이 됩니다. 1000개의 Product를 페이징으로 조회하려 해도, 실제로는 모든 연결된 Category까지 포함해 수만 개의 행이 메모리에 로드됩니다.

### 3. BatchSize를 활용한 해결 방안

Fetch Join 대신 지연 로딩과 BatchSize를 조합하여 문제를 해결할 수 있습니다:

```java
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @BatchSize(size = 100)
    @OneToMany(mappedBy = "product", cascade = CascadeType.PERSIST)
    private List<ProductCategory> categories = new ArrayList<>();
}

// BatchSize 적용된 안전한 쿼리
@Query("select p from Product p order by p.id desc")
Slice<Product> findProducts(Pageable pageable);
```

이렇게 하면 다음과 같은 최적화된 쿼리가 실행됩니다:

```sql
-- 1. 페이징된 Product 조회
SELECT p.* FROM product p ORDER BY p.id DESC LIMIT 20 OFFSET 0;

-- 2. BatchSize로 묶어서 Category 조회
SELECT pc.product_id, pc.id, pc.category_id 
FROM product_category pc 
WHERE pc.product_id IN (?, ?, ?, ..., ?); -- 최대 100개씩
```

### 4. 글로벌 BatchSize 설정

개별 엔티티마다 `@BatchSize`를 설정하는 대신, 애플리케이션 전역에 기본값을 설정할 수 있습니다:

```yaml
# application.yml
spring:
  jpa:
    properties:
      hibernate:
        default_batch_fetch_size: 100
```

이 설정을 통해 모든 지연 로딩 컬렉션에 대해 IN 쿼리 최적화가 적용됩니다.

## 정리

| 구분 | Fetch Join + 페이징 | BatchSize + 페이징 |
|------|---------------------|-------------------|
| **메모리 사용량** | 전체 데이터 로드 (위험) | 페이징된 데이터만 로드 |
| **쿼리 실행** | 1번 (페이징 무시) | 2번 (페이징 + IN 쿼리) |
| **성능** | 대용량 데이터에서 OOM 위험 | 안정적이고 예측 가능 |
| **사용 권장** | ToOne 관계만 | ToMany 관계에서 필수 |

**핵심 원칙:**
- **ToMany 관계에서는 Fetch Join과 페이징을 함께 사용하지 않습니다**
- **BatchSize를 활용하여 N+1 문제를 해결합니다**
- **페이징이 필요한 경우 지연 로딩을 선택합니다**
- **메모리 사용량을 항상 모니터링합니다**