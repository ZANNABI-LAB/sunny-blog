---
title: "Java Reflection API: 런타임 클래스 정보 탐색"
shortTitle: "Reflection API"
date: "2026-03-11"
tags: ["java", "reflection", "runtime", "class-info", "dynamic-loading"]
category: "Backend"
summary: "Java Reflection API를 통해 런타임에 클래스 정보를 동적으로 탐색하고 활용하는 방법을 학습합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/199"
references: ["https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/package-summary.html", "https://docs.oracle.com/javase/tutorial/reflect/"]
---

## Java Reflection API란?

Java Reflection API는 런타임에 클래스, 메서드, 필드 등의 정보를 동적으로 탐색하고 조작할 수 있게 해주는 강력한 기능입니다. `java.lang.reflect` 패키지에서 제공하는 API를 통해 JVM에 로딩된 클래스의 메타데이터에 접근할 수 있습니다.

이 API의 핵심은 컴파일 타임에 클래스 타입을 몰라도 런타임에 해당 정보를 얻을 수 있다는 점입니다. 특히 프레임워크나 라이브러리 개발에서 사용자가 작성한 클래스를 동적으로 처리해야 할 때 필수적인 도구입니다.

## 핵심 개념

### 1. 주요 Reflection 클래스들

Reflection API의 핵심 클래스들과 사용법을 살펴보겠습니다.

```java
import java.lang.reflect.*;

public class ReflectionExample {
    private String name;
    private int age;
    
    public ReflectionExample(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public void greet() {
        System.out.println("Hello, " + name);
    }
    
    private void secretMethod() {
        System.out.println("This is a private method");
    }
}

// Reflection 사용 예시
Class<?> clazz = ReflectionExample.class;

// 생성자 정보 얻기
Constructor<?> constructor = clazz.getConstructor(String.class, int.class);
Object instance = constructor.newInstance("John", 25);

// 메서드 정보 얻기
Method greetMethod = clazz.getMethod("greet");
greetMethod.invoke(instance);

// 필드 정보 얻기
Field nameField = clazz.getDeclaredField("name");
nameField.setAccessible(true); // private 필드 접근
String nameValue = (String) nameField.get(instance);
```

### 2. Class 객체 얻는 방법들

클래스 정보에 접근하는 다양한 방법이 있습니다.

```java
// 1. 클래스 리터럴 사용
Class<?> clazz1 = String.class;

// 2. 객체의 getClass() 메서드 사용
String str = "Hello";
Class<?> clazz2 = str.getClass();

// 3. Class.forName() 사용 (동적 로딩)
try {
    Class<?> clazz3 = Class.forName("java.lang.String");
} catch (ClassNotFoundException e) {
    e.printStackTrace();
}

// 4. 클래스 정보 탐색
System.out.println("Class name: " + clazz1.getName());
System.out.println("Simple name: " + clazz1.getSimpleName());
System.out.println("Package: " + clazz1.getPackage().getName());

// 메서드 목록 출력
Method[] methods = clazz1.getMethods();
for (Method method : methods) {
    System.out.println("Method: " + method.getName());
}
```

### 3. 동적 메서드 호출과 필드 접근

Reflection을 통해 메서드를 동적으로 호출하고 필드에 접근할 수 있습니다.

```java
public class DynamicInvocation {
    public static void processUserData(Object userObject, String methodName) {
        try {
            Class<?> clazz = userObject.getClass();
            
            // 메서드 동적 호출
            Method method = clazz.getMethod(methodName);
            Object result = method.invoke(userObject);
            
            // 모든 필드 값 출력
            Field[] fields = clazz.getDeclaredFields();
            for (Field field : fields) {
                field.setAccessible(true);
                System.out.println(field.getName() + ": " + field.get(userObject));
            }
            
        } catch (Exception e) {
            System.err.println("Reflection error: " + e.getMessage());
        }
    }
}

// 사용 예시
class User {
    private String username;
    private int age;
    
    public User(String username, int age) {
        this.username = username;
        this.age = age;
    }
    
    public String getInfo() {
        return username + " (" + age + ")";
    }
}

User user = new User("Alice", 30);
DynamicInvocation.processUserData(user, "getInfo");
```

### 4. 어노테이션과 Reflection

Reflection은 런타임 어노테이션 처리에도 활용됩니다.

```java
import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface TimeMeasure {
    String value() default "";
}

public class AnnotationProcessor {
    @TimeMeasure("데이터 처리")
    public void processData() {
        // 데이터 처리 로직
        try { Thread.sleep(100); } catch (InterruptedException e) {}
    }
    
    public static void executeWithTimeCheck(Object obj) {
        Class<?> clazz = obj.getClass();
        Method[] methods = clazz.getDeclaredMethods();
        
        for (Method method : methods) {
            if (method.isAnnotationPresent(TimeMeasure.class)) {
                TimeMeasure annotation = method.getAnnotation(TimeMeasure.class);
                
                try {
                    long startTime = System.currentTimeMillis();
                    method.invoke(obj);
                    long endTime = System.currentTimeMillis();
                    
                    System.out.println(annotation.value() + " 실행 시간: " + 
                                     (endTime - startTime) + "ms");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
```

## 정리

| 구분 | 내용 |
|------|------|
| **주요 클래스** | Class, Method, Field, Constructor |
| **활용 분야** | 프레임워크 개발, 동적 프록시, 직렬화 |
| **장점** | 런타임 유연성, 동적 처리 가능 |
| **단점** | 성능 저하, 캡슐화 약화, 코드 복잡성 |

**Reflection API 사용 시 고려사항:**
- **성능**: 일반 메서드 호출보다 느림 (JIT 최적화 제한)
- **보안**: private 멤버 접근 가능으로 캡슐화 위반 위험
- **유지보수**: 컴파일 타임 체크 불가능, 런타임 에러 발생 가능
- **사용 권장 시나리오**: 프레임워크, 라이브러리, 테스팅 도구 개발

Java Reflection API는 강력하지만 신중하게 사용해야 하는 도구입니다. 일반적인 애플리케이션 로직보다는 프레임워크나 도구 개발에서 진가를 발휘합니다.