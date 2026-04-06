---
title: "HTTP/2 프로토콜의 주요 특징"
shortTitle: "HTTP/2 특징"
date: "2026-04-06"
tags: ["http2", "web-performance", "network-protocol", "multiplexing", "server-push"]
category: "Frontend"
summary: "HTTP/2의 멀티플렉싱, 헤더 압축, 서버 푸시 등 핵심 특징들을 살펴봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/272"
references: ["https://developers.google.com/web/fundamentals/performance/http2", "https://developer.mozilla.org/en-US/docs/Glossary/HTTP_2", "https://datatracker.ietf.org/doc/html/rfc7540"]
---

## HTTP/2란?

HTTP/2는 HTTP/1.1의 성능 한계를 해결하기 위해 2015년에 표준화된 프로토콜입니다. 웹 페이지의 로딩 속도를 향상시키고 네트워크 자원을 효율적으로 사용할 수 있도록 설계되었습니다.

기존 HTTP/1.1에서는 하나의 연결에서 한 번에 하나의 요청만 처리할 수 있어서 다수의 리소스를 로드할 때 병목현상이 발생했습니다. HTTP/2는 이러한 문제를 근본적으로 해결하여 현대 웹 애플리케이션의 성능을 크게 개선했습니다.

## 핵심 개념

### 1. 멀티플렉싱 (Multiplexing)

HTTP/2의 가장 중요한 특징은 멀티플렉싱입니다. 하나의 TCP 연결에서 여러 요청과 응답을 독립적인 스트림으로 처리할 수 있습니다.

```javascript
// HTTP/1.1: 순차적 처리
async function loadResourcesHTTP1() {
  const css = await fetch('/styles.css');
  const js = await fetch('/script.js');
  const image = await fetch('/image.png');
  // 각 요청이 순차적으로 처리됨
}

// HTTP/2: 병렬 처리 가능
async function loadResourcesHTTP2() {
  const [css, js, image] = await Promise.all([
    fetch('/styles.css'),    // Stream ID: 3
    fetch('/script.js'),     // Stream ID: 5  
    fetch('/image.png')      // Stream ID: 7
  ]);
  // 모든 요청이 동시에 처리됨
}
```

HTTP/1.1의 파이프라이닝과 달리 HTTP/2는 응답 순서에 관계없이 완료된 스트림부터 처리할 수 있어 HOL(Head-of-Line) Blocking 문제를 해결합니다.

### 2. 헤더 압축 (HPACK)

HTTP/2는 HPACK 압축 알고리즘을 사용하여 헤더의 중복을 제거합니다. 이전 요청에서 사용된 헤더 정보를 테이블에 저장하고 인덱스로 참조합니다.

```typescript
// HTTP/1.1: 매번 전체 헤더 전송
interface HTTP1Request {
  headers: {
    'User-Agent': 'Mozilla/5.0 Chrome/91.0.4472.124';
    'Accept': 'text/html,application/xhtml+xml';
    'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8';
    'Cookie': 'session_id=abc123; theme=dark';
  }
}

// HTTP/2: HPACK 압축으로 중복 제거
interface HTTP2Stream {
  streamId: number;
  headers: {
    ':method': 'GET';           // 새로운 pseudo-header
    ':path': '/api/users';      // 경로만 변경
    // 나머지 헤더는 인덱스 참조로 대체
    'user-agent': 62;           // 인덱스 참조
    'accept': 19;               // 인덱스 참조
  }
}
```

### 3. 서버 푸시 (Server Push)

서버 푸시는 클라이언트가 요청하지 않은 리소스를 서버가 미리 전송하는 기능입니다. 페이지 렌더링에 필요한 CSS, JavaScript 파일을 사전에 전송하여 초기 로딩 속도를 개선합니다.

```javascript
// 서버 푸시 활용 예시
app.get('/', (req, res) => {
  // HTML 요청에 대해 CSS와 JS를 함께 푸시
  if (req.httpVersion === '2.0') {
    res.push('/styles.css', {
      'content-type': 'text/css'
    });
    res.push('/script.js', {
      'content-type': 'application/javascript'  
    });
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="/styles.css">
      </head>
      <body>
        <script src="/script.js"></script>
      </body>
    </html>
  `);
});
```

### 4. 바이너리 프레이밍

HTTP/2는 텍스트 기반의 HTTP/1.1과 달리 바이너리 프레이밍 레이어를 사용합니다. 이를 통해 파싱 효율성을 높이고 프로토콜의 견고성을 개선합니다.

```typescript
// HTTP/2 프레임 구조
interface HTTP2Frame {
  length: number;     // 24비트: 페이로드 길이
  type: FrameType;    // 8비트: 프레임 타입
  flags: number;      // 8비트: 플래그
  streamId: number;   // 31비트: 스트림 식별자
  payload: Buffer;    // 가변 길이: 실제 데이터
}

enum FrameType {
  DATA = 0x0,
  HEADERS = 0x1,
  PRIORITY = 0x2,
  RST_STREAM = 0x3,
  SETTINGS = 0x4,
  PUSH_PROMISE = 0x5,
  PING = 0x6,
  GOAWAY = 0x7,
  WINDOW_UPDATE = 0x8
}
```

## 정리

| 특징 | HTTP/1.1 | HTTP/2 |
|------|-----------|---------|
| **연결 처리** | 요청당 하나의 연결 | 하나의 연결에서 멀티플렉싱 |
| **헤더 압축** | 없음 | HPACK 압축 |
| **서버 푸시** | 불가능 | 지원 |
| **프로토콜 형식** | 텍스트 기반 | 바이너리 기반 |
| **HOL Blocking** | 발생 | 해결됨 |

HTTP/2는 멀티플렉싱을 통한 병렬 처리, HPACK을 통한 헤더 압축, 서버 푸시를 통한 사전 리소스 전송으로 웹 성능을 크게 개선합니다. 현대 웹 애플리케이션에서는 HTTP/2가 기본 프로토콜로 사용되며, 특히 리소스가 많은 SPA 애플리케이션에서 그 효과가 두드러집니다.