---
title: "HTTP와 TCP Keep Alive 이해하기"
shortTitle: "Keep Alive"
date: "2026-03-22"
tags: ["keep-alive", "http", "tcp", "network-optimization", "connection-pooling"]
category: "Backend"
summary: "네트워크 성능 최적화를 위한 Keep Alive 메커니즘을 HTTP와 TCP 차원에서 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/232"
references: ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Keep-Alive", "https://tools.ietf.org/html/rfc2616#section-8.1", "https://man7.org/linux/man-pages/man7/socket.7.html"]
---

## Keep Alive란?

Keep Alive는 네트워크 연결을 지속적으로 유지하여 커넥션 재사용을 가능하게 하는 메커니즘입니다. 전통적인 요청-응답 모델에서는 각 요청마다 새로운 연결을 생성하고 종료했지만, Keep Alive를 사용하면 하나의 연결로 여러 요청을 처리할 수 있습니다.

이 기능은 HTTP와 TCP 두 계층에서 각각 다른 방식으로 구현되며, 네트워크 성능 최적화에 중요한 역할을 합니다. 특히 웹 애플리케이션에서 다수의 리소스를 로드하거나, API 서버와의 빈번한 통신이 필요한 환경에서 그 효과가 두드러집니다.

## 핵심 개념

### 1. HTTP Keep-Alive 메커니즘

HTTP Keep-Alive는 애플리케이션 계층에서 연결 재사용을 관리하는 기능입니다.

```javascript
// Express.js에서 Keep-Alive 설정
const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=30, max=100');
  next();
});

// Node.js HTTP 클라이언트에서 Keep-Alive 사용
const http = require('http');
const keepAliveAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50
});

const options = {
  hostname: 'api.example.com',
  port: 80,
  path: '/data',
  agent: keepAliveAgent
};
```

HTTP/1.1부터는 Keep-Alive가 기본적으로 활성화되어 있으며, 클라이언트와 서버는 `Connection: keep-alive` 헤더를 통해 연결 지속 의사를 표현합니다.

### 2. TCP Keep-Alive 메커니즘

TCP Keep-Alive는 전송 계층에서 연결 상태를 확인하는 기능입니다.

```python
import socket

# Python에서 TCP Keep-Alive 설정
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Keep-Alive 활성화
sock.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)

# Keep-Alive 파라미터 설정 (Linux)
sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPIDLE, 600)   # 10분 유휴 후 시작
sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPINTVL, 60)   # 60초 간격으로 프로브
sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPCNT, 3)      # 3회 실패 시 연결 종료
```

TCP Keep-Alive는 유휴 연결에서 주기적으로 프로브 패킷을 전송하여 상대방의 응답을 확인합니다.

### 3. 성능상 장단점 분석

**장점:**
- **연결 오버헤드 감소**: TCP 3-way handshake 반복을 피하여 RTT 절약
- **리소스 효율성**: CPU와 메모리 사용량 감소
- **처리량 향상**: 연속적인 요청 처리 시 전체 성능 개선

```typescript
// 성능 비교 예시
interface ConnectionMetrics {
  withKeepAlive: {
    connections: 1;
    handshakes: 1;
    totalTime: number; // 요청 시간만
  };
  withoutKeepAlive: {
    connections: 100;
    handshakes: 100;
    totalTime: number; // 요청 시간 + (핸드셰이크 시간 × 100)
  };
}
```

**단점:**
- **리소스 점유**: 유휴 연결이 소켓과 메모리를 계속 사용
- **보안 취약점**: 연결 유지를 이용한 DoS 공격 가능성
- **타임아웃 관리**: 부적절한 설정 시 리소스 낭비

### 4. 실무 적용 고려사항

적절한 타임아웃 설정이 중요합니다:

```nginx
# Nginx 설정 예시
http {
    keepalive_timeout 65s;
    keepalive_requests 1000;
    
    upstream backend {
        server backend1.example.com;
        keepalive 32;  # 연결 풀 크기
    }
}
```

로드 밸런서와 프록시 환경에서는 Keep-Alive 설정이 체인을 따라 적절히 구성되어야 합니다.

## 정리

| 구분 | HTTP Keep-Alive | TCP Keep-Alive |
|------|-----------------|----------------|
| **계층** | 애플리케이션 계층 | 전송 계층 |
| **목적** | 연결 재사용으로 성능 최적화 | 연결 상태 확인 및 유지 |
| **동작** | 타임아웃 기반 연결 유지 | 주기적 프로브 패킷 전송 |
| **제어** | 헤더를 통한 협상 | 소켓 옵션 설정 |

Keep Alive는 네트워크 성능 최적화의 핵심 기술이지만, 서버 리소스와 보안을 고려한 적절한 설정이 필요합니다. 특히 고트래픽 환경에서는 연결 풀 크기, 타임아웃 값, 최대 요청 수 등을 신중히 조정해야 합니다.