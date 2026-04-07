---
title: "논리 삭제와 물리 삭제: 데이터베이스 삭제 전략 비교"
shortTitle: "논리 삭제 vs 물리 삭제"
date: "2026-04-07"
tags: ["database", "data-management", "soft-delete", "hard-delete", "backend"]
category: "Backend"
summary: "데이터베이스에서 사용되는 논리 삭제와 물리 삭제의 차이점과 각각의 장단점을 분석합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/275"
references: ["https://docs.oracle.com/en/database/oracle/oracle-database/", "https://dev.mysql.com/doc/refman/8.0/en/delete.html", "https://www.postgresql.org/docs/current/dml-delete.html"]
---

## 논리 삭제와 물리 삭제란?

데이터베이스에서 데이터를 삭제하는 방법은 크게 두 가지로 나뉩니다. **물리 삭제(Hard Delete)**는 `DELETE` 명령어를 통해 실제로 데이터를 데이터베이스에서 제거하는 방식이며, **논리 삭제(Soft Delete)**는 삭제 상태를 나타내는 플래그 컬럼을 사용하여 데이터를 숨기는 방식입니다.

물리 삭제는 데이터가 완전히 제거되어 복구가 어려운 반면, 논리 삭제는 데이터가 실제로는 남아있어 필요시 복구할 수 있습니다. 각 방식은 서로 다른 상황과 요구사항에 적합하며, 시스템의 특성에 따라 선택해야 합니다.

## 핵심 개념

### 1. 물리 삭제 구현 방식

물리 삭제는 SQL의 `DELETE` 명령어를 사용하여 테이블에서 행을 완전히 제거합니다.

```sql
-- 물리 삭제: 데이터 완전 제거
DELETE FROM users WHERE id = 1;

-- 조건부 물리 삭제
DELETE FROM orders WHERE created_at < '2024-01-01';

-- 연관된 데이터도 함께 삭제 (CASCADE)
DELETE FROM users WHERE id = 1; -- user_orders도 함께 삭제
```

물리 삭제는 즉시 저장 공간을 확보하고, 인덱스 크기도 줄어들어 검색 성능 향상을 기대할 수 있습니다. 하지만 한번 삭제된 데이터는 백업이 없다면 복구가 불가능합니다.

### 2. 논리 삭제 구현 방식

논리 삭제는 삭제 상태를 나타내는 컬럼을 추가하고, `UPDATE`를 통해 삭제 표시를 합니다.

```sql
-- 테이블에 삭제 상태 컬럼 추가
ALTER TABLE users ADD COLUMN deleted_at DATETIME NULL;
ALTER TABLE users ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- 논리 삭제: 삭제 표시만 수행
UPDATE users SET deleted_at = NOW() WHERE id = 1;
UPDATE users SET is_deleted = TRUE WHERE id = 1;

-- 활성 데이터만 조회
SELECT * FROM users WHERE deleted_at IS NULL;
SELECT * FROM users WHERE is_deleted = FALSE;
```

논리 삭제는 데이터 복구가 용이하고, 삭제된 데이터도 비즈니스 분석에 활용할 수 있습니다. 하지만 테이블 크기가 계속 증가하여 성능에 영향을 줄 수 있습니다.

### 3. JPA에서의 구현

Spring JPA에서는 `@Where` 또는 `@SQLDelete` 애노테이션을 사용하여 논리 삭제를 구현할 수 있습니다.

```java
@Entity
@Table(name = "users")
@SQLDelete(sql = "UPDATE users SET deleted_at = NOW() WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    // getters, setters...
}

// 사용 예시
@Service
public class UserService {
    public void deleteUser(Long userId) {
        // 논리 삭제 수행 (deleted_at 업데이트)
        userRepository.deleteById(userId);
    }
    
    public List<User> getActiveUsers() {
        // deleted_at이 null인 사용자만 조회
        return userRepository.findAll();
    }
}
```

### 4. 상황별 선택 기준

삭제 방식 선택은 데이터의 중요도, 복구 필요성, 성능 요구사항을 고려해야 합니다.

```typescript
// 삭제 전략 결정 로직 예시
interface DeletionStrategy {
  shouldUseLogicalDelete(entity: string, context: DeletionContext): boolean;
}

class BusinessDeletionStrategy implements DeletionStrategy {
  shouldUseLogicalDelete(entity: string, context: DeletionContext): boolean {
    // 사용자 데이터: 논리 삭제 (GDPR, 개인정보보호)
    if (entity === 'user' && context.hasPersonalData) {
      return true;
    }
    
    // 주문 데이터: 논리 삭제 (비즈니스 분석 필요)
    if (entity === 'order' && context.requiresAudit) {
      return true;
    }
    
    // 로그 데이터: 물리 삭제 (용량 최적화)
    if (entity === 'log' && context.isOlderThan(30)) {
      return false;
    }
    
    return false;
  }
}
```

## 정리

논리 삭제와 물리 삭제의 주요 특징을 비교하면 다음과 같습니다:

| 구분 | 물리 삭제 | 논리 삭제 |
|------|----------|----------|
| **실행 방식** | DELETE 명령어 사용 | UPDATE로 플래그 수정 |
| **데이터 복구** | 매우 어려움 (백업 필요) | 쉬움 (플래그만 변경) |
| **저장 공간** | 즉시 확보 | 계속 증가 |
| **검색 성능** | 향상됨 (테이블 크기 감소) | 저하 가능 (WHERE 조건 추가) |
| **비즈니스 분석** | 불가능 | 가능 |
| **구현 복잡도** | 낮음 | 높음 (조회 시 조건 필수) |

- **물리 삭제**는 성능과 저장 공간이 중요하고, 데이터 복구가 불필요한 경우에 적합합니다
- **논리 삭제**는 데이터 보존이 중요하고, 복구나 분석이 필요한 비즈니스 환경에서 유용합니다
- 하이브리드 접근법으로 논리 삭제 후 일정 기간이 지나면 물리 삭제하는 방식도 고려할 수 있습니다