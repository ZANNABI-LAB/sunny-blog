---
title: "자바스크립트 부동소수점 연산의 정밀도 문제"
shortTitle: "부동소수점 정밀도"
date: "2026-03-19"
tags: ["javascript", "floating-point", "ieee-754", "precision", "number-comparison"]
category: "Frontend"
summary: "자바스크립트에서 0.1 + 0.2 === 0.3이 false인 이유와 해결 방법을 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/225"
references: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON", "https://tc39.es/ecma262/#sec-number-objects", "https://0.30000000000000004.com/"]
---

## 자바스크립트 부동소수점 연산의 정밀도 문제란?

자바스크립트에서 `0.1 + 0.2 === 0.3`의 실행 결과는 `false`입니다. 이는 프로그래밍을 처음 접하는 개발자들에게 매우 놀라운 결과일 수 있습니다. 이러한 현상은 자바스크립트만의 문제가 아니라, 컴퓨터가 소수를 처리하는 방식에서 발생하는 근본적인 문제입니다.

자바스크립트는 모든 숫자를 IEEE 754 표준의 64비트 부동소수점 형식으로 저장합니다. 이 방식은 메모리를 효율적으로 사용하면서 매우 큰 수부터 매우 작은 수까지 표현할 수 있지만, 일부 소수점 연산에서는 정확한 값을 저장하지 못하는 한계가 있습니다.

## 핵심 개념

### 1. IEEE 754 부동소수점 표준의 한계

컴퓨터는 내부적으로 모든 수를 이진법으로 처리합니다. 십진수 0.1을 이진수로 변환하면 무한히 반복되는 소수가 됩니다:

```javascript
// 0.1의 이진 표현 (무한 반복)
// 0.0001100110011001100110011...

console.log(0.1); // 0.1 (표시상으로는 0.1)
console.log(0.1.toString(2)); // "0.0001100110011001100110011001100110011001100110011001101"

// 실제 저장된 값 확인
console.log(0.1 + 0.2); // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false
```

64비트 부동소수점은 유한한 비트로 이러한 무한 소수를 근사치로 저장해야 하므로, 미세한 오차가 발생합니다.

### 2. 부동소수점 연산 오차 해결 방법

Number.EPSILON을 활용한 안전한 비교 함수를 구현할 수 있습니다:

```javascript
function isEqual(a, b, epsilon = Number.EPSILON) {
  return Math.abs(a - b) < epsilon;
}

console.log(isEqual(0.1 + 0.2, 0.3)); // true

// 더 엄격한 비교를 위한 함수
function isEqualWithPrecision(a, b, precision = 10) {
  const factor = Math.pow(10, precision);
  return Math.round(a * factor) === Math.round(b * factor);
}

console.log(isEqualWithPrecision(0.1 + 0.2, 0.3)); // true
```

### 3. 정수 기반 연산으로 회피하기

금융 계산 등 정확한 연산이 필요한 경우, 정수로 변환하여 계산하는 방법이 있습니다:

```javascript
// 소수점을 정수로 변환하여 계산
function precisePlus(a, b, decimalPlaces = 2) {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round((a * factor + b * factor)) / factor;
}

console.log(precisePlus(0.1, 0.2)); // 0.3

// 큰 정밀도가 필요한 경우 BigInt 활용
function preciseCalculation(a, b) {
  const factor = 1000000; // 소수점 6자리까지 정확도
  const aBig = BigInt(Math.round(a * factor));
  const bBig = BigInt(Math.round(b * factor));
  return Number(aBig + bBig) / factor;
}

console.log(preciseCalculation(0.1, 0.2)); // 0.3
```

### 4. 외부 라이브러리 활용

복잡한 수학 연산이 필요한 경우 전문 라이브러리를 사용할 수 있습니다:

```javascript
// decimal.js 라이브러리 예시
import { Decimal } from 'decimal.js';

const a = new Decimal(0.1);
const b = new Decimal(0.2);
const result = a.plus(b);

console.log(result.toString()); // "0.3"
console.log(result.equals(0.3)); // true

// big.js 라이브러리 예시
import Big from 'big.js';

const x = new Big(0.1);
const y = new Big(0.2);
const sum = x.plus(y);

console.log(sum.toString()); // "0.3"
```

## 정리

자바스크립트의 부동소수점 연산 문제는 IEEE 754 표준의 구조적 한계에서 비롯됩니다. 이를 해결하는 방법들을 정리하면:

| 해결 방법 | 장점 | 단점 | 사용 케이스 |
|-----------|------|------|-------------|
| Number.EPSILON | 간단한 구현 | 상대적으로 낮은 정확도 | 일반적인 비교 연산 |
| 정수 변환 | 정확한 연산 | 오버플로우 위험 | 금융 계산 |
| 반올림 함수 | 직관적 | 문자열 변환 필요 | 표시용 계산 |
| 전문 라이브러리 | 높은 정확도 | 번들 크기 증가 | 복잡한 수학 연산 |

부동소수점 연산의 한계를 이해하고 적절한 해결 방법을 선택하는 것이 안정적인 자바스크립트 애플리케이션 개발의 핵심입니다.