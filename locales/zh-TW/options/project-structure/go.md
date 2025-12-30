---
source: ../../../../options/project-structure/go.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Go 專案結構

> **語言**: [English](../../../../options/project-structure/go.md) | 繁體中文

**上層標準**: [專案結構](../../core/project-structure.md)

---

## 概述

本文件定義遵循社群最佳實踐的 Go 專案標準目錄結構。它在簡單性和可擴展性之間取得平衡，適用於小型服務和大型應用程式。

## 適用情境

- HTTP 服務和 API
- CLI 應用程式
- 微服務
- 系統工具
- 函式庫和套件

## 目錄結構

```
project-root/
├── cmd/                      # 應用程式進入點
│   ├── api/
│   │   └── main.go
│   └── cli/
│       └── main.go
├── internal/                 # 私有應用程式碼
│   ├── config/
│   │   └── config.go
│   ├── domain/               # 業務邏輯
│   │   ├── user/
│   │   │   ├── user.go
│   │   │   ├── service.go
│   │   │   ├── repository.go
│   │   │   └── service_test.go
│   │   └── product/
│   ├── handler/              # HTTP 處理器
│   │   ├── user_handler.go
│   │   └── middleware/
│   ├── repository/           # 資料存取實作
│   │   ├── postgres/
│   │   └── redis/
│   └── server/
│       └── server.go
├── pkg/                      # 公開可重用套件
│   └── validator/
│       └── validator.go
├── api/                      # API 規格
│   └── openapi.yaml
├── scripts/                  # 建置/部署腳本
├── docs/                     # 文件
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

## 命名慣例

| 類型 | 慣例 | 範例 |
|------|------|------|
| 檔案 | snake_case.go | `user_service.go` |
| 套件 | lowercase | `user`, `httphandler` |
| 匯出 | PascalCase | `UserService`, `CreateUser` |
| 未匯出 | camelCase | `userRepository`, `validateEmail` |
| 常數 | PascalCase 或 ALL_CAPS | `MaxRetries`, `DB_TIMEOUT` |
| 介面 | PascalCase + "er" 後綴 | `Reader`, `UserRepository` |

## 關鍵目錄

### cmd/

應用程式進入點。每個子目錄是一個獨立的二進位檔案：

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

無法被其他專案匯入的私有程式碼。

### pkg/

可被其他專案匯入的公開套件。

## 領域層

### 實體

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

### 服務

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

## 最佳實踐

1. **接受介面，回傳結構**
2. **保持 `main.go` 最小化** - 連接相依性，呼叫 `Run()`
3. **使用 `internal/` 存放私有程式碼**
4. **在使用處定義介面** - 而非實作處
5. **錯誤包裝** - 使用 `fmt.Errorf("context: %w", err)`
6. **Context 傳播** - 所有層都傳遞 context

## 相關選項

- [Node.js](./nodejs.md) - Node.js 專案結構
- [Python](./python.md) - Python 專案結構
- [.NET](./dotnet.md) - .NET/C# 專案結構
- [Java](./java.md) - Java/Spring 專案結構

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
