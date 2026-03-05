---
title: "데이터베이스 복제(Replication) 완전 정복"
date: "2026-03-05"
tags: ["database", "replication", "mysql", "backend"]
category: "Backend"
summary: "데이터베이스 복제의 개념과 주요 방식(마스터-슬레이브, 멀티 마스터)을 코드 예시와 함께 정리합니다."
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/42"
---

## 데이터베이스 복제란?

데이터베이스 **복제(Replication)**는 하나의 데이터베이스 서버(Primary)의 데이터를 하나 이상의 복제 서버(Replica)에 자동으로 동기화하는 기술입니다.

주요 목적은 세 가지입니다.

- **고가용성(HA)**: Primary 장애 시 Replica로 빠르게 전환
- **읽기 부하 분산**: 읽기 쿼리를 Replica로 분산
- **백업**: Replica를 실시간 백업 용도로 활용

---

## 복제 방식

### 1. 마스터-슬레이브 (Single Primary)

가장 일반적인 방식입니다. 쓰기는 Primary에서만 처리하고, 읽기는 Replica에서 처리합니다.

```sql
-- Primary 서버 설정 (my.cnf)
[mysqld]
server-id = 1
log_bin   = mysql-bin
binlog_format = ROW

-- Replica 서버 설정
[mysqld]
server-id = 2
relay_log = mysql-relay-bin
read_only = ON
```

애플리케이션에서는 DataSource를 분리하여 처리합니다.

```typescript
// TypeORM 다중 DataSource 예시
const primaryDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_PRIMARY_HOST,
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "mydb",
});

const replicaDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_REPLICA_HOST,
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "mydb",
});
```

### 2. 멀티 마스터 (Multi-Primary)

여러 서버에서 쓰기가 가능하지만, 충돌 해소(Conflict Resolution)가 복잡합니다.

```
[Primary 1] ⇄ [Primary 2]
     ↕               ↕
[Replica 1]    [Replica 2]
```

---

## 복제 지연(Replication Lag)

비동기 복제에서 가장 주의해야 할 문제입니다. 쓰기 직후 같은 데이터를 읽으면 **stale read**가 발생할 수 있습니다.

```typescript
// 해결책: 쓰기 후 Primary에서 즉시 읽기
const saveAndRead = async (userId: string, data: UpdateData) => {
  await primaryRepo.update(userId, data);
  // Replica 대신 Primary에서 읽는다
  return await primaryRepo.findOne({ where: { id: userId } });
};
```

---

## 정리

| 항목 | 마스터-슬레이브 | 멀티 마스터 |
|------|----------------|-------------|
| 쓰기 처리 | Primary 단일 | 모든 노드 |
| 충돌 처리 | 불필요 | 복잡 |
| 적합한 워크로드 | 읽기 중심 | 지리적 분산 쓰기 |

대부분의 서비스에서는 단순하고 안정적인 **마스터-슬레이브** 방식을 추천합니다.
