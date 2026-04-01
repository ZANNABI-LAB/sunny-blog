---
title: "클라이언트 사이드 라우팅의 동작 원리"
shortTitle: "CSR 라우팅"
date: "2026-04-01"
tags: ["client-side-routing", "spa", "history-api", "react-router"]
category: "Frontend"
summary: "브라우저에서 페이지 새로고침 없이 URL을 변경하고 컴포넌트를 교체하는 클라이언트 사이드 라우팅의 동작 과정을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/263"
references: ["https://developer.mozilla.org/en-US/docs/Web/API/History_API", "https://reactrouter.com/en/main", "https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event"]
---

## 클라이언트 사이드 라우팅이란?

클라이언트 사이드 라우팅(Client-side Routing)은 브라우저에서 페이지를 전환할 때 전체 페이지를 서버에서 다시 불러오지 않고, 현재 로딩된 애플리케이션 내에서 필요한 컴포넌트만 교체하는 방식입니다.

전통적인 서버 사이드 라우팅과 달리, JavaScript를 통해 URL 변경과 화면 렌더링을 처리합니다. 이를 통해 사용자에게 빠른 페이지 전환 경험을 제공하며, SPA(Single Page Application)의 핵심 기능 중 하나입니다.

## 핵심 개념

### 1. History API 활용

클라이언트 사이드 라우팅의 핵심은 브라우저의 History API를 활용하는 것입니다.

```javascript
// URL을 변경하되 페이지를 새로고침하지 않음
window.history.pushState(null, '', '/about');

// 브라우저 뒤로가기/앞으로가기 감지
window.addEventListener('popstate', (event) => {
  console.log('URL이 변경됨:', window.location.pathname);
  renderComponent();
});
```

`pushState()` 메서드는 브라우저 히스토리에 새로운 항목을 추가하면서도 실제 서버 요청은 보내지 않습니다. 이를 통해 URL은 변경되지만 페이지 새로고침은 발생하지 않습니다.

### 2. 라우트 매핑과 컴포넌트 렌더링

라우터는 URL 경로와 컴포넌트를 매핑하여 해당하는 컴포넌트를 렌더링합니다.

```typescript
// React Router 예시
import { Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <div>
      <nav>
        <Link to="/home">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  );
}
```

사용자가 Link를 클릭하면 기본 동작(페이지 새로고침)이 preventDefault()로 막히고, 대신 라우터가 URL을 변경하고 매핑된 컴포넌트를 렌더링합니다.

### 3. 브라우저 네비게이션 처리

사용자가 브라우저의 뒤로가기/앞으로가기 버튼을 누를 때는 `popstate` 이벤트가 발생합니다.

```javascript
class Router {
  constructor(routes) {
    this.routes = routes;
    this.init();
  }

  init() {
    // 초기 페이지 렌더링
    this.render();
    
    // 뒤로가기/앞으로가기 처리
    window.addEventListener('popstate', () => {
      this.render();
    });
  }

  navigate(path) {
    // URL 변경 (서버 요청 없음)
    window.history.pushState(null, '', path);
    this.render();
  }

  render() {
    const path = window.location.pathname;
    const component = this.routes[path] || this.routes['404'];
    document.getElementById('app').innerHTML = component();
  }
}
```

### 4. 데이터 로딩과 상태 관리

새로운 컴포넌트가 렌더링될 때 필요한 데이터는 별도로 API를 통해 로딩됩니다.

```typescript
function AboutPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // 컴포넌트 렌더링 후 데이터 로딩
    fetch('/api/about')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div>
      {data ? <Content data={data} /> : <Loading />}
    </div>
  );
}
```

이렇게 하면 HTML 구조는 그대로 유지하면서 필요한 데이터만 비동기적으로 로딩할 수 있습니다.

## 정리

| 단계 | 설명 |
|------|------|
| **링크 클릭** | 기본 동작 방지, History API로 URL 변경 |
| **라우트 매칭** | 현재 URL에 해당하는 컴포넌트 찾기 |
| **컴포넌트 렌더링** | 매핑된 컴포넌트를 DOM에 렌더링 |
| **데이터 로딩** | 필요시 API 호출로 데이터 가져오기 |
| **브라우저 네비게이션** | popstate 이벤트로 뒤로가기/앞으로가기 처리 |

클라이언트 사이드 라우팅은 페이지 새로고침 없이 빠른 화면 전환을 제공하지만, SEO와 초기 로딩 시간 등을 고려해야 합니다. 프로젝트 요구사항에 따라 서버 사이드 렌더링과의 조합을 고려하는 것이 좋습니다.