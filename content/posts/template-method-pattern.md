---
title: "템플릿 메서드 패턴: 알고리즘의 골격을 정의하는 행위 패턴"
shortTitle: "템플릿 메서드 패턴"
date: "2026-04-07"
tags: ["template-method", "design-pattern", "inheritance", "algorithm", "code-reuse"]
category: "Design Pattern"
summary: "알고리즘의 골격을 상위 클래스에서 정의하고, 세부 구현을 하위 클래스에서 담당하는 행위 디자인 패턴입니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/276"
references: ["https://refactoring.guru/design-patterns/template-method", "https://docs.oracle.com/javase/tutorial/java/IandI/abstract.html", "https://martinfowler.com/articles/injection.html"]
---

## 템플릿 메서드 패턴이란?

템플릿 메서드 패턴(Template Method Pattern)은 알고리즘의 골격을 상위 클래스에서 정의하고, 세부 구현을 하위 클래스에 맡기는 행위 디자인 패턴입니다. 상위 클래스는 알고리즘의 실행 순서와 구조를 결정하는 템플릿 메서드를 제공하고, 하위 클래스는 각 단계의 구체적인 구현을 담당합니다.

이 패턴은 "할리우드 원칙(Hollywood Principle)"을 따릅니다. "우리가 당신을 호출할 테니, 당신이 우리를 호출하지 마세요"라는 의미로, 상위 클래스가 전체 흐름을 제어하고 필요한 시점에 하위 클래스의 메서드를 호출하는 구조입니다.

## 핵심 개념

### 1. 기본 구조와 구현

템플릿 메서드 패턴은 추상 클래스와 구체 클래스로 구성됩니다. 상위 클래스에서 알고리즘의 뼈대를 정의하고, 하위 클래스에서 세부 구현을 제공합니다.

```java
public abstract class DataProcessor {
    
    // 템플릿 메서드 - 알고리즘의 골격 정의
    public final void processData() {
        readData();
        validateData();
        transformData();
        saveData();
        cleanup();
    }
    
    protected abstract void readData();
    protected abstract void validateData();
    protected abstract void transformData();
    protected abstract void saveData();
    
    // 공통 구현 - 모든 하위 클래스에서 동일하게 사용
    protected final void cleanup() {
        System.out.println("메모리 정리 중...");
    }
}

class CsvDataProcessor extends DataProcessor {
    
    @Override
    protected void readData() {
        System.out.println("CSV 파일에서 데이터 읽기");
    }
    
    @Override
    protected void validateData() {
        System.out.println("CSV 형식 검증");
    }
    
    @Override
    protected void transformData() {
        System.out.println("CSV 데이터를 객체로 변환");
    }
    
    @Override
    protected void saveData() {
        System.out.println("데이터베이스에 저장");
    }
}
```

### 2. Hook 메서드 활용

Hook 메서드는 선택적으로 오버라이드할 수 있는 메서드로, 알고리즘의 특정 지점에서 추가 로직을 삽입할 수 있게 해줍니다.

```java
public abstract class WebCrawler {
    
    public final void crawlWebsite(String url) {
        authenticate();
        
        if (shouldRetry()) {
            retryConnection();
        }
        
        extractData(url);
        processData();
        
        if (shouldNotify()) {
            sendNotification();
        }
        
        cleanup();
    }
    
    protected abstract void authenticate();
    protected abstract void extractData(String url);
    protected abstract void processData();
    
    // Hook 메서드 - 기본 구현 제공, 필요시 오버라이드 가능
    protected boolean shouldRetry() {
        return false;
    }
    
    protected boolean shouldNotify() {
        return true;
    }
    
    protected void retryConnection() {
        // 기본 재시도 로직
    }
    
    protected void sendNotification() {
        System.out.println("크롤링 완료 알림");
    }
    
    private void cleanup() {
        System.out.println("리소스 정리");
    }
}
```

### 3. Spring Framework에서의 활용

Spring Framework는 템플릿 메서드 패턴을 광범위하게 활용합니다. 특히 JdbcTemplate, RestTemplate 등에서 이 패턴을 확인할 수 있습니다.

```java
// JdbcTemplate의 템플릿 메서드 패턴 활용 예시
@Repository
public class UserRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    public List<User> findAllUsers() {
        return jdbcTemplate.query(
            "SELECT * FROM users",
            (rs, rowNum) -> new User(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("email")
            )
        );
    }
}

// 커스텀 템플릿 클래스 구현
public abstract class ApiTemplate {
    
    public final ApiResponse executeRequest(String endpoint) {
        preProcess();
        
        try {
            ApiResponse response = doExecute(endpoint);
            return postProcess(response);
        } catch (Exception e) {
            return handleError(e);
        } finally {
            cleanup();
        }
    }
    
    protected abstract ApiResponse doExecute(String endpoint);
    
    protected void preProcess() {
        // 공통 전처리 로직
    }
    
    protected ApiResponse postProcess(ApiResponse response) {
        // 기본 후처리 로직
        return response;
    }
    
    protected ApiResponse handleError(Exception e) {
        return ApiResponse.error(e.getMessage());
    }
    
    protected void cleanup() {
        // 리소스 정리
    }
}
```

### 4. 장단점과 사용 시점

**장점:**
- 코드 중복 제거: 공통 로직을 상위 클래스에 집중
- 알고리즘 제어: 실행 순서와 구조를 상위 클래스에서 통제
- 확장성: 새로운 구현체 추가가 용이
- 일관성: 모든 하위 클래스가 동일한 알고리즘 구조를 따름

**단점:**
- 상속 의존성: 클래스 간 강한 결합도
- 복잡성 증가: 상위 클래스 이해 없이는 하위 클래스 개발 어려움
- 유연성 제한: 알고리즘 구조 변경 시 모든 하위 클래스에 영향

```java
// 사용 적절한 경우: 동일한 알고리즘, 다른 구현
public abstract class ReportGenerator {
    
    public final String generateReport(List<Data> data) {
        String header = createHeader();
        String body = processData(data);
        String footer = createFooter();
        
        return formatReport(header, body, footer);
    }
    
    protected abstract String createHeader();
    protected abstract String processData(List<Data> data);
    protected abstract String createFooter();
    protected abstract String formatReport(String... parts);
}

// Strategy 패턴이 더 적절한 경우: 다양한 알고리즘 필요
public interface SortingStrategy {
    void sort(int[] array);
}

public class QuickSort implements SortingStrategy {
    public void sort(int[] array) { /* 퀵정렬 구현 */ }
}
```

## 정리

| 구성 요소 | 역할 | 특징 |
|-----------|------|------|
| **Abstract Class** | 알고리즘 골격 정의 | 템플릿 메서드는 final로 선언 |
| **Template Method** | 실행 순서 제어 | 추상 메서드와 Hook 메서드 조합 |
| **Abstract Methods** | 필수 구현 메서드 | 하위 클래스에서 반드시 구현 |
| **Hook Methods** | 선택적 확장 지점 | 기본 구현 제공, 필요시 오버라이드 |
| **Concrete Class** | 구체적 구현 제공 | 추상 메서드를 실제로 구현 |

템플릿 메서드 패턴은 동일한 알고리즘 구조를 가지지만 세부 구현이 다른 경우에 적합합니다. Spring Framework의 Template 클래스들처럼 공통 로직을 추상화하고 변경 지점만 확장할 수 있도록 설계할 때 매우 유용한 패턴입니다.