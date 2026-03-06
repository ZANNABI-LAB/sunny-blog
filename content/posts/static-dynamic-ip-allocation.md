---
title: "정적 IP와 동적 IP 할당 방식의 차이점과 DHCP 동작 원리"
shortTitle: "정적 동적 IP"
date: "2026-03-06"
tags: ["네트워크", "DHCP", "IP주소", "백엔드"]
category: "Infrastructure"
summary: "정적 IP와 동적 IP 할당 방식의 특징과 DHCP 프로토콜의 4단계 동작 과정을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/176"
---

## IP 주소 할당 방식이란?

네트워크에서 각 호스트가 통신하기 위해서는 고유한 IP 주소가 필요합니다. 이러한 IP 주소를 할당하는 방식은 크게 정적(Static) 할당과 동적(Dynamic) 할당으로 구분됩니다.

정적 할당은 관리자가 직접 각 호스트에 고정된 IP 주소를 설정하는 방식이며, 동적 할당은 DHCP 서버가 자동으로 IP 주소를 임대해주는 방식입니다. 각 방식은 고유한 특징과 장단점을 가지고 있어 네트워크 환경에 따라 적절히 선택해야 합니다.

## 핵심 개념

### 1. 정적 IP 할당 방식

정적 IP 할당은 네트워크 관리자가 수동으로 각 호스트에 고정된 IP 주소를 설정하는 방식입니다. 다음 정보들을 직접 입력해야 합니다:

- **IP 주소**: 호스트의 고유 식별자
- **서브넷 마스크**: 네트워크 범위 정의
- **게이트웨이**: 외부 네트워크 연결 지점
- **DNS 서버**: 도메인 이름 해석 서버

```bash
# Linux에서 정적 IP 설정 예시
sudo ip addr add 192.168.1.100/24 dev eth0
sudo ip route add default via 192.168.1.1
```

정적 할당의 장점은 IP 주소가 변경되지 않아 서버나 네트워크 장비에 적합하다는 것입니다. 하지만 호스트 수가 많아지면 관리가 복잡해지고 IP 중복 등의 실수가 발생할 수 있습니다.

### 2. 동적 IP 할당 방식 (DHCP)

동적 할당은 DHCP(Dynamic Host Configuration Protocol) 서버가 자동으로 IP 주소를 임대해주는 방식입니다. 클라이언트가 네트워크에 연결되면 DHCP 서버가 사용 가능한 IP 주소를 찾아 임대합니다.

DHCP의 주요 특징:
- **자동화**: 수동 설정 불필요
- **임대 개념**: 일정 기간 동안만 IP 사용
- **IP 풀 관리**: 효율적인 IP 주소 재사용
- **중앙 집중 관리**: 하나의 서버에서 전체 네트워크 관리

```yaml
# DHCP 서버 설정 예시 (dhcpd.conf)
subnet 192.168.1.0 netmask 255.255.255.0 {
  range 192.168.1.100 192.168.1.200;
  option routers 192.168.1.1;
  option domain-name-servers 8.8.8.8, 8.8.4.4;
  default-lease-time 86400;
}
```

### 3. DHCP 4단계 프로세스

DHCP를 통한 IP 할당은 다음 4단계로 진행됩니다:

**1. Discover (발견)**
- 클라이언트가 DHCP 서버를 찾기 위해 브로드캐스트 메시지 전송
- 목적지 IP: 255.255.255.255 (브로드캐스트)

**2. Offer (제안)**
- DHCP 서버가 사용 가능한 IP 주소와 임대 조건을 클라이언트에 제안
- 임대 기간, 서브넷 마스크, 게이트웨이 등 정보 포함

**3. Request (요청)**
- 클라이언트가 제안받은 IP 주소 사용을 요청
- 여러 DHCP 서버가 있는 경우 하나를 선택

**4. Acknowledgment (승인)**
- DHCP 서버가 IP 임대를 최종 승인
- 클라이언트가 해당 IP 주소 사용 시작

```python
# DHCP 패킷 구조 예시 (Python)
class DHCPPacket:
    def __init__(self):
        self.op = 1  # 1: Request, 2: Reply
        self.htype = 1  # Hardware type (Ethernet)
        self.hlen = 6  # Hardware address length
        self.xid = 0  # Transaction ID
        self.your_ip = "0.0.0.0"  # Your IP address
        self.server_ip = "0.0.0.0"  # Server IP address
        self.gateway_ip = "0.0.0.0"  # Gateway IP address
        self.client_mac = "00:00:00:00:00:00"  # Client MAC
```

### 4. 임대 갱신과 관리

DHCP에서 할당된 IP 주소는 영구적이지 않습니다. 임대 기간이 절반 지나면 클라이언트는 자동으로 임대 갱신(DHCP Lease Renewal)을 시도합니다.

임대 갱신 과정:
- **50% 시점**: 원래 DHCP 서버에 갱신 요청
- **87.5% 시점**: 모든 DHCP 서버에 브로드캐스트 요청
- **100% 시점**: 새로운 DHCP 프로세스 시작

## 정리

| 구분 | 정적 IP | 동적 IP (DHCP) |
|------|---------|----------------|
| **설정 방식** | 수동 설정 | 자동 할당 |
| **IP 변경** | 고정 | 변동 가능 |
| **관리 복잡도** | 높음 | 낮음 |
| **적용 환경** | 서버, 네트워크 장비 | 일반 사용자 PC |
| **IP 효율성** | 낮음 | 높음 |
| **장애 위험** | IP 중복 위험 | 서버 의존성 |

정적 IP는 안정성과 예측 가능성이 중요한 서버 환경에 적합하며, 동적 IP는 대규모 사용자 네트워크에서 효율적인 IP 관리가 가능합니다. 현대 네트워크에서는 두 방식을 혼합하여 서버는 정적 IP로, 클라이언트는 DHCP로 관리하는 것이 일반적입니다.