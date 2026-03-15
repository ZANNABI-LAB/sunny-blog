---
title: "Try-with-resources로 자원 관리하기"
shortTitle: "Try-with-resources"
date: "2026-03-15"
tags: ["java", "resource-management", "exception-handling", "autocloseable", "memory-leak"]
category: "Backend"
summary: "Java 7에서 도입된 try-with-resources 구문으로 자원을 자동으로 해제하고 예외를 안전하게 처리하는 방법을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/213"
references: ["https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html", "https://docs.oracle.com/javase/8/docs/api/java/lang/AutoCloseable.html"]
---

## Try-with-resources란?

Try-with-resources는 Java 7부터 도입된 자원 관리 기능으로, 파일, 데이터베이스 연결, 네트워크 연결 등의 시스템 자원을 자동으로 해제합니다. 개발자가 명시적으로 `close()`를 호출하지 않아도 try 블록이 종료될 때 자동으로 자원을 정리하여 메모리 누수와 성능 문제를 방지합니다.

이 기능을 사용하려면 `AutoCloseable` 인터페이스를 구현한 객체를 try 문의 괄호 안에서 선언해야 합니다. 대부분의 I/O 관련 클래스들은 이미 이 인터페이스를 구현하고 있어 바로 사용할 수 있습니다.

## 핵심 개념

### 1. 기본 사용법과 구조

Try-with-resources의 기본 문법은 try 키워드 뒤에 괄호를 추가하고, 그 안에서 자원을 선언하는 것입니다.

```java
// try-with-resources 사용
try (BufferedReader br = new BufferedReader(new FileReader("data.txt"))) {
    String line = br.readLine();
    System.out.println(line);
} catch (IOException e) {
    e.printStackTrace();
}

// 여러 자원을 동시에 관리
try (FileInputStream fis = new FileInputStream("input.txt");
     FileOutputStream fos = new FileOutputStream("output.txt")) {
    
    byte[] buffer = new byte[1024];
    int bytesRead = fis.read(buffer);
    fos.write(buffer, 0, bytesRead);
    
} catch (IOException e) {
    e.printStackTrace();
}
```

자원들은 선언된 순서의 반대로 해제되므로, 위 예시에서는 `fos`가 먼저 닫히고 `fis`가 나중에 닫힙니다.

### 2. 기존 방식과의 비교

기존의 try-catch-finally 방식과 비교하면 try-with-resources의 장점이 명확해집니다.

```java
// 기존 방식: try-catch-finally
BufferedReader br = null;
try {
    br = new BufferedReader(new FileReader("data.txt"));
    return br.readLine();
} catch (IOException e) {
    e.printStackTrace();
} finally {
    if (br != null) {
        try {
            br.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

// try-with-resources 방식
try (BufferedReader br = new BufferedReader(new FileReader("data.txt"))) {
    return br.readLine();
} catch (IOException e) {
    e.printStackTrace();
}
```

기존 방식의 문제점:
- `close()` 호출을 누락할 수 있음
- finally 블록에서 추가 예외 처리가 필요
- 여러 자원 관리 시 중첩된 try-catch가 필요하여 가독성 저하

### 3. Suppressed Exception 메커니즘

Try-with-resources는 예외 처리에서 특별한 기능을 제공합니다. 주 로직과 자원 해제 과정에서 모두 예외가 발생할 때, 원래 예외를 보존하면서 자원 해제 예외를 suppressed exception으로 관리합니다.

```java
class CustomResource implements AutoCloseable {
    @Override
    public void close() throws Exception {
        throw new Exception("자원 해제 중 예외 발생");
    }

    void process() throws Exception {
        throw new Exception("주 로직 예외 발생");
    }
}

public class ExceptionExample {
    public static void main(String[] args) {
        try (CustomResource resource = new CustomResource()) {
            resource.process(); // 주 예외 발생
        } catch (Exception e) {
            System.out.println("Primary: " + e.getMessage());
            
            // Suppressed Exception 확인
            Throwable[] suppressed = e.getSuppressed();
            for (Throwable s : suppressed) {
                System.out.println("Suppressed: " + s.getMessage());
            }
        }
    }
}
```

출력:
```
Primary: 주 로직 예외 발생
Suppressed: 자원 해제 중 예외 발생
```

### 4. 커스텀 AutoCloseable 구현

직접 만든 클래스에서도 try-with-resources를 사용할 수 있습니다.

```java
public class DatabaseConnection implements AutoCloseable {
    private final String connectionId;
    
    public DatabaseConnection(String connectionId) {
        this.connectionId = connectionId;
        System.out.println("DB 연결 생성: " + connectionId);
    }
    
    public void executeQuery(String sql) {
        System.out.println("쿼리 실행: " + sql);
    }
    
    @Override
    public void close() {
        System.out.println("DB 연결 해제: " + connectionId);
    }
}

// 사용 예시
try (DatabaseConnection conn = new DatabaseConnection("conn-123")) {
    conn.executeQuery("SELECT * FROM users");
} // 자동으로 close() 호출됨
```

## 정리

| 특징 | Try-with-resources | Try-catch-finally |
|------|-------------------|-------------------|
| 자원 해제 | 자동 | 수동 (close() 명시 호출) |
| 코드 간결성 | 높음 | 낮음 |
| 예외 처리 | Suppressed Exception 지원 | 원래 예외 손실 가능 |
| 실수 가능성 | 낮음 | 높음 (close() 누락) |
| 성능 | 우수 | 자원 누수 위험 |

**핵심 장점:**
- **자동 자원 관리**: try 블록 종료 시 자동으로 `close()` 호출
- **안전한 예외 처리**: 원래 예외를 보존하면서 자원 해제 예외도 추적
- **간결한 코드**: finally 블록이나 중첩 try-catch 불필요
- **메모리 누수 방지**: 자원 해제 누락으로 인한 성능 문제 해결

Try-with-resources는 Java에서 자원 관리의 표준 방법으로, 파일 처리, 데이터베이스 연결, 네트워크 통신 등 모든 자원 관리 상황에서 사용하는 것이 좋습니다.