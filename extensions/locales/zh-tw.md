# Traditional Chinese (Taiwan) Locale Standard
# 繁體中文（台灣）地區規範

**Version**: 1.0.0
**Last Updated**: 2025-11-12
**Applicability**: Projects with Traditional Chinese documentation or Taiwanese teams
**適用範圍**: 使用繁體中文文件或台灣團隊的專案

---

## Purpose | 目的

This standard defines language usage guidelines for projects with Traditional Chinese documentation, ensuring consistency between Chinese content and English code.

本標準定義使用繁體中文文件的專案語言使用準則，確保中文內容與英文程式碼之間的一致性。

---

## Core Principle | 核心原則

**Chinese for Communication, English for Code**
**中文用於溝通，英文用於程式碼**

- ✅ Documentation, comments, and commit messages: Traditional Chinese
- ✅ Code (variables, functions, classes): English
- ✅ Log messages: English (for international teams and tooling compatibility)

---

## Language Usage Matrix | 語言使用矩陣

| Content Type | Language | Rationale | 範例 |
|--------------|----------|-----------|------|
| **Code** |
| Variable names | English | Universal readability | `userName` ✅<br>`使用者名稱` ❌ |
| Function names | English | Universal readability | `authenticateUser()` ✅<br>`認證使用者()` ❌ |
| Class names | English | Universal readability | `UserService` ✅<br>`使用者服務` ❌ |
| **Documentation** |
| README.md | 繁體中文 | Team communication | ✅ |
| API documentation | 繁體中文 | User-facing docs | ✅ |
| Architecture docs | 繁體中文 | Design communication | ✅ |
| **Code Comments** |
| Inline comments | 繁體中文 | Explain intent to team | `// 驗證使用者權限` ✅ |
| Doc comments | 繁體中文 | API documentation | `/// <summary>驗證使用者</summary>` ✅ |
| **Commit Messages** |
| Type | 繁體中文 | Team preference | `新增`, `修正`, `重構` ✅ |
| Subject | 繁體中文 | Clear communication | `實作 OAuth2 登入` ✅ |
| Body | 繁體中文 | Detailed explanation | ✅ |
| **Logging** |
| Log messages | English | Tool compatibility | `logger.info("User authenticated")` ✅ |
| Error messages | English | Searchability | `throw new Error("Invalid credentials")` ✅ |
| **Configuration** |
| Config keys | English | Standard practice | `maxRetryCount` ✅ |
| Config comments | 繁體中文 | Explain to team | `# 最大重試次數` ✅ |

---

## Code Naming Conventions | 程式碼命名慣例

### ✅ Correct Examples | 正確範例

```csharp
// Class names: English, PascalCase
public class UserAuthenticationService
{
    // Private fields: English, _camelCase
    private readonly IUserRepository _userRepository;

    // Methods: English, PascalCase
    /// <summary>
    /// 驗證使用者登入憑證
    /// </summary>
    /// <param name="username">使用者帳號</param>
    /// <param name="password">使用者密碼</param>
    /// <returns>驗證成功返回 JWT token，失敗返回 null</returns>
    public async Task<string?> AuthenticateAsync(string username, string password)
    {
        // 檢查參數有效性
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
        {
            throw new ArgumentException("使用者帳號與密碼不可為空");
        }

        // 從資料庫查詢使用者
        var user = await _userRepository.GetByUsernameAsync(username);

        // 驗證密碼
        if (user == null || !VerifyPassword(user.PasswordHash, password))
        {
            return null;
        }

        // 產生 JWT token
        return GenerateJwtToken(user);
    }
}
```

**Key Points | 重點**:
- ✅ Class name: `UserAuthenticationService` (English)
- ✅ Method name: `AuthenticateAsync` (English)
- ✅ Parameters: `username`, `password` (English)
- ✅ Variables: `user`, `passwordHash` (English)
- ✅ Comments: 繁體中文
- ✅ XML documentation: 繁體中文

---

### ❌ Incorrect Examples | 錯誤範例

```csharp
// ❌ WRONG: Using Chinese or Pinyin for code names
public class 使用者認證服務  // ❌ Class name in Chinese
{
    private readonly IUserRepository _yongHuCangKu;  // ❌ Pinyin variable name

    // ❌ Method name in Chinese
    public async Task<string?> 認證使用者Async(string yhm, string mm)
    {
        // ❌ Abbreviated Pinyin parameters (yhm = 用戶名, mm = 密碼)
        var user = await _yongHuCangKu.GetByUsernameAsync(yhm);
        return GenerateJwtToken(user);
    }
}
```

**Problems | 問題**:
- ❌ Chinese characters in class/method names break IDE features
- ❌ Pinyin is hard to understand for non-Chinese speakers
- ❌ Abbreviated pinyin (yhm, mm) is unclear even for Chinese speakers
- ❌ Inconsistent with global coding standards

---

## Documentation Language Guidelines | 文件語言準則

### README.md | 專案自述

**Use Traditional Chinese** for README.md in Taiwan-based projects:

```markdown
# 專案名稱 (YourProject)

## 專案簡介

本專案是一個基於 ASP.NET Core 8.0 的 SMS/MMS 訊息審核系統...

## 技術棧

- **.NET 8.0** - ASP.NET Core Web API
- **Quartz.NET** - 背景工作排程
- **SQL Server** - 主要資料庫

## 建置與執行

### 建置專案
```bash
dotnet build
```

### 執行應用程式
```bash
dotnet run
```
```

**For international projects**, consider bilingual README:

```markdown
# Message Review Center | 訊息審核中心

[English](#english) | [繁體中文](#繁體中文)

## <a name="english"></a>English

This is an ASP.NET Core 8.0 SMS/MMS message review system...

## <a name="繁體中文"></a>繁體中文

本專案是一個基於 ASP.NET Core 8.0 的 SMS/MMS 訊息審核系統...
```

---

### API Documentation | API 文件

**Use Traditional Chinese** for user-facing API documentation:

```markdown
## 使用者認證 API

### POST /Auth/GoogleLogin

透過 Google OAuth2 登入並取得存取令牌。

#### 請求參數

| 參數名稱 | 類型 | 必填 | 說明 |
|---------|------|------|------|
| `idToken` | string | 是 | Google ID Token |

#### 回應格式

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "dGhpc2...",
  "expiresIn": 3600
}
```

#### 錯誤代碼

| 代碼 | 說明 |
|------|------|
| 400 | 無效的 Google ID Token |
| 401 | 使用者未授權 |
| 500 | 伺服器內部錯誤 |
```

---

### Code Comments | 程式碼註解

**Use Traditional Chinese** for all code comments:

```csharp
/// <summary>
/// 使用者服務類別，處理使用者相關業務邏輯
/// </summary>
public class UserService
{
    /// <summary>
    /// 根據使用者 ID 取得使用者資料
    /// </summary>
    /// <param name="userId">使用者 ID</param>
    /// <param name="cancellationToken">取消令牌</param>
    /// <returns>使用者資料，找不到則返回 null</returns>
    /// <exception cref="ArgumentException">當 userId 小於等於 0 時拋出</exception>
    public async Task<User?> GetUserByIdAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        // 驗證參數
        if (userId <= 0)
        {
            throw new ArgumentException("使用者 ID 必須大於 0", nameof(userId));
        }

        // 從快取讀取
        var cachedUser = await _cache.GetAsync<User>($"user:{userId}");
        if (cachedUser != null)
        {
            return cachedUser;
        }

        // 從資料庫查詢
        var user = await _repository.GetByIdAsync(userId, cancellationToken);

        // 寫入快取
        if (user != null)
        {
            await _cache.SetAsync($"user:{userId}", user, TimeSpan.FromMinutes(10));
        }

        return user;
    }
}
```

**Key Points | 重點**:
- ✅ XML documentation (/// <summary>) in Traditional Chinese
- ✅ Inline comments (// ...) in Traditional Chinese
- ✅ Parameter/exception descriptions in Traditional Chinese
- ✅ Code (class/method/variable names) in English

---

## Commit Message Language | Commit 訊息語言

### Commit Types in Traditional Chinese | 繁體中文 Commit 類型

Use Traditional Chinese types for Taiwan-based teams:

| 繁體中文類型 | 英文對應 | 說明 |
|------------|---------|------|
| `新增` | feat | 新功能 |
| `修正` | fix | Bug 修復 |
| `重構` | refactor | 程式碼重構 |
| `文件` | docs | 文件更新 |
| `測試` | test | 測試相關 |
| `樣式` | style | 程式碼格式 |
| `效能` | perf | 效能優化 |
| `建置` | build | 建置系統 |
| `整合` | ci | CI/CD 變更 |
| `升級` | chore | 依賴升級 |
| `回退` | revert | 回退提交 |

---

### Commit Message Examples | Commit 訊息範例

```
新增(認證): 實作 OAuth2 Google 登入功能

- 新增 GoogleAuthService 處理 Google OAuth2 流程
- 整合 JWT token 產生邏輯
- 更新使用者模型支援外部帳號 ID

技術細節:
- 使用 Google.Apis.Auth NuGet 套件驗證 ID Token
- Token 有效期設定為 1 小時
- Refresh token 有效期為 30 天

Closes #123
```

```
修正(API): 解決並發更新使用者資料時的競爭條件

問題原因:
- 兩個同時發出的 PUT /users/:id 請求會互相覆蓋
- 缺少樂觀鎖定或交易隔離機制
- 最後寫入勝出，造成資料遺失

修正方式:
- 在 User 模型新增 version 欄位
- 實作樂觀鎖定檢查
- 版本不符時返回 409 Conflict
- 更新 API 文件說明重試機制

測試:
- 新增並發更新測試場景
- 負載測試驗證 (100 個並發請求)

Fixes #456
```

```
重構(資料庫): 提取連線池管理為獨立模組

重構原因:
- 連線池邏輯散落在多個 Repository 中
- 難以統一調整連線池設定
- 無法集中監控連線狀態

變更內容:
- 新增 DatabaseConnectionPool 類別
- 集中管理所有資料庫連線
- 提供連線狀態監控介面
- 更新所有 Repository 使用新的連線池

影響範圍:
- 所有 Repository 類別已更新
- 單元測試已更新使用 Mock ConnectionPool
- 無功能性變更，測試全數通過
```

---

## Logging Language | 日誌語言

**Use English for log messages** to ensure compatibility with international teams and log analysis tools:

```csharp
// ✅ CORRECT: English log messages
_logger.LogInformation("User {UserId} authenticated successfully", userId);
_logger.LogWarning("Failed login attempt for user {Username}", username);
_logger.LogError(ex, "Database connection failed for host {Host}", dbHost);

// ❌ WRONG: Chinese log messages
_logger.LogInformation("使用者 {UserId} 認證成功", userId);  // Harder to search/analyze
```

**Rationale | 理由**:
- ✅ Easier to search in log aggregation tools (Splunk, ELK, etc.)
- ✅ Compatible with international support teams
- ✅ Standardized error patterns for alerting

**Exception**: User-facing error messages can be Chinese:

```csharp
// User-facing error messages: Traditional Chinese
throw new ValidationException("使用者帳號格式不正確");

// But log the error in English
_logger.LogWarning("Invalid username format for input: {Input}", username);
```

---

## Configuration Files | 設定檔

### Configuration Keys: English | 設定鍵: 英文

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
  "連線字串": {  // ❌ WRONG
    "預設連線": "..."
  }
}
```

### Configuration Comments: Traditional Chinese | 設定註解: 繁體中文

```json
{
  // JWT 相關設定
  "JwtSettings": {
    // JWT 發行者名稱
    "Issuer": "YourProject",
    // Token 有效期限（分鐘）
    "ExpirationMinutes": 60,
    // 簽署金鑰路徑
    "PrivateKeyPath": "keys/es256key.pem"
  }
}
```

Or use separate documentation:

```markdown
## 設定檔說明 (appsettings.json)

### JwtSettings

| 設定鍵 | 類型 | 說明 | 預設值 |
|--------|------|------|--------|
| `Issuer` | string | JWT 發行者名稱 | YourProject |
| `ExpirationMinutes` | int | Token 有效期限（分鐘）| 60 |
| `PrivateKeyPath` | string | ECDSA 私鑰檔案路徑 | keys/es256key.pem |
```

---

## Error Messages | 錯誤訊息

### System Errors: English | 系統錯誤: 英文

```csharp
// ✅ Internal errors, exceptions: English
throw new InvalidOperationException("Cannot process payment in pending state");
throw new ArgumentNullException(nameof(userId), "User ID cannot be null");
```

### User-Facing Errors: Traditional Chinese | 使用者錯誤: 繁體中文

```csharp
// ✅ User-facing error messages: Traditional Chinese
public class ErrorResponse
{
    public string Code { get; set; }       // "INVALID_CREDENTIALS"
    public string Message { get; set; }    // "使用者帳號或密碼錯誤"
    public string Details { get; set; }    // "請確認帳號與密碼後重試"
}
```

**API Error Response Example**:
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "使用者帳號或密碼錯誤",
    "details": "請確認您的帳號與密碼是否正確，密碼區分大小寫"
  }
}
```

---

## Testing Documentation | 測試文件

### Test Method Names: English | 測試方法名稱: 英文

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
public async Task 驗證_使用有效憑證_返回Token()  // ❌
```

### Test Comments: Traditional Chinese | 測試註解: 繁體中文

```csharp
[Fact]
public async Task AuthenticateAsync_WithInvalidPassword_ReturnsNull()
{
    // Arrange - 準備測試資料
    var mockRepo = new Mock<IUserRepository>();
    mockRepo.Setup(r => r.GetByUsernameAsync("testuser"))
           .ReturnsAsync(new User { PasswordHash = "hashed_password" });

    var service = new AuthenticationService(mockRepo.Object);

    // Act - 執行測試
    var result = await service.AuthenticateAsync("testuser", "wrong_password");

    // Assert - 驗證結果
    Assert.Null(result);  // 密碼錯誤應返回 null
}
```

---

## Typography Standards | 排版標準

### Chinese-English Mixed Text | 中英混合文字

**Add spaces between Chinese and English**:

```markdown
✅ CORRECT:
本專案使用 ASP.NET Core 8.0 開發，採用 Clean Architecture 設計模式。

❌ WRONG:
本專案使用ASP.NET Core 8.0開發，採用Clean Architecture設計模式。
```

### Punctuation | 標點符號

**Use Chinese punctuation in Chinese text**:

```markdown
✅ CORRECT:
專案包含：認證模組、API 層、資料庫層。

❌ WRONG:
專案包含:認證模組,API層,資料庫層.
```

**Use English punctuation in code and English text**:

```csharp
// ✅ CORRECT: English punctuation in comments
// This method validates user credentials, checks permissions, and generates JWT token.

// ❌ WRONG: Chinese punctuation in English comments
// This method validates user credentials,checks permissions,and generates JWT token。
```

### Numbers | 數字

**Use Arabic numerals**:

```markdown
✅ CORRECT:
專案包含 15 個 API 端點、8 個資料模型、120 個單元測試。

❌ WRONG:
專案包含十五個 API 端點、八個資料模型、一百二十個單元測試。
```

---

## Terminology Consistency | 術語一致性

Maintain a **terminology glossary** for consistent Chinese translations:

### Common Software Terms | 常見軟體術語

| English | 繁體中文 | Notes |
|---------|---------|-------|
| Authentication | 認證 | NOT "身份驗證" |
| Authorization | 授權 | |
| Repository | 儲存庫 | In code pattern context |
| Service | 服務 | |
| Controller | 控制器 | |
| Middleware | 中介軟體 | |
| Dependency Injection | 依賴注入 | |
| Unit Test | 單元測試 | |
| Integration Test | 整合測試 | |
| Code Review | 程式碼審查 | |
| Pull Request | Pull Request | Keep English term |
| Commit | Commit | Keep English term |
| Branch | 分支 | |
| Merge | 合併 | |
| Refactor | 重構 | |
| Bug | Bug | Keep English term or "錯誤" |
| Feature | 功能 | |
| Performance | 效能 | NOT "性能" |
| Database | 資料庫 | |
| Cache | 快取 | |
| API | API | Keep English |
| SDK | SDK | Keep English |
| Framework | 框架 | |

**Project-Specific Customization**: Create `docs/terminology.md` for your project.

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-12 | Initial Traditional Chinese standard |

---

## References | 參考資料

- [Chinese Copywriting Guidelines](https://github.com/sparanoid/chinese-copywriting-guidelines)
- [中文技術文件寫作規範](https://github.com/yikeke/zh-style-guide)

---

## License | 授權

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
