# Claude Code Skills

Claude Code Skills for software development standards.

> Derived from [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards) core standards.

## Overview

These skills are automatically triggered based on context when using Claude Code, helping you:

- Prevent AI hallucination with evidence-based responses
- Write consistent, well-formatted commit messages
- Conduct thorough code reviews
- Follow testing best practices
- Manage releases with semantic versioning

## Available Skills

| Skill | Description | Triggers |
|-------|-------------|----------|
| `ai-collaboration-standards` | Prevent AI hallucination | Code analysis, "certainty" |
| `commit-standards` | Conventional Commits format | "commit", git operations |
| `code-review-assistant` | Systematic code review | "review", "PR" |
| `testing-guide` | Testing pyramid | Writing tests |
| `release-standards` | Semantic versioning | Release preparation |
| `git-workflow-guide` | Branching strategies | "branch", "merge" |
| `documentation-guide` | Documentation structure | "README", "docs" |
| `requirement-assistant` | Requirement writing | "requirement", "user story" |

## Static vs Dynamic Standards | 靜態與動態規範

Standards are classified into two types based on when they should be applied:

規範依據應用時機分為兩類：

### Static Standards (Project Files) | 靜態規範

These standards should **always be active**. Add them to your project's `CLAUDE.md` or `.cursorrules`:

這些規範應該**隨時生效**，建議放在專案的 `CLAUDE.md` 或 `.cursorrules` 中：

| Standard | Key Rules | 核心規則 |
|----------|-----------|---------|
| [anti-hallucination](../../core/anti-hallucination.md) | Certainty labels, suggestion principles | 確定性標籤、建議原則 |
| [checkin-standards](../../core/checkin-standards.md) | Build passes, tests pass, coverage met | 編譯通過、測試通過、覆蓋率達標 |
| [project-structure](../../core/project-structure.md) | Directory structure conventions | 目錄結構規範 |

> 📄 See [CLAUDE.md.template](../../templates/CLAUDE.md.template) for a ready-to-use template.
>
> 📄 參見 [CLAUDE.md.template](../../templates/CLAUDE.md.template) 取得可直接使用的範本。

### Dynamic Standards (Skills) | 動態規範

These are **triggered by keywords** or specific tasks. Install as Skills:

這些規範由**關鍵字觸發**，按需載入。安裝為 Skills 使用：

| Skill | Trigger Keywords | 觸發關鍵字 |
|-------|-----------------|-----------|
| commit-standards | commit, git, message | 提交, 訊息 |
| code-review-assistant | review, PR, checklist | 審查, 檢查 |
| git-workflow-guide | branch, merge, workflow | 分支, 合併 |
| testing-guide | test, coverage, pyramid | 測試, 覆蓋率 |
| release-standards | version, release, semver | 版本, 發布 |
| documentation-guide | README, docs, documentation | 文件, 文檔 |
| requirement-assistant | spec, SDD, requirement | 規格, 需求, 新功能 |

> 📖 See [Static vs Dynamic Guide](../../adoption/STATIC-DYNAMIC-GUIDE.md) for detailed classification.
>
> 📖 參見[靜態與動態指南](../../adoption/STATIC-DYNAMIC-GUIDE.md)了解詳細分類說明。

## Installation

### Quick Install (All Skills)

```bash
./install.sh
```

### Manual Install (Select Skills)

```bash
mkdir -p ~/.claude/skills
cp -r ai-collaboration-standards ~/.claude/skills/
cp -r commit-standards ~/.claude/skills/
```

### Project-Level Installation

```bash
mkdir -p .claude/skills
cp -r /path/to/skills/claude-code/* .claude/skills/
```

## Configuration

Skills support project-specific configuration through `CONTRIBUTING.md`.

### Disable Skills

Add to your project's `CONTRIBUTING.md`:

```markdown
## Disabled Skills

- testing-guide
- release-standards
```

### Configuration Template

See [CONTRIBUTING.template.md](CONTRIBUTING.template.md) for complete configuration options.

## Skill Priority

When the same skill exists in both locations:
1. **Project level** (`.claude/skills/`) takes precedence
2. **Global level** (`~/.claude/skills/`) is fallback

## License

Dual-licensed: CC BY 4.0 (documentation) + MIT (code)
