# Claude Code Custom Commands

Custom slash commands for Universal Development Standards.

## Available Commands | 可用命令

### Standards Management | 標準管理

Commands for managing Universal Development Standards in your project.

| Command | Description | 說明 |
|---------|-------------|------|
| [`/init`](./init.md) | Initialize standards in project | 初始化專案標準 |
| [`/update`](./update.md) | Update standards to latest version | 更新標準至最新版本 |
| [`/check`](./check.md) | Verify adoption status | 檢查採用狀態 |
| [`/config`](./config.md) | Configure standards settings | 配置標準設定 |

### Development Workflow | 開發工作流程

Commands for development workflow automation.

| Command | Description | 說明 |
|---------|-------------|------|
| [`/commit`](./commit.md) | Generate conventional commit messages | 產生 commit message |
| [`/review`](./review.md) | Perform systematic code review | 執行程式碼審查 |
| [`/release`](./release.md) | Guide through release process | 引導發布流程 |
| [`/changelog`](./changelog.md) | Update CHANGELOG.md | 更新 CHANGELOG |
| [`/requirement`](./requirement.md) | Write user stories and requirements | 撰寫需求文件 |
| [`/spec`](./spec.md) | Create specification documents | 建立規格文件 |
| [`/docs`](./docs.md) | Create/update documentation | 建立/更新文件 |
| [`/coverage`](./coverage.md) | Analyze test coverage | 分析測試覆蓋率 |

### Methodology | 方法論

Commands for development methodology workflows.

| Command | Description | 說明 |
|---------|-------------|------|
| [`/methodology`](./methodology.md) | Manage active methodology | 管理開發方法論 |
| [`/tdd`](./tdd.md) | Test-Driven Development workflow | TDD 開發流程 |
| [`/bdd`](./bdd.md) | Behavior-Driven Development workflow | BDD 開發流程 |

## Commands vs Skills | 命令與技能

| Aspect | Commands | Skills |
|--------|----------|--------|
| **Trigger** | Manual (`/command`) | Automatic (context-based) |
| **Location** | `commands/` | `skills/` or root |
| **Use Case** | Explicit action | Background assistance |

## Adding Custom Commands | 新增自訂命令

Create a `.md` file in the `commands/` directory:

```markdown
---
description: Brief description of the command
allowed-tools: Read, Write, Bash(git:*)
argument-hint: "[optional arguments]"
---

# Command Name

Instructions for Claude...
```

## Installation | 安裝

Commands are automatically available after installing the plugin:

```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

## License | 授權

Dual-licensed: CC BY 4.0 (documentation) + MIT (code)
