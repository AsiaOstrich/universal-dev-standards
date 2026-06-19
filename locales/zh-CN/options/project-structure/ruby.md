---
source: options/project-structure/ruby.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---
# Ruby 项目结构

> **语言**: [English](../../../../options/project-structure/ruby.md) | 简体中文

**上层标准**: [Project Structure](../../core/project-structure.md)

---

## 概览

Ruby 项目结构会因 gem、Rails 应用程序与其他框架而有所不同。它们全都使用 Bundler 进行依赖管理，并遵循代码组织的惯例。

## 项目类型

### Gem（库）

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

### Rails 应用程序

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

### Sinatra 应用程序

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

## 配置文件

| 文件 | 用途 | Required |
|------|---------|----------|
| `Gemfile` | 依赖声明 | Yes |
| `Gemfile.lock` | 依赖锁定文件 | Yes |
| `*.gemspec` | Gem 规格说明 | Gems only |
| `Rakefile` | Rake 任务 | No |
| `.rubocop.yml` | RuboCop 配置 | No |
| `.rspec` | RSpec 配置 | No |

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

| 类别 | 工具 |
|----------|-------|
| Build | Rake, Bundler |
| Test Runner | RSpec, Minitest |
| Linter | RuboCop, Standard |
| Formatter | RuboCop --auto-correct, Standard |
| Package Manager | Bundler, RubyGems |
| Documentation | YARD, RDoc |

## 规则

| 规则 | 说明 | 优先级 |
|------|-------------|----------|
| lib 结构 | 将主要代码放在 `lib/<gem_name>/` | Required |
| spec 位置 | 在 `spec/` 目录中对映 `lib/` 结构 | Recommended |
| Service 对象 | 在 `app/services/` 中使用 service 对象处理复杂操作 | Recommended |
| FactoryBot | 搭配 `spec/factories/` 中的 factory 使用 FactoryBot | Recommended |
| RuboCop 配置 | 为 RuboCop 配置项目专属规则 | Recommended |

## 相关选项

- [PHP](./php.md) - PHP 项目结构
- [Python](./python.md) - Python 项目结构

---

## 参考资料

- [Bundler](https://bundler.io/)
- [Rails Guides](https://guides.rubyonrails.org/)
- [RubyGems](https://rubygems.org/)

---

## 授权

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
