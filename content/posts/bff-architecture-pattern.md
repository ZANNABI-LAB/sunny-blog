---
title: "BFF(Backend For Frontend) 패턴"
shortTitle: "BFF 패턴"
date: "2026-03-10"
tags: ["bff", "microservices", "architecture", "frontend-backend", "api-gateway"]
category: "Architecture"
summary: "프론트엔드를 위한 전용 백엔드 계층인 BFF 패턴의 개념과 구현 방법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/196"
references: ["https://microservices.io/patterns/apigateway/backend-for-front-end.html", "https://docs.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends"]
---

## BFF(Backend For Frontend) 패턴이란?

BFF(Backend For Frontend) 패턴은 클라이언트와 백엔드 서비스 사이에 위치하는 중간 계층으로, 특정 프론트엔드를 위해 최적화된 API를 제공하는 아키텍처 패턴입니다. 마이크로서비스 아키텍처 환경에서 프론트엔드가 여러 서비스를 직접 호출할 때 발생하는 복잡성을 해결하기 위해 등장했습니다.

전통적인 모놀리식 아키텍처에서는 단일 백엔드가 모든 로직을 처리했지만, 마이크로서비스로 전환하면서 프론트엔드는 여러 API를 조합해야 하는 부담이 생겼습니다. BFF는 이러한 문제를 해결하여 프론트엔드의 복잡도를 줄이고 성능을 최적화합니다.

## 핵심 개념

### 1. 데이터 통합과 변환

BFF의 가장 중요한 역할은 여러 마이크로서비스로부터 데이터를 수집하고 프론트엔드가 필요로 하는 형태로 가공하는 것입니다.

```typescript
// BFF 없이 프론트엔드에서 직접 호출
const getUserProfile = async (userId: string) => {
  const user = await userService.getUser(userId);
  const orders = await orderService.getOrdersByUser(userId);
  const preferences = await preferenceService.getPreferences(userId);
  
  // 프론트엔드에서 데이터 조합
  return {
    ...user,
    recentOrders: orders.slice(0, 5),
    preferences
  };
};

// BFF를 통한 통합 API
// GET /bff/users/{userId}/profile
const getUserProfileFromBFF = async (userId: string) => {
  const profile = await bffService.getUserProfile(userId);
  return profile; // 이미 가공된 데이터
};
```

### 2. 플랫폼별 최적화

각 클라이언트 플랫폼(웹, 모바일, 태블릿)의 특성에 맞춰 데이터를 최적화합니다.

```typescript
// 웹용 BFF
app.get('/web/products/:id', async (req, res) => {
  const product = await productService.getProduct(req.params.id);
  const reviews = await reviewService.getReviews(req.params.id);
  const recommendations = await recommendationService.getRecommendations(req.params.id);
  
  res.json({
    ...product,
    fullReviews: reviews, // 웹은 모든 리뷰 표시
    recommendations
  });
});

// 모바일용 BFF
app.get('/mobile/products/:id', async (req, res) => {
  const product = await productService.getProduct(req.params.id);
  const reviews = await reviewService.getReviews(req.params.id, { limit: 3 });
  
  res.json({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.thumbnailImage, // 모바일용 썸네일만
    topReviews: reviews // 최소한의 리뷰만
  });
});
```

### 3. API 게이트웨이 기능

BFF는 인증, 권한 부여, 요청 라우팅 등의 횡단 관심사를 처리합니다.

```typescript
// BFF에서 인증 처리
app.use('/api/*', async (req, res, next) => {
  const token = req.headers.authorization;
  
  try {
    const user = await authService.validateToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// CORS 설정
app.use(cors({
  origin: ['https://web-app.com', 'https://mobile-app.com'],
  credentials: true
}));
```

### 4. 캐싱과 성능 최적화

BFF는 자주 요청되는 데이터를 캐시하여 백엔드 부하를 줄이고 응답 속도를 향상시킵니다.

```typescript
import Redis from 'ioredis';
const redis = new Redis();

app.get('/bff/dashboard/:userId', async (req, res) => {
  const cacheKey = `dashboard:${req.params.userId}`;
  
  // 캐시 확인
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // 여러 서비스에서 데이터 수집
  const [user, stats, notifications] = await Promise.all([
    userService.getUser(req.params.userId),
    analyticsService.getUserStats(req.params.userId),
    notificationService.getUnreadNotifications(req.params.userId)
  ]);
  
  const dashboard = {
    user: { id: user.id, name: user.name },
    stats,
    unreadCount: notifications.length
  };
  
  // 5분간 캐시
  await redis.setex(cacheKey, 300, JSON.stringify(dashboard));
  res.json(dashboard);
});
```

## 정리

| 구분 | 내용 |
|------|------|
| **주요 목적** | 프론트엔드를 위한 데이터 통합 및 최적화 |
| **핵심 기능** | API 통합, 데이터 변환, 플랫폼별 최적화, 캐싱 |
| **적용 상황** | MSA 환경, 다중 플랫폼 지원, 복잡한 데이터 조합 필요시 |
| **주요 장점** | 프론트엔드 복잡도 감소, 성능 최적화, 유지보수성 향상 |
| **고려사항** | 추가 인프라 비용, BFF 자체의 단일 장애점 가능성 |

BFF 패턴은 마이크로서비스 환경에서 프론트엔드의 복잡성을 해결하는 효과적인 솔루션입니다. 특히 여러 플랫폼을 지원하거나 복잡한 데이터 조합이 필요한 경우 BFF를 통해 각 클라이언트에 최적화된 API를 제공할 수 있습니다.