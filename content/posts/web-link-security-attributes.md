---
title: "웹 링크 보안을 위한 rel 속성 완벽 가이드"
shortTitle: "rel 속성"
date: "2026-03-12"
tags: ["web-security", "html-attributes", "frontend-security", "link-safety", "browser-security"]
category: "Security"
summary: "외부 링크 연결 시 보안 위험을 방지하는 rel 속성 사용법을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/202"
references: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel", "https://web.dev/external-anchors-use-rel-noopener/", "https://owasp.org/www-community/attacks/Reverse_Tabnabbing"]
---

## 웹 링크 보안이란?

웹 애플리케이션에서 외부 링크를 연결할 때 발생할 수 있는 보안 취약점을 방지하는 것입니다. `<a>` 태그의 `rel` 속성을 적절히 설정하지 않으면 탭내빙(Tabnabbing) 공격, 민감한 정보 유출, SEO 조작 등의 위험에 노출될 수 있습니다.

특히 `target="_blank"`로 새 탭을 여는 외부 링크는 기본적으로 `window.opener` 객체를 통해 원본 페이지에 접근할 수 있어 보안상 매우 위험합니다. 이러한 보안 위험을 방지하기 위해 `rel` 속성의 `noopener`, `noreferrer`, `nofollow` 값을 적절히 사용해야 합니다.

## 핵심 개념

### 1. noopener - 탭내빙 공격 방지

`rel="noopener"`는 새로 열린 페이지에서 `window.opener` 객체에 접근할 수 없도록 차단합니다.

```html
<!-- 위험: window.opener 접근 가능 -->
<a href="https://external-site.com" target="_blank">외부 링크</a>

<!-- 안전: window.opener 접근 차단 -->
<a href="https://external-site.com" target="_blank" rel="noopener">외부 링크</a>
```

탭내빙 공격은 다음과 같이 진행됩니다:

```javascript
// 악성 외부 사이트에서 실행되는 코드
if (window.opener) {
  // 원본 탭을 피싱 사이트로 리다이렉트
  window.opener.location.href = 'https://fake-login-page.com';
}
```

`noopener`를 설정하면 `window.opener`가 `null`이 되어 이런 공격을 원천 차단할 수 있습니다.

### 2. noreferrer - 참조자 정보 보호

`rel="noreferrer"`는 HTTP Referer 헤더가 외부 사이트로 전송되지 않도록 합니다.

```html
<!-- URL에 민감한 정보가 포함된 경우 -->
<a href="https://external-site.com" 
   target="_blank" 
   rel="noreferrer">
   외부 링크
</a>
```

Referer 헤더에는 다음과 같은 민감한 정보가 포함될 수 있습니다:

```
https://mysite.com/dashboard?sessionId=abc123&userId=456
```

`noreferrer`를 사용하면 외부 사이트는 사용자가 어디서 왔는지 알 수 없게 됩니다. 또한 `noreferrer`는 `noopener` 기능도 포함하므로 두 가지 보안 위험을 동시에 방지할 수 있습니다.

### 3. nofollow - SEO 링크 주스 차단

`rel="nofollow"`는 검색 엔진이 해당 링크를 따라가지 않도록 지시합니다.

```html
<!-- 사용자 생성 콘텐츠의 외부 링크 -->
<a href="https://spam-site.com" rel="nofollow">스팸 링크</a>

<!-- 광고 링크 -->
<a href="https://ad-site.com" rel="nofollow">광고 링크</a>
```

`nofollow`가 필요한 상황:

```javascript
// 댓글 시스템에서 사용자 링크 처리
function processUserLink(url) {
  return `<a href="${url}" rel="nofollow noopener noreferrer" target="_blank">
    ${url}
  </a>`;
}
```

### 4. 속성 조합 사용법

실제 프로젝트에서는 여러 속성을 조합하여 사용합니다:

```html
<!-- 가장 안전한 외부 링크 -->
<a href="https://external-site.com" 
   target="_blank" 
   rel="noopener noreferrer nofollow">
   외부 링크
</a>

<!-- 신뢰할 수 있는 외부 링크 (SEO 전달 허용) -->
<a href="https://trusted-partner.com" 
   target="_blank" 
   rel="noopener noreferrer">
   파트너 사이트
</a>
```

React 컴포넌트로 구현하면:

```typescript
interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  trusted?: boolean;
}

function ExternalLink({ href, children, trusted = false }: ExternalLinkProps) {
  const rel = trusted 
    ? "noopener noreferrer"
    : "noopener noreferrer nofollow";
    
  return (
    <a href={href} target="_blank" rel={rel}>
      {children}
    </a>
  );
}
```

## 정리

| 속성 | 기능 | 사용 시기 |
|------|------|-----------|
| `noopener` | `window.opener` 접근 차단 | 모든 외부 링크 |
| `noreferrer` | Referer 헤더 차단 | 민감한 정보 포함 시 |
| `nofollow` | 검색엔진 크롤링 차단 | 스팸/광고 링크 |

**권장사항:**
- 모든 외부 링크에 최소한 `noopener` 적용
- 민감한 정보가 포함된 URL은 `noreferrer` 추가
- 사용자 생성 콘텐츠나 광고 링크는 `nofollow` 포함
- 신뢰할 수 있는 파트너 사이트는 `nofollow` 생략 가능