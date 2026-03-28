---
title: "자바스크립트 생성자 함수와 Class 문법"
shortTitle: "생성자 함수 Class"
date: "2026-03-28"
tags: ["constructor-function", "class-syntax", "javascript", "object-oriented", "es6"]
category: "Frontend"
summary: "자바스크립트의 생성자 함수와 ES6 Class 문법의 차이점과 Class가 도입된 이유를 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/251"
references: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes", "https://javascript.info/constructor-new"]
---

## 생성자 함수와 Class란?

자바스크립트에서 객체를 생성하는 방법은 여러 가지가 있습니다. 그 중에서도 생성자 함수(Constructor Function)는 ES6 이전부터 사용되던 전통적인 방식이며, Class 문법은 ES6에서 도입된 보다 직관적인 방식입니다.

생성자 함수는 `function` 키워드로 정의하고 `new` 연산자와 함께 호출하여 객체를 생성합니다. Class 문법은 다른 객체지향 언어와 유사한 형태로 객체 생성 로직을 더욱 명확하게 표현할 수 있게 해줍니다.

## 핵심 개념

### 1. 생성자 함수의 동작 원리

생성자 함수는 일반 함수와 동일하게 정의되지만, `new` 키워드와 함께 호출될 때 특별한 동작을 수행합니다.

```typescript
function Person(name: string, age: number) {
  this.name = name;
  this.age = age;
}

// 프로토타입에 메서드 추가
Person.prototype.greet = function() {
  console.log(`안녕하세요, 저는 ${this.name}입니다.`);
};

Person.prototype.getAge = function() {
  return this.age;
};

const person1 = new Person('Alice', 25);
person1.greet(); // "안녕하세요, 저는 Alice입니다."
```

`new` 연산자가 실행되는 과정은 다음과 같습니다:
1. 빈 객체 생성
2. 생성자 함수의 `this`를 새 객체로 바인딩
3. 생성자 함수 실행하여 객체에 속성 추가
4. 객체 반환 (명시적 return이 없는 경우)

### 2. Class 문법의 등장 배경

생성자 함수 방식은 몇 가지 문제점을 가지고 있었습니다:

```typescript
// 생성자 함수의 문제점들
function Animal(name: string) {
  this.name = name;
}

Animal.prototype.speak = function() {
  console.log(`${this.name}이(가) 소리를 냅니다.`);
};

// 상속 구현이 복잡함
function Dog(name: string, breed: string) {
  Animal.call(this, name);
  this.breed = breed;
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log('멍멍!');
};
```

이러한 복잡성을 해결하기 위해 Class 문법이 도입되었습니다.

### 3. Class 문법의 장점

Class 문법은 생성자 함수의 문제점들을 해결하고 더 직관적인 코드 작성을 가능하게 합니다:

```typescript
class Animal {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  speak(): void {
    console.log(`${this.name}이(가) 소리를 냅니다.`);
  }

  // getter와 setter 지원
  get animalName(): string {
    return this.name;
  }

  // static 메서드 지원
  static createAnimal(name: string): Animal {
    return new Animal(name);
  }
}

class Dog extends Animal {
  private breed: string;

  constructor(name: string, breed: string) {
    super(name); // 부모 생성자 호출
    this.breed = breed;
  }

  bark(): void {
    console.log('멍멍!');
  }

  speak(): void {
    super.speak();
    this.bark();
  }
}

const dog = new Dog('바둑이', '진돗개');
dog.speak(); 
// "바둑이이(가) 소리를 냅니다."
// "멍멍!"
```

### 4. Class vs 생성자 함수 비교

Class 문법은 생성자 함수에 비해 다음과 같은 이점을 제공합니다:

```typescript
// 생성자 함수: new 없이 호출 가능 (의도하지 않은 동작)
function OldPerson(name: string) {
  this.name = name;
}

const result1 = OldPerson('John'); // undefined, 전역 객체 오염 가능

// Class: new 없이 호출 시 에러 발생
class NewPerson {
  constructor(public name: string) {}
}

// const result2 = NewPerson('Jane'); // TypeError: Class constructor NewPerson cannot be invoked without 'new'

// Class는 호이스팅되지만 TDZ(Temporal Dead Zone)에 있음
// console.log(TestClass); // ReferenceError
class TestClass {}

// 생성자 함수는 호이스팅되어 선언 전에 사용 가능
console.log(testFunction); // [Function: testFunction]
function testFunction() {}
```

## 정리

| 특징 | 생성자 함수 | Class 문법 |
|------|-------------|------------|
| 문법 | `function` + `new` | `class` + `constructor` |
| 상속 | 프로토타입 체인 직접 조작 | `extends`, `super` 키워드 |
| 호이스팅 | 함수 호이스팅 | 클래스 호이스팅 + TDZ |
| 안전성 | `new` 없이 호출 가능 | `new` 없이 호출 시 에러 |
| 가독성 | 프로토타입 조작 코드 필요 | 직관적이고 명확한 구조 |
| 접근 제어자 | 없음 (컨벤션으로만 표현) | `private`, `protected` 지원 |
| 정적 메서드 | 함수 객체에 직접 할당 | `static` 키워드 |

Class 문법은 생성자 함수의 syntactic sugar가 아닌, 보다 안전하고 표현력이 풍부한 객체 생성 방식을 제공합니다. 특히 TypeScript와 함께 사용할 때 타입 안정성과 개발자 경험을 크게 향상시킵니다.