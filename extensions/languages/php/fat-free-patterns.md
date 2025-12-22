# Fat-Free Framework Patterns
# Fat-Free 框架模式指南

**Version**: 1.0.0
**Last Updated**: 2025-12-22
**Applicability**: Projects using Fat-Free Framework (F3)
**適用範圍**: 使用 Fat-Free 框架（F3）的專案

---

## Purpose | 目的

This guide defines patterns and best practices for projects using the Fat-Free Framework (F3), ensuring consistent architecture and maintainable code.

本指南定義使用 Fat-Free 框架（F3）的專案模式與最佳實踐，確保一致的架構與可維護的程式碼。

---

## Project Structure | 專案結構

### Recommended Directory Layout | 建議目錄結構

```
project/
├── app/
│   ├── Controllers/          # 控制器
│   │   ├── BaseController.php
│   │   ├── Api/
│   │   │   └── UserController.php
│   │   └── Web/
│   │       └── HomeController.php
│   ├── Models/               # 資料模型
│   │   └── User.php
│   ├── Services/             # 業務邏輯服務
│   │   └── UserService.php
│   ├── Repositories/         # 資料存取層
│   │   └── UserRepository.php
│   └── Middleware/           # 中介層
│       └── AuthMiddleware.php
├── config/
│   ├── config.ini            # 主設定檔
│   ├── routes.ini            # 路由設定
│   └── environments/
│       ├── development.ini
│       ├── staging.ini
│       └── production.ini
├── public/
│   ├── index.php             # 入口點
│   └── assets/
├── templates/                # 視圖範本
│   ├── layouts/
│   │   └── main.html
│   └── pages/
│       └── home.html
├── tests/
│   ├── Unit/
│   └── Integration/
├── vendor/
├── composer.json
└── .htaccess
```

---

## Routing Patterns | 路由模式

### Route Definition | 路由定義

#### Using routes.ini | 使用 routes.ini

```ini
; config/routes.ini

; Web Routes | 網頁路由
[routes]
GET /=Web\HomeController->index
GET /about=Web\HomeController->about

; API Routes | API 路由
GET /api/users=Api\UserController->list
GET /api/users/@id=Api\UserController->show
POST /api/users=Api\UserController->create
PUT /api/users/@id=Api\UserController->update
DELETE /api/users/@id=Api\UserController->delete

; Route with middleware | 帶中介層的路由
GET /admin/*=AdminController->*,beforeroute:AuthMiddleware->check
```

#### Using PHP Code | 使用 PHP 程式碼

```php
<?php

declare(strict_types=1);

// config/routes.php

$f3 = \Base::instance();

// 基本路由
$f3->route('GET /', 'Web\HomeController->index');

// RESTful API 路由
$f3->route('GET /api/users', 'Api\UserController->list');
$f3->route('GET /api/users/@id', 'Api\UserController->show');
$f3->route('POST /api/users', 'Api\UserController->create');
$f3->route('PUT /api/users/@id', 'Api\UserController->update');
$f3->route('DELETE /api/users/@id', 'Api\UserController->delete');

// 路由群組（使用前綴）
$f3->route('GET /api/v2/users', 'Api\V2\UserController->list');
$f3->route('GET /api/v2/users/@id', 'Api\V2\UserController->show');
```

### Route Parameters | 路由參數

```php
<?php

declare(strict_types=1);

namespace App\Controllers\Api;

use Base;

class UserController
{
    private Base $f3;

    public function __construct()
    {
        $this->f3 = Base::instance();
    }

    /**
     * 顯示單一使用者
     *
     * @param Base $f3 F3 實例
     * @param array $params 路由參數
     */
    public function show(Base $f3, array $params): void
    {
        $userId = (int) $params['id'];

        // 驗證參數
        if ($userId <= 0) {
            $this->jsonError('Invalid user ID', 400);
            return;
        }

        $user = $this->userService->getUserById($userId);

        if ($user === null) {
            $this->jsonError('User not found', 404);
            return;
        }

        $this->jsonSuccess($user);
    }
}
```

---

## Controller Patterns | 控制器模式

### Base Controller | 基礎控制器

```php
<?php

declare(strict_types=1);

namespace App\Controllers;

use Base;
use Template;

/**
 * 基礎控制器
 *
 * 提供所有控制器共用的功能。
 */
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
    protected function render(string $view, array $data = []): void
    {
        foreach ($data as $key => $value) {
            $this->f3->set($key, $value);
        }
        echo $this->template->render($view);
    }

    /**
     * 回傳 JSON 成功回應
     */
    protected function jsonSuccess(mixed $data, int $statusCode = 200): void
    {
        $this->f3->status($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => true,
            'data' => $data,
        ], JSON_UNESCAPED_UNICODE);
    }

    /**
     * 回傳 JSON 錯誤回應
     */
    protected function jsonError(string $message, int $statusCode = 400): void
    {
        $this->f3->status($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'error' => [
                'message' => $message,
                'code' => $statusCode,
            ],
        ], JSON_UNESCAPED_UNICODE);
    }

    /**
     * 取得請求 JSON 內容
     */
    protected function getJsonBody(): array
    {
        $body = $this->f3->get('BODY');
        $data = json_decode($body, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return [];
        }

        return $data ?? [];
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

/**
 * 使用者 API 控制器
 */
class UserController extends BaseController
{
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        parent::__construct();
        $this->userService = $userService;
    }

    /**
     * 列出所有使用者
     */
    public function list(Base $f3): void
    {
        $page = (int) $f3->get('GET.page') ?: 1;
        $limit = (int) $f3->get('GET.limit') ?: 20;

        $users = $this->userService->getPaginatedUsers($page, $limit);

        $this->jsonSuccess([
            'users' => $users['data'],
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $users['total'],
            ],
        ]);
    }

    /**
     * 建立使用者
     */
    public function create(Base $f3): void
    {
        $data = $this->getJsonBody();

        // 驗證必要欄位
        $required = ['name', 'email', 'password'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                $this->jsonError("Missing required field: {$field}", 400);
                return;
            }
        }

        try {
            $user = $this->userService->createUser($data);
            $this->jsonSuccess($user, 201);
        } catch (\Exception $e) {
            $this->jsonError($e->getMessage(), 500);
        }
    }
}
```

---

## Model Patterns | 模型模式

### Using Cortex ORM | 使用 Cortex ORM

```php
<?php

declare(strict_types=1);

namespace App\Models;

use DB\Cortex;

/**
 * 使用者模型
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property bool $is_active
 * @property string $created_at
 * @property string $updated_at
 */
class User extends Cortex
{
    protected $db = 'DB';
    protected $table = 'users';
    protected $primary = 'id';

    protected $fieldConf = [
        'name' => [
            'type' => 'VARCHAR(255)',
            'nullable' => false,
        ],
        'email' => [
            'type' => 'VARCHAR(255)',
            'nullable' => false,
        ],
        'password' => [
            'type' => 'VARCHAR(255)',
            'nullable' => false,
        ],
        'is_active' => [
            'type' => 'BOOLEAN',
            'default' => true,
        ],
        'created_at' => [
            'type' => 'DATETIME',
        ],
        'updated_at' => [
            'type' => 'DATETIME',
        ],
    ];

    /**
     * 儲存前的處理
     */
    public function beforeinsert(): void
    {
        $this->created_at = date('Y-m-d H:i:s');
        $this->updated_at = date('Y-m-d H:i:s');
    }

    /**
     * 更新前的處理
     */
    public function beforeupdate(): void
    {
        $this->updated_at = date('Y-m-d H:i:s');
    }

    /**
     * 檢查使用者是否啟用
     */
    public function isActive(): bool
    {
        return (bool) $this->is_active;
    }
}
```

### Using SQL Mapper | 使用 SQL Mapper

```php
<?php

declare(strict_types=1);

namespace App\Models;

use DB\SQL\Mapper;

/**
 * 使用者模型（SQL Mapper 版本）
 */
class User extends Mapper
{
    public function __construct()
    {
        $db = \Base::instance()->get('DB');
        parent::__construct($db, 'users');
    }

    /**
     * 根據 Email 查詢使用者
     */
    public function findByEmail(string $email): ?self
    {
        $this->load(['email = ?', $email]);

        if ($this->dry()) {
            return null;
        }

        return $this;
    }

    /**
     * 取得所有啟用的使用者
     */
    public function findAllActive(): array
    {
        return $this->find(['is_active = ?', true]);
    }
}
```

---

## Configuration Management | 設定檔管理

### Main Configuration | 主設定檔

```ini
; config/config.ini

[globals]
; 應用程式設定
APP.NAME=My Application
APP.VERSION=1.0.0
APP.DEBUG=false
APP.TIMEZONE=Asia/Taipei

; 快取設定
CACHE=redis=127.0.0.1:6379

; 日誌設定
LOGS=logs/

; 上傳設定
UPLOADS=uploads/
```

### Environment Configuration | 環境設定

```ini
; config/environments/development.ini

[globals]
APP.DEBUG=true
APP.ENV=development

; 資料庫設定
DB.HOST=localhost
DB.PORT=3306
DB.NAME=myapp_dev
DB.USER=root
DB.PASS=

; 日誌等級
LOG.LEVEL=debug
```

```ini
; config/environments/production.ini

[globals]
APP.DEBUG=false
APP.ENV=production

; 資料庫設定（使用環境變數）
DB.HOST=${DB_HOST}
DB.PORT=${DB_PORT}
DB.NAME=${DB_NAME}
DB.USER=${DB_USER}
DB.PASS=${DB_PASS}

; 日誌等級
LOG.LEVEL=error
```

### Loading Configuration | 載入設定

```php
<?php

declare(strict_types=1);

// public/index.php

$f3 = Base::instance();

// 載入基本設定
$f3->config('config/config.ini');

// 根據環境載入設定
$env = getenv('APP_ENV') ?: 'development';
$envConfigFile = "config/environments/{$env}.ini";

if (file_exists($envConfigFile)) {
    $f3->config($envConfigFile);
}

// 載入路由設定
$f3->config('config/routes.ini');

// 設定時區
date_default_timezone_set($f3->get('APP.TIMEZONE') ?: 'UTC');

// 設定資料庫連線
$f3->set('DB', new \DB\SQL(
    sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        $f3->get('DB.HOST'),
        $f3->get('DB.PORT'),
        $f3->get('DB.NAME')
    ),
    $f3->get('DB.USER'),
    $f3->get('DB.PASS')
));

$f3->run();
```

---

## Middleware Patterns | 中介層模式

### Authentication Middleware | 認證中介層

```php
<?php

declare(strict_types=1);

namespace App\Middleware;

use Base;

/**
 * 認證中介層
 */
class AuthMiddleware
{
    private Base $f3;

    public function __construct()
    {
        $this->f3 = Base::instance();
    }

    /**
     * 檢查認證狀態
     *
     * 此方法會在路由處理前執行。
     */
    public function check(Base $f3): void
    {
        $token = $this->getTokenFromHeader();

        if ($token === null) {
            $this->unauthorized('Missing authentication token');
            return;
        }

        $user = $this->validateToken($token);

        if ($user === null) {
            $this->unauthorized('Invalid or expired token');
            return;
        }

        // 將使用者資訊存入 F3 hive
        $f3->set('AUTH.user', $user);
    }

    /**
     * 從請求標頭取得 Token
     */
    private function getTokenFromHeader(): ?string
    {
        $header = $this->f3->get('HEADERS.Authorization');

        if ($header === null) {
            return null;
        }

        if (preg_match('/Bearer\s+(.+)/', $header, $matches)) {
            return $matches[1];
        }

        return null;
    }

    /**
     * 驗證 Token
     */
    private function validateToken(string $token): ?array
    {
        // 實作 Token 驗證邏輯
        // ...
        return null;
    }

    /**
     * 回傳未授權錯誤
     */
    private function unauthorized(string $message): void
    {
        $this->f3->status(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'error' => [
                'message' => $message,
                'code' => 401,
            ],
        ], JSON_UNESCAPED_UNICODE);

        // 終止路由執行
        $this->f3->set('HALT', true);
    }
}
```

### CORS Middleware | CORS 中介層

```php
<?php

declare(strict_types=1);

namespace App\Middleware;

use Base;

/**
 * CORS 中介層
 */
class CorsMiddleware
{
    private const ALLOWED_ORIGINS = [
        'http://localhost:3000',
        'https://example.com',
    ];

    private const ALLOWED_METHODS = [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'OPTIONS',
    ];

    private const ALLOWED_HEADERS = [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
    ];

    /**
     * 處理 CORS
     */
    public function handle(Base $f3): void
    {
        $origin = $f3->get('HEADERS.Origin');

        if ($origin !== null && in_array($origin, self::ALLOWED_ORIGINS, true)) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Access-Control-Allow-Methods: ' . implode(', ', self::ALLOWED_METHODS));
            header('Access-Control-Allow-Headers: ' . implode(', ', self::ALLOWED_HEADERS));
            header('Access-Control-Max-Age: 86400');
        }

        // 處理 OPTIONS 預檢請求
        if ($f3->get('VERB') === 'OPTIONS') {
            $f3->status(204);
            $f3->set('HALT', true);
        }
    }
}
```

---

## Service Layer Patterns | 服務層模式

### Service Class | 服務類別

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepositoryInterface;
use Psr\Log\LoggerInterface;

/**
 * 使用者服務
 *
 * 處理使用者相關的業務邏輯。
 */
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

    /**
     * 根據 ID 取得使用者
     */
    public function getUserById(int $userId): ?User
    {
        $user = $this->userRepository->findById($userId);

        if ($user === null) {
            $this->logger->info('User not found', ['user_id' => $userId]);
        }

        return $user;
    }

    /**
     * 建立使用者
     *
     * @throws \InvalidArgumentException 當 email 已存在時
     */
    public function createUser(array $data): User
    {
        // 檢查 email 是否已存在
        $existingUser = $this->userRepository->findByEmail($data['email']);
        if ($existingUser !== null) {
            throw new \InvalidArgumentException('Email already exists');
        }

        // 雜湊密碼
        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);

        $user = $this->userRepository->create($data);

        $this->logger->info('User created', ['user_id' => $user->id]);

        return $user;
    }

    /**
     * 取得分頁使用者列表
     */
    public function getPaginatedUsers(int $page, int $limit): array
    {
        $offset = ($page - 1) * $limit;
        $users = $this->userRepository->findAll($limit, $offset);
        $total = $this->userRepository->count();

        return [
            'data' => $users,
            'total' => $total,
        ];
    }
}
```

---

## Error Handling | 錯誤處理

### Custom Error Handler | 自定義錯誤處理

```php
<?php

declare(strict_types=1);

// 設定錯誤處理
$f3->set('ONERROR', function (Base $f3): void {
    $error = $f3->get('ERROR');

    // 記錄錯誤
    $logger = $f3->get('logger');
    $logger->error('Application error', [
        'code' => $error['code'],
        'message' => $error['text'],
        'trace' => $error['trace'],
    ]);

    // API 請求回傳 JSON
    if (str_starts_with($f3->get('PATH'), '/api/')) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'error' => [
                'message' => $f3->get('APP.DEBUG')
                    ? $error['text']
                    : 'Internal server error',
                'code' => $error['code'],
            ],
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    // 網頁請求顯示錯誤頁面
    $template = Template::instance();
    $f3->set('error', $error);
    echo $template->render('pages/error.html');
});
```

---

## Related Standards | 相關標準

- [PHP Style Guide](php-style.md) - PHP 程式碼風格指南
- [Anti-Hallucination Standard](../../../core/anti-hallucination.md) - AI 協作防幻覺標準
- [Code Check-in Standards](../../../core/checkin-standards.md) - 程式碼簽入檢查點標準
- [Testing Standards](../../../core/testing-standards.md) - 測試標準

---

## Quick Reference Card | 快速參考卡

```
┌─────────────────────────────────────────────────────────┐
│              Fat-Free Framework Quick Reference          │
├─────────────────────────────────────────────────────────┤
│  Route Definition                                        │
│  GET /users/@id      →  UserController->show            │
│  POST /users         →  UserController->create          │
├─────────────────────────────────────────────────────────┤
│  Controller Response                                     │
│  $this->jsonSuccess($data, 200);                        │
│  $this->jsonError('message', 400);                      │
├─────────────────────────────────────────────────────────┤
│  Route Parameters                                        │
│  $params['id']       →  路由參數                        │
│  $f3->get('GET.key') →  Query 參數                      │
│  $f3->get('POST.key')→  Form 參數                       │
├─────────────────────────────────────────────────────────┤
│  Configuration                                           │
│  $f3->get('APP.NAME')→  取得設定值                      │
│  $f3->set('key', $v) →  設定值                          │
├─────────────────────────────────────────────────────────┤
│  Database                                                │
│  $mapper->load()     →  載入單筆                        │
│  $mapper->find()     →  查詢多筆                        │
│  $mapper->save()     →  儲存                            │
└─────────────────────────────────────────────────────────┘
```

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-22 | Initial Fat-Free Framework patterns guide |

---

## License | 授權

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

---

**Maintainer**: Development Team
**維護者**: 開發團隊
