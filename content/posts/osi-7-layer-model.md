---
title: "OSI 7계층 모델: 네트워크 통신의 표준 구조"
shortTitle: "OSI 7계층"
date: "2026-03-29"
tags: ["osi-model", "network-protocol", "web-communication", "system-design"]
category: "Infrastructure"
summary: "네트워크 통신을 7개 계층으로 나누어 정의한 OSI 모델의 각 계층 역할과 동작 방식을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/253"
references: ["https://www.iso.org/ics/35.100/x/", "https://www.cloudflare.com/ko-kr/learning/ddos/glossary/open-systems-interconnection-model-osi/", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview"]
---

## OSI 7계층 모델이란?

OSI(Open Systems Interconnection) 7계층 모델은 국제표준화기구(ISO)에서 제시한 네트워크 통신 표준입니다. 복잡한 네트워크 통신 과정을 7개의 논리적 계층으로 나누어 각 계층의 역할과 책임을 명확히 정의했습니다.

각 계층은 독립적으로 동작하면서도 인접한 계층과만 상호작용합니다. 하위 계층은 상위 계층에게 서비스를 제공하고, 상위 계층은 하위 계층의 서비스를 이용하는 구조입니다. 이러한 계층화를 통해 네트워크 시스템의 복잡성을 관리하고, 표준화된 통신을 가능하게 합니다.

## 핵심 개념

### 1. 물리 계층 (Physical Layer)

물리 계층은 실제 데이터 전송을 담당하는 최하위 계층입니다. 디지털 데이터를 전기 신호, 광 신호, 무선 신호로 변환하여 물리적 매체를 통해 전송합니다.

```javascript
// 물리 계층에서 데이터는 비트 스트림으로 표현됩니다
const digitalData = "Hello";
const bitStream = digitalData.split('').map(char => 
  char.charCodeAt(0).toString(2).padStart(8, '0')
).join('');

console.log(bitStream); // "0100100001100101011011000110110001101111"
```

주요 구성 요소로는 케이블, 허브, 리피터, 안테나 등이 있습니다. 전송 속도, 전압 레벨, 핀 배치 등 물리적 특성을 정의합니다.

### 2. 데이터 링크 계층과 네트워크 계층

**데이터 링크 계층(Data Link Layer)**은 프레임 단위로 데이터를 관리하며, 오류 검출과 수정을 담당합니다. MAC 주소를 통해 동일 네트워크 내 장치들을 식별합니다.

```typescript
interface EthernetFrame {
  preamble: string;
  destinationMAC: string;
  sourceMAC: string;
  type: number;
  data: Uint8Array;
  fcs: number; // Frame Check Sequence
}

const frame: EthernetFrame = {
  preamble: "10101010",
  destinationMAC: "aa:bb:cc:dd:ee:ff",
  sourceMAC: "11:22:33:44:55:66", 
  type: 0x0800, // IPv4
  data: new Uint8Array([/* payload */]),
  fcs: 0xABCDEF12
};
```

**네트워크 계층(Network Layer)**은 서로 다른 네트워크 간 패킷 라우팅을 담당합니다. IP 주소를 통해 최적 경로를 찾아 데이터를 전달합니다.

### 3. 전송 계층과 세션 계층

**전송 계층(Transport Layer)**은 종단 간 신뢰성 있는 데이터 전송을 보장합니다. TCP는 연결 지향적이고 신뢰성을 제공하며, UDP는 비연결형으로 빠른 전송을 지원합니다.

```typescript
// TCP 연결 설정 (3-way handshake)
interface TCPHeader {
  sourcePort: number;
  destPort: number;
  sequenceNumber: number;
  acknowledgmentNumber: number;
  flags: {
    SYN: boolean;
    ACK: boolean;
    FIN: boolean;
  };
  windowSize: number;
}

const synPacket: TCPHeader = {
  sourcePort: 54321,
  destPort: 80,
  sequenceNumber: 1000,
  acknowledgmentNumber: 0,
  flags: { SYN: true, ACK: false, FIN: false },
  windowSize: 65535
};
```

**세션 계층(Session Layer)**은 애플리케이션 간 통신 세션을 관리합니다. 연결 설정, 유지, 종료와 동기화 지점을 제공합니다.

### 4. 표현 계층과 응용 계층

**표현 계층(Presentation Layer)**은 데이터 형식 변환, 암호화/복호화, 압축을 담당합니다. 서로 다른 시스템 간 데이터 표현 방식의 차이를 해결합니다.

```typescript
// 데이터 인코딩 및 암호화 예시
class PresentationLayer {
  static encodeData(data: string): string {
    return btoa(data); // Base64 인코딩
  }
  
  static compressData(data: string): string {
    // 압축 로직 (예: gzip)
    return data.replace(/(.)\1+/g, '$1');
  }
  
  static encryptData(data: string, key: string): string {
    // 간단한 XOR 암호화 예시
    return data.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join('');
  }
}
```

**응용 계층(Application Layer)**은 최종 사용자와 직접 상호작용하는 계층입니다. HTTP, SMTP, FTP 등의 프로토콜이 동작하며, 웹 브라우저나 이메일 클라이언트 같은 응용 프로그램이 이 계층에서 작동합니다.

```typescript
// HTTP 요청 예시 (응용 계층)
const httpRequest = {
  method: 'GET',
  url: 'https://api.example.com/users',
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0...',
    'Authorization': 'Bearer token123'
  },
  body: null
};
```

## 정리

| 계층 | 이름 | 주요 기능 | 대표 프로토콜/장치 |
|------|------|-----------|-------------------|
| 7 | 응용 계층 | 사용자 인터페이스 제공 | HTTP, SMTP, FTP |
| 6 | 표현 계층 | 데이터 변환, 암호화, 압축 | MIME, ASCII, SSL/TLS |
| 5 | 세션 계층 | 세션 관리, 동기화 | RPC, NetBIOS |
| 4 | 전송 계층 | 종단 간 신뢰성 보장 | TCP, UDP |
| 3 | 네트워크 계층 | 패킷 라우팅 | IP, ICMP, 라우터 |
| 2 | 데이터 링크 계층 | 프레임 관리, 오류 검출 | Ethernet, 스위치 |
| 1 | 물리 계층 | 물리적 데이터 전송 | 케이블, 허브, 리피터 |

OSI 7계층 모델은 네트워크 문제를 체계적으로 진단하고 해결하는 데 도움을 줍니다. 각 계층의 독립성으로 인해 특정 계층의 변경이 다른 계층에 미치는 영향을 최소화하며, 표준화된 통신 규약을 통해 서로 다른 시스템 간 상호 운용성을 보장합니다.