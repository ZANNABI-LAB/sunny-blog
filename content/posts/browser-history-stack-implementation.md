---
title: "스택으로 구현하는 브라우저 히스토리 관리"
shortTitle: "브라우저 히스토리 스택"
date: "2026-04-15"
tags: ["stack", "browser-history", "data-structure", "frontend-navigation"]
category: "Frontend.Browser"
summary: "스택 자료구조를 활용하여 브라우저의 뒤로가기/앞으로가기 기능을 구현하는 방법을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/302"
references: ["https://developer.mozilla.org/en-US/docs/Web/API/History_API", "https://html.spec.whatwg.org/multipage/history.html"]
---

## 브라우저 히스토리 스택이란?

브라우저의 뒤로가기/앞으로가기 기능은 사용자가 웹 페이지를 탐색할 때 이전에 방문한 페이지들을 기억하고 다시 이동할 수 있게 해주는 핵심 기능입니다. 이 기능은 스택(Stack) 자료구조의 LIFO(Last In, First Out) 특성을 활용하여 효율적으로 구현할 수 있습니다.

스택 기반 히스토리 관리 시스템은 두 개의 독립적인 스택을 사용하여 사용자의 페이지 방문 기록을 추적하고, 양방향 네비게이션을 지원합니다. 이는 실제 브라우저의 히스토리 API 동작 원리와 매우 유사한 구조입니다.

## 핵심 개념

### 1. 이중 스택 구조

브라우저 히스토리 관리를 위해서는 두 개의 스택이 필요합니다:

```typescript
class BrowserHistory {
  private backStack: string[] = [];
  private forwardStack: string[] = [];
  private currentPage: string;

  constructor(initialPage: string) {
    this.currentPage = initialPage;
  }

  // 현재 페이지 상태 확인
  getCurrentPage(): string {
    return this.currentPage;
  }

  // 뒤로가기 가능 여부
  canGoBack(): boolean {
    return this.backStack.length > 0;
  }

  // 앞으로가기 가능 여부
  canGoForward(): boolean {
    return this.forwardStack.length > 0;
  }
}
```

**backStack**은 사용자가 방문한 페이지들을 순서대로 저장하며, 가장 최근 페이지가 스택의 top에 위치합니다. **forwardStack**은 뒤로가기 후 다시 앞으로 이동할 수 있는 페이지들을 보관합니다.

### 2. 페이지 방문 처리

새로운 페이지를 방문할 때는 현재 페이지를 backStack에 저장하고, forwardStack을 초기화합니다:

```typescript
class BrowserHistory {
  // ... 이전 코드

  visit(page: string): void {
    // 현재 페이지를 뒤로가기 스택에 저장
    this.backStack.push(this.currentPage);
    
    // 새 페이지로 이동
    this.currentPage = page;
    
    // 앞으로가기 스택 초기화 (새로운 경로 시작)
    this.forwardStack = [];
    
    console.log(`페이지 방문: ${page}`);
    this.printState();
  }

  private printState(): void {
    console.log(`현재: ${this.currentPage}`);
    console.log(`뒤로가기 스택: [${this.backStack.join(', ')}]`);
    console.log(`앞으로가기 스택: [${this.forwardStack.join(', ')}]`);
    console.log('---');
  }
}
```

forwardStack을 초기화하는 이유는 새로운 페이지로 이동하면 이전의 "앞으로가기" 경로가 더 이상 유효하지 않기 때문입니다.

### 3. 뒤로가기 및 앞으로가기 구현

양방향 네비게이션은 두 스택 간의 데이터 이동으로 구현됩니다:

```typescript
class BrowserHistory {
  // ... 이전 코드

  goBack(): boolean {
    if (!this.canGoBack()) {
      console.log('더 이상 뒤로 갈 페이지가 없습니다.');
      return false;
    }

    // 현재 페이지를 앞으로가기 스택에 저장
    this.forwardStack.push(this.currentPage);
    
    // 뒤로가기 스택에서 이전 페이지 가져오기
    this.currentPage = this.backStack.pop()!;
    
    console.log(`뒤로가기: ${this.currentPage}`);
    this.printState();
    return true;
  }

  goForward(): boolean {
    if (!this.canGoForward()) {
      console.log('더 이상 앞으로 갈 페이지가 없습니다.');
      return false;
    }

    // 현재 페이지를 뒤로가기 스택에 저장
    this.backStack.push(this.currentPage);
    
    // 앞으로가기 스택에서 다음 페이지 가져오기
    this.currentPage = this.forwardStack.pop()!;
    
    console.log(`앞으로가기: ${this.currentPage}`);
    this.printState();
    return true;
  }
}
```

### 4. 실사용 예제

실제 사용 시나리오를 통해 동작 과정을 확인할 수 있습니다:

```typescript
// 브라우저 히스토리 초기화
const history = new BrowserHistory('home.html');

// 페이지 방문 시뮬레이션
history.visit('about.html');
history.visit('contact.html');
history.visit('products.html');

// 뒤로가기 테스트
history.goBack();  // products.html → contact.html
history.goBack();  // contact.html → about.html

// 앞으로가기 테스트
history.goForward(); // about.html → contact.html

// 새 페이지 방문 (forwardStack 초기화됨)
history.visit('blog.html');

// 이제 products.html로 앞으로가기 불가능
console.log(history.canGoForward()); // false
```

이 구조는 실제 브라우저의 세션 히스토리 관리와 동일한 방식으로 작동하며, SPA(Single Page Application)에서 클라이언트 사이드 라우팅을 구현할 때도 활용할 수 있습니다.

## 정리

| 구성 요소 | 역할 | 특징 |
|----------|------|------|
| **backStack** | 방문한 페이지 기록 저장 | 뒤로가기 기능 담당, LIFO 구조 |
| **forwardStack** | 앞으로가기 가능한 페이지 저장 | 뒤로가기 후에만 데이터 존재 |
| **currentPage** | 현재 활성 페이지 | 사용자가 보고 있는 페이지 |

**핵심 동작 규칙:**
- 새 페이지 방문 시: 현재 페이지 → backStack, forwardStack 초기화
- 뒤로가기 시: 현재 페이지 → forwardStack, backStack에서 pop
- 앞으로가기 시: 현재 페이지 → backStack, forwardStack에서 pop