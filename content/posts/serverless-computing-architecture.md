---
title: "서버리스 컴퓨팅: 인프라 관리 없는 백엔드 개발"
shortTitle: "서버리스 컴퓨팅"
date: "2026-03-31"
tags: ["serverless", "cloud-computing", "faas", "baas", "infrastructure"]
category: "Infrastructure"
summary: "서버리스는 클라우드 업체가 인프라를 완전히 관리하고 사용한 만큼만 비용을 지불하는 컴퓨팅 모델입니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/260"
references: ["https://aws.amazon.com/serverless/", "https://docs.aws.amazon.com/lambda/", "https://firebase.google.com/docs"]
---

## 서버리스란?

서버리스(Serverless)는 클라우드 업체가 인프라 관리를 완전히 담당하고, 개발자는 비즈니스 로직에만 집중할 수 있도록 하는 컴퓨팅 모델입니다. 이름과 달리 실제로는 서버가 존재하지만, 개발자가 서버 운영을 신경 쓸 필요가 없다는 의미입니다.

기존 EC2와 같은 IaaS에서는 운영체제 관리, 보안 패치, 파일 시스템 관리를 직접 해야 했습니다. 서버리스에서는 이 모든 것을 클라우드 업체가 자동으로 처리하므로, 개발자는 코드 작성과 배포에만 집중할 수 있습니다.

## 핵심 개념

### 1. 주요 특징과 장점

서버리스의 핵심 특징은 다음과 같습니다:

**완전 관리형 인프라**: 클라우드 업체가 서버 프로비저닝, 확장, 유지보수를 모두 담당합니다.

```typescript
// AWS Lambda 함수 예시
export const handler = async (event: any) => {
  // 비즈니스 로직만 작성하면 됨
  const { name } = JSON.parse(event.body);
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello, ${name}!`
    })
  };
};
```

**사용량 기반 과금**: 실제 사용한 컴퓨팅 시간과 리소스에 대해서만 비용을 지불합니다. 트래픽이 없으면 비용도 0에 가깝습니다.

**자동 확장**: 요청량에 따라 자동으로 인스턴스가 생성되고 제거됩니다.

### 2. FaaS (Function as a Service)

FaaS는 특정 이벤트가 발생했을 때만 함수가 실행되는 서버리스 컴퓨팅 모델입니다:

```typescript
// API Gateway + Lambda 연동 예시
export const getUser = async (event: any) => {
  const userId = event.pathParameters.id;
  
  // 데이터베이스에서 사용자 조회
  const user = await dynamoDB.get({
    TableName: 'Users',
    Key: { id: userId }
  }).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user.Item)
  };
};
```

주요 FaaS 서비스:
- **AWS Lambda**: 가장 널리 사용되는 FaaS 플랫폼
- **Google Cloud Functions**: 구글의 FaaS 서비스
- **Azure Functions**: 마이크로소프트의 FaaS 서비스

### 3. BaaS (Backend as a Service)

BaaS는 완성된 백엔드 기능을 서비스 형태로 제공합니다:

```typescript
// Firebase Authentication 사용 예시
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const signIn = async (email: string, password: string) => {
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('로그인 성공:', user.uid);
    return user;
  } catch (error) {
    console.error('로그인 실패:', error);
    throw error;
  }
};
```

대표적인 BaaS 서비스:
- **Firebase**: 구글의 종합 BaaS 플랫폼
- **AWS Amplify**: AWS의 풀스택 개발 플랫폼  
- **Supabase**: 오픈소스 Firebase 대안

### 4. 서버리스 아키텍처 구성

서버리스 아키텍처는 여러 관리형 서비스를 조합하여 구성합니다:

```yaml
# serverless.yml 예시
service: user-service

provider:
  name: aws
  runtime: nodejs18.x

functions:
  getUser:
    handler: src/handlers/getUser.handler
    events:
      - http:
          path: /users/{id}
          method: get
  
  createUser:
    handler: src/handlers/createUser.handler
    events:
      - http:
          path: /users
          method: post

resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: users
        BillingMode: PAY_PER_REQUEST
```

일반적인 서버리스 스택:
- **컴퓨팅**: AWS Lambda, Google Cloud Functions
- **스토리지**: S3, DynamoDB, Firestore
- **API 게이트웨이**: API Gateway, Cloud Endpoints
- **메시징**: SQS, SNS, Pub/Sub

## 정리

| 구분 | 특징 |
|------|------|
| **FaaS** | 이벤트 기반 함수 실행, 세밀한 제어 가능 |
| **BaaS** | 완성된 백엔드 기능, 빠른 개발 가능 |
| **비용** | 사용량 기반 과금, 유휴 비용 없음 |
| **확장성** | 자동 확장, 무한 확장 가능 |
| **관리** | 인프라 관리 불필요, 코드에만 집중 |

서버리스는 특히 트래픽이 불규칙하거나, 빠른 프로토타이핑이 필요하거나, 운영 리소스가 제한적인 상황에서 효과적입니다. 다만 콜드 스타트 지연시간과 벤더 종속성을 고려하여 도입을 검토해야 합니다.