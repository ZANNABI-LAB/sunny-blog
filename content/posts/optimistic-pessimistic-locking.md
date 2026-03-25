---
title: "낙관적 락과 비관적 락: 데이터베이스 동시성 제어 기법"
shortTitle: "낙관적/비관적 락"
date: "2026-03-25"
tags: ["database", "concurrency", "locking", "transaction", "data-integrity"]
category: "Backend"
summary: "데이터베이스에서 동시성 제어를 위한 낙관적 락과 비관적 락의 개념과 적용 시나리오를 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/243"
references: ["https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/data-concurrency-and-consistency.html", "https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html", "https://www.postgresql.org/docs/current/mvcc.html"]
---

## 낙관적 락과 비관적 락이란?

낙관적 락과 비관적 락은 데이터베이스에서 동시성 제어를 위한 핵심 기법입니다. 여러 트랜잭션이 동시에 동일한 데이터에 접근할 때 발생할 수 있는 충돌을 해결하고, 데이터 무결성을 보장하는 역할을 합니다.

두 방식은 근본적으로 다른 철학을 가지고 있습니다. 낙관적 락은 "충돌이 거의 발생하지 않을 것"이라고 가정하고, 비관적 락은 "충돌이 자주 발생할 것"이라고 가정합니다. 이러한 차이로 인해 각각 다른 상황에서 유리한 성능을 보입니다.

## 핵심 개념

### 1. 낙관적 락 (Optimistic Lock)

낙관적 락은 데이터를 읽을 때 락을 설정하지 않고, 수정 시점에 데이터 변경 여부를 확인하는 방식입니다.

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  version: number; // 버전 컬럼
}

// JPA 예시
@Entity
public class Product {
    @Id
    private Long id;
    
    private String name;
    private BigDecimal price;
    
    @Version // 낙관적 락을 위한 버전 컬럼
    private Long version;
}

// 업데이트 시도
public void updateProduct(Long id, String newName) {
    Product product = productRepository.findById(id);
    product.setName(newName);
    
    try {
        productRepository.save(product); // 버전 충돌 시 예외 발생
    } catch (OptimisticLockingFailureException e) {
        // 재시도 로직 또는 사용자에게 알림
        handleOptimisticLockFailure();
    }
}
```

낙관적 락의 특징:
- 데이터베이스 락을 사용하지 않음
- Version 컬럼이나 Timestamp를 이용한 충돌 감지
- 충돌 발생 시 애플리케이션 레벨에서 처리 필요

### 2. 비관적 락 (Pessimistic Lock)

비관적 락은 트랜잭션 시작 시점에 락을 설정하여 다른 트랜잭션의 접근을 차단하는 방식입니다.

```typescript
// JPA 비관적 락 예시
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT p FROM Product p WHERE p.id = :id")
Product findByIdWithPessimisticLock(@Param("id") Long id);

// SQL 레벨 예시
@Transactional
public void updateProductWithLock(Long id, String newName) {
    // SELECT ... FOR UPDATE로 X-Lock 설정
    Product product = productRepository.findByIdWithPessimisticLock(id);
    product.setName(newName);
    productRepository.save(product);
} // 트랜잭션 종료 시 락 해제
```

비관적 락의 종류:
- **공유 락 (S-Lock)**: 읽기는 허용, 쓰기는 차단
- **베타 락 (X-Lock)**: 읽기, 쓰기 모두 차단

```sql
-- 공유 락
SELECT * FROM products WHERE id = 1 FOR SHARE;

-- 베타 락  
SELECT * FROM products WHERE id = 1 FOR UPDATE;
```

### 3. 성능과 적용 시나리오

각 락 방식의 성능 특성과 적합한 상황을 비교해보겠습니다.

```typescript
// 낙관적 락이 유리한 경우 - 조회 위주 시스템
class ReadHeavyService {
    // 대부분 읽기 작업, 간헐적 업데이트
    async getProducts(): Promise<Product[]> {
        return await this.productRepository.findAll(); // 락 없음
    }
    
    async updateProduct(id: number, data: ProductData): Promise<void> {
        try {
            await this.productRepository.updateWithVersion(id, data);
        } catch (OptimisticLockError) {
            // 충돌 시 재시도
            await this.retryUpdate(id, data);
        }
    }
}

// 비관적 락이 유리한 경우 - 높은 동시성 업데이트
class InventoryService {
    // 재고 차감 - 동시 접근 빈발
    async decreaseStock(productId: number, quantity: number): Promise<void> {
        return await this.transactionManager.withLock(async () => {
            const product = await this.productRepository
                .findByIdWithLock(productId); // X-Lock 설정
            
            if (product.stock < quantity) {
                throw new InsufficientStockError();
            }
            
            product.stock -= quantity;
            await this.productRepository.save(product);
        });
    }
}
```

### 4. 실무 적용 가이드

각 락 방식의 선택 기준과 주의사항을 정리하면 다음과 같습니다.

```typescript
// 낙관적 락 적용 예시 - 사용자 프로필 업데이트
class UserProfileService {
    async updateProfile(userId: number, profileData: ProfileData): Promise<void> {
        const maxRetries = 3;
        let attempts = 0;
        
        while (attempts < maxRetries) {
            try {
                const user = await this.userRepository.findById(userId);
                user.updateProfile(profileData);
                await this.userRepository.save(user);
                return;
            } catch (OptimisticLockError) {
                attempts++;
                if (attempts >= maxRetries) {
                    throw new ConcurrentUpdateError();
                }
                // 재시도 전 대기
                await this.delay(100 * attempts);
            }
        }
    }
}

// 비관적 락 적용 예시 - 포인트 시스템
class PointService {
    async usePoints(userId: number, amount: number): Promise<void> {
        await this.transactionManager.withTransaction(async () => {
            // 즉시 락 획득으로 동시성 제어
            const user = await this.userRepository
                .findByIdWithPessimisticLock(userId);
            
            if (user.points < amount) {
                throw new InsufficientPointsError();
            }
            
            user.points -= amount;
            await this.userRepository.save(user);
        });
    }
}
```

## 정리

| 구분 | 낙관적 락 | 비관적 락 |
|------|-----------|-----------|
| **기본 가정** | 충돌 발생 가능성 낮음 | 충돌 발생 가능성 높음 |
| **락 사용** | 데이터베이스 락 없음 | S-Lock, X-Lock 사용 |
| **충돌 처리** | 애플리케이션에서 재시도 | 데이터베이스에서 대기 |
| **성능** | 일반적으로 높음 (충돌 시 저하) | 락 대기로 인한 성능 저하 |
| **적용 시나리오** | 읽기 위주, 낮은 동시성 | 쓰기 위주, 높은 동시성 |
| **데이터 일관성** | 충돌 감지 후 처리 | 사전 방지 |

두 방식 모두 데이터 무결성을 보장하지만, 시스템의 특성에 따라 적절한 선택이 필요합니다. 읽기 작업이 많고 업데이트 충돌이 드문 환경에서는 낙관적 락이, 동시 업데이트가 빈번한 환경에서는 비관적 락이 더 효과적입니다.