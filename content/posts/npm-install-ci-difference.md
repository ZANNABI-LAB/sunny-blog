---
title: "npm install과 npm ci의 차이점"
shortTitle: "npm install vs ci"
date: "2026-03-08"
tags: ["npm", "package-manager", "dependency-management", "ci-cd", "frontend-tooling"]
category: "Frontend"
summary: "npm install과 npm ci의 동작 방식과 사용 시나리오별 차이점을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/193"
references: ["https://docs.npmjs.com/cli/v10/commands/npm-ci", "https://docs.npmjs.com/cli/v10/commands/npm-install", "https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json"]
---

## npm install과 npm ci란?

npm install과 npm ci는 모두 Node.js 프로젝트의 의존성을 설치하는 명령어입니다. 두 명령어 모두 package.json에 정의된 의존성을 node_modules 디렉토리에 설치하지만, 의존성 버전 관리와 설치 과정에서 중요한 차이점이 있습니다.

npm ci는 "clean install"의 약자로, 주로 CI/CD 환경이나 프로덕션 배포 과정에서 일관성 있는 의존성 설치를 위해 도입되었습니다. 반면 npm install은 로컬 개발 환경에서 유연한 의존성 관리를 위해 설계되었습니다.

## 핵심 개념

### 1. 의존성 버전 관리 방식

npm install은 package.json의 버전 범위(semantic versioning)를 해석하여 호환 가능한 최신 버전을 설치할 수 있습니다.

```json
// package.json
{
  "dependencies": {
    "lodash": "^4.17.0"
  }
}
```

```bash
# npm install: ^4.17.0 범위 내에서 4.17.21 같은 최신 버전 설치 가능
npm install

# npm ci: package-lock.json에 명시된 정확한 버전만 설치
npm ci
```

npm ci는 package-lock.json에 기록된 정확한 버전만을 설치하므로, 어떤 환경에서든 동일한 의존성 트리를 보장합니다.

### 2. package-lock.json 파일 처리

npm install은 설치 과정에서 package-lock.json을 수정할 수 있지만, npm ci는 절대 변경하지 않습니다.

```bash
# npm install: package-lock.json 업데이트 가능
npm install express@5.0.0  # package-lock.json이 수정됨

# npm ci: package-lock.json 읽기 전용
npm ci  # package-lock.json을 수정하지 않음
```

이러한 특성으로 인해 npm ci는 의존성 버전이 예기치 않게 변경되는 것을 방지합니다.

### 3. 설치 과정과 성능

npm ci는 매번 node_modules 디렉토리를 완전히 삭제한 후 새로 설치합니다.

```bash
# npm install: 기존 node_modules 활용
npm install  # 증분 설치, 빠른 속도

# npm ci: 완전 재설치
npm ci  # node_modules 삭제 → 전체 설치, 느린 속도
```

하지만 npm ci는 버전 해석 과정이 없어 실제로는 더 빠른 설치 속도를 보이는 경우가 많습니다.

### 4. 사용 환경별 최적화

각 명령어는 서로 다른 환경에 최적화되어 있습니다.

```bash
# 로컬 개발 환경
npm install  # 유연성과 개발 편의성

# CI/CD 환경
npm ci  # 일관성과 재현 가능성

# Docker 빌드
FROM node:18
COPY package*.json ./
RUN npm ci --only=production  # 프로덕션 의존성만 설치
```

npm ci는 package-lock.json이 존재하지 않으면 실행되지 않으므로, 반드시 두 파일이 모두 커밋되어 있어야 합니다.

## 정리

| 항목 | npm install | npm ci |
|------|-------------|---------|
| **버전 관리** | package.json 범위 내 최신 버전 | package-lock.json 정확한 버전 |
| **lock 파일** | 수정 가능 | 읽기 전용 |
| **설치 방식** | 증분 설치 | 완전 재설치 |
| **속도** | 개발 시 빠름 | CI/CD에서 빠름 |
| **사용 환경** | 로컬 개발 | CI/CD, 프로덕션 |
| **일관성** | 환경별 차이 가능 | 완전한 일관성 보장 |

**핵심 선택 기준:**
- **개발 환경**: `npm install` - 의존성 추가/수정이 빈번하고 유연성이 필요
- **CI/CD 환경**: `npm ci` - 빌드 일관성과 재현 가능성이 중요
- **팀 협업**: package-lock.json 커밋 필수, CI에서는 npm ci 사용 권장