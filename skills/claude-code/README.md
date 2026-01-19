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
| `checkin-assistant` | Pre-commit quality gates | "commit", "checkin", "quality gate" |
| `commit-standards` | Conventional Commits format | "commit", git operations |
| `code-review-assistant` | Systematic code review | "review", "PR" |
| `testing-guide` | Testing pyramid | Writing tests |
| `tdd-assistant` | Test-Driven Development | "TDD", "test first", "red green refactor" |
| `bdd-assistant` | Behavior-Driven Development | "BDD", "Gherkin", "Given-When-Then" |
| `atdd-assistant` | Acceptance Test-Driven Development | "ATDD", "acceptance criteria", "specification workshop" |
| `release-standards` | Semantic versioning | Release preparation |
| `git-workflow-guide` | Branching strategies | "branch", "merge" |
| `documentation-guide` | Documentation structure & writing | "README", "docs", "ARCHITECTURE" |
| `requirement-assistant` | Requirement writing | "requirement", "user story" |
| `reverse-engineer` | Reverse engineer code to SDD specs | "reverse engineering", "legacy code", "code archaeology" |

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
| checkin-assistant | checkin, pre-commit, quality gate | 簽入, 品質關卡 |
| commit-standards | commit, git, message | 提交, 訊息 |
| code-review-assistant | review, PR, checklist | 審查, 檢查 |
| git-workflow-guide | branch, merge, workflow | 分支, 合併 |
| testing-guide | test, coverage, pyramid | 測試, 覆蓋率 |
| tdd-assistant | TDD, test first, red green refactor | TDD, 測試優先, 紅綠重構 |
| bdd-assistant | BDD, Gherkin, Given-When-Then, feature file | BDD, 行為驅動, 場景 |
| atdd-assistant | ATDD, acceptance criteria, specification workshop | ATDD, 驗收條件, 規格工作坊 |
| release-standards | version, release, semver | 版本, 發布 |
| documentation-guide | README, docs, ARCHITECTURE, API docs | 文件, 架構, API 文件 |
| requirement-assistant | spec, SDD, requirement | 規格, 需求, 新功能 |
| reverse-engineer | reverse engineering, legacy code, code archaeology | 反向工程, 舊有程式碼, 規格提取 |

> 📖 See [Static vs Dynamic Guide](../../adoption/STATIC-DYNAMIC-GUIDE.md) for detailed classification.
>
> 📖 參見[靜態與動態指南](../../adoption/STATIC-DYNAMIC-GUIDE.md)了解詳細分類說明。

## Slash Commands | 斜線命令

In addition to automatic Skills, this plugin provides **manual slash commands** for explicit actions:

除了自動觸發的 Skills，此插件還提供**手動斜線命令**用於明確的操作：

| Command | Description | 說明 |
|---------|-------------|------|
| `/commit` | Generate commit messages | 產生 commit message |
| `/review` | Perform code review | 執行程式碼審查 |
| `/release` | Guide release process | 引導發布流程 |
| `/changelog` | Update CHANGELOG | 更新變更日誌 |
| `/requirement` | Write user stories | 撰寫用戶故事 |
| `/spec` | Create specifications | 建立規格文件 |
| `/tdd` | TDD workflow | TDD 工作流程 |
| `/bdd` | BDD workflow | BDD 開發流程 |
| `/atdd` | ATDD workflow | ATDD 驗收流程 |
| `/docs` | Documentation | 文件撰寫 |
| `/coverage` | Test coverage analysis | 測試覆蓋率分析 |
| `/reverse-spec` | Reverse engineer to SDD spec | 反向工程成 SDD 規格 |
| `/reverse-bdd` | Transform SDD AC to BDD scenarios | SDD AC 轉換為 BDD 場景 |
| `/reverse-tdd` | Analyze BDD-TDD coverage | BDD-TDD 覆蓋率分析 |

### Skills vs Commands | Skills 與命令的差異

| Aspect | Skills | Commands |
|--------|--------|----------|
| **Trigger** | Automatic (context-based) | Manual (`/command`) |
| **Use Case** | Background assistance | Explicit action |
| **Example** | Claude suggests commit format | `/commit` to generate message |

> 📖 See [commands/](./commands/) for detailed command documentation.
>
> 📖 參見 [commands/](./commands/) 了解詳細的命令文件。

## Installation

### Recommended: Plugin Marketplace

Install via Claude Code Plugin Marketplace for automatic updates:

```bash
# Add the marketplace (one-time setup)
/plugin marketplace add AsiaOstrich/universal-dev-standards

# Install the plugin with all 16 skills
/plugin install universal-dev-standards@asia-ostrich
```

**Benefits:**
- ✅ Automatic updates on Claude Code restart
- ✅ Better integration with Claude Code
- ✅ No manual maintenance required

All skills will be automatically loaded and ready to use.

### Alternative: Script Installation (Deprecated)

> ⚠️ **Deprecated**: Manual installation via scripts is deprecated and will be removed in a future version. Please use Plugin Marketplace instead.

For users in environments without Marketplace access (e.g., enterprise networks):

#### Manual Install (Select Skills)

**macOS / Linux:**
```bash
mkdir -p ~/.claude/skills
cp -r ai-collaboration-standards ~/.claude/skills/
cp -r commit-standards ~/.claude/skills/
```

**Windows PowerShell:**
```powershell
New-Item -ItemType Directory -Force -Path $env:USERPROFILE\.claude\skills
Copy-Item -Recurse ai-collaboration-standards $env:USERPROFILE\.claude\skills\
Copy-Item -Recurse commit-standards $env:USERPROFILE\.claude\skills\
```

### Alternative: Project-Level Installation (Deprecated)

> ⚠️ **Deprecated**: Project-level manual installation is deprecated. Use Plugin Marketplace for the best experience.

For project-specific skill customization:

**macOS / Linux:**
```bash
mkdir -p .claude/skills
cp -r /path/to/skills/claude-code/* .claude/skills/
```

**Windows PowerShell:**
```powershell
New-Item -ItemType Directory -Force -Path .claude\skills
Copy-Item -Recurse path\to\skills\claude-code\* .claude\skills\
```

> **Note**: Project-level skills (`.claude/skills/`) take precedence over global skills (`~/.claude/skills/`).

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
