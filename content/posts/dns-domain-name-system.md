---
title: "DNS(Domain Name System)란 무엇인가요?"
shortTitle: "DNS 시스템"
date: "2026-03-11"
tags: ["dns", "domain-name", "network", "infrastructure"]
category: "Infrastructure"
summary: "도메인 이름을 IP 주소로 변환하는 DNS 시스템의 동작 원리와 질의 과정을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/201"
references: ["https://www.cloudflare.com/learning/dns/what-is-dns/", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview", "https://tools.ietf.org/html/rfc1035"]
---

## DNS란?

DNS(Domain Name System)는 도메인 이름을 IP 주소로 변환하는 분산 데이터베이스 시스템입니다. 우리가 브라우저에서 `google.com`을 입력하면, DNS가 이를 `172.217.175.14`와 같은 IP 주소로 변환하여 실제 서버에 연결할 수 있게 도와줍니다.

IP 주소는 숫자로만 구성되어 있어 기억하기 어렵고, 서버 이전 시 IP 주소가 변경될 수 있습니다. DNS는 이러한 문제를 해결하기 위해 도메인 이름과 IP 주소 간의 매핑을 관리하는 전 세계적인 시스템으로 작동합니다.

## 핵심 개념

### 1. DNS 서버 계층 구조

DNS는 계층적으로 구성된 네임 서버들로 이루어져 있습니다:

```
Root Name Server (.)
    ↓
TLD Name Server (.com, .kr, .org)
    ↓
Authoritative Name Server (example.com)
    ↓
Local Name Server (ISP DNS, 8.8.8.8)
```

각 계층은 특정 도메인 범위에 대한 책임을 가지며, 상위 계층은 하위 계층의 위치 정보를 알고 있습니다.

### 2. 주요 DNS 서버 유형

**로컬 네임 서버(Local Name Server)**는 클라이언트와 가장 가까운 DNS 서버로, 통신사나 구글 DNS(8.8.8.8)가 대표적입니다. 캐싱을 통해 성능을 향상시킵니다.

**루트 네임 서버(Root Name Server)**는 DNS 계층의 최상위에 위치하며, 전 세계에 13개의 논리적 루트 서버가 있습니다. TLD 네임 서버의 주소를 알고 있습니다.

**TLD 네임 서버(Top-Level Domain Server)**는 `.com`, `.kr`, `.org` 등의 최상위 도메인을 관리합니다.

**권한 네임 서버(Authoritative Name Server)**는 특정 도메인의 실제 DNS 레코드를 저장하고 관리하는 서버입니다.

### 3. DNS 질의 과정

`api.example.com`의 IP 주소를 찾는 과정을 예시로 살펴보겠습니다:

```javascript
// DNS 질의 과정 시뮬레이션
async function resolveDNS(domain) {
  // 1. 로컬 캐시 확인
  let cachedIP = checkLocalCache(domain);
  if (cachedIP) return cachedIP;
  
  // 2. 로컬 네임 서버에 질의
  let localResponse = await queryLocalNameServer(domain);
  if (localResponse.hasAnswer) return localResponse.ip;
  
  // 3. 루트 네임 서버에 질의
  let rootResponse = await queryRootServer(domain);
  let tldServer = rootResponse.tldServerIP;
  
  // 4. TLD 네임 서버에 질의
  let tldResponse = await queryTLDServer(domain, tldServer);
  let authServer = tldResponse.authoritativeServerIP;
  
  // 5. 권한 네임 서버에서 최종 IP 주소 획득
  let finalResponse = await queryAuthoritativeServer(domain, authServer);
  
  return finalResponse.ip;
}
```

### 4. DNS 레코드 타입

DNS는 다양한 레코드 타입을 지원합니다:

```bash
# A 레코드 - 도메인을 IPv4 주소로 매핑
example.com.    IN    A    192.168.1.1

# AAAA 레코드 - 도메인을 IPv6 주소로 매핑
example.com.    IN    AAAA    2001:db8::1

# CNAME 레코드 - 도메인 별칭
www.example.com.    IN    CNAME    example.com.

# MX 레코드 - 메일 서버 지정
example.com.    IN    MX    10 mail.example.com.

# NS 레코드 - 네임 서버 지정
example.com.    IN    NS    ns1.example.com.
```

## 정리

| 구분 | 설명 | 역할 |
|------|------|------|
| **DNS 시스템** | 도메인을 IP 주소로 변환하는 분산 시스템 | 인터넷 주소 체계의 핵심 인프라 |
| **계층 구조** | Root → TLD → Authoritative → Local | 효율적인 분산 관리와 확장성 |
| **질의 과정** | 재귀적 또는 반복적 질의를 통한 IP 주소 해결 | 캐싱을 통한 성능 최적화 |
| **레코드 타입** | A, AAAA, CNAME, MX, NS 등 다양한 매핑 지원 | 유연한 도메인 관리와 서비스 구성 |

DNS는 인터넷의 전화번호부 역할을 하며, 웹 서비스의 가용성과 성능에 직접적인 영향을 미치는 핵심 인프라입니다. 적절한 DNS 설정과 관리는 안정적인 서비스 운영의 필수 요소입니다.