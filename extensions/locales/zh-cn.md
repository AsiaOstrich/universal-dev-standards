# Simplified Chinese (Mainland China) Locale Standard
# 简体中文（中国大陆）地区规范

**Version**: 1.0.0
**Last Updated**: 2026-10-05
**Applicability**: Projects with Simplified Chinese documentation or mainland China teams
**适用范围**: 使用简体中文文档或中国大陆团队的项目
**Derived from**: `extensions/locales/zh-tw.md` v1.2.0 (re-written with mainland terminology, not a character-for-character conversion)
**来源**: 由 `extensions/locales/zh-tw.md` v1.2.0 改写（采用大陆通行术语，并非逐字转换）

---

## Purpose | 目的

This standard defines language usage guidelines for projects with Simplified Chinese documentation, ensuring consistency between Chinese content and English code.

本标准定义使用简体中文文档的项目的语言使用准则，确保中文内容与英文代码之间的一致性。

---

## Core Principle | 核心原则

**Chinese for Communication, English for Code**
**中文用于沟通，英文用于代码**

- ✅ Documentation, comments, and commit messages: Simplified Chinese
- ✅ Code (variables, functions, classes): English
- ✅ Log messages: English (for international teams and tooling compatibility)

---

## Language Usage Matrix | 语言使用矩阵

| Content Type | Language | Rationale | 示例 |
|--------------|----------|-----------|------|
| **Code** |
| Variable names | English | Universal readability | `userName` ✅<br>`用户名称` ❌ |
| Function names | English | Universal readability | `authenticateUser()` ✅<br>`认证用户()` ❌ |
| Class names | English | Universal readability | `UserService` ✅<br>`用户服务` ❌ |
| **Documentation** |
| README.md | 简体中文 | Team communication | ✅ |
| API documentation | 简体中文 | User-facing docs | ✅ |
| Architecture docs | 简体中文 | Design communication | ✅ |
| **Code Comments** |
| Inline comments | 简体中文 | Explain intent to team | `// 验证用户权限` ✅ |
| Doc comments | 简体中文 | API documentation | `/// <summary>验证用户</summary>` ✅ |
| **Commit Messages** |
| Type | 简体中文 | Team preference | `新增`, `修复`, `重构` ✅ |
| Subject | 简体中文 | Clear communication | `实现 OAuth2 登录` ✅ |
| Body | 简体中文 | Detailed explanation | ✅ |
| **Logging** |
| Log messages | English | Tool compatibility | `logger.info("User authenticated")` ✅ |
| Error messages | English | Searchability | `throw new Error("Invalid credentials")` ✅ |
| **Configuration** |
| Config keys | English | Standard practice | `maxRetryCount` ✅ |
| Config comments | 简体中文 | Explain to team | `# 最大重试次数` ✅ |

---

## Certainty Tags (Chinese) | 确定性标签（中文）

When using AI assistants with Simplified Chinese documentation, use these Chinese equivalents of the certainty tags defined in `core/anti-hallucination.md`:

与 AI 助手协作时，使用以下中文确定性标签（对应 `core/anti-hallucination.md` 定义）：

### Tag Mapping | 标签对照

| English Tag | 中文标签 | Usage | 使用时机 |
|-------------|---------|-------|----------|
| `[Confirmed]` | `[已确认]` | Direct evidence from code/docs | 直接来自代码/文档的证据 |
| `[Inferred]` | `[推断]` | Logical deduction from evidence | 基于现有证据的逻辑推断 |
| `[Assumption]` | `[假设]` | Based on common patterns | 基于常见模式（需验证）|
| `[Unknown]` | `[未知]` | Information not available | 信息不可得 |
| `[Need Confirmation]` | `[待确认]` | Requires user clarification | 需要用户澄清 |

### Usage Examples | 使用示例

**In Technical Documents | 技术文档中**:
```markdown
## 系统架构分析

`[已确认]` 系统使用 ASP.NET Core 8.0 框架 [Source: Code] Program.cs:1
`[已确认]` 数据库采用 SQL Server [Source: Code] appsettings.json:12
`[推断]` 基于 Repository Pattern 的使用，系统可能采用 DDD 架构
`[假设]` 缓存机制可能使用 Redis（需确认配置文件）
`[待确认]` 是否需要支持多租户架构？
```

**In Design Documents | 设计文档中**:
```markdown
## 设计决策

### D1: 数据库选择

**决策**：使用 PostgreSQL

**理由**：
- `[已确认]` 团队已有 PostgreSQL 运维经验 (用户确认)
- `[已确认]` 现有授权可用 (用户确认)
- `[推断]` JSON 字段支持有助于灵活的数据存储
```

**In Code Review | 代码审查中**:
```markdown
## 审查意见

`[已确认]` src/Services/AuthService.cs:45 - 密码验证缺少防暴力破解机制
`[推断]` 此处可能需要加入 Rate Limiting
`[待确认]` 是否已有其他层级的防护措施？
```

### Best Practices | 最佳实践

1. **Consistency | 一致性**
   - 在同一份文档中使用同一种语言的标签（全用中文或全用英文）
   - 团队应在 `CONTRIBUTING.md` 中明确选择使用的语言

2. **Source Citation | 来源引用**
   - 中文标签同样需要附上来源引用
   - 格式：`[已确认]` 陈述 [Source: Code] 文件路径:行号

3. **Team Agreement | 团队共识**
   - 在项目开始时决定使用中文或英文标签
   - 记录于 `CONTRIBUTING.md` 或 `.standards/` 目录

---

## Code Naming Conventions | 代码命名约定

### ✅ Correct Examples | 正确示例

```csharp
// Class names: English, PascalCase
public class UserAuthenticationService
{
    // Private fields: English, _camelCase
    private readonly IUserRepository _userRepository;

    // Methods: English, PascalCase
    /// <summary>
    /// 验证用户登录凭证
    /// </summary>
    /// <param name="username">用户账号</param>
    /// <param name="password">用户密码</param>
    /// <returns>验证成功返回 JWT token，失败返回 null</returns>
    public async Task<string?> AuthenticateAsync(string username, string password)
    {
        // 检查参数有效性
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
        {
            throw new ArgumentException("用户账号与密码不能为空");
        }

        // 从数据库查询用户
        var user = await _userRepository.GetByUsernameAsync(username);

        // 验证密码
        if (user == null || !VerifyPassword(user.PasswordHash, password))
        {
            return null;
        }

        // 生成 JWT token
        return GenerateJwtToken(user);
    }
}
```

**Key Points | 重点**:
- ✅ Class name: `UserAuthenticationService` (English)
- ✅ Method name: `AuthenticateAsync` (English)
- ✅ Parameters: `username`, `password` (English)
- ✅ Variables: `user`, `passwordHash` (English)
- ✅ Comments: 简体中文
- ✅ XML documentation: 简体中文

---

### ❌ Incorrect Examples | 错误示例

```csharp
// ❌ WRONG: Using Chinese or Pinyin for code names
public class 用户认证服务  // ❌ Class name in Chinese
{
    private readonly IUserRepository _yongHuCangKu;  // ❌ Pinyin variable name

    // ❌ Method name in Chinese
    public async Task<string?> 认证用户Async(string yhm, string mm)
    {
        // ❌ Abbreviated Pinyin parameters (yhm = 用户名, mm = 密码)
        var user = await _yongHuCangKu.GetByUsernameAsync(yhm);
        return GenerateJwtToken(user);
    }
}
```

**Problems | 问题**:
- ❌ Chinese characters in class/method names break IDE features
- ❌ Pinyin is hard to understand for non-Chinese speakers
- ❌ Abbreviated pinyin (yhm, mm) is unclear even for Chinese speakers
- ❌ Inconsistent with global coding standards

---

## Documentation Language Guidelines | 文档语言准则

### README.md | 项目自述

**Use Simplified Chinese** for README.md in mainland China-based projects:

```markdown
# 项目名称 (YourProject)

## 项目简介

本项目是一个基于 ASP.NET Core 8.0 的 SMS/MMS 消息审核系统...

## 技术栈

- **.NET 8.0** - ASP.NET Core Web API
- **Quartz.NET** - 后台任务调度
- **SQL Server** - 主要数据库

## 构建与运行

### 构建项目
```bash
dotnet build
```

### 运行应用程序
```bash
dotnet run
```
```

**For international projects**, consider bilingual README:

```markdown
# Message Review Center | 消息审核中心

[English](#english) | [简体中文](#简体中文)

## <a name="english"></a>English

This is an ASP.NET Core 8.0 SMS/MMS message review system...

## <a name="简体中文"></a>简体中文

本项目是一个基于 ASP.NET Core 8.0 的 SMS/MMS 消息审核系统...
```

---

### API Documentation | API 文档

**Use Simplified Chinese** for user-facing API documentation:

```markdown
## 用户认证 API

### POST /Auth/GoogleLogin

通过 Google OAuth2 登录并获取访问令牌。

#### 请求参数

| 参数名称 | 类型 | 必填 | 说明 |
|---------|------|------|------|
| `idToken` | string | 是 | Google ID Token |

#### 响应格式

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "dGhpc2...",
  "expiresIn": 3600
}
```

#### 错误码

| 代码 | 说明 |
|------|------|
| 400 | 无效的 Google ID Token |
| 401 | 用户未授权 |
| 500 | 服务器内部错误 |
```

---

### Code Comments | 代码注释

**Use Simplified Chinese** for all code comments:

```csharp
/// <summary>
/// 用户服务类，处理用户相关业务逻辑
/// </summary>
public class UserService
{
    /// <summary>
    /// 根据用户 ID 获取用户数据
    /// </summary>
    /// <param name="userId">用户 ID</param>
    /// <param name="cancellationToken">取消令牌</param>
    /// <returns>用户数据，找不到则返回 null</returns>
    /// <exception cref="ArgumentException">当 userId 小于等于 0 时抛出</exception>
    public async Task<User?> GetUserByIdAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        // 验证参数
        if (userId <= 0)
        {
            throw new ArgumentException("用户 ID 必须大于 0", nameof(userId));
        }

        // 从缓存读取
        var cachedUser = await _cache.GetAsync<User>($"user:{userId}");
        if (cachedUser != null)
        {
            return cachedUser;
        }

        // 从数据库查询
        var user = await _repository.GetByIdAsync(userId, cancellationToken);

        // 写入缓存
        if (user != null)
        {
            await _cache.SetAsync($"user:{userId}", user, TimeSpan.FromMinutes(10));
        }

        return user;
    }
}
```

**Key Points | 重点**:
- ✅ XML documentation (/// <summary>) in Simplified Chinese
- ✅ Inline comments (// ...) in Simplified Chinese
- ✅ Parameter/exception descriptions in Simplified Chinese
- ✅ Code (class/method/variable names) in English

---

## Output Language | 产出语言

### Commit Types in Simplified Chinese | 简体中文 Commit 类型

Use Simplified Chinese types for mainland China-based teams:

| 简体中文类型 | 英文对应 | 说明 |
|------------|---------|------|
| `新增` | feat | 新功能 |
| `修复` | fix | Bug 修复 |
| `重构` | refactor | 代码重构 |
| `文档` | docs | 文档更新 |
| `测试` | test | 测试相关 |
| `样式` | style | 代码格式 |
| `性能` | perf | 性能优化 |
| `构建` | build | 构建系统 |
| `集成` | ci | CI/CD 变更 |
| `维护` | chore | 维护任务 |
| `回退` | revert | 回退提交 |
| `安全` | security | 安全漏洞修复 |

---

### Commit Message Examples | Commit 消息示例

```
新增(认证): 实现 OAuth2 Google 登录功能

- 新增 GoogleAuthService 处理 Google OAuth2 流程
- 集成 JWT token 生成逻辑
- 更新用户模型以支持外部账号 ID

技术细节:
- 使用 Google.Apis.Auth NuGet 包验证 ID Token
- Token 有效期设置为 1 小时
- Refresh token 有效期为 30 天

Closes #123
```

```
修复(API): 解决并发更新用户数据时的竞态条件

问题原因:
- 两个同时发出的 PUT /users/:id 请求会互相覆盖
- 缺少乐观锁或事务隔离机制
- 最后写入胜出，造成数据丢失

修复方式:
- 在 User 模型新增 version 字段
- 实现乐观锁检查
- 版本不一致时返回 409 Conflict
- 更新 API 文档说明重试机制

测试:
- 新增并发更新测试场景
- 压力测试验证 (100 个并发请求)

Fixes #456
```

```
重构(数据库): 提取连接池管理为独立模块

重构原因:
- 连接池逻辑分散在多个 Repository 中
- 难以统一调整连接池设置
- 无法集中监控连接状态

变更内容:
- 新增 DatabaseConnectionPool 类
- 集中管理所有数据库连接
- 提供连接状态监控接口
- 更新所有 Repository 使用新的连接池

影响范围:
- 所有 Repository 类已更新
- 单元测试已更新为使用 Mock ConnectionPool
- 无功能性变更，测试全部通过
```

---

## Logging Language | 日志语言

**Use English for log messages** to ensure compatibility with international teams and log analysis tools:

```csharp
// ✅ CORRECT: English log messages
_logger.LogInformation("User {UserId} authenticated successfully", userId);
_logger.LogWarning("Failed login attempt for user {Username}", username);
_logger.LogError(ex, "Database connection failed for host {Host}", dbHost);

// ❌ WRONG: Chinese log messages
_logger.LogInformation("用户 {UserId} 认证成功", userId);  // Harder to search/analyze
```

**Rationale | 理由**:
- ✅ Easier to search in log aggregation tools (Splunk, ELK, etc.)
- ✅ Compatible with international support teams
- ✅ Standardized error patterns for alerting

**Exception**: User-facing error messages can be Chinese:

```csharp
// User-facing error messages: Simplified Chinese
throw new ValidationException("用户账号格式不正确");

// But log the error in English
_logger.LogWarning("Invalid username format for input: {Input}", username);
```

---

## Configuration Files | 配置文件

### Configuration Keys: English | 配置键: 英文

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MyDb;..."
  },
  "JwtSettings": {
    "Issuer": "YourProject",
    "ExpirationMinutes": 60
  },
  "AppSettings": {
    "MaxRetryCount": 3,
    "TimeoutSeconds": 30
  }
}
```

**Do NOT use Chinese keys**:
```json
{
  "连接字符串": {  // ❌ WRONG
    "默认连接": "..."
  }
}
```

### Configuration Comments: Simplified Chinese | 配置注释: 简体中文

```json
{
  // JWT 相关配置
  "JwtSettings": {
    // JWT 签发者名称
    "Issuer": "YourProject",
    // Token 有效期限（分钟）
    "ExpirationMinutes": 60,
    // 签名密钥路径
    "PrivateKeyPath": "keys/es256key.pem"
  }
}
```

Or use separate documentation:

```markdown
## 配置文件说明 (appsettings.json)

### JwtSettings

| 配置键 | 类型 | 说明 | 默认值 |
|--------|------|------|--------|
| `Issuer` | string | JWT 签发者名称 | YourProject |
| `ExpirationMinutes` | int | Token 有效期限（分钟）| 60 |
| `PrivateKeyPath` | string | ECDSA 私钥文件路径 | keys/es256key.pem |
```

---

## Error Messages | 错误消息

### System Errors: English | 系统错误: 英文

```csharp
// ✅ Internal errors, exceptions: English
throw new InvalidOperationException("Cannot process payment in pending state");
throw new ArgumentNullException(nameof(userId), "User ID cannot be null");
```

### User-Facing Errors: Simplified Chinese | 用户错误: 简体中文

```csharp
// ✅ User-facing error messages: Simplified Chinese
public class ErrorResponse
{
    public string Code { get; set; }       // "INVALID_CREDENTIALS"
    public string Message { get; set; }    // "用户账号或密码错误"
    public string Details { get; set; }    // "请确认账号与密码后重试"
}
```

**API Error Response Example**:
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "用户账号或密码错误",
    "details": "请确认您的账号与密码是否正确，密码区分大小写"
  }
}
```

---

## Testing Documentation | 测试文档

### Test Method Names: English | 测试方法名称: 英文

```csharp
// ✅ CORRECT: English test method names
[Fact]
public async Task AuthenticateAsync_WithValidCredentials_ReturnsToken()
{
    // Arrange
    var service = new AuthenticationService(_mockRepository.Object);

    // Act
    var token = await service.AuthenticateAsync("testuser", "password123");

    // Assert
    Assert.NotNull(token);
}

// ❌ WRONG: Chinese test method names
[Fact]
public async Task 验证_使用有效凭证_返回Token()  // ❌
```

### Test Comments: Simplified Chinese | 测试注释: 简体中文

```csharp
[Fact]
public async Task AuthenticateAsync_WithInvalidPassword_ReturnsNull()
{
    // Arrange - 准备测试数据
    var mockRepo = new Mock<IUserRepository>();
    mockRepo.Setup(r => r.GetByUsernameAsync("testuser"))
           .ReturnsAsync(new User { PasswordHash = "hashed_password" });

    var service = new AuthenticationService(mockRepo.Object);

    // Act - 执行测试
    var result = await service.AuthenticateAsync("testuser", "wrong_password");

    // Assert - 验证结果
    Assert.Null(result);  // 密码错误应返回 null
}
```

---

## Typography Standards | 排版标准

### Chinese-English Mixed Text | 中英混合文字

**Add spaces between Chinese and English**:

```markdown
✅ CORRECT:
本项目使用 ASP.NET Core 8.0 开发，采用 Clean Architecture 设计模式。

❌ WRONG:
本项目使用ASP.NET Core 8.0开发，采用Clean Architecture设计模式。
```

### Punctuation | 标点符号

**Use Chinese punctuation in Chinese text**:

```markdown
✅ CORRECT:
项目包含：认证模块、API 层、数据库层。

❌ WRONG:
项目包含:认证模块,API层,数据库层.
```

**Use English punctuation in code and English text**:

```csharp
// ✅ CORRECT: English punctuation in comments
// This method validates user credentials, checks permissions, and generates JWT token.

// ❌ WRONG: Chinese punctuation in English comments
// This method validates user credentials,checks permissions,and generates JWT token。
```

### Numbers | 数字

**Use Arabic numerals**:

```markdown
✅ CORRECT:
项目包含 15 个 API 端点、8 个数据模型、120 个单元测试。

❌ WRONG:
项目包含十五个 API 端点、八个数据模型、一百二十个单元测试。
```

---

## Terminology Consistency | 术语一致性

Maintain a **terminology glossary** for consistent Chinese translations:

### Common Software Terms | 常见软件术语

| English | 简体中文 | Notes |
|---------|---------|-------|
| Authentication | 认证 | Use one term throughout; do not mix with "身份验证" |
| Authorization | 授权 | |
| Repository | 仓储 | In code pattern context; a Git repository is "仓库" |
| Service | 服务 | |
| Controller | 控制器 | |
| Middleware | 中间件 | |
| Dependency Injection | 依赖注入 | |
| Unit Test | 单元测试 | |
| Integration Test | 集成测试 | |
| Code Review | 代码审查 | |
| Pull Request | Pull Request | Keep English term |
| Commit | Commit | Keep English term, or "提交" |
| Branch | 分支 | |
| Merge | 合并 | |
| Refactor | 重构 | |
| Bug | Bug | Keep English term or "错误" |
| Feature | 功能 | |
| Performance | 性能 | NOT "效能" |
| Database | 数据库 | |
| Cache | 缓存 | |
| API | API | Keep English |
| SDK | SDK | Keep English |
| Framework | 框架 | |
| Changelog | 变更日志 | |
| Release Notes | 发布说明 | |
| Breaking Change | 破坏性变更 | |
| Deprecate | 弃用 | |
| Semantic Versioning | 语义化版本 | |

**Project-Specific Customization**: Create `docs/terminology.md` for your project.

---

## Version History | 版本历史

| Version | Date | Changes |
|---------|------|--------|
| 1.0.0 | 2026-10-05 | Initial Simplified Chinese standard, derived from zh-tw.md v1.2.0 with mainland terminology (the zh-CN locale was declared by the installer but the file was missing, so `uds init --locale zh-cn` failed) 首个简体中文规范，由 zh-tw.md v1.2.0 改写并采用大陆通行术语（安装程序已声明 zh-CN 语系但缺少此文件，导致 `uds init --locale zh-cn` 失败） |

---

## References | 参考资料

- [Chinese Copywriting Guidelines](https://github.com/sparanoid/chinese-copywriting-guidelines)
- [中文技术文档写作规范](https://github.com/yikeke/zh-style-guide)
- [Anti-Hallucination Standards](../../core/anti-hallucination.md)

---

## License | 授权

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
