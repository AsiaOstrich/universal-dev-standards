---
source: ../../../../skills/claude-code/README.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-07
status: current
---

# Claude Code Skills

> **语言**: [English](../../../../skills/claude-code/README.md) | 繁体中文

软体开发标准的 Claude Code Skills。

> 衍生自 [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards) 核心标准。

## 概述

这些技能会根据上下文在使用 Claude Code 时自动触发，协助您：

- 透过基于证据的回应防止 AI 幻觉
- 撰写一致且格式良好的提交讯息
- 进行全面的程式码审查
- 遵循测试最佳实践
- 使用语意化版本管理发布

## 可用的 Skills

| Skill | 描述 | 触发条件 |
|-------|------|----------|
| `ai-collaboration-standards` | 防止 AI 幻觉 | 程式码分析、"certainty" |
| `commit-standards` | Conventional Commits 格式 | "commit"、git 操作 |
| `code-review-assistant` | 系统化程式码审查 | "review"、"PR" |
| `testing-guide` | 测试金字塔 | 撰写测试 |
| `tdd-assistant` | 测试驱动开发 | "TDD"、"test first"、"红绿重构" |
| `release-standards` | 语意化版本控制 | 准备发布 |
| `git-workflow-guide` | 分支策略 | "branch"、"merge" |
| `documentation-guide` | 文件结构 | "README"、"docs" |
| `requirement-assistant` | 需求撰写 | "requirement"、"user story" |

## 静态与动态规范

规范依据应用时机分为两类：

Standards are classified into two types based on when they should be applied:

### 静态规范（专案档案）

这些规范应该**随时生效**，建议放在专案的 `CLAUDE.md` 或 `.cursorrules` 中：

These standards should **always be active**. Add them to your project's `CLAUDE.md` or `.cursorrules`:

| Standard | 核心规则 | Key Rules |
|----------|---------|-----------|
| [anti-hallucination](../../../../core/anti-hallucination.md) | 确定性标签、建议原则 | Certainty labels, suggestion principles |
| [checkin-standards](../../../../core/checkin-standards.md) | 编译通过、测试通过、覆盖率达标 | Build passes, tests pass, coverage met |
| [project-structure](../../../../core/project-structure.md) | 目录结构规范 | Directory structure conventions |

> 📄 参见 [CLAUDE.md.template](../../../../templates/CLAUDE.md.template) 取得可直接使用的范本。
>
> 📄 See [CLAUDE.md.template](../../../../templates/CLAUDE.md.template) for a ready-to-use template.

### 动态规范（Skills）

这些规范由**关键字触发**，按需载入。安装为 Skills 使用：

These are **triggered by keywords** or specific tasks. Install as Skills:

| Skill | 触发关键字 | Trigger Keywords |
|-------|-----------|-----------------|
| commit-standards | 提交、讯息 | commit, git, message |
| code-review-assistant | 审查、检查 | review, PR, checklist |
| git-workflow-guide | 分支、合并 | branch, merge, workflow |
| testing-guide | 测试、覆盖率 | test, coverage, pyramid |
| tdd-assistant | TDD、测试优先、红绿重构 | TDD, test first, red green refactor |
| release-standards | 版本、发布 | version, release, semver |
| documentation-guide | 文件、文档 | README, docs, documentation |
| requirement-assistant | 规格、需求、新功能 | spec, SDD, requirement |

> 📖 参见[静态与动态指南](../../../../adoption/STATIC-DYNAMIC-GUIDE.md)了解详细分类说明。
>
> 📖 See [Static vs Dynamic Guide](../../../../adoption/STATIC-DYNAMIC-GUIDE.md) for detailed classification.

## 安装

### 推荐：Plugin Marketplace

透过 Claude Code Plugin Marketplace 安装以获得自动更新：

```bash
# 新增 marketplace（一次性设定）
/plugin marketplace add AsiaOstrich/universal-dev-standards

# 安装包含所有 15 个技能的插件
/plugin install universal-dev-standards@asia-ostrich
```

**优点：**
- ✅ Claude Code 重启时自动更新
- ✅ 与 Claude Code 更好的整合
- ✅ 无需手动维护

所有技能将自动载入并可使用。

### 替代方案：脚本安装（已弃用）

> ⚠️ **已弃用**：透过脚本手动安装已弃用，将在未来版本中移除。请改用 Plugin Marketplace。

适用于无法存取 Marketplace 的环境（例如企业网路）：

#### 快速安装（所有 Skills）

```bash
./install.sh
```

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

### 替代方案：专案层级安装（已弃用）

> ⚠️ **已弃用**：专案层级手动安装已弃用。建议使用 Plugin Marketplace 以获得最佳体验。

适用于专案特定技能自订：

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

> **注意**：专案层级技能（`.claude/skills/`）优先于全域技能（`~/.claude/skills/`）。

## 设定

Skills 支援透过 `CONTRIBUTING.md` 进行专案特定设定。

### 停用 Skills

在您的专案 `CONTRIBUTING.md` 中加入：

```markdown
## Disabled Skills

- testing-guide
- release-standards
```

### 设定范本

完整设定选项请参见 [CONTRIBUTING.template.md](../../../../skills/claude-code/CONTRIBUTING.template.md)。

## Skill 优先顺序

当同一个 skill 同时存在于两个位置时：
1. **专案层级**（`.claude/skills/`）优先
2. **全域层级**（`~/.claude/skills/`）为备援

## 授权条款

双重授权：CC BY 4.0（文件）+ MIT（程式码）
