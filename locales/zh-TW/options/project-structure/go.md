---
source: ../../../../options/project-structure/go.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: f52fa284d2cd
status: current
---

# Go 專案結構

> **語言**: [English](../../../../options/project-structure/go.md) | 繁體中文

**上層標準**: [專案結構](../../../../core/project-structure.md)

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
├── cmd/                      # Application entry points
│   ├── api/
│   │   └── main.go
│   └── cli/
│       └── main.go
├── internal/                 # Private application code
│   ├── config/
│   │   └── config.go
│   ├── domain/               # Business logic
│   │   ├── user/
│   │   │   ├── user.go
│   │   │   ├── service.go
│   │   │   ├── repository.go
│   │   │   └── service_test.go
│   │   └── product/
│   │       └── ...
│   ├── handler/              # HTTP handlers
│   │   ├── user_handler.go
│   │   └── middleware/
│   ├── repository/           # Data access implementations
│   │   ├── postgres/
│   │   │   └── user_repo.go
│   │   └── redis/
│   └── server/
│       └── server.go
├── pkg/                      # Public reusable packages
│   └── validator/
│       └── validator.go
├── api/                      # API specifications
│   └── openapi.yaml
├── scripts/                  # Build/deploy scripts
├── docs/                     # Documentation
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

無法被其他專案匯入的私有程式碼：

```go
// internal/domain/user/user.go
package user

import "time"

type User struct {
    ID        string
    Email     string
    Name      string
    CreatedAt time.Time
}

type CreateUserInput struct {
    Email string
    Name  string
}
```

### pkg/

可被其他專案匯入的公開套件：

```go
// pkg/validator/validator.go
package validator

import "regexp"

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

func IsValidEmail(email string) bool {
    return emailRegex.MatchString(email)
}
```

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
    UpdatedAt time.Time
}

func NewUser(email, name string) (*User, error) {
    if !isValidEmail(email) {
        return nil, ErrInvalidEmail
    }

    return &User{
        Email:     email,
        Name:      name,
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
    }, nil
}

func (u *User) UpdateName(name string) {
    u.Name = name
    u.UpdatedAt = time.Now()
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
    Update(ctx context.Context, user *User) error
    Delete(ctx context.Context, id string) error
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
    // Check if email exists
    existing, _ := s.repo.GetByEmail(ctx, input.Email)
    if existing != nil {
        return nil, ErrEmailExists
    }

    // Create new user
    user, err := NewUser(input.Email, input.Name)
    if err != nil {
        return nil, err
    }

    if err := s.repo.Create(ctx, user); err != nil {
        return nil, err
    }

    return user, nil
}

func (s *Service) GetUser(ctx context.Context, id string) (*User, error) {
    user, err := s.repo.GetByID(ctx, id)
    if err != nil {
        return nil, err
    }
    if user == nil {
        return nil, ErrUserNotFound
    }
    return user, nil
}
```

## HTTP Handler

```go
// internal/handler/user_handler.go
package handler

import (
    "encoding/json"
    "net/http"
    "myproject/internal/domain/user"
)

type UserHandler struct {
    service *user.Service
}

func NewUserHandler(service *user.Service) *UserHandler {
    return &UserHandler{service: service}
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var input user.CreateUserInput
    if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
        http.Error(w, "invalid request body", http.StatusBadRequest)
        return
    }

    u, err := h.service.CreateUser(r.Context(), input)
    if err != nil {
        switch err {
        case user.ErrEmailExists:
            http.Error(w, err.Error(), http.StatusConflict)
        case user.ErrInvalidEmail:
            http.Error(w, err.Error(), http.StatusBadRequest)
        default:
            http.Error(w, "internal error", http.StatusInternalServerError)
        }
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(u)
}

func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id") // Go 1.22+

    u, err := h.service.GetUser(r.Context(), id)
    if err != nil {
        if err == user.ErrUserNotFound {
            http.Error(w, err.Error(), http.StatusNotFound)
            return
        }
        http.Error(w, "internal error", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(u)
}
```

## Repository 實作

```go
// internal/repository/postgres/user_repo.go
package postgres

import (
    "context"
    "database/sql"
    "myproject/internal/domain/user"
)

type UserRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, u *user.User) error {
    query := `
        INSERT INTO users (id, email, name, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
    `
    _, err := r.db.ExecContext(ctx, query,
        u.ID, u.Email, u.Name, u.CreatedAt, u.UpdatedAt)
    return err
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*user.User, error) {
    query := `SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1`

    var u user.User
    err := r.db.QueryRowContext(ctx, query, id).Scan(
        &u.ID, &u.Email, &u.Name, &u.CreatedAt, &u.UpdatedAt)

    if err == sql.ErrNoRows {
        return nil, nil
    }
    if err != nil {
        return nil, err
    }
    return &u, nil
}
```

## 設定

```go
// internal/config/config.go
package config

import (
    "os"
    "strconv"
)

type Config struct {
    Port        int
    DatabaseURL string
    LogLevel    string
}

func Load() (*Config, error) {
    port, _ := strconv.Atoi(getEnv("PORT", "8080"))

    return &Config{
        Port:        port,
        DatabaseURL: getEnv("DATABASE_URL", ""),
        LogLevel:    getEnv("LOG_LEVEL", "info"),
    }, nil
}

func getEnv(key, fallback string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return fallback
}
```

## 測試

```go
// internal/domain/user/service_test.go
package user_test

import (
    "context"
    "testing"
    "myproject/internal/domain/user"
)

type mockRepo struct {
    users map[string]*user.User
}

func newMockRepo() *mockRepo {
    return &mockRepo{users: make(map[string]*user.User)}
}

func (m *mockRepo) Create(ctx context.Context, u *user.User) error {
    m.users[u.ID] = u
    return nil
}

func (m *mockRepo) GetByEmail(ctx context.Context, email string) (*user.User, error) {
    for _, u := range m.users {
        if u.Email == email {
            return u, nil
        }
    }
    return nil, nil
}

func TestService_CreateUser(t *testing.T) {
    repo := newMockRepo()
    service := user.NewService(repo)

    input := user.CreateUserInput{
        Email: "test@example.com",
        Name:  "Test User",
    }

    u, err := service.CreateUser(context.Background(), input)
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }

    if u.Email != input.Email {
        t.Errorf("expected email %s, got %s", input.Email, u.Email)
    }
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
