---
title: "네트워크 회선 교환과 패킷 교환 방식의 차이"
shortTitle: "회선교환 패킷교환"
date: "2026-03-17"
tags: ["network", "circuit-switching", "packet-switching", "network-protocols"]
category: "Infrastructure"
summary: "네트워크에서 데이터를 전송하는 두 가지 핵심 방식인 회선 교환과 패킷 교환의 동작 원리와 특징을 비교합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/217"
references: ["https://www.ietf.org/rfc/rfc791.txt", "https://tools.ietf.org/html/rfc3439", "https://www.cisco.com/c/en/us/support/docs/wan/point-to-point-protocol-ppp/25647-understanding-ppp-chap.html"]
---

## 네트워크 교환 방식이란?

네트워크에서 데이터를 전송하는 방식은 크게 회선 교환(Circuit Switching)과 패킷 교환(Packet Switching)으로 구분됩니다. 이 두 방식은 네트워크 자원을 사용하는 방법과 데이터 전송 과정에서 근본적인 차이를 보입니다.

회선 교환은 전통적인 전화망에서 사용되는 방식으로, 통신 시작 전에 송신자와 수신자 간의 전용 경로를 미리 설정합니다. 반면 패킷 교환은 현재 인터넷의 핵심이 되는 방식으로, 데이터를 작은 패킷으로 나누어 독립적으로 전송합니다.

## 핵심 개념

### 1. 회선 교환(Circuit Switching)의 특징

회선 교환 방식은 통신 전에 송신자와 수신자 간의 물리적 또는 논리적 경로를 미리 설정하고, 이 경로를 통해서만 데이터를 전송합니다.

```typescript
// 회선 교환 방식의 개념적 모델
interface CircuitConnection {
  sourceId: string;
  destinationId: string;
  dedicatedPath: string[];
  bandwidth: number;
  connectionTime: Date;
}

class CircuitSwitching {
  private connections = new Map<string, CircuitConnection>();
  
  establishConnection(source: string, destination: string): boolean {
    // 전용 경로 설정
    const path = this.findDedicatedPath(source, destination);
    if (!path) return false;
    
    const connection: CircuitConnection = {
      sourceId: source,
      destinationId: destination,
      dedicatedPath: path,
      bandwidth: this.allocateBandwidth(),
      connectionTime: new Date()
    };
    
    this.connections.set(`${source}-${destination}`, connection);
    return true;
  }
  
  transmitData(connectionId: string, data: any[]): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // 설정된 전용 경로로만 전송
      this.sendViaPath(connection.dedicatedPath, data);
    }
  }
}
```

회선 교환의 주요 장점은 일정한 대역폭 보장과 예측 가능한 전송 지연입니다. 하지만 연결이 유지되는 동안 네트워크 자원이 독점적으로 사용되어 효율성이 떨어집니다.

### 2. 패킷 교환(Packet Switching)의 동작 원리

패킷 교환 방식은 데이터를 패킷이라는 작은 단위로 분할하고, 각 패킷을 독립적으로 목적지까지 전송합니다. 패킷은 헤더 정보를 포함하여 라우터가 최적 경로를 선택할 수 있도록 합니다.

```typescript
interface PacketHeader {
  sourceAddress: string;
  destinationAddress: string;
  sequenceNumber: number;
  totalPackets: number;
  protocol: string;
  timestamp: Date;
}

interface Packet {
  header: PacketHeader;
  payload: any;
  checksum: string;
}

class PacketSwitching {
  fragmentMessage(message: any[], source: string, destination: string): Packet[] {
    const packets: Packet[] = [];
    
    message.forEach((chunk, index) => {
      const packet: Packet = {
        header: {
          sourceAddress: source,
          destinationAddress: destination,
          sequenceNumber: index,
          totalPackets: message.length,
          protocol: 'TCP',
          timestamp: new Date()
        },
        payload: chunk,
        checksum: this.calculateChecksum(chunk)
      };
      
      packets.push(packet);
    });
    
    return packets;
  }
  
  routePacket(packet: Packet): string[] {
    // 각 패킷마다 최적 경로 선택
    return this.findOptimalPath(
      packet.header.sourceAddress, 
      packet.header.destinationAddress
    );
  }
}
```

패킷 교환은 네트워크 자원을 효율적으로 사용하고 장애에 대한 복원력이 뛰어납니다. 하지만 패킷 헤더로 인한 오버헤드와 라우팅 지연이 발생할 수 있습니다.

### 3. 성능 및 효율성 비교

두 방식의 핵심적인 차이점은 네트워크 자원 활용도와 전송 특성에서 나타납니다.

```typescript
interface NetworkMetrics {
  bandwidth: number;
  latency: number;
  jitter: number;
  packetLoss: number;
  resourceUtilization: number;
}

class NetworkComparison {
  compareEfficiency(dataSize: number, connectionTime: number): {
    circuit: NetworkMetrics;
    packet: NetworkMetrics;
  } {
    const circuitMetrics: NetworkMetrics = {
      bandwidth: 1000, // 고정 대역폭
      latency: 10, // 일정한 지연
      jitter: 0, // 지터 없음
      packetLoss: 0, // 손실 없음
      resourceUtilization: connectionTime > 0 ? 30 : 0 // 연결 시간에 따라
    };
    
    const packetMetrics: NetworkMetrics = {
      bandwidth: 800, // 가변 대역폭
      latency: 15, // 라우팅 지연 포함
      jitter: 5, // 경로 변경으로 인한 지터
      packetLoss: 0.1, // 소량의 패킷 손실
      resourceUtilization: 85 // 높은 자원 활용도
    };
    
    return { circuit: circuitMetrics, packet: packetMetrics };
  }
}
```

### 4. 실제 네트워크에서의 적용 사례

회선 교환은 음성 통화나 실시간 스트리밍처럼 일정한 품질이 중요한 서비스에 적합합니다. 패킷 교환은 웹 브라우징, 이메일, 파일 전송 등 효율성이 중요한 데이터 통신에 최적화되어 있습니다.

```typescript
enum ServiceType {
  VOICE_CALL = 'voice',
  VIDEO_STREAMING = 'video',
  WEB_BROWSING = 'web',
  FILE_TRANSFER = 'file'
}

class NetworkServiceOptimizer {
  selectOptimalMethod(serviceType: ServiceType, requirements: {
    realTime: boolean;
    bandwidthSensitive: boolean;
    costSensitive: boolean;
  }): 'circuit' | 'packet' {
    
    if (requirements.realTime && requirements.bandwidthSensitive) {
      return 'circuit'; // VOICE_CALL, VIDEO_STREAMING
    }
    
    if (requirements.costSensitive && !requirements.realTime) {
      return 'packet'; // WEB_BROWSING, FILE_TRANSFER
    }
    
    return 'packet'; // 기본적으로 패킷 교환 선택
  }
}
```

## 정리

| 구분 | 회선 교환 | 패킷 교환 |
|------|-----------|-----------|
| **경로 설정** | 사전 설정된 전용 경로 | 패킷별 동적 경로 선택 |
| **자원 활용** | 낮음 (전용 할당) | 높음 (공유 사용) |
| **전송 지연** | 일정함 | 가변적 (라우팅 지연) |
| **오버헤드** | 낮음 | 높음 (패킷 헤더) |
| **장애 복원력** | 낮음 | 높음 |
| **적용 사례** | 음성 통화, 전용선 | 인터넷, 데이터 통신 |

현대 네트워크는 대부분 패킷 교환 방식을 기반으로 하되, 실시간 서비스를 위해 QoS(Quality of Service) 기술을 통해 회선 교환의 장점을 부분적으로 구현하는 하이브리드 접근법을 사용합니다.