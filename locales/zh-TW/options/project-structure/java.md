---
source: ../../../../options/project-structure/java.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Java 專案結構

> **語言**: [English](../../../options/project-structure/java.md) | 繁體中文

**上層標準**: [專案結構](../../core/project-structure.md)

---

## 概述

本文件定義 Java 專案的標準目錄結構，特別是使用 Spring Boot 的專案。它遵循以功能為基礎的套件組織，促進可維護性和清晰的邊界。

## 適用情境

- Spring Boot 應用程式
- 企業級 Java 應用程式
- REST 和 GraphQL API
- 微服務
- Maven/Gradle 專案

## 目錄結構

```
project-root/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/company/project/
│   │   │       ├── Application.java          # 進入點
│   │   │       ├── config/                   # 設定類別
│   │   │       │   ├── SecurityConfig.java
│   │   │       │   └── WebConfig.java
│   │   │       ├── modules/                  # 功能模組
│   │   │       │   ├── users/
│   │   │       │   │   ├── User.java         # 實體
│   │   │       │   │   ├── UserController.java
│   │   │       │   │   ├── UserService.java
│   │   │       │   │   ├── UserRepository.java
│   │   │       │   │   └── dto/
│   │   │       │   └── products/
│   │   │       ├── shared/                   # 共用程式碼
│   │   │       │   ├── exception/
│   │   │       │   └── util/
│   │   │       └── infrastructure/           # 外部整合
│   │   └── resources/
│   │       ├── application.yml
│   │       └── application-dev.yml
│   └── test/
│       └── java/
│           └── com/company/project/
├── docs/
├── pom.xml                    # Maven
├── build.gradle               # 或 Gradle
└── README.md
```

## 命名慣例

| 類型 | 慣例 | 範例 |
|------|------|------|
| 檔案 | PascalCase.java | `UserService.java` |
| 套件 | lowercase | `com.company.project.users` |
| 類別 | PascalCase | `UserService` |
| 介面 | PascalCase | `UserRepository`（無 I 前綴）|
| 方法 | camelCase | `createUser()` |
| 常數 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |

## 套件組織

### 依功能組織（建議）

```
com.company.project.modules.users   # 好：功能導向
com.company.project.modules.products

com.company.project.services        # 避免：技術層導向
com.company.project.repositories
```

## Spring Boot 層次

### 實體

```java
// com/company/project/modules/users/User.java
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    protected User() {} // For JPA

    public User(String email, String name) {
        this.email = email;
        this.name = name;
    }
}
```

### 服務

```java
// com/company/project/modules/users/UserService.java
@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user = new User(request.email(), request.name());
        return userRepository.save(user);
    }
}
```

### 控制器

```java
// com/company/project/modules/users/UserController.java
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        User user = userService.createUser(request);
        return UserResponse.from(user);
    }
}
```

### DTO

```java
// com/company/project/modules/users/dto/CreateUserRequest.java
public record CreateUserRequest(
    @NotBlank @Email String email,
    @NotBlank String name
) {}
```

## 設定

### application.yml

```yaml
spring:
  application:
    name: myproject
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
```

## 最佳實踐

1. **建構子注入** - 優先於欄位注入
2. **依功能組織套件** - 而非技術層
3. **DTO 分離** - 永遠不直接暴露實體
4. **DTO 使用 Records** - 不可變、簡潔
5. **使用 `@Transactional(readOnly = true)`** - 用於讀取操作

## 相關選項

- [Node.js](./nodejs.md) - Node.js 專案結構
- [Python](./python.md) - Python 專案結構
- [.NET](./dotnet.md) - .NET/C# 專案結構
- [Go](./go.md) - Go 專案結構

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
