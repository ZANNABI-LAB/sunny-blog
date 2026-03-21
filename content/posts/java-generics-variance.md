---
title: "자바 제네릭의 공변성과 반공변성"
shortTitle: "제네릭 변성"
date: "2026-03-21"
tags: ["java", "generics", "variance", "type-safety", "wildcards"]
category: "Backend"
summary: "자바 제네릭의 무공변 특성과 와일드카드를 통한 공변성, 반공변성 지원 방식을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/229"
references: ["https://docs.oracle.com/javase/tutorial/java/generics/", "https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science)"]
---

## 제네릭 변성이란?

자바의 제네릭은 기본적으로 무공변(Invariant) 특성을 가집니다. 이는 두 타입 간에 상속 관계가 있더라도 제네릭 타입에서는 그 관계가 유지되지 않는다는 의미입니다. 예를 들어, `Cat`이 `Animal`의 하위 타입이어도 `List<Cat>`과 `List<Animal>`은 서로 할당할 수 없습니다.

이러한 무공변성은 타입 안정성을 보장하지만 유연성이 부족합니다. 자바는 이 문제를 해결하기 위해 와일드카드(`?`)와 `extends`, `super` 키워드를 통해 공변성과 반공변성을 지원합니다.

```java
public class Animal {}
public class Cat extends Animal {}

// 무공변 - 컴파일 에러
List<Animal> animals = new ArrayList<Cat>(); // 에러
List<Cat> cats = new ArrayList<Animal>(); // 에러
```

## 핵심 개념

### 1. 무공변성 (Invariance)

무공변성은 제네릭 타입이 정확히 일치해야 한다는 원칙입니다. 이는 런타임 타입 안정성을 보장하지만 코드의 재사용성을 제한합니다.

```java
public void processAnimals(List<Animal> animals) {
    // Animal 타입의 리스트만 받을 수 있음
    animals.add(new Animal());
}

List<Cat> cats = new ArrayList<>();
processAnimals(cats); // 컴파일 에러 - Cat은 Animal의 하위 타입이지만 불가능
```

### 2. 공변성 (Covariance) - `? extends`

공변성은 `<? extends T>` 문법을 통해 구현되며, T의 하위 타입들을 허용합니다. 이는 생산자(Producer) 역할로 사용되며, 읽기 전용으로 동작합니다.

```java
public void readAnimals(List<? extends Animal> animals) {
    // 읽기만 가능
    for (Animal animal : animals) {
        System.out.println(animal.toString());
    }
    
    // 쓰기는 null만 가능
    animals.add(null); // OK
    animals.add(new Animal()); // 컴파일 에러
}

List<Cat> cats = Arrays.asList(new Cat(), new Cat());
readAnimals(cats); // OK - Cat은 Animal의 하위 타입
```

### 3. 반공변성 (Contravariance) - `? super`

반공변성은 `<? super T>` 문법을 통해 구현되며, T의 상위 타입들을 허용합니다. 이는 소비자(Consumer) 역할로 사용되며, 쓰기 전용으로 동작합니다.

```java
public void addCats(List<? super Cat> animals) {
    // 쓰기 가능
    animals.add(new Cat()); // OK
    animals.add(new Animal()); // 컴파일 에러 - Cat의 하위 타입만 가능
    
    // 읽기는 Object 타입으로만 가능
    Object obj = animals.get(0); // OK
    Cat cat = animals.get(0); // 컴파일 에러
}

List<Animal> animals = new ArrayList<>();
addCats(animals); // OK - Animal은 Cat의 상위 타입
```

### 4. PECS 원칙

PECS(Producer Extends, Consumer Super)는 제네릭 와일드카드 사용의 가이드라인입니다. 데이터를 생산(읽기)할 때는 `extends`를, 데이터를 소비(쓰기)할 때는 `super`를 사용합니다.

```java
// Producer - 데이터를 제공하는 역할
public <T> void copyAll(List<? extends T> src, List<? super T> dest) {
    for (T item : src) { // src에서 읽기
        dest.add(item);  // dest에 쓰기
    }
}

List<Cat> cats = Arrays.asList(new Cat(), new Cat());
List<Animal> animals = new ArrayList<>();
copyAll(cats, animals); // Cat을 읽어서 Animal 리스트에 추가
```

## 정리

| 변성 타입 | 문법 | 특징 | 사용 용도 |
|---------|------|------|----------|
| 무공변 | `List<T>` | 정확한 타입만 허용 | 읽기/쓰기 모두 가능 |
| 공변 | `List<? extends T>` | T의 하위 타입 허용 | 읽기 전용 (Producer) |
| 반공변 | `List<? super T>` | T의 상위 타입 허용 | 쓰기 전용 (Consumer) |

- **무공변성**: 타입 안정성을 보장하지만 유연성이 부족
- **공변성**: 하위 타입 허용으로 읽기 작업에 유연성 제공
- **반공변성**: 상위 타입 허용으로 쓰기 작업에 유연성 제공
- **PECS 원칙**: Producer는 extends, Consumer는 super를 사용하여 적절한 변성 선택