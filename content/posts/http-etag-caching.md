---
title: "HTTP ETag를 활용한 효율적인 웹 캐싱 전략"
shortTitle: "ETag 캐싱"
date: "2026-03-30"
tags: ["http", "caching", "web-performance", "etag", "browser-cache"]
category: "Frontend"
summary: "HTTP ETag를 통해 웹 리소스의 변경을 감지하고 효율적인 캐싱을 구현하는 방법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/256"
references: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag", "https://tools.ietf.org/html/rfc7232", "https://web.dev/http-cache/"]
---

## ETag란?

ETag(Entity Tag)는 HTTP 프로토콜에서 웹 리소스의 특정 버전을 식별하기 위한 고유한 식별자입니다. 서버가 응답과 함께 `ETag` 헤더를 제공하면, 클라이언트는 이후 요청에서 `If-None-Match` 헤더를 사용해 조건부 요청을 보낼 수 있습니다.

ETag의 핵심 목적은 불필요한 데이터 전송을 줄여 네트워크 효율성을 높이는 것입니다. 리소스가 변경되지 않았다면 서버는 `304 Not Modified` 응답을 보내고, 클라이언트는 캐시된 버전을 계속 사용합니다. 이는 특히 대용량 파일이나 자주 요청되는 API 응답에서 큰 성능 향상을 가져다줍니다.

Last-Modified 헤더와 달리 ETag는 타임스탬프가 아닌 콘텐츠 기반으로 동작하므로, 1초 내 여러 변경이나 시간 기반 비교가 부적절한 상황에서 더 정확한 캐싱을 제공합니다.

## 핵심 개념

### 1. ETag 동작 원리

ETag는 다음과 같은 흐름으로 동작합니다:

```typescript
// 1. 초기 요청
const response = await fetch('/api/data');
const etag = response.headers.get('ETag'); // "abc123"
const data = await response.json();

// 2. 이후 요청 시 조건부 요청
const conditionalResponse = await fetch('/api/data', {
  headers: {
    'If-None-Match': etag
  }
});

if (conditionalResponse.status === 304) {
  // 캐시된 데이터 사용
  console.log('캐시된 데이터 사용');
} else {
  // 새로운 데이터 받기
  const newData = await conditionalResponse.json();
  const newEtag = conditionalResponse.headers.get('ETag');
}
```

서버는 리소스의 내용을 기반으로 해시값이나 버전 번호를 생성하여 ETag로 사용합니다. 클라이언트가 동일한 ETag 값으로 요청하면, 서버는 현재 리소스의 ETag와 비교하여 응답을 결정합니다.

### 2. Strong ETag vs Weak ETag

ETag는 두 가지 유형으로 나뉩니다:

```http
// Strong ETag - 바이트 단위까지 정확히 일치해야 함
ETag: "686897696a7c876b7e"

// Weak ETag - 의미적으로 동등하면 일치로 간주
ETag: W/"686897696a7c876b7e"
```

Strong ETag는 파일의 모든 바이트가 동일할 때만 일치하는 것으로 간주합니다. 반면 Weak ETag는 압축 방식이나 사소한 메타데이터 차이가 있더라도 의미적으로 같은 콘텐츠라면 일치하는 것으로 봅니다.

```typescript
// Express.js에서 ETag 설정 예시
app.get('/api/data', (req, res) => {
  const data = getData();
  const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  
  // Strong ETag
  res.setHeader('ETag', `"${hash}"`);
  
  // Weak ETag
  // res.setHeader('ETag', `W/"${hash}"`);
  
  if (req.headers['if-none-match'] === `"${hash}"`) {
    return res.status(304).end();
  }
  
  res.json(data);
});
```

### 3. Cache-Control과의 조합 사용

ETag는 Cache-Control 헤더와 함께 사용하여 더 효과적인 캐싱 전략을 구현할 수 있습니다:

```typescript
// 정적 리소스 - 장기 캐싱 + ETag로 즉시 갱신
app.get('/assets/:file', (req, res) => {
  const fileContent = getFile(req.params.file);
  const etag = generateETag(fileContent);
  
  res.setHeader('Cache-Control', 'max-age=31536000'); // 1년
  res.setHeader('ETag', etag);
  
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  
  res.send(fileContent);
});

// API 응답 - 항상 재검증하되 데이터 전송 최적화
app.get('/api/posts', (req, res) => {
  const posts = getPosts();
  const etag = generateETag(posts);
  
  res.setHeader('Cache-Control', 'no-cache'); // 항상 재검증
  res.setHeader('ETag', etag);
  
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  
  res.json(posts);
});
```

### 4. 브라우저 구현 및 활용

브라우저는 ETag를 자동으로 처리하며, 개발자는 Fetch API나 XMLHttpRequest에서 이를 활용할 수 있습니다:

```typescript
class CachedApiClient {
  private cache = new Map<string, { data: any; etag: string }>();
  
  async get(url: string) {
    const cached = this.cache.get(url);
    const headers: HeadersInit = {};
    
    if (cached) {
      headers['If-None-Match'] = cached.etag;
    }
    
    const response = await fetch(url, { headers });
    
    if (response.status === 304) {
      // 캐시된 데이터 반환
      return cached!.data;
    }
    
    const data = await response.json();
    const etag = response.headers.get('ETag');
    
    if (etag) {
      this.cache.set(url, { data, etag });
    }
    
    return data;
  }
}

// 사용 예시
const apiClient = new CachedApiClient();
const data = await apiClient.get('/api/users'); // 첫 요청은 서버에서
const sameData = await apiClient.get('/api/users'); // 변경 없으면 캐시에서
```

## 정리

| 특징 | 설명 | 장점 |
|------|------|------|
| **콘텐츠 기반** | 파일 내용이나 데이터의 해시값 사용 | 1초 내 변경도 정확히 감지 |
| **조건부 요청** | If-None-Match 헤더로 서버에 확인 | 네트워크 트래픽 최소화 |
| **유연한 타입** | Strong/Weak ETag로 다양한 시나리오 대응 | 압축, 메타데이터 변경 허용 |
| **Cache-Control 보완** | 캐싱 정책과 함께 사용 | 효율적인 캐싱 전략 구현 |
| **자동 브라우저 지원** | 브라우저가 자동으로 처리 | 개발자 편의성 향상 |

ETag는 웹 성능 최적화의 핵심 도구로, 특히 대용량 리소스나 자주 변경되는 API에서 효과적입니다. Cache-Control과 적절히 조합하여 사용하면 사용자 경험과 서버 부하를 모두 개선할 수 있습니다.