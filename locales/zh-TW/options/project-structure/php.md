---
source: options/project-structure/php.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# PHP 專案結構

> **語言**: [English](../../../../options/project-structure/php.md) | 繁體中文

**上層標準**: [Project Structure](../../core/project-structure.md)

---

## 概觀

PHP 專案結構會因框架而異，但都遵循 PSR 標準來進行 autoload。`public/` 目錄作為 web root，而應用程式碼則放在 `src/` 或框架特定的目錄中。

## 專案類型

### 標準 PHP

```
project-root/
├── src/
│   ├── Controller/
│   ├── Service/
│   ├── Repository/
│   ├── Entity/
│   ├── Exception/
│   └── Helper/
├── config/
│   └── config.php
├── public/               # Web root
│   ├── index.php
│   ├── css/
│   ├── js/
│   └── images/
├── resources/
│   └── views/
├── tests/
│   ├── Unit/
│   └── Feature/
├── vendor/               # Dependencies (gitignored)
├── storage/              # Logs, cache (gitignored)
├── composer.json
├── composer.lock
└── phpunit.xml
```

### Laravel

```
project-root/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Middleware/
│   ├── Models/
│   ├── Services/
│   └── Providers/
├── config/
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── public/
├── resources/
│   ├── views/
│   ├── css/
│   └── js/
├── routes/
├── storage/
├── tests/
├── composer.json
└── artisan
```

### Symfony

```
project-root/
├── bin/
│   └── console
├── config/
│   ├── packages/
│   ├── routes/
│   └── services.yaml
├── public/
│   └── index.php
├── src/
│   ├── Controller/
│   ├── Entity/
│   ├── Repository/
│   └── Service/
├── templates/
├── tests/
├── var/                  # Cache, logs
├── vendor/
└── composer.json
```

## 設定檔

| 檔案 | 用途 | Required |
|------|------|----------|
| `composer.json` | 套件 manifest | Yes |
| `composer.lock` | 相依套件鎖定檔 | Yes |
| `phpunit.xml` | PHPUnit 設定 | No |
| `.php-cs-fixer.php` | 程式碼風格設定 | No |
| `phpstan.neon` | 靜態分析設定 | No |

## .gitignore

```
vendor/
storage/
var/
.env
.env.local
*.cache
*.log
node_modules/
```

## 工具

| 類別 | 工具 |
|------|------|
| Build | Composer |
| 測試執行器 | PHPUnit, Pest, Codeception |
| Linter | PHP_CodeSniffer, PHP-CS-Fixer |
| 靜態分析 | PHPStan, Psalm |
| 套件管理器 | Composer, Packagist |
| 文件 | phpDocumentor |

## 規則

| 規則 | 說明 | 優先度 |
|------|------|--------|
| PSR-4 autoloading | 遵循 PSR-4 autoload 標準 | Required |
| Public web root | 將 web root 僅指向 `public/` 目錄 | Required |
| 環境設定 | 使用 .env 檔案存放環境特定的設定 | Recommended |
| 測試對映 | 在 `tests/` 目錄中對映 `src/` 結構 | Recommended |
| 相依注入 | 使用相依注入容器（dependency injection container） | Recommended |

## 相關選項

- [Node.js](./nodejs.md) - Node.js 專案結構
- [Ruby](./ruby.md) - Ruby 專案結構

---

## 參考資料

- [PHP Standards Recommendations (PSR)](https://www.php-fig.org/psr/)
- [Composer](https://getcomposer.org/)
- [Laravel Documentation](https://laravel.com/docs)
- [Symfony Documentation](https://symfony.com/doc/current/index.html)

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
