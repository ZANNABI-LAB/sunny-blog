---
title: "인증과 인가: 웹 보안의 핵심 개념과 구현"
shortTitle: "인증과 인가"
date: "2026-03-07"
tags: ["authentication", "authorization", "web-security", "access-control", "rbac"]
category: "Security"
summary: "사용자 신원 확인부터 권한 관리까지, 웹 애플리케이션 보안의 기본이 되는 인증과 인가 개념을 살펴봅니다."
author: "신중선"
source: "maeil-mail"
sourceUrl: "https://www.maeil-mail.kr/question/192"
references: ["https://auth0.com/intro-to-iam/what-is-authentication", "https://developer.mozilla.org/en-US/docs/Web/Security", "https://oauth.net/2/"]
---

## 인증과 인가란?

인증(Authentication)과 인가(Authorization)는 웹 애플리케이션 보안의 핵심 개념입니다. 인증은 "사용자가 누구인지 확인하는 과정"이고, 인가는 "사용자가 특정 자원에 접근할 권한이 있는지 확인하는 과정"입니다.

일상생활에서 비유하면, 공항에서 신분증을 확인하는 것이 인증이고, 탑승권을 확인하여 특정 항공편에 탑승할 수 있는지 검사하는 것이 인가입니다. 두 과정 모두 통과해야만 원하는 자원(항공기 탑승)에 접근할 수 있습니다.

웹 개발에서는 이 두 개념이 함께 작동하여 애플리케이션의 보안을 보장하며, 특히 프론트엔드에서는 사용자 경험과 보안을 동시에 고려해야 합니다.

## 핵심 개념

### 1. 인증(Authentication) 메커니즘

인증은 사용자의 신원을 검증하는 과정으로, 다양한 방식이 존재합니다.

```typescript
// JWT 기반 인증 구현 예시
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    return response.json();
  }

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${refreshToken}` }
    });

    return response.json().then(data => data.token);
  }
}
```

비밀번호 기반 인증 외에도 생체 인증(WebAuthn API), OTP 인증, 소셜 로그인 등이 있으며, 보안 강화를 위해 MFA(Multi-Factor Authentication)가 널리 사용됩니다.

### 2. 인가(Authorization) 시스템

인가는 인증된 사용자가 특정 리소스에 접근할 권한을 확인하는 과정입니다.

```typescript
// 역할 기반 권한 확인 시스템
enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user'
}

interface Permission {
  resource: string;
  actions: string[];
}

class AuthorizationService {
  private rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.ADMIN]: [
      { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'reports', actions: ['read', 'export'] }
    ],
    [UserRole.MANAGER]: [
      { resource: 'users', actions: ['read', 'update'] },
      { resource: 'reports', actions: ['read'] }
    ],
    [UserRole.USER]: [
      { resource: 'profile', actions: ['read', 'update'] }
    ]
  };

  hasPermission(userRole: UserRole, resource: string, action: string): boolean {
    const permissions = this.rolePermissions[userRole] || [];
    return permissions.some(permission => 
      permission.resource === resource && 
      permission.actions.includes(action)
    );
  }
}
```

### 3. 접근 제어 방식

대표적인 접근 제어 방식으로 RBAC, ABAC, ReBAC가 있습니다.

```typescript
// RBAC (Role-Based Access Control) 구현
interface RBACContext {
  user: User;
  roles: string[];
}

class RBACGuard {
  canAccess(context: RBACContext, requiredRole: string): boolean {
    return context.roles.includes(requiredRole);
  }
}

// ABAC (Attribute-Based Access Control) 구현
interface ABACContext {
  user: User;
  resource: Resource;
  environment: Environment;
  action: string;
}

class ABACEngine {
  evaluate(context: ABACContext, policy: Policy): boolean {
    // 사용자 속성, 리소스 속성, 환경 정보를 종합하여 판단
    return policy.rules.every(rule => {
      switch (rule.type) {
        case 'user-attribute':
          return this.checkUserAttribute(context.user, rule);
        case 'time-based':
          return this.checkTimeConstraint(context.environment, rule);
        case 'resource-ownership':
          return context.resource.ownerId === context.user.id;
        default:
          return false;
      }
    });
  }
}
```

### 4. 프론트엔드 보안 고려사항

프론트엔드에서는 토큰 저장, Route Guard, API 호출 보안 등을 고려해야 합니다.

```typescript
// React Router와 함께 사용하는 Route Guard 예시
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const authService = new AuthorizationService();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !authService.hasPermission(user.role, 'page', 'access')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// 사용 예시
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

## 정리

| 구분 | 인증(Authentication) | 인가(Authorization) |
|------|---------------------|-------------------|
| **목적** | 사용자 신원 확인 | 접근 권한 확인 |
| **질문** | "누구인가?" | "무엇을 할 수 있는가?" |
| **방식** | 비밀번호, 생체인증, MFA | RBAC, ABAC, ReBAC |
| **구현 위치** | 로그인 과정 | API 호출, 페이지 접근 시 |

**핵심 포인트:**
- 인증이 먼저 수행된 후 인가가 진행됩니다
- 프론트엔드에서는 사용자 경험을 해치지 않으면서도 보안을 유지해야 합니다
- 토큰은 안전한 곳에 저장하고, 만료 시 자동 갱신하는 메커니즘이 필요합니다
- 접근 제어 방식은 애플리케이션의 복잡도와 보안 요구사항에 따라 선택해야 합니다