---
title: "시간 복잡도와 공간 복잡도의 차이점"
shortTitle: "시간-공간 복잡도"
date: "2026-03-14"
tags: ["time-complexity", "space-complexity", "big-o", "algorithm-analysis", "performance"]
category: "Backend"
summary: "알고리즘 성능을 평가하는 두 가지 핵심 지표인 시간 복잡도와 공간 복잡도의 개념과 차이점을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/210"
references: ["https://en.wikipedia.org/wiki/Time_complexity", "https://www.khanacademy.org/computing/computer-science/algorithms/asymptotic-notation/a/big-o-notation", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array"]
---

## 시간 복잡도와 공간 복잡도란?

시간 복잡도(Time Complexity)와 공간 복잡도(Space Complexity)는 알고리즘의 효율성을 평가하는 두 가지 핵심 지표입니다. 하나의 문제를 해결하는 여러 알고리즘이 존재할 때, 개발자는 성능을 평가하여 최적의 알고리즘을 선택해야 합니다.

실행 시간을 직접 측정하는 것은 기계에 의존적이며, 빠른 알고리즘들 간의 비교가 어려울 수 있습니다. 따라서 입력 크기에 따른 연산 수와 메모리 사용량을 추상화하여 평가하는 방법이 복잡도 분석입니다.

두 복잡도 모두 빅오(Big-O) 표기법을 사용하여 입력 크기가 증가할 때 알고리즘의 성능이 어떻게 변화하는지를 나타냅니다.

## 핵심 개념

### 1. 시간 복잡도 (Time Complexity)

시간 복잡도는 알고리즘이 수행하는 연산의 수를 입력 크기에 따라 나타낸 것입니다. 실제 실행 시간이 아닌 연산 횟수에 초점을 맞춥니다.

```typescript
// O(1) - 상수 시간
function getFirstElement<T>(arr: T[]): T | undefined {
    return arr[0]; // 입력 크기와 무관하게 한 번만 접근
}

// O(n) - 선형 시간
function findElement<T>(arr: T[], target: T): boolean {
    for (let i = 0; i < arr.length; i++) { // n번 반복
        if (arr[i] === target) return true;
    }
    return false;
}

// O(n²) - 이차 시간
function bubbleSort(arr: number[]): number[] {
    for (let i = 0; i < arr.length; i++) {      // n번 반복
        for (let j = 0; j < arr.length - 1; j++) { // 각각 n번 반복
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}
```

### 2. 공간 복잡도 (Space Complexity)

공간 복잡도는 알고리즘이 사용하는 메모리 공간을 입력 크기에 따라 나타낸 것입니다. 입력 공간과 보조 공간(auxiliary space)을 포함합니다.

```typescript
// O(1) - 상수 공간
function sum(arr: number[]): number {
    let total = 0; // 고정된 크기의 변수만 사용
    for (const num of arr) {
        total += num;
    }
    return total;
}

// O(n) - 선형 공간
function reverse<T>(arr: T[]): T[] {
    const result: T[] = []; // 입력 크기만큼의 새로운 배열 생성
    for (let i = arr.length - 1; i >= 0; i--) {
        result.push(arr[i]);
    }
    return result;
}

// O(n) - 재귀 호출 스택
function factorial(n: number): number {
    if (n <= 1) return 1;
    return n * factorial(n - 1); // n개의 스택 프레임
}
```

### 3. 빅오 표기법의 규칙

빅오 표기법은 점근적 표기법으로, 입력이 충분히 클 때의 성장률에 집중합니다.

```typescript
// 상수항과 계수는 무시
function linearSearch(arr: number[], target: number): number {
    const operations = 5; // 무시됨
    for (let i = 0; i < arr.length * 3; i++) { // 계수 3은 무시, O(n)
        // 연산...
    }
    return -1;
}

// 최고차항만 고려
function complexAlgorithm(n: number): void {
    // O(n) 부분
    for (let i = 0; i < n; i++) {
        console.log(i);
    }
    
    // O(n²) 부분 - 이것이 지배적
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            console.log(i, j);
        }
    }
    // 전체 복잡도: O(n²)
}

// 독립적인 입력은 덧셈
function processArrays(arr1: number[], arr2: number[]): void {
    arr1.forEach(x => console.log(x)); // O(n)
    arr2.forEach(x => console.log(x)); // O(m)
    // 전체: O(n + m)
}
```

### 4. Trade-off 관계

시간 복잡도와 공간 복잡도는 종종 trade-off 관계에 있습니다. 하나를 개선하면 다른 하나가 희생되는 경우가 많습니다.

```typescript
// 메모이제이션: 공간을 사용해 시간 단축
function fibonacciMemo(n: number, memo: Map<number, number> = new Map()): number {
    if (n <= 1) return n;
    
    if (memo.has(n)) return memo.get(n)!; // O(1) 조회
    
    const result = fibonacciMemo(n - 1, memo) + fibonacciMemo(n - 2, memo);
    memo.set(n, result); // O(n) 추가 공간 사용
    return result;
}

// 공간 효율적이지만 시간이 많이 걸리는 버전
function fibonacciNoMemo(n: number): number {
    if (n <= 1) return n;
    return fibonacciNoMemo(n - 1) + fibonacciNoMemo(n - 2); // O(2^n) 시간, O(n) 공간
}
```

## 정리

| 구분 | 시간 복잡도 | 공간 복잡도 |
|------|-------------|-------------|
| **평가 대상** | 연산 수 (실행 시간) | 메모리 사용량 |
| **측정 기준** | 입력 크기에 따른 연산 횟수 | 입력 크기에 따른 메모리 요구량 |
| **최적화 목표** | 실행 속도 향상 | 메모리 효율성 |
| **Trade-off** | 공간을 사용해 시간 단축 가능 | 시간을 희생해 공간 절약 가능 |

**핵심 포인트:**
- 시간 복잡도는 **얼마나 빨리** 실행되는가를 측정
- 공간 복잡도는 **얼마나 적은 메모리**를 사용하는가를 측정  
- 빅오 표기법으로 입력 크기 증가에 따른 성장률을 표현
- 실제 개발에서는 시간과 공간의 균형점을 찾는 것이 중요