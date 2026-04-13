---
title: "React 리렌더링 과정"
shortTitle: "React 리렌더링"
date: "2026-04-13"
tags: ["react", "virtual-dom", "rendering", "frontend"]
category: "Frontend"
summary: "React의 Trigger, Render, Commit 단계로 이루어진 리렌더링 과정과 최적화 방법을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/296"
references: ["https://react.dev/learn/render-and-commit", "https://react.dev/learn/queueing-a-series-of-state-updates"]
---

## React 리렌더링이란?

React 리렌더링은 컴포넌트의 상태나 프로퍼티가 변경될 때 UI를 업데이트하는 과정입니다. React는 Virtual DOM을 활용하여 효율적인 리렌더링을 수행하며, 이 과정은 Trigger, Render, Commit이라는 3단계로 구성됩니다.

리렌더링은 React 애플리케이션의 반응성을 보장하는 핵심 메커니즘이지만, 불필요한 리렌더링은 성능 저하의 원인이 될 수 있어 올바른 이해가 중요합니다.

## 핵심 개념

### 1. Trigger 단계 - 리렌더링 트리거

리렌더링이 시작되는 단계로, 다음과 같은 상황에서 발생합니다:

```typescript
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // state 변경으로 리렌더링 트리거
    setCount(count + 1);
  };

  return (
    <div>
      <p>{count}</p>
      <button onClick={handleClick}>증가</button>
    </div>
  );
}
```

트리거 조건:
- **초기 렌더링**: 컴포넌트가 처음 마운트될 때
- **State 변경**: `useState`의 setter 함수 호출
- **Props 변경**: 부모 컴포넌트로부터 받은 props가 변경
- **Context 변경**: 구독 중인 Context 값 변경

### 2. Render 단계 - Virtual DOM 생성과 비교

React가 새로운 Virtual DOM 트리를 생성하고 이전 트리와 비교하는 단계입니다:

```typescript
function App() {
  const [user, setUser] = useState({ name: 'John', age: 25 });

  // Render 단계에서 새로운 Virtual DOM 트리 생성
  return (
    <div>
      <UserProfile user={user} />
      <UserSettings onUpdate={setUser} />
    </div>
  );
}

function UserProfile({ user }) {
  console.log('UserProfile 렌더링'); // 이 단계에서는 실행됨
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>나이: {user.age}</p>
    </div>
  );
}
```

Render 단계의 특징:
- **순수 함수**: 부작용 없이 JSX를 반환만 함
- **Virtual DOM 비교**: Diffing 알고리즘으로 변경점 탐지
- **실제 DOM 미변경**: 아직 브라우저 DOM에는 반영되지 않음

### 3. Commit 단계 - 실제 DOM 업데이트

계산된 변경사항을 실제 DOM에 적용하는 단계입니다:

```typescript
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: '할일 1', completed: false }
  ]);

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id 
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };

  useEffect(() => {
    // Commit 단계 완료 후 실행
    console.log('DOM 업데이트 완료');
  });

  return (
    <ul>
      {todos.map(todo => (
        <li 
          key={todo.id}
          onClick={() => toggleTodo(todo.id)}
          style={{ 
            textDecoration: todo.completed ? 'line-through' : 'none' 
          }}
        >
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

Commit 단계의 특징:
- **최소한의 DOM 조작**: 변경된 부분만 업데이트
- **Layout Effects 실행**: `useLayoutEffect` 훅 실행
- **Effects 실행**: `useEffect` 훅 스케줄링

### 4. Batching과 최적화

React 18부터 모든 업데이트에서 자동 배칭이 적용됩니다:

```typescript
function BatchingExample() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  const handleClick = () => {
    // 자동 배칭: 하나의 리렌더링으로 처리
    setCount(c => c + 1);
    setFlag(f => !f);
    // 리렌더링은 1번만 발생
  };

  const handleAsyncClick = async () => {
    await fetch('/api/data');
    // 비동기 컨텍스트에서도 배칭 적용 (React 18+)
    setCount(c => c + 1);
    setFlag(f => !f);
    // 리렌더링은 1번만 발생
  };

  // 배칭을 무시하고 즉시 업데이트
  const handleFlushSync = () => {
    flushSync(() => {
      setCount(c => c + 1);
    });
    // 첫 번째 리렌더링 완료 후
    setFlag(f => !f);
    // 두 번째 리렌더링
  };

  return (
    <div>
      <p>Count: {count}</p>
      <p>Flag: {flag ? 'ON' : 'OFF'}</p>
      <button onClick={handleClick}>일반 업데이트</button>
      <button onClick={handleAsyncClick}>비동기 업데이트</button>
      <button onClick={handleFlushSync}>즉시 업데이트</button>
    </div>
  );
}
```

## 정리

| 단계 | 역할 | 특징 |
|------|------|------|
| **Trigger** | 리렌더링 시작 | State/Props 변경 감지 |
| **Render** | Virtual DOM 생성 | 순수 함수, 실제 DOM 미변경 |
| **Commit** | DOM 업데이트 | 최소한의 변경사항만 적용 |

**최적화 포인트:**
- 불필요한 state 변경 방지
- `React.memo`로 컴포넌트 메모이제이션
- `useMemo`, `useCallback`으로 값과 함수 메모이제이션
- 적절한 key prop 사용으로 리스트 최적화

React의 리렌더링 과정을 이해하면 성능 문제를 진단하고 최적화할 수 있으며, 예측 가능한 사용자 인터페이스를 구축할 수 있습니다.