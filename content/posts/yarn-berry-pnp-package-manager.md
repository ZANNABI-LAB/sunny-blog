---
title: "Yarn Berry와 PnP: 차세대 패키지 매니저의 혁신"
shortTitle: "Yarn Berry PnP"
date: "2026-04-16"
tags: ["yarn", "package-manager", "pnp", "zero-install", "frontend"]
category: "Frontend.Tooling"
summary: "Yarn Berry의 Plug'n'Play 방식과 Zero-Install로 패키지 관리의 패러다임을 바꾼 차세대 패키지 매니저를 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/304"
references: ["https://yarnpkg.com/features/pnp", "https://yarnpkg.com/features/zero-installs", "https://nodejs.org/api/modules.html"]
---

## Yarn Berry란?

Yarn Berry는 Yarn 2.x 버전부터 시작된 완전히 새롭게 재설계된 패키지 매니저입니다. 기존 Yarn 1.x(Classic Yarn)가 npm과 유사한 `node_modules` 구조를 사용했다면, Yarn Berry는 Plug'n'Play(PnP) 방식을 도입하여 패키지 관리의 근본적인 패러다임을 바꾸었습니다.

Yarn Berry의 핵심은 `node_modules` 없는 의존성 관리와 Zero-Install을 통한 빠른 설치 속도입니다. 이는 기존 패키지 매니저들이 가진 성능과 용량 문제를 해결하고, CI/CD 환경에서의 효율성을 크게 향상시킵니다.

## 핵심 개념

### 1. Plug'n'Play (PnP) 방식

Yarn Berry의 가장 큰 특징은 `node_modules` 폴더를 생성하지 않는 PnP 방식입니다.

```json
// .pnp.cjs 파일에서 의존성 매핑
const packageRegistry = new Map([
  ["react", {
    "18.2.0": {
      "packageLocation": "./.yarn/cache/react-npm-18.2.0-...",
      "packageDependencies": new Map([
        ["loose-envify", "1.4.0"]
      ])
    }
  }]
]);
```

기존 방식과의 차이점:

```typescript
// 기존 Yarn 1.x (node_modules 방식)
// node_modules/
// ├── react/
// │   ├── package.json
// │   └── index.js
// └── lodash/
//     ├── package.json
//     └── index.js

// Yarn Berry (PnP 방식)
// .yarn/cache/
// ├── react-npm-18.2.0-hash.zip
// └── lodash-npm-4.17.21-hash.zip
// .pnp.cjs (의존성 매핑 파일)
```

PnP 방식의 장점은 설치 속도가 빠르고, 디스크 공간을 절약하며, 의존성 해결이 정확합니다.

### 2. Zero-Install 시스템

Yarn Berry는 모든 의존성을 압축 파일로 저장하고 Git에 커밋하는 Zero-Install을 지원합니다.

```yaml
# .github/workflows/ci.yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      # yarn install 단계 생략 가능
      - run: yarn test
      - run: yarn build
```

프로젝트 구조:

```
project/
├── .yarn/
│   ├── cache/           # 압축된 패키지들
│   │   ├── react-npm-18.2.0-hash.zip
│   │   └── lodash-npm-4.17.21-hash.zip
│   └── releases/        # Yarn 바이너리
├── .pnp.cjs            # 의존성 매핑
├── .yarnrc.yml         # Yarn 설정
└── package.json
```

### 3. 성능 최적화

Yarn Berry는 여러 방식으로 성능을 최적화합니다.

```typescript
// package.json
{
  "packageManager": "yarn@4.0.0",
  "scripts": {
    "postinstall": "yarn dlx @yarnpkg/sdks vscode"
  }
}
```

성능 향상 요소:

```bash
# 설치 속도 비교 (평균)
npm install      # ~45초
yarn install     # ~30초  
yarn berry (PnP) # ~5초 (Zero-Install 시 ~1초)

# 디스크 사용량 비교
node_modules     # ~500MB
.yarn/cache      # ~50MB (90% 절약)
```

### 4. 개발 환경 설정

Yarn Berry 사용을 위한 기본 설정입니다.

```yaml
# .yarnrc.yml
nodeLinker: pnp
enableGlobalCache: true
compressionLevel: mixed

plugins:
  - path: .yarn/plugins/@yarnpkg/plugin-interactive-tools.cjs
    spec: "@yarnpkg/plugin-interactive-tools"
```

IDE 지원을 위한 설정:

```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "search.exclude": {
    "**/.yarn": true,
    "**/.pnp.*": true
  }
}
```

## 정리

| 특징 | Yarn 1.x | Yarn Berry |
|------|----------|------------|
| **의존성 관리** | node_modules | Plug'n'Play (.pnp.cjs) |
| **설치 속도** | 보통 | 매우 빠름 |
| **디스크 사용량** | 많음 | 적음 (90% 절약) |
| **Zero-Install** | 미지원 | 지원 |
| **CI/CD 속도** | 느림 | 빠름 (설치 단계 생략) |

**주요 장점:**
- **빠른 설치**: PnP 방식으로 패키지 설치 속도 대폭 향상
- **공간 절약**: 압축 저장으로 디스크 사용량 90% 절약
- **정확한 의존성**: 명시적 의존성 매핑으로 phantom dependency 방지
- **CI/CD 최적화**: Zero-Install로 빌드 시간 단축

**고려사항:**
- **학습 곡선**: 기존 방식과 다른 새로운 개념 이해 필요
- **생태계 호환성**: 일부 라이브러리에서 PnP 호환성 이슈 가능성
- **IDE 설정**: 개발 도구별 추가 설정 필요