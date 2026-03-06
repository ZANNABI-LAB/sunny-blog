---
title: "pnpm과 Yarn Berry: 차세대 패키지 매니저 비교"
shortTitle: "pnpm vs Yarn Berry"
date: "2026-03-06"
tags: ["pnpm", "yarn-berry", "package-manager", "nodejs"]
category: "Frontend"
summary: "pnpm과 Yarn Berry의 핵심 특징과 기존 패키지 매니저 대비 개선점을 비교 분석합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/189"
references:
  - "https://pnpm.io/motivation"
  - "https://yarnpkg.com/features/pnp"
---

## pnpm과 Yarn Berry란?

pnpm과 Yarn Berry는 기존 npm과 Yarn Classic의 한계를 극복하기 위해 개발된 차세대 패키지 매니저입니다. 두 도구 모두 전통적인 node_modules 구조의 문제점인 중복 설치, 느린 속도, 유령 의존성 등을 해결하는 혁신적인 접근 방식을 제공합니다.

pnpm은 하드링크와 심볼릭 링크를 활용한 효율적인 저장 방식으로, Yarn Berry는 PnP(Plug'n'Play) 시스템을 통해 node_modules 폴더를 완전히 제거하는 방식으로 각각의 해법을 제시합니다. 이러한 혁신을 통해 패키지 설치 속도 향상, 디스크 공간 절약, 의존성 관리의 정확성을 크게 개선했습니다.

## 핵심 개념

### 1. pnpm의 Content-Addressable Store

pnpm의 가장 큰 특징은 전역 저장소를 활용한 효율적인 패키지 관리입니다.

```bash
# pnpm 설치 및 사용
npm install -g pnpm
pnpm install lodash

# 프로젝트 구조 예시
node_modules/
├── .pnpm/
│   └── lodash@4.17.21/
│       └── node_modules/
│           └── lodash/ → ~/.pnpm-store/v3/files/...
└── lodash → .pnpm/lodash@4.17.21/node_modules/lodash
```

pnpm은 패키지를 `~/.pnpm-store`라는 전역 저장소에 한 번만 저장하고, 각 프로젝트에서는 하드링크와 심볼릭 링크로 참조합니다. 이를 통해 동일한 패키지를 여러 프로젝트에서 공유하여 설치 시간과 디스크 사용량을 대폭 줄입니다.

### 2. Yarn Berry의 PnP 시스템

Yarn Berry는 node_modules 폴더를 완전히 제거하고 `.pnp.cjs` 파일로 의존성을 관리합니다.

```javascript
// .pnp.cjs 파일 예시 (간소화)
const packageRegistry = new Map([
  ["lodash", {
    packageLocation: ".yarn/cache/lodash-npm-4.17.21-hash.zip",
    packageDependencies: new Map()
  }]
]);

// yarn berry 설정
// .yarnrc.yml
nodeLinker: pnp
enableGlobalCache: true
```

패키지들은 `.yarn/cache` 디렉토리에 zip 형태로 압축 저장되며, `.pnp.cjs` 파일이 모든 패키지의 위치와 의존성 정보를 정확하게 기술합니다. 이를 통해 패키지 탐색이 빠르고 정확해집니다.

### 3. 유령 의존성(Phantom Dependencies) 해결

기존 npm/yarn에서는 직접 선언하지 않은 의존성에 접근할 수 있는 유령 의존성 문제가 있었습니다.

```javascript
// package.json에 express만 선언
{
  "dependencies": {
    "express": "^4.18.0"
  }
}

// 하지만 npm/yarn classic에서는 이렇게 접근 가능 (잘못된 방식)
const cookie = require('cookie'); // express의 의존성을 직접 사용

// pnpm/Yarn Berry에서는 에러 발생
// Error: Cannot resolve module 'cookie'
```

pnpm과 Yarn Berry는 엄격한 의존성 관리를 통해 package.json에 명시되지 않은 패키지에 대한 접근을 차단하여 이 문제를 해결합니다.

### 4. 모노레포와 워크스페이스 지원

두 패키지 매니저 모두 모노레포 환경에서 뛰어난 성능을 보입니다.

```yaml
# pnpm-workspace.yaml (pnpm)
packages:
  - 'apps/*'
  - 'packages/*'

# package.json (Yarn Berry)
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

```bash
# pnpm 워크스페이스 명령어
pnpm install --filter @myapp/frontend
pnpm run build --filter @myapp/backend

# Yarn Berry 워크스페이스 명령어
yarn workspace @myapp/frontend install
yarn workspace @myapp/backend run build
```

## 정리

| 특징 | pnpm | Yarn Berry | npm/yarn classic |
|------|------|------------|------------------|
| **저장 방식** | 하드링크 + 심볼릭 링크 | PnP + zip 압축 | 개별 복사 |
| **설치 속도** | 매우 빠름 | 매우 빠름 | 느림 |
| **디스크 사용량** | 적음 | 매우 적음 | 많음 |
| **유령 의존성** | 해결됨 | 해결됨 | 존재 |
| **Zero Install** | 미지원 | 지원 | 미지원 |
| **IDE 호환성** | 좋음 | 설정 필요 | 좋음 |
| **학습 곡선** | 낮음 | 높음 | 낮음 |

**선택 가이드:**
- **pnpm**: npm과 유사한 사용법으로 쉬운 마이그레이션을 원하는 경우
- **Yarn Berry**: 최신 기술과 Zero Install이 필요한 대규모 프로젝트
- **기존 도구**: 안정성이 최우선이거나 레거시 시스템 유지가 필요한 경우