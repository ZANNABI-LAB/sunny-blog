---
title: "Infrastructure as Code(IaC) - 코드로 관리하는 인프라"
shortTitle: "Infrastructure as Code"
date: "2026-03-17"
tags: ["infrastructure-as-code", "iac", "devops", "automation", "terraform"]
category: "Infrastructure"
summary: "코드를 통해 인프라를 프로비저닝하고 관리하는 IaC의 핵심 개념과 선언적/명령형 방식을 알아봅니다"
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/219"
references: ["https://docs.aws.amazon.com/whitepapers/latest/introduction-devops-aws/infrastructure-as-code.html", "https://www.terraform.io/intro", "https://docs.ansible.com/ansible/latest/user_guide/playbooks_intro.html"]
---

## Infrastructure as Code(IaC)란?

Infrastructure as Code(IaC)는 수동 프로세스 대신 코드를 통해 인프라를 프로비저닝하고 관리하는 방법입니다. 전통적인 인프라 관리는 서버 설정, 네트워크 구성, 데이터베이스 설치 등을 수동으로 수행했지만, IaC는 이러한 작업들을 코드로 정의하여 자동화합니다.

기존의 수동 설정 방식은 반복 작업이 많고 휴먼 에러가 발생하기 쉬우며, 인프라 설정을 별도로 문서화해 관리해야 하는 번거로움이 있습니다. IaC는 이러한 문제를 해결하기 위해 등장했으며, 인프라를 코드로 관리함으로써 일관성을 보장하고 운영 효율성을 크게 높일 수 있습니다.

## 핵심 개념

### 1. 선언적(Declarative) 방식

선언적 방식은 최종 상태를 정의하면 IaC 도구가 이를 자동으로 구성하는 방식입니다. 사용자는 "무엇을" 원하는지만 기술하고, "어떻게" 구현할지는 도구가 알아서 처리합니다.

```hcl
# Terraform 예시 - AWS EC2 인스턴스 생성
resource "aws_instance" "web_server" {
  ami           = "ami-0c94855ba95b798c7"
  instance_type = "t2.micro"
  
  tags = {
    Name = "WebServer"
    Environment = "Production"
  }
}

resource "aws_security_group" "web_sg" {
  name = "web-security-group"
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

대표적인 도구로는 **Terraform**과 **AWS CloudFormation**이 있으며, 현재 상태와 원하는 상태를 비교하여 차이점만 적용하는 특징이 있습니다.

### 2. 명령형(Imperative) 방식

명령형 방식은 구성 방법을 직접 정의하는 방식입니다. 사용자가 인프라를 설정하는 단계를 순차적으로 코드로 정의하며, 명령어 기반으로 실행됩니다.

```yaml
# Ansible 예시 - 웹서버 설정
- name: Install and configure web server
  hosts: webservers
  tasks:
    - name: Install Apache
      yum:
        name: httpd
        state: present
    
    - name: Start Apache service
      service:
        name: httpd
        state: started
        enabled: yes
    
    - name: Deploy website files
      copy:
        src: /local/website/
        dest: /var/www/html/
```

대표적인 도구로는 **Ansible**과 **AWS CDK** 등이 있으며, 실행 순서와 과정을 명확하게 제어할 수 있는 장점이 있습니다.

### 3. 상태 관리와 버전 관리

IaC의 핵심은 인프라의 현재 상태를 추적하고 관리하는 것입니다. Terraform의 경우 상태 파일(terraform.tfstate)을 통해 인프라의 현재 상태를 기록합니다.

```typescript
// AWS CDK 예시 - TypeScript
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib';

export class WebServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const vpc = new ec2.Vpc(this, 'WebVPC', {
      maxAzs: 2,
      natGateways: 1
    });
    
    const instance = new ec2.Instance(this, 'WebInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux(),
    });
  }
}
```

### 4. 주요 장점과 고려사항

**장점:**
- **형상 관리**: Git과 같은 도구로 변경 사항 추적 가능
- **협업 개선**: 코드 리뷰를 통한 인프라 변경 검토
- **자동화**: 수동 작업 없이 코드 실행만으로 인프라 구축
- **재사용성**: 코드 재사용으로 시간 절약 및 일관성 보장

**고려사항:**
- **학습 곡선**: 다양한 도구의 사용법 습득 필요
- **상태 관리 복잡성**: 인프라 상태 동기화 및 충돌 해결
- **디버깅 어려움**: 문제 발생 시 원인 파악의 복잡성

## 정리

| 구분 | 선언적 방식 | 명령형 방식 |
|------|-------------|-------------|
| **특징** | 최종 상태 정의 | 실행 과정 정의 |
| **대표 도구** | Terraform, CloudFormation | Ansible, AWS CDK |
| **장점** | 간단한 정의, 자동 최적화 | 세밀한 제어, 명확한 순서 |
| **적용 영역** | 리소스 프로비저닝 | 구성 관리, 배포 자동화 |

Infrastructure as Code는 현대적인 DevOps 환경에서 필수적인 기술로, 인프라의 일관성과 안정성을 보장하면서 개발 및 운영 효율성을 크게 향상시킵니다. 선언적 방식과 명령형 방식의 특성을 이해하고 프로젝트 요구사항에 맞는 도구를 선택하는 것이 중요합니다.