# .NET 專案結構

> **語言**: [English](../../../../options/project-structure/dotnet.md) | 繁體中文

**上層標準**: [專案結構](../../core/project-structure.md)

---

## 概述

本文件定義遵循 Clean Architecture 原則的 .NET/C# 專案標準目錄結構。它促進關注點分離，相依性指向核心領域。

## 適用情境

- ASP.NET Core Web API
- 企業級應用程式
- 微服務
- 領域驅動設計專案
- 大型應用程式

## 目錄結構

```
SolutionName/
├── src/
│   ├── SolutionName.Api/           # Web API 專案
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Filters/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   ├── SolutionName.Core/          # 核心業務邏輯
│   │   ├── Entities/
│   │   ├── Interfaces/
│   │   ├── Services/
│   │   └── Exceptions/
│   ├── SolutionName.Infrastructure/ # 外部服務實作
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   └── Migrations/
│   │   ├── Repositories/
│   │   └── ExternalServices/
│   └── SolutionName.Shared/        # 共用程式碼
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

## Clean Architecture 層次

```
┌─────────────────────────────────────────┐
│              API 層                      │
│  Controllers, Middleware, Filters        │
├─────────────────────────────────────────┤
│         Infrastructure 層                │
│  DbContext, Repositories, External APIs  │
├─────────────────────────────────────────┤
│             Core 層                      │
│  Entities, Services, Interfaces          │
└─────────────────────────────────────────┘
        相依性指向內部 ↓
```

## 命名慣例

| 類型 | 慣例 | 範例 |
|------|------|------|
| 檔案 | PascalCase.cs | `UserService.cs` |
| 目錄 | PascalCase | `Controllers/` |
| 類別 | PascalCase | `UserService` |
| 介面 | IPascalCase | `IUserService` |
| 方法 | PascalCase | `CreateUser()` |
| 私有欄位 | _camelCase | `_userRepository` |

## 層次結構

### Core 層（領域）

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

### API 層

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

## 專案參考

| 專案 | 可參考 |
|------|--------|
| Api | Infrastructure, Core, Shared |
| Infrastructure | Core, Shared |
| Core | 僅 Shared（無外部相依）|
| Shared | 無 |

## 最佳實踐

1. **相依性指向內部** - Core 無外部相依
2. **使用介面** - 在 Core 定義，在 Infrastructure 實作
3. **建構子注入** - 永遠使用 DI
4. **可為空參考類型** - 啟用並強制執行
5. **全程非同步** - 使用 CancellationToken

## 相關選項

- [Node.js](./nodejs.md) - Node.js 專案結構
- [Python](./python.md) - Python 專案結構
- [Java](./java.md) - Java/Spring 專案結構
- [Go](./go.md) - Go 專案結構

---

## 授權條款

本文件採用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權條款。

**來源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
