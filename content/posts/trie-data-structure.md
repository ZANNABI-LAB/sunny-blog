---
title: "트라이(Trie) 자료구조: 문자열 탐색을 위한 트리 구조"
shortTitle: "트라이 자료구조"
date: "2026-03-20"
tags: ["trie", "data-structure", "string-search", "autocomplete", "tree-structure"]
category: "Backend"
summary: "문자열을 효율적으로 저장하고 탐색하기 위한 트리 형태의 자료구조입니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/227"
references: ["https://en.wikipedia.org/wiki/Trie", "https://docs.oracle.com/javase/tutorial/collections/implementations/map.html"]
---

## 트라이(Trie)란?

트라이(Trie)는 문자열을 저장하고 효율적으로 탐색하기 위한 트리 형태의 자료구조입니다. 접두사 트리(Prefix Tree)라고도 불리며, 각 노드가 문자열의 접두사를 나타내는 특징을 가집니다.

트라이는 검색어 자동완성, 사전 찾기, 맞춤법 검사기 등에서 널리 사용됩니다. 단순한 문자열 비교에 비해 탐색 성능이 우수하지만, 각 노드가 모든 가능한 문자에 대한 링크를 보관해야 하므로 메모리 사용량이 많다는 특징이 있습니다.

## 핵심 개념

### 1. 트라이의 구조

트라이는 다음과 같은 구조적 특성을 가집니다:

- **루트 노드**: 항상 빈 문자열을 나타내며, 모든 문자열의 시작점입니다
- **간선**: 각 간선은 하나의 문자를 나타내며, 부모에서 자식으로의 경로를 의미합니다
- **노드 값**: 루트에서 해당 노드까지의 경로상 문자들을 연결한 문자열입니다

```java
class Node {
    public String value;
    public Map<String, Node> children;
    
    public Node(String value) {
        this.value = value;
        this.children = new HashMap<>();
    }
}
```

### 2. 문자열 삽입과 탐색

트라이에서 문자열을 삽입하고 탐색하는 과정은 문자 단위로 진행됩니다:

```java
class Trie {
    private final Node root = new Node("");
    
    public void insert(String str) {
        Node current = root;
        for (String ch : str.split("")) {
            if (!current.children.containsKey(ch)) {
                current.children.put(ch, new Node(current.value + ch));
            }
            current = current.children.get(ch);
        }
    }
    
    public boolean has(String str) {
        Node current = root;
        for (String ch : str.split("")) {
            if (!current.children.containsKey(ch)) {
                return false;
            }
            current = current.children.get(ch);
        }
        return true;
    }
}
```

### 3. 시간 복잡도와 공간 복잡도

트라이의 성능 특성을 이해하면 적절한 사용 시기를 판단할 수 있습니다:

**시간 복잡도:**
- 삽입: O(m) - m은 삽입할 문자열의 길이
- 탐색: O(m) - m은 탐색할 문자열의 길이
- 접두사 탐색: O(p) - p는 접두사의 길이

**공간 복잡도:**
- 최악의 경우: O(ALPHABET_SIZE * N * M)
- N은 저장된 문자열의 개수, M은 평균 문자열 길이

```java
@Test
void triePerformanceTest() {
    Trie trie = new Trie();
    
    // 문자열들 삽입
    trie.insert("cat");
    trie.insert("car");
    trie.insert("card");
    
    // 접두사 "ca"를 가진 모든 문자열을 빠르게 찾을 수 있음
    assertThat(trie.has("ca")).isTrue();   // 접두사 존재
    assertThat(trie.has("cat")).isTrue();  // 완전한 문자열 존재
    assertThat(trie.has("dog")).isFalse(); // 존재하지 않는 문자열
}
```

### 4. 실제 활용 사례

트라이는 다음과 같은 상황에서 특히 유용합니다:

**자동완성 기능:**
```java
public List<String> getAutoComplete(String prefix) {
    List<String> results = new ArrayList<>();
    Node current = root;
    
    // 접두사까지 이동
    for (String ch : prefix.split("")) {
        if (!current.children.containsKey(ch)) {
            return results; // 접두사가 존재하지 않음
        }
        current = current.children.get(ch);
    }
    
    // 접두사 이후의 모든 가능한 완성어 수집
    collectAllWords(current, results);
    return results;
}
```

**IP 라우팅 테이블:**
네트워크에서 IP 주소의 최장 접두사 매칭에 활용됩니다.

**사전 검색:**
단어의 존재 여부를 빠르게 확인하고, 유사한 단어들을 효율적으로 찾을 수 있습니다.

## 정리

| 특징 | 내용 |
|------|------|
| **장점** | • 접두사 기반 탐색 O(m)<br>• 자동완성 구현 용이<br>• 사전 순 정렬된 결과 제공 |
| **단점** | • 높은 메모리 사용량<br>• 희소한 데이터에 비효율적<br>• 캐시 지역성 부족 |
| **적용 분야** | • 검색어 자동완성<br>• 맞춤법 검사기<br>• IP 라우팅 테이블<br>• 사전/전화번호부 |
| **시간 복잡도** | 삽입/탐색 모두 O(문자열 길이) |

트라이는 접두사 기반의 문자열 처리가 빈번한 시스템에서 강력한 성능을 발휘하는 자료구조입니다. 메모리 사용량을 고려하여 적절한 상황에서 활용한다면 사용자 경험을 크게 향상시킬 수 있습니다.