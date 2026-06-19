---
source: options/project-structure/ruby.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---
# Ruby 專案結構

> **語言**: [English](../../../../options/project-structure/ruby.md) | 繁體中文

**上層標準**: [Project Structure](../../core/project-structure.md)

---

## 概觀

Ruby 專案結構會因 gem、Rails 應用程式與其他框架而有所不同。它們全都使用 Bundler 進行相依性管理，並遵循程式碼組織的慣例。

## 專案類型

### Gem（函式庫）

```
project-root/
├── lib/
│   ├── gem_name.rb       # Main entry point
│   └── gem_name/
│       ├── version.rb
│       ├── client.rb
│       └── errors.rb
├── spec/                 # RSpec tests
│   ├── spec_helper.rb
│   └── gem_name/
│       └── client_spec.rb
├── bin/                  # Executables
│   └── gem_name
├── sig/                  # RBS type signatures
├── Gemfile
├── Gemfile.lock
├── gem_name.gemspec
├── Rakefile
└── README.md
```

### Rails 應用程式

```
project-root/
├── app/
│   ├── controllers/
│   ├── models/
│   ├── views/
│   ├── helpers/
│   ├── mailers/
│   ├── jobs/
│   └── services/         # Custom addition
├── config/
│   ├── routes.rb
│   ├── database.yml
│   └── environments/
├── db/
│   ├── migrate/
│   ├── schema.rb
│   └── seeds.rb
├── lib/
│   └── tasks/
├── public/
├── spec/                 # or test/
│   ├── models/
│   ├── controllers/
│   ├── requests/
│   └── factories/
├── Gemfile
└── config.ru
```

### Sinatra 應用程式

```
project-root/
├── app.rb                # Main application
├── config.ru
├── lib/
│   └── helpers/
├── views/
├── public/
├── spec/
├── Gemfile
└── Gemfile.lock
```

## 設定檔

| 檔案 | 用途 | Required |
|------|---------|----------|
| `Gemfile` | 相依性宣告 | Yes |
| `Gemfile.lock` | 相依性鎖定檔 | Yes |
| `*.gemspec` | Gem 規格說明 | Gems only |
| `Rakefile` | Rake 任務 | No |
| `.rubocop.yml` | RuboCop 設定 | No |
| `.rspec` | RSpec 設定 | No |

## .gitignore

```
.bundle/
log/
tmp/
*.gem
.env
coverage/
node_modules/
.byebug_history
```

## 工具

| 類別 | 工具 |
|----------|-------|
| Build | Rake, Bundler |
| Test Runner | RSpec, Minitest |
| Linter | RuboCop, Standard |
| Formatter | RuboCop --auto-correct, Standard |
| Package Manager | Bundler, RubyGems |
| Documentation | YARD, RDoc |

## 規則

| 規則 | 說明 | 優先級 |
|------|-------------|----------|
| lib 結構 | 將主要程式碼放在 `lib/<gem_name>/` | Required |
| spec 位置 | 在 `spec/` 目錄中對映 `lib/` 結構 | Recommended |
| Service 物件 | 在 `app/services/` 中使用 service 物件處理複雜操作 | Recommended |
| FactoryBot | 搭配 `spec/factories/` 中的 factory 使用 FactoryBot | Recommended |
| RuboCop 設定 | 為 RuboCop 設定專案專屬規則 | Recommended |

## 相關選項

- [PHP](./php.md) - PHP 專案結構
- [Python](./python.md) - Python 專案結構

---

## 參考資料

- [Bundler](https://bundler.io/)
- [Rails Guides](https://guides.rubyonrails.org/)
- [RubyGems](https://rubygems.org/)

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
