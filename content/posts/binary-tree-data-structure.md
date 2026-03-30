---
title: "이진 트리 자료구조 완전 가이드"
shortTitle: "이진 트리"
date: "2026-03-30"
tags: ["binary-tree", "data-structure", "tree-traversal", "algorithm"]
category: "Backend"
summary: "이진 트리의 개념, 종류, 탐색 방법을 코드 예시와 함께 설명합니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/257"
references: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array", "https://en.wikipedia.org/wiki/Binary_tree"]
---

## 이진 트리란?

이진 트리(Binary Tree)는 각 노드가 최대 2개의 자식 노드를 가지는 트리 자료구조입니다. 트리는 방향성을 가진 그래프의 특수한 형태로, 부모-자식 관계가 계층적으로 연결된 재귀적 구조를 가집니다.

이진 트리는 백엔드 개발에서 데이터베이스 인덱스, 힙(Heap), 이진 탐색 트리(BST) 등 다양한 자료구조의 기반이 됩니다. 특히 검색, 정렬, 우선순위 큐 등의 알고리즘에서 핵심적인 역할을 담당합니다.

## 핵심 개념

### 1. 이진 트리의 종류

이진 트리는 노드 배치 패턴에 따라 세 가지 주요 유형으로 분류됩니다.

```typescript
interface TreeNode {
  value: number;
  left?: TreeNode;
  right?: TreeNode;
}

// 포화 이진 트리 (Full Binary Tree)
const fullBinaryTree: TreeNode = {
  value: 1,
  left: {
    value: 2,
    left: { value: 4 },
    right: { value: 5 }
  },
  right: {
    value: 3,
    left: { value: 6 },
    right: { value: 7 }
  }
};

// 완전 이진 트리 (Complete Binary Tree)
const completeBinaryTree: TreeNode = {
  value: 1,
  left: {
    value: 2,
    left: { value: 4 },
    right: { value: 5 }
  },
  right: {
    value: 3,
    left: { value: 6 }
  }
};

// 편향 이진 트리 (Skewed Binary Tree)
const skewedBinaryTree: TreeNode = {
  value: 1,
  right: {
    value: 2,
    right: {
      value: 3,
      right: { value: 4 }
    }
  }
};
```

**포화 이진 트리**는 마지막 레벨까지 모든 노드가 채워진 상태이며, **완전 이진 트리**는 마지막 레벨을 제외하고 모든 레벨이 완전히 채워진 상태입니다. **편향 이진 트리**는 한쪽 방향으로만 노드가 연결된 형태입니다.

### 2. 이진 트리의 수학적 특성

이진 트리는 다음과 같은 중요한 수학적 특성을 가집니다.

```typescript
class BinaryTreeAnalyzer {
  // 트리 높이 계산
  static getHeight(node: TreeNode | undefined): number {
    if (!node) return -1;
    
    const leftHeight = this.getHeight(node.left);
    const rightHeight = this.getHeight(node.right);
    
    return Math.max(leftHeight, rightHeight) + 1;
  }

  // 노드 개수 계산
  static getNodeCount(node: TreeNode | undefined): number {
    if (!node) return 0;
    
    return 1 + this.getNodeCount(node.left) + this.getNodeCount(node.right);
  }

  // 포화 이진 트리 노드 개수 (높이 h일 때: 2^(h+1) - 1)
  static getFullBinaryTreeNodes(height: number): number {
    return Math.pow(2, height + 1) - 1;
  }
}
```

노드가 N개인 이진 트리의 최대 높이는 N-1이며, 포화/완전 이진 트리의 높이는 log N입니다. 이는 검색 성능에 직접적인 영향을 미치는 중요한 특성입니다.

### 3. 이진 트리 탐색 방법

이진 트리 탐색은 네 가지 주요 방법으로 분류됩니다.

```typescript
class TreeTraversal {
  // 중위 순회 (In-order): 왼쪽 → 부모 → 오른쪽
  static inOrder(node: TreeNode | undefined, result: number[] = []): number[] {
    if (node) {
      this.inOrder(node.left, result);
      result.push(node.value);
      this.inOrder(node.right, result);
    }
    return result;
  }

  // 전위 순회 (Pre-order): 부모 → 왼쪽 → 오른쪽
  static preOrder(node: TreeNode | undefined, result: number[] = []): number[] {
    if (node) {
      result.push(node.value);
      this.preOrder(node.left, result);
      this.preOrder(node.right, result);
    }
    return result;
  }

  // 후위 순회 (Post-order): 왼쪽 → 오른쪽 → 부모
  static postOrder(node: TreeNode | undefined, result: number[] = []): number[] {
    if (node) {
      this.postOrder(node.left, result);
      this.postOrder(node.right, result);
      result.push(node.value);
    }
    return result;
  }

  // 레벨 순회 (Level-order): 레벨별 순차 방문
  static levelOrder(root: TreeNode | undefined): number[] {
    if (!root) return [];
    
    const result: number[] = [];
    const queue: TreeNode[] = [root];
    
    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node.value);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    return result;
  }
}
```

각 탐색 방법은 서로 다른 용도로 활용됩니다. 중위 순회는 이진 탐색 트리에서 정렬된 순서로 값을 얻을 때 사용하며, 전위 순회는 트리 복사에, 후위 순회는 트리 삭제에, 레벨 순회는 BFS 알고리즘에 활용됩니다.

### 4. 실무 활용 사례

이진 트리는 다양한 자료구조와 알고리즘의 기초가 됩니다.

```typescript
// 이진 탐색 트리 (BST) 구현 예시
class BinarySearchTree {
  private root: TreeNode | undefined;

  insert(value: number): void {
    this.root = this.insertNode(this.root, value);
  }

  private insertNode(node: TreeNode | undefined, value: number): TreeNode {
    if (!node) {
      return { value };
    }

    if (value < node.value) {
      node.left = this.insertNode(node.left, value);
    } else if (value > node.value) {
      node.right = this.insertNode(node.right, value);
    }

    return node;
  }

  search(value: number): boolean {
    return this.searchNode(this.root, value);
  }

  private searchNode(node: TreeNode | undefined, value: number): boolean {
    if (!node) return false;
    
    if (value === node.value) return true;
    
    return value < node.value 
      ? this.searchNode(node.left, value)
      : this.searchNode(node.right, value);
  }
}

// 힙 구현에서의 이진 트리 활용
class MinHeap {
  private heap: number[] = [];

  insert(value: number): void {
    this.heap.push(value);
    this.heapifyUp(this.heap.length - 1);
  }

  private heapifyUp(index: number): void {
    const parentIndex = Math.floor((index - 1) / 2);
    
    if (parentIndex >= 0 && this.heap[parentIndex] > this.heap[index]) {
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      this.heapifyUp(parentIndex);
    }
  }
}
```

## 정리

| 특성 | 내용 | 시간 복잡도 |
|------|------|-------------|
| **포화 이진 트리** | 모든 레벨이 완전히 채워진 트리 | 검색: O(log N) |
| **완전 이진 트리** | 마지막 레벨 제외하고 모든 레벨이 채워진 트리 | 검색: O(log N) |
| **편향 이진 트리** | 한쪽 방향으로만 연결된 트리 | 검색: O(N) |
| **중위 순회** | 왼쪽 → 부모 → 오른쪽 순서 탐색 | O(N) |
| **전위 순회** | 부모 → 왼쪽 → 오른쪽 순서 탐색 | O(N) |
| **후위 순회** | 왼쪽 → 오른쪽 → 부모 순서 탐색 | O(N) |
| **레벨 순회** | 레벨별 순차 탐색 (BFS) | O(N) |

이진 트리는 균형이 잘 잡힌 형태일 때 O(log N)의 효율적인 검색 성능을 제공하며, 힙, BST, AVL 트리 등 다양한 고급 자료구조의 기반이 됩니다. 백엔드 개발에서 데이터베이스 인덱싱, 우선순위 큐, 정렬 알고리즘 등에 널리 활용되는 핵심 자료구조입니다.