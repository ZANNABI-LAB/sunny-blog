---
title: "행 기반 DB vs 열 기반 DB: 데이터 저장 방식의 차이점"
shortTitle: "행열 기반 DB"
date: "2026-03-29"
tags: ["database", "data-storage", "oltp", "olap", "data-warehouse"]
category: "Backend"
summary: "행 기반 DB와 열 기반 DB의 데이터 저장 방식 차이점과 각각의 최적 사용 사례를 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/255"
references: ["https://docs.aws.amazon.com/redshift/latest/dg/c_columnar_storage_disk_mem_mgmnt.html", "https://cloud.google.com/bigquery/docs/storage", "https://www.postgresql.org/docs/current/storage.html"]
---

## 행 기반 DB와 열 기반 DB란?

행 기반 데이터베이스(Row-oriented Database)는 데이터를 행(Row) 단위로 저장하고 관리하는 데이터베이스입니다. 전통적인 관계형 데이터베이스인 MySQL, PostgreSQL, Oracle DB가 대표적입니다. 반면 열 기반 데이터베이스(Column-oriented Database)는 데이터를 열(Column) 단위로 저장하고 관리하며, BigQuery, Amazon Redshift, Snowflake 등이 이에 해당합니다.

두 방식의 핵심 차이점은 물리적 저장 구조에 있습니다. 같은 테이블 데이터라도 디스크에 저장되는 방식이 완전히 다르며, 이로 인해 각각 다른 워크로드에 최적화됩니다.

## 핵심 개념

### 1. 데이터 저장 구조의 차이

다음과 같은 사용자 테이블이 있다고 가정해보겠습니다:

```sql
CREATE TABLE users (
    id INT,
    name VARCHAR(50),
    age INT,
    email VARCHAR(100)
);

INSERT INTO users VALUES 
(1, 'Alice', 25, 'alice@example.com'),
(2, 'Bob', 30, 'bob@example.com'),
(3, 'Charlie', 35, 'charlie@example.com');
```

**행 기반 저장 방식:**
```
[1, Alice, 25, alice@example.com]
[2, Bob, 30, bob@example.com]
[3, Charlie, 35, charlie@example.com]
```

**열 기반 저장 방식:**
```
ID: [1, 2, 3]
Name: [Alice, Bob, Charlie]
Age: [25, 30, 35]
Email: [alice@example.com, bob@example.com, charlie@example.com]
```

### 2. 성능 특성과 최적화

**행 기반 DB의 장점:**
- **OLTP 워크로드에 최적화**: 단일 행의 삽입, 수정, 삭제가 빠릅니다
- **트랜잭션 처리**: 행 전체를 한 번에 읽고 쓸 수 있어 일관성 유지가 용이합니다
- **인덱스 효율성**: B-tree 인덱스를 통한 빠른 레코드 검색이 가능합니다

```sql
-- 행 기반 DB에서 효율적인 쿼리
SELECT * FROM users WHERE id = 1;
UPDATE users SET age = 26 WHERE id = 1;
```

**열 기반 DB의 장점:**
- **분석 쿼리에 최적화**: 특정 열만 읽어서 I/O 비용을 크게 줄입니다
- **압축 효율성**: 같은 타입의 데이터가 연속 저장되어 압축률이 높습니다
- **집계 연산 최적화**: SUM, COUNT, AVG 등의 연산이 빠릅니다

```sql
-- 열 기반 DB에서 효율적인 쿼리
SELECT AVG(age) FROM users;
SELECT name, age FROM users WHERE age > 30;
```

### 3. 사용 사례와 워크로드

**행 기반 DB 적합한 경우:**
- **온라인 트랜잭션 처리(OLTP)**: 전자상거래, 은행 시스템, CRM
- **실시간 애플리케이션**: 게임, 채팅, 실시간 대시보드
- **빈번한 업데이트**: 사용자 프로필, 재고 관리, 주문 처리

```typescript
// OLTP 워크로드 예시
class UserService {
  async createUser(userData: UserData): Promise<User> {
    // 전체 행을 한 번에 삽입
    return await this.db.users.create(userData);
  }

  async updateUserProfile(userId: number, updates: Partial<UserData>): Promise<User> {
    // 특정 행의 여러 필드를 업데이트
    return await this.db.users.update(userId, updates);
  }
}
```

**열 기반 DB 적합한 경우:**
- **온라인 분석 처리(OLAP)**: 데이터 웨어하우스, BI 시스템
- **대용량 데이터 분석**: 로그 분석, 시계열 데이터 처리
- **리포팅과 집계**: 매출 분석, 사용자 행동 분석

```sql
-- OLAP 워크로드 예시
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as user_count,
    AVG(age) as avg_age
FROM users 
WHERE created_at >= '2024-01-01'
GROUP BY month
ORDER BY month;
```

### 4. 하이브리드 접근법

최근에는 두 방식의 장점을 결합한 하이브리드 솔루션들이 등장했습니다:

**컬럼 스토어 인덱스 (SQL Server, Oracle):**
```sql
-- SQL Server에서 컬럼스토어 인덱스 생성
CREATE NONCLUSTERED COLUMNSTORE INDEX IX_Users_Analytics
ON users (name, age, email);
```

**파티셔닝과 압축 기법:**
```sql
-- PostgreSQL의 컬럼 압축
ALTER TABLE large_table 
ALTER COLUMN data_column SET COMPRESSION lz4;
```

## 정리

| 구분 | 행 기반 DB | 열 기반 DB |
|------|------------|------------|
| **저장 방식** | 행 단위로 연속 저장 | 열 단위로 연속 저장 |
| **최적 워크로드** | OLTP (트랜잭션 처리) | OLAP (분석 처리) |
| **읽기 성능** | 전체 행 읽기에 최적화 | 특정 열 읽기에 최적화 |
| **쓰기 성능** | 행 단위 삽입/수정 빠름 | 대량 일괄 삽입에 유리 |
| **압축률** | 낮음 | 높음 (동일 타입 데이터) |
| **사용 예시** | MySQL, PostgreSQL | BigQuery, Redshift |
| **적합한 쿼리** | `SELECT * WHERE id = ?` | `SELECT SUM(column) FROM table` |

행 기반 DB는 실시간 트랜잭션 처리에, 열 기반 DB는 대용량 데이터 분석에 각각 최적화되어 있습니다. 따라서 시스템의 워크로드 특성을 파악하여 적절한 데이터베이스 유형을 선택하는 것이 중요합니다.