---
title: "CSRF 공격과 방어 전략"
shortTitle: "CSRF 공격"
date: "2026-03-06"
tags: ["CSRF", "보안", "웹보안"]
category: "Security"
summary: "사이트 간 요청 위조(CSRF) 공격의 원리와 효과적인 방어 방법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/168"
---

## CSRF 공격이란?

CSRF(Cross-site Request Forgery, 사이트 간 요청 위조) 공격은 사용자가 자신의 의지와 무관하게 공격자가 의도한 행위를 특정 웹사이트에 요청하도록 하는 보안 취약점입니다. 이 공격은 웹 애플리케이션의 신뢰성을 악용하여 인증된 사용자의 권한으로 악의적인 요청을 실행합니다.

공격자는 사용자가 이미 로그인한 상태에서 악성 스크립트가 포함된 페이지에 접속하도록 유도합니다. 브라우저는 자동으로 쿠키를 전송하는 특성을 이용해, 사용자 모르게 중요한 작업(비밀번호 변경, 계좌 이체 등)을 수행하게 됩니다.

## 핵심 개념

### 1. CSRF 공격 시나리오

일반적인 CSRF 공격은 다음과 같은 단계로 진행됩니다:

```html
<!-- 공격자 사이트에 포함된 악성 코드 -->
<img src="https://banking.com/transfer?to=attacker&amount=1000000" />

<!-- 또는 자동 제출되는 폼 -->
<form id="malicious-form" action="https://banking.com/changePassword" method="POST">
  <input type="hidden" name="newPassword" value="hacked123" />
</form>
<script>
  document.getElementById('malicious-form').submit();
</script>
```

사용자가 은행 사이트에 로그인한 상태에서 위와 같은 악성 페이지에 접속하면, 브라우저가 자동으로 인증 쿠키를 포함하여 요청을 전송합니다.

### 2. 토큰 기반 방어

CSRF 토큰은 가장 효과적인 방어 방법 중 하나입니다:

```javascript
// 서버에서 CSRF 토큰 생성
const crypto = require('crypto');

function generateCSRFToken(session) {
  const token = crypto.randomBytes(32).toString('hex');
  session.csrfToken = token;
  return token;
}

// Express.js 미들웨어 예시
function csrfProtection(req, res, next) {
  if (req.method === 'POST') {
    const sessionToken = req.session.csrfToken;
    const requestToken = req.body.csrf_token || req.headers['x-csrf-token'];
    
    if (!sessionToken || sessionToken !== requestToken) {
      return res.status(403).json({ error: 'CSRF token mismatch' });
    }
  }
  next();
}
```

클라이언트에서는 모든 상태 변경 요청에 토큰을 포함해야 합니다:

```html
<form action="/changeProfile" method="POST">
  <input type="hidden" name="csrf_token" value="{{csrfToken}}" />
  <input type="text" name="username" />
  <button type="submit">업데이트</button>
</form>
```

### 3. SameSite 쿠키 설정

SameSite 속성을 사용하여 크로스 사이트 요청에서 쿠키 전송을 제한할 수 있습니다:

```javascript
// Express.js에서 SameSite 쿠키 설정
app.use(session({
  name: 'sessionId',
  secret: 'your-secret-key',
  cookie: {
    sameSite: 'strict',  // 또는 'lax'
    httpOnly: true,
    secure: true  // HTTPS에서만 전송
  }
}));
```

SameSite 옵션의 차이점:
- `strict`: 크로스 사이트 요청에서 쿠키를 전혀 전송하지 않음
- `lax`: 일부 안전한 크로스 사이트 요청(GET 링크 클릭)에서만 쿠키 전송
- `none`: 모든 크로스 사이트 요청에서 쿠키 전송 (secure 필수)

### 4. Origin 및 Referer 헤더 검증

요청의 출처를 검증하는 방법입니다:

```javascript
function validateOrigin(req, res, next) {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const allowedOrigins = ['https://myapp.com', 'https://www.myapp.com'];
  
  // Origin 헤더가 있는 경우 검증
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
  
  // Origin이 없으면 Referer로 검증
  if (!origin && referer) {
    const refererOrigin = new URL(referer).origin;
    if (!allowedOrigins.includes(refererOrigin)) {
      return res.status(403).json({ error: 'Invalid referer' });
    }
  }
  
  next();
}
```

## 정리

| 방어 방법 | 장점 | 단점 | 권장도 |
|----------|------|------|--------|
| **CSRF 토큰** | 높은 보안성, 확실한 방어 | 구현 복잡도 증가 | ⭐⭐⭐⭐⭐ |
| **SameSite 쿠키** | 구현 간단, 브라우저 지원 | 일부 구형 브라우저 미지원 | ⭐⭐⭐⭐ |
| **Origin/Referer 검증** | 구현 간단 | 헤더 조작 가능성 | ⭐⭐⭐ |
| **이중 쿠키 제출** | 토큰 저장소 불필요 | 상대적으로 약한 보안 | ⭐⭐ |

**핵심 방어 원칙:**
- 상태 변경 작업에는 항상 CSRF 보호 적용
- GET 요청으로는 상태 변경 작업을 수행하지 않기
- 여러 방어 기법을 조합하여 다층 보안 구현
- 민감한 작업에는 추가 인증 단계 포함

CSRF 공격은 사용자의 신뢰를 악용하는 위험한 공격 방식입니다. 적절한 방어 기법을 적용하여 웹 애플리케이션의 보안을 강화하는 것이 중요합니다.