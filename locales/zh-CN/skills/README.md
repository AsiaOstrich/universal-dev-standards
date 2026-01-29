---
source: ../../../skills/README.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-07
status: current
---

# Claude Code Skills

> **语言**: [English](../../../skills/README.md) | 简体中文

软体开发标准的 Claude Code Skills。

> 衍生自 [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards) 核心标准。

## 概述

这些技能会根据上下文在使用 Claude Code 时自动觸發，協助您：

- 透過基於证据的响应防止 AI 幻覺
- 撰写一致且格式良好的提交消息
- 进行全面的程序码审查
- 遵循测试最佳实踐
- 使用語意化版本管理發布

## 可用的 Skills

| Skill | 描述 | 觸發条件 |
|-------|------|----------|
| `ai-collaboration-standards` | 防止 AI 幻覺 | 程序码分析、"certainty" |
| `commit-standards` | Conventional Commits 格式 | "commit"、git 操作 |
| `code-review-assistant` | 系统化程序码审查 | "review"、"PR" |
| `testing-guide` | 测试金字塔 | 撰写测试 |
| `tdd-assistant` | 测试驅动开发 | "TDD"、"test first"、"紅綠重構" |
| `release-standards` | 語意化版本控制 | 准备發布 |
| `git-workflow-guide` | 分支策略 | "branch"、"merge" |
| `documentation-guide` | 文件结构 | "README"、"docs" |
| `requirement-assistant` | 需求撰写 | "requirement"、"user story" |

## 静态与动态规范

规范依据应用时机分为兩类：

Standards are classified into two types based on when they should be applied:

### 静态规范（项目文件）

这些规范应該**隨时生效**，建议放在项目的 `CLAUDE.md` 或 `.cursorrules` 中：

These standards should **always be active**. Add them to your project's `CLAUDE.md` or `.cursorrules`:

| Standard | 核心規則 | Key Rules |
|----------|---------|-----------|
| [anti-hallucination](../../../core/anti-hallucination.md) | 确定性标签、建议原則 | Certainty labels, suggestion principles |
| [checkin-standards](../../../core/checkin-standards.md) | 编譯通過、测试通過、覆蓋率达標 | Build passes, tests pass, coverage met |
| [project-structure](../../../core/project-structure.md) | 目录结构规范 | Directory structure conventions |

> 📄 參見 [CLAUDE.md.template](../../../templates/CLAUDE.md.template) 取得可直接使用的範本。
>
> 📄 See [CLAUDE.md.template](../../../templates/CLAUDE.md.template) for a ready-to-use template.

### 动态规范（Skills）

这些规范由**关鍵字觸發**，按需载入。安裝为 Skills 使用：

These are **triggered by keywords** or specific tasks. Install as Skills:

| Skill | 觸發关鍵字 | Trigger Keywords |
|-------|-----------|-----------------|
| commit-standards | 提交、消息 | commit, git, message |
| code-review-assistant | 审查、检查 | review, PR, checklist |
| git-workflow-guide | 分支、合併 | branch, merge, workflow |
| testing-guide | 测试、覆蓋率 | test, coverage, pyramid |
| tdd-assistant | TDD、测试優先、紅綠重構 | TDD, test first, red green refactor |
| release-standards | 版本、發布 | version, release, semver |
| documentation-guide | 文件、文档 | README, docs, documentation |
| requirement-assistant | 規格、需求、新功能 | spec, SDD, requirement |

> 📖 參見[静态与动态指南](../../../adoption/STATIC-DYNAMIC-GUIDE.md)了解详细分类说明。
>
> 📖 See [Static vs Dynamic Guide](../../../adoption/STATIC-DYNAMIC-GUIDE.md) for detailed classification.

## 安裝

### 推荐：Plugin Marketplace

透過 Claude Code Plugin Marketplace 安裝以獲得自动更新：

```bash
# 新增 marketplace（一次性设置）
/plugin marketplace add AsiaOstrich/universal-dev-standards

# 安裝包含所有 15 个技能的插件
/plugin install universal-dev-standards@asia-ostrich
```

**優点：**
- ✅ Claude Code 重啟时自动更新
- ✅ 与 Claude Code 更好的集成
- ✅ 無需手动維護

所有技能將自动载入并可使用。

### 替代方案：脚本安裝（已棄用）

> ⚠️ **已棄用**：透過脚本手动安裝已棄用，將在未來版本中移除。請改用 Plugin Marketplace。

适用于无法访问 Marketplace 的环境（例如企业网络）：

#### 手动安装（选择性 Skills）

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

### 替代方案：项目层级安裝（已棄用）

> ⚠️ **已棄用**：项目层级手动安裝已棄用。建议使用 Plugin Marketplace 以獲得最佳体驗。

適用於项目特定技能自订：

**macOS / Linux:**
```bash
mkdir -p .claude/skills
cp -r /path/to/skills/* .claude/skills/
```

**Windows PowerShell:**
```powershell
New-Item -ItemType Directory -Force -Path .claude\skills
Copy-Item -Recurse path\to\skills\claude-code\* .claude\skills\
```

> **注意**：项目层级技能（`.claude/skills/`）優先於全域技能（`~/.claude/skills/`）。

## 设置

Skills 支援透過 `CONTRIBUTING.md` 进行项目特定设置。

### 停用 Skills

在您的项目 `CONTRIBUTING.md` 中加入：

```markdown
## Disabled Skills

- testing-guide
- release-standards
```

### 设置範本

完整设置选项請參見 [CONTRIBUTING.template.md](../../../skills/CONTRIBUTING.template.md)。

## Skill 優先順序

當同一个 skill 同时存在於兩个位置时：
1. **项目层级**（`.claude/skills/`）優先
2. **全域层级**（`~/.claude/skills/`）为备援

## 授权条款

雙重授权：CC BY 4.0（文件）+ MIT（程序码）
