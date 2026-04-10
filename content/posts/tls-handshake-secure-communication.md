---
title: "TLS 핸드셰이크: 안전한 웹 통신의 시작"
shortTitle: "TLS 핸드셰이크"
date: "2026-04-10"
tags: ["tls", "https", "web-security", "cryptography", "browser"]
category: "Security"
summary: "브라우저와 서버가 암호화된 HTTPS 통신을 시작하기 전 안전한 연결을 설정하는 TLS 핸드셰이크 과정을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/288"
references: ["https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security", "https://tools.ietf.org/html/rfc8446", "https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/"]
---

## TLS 핸드셰이크란?

TLS(Transport Layer Security) 핸드셰이크는 브라우저와 서버가 HTTPS 통신을 시작하기 전 안전한 연결을 설정하는 과정입니다. 이 과정에서 서로의 신원을 확인하고, 데이터 암호화에 사용할 키를 교환하여 도청이나 중간자 공격으로부터 통신을 보호합니다.

일반적으로 사용자가 `https://example.com`을 브라우저에 입력하면, 실제 웹페이지 데이터를 주고받기 전에 TLS 핸드셰이크가 먼저 수행됩니다. 이 과정은 보통 100-200ms 정도 소요되며, 한 번 완료되면 해당 세션 동안 암호화된 통신이 가능해집니다.

## 핵심 개념

### 1. Client Hello - 연결 요청

브라우저는 서버에 연결을 요청하며 다음 정보를 전송합니다.

```typescript
interface ClientHello {
  tlsVersion: string;           // 지원하는 TLS 버전 (예: TLS 1.3)
  cipherSuites: string[];       // 지원하는 암호화 알고리즘 목록
  sessionId?: string;           // 기존 세션 재사용을 위한 ID
  clientRandom: ArrayBuffer;    // 32바이트 난수
  extensions: Extension[];      // SNI, ALPN 등 확장 기능
}

// 브라우저가 보내는 정보 예시
const clientHello = {
  tlsVersion: "TLS 1.3",
  cipherSuites: [
    "TLS_AES_256_GCM_SHA384",
    "TLS_AES_128_GCM_SHA256",
    "TLS_CHACHA20_POLY1305_SHA256"
  ],
  clientRandom: new Uint8Array(32).map(() => Math.floor(Math.random() * 256)),
  extensions: [
    { type: "server_name", value: "example.com" },
    { type: "application_layer_protocol_negotiation", value: ["h2", "http/1.1"] }
  ]
};
```

### 2. Server Hello - 서버 응답

서버는 클라이언트의 요청을 검토하고 다음과 같이 응답합니다.

```typescript
interface ServerHello {
  selectedTlsVersion: string;
  selectedCipherSuite: string;
  serverRandom: ArrayBuffer;
  sessionId: string;
  certificate: X509Certificate;
  extensions: Extension[];
}

// 서버 응답 예시
const serverHello = {
  selectedTlsVersion: "TLS 1.3",
  selectedCipherSuite: "TLS_AES_256_GCM_SHA384",
  serverRandom: new Uint8Array(32).map(() => Math.floor(Math.random() * 256)),
  certificate: {
    subject: "CN=example.com",
    issuer: "CN=Let's Encrypt Authority X3",
    publicKey: "-----BEGIN PUBLIC KEY-----...",
    validFrom: "2024-01-01",
    validTo: "2024-12-31"
  }
};
```

### 3. 인증서 검증과 키 교환

브라우저는 서버의 디지털 인증서를 검증하고 암호화 키를 생성합니다.

```typescript
// 인증서 검증 과정
async function verifyCertificate(certificate: X509Certificate): Promise<boolean> {
  // 1. 인증서 유효기간 확인
  const now = new Date();
  if (now < certificate.validFrom || now > certificate.validTo) {
    return false;
  }
  
  // 2. CA(Certificate Authority) 서명 검증
  const isSignatureValid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    certificate.issuerPublicKey,
    certificate.signature,
    certificate.tbsCertificate
  );
  
  // 3. 도메인 이름 일치 확인
  const isHostnameValid = certificate.subject.includes(location.hostname);
  
  return isSignatureValid && isHostnameValid;
}

// Pre-Master Secret 생성 및 전송
async function generatePreMasterSecret(serverPublicKey: CryptoKey): Promise<ArrayBuffer> {
  // 48바이트 랜덤 값 생성
  const preMasterSecret = crypto.getRandomValues(new Uint8Array(48));
  
  // 서버 공개키로 암호화
  const encryptedSecret = await crypto.subtle.encrypt(
    "RSA-OAEP",
    serverPublicKey,
    preMasterSecret
  );
  
  return encryptedSecret;
}
```

### 4. 대칭키 생성과 통신 시작

양측이 동일한 대칭키를 생성하여 실제 데이터 암호화에 사용합니다.

```typescript
// Master Secret 생성 (PRF: Pseudo-Random Function 사용)
async function generateMasterSecret(
  preMasterSecret: ArrayBuffer,
  clientRandom: ArrayBuffer,
  serverRandom: ArrayBuffer
): Promise<ArrayBuffer> {
  const seed = new Uint8Array([...clientRandom, ...serverRandom]);
  
  // HMAC-SHA256을 사용한 키 확장
  const masterSecret = await crypto.subtle.importKey(
    "raw",
    preMasterSecret,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  return crypto.subtle.sign("HMAC", masterSecret, seed);
}

// 세션 키 생성
async function generateSessionKeys(
  masterSecret: ArrayBuffer,
  clientRandom: ArrayBuffer,
  serverRandom: ArrayBuffer
): Promise<{
  clientWriteKey: CryptoKey;
  serverWriteKey: CryptoKey;
  clientWriteIV: ArrayBuffer;
  serverWriteIV: ArrayBuffer;
}> {
  const keyMaterial = await expandKey(masterSecret, clientRandom, serverRandom, 128);
  
  return {
    clientWriteKey: await crypto.subtle.importKey("raw", keyMaterial.slice(0, 32), "AES-GCM", false, ["encrypt"]),
    serverWriteKey: await crypto.subtle.importKey("raw", keyMaterial.slice(32, 64), "AES-GCM", false, ["decrypt"]),
    clientWriteIV: keyMaterial.slice(64, 80),
    serverWriteIV: keyMaterial.slice(80, 96)
  };
}
```

## 정리

| 단계 | 주요 작업 | 목적 |
|------|----------|------|
| **Client Hello** | TLS 버전, 암호화 알고리즘, 클라이언트 난수 전송 | 지원 기능 협상 시작 |
| **Server Hello** | 선택된 암호화 방식, 서버 난수, 인증서 전송 | 서버 신원 증명 및 설정 확정 |
| **Certificate Verify** | CA 서명 검증, 도메인 확인 | 서버 신뢰성 검증 |
| **Key Exchange** | Pre-Master Secret 암호화 전송 | 안전한 키 교환 |
| **Session Key Generation** | 공유된 값들로 대칭키 생성 | 실제 통신 암호화 준비 |
| **Finished** | 암호화된 핸드셰이크 완료 메시지 교환 | 연결 성공 확인 |

TLS 핸드셰이크가 완료되면 브라우저와 서버는 생성된 대칭키로 모든 HTTP 데이터를 암호화하여 주고받습니다. 이를 통해 사용자의 민감한 정보가 네트워크상에서 안전하게 보호됩니다.