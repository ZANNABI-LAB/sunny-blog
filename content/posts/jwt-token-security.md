---
title: "JWT 토큰의 특징과 보안 주의사항"
shortTitle: "JWT 보안"
date: "2026-03-06"
tags: ["JWT", "인증", "보안", "토큰"]
category: "설명해주세요.백엔드"
summary: "JWT의 핵심 특징과 실무에서 반드시 고려해야 할 보안 주의사항을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/174"
---

## JWT란?

JWT(JSON Web Token)는 당사자 간에 정보를 JSON 객체로 안전하게 전송하기 위한 컴팩트하고 독립적인 방법입니다. 토큰 자체에 사용자 정보가 포함된 클레임 기반 토큰으로, 웹 애플리케이션에서 인증과 인가를 구현할 때 널리 사용됩니다.

JWT는 Header.Payload.Signature 형태로 점(.)으로 구분된 세 부분으로 구성됩니다. 각 부분은 Base64URL로 인코딩되어 있으며, 서버는 비밀키를 사용해 토큰의 무결성을 검증할 수 있습니다.

세션 기반 인증과 달리 JWT는 상태를 저장하지 않는(Stateless) 특성을 가지므로, 분산 환경에서 확장성과 일관성 측면에서 장점을 제공합니다.

## 핵심 개념

### 1. JWT 구조와 동작 원리

JWT는 세 개의 구성 요소로 나뉩니다:

```javascript
// JWT 구조 예시
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
              "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ." +
              "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// Header (알고리즘과 토큰 타입)
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload (클레임 정보)
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516242622
}
```

Header는 토큰의 암호화 알고리즘과 타입을 명시하고, Payload는 사용자 정보와 만료 시간 등의 클레임을 포함합니다. Signature는 Header와 Payload가 변조되지 않았음을 보장하는 역할을 합니다.

### 2. JWT의 주요 장점

JWT의 클레임 기반 특성은 여러 이점을 제공합니다:

```typescript
// JWT 기반 인증 미들웨어 예시
import jwt from 'jsonwebtoken';

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    // 토큰에서 직접 사용자 정보 추출 (DB 조회 불필요)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};
```

세션 기반 인증과 달리 별도의 데이터베이스 조회 없이 토큰에서 직접 사용자 정보를 추출할 수 있습니다. 또한 서버가 상태를 관리하지 않아 로드 밸런서 환경에서 세션 불일치 문제가 발생하지 않습니다.

### 3. 보안 취약점과 대응 방안

JWT 사용 시 반드시 고려해야 할 보안 취약점들이 있습니다:

```typescript
// 안전하지 않은 예시 (민감한 정보 포함)
const unsafePayload = {
  userId: 123,
  email: "user@example.com",
  creditCard: "1234-5678-9012-3456", // 위험: 민감한 정보
  role: "admin"
};

// 안전한 예시
const safePayload = {
  sub: "123",
  role: "admin",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600 // 1시간 후 만료
};

// 강력한 시크릿 키 사용
const JWT_SECRET = process.env.JWT_SECRET; // 최소 32자 이상의 복잡한 키
```

JWT는 Base64로 쉽게 디코딩되므로 민감한 정보를 포함해서는 안 됩니다. 또한 약한 시크릿 키는 무작위 대입 공격에 취약하므로 충분히 복잡한 키를 사용해야 합니다.

### 4. 실무적 보안 고려사항

JWT 구현 시 추가로 고려해야 할 보안 요소들입니다:

```typescript
// None 알고리즘 공격 방지
const verifyToken = (token: string) => {
  const decoded = jwt.decode(token, { complete: true });
  
  // None 알고리즘 차단
  if (decoded?.header.alg === 'none') {
    throw new Error('None algorithm not allowed');
  }
  
  return jwt.verify(token, JWT_SECRET, { 
    algorithms: ['HS256'] // 허용할 알고리즘 명시
  });
};

// Refresh Token과 함께 사용
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { sub: userId }, 
    JWT_SECRET, 
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { sub: userId, type: 'refresh' }, 
    REFRESH_SECRET, 
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};
```

None 알고리즘 공격을 방지하고, 짧은 만료 시간의 Access Token과 긴 만료 시간의 Refresh Token을 조합하여 보안성과 사용성의 균형을 맞춰야 합니다.

## 정리

| 구분 | 내용 |
|------|------|
| **구조** | Header.Payload.Signature (Base64URL 인코딩) |
| **주요 장점** | 상태 비저장, DB 조회 불필요, 분산 환경 친화적 |
| **보안 주의사항** | 민감정보 제외, 강력한 시크릿 키, None 알고리즘 차단 |
| **권장 구현** | 짧은 Access Token + Refresh Token 조합 |
| **저장소 고려** | HttpOnly Cookie vs Local Storage 보안성 비교 |

JWT는 강력한 인증 토큰이지만 올바른 보안 설정 없이는 심각한 취약점이 될 수 있습니다. 특히 토큰 저장 방식, 만료 시간 설정, 탈취 감지 메커니즘 등을 종합적으로 고려한 보안 전략 수립이 필요합니다.