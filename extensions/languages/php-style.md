# PHP Coding Style Guide
# PHP 程式碼風格指南

**Version**: 1.0.0
**Last Updated**: 2025-12-23
**Applicability**: All PHP 8.1+ projects
**適用範圍**: 所有 PHP 8.1+ 專案

---

## Purpose | 目的

This guide defines PHP coding conventions based on PSR-12 to ensure consistent, readable, secure, and maintainable code across the team.

本指南基於 PSR-12 定義 PHP 編碼慣例，確保團隊程式碼的一致性、可讀性、安全性與可維護性。

---

## PSR-12 Coding Style | PSR-12 編碼風格

### File Structure | 檔案結構

```php
<?php
// ✅ 正確：PHP 8.1+ 檔案結構

declare(strict_types=1);

namespace App\Services;

use App\Contracts\UserRepositoryInterface;
use App\Models\User;
use Psr\Log\LoggerInterface;

class UserService
{
    // ...
}
```

### Key Rules | 關鍵規則

| Rule | Standard | 規則說明 |
|------|----------|---------|
| Indentation | 4 spaces (NO tabs) | 4 個空格（禁止 Tab） |
| Line Length | Max 120 characters | 最大 120 字元 |
| Line Ending | LF (Unix style) | Unix 換行符 |
| PHP Tags | `<?php` only (no short tags) | 僅使用完整標籤 |
| Encoding | UTF-8 without BOM | UTF-8 無 BOM |

---

## Naming Conventions | 命名慣例

### Summary Table | 總覽表

| Element | Style | Example |
|---------|-------|---------|
| Namespace | PascalCase | `App\Services` |
| Class | PascalCase | `UserService` |
| Interface | PascalCase + Interface | `UserRepositoryInterface` |
| Trait | PascalCase + Trait | `HasTimestamps` |
| Enum | PascalCase | `UserStatus` |
| Method | camelCase | `getUserById` |
| Property | camelCase | `$userName` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Variable | camelCase | `$currentUser` |
| Function | snake_case (legacy) / camelCase | `array_map` / `processData` |

### Detailed Rules | 詳細規則

#### Classes & Interfaces | 類別與介面

```php
// ✅ 正確
class UserService {}
interface UserRepositoryInterface {}
abstract class BaseController {}
trait Loggable {}
enum UserStatus: string {}

// ❌ 錯誤
class userService {}              // 應使用 PascalCase
interface IUserRepository {}      // 不使用 I 前綴（這是 C# 慣例）
class user_service {}             // 不使用 snake_case
```

#### Properties & Variables | 屬性與變數

```php
// ✅ 正確
private readonly UserRepository $userRepository;
private int $retryCount = 0;
private bool $isInitialized = false;

// ❌ 錯誤
private readonly UserRepository $_userRepository;  // 不使用底線前綴
private int $retry_count = 0;                      // 不使用 snake_case
private bool $m_isInitialized = false;             // 不使用匈牙利命名法
```

#### Constants | 常數

```php
// ✅ 正確
public const int MAX_RETRY_COUNT = 3;
public const string DEFAULT_TIMEZONE = 'Asia/Taipei';
private const float CACHE_TTL_HOURS = 24.0;

// ❌ 錯誤
public const int maxRetryCount = 3;    // 應使用 UPPER_SNAKE_CASE
public const int MaxRetryCount = 3;    // 應使用 UPPER_SNAKE_CASE
```

---

## PHP 8.1+ Features | PHP 8.1+ 特性

### Enums | 列舉

```php
// ✅ 正確：使用 Backed Enum
enum UserStatus: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Suspended = 'suspended';

    public function label(): string
    {
        return match($this) {
            self::Active => '啟用',
            self::Inactive => '停用',
            self::Suspended => '暫停',
        };
    }
}

// 使用方式
$status = UserStatus::Active;
$statusValue = $status->value;    // 'active'
$statusLabel = $status->label();  // '啟用'
```

### Readonly Properties | 唯讀屬性

```php
// ✅ 正確：使用 readonly
class User
{
    public function __construct(
        public readonly int $id,
        public readonly string $email,
        private readonly DateTimeImmutable $createdAt,
    ) {}
}

// ❌ 錯誤：可變的不可變資料
class User
{
    public int $id;  // 應該是 readonly
}
```

### Constructor Property Promotion | 建構子屬性提升

```php
// ✅ 正確：使用屬性提升
class UserService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly LoggerInterface $logger,
    ) {}
}

// ❌ 冗長寫法（避免）
class UserService
{
    private UserRepositoryInterface $userRepository;
    private LoggerInterface $logger;

    public function __construct(
        UserRepositoryInterface $userRepository,
        LoggerInterface $logger
    ) {
        $this->userRepository = $userRepository;
        $this->logger = $logger;
    }
}
```

### Named Arguments | 具名參數

```php
// ✅ 正確：使用具名參數提升可讀性
$user = new User(
    id: 1,
    email: 'user@example.com',
    name: 'John Doe',
    isActive: true,
);

// ✅ 正確：跳過可選參數
$this->sendEmail(
    to: $user->email,
    subject: 'Welcome',
    priority: EmailPriority::High,  // 跳過 cc, bcc 等可選參數
);
```

---

## Code Structure | 程式碼結構

### Method Length | 方法長度

- **Maximum**: 50 lines (excluding blank lines and comments)
- **Recommended**: 20-30 lines
- **最大**: 50 行（不含空行與註解）
- **建議**: 20-30 行

```php
// ✅ 正確：拆分成多個小方法
public function processOrder(Order $order): OrderResult
{
    $this->validateOrder($order);
    $inventory = $this->checkInventory($order->items);
    $payment = $this->processPayment($order);

    return $this->createOrderResult($order, $inventory, $payment);
}

// ❌ 錯誤：方法過長，應該拆分
public function processOrder(Order $order): OrderResult
{
    // ... 超過 50 行的程式碼 ...
}
```

### Nesting Depth | 巢狀深度

- **Maximum**: 3 levels
- **Recommended**: 2 levels
- **最大**: 3 層
- **建議**: 2 層

```php
// ✅ 正確：使用 early return 減少巢狀
public function getActiveUser(int $userId): ?User
{
    $user = $this->userRepository->findById($userId);

    if ($user === null) {
        return null;
    }

    if (!$user->isActive()) {
        return null;
    }

    return $user;
}

// ❌ 錯誤：巢狀過深
public function getActiveUser(int $userId): ?User
{
    $user = $this->userRepository->findById($userId);
    if ($user !== null) {
        if ($user->isActive()) {
            if ($user->isVerified()) {
                if ($user->hasPermission()) {  // 第 4 層巢狀
                    return $user;
                }
            }
        }
    }
    return null;
}
```

### Class Member Order | 類別成員順序

```php
class UserService
{
    // 1. Constants | 常數
    private const int MAX_RETRY_COUNT = 3;

    // 2. Static properties | 靜態屬性
    private static int $instanceCount = 0;

    // 3. Instance properties | 實例屬性
    private readonly UserRepositoryInterface $userRepository;
    private readonly LoggerInterface $logger;

    // 4. Constructor | 建構子
    public function __construct(
        UserRepositoryInterface $userRepository,
        LoggerInterface $logger,
    ) {
        $this->userRepository = $userRepository;
        $this->logger = $logger;
    }

    // 5. Public methods | 公開方法
    public function getUser(int $userId): ?User
    {
        // ...
    }

    // 6. Protected methods | 受保護方法
    protected function validateUserId(int $userId): void
    {
        // ...
    }

    // 7. Private methods | 私有方法
    private function logAccess(int $userId): void
    {
        // ...
    }
}
```

---

## Documentation | 文件註解

### PHPDoc Standards | PHPDoc 標準

```php
/**
 * 根據使用者 ID 取得使用者資訊
 *
 * @param int $userId 使用者的唯一識別碼
 * @return User|null 使用者實體，若不存在則回傳 null
 * @throws InvalidArgumentException 當 userId 為負數時拋出
 *
 * @example
 * ```php
 * $user = $userService->getUserById(123);
 * if ($user !== null) {
 *     echo $user->getName();
 * }
 * ```
 */
public function getUserById(int $userId): ?User
{
    if ($userId <= 0) {
        throw new InvalidArgumentException('User ID must be positive');
    }

    return $this->userRepository->findById($userId);
}
```

### When to Use PHPDoc | 何時使用 PHPDoc

| Scenario | Required? | 情境 |
|----------|-----------|------|
| Public API methods | ✅ Required | 公開 API 方法必須 |
| Complex logic | ✅ Required | 複雜邏輯必須 |
| Type hints are sufficient | ❌ Optional | 型別提示已足夠時可選 |
| Private simple methods | ❌ Optional | 簡單私有方法可選 |

```php
// ✅ 不需要 PHPDoc：型別提示已足夠
public function isActive(): bool
{
    return $this->status === UserStatus::Active;
}

// ✅ 需要 PHPDoc：複雜邏輯需要說明
/**
 * 計算使用者的信用評分
 *
 * 評分規則：
 * - 基礎分 500 分
 * - 帳齡每月 +5 分（最高 +100）
 * - 逾期記錄每筆 -50 分
 */
public function calculateCreditScore(User $user): int
{
    // ...
}
```

---

## Security Best Practices | 安全性最佳實踐

### SQL Injection Prevention | SQL Injection 防護

```php
// ✅ 正確：使用 Prepared Statements
public function findByEmail(string $email): ?User
{
    $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = :email');
    $stmt->execute(['email' => $email]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? User::fromArray($row) : null;
}

// ❌ 危險：SQL Injection 漏洞
public function findByEmail(string $email): ?User
{
    // 絕對禁止！
    $sql = "SELECT * FROM users WHERE email = '$email'";
    $result = $this->pdo->query($sql);
    // ...
}
```

### XSS Prevention | XSS 防護

```php
// ✅ 正確：輸出時進行編碼
public function renderUserName(string $name): string
{
    return htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
}

// ✅ 正確：在模板中使用
// Blade: {{ $user->name }} 自動轉義
// Twig: {{ user.name }} 自動轉義
// 原生 PHP:
echo htmlspecialchars($user->name, ENT_QUOTES, 'UTF-8');

// ❌ 危險：直接輸出使用者輸入
echo $user->name;  // XSS 漏洞
echo $_GET['search'];  // XSS 漏洞
```

### Input Validation | 輸入驗證

```php
// ✅ 正確：驗證並清理輸入
public function updateEmail(int $userId, string $email): void
{
    // 驗證 email 格式
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Invalid email format');
    }

    // 正規化 email（轉小寫）
    $email = strtolower(trim($email));

    $this->userRepository->updateEmail($userId, $email);
}

// ✅ 正確：驗證整數範圍
public function setPage(mixed $page): int
{
    $page = filter_var($page, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 1, 'max_range' => 1000]
    ]);

    if ($page === false) {
        throw new InvalidArgumentException('Page must be between 1 and 1000');
    }

    return $page;
}
```

### Password Handling | 密碼處理

```php
// ✅ 正確：使用 password_hash
public function createUser(string $email, string $password): User
{
    $hashedPassword = password_hash($password, PASSWORD_ARGON2ID);

    return $this->userRepository->create([
        'email' => $email,
        'password' => $hashedPassword,
    ]);
}

// ✅ 正確：使用 password_verify
public function verifyPassword(User $user, string $password): bool
{
    return password_verify($password, $user->getPasswordHash());
}

// ❌ 危險：不安全的雜湊演算法
$hash = md5($password);      // 禁止！
$hash = sha1($password);     // 禁止！
$hash = hash('sha256', $password);  // 禁止用於密碼！
```

---

## Error Handling | 錯誤處理

### Exception Usage | 例外使用

```php
// ✅ 正確：使用具體的例外類型
public function getUser(int $userId): User
{
    $user = $this->userRepository->findById($userId);

    if ($user === null) {
        throw new UserNotFoundException("User not found: {$userId}");
    }

    return $user;
}

// ✅ 正確：自訂例外類別
class UserNotFoundException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly int $userId = 0,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }
}

// ❌ 錯誤：使用通用 Exception
throw new Exception('User not found');  // 應使用具體類型
```

### Try-Catch Best Practices | Try-Catch 最佳實踐

```php
// ✅ 正確：捕獲具體例外
try {
    $user = $this->userService->getUser($userId);
} catch (UserNotFoundException $e) {
    $this->logger->warning('User not found', ['userId' => $userId]);
    return null;
} catch (DatabaseException $e) {
    $this->logger->error('Database error', ['exception' => $e]);
    throw $e;
}

// ❌ 錯誤：空的 catch 區塊
try {
    $user = $this->userService->getUser($userId);
} catch (Exception $e) {
    // 吞掉例外，不處理 - 禁止！
}

// ❌ 錯誤：捕獲過於廣泛
try {
    $user = $this->userService->getUser($userId);
} catch (Throwable $e) {
    // 過於廣泛，可能隱藏重要錯誤
}
```

---

## Prohibited Practices | 禁止行為

### 1. Pinyin Naming | 拼音命名

```php
// ❌ 絕對禁止
class YongHuFuWu {}              // 應為 UserService
function yanZhengQuanXian() {}   // 應為 validatePermission
$baiMingDan = [];                // 應為 $whitelist
```

### 2. Mixed HTML/PHP | 混合 HTML/PHP

```php
// ❌ 禁止：在類別中混合 HTML
class UserController
{
    public function show(int $id): void
    {
        $user = $this->getUser($id);
        echo "<h1>{$user->name}</h1>";  // 禁止！
        echo "<p>{$user->email}</p>";   // 禁止！
    }
}

// ✅ 正確：使用模板引擎
class UserController
{
    public function show(int $id): Response
    {
        $user = $this->userService->getUser($id);
        return $this->view->render('user/show', ['user' => $user]);
    }
}
```

### 3. Global Variables | 全域變數

```php
// ❌ 禁止
global $db;
$GLOBALS['config'] = [];

// ✅ 正確：使用依賴注入
public function __construct(
    private readonly PDO $db,
    private readonly Config $config,
) {}
```

### 4. Suppressing Errors | 抑制錯誤

```php
// ❌ 禁止：使用 @ 抑制錯誤
$result = @file_get_contents($path);

// ✅ 正確：正確處理錯誤
if (!file_exists($path)) {
    throw new FileNotFoundException("File not found: {$path}");
}
$result = file_get_contents($path);
```

### 5. eval() and Dynamic Code | eval() 與動態程式碼

```php
// ❌ 絕對禁止
eval($userInput);
$func = $_GET['function'];
$func();  // 危險！

// ❌ 禁止：動態引入
include $_GET['page'] . '.php';  // 路徑遍歷攻擊
```

---

## Related Standards | 相關標準

- [Anti-Hallucination Standard](../../core/anti-hallucination.md) - AI 協作防幻覺標準
- [Code Check-in Standards](../../core/checkin-standards.md) - 程式碼簽入檢查點標準
- [Commit Message Guide](../../core/commit-message-guide.md) - Commit 訊息規範
- [Fat-Free Framework Patterns](../frameworks/fat-free-patterns.md) - F3 開發模式
- [Traditional Chinese Language Guide](../locales/zh-tw.md) - 繁體中文語言規範

---

## Quick Reference Card | 快速參考卡

```
┌─────────────────────────────────────────────────────────┐
│                  PHP Naming Conventions                  │
├─────────────────────────────────────────────────────────┤
│  Class/Interface/Enum   │  PascalCase    │ UserService  │
│  Method                 │  camelCase     │ getUserById  │
│  Property/Variable      │  $camelCase    │ $userId      │
│  Constant               │  UPPER_SNAKE   │ MAX_COUNT    │
├─────────────────────────────────────────────────────────┤
│                    Limits                                │
├─────────────────────────────────────────────────────────┤
│  Method Length          │  ≤ 50 lines                   │
│  Nesting Depth          │  ≤ 3 levels                   │
│  Line Length            │  ≤ 120 characters             │
├─────────────────────────────────────────────────────────┤
│                  Security Checklist                      │
├─────────────────────────────────────────────────────────┤
│  ✅ Prepared Statements │  防止 SQL Injection           │
│  ✅ htmlspecialchars    │  防止 XSS                     │
│  ✅ password_hash       │  安全密碼雜湊                 │
│  ✅ Input validation    │  驗證所有使用者輸入           │
├─────────────────────────────────────────────────────────┤
│                  Prohibited                              │
├─────────────────────────────────────────────────────────┤
│  ❌ Pinyin naming       │  yongHuFuWu                   │
│  ❌ Mixed HTML/PHP      │  echo "<h1>$name</h1>"        │
│  ❌ Global variables    │  global $db                   │
│  ❌ Error suppression   │  @file_get_contents()         │
│  ❌ eval()              │  eval($userInput)             │
└─────────────────────────────────────────────────────────┘
```

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-23 | Initial PHP 8.1+ style guide |

---

## License | 授權

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

---

**Maintainer**: Development Team
**維護者**: 開發團隊
