---
title: "PRG 패턴: Post-Redirect-Get으로 중복 요청 방지하기"
shortTitle: "PRG 패턴"
date: "2026-03-27"
tags: ["prg-pattern", "web-development", "http-redirect", "form-handling", "backend-pattern"]
category: "Backend"
summary: "POST 요청 후 리다이렉트를 통해 중복 제출을 방지하는 PRG 패턴을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/248"
references: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections", "https://en.wikipedia.org/wiki/Post/Redirect/Get", "https://www.rfc-editor.org/rfc/rfc7231#section-6.4.3"]
---

## PRG 패턴이란?

PRG 패턴은 **Post-Redirect-Get** 패턴의 약자로, 웹 애플리케이션에서 폼 제출 후 발생할 수 있는 중복 요청 문제를 해결하는 디자인 패턴입니다. 사용자가 주문 완료 버튼을 클릭한 후 새로고침을 누르면 중복 주문이 발생하는 것처럼, POST 요청의 중복 실행을 방지하기 위해 사용됩니다.

이 패턴은 HTTP의 상태 코드와 리다이렉션 메커니즘을 활용하여 브라우저의 기본 동작(새로고침, 뒤로가기)으로 인한 부작용을 원천적으로 차단합니다. 특히 결제, 회원가입, 게시글 작성 등 멱등성이 보장되지 않는 작업에서 필수적으로 적용되는 패턴입니다.

## 핵심 개념

### 1. PRG 패턴의 3단계 흐름

PRG 패턴은 이름 그대로 세 단계로 구성됩니다.

```javascript
// 1. Post - 클라이언트에서 서버로 POST 요청
fetch('/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'PROD-001',
    quantity: 2
  })
});

// 2. Redirect - 서버에서 302 응답으로 리다이렉션
// HTTP/1.1 302 Found
// Location: /orders/success?orderId=12345

// 3. Get - 브라우저가 자동으로 GET 요청 실행
// GET /orders/success?orderId=12345
```

POST 요청 처리 후 클라이언트는 새로운 URL로 자동 리다이렉트되며, 최종적으로 GET 요청으로 결과 페이지를 표시받습니다.

### 2. 중복 요청 방지 메커니즘

PRG 패턴이 없을 때와 있을 때의 차이를 비교해보겠습니다.

```javascript
// PRG 패턴 없는 경우 - 문제 발생
app.post('/orders', (req, res) => {
  // 주문 처리 로직
  const order = processOrder(req.body);
  
  // 직접 HTML 응답 - 새로고침 시 POST 재실행!
  res.send(`<h1>주문 완료: ${order.id}</h1>`);
});

// PRG 패턴 적용 - 문제 해결
app.post('/orders', (req, res) => {
  // 주문 처리 로직
  const order = processOrder(req.body);
  
  // 리다이렉트로 안전한 GET 페이지로 이동
  res.redirect(302, `/orders/success?orderId=${order.id}`);
});

app.get('/orders/success', (req, res) => {
  const { orderId } = req.query;
  // GET 요청은 멱등성 보장 - 새로고침해도 안전
  res.send(`<h1>주문 완료: ${orderId}</h1>`);
});
```

리다이렉트 후에는 브라우저 주소창이 GET URL로 변경되어, 새로고침 시에도 안전한 GET 요청만 반복됩니다.

### 3. HTTP 상태 코드와 구현 방식

PRG 패턴에서 사용하는 주요 리다이렉트 상태 코드들입니다.

```javascript
// 302 Found - 임시 리다이렉트 (가장 일반적)
res.redirect(302, '/success');

// 303 See Other - POST 후 GET으로 명시적 변경
res.status(303).location('/success').end();

// 307 Temporary Redirect - 원래 메서드 유지 (PRG에 부적합)
// 308 Permanent Redirect - 영구 리다이렉트 (PRG에 부적합)

// Spring Boot에서의 구현 예시
@PostMapping("/orders")
public String createOrder(@RequestBody OrderRequest request, RedirectAttributes attrs) {
    Order order = orderService.create(request);
    attrs.addAttribute("orderId", order.getId());
    
    return "redirect:/orders/success"; // PRG 패턴 적용
}

@GetMapping("/orders/success")
public String orderSuccess(@RequestParam Long orderId, Model model) {
    model.addAttribute("order", orderService.findById(orderId));
    return "order-success"; // 안전한 GET 페이지
}
```

302와 303 상태 코드가 PRG 패턴에 적합하며, 대부분의 브라우저에서 POST 후 GET으로 자동 변환됩니다.

### 4. 실무 적용 시나리오

PRG 패턴이 특히 중요한 상황들입니다.

```javascript
// 결제 처리 - 중복 결제 방지 필수
app.post('/payments', async (req, res) => {
  try {
    const payment = await paymentService.process(req.body);
    // 결제 완료 후 즉시 리다이렉트
    res.redirect(`/payments/complete?paymentId=${payment.id}`);
  } catch (error) {
    res.redirect('/payments/error?reason=processing_failed');
  }
});

// 회원가입 - 중복 가입 방지
app.post('/users/register', async (req, res) => {
  const user = await userService.register(req.body);
  // 가입 완료 후 로그인 페이지로 리다이렉트
  res.redirect('/login?registered=true');
});

// 게시글 작성 - 중복 게시 방지
app.post('/posts', async (req, res) => {
  const post = await postService.create(req.body, req.user.id);
  // 작성된 게시글 페이지로 리다이렉트
  res.redirect(`/posts/${post.id}`);
});
```

이러한 시나리오에서 PRG 패턴은 사용자 경험과 데이터 무결성을 동시에 보장합니다.

## 정리

| 구분 | PRG 패턴 없음 | PRG 패턴 적용 |
|------|---------------|---------------|
| **새로고침 동작** | POST 요청 재실행 | 안전한 GET 요청 |
| **브라우저 주소** | POST URL 유지 | GET URL로 변경 |
| **중복 실행** | 발생 위험 높음 | 원천 차단 |
| **사용자 경험** | 경고 메시지 표시 | 자연스러운 페이지 표시 |

**PRG 패턴의 핵심 장점**
- **중복 요청 방지**: 새로고침이나 뒤로가기 시 POST 재실행 차단
- **명확한 상태 구분**: 처리 완료 후 결과 페이지 URL 분리
- **브라우저 호환성**: 모든 주요 브라우저에서 표준 동작
- **SEO 친화적**: 결과 페이지에 고유 URL 제공

PRG 패턴은 단순하면서도 강력한 웹 개발 패턴으로, 사용자 액션이 있는 모든 POST 요청에서 고려해야 할 필수 기법입니다.