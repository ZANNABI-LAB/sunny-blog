---
title: "JDBC Statement와 PreparedStatement의 차이점"
shortTitle: "Statement vs PreparedStatement"
date: "2026-04-11"
tags: ["jdbc", "database", "sql-injection", "prepared-statement", "java"]
category: "Backend"
summary: "JDBC에서 Statement와 PreparedStatement의 성능, 보안, 사용법 차이점을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/291"
references: ["https://docs.oracle.com/javase/tutorial/jdbc/basics/prepared.html", "https://dev.mysql.com/doc/connector-j/8.0/en/connector-j-usagenotes-statements.html", "https://stackoverflow.com/questions/3271249/difference-between-statement-and-preparedstatement"]
---

## Statement와 PreparedStatement란?

JDBC에서 Statement와 PreparedStatement는 모두 SQL 쿼리를 실행하기 위한 인터페이스입니다. 두 인터페이스 모두 데이터베이스에 SQL 명령을 전달하는 역할을 하지만, 쿼리 실행 방식과 보안, 성능 측면에서 중요한 차이점이 있습니다.

Statement는 정적 SQL을 실행할 때 사용하며, 쿼리 문자열을 직접 연결하여 동적 쿼리를 만듭니다. PreparedStatement는 미리 컴파일된 SQL 템플릿을 사용하여 파라미터를 안전하게 바인딩하는 방식으로 동작합니다.

## 핵심 개념

### 1. 보안 차이점

가장 중요한 차이점은 SQL 인젝션 공격에 대한 보안입니다.

**Statement의 취약점:**
```java
// 위험한 코드 - SQL 인젝션 공격에 취약
String userId = request.getParameter("userId");
Statement stmt = conn.createStatement();
String sql = "SELECT * FROM users WHERE id = '" + userId + "'";
ResultSet rs = stmt.executeQuery(sql);
```

위 코드에서 `userId`에 `'; DROP TABLE users; --`와 같은 값이 입력되면 테이블이 삭제될 수 있습니다.

**PreparedStatement의 안전성:**
```java
// 안전한 코드 - SQL 인젝션 공격 방지
String sql = "SELECT * FROM users WHERE id = ?";
PreparedStatement pstmt = conn.prepareStatement(sql);
pstmt.setString(1, userId);
ResultSet rs = pstmt.executeQuery();
```

PreparedStatement는 파라미터를 별도로 처리하여 SQL 구문과 데이터를 분리합니다.

### 2. 성능 차이점

PreparedStatement는 반복 실행 시 더 나은 성능을 제공합니다.

**Statement - 매번 파싱:**
```java
Statement stmt = conn.createStatement();
for (int i = 1; i <= 1000; i++) {
    String sql = "INSERT INTO orders (user_id, amount) VALUES (" + i + ", 100)";
    stmt.executeUpdate(sql); // 매번 SQL 파싱 발생
}
```

**PreparedStatement - 한 번 파싱:**
```java
String sql = "INSERT INTO orders (user_id, amount) VALUES (?, ?)";
PreparedStatement pstmt = conn.prepareStatement(sql);
for (int i = 1; i <= 1000; i++) {
    pstmt.setInt(1, i);
    pstmt.setInt(2, 100);
    pstmt.executeUpdate(); // 파싱 결과 재사용
}
```

PreparedStatement는 SQL 구문을 한 번만 파싱하고 실행 계획을 캐시하여 성능을 향상시킵니다.

### 3. 사용 방법과 타입 안전성

**Statement의 문자열 기반 처리:**
```java
Statement stmt = conn.createStatement();
String sql = "SELECT * FROM products WHERE price > " + price + 
             " AND category = '" + category + "'";
ResultSet rs = stmt.executeQuery(sql);
```

**PreparedStatement의 타입 안전 처리:**
```java
String sql = "SELECT * FROM products WHERE price > ? AND category = ?";
PreparedStatement pstmt = conn.prepareStatement(sql);
pstmt.setBigDecimal(1, price);     // 타입 안전
pstmt.setString(2, category);      // 자동 이스케이프
ResultSet rs = pstmt.executeQuery();
```

PreparedStatement는 각 파라미터의 타입을 명시적으로 설정하여 타입 안전성을 보장합니다.

### 4. 배치 처리 효율성

**PreparedStatement의 배치 처리:**
```java
String sql = "INSERT INTO logs (timestamp, level, message) VALUES (?, ?, ?)";
PreparedStatement pstmt = conn.prepareStatement(sql);

for (LogEntry entry : logEntries) {
    pstmt.setTimestamp(1, entry.getTimestamp());
    pstmt.setString(2, entry.getLevel());
    pstmt.setString(3, entry.getMessage());
    pstmt.addBatch(); // 배치에 추가
}

int[] results = pstmt.executeBatch(); // 한 번에 실행
```

PreparedStatement는 배치 처리에서 더 효율적으로 동작하며, 네트워크 라운드트립을 줄일 수 있습니다.

## 정리

| 특성 | Statement | PreparedStatement |
|------|-----------|-------------------|
| **보안** | SQL 인젝션 취약 | SQL 인젝션 방지 |
| **성능** | 매번 파싱 필요 | 한 번 파싱 후 재사용 |
| **코드 가독성** | 문자열 연결 복잡 | 명확한 파라미터 바인딩 |
| **타입 안전성** | 수동 타입 변환 | 자동 타입 처리 |
| **배치 처리** | 비효율적 | 효율적 |
| **적용 케이스** | 간단한 정적 쿼리 | 동적 파라미터가 있는 쿼리 |

**권장사항:**
- 동적 파라미터가 필요한 경우 PreparedStatement 사용
- 보안이 중요한 애플리케이션에서는 PreparedStatement 필수
- 반복 실행되는 쿼리는 PreparedStatement로 성능 최적화
- 배치 처리 시 PreparedStatement 활용