---
title: "requestAnimationFrame으로 부드러운 애니메이션 구현하기"
shortTitle: "requestAnimationFrame"
date: "2026-03-06"
tags: ["animation", "performance", "browser-api"]
category: "Frontend"
summary: "브라우저의 화면 갱신 주기에 맞춰 최적화된 애니메이션을 구현하는 requestAnimationFrame API를 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/188"
references:
  - "https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame"
  - "https://www.w3.org/TR/animation-timing/"
---

## requestAnimationFrame이란?

requestAnimationFrame은 브라우저의 화면 갱신 주기에 맞춰 콜백 함수를 실행하도록 요청하는 웹 API입니다. 일반적으로 브라우저는 1초당 60프레임(60fps) 또는 120프레임(120fps)으로 화면을 갱신하는데, 이 API는 이러한 갱신 주기에 정확히 동기화하여 애니메이션을 실행합니다.

기존의 setTimeout이나 setInterval과 달리, requestAnimationFrame은 브라우저가 다음 프레임을 그리기 직전에 콜백을 실행하여 불필요한 렌더링을 방지하고 성능을 최적화합니다. 이를 통해 더 부드럽고 효율적인 애니메이션을 구현할 수 있습니다.

## 핵심 개념

### 1. 브라우저 렌더링 사이클과의 동기화

requestAnimationFrame의 가장 중요한 특징은 브라우저의 렌더링 사이클에 맞춰 실행된다는 점입니다.

```javascript
function animate() {
  // 애니메이션 로직 실행
  element.style.transform = `translateX(${position}px)`;
  position += 2;
  
  // 조건이 만족될 때까지 반복
  if (position < 300) {
    requestAnimationFrame(animate);
  }
}

// 애니메이션 시작
requestAnimationFrame(animate);
```

이 방식은 브라우저가 화면을 갱신하는 최적의 타이밍에 콜백을 실행하여 프레임 드롭 없는 매끄러운 애니메이션을 보장합니다.

### 2. setTimeout/setInterval과의 차이점

기존 타이머 함수들과 비교하면 requestAnimationFrame의 장점이 명확해집니다.

```javascript
// setTimeout 방식 (비효율적)
function animateWithTimeout() {
  element.style.left = position + 'px';
  position += 2;
  
  if (position < 300) {
    setTimeout(animateWithTimeout, 16); // 약 60fps
  }
}

// requestAnimationFrame 방식 (효율적)
function animateWithRAF() {
  element.style.left = position + 'px';
  position += 2;
  
  if (position < 300) {
    requestAnimationFrame(animateWithRAF);
  }
}
```

setTimeout은 고정된 간격으로 실행되어 브라우저 갱신 주기와 맞지 않을 수 있지만, requestAnimationFrame은 항상 최적의 타이밍을 보장합니다.

### 3. 성능 최적화 기능

requestAnimationFrame은 여러 성능 최적화 기능을 내장하고 있습니다.

```javascript
let animationId;
let isAnimating = false;

function startAnimation() {
  if (isAnimating) return;
  
  isAnimating = true;
  
  function animate(timestamp) {
    // timestamp: 애니메이션 시작 시점부터의 경과 시간
    const progress = Math.min(timestamp / 1000, 1); // 1초 동안 진행
    
    element.style.opacity = progress;
    
    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      isAnimating = false;
    }
  }
  
  animationId = requestAnimationFrame(animate);
}

function stopAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    isAnimating = false;
  }
}
```

### 4. 실행 컨텍스트와 큐 관리

requestAnimationFrame의 콜백은 태스크 큐나 마이크로태스크 큐와는 별도의 "animation frame callbacks" 맵에서 관리됩니다.

```javascript
console.log('1. 동기 코드');

setTimeout(() => console.log('2. setTimeout'), 0);

Promise.resolve().then(() => console.log('3. Promise'));

requestAnimationFrame(() => console.log('4. requestAnimationFrame'));

console.log('5. 동기 코드');

// 실행 순서: 1 → 5 → 3 → 4 → 2
```

이러한 독립적인 관리 방식 덕분에 렌더링 성능에 최적화된 실행 타이밍을 보장받을 수 있습니다.

## 정리

| 특징 | requestAnimationFrame | setTimeout/setInterval |
|------|----------------------|------------------------|
| **실행 타이밍** | 브라우저 갱신 주기에 동기화 | 고정 간격 |
| **성능** | 최적화된 렌더링 | 불필요한 렌더링 가능 |
| **배터리 효율** | 백그라운드 시 중지 | 지속 실행 |
| **디스플레이 대응** | 주사율 자동 조정 | 고정 주기 |
| **프레임 드롭** | 없음 | 발생 가능 |

**핵심 장점:**
- 브라우저의 화면 갱신 주기와 완벽 동기화
- 백그라운드 탭에서 자동 중지로 리소스 절약
- 다양한 디스플레이 주사율에 자동 적응
- 독립적인 콜백 큐로 렌더링 성능 최적화

requestAnimationFrame은 웹 애니메이션의 성능과 사용자 경험을 동시에 향상시키는 필수 API입니다.