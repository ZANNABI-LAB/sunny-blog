---
title: "Next.js 15 App Router 핵심 개념 정리"
date: "2026-03-06"
tags: ["nextjs", "react", "app-router", "frontend"]
category: "Frontend"
summary: "Next.js 15 App Router의 Server Component, Streaming, Route Handler 등 핵심 개념을 실전 예시와 함께 정리합니다."
author: "신중선"
---

## App Router란?

Next.js 13에서 도입된 **App Router**는 React의 최신 기능(Server Components, Suspense, Streaming)을 완전히 지원하는 새로운 라우팅 시스템입니다. Next.js 15에서 안정화되었습니다.

---

## 디렉토리 구조

```
src/app/
├── layout.tsx        # 공유 레이아웃 (항상 렌더링)
├── page.tsx          # 루트 페이지 (/)
├── loading.tsx       # Suspense fallback
├── error.tsx         # 에러 바운더리
├── tech/
│   ├── page.tsx      # /tech
│   └── [slug]/
│       └── page.tsx  # /tech/:slug
└── api/
    └── posts/
        └── route.ts  # API 라우트
```

---

## Server Component (기본값)

App Router에서 모든 컴포넌트는 기본적으로 **Server Component**입니다.

```tsx
// src/app/tech/page.tsx — Server Component (별도 지시자 불필요)
import { getAllPosts } from "@/lib/posts";

const TechPage = () => {
  // 서버에서 직접 DB/파일 접근 가능
  const posts = getAllPosts();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.slug}>{post.title}</li>
      ))}
    </ul>
  );
};

export default TechPage;
```

인터랙션이 필요한 경우에만 `'use client'`를 선언합니다.

```tsx
"use client";

import { useState } from "react";

const SearchBox = () => {
  const [query, setQuery] = useState("");
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="검색어를 입력하세요"
    />
  );
};

export default SearchBox;
```

---

## Streaming과 Suspense

데이터 페칭이 느린 컴포넌트를 Suspense로 감싸면, 준비된 부분부터 점진적으로 렌더링합니다.

```tsx
import { Suspense } from "react";
import PostList from "@/components/post-list";
import PostListSkeleton from "@/components/post-list-skeleton";

const TechPage = () => {
  return (
    <div>
      <h1>Tech Posts</h1>
      <Suspense fallback={<PostListSkeleton />}>
        {/* 이 컴포넌트가 준비될 때까지 Skeleton 표시 */}
        <PostList />
      </Suspense>
    </div>
  );
};
```

---

## Route Handler (API)

`app/api/*/route.ts` 파일로 API 엔드포인트를 만듭니다.

```typescript
// src/app/api/posts/route.ts
import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";

export const GET = () => {
  const posts = getAllPosts();
  return NextResponse.json(posts);
};
```

---

## generateStaticParams (SSG)

동적 라우트를 빌드 시 정적으로 생성합니다.

```tsx
// src/app/tech/[slug]/page.tsx
import { getPostSlugs, getPostBySlug } from "@/lib/posts";

export const generateStaticParams = () => {
  return getPostSlugs().map((slug) => ({ slug }));
};

type Props = { params: Promise<{ slug: string }> };

const PostPage = async ({ params }: Props) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return <div>포스트를 찾을 수 없습니다.</div>;

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
    </article>
  );
};

export default PostPage;
```

---

## Pages Router vs App Router 비교

| 항목 | Pages Router | App Router |
|------|-------------|------------|
| 기본 컴포넌트 | Client | Server |
| 데이터 페칭 | `getServerSideProps` | async 컴포넌트 |
| 레이아웃 | `_app.tsx` | `layout.tsx` (중첩 가능) |
| Streaming | 미지원 | Suspense로 지원 |
| 안정화 버전 | Next.js 1~ | Next.js 13+ |

App Router가 현재 권장 방식이며, 새 프로젝트는 App Router를 사용하세요.
