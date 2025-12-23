# Fat-Free Framework Development Patterns
# Fat-Free Framework 開發模式

**Version**: 1.0.0
**Last Updated**: 2025-12-23
**Applicability**: All Fat-Free Framework (F3) v3.8+ projects
**適用範圍**: 所有 Fat-Free Framework (F3) v3.8+ 專案

---

## Purpose | 目的

This guide defines development patterns and best practices for Fat-Free Framework (F3) projects to ensure consistent, maintainable, and secure applications.

本指南定義 Fat-Free Framework (F3) 專案的開發模式與最佳實踐，確保應用程式的一致性、可維護性與安全性。

---

## Project Structure | 專案結構

### Recommended Directory Layout | 建議目錄結構

```
project-root/
├── app/
│   ├── Controllers/           # 控制器
│   │   ├── BaseController.php
│   │   ├── Api/
│   │   │   └── UserController.php
│   │   └── Web/
│   │       └── HomeController.php
│   ├── Models/                # 資料模型
│   │   ├── User.php
│   │   └── Traits/
│   │       └── HasTimestamps.php
│   ├── Services/              # 業務邏輯層
│   │   └── UserService.php
│   ├── Repositories/          # 資料存取層
│   │   └── UserRepository.php
│   └── Middleware/            # 中介軟體
│       ├── AuthMiddleware.php
│       └── CorsMiddleware.php
├── config/
│   ├── config.ini             # 主設定檔
│   ├── config.dev.ini         # 開發環境
│   ├── config.staging.ini     # 測試環境
│   └── config.prod.ini        # 生產環境
├── public/
│   ├── index.php              # 入口點
│   └── assets/
├── storage/
│   ├── cache/
│   ├── logs/
│   └── tmp/
├── templates/                 # 視圖模板
│   ├── layouts/
│   │   └── main.html
│   └── pages/
│       └── home.html
├── tests/
│   ├── Unit/
│   └── Integration/
├── vendor/
├── composer.json
└── .env
```

---

## Routing | 路由定義

### RESTful Routes | RESTful 路由

```php
// ✅ 正確：RESTful 路由定義
// config/routes.ini 或 app/routes.php

// API Routes | API 路由
$f3->route('GET /api/users', 'App\Controllers\Api\UserController->index');
$f3->route('GET /api/users/@id', 'App\Controllers\Api\UserController->show');
$f3->route('POST /api/users', 'App\Controllers\Api\UserController->store');
$f3->route('PUT /api/users/@id', 'App\Controllers\Api\UserController->update');
$f3->route('DELETE /api/users/@id', 'App\Controllers\Api\UserController->destroy');

// Web Routes | 網頁路由
$f3->route('GET /', 'App\Controllers\Web\HomeController->index');
$f3->route('GET /login', 'App\Controllers\Web\AuthController->showLogin');
$f3->route('POST /login', 'App\Controllers\Web\AuthController->login');
```

### Route Groups | 路由群組

```php
// ✅ 正確：使用路由群組
class RouteGroup
{
    public static function register(Base $f3): void
    {
        // API v1 群組
        self::apiV1Routes($f3);

        // Admin 群組
        self::adminRoutes($f3);
    }

    private static function apiV1Routes(Base $f3): void
    {
        $prefix = '/api/v1';

        $f3->route("GET {$prefix}/users", 'Api\V1\UserController->index');
        $f3->route("GET {$prefix}/users/@id", 'Api\V1\UserController->show');
        $f3->route("POST {$prefix}/users", 'Api\V1\UserController->store');
    }

    private static function adminRoutes(Base $f3): void
    {
        $prefix = '/admin';

        // 套用認證中介軟體
        $f3->route("GET {$prefix}/dashboard [auth]", 'Admin\DashboardController->index');
        $f3->route("GET {$prefix}/users [auth,admin]", 'Admin\UserController->index');
    }
}
```

### Route Parameters | 路由參數

```php
// ✅ 正確：路由參數處理
$f3->route('GET /users/@id', function(Base $f3, array $params) {
    $userId = (int) $params['id'];
    // ...
});

// ✅ 正確：可選參數
$f3->route('GET /posts/@category/@page', 'PostController->list');
$f3->route('GET /posts/@category', 'PostController->list');  // page 可選

// ✅ 正確：正則表達式約束
$f3->route('GET /users/@id:[0-9]+', 'UserController->show');  // 僅數字
$f3->route('GET /posts/@slug:[a-z0-9-]+', 'PostController->show');  // slug 格式
```

---

## Controllers | 控制器

### Base Controller | 基礎控制器

```php
<?php

declare(strict_types=1);

namespace App\Controllers;

use Base;
use Template;

abstract class BaseController
{
    protected Base $f3;
    protected Template $template;

    public function __construct()
    {
        $this->f3 = Base::instance();
        $this->template = Template::instance();
    }

    /**
     * 渲染視圖
     */
    protected function render(string $view, array $data = []): string
    {
        foreach ($data as $key => $value) {
            $this->f3->set($key, $value);
        }

        return $this->template->render($view);
    }

    /**
     * 回傳 JSON 回應
     */
    protected function json(mixed $data, int $statusCode = 200): void
    {
        $this->f3->set('RESPONSE.status', $statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    /**
     * 重新導向
     */
    protected function redirect(string $path): void
    {
        $this->f3->reroute($path);
    }

    /**
     * 取得 POST/PUT 資料
     */
    protected function getBody(): array
    {
        $contentType = $this->f3->get('HEADERS.Content-Type') ?? '';

        if (str_contains($contentType, 'application/json')) {
            return json_decode($this->f3->get('BODY'), true) ?? [];
        }

        return $this->f3->get('POST') ?? [];
    }
}
```

### API Controller | API 控制器

```php
<?php

declare(strict_types=1);

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Services\UserService;
use Base;

class UserController extends BaseController
{
    private UserService $userService;

    public function __construct()
    {
        parent::__construct();
        $this->userService = new UserService();
    }

    /**
     * GET /api/users
     */
    public function index(Base $f3): void
    {
        $page = (int) ($f3->get('GET.page') ?? 1);
        $perPage = (int) ($f3->get('GET.per_page') ?? 20);

        $result = $this->userService->paginate($page, $perPage);

        $this->json([
            'data' => $result['data'],
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $result['total'],
            ],
        ]);
    }

    /**
     * GET /api/users/@id
     */
    public function show(Base $f3, array $params): void
    {
        $userId = (int) $params['id'];

        try {
            $user = $this->userService->findById($userId);
            $this->json(['data' => $user]);
        } catch (UserNotFoundException $e) {
            $this->json(['error' => 'User not found'], 404);
        }
    }

    /**
     * POST /api/users
     */
    public function store(Base $f3): void
    {
        $data = $this->getBody();

        // 驗證輸入
        $errors = $this->validate($data, [
            'email' => 'required|email',
            'name' => 'required|min:2',
            'password' => 'required|min:8',
        ]);

        if (!empty($errors)) {
            $this->json(['errors' => $errors], 422);
            return;
        }

        $user = $this->userService->create($data);
        $this->json(['data' => $user], 201);
    }
}
```

---

## Models | 資料模型

### Using DB Mapper | 使用 DB Mapper

```php
<?php

declare(strict_types=1);

namespace App\Models;

use DB\SQL\Mapper;
use DateTime;

class User extends Mapper
{
    public function __construct()
    {
        parent::__construct(
            \Base::instance()->get('DB'),
            'users'
        );
    }

    /**
     * 根據 email 查詢使用者
     */
    public function findByEmail(string $email): ?self
    {
        $this->load(['email = ?', $email]);

        return $this->dry() ? null : $this;
    }

    /**
     * 驗證密碼
     */
    public function verifyPassword(string $password): bool
    {
        return password_verify($password, $this->password);
    }

    /**
     * 設定密碼（自動雜湊）
     */
    public function setPassword(string $password): void
    {
        $this->password = password_hash($password, PASSWORD_ARGON2ID);
    }

    /**
     * 轉換為陣列
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'name' => $this->name,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * 儲存前的 hook
     */
    public function beforeSave(): void
    {
        $now = (new DateTime())->format('Y-m-d H:i:s');

        if ($this->dry()) {
            $this->created_at = $now;
        }

        $this->updated_at = $now;
    }
}
```

### Query Best Practices | 查詢最佳實踐

```php
// ✅ 正確：使用參數化查詢
$user = new User();
$user->load(['email = ? AND status = ?', $email, 'active']);

// ✅ 正確：使用具名參數
$user->load([
    'email = :email AND status = :status',
    ':email' => $email,
    ':status' => 'active',
]);

// ✅ 正確：複雜查詢
$users = $user->find(
    ['department_id = ? AND role IN ?', $deptId, ['admin', 'manager']],
    [
        'order' => 'created_at DESC',
        'limit' => 20,
        'offset' => 0,
    ]
);

// ❌ 危險：字串拼接（SQL Injection）
$user->load("email = '$email'");  // 禁止！
```

---

## Middleware | 中介軟體

### Authentication Middleware | 認證中介軟體

```php
<?php

declare(strict_types=1);

namespace App\Middleware;

use Base;

class AuthMiddleware
{
    /**
     * 驗證 JWT Token
     */
    public function beforeRoute(Base $f3): void
    {
        $authHeader = $f3->get('HEADERS.Authorization') ?? '';

        if (!str_starts_with($authHeader, 'Bearer ')) {
            $this->unauthorized($f3, 'Missing authorization header');
            return;
        }

        $token = substr($authHeader, 7);

        try {
            $payload = $this->validateToken($token);
            $f3->set('AUTH.user_id', $payload['user_id']);
            $f3->set('AUTH.role', $payload['role']);
        } catch (InvalidTokenException $e) {
            $this->unauthorized($f3, 'Invalid or expired token');
        }
    }

    private function unauthorized(Base $f3, string $message): void
    {
        $f3->set('RESPONSE.status', 401);
        header('Content-Type: application/json');
        echo json_encode(['error' => $message]);
        exit;
    }

    private function validateToken(string $token): array
    {
        // JWT 驗證邏輯
        // ...
    }
}
```

### CORS Middleware | CORS 中介軟體

```php
<?php

declare(strict_types=1);

namespace App\Middleware;

use Base;

class CorsMiddleware
{
    private array $allowedOrigins = [
        'https://example.com',
        'https://app.example.com',
    ];

    public function beforeRoute(Base $f3): void
    {
        $origin = $f3->get('HEADERS.Origin') ?? '';

        if (in_array($origin, $this->allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
            header('Access-Control-Max-Age: 86400');
        }

        // Preflight request
        if ($f3->get('VERB') === 'OPTIONS') {
            $f3->set('RESPONSE.status', 204);
            exit;
        }
    }
}
```

### Registering Middleware | 註冊中介軟體

```php
// public/index.php 或 bootstrap.php

$f3 = Base::instance();

// 全域中介軟體
$f3->set('MIDDLEWARE', [
    'before' => [
        new \App\Middleware\CorsMiddleware(),
    ],
]);

// 路由專用中介軟體
$f3->route('GET /api/users [auth]', 'UserController->index');
$f3->route('GET /admin/* [auth,admin]', 'AdminController->*');

// 註冊中介軟體別名
$f3->set('middleware.auth', new \App\Middleware\AuthMiddleware());
$f3->set('middleware.admin', new \App\Middleware\AdminMiddleware());
```

---

## Configuration | 設定管理

### Main Configuration | 主設定檔

```ini
; config/config.ini

[globals]
; 應用程式設定
APP_NAME = "My Application"
APP_ENV = production
APP_DEBUG = false
APP_URL = "https://example.com"

; 時區
TZ = Asia/Taipei

; 資料庫設定
DB.dsn = "mysql:host=localhost;dbname=myapp;charset=utf8mb4"
DB.user = "root"
DB.password = ""

; 快取設定
CACHE = "redis=127.0.0.1:6379"

; Session 設定
SESSION.name = "my_app_session"
SESSION.expire = 3600

; 日誌設定
LOG.level = "error"
LOG.path = "storage/logs/"
```

### Environment-Specific Configuration | 環境專用設定

```ini
; config/config.dev.ini

[globals]
APP_ENV = development
APP_DEBUG = true

DB.dsn = "mysql:host=localhost;dbname=myapp_dev;charset=utf8mb4"
DB.user = "dev_user"
DB.password = "dev_password"

CACHE = "folder=storage/cache/"

LOG.level = "debug"
```

```ini
; config/config.prod.ini

[globals]
APP_ENV = production
APP_DEBUG = false

; 從環境變數讀取敏感資訊
DB.dsn = "${DATABASE_URL}"
DB.user = "${DB_USERNAME}"
DB.password = "${DB_PASSWORD}"

CACHE = "redis=${REDIS_URL}"

LOG.level = "error"
```

### Loading Configuration | 載入設定

```php
<?php
// public/index.php

$f3 = Base::instance();

// 載入主設定
$f3->config('config/config.ini');

// 根據環境載入對應設定
$env = getenv('APP_ENV') ?: 'production';
$envConfig = "config/config.{$env}.ini";

if (file_exists($envConfig)) {
    $f3->config($envConfig);
}

// 從 .env 載入敏感資訊（開發環境）
if (file_exists('.env') && $env === 'development') {
    $f3->config('.env');
}
```

### Environment Variables | 環境變數處理

```php
// ✅ 正確：安全地讀取環境變數
class Config
{
    public static function get(string $key, mixed $default = null): mixed
    {
        $f3 = Base::instance();

        // 優先從 F3 設定讀取
        $value = $f3->get($key);

        if ($value !== null) {
            return $value;
        }

        // 次之從環境變數讀取
        $envValue = getenv(str_replace('.', '_', strtoupper($key)));

        return $envValue !== false ? $envValue : $default;
    }

    public static function isDebug(): bool
    {
        return (bool) self::get('APP_DEBUG', false);
    }

    public static function isProduction(): bool
    {
        return self::get('APP_ENV') === 'production';
    }
}
```

---

## Error Handling | 錯誤處理

### Custom Error Handler | 自訂錯誤處理器

```php
<?php

$f3 = Base::instance();

// 設定錯誤處理器
$f3->set('ONERROR', function(Base $f3) {
    $error = $f3->get('ERROR');

    // 記錄錯誤
    error_log(sprintf(
        "[%s] %s: %s in %s:%d\nTrace: %s",
        date('Y-m-d H:i:s'),
        $error['code'],
        $error['text'],
        $error['trace'][0]['file'] ?? 'unknown',
        $error['trace'][0]['line'] ?? 0,
        json_encode($error['trace'])
    ));

    // API 回應
    if (str_starts_with($f3->get('PATH'), '/api/')) {
        header('Content-Type: application/json');
        echo json_encode([
            'error' => [
                'code' => $error['code'],
                'message' => $f3->get('APP_DEBUG')
                    ? $error['text']
                    : 'An error occurred',
            ],
        ]);
        return;
    }

    // 網頁回應
    $template = Template::instance();
    echo $template->render('errors/' . $error['code'] . '.html');
});
```

### Exception Handling | 例外處理

```php
// ✅ 正確：在控制器中處理例外
class UserController extends BaseController
{
    public function show(Base $f3, array $params): void
    {
        try {
            $user = $this->userService->findById((int) $params['id']);
            $this->json(['data' => $user->toArray()]);

        } catch (UserNotFoundException $e) {
            $this->json(['error' => 'User not found'], 404);

        } catch (DatabaseException $e) {
            $this->f3->error(500, 'Database error');

        } catch (Throwable $e) {
            // 記錄未預期的錯誤
            error_log($e->getMessage() . "\n" . $e->getTraceAsString());
            $this->f3->error(500, 'Internal server error');
        }
    }
}
```

---

## Testing | 測試

### Unit Test Example | 單元測試範例

```php
<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Services\UserService;
use App\Repositories\UserRepository;
use PHPUnit\Framework\TestCase;

class UserServiceTest extends TestCase
{
    private UserService $userService;
    private UserRepository $userRepository;

    protected function setUp(): void
    {
        $this->userRepository = $this->createMock(UserRepository::class);
        $this->userService = new UserService($this->userRepository);
    }

    public function testFindByIdReturnsUser(): void
    {
        // Arrange
        $expectedUser = ['id' => 1, 'email' => 'test@example.com'];
        $this->userRepository
            ->method('findById')
            ->with(1)
            ->willReturn($expectedUser);

        // Act
        $result = $this->userService->findById(1);

        // Assert
        $this->assertEquals($expectedUser, $result);
    }

    public function testFindByIdThrowsWhenNotFound(): void
    {
        // Arrange
        $this->userRepository
            ->method('findById')
            ->with(999)
            ->willReturn(null);

        // Assert
        $this->expectException(UserNotFoundException::class);

        // Act
        $this->userService->findById(999);
    }
}
```

### Integration Test Example | 整合測試範例

```php
<?php

declare(strict_types=1);

namespace Tests\Integration;

use Base;
use PHPUnit\Framework\TestCase;

class UserApiTest extends TestCase
{
    private Base $f3;

    protected function setUp(): void
    {
        $this->f3 = Base::instance();
        $this->f3->config('config/config.test.ini');

        // 設定測試資料庫
        $this->setupTestDatabase();
    }

    protected function tearDown(): void
    {
        $this->cleanupTestDatabase();
    }

    public function testGetUsersReturnsJsonList(): void
    {
        // Arrange
        $this->insertTestUsers(3);

        // Act
        $this->f3->mock('GET /api/users');

        // Assert
        $response = json_decode($this->f3->get('RESPONSE'), true);
        $this->assertCount(3, $response['data']);
    }

    public function testCreateUserReturns201(): void
    {
        // Arrange
        $userData = [
            'email' => 'new@example.com',
            'name' => 'New User',
            'password' => 'SecureP@ss123',
        ];

        // Act
        $this->f3->mock('POST /api/users', $userData);

        // Assert
        $this->assertEquals(201, $this->f3->get('RESPONSE.status'));
    }
}
```

---

## Security Checklist | 安全檢查清單

### Before Deployment | 部署前檢查

- [ ] **APP_DEBUG = false** in production
- [ ] Database credentials in environment variables (not in code)
- [ ] All user inputs validated and sanitized
- [ ] Prepared statements used for all database queries
- [ ] XSS prevention (htmlspecialchars) applied to all output
- [ ] CSRF tokens implemented for forms
- [ ] Rate limiting configured for API endpoints
- [ ] HTTPS enforced
- [ ] Secure session configuration
- [ ] Error details hidden from users in production

---

## Related Standards | 相關標準

- [PHP Coding Style Guide](../languages/php-style.md) - PHP 編碼風格指南
- [Anti-Hallucination Standard](../../core/anti-hallucination.md) - AI 協作防幻覺標準
- [Code Check-in Standards](../../core/checkin-standards.md) - 程式碼簽入檢查點標準
- [Testing Standards](../../core/testing-standards.md) - 測試標準

---

## Quick Reference Card | 快速參考卡

```
┌─────────────────────────────────────────────────────────┐
│               Fat-Free Framework Patterns                │
├─────────────────────────────────────────────────────────┤
│  Project Structure                                       │
├─────────────────────────────────────────────────────────┤
│  app/Controllers/    │  控制器                          │
│  app/Models/         │  資料模型 (DB Mapper)            │
│  app/Services/       │  業務邏輯                        │
│  app/Middleware/     │  中介軟體                        │
│  config/             │  設定檔                          │
│  templates/          │  視圖模板                        │
├─────────────────────────────────────────────────────────┤
│  Routing                                                 │
├─────────────────────────────────────────────────────────┤
│  GET /users          │  $f3->route('GET /users', ...)   │
│  Route params        │  /users/@id:[0-9]+               │
│  Middleware          │  [auth,admin]                    │
├─────────────────────────────────────────────────────────┤
│  Configuration                                           │
├─────────────────────────────────────────────────────────┤
│  Main config         │  config/config.ini               │
│  Dev config          │  config/config.dev.ini           │
│  Prod config         │  config/config.prod.ini          │
│  Env vars            │  ${DATABASE_URL}                 │
├─────────────────────────────────────────────────────────┤
│  Security Essentials                                     │
├─────────────────────────────────────────────────────────┤
│  ✅ Prepared statements for all queries                 │
│  ✅ Input validation before processing                  │
│  ✅ APP_DEBUG = false in production                     │
│  ✅ Sensitive config in environment variables           │
└─────────────────────────────────────────────────────────┘
```

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-23 | Initial Fat-Free Framework v3.8+ patterns |

---

## License | 授權

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

---

**Maintainer**: Development Team
**維護者**: 開發團隊
