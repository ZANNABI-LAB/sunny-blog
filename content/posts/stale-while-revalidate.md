---
title: "stale-while-revalidate: 캐시 성능과 데이터 신선도의 균형점"
shortTitle: "stale-while-revalidate"
date: "2026-04-02"
tags: ["http-cache", "web-performance", "frontend-optimization", "cache-control"]
category: "Frontend"
summary: "오래된 캐시 데이터를 먼저 보여주고 백그라운드에서 갱신하는 HTTP 캐싱 전략입니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/265"
references: ["https://tools.ietf.org/html/rfc5861", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control"]
---

## stale-while-revalidate란?

stale-while-revalidate는 HTTP Cache-Control 헤더의 디렉티브로, 캐시 만료 후에도 오래된 데이터를 즉시 반환하면서 동시에 백그라운드에서 새로운 데이터를 가져와 갱신하는 캐싱 전략입니다. 이 방식을 통해 사용자는 빠른 응답을 받을 수 있고, 서버는 적절한 시점에 데이터를 업데이트할 수 있습니다.

RFC 5861에 정의된 이 전략은 "stale content"의 활용을 통해 네트워크 지연을 숨기면서도 데이터의 신선도를 유지하는 효과적인 방법을 제공합니다. 특히 완벽한 실시간성보다는 빠른 응답성이 중요한 상황에서 매우 유용합니다.

## 핵심 개념

### 1. 작동 방식과 구문

기본 구문은 다음과 같습니다:

```http
Cache-Control: max-age=60, stale-while-revalidate=30
```

이는 다음을 의미합니다:
- **60초 동안**: 캐시된 데이터를 그대로 사용 (fresh 상태)
- **그 후 30초 동안**: 캐시가 만료되었지만(stale) 즉시 반환하고, 동시에 백그라운드에서 새 데이터 요청
- **90초 후**: 캐시 완전 만료, 새로운 요청 필요

```javascript
// 실제 응답 헤더 예시
fetch('/api/news')
  .then(response => {
    console.log(response.headers.get('Cache-Control'));
    // "max-age=300, stale-while-revalidate=60"
    return response.json();
  });
```

### 2. 브라우저와 CDN에서의 동작

브라우저와 CDN은 stale-while-revalidate를 다르게 처리합니다:

```javascript
// 브라우저 캐시 시나리오
const fetchData = async () => {
  // 첫 번째 요청: 서버에서 데이터 가져옴
  const response = await fetch('/api/data');
  
  // 60초 후 두 번째 요청: 캐시된 데이터 즉시 반환
  // 동시에 백그라운드에서 새 데이터 fetch 시작
  
  // 사용자는 즉시 응답을 받고,
  // 다음 요청 시에는 업데이트된 데이터를 받게 됨
};
```

CDN의 경우 더 복잡한 시나리오가 가능합니다:

```javascript
// CDN edge server에서의 처리
app.get('/api/articles', (req, res) => {
  res.set({
    'Cache-Control': 'max-age=3600, stale-while-revalidate=300',
    'Surrogate-Control': 'max-age=86400, stale-while-revalidate=3600'
  });
  
  // CDN: 24시간 캐시, 1시간 stale 허용
  // 브라우저: 1시간 캐시, 5분 stale 허용
});
```

### 3. 적합한 사용 사례와 제한사항

**적합한 사용 사례:**

```javascript
// 뉴스 피드 - 몇 분 지연되어도 괜찮음
app.get('/api/news', (req, res) => {
  res.set('Cache-Control', 'max-age=600, stale-while-revalidate=300');
  res.json(newsData);
});

// 사용자 프로필 - 실시간 업데이트 불필요
app.get('/api/profile/:id', (req, res) => {
  res.set('Cache-Control', 'max-age=1800, stale-while-revalidate=600');
  res.json(userProfile);
});

// 상품 목록 - 가격 변동이 빈번하지 않음
app.get('/api/products', (req, res) => {
  res.set('Cache-Control', 'max-age=300, stale-while-revalidate=120');
  res.json(products);
});
```

**부적합한 사용 사례:**

```javascript
// ❌ 실시간 주식 가격
app.get('/api/stock-price/:symbol', (req, res) => {
  // stale-while-revalidate 사용하면 안 됨
  res.set('Cache-Control', 'no-cache, must-revalidate');
  res.json(stockData);
});

// ❌ 결제 상태 확인
app.get('/api/payment-status/:id', (req, res) => {
  // 정확성이 중요한 데이터
  res.set('Cache-Control', 'no-store');
  res.json(paymentStatus);
});
```

### 4. SWR 라이브러리와의 연관성

stale-while-revalidate 개념은 SWR(stale-while-revalidate) 라이브러리의 핵심 철학입니다:

```javascript
import useSWR from 'swr';

function Profile() {
  const { data, error } = useSWR('/api/user', fetcher, {
    // HTTP 헤더와 유사한 설정
    refreshInterval: 60000, // 60초마다 revalidate
    revalidateOnFocus: true, // 탭 포커스 시 revalidate
    dedupingInterval: 2000   // 2초 동안 중복 요청 방지
  });

  // 캐시된 데이터가 있으면 즉시 표시,
  // 백그라운드에서 새 데이터 fetch
  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  
  return <div>Hello {data.name}!</div>;
}
```

## 정리

| 측면 | 특징 |
|------|------|
| **목적** | 빠른 응답과 데이터 신선도의 균형 |
| **동작 방식** | 즉시 stale 데이터 반환 + 백그라운드 갱신 |
| **적합한 데이터** | 뉴스, 프로필, 상품 목록 등 |
| **부적합한 데이터** | 실시간 가격, 결제 상태, 재고 수량 |
| **성능 효과** | 초기 로딩 시간 단축, 체감 성능 향상 |
| **트레이드오프** | 일시적으로 오래된 데이터 노출 가능성 |

stale-while-revalidate는 완벽한 실시간성보다는 사용자 경험과 성능을 우선시하는 현실적인 캐싱 전략입니다. 적절한 사용 사례를 선별하여 적용하면 웹 애플리케이션의 성능을 크게 향상시킬 수 있습니다.