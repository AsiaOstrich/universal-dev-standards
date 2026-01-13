---
source: ../../../../integrations/opencode/skills-mapping.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# Skills 移植指南

本文档将 Claude Code 技能对应到 OpenCode 的等效实现方式。

---

## 概述

Claude Code 提供 18 个技能和 16 个斜线命令。OpenCode 原生支持技能，且**完全兼容** Claude Code 技能格式。

### 关键优势：原生兼容

OpenCode 按以下顺序搜索技能：
1. `.opencode/skill/<name>/SKILL.md`（项目本地）
2. `~/.config/opencode/skill/<name>/SKILL.md`（全局）
3. **`.claude/skills/<name>/SKILL.md`**（Claude 兼容 ✅）

这意味着所有 UDS Claude Code 技能无需修改即可在 OpenCode 中使用。

---

## 技能对照表

| Claude Code 技能 | OpenCode 实现方式 | 状态 |
|-----------------|-------------------|------|
| **ai-collaboration-standards** | AGENTS.md 第 2 节 | ✅ 完整 |
| **commit-standards** | AGENTS.md 第 3 节 + 技能 | ✅ 完整 |
| **code-review-assistant** | AGENTS.md 第 4 节 + 技能 | ✅ 完整 |
| **tdd-assistant** | 技能（自动加载） | ✅ 完整 |
| **test-coverage-assistant** | 技能（自动加载） | ✅ 完整 |
| **checkin-assistant** | AGENTS.md 第 5 节 + 技能 | ✅ 完整 |
| **requirement-assistant** | 技能（自动加载） | ✅ 完整 |
| **spec-driven-dev** | AGENTS.md 第 1 节 + 技能 | ✅ 完整 |
| **testing-guide** | 技能（自动加载） | ✅ 完整 |
| **release-standards** | 技能（自动加载） | ✅ 完整 |
| **changelog-guide** | 技能（自动加载） | ✅ 完整 |
| **git-workflow-guide** | 技能（自动加载） | ✅ 完整 |
| **documentation-guide** | 技能（自动加载） | ✅ 完整 |
| **methodology-system** | 技能（自动加载） | ✅ 完整 |
| **refactoring-assistant** | 技能（自动加载） | ✅ 完整 |
| **error-code-guide** | 技能（自动加载） | ✅ 完整 |
| **project-structure-guide** | 技能（自动加载） | ✅ 完整 |
| **logging-guide** | 技能（自动加载） | ✅ 完整 |

### 状态说明

| 状态 | 含义 |
|------|------|
| ✅ 完整 | 技能在 OpenCode 中完全相同 |
| ⚠️ 部分 | 部分功能有差异 |
| ❌ 无 | 无法复制 |

---

## 斜线命令对照

OpenCode 支持与 Claude Code 相同的技能调用语法：

| Claude Code | OpenCode | 备注 |
|-------------|----------|------|
| `/commit` | `/commit` 或 `skill("commit-standards")` | 相同 |
| `/review` | `/review` 或 `skill("code-review-assistant")` | 相同 |
| `/tdd` | `/tdd` 或 `skill("tdd-assistant")` | 相同 |
| `/coverage` | `/coverage` 或 `skill("test-coverage-assistant")` | 相同 |
| `/requirement` | `/requirement` 或 `skill("requirement-assistant")` | 相同 |
| `/check` | `/check` 或 `skill("checkin-assistant")` | 相同 |
| `/release` | `/release` 或 `skill("release-standards")` | 相同 |
| `/changelog` | `/changelog` 或 `skill("changelog-guide")` | 相同 |
| `/docs` | `/docs` 或 `skill("documentation-guide")` | 相同 |
| `/spec` | `/spec` 或 `skill("spec-driven-dev")` | 相同 |
| `/methodology` | `/methodology` 或 `skill("methodology-system")` | 相同 |
| `/bdd` | 通过 `/methodology` 或 `/tdd` | 相同功能 |
| `/config` | `/config` 或 `skill("project-structure-guide")` | 相同 |
| `/init` | `/init`（内置） | OpenCode 原生 |
| `/update` | 手动或通过 CLI | 使用 `uds update` |

---

## 安装方法

### 方法一：使用 UDS Skills 目录（推荐）

配置 OpenCode 从 UDS 安装加载技能：

```json
// opencode.json
{
  "instructions": [
    "AGENTS.md",
    "node_modules/@anthropic/universal-dev-standards/skills/claude-code/*/SKILL.md"
  ]
}
```

### 方法二：复制技能到项目

```bash
# 复制所有 UDS 技能到项目
cp -r node_modules/@anthropic/universal-dev-standards/skills/claude-code/* .opencode/skill/

# 或复制特定技能
cp -r node_modules/@anthropic/universal-dev-standards/skills/claude-code/commit-standards .opencode/skill/
```

### 方法三：全局安装

```bash
# 复制到全局 OpenCode 配置
cp -r node_modules/@anthropic/universal-dev-standards/skills/claude-code/* ~/.config/opencode/skill/
```

### 方法四：使用 Claude 路径（零配置）

如果您已有 Claude Code 技能：

```bash
# OpenCode 会自动检测 .claude/skills/
# 无需任何操作！
```

---

## 功能比较

### 相同功能

| 功能 | Claude Code | OpenCode |
|------|-------------|----------|
| 技能格式 | YAML frontmatter + Markdown | ✅ 相同 |
| 技能搜索路径 | `.claude/skills/` | ✅ + `.opencode/skill/` |
| 斜线命令 | `/commit`、`/review` 等 | ✅ 相同 |
| 自动触发 | 基于关键字 | ✅ 相同 |
| 技能权限 | 按技能设置 | ✅ 相同 |

### OpenCode 优势

| 功能 | Claude Code | OpenCode |
|------|-------------|----------|
| 内置 agents | ❌ 无 | ✅ `build`、`plan`、`general`、`explore` |
| Agent 定义 | ❌ 非原生 | ✅ Markdown 文件 |
| Glob 模式 | ❌ 不支持 | ✅ `instructions: ["**/*.md"]` |
| Subagent 调用 | ❌ 非原生 | ✅ `@agent-name` |
| 多 LLM 提供者 | ❌ 仅 Claude | ✅ Claude、OpenAI、Google、本地 |

### Claude Code 优势

| 功能 | Claude Code | OpenCode |
|------|-------------|----------|
| MCP 集成 | ✅ 完整 | ⚠️ 有限 |
| 子目录规则 | ✅ 每文件夹 CLAUDE.md | ❌ 单一 AGENTS.md |
| 工具生态系 | ✅ Anthropic 工具 | ⚠️ 社区工具 |

---

## 技能专用自定义 Agents

OpenCode 允许为特定技能创建专门的 agent：

### 代码审查 Agent

```markdown
<!-- .opencode/agent/reviewer.md -->
---
description: 依据 UDS 代码审查清单进行审查
mode: subagent
temperature: 0.3
tools:
  write: false
  edit: false
  bash: false
---

# 代码审查 Agent

您是代码审查专家。请遵循以下指南：

1. 使用 code-review-assistant 技能
2. 应用 core/code-review-checklist.md 的审查清单
3. 使用注释前缀：❗ BLOCKING、⚠️ IMPORTANT、💡 SUGGESTION、❓ QUESTION
4. 检查所有 10 个审查类别

调用方式：@reviewer
```

### TDD 教练 Agent

```markdown
<!-- .opencode/agent/tdd-coach.md -->
---
description: 引导 TDD 工作流程（红-绿-重构）
mode: subagent
temperature: 0.5
---

# TDD 教练 Agent

您是 TDD 教练。协助开发者：

1. 红色阶段：编写失败的测试
2. 绿色阶段：最少代码通过测试
3. 重构阶段：保持绿色下清理代码

始终使用 tdd-assistant 技能。

调用方式：@tdd-coach
```

---

## 技能配置

### 权限控制

```json
// opencode.json
{
  "permission": {
    "skill": {
      "*": "allow",
      "methodology-system": "ask",
      "release-standards": "ask"
    }
  }
}
```

### 停用特定技能

```json
// opencode.json
{
  "permission": {
    "skill": {
      "methodology-system": "deny"
    }
  }
}
```

---

## 验证清单

设置技能后：

```
□ 运行 `opencode` 并输入 `/commit` 测试技能加载
□ 验证技能自动完成功能（输入 `/` 查看可用项目）
□ 使用 `@agent-name` 测试自定义 agents
□ 确认 AGENTS.md 已加载（使用 `/show rules` 查看）
□ 确认 glob 模式工作（若在 opencode.json 中使用）
```

---

## 疑难排解

### 技能未加载

1. **检查文件名称**：必须是 `SKILL.md`（全大写）
2. **验证 frontmatter**：需要 `name` 和 `description`
3. **检查路径**：应为 `.opencode/skill/<name>/SKILL.md`
4. **查看权限**：检查 `opencode.json` 技能权限

### 斜线命令无效

1. **验证技能存在**：检查技能目录
2. **检查名称对应**：斜线命令使用技能的 `name` 字段
3. **尝试完整语法**：使用 `skill("skill-name")` 而非 `/skill-name`

---

## 相关资源

- [AGENTS.md](../../../../integrations/opencode/AGENTS.md) - 核心规则文件
- [opencode.json](../../../../integrations/opencode/opencode.json) - 配置示例
- [Claude Code Skills](../../../../skills/claude-code/) - 原始技能
- [GitHub Copilot 技能对照](../github-copilot/skills-mapping.md) - Copilot 等效版本

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-13 | 初始版本 |

---

## 许可证

本文档以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可发布。
