---
source: ../../../../options/project-structure/dotnet.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 43ba40fa1b75
status: current
---

# .NET 專案結構

> **語言**: [English](../../../../options/project-structure/dotnet.md) | 繁體中文

**上層標準**: [專案結構](../../../../core/project-structure.md)

---

## 概述

本文件定義遵循 Clean Architecture 原則的 .NET/C# 專案標準目錄結構。它促進關注點分離，相依性指向內部的核心領域。

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
│   ├── SolutionName.Api/           # Web API project
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Filters/
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── appsettings.Development.json
│   ├── SolutionName.Core/          # Core business logic
│   │   ├── Entities/
│   │   ├── Interfaces/
│   │   ├── Services/
│   │   ├── Specifications/
│   │   └── Exceptions/
│   ├── SolutionName.Infrastructure/ # External service implementations
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   └── Migrations/
│   │   ├── Repositories/
│   │   ├── ExternalServices/
│   │   └── Identity/
│   └── SolutionName.Shared/        # Shared code
│       ├── DTOs/
│       ├── Extensions/
│       └── Utils/
├── tests/
│   ├── SolutionName.UnitTests/
│   ├── SolutionName.IntegrationTests/
│   └── SolutionName.FunctionalTests/
├── docs/
├── scripts/
├── SolutionName.sln
├── .editorconfig
├── Directory.Build.props
└── README.md
```

## Clean Architecture 層次

```
┌─────────────────────────────────────────┐
│              API Layer                   │
│  Controllers, Middleware, Filters        │
├─────────────────────────────────────────┤
│         Infrastructure Layer             │
│  DbContext, Repositories, External APIs  │
├─────────────────────────────────────────┤
│             Core Layer                   │
│  Entities, Services, Interfaces          │
└─────────────────────────────────────────┘
        Dependencies point inward ↓
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
| 常數 | PascalCase | `MaxRetryCount` |

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
    public DateTime CreatedAt { get; private set; }

    private User() { } // For EF Core

    public static User Create(string email, string name)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            Name = name,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void UpdateName(string name)
    {
        Name = name;
    }
}
```

```csharp
// src/SolutionName.Core/Interfaces/IUserRepository.cs
namespace SolutionName.Core.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User> AddAsync(User user, CancellationToken ct = default);
    Task UpdateAsync(User user, CancellationToken ct = default);
}
```

```csharp
// src/SolutionName.Core/Services/UserService.cs
namespace SolutionName.Core.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository userRepository, ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<User> CreateUserAsync(CreateUserRequest request, CancellationToken ct)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email, ct);
        if (existingUser is not null)
        {
            throw new DuplicateEmailException(request.Email);
        }

        var user = User.Create(request.Email, request.Name);
        await _userRepository.AddAsync(user, ct);

        _logger.LogInformation("User created: {UserId}", user.Id);
        return user;
    }
}
```

### Infrastructure 層

```csharp
// src/SolutionName.Infrastructure/Data/ApplicationDbContext.cs
namespace SolutionName.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
```

```csharp
// src/SolutionName.Infrastructure/Repositories/UserRepository.cs
namespace SolutionName.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _context;

    public UserRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Users.FindAsync(new object[] { id }, ct);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, ct);
    }

    public async Task<User> AddAsync(User user, CancellationToken ct = default)
    {
        await _context.Users.AddAsync(user, ct);
        await _context.SaveChangesAsync(ct);
        return user;
    }

    public async Task UpdateAsync(User user, CancellationToken ct = default)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync(ct);
    }
}
```

### API 層

```csharp
// src/SolutionName.Api/Controllers/UsersController.cs
namespace SolutionName.Api.Controllers;

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
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateUser(
        [FromBody] CreateUserRequest request,
        CancellationToken ct)
    {
        var user = await _userService.CreateUserAsync(request, ct);
        var dto = user.ToDto();
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, dto);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUser(Guid id, CancellationToken ct)
    {
        var user = await _userService.GetUserByIdAsync(id, ct);
        if (user is null)
        {
            return NotFound();
        }
        return Ok(user.ToDto());
    }
}
```

## 設定

### Directory.Build.props

```xml
<Project>
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
</Project>
```

### Program.cs

```csharp
// src/SolutionName.Api/Program.cs
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Core services
builder.Services.AddScoped<IUserService, UserService>();

// Infrastructure services
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IUserRepository, UserRepository>();

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

## 專案參考

```
Api → Infrastructure → Core
Api → Shared
Infrastructure → Shared
Core → Shared (optional)
```

| 專案 | 可參考 |
|------|--------|
| Api | Infrastructure, Core, Shared |
| Infrastructure | Core, Shared |
| Core | 僅 Shared（無外部相依）|
| Shared | 無 |

## 測試結構

```csharp
// tests/SolutionName.UnitTests/Services/UserServiceTests.cs
namespace SolutionName.UnitTests.Services;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _mockRepository;
    private readonly UserService _sut;

    public UserServiceTests()
    {
        _mockRepository = new Mock<IUserRepository>();
        _sut = new UserService(_mockRepository.Object, Mock.Of<ILogger<UserService>>());
    }

    [Fact]
    public async Task CreateUserAsync_WhenEmailExists_ThrowsDuplicateEmailException()
    {
        // Arrange
        var request = new CreateUserRequest("test@example.com", "Test");
        _mockRepository
            .Setup(r => r.GetByEmailAsync(request.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(User.Create("test@example.com", "Existing"));

        // Act & Assert
        await Assert.ThrowsAsync<DuplicateEmailException>(
            () => _sut.CreateUserAsync(request, CancellationToken.None));
    }
}
```

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
