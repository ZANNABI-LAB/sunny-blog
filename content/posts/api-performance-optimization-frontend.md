---
title: "느린 API 응답 대응 전략"
shortTitle: "API 성능 최적화"
date: "2026-04-13"
tags: ["api-optimization", "frontend-performance", "user-experience", "caching", "prefetch"]
category: "Frontend"
summary: "백엔드 API 응답이 느린 상황에서 프론트엔드에서 적용할 수 있는 성능 최적화 및 UX 개선 전략을 소개합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/297"
references: ["https://web.dev/performance-budgets/", "https://developer.mozilla.org/en-US/docs/Web/API/Performance_API", "https://react-query.tanstack.com/guides/caching"]
---

## 느린 API 응답 대응 전략이란?

백엔드 API의 응답 속도가 느려 사용자 경험에 악영향을 주는 상황은 프론트엔드 개발에서 자주 마주치는 문제입니다. 이런 상황에서는 단순히 백엔드 개선을 기다리기보다는 프론트엔드 차원에서 능동적으로 대응할 수 있는 다양한 전략이 필요합니다.

성공적인 대응을 위해서는 먼저 성능 문제를 객관적으로 측정하고 분석한 후, 단기적으로는 사용자 체감 성능을 개선하고, 중장기적으로는 실제 응답 속도를 향상시키는 다층적 접근이 효과적입니다.

## 핵심 개념

### 1. 성능 측정 및 분석

성능 개선의 첫 번째 단계는 정확한 측정입니다. 브라우저 DevTools의 Network 탭을 통해 API 응답 시간을 수집하고, Performance API를 활용해 실제 사용자 경험을 측정할 수 있습니다.

```typescript
// Performance API를 활용한 API 응답 시간 측정
async function measureApiPerformance(apiCall: () => Promise<any>, apiName: string) {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // 모니터링 도구로 전송
    analytics.track('api_performance', {
      api_name: apiName,
      duration: duration,
      status: 'success'
    });
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    analytics.track('api_performance', {
      api_name: apiName,
      duration: duration,
      status: 'error'
    });
    
    throw error;
  }
}
```

### 2. 로딩 상태 및 UX 개선

사용자 체감 성능을 개선하는 가장 직접적인 방법은 적절한 로딩 상태를 제공하는 것입니다. Skeleton UI나 진행률 표시를 통해 사용자에게 시스템이 정상 작동 중임을 알려줄 수 있습니다.

```typescript
// Skeleton UI를 포함한 로딩 상태 관리
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserProfile(userId),
    staleTime: 5 * 60 * 1000, // 5분
  });

  if (isLoading) {
    return (
      <div className="user-profile-skeleton">
        <div className="skeleton-avatar" />
        <div className="skeleton-text skeleton-title" />
        <div className="skeleton-text skeleton-description" />
      </div>
    );
  }

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  return <UserProfileComponent user={data} />;
}
```

### 3. 캐싱 전략 구현

API 응답을 캐싱하여 동일한 요청의 반복을 방지하고, 즉시 응답할 수 있는 데이터를 확보합니다. React Query, SWR 같은 라이브러리를 활용하면 효과적인 캐싱 전략을 구현할 수 있습니다.

```typescript
// React Query를 활용한 다층 캐싱 전략
const useUserData = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserData(userId),
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    cacheTime: 10 * 60 * 1000, // 10분간 캐시 보존
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Service Worker를 활용한 HTTP 캐싱
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open('api-cache-v1').then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            // 캐시된 응답을 즉시 반환하고 백그라운드에서 업데이트
            fetch(event.request).then(fetchResponse => {
              cache.put(event.request, fetchResponse.clone());
            });
            return cachedResponse;
          }
          
          return fetch(event.request).then(fetchResponse => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

### 4. Prefetching 및 예측적 로딩

사용자의 행동 패턴을 예측하여 필요한 데이터를 미리 가져오는 전략입니다. 마우스 호버, 뷰포트 진입 등의 이벤트를 활용해 데이터를 사전 로드할 수 있습니다.

```typescript
// Intersection Observer를 활용한 viewport 기반 prefetch
const usePrefetchOnIntersect = (prefetchFn: () => void, threshold = 0.1) => {
  const ref = useRef<HTMLElement>(null);
  const [hasPrefetched, setHasPrefetched] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasPrefetched) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          prefetchFn();
          setHasPrefetched(true);
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [prefetchFn, hasPrefetched, threshold]);

  return ref;
};

// 마우스 호버 기반 prefetch
const NavigationLink = ({ href, children, prefetchData }: LinkProps) => {
  const handleMouseEnter = useCallback(() => {
    // 200ms 지연 후 prefetch 실행 (의도적인 호버 감지)
    const timer = setTimeout(() => {
      prefetchData();
    }, 200);

    return () => clearTimeout(timer);
  }, [prefetchData]);

  return (
    <Link href={href} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
};
```

## 정리

| 전략 | 구현 방법 | 효과 | 적용 시점 |
|------|-----------|------|-----------|
| **성능 측정** | Performance API, DevTools | 문제 정량화 | 초기 분석 |
| **로딩 UX** | Skeleton UI, 진행률 표시 | 체감 성능 개선 | 즉시 적용 |
| **캐싱** | React Query, Service Worker | 응답 속도 향상 | 단기 개선 |
| **Prefetching** | Intersection Observer, 호버 이벤트 | 예측적 성능 개선 | 중기 개선 |

느린 API 응답 문제는 백엔드 개선만으로 해결되지 않는 경우가 많습니다. 프론트엔드에서 측정, 캐싱, 예측 로딩, UX 개선을 통합적으로 적용하면 사용자 경험을 크게 향상시킬 수 있습니다. 특히 데이터 기반의 성능 분석을 통해 백엔드 팀과의 협업을 이끌어내는 것이 장기적인 해결책으로 이어집니다.