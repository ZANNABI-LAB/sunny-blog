---
title: "React useRef vs let 변수: 상태 관리 방식의 차이점"
shortTitle: "useRef vs let"
date: "2026-03-14"
tags: ["react", "hooks", "state-management", "useref", "javascript"]
category: "Frontend"
summary: "React에서 useRef와 let 변수의 리렌더링 동작과 상태 관리 방식 차이점을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/208"
references: ["https://react.dev/reference/react/useRef", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let"]
---

## React useRef vs let 변수란?

React에서 변수를 관리할 때 useRef 훅과 일반 let 변수 사이에는 중요한 차이점이 있습니다. 가장 핵심적인 차이는 **리렌더링 시의 동작 방식**입니다.

let으로 선언한 변수는 컴포넌트가 리렌더링될 때마다 초기화되어 이전 값을 잃어버리는 반면, useRef로 생성한 변수는 리렌더링되어도 값이 유지됩니다. 또한 useRef는 값이 변경되어도 리렌더링을 유발하지 않는다는 특징이 있습니다.

## 핵심 개념

### 1. 리렌더링 시 변수 생명주기

컴포넌트 내부의 let 변수는 매 렌더링마다 새롭게 생성됩니다:

```typescript
function Counter() {
  let count = 0; // 매 렌더링마다 0으로 초기화

  const increment = () => {
    count += 1;
    console.log(count); // 1이 출력되지만
    // 리렌더링 후에는 다시 0이 됨
  };

  return <button onClick={increment}>Count: {count}</button>;
}
```

반면 useRef는 컴포넌트의 전체 생명주기 동안 값을 유지합니다:

```typescript
import { useRef, useState } from 'react';

function Counter() {
  const countRef = useRef(0);
  const [, forceUpdate] = useState({});

  const increment = () => {
    countRef.current += 1;
    console.log(countRef.current); // 계속 누적됨
    forceUpdate({}); // 강제 리렌더링
  };

  return <button onClick={increment}>Count: {countRef.current}</button>;
}
```

### 2. DOM 요소 접근과 타이머 관리

useRef의 대표적인 사용 사례는 DOM 요소 접근입니다:

```typescript
function FocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
}
```

타이머 ID 저장에도 유용합니다:

```typescript
function Timer() {
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);
  const [seconds, setSeconds] = useState(0);

  const startTimer = () => {
    timerIdRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  };

  return (
    <div>
      <p>Seconds: {seconds}</p>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
}
```

### 3. 컴포넌트 외부 변수의 문제점

컴포넌트 외부에서 선언된 let 변수는 리렌더링의 영향을 받지 않지만, 여러 문제점이 있습니다:

```typescript
let globalCount = 0; // 모든 인스턴스가 공유

function ProblematicCounter() {
  const increment = () => {
    globalCount += 1; // 모든 컴포넌트 인스턴스가 같은 값을 공유
  };

  return <button onClick={increment}>Count: {globalCount}</button>;
}

// 여러 인스턴스 사용 시 예상치 못한 동작
function App() {
  return (
    <div>
      <ProblematicCounter /> {/* 두 버튼이 같은 globalCount를 공유 */}
      <ProblematicCounter />
    </div>
  );
}
```

올바른 접근 방식:

```typescript
function CorrectCounter() {
  const countRef = useRef(0); // 각 인스턴스마다 독립적인 값

  const increment = () => {
    countRef.current += 1;
  };

  return <button onClick={increment}>Count: {countRef.current}</button>;
}
```

### 4. 성능과 리렌더링 최적화

useRef는 값 변경 시 리렌더링을 트리거하지 않아 성능 최적화에 유용합니다:

```typescript
function ExpensiveComponent() {
  const renderCountRef = useRef(0);
  const previousValueRef = useRef<string>('');

  renderCountRef.current += 1;

  const handleChange = (value: string) => {
    // 값이 실제로 변경되었을 때만 상태 업데이트
    if (previousValueRef.current !== value) {
      previousValueRef.current = value;
      // 필요한 상태 업데이트 수행
    }
  };

  return (
    <div>
      <p>Render count: {renderCountRef.current}</p>
      <input onChange={(e) => handleChange(e.target.value)} />
    </div>
  );
}
```

## 정리

| 특징 | let 변수 | useRef |
|------|----------|--------|
| **리렌더링 시 값 유지** | ❌ (초기화됨) | ✅ (유지됨) |
| **값 변경 시 리렌더링** | - | ❌ (트리거하지 않음) |
| **인스턴스별 독립성** | ❌ (외부 선언 시) | ✅ |
| **DOM 요소 접근** | ❌ | ✅ |
| **타이머 ID 저장** | ❌ (리렌더링 시 손실) | ✅ |
| **React 생명주기 준수** | ❌ (외부 선언 시) | ✅ |

**핵심 사용 원칙:**
- DOM 요소 참조, 타이머 ID, 이전 값 저장 등 → **useRef 사용**
- 컴포넌트 외부 변수 선언 → **지양**
- 리렌더링과 상관없이 값을 유지해야 할 때 → **useRef 사용**