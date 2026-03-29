---
title: "페이지 교체 알고리즘"
shortTitle: "페이지 교체"
date: "2026-03-29"
tags: ["operating-system", "virtual-memory", "page-replacement", "memory-management"]
category: "Backend"
summary: "가상 메모리에서 메모리 부족 시 어떤 페이지를 교체할지 결정하는 알고리즘들을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/254"
references: ["https://docs.kernel.org/admin-guide/mm/concepts.html", "https://pages.cs.wisc.edu/~bart/537/lecturenotes/s18.html"]
---

## 페이지 교체 알고리즘이란?

페이지 교체 알고리즘은 가상 메모리 시스템에서 메모리 부족 상황이 발생했을 때, 어떤 페이지를 디스크로 내보낼지 결정하는 알고리즘입니다. 운영체제는 요구 페이징을 통해 실제로 필요한 페이지만 메모리에 적재하여 효율적인 메모리 관리를 수행합니다.

새로운 페이지를 메모리에 적재해야 하는데 여유 공간이 없는 경우, 기존 페이지 중 하나를 선택하여 교체해야 합니다. 이때 어떤 페이지를 선택하느냐에 따라 시스템 성능이 크게 달라질 수 있으며, 페이지 부재율과 직결되는 중요한 결정입니다.

## 핵심 개념

### 1. 기본 알고리즘들

**FIFO (First In First Out)**는 가장 먼저 적재된 페이지를 교체하는 단순한 알고리즘입니다:

```python
class FIFOPageReplacement:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.pages = []
        
    def access_page(self, page_id: int) -> bool:
        if page_id in self.pages:
            return True  # 페이지 히트
        
        if len(self.pages) < self.capacity:
            self.pages.append(page_id)
        else:
            # 가장 먼저 들어온 페이지 교체
            self.pages.pop(0)
            self.pages.append(page_id)
        
        return False  # 페이지 폴트
```

**OPT (Optimal)**는 미래에 가장 늦게 사용될 페이지를 교체하는 이론적 최적 알고리즘입니다. 실제 구현은 불가능하지만 다른 알고리즘의 성능 비교 기준이 됩니다.

### 2. 참조 기반 알고리즘들

**LRU (Least Recently Used)**는 가장 오래 사용되지 않은 페이지를 교체합니다:

```python
from collections import OrderedDict

class LRUPageReplacement:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.pages = OrderedDict()
    
    def access_page(self, page_id: int) -> bool:
        if page_id in self.pages:
            # 최근 사용된 페이지를 맨 뒤로 이동
            self.pages.move_to_end(page_id)
            return True
        
        if len(self.pages) >= self.capacity:
            # 가장 오래 사용되지 않은 페이지 제거
            self.pages.popitem(last=False)
        
        self.pages[page_id] = True
        return False
```

**LFU (Least Frequently Used)**는 사용 빈도가 가장 낮은 페이지를 교체합니다:

```python
class LFUPageReplacement:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.pages = {}
        self.frequencies = {}
        
    def access_page(self, page_id: int) -> bool:
        if page_id in self.pages:
            self.frequencies[page_id] += 1
            return True
        
        if len(self.pages) >= self.capacity:
            # 빈도가 가장 낮은 페이지 찾기
            min_freq = min(self.frequencies.values())
            victim = next(pid for pid, freq in self.frequencies.items() 
                         if freq == min_freq)
            
            del self.pages[victim]
            del self.frequencies[victim]
        
        self.pages[page_id] = True
        self.frequencies[page_id] = 1
        return False
```

### 3. 하드웨어 지원 알고리즘

**NUR (Not Used Recently)**은 참조 비트와 수정 비트를 활용하여 4가지 클래스로 페이지를 분류합니다:

```python
class NURPageReplacement:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.pages = {}
        
    def classify_page(self, page_id: int, referenced: bool, modified: bool) -> int:
        """페이지를 4개 클래스로 분류
        클래스 0: 참조되지 않음, 수정되지 않음 (우선 교체)
        클래스 1: 참조되지 않음, 수정됨
        클래스 2: 참조됨, 수정되지 않음
        클래스 3: 참조됨, 수정됨 (나중 교체)
        """
        if not referenced and not modified:
            return 0
        elif not referenced and modified:
            return 1
        elif referenced and not modified:
            return 2
        else:  # referenced and modified
            return 3
    
    def find_victim_page(self) -> int:
        """클래스 0부터 순차적으로 희생자 찾기"""
        for class_num in range(4):
            for page_id, (ref, mod) in self.pages.items():
                if self.classify_page(page_id, ref, mod) == class_num:
                    return page_id
        
        # 모든 페이지가 클래스 3인 경우 첫 번째 페이지 반환
        return next(iter(self.pages.keys()))
```

### 4. 성능 평가 지표

페이지 교체 알고리즘의 성능은 주로 **페이지 부재율(Page Fault Rate)**로 측정됩니다:

```python
def evaluate_algorithm(algorithm, page_sequence: list) -> float:
    page_faults = 0
    total_accesses = len(page_sequence)
    
    for page in page_sequence:
        if not algorithm.access_page(page):
            page_faults += 1
    
    fault_rate = page_faults / total_accesses
    return fault_rate

# 성능 비교 예시
page_sequence = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5]
capacity = 3

fifo = FIFOPageReplacement(capacity)
lru = LRUPageReplacement(capacity)

fifo_rate = evaluate_algorithm(fifo, page_sequence)
lru_rate = evaluate_algorithm(lru, page_sequence)

print(f"FIFO 부재율: {fifo_rate:.2%}")
print(f"LRU 부재율: {lru_rate:.2%}")
```

## 정리

| 알고리즘 | 특징 | 장점 | 단점 | 구현 복잡도 |
|---------|------|------|------|------------|
| **FIFO** | 먼저 들어온 순서로 교체 | 구현 간단 | 성능 예측 어려움 | 낮음 |
| **OPT** | 미래에 가장 늦게 사용될 페이지 교체 | 이론적 최적 성능 | 실제 구현 불가능 | - |
| **LRU** | 가장 오래 사용되지 않은 페이지 교체 | 우수한 성능 | 메모리/시간 오버헤드 | 높음 |
| **LFU** | 사용 빈도가 낮은 페이지 교체 | 지역성 고려 | 초기 접근 편향 | 높음 |
| **NUR** | 참조/수정 비트로 클래스 분류 후 교체 | 하드웨어 지원, 효율적 | 정확도 제한 | 중간 |

페이지 교체 알고리즘 선택은 시스템의 메모리 접근 패턴, 하드웨어 지원 수준, 성능 요구사항을 종합적으로 고려하여 결정해야 합니다. 현대 운영체제는 주로 LRU의 근사 알고리즘이나 NUR과 같은 하드웨어 지원 알고리즘을 사용합니다.