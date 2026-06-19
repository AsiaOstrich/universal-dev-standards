# PHP Project Structure

> **Language**: English | [繁體中文](../../locales/zh-TW/options/project-structure/php.md) | [简体中文](../../locales/zh-CN/options/project-structure/php.md)

**Parent Standard**: [Project Structure](../../core/project-structure.md)

---

## Overview

PHP project structure varies by framework but follows PSR standards for autoloading. The `public/` directory serves as the web root, while application code resides in `src/` or framework-specific directories.

## Project Types

### Standard PHP

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

## Configuration Files

| File | Purpose | Required |
|------|---------|----------|
| `composer.json` | Package manifest | Yes |
| `composer.lock` | Dependency lock file | Yes |
| `phpunit.xml` | PHPUnit configuration | No |
| `.php-cs-fixer.php` | Code style configuration | No |
| `phpstan.neon` | Static analysis configuration | No |

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

## Tools

| Category | Tools |
|----------|-------|
| Build | Composer |
| Test Runner | PHPUnit, Pest, Codeception |
| Linter | PHP_CodeSniffer, PHP-CS-Fixer |
| Static Analysis | PHPStan, Psalm |
| Package Manager | Composer, Packagist |
| Documentation | phpDocumentor |

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| PSR-4 autoloading | Follow PSR-4 autoloading standard | Required |
| Public web root | Point web root to `public/` directory only | Required |
| Environment config | Use .env files for environment-specific config | Recommended |
| Tests mirror | Mirror `src/` structure in `tests/` directory | Recommended |
| Dependency injection | Use dependency injection container | Recommended |

## Related Options

- [Node.js](./nodejs.md) - Node.js project structure
- [Ruby](./ruby.md) - Ruby project structure

---

## References

- [PHP Standards Recommendations (PSR)](https://www.php-fig.org/psr/)
- [Composer](https://getcomposer.org/)
- [Laravel Documentation](https://laravel.com/docs)
- [Symfony Documentation](https://symfony.com/doc/current/index.html)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
