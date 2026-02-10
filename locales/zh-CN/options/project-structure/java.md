---
source: ../../../../options/project-structure/java.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# Java 专案结构

> **语言**: [English](../../../options/project-structure/java.md) | 繁体中文

**上层标准**: [专案结构](../../core/project-structure.md)

---

## 概述

本文件定义 Java 专案的标准目录结构，特别是使用 Spring Boot 的专案。它遵循以功能为基础的套件组织，促进可维护性和清晰的边界。

## 适用情境

- Spring Boot 应用程式
- 企业级 Java 应用程式
- REST 和 GraphQL API
- 微服务
- Maven/Gradle 专案

## 目录结构

```
project-root/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/company/project/
│   │   │       ├── Application.java          # 进入点
│   │   │       ├── config/                   # 设定类别
│   │   │       │   ├── SecurityConfig.java
│   │   │       │   └── WebConfig.java
│   │   │       ├── modules/                  # 功能模组
│   │   │       │   ├── users/
│   │   │       │   │   ├── User.java         # 实体
│   │   │       │   │   ├── UserController.java
│   │   │       │   │   ├── UserService.java
│   │   │       │   │   ├── UserRepository.java
│   │   │       │   │   └── dto/
│   │   │       │   └── products/
│   │   │       ├── shared/                   # 共用程式码
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

## 命名惯例

| 类型 | 惯例 | 范例 |
|------|------|------|
| 档案 | PascalCase.java | `UserService.java` |
| 套件 | lowercase | `com.company.project.users` |
| 类别 | PascalCase | `UserService` |
| 介面 | PascalCase | `UserRepository`（无 I 前缀）|
| 方法 | camelCase | `createUser()` |
| 常数 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |

## 套件组织

### 依功能组织（建议）

```
com.company.project.modules.users   # 好：功能导向
com.company.project.modules.products

com.company.project.services        # 避免：技术层导向
com.company.project.repositories
```

## Spring Boot 层次

### 实体

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

### 服务

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

## 设定

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

## 最佳实践

1. **建构子注入** - 优先于栏位注入
2. **依功能组织套件** - 而非技术层
3. **DTO 分离** - 永远不直接暴露实体
4. **DTO 使用 Records** - 不可变、简洁
5. **使用 `@Transactional(readOnly = true)`** - 用于读取操作

## 相关选项

- [Node.js](./nodejs.md) - Node.js 专案结构
- [Python](./python.md) - Python 专案结构
- [.NET](./dotnet.md) - .NET/C# 专案结构
- [Go](./go.md) - Go 专案结构

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
