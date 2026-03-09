---
title: "BFF(Backend For Frontend) 패턴"
shortTitle: "BFF 패턴"
date: "2026-03-09"
tags: ["bff", "architecture", "microservices", "api-gateway", "frontend"]
category: "Architecture"
summary: "프론트엔드를 위한 전용 백엔드 계층인 BFF 패턴의 개념과 활용 방법을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/196"
references: ["https://microservices.io/patterns/apigateway/backend-for-front-end.html", "https://docs.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends"]
---

## BFF(Backend For Frontend) 패턴이란?

BFF(Backend For Frontend) 패턴은 클라이언트와 백엔드 서비스 사이에 위치하는 중간 계층으로, 특정 프론트엔드를 위해 최적화된 API를 제공하는 아키텍처 패턴입니다. MSA 환경에서 프론트엔드가 여러 마이크로서비스를 직접 호출할 때 발생하는 복잡성을 해결하고, 각 플랫폼의 특성에 맞는 데이터를 제공하는 역할을 담당합니다.

전통적인 모놀리식 아키텍처에서는 단일 백엔드가 모든 비즈니스 로직을 처리했지만, MSA로 전환하면서 프론트엔드는 여러 서비스와 통신해야 하는 부담이 생겼습니다. BFF는 이러한 문제를 해결하는 효과적인 솔루션을 제공합니다.

## 핵심 개념

### 1. 데이터 집계 및 조합

BFF의 가장 중요한 역할은 여러 마이크로서비스로부터 데이터를 수집하고 조합하는 것입니다. 프론트엔드가 필요한 데이터가 여러 서비스에 분산되어 있을 때, BFF가 이를 하나의 응답으로 통합합니다.

```typescript
// BFF에서 여러 서비스 호출 및 데이터 조합
class UserProfileBFF {
  async getUserDashboard(userId: string) {
    // 여러 서비스에서 데이터 병렬 조회
    const [userInfo, orders, recommendations] = await Promise.all([
      this.userService.getUser(userId),
      this.orderService.getUserOrders(userId),
      this.recommendationService.getRecommendations(userId)
    ]);

    // 프론트엔드에 최적화된 형태로 조합
    return {
      profile: {
        name: userInfo.name,
        email: userInfo.email,
        tier: userInfo.membershipTier
      },
      recentOrders: orders.slice(0, 5).map(order => ({
        id: order.id,
        date: order.createdAt,
        status: order.status,
        total: order.amount
      })),
      personalizedItems: recommendations.items
    };
  }
}
```

### 2. 플랫폼별 최적화

각 플랫폼(웹, 모바일, 태블릿)은 서로 다른 화면 크기와 네트워크 환경을 가지므로, 동일한 데이터라도 다른 형태로 제공되어야 합니다. BFF는 플랫폼별로 최적화된 API를 제공합니다.

```typescript
// 플랫폼별 BFF 구현
class MobileBFF {
  async getProductList(categoryId: string) {
    const products = await this.productService.getProducts(categoryId);
    
    // 모바일: 최소한의 데이터만 전송
    return products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      thumbnailUrl: product.images[0]?.small // 작은 이미지만
    }));
  }
}

class WebBFF {
  async getProductList(categoryId: string) {
    const products = await this.productService.getProducts(categoryId);
    
    // 웹: 더 풍부한 데이터 제공
    return products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      discountRate: product.discount?.rate,
      images: product.images,
      reviews: product.reviewSummary,
      tags: product.tags
    }));
  }
}
```

### 3. API 표준화 및 버전 관리

BFF는 백엔드 서비스의 다양한 API 스타일을 프론트엔드가 기대하는 일관된 형태로 변환합니다. 또한 백엔드 API 변경으로부터 프론트엔드를 보호하는 역할도 수행합니다.

```typescript
class ProductBFF {
  async getProduct(productId: string) {
    // 레거시 서비스와 새 서비스의 API 차이를 BFF에서 흡수
    const productData = await this.isNewApiEnabled 
      ? this.productServiceV2.getProductDetails(productId)
      : this.legacyProductService.getProduct(productId);

    // 프론트엔드에는 일관된 형태로 제공
    return this.normalizeProductData(productData);
  }

  private normalizeProductData(data: any) {
    return {
      id: data.id || data.productId,
      name: data.title || data.productName,
      price: data.price?.amount || data.cost,
      availability: data.inStock !== undefined ? data.inStock : data.available
    };
  }
}
```

### 4. 인증 및 보안 처리

BFF는 인증 토큰 관리, API 키 보호, CORS 설정 등의 보안 관련 작업을 중앙화하여 처리합니다.

```typescript
class SecureBFF {
  async getUserData(clientToken: string) {
    // 클라이언트 토큰을 서비스 간 통신용 토큰으로 변환
    const serviceToken = await this.tokenService.exchangeToken(clientToken);
    
    // 내부 서비스 호출 시 적절한 인증 헤더 추가
    const userData = await this.userService.getUser({
      headers: {
        'Authorization': `Bearer ${serviceToken}`,
        'Internal-API-Key': process.env.INTERNAL_API_KEY
      }
    });

    return userData;
  }
}
```

## 정리

BFF 패턴은 현대적인 프론트엔드 개발에서 중요한 아키텍처 요소입니다:

| 장점 | 설명 |
|------|------|
| **복잡성 감소** | 프론트엔드에서 여러 API 호출 및 데이터 조합 로직 제거 |
| **성능 최적화** | 플랫폼별 최적화된 데이터 제공으로 네트워크 비용 절약 |
| **유지보수성** | 백엔드 API 변경으로부터 프론트엔드 보호 |
| **보안 강화** | 민감한 API 키와 인증 로직의 중앙화된 관리 |
| **개발 생산성** | 프론트엔드 팀의 백엔드 의존성 감소 |

BFF는 특히 MSA 환경과 다중 플랫폼을 지원하는 서비스에서 그 가치를 발휘하며, 프론트엔드와 백엔드 간의 효율적인 협업을 가능하게 합니다.