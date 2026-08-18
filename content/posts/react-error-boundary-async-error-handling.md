---
title: "React Error Boundary가 비동기 에러를 잡지 못하는 이유"
shortTitle: "Error Boundary 한계"
date: "2026-04-15"
tags: ["react", "error-boundary", "async-error", "error-handling", "frontend"]
category: "Frontend.React"
summary: "React Error Boundary가 비동기 에러를 감지하지 못하는 콜스택 기반의 동작 원리와 해결 방법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/303"
references: ["https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises"]
---

## Error Boundary란?

React Error Boundary는 컴포넌트 트리에서 발생한 JavaScript 에러를 포착하고, 오류 정보를 기록하며, 대체 UI를 보여주는 React 컴포넌트입니다. 클래스 컴포넌트에서 `componentDidCatch`나 `static getDerivedStateFromError` 메서드를 구현하여 만들 수 있습니다.

하지만 Error Boundary는 모든 종류의 에러를 잡을 수 있는 것은 아닙니다. 특히 Promise, setTimeout, 이벤트 핸들러 등에서 발생하는 비동기 에러는 감지할 수 없다는 중요한 한계가 있습니다.

## 핵심 개념

### 1. 콜스택 기반 에러 감지 원리

React Error Boundary는 동기적인 렌더링 과정에서만 에러를 감지할 수 있습니다. 이는 JavaScript의 콜스택 동작 방식과 관련이 있습니다.

```typescript
// Error Boundary가 잡을 수 있는 에러
function SyncErrorComponent() {
  const throwError = () => {
    throw new Error('동기 에러'); // ✅ Error Boundary가 감지 가능
  };
  
  return (
    <div>
      {throwError()}
    </div>
  );
}

// Error Boundary가 잡을 수 없는 에러
function AsyncErrorComponent() {
  const throwAsyncError = () => {
    setTimeout(() => {
      throw new Error('비동기 에러'); // ❌ Error Boundary가 감지 불가
    }, 1000);
  };
  
  return <button onClick={throwAsyncError}>에러 발생</button>;
}
```

### 2. 렌더링 시점과 비동기 실행의 차이

React는 컴포넌트 렌더링을 하나의 연속된 콜스택 흐름에서 처리합니다. Error Boundary도 이 렌더링 콘텍스트 내에서 동작하므로, 렌더링이 완료된 후 실행되는 비동기 작업의 에러는 감지할 수 없습니다.

```typescript
function ComponentWithAsyncOperation() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // 이 Promise 에러는 Error Boundary가 잡지 못함
    fetch('/api/data')
      .then(response => response.json())
      .then(setData)
      .catch(error => {
        // 에러 처리를 직접 해야 함
        console.error('API 에러:', error);
      });
  }, []);
  
  return <div>{data}</div>;
}
```

### 3. 비동기 에러 처리 전략

비동기 에러를 효과적으로 처리하기 위한 여러 가지 방법이 있습니다.

```typescript
// 1. try-catch를 사용한 직접 처리
function DirectErrorHandling() {
  const [error, setError] = useState(null);
  
  const handleAsyncOperation = async () => {
    try {
      const result = await fetch('/api/data');
      const data = await result.json();
      // 성공 처리
    } catch (err) {
      setError(err);
    }
  };
  
  if (error) {
    throw error; // Error Boundary가 감지할 수 있도록 동기 에러로 변환
  }
  
  return <button onClick={handleAsyncOperation}>데이터 로드</button>;
}

// 2. 커스텀 훅을 사용한 에러 상태 관리
function useAsyncError() {
  const [error, setError] = useState(null);
  
  const throwError = useCallback((error) => {
    setError(error);
  }, []);
  
  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);
  
  return throwError;
}

function ComponentWithCustomHook() {
  const throwError = useAsyncError();
  
  const handleAsyncError = async () => {
    try {
      await riskyAsyncOperation();
    } catch (error) {
      throwError(error); // Error Boundary로 전파
    }
  };
  
  return <button onClick={handleAsyncError}>비동기 작업 실행</button>;
}
```

### 4. Error Boundary의 한계와 대안

Error Boundary가 감지하지 못하는 에러 유형들과 각각의 처리 방법입니다.

```typescript
class MyErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.log('Error Boundary가 감지한 에러:', error);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>문제가 발생했습니다.</h1>;
    }
    
    return this.props.children;
  }
}

// 감지되지 않는 에러들과 처리 방법
function ErrorExamples() {
  // 이벤트 핸들러 에러 - 직접 처리 필요
  const handleClick = () => {
    try {
      throw new Error('클릭 에러');
    } catch (error) {
      // 직접 에러 처리 또는 상태로 관리
    }
  };
  
  // Promise rejection - catch로 처리
  const handlePromise = () => {
    Promise.reject('Promise 에러')
      .catch(error => {
        // 에러 처리 로직
      });
  };
  
  return (
    <div>
      <button onClick={handleClick}>이벤트 에러</button>
      <button onClick={handlePromise}>Promise 에러</button>
    </div>
  );
}
```

## 정리

| 구분 | Error Boundary 감지 | 처리 방법 |
|------|-------------------|-----------|
| **렌더링 중 에러** | ✅ 감지 가능 | Error Boundary가 자동 처리 |
| **이벤트 핸들러 에러** | ❌ 감지 불가 | try-catch로 직접 처리 |
| **Promise rejection** | ❌ 감지 불가 | .catch() 또는 try-catch 사용 |
| **setTimeout/setInterval** | ❌ 감지 불가 | 콜백 내부에서 직접 처리 |
| **비동기 함수 에러** | ❌ 감지 불가 | async/await + try-catch |

**핵심 해결책:**
- **직접 처리**: 비동기 코드에서 try-catch 사용
- **상태 관리**: 에러를 상태로 저장 후 동기 에러로 변환
- **커스텀 훅**: 비동기 에러를 Error Boundary로 전파하는 로직 캡슐화
- **라이브러리 활용**: React Query, SWR 등의 데이터 페칭 라이브러리 사용