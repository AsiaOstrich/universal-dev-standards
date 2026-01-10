# Ruby Project Structure

> **Language**: English | [繁體中文](../../locales/zh-TW/options/project-structure/ruby.md)

**Parent Standard**: [Project Structure](../../core/project-structure.md)

---

## Overview

Ruby project structure varies between gems, Rails applications, and other frameworks. All use Bundler for dependency management and follow conventions for code organization.

## Project Types

### Gem (Library)

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

### Rails Application

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

### Sinatra Application

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

## Configuration Files

| File | Purpose | Required |
|------|---------|----------|
| `Gemfile` | Dependency declaration | Yes |
| `Gemfile.lock` | Dependency lock file | Yes |
| `*.gemspec` | Gem specification | Gems only |
| `Rakefile` | Rake tasks | No |
| `.rubocop.yml` | RuboCop configuration | No |
| `.rspec` | RSpec configuration | No |

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

## Tools

| Category | Tools |
|----------|-------|
| Build | Rake, Bundler |
| Test Runner | RSpec, Minitest |
| Linter | RuboCop, Standard |
| Formatter | RuboCop --auto-correct, Standard |
| Package Manager | Bundler, RubyGems |
| Documentation | YARD, RDoc |

## Rules

| Rule | Description | Priority |
|------|-------------|----------|
| lib structure | Place main code in `lib/<gem_name>/` | Required |
| spec location | Mirror `lib/` structure in `spec/` directory | Recommended |
| Service objects | Use service objects in `app/services/` for complex operations | Recommended |
| FactoryBot | Use FactoryBot with factories in `spec/factories/` | Recommended |
| RuboCop config | Configure RuboCop with project-specific rules | Recommended |

## Related Options

- [PHP](./php.md) - PHP project structure
- [Python](./python.md) - Python project structure

---

## References

- [Bundler](https://bundler.io/)
- [Rails Guides](https://guides.rubyonrails.org/)
- [RubyGems](https://rubygems.org/)

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
