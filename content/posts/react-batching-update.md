---
title: "React Batching Update란? 성능 최적화의 핵심 메커니즘"
shortTitle: "React Batching"
date: "2026-04-11"
tags: ["react", "batching", "performance", "state-management", "optimization"]
category: "Frontend"
summary: "React의 Batching Update는 여러 상태 업데이트를 하나로 그룹화하여 불필요한 리렌더링을 방지하는 성능 최적화 기법입니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/290"
references: ["https://react.dev/learn/queueing-a-series-of-state-updates", "https://github.com/reactwg/react-18/discussions/21"]
---

## React Batching Update란?

React의 Batching Update는 여러 상태 업데이트를 하나의 리렌더링으로 그룹화하는 성능 최적화 메커니즘입니다. 개발자가 연속적으로 여러 번 `setState`를 호출하더라도, React는 이를 내부적으로 모아서 한 번의 업데이트로 처리합니다.

이 기법은 불필요한 중간 렌더링을 방지하여 애플리케이션의 성능을 크게 향상시킵니다. 특히 복잡한 UI나 많은 상태를 다루는 컴포넌트에서 그 효과가 두드러집니다.

React 18에서는 자동 배칭(Automatic Batching)이 도입되어, 이전 버전보다 더 광범위한 상황에서 배칭이 적용됩니다.

## 핵심 개념

### 1. 기본 배칭 동작 원리

React는 이벤트 핸들러 내에서 발생하는 여러 상태 업데이트를 자동으로 배칭합니다:

```typescript
function Counter() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  const [name, setName] = useState('');

  const handleClick = () => {
    setCount(c => c + 1);     // 첫 번째 업데이트
    setFlag(f => !f);         // 두 번째 업데이트
    setName('업데이트됨');     // 세 번째 업데이트
    
    // 위 세 개의 상태 변경이 배칭되어 단 한 번의 렌더링만 발생
    console.log('렌더링 한 번만 실행');
  };

  return (
    <div>
      <p>Count: {count}</p>
      <p>Flag: {flag.toString()}</p>
      <p>Name: {name}</p>
      <button onClick={handleClick}>업데이트</button>
    </div>
  );
}
```

### 2. React 18의 자동 배칭

React 18 이전에는 React 이벤트 핸들러 내부에서만 배칭이 적용되었습니다. 하지만 React 18부터는 Promise, setTimeout, 네이티브 이벤트 등에서도 배칭이 자동 적용됩니다:

```typescript
// React 17: 두 번의 렌더링 발생
setTimeout(() => {
  setCount(c => c + 1);  // 첫 번째 렌더링
  setFlag(f => !f);      // 두 번째 렌더링
}, 1000);

// React 18: 한 번의 렌더링으로 배칭
setTimeout(() => {
  setCount(c => c + 1);  // 배칭됨
  setFlag(f => !f);      // 배칭됨 (한 번의 렌더링)
}, 1000);

// fetch API와 함께 사용하는 경우
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    
    // React 18에서는 이 두 상태 업데이트가 배칭됨
    setData(data);
    setLoading(false);
  } catch (error) {
    setError(error.message);
    setLoading(false);
  }
};
```

### 3. 배칭 제어하기

때로는 배칭을 의도적으로 방지해야 할 수도 있습니다. 이런 경우 `flushSync`를 사용할 수 있습니다:

```typescript
import { flushSync } from 'react-dom';

const handleUrgentUpdate = () => {
  flushSync(() => {
    setCount(c => c + 1);  // 즉시 렌더링 발생
  });
  
  flushSync(() => {
    setFlag(f => !f);      // 또 다른 즉시 렌더링 발생
  });
  
  // 총 두 번의 별도 렌더링이 발생
};
```

### 4. 배칭의 성능 이점

배칭은 다음과 같은 성능 향상을 제공합니다:

```typescript
// 배칭 없이 (React 17의 비동기 환경)
const updateWithoutBatching = () => {
  setTimeout(() => {
    setUser({ name: 'John', age: 30 });     // 렌더링 1
    setPreferences({ theme: 'dark' });      // 렌더링 2
    setNotifications({ count: 5 });         // 렌더링 3
    // 총 3번의 렌더링과 DOM 업데이트 발생
  });
};

// 배칭과 함께 (React 18)
const updateWithBatching = () => {
  setTimeout(() => {
    setUser({ name: 'John', age: 30 });     // 배칭됨
    setPreferences({ theme: 'dark' });      // 배칭됨
    setNotifications({ count: 5 });         // 배칭됨
    // 총 1번의 렌더링과 DOM 업데이트만 발생
  });
};
```

## 정리

| 구분 | React 17 | React 18 |
|------|----------|----------|
| **이벤트 핸들러** | 배칭 지원 | 배칭 지원 |
| **Promise/async** | 배칭 미지원 | 자동 배칭 |
| **setTimeout** | 배칭 미지원 | 자동 배칭 |
| **네이티브 이벤트** | 배칭 미지원 | 자동 배칭 |

**주요 이점:**
- 불필요한 리렌더링 방지로 성능 향상
- DOM 업데이트 횟수 감소
- 배터리 사용량 최적화 (모바일)
- 개발자가 별도 최적화 작업 불필요

**주의사항:**
- `flushSync` 사용 시 배칭이 무효화됨
- 상태 업데이트의 순서는 보장되지만 중간 값은 건너뛸 수 있음
- 디버깅 시 예상보다 적은 렌더링이 발생할 수 있음