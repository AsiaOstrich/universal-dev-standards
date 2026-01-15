---
source: ../../../../../skills/claude-code/project-structure-guide/language-patterns.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 语言特定项目模式

各语言项目结构快速參考。

## Node.js / TypeScript

### Express/NestJS API

```
project/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   └── utils/
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
└── .gitignore
```

### Next.js

```
project/
├── app/                  # App Router（Next.js 13+）
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
├── components/
├── lib/
├── public/
├── package.json
└── next.config.js
```

## Python

### FastAPI / Flask

```
project/
├── src/
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── config.py
│       ├── routers/
│       ├── services/
│       ├── models/
│       └── schemas/
├── tests/
├── pyproject.toml
├── requirements.txt
└── .gitignore
```

### Django

```
project/
├── project_name/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   └── app_name/
├── templates/
├── static/
├── manage.py
└── requirements.txt
```

## Go

### 标准佈局

```
project/
├── cmd/
│   └── appname/
│       └── main.go
├── internal/
│   ├── app/
│   ├── handler/
│   ├── service/
│   └── repository/
├── pkg/
├── api/
├── configs/
├── go.mod
├── go.sum
└── Makefile
```

## Rust

### Binary 应用程序

```
project/
├── src/
│   ├── main.rs
│   ├── lib.rs
│   ├── config.rs
│   └── modules/
├── tests/
├── benches/
├── Cargo.toml
└── Cargo.lock
```

### Workspace

```
project/
├── crates/
│   ├── core/
│   ├── api/
│   └── cli/
├── Cargo.toml
└── Cargo.lock
```

## Kotlin

### Spring Boot

```
project/
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── com/example/
│   │   └── resources/
│   └── test/
├── build.gradle.kts
└── settings.gradle.kts
```

### Android

```
project/
├── app/
│   ├── src/
│   │   ├── main/
│   │   ├── test/
│   │   └── androidTest/
│   └── build.gradle.kts
├── build.gradle.kts
└── settings.gradle.kts
```

## PHP

### Laravel

```
project/
├── app/
│   ├── Http/
│   ├── Models/
│   └── Services/
├── config/
├── database/
├── public/
├── resources/
├── routes/
├── tests/
├── composer.json
└── artisan
```

## Ruby

### Rails

```
project/
├── app/
│   ├── controllers/
│   ├── models/
│   ├── views/
│   └── services/
├── config/
├── db/
├── lib/
├── spec/
├── Gemfile
└── Rakefile
```

## Swift

### iOS App（SwiftUI）

```
project/
├── AppName/
│   ├── App/
│   ├── Features/
│   ├── Core/
│   └── Resources/
├── AppNameTests/
├── AppNameUITests/
└── AppName.xcodeproj
```

### SPM Package

```
project/
├── Sources/
│   └── PackageName/
├── Tests/
│   └── PackageNameTests/
├── Package.swift
└── README.md
```

## Gitignore 必要项目

### 通用

```gitignore
# 建構输出
dist/
build/
out/
bin/

# 環境
.env
.env.*

# IDE
.idea/
.vscode/
*.swp

# 作业系统
.DS_Store
Thumbs.db
```

### 语言特定

| 语言 | 模式 |
|------|------|
| Node.js | node_modules/、*.log |
| Python | __pycache__/、*.pyc、.venv/ |
| Go | vendor/（如不使用 modules） |
| Rust | target/、Cargo.lock（函式庫） |
| Java/.NET | *.class、bin/、obj/ |
