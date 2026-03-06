---
title: "requestAnimationFrame으로 부드러운 애니메이션 구현하기"
shortTitle: "requestAnimationFrame"
date: "2026-03-06"
tags: ["requestAnimationFrame", "animation", "performance"]
category: "설명해주세요.프론트엔드"
summary: "브라우저의 화면 갱신 주기에 맞춰 최적화된 애니메이션을 구현하는 방법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/188"
---

## requestAnimationFrame이란?

`requestAnimationFrame`은 브라우저의 화면 갱신 주기에 맞춰 콜백 함수를 실행하도록 요청하는 웹 API입니다. 이 API를 사용하면 애니메이션을 보다 부드럽게 렌더링하고 성능을 최적화할 수 있습니다.

브라우저는 일반적으로 1초당 60번(60fps) 또는 120번(120fps)의 주기로 화면을 갱신합니다. `requestAnimationFrame`은 이러한 갱신 주기에 정확히 맞춰 콜백을 실행하여 브라우저가 최적의 시점에 프레임을 렌더링하도록 보장합니다.

기존의 `setTimeout`이나 `setInterval`과 달리, 브라우저의 렌더링 엔진과 동기화되어 프레임 드롭 없는 매끄러운 애니메이션을 제공합니다.

## 핵심 개념

### 1. 기본 사용법과 애니메이션 루프

가장 기본적인 `requestAnimationFrame` 사용 패턴은 재귀적 호출을 통한 애니메이션 루프입니다:

```javascript
let startTime = null;
const duration = 2000; // 2초 동안 애니메이션

function animate(currentTime) {
  if (!startTime) startTime = currentTime;
  const elapsed = currentTime - startTime;
  const progress = Math.min(elapsed / duration, 1);
  
  // 요소의 위치나 스타일을 업데이트
  element.style.transform = `translateX(${progress * 300}px)`;
  
  // 애니메이션이 완료되지 않았다면 다음 프레임 요청
  if (progress < 1) {
    requestAnimationFrame(animate);
  }
}

// 애니메이션 시작
requestAnimationFrame(animate);
```

애니메이션 취소가 필요한 경우 `cancelAnimationFrame`을 사용할 수 있습니다:

```javascript
let animationId;

function animate() {
  // 애니메이션 로직
  animationId = requestAnimationFrame(animate);
}

// 애니메이션 중단
function stopAnimation() {
  cancelAnimationFrame(animationId);
}
```

### 2. setTimeout/setInterval과의 차이점

기존의 타이머 함수들과 `requestAnimationFrame`의 주요 차이점은 다음과 같습니다:

```javascript
// setTimeout 방식 (문제가 있는 접근)
function animateWithTimeout() {
  updateAnimation();
  setTimeout(animateWithTimeout, 16); // 약 60fps 시도
}

// requestAnimationFrame 방식 (권장)
function animateWithRAF() {
  updateAnimation();
  requestAnimationFrame(animateWithRAF);
}
```

`setTimeout` 방식의 문제점:
- 브라우저의 화면 갱신 주기와 맞지 않을 수 있음
- 백그라운드에서도 계속 실행되어 리소스 낭비
- 프레임 드롭과 끊김 현상 발생 가능

반면 `requestAnimationFrame`은:
- 브라우저의 화면 갱신 주기에 정확히 동기화
- 백그라운드 탭에서는 자동으로 일시정지
- 디스플레이 주사율에 맞게 동적 조정

### 3. 성능 최적화와 실행 주기

`requestAnimationFrame`은 여러 성능 최적화 기능을 내장하고 있습니다:

```javascript
class PerformantAnimator {
  constructor() {
    this.isRunning = false;
    this.callbacks = [];
  }
  
  // 여러 애니메이션 작업을 하나의 프레임에서 처리
  addAnimation(callback) {
    this.callbacks.push(callback);
    if (!this.isRunning) {
      this.start();
    }
  }
  
  start() {
    this.isRunning = true;
    this.animate();
  }
  
  animate() {
    // 모든 애니메이션 콜백을 한 번에 실행
    this.callbacks.forEach(callback => callback());
    
    if (this.isRunning) {
      requestAnimationFrame(() => this.animate());
    }
  }
  
  stop() {
    this.isRunning = false;
  }
}

// 사용 예시
const animator = new PerformantAnimator();
animator.addAnimation(() => moveElement1());
animator.addAnimation(() => rotateElement2());
```

### 4. 이벤트 루프와의 관계

`requestAnimationFrame` 콜백은 태스크 큐나 마이크로태스크 큐와는 별개의 "Animation Frame Callbacks" 큐에서 관리됩니다:

```javascript
console.log('1: 동기 코드');

setTimeout(() => console.log('2: 매크로태스크'), 0);

Promise.resolve().then(() => console.log('3: 마이크로태스크'));

requestAnimationFrame(() => console.log('4: 애니메이션 프레임'));

console.log('5: 동기 코드');

// 실행 순서: 1 → 5 → 3 → 4 → 2
// (브라우저와 상황에 따라 순서가 달라질 수 있음)
```

애니메이션 프레임 콜백은 브라우저가 다음 프레임을 렌더링하기 직전에 실행되며, 디스플레이의 주사율(60Hz, 120Hz, 144Hz 등)에 맞게 실행 주기가 자동으로 조정됩니다.

## 정리

| 특징 | requestAnimationFrame | setTimeout/setInterval |
|------|----------------------|----------------------|
| **실행 주기** | 브라우저 화면 갱신 주기에 동기화 | 고정된 시간 간격 |
| **성능** | 최적화된 렌더링 성능 | 프레임 드롭 가능성 |
| **백그라운드 동작** | 자동 일시정지 | 계속 실행 |
| **배터리 효율** | 우수함 | 상대적으로 비효율적 |
| **주사율 대응** | 자동 조정 | 수동 조정 필요 |

**핵심 장점:**
- 브라우저 렌더링 엔진과 완벽한 동기화
- 디스플레이 주사율에 맞는 자동 최적화
- 백그라운드에서의 자동 성능 절약
- 부드럽고 자연스러운 애니메이션 구현