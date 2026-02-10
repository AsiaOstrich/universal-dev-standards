---
source: ../../../../options/project-structure/dotnet.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# .NET 专案结构

> **语言**: [English](../../../../options/project-structure/dotnet.md) | 繁体中文

**上层标准**: [专案结构](../../../../core/project-structure.md)

---

## 概述

本文件定义遵循 Clean Architecture 原则的 .NET/C# 专案标准目录结构。它促进关注点分离，相依性指向核心领域。

## 适用情境

- ASP.NET Core Web API
- 企业级应用程式
- 微服务
- 领域驱动设计专案
- 大型应用程式

## 目录结构

```
SolutionName/
├── src/
│   ├── SolutionName.Api/           # Web API 专案
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Filters/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   ├── SolutionName.Core/          # 核心业务逻辑
│   │   ├── Entities/
│   │   ├── Interfaces/
│   │   ├── Services/
│   │   └── Exceptions/
│   ├── SolutionName.Infrastructure/ # 外部服务实作
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   └── Migrations/
│   │   ├── Repositories/
│   │   └── ExternalServices/
│   └── SolutionName.Shared/        # 共用程式码
│       ├── DTOs/
│       ├── Extensions/
│       └── Utils/
├── tests/
│   ├── SolutionName.UnitTests/
│   ├── SolutionName.IntegrationTests/
│   └── SolutionName.FunctionalTests/
├── docs/
├── SolutionName.sln
└── README.md
```

## Clean Architecture 层次

```
┌─────────────────────────────────────────┐
│              API 层                      │
│  Controllers, Middleware, Filters        │
├─────────────────────────────────────────┤
│         Infrastructure 层                │
│  DbContext, Repositories, External APIs  │
├─────────────────────────────────────────┤
│             Core 层                      │
│  Entities, Services, Interfaces          │
└─────────────────────────────────────────┘
        相依性指向内部 ↓
```

## 命名惯例

| 类型 | 惯例 | 范例 |
|------|------|------|
| 档案 | PascalCase.cs | `UserService.cs` |
| 目录 | PascalCase | `Controllers/` |
| 类别 | PascalCase | `UserService` |
| 介面 | IPascalCase | `IUserService` |
| 方法 | PascalCase | `CreateUser()` |
| 私有栏位 | _camelCase | `_userRepository` |

## 层次结构

### Core 层（领域）

```csharp
// src/SolutionName.Core/Entities/User.cs
namespace SolutionName.Core.Entities;

public class User
{
    public Guid Id { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;

    public static User Create(string email, string name)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            Name = name
        };
    }
}
```

```csharp
// src/SolutionName.Core/Interfaces/IUserRepository.cs
public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<User> AddAsync(User user, CancellationToken ct = default);
}
```

### API 层

```csharp
// src/SolutionName.Api/Controllers/UsersController.cs
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateUser(
        [FromBody] CreateUserRequest request,
        CancellationToken ct)
    {
        var user = await _userService.CreateUserAsync(request, ct);
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user.ToDto());
    }
}
```

## 专案参考

| 专案 | 可参考 |
|------|--------|
| Api | Infrastructure, Core, Shared |
| Infrastructure | Core, Shared |
| Core | 仅 Shared（无外部相依）|
| Shared | 无 |

## 最佳实践

1. **相依性指向内部** - Core 无外部相依
2. **使用介面** - 在 Core 定义，在 Infrastructure 实作
3. **建构子注入** - 永远使用 DI
4. **可为空参考类型** - 启用并强制执行
5. **全程非同步** - 使用 CancellationToken

## 相关选项

- [Node.js](./nodejs.md) - Node.js 专案结构
- [Python](./python.md) - Python 专案结构
- [Java](./java.md) - Java/Spring 专案结构
- [Go](./go.md) - Go 专案结构

---

## 授权条款

本文件采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权条款。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
