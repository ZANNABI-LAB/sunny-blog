---
title: "React 컴포넌트 생명주기와 실행 순서"
shortTitle: "React 실행 순서"
date: "2026-04-14"
tags: ["react", "lifecycle", "useeffect", "component-rendering", "execution-order"]
category: "Frontend"
summary: "React 컴포넌트의 마운트, 렌더링, useEffect 실행 순서를 상세히 분석합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/299"
references: ["https://react.dev/reference/react/useEffect", "https://react.dev/learn/lifecycle-of-reactive-effects"]
---

## React 컴포넌트 생명주기와 실행 순서란?

React 컴포넌트의 생명주기는 컴포넌트가 생성되고, 업데이트되고, 제거되는 과정을 의미합니다. 이 과정에서 함수 컴포넌트 본문, useEffect, cleanup 함수들이 특정한 순서로 실행됩니다.

컴포넌트의 실행 순서를 정확히 이해하는 것은 React 애플리케이션의 동작을 예측하고 디버깅하는 데 필수적입니다. 특히 부모-자식 컴포넌트 관계에서 실행 순서를 파악하면 상태 관리와 사이드 이펙트 처리를 더욱 효과적으로 할 수 있습니다.

## 핵심 개념

### 1. 초기 마운트 시 실행 순서

컴포넌트가 처음 마운트될 때의 실행 순서는 다음과 같습니다:

```typescript
import { useState, useEffect } from 'react';

function Parent() {
  const [count, setCount] = useState(0);

  console.log('1. Parent 컴포넌트 함수 실행');

  useEffect(() => {
    console.log('4. Parent useEffect 실행');
    return () => {
      console.log('Parent cleanup');
    };
  }, [count]);

  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>+1</button>
      <Child value={count} />
    </div>
  );
}

function Child({ value }: { value: number }) {
  console.log('2. Child 컴포넌트 함수 실행');

  useEffect(() => {
    console.log('3. Child useEffect 실행');
    return () => {
      console.log('Child cleanup');
    };
  }, []);

  return <p>자식 값: {value}</p>;
}
```

**초기 마운트 출력 순서:** `1 → 2 → 3 → 4`

React는 컴포넌트 트리를 depth-first로 렌더링하지만, useEffect는 모든 컴포넌트 렌더링이 완료된 후 실행됩니다. Child의 useEffect가 먼저 실행되는 이유는 자식부터 상향식으로 effect를 실행하기 때문입니다.

### 2. 상태 업데이트 시 실행 순서

버튼 클릭으로 count 상태가 변경될 때의 실행 순서입니다:

```typescript
// 버튼 클릭 시 실행되는 함수
const handleClick = () => {
  setCount(prev => prev + 1); // 상태 업데이트
};
```

**상태 업데이트 시 출력 순서:** `1 → 2 → Parent cleanup → 4`

Child 컴포넌트의 useEffect는 빈 의존성 배열(`[]`)을 가지고 있어 마운트 시에만 실행되므로, 리렌더링 시에는 실행되지 않습니다. 반면 Parent의 useEffect는 count에 의존하므로 cleanup 함수가 먼저 실행되고, 새로운 effect가 실행됩니다.

### 3. useEffect 의존성 배열의 영향

useEffect의 실행 여부는 의존성 배열에 의해 결정됩니다:

```typescript
// 마운트 시에만 실행
useEffect(() => {
  console.log('마운트 시에만 실행');
}, []); // 빈 배열

// count 변경 시마다 실행
useEffect(() => {
  console.log('count 변경 시마다 실행');
  return () => {
    console.log('이전 effect cleanup');
  };
}, [count]); // count가 의존성

// 매 렌더링마다 실행 (권장하지 않음)
useEffect(() => {
  console.log('매 렌더링마다 실행');
}); // 의존성 배열 없음
```

의존성 배열이 없으면 매 렌더링마다 실행되고, 빈 배열이면 마운트 시에만 실행되며, 특정 값이 있으면 해당 값이 변경될 때마다 실행됩니다.

### 4. Cleanup 함수의 실행 타이밍

Cleanup 함수는 다음 두 시점에 실행됩니다:

```typescript
useEffect(() => {
  const timer = setInterval(() => {
    console.log('타이머 실행');
  }, 1000);

  // Cleanup 함수
  return () => {
    console.log('타이머 정리');
    clearInterval(timer);
  };
}, [dependency]);
```

**Cleanup 실행 시점:**
1. 컴포넌트가 언마운트될 때
2. 의존성이 변경되어 새로운 effect가 실행되기 전

이를 통해 메모리 누수를 방지하고 불필요한 사이드 이펙트를 정리할 수 있습니다.

## 정리

| 상황 | 실행 순서 | 주요 특징 |
|------|-----------|-----------|
| 초기 마운트 | Parent 함수 → Child 함수 → Child useEffect → Parent useEffect | 자식부터 상향식으로 effect 실행 |
| 상태 업데이트 | Parent 함수 → Child 함수 → Cleanup → 새 useEffect | 의존성 변경 시 cleanup 먼저 실행 |
| 컴포넌트 언마운트 | 모든 cleanup 함수 실행 | 메모리 정리 및 구독 해제 |

**핵심 포인트:**
- 컴포넌트 함수는 렌더링 시마다 실행됩니다
- useEffect는 모든 렌더링 완료 후 실행됩니다
- Cleanup 함수는 effect 재실행 전이나 언마운트 시 실행됩니다
- 의존성 배열로 effect 실행 조건을 제어할 수 있습니다