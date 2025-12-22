# PHP Coding Style Guide
# PHP 程式碼風格指南

**Version**: 1.0.0
**Last Updated**: 2025-12-22
**Applicability**: All PHP projects
**適用範圍**: 所有 PHP 專案

---

## Purpose | 目的

This guide defines PHP coding conventions based on PSR-12 to ensure consistent, readable, and maintainable code across the team.

本指南基於 PSR-12 定義 PHP 編碼慣例，確保團隊程式碼的一致性、可讀性與可維護性。

---

## Standards Compliance | 標準遵循

This guide follows:
- **PSR-1**: Basic Coding Standard
- **PSR-12**: Extended Coding Style (supersedes PSR-2)
- **PSR-4**: Autoloading Standard

本指南遵循：
- **PSR-1**: 基本編碼標準
- **PSR-12**: 擴展編碼風格（取代 PSR-2）
- **PSR-4**: 自動載入標準

---

## Naming Conventions | 命名慣例

### Summary Table | 總覽表

| Element | Style | Example |
|---------|-------|---------|
| Namespace | PascalCase | `App\Services` |
| Class | PascalCase | `UserService` |
| Interface | PascalCase + Suffix | `UserRepositoryInterface` |
| Trait | PascalCase + Suffix | `LoggableTrait` |
| Method | camelCase | `getUserById` |
| Property | camelCase | `$userName` |
| Private Property | camelCase | `$userName` (no underscore prefix) |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Variable | camelCase | `$currentUser` |
| Function (global) | snake_case | `array_map` |

### Detailed Rules | 詳細規則

#### Classes & Interfaces | 類別與介面

```php
<?php

namespace App\Services;

// ✅ 正確
class UserService
{
    // ...
}

interface UserRepositoryInterface
{
    // ...
}

trait LoggableTrait
{
    // ...
}

// ❌ 錯誤
class userService { }           // 應使用 PascalCase
interface IUserRepository { }   // PHP 慣例不使用 I 前綴
```

#### Properties & Methods | 屬性與方法

```php
<?php

class UserService
{
    // ✅ 正確
    private UserRepository $userRepository;
    protected string $connectionName;
    public int $retryCount = 0;

    public function getUserById(int $userId): ?User
    {
        return $this->userRepository->find($userId);
    }

    // ❌ 錯誤
    private $_userRepository;        // 不使用底線前綴
    public function GetUserById() { } // 方法應使用 camelCase
}
```

#### Constants | 常數

```php
<?php

class Configuration
{
    // ✅ 正確
    public const MAX_RETRY_COUNT = 3;
    public const DEFAULT_TIMEOUT = 30;
    private const CACHE_PREFIX = 'app_';

    // ❌ 錯誤
    public const maxRetryCount = 3;  // 應使用 UPPER_SNAKE_CASE
}
```

---

## File Structure | 檔案結構

### PHP File Format | PHP 檔案格式

```php
<?php
// 1. 嚴格模式宣告（必須）
declare(strict_types=1);

// 2. 命名空間宣告
namespace App\Services;

// 3. use 匯入（按類型分組，字母排序）
use App\Contracts\UserRepositoryInterface;
use App\Models\User;
use Psr\Log\LoggerInterface;

// 4. 類別宣告
class UserService
{
    // ...
}
```

### Use Statement Organization | Use 語句組織

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

// 1. PHP 內建類別
use Exception;
use InvalidArgumentException;

// 2. 框架/第三方類別
use Illuminate\Http\Request;
use Illuminate\Http\Response;

// 3. 專案內部類別
use App\Services\UserService;
use App\Models\User;
```

---

## Code Structure | 程式碼結構

### Method Length | 方法長度

- **Maximum**: 50 lines (excluding blank lines and comments)
- **Recommended**: 20-30 lines
- **最大**: 50 行（不含空行與註解）
- **建議**: 20-30 行

```php
<?php

// ✅ 正確：拆分成多個小方法
public function processOrder(Order $order): OrderResult
{
    $this->validateOrder($order);
    $items = $this->prepareItems($order);
    $total = $this->calculateTotal($items);
    return $this->createOrderResult($order, $items, $total);
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
<?php

// ✅ 正確：使用 early return 減少巢狀
public function getActiveUser(int $userId): ?User
{
    $user = $this->userRepository->find($userId);
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
    $user = $this->userRepository->find($userId);
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

---

## Type Declarations | 型別宣告

### Strict Types | 嚴格型別

All PHP files MUST declare strict types.
所有 PHP 檔案必須宣告嚴格型別。

```php
<?php

declare(strict_types=1);  // 必須在檔案第一行

namespace App\Services;

class UserService
{
    // 參數型別、回傳型別必須明確
    public function getUserById(int $userId): ?User
    {
        // ...
    }

    // 使用聯合型別 (PHP 8.0+)
    public function findUser(int|string $identifier): ?User
    {
        // ...
    }

    // 使用 nullable 型別
    public function getEmail(): ?string
    {
        return $this->email;
    }
}
```

### Property Types | 屬性型別

```php
<?php

declare(strict_types=1);

class User
{
    // ✅ 正確：使用型別宣告 (PHP 7.4+)
    private int $id;
    private string $name;
    private ?string $email = null;
    private bool $isActive = true;
    private array $roles = [];

    // ❌ 錯誤：缺少型別宣告
    private $id;
    private $name;
}
```

---

## Documentation | 文件註解

### PHPDoc Standards | PHPDoc 標準

```php
<?php

/**
 * 使用者服務類別
 *
 * 處理使用者相關的業務邏輯，包括查詢、建立、更新使用者資料。
 */
class UserService
{
    /**
     * 根據使用者 ID 取得使用者資訊
     *
     * @param int $userId 使用者的唯一識別碼
     * @return User|null 使用者實體，若不存在則回傳 null
     * @throws InvalidArgumentException 當 userId 為負數時拋出
     *
     * @example
     * $user = $userService->getUserById(123);
     * if ($user !== null) {
     *     echo $user->getName();
     * }
     */
    public function getUserById(int $userId): ?User
    {
        if ($userId < 0) {
            throw new InvalidArgumentException('User ID must be non-negative');
        }

        return $this->userRepository->find($userId);
    }
}
```

### Comment Language | 註解語言

- **PHPDoc**: Traditional Chinese (繁體中文)
- **Inline Comments**: Traditional Chinese (繁體中文)
- **TODO/FIXME**: English with Traditional Chinese description

```php
<?php

// ✅ 正確
/** @var User 當前使用者 */
private User $currentUser;

// 檢查使用者是否有權限
if ($this->hasPermission($user)) {
    // 處理授權邏輯
}

// TODO: Implement caching - 需實作快取機制以提升效能
```

---

## Security Best Practices | 安全性最佳實踐

### SQL Injection Prevention | SQL 注入防護

```php
<?php

// ❌ 危險：直接串接 SQL
$sql = "SELECT * FROM users WHERE id = " . $_GET['id'];
$result = $db->query($sql);

// ✅ 正確：使用參數化查詢
$stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$userId]);
$result = $stmt->fetch();

// ✅ 正確：使用 PDO 命名參數
$stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
$stmt->execute(['email' => $email]);
```

### XSS Prevention | XSS 防護

```php
<?php

// ❌ 危險：直接輸出使用者輸入
echo $_GET['name'];

// ✅ 正確：使用 htmlspecialchars
echo htmlspecialchars($_GET['name'], ENT_QUOTES, 'UTF-8');

// ✅ 正確：使用框架的 escape 函式
echo e($name);  // Laravel
echo $this->escape($name);  // 其他框架
```

### Password Handling | 密碼處理

```php
<?php

// ❌ 錯誤：使用 MD5 或 SHA1
$hash = md5($password);
$hash = sha1($password);

// ✅ 正確：使用 password_hash
$hash = password_hash($password, PASSWORD_DEFAULT);

// ✅ 正確：驗證密碼
if (password_verify($inputPassword, $storedHash)) {
    // 密碼正確
}
```

### Input Validation | 輸入驗證

```php
<?php

// ✅ 正確：驗證和過濾輸入
$email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
if ($email === false) {
    throw new InvalidArgumentException('Invalid email format');
}

$userId = filter_var($_GET['id'], FILTER_VALIDATE_INT);
if ($userId === false || $userId < 0) {
    throw new InvalidArgumentException('Invalid user ID');
}
```

---

## Error Handling | 錯誤處理

### Exception Handling | 例外處理

```php
<?php

// ❌ 禁止：空的 catch 區塊
try {
    $this->processOrder($order);
} catch (Exception $e) {
    // 吞掉例外，不處理
}

// ✅ 正確：適當處理例外
try {
    $this->processOrder($order);
} catch (ValidationException $e) {
    $this->logger->warning('Validation failed', [
        'order_id' => $order->getId(),
        'errors' => $e->getErrors(),
    ]);
    throw $e;
} catch (Exception $e) {
    $this->logger->error('Order processing failed', [
        'order_id' => $order->getId(),
        'exception' => $e->getMessage(),
    ]);
    throw new OrderProcessingException('Failed to process order', 0, $e);
}
```

### Custom Exceptions | 自定義例外

```php
<?php

declare(strict_types=1);

namespace App\Exceptions;

use Exception;

/**
 * 訂單處理例外
 */
class OrderProcessingException extends Exception
{
    private array $context;

    public function __construct(
        string $message,
        array $context = [],
        int $code = 0,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        $this->context = $context;
    }

    public function getContext(): array
    {
        return $this->context;
    }
}
```

---

## Prohibited Practices | 禁止行為

### 1. Pinyin Naming | 拼音命名

```php
<?php

// ❌ 絕對禁止
class YongHuFuWu { }           // 應為 UserService
function yanZhengQuanXian() { } // 應為 validatePermission
$baiMingDan = [];              // 應為 $whitelist
```

### 2. Global Variables | 全域變數

```php
<?php

// ❌ 禁止
global $db;
$GLOBALS['config'] = [];

// ✅ 正確：使用依賴注入
class UserService
{
    public function __construct(
        private Database $db,
        private Config $config
    ) {}
}
```

### 3. Magic Numbers/Strings | 魔術數字/字串

```php
<?php

// ❌ 錯誤
if ($retryCount > 3) { }
if ($status === 'approved') { }

// ✅ 正確
class OrderStatus
{
    public const MAX_RETRY_COUNT = 3;
    public const STATUS_APPROVED = 'approved';
}

if ($retryCount > OrderStatus::MAX_RETRY_COUNT) { }
if ($status === OrderStatus::STATUS_APPROVED) { }
```

### 4. Suppressing Errors | 抑制錯誤

```php
<?php

// ❌ 禁止使用 @ 抑制錯誤
$value = @$array['key'];
$result = @file_get_contents($url);

// ✅ 正確：明確處理
$value = $array['key'] ?? null;

$result = file_get_contents($url);
if ($result === false) {
    throw new RuntimeException('Failed to fetch content');
}
```

---

## Code Organization | 程式碼組織

### Class Member Order | 類別成員順序

```php
<?php

declare(strict_types=1);

namespace App\Services;

class UserService
{
    // 1. Constants | 常數
    private const MAX_RETRY_COUNT = 3;

    // 2. Static properties | 靜態屬性
    private static int $instanceCount = 0;

    // 3. Instance properties | 實例屬性
    private UserRepository $userRepository;
    private LoggerInterface $logger;

    // 4. Constructor | 建構子
    public function __construct(
        UserRepository $userRepository,
        LoggerInterface $logger
    ) {
        $this->userRepository = $userRepository;
        $this->logger = $logger;
    }

    // 5. Public methods | 公開方法
    public function getUserById(int $userId): ?User
    {
        return $this->userRepository->find($userId);
    }

    // 6. Protected methods | 受保護方法
    protected function validateUser(User $user): bool
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

## Related Standards | 相關標準

- [Anti-Hallucination Standard](../../../core/anti-hallucination.md) - AI 協作防幻覺標準
- [Code Check-in Standards](../../../core/checkin-standards.md) - 程式碼簽入檢查點標準
- [Commit Message Guide](../../../core/commit-message-guide.md) - Commit 訊息規範
- [Fat-Free Framework Patterns](fat-free-patterns.md) - Fat-Free 框架模式
- [Traditional Chinese Language Guide](../../locales/zh-tw.md) - 繁體中文語言規範

---

## Quick Reference Card | 快速參考卡

```
┌─────────────────────────────────────────────────────────┐
│                  PHP Naming Conventions                   │
├─────────────────────────────────────────────────────────┤
│  Class/Interface/Trait │  PascalCase    │ UserService    │
│  Method/Property       │  camelCase     │ getUserById    │
│  Constant              │  UPPER_SNAKE   │ MAX_COUNT      │
│  Variable              │  camelCase     │ $currentUser   │
├─────────────────────────────────────────────────────────┤
│                    Requirements                          │
├─────────────────────────────────────────────────────────┤
│  Strict Types          │  declare(strict_types=1);       │
│  Type Declarations     │  Required for all params/return │
│  PSR-12 Compliance     │  Required                       │
├─────────────────────────────────────────────────────────┤
│                    Limits                                │
├─────────────────────────────────────────────────────────┤
│  Method Length         │  ≤ 50 lines                     │
│  Nesting Depth         │  ≤ 3 levels                     │
├─────────────────────────────────────────────────────────┤
│                  Prohibited                              │
├─────────────────────────────────────────────────────────┤
│  ❌ Pinyin naming      │  yanZhengQuanXian               │
│  ❌ Global variables   │  global $db                     │
│  ❌ Magic numbers      │  if ($x > 3)                    │
│  ❌ Error suppression  │  @file_get_contents()           │
│  ❌ Empty catch        │  catch (Exception $e) { }       │
└─────────────────────────────────────────────────────────┘
```

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-22 | Initial PHP style guide based on PSR-12 |

---

## License | 授權

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

---

**Maintainer**: Development Team
**維護者**: 開發團隊
