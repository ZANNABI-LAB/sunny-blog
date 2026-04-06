---
title: "Node.js의 주요 특징과 아키텍처"
shortTitle: "Node.js 아키텍처"
date: "2026-04-06"
tags: ["nodejs", "javascript-runtime", "event-driven", "non-blocking-io", "single-thread"]
category: "Backend"
summary: "Chrome V8 엔진 기반의 Node.js 런타임 환경과 싱글 스레드, 이벤트 기반, 논 블로킹 I/O 특징을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/274"
references: ["https://nodejs.org/en/docs/", "https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Introduction", "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/"]
---

## Node.js란?

Node.js는 Chrome V8 JavaScript 엔진을 기반으로 구축된 JavaScript 런타임 환경입니다. 브라우저에서만 실행되던 JavaScript를 서버 사이드 환경에서도 실행할 수 있게 해주어, 풀스택 JavaScript 개발을 가능하게 만들었습니다.

2009년 Ryan Dahl에 의해 개발된 Node.js는 기존 서버 개발 패러다임과는 다른 접근 방식을 통해 높은 동시성과 확장성을 제공합니다. 특히 실시간 애플리케이션, API 서버, 마이크로서비스 아키텍처에서 뛰어난 성능을 보여줍니다.

## 핵심 개념

### 1. 싱글 스레드 아키텍처

Node.js는 메인 실행 스레드가 하나인 싱글 스레드 모델을 채택합니다. 이는 각 요청마다 새로운 스레드를 생성하는 전통적인 멀티 스레드 서버와는 다른 접근 방식입니다.

```javascript
// Node.js 서버 예시
const http = require('http');

const server = http.createServer((req, res) => {
  // 모든 요청이 같은 메인 스레드에서 처리됨
  console.log(`Thread ID: ${process.pid}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
```

싱글 스레드 모델의 장점은 메모리 사용량이 적고, 컨텍스트 스위칭 오버헤드가 없으며, 데드락과 같은 멀티 스레딩 문제를 피할 수 있다는 점입니다. 하지만 CPU 집약적인 작업에서는 병목이 발생할 수 있습니다.

### 2. 이벤트 기반 구조

Node.js는 이벤트 루프(Event Loop)를 중심으로 한 이벤트 기반 아키텍처를 사용합니다. 특정 이벤트가 발생하면 해당 이벤트에 등록된 콜백 함수가 실행되는 방식입니다.

```javascript
const fs = require('fs');

// 이벤트 기반 파일 읽기
fs.readFile('large-file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('파일 읽기 실패:', err);
    return;
  }
  console.log('파일 읽기 완료');
  // 이 콜백은 파일 읽기가 완료된 후 이벤트 루프에서 실행됨
});

console.log('이 메시지가 먼저 출력됩니다');
```

이벤트 루프는 Call Stack, Callback Queue, Event Queue를 관리하며, 비동기 작업의 완료를 감지하고 적절한 시점에 콜백을 실행합니다.

### 3. 논 블로킹 I/O 모델

Node.js의 가장 중요한 특징 중 하나는 논 블로킹(Non-blocking) I/O 모델입니다. I/O 작업이 완료될 때까지 기다리지 않고 다른 작업을 계속 처리할 수 있습니다.

```javascript
const fs = require('fs');

console.log('1. 시작');

// 논 블로킹 I/O 작업
fs.readFile('file1.txt', (err, data1) => {
  console.log('3. file1 읽기 완료');
});

fs.readFile('file2.txt', (err, data2) => {
  console.log('4. file2 읽기 완료');
});

console.log('2. 파일 읽기 작업 시작됨');

// 출력 순서: 1 -> 2 -> 3 또는 4 -> 4 또는 3
```

이 모델은 데이터베이스 쿼리, 파일 시스템 접근, 네트워크 요청 등의 I/O 집약적인 작업에서 뛰어난 성능을 발휘합니다.

### 4. 적합한 사용 사례와 한계

Node.js는 특정 유형의 애플리케이션에 매우 적합하지만, 모든 상황에 최적은 아닙니다.

```javascript
// 적합한 사례: I/O 집약적 작업
const express = require('express');
const app = express();

app.get('/api/users', async (req, res) => {
  try {
    // 데이터베이스 쿼리 (논 블로킹)
    const users = await db.query('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 부적합한 사례: CPU 집약적 작업
app.get('/calculate', (req, res) => {
  let result = 0;
  // 이런 작업은 메인 스레드를 블로킹함
  for (let i = 0; i < 10000000000; i++) {
    result += Math.sqrt(i);
  }
  res.json({ result });
});
```

CPU 집약적인 작업의 경우 Worker Threads나 Child Process를 사용하여 해결할 수 있습니다.

## 정리

| 특징 | 설명 | 장점 | 단점 |
|------|------|------|------|
| **싱글 스레드** | 메인 실행 스레드 하나로 동작 | 메모리 효율성, 컨텍스트 스위칭 없음 | CPU 집약적 작업에 부적합 |
| **이벤트 기반** | 이벤트 루프로 비동기 작업 관리 | 높은 동시성, 확장성 | 콜백 헬 가능성 |
| **논 블로킹 I/O** | I/O 작업 시 다른 작업 계속 처리 | I/O 집약적 작업에 최적화 | 디버깅 복잡성 증가 |

Node.js는 실시간 채팅, REST API, 스트리밍 서비스, 마이크로서비스 등 I/O 집약적이고 높은 동시성이 필요한 애플리케이션 개발에 이상적인 런타임 환경입니다.