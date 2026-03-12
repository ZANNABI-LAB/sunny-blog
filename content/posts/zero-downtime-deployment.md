---
title: "무중단 배포: 서비스 중단 없이 안전하게 배포하는 방법"
shortTitle: "무중단 배포"
date: "2026-03-08"
tags: ["deployment", "devops", "blue-green", "rolling", "canary"]
category: "Infrastructure.Deployment"
summary: "서비스 다운타임 없이 새로운 버전을 배포하는 다양한 전략을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/195"
references: ["https://kubernetes.io/docs/concepts/workloads/controllers/deployment/", "https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-configurations.html", "https://martinfowler.com/bliki/BlueGreenDeployment.html"]
---

## 무중단 배포란?

무중단 배포(Zero-Downtime Deployment)는 서비스 중단 없이 새로운 버전의 애플리케이션을 운영 환경에 배포하는 기법입니다. 사용자는 서비스 중단을 경험하지 않으면서도 지속적으로 새로운 기능과 버그 수정을 제공받을 수 있습니다.

전통적인 배포 방식에서는 서버를 중단하고 새 버전을 배포한 후 다시 시작하는 과정에서 다운타임이 발생합니다. 하지만 24/7 서비스가 필수인 현대 웹 환경에서는 이러한 중단 시간이 비즈니스에 심각한 영향을 미칠 수 있습니다.

무중단 배포는 로드 밸런서, 컨테이너 오케스트레이션, 클라우드 인프라를 활용하여 트래픽을 지능적으로 관리하면서 배포를 수행합니다.

## 핵심 개념

### 1. 롤링 배포 (Rolling Deployment)

롤링 배포는 서버를 하나씩 순차적으로 업데이트하는 가장 기본적인 무중단 배포 방식입니다.

```yaml
# Kubernetes Rolling Update 예시
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    spec:
      containers:
      - name: app
        image: myapp:v2.0
```

**장점:**
- 추가 리소스 비용이 최소화됩니다
- 점진적 배포로 위험을 분산할 수 있습니다
- 문제 발생 시 즉시 중단 가능합니다

**단점:**
- 배포 중 두 버전이 동시 운영되어 하위 호환성이 필요합니다
- 일부 서버의 트래픽 부하가 증가할 수 있습니다

### 2. 블루/그린 배포 (Blue/Green Deployment)

블루/그린 배포는 현재 운영 환경(Blue)과 동일한 새로운 환경(Green)을 구성한 후, 트래픽을 한 번에 전환하는 방식입니다.

```typescript
// AWS Application Load Balancer 타겟 그룹 전환 예시
interface DeploymentConfig {
  blueTargetGroup: string;
  greenTargetGroup: string;
  listenerArn: string;
}

async function switchTraffic(config: DeploymentConfig) {
  // 1. Green 환경에 새 버전 배포
  await deployToGreen(config.greenTargetGroup);
  
  // 2. Health Check 확인
  const isHealthy = await checkHealthStatus(config.greenTargetGroup);
  
  if (isHealthy) {
    // 3. 트래픽 100% Green으로 전환
    await updateListener(config.listenerArn, config.greenTargetGroup);
    
    // 4. Blue 환경 정리 (선택사항)
    await cleanupBlue(config.blueTargetGroup);
  }
}
```

**장점:**
- 즉시 롤백이 가능합니다
- 운영 환경과 동일한 환경에서 테스트할 수 있습니다
- 두 버전이 동시 실행되지 않아 호환성 문제가 없습니다

**단점:**
- 인프라 비용이 두 배로 발생합니다
- 데이터베이스 마이그레이션이 복잡할 수 있습니다

### 3. 카나리 배포 (Canary Deployment)

카나리 배포는 새 버전을 일부 사용자에게만 점진적으로 배포하여 안전성을 검증하는 방식입니다.

```typescript
interface CanaryConfig {
  initialPercentage: number;
  incrementStep: number;
  evaluationPeriod: number; // 분 단위
  errorThreshold: number; // 오류율 임계값
}

class CanaryDeployment {
  async deploy(config: CanaryConfig) {
    let currentPercentage = config.initialPercentage;
    
    while (currentPercentage <= 100) {
      // 트래픽 비율 조정
      await this.adjustTrafficWeight(currentPercentage);
      
      // 평가 기간 대기
      await this.wait(config.evaluationPeriod);
      
      // 메트릭 평가
      const metrics = await this.evaluateMetrics();
      
      if (metrics.errorRate > config.errorThreshold) {
        await this.rollback();
        throw new Error('Canary deployment failed');
      }
      
      currentPercentage += config.incrementStep;
    }
  }
  
  private async adjustTrafficWeight(percentage: number) {
    // 로드 밸런서 가중치 조정 로직
  }
}
```

**장점:**
- 위험을 최소화하면서 점진적 배포가 가능합니다
- A/B 테스트나 성능 비교에 유용합니다
- 실제 사용자 트래픽으로 검증할 수 있습니다

**단점:**
- 모니터링과 메트릭 수집 시스템이 필요합니다
- 배포 시간이 길어집니다

### 4. 배포 전략 선택 가이드

각 배포 전략은 상황에 따라 적절히 선택해야 합니다:

```typescript
interface DeploymentStrategy {
  type: 'rolling' | 'blue-green' | 'canary';
  riskLevel: 'low' | 'medium' | 'high';
  cost: 'low' | 'medium' | 'high';
  rollbackSpeed: 'fast' | 'medium' | 'slow';
}

const strategies: DeploymentStrategy[] = [
  {
    type: 'rolling',
    riskLevel: 'medium',
    cost: 'low',
    rollbackSpeed: 'medium'
  },
  {
    type: 'blue-green',
    riskLevel: 'low',
    cost: 'high',
    rollbackSpeed: 'fast'
  },
  {
    type: 'canary',
    riskLevel: 'low',
    cost: 'medium',
    rollbackSpeed: 'medium'
  }
];
```

**롤링 배포 적합 상황:**
- 리소스 제약이 있는 환경
- 점진적 버그 수정 배포
- 소규모 팀의 정기 업데이트

**블루/그린 배포 적합 상황:**
- 대규모 아키텍처 변경
- 중요한 보안 업데이트
- 빠른 롤백이 필수인 상황

**카나리 배포 적합 상황:**
- 새로운 기능의 사용자 반응 테스트
- 성능 최적화 검증
- 고위험 변경 사항 배포

## 정리

무중단 배포는 현대 소프트웨어 개발에서 필수적인 기법입니다:

| 배포 방식 | 비용 | 위험도 | 롤백 속도 | 적용 상황 |
|-----------|------|--------|-----------|-----------|
| **롤링** | 낮음 | 중간 | 중간 | 일반적인 업데이트, 버그 수정 |
| **블루/그린** | 높음 | 낮음 | 빠름 | 대규모 변경, 중요 업데이트 |
| **카나리** | 중간 | 낮음 | 중간 | 신기능 검증, A/B 테스트 |

성공적인 무중단 배포를 위해서는 모니터링, 헬스 체크, 자동화된 롤백 시스템이 필수적입니다. 또한 팀의 기술 역량과 인프라 환경을 고려하여 적절한 전략을 선택하는 것이 중요합니다.