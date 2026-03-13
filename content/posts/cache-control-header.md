---
title: "Cache-Control 헤더로 웹 성능 최적화하기"
shortTitle: "Cache-Control 헤더"
date: "2026-03-13"
tags: ["cache-control", "web-performance", "http-headers", "browser-cache"]
category: "Frontend"
summary: "Cache-Control 헤더의 동작 원리와 디렉티브를 통한 효과적인 캐싱 전략을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/206"
references: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control", "https://web.dev/http-cache/", "https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching"]
---

## Cache-Control 헤더란?

Cache-Control은 HTTP 응답에서 클라이언트(브라우저)와 중간 서버(proxy, CDN)가 리소스를 어떻게 캐싱할지 지시하는 핵심 헤더입니다. 서버가 "이 리소스를 얼마나 오래, 어떤 방식으로 저장해도 되는가"를 명시적으로 알려주는 역할을 합니다.

웹 페이지 로딩 시 브라우저는 HTML, CSS, JavaScript, 이미지 등 다양한 리소스를 다운로드합니다. 이때 매번 서버에서 새로 받아오는 대신, 적절히 캐싱된 데이터를 활용하면 네트워크 요청을 줄이고 로딩 속도를 크게 개선할 수 있습니다.

Cache-Control 헤더를 통해 리소스별로 최적화된 캐싱 정책을 수립할 수 있으며, 이는 사용자 경험과 서버 부하 감소에 직접적인 영향을 미칩니다.

## 핵심 개념

### 1. 주요 디렉티브와 동작 방식

Cache-Control은 여러 디렉티브를 조합하여 세밀한 캐싱 제어가 가능합니다.

```http
# 정적 리소스 - 1년간 캐시, 변경 불가능
Cache-Control: public, max-age=31536000, immutable

# HTML 문서 - 캐시하되 매번 검증 필요
Cache-Control: no-cache, must-revalidate

# 민감한 데이터 - 캐시 금지
Cache-Control: no-store, private
```

**시간 기반 디렉티브:**
- `max-age`: 리소스가 유효한 시간(초)
- `s-maxage`: 공유 캐시(CDN)에서의 유효 시간

**캐시 위치 제어:**
- `public`: 모든 캐시에서 저장 가능
- `private`: 브라우저에만 저장 가능

**캐시 동작 제어:**
- `no-cache`: 캐시하되 사용 전 서버 검증 필수
- `no-store`: 캐시 저장 금지
- `must-revalidate`: 캐시 만료 시 반드시 재검증

### 2. 리소스별 캐싱 전략

각 리소스 유형에 따라 다른 캐싱 전략을 적용해야 합니다.

```javascript
// Express.js 예시
app.use('/static', express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      // HTML: 항상 최신 상태 유지
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (path.match(/\.(css|js)$/)) {
      // CSS/JS: 버저닝된 파일은 장기 캐시
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (path.match(/\.(jpg|png|gif|ico)$/)) {
      // 이미지: 중기 캐시
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    }
  }
}));
```

**정적 리소스 (CSS, JS, 이미지):**
- 파일명에 해시값 포함 시: `public, max-age=31536000, immutable`
- 일반 정적 파일: `public, max-age=2592000`

**동적 콘텐츠 (HTML, API):**
- 자주 변경: `no-cache, must-revalidate`
- 민감한 데이터: `no-store, private`

### 3. 캐시 검증과 조건부 요청

Cache-Control과 함께 ETag나 Last-Modified 헤더를 활용하면 효율적인 캐시 검증이 가능합니다.

```http
# 서버 응답
Cache-Control: no-cache, must-revalidate
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2025 07:28:00 GMT

# 브라우저 재요청
If-None-Match: "abc123"
If-Modified-Since: Wed, 21 Oct 2025 07:28:00 GMT
```

브라우저는 `no-cache` 디렉티브를 만나면 캐시된 데이터가 있어도 서버에 조건부 요청을 보냅니다. 서버가 304 Not Modified로 응답하면 캐시된 데이터를 사용하고, 200 OK로 응답하면 새 데이터를 받아옵니다.

### 4. CDN과 다층 캐싱 제어

CDN과 브라우저 캐시를 별도로 관리할 때는 s-maxage와 max-age를 조합합니다.

```http
# CDN에서는 24시간, 브라우저에서는 1시간 캐시
Cache-Control: public, max-age=3600, s-maxage=86400

# CDN 캐시 무효화 후 브라우저도 재검증
Cache-Control: public, max-age=0, s-maxage=0, must-revalidate
```

이를 통해 CDN에서는 오래 캐시하되 브라우저에서는 짧게 캐시하여, 콘텐츠 업데이트 시 유연하게 대응할 수 있습니다.

## 정리

| 디렉티브 | 용도 | 적용 사례 |
|---------|------|-----------|
| `public, max-age=31536000, immutable` | 장기 캐시 | 해시 기반 정적 파일 |
| `no-cache, must-revalidate` | 항상 검증 | HTML, 중요한 API |
| `no-store, private` | 캐시 금지 | 인증 정보, 개인 데이터 |
| `public, max-age=3600` | 단기 캐시 | 자주 변경되는 이미지 |
| `public, max-age=0, must-revalidate` | 즉시 재검증 | 긴급 업데이트 필요 시 |

Cache-Control을 효과적으로 활용하면 불필요한 네트워크 요청을 줄이고 페이지 로딩 속도를 개선할 수 있습니다. 특히 모바일 환경에서는 데이터 사용량 절약과 성능 향상 효과가 더욱 두드러집니다. 리소스 특성에 맞는 캐싱 전략을 수립하여 최적의 사용자 경험을 제공하는 것이 중요합니다.