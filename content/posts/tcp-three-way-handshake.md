---
title: "TCP 3-way Handshake: 신뢰성 있는 연결 수립 과정"
shortTitle: "TCP Handshake"
date: "2026-03-26"
tags: ["tcp", "network", "handshake", "connection", "protocol"]
category: "Infrastructure"
summary: "TCP 3-way handshake는 클라이언트와 서버 간 신뢰성 있는 연결을 수립하는 3단계 과정입니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/246"
references: ["https://tools.ietf.org/html/rfc793", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Connection_management_in_HTTP_1.x"]
---

## TCP 3-way Handshake란?

TCP 3-way handshake는 클라이언트와 서버가 신뢰성 있는 연결을 수립하기 위해 수행하는 3단계 과정입니다. TCP(Transmission Control Protocol)는 데이터 전송의 신뢰성을 보장해야 하므로, 데이터를 주고받기 전에 양측이 서로를 확인하고 준비 상태를 점검하는 절차가 필요합니다.

이 과정을 통해 클라이언트와 서버는 각자의 초기 시퀀스 번호(Initial Sequence Number)를 교환하고, 상대방이 데이터를 송수신할 준비가 되었는지 확인합니다. 3번의 패킷 교환이 성공적으로 완료되면 TCP 연결이 설정되어 안정적인 데이터 통신이 가능해집니다.

## 핵심 개념

### 1. 3단계 연결 수립 과정

**1단계: SYN (Synchronize)**
```
Client → Server: SYN packet
- 클라이언트 초기 시퀀스 번호: 100 (예시)
- SYN flag: 1
- ACK flag: 0
```

클라이언트가 서버에 연결 요청을 시작합니다. SYN 패킷에는 클라이언트의 초기 시퀀스 번호가 포함되어 있어, 이후 데이터 전송 시 순서를 관리하는 기준점이 됩니다.

**2단계: SYN-ACK (Synchronize-Acknowledge)**
```
Server → Client: SYN-ACK packet
- 서버 초기 시퀀스 번호: 200 (예시)
- ACK 번호: 101 (클라이언트 시퀀스 + 1)
- SYN flag: 1
- ACK flag: 1
```

서버가 클라이언트의 요청을 승인하고 자신의 초기 시퀀스 번호를 전달합니다. ACK 번호를 통해 클라이언트의 SYN을 정상적으로 받았음을 확인합니다.

**3단계: ACK (Acknowledge)**
```
Client → Server: ACK packet
- ACK 번호: 201 (서버 시퀀스 + 1)
- SYN flag: 0
- ACK flag: 1
```

클라이언트가 서버의 응답을 확인했음을 알리며, 이제 양방향 데이터 전송이 가능한 상태가 됩니다.

### 2. 시퀀스 번호의 역할

시퀀스 번호는 TCP 연결에서 데이터 순서를 보장하는 핵심 요소입니다:

```typescript
// TCP 연결 상태 관리 예시
interface TCPConnection {
  clientSeq: number;  // 클라이언트 시퀀스 번호
  serverSeq: number;  // 서버 시퀀스 번호
  state: 'SYN_SENT' | 'SYN_RECEIVED' | 'ESTABLISHED';
}

class TCPHandshake {
  private connection: TCPConnection;
  
  initializeConnection(clientSeq: number) {
    this.connection = {
      clientSeq,
      serverSeq: 0,
      state: 'SYN_SENT'
    };
  }
  
  acknowledgeConnection(serverSeq: number) {
    this.connection.serverSeq = serverSeq;
    this.connection.state = 'ESTABLISHED';
  }
}
```

### 3. 신뢰성 보장 메커니즘

3-way handshake가 필요한 이유는 다음과 같습니다:

**패킷 손실 감지**
- 각 단계에서 응답이 없으면 재전송
- 타임아웃 시간 초과 시 연결 실패 처리

**중복 연결 방지**
- 지연된 패킷으로 인한 중복 연결 설정 방지
- 시퀀스 번호를 통한 패킷 순서 확인

**양방향 통신 확인**
- 클라이언트 → 서버 경로 확인 (1, 2단계)
- 서버 → 클라이언트 경로 확인 (2, 3단계)

### 4. TCP vs UDP 비교

TCP handshake와 대조되는 UDP의 특성을 살펴보면:

```javascript
// TCP 연결 기반 통신 (예: HTTP 요청)
const makeHTTPRequest = async (url) => {
  // 1. TCP handshake 수행 (브라우저가 자동 처리)
  // 2. HTTP 요청 전송
  // 3. 응답 수신 후 연결 유지 또는 종료
  return fetch(url);
};

// UDP 비연결 통신 (예: DNS 조회)
const makeDNSQuery = (domain) => {
  // handshake 없이 바로 패킷 전송
  // 빠르지만 신뢰성 보장 없음
};
```

**TCP 특징:**
- 연결 설정 과정 필요
- 데이터 순서 보장
- 에러 검출 및 재전송
- HTTP, HTTPS, FTP 등에서 사용

**UDP 특징:**
- 연결 설정 과정 없음
- 빠른 전송 속도
- 실시간 스트리밍, 온라인 게임에 적합

## 정리

| 구분 | 내용 |
|------|------|
| **목적** | 클라이언트-서버 간 신뢰성 있는 연결 수립 |
| **단계** | SYN → SYN-ACK → ACK (3단계) |
| **핵심 요소** | 시퀀스 번호 교환, 연결 상태 확인 |
| **보장 사항** | 양방향 통신 가능, 데이터 순서 관리, 패킷 손실 감지 |
| **사용 사례** | HTTP/HTTPS 연결, 웹 소켓, 데이터베이스 연결 |

TCP 3-way handshake는 웹 애플리케이션에서 HTTP 요청을 보낼 때마다 내부적으로 수행되는 과정입니다. 브라우저가 자동으로 처리하지만, 이 과정을 이해하면 네트워크 지연 최적화나 연결 풀 관리 등의 성능 개선 방법을 더 잘 활용할 수 있습니다.