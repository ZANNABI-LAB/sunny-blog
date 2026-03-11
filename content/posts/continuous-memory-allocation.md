---
title: "연속 메모리 할당 기법"
shortTitle: "메모리 할당"
date: "2026-03-11"
tags: ["memory-allocation", "operating-system", "fragmentation", "memory-management", "backend"]
category: "Backend"
summary: "운영체제에서 프로세스에 연속적인 메모리 공간을 할당하는 기법과 단편화 문제를 해결하는 방법들을 설명합니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/200"
references: ["https://en.wikipedia.org/wiki/Memory_management", "https://docs.kernel.org/admin-guide/mm/concepts.html"]
---

## 연속 메모리 할당이란?

연속 메모리 할당 기법(Continuous Memory Allocation)은 운영체제가 프로세스에 물리 메모리 상에서 연속적인 주소 공간을 할당하는 방법입니다. 이 방식을 사용하면 하나의 프로세스는 메모리에서 끊어지지 않는 연속적인 블록을 차지하게 됩니다.

이 기법은 메모리 관리를 단순화하고 메모리 접근 성능을 향상시킬 수 있지만, 메모리 단편화(fragmentation) 문제를 야기할 수 있습니다. 현대 운영체제에서는 가상 메모리와 페이징 기법을 주로 사용하지만, 연속 메모리 할당의 개념은 여전히 중요한 기초 지식입니다.

## 핵심 개념

### 1. 할당 방식의 종류

연속 메모리 할당은 크게 고정 크기 할당과 가변 크기 할당으로 구분됩니다.

```c
// 고정 크기 할당 예시 (파티션 크기: 1MB)
typedef struct {
    int partition_id;
    size_t size;        // 항상 1MB
    bool is_allocated;
    process_id_t pid;
} fixed_partition_t;

fixed_partition_t partitions[MAX_PARTITIONS] = {
    {0, 1024*1024, false, -1},
    {1, 1024*1024, false, -1},
    // ...
};
```

```c
// 가변 크기 할당 예시
typedef struct memory_block {
    size_t start_address;
    size_t size;
    bool is_free;
    process_id_t pid;
    struct memory_block* next;
} memory_block_t;

// 프로세스 요구 크기에 맞춰 동적 할당
memory_block_t* allocate_variable(size_t required_size) {
    memory_block_t* current = free_blocks;
    while (current != NULL) {
        if (current->is_free && current->size >= required_size) {
            return allocate_block(current, required_size);
        }
        current = current->next;
    }
    return NULL; // 할당 실패
}
```

고정 크기 방식은 관리가 단순하지만 내부 단편화가 발생하고, 가변 크기 방식은 메모리를 효율적으로 사용하지만 외부 단편화 문제가 있습니다.

### 2. 메모리 단편화 문제

메모리 단편화는 연속 메모리 할당에서 발생하는 핵심 문제입니다.

```c
// 외부 단편화 시뮬레이션
typedef struct {
    size_t total_free;     // 총 여유 공간: 400MB
    size_t largest_block;  // 최대 연속 블록: 150MB
    size_t request_size;   // 요청 크기: 200MB
} memory_state_t;

bool can_allocate(memory_state_t* state) {
    // 총 여유 공간은 충분하지만 연속 공간 부족
    return state->largest_block >= state->request_size; // false
}
```

```c
// 내부 단편화 계산
size_t calculate_internal_fragmentation(size_t requested, size_t allocated) {
    return allocated - requested;
}

// 예: 300MB 요청, 512MB 할당 → 212MB 내부 단편화
size_t wasted = calculate_internal_fragmentation(300, 512); // 212MB
```

외부 단편화는 사용 가능한 메모리가 여러 작은 조각으로 분산되어 큰 프로세스를 할당할 수 없는 상황이고, 내부 단편화는 할당된 메모리 블록 내에서 실제 사용하지 않는 공간이 낭비되는 현상입니다.

### 3. 메모리 배치 알고리즘

빈 메모리 공간이 여러 개 있을 때, 새로운 프로세스를 어디에 배치할지 결정하는 알고리즘들입니다.

```c
// First Fit: 첫 번째로 맞는 공간에 할당
memory_block_t* first_fit(size_t size) {
    memory_block_t* current = memory_list;
    while (current != NULL) {
        if (current->is_free && current->size >= size) {
            return current; // 즉시 반환
        }
        current = current->next;
    }
    return NULL;
}

// Best Fit: 가장 작은 적합한 공간에 할당
memory_block_t* best_fit(size_t size) {
    memory_block_t* current = memory_list;
    memory_block_t* best = NULL;
    
    while (current != NULL) {
        if (current->is_free && current->size >= size) {
            if (best == NULL || current->size < best->size) {
                best = current;
            }
        }
        current = current->next;
    }
    return best;
}

// Worst Fit: 가장 큰 공간에 할당
memory_block_t* worst_fit(size_t size) {
    memory_block_t* current = memory_list;
    memory_block_t* worst = NULL;
    
    while (current != NULL) {
        if (current->is_free && current->size >= size) {
            if (worst == NULL || current->size > worst->size) {
                worst = current;
            }
        }
        current = current->next;
    }
    return worst;
}
```

### 4. 메모리 압축과 해결 방안

외부 단편화를 해결하기 위한 방법들입니다.

```c
// 메모리 압축 (Compaction)
void compact_memory() {
    memory_block_t* write_ptr = memory_start;
    memory_block_t* read_ptr = memory_start;
    
    // 모든 할당된 블록을 메모리 앞쪽으로 이동
    while (read_ptr < memory_end) {
        if (!read_ptr->is_free) {
            if (write_ptr != read_ptr) {
                memcpy(write_ptr, read_ptr, read_ptr->size);
                update_process_address(read_ptr->pid, write_ptr);
            }
            write_ptr += read_ptr->size;
        }
        read_ptr += read_ptr->size;
    }
    
    // 남은 공간을 하나의 큰 자유 블록으로 설정
    create_free_block(write_ptr, memory_end - write_ptr);
}
```

```c
// 세그멘테이션과 페이징으로의 전환 예시
typedef struct {
    uint32_t base_address;
    uint32_t limit;
    bool is_valid;
} segment_t;

typedef struct {
    segment_t code_segment;
    segment_t data_segment;
    segment_t heap_segment;
    segment_t stack_segment;
} process_memory_t;
```

## 정리

| 구분 | 고정 크기 할당 | 가변 크기 할당 |
|------|----------------|----------------|
| **장점** | 관리 단순, 빠른 할당 | 메모리 효율성, 내부 단편화 없음 |
| **단점** | 내부 단편화 발생 | 외부 단편화, 복잡한 관리 |
| **적용** | 임베디드 시스템 | 범용 운영체제 |

**주요 배치 알고리즘 특성:**
- **First Fit**: 빠른 할당, 외부 단편화 보통
- **Best Fit**: 메모리 효율적, 작은 조각 생성
- **Worst Fit**: 큰 여유 공간 유지, 전체적 비효율

연속 메모리 할당은 현대 시스템에서 가상 메모리와 페이징으로 대체되었지만, 메모리 관리의 기본 원리를 이해하는 데 중요한 개념입니다.