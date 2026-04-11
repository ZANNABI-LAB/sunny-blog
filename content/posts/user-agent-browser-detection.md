---
title: "User-Agent: 브라우저와 클라이언트 식별 헤더"
shortTitle: "User-Agent"
date: "2026-04-11"
tags: ["user-agent", "http-headers", "browser-detection", "client-identification"]
category: "Frontend"
summary: "HTTP 요청 헤더에서 클라이언트 정보를 식별하는 User-Agent의 구조와 활용법을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/289"
references: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent", "https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgent"]
---

## User-Agent란?

User-Agent는 HTTP 요청 헤더에 포함되는 문자열로, 웹 서버에 접속하는 클라이언트의 정보를 식별하는 데 사용됩니다. 이 헤더에는 브라우저 종류, 버전, 운영체제, 렌더링 엔진 등의 상세 정보가 포함되어 있습니다.

프론트엔드 개발에서 User-Agent는 특정 브라우저나 디바이스에 맞는 최적화를 구현할 때 참고할 수 있습니다. 하지만 현대적인 웹 개발에서는 User-Agent에 의존하기보다는 기능 감지와 반응형 디자인을 통해 호환성을 확보하는 것이 권장됩니다.

## 핵심 개념

### 1. User-Agent 문자열 구조

User-Agent 문자열은 특정 패턴을 따르며, 다음과 같은 정보를 포함합니다:

```javascript
// Chrome 브라우저의 User-Agent 예시
const chromeUA = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`;

// Safari 브라우저의 User-Agent 예시
const safariUA = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Version/17.1 Safari/537.36`;

// 모바일 디바이스의 User-Agent 예시
const mobileUA = `Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1`;
```

각 부분의 의미는 다음과 같습니다:
- **Mozilla/5.0**: 역사적 호환성을 위한 고정 값
- **운영체제 정보**: Windows NT, macOS, iOS 등
- **렌더링 엔진**: WebKit, Gecko, Blink 등
- **브라우저 정보**: Chrome, Safari, Firefox 등의 버전

### 2. JavaScript에서 User-Agent 접근

브라우저에서는 `navigator.userAgent`를 통해 User-Agent 정보에 접근할 수 있습니다:

```javascript
// User-Agent 정보 확인
console.log(navigator.userAgent);

// 브라우저 감지 함수 (권장하지 않음)
function detectBrowser() {
  const ua = navigator.userAgent;
  
  if (ua.includes('Chrome')) {
    return 'Chrome';
  } else if (ua.includes('Firefox')) {
    return 'Firefox';
  } else if (ua.includes('Safari')) {
    return 'Safari';
  }
  return 'Unknown';
}

// 모바일 디바이스 감지
function isMobileDevice() {
  const ua = navigator.userAgent;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}
```

### 3. 기능 감지 vs User-Agent 감지

현대적인 웹 개발에서는 User-Agent 감지보다 기능 감지를 권장합니다:

```javascript
// ❌ User-Agent 기반 감지 (권장하지 않음)
function supportsWebGL_old() {
  const ua = navigator.userAgent;
  return !ua.includes('Internet Explorer');
}

// ✅ 기능 감지 (권장)
function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch (e) {
    return false;
  }
}

// ✅ CSS 미디어 쿼리를 통한 반응형 감지
function isTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches;
}

// ✅ API 존재 여부 확인
function supportsNotifications() {
  return 'Notification' in window;
}
```

### 4. 서버 측 User-Agent 활용

서버에서는 HTTP 헤더를 통해 User-Agent 정보를 확인할 수 있습니다:

```javascript
// Express.js에서 User-Agent 확인
app.get('/api/analytics', (req, res) => {
  const userAgent = req.headers['user-agent'];
  
  // 사용자 환경 로깅
  console.log('Client Info:', {
    userAgent,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  // 모바일 사용자에게 다른 응답 제공
  if (/Mobile|Android|iPhone/i.test(userAgent)) {
    res.json({ layout: 'mobile', features: ['touch'] });
  } else {
    res.json({ layout: 'desktop', features: ['mouse', 'keyboard'] });
  }
});

// User-Agent 파�ing 라이브러리 사용
const UAParser = require('ua-parser-js');

app.use((req, res, next) => {
  const parser = new UAParser(req.headers['user-agent']);
  req.clientInfo = {
    browser: parser.getBrowser(),
    os: parser.getOS(),
    device: parser.getDevice()
  };
  next();
});
```

## 정리

| 구분 | 내용 |
|------|------|
| **User-Agent 역할** | HTTP 헤더를 통한 클라이언트 식별 정보 전달 |
| **포함 정보** | 브라우저, 운영체제, 렌더링 엔진, 디바이스 타입 |
| **JavaScript 접근** | `navigator.userAgent`로 브라우저에서 확인 가능 |
| **서버 측 접근** | HTTP 요청 헤더의 `User-Agent` 필드에서 확인 |
| **현대적 접근법** | User-Agent 감지보다 기능 감지와 반응형 디자인 권장 |
| **주요 활용처** | 애널리틱스, 브라우저별 대응, 디바이스 최적화 |

User-Agent는 유용한 정보를 제공하지만, 문자열 조작이나 브라우저 위장이 가능하므로 보안에 민감한 로직에서는 의존해서는 안 됩니다. 대신 기능 감지와 점진적 향상을 통해 더 안정적인 웹 애플리케이션을 구축하는 것이 바람직합니다.