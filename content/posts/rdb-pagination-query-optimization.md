---
title: "RDB 페이징 쿼리의 필요성과 성능 최적화"
shortTitle: "RDB 페이징"
date: "2026-03-26"
tags: ["database", "pagination", "sql-optimization", "rdb", "performance"]
category: "Backend"
summary: "RDB에서 페이징 쿼리의 필요성과 LIMIT/OFFSET의 성능 문제, No Offset 방식을 통한 최적화 방법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/245"
references: ["https://dev.mysql.com/doc/refman/8.0/en/limit-optimization.html", "https://www.postgresql.org/docs/current/queries-limit.html"]
---

## 페이징 쿼리란?

페이징 쿼리(Paging Query)는 대량의 데이터를 작은 단위로 나누어 조회하는 데이터베이스 기법입니다. 전체 데이터를 한 번에 조회하는 대신, 지정된 개수만큼 부분적으로 가져와서 메모리 사용량을 줄이고 응답 속도를 개선합니다.

예를 들어, 백만 개의 레코드가 있는 테이블에서 모든 데이터를 한 번에 조회하면 메모리 부족이나 네트워크 타임아웃이 발생할 수 있습니다. 페이징을 통해 10개씩 나누어 처리하면 안정적인 데이터 처리가 가능합니다.

웹 애플리케이션에서는 게시판이나 목록 화면에서 "다음 페이지" 기능을 구현할 때 필수적으로 사용됩니다.

## 핵심 개념

### 1. LIMIT/OFFSET 방식의 기본 구현

가장 일반적인 페이징 방식은 LIMIT과 OFFSET을 사용하는 방법입니다.

```sql
-- 첫 번째 페이지 (1~10번)
SELECT * FROM users 
ORDER BY id 
LIMIT 10 OFFSET 0;

-- 두 번째 페이지 (11~20번)  
SELECT * FROM users 
ORDER BY id 
LIMIT 10 OFFSET 10;

-- 100번째 페이지 (991~1000번)
SELECT * FROM users 
ORDER BY id 
LIMIT 10 OFFSET 990;
```

이 방식은 구현이 간단하지만 성능상 중요한 문제가 있습니다.

### 2. OFFSET 방식의 성능 문제

OFFSET이 클수록 쿼리 성능이 급격히 저하됩니다. 데이터베이스가 지정된 OFFSET 수만큼 모든 레코드를 읽은 후에야 결과를 반환하기 때문입니다.

```sql
-- 성능 측정 예시
-- 1페이지: 0.01초
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 0;

-- 1000페이지: 0.5초  
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 9990;

-- 10000페이지: 5초
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 99990;
```

페이지가 뒤로 갈수록 응답 시간이 선형적으로 증가하여 사용자 경험이 크게 악화됩니다.

### 3. No Offset 방식을 통한 최적화

성능 문제를 해결하기 위해 OFFSET 없이 이전 페이지의 마지막 값을 기준으로 다음 데이터를 조회하는 방식을 사용합니다.

```sql
-- 테이블 구조 예시
CREATE TABLE orders (
    id INT NOT NULL AUTO_INCREMENT,
    created_at DATETIME NOT NULL,
    status VARCHAR(20),
    PRIMARY KEY(id),
    KEY idx_created_at_id(created_at, id)
);

-- 첫 번째 페이지
SELECT * FROM orders 
WHERE created_at >= '2024-01-01' 
ORDER BY created_at, id 
LIMIT 10;

-- 다음 페이지 (이전 페이지 마지막 값: created_at='2024-01-15', id=78)
SELECT * FROM orders 
WHERE (created_at = '2024-01-15' AND id > 78) 
   OR (created_at > '2024-01-15')
ORDER BY created_at, id 
LIMIT 10;
```

이 방식은 인덱스를 효율적으로 활용하여 페이지 위치에 관계없이 일정한 성능을 유지합니다.

### 4. 커서 기반 페이징 구현

No Offset 방식을 웹 애플리케이션에서 구현할 때는 커서(cursor) 개념을 사용합니다.

```javascript
// API 응답 구조
{
  "data": [
    {"id": 1, "name": "사용자1", "created_at": "2024-01-01T10:00:00Z"},
    {"id": 2, "name": "사용자2", "created_at": "2024-01-01T10:05:00Z"}
  ],
  "pagination": {
    "has_next": true,
    "next_cursor": "eyJjcmVhdGVkX2F0IjoiMjAyNC0wMS0wMVQxMDowNTowMFoiLCJpZCI6Mn0="
  }
}

// 다음 페이지 요청
GET /api/users?cursor=eyJjcmVhdGVkX2F0IjoiMjAyNC0wMS0wMVQxMDowNTowMFoiLCJpZCI6Mn0=
```

커서는 마지막 레코드의 정렬 키 값들을 Base64로 인코딩한 토큰으로, 클라이언트가 다음 페이지를 요청할 때 사용합니다.

## 정리

| 구분 | LIMIT/OFFSET | No Offset (커서) |
|------|--------------|------------------|
| **구현 난이도** | 쉬움 | 보통 |
| **성능** | 후반 페이지 느림 | 일정한 성능 |
| **페이지 번호** | 지원 | 지원 안함 |
| **역방향 탐색** | 가능 | 복잡함 |
| **실시간 데이터** | 중복/누락 가능 | 안정적 |

**권장사항:**
- **소규모 데이터**: LIMIT/OFFSET 사용 가능
- **대용량 데이터**: No Offset 방식 필수
- **무한 스크롤**: 커서 기반 페이징 최적
- **페이지 네비게이션**: LIMIT/OFFSET + 캐싱 고려

페이징은 단순해 보이지만 대용량 데이터에서는 성능이 핵심입니다. 서비스 특성에 맞는 방식을 선택하고, 인덱스 설계와 함께 최적화하는 것이 중요합니다.