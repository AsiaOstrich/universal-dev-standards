# Claude Code Custom Commands

Custom slash commands for Universal Development Standards.

## Available Commands | 可用命令

Development workflow automation commands.

| Command | Description | 說明 |
|---------|-------------|------|
| [`/commit`](./commit.md) | Generate conventional commit messages | 產生 commit message |
| [`/review`](./review.md) | Perform systematic code review | 執行程式碼審查 |
| [`/release`](./release.md) | Guide through release process | 引導發布流程 |
| [`/changelog`](./changelog.md) | Update CHANGELOG.md | 更新 CHANGELOG |
| [`/requirement`](./requirement.md) | Write user stories and requirements | 撰寫需求文件 |
| [`/spec`](./spec.md) | Create specification documents | 建立規格文件 |
| [`/tdd`](./tdd.md) | Test-Driven Development workflow | TDD 開發流程 |
| [`/docs`](./docs.md) | Create/update documentation | 建立/更新文件 |
| [`/coverage`](./coverage.md) | Analyze test coverage | 分析測試覆蓋率 |

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
argument-hint: [optional arguments]
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
