---
title: "SQL NOT IN 쿼리의 성능 문제와 최적화 방법"
shortTitle: "NOT IN 최적화"
date: "2026-04-09"
tags: ["sql", "database-optimization", "query-performance", "not-in", "database"]
category: "Backend"
summary: "NOT IN 쿼리의 성능 문제점을 파악하고 NOT EXISTS, LEFT JOIN 등을 활용한 최적화 방법을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/285"
references: ["https://dev.mysql.com/doc/refman/8.0/en/exists-and-not-exists-subqueries.html", "https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/EXISTS-Condition.html"]
---

## NOT IN 쿼리란?

NOT IN 쿼리는 특정 값 목록에 포함되지 않는 레코드를 조회할 때 사용하는 SQL 문법입니다. 직관적이고 사용하기 쉬워 많은 개발자들이 선호하지만, 대규모 데이터셋에서는 심각한 성능 저하를 일으킬 수 있습니다.

```sql
-- 특정 포스트 ID 목록에 포함되지 않는 포스트 조회
SELECT * FROM posts 
WHERE id NOT IN (1, 2, 3, 100, 200);

-- JPA에서의 사용 예시
SELECT p FROM Post p 
WHERE p.id NOT IN :excludeIds;
```

NOT IN은 부정 조건의 특성상 데이터베이스 옵티마이저가 효율적인 실행 계획을 수립하기 어려우며, 인덱스 활용도가 현저히 떨어집니다.

## 핵심 개념

### 1. NOT IN 쿼리의 주요 문제점

NOT IN 쿼리는 여러 성능 및 동작상의 문제를 가지고 있습니다.

```sql
-- 문제가 되는 NOT IN 쿼리
SELECT p.* FROM posts p
WHERE p.id NOT IN (
    SELECT user_id FROM blocked_users 
    WHERE status = 'ACTIVE'
);
```

**전체 테이블 스캔 유발**
- NOT IN은 부정 조건으로 인해 대부분의 DBMS에서 전체 테이블 스캔을 유발합니다
- 인덱스 Range Scan 대신 Index Full Scan이나 Table Full Scan이 발생합니다
- 데이터 양이 증가할수록 성능이 급격히 저하됩니다

**NULL 값 처리 문제**
```sql
-- 예상과 다른 결과를 반환할 수 있음
SELECT * FROM posts 
WHERE category_id NOT IN (1, 2, NULL);  -- 항상 빈 결과 반환
```

### 2. NOT EXISTS를 활용한 최적화

NOT EXISTS는 NOT IN의 가장 효과적인 대안입니다.

```sql
-- NOT EXISTS를 사용한 최적화
SELECT p.* FROM posts p
WHERE NOT EXISTS (
    SELECT 1 FROM blocked_users b
    WHERE b.user_id = p.author_id 
    AND b.status = 'ACTIVE'
);

-- JPA에서의 구현
@Query("SELECT p FROM Post p WHERE NOT EXISTS " +
       "(SELECT 1 FROM BlockedUser b WHERE b.userId = p.authorId)")
List<Post> findNonBlockedPosts();
```

**NOT EXISTS의 장점**
- 조건을 만족하는 첫 번째 행을 찾으면 즉시 평가를 중단합니다
- 상관 서브쿼리(Correlated Subquery) 방식으로 효율적인 조인 연산이 가능합니다
- NULL 값에 대한 안전한 처리가 보장됩니다
- 대규모 데이터셋에서 가장 안정적인 성능을 제공합니다

### 3. LEFT JOIN과 IS NULL 패턴

LEFT JOIN과 IS NULL을 조합한 방법은 서브쿼리 결과가 작을 때 특히 효과적입니다.

```sql
-- LEFT JOIN + IS NULL 패턴
SELECT p.* FROM posts p
LEFT JOIN (
    SELECT DISTINCT user_id 
    FROM blocked_users 
    WHERE status = 'ACTIVE'
) b ON p.author_id = b.user_id
WHERE b.user_id IS NULL;

-- 임시 테이블을 활용한 방법
WITH excluded_posts AS (
    SELECT id FROM posts WHERE status = 'DRAFT'
)
SELECT p.* FROM posts p
LEFT JOIN excluded_posts e ON p.id = e.id
WHERE e.id IS NULL;
```

**적용 시나리오**
- 제외할 값의 목록이 상대적으로 작을 때 효율적입니다
- PK나 인덱스가 있는 컬럼을 JOIN 조건으로 사용할 때 성능이 우수합니다
- 복잡한 조건이 포함된 서브쿼리보다 단순한 구조로 가독성이 좋습니다

### 4. 인덱스 최적화 전략

NOT IN 대신 사용하는 쿼리들도 적절한 인덱스 설계가 필요합니다.

```sql
-- 인덱스 생성 예시
CREATE INDEX idx_blocked_users_status_userid 
ON blocked_users(status, user_id);

CREATE INDEX idx_posts_author_id 
ON posts(author_id);

-- 최적화된 NOT EXISTS 쿼리
SELECT p.* FROM posts p
WHERE NOT EXISTS (
    SELECT 1 FROM blocked_users b
    WHERE b.status = 'ACTIVE'
    AND b.user_id = p.author_id
);
```

**인덱스 설계 원칙**
- NOT EXISTS의 서브쿼리에서 사용되는 컬럼들에 복합 인덱스를 생성합니다
- WHERE 조건과 JOIN 조건에 사용되는 컬럼 순서를 고려합니다
- 선택도(Selectivity)가 높은 컬럼을 인덱스 앞쪽에 배치합니다

## 정리

| 방법 | 성능 | 복잡도 | NULL 안전성 | 권장 사용 시나리오 |
|------|------|--------|-------------|-------------------|
| **NOT IN** | 낮음 | 낮음 | 위험 | 소규모 데이터, 단순 조건 |
| **NOT EXISTS** | 높음 | 중간 | 안전 | 대규모 데이터, 복잡 조건 |
| **LEFT JOIN + IS NULL** | 높음 | 중간 | 안전 | 작은 제외 목록, 단순 구조 |
| **Anti-Join** | 매우 높음 | 높음 | 안전 | DBMS가 지원하는 경우 |

**최적화 체크리스트**
- NOT IN 대신 NOT EXISTS나 LEFT JOIN + IS NULL 사용
- 서브쿼리나 JOIN에 사용되는 컬럼에 적절한 인덱스 생성
- 실행 계획(Explain Plan)을 통한 성능 검증
- NULL 값 처리 로직 확인 및 테스트