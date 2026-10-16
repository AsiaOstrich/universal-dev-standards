---
source: ../../../../skills/ai-instruction-standards/SKILL.md
source_version: 2.0.0
translation_version: 2.0.0
last_synced: 2026-10-16
source_hash: 33473a56171a
status: current
scope: partial
description: |
  创建并维护 AI 指令文件（CLAUDE.md、AGENTS.md、.cursor/rules/ 等），并采用适当结构。
  Use when: 创建 AI 指令文件、区分通用规则与项目特定规则、配置 AI 工具。
  Not for: 调整代码库结构让 AI 好导览——请用 /ai-friendly-architecture；要求以证据为基础的回答——请用 /ai-collaboration-standards。
  Keywords: CLAUDE.md, AGENTS.md, cursorrules, windsurfrules, clinerules, AI instructions, system prompt, 指令文件, AI 设定, 系统提示词.
---

# AI 指令文件标准指南

> **语言**: [English](../../../../skills/ai-instruction-standards/SKILL.md) | [繁體中文](../../../zh-TW/skills/ai-instruction-standards/SKILL.md) | 简体中文

**版本**: 2.0.0
**最后更新**: 2026-04-28
**适用范围**: 所有 AI 编码工具

---

> **核心标准**：本技能实现 [AI 指令文件标准](../../core/ai-instruction-standards.md)。完整方法论文档请参阅核心标准。

## AI Skills Hierarchy | AI 技能层级

本技能是三层 AI 协作系统的一部分：

| 层级 | 技能 | 回答的问题 |
|-------|-------|-------------------|
| **行为**（即时） | `/ai-collaboration` | “AI 应如何准确回应？” |
| **配置**（会话） | `/ai-instruction-standards`（本技能） | “在 CLAUDE.md / AGENTS.md 中写什么？” |
| **架构**（长期） | `/ai-friendly-architecture` | “如何为 AI 组织代码结构？” |

## 目的

本技能协助在所有主流 AI 编码工具中创建和维护 AI 指令文件，并妥善分离通用标准与项目特定配置。

---

## 快速参考

### 支持的 AI 工具 (2026-04-28)

#### CLI / Agent 工具（终端）

| 工具 | 主要文件 | 工作流机制 | MCP |
|------|-------------|-------------------|-----|
| **Claude Code** | `CLAUDE.md` + `.claude/rules/*.md` | Skills (`.claude/skills/` → `/{name}`) | ✅ |
| **Gemini CLI** | `GEMINI.md` | `.gemini/commands/*.toml` → `/{name}` | ✅ |
| **OpenAI Codex CLI** | `AGENTS.md` (+ `AGENTS.override.md`) | 团队命令；内置 `/review` | ✅ |
| **OpenCode** | `AGENTS.md`（兼容 CLAUDE.md） | 仅限内置（`/init` `/undo` `/share`） | ✅ |

#### AI 原生 IDE / 编辑器集成

| 工具 | 主要文件 | 工作流机制 | MCP |
|------|-------------|-------------------|-----|
| **Cursor** | `.cursor/rules/*.mdc` ⚠️ | `@` 提及；`/multitask` | ✅ |
| **GitHub Copilot** | `.github/copilot-instructions.md` | `.github/prompts/*.prompt.md` → `/{name}` | ✅ |
| **Windsurf** | `.windsurfrules` / `.windsurf/rules/*.md` | `.windsurf/workflows/*.md` → `/{name}` | ✅ |
| **Cline** | `.clinerules` | 无 | ✅ |

> ⚠️ **Cursor**：`.cursorrules` **已弃用** — 请迁移至 `.cursor/rules/*.mdc`

---

### 跨工具通用标准：`AGENTS.md`

`AGENTS.md` 是正在兴起的事实上的跨工具指令标准：

**支持**：Gemini CLI、OpenAI Codex CLI、OpenCode、GitHub Copilot、Windsurf、Cursor
**不支持**：Claude Code（使用 `CLAUDE.md`）、Cline（使用 `.clinerules`）

**建议**：在跨工具项目中使用 `AGENTS.md` 作为通用基线，然后针对高级功能（Skills、Workflows、Prompts）添加特定工具的文件。

---

### 核心原则：通用 vs 项目特定

| 类型 | 包含内容 | 示例 |
|------|----------|---------|
| **通用** | 通用规则 | “提交前运行测试” |
| **项目特定** | 具体命令 | “提交前运行 `npm test`” |

---

### 建议布局

```markdown
# [Project Name] - AI Instructions

## Universal Standards
<!-- Rules applicable to ANY project -->
- Commit message format
- Code review checklist
- Testing standards
- Anti-hallucination rules

---

## Project-Specific Configuration
<!-- Unique to THIS project -->

### Tech Stack
[Your technologies here]

### Quick Commands
[Your build/test/deploy commands]

### File Structure
[Your project structure]
```

---

## 工具特定配置指南

### Claude Code

```
CLAUDE.md                        # Main instructions (hierarchical: global → project → subdir)
.claude/rules/                   # Glob-scoped additional rules
.claude/skills/{name}/SKILL.md   # Custom slash commands → /{name}
.claude/agents/{name}.md         # Subagent definitions
```

### Gemini CLI

```
GEMINI.md                          # Main instructions
.gemini/commands/{name}.toml       # Custom slash commands → /{name}
.gemini/agents/{name}.yaml         # Subagent definitions
```

示例 `.gemini/commands/review.toml`：
```toml
description = "Run code review checklist"
prompt = "Review the following changes: !{git diff HEAD}"
```

### OpenAI Codex CLI

```
AGENTS.md                  # Main instructions (Git root → cwd traversal)
AGENTS.override.md         # Temporary override (highest priority)
~/.codex/AGENTS.md         # Global fallback
.codex/agents/             # Custom agent definitions
```

### OpenCode

```
AGENTS.md                       # Primary (auto-recognized)
CLAUDE.md                       # Also recognized (migration compatibility)
.opencode/agents/               # Custom agent definitions
opencode.json (instructions)    # Glob-pattern file references
```

### Cursor

```
.cursor/rules/                  # MDC format rules (replaces .cursorrules)
  {name}.mdc                    # Frontmatter: description, globs, alwaysApply
AGENTS.md                       # Also supported for agent context
```

MDC frontmatter 示例：
```yaml
---
description: "TypeScript coding standards"
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---
```

> **迁移**：如果你有 `.cursorrules`，请将内容移动至 `.cursor/rules/*.mdc`。

### GitHub Copilot

```
.github/copilot-instructions.md         # Always-on, all chats
.github/instructions/*.instructions.md  # File-glob scoped (applyTo frontmatter)
.github/prompts/*.prompt.md             # Reusable templates → /{name} slash commands
.github/agents/*.agent.md               # Custom agents with tool access control
AGENTS.md                               # Also recognized
```

### Windsurf

```
.windsurfrules                   # Project rules (team-shareable)
.windsurf/rules/*.md             # MDC frontmatter structured rules
.windsurf/workflows/*.md         # Reusable task sequences → /{name}
AGENTS.md                        # Also recognized
```

工作流示例（`.windsurf/workflows/review.md`）：
```markdown
Run a code review:
1. Run `git diff HEAD`
2. Check for BLOCKING issues (security, correctness)
3. Check for IMPORTANT issues (design, tests)
4. Output findings with BLOCKING/IMPORTANT/SUGGESTION prefixes
```

---

## 多工具项目配置

当项目使用多种 AI 工具时：

```
project/
├── AGENTS.md                            # Universal baseline (cross-tool)
├── CLAUDE.md                            # Claude Code (extends AGENTS.md)
├── GEMINI.md                            # Gemini CLI
├── .cursor/rules/
│   └── standards.mdc                    # Cursor
├── .windsurf/
│   └── workflows/                       # Windsurf workflows
│       ├── review.md
│       └── checkin.md
└── .github/
    ├── copilot-instructions.md          # Copilot always-on
    └── prompts/
        └── review.prompt.md             # Copilot slash command
```

**最佳实践**：在 `AGENTS.md` 中编写一次通用内容，然后从特定工具的文件中导入/引用它以避免重复。

---

## 内容指南

### 通用内容（保持通用）

| 类别 | 良好示例 |
|----------|---------------|
| **提交标准** | 「遵循 Conventional Commits 格式」 |
| **代码审查** | 「使用 BLOCKING、IMPORTANT、SUGGESTION 前缀」 |
| **测试** | 「维持最低 80% 覆盖率」 |
| **AI 行为** | 「分析前务必先读取代码」 |

**通用区段应避免：**
- 特定命令（`npm test`、`pytest`）
- 硬编码路径（`cli/src/`、`/var/www/`）
- 版本号（`Node.js 18`、`Python 3.11`）
- 项目名称和 URL

### 项目特定内容

| 类别 | 示例 |
|----------|----------|
| **技术栈** | Node.js 18、React 18、PostgreSQL 15 |
| **命令** | `npm run lint`、`./scripts/deploy.sh` |
| **文件结构** | `src/`、`cli/`、`tests/` |
| **团队惯例** | 繁体中文注释 |

---

## 维护检查清单

提交 AI 指令文件变更前：

- [ ] 通用区段不包含项目特定的路径、命令或版本
- [ ] 项目特定区段有明确标记
- [ ] 标准文档的交叉引用正确
- [ ] 格式与现有区段一致
- [ ] 若使用 Cursor：`.cursorrules` 已迁移至 `.cursor/rules/*.mdc`
- [ ] 若为多工具项目：`AGENTS.md` 涵盖通用基准

---

## 配置侦测

### 侦测顺序

1. 检查是否存在 `CLAUDE.md`、`AGENTS.md`、`GEMINI.md` 或等效文件
2. 侦测正在使用的 AI 工具（检查是否存在 `.cursor/`、`.windsurf/`、`.github/copilot-instructions.md` 等）
3. 分析内容结构是否区分通用/项目特定
4. 若未找到，**建议创建结构化 AI 指令文件**

### 首次设置

若未找到 AI 指令文件：

1. 询问：「此项目没有 AI 指令文件。你使用哪些 AI 工具？」
2. 跨工具项目推荐使用 `AGENTS.md`，仅使用 Claude Code 时推荐 `CLAUDE.md`
3. 确定项目类型和技术栈
4. 生成包含适当区段的模板
5. 若包含敏感信息，添加到 `.gitignore`

---

## 后续步骤指引

在 `/ai-instruction-standards` 完成后，建议：

> - 创建或更新项目的 `CLAUDE.md` / `AGENTS.md` ⭐ **推荐** — 立即应用标准
> - 运行 `/ai-friendly-architecture` 以在架构层面优化 AI 协作
> - 运行 `/ai-collaboration` 以查看 AI 行为准则

---

## 相关标准

- [AI 指令文件标准](../../core/ai-instruction-standards.md) - 核心标准
- [文档撰写标准](../../core/documentation-writing-standards.md) - 撰写指南
- [反幻觉规范](../../core/anti-hallucination.md) - AI 准确性规则
- [AI 友善架构](../../core/ai-friendly-architecture.md) - 上下文优化

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 2.0.0 | 2026-04-28 | 新增 Gemini CLI、OpenAI Codex CLI；更新 Cursor（MDC 格式，废弃 .cursorrules）；更新 OpenCode（以 AGENTS.md 为主）；更新 Copilot（多种文件类型）；更新 Windsurf（Workflows）；新增 AGENTS.md 跨工具标准区段 |
| 1.0.0 | 2026-01-25 | 初始发布 |

---

## 授权

本技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
