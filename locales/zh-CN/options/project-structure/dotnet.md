---
source: ../../../../options/project-structure/dotnet.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 43ba40fa1b75
status: current
---

# .NET 项目结构

> **语言**: [English](../../../../options/project-structure/dotnet.md) | 简体中文

**上层标准**: [项目结构](../../../../core/project-structure.md)

---

## 概览

本文档定义遵循 Clean Architecture 原则的 .NET/C# 项目标准目录结构。它促进关注点分离，依赖关系向内指向核心领域。

## 适用场景

- ASP.NET Core Web API
- 企业级应用
- 微服务
- 领域驱动设计（DDD）项目
- 大型应用

## 目录结构

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

## Clean Architecture 分层

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

## 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 文件 | PascalCase.cs | `UserService.cs` |
| 目录 | PascalCase | `Controllers/` |
| 类 | PascalCase | `UserService` |
| 接口 | IPascalCase | `IUserService` |
| 方法 | PascalCase | `CreateUser()` |
| 私有字段 | _camelCase | `_userRepository` |
| 常量 | PascalCase | `MaxRetryCount` |

## 分层结构

### Core 层（领域）

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

### Infrastructure 层

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

### API 层

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

## 配置

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

## 项目引用

```
Api → Infrastructure → Core
Api → Shared
Infrastructure → Shared
Core → Shared (optional)
```

| 项目 | 可引用 |
|------|--------|
| Api | Infrastructure、Core、Shared |
| Infrastructure | Core、Shared |
| Core | 仅 Shared（无外部依赖） |
| Shared | 无 |

## 测试结构

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

## 最佳实践

1. **依赖向内指向** - Core 没有外部依赖
2. **使用接口** - 在 Core 中定义，在 Infrastructure 中实现
3. **构造函数注入** - 始终使用依赖注入（DI）
4. **可空引用类型** - 启用并强制执行
5. **全程异步** - 使用 CancellationToken

## 相关选项

- [Node.js](./nodejs.md) - Node.js 项目结构
- [Python](./python.md) - Python 项目结构
- [Java](./java.md) - Java/Spring 项目结构
- [Go](./go.md) - Go 项目结构

---

## 许可

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
