---
title: "브라우저 메모리 캐시와 디스크 캐시"
shortTitle: "브라우저 캐시"
date: "2026-03-15"
tags: ["browser-cache", "memory-cache", "disk-cache", "web-performance", "frontend-optimization"]
category: "Frontend"
summary: "브라우저가 리소스를 저장하는 두 가지 방식인 메모리 캐시와 디스크 캐시의 특징과 활용 방법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/212"
references: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching", "https://web.dev/http-cache/"]
---

## 브라우저 캐시란?

브라우저 캐시는 웹 리소스를 임시로 저장하여 동일한 요청에 대해 빠르게 응답할 수 있도록 하는 메커니즘입니다. 브라우저는 성능 최적화를 위해 리소스를 두 가지 방식으로 저장합니다: 메모리 캐시(Memory Cache)와 디스크 캐시(Disk Cache)입니다.

이 두 캐시는 저장 위치와 생명주기가 다르며, 브라우저는 리소스의 특성과 사용 패턴에 따라 적절한 캐시를 선택합니다. 올바른 캐시 전략은 웹 애플리케이션의 성능과 사용자 경험에 직접적인 영향을 미칩니다.

## 핵심 개념

### 1. 메모리 캐시의 특징

메모리 캐시는 시스템의 RAM에 리소스를 저장하는 방식입니다:

```javascript
// 개발자 도구에서 캐시 상태 확인
fetch('/api/data').then(response => {
  // Network 탭에서 "memory cache"로 표시
  console.log('Response from memory cache');
});

// 같은 페이지에서 재요청시 메모리 캐시 활용
const image = new Image();
image.src = '/images/logo.png'; // 첫 로드
// 이후 동일한 이미지 요청시 메모리 캐시에서 즉시 반환
```

메모리 캐시의 주요 특징:
- **빠른 접근 속도**: RAM의 특성상 디스크보다 훨씬 빠름
- **휘발성**: 탭을 닫거나 새로고침하면 소멸
- **용량 제한**: 시스템 메모리 상황에 따라 제한적
- **우선순위**: 브라우저가 가장 먼저 확인하는 캐시

### 2. 디스크 캐시의 특징

디스크 캐시는 하드디스크나 SSD와 같은 저장장치에 리소스를 보관합니다:

```javascript
// Service Worker를 통한 디스크 캐시 제어
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/static/')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        // 디스크 캐시에서 찾은 경우
        return response || fetch(event.request);
      })
    );
  }
});

// Cache API를 통한 명시적 캐시 저장
caches.open('v1').then(cache => {
  cache.addAll([
    '/styles/main.css',
    '/scripts/app.js',
    '/images/banner.jpg'
  ]); // 디스크에 저장됨
});
```

디스크 캐시의 주요 특징:
- **지속성**: 브라우저를 종료해도 유지
- **대용량**: 상대적으로 많은 데이터 저장 가능
- **느린 속도**: 디스크 I/O로 인한 지연 시간
- **장기 보관**: 만료 정책에 따라 오랜 기간 유지

### 3. 캐시 선택 전략

브라우저는 리소스의 특성에 따라 적절한 캐시를 선택합니다:

```javascript
// HTTP 헤더를 통한 캐시 제어
const response = new Response(data, {
  headers: {
    'Cache-Control': 'max-age=3600, must-revalidate',
    'ETag': '"123456789"'
  }
});

// 리소스별 캐시 전략 예시
const cacheStrategies = {
  // CSS/JS: 메모리 캐시 우선, 디스크에도 백업
  stylesheets: 'memory-first',
  
  // 이미지: 디스크 캐시 중심 (재사용성 높음)
  images: 'disk-primary',
  
  // API 응답: 메모리 캐시 (빠른 접근 필요)
  api: 'memory-only',
  
  // 웹폰트: 디스크 캐시 (여러 페이지에서 재사용)
  fonts: 'disk-persistent'
};
```

### 4. 캐시 우선순위와 동작 방식

브라우저의 캐시 확인 순서와 의사결정 과정입니다:

```javascript
// 브라우저의 캐시 확인 순서 (의사코드)
async function fetchResource(url) {
  // 1. 메모리 캐시 확인
  const memoryCache = checkMemoryCache(url);
  if (memoryCache && !isExpired(memoryCache)) {
    return memoryCache;
  }
  
  // 2. 디스크 캐시 확인
  const diskCache = await checkDiskCache(url);
  if (diskCache && !isExpired(diskCache)) {
    // 디스크에서 찾으면 메모리로도 복사
    storeInMemoryCache(url, diskCache);
    return diskCache;
  }
  
  // 3. 네트워크 요청
  const response = await fetch(url);
  
  // 4. 캐시 저장 결정
  decideCacheStorage(url, response);
  
  return response;
}

// 실제 브라우저 동작 확인
performance.getEntriesByType('resource')
  .forEach(entry => {
    console.log(`${entry.name}: ${entry.transferSize === 0 ? 'cached' : 'network'}`);
  });
```

## 정리

| 구분 | 메모리 캐시 | 디스크 캐시 |
|------|------------|------------|
| **저장 위치** | RAM | 하드디스크/SSD |
| **접근 속도** | 매우 빠름 | 상대적으로 느림 |
| **지속성** | 휘발성 (탭 종료시 소멸) | 영구적 (만료될 때까지) |
| **용량** | 제한적 | 상대적으로 큰 용량 |
| **주요 용도** | 현재 페이지 리소스 | 재방문시 재사용할 리소스 |
| **적합한 리소스** | CSS, JS, API 응답 | 이미지, 폰트, 정적 파일 |

브라우저 캐시를 효과적으로 활용하면 네트워크 요청을 줄이고 페이지 로딩 속도를 크게 개선할 수 있습니다. 개발자는 HTTP 캐시 헤더와 Service Worker 등을 통해 캐시 전략을 세밀하게 제어할 수 있습니다.