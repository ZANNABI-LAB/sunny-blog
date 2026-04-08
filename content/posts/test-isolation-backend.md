---
title: "테스트 격리란? 독립적인 테스트 실행을 위한 핵심 원칙"
shortTitle: "테스트 격리"
date: "2026-04-08"
tags: ["test-isolation", "backend-testing", "spring-testing", "test-reliability"]
category: "Testing"
summary: "각 테스트가 서로 독립적으로 실행되도록 보장하여 비결정적 테스트를 방지하는 테스트 격리 원칙과 구현 방법을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/282"
references: ["https://martinfowler.com/articles/nonDeterminism.html", "https://docs.spring.io/spring-framework/docs/current/reference/html/testing.html", "https://junit.org/junit5/docs/current/user-guide/"]
---

## 테스트 격리란?

테스트 격리(Test Isolation)는 각 테스트가 서로 독립적으로 실행되도록 보장하는 원칙입니다. 어떤 테스트가 실행되더라도 다른 테스트의 결과나 상태에 영향을 주거나 받지 않아야 합니다.

테스트 격리의 핵심 목표는 비결정적 테스트(Non-deterministic Test)를 방지하는 것입니다. 비결정적 테스트는 같은 코드를 여러 번 실행했을 때 결과가 달라지는 테스트로, 디버깅을 어렵게 만들고 개발자의 신뢰도를 떨어뜨립니다.

테스트 격리를 제대로 구현하면 테스트 실행 순서에 관계없이 항상 동일한 결과를 얻을 수 있습니다. 이는 CI/CD 파이프라인에서 안정적인 테스트 수행과 코드 품질 보장에 필수적입니다.

## 핵심 개념

### 1. 비결정적 테스트의 문제점

비결정적 테스트는 공유 자원에 의존할 때 주로 발생합니다:

```typescript
// 문제가 있는 테스트 예시
describe('UserService', () => {
  let userCount = 0;

  it('should create user', async () => {
    userCount++; // 공유 상태 변경
    const user = await userService.createUser(`user${userCount}`);
    expect(user.name).toBe('user1'); // 실행 순서에 따라 실패 가능
  });

  it('should update user', async () => {
    userCount++;
    const user = await userService.updateUser(`user${userCount}`);
    expect(user.name).toBe('user2'); // 이전 테스트에 의존
  });
});
```

이런 테스트는 실행 순서나 병렬 실행 여부에 따라 결과가 달라집니다.

### 2. Spring에서의 데이터베이스 격리 전략

Spring 환경에서 데이터베이스를 사용하는 테스트를 격리하는 세 가지 주요 방법이 있습니다:

**@DirtiesContext를 이용한 완전 격리:**
```java
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@SpringBootTest
class UserServiceTest {
    
    @Test
    void createUserTest() {
        // 매번 새로운 애플리케이션 컨텍스트 사용
        User user = userService.createUser("test");
        assertThat(user.getName()).isEqualTo("test");
    }
}
```

**@Sql을 이용한 데이터 초기화:**
```java
@Sql("/truncate-tables.sql")
@SpringBootTest
class UserServiceTest {
    
    @Test
    void createUserTest() {
        // 테스트 전 테이블 초기화
        User user = userService.createUser("test");
        assertThat(user.getName()).isEqualTo("test");
    }
}
```

**@Transactional을 이용한 롤백:**
```java
@Transactional
@SpringBootTest
class UserServiceTest {
    
    @Test
    void createUserTest() {
        // 테스트 후 자동 롤백
        User user = userService.createUser("test");
        assertThat(user.getName()).isEqualTo("test");
    }
}
```

### 3. @Transactional 사용 시 주의사항

@Transactional을 사용한 격리는 편리하지만 몇 가지 함정이 있습니다:

**프로덕션 환경과의 차이:**
```java
@Service
public class UserService {
    
    public User getUser(Long id) {
        User user = userRepository.findById(id);
        // OSIV가 꺼져있다면 LazyInitializationException 발생
        return user.getProfile(); // 지연 로딩
    }
}

// 테스트에서는 @Transactional로 인해 예외가 발생하지 않음
@Transactional
@Test
void getUserTest() {
    User user = userService.getUser(1L);
    // 실제로는 실패해야 하지만 테스트는 통과 (거짓 음성)
}
```

**별도 스레드에서의 롤백 불가:**
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Transactional
class IntegrationTest {
    
    @Test
    void webLayerTest() {
        // 별도 서블릿 컨테이너에서 실행되므로 롤백 안됨
        restTemplate.postForEntity("/users", userRequest, User.class);
    }
}
```

### 4. 효과적인 격리 전략

테스트 격리를 위한 모범 사례를 따르면 안정적인 테스트를 작성할 수 있습니다:

```typescript
// 각 테스트마다 독립적인 데이터 준비
describe('UserService', () => {
  
  beforeEach(async () => {
    // 각 테스트 전 초기화
    await testDatabase.clear();
    await testDatabase.seed(baseData);
  });

  it('should create user', async () => {
    // 독립적인 테스트 데이터
    const userData = {
      name: 'test-user',
      email: 'test@example.com'
    };
    
    const user = await userService.createUser(userData);
    expect(user.id).toBeDefined();
    expect(user.name).toBe('test-user');
  });

  it('should find user by email', async () => {
    // 이 테스트만의 데이터 준비
    const testUser = await userService.createUser({
      name: 'search-test',
      email: 'search@example.com'
    });
    
    const found = await userService.findByEmail('search@example.com');
    expect(found.id).toBe(testUser.id);
  });
});
```

## 정리

| 격리 방법 | 장점 | 단점 | 사용 시기 |
|-----------|------|------|-----------|
| `@DirtiesContext` | 완전한 격리 보장 | 느린 실행 속도 | 복잡한 통합 테스트 |
| `@Sql` | 명확한 데이터 초기화 | 유지보수 비용 | 특정 데이터 상태 필요시 |
| `@Transactional` | 빠른 실행, 간편함 | 프로덕션과 다른 환경 | 단순한 서비스 레이어 테스트 |

**핵심 원칙:**
- 각 테스트는 독립적으로 실행 가능해야 합니다
- 테스트 순서에 관계없이 동일한 결과를 보장해야 합니다
- 공유 자원 사용 시 적절한 격리 전략을 선택해야 합니다
- 프로덕션 환경과 최대한 유사한 조건에서 테스트해야 합니다