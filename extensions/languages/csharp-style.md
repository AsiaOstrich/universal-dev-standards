# C# Coding Style Guide
# C# 程式碼風格指南

**Version**: 1.0.0
**Last Updated**: 2025-11-25
**Applicability**: All C# projects
**適用範圍**: 所有 C# 專案

---

## Purpose | 目的

This guide defines C# coding conventions to ensure consistent, readable, and maintainable code across the team.

本指南定義 C# 編碼慣例，確保團隊程式碼的一致性、可讀性與可維護性。

---

## Naming Conventions | 命名慣例

### Summary Table | 總覽表

| Element | Style | Example |
|---------|-------|---------|
| Namespace | PascalCase | `YourProject.Application` |
| Class | PascalCase | `UserService` |
| Interface | IPascalCase | `IUserRepository` |
| Method | PascalCase | `GetUserAsync` |
| Property | PascalCase | `UserName` |
| Event | PascalCase | `OnUserCreated` |
| Public Field | PascalCase | `MaxRetryCount` |
| Private Field | _camelCase | `_userRepository` |
| Parameter | camelCase | `userId` |
| Local Variable | camelCase | `currentUser` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Enum Type | PascalCase | `UserRole` |
| Enum Value | PascalCase | `Administrator` |

### Detailed Rules | 詳細規則

#### Classes & Interfaces | 類別與介面
```csharp
// ✅ 正確
public class UserService { }
public interface IUserRepository { }
public abstract class BaseController { }

// ❌ 錯誤
public class userService { }      // 應使用 PascalCase
public interface UserRepository { } // 介面應以 I 開頭
```

#### Private Fields | 私有欄位
```csharp
// ✅ 正確
private readonly IUserRepository _userRepository;
private int _retryCount;
private bool _isInitialized;

// ❌ 錯誤
private readonly IUserRepository userRepository;  // 缺少底線前綴
private int m_retryCount;                         // 匈牙利命名法
private bool isInitialized;                       // 缺少底線前綴
```

#### Constants | 常數
```csharp
// ✅ 正確
public const int MAX_RETRY_COUNT = 3;
public const string DEFAULT_CONNECTION_STRING = "Server=...";
private const int CACHE_DURATION_SECONDS = 300;

// ❌ 錯誤
public const int MaxRetryCount = 3;    // 應使用 UPPER_SNAKE_CASE
public const int maxRetryCount = 3;    // 應使用 UPPER_SNAKE_CASE
```

---

## Documentation | 文件註解

### XML Documentation | XML 文件註解

All public APIs MUST have XML documentation.
所有公開 API 必須有 XML 文件註解。

```csharp
/// <summary>
/// 根據使用者 ID 取得使用者資訊
/// </summary>
/// <param name="userId">使用者的唯一識別碼</param>
/// <returns>使用者實體，若不存在則回傳 null</returns>
/// <exception cref="ArgumentException">當 userId 為空時拋出</exception>
/// <example>
/// <code>
/// var user = await userService.GetUserAsync(123);
/// if (user != null)
/// {
///     Console.WriteLine(user.Name);
/// }
/// </code>
/// </example>
public async Task<User?> GetUserAsync(int userId)
{
    if (userId <= 0)
        throw new ArgumentException("User ID must be positive", nameof(userId));

    return await _userRepository.GetByIdAsync(userId);
}
```

### Comment Language | 註解語言

- **XML Documentation**: Traditional Chinese (繁體中文)
- **Inline Comments**: Traditional Chinese (繁體中文)
- **TODO/FIXME**: English with Traditional Chinese description

```csharp
// ✅ 正確
/// <summary>驗證使用者權限</summary>
public bool HasPermission(string userId)
{
    // 檢查使用者是否在白名單中
    return _whitelist.Contains(userId);
}

// TODO: Implement caching - 需實作快取機制以提升效能
```

---

## Code Structure | 程式碼結構

### Method Length | 方法長度

- **Maximum**: 50 lines (excluding blank lines and comments)
- **Recommended**: 20-30 lines
- **最大**: 50 行（不含空行與註解）
- **建議**: 20-30 行

```csharp
// ✅ 正確：拆分成多個小方法
public async Task<ReviewResult> ProcessReviewAsync(Message message)
{
    ValidateMessage(message);
    var whitelist = await LoadWhitelistAsync(message.CustId);
    var matchResult = CheckWhitelistMatch(message, whitelist);
    return CreateReviewResult(message, matchResult);
}

// ❌ 錯誤：方法過長，應該拆分
public async Task<ReviewResult> ProcessReviewAsync(Message message)
{
    // ... 超過 50 行的程式碼 ...
}
```

### Nesting Depth | 巢狀深度

- **Maximum**: 3 levels
- **Recommended**: 2 levels
- **最大**: 3 層
- **建議**: 2 層

```csharp
// ✅ 正確：使用 early return 減少巢狀
public async Task<User?> GetActiveUserAsync(int userId)
{
    var user = await _repository.GetByIdAsync(userId);
    if (user == null)
        return null;

    if (!user.IsActive)
        return null;

    return user;
}

// ❌ 錯誤：巢狀過深
public async Task<User?> GetActiveUserAsync(int userId)
{
    var user = await _repository.GetByIdAsync(userId);
    if (user != null)
    {
        if (user.IsActive)
        {
            if (user.IsVerified)
            {
                if (user.HasPermission)  // 第 4 層巢狀
                {
                    return user;
                }
            }
        }
    }
    return null;
}
```

---

## Async/Await | 非同步處理

### Naming Convention | 命名慣例

Async methods MUST end with `Async` suffix.
非同步方法必須以 `Async` 結尾。

```csharp
// ✅ 正確
public async Task<User> GetUserAsync(int id) { }
public async Task SaveChangesAsync() { }
public async Task<IEnumerable<Message>> GetPendingMessagesAsync() { }

// ❌ 錯誤
public async Task<User> GetUser(int id) { }  // 缺少 Async 後綴
```

### Best Practices | 最佳實踐

```csharp
// ✅ 正確：使用 async/await
public async Task<User> GetUserAsync(int id)
{
    return await _repository.GetByIdAsync(id);
}

// ✅ 正確：多個非同步操作並行
public async Task<(User User, List<Message> Messages)> GetUserDataAsync(int userId)
{
    var userTask = _userRepository.GetByIdAsync(userId);
    var messagesTask = _messageRepository.GetByUserIdAsync(userId);

    await Task.WhenAll(userTask, messagesTask);

    return (await userTask, await messagesTask);
}

// ❌ 錯誤：阻塞呼叫
public User GetUser(int id)
{
    return _repository.GetByIdAsync(id).Result;  // 可能造成死鎖
}
```

---

## Resource Management | 資源管理

### Using Statement | Using 語句

```csharp
// ✅ 正確：使用 using 語句
await using var connection = new SqlConnection(connectionString);
await connection.OpenAsync();

// ✅ 正確：使用 using 宣告 (C# 8.0+)
using var reader = new StreamReader(path);
var content = await reader.ReadToEndAsync();

// ❌ 錯誤：未正確釋放資源
var connection = new SqlConnection(connectionString);
await connection.OpenAsync();
// ... 如果發生例外，connection 不會被釋放
```

---

## Nullable Reference Types | 可空參考型別

### Enable Nullable Context | 啟用可空內容

```xml
<!-- In .csproj file -->
<PropertyGroup>
    <Nullable>enable</Nullable>
</PropertyGroup>
```

### Usage | 使用方式

```csharp
// ✅ 正確：明確標示可空性
public async Task<User?> GetUserAsync(int userId)
{
    return await _repository.GetByIdAsync(userId);
}

public void ProcessUser(User user)  // 不可為 null
{
    // 不需要 null 檢查
    Console.WriteLine(user.Name);
}

// ✅ 正確：使用 null 合併運算子
var userName = user?.Name ?? "Unknown";

// ✅ 正確：使用 null 條件運算子
var length = user?.Name?.Length ?? 0;
```

---

## Prohibited Practices | 禁止行為

### 1. Pinyin Naming | 拼音命名

```csharp
// ❌ 絕對禁止
public class YongHuFuWu { }           // 應為 UserService
public bool yanZhengQuanXian() { }    // 應為 ValidatePermission
private string _baiMingDan;           // 應為 _whitelist
```

### 2. Hungarian Notation | 匈牙利命名法

```csharp
// ❌ 禁止
private string strUserName;           // 應為 _userName
private int iCount;                   // 應為 _count
private bool bIsActive;               // 應為 _isActive
```

### 3. Magic Numbers/Strings | 魔術數字/字串

```csharp
// ❌ 錯誤
if (retryCount > 3) { }
if (status == "APPROVED") { }

// ✅ 正確
private const int MAX_RETRY_COUNT = 3;
private const string STATUS_APPROVED = "APPROVED";

if (retryCount > MAX_RETRY_COUNT) { }
if (status == STATUS_APPROVED) { }
```

### 4. Empty Catch Blocks | 空的 Catch 區塊

```csharp
// ❌ 禁止
try
{
    await ProcessAsync();
}
catch (Exception)
{
    // 吞掉例外，不處理
}

// ✅ 正確
try
{
    await ProcessAsync();
}
catch (Exception ex)
{
    _logger.LogError(ex, "Failed to process");
    throw;  // 或適當處理
}
```

---

## Code Organization | 程式碼組織

### Class Member Order | 類別成員順序

```csharp
public class UserService : IUserService
{
    // 1. Constants | 常數
    private const int MAX_RETRY_COUNT = 3;

    // 2. Static fields | 靜態欄位
    private static readonly object _lock = new();

    // 3. Instance fields | 實例欄位
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;

    // 4. Constructors | 建構子
    public UserService(IUserRepository userRepository, ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    // 5. Properties | 屬性
    public int RetryCount { get; private set; }

    // 6. Public methods | 公開方法
    public async Task<User?> GetUserAsync(int userId)
    {
        // ...
    }

    // 7. Private methods | 私有方法
    private void ValidateUserId(int userId)
    {
        // ...
    }
}
```

---

## Related Standards | 相關標準

- [Anti-Hallucination Standard](anti-hallucination.md) - AI 協作防幻覺標準
- [Code Check-in Standards](checkin-standards.md) - 程式碼簽入檢查點標準
- [Commit Message Guide](commit-message-guide.md) - Commit 訊息規範
- [Traditional Chinese Language Guide](zh-tw.md) - 繁體中文語言規範

---

## Quick Reference Card | 快速參考卡

```
┌─────────────────────────────────────────────────────────┐
│                  C# Naming Conventions                   │
├─────────────────────────────────────────────────────────┤
│  Class/Method/Property  │  PascalCase    │ UserService  │
│  Interface              │  IPascalCase   │ IRepository  │
│  Private Field          │  _camelCase    │ _userId      │
│  Parameter/Local        │  camelCase     │ userId       │
│  Constant               │  UPPER_SNAKE   │ MAX_COUNT    │
├─────────────────────────────────────────────────────────┤
│                    Limits                                │
├─────────────────────────────────────────────────────────┤
│  Method Length          │  ≤ 50 lines                   │
│  Nesting Depth          │  ≤ 3 levels                   │
├─────────────────────────────────────────────────────────┤
│                  Prohibited                              │
├─────────────────────────────────────────────────────────┤
│  ❌ Pinyin naming       │  yanZhengQuanXian             │
│  ❌ Hungarian notation  │  strUserName, iCount          │
│  ❌ Magic numbers       │  if (x > 3)                   │
│  ❌ Empty catch         │  catch { }                    │
└─────────────────────────────────────────────────────────┘
```

---

**Maintainer**: Development Team
**維護者**: 開發團隊
