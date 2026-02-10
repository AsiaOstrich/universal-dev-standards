---
source: ../../../../options/project-structure/go.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Go 专案结构

> **语言**: [English](../../../../options/project-structure/go.md) | 繁体中文

**上层标准**: [专案结构](../../../../core/project-structure.md)

---

## 概述

本文件定义遵循社群最佳实践的 Go 专案标准目录结构。它在简单性和可扩展性之间取得平衡，适用于小型服务和大型应用程式。

## 适用情境

- HTTP 服务和 API
- CLI 应用程式
- 微服务
- 系统工具
- 函式库和套件

## 目录结构

```
project-root/
├── cmd/                      # 应用程式进入点
│   ├── api/
│   │   └── main.go
│   └── cli/
│       └── main.go
├── internal/                 # 私有应用程式码
│   ├── config/
│   │   └── config.go
│   ├── domain/               # 业务逻辑
│   │   ├── user/
│   │   │   ├── user.go
│   │   │   ├── service.go
│   │   │   ├── repository.go
│   │   │   └── service_test.go
│   │   └── product/
│   ├── handler/              # HTTP 处理器
│   │   ├── user_handler.go
│   │   └── middleware/
│   ├── repository/           # 资料存取实作
│   │   ├── postgres/
│   │   └── redis/
│   └── server/
│       └── server.go
├── pkg/                      # 公开可重用套件
│   └── validator/
│       └── validator.go
├── api/                      # API 规格
│   └── openapi.yaml
├── scripts/                  # 建置/部署脚本
├── docs/                     # 文件
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

## 命名惯例

| 类型 | 惯例 | 范例 |
|------|------|------|
| 档案 | snake_case.go | `user_service.go` |
| 套件 | lowercase | `user`, `httphandler` |
| 汇出 | PascalCase | `UserService`, `CreateUser` |
| 未汇出 | camelCase | `userRepository`, `validateEmail` |
| 常数 | PascalCase 或 ALL_CAPS | `MaxRetries`, `DB_TIMEOUT` |
| 介面 | PascalCase + "er" 后缀 | `Reader`, `UserRepository` |

## 关键目录

### cmd/

应用程式进入点。每个子目录是一个独立的二进位档案：

```go
// cmd/api/main.go
package main

import (
    "log"
    "myproject/internal/config"
    "myproject/internal/server"
)

func main() {
    cfg, err := config.Load()
    if err != nil {
        log.Fatal(err)
    }

    srv := server.New(cfg)
    if err := srv.Run(); err != nil {
        log.Fatal(err)
    }
}
```

### internal/

无法被其他专案汇入的私有程式码。

### pkg/

可被其他专案汇入的公开套件。

## 领域层

### 实体

```go
// internal/domain/user/user.go
package user

import (
    "errors"
    "time"
)

var (
    ErrInvalidEmail = errors.New("invalid email format")
    ErrUserNotFound = errors.New("user not found")
    ErrEmailExists  = errors.New("email already exists")
)

type User struct {
    ID        string
    Email     string
    Name      string
    CreatedAt time.Time
}

func NewUser(email, name string) (*User, error) {
    if !isValidEmail(email) {
        return nil, ErrInvalidEmail
    }
    return &User{
        Email:     email,
        Name:      name,
        CreatedAt: time.Now(),
    }, nil
}
```

### Repository 介面

```go
// internal/domain/user/repository.go
package user

import "context"

type Repository interface {
    Create(ctx context.Context, user *User) error
    GetByID(ctx context.Context, id string) (*User, error)
    GetByEmail(ctx context.Context, email string) (*User, error)
}
```

### 服务

```go
// internal/domain/user/service.go
package user

import "context"

type Service struct {
    repo Repository
}

func NewService(repo Repository) *Service {
    return &Service{repo: repo}
}

func (s *Service) CreateUser(ctx context.Context, input CreateUserInput) (*User, error) {
    existing, _ := s.repo.GetByEmail(ctx, input.Email)
    if existing != nil {
        return nil, ErrEmailExists
    }

    user, err := NewUser(input.Email, input.Name)
    if err != nil {
        return nil, err
    }

    if err := s.repo.Create(ctx, user); err != nil {
        return nil, err
    }
    return user, nil
}
```

## 最佳实践

1. **接受介面，回传结构**
2. **保持 `main.go` 最小化** - 连接相依性，呼叫 `Run()`
3. **使用 `internal/` 存放私有程式码**
4. **在使用处定义介面** - 而非实作处
5. **错误包装** - 使用 `fmt.Errorf("context: %w", err)`
6. **Context 传播** - 所有层都传递 context

## 相关选项

- [Node.js](./nodejs.md) - Node.js 专案结构
- [Python](./python.md) - Python 专案结构
- [.NET](./dotnet.md) - .NET/C# 专案结构
- [Java](./java.md) - Java/Spring 专案结构

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
