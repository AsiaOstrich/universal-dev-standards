---
source: ../../../adoption/STATIC-DYNAMIC-GUIDE.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-01-07
status: current
---

# 静态与动态规范指南

> **语言**: [English](../../../adoption/STATIC-DYNAMIC-GUIDE.md) | 繁体中文

**版本**: 1.2.0
**最后更新**: 2026-01-07
**适用范围**: 使用本规范框架与 AI 助理协作的专案

---

## 目的

本指南说明如何根据应用时机分类和部署开发规范。

---

## 分类概览

```
┌─────────────────────────────────────────────────────────────┐
│           纯静态规范                                         │
│           随时生效，嵌入专案 context 档案中                   │
├─────────────────────────────────────────────────────────────┤
│  • checkin-standards    → 编译、测试、覆盖率检查点            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           双重性质规范（静态 + 动态）                         │
│           核心规则在 context 中 + 完整指引按需触发            │
├─────────────────────────────────────────────────────────────┤
│  • anti-hallucination   → 基础规则随时生效，详细指引         │
│                           透过 ai-collaboration-standards    │
│                           技能按需触发                       │
│  • project-structure    → 基础惯例随时生效，详细指引         │
│                           透过 project-structure-guide       │
│                           技能按需触发                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           纯动态规范（15 个技能）                             │
│           关键字触发，按需载入                                │
├─────────────────────────────────────────────────────────────┤
│  • ai-collaboration-standards ← "certainty", "确定性"        │
│  • changelog-guide      ← "changelog", "变更日志"            │
│  • code-review-assistant← "review", "PR", "审查"             │
│  • commit-standards     ← "commit", "git", "提交"            │
│  • documentation-guide  ← "docs", "README", "文件"           │
│  • error-code-guide     ← "error code", "错误码"             │
│  • git-workflow-guide   ← "branch", "merge", "分支"          │
│  • logging-guide        ← "logging", "日志"                  │
│  • project-structure-guide ← "structure", "结构"             │
│  • release-standards    ← "version", "release", "版本"       │
│  • requirement-assistant← "spec", "SDD", "规格"              │
│  • spec-driven-dev      ← "spec", "proposal", "提案"         │
│  • tdd-assistant        ← "TDD", "test first", "红绿重构"    │
│  • test-coverage-assistant ← "test coverage", "测试覆盖"     │
│  • testing-guide        ← "test", "测试"                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 纯静态规范

### 定义

无论执行何种任务，AI 互动时都应该**随时生效**的规范。这些是强制性规则，无需选择。

### 特征

- 适用于所有互动（无特定触发）
- 内容精简（适合放在专案 context 文件）
- 低 token 开销
- 基础行为准则
- 强制性规则，无需决策支援

### 纯静态规范清单

| 规范 | 核心规则 | 核心目的 |
|------|---------|---------|
| [checkin-standards](../../../core/checkin-standards.md) | 编译通过、测试通过、覆盖率维持 | 确保 commit 前的程式码品质 |

### 部署方式

将以下任一档案加入专案根目录：

- `CLAUDE.md` (Claude Code)
- `.cursorrules` (Cursor)
- `.github/copilot-instructions.md` (GitHub Copilot)
- `AI_GUIDELINES.md` (通用)

**范本**: 参见 [CLAUDE.md.template](../../../templates/CLAUDE.md.template)

---

## 双重性质规范（静态 + 动态）

### 定义

同时具有**静态和动态元件**的规范：
- **静态元件**：核心规则嵌入专案 context（随时生效）
- **动态元件**：完整技能提供详细指引（按需触发）

### 特征

- 核心规则足够精简，可放入 context 档案
- 详细指引若随时载入会使 context 膨胀
- 两种使用模式都有效且互补

### 双重性质规范清单

| 规范 | 静态元件 | 动态技能 | 触发关键字 |
|------|----------|----------|------------|
| [anti-hallucination](../../../core/anti-hallucination.md) | 确定性标签、建议原则 | ai-collaboration-standards | certainty, assumption, 确定性 |
| [project-structure](../../../core/project-structure.md) | 目录惯例 | project-structure-guide | structure, organization, 结构 |

### 部署方式

1. **静态**：将核心规则摘要加入 `CLAUDE.md`
2. **动态**：安装对应的技能以获得详细指引

---

## 纯动态规范

### 定义

由**特定关键字**或任务触发，按需载入以提供详细指引的规范。

### 特征

- 有特定触发条件（关键字、指令）
- 内容详细（若随时载入会使 context 膨胀）
- 仅在相关时载入
- 任务特定的工作流程
- 需要决策支援（选择、建议）

### 动态规范清单（15 个技能）

| 规范 | 技能 | 触发关键字 |
|------|------|-----------|
| [anti-hallucination](../../../core/anti-hallucination.md) | ai-collaboration-standards | certainty, assumption, 确定性 |
| [changelog-standards](../../../core/changelog-standards.md) | changelog-guide | changelog, release notes, 变更日志 |
| [code-review-checklist](../../../core/code-review-checklist.md) | code-review-assistant | review, PR, 审查 |
| [commit-message-guide](../../../core/commit-message-guide.md) | commit-standards | commit, git, 提交, feat, fix |
| [documentation-structure](../../../core/documentation-structure.md) | documentation-guide | README, docs, 文件 |
| [documentation-writing-standards](../../../core/documentation-writing-standards.md) | documentation-guide | documentation |
| [error-code-standards](../../../core/error-code-standards.md) | error-code-guide | error code, error handling, 错误码 |
| [git-workflow](../../../core/git-workflow.md) | git-workflow-guide | branch, merge, 分支 |
| [logging-standards](../../../core/logging-standards.md) | logging-guide | logging, log level, 日志 |
| [project-structure](../../../core/project-structure.md) | project-structure-guide | structure, organization, 结构 |
| [spec-driven-development](../../../core/spec-driven-development.md) | requirement-assistant | spec, SDD, 规格, 新功能 |
| [spec-driven-development](../../../core/spec-driven-development.md) | spec-driven-dev | spec, proposal, 提案 |
| [test-driven-development](../../../core/test-driven-development.md) | tdd-assistant | TDD, test first, 红绿重构 |
| [test-completeness-dimensions](../../../core/test-completeness-dimensions.md) | test-coverage-assistant | test coverage, 7 dimensions, 测试覆盖 |
| [testing-standards](../../../core/testing-standards.md) | testing-guide | test, 测试, coverage |
| [versioning](../../../core/versioning.md) | release-standards | version, release, 版本 |

### 部署方式

安装为 Claude Code Skills：

**推荐：Plugin Marketplace**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

**替代方案：手动安装（macOS / Linux）**
```bash
mkdir -p ~/.claude/skills
cp -r skills/commit-standards ~/.claude/skills/
```

**替代方案：手动安装（Windows PowerShell）**
```powershell
# 选择性安装
Copy-Item -Recurse skills\claude-code\commit-standards $env:USERPROFILE\.claude\skills\
```

详见 [Claude Code Skills README](../../../skills/README.md)。

---

## 决策流程图

```
                    ┌─────────────────┐
                    │    新规范       │
                    └────────┬────────┘
                             │
                             ▼
               ┌─────────────────────────┐
               │ 是否适用于所有           │
               │ AI 互动？               │
               └────────────┬────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
             是                           否
              │                           │
              ▼                           ▼
    ┌─────────────────┐      ┌─────────────────────────┐
    │ 静态规范         │      │ 能否由关键字             │
    │ 加入专案         │      │ 触发？                  │
    │ context 档案    │      └────────────┬────────────┘
    └─────────────────┘                   │
                               ┌──────────┴──────────┐
                               │                     │
                              是                     否
                               │                     │
                               ▼                     ▼
                    ┌─────────────────┐   ┌─────────────────┐
                    │ 动态规范         │   │ 考虑是否应该      │
                    │ 建立为 Skill    │   │ 拆分或合并       │
                    │ 并设定关键字     │   └─────────────────┘
                    └─────────────────┘
```

---

## Skill 触发机制

Skills 使用 YAML frontmatter 定义触发条件：

```yaml
---
name: commit-standards
description: |
  遵循 conventional commits 标准格式化 commit 讯息。
  使用时机：撰写 commit 讯息、git commit、检阅 commit 历史。
  关键字：commit, git, message, conventional, 提交, 讯息, feat, fix, refactor。
---
```

**关键元素**:
- `Use when:` - 描述触发情境
- `Keywords:` - 列出触发关键字（支援多语言）

---

## 最佳实践

### 静态规范

1. **保持精简**：专案 context 档案最多 100-200 行
2. **聚焦行为**：AI 应该随时做/避免的事
3. **包含快速参考**：精简表格，非完整文件
4. **连结详细内容**：参考完整标准以深入了解

### 动态规范

1. **选择清晰关键字**：明确、常用的术语
2. **支援多语言**：为中文使用者包含中文关键字
3. **群组相关规范**：如 testing-guide 涵盖 testing-standards 与 test-completeness
4. **提供快速参考**：Skills 顶部应有精简摘要

---

## 迁移指南

### 从完整规则到静态+动态

如果目前所有规则都在一个档案中：

1. **提取静态规则**：将 anti-hallucination、checkin、结构规则移至 `CLAUDE.md`
2. **转换动态规则为 Skills**：为任务特定规则建立或安装 Skills
3. **移除重复内容**：从 context 档案删除重复的规则
4. **测试触发**：验证 Skills 在预期关键字时启动

---

## 相关资源

- [CLAUDE.md 范本](../../../templates/CLAUDE.md.template) - 可立即使用的静态规则范本
- [Claude Code Skills](../../../skills/README.md) - 技能安装指南
- [采用指南](ADOPTION-GUIDE.md) - 整体采用策略
- [MAINTENANCE.md](../MAINTENANCE.md) - 如何新增/更新技能（维护者专用）

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.2.0 | 2026-01-07 | 新增 tdd-assistant 技能，更新至 15 个技能 |
| 1.1.0 | 2025-12-30 | 新增双重性质规范分类，更新至 14 个技能 |
| 1.0.0 | 2025-12-24 | 初始指南 |

---

## 授权

本指南以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
