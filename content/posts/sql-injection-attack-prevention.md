---
title: "SQL 인젝션 공격과 방어 기법"
shortTitle: "SQL 인젝션"
date: "2026-04-09"
tags: ["sql-injection", "web-security", "database-security", "backend-security", "prepared-statement"]
category: "Security"
summary: "SQL 인젝션 공격의 원리와 PreparedStatement, ORM 등을 활용한 방어 기법을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/283"
references: ["https://owasp.org/www-community/attacks/SQL_Injection", "https://docs.oracle.com/javase/tutorial/jdbc/basics/prepared.html", "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html"]
---

## SQL 인젝션이란?

SQL 인젝션(SQL Injection)은 웹 애플리케이션에서 사용자 입력값이 SQL 쿼리에 안전하게 처리되지 않을 때 발생하는 심각한 보안 취약점입니다. 공격자는 악의적인 SQL 코드를 주입하여 데이터베이스를 조작할 수 있습니다.

이 공격을 통해 인증 우회, 민감한 데이터 탈취, 데이터 변조, 심지어 테이블 삭제까지 가능합니다. OWASP Top 10에서 지속적으로 상위권을 차지할 정도로 중요한 보안 이슈입니다.

## 핵심 개념

### 1. 공격 원리와 예시

취약한 로그인 검증 코드를 살펴보겠습니다:

```java
public boolean login(String username, String password) {
    String sql = "SELECT * FROM users WHERE username = '" + username + 
                 "' AND password = '" + password + "'";
    
    try (Connection conn = DriverManager.getConnection(url);
         Statement stmt = conn.createStatement();
         ResultSet rs = stmt.executeQuery(sql)) {
        return rs.next();
    } catch (SQLException e) {
        throw new RuntimeException("Database error", e);
    }
}
```

공격자가 다음과 같이 입력하면:
- username: `admin' --`
- password: `anything`

생성되는 SQL 쿼리는:
```sql
SELECT * FROM users WHERE username = 'admin' -- ' AND password = 'anything'
```

`--` 이후는 주석 처리되어 비밀번호 조건이 무시되고, admin 계정으로 인증이 우회됩니다.

### 2. 다양한 공격 페이로드

공격자들이 자주 사용하는 페이로드들입니다:

```sql
-- 항상 참이 되는 조건으로 인증 우회
' OR '1'='1' --

-- 다른 테이블 정보 조회
' UNION SELECT username, password FROM admin_users --

-- 테이블 구조 파악
' UNION SELECT table_name, column_name FROM information_schema.columns --

-- 데이터베이스 삭제 (매우 위험)
'; DROP TABLE users; --
```

### 3. PreparedStatement를 활용한 방어

가장 효과적인 방어 방법은 PreparedStatement를 사용하는 것입니다:

```java
public boolean login(String username, String password) {
    String sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    
    try (Connection conn = DriverManager.getConnection(url);
         PreparedStatement pstmt = conn.prepareStatement(sql)) {
        
        pstmt.setString(1, username);
        pstmt.setString(2, password);
        
        try (ResultSet rs = pstmt.executeQuery()) {
            return rs.next();
        }
    } catch (SQLException e) {
        throw new RuntimeException("Database error", e);
    }
}
```

PreparedStatement는 매개변수를 자동으로 이스케이프 처리하여 SQL 코드로 해석되지 않도록 합니다.

### 4. 종합적인 방어 전략

**ORM 프레임워크 활용:**
```java
// JPA Query Methods (안전)
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameAndPassword(String username, String password);
}

// JPQL with Parameters (안전)
@Query("SELECT u FROM User u WHERE u.username = :username AND u.password = :password")
Optional<User> findByCredentials(@Param("username") String username, 
                                @Param("password") String password);
```

**입력 검증 및 화이트리스트:**
```java
public boolean isValidUsername(String username) {
    // 알파벳, 숫자, 언더스코어만 허용
    return username.matches("^[a-zA-Z0-9_]+$") && username.length() <= 20;
}
```

**최소 권한 원칙:**
```sql
-- 애플리케이션용 DB 계정에는 최소 권한만 부여
GRANT SELECT, INSERT, UPDATE ON app_schema.users TO 'app_user'@'%';
-- DROP, ALTER 등의 DDL 권한은 부여하지 않음
```

## 정리

| 방어 기법 | 설명 | 효과성 |
|----------|------|--------|
| **PreparedStatement** | 매개변수를 별도로 바인딩하여 SQL 코드 주입 방지 | 매우 높음 |
| **ORM 프레임워크** | JPA, Hibernate 등으로 직접 SQL 작성 회피 | 높음 |
| **입력 검증** | 화이트리스트 기반으로 허용된 문자만 통과 | 보조적 |
| **최소 권한 원칙** | DB 계정에 필요한 최소 권한만 부여 | 보조적 |
| **에러 메시지 숨김** | DB 오류 정보를 사용자에게 직접 노출 금지 | 보조적 |

SQL 인젝션은 예방 가능한 취약점입니다. PreparedStatement를 기본으로 사용하고, 다층 방어 전략을 구축하여 안전한 웹 애플리케이션을 개발해야 합니다.