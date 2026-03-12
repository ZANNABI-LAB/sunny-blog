---
title: "데이터베이스 정규화: 중복 데이터 제거와 무결성 보장"
shortTitle: "DB 정규화"
date: "2026-03-07"
tags: ["database", "normalization", "data-integrity", "relational-database"]
category: "Backend.Database"
summary: "데이터베이스 정규화 과정과 각 단계별 특징, 그리고 역정규화 전략에 대해 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/191"
references: ["https://dev.mysql.com/doc/refman/8.0/en/designing-database.html", "https://www.postgresql.org/docs/current/ddl-constraints.html"]
---

## 데이터베이스 정규화란?

데이터베이스 정규화(Normalization)는 관계형 데이터베이스에서 테이블을 체계적으로 정리하여 중복 데이터를 최소화하고 데이터 무결성을 보장하는 과정입니다. 이 과정을 통해 데이터 저장 공간을 절약하고, 삽입·갱신·삭제 시 발생할 수 있는 이상 현상(Anomaly)을 해결할 수 있습니다.

정규화는 여러 단계로 구분되며, 각 단계는 특정한 규칙과 조건을 만족해야 합니다. 일반적으로 1정규형(1NF)부터 3정규형(3NF), 그리고 보이스-코드 정규형(BCNF)까지를 실무에서 주로 사용합니다.

## 핵심 개념

### 1. 제1정규형(1NF): 원자값 보장

1NF는 테이블의 모든 컬럼이 원자값(Atomic Value)을 가지도록 하는 단계입니다. 즉, 하나의 셀에는 하나의 값만 저장되어야 합니다.

```sql
-- 정규화 전 (1NF 위반)
CREATE TABLE users_before (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    hobbies VARCHAR(100) -- '독서, 영화감상, 게임'과 같이 여러 값 저장
);

-- 정규화 후 (1NF 만족)
CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE user_hobbies (
    user_id INT,
    hobby VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 2. 제2정규형(2NF): 완전 함수 종속

2NF는 1NF를 만족하면서 기본키의 일부분에만 종속되는 속성이 없도록 하는 단계입니다. 복합키의 일부분이 다른 속성을 결정하는 부분 종속을 제거해야 합니다.

```sql
-- 정규화 전 (2NF 위반)
CREATE TABLE order_items_before (
    order_id INT,
    product_id INT,
    quantity INT,
    product_name VARCHAR(100), -- product_id에만 종속
    product_price DECIMAL(10,2), -- product_id에만 종속
    PRIMARY KEY (order_id, product_id)
);

-- 정규화 후 (2NF 만족)
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    order_date DATE
);

CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100),
    product_price DECIMAL(10,2)
);

CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
```

### 3. 제3정규형(3NF): 이행적 종속 제거

3NF는 2NF를 만족하면서 이행적 종속을 제거하는 단계입니다. A→B, B→C의 관계에서 A→C가 성립하는 이행적 종속을 분리해야 합니다.

```sql
-- 정규화 전 (3NF 위반)
CREATE TABLE employees_before (
    emp_id INT PRIMARY KEY,
    emp_name VARCHAR(50),
    dept_code VARCHAR(10),
    dept_name VARCHAR(50), -- dept_code를 통해 결정됨 (이행적 종속)
    dept_location VARCHAR(100) -- dept_code를 통해 결정됨 (이행적 종속)
);

-- 정규화 후 (3NF 만족)
CREATE TABLE departments (
    dept_code VARCHAR(10) PRIMARY KEY,
    dept_name VARCHAR(50),
    dept_location VARCHAR(100)
);

CREATE TABLE employees (
    emp_id INT PRIMARY KEY,
    emp_name VARCHAR(50),
    dept_code VARCHAR(10),
    FOREIGN KEY (dept_code) REFERENCES departments(dept_code)
);
```

### 4. 역정규화: 성능 최적화 전략

역정규화(Denormalization)는 읽기 성능 향상을 위해 의도적으로 중복 데이터를 허용하는 전략입니다. 주로 조회가 빈번한 데이터에 적용됩니다.

```sql
-- 역정규화 예시: 게시글 테이블에 댓글 수 저장
CREATE TABLE posts (
    post_id INT PRIMARY KEY,
    title VARCHAR(200),
    content TEXT,
    comment_count INT DEFAULT 0, -- 역정규화된 컬럼
    created_at TIMESTAMP
);

-- 댓글 추가 시 트리거로 count 업데이트
DELIMITER //
CREATE TRIGGER update_comment_count 
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
    UPDATE posts 
    SET comment_count = comment_count + 1 
    WHERE post_id = NEW.post_id;
END//
DELIMITER ;
```

## 정리

| 정규형 | 조건 | 목적 |
|--------|------|------|
| **1NF** | 원자값 보장 | 반복 그룹 제거 |
| **2NF** | 완전 함수 종속 | 부분 종속 제거 |
| **3NF** | 이행적 종속 제거 | 간접 종속 제거 |
| **BCNF** | 모든 결정자가 후보키 | 강화된 3NF |

**정규화의 장점:**
- 데이터 중복 최소화로 저장 공간 절약
- 데이터 일관성 보장
- 삽입/갱신/삭제 이상 현상 방지

**역정규화 고려사항:**
- 읽기 성능 향상이 필요한 경우
- 데이터 일관성 유지를 위한 추가 로직 필요
- 저장 공간과 성능 간의 트레이드오프 고려