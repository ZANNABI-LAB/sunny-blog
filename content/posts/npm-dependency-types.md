---
title: "npm 의존성 타입별 관리 가이드"
shortTitle: "npm 의존성 타입"
date: "2026-03-24"
tags: ["npm", "package-manager", "frontend", "dependency-management", "node-modules"]
category: "Frontend"
summary: "dependencies, devDependencies, peerDependencies의 차이점과 올바른 사용법을 알아봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/240"
references: ["https://docs.npmjs.com/cli/v10/configuring-npm/package-json", "https://nodejs.org/en/learn/getting-started/an-introduction-to-the-npm-package-manager"]
---

## npm 의존성 타입이란?

npm에서는 프로젝트의 의존성을 목적에 따라 분류하여 관리할 수 있는 시스템을 제공합니다. dependencies, devDependencies, peerDependencies는 각각 다른 설치 시점과 용도를 가지며, 올바른 분류를 통해 번들 크기 최적화와 의존성 관리의 효율성을 높일 수 있습니다.

이러한 분류는 특히 프로덕션 배포 시 불필요한 패키지 설치를 방지하고, 라이브러리 개발 시 호환성 문제를 해결하는 데 중요한 역할을 합니다. 잘못된 분류는 애플리케이션 크기 증가, 보안 취약점 노출, 실행 오류 등의 문제를 야기할 수 있습니다.

## 핵심 개념

### 1. dependencies - 프로덕션 의존성

프로덕션 환경에서 애플리케이션이 실행되기 위해 반드시 필요한 패키지들을 포함합니다. 이러한 패키지들은 `npm install --production` 명령어로도 설치되며, 배포 환경에서 필수적으로 포함됩니다.

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "axios": "^1.4.0",
    "lodash": "^4.17.21",
    "@emotion/styled": "^11.11.0"
  }
}
```

```javascript
// 프로덕션에서 실행되는 코드
import React from 'react';
import axios from 'axios';
import styled from '@emotion/styled';

const App = () => {
  // 이 패키지들은 런타임에 필수적으로 필요
  return <StyledContainer>Hello World</StyledContainer>;
};
```

### 2. devDependencies - 개발 도구 의존성

개발, 테스트, 빌드 과정에서만 사용되는 패키지들로, 프로덕션 환경에서는 설치되지 않습니다. `npm install --production` 실행 시 제외되어 배포 패키지 크기를 줄일 수 있습니다.

```json
{
  "devDependencies": {
    "@types/react": "^18.2.8",
    "eslint": "^8.42.0",
    "prettier": "^2.8.8",
    "webpack": "^5.88.0",
    "jest": "^29.5.0",
    "@testing-library/react": "^13.4.0"
  }
}
```

```javascript
// webpack.config.js (개발/빌드 시에만 사용)
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
};

// jest.config.js (테스트 시에만 사용)
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
};
```

### 3. peerDependencies - 피어 의존성

호스트 프로젝트가 특정 패키지의 특정 버전을 가져야 함을 명시합니다. 주로 라이브러리나 플러그인을 개발할 때 사용되며, 중복 설치를 방지하고 호환성을 보장합니다.

```json
{
  "name": "my-react-component-library",
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "devDependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

```javascript
// 라이브러리 코드에서는 react를 직접 번들하지 않음
import React from 'react'; // 호스트 프로젝트의 React 사용

export const MyComponent = ({ children }) => {
  // 호스트 프로젝트의 React 버전과 호환되어야 함
  return <div className="my-component">{children}</div>;
};
```

### 4. 올바른 분류 전략

의존성을 올바르게 분류하기 위한 판단 기준과 일반적인 실수들을 살펴보겠습니다.

```javascript
// package.json 분류 예시
{
  "dependencies": {
    // ✅ 런타임에 필요한 라이브러리
    "express": "^4.18.0",
    "mongoose": "^7.3.0",
    "dotenv": "^16.1.4"
  },
  "devDependencies": {
    // ✅ 개발/빌드/테스트 도구
    "nodemon": "^2.0.22",
    "supertest": "^6.3.3",
    "@types/express": "^4.17.17"
  },
  "peerDependencies": {
    // ✅ 호스트가 제공해야 할 패키지 (라이브러리 개발 시)
    "react": ">=16.8.0"
  }
}
```

잘못된 분류의 예시:

```javascript
// ❌ 잘못된 분류
{
  "dependencies": {
    "webpack": "^5.88.0",      // devDependencies로 이동 필요
    "eslint": "^8.42.0"        // devDependencies로 이동 필요
  },
  "devDependencies": {
    "axios": "^1.4.0",         // dependencies로 이동 필요
    "react": "^18.2.0"         // dependencies로 이동 필요
  }
}
```

## 정리

| 의존성 타입 | 설치 시점 | 용도 | 주요 패키지 예시 |
|------------|----------|------|-----------------|
| **dependencies** | 프로덕션 포함 | 런타임 실행 필수 | react, express, axios, lodash |
| **devDependencies** | 개발 환경만 | 개발/테스트/빌드 도구 | webpack, eslint, jest, prettier |
| **peerDependencies** | 호스트 제공 | 호환성 명시 | react (라이브러리에서), typescript |

**올바른 분류의 이점:**
- 프로덕션 번들 크기 최적화
- 보안 취약점 최소화
- 배포 속도 향상
- 의존성 관리 명확성

**분류 시 고려사항:**
- 런타임에 실제로 import/require되는지 확인
- 빌드 결과물에 포함되어야 하는지 판단
- 라이브러리 개발 시 호스트 의존성 고려