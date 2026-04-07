---
title: "Progressive Partial Rendering(PPR): 점진적 페이지 렌더링 최적화"
shortTitle: "Progressive Partial Rendering"
date: "2026-04-07"
tags: ["progressive-rendering", "web-performance", "ssr", "hydration", "frontend-optimization"]
category: "Frontend"
summary: "페이지 콘텐츠를 중요도에 따라 단계적으로 렌더링하여 로딩 성능을 최적화하는 PPR 기법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/278"
references: ["https://web.dev/progressive-web-apps/", "https://nextjs.org/docs/app/api-reference/next-config-js/partial-prerendering", "https://developer.mozilla.org/en-US/docs/Web/Performance"]
---

## Progressive Partial Rendering이란?

Progressive Partial Rendering(PPR)은 웹 페이지의 로딩 성능을 최적화하는 렌더링 기법입니다. 전체 페이지를 한 번에 렌더링하는 대신, 콘텐츠의 중요도와 우선순위에 따라 단계적으로 렌더링합니다.

사용자는 페이지의 핵심 콘텐츠를 먼저 볼 수 있게 되어 체감 로딩 시간이 크게 단축됩니다. 이는 전통적인 렌더링 방식이 모든 콘텐츠가 준비될 때까지 기다려야 하는 문제를 해결합니다.

PPR은 First Contentful Paint(FCP)와 Time To Interactive(TTI) 같은 웹 성능 지표를 개선하는 핵심 기술로 주목받고 있습니다.

## 핵심 개념

### 1. 하이브리드 렌더링 전략

PPR의 핵심은 서버사이드 렌더링(SSR)과 클라이언트사이드 렌더링(CSR)을 효과적으로 결합하는 것입니다.

```typescript
// Next.js PPR 구현 예시
export default function ProductPage({ productId }: { productId: string }) {
  return (
    <div>
      {/* 즉시 렌더링되는 정적 콘텐츠 */}
      <Header />
      <NavigationBar />
      
      {/* 우선순위가 높은 동적 콘텐츠 */}
      <ProductInfo productId={productId} />
      
      {/* 점진적으로 로드되는 콘텐츠 */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={productId} />
      </Suspense>
      
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations productId={productId} />
      </Suspense>
    </div>
  )
}
```

중요한 콘텐츠는 서버에서 미리 렌더링하고, 부차적인 콘텐츠는 클라이언트에서 점진적으로 로드합니다.

### 2. 스트리밍 SSR과 점진적 하이드레이션

스트리밍 SSR을 통해 페이지를 청크 단위로 전송하고, 각 청크를 순차적으로 하이드레이션합니다.

```typescript
// React 18 Streaming SSR
import { renderToPipeableStream } from 'react-dom/server'

function streamResponse(res: Response, App: React.Component) {
  const { pipe } = renderToPipeableStream(<App />, {
    onShellReady() {
      // 셸(핵심 레이아웃) 준비 완료
      res.setHeader('content-type', 'text/html')
      pipe(res)
    },
    onAllReady() {
      // 모든 콘텐츠 준비 완료
      console.log('All content ready')
    }
  })
}
```

이를 통해 사용자는 전체 페이지가 준비되기 전에도 상호작용 가능한 콘텐츠를 볼 수 있습니다.

### 3. 우선순위 기반 콘텐츠 로딩

콘텐츠의 중요도에 따라 로딩 순서를 결정하고, 리소스를 효율적으로 할당합니다.

```typescript
// 우선순위 기반 로딩 구현
const ContentPriority = {
  CRITICAL: 1,    // 즉시 필요 (헤더, 주요 콘텐츠)
  HIGH: 2,        // 빠르게 필요 (상품 정보, 가격)
  MEDIUM: 3,      // 나중에 필요 (리뷰, 추천)
  LOW: 4          // 선택적 필요 (광고, 관련 상품)
} as const

function usePriorityLoading<T>(
  fetchFn: () => Promise<T>,
  priority: number
) {
  const [data, setData] = useState<T | null>(null)
  
  useEffect(() => {
    const delay = priority * 100 // 우선순위별 지연
    
    const timer = setTimeout(() => {
      fetchFn().then(setData)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [fetchFn, priority])
  
  return data
}
```

### 4. Lazy Loading과의 차이점

PPR은 Lazy Loading보다 포괄적인 개념입니다. Lazy Loading은 뷰포트 기반으로 특정 리소스를 지연 로드하는 반면, PPR은 페이지 전체의 렌더링 전략을 다룹니다.

```typescript
// Lazy Loading (특정 리소스 최적화)
function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [isVisible, setIsVisible] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.disconnect()
      }
    })
    
    if (imgRef.current) observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [])
  
  return (
    <img ref={imgRef} src={isVisible ? src : ''} alt={alt} />
  )
}

// PPR (전체 페이지 렌더링 전략)
function ProgressivePageRenderer() {
  return (
    <>
      {/* Phase 1: 즉시 렌더링 */}
      <CriticalContent />
      
      {/* Phase 2: 점진적 렌더링 */}
      <ProgressiveSection priority={2}>
        <ImportantContent />
      </ProgressiveSection>
      
      {/* Phase 3: 지연 렌더링 */}
      <ProgressiveSection priority={3}>
        <SecondaryContent />
      </ProgressiveSection>
    </>
  )
}
```

## 정리

| 측면 | 설명 | 장점 |
|------|------|------|
| **렌더링 전략** | SSR + CSR 하이브리드 접근 | 초기 로딩 속도와 상호작용성 모두 확보 |
| **콘텐츠 우선순위** | 중요도별 단계적 로딩 | 핵심 콘텐츠 우선 노출로 UX 개선 |
| **스트리밍** | 청크 단위 점진적 전송 | 전체 페이지 대기 시간 단축 |
| **SEO 최적화** | 서버 렌더링으로 크롤링 지원 | 검색 엔진 색인화 개선 |
| **성능 지표** | FCP, TTI, LCP 개선 | Core Web Vitals 점수 향상 |

PPR은 현대 웹 애플리케이션에서 사용자 경험과 성능을 동시에 개선할 수 있는 핵심 기술입니다. 특히 콘텐츠가 복잡하고 다양한 우선순위를 가진 페이지에서 그 효과가 극대화됩니다.