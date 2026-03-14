---
title: "CDN(Content Delivery Network) - 전 세계 콘텐츠 배포 네트워크"
shortTitle: "CDN"
date: "2026-03-14"
tags: ["cdn", "content-delivery-network", "web-performance", "caching", "distributed-systems"]
category: "Infrastructure"
summary: "전 세계에 분산된 서버 네트워크를 통해 사용자에게 빠르고 안정적으로 콘텐츠를 제공하는 CDN의 개념과 동작 방식을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/209"
references: ["https://developer.mozilla.org/en-US/docs/Glossary/CDN", "https://aws.amazon.com/cloudfront/", "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/"]
---

## CDN이란?

CDN(Content Delivery Network)은 전 세계에 분산된 서버 네트워크를 통해 사용자와 물리적으로 가까운 위치에서 콘텐츠를 제공하는 시스템입니다. 원본 서버와 사용자 사이에 중간 서버를 배치하여 통신 지연을 단축하고 서버 과부하를 방지합니다.

CDN은 정적 콘텐츠(이미지, CSS, JavaScript)뿐만 아니라 동적 콘텐츠도 캐싱하여 제공할 수 있으며, 글로벌 서비스에서 성능 향상과 사용자 경험 개선을 위해 필수적으로 사용됩니다. CloudFront, Cloudflare, Fastly 등이 대표적인 CDN 서비스 제공업체입니다.

## 핵심 개념

### 1. CDN 동작 방식

CDN은 Edge Server라고 불리는 분산 서버들이 전 세계 주요 지역에 배치되어 있습니다:

```javascript
// CDN을 통한 리소스 로딩 예시
const loadResource = async (url) => {
  try {
    // 1. 가장 가까운 CDN Edge Server에서 리소스 요청
    const response = await fetch(`https://cdn.example.com/${url}`);
    
    if (response.ok) {
      return await response.json();
    }
    
    // 2. CDN에 없으면 Origin Server에서 가져와 캐싱
    const fallbackResponse = await fetch(`https://origin.example.com/${url}`);
    return await fallbackResponse.json();
  } catch (error) {
    console.error('CDN 로딩 실패:', error);
    throw error;
  }
};
```

### 2. Push vs Pull 방식

CDN은 콘텐츠를 관리하는 방식에 따라 두 가지로 구분됩니다:

```yaml
# Push 방식 설정 예시
push_strategy:
  method: "manual_upload"
  triggers:
    - build_complete
    - content_update
  destinations:
    - region: "us-east-1"
    - region: "eu-west-1"
    - region: "ap-southeast-1"

# Pull 방식 설정 예시  
pull_strategy:
  method: "on_demand"
  cache_rules:
    - path: "/images/*"
      ttl: 86400  # 24시간
    - path: "/api/*"
      ttl: 300    # 5분
```

**Push 방식**의 특징:
- 원본 서버가 미리 콘텐츠를 CDN으로 전송
- 정확한 콘텐츠 제공 보장
- 관리 비용이 높음

**Pull 방식**의 특징:
- CDN이 필요시 원본 서버에서 콘텐츠를 가져옴
- 초기 요청에서 지연 발생 가능
- 관리가 상대적으로 간편

### 3. 캐시 전략과 만료 관리

효과적인 CDN 운영을 위한 캐시 전략 설정이 중요합니다:

```javascript
// HTTP 헤더를 통한 캐시 제어
const setCacheHeaders = (res, contentType, maxAge) => {
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  res.setHeader('ETag', generateETag(content));
  res.setHeader('Last-Modified', new Date().toUTCString());
  
  // CDN별 캐시 제어
  res.setHeader('Cloudflare-CDN-Cache-Control', `max-age=${maxAge}`);
  res.setHeader('CDN-Cache-Control', `max-age=${maxAge}`);
};

// 콘텐츠 타입별 캐시 전략
const getCacheStrategy = (path) => {
  if (path.match(/\.(css|js|jpg|png|gif)$/)) {
    return { maxAge: 31536000, immutable: true }; // 1년
  }
  if (path.match(/\.html$/)) {
    return { maxAge: 3600 }; // 1시간
  }
  return { maxAge: 300 }; // 5분 (기본값)
};
```

### 4. CDN 운영 고려사항

CDN을 도입할 때 고려해야 할 핵심 요소들입니다:

```javascript
// CDN 장애 대응을 위한 Fallback 로직
class CDNManager {
  constructor(cdnUrl, originUrl) {
    this.cdnUrl = cdnUrl;
    this.originUrl = originUrl;
    this.retryAttempts = 3;
  }

  async fetchWithFallback(path) {
    try {
      // 1. CDN에서 시도
      return await this.fetchFromCDN(path);
    } catch (error) {
      console.warn('CDN 실패, Origin으로 fallback:', error);
      // 2. Origin 서버에서 시도
      return await this.fetchFromOrigin(path);
    }
  }

  async invalidateCache(paths) {
    // CDN 캐시 무효화 API 호출
    try {
      const response = await fetch(`${this.cdnUrl}/purge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths })
      });
      
      return response.ok;
    } catch (error) {
      console.error('캐시 무효화 실패:', error);
      return false;
    }
  }
}
```

## 정리

| 구분 | 설명 |
|------|------|
| **정의** | 전 세계 분산 서버를 통한 콘텐츠 배포 네트워크 |
| **주요 이점** | 성능 향상, 서버 부하 분산, 가용성 증대 |
| **배포 방식** | Push(사전 배포), Pull(요청 시 배포) |
| **고려사항** | 비용, 캐시 만료 시간, 장애 대응, 무효화 전략 |

**CDN 도입 체크리스트:**
- 비용 대비 성능 향상 효과 분석
- 콘텐츠별 적절한 캐시 만료 시간 설정
- CDN 장애 시 Fallback 전략 수립
- 캐시 무효화 및 버전 관리 방안 수립
- 모니터링 및 성능 측정 체계 구축