---
title: "JSX 문법과 JavaScript 변환 과정"
shortTitle: "JSX 변환"
date: "2026-03-23"
tags: ["jsx", "react", "javascript", "transpilation", "babel"]
category: "Frontend"
summary: "JSX의 정의와 JavaScript로 변환되는 과정, 그리고 실제 활용 방법을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/237"
references: ["https://react.dev/learn/writing-markup-with-jsx", "https://babeljs.io/docs/babel-plugin-transform-react-jsx", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/createElement"]
---

## JSX란?

JSX(JavaScript XML)는 JavaScript 내부에서 HTML과 유사한 문법을 사용하여 UI를 선언적으로 표현할 수 있게 해주는 문법 확장입니다. React에서 널리 사용되지만, React 전용 기술은 아닙니다.

JSX는 브라우저에서 직접 실행할 수 없으며, Babel과 같은 트랜스파일러를 통해 일반 JavaScript 코드로 변환된 후 실행됩니다. 이러한 변환 과정을 통해 개발자는 직관적인 마크업 문법으로 복잡한 UI 구조를 표현할 수 있습니다.

## 핵심 개념

### 1. JSX 문법과 기본 구조

JSX는 HTML과 매우 유사하지만 몇 가지 차이점이 있습니다:

```jsx
// JSX 기본 문법
const element = (
  <div className="container">
    <h1>안녕하세요!</h1>
    <p>JSX를 사용한 UI입니다.</p>
  </div>
);

// JavaScript 표현식 삽입
const name = "개발자";
const greeting = (
  <h1>안녕하세요, {name}님!</h1>
);

// 조건부 렌더링
const isLoggedIn = true;
const loginStatus = (
  <div>
    {isLoggedIn ? <p>로그인되었습니다</p> : <p>로그인해주세요</p>}
  </div>
);
```

JSX에서는 `class` 대신 `className`을 사용하고, 모든 태그는 반드시 닫혀야 하며, 하나의 부모 요소로 감싸져야 합니다.

### 2. JavaScript 변환 과정

Babel이 JSX를 어떻게 JavaScript로 변환하는지 살펴보겠습니다:

```jsx
// JSX 코드
const element = (
  <h1 className="greeting">
    Hello, {name}!
  </h1>
);

// 변환된 JavaScript (React 17 이전)
const element = React.createElement(
  'h1',
  { className: 'greeting' },
  'Hello, ',
  name,
  '!'
);

// 변환된 JavaScript (React 17 이후)
import { jsx as _jsx } from 'react/jsx-runtime';
const element = _jsx('h1', {
  className: 'greeting',
  children: ['Hello, ', name, '!']
});
```

### 3. 변환 규칙과 제약사항

JSX 변환에는 몇 가지 중요한 규칙이 있습니다:

```jsx
// ❌ 잘못된 예: 여러 요소를 직접 반환
function BadComponent() {
  return (
    <h1>제목</h1>
    <p>내용</p>  // 에러 발생
  );
}

// ✅ 올바른 예: Fragment 사용
function GoodComponent() {
  return (
    <>
      <h1>제목</h1>
      <p>내용</p>
    </>
  );
}

// ✅ 올바른 예: 부모 요소로 감싸기
function GoodComponent() {
  return (
    <div>
      <h1>제목</h1>
      <p>내용</p>
    </div>
  );
}
```

### 4. React 외부에서의 JSX 활용

JSX는 React 외의 라이브러리에서도 사용할 수 있습니다:

```jsx
// Preact에서 JSX 사용
/** @jsx h */
import { h, render } from 'preact';

const App = () => (
  <div>
    <h1>Preact with JSX</h1>
  </div>
);

// 사용자 정의 createElement 함수
/** @jsx myCreateElement */
function myCreateElement(tag, props, ...children) {
  return { tag, props, children };
}

const vnode = (
  <div className="custom">
    <span>Custom JSX</span>
  </div>
);
```

## 정리

| 특징 | 설명 |
|------|------|
| **문법** | HTML과 유사하지만 JavaScript 표현식 삽입 가능 |
| **변환** | Babel 등의 트랜스파일러로 `createElement` 호출로 변환 |
| **제약** | 반드시 하나의 부모 요소로 감싸야 함 |
| **호환성** | React뿐만 아니라 다른 라이브러리에서도 사용 가능 |
| **장점** | 선언적이고 직관적인 UI 표현, 컴포넌트 재사용성 향상 |

JSX는 단순한 문법 설탕이 아닌, JavaScript의 표현력과 HTML의 직관성을 결합한 강력한 도구입니다. 트랜스파일 과정을 이해하면 JSX를 더 효과적으로 활용할 수 있습니다.