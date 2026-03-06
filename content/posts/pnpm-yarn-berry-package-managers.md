---
title: "pnpm과 Yarn Berry: 차세대 패키지 매니저 비교"
shortTitle: "pnpm Yarn Berry"
date: "2026-03-06"
tags: ["pnpm", "yarn-berry", "package-manager", "frontend"]
category: "설명해주세요.프론트엔드"
summary: "pnpm과 Yarn Berry의 혁신적인 패키지 관리 방식과 기존 npm 대비 장점들을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/189"
---

## pnpm과 Yarn Berry란?

pnpm과 Yarn Berry는 기존 npm의 한계를 극복하기 위해 등장한 차세대 패키지 매니저입니다. 두 도구 모두 디스크 효율성과 설치 성능을 대폭 개선했으며, 유령 의존성(phantom dependencies) 문제를 해결했습니다.

기존 npm은 각 프로젝트의 node_modules에 패키지를 중복으로 저장하여 디스크 공간을 낭비하고 설치 시간이 길다는 문제가 있었습니다. pnpm과 Yarn Berry는 각각 다른 접근 방식으로 이러한 문제들을 해결합니다.

## 핵심 개념

### 1. pnpm의 Content-Addressable Store

pnpm은 전역 저장소인 content-addressable store를 사용하여 패키지를 한 번만 저장하고, 각 프로젝트에서는 하드 링크와 심볼릭 링크를 통해 참조합니다.

```bash
# pnpm 설치 및 사용 예시
npm install -g pnpm

# 패키지 설치
pnpm install

# 의존성 추가
pnpm add react typescript

# workspace에서 특정 패키지에 의존성 추가
pnpm add --filter @myapp/frontend react-router-dom
```

pnpm의 디렉토리 구조는 다음과 같습니다:

```
node_modules/
├── .pnpm/
│   ├── react@18.2.0/
│   │   └── node_modules/
│   │       └── react/
│   └── typescript@5.0.0/
│       └── node_modules/
│           └── typescript/
├── react -> .pnpm/react@18.2.0/node_modules/react
└── typescript -> .pnpm/typescript@5.0.0/node_modules/typescript
```

### 2. Yarn Berry의 PnP (Plug'n'Play) 시스템

Yarn Berry는 node_modules를 완전히 제거하고 .pnp.cjs 파일을 통해 의존성을 관리합니다. 모든 패키지는 .yarn/cache에 zip 형태로 저장됩니다.

```bash
# Yarn Berry 설정
yarn set version berry

# .yarnrc.yml 설정 예시
nodeLinker: pnp
enableGlobalCache: true
compressionLevel: mixed

# 패키지 설치
yarn install

# 의존성 추가
yarn add react typescript
```

.pnp.cjs 파일의 구조 예시:

```javascript
// .pnp.cjs (간소화된 예시)
const packageRegistry = new Map([
  ["react", {
    packageLocation: "./.yarn/cache/react-npm-18.2.0-hash.zip",
    packageDependencies: new Map([
      ["loose-envify", "npm:1.4.0"]
    ])
  }]
]);
```

### 3. Zero Install과 버전 관리

Yarn Berry의 Zero Install은 의존성 자체를 Git에 포함시켜 별도의 설치 과정 없이 바로 실행할 수 있게 합니다.

```yaml
# .gitignore 설정 (Zero Install 적용)
.yarn/*
!.yarn/cache
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions
```

프로젝트를 클론한 후 바로 실행할 수 있습니다:

```bash
git clone <repository>
cd project
yarn start  # 별도 설치 과정 없음
```

### 4. 유령 의존성 해결

두 패키지 매니저 모두 유령 의존성 문제를 해결합니다. 기존 npm에서는 명시하지 않은 의존성도 접근 가능했지만, pnpm과 Yarn Berry는 엄격한 의존성 관리를 제공합니다.

```typescript
// package.json에 명시되지 않은 패키지 사용 시
import lodash from 'lodash'; // npm: 동작할 수 있음 (위험)
                            // pnpm/Yarn Berry: 에러 발생
```

올바른 사용법:

```bash
# 의존성을 명시적으로 추가
pnpm add lodash
# 또는
yarn add lodash
```

## 정리

| 특징 | pnpm | Yarn Berry |
|------|------|------------|
| **저장 방식** | 하드링크/심볼릭링크 | zip 압축 파일 |
| **디스크 절약** | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **설치 속도** | 빠름 | 매우 빠름 |
| **Zero Install** | ❌ | ⭐ |
| **생태계 호환성** | 높음 | 보통 (PnP 이슈 가능) |
| **학습 곡선** | 낮음 | 보통 |
| **모노레포 지원** | Workspace | Workspace |

### 선택 기준
- **기존 생태계 호환성 중시**: pnpm 추천
- **최대 성능과 Zero Install 필요**: Yarn Berry 추천
- **점진적 마이그레이션**: pnpm이 더 안전함
- **새 프로젝트 시작**: 두 옵션 모두 우수함