---
title: "Java String 불변성과 메모리 최적화"
shortTitle: "String 불변성"
date: "2026-03-17"
tags: ["java", "string", "immutability", "memory-management", "thread-safety"]
category: "Backend"
summary: "Java String이 불변 객체로 설계된 이유와 메모리 최적화 메커니즘을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/218"
references: ["https://docs.oracle.com/javase/8/docs/api/java/lang/String.html", "https://www.baeldung.com/java-string-immutable", "https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-2.html#jvms-2.5.5"]
---

## Java String 불변성이란?

Java String은 불변(Immutable) 객체입니다. 한 번 생성된 String 객체의 값은 변경할 수 없으며, 문자열을 수정하는 메서드들은 모두 새로운 String 객체를 반환합니다.

String 클래스는 내부적으로 `final char[] value` 또는 `final byte[] value` 필드(Java 9부터)를 사용하여 문자열을 저장하며, 이 필드는 final로 선언되어 있습니다. 또한 String 클래스 자체도 final로 선언되어 상속이 불가능합니다.

```java
String original = "Hello";
String modified = original.concat(" World");

System.out.println(original);  // "Hello" (변경되지 않음)
System.out.println(modified);  // "Hello World" (새로운 객체)
```

## 핵심 개념

### 1. String 불변성의 메커니즘

String의 불변성은 여러 층위에서 보장됩니다:

```java
public final class String {
    private final byte[] value;  // Java 9+
    private final byte coder;    // 인코딩 정보
    
    // 수정 메서드들은 모두 새로운 객체를 반환
    public String toUpperCase() {
        // 새로운 String 객체 생성 후 반환
    }
    
    public String replace(char oldChar, char newChar) {
        // 새로운 String 객체 생성 후 반환
    }
}
```

문자열을 변경하는 모든 연산은 원본을 수정하지 않고 새로운 String 인스턴스를 생성합니다:

```java
String str = "Java";
str.replace("J", "K");  // 새 객체 생성, str은 여전히 "Java"
str = str.replace("J", "K");  // 참조를 새 객체로 변경해야 함
```

### 2. String Constant Pool과 메모리 최적화

String 리터럴은 힙 메모리의 특별한 영역인 String Constant Pool에 저장됩니다:

```java
String s1 = "Hello";        // String Pool에 저장
String s2 = "Hello";        // 기존 객체 재사용
String s3 = new String("Hello");  // 힙에 새 객체 생성

System.out.println(s1 == s2);  // true (같은 객체 참조)
System.out.println(s1 == s3);  // false (다른 객체 참조)
System.out.println(s1.equals(s3));  // true (내용은 같음)
```

intern() 메서드를 사용하면 힙의 String 객체를 String Pool로 이동시킬 수 있습니다:

```java
String heap = new String("Hello");
String pool = heap.intern();

System.out.println(s1 == pool);  // true (Pool의 같은 객체)
```

### 3. Thread Safety와 성능 이점

불변 객체는 본질적으로 thread-safe하여 동기화가 불필요합니다:

```java
public class StringExample {
    private String sharedString = "Initial";
    
    // 동기화 불필요 - String은 불변이므로
    public void updateString(String newValue) {
        this.sharedString = newValue;  // 새로운 객체 할당만 발생
    }
    
    // 여러 스레드가 안전하게 접근 가능
    public String getSharedString() {
        return sharedString;
    }
}
```

해시코드 캐싱으로 성능을 최적화합니다:

```java
public final class String {
    private int hash;  // 해시코드 캐시
    
    public int hashCode() {
        int h = hash;
        if (h == 0 && value.length > 0) {
            // 최초 한 번만 계산
            hash = h = calculateHashCode();
        }
        return h;
    }
}
```

### 4. 가변 문자열이 필요한 경우

빈번한 문자열 수정이 필요한 경우 StringBuilder나 StringBuffer를 사용합니다:

```java
// String 사용 시 (비효율적)
String result = "";
for (int i = 0; i < 1000; i++) {
    result += "a";  // 매번 새 객체 생성
}

// StringBuilder 사용 시 (효율적)
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append("a");  // 내부 버퍼 수정
}
String result = sb.toString();
```

## 정리

| 측면 | 특징 | 이점 |
|------|------|------|
| **불변성** | 생성 후 값 변경 불가 | 예측 가능한 동작, 버그 감소 |
| **메모리** | String Constant Pool 활용 | 동일 문자열 재사용으로 메모리 절약 |
| **동시성** | Thread-safe 보장 | 동기화 오버헤드 없음 |
| **성능** | 해시코드 캐싱 | HashMap 등에서 성능 향상 |
| **보안** | 민감 정보 보호 | 예기치 않은 수정 방지 |

String의 불변성은 메모리 효율성, 스레드 안전성, 성능 최적화를 동시에 제공하는 Java의 핵심 설계 원칙입니다. 단, 빈번한 문자열 수정이 필요한 경우에는 StringBuilder나 StringBuffer 같은 가변 대안을 사용하는 것이 효율적입니다.