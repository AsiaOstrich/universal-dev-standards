# Java Project Structure

> **Language**: English | [繁體中文](../../locales/zh-TW/options/project-structure/java.md)

**Parent Standard**: [Project Structure](../../core/project-structure.md)

---

## Overview

This document defines the standard directory structure for Java projects, particularly those using Spring Boot. It follows a feature-based package organization that promotes maintainability and clear boundaries.

## Best For

- Spring Boot applications
- Enterprise Java applications
- REST and GraphQL APIs
- Microservices
- Maven/Gradle projects

## Directory Structure

```
project-root/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/company/project/
│   │   │       ├── Application.java          # Entry point
│   │   │       ├── config/                   # Configuration classes
│   │   │       │   ├── SecurityConfig.java
│   │   │       │   ├── WebConfig.java
│   │   │       │   └── DatabaseConfig.java
│   │   │       ├── modules/                  # Feature modules
│   │   │       │   ├── users/
│   │   │       │   │   ├── User.java         # Entity
│   │   │       │   │   ├── UserController.java
│   │   │       │   │   ├── UserService.java
│   │   │       │   │   ├── UserRepository.java
│   │   │       │   │   └── dto/
│   │   │       │   │       ├── CreateUserRequest.java
│   │   │       │   │       └── UserResponse.java
│   │   │       │   └── products/
│   │   │       │       └── ...
│   │   │       ├── shared/                   # Shared code
│   │   │       │   ├── exception/
│   │   │       │   │   ├── GlobalExceptionHandler.java
│   │   │       │   │   └── ResourceNotFoundException.java
│   │   │       │   └── util/
│   │   │       └── infrastructure/           # External integrations
│   │   │           ├── persistence/
│   │   │           └── messaging/
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       └── application-prod.yml
│   └── test/
│       └── java/
│           └── com/company/project/
│               ├── modules/
│               │   └── users/
│               │       ├── UserServiceTest.java
│               │       └── UserControllerTest.java
│               └── integration/
├── docs/
├── scripts/
├── pom.xml                    # Maven
├── build.gradle               # Or Gradle
└── README.md
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | PascalCase.java | `UserService.java` |
| Packages | lowercase | `com.company.project.users` |
| Classes | PascalCase | `UserService` |
| Interfaces | PascalCase | `UserRepository` (no I prefix) |
| Methods | camelCase | `createUser()` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |

## Package Organization

### Package by Feature (Recommended)

```
com.company.project.modules.users   # Good: Feature-based
com.company.project.modules.products
com.company.project.modules.orders

com.company.project.services        # Avoid: Layer-based
com.company.project.repositories
com.company.project.controllers
```

## Spring Boot Layers

### Entity

```java
// com/company/project/modules/users/User.java
package com.company.project.modules.users;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

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

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected User() {} // For JPA

    public User(String email, String name) {
        this.email = email;
        this.name = name;
        this.createdAt = Instant.now();
    }

    // Getters
    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public Instant getCreatedAt() { return createdAt; }

    // Business methods
    public void updateName(String name) {
        this.name = name;
    }
}
```

### Repository

```java
// com/company/project/modules/users/UserRepository.java
package com.company.project.modules.users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
```

### Service

```java
// com/company/project/modules/users/UserService.java
package com.company.project.modules.users;

import com.company.project.modules.users.dto.CreateUserRequest;
import com.company.project.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

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

    @Transactional(readOnly = true)
    public User getUserById(UUID id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
```

### Controller

```java
// com/company/project/modules/users/UserController.java
package com.company.project.modules.users;

import com.company.project.modules.users.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        User user = userService.createUser(request);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(UserResponse.from(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable UUID id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserResponse.from(user));
    }
}
```

### DTOs

```java
// com/company/project/modules/users/dto/CreateUserRequest.java
package com.company.project.modules.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(
    @NotBlank @Email String email,
    @NotBlank String name
) {}
```

```java
// com/company/project/modules/users/dto/UserResponse.java
package com.company.project.modules.users.dto;

import com.company.project.modules.users.User;
import java.time.Instant;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String email,
    String name,
    Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getCreatedAt()
        );
    }
}
```

## Configuration

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

server:
  port: 8080

logging:
  level:
    com.company.project: DEBUG
```

### pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>

    <groupId>com.company</groupId>
    <artifactId>project</artifactId>
    <version>1.0.0</version>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

## Testing

```java
// com/company/project/modules/users/UserServiceTest.java
package com.company.project.modules.users;

import com.company.project.modules.users.dto.CreateUserRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository);
    }

    @Test
    void createUser_WhenEmailExists_ThrowsException() {
        // Arrange
        var request = new CreateUserRequest("test@example.com", "Test");
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> userService.createUser(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Email already registered");
    }
}
```

## Best Practices

1. **Constructor injection** - Prefer over field injection
2. **Package by feature** - Not by technical layer
3. **DTO separation** - Never expose entities directly
4. **Records for DTOs** - Immutable, concise
5. **Use `@Transactional(readOnly = true)`** - For read operations

## Related Options

- [Node.js](./nodejs.md) - Node.js project structure
- [Python](./python.md) - Python project structure
- [.NET](./dotnet.md) - .NET/C# project structure
- [Go](./go.md) - Go project structure

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
