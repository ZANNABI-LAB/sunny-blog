---
title: "트리 쉐이킹: 불필요한 코드를 제거하는 최적화 기법"
shortTitle: "트리 쉐이킹"
date: "2026-03-20"
tags: ["tree-shaking", "bundle-optimization", "es-modules", "webpack"]
category: "Frontend"
summary: "사용되지 않는 코드를 제거하여 번들 크기를 최적화하는 트리 쉐이킹 기법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/228"
references: ["https://webpack.js.org/guides/tree-shaking/", "https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking", "https://rollupjs.org/guide/en/#tree-shaking"]
---

## 트리 쉐이킹이란?

트리 쉐이킹(Tree Shaking)은 번들러가 최종 번들에서 사용되지 않는 코드(데드 코드)를 제거하는 최적화 기법입니다. 이름은 나무를 흔들어 죽은 잎사귀를 떨어뜨리는 것에서 유래되었습니다.

이 기법은 ES6 모듈의 정적 구조를 활용하여 어떤 코드가 실제로 사용되는지 분석하고, 사용되지 않는 부분을 번들에서 제거합니다. 결과적으로 더 작은 번들 크기와 향상된 성능을 얻을 수 있습니다.

## 핵심 개념

### 1. ES 모듈과 정적 분석

트리 쉐이킹이 효과적으로 작동하려면 ES 모듈을 사용해야 합니다. ES 모듈은 정적 구조를 가지므로 컴파일 타임에 의존성을 분석할 수 있습니다.

```javascript
// utils.js - ES 모듈로 내보내기
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  return a / b;
}

// main.js - 필요한 함수만 가져오기
import { add } from './utils.js';

console.log(add(2, 3)); // multiply, divide는 번들에서 제거됨
```

CommonJS는 동적 특성으로 인해 트리 쉐이킹이 어렵습니다:

```javascript
// 동적 require는 분석이 어려움
const moduleName = condition ? 'moduleA' : 'moduleB';
const module = require(moduleName);
```

### 2. 사이드 이펙트 관리

트리 쉐이킹이 안전하게 작동하려면 코드가 사이드 이펙트가 없어야 합니다. 사이드 이펙트가 있는 코드는 제거되면 안 되므로 번들러가 보수적으로 접근합니다.

```javascript
// 사이드 이펙트가 있는 코드 (제거되지 않음)
console.log('모듈이 로드되었습니다');
window.globalVar = 'some value';

// 사이드 이펙트가 없는 순수 함수 (제거 가능)
export function pureFunction(x) {
  return x * 2;
}
```

package.json에서 사이드 이펙트를 명시할 수 있습니다:

```json
{
  "name": "my-package",
  "sideEffects": false,
  // 또는 특정 파일만 사이드 이펙트가 있다고 명시
  "sideEffects": ["./src/polyfills.js", "*.css"]
}
```

### 3. 번들러별 트리 쉐이킹 설정

**Webpack 설정:**
```javascript
// webpack.config.js
module.exports = {
  mode: 'production', // 자동으로 트리 쉐이킹 활성화
  optimization: {
    usedExports: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          unused: true,
        },
      }),
    ],
  },
};
```

**Rollup 설정:**
```javascript
// rollup.config.js
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
  },
  plugins: [
    terser() // 데드 코드 제거
  ]
};
```

### 4. 트리 쉐이킹 효과 측정

번들 분석 도구를 사용하여 트리 쉐이킹 효과를 확인할 수 있습니다:

```bash
# webpack-bundle-analyzer 설치
npm install --save-dev webpack-bundle-analyzer

# 번들 분석 실행
npx webpack-bundle-analyzer dist/main.js
```

코드에서 사용량을 확인하는 방법:

```javascript
// 라이브러리에서 필요한 부분만 가져오기
import { debounce } from 'lodash-es'; // 전체 lodash 대신

// 잘못된 예 - 전체 라이브러리를 가져옴
import _ from 'lodash';
const debouncedFn = _.debounce(fn, 300);

// 올바른 예 - 필요한 함수만 가져옴
import { debounce } from 'lodash-es';
const debouncedFn = debounce(fn, 300);
```

## 정리

| 구분 | 내용 |
|------|------|
| **핵심 원리** | ES 모듈의 정적 구조를 활용한 사용되지 않는 코드 제거 |
| **필수 조건** | ES 모듈 사용, 사이드 이펙트 없는 순수 함수 |
| **주요 설정** | `mode: 'production'`, `sideEffects: false` |
| **측정 도구** | webpack-bundle-analyzer, 번들 크기 비교 |
| **최적화 효과** | 번들 크기 감소, 로딩 성능 향상 |

트리 쉐이킹은 현대 웹 개발에서 번들 크기를 최적화하는 핵심 기법입니다. ES 모듈과 적절한 번들러 설정을 통해 불필요한 코드를 제거하고 더 효율적인 애플리케이션을 만들 수 있습니다.