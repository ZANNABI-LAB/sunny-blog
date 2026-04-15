---
title: "쿠키와 세션: 웹 상태 관리의 핵심 메커니즘"
shortTitle: "쿠키와 세션"
date: "2026-04-15"
tags: ["cookie", "session", "web-security", "state-management", "authentication"]
category: "Frontend"
summary: "웹 애플리케이션에서 사용자 상태를 유지하기 위한 쿠키와 세션의 동작 원리와 활용 방법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/301"
references: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies", "https://tools.ietf.org/html/rfc6265", "https://owasp.org/www-community/controls/SecureCookieAttribute"]
---

## 쿠키와 세션이란?

쿠키와 세션은 웹 애플리케이션에서 클라이언트와 서버 간의 상태를 유지하기 위해 사용하는 핵심 메커니즘입니다. HTTP는 본질적으로 무상태(stateless) 프로토콜이기 때문에, 사용자의 로그인 정보나 장바구니 데이터와 같은 상태 정보를 별도로 관리해야 합니다.

이러한 문제를 해결하기 위해 쿠키는 클라이언트 측에, 세션은 서버 측에 상태 정보를 저장합니다. 두 방식은 각각 고유한 장단점을 가지고 있으며, 보안 요구사항과 시스템 아키텍처에 따라 적절히 선택해야 합니다.

## 핵심 개념

### 1. 쿠키의 동작 원리

쿠키는 서버에서 클라이언트로 전송되는 작은 데이터 조각으로, 브라우저에 저장됩니다:

```javascript
// 서버에서 쿠키 설정 (Express.js 예시)
app.get('/login', (req, res) => {
  res.cookie('userId', '12345', {
    maxAge: 86400000, // 24시간
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
  res.send('로그인 성공');
});

// 클라이언트에서 쿠키 읽기
document.cookie = "theme=dark; expires=Fri, 31 Dec 2024 23:59:59 GMT; path=/";
console.log(document.cookie); // "userId=12345; theme=dark"
```

쿠키는 HTTP 헤더를 통해 자동으로 전송되며, 브라우저가 도메인과 경로를 확인하여 적절한 요청에만 포함시킵니다.

### 2. 세션의 동작 구조

세션은 서버 메모리나 별도 저장소에 사용자 정보를 보관하고, 클라이언트에는 세션 ID만 전달합니다:

```javascript
// Node.js Express 세션 구현 예시
const session = require('express-session');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // HTTPS에서는 true
    maxAge: 30 * 60 * 1000 // 30분
  }
}));

app.post('/login', (req, res) => {
  // 인증 로직
  if (authenticated) {
    req.session.userId = user.id;
    req.session.role = user.role;
    res.json({ message: '로그인 성공' });
  }
});

// 세션 정보 활용
app.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '로그인 필요' });
  }
  // 사용자 정보 조회
});
```

### 3. 보안 고려사항

쿠키와 세션 모두 보안 설정이 중요합니다:

```javascript
// 안전한 쿠키 설정
res.cookie('authToken', token, {
  httpOnly: true,    // XSS 방어
  secure: true,      // HTTPS에서만 전송
  sameSite: 'strict', // CSRF 방어
  path: '/',
  maxAge: 3600000
});

// 세션 보안 설정
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'sessionId', // 기본 이름 변경
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  },
  rolling: true // 활동 시마다 만료 시간 갱신
}));
```

### 4. LocalStorage vs 쿠키 비교

웹 스토리지와 쿠키의 차이점을 이해하는 것이 중요합니다:

```typescript
interface StorageComparison {
  storage: 'Cookie' | 'LocalStorage' | 'SessionStorage';
  autoSend: boolean;
  capacity: string;
  persistence: string;
  xssVulnerable: boolean;
}

const storageTypes: StorageComparison[] = [
  {
    storage: 'Cookie',
    autoSend: true,
    capacity: '4KB',
    persistence: '설정 가능',
    xssVulnerable: false // HttpOnly 설정 시
  },
  {
    storage: 'LocalStorage',
    autoSend: false,
    capacity: '10MB',
    persistence: '수동 삭제까지',
    xssVulnerable: true
  },
  {
    storage: 'SessionStorage',
    autoSend: false,
    capacity: '10MB',
    persistence: '탭 닫을 때까지',
    xssVulnerable: true
  }
];

// 인증 토큰은 쿠키에, 임시 데이터는 SessionStorage에
localStorage.setItem('userPreferences', JSON.stringify(preferences));
document.cookie = `authToken=${token}; HttpOnly; Secure; SameSite=Strict`;
```

## 정리

| 특성 | 쿠키 | 세션 |
|------|------|------|
| **저장 위치** | 클라이언트 브라우저 | 서버 메모리/DB |
| **보안성** | 중간 (HttpOnly 설정 시 향상) | 높음 |
| **서버 부하** | 낮음 | 높음 |
| **확장성** | 좋음 | 제한적 (세션 동기화 필요) |
| **데이터 크기** | 4KB 제한 | 제한 없음 |
| **자동 전송** | HTTP 헤더에 자동 포함 | 세션 ID만 전송 |

**쿠키 선택 기준**:
- 간단한 상태 관리가 필요한 경우
- 서버 리소스를 절약해야 하는 경우
- 분산 환경에서 확장성이 중요한 경우

**세션 선택 기준**:
- 높은 보안이 요구되는 애플리케이션
- 원격 로그아웃이나 동시 접속 제한이 필요한 경우
- 민감한 사용자 데이터를 다루는 경우

현대 웹 개발에서는 JWT와 같은 토큰 기반 인증도 널리 사용되지만, 쿠키와 세션의 기본 원리를 이해하는 것은 웹 보안과 상태 관리의 기초가 됩니다.