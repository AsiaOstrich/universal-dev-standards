# Claude Code Custom Commands

Custom slash commands for Universal Development Standards.

## Command Namespaces | 命令命名空間

| Namespace | Description | Commands |
|-----------|-------------|----------|
| `uds/` | Universal Dev Standards | 9 commands |

## Available Commands | 可用命令

### UDS Commands (`/uds:*`)

Development workflow automation commands.

| Command | Description |
|---------|-------------|
| [`/uds:commit`](./uds/commit.md) | Generate conventional commit messages |
| [`/uds:review`](./uds/review.md) | Perform systematic code review |
| [`/uds:release`](./uds/release.md) | Guide through release process |
| [`/uds:changelog`](./uds/changelog.md) | Update CHANGELOG.md |
| [`/uds:requirement`](./uds/requirement.md) | Write user stories and requirements |
| [`/uds:spec`](./uds/spec.md) | Create specification documents |
| [`/uds:tdd`](./uds/tdd.md) | Test-Driven Development workflow |
| [`/uds:docs`](./uds/docs.md) | Create/update documentation |
| [`/uds:coverage`](./uds/coverage.md) | Analyze test coverage |

## Commands vs Skills | 命令與技能

| Aspect | Commands | Skills |
|--------|----------|--------|
| **Trigger** | Manual (`/command`) | Automatic (context-based) |
| **Location** | `commands/` | `skills/` or root |
| **Use Case** | Explicit action | Background assistance |

## Adding Custom Commands | 新增自訂命令

Create a `.md` file in the appropriate namespace directory:

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
