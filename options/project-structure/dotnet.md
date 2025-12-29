# .NET Project Structure

> **Language**: English | [繁體中文](../../locales/zh-TW/options/project-structure/dotnet.md)

**Parent Standard**: [Project Structure](../../core/project-structure.md)

---

## Overview

This document defines the standard directory structure for .NET/C# projects following Clean Architecture principles. It promotes separation of concerns with dependencies pointing inward toward the core domain.

## Best For

- ASP.NET Core Web APIs
- Enterprise applications
- Microservices
- Domain-Driven Design projects
- Large-scale applications

## Directory Structure

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

## Clean Architecture Layers

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

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | PascalCase.cs | `UserService.cs` |
| Directories | PascalCase | `Controllers/` |
| Classes | PascalCase | `UserService` |
| Interfaces | IPascalCase | `IUserService` |
| Methods | PascalCase | `CreateUser()` |
| Private fields | _camelCase | `_userRepository` |
| Constants | PascalCase | `MaxRetryCount` |

## Layer Structure

### Core Layer (Domain)

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

### Infrastructure Layer

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

### API Layer

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

## Configuration

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

## Project References

```
Api → Infrastructure → Core
Api → Shared
Infrastructure → Shared
Core → Shared (optional)
```

| Project | Can Reference |
|---------|---------------|
| Api | Infrastructure, Core, Shared |
| Infrastructure | Core, Shared |
| Core | Shared only (no external deps) |
| Shared | None |

## Testing Structure

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

## Best Practices

1. **Dependencies point inward** - Core has no external dependencies
2. **Use interfaces** - Define in Core, implement in Infrastructure
3. **Constructor injection** - Always use DI
4. **Nullable reference types** - Enable and enforce
5. **Async all the way** - Use CancellationToken

## Related Options

- [Node.js](./nodejs.md) - Node.js project structure
- [Python](./python.md) - Python project structure
- [Java](./java.md) - Java/Spring project structure
- [Go](./go.md) - Go project structure

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
