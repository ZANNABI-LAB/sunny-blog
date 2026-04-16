---
title: "Next.js Middleware와 Edge Runtime"
shortTitle: "Next.js Middleware"
date: "2026-04-16"
tags: ["nextjs", "middleware", "edge-runtime", "server-side", "authentication"]
category: "Frontend"
summary: "Next.js Middleware의 동작 원리와 Edge Runtime에서의 실행 방식을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/305"
references: ["https://nextjs.org/docs/app/building-your-application/routing/middleware", "https://vercel.com/docs/concepts/functions/edge-functions", "https://developer.mozilla.org/en-US/docs/Web/API/Request"]
---

## Next.js Middleware란?

Next.js Middleware는 요청이 완료되기 전에 실행되는 코드입니다. 프로젝트 루트 또는 `src` 디렉토리에 `middleware.ts` 파일을 생성하여 사용할 수 있으며, 서버 사이드에서 실행되어 라우트 핸들러나 페이지에 요청이 도달하기 전에 동작합니다.

Edge Runtime에서 실행되어 전 세계 엣지 서버에서 빠른 응답을 제공하며, 인증 검사, 리다이렉션 처리, 헤더 수정 등의 작업을 수행할 수 있습니다. 이를 통해 서버 부하를 줄이고 사용자 경험을 개선할 수 있습니다.

## 핵심 개념

### 1. Middleware 기본 구조

Next.js Middleware는 `middleware.ts` 파일에 정의되며, 특정 경로 패턴에 대해 실행됩니다:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 인증 확인
  const token = request.cookies.get('auth-token')
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // 요청 헤더 수정
  const response = NextResponse.next()
  response.headers.set('x-custom-header', 'middleware-processed')
  
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*']
}
```

### 2. Edge Runtime의 특징

Edge Runtime은 경량화된 JavaScript 런타임으로, CDN 엣지 노드에서 코드를 실행합니다:

```typescript
// ✅ Edge Runtime에서 사용 가능한 API
export function middleware(request: NextRequest) {
  // Web API 사용 가능
  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.search)
  
  // fetch API 사용 가능
  return fetch('https://api.example.com/auth', {
    headers: {
      'Authorization': request.headers.get('authorization') || ''
    }
  })
}

// ❌ Edge Runtime에서 사용 불가능한 API
// import fs from 'fs' // Node.js API 불가
// new Worker() // Web Workers 불가
```

### 3. 인증 및 권한 검사

Middleware는 사용자 인증 상태를 확인하고 접근 권한을 제어하는 데 효과적입니다:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt-token')?.value
  
  // 보호된 경로 접근 시 토큰 검증
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}
```

### 4. 응답 조작 및 최적화

Middleware를 통해 응답을 수정하고 성능을 최적화할 수 있습니다:

```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // CORS 헤더 설정
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  
  // 보안 헤더 설정
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // A/B 테스트를 위한 쿠키 설정
  if (!request.cookies.get('variant')) {
    const variant = Math.random() > 0.5 ? 'A' : 'B'
    response.cookies.set('variant', variant, { maxAge: 86400 })
  }
  
  return response
}
```

## 정리

| 구분 | 내용 |
|------|------|
| **실행 환경** | Edge Runtime에서 전 세계 엣지 서버에서 실행 |
| **주요 용도** | 인증 검사, 리다이렉션, 헤더 수정, A/B 테스트 |
| **파일 위치** | 프로젝트 루트 또는 src 디렉토리의 middleware.ts |
| **사용 가능 API** | Web API (fetch, URL, URLSearchParams 등) |
| **제한사항** | Node.js API, 파일 시스템 접근, Worker 스레드 불가 |
| **성능 특징** | 콜드 스타트 거의 없음, 빠른 응답 시간 |

Next.js Middleware는 Edge Runtime의 장점을 활용하여 전역적인 로직을 효율적으로 처리할 수 있는 강력한 도구입니다. 특히 인증, 권한 검사, 리다이렉션과 같은 공통 로직을 중앙화하여 관리할 수 있어 코드의 재사용성과 유지보수성을 크게 향상시킵니다.