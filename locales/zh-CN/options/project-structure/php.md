---
source: options/project-structure/php.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# PHP 项目结构

> **语言**: [English](../../../../options/project-structure/php.md) | 简体中文

**上层标准**: [Project Structure](../../core/project-structure.md)

---

## 概览

PHP 项目结构会因框架而异，但都遵循 PSR 标准来进行 autoload。`public/` 目录作为 web root，而应用代码则放在 `src/` 或框架特定的目录中。

## 项目类型

### 标准 PHP

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

## 配置文件

| 文件 | 用途 | Required |
|------|------|----------|
| `composer.json` | 包 manifest | Yes |
| `composer.lock` | 依赖包锁定文件 | Yes |
| `phpunit.xml` | PHPUnit 配置 | No |
| `.php-cs-fixer.php` | 代码风格配置 | No |
| `phpstan.neon` | 静态分析配置 | No |

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

| 类别 | 工具 |
|------|------|
| Build | Composer |
| 测试运行器 | PHPUnit, Pest, Codeception |
| Linter | PHP_CodeSniffer, PHP-CS-Fixer |
| 静态分析 | PHPStan, Psalm |
| 包管理器 | Composer, Packagist |
| 文档 | phpDocumentor |

## 规则

| 规则 | 说明 | 优先级 |
|------|------|--------|
| PSR-4 autoloading | 遵循 PSR-4 autoload 标准 | Required |
| Public web root | 将 web root 仅指向 `public/` 目录 | Required |
| 环境配置 | 使用 .env 文件存放环境特定的配置 | Recommended |
| 测试映射 | 在 `tests/` 目录中映射 `src/` 结构 | Recommended |
| 依赖注入 | 使用依赖注入容器（dependency injection container） | Recommended |

## 相关选项

- [Node.js](./nodejs.md) - Node.js 项目结构
- [Ruby](./ruby.md) - Ruby 项目结构

---

## 参考资料

- [PHP Standards Recommendations (PSR)](https://www.php-fig.org/psr/)
- [Composer](https://getcomposer.org/)
- [Laravel Documentation](https://laravel.com/docs)
- [Symfony Documentation](https://symfony.com/doc/current/index.html)

---

## 许可

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
