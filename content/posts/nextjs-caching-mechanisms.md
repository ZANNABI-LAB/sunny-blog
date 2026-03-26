---
title: "Next.js 캐싱 메커니즘: 성능 최적화를 위한 4가지 캐시 전략"
shortTitle: "Next.js 캐싱"
date: "2026-03-26"
tags: ["nextjs", "caching", "performance", "web-optimization"]
category: "Frontend"
summary: "Next.js의 Request Memoization, Router Cache, Data Cache, Full Route Cache 등 4가지 캐싱 전략을 통한 성능 최적화 방법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/244"
references: ["https://nextjs.org/docs/app/building-your-application/caching", "https://nextjs.org/docs/app/api-reference/functions/fetch", "https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating"]
---

## Next.js 캐싱이란?

Next.js는 웹 애플리케이션의 성능을 극대화하기 위해 다층 캐싱 시스템을 제공합니다. 이는 네트워크 요청을 최소화하고, 서버 부하를 줄이며, 사용자에게 빠른 페이지 로딩 경험을 제공하는 핵심 기능입니다.

Next.js의 캐싱 시스템은 4가지 주요 영역에서 동작합니다: Request Memoization, Client-side Router Cache, Data Cache, Full Route Cache입니다. 각각은 서로 다른 계층에서 작동하여 전체적인 성능 향상을 도모합니다.

## 핵심 개념

### 1. Request Memoization (요청 메모이제이션)

Request Memoization은 동일한 렌더링 과정에서 중복 요청을 방지하는 기능입니다. 서버 컴포넌트에서 동일한 URL과 옵션으로 fetch를 호출할 때, 첫 번째 요청 결과를 메모리에 저장하여 재사용합니다.

```typescript
// 두 컴포넌트가 동일한 API를 호출해도 실제로는 한 번만 요청됩니다
async function UserProfile({ userId }: { userId: string }) {
  const user = await fetch(`/api/users/${userId}`);
  return <div>{user.name}</div>;
}

async function UserPosts({ userId }: { userId: string }) {
  const user = await fetch(`/api/users/${userId}`); // 메모이제이션으로 재사용
  return <div>Posts by {user.name}</div>;
}
```

이 메모이제이션은 서버 렌더링 중에만 유효하며, 각 요청마다 초기화됩니다.

### 2. Router Cache (클라이언트 라우터 캐시)

Router Cache는 클라이언트 측에서 RSC(React Server Components) Payload를 캐시합니다. 페이지 전환 시 공통 레이아웃이나 이미 방문한 페이지의 데이터를 재사용하여 빠른 네비게이션을 가능하게 합니다.

```typescript
// app/layout.tsx - 이 레이아웃은 Router Cache에 저장됩니다
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Navigation /> {/* 페이지 전환 시 재렌더링되지 않음 */}
        {children}
      </body>
    </html>
  );
}
```

Router Cache의 지속 시간은 Static Route는 5분, Dynamic Route는 30초입니다.

### 3. Data Cache (데이터 캐시)

Data Cache는 서버에서 fetch 요청의 결과를 저장하여 재배포나 재시작까지 지속됩니다. 다양한 캐시 옵션을 통해 세밀한 제어가 가능합니다.

```typescript
// 강제 캐싱 - 수동으로 무효화할 때까지 캐시 유지
const staticData = await fetch('https://api.example.com/static', {
  cache: 'force-cache'
});

// 시간 기반 재검증 - 60초마다 백그라운드에서 갱신
const timedData = await fetch('https://api.example.com/timed', {
  next: { revalidate: 60 }
});

// 캐시 사용 안 함 - 매번 새로운 데이터 요청
const dynamicData = await fetch('https://api.example.com/dynamic', {
  cache: 'no-store'
});

// 태그 기반 재검증
const taggedData = await fetch('https://api.example.com/tagged', {
  next: { tags: ['user-data'] }
});

// 서버 액션에서 특정 태그 무효화
import { revalidateTag } from 'next/cache';

export async function updateUserAction() {
  // 데이터 업데이트 로직
  revalidateTag('user-data'); // 태그된 캐시 무효화
}
```

### 4. Full Route Cache (풀 라우트 캐시)

Full Route Cache는 빌드 시점에 생성된 정적 페이지를 서버에 저장합니다. 동적 함수나 uncached 데이터를 사용하지 않는 경우 자동으로 활성화됩니다.

```typescript
// app/products/page.tsx - 정적 페이지로 캐시됩니다
export default async function ProductsPage() {
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 } // 1시간마다 ISR로 갱신
  });
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// Route Segment Config로 캐시 동작 제어
export const dynamic = 'force-static'; // 강제 정적 생성
export const revalidate = 3600; // 페이지 레벨 재검증
```

캐시를 무효화하려면 cookies(), headers(), searchParams 등의 동적 함수를 사용하거나 `dynamic = 'force-dynamic'`을 설정합니다.

## 정리

| 캐시 유형 | 위치 | 지속 시간 | 무효화 방법 |
|-----------|------|-----------|-------------|
| Request Memoization | 서버 메모리 | 요청 동안 | 자동 (요청 완료 시) |
| Router Cache | 클라이언트 | 5분/30초 | router.refresh(), 페이지 새로고침 |
| Data Cache | 서버 파일시스템 | 재배포까지 | revalidateTag(), revalidatePath() |
| Full Route Cache | 서버 파일시스템 | 재배포까지 | Data Cache 무효화 시 연동 |

**캐시 최적화 전략:**
- 정적 데이터는 `force-cache`로 장기 캐싱
- 자주 변경되는 데이터는 `revalidate`로 주기적 갱신
- 실시간 데이터는 `no-store`로 캐시 비활성화
- 관련 데이터는 태그로 그룹화하여 일괄 무효화

Next.js의 다층 캐싱 시스템을 효과적으로 활용하면 네트워크 비용을 줄이고, 서버 부하를 분산시키며, 사용자 경험을 크게 개선할 수 있습니다.