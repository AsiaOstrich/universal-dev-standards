# Go Project Structure

> **Language**: English | [繁體中文](../../locales/zh-TW/options/project-structure/go.md)

**Parent Standard**: [Project Structure](../../core/project-structure.md)

---

## Overview

This document defines the standard directory structure for Go projects following community best practices. It balances simplicity with scalability, suitable for both small services and larger applications.

## Best For

- HTTP services and APIs
- CLI applications
- Microservices
- System tools
- Libraries and packages

## Directory Structure

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

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | snake_case.go | `user_service.go` |
| Packages | lowercase | `user`, `httphandler` |
| Exported | PascalCase | `UserService`, `CreateUser` |
| Unexported | camelCase | `userRepository`, `validateEmail` |
| Constants | PascalCase or ALL_CAPS | `MaxRetries`, `DB_TIMEOUT` |
| Interfaces | PascalCase + "er" suffix | `Reader`, `UserRepository` |

## Key Directories

### cmd/

Entry points for applications. Each subdirectory is a separate binary:

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

Private code that cannot be imported by other projects:

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

Public packages that can be imported by other projects:

```go
// pkg/validator/validator.go
package validator

import "regexp"

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

func IsValidEmail(email string) bool {
    return emailRegex.MatchString(email)
}
```

## Domain Layer

### Entity

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

### Repository Interface

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

### Service

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

## Repository Implementation

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

## Configuration

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

## Testing

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

## Best Practices

1. **Accept interfaces, return structs**
2. **Keep `main.go` minimal** - Wire dependencies, call `Run()`
3. **Use `internal/` for private code**
4. **Define interfaces where they're used** - Not where implemented
5. **Error wrapping** - Use `fmt.Errorf("context: %w", err)`
6. **Context propagation** - Pass context through all layers

## Related Options

- [Node.js](./nodejs.md) - Node.js project structure
- [Python](./python.md) - Python project structure
- [.NET](./dotnet.md) - .NET/C# project structure
- [Java](./java.md) - Java/Spring project structure

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
