---
title: "쿠키(Cookie)와 세션(Session)의 차이점과 활용 방법"
shortTitle: "쿠키 vs 세션"
date: "2026-04-17"
tags: ["cookie", "session", "web-authentication", "http", "backend"]
category: "Backend"
summary: "HTTP의 무상태 특성을 보완하는 쿠키와 세션의 차이점과 활용 방법을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/307"
references: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies", "https://tools.ietf.org/html/rfc6265", "https://owasp.org/www-community/controls/SecureCookieAttribute"]
---

## 쿠키와 세션이란?

쿠키(Cookie)와 세션(Session)은 HTTP의 무상태(stateless) 특성을 보완하여 사용자 상태를 유지하는 핵심 메커니즘입니다. HTTP 프로토콜은 각 요청이 독립적이어서 이전 요청의 정보를 기억하지 못하는데, 쿠키와 세션을 통해 로그인 상태나 사용자 선호 설정 등을 지속적으로 관리할 수 있습니다.

두 기술 모두 상태 관리라는 동일한 목적을 가지지만, 데이터 저장 위치와 보안성, 성능 특성에서 중요한 차이가 있어 적절한 상황에 맞게 선택해야 합니다.

## 핵심 개념

### 1. 데이터 저장 위치와 동작 방식

쿠키는 클라이언트 측 브라우저에 저장되는 작은 데이터 파일입니다. 서버에서 Set-Cookie 헤더를 통해 브라우저에 전달하며, 이후 모든 HTTP 요청에 자동으로 포함됩니다.

```typescript
// 쿠키 설정 (Node.js Express 예시)
app.get('/set-cookie', (req, res) => {
  res.cookie('userPreference', 'darkMode', {
    maxAge: 24 * 60 * 60 * 1000, // 24시간
    httpOnly: true,
    secure: true
  });
  res.send('Cookie set');
});

// 쿠키 읽기
app.get('/get-preference', (req, res) => {
  const preference = req.cookies.userPreference;
  res.json({ preference });
});
```

세션은 서버 메모리나 데이터베이스에 저장되며, 세션 ID만 쿠키를 통해 클라이언트에 전달됩니다.

```typescript
// 세션 설정 (Express Session 예시)
import session from 'express-session';

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 60 * 1000 } // 30분
}));

// 세션 데이터 저장
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (validateUser(username, password)) {
    req.session.userId = user.id;
    req.session.username = user.name;
    res.json({ success: true });
  }
});
```

### 2. 보안성과 데이터 무결성

쿠키는 클라이언트에 저장되어 브라우저 개발자 도구나 악성 스크립트를 통해 접근할 수 있습니다. 보안을 강화하려면 HttpOnly, Secure, SameSite 속성을 적절히 설정해야 합니다.

```typescript
// 보안 쿠키 설정
res.cookie('sessionId', 'abc123', {
  httpOnly: true,    // JavaScript 접근 차단
  secure: true,      // HTTPS에서만 전송
  sameSite: 'strict' // CSRF 공격 방지
});
```

세션은 중요한 데이터가 서버에 저장되어 클라이언트가 직접 조작할 수 없습니다. 다만 세션 하이재킹 공격에 대비해 세션 ID 재생성과 적절한 만료 시간 설정이 필요합니다.

```typescript
// 로그인 후 세션 ID 재생성
app.post('/login', (req, res) => {
  if (validateUser(req.body.username, req.body.password)) {
    req.session.regenerate((err) => {
      if (!err) {
        req.session.userId = user.id;
        res.json({ success: true });
      }
    });
  }
});
```

### 3. 성능과 확장성 고려사항

쿠키는 모든 HTTP 요청에 자동으로 포함되므로 크기가 클수록 네트워크 오버헤드가 증가합니다. 일반적으로 도메인당 4KB로 제한됩니다.

```typescript
// 쿠키 크기 최적화 예시
const userData = {
  theme: 'dark',
  language: 'ko',
  timezone: 'Asia/Seoul'
};

// 개별 쿠키로 분리하여 필요한 것만 전송
res.cookie('theme', userData.theme, { maxAge: 86400000 });
res.cookie('lang', userData.language, { maxAge: 86400000 });
```

세션은 서버 메모리를 사용하므로 동시 사용자가 많을수록 서버 부하가 증가합니다. Redis 같은 외부 저장소를 활용하여 확장성을 개선할 수 있습니다.

```typescript
import RedisStore from 'connect-redis';
import redis from 'redis';

const redisClient = redis.createClient();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'your-secret',
  resave: false,
  saveUninitialized: false
}));
```

### 4. 라이프사이클 관리

쿠키는 expires나 maxAge 속성으로 만료 시간을 제어할 수 있습니다. 영구 쿠키와 세션 쿠키로 구분됩니다.

```typescript
// 영구 쿠키 (30일 유지)
res.cookie('rememberMe', 'true', {
  maxAge: 30 * 24 * 60 * 60 * 1000
});

// 세션 쿠키 (브라우저 닫으면 삭제)
res.cookie('tempData', 'value'); // maxAge 미설정
```

세션은 서버 설정에 따라 비활성 시간 초과나 절대 만료 시간으로 관리됩니다.

```typescript
app.use(session({
  cookie: {
    maxAge: 1800000, // 30분 비활성 시 만료
  },
  rolling: true // 요청마다 만료 시간 갱신
}));
```

## 정리

| 구분 | 쿠키 | 세션 |
|------|------|------|
| **저장 위치** | 클라이언트 브라우저 | 서버 메모리/DB |
| **보안성** | 상대적으로 취약 | 상대적으로 안전 |
| **용량 제한** | 도메인당 4KB | 서버 리소스에 따라 유연 |
| **네트워크 부하** | 매 요청마다 전송 | 세션 ID만 전송 |
| **서버 부하** | 없음 | 세션 관리 비용 발생 |
| **적용 사례** | 사용자 선호 설정, 장바구니 | 로그인 상태, 민감 정보 |

실제 개발에서는 두 기술을 조합하여 사용하는 것이 일반적입니다. 비민감한 사용자 설정은 쿠키로, 인증 정보는 세션으로 관리하되, 최근에는 JWT 토큰을 활용한 상태 비저장(stateless) 인증 방식도 널리 채택되고 있습니다.