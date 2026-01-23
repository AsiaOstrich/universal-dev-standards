---
source: ../../../docs/AI-AGENT-ROADMAP.md
source_version: 2.3.0
translation_version: 2.3.0
last_synced: 2026-01-22
status: current
---

# AI Agent 集成指南

> **语言**: [English](../../../docs/AI-AGENT-ROADMAP.md) | [繁體中文](../../zh-TW/docs/AI-AGENT-ROADMAP.md) | 简体中文

**版本**: 2.3.0
**最后更新**: 2026-01-22

本文档提供 Universal Development Standards (UDS) 对 AI Agent 支持的完整参考。

---

## 目录

1. [UDS CLI 实现状态](#1-uds-cli-实现状态)
2. [快速参考](#2-快速参考)
3. [集成深度](#3-集成深度)
4. [Skills 系统](#4-skills-系统)
5. [配置参考](#5-配置参考)
6. [资源](#6-资源)
7. [附录：未来发展](#附录未来发展)

---

## 1. UDS CLI 实现状态

> **重要**: 本节描述的是 UDS CLI 对各工具的实现状态，而非工具的原生能力。关于原生能力，请参阅[快速参考](#2-快速参考)。

### 状态定义

| 状态 | 定义 |
|------|------|
| `complete` | Skills + Commands 完整支持，已测试且生产就绪 |
| `partial` | Skills 可用，Commands 受限或不支持 |
| `preview` | 功能可用但为预览版，可能有边缘案例 |
| `planned` | CLI 中代码存在但未完整测试 |
| `minimal` | 仅生成规则文件，不支持 Skills/Commands |

### 实现矩阵

| AI 工具 | UDS 状态 | Skills | Commands | 配置文件 | 备注 |
|---------|:--------:|:------:|:--------:|----------|------|
| **Claude Code** | ✅ complete | ✅ | 内建 | `CLAUDE.md` | Marketplace + User + Project 三层级 |
| **OpenCode** | ✅ complete | ✅ | ✅ | `AGENTS.md` | 完整实现，可读取 Claude 规则 |
| Cline | 🔶 partial | ✅ | - | `.clinerules` | Skills 通过 fallback，Commands 使用 Workflow |
| GitHub Copilot | 🔶 partial | ✅ | ✅ | `copilot-instructions.md` | 补充 Copilot Chat |
| OpenAI Codex | 🔶 partial | ✅ | - | `AGENTS.md`（共享） | Skills 可用 |
| Gemini CLI | 🧪 preview | ✅ | ✅ (TOML) | `GEMINI.md` | Commands 自动转换为 TOML |
| Roo Code | ⏳ planned | ✅ | ✅ | - | 实现存在，待测试 |
| Cursor | 📄 minimal | - | - | `.cursorrules` | 仅规则文件 |
| Windsurf | 📄 minimal | - | - | `.windsurfrules` | 仅规则文件 |
| Antigravity | 📄 minimal | - | - | `INSTRUCTIONS.md` | 仅规则文件 |

### 两种「支持」的区别

| 概念 | 定义 | 记录位置 |
|------|------|----------|
| **工具原生能力** | AI 工具本身支持什么功能 | [快速参考](#2-快速参考) |
| **UDS CLI 实现** | UDS CLI 对该工具的实现程度 | 本节 |

示例：Cursor 原生不支持 SKILL.md（工具能力），但 UDS CLI 可以为它生成 `.cursorrules`（实现状态 = minimal）。

---

## 2. 快速参考

### 配置文件

| AI Agent | 项目配置 | 全局配置 | 备注 |
|----------|----------|----------|------|
| Claude Code | `.claude/CLAUDE.md` | `~/.claude/CLAUDE.md` | ~100KB 限制 |
| OpenCode | `.opencode/AGENTS.md` | `~/.config/opencode/AGENTS.md` | 无限制 |
| GitHub Copilot | `.github/copilot-instructions.md` | 个人设置 | ~8KB 限制 |
| Cline | `.clinerules/` | `~/.cline-rules/` | 文件夹或单一文件 |
| Roo Code | `.roo/rules/*.md` | `~/.roo/rules/` | 模式特定：`.roo/rules-{mode}/` |
| OpenAI Codex | `.codex/AGENTS.md` | `~/.codex/AGENTS.md` | 32KB 限制 |
| Windsurf | `.windsurfrules` | 设置 UI | 6K/文件，总计 12K |
| Gemini CLI | `.gemini/GEMINI.md` | `~/.gemini/GEMINI.md` | 支持 `@import` |
| Cursor | `.cursor/rules/*.mdc` | `~/.cursor/rules/` | 需要 YAML frontmatter |
| Antigravity | `.antigravity/` | `~/.antigravity/` | 最低支持，手动模式 |

### Skills 路径

| AI Agent | Skills | 项目路径 | 全局路径 | 备注 |
|----------|:------:|----------|----------|------|
| Claude Code | ✅ 原生 | `.claude/skills/` | `~/.claude/skills/` | 参考实现 |
| OpenCode | ✅ 完整 | `.opencode/skill/` | `~/.config/opencode/skill/` | 也读取 `.claude/skills/` |
| GitHub Copilot | ✅ 完整 | `.github/skills/` | `~/.copilot/skills/` | 旧版：`.claude/skills/` |
| Cline | ✅ 完整 | `.claude/skills/` | `~/.claude/skills/` | 直接使用 Claude 路径 |
| Roo Code | ✅ 完整 | `.roo/skills/` | `~/.roo/skills/` | 模式特定：`.roo/skills-{mode}/` |
| OpenAI Codex | ✅ 完整 | `.codex/skills/` | `~/.codex/skills/` | 也读取 `.claude/skills/` |
| Windsurf | ✅ 完整 | `.windsurf/rules/` | 设置 UI | 2026/01 起支持 Skills |
| Gemini CLI | ✅ 预览 | `.gemini/skills/` | `~/.gemini/skills/` | v0.23+ 预览版 |
| Cursor | ❌ 否 | `.cursor/rules/` | `~/.cursor/rules/` | 仅 Rules，不支持 SKILL.md |
| Antigravity | ❌ 否 | `.antigravity/skills/` | `~/.antigravity/skills/` | 不支持 SKILL.md |

### 斜杠命令

| AI Agent | 支持 | 类型 | 示例 | 自定义路径 |
|----------|:----:|------|------|------------|
| Claude Code | ✅ | Skill 触发 | `/commit`, `/review`, `/tdd` | 仅内建 |
| OpenCode | ✅ | 用户定义 | 可配置 | `.opencode/command/*.md` |
| GitHub Copilot | ✅ | 内建 | `/fix`, `/tests`, `/explain` | `.github/prompts/*.prompt.md` |
| Cline | ✅ | 内建 + Workflows | `/smol`, `/plan`, `/newtask` | Workflow 文件 |
| Roo Code | ✅ | 模式命令 | `/code`, `/architect`, `/init` | `.roo/commands/*.md` |
| OpenAI Codex | ✅ | 系统命令 | `/model`, `/diff`, `/skills` | 自定义 prompts |
| Windsurf | ✅ | Rulebook | 自动生成 | 从 `.windsurfrules` |
| Gemini CLI | ✅ | 系统 + 自定义 | `/clear`, `/memory`, `/mcp` | `.gemini/commands/*.toml` |
| Cursor | ✅ | 内建 + 自定义 | `/summarize`, `/models` | `.cursor/commands/*.md` |
| Antigravity | ❌ | N/A | N/A | N/A |

### 平台支持

| 平台 | CLI 工具 | Skills |
|------|:--------:|:------:|
| macOS | 已测试 | 已测试 |
| Linux | 预期可用 | 预期可用 |
| Windows | 提供 PowerShell | 预期可用 |

---

## 3. 集成深度

> **说明**: 截至 2026 年 1 月，Agent Skills (SKILL.md) 已成为业界标准。大多数主流 AI 代码工具现在都支持相同的 Skills 格式。

### 原生 Skills（参考实现）

**工具**: Claude Code

- Agent Skills 标准的参考实现
- 18 个内建 UDS Skills + Marketplace
- 完整斜杠命令支持（`/commit`、`/review`、`/tdd` 等）
- 关键字自动触发

### 完整 Skills 支持

**工具**: OpenCode, GitHub Copilot, Cline, Roo Code, OpenAI Codex, Windsurf, Gemini CLI

- 可读取并执行 SKILL.md 文件
- 跨平台兼容 `.claude/skills/` 目录
- 大多数工具也有自己的原生路径（见 Skills 路径栏）

### 仅 Rules（无 Skills）

**工具**: Cursor

- 有自己的规则格式（`.cursor/rules/*.mdc`）
- 尚未支持 SKILL.md 格式
- 社区已提出功能请求

### 最低支持

**工具**: Antigravity

- 不支持 SKILL.md
- 不支持 AGENT.md
- 仅手动执行模式
- 为完整性而收录

---

## 4. Skills 系统

### 4.1 UDS Skills 兼容性

| # | Skill | 斜杠命令 | Claude | OpenCode | Cursor | Copilot |
|---|-------|----------|:------:|:--------:|:------:|:-------:|
| 1 | ai-collaboration-standards | - | 完整 | 完整 | 完整 | 完整 |
| 2 | checkin-assistant | `/check` | 完整 | 完整 | 部分 | 部分 |
| 3 | commit-standards | `/commit` | 完整 | 完整 | 部分 | 部分 |
| 4 | code-review-assistant | `/review` | 完整 | 完整 | 部分 | 部分 |
| 5 | testing-guide | - | 完整 | 完整 | 完整 | 完整 |
| 6 | tdd-assistant | `/tdd` | 完整 | 完整 | 部分 | 部分 |
| 7 | release-standards | `/release` | 完整 | 完整 | 部分 | 无 |
| 8 | git-workflow-guide | - | 完整 | 完整 | 完整 | 完整 |
| 9 | documentation-guide | `/docs` | 完整 | 完整 | 部分 | 无 |
| 10 | requirement-assistant | `/requirement` | 完整 | 完整 | 部分 | 部分 |
| 11 | changelog-guide | `/changelog` | 完整 | 完整 | 部分 | 无 |
| 12 | spec-driven-dev | `/spec` | 完整 | 完整 | 部分 | 部分 |
| 13 | test-coverage-assistant | `/coverage` | 完整 | 完整 | 部分 | 部分 |
| 14 | refactoring-assistant | - | 完整 | 完整 | 完整 | 完整 |
| 15 | error-code-guide | - | 完整 | 完整 | 完整 | 完整 |
| 16 | methodology-system | `/methodology` | 完整 | 完整 | 部分 | 无 |
| 17 | project-structure-guide | `/config` | 完整 | 完整 | 部分 | 无 |
| 18 | logging-guide | - | 完整 | 完整 | 完整 | 完整 |

### 4.2 Skills 路径与启用

#### Skills 发现路径

| AI Agent | 项目路径 | 全局路径 | 读取 `.claude/skills/` |
|----------|----------|----------|:----------------------:|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` | 原生 |
| OpenCode | `.opencode/skill/` | `~/.config/opencode/skill/` | ✅ 是 |
| GitHub Copilot | `.github/skills/` | `~/.copilot/skills/` | ✅ 是（旧版） |
| Cline | `.claude/skills/` | `~/.claude/skills/` | ✅ 是 |
| Roo Code | `.roo/skills/` | `~/.roo/skills/` | ✅ 是 |
| OpenAI Codex | `.codex/skills/` | `~/.codex/skills/` | ✅ 是 |
| Windsurf | `.windsurf/rules/` | 设置 UI | ✅ 是 |
| Gemini CLI | `.gemini/skills/` | `~/.gemini/skills/` | ✅ 是 |
| Cursor | `.cursor/rules/` | `~/.cursor/rules/` | ❌ 否 |
| Antigravity | `.antigravity/skills/` | `~/.antigravity/skills/` | ❌ 否 |

#### 启用方式

| AI Agent | 启用方式 |
|----------|----------|
| Claude Code | 斜杠命令、自动触发、提及 |
| OpenCode | 斜杠命令、Tab 切换 |
| GitHub Copilot | 自动加载、`applyTo` 模式 |
| Cline | 自动从目录加载 |
| Roo Code | 自动加载、模式特定（`.roo/skills-{mode}/`） |
| OpenAI Codex | `/skills` 命令、自动触发 |
| Windsurf | 手动（@提及）、始终开启、模型决定 |
| Gemini CLI | 自动触发、通过设置启用/禁用 |
| Cursor | Glob 模式、`alwaysApply` 标志（仅 rules） |
| Antigravity | 仅手动 |

**建议**：使用 `.claude/skills/` 作为默认安装路径 — 大多数工具都可读取以获得跨工具兼容性。

### 4.3 跨平台可移植性

> **业界标准**: 截至 2025 年 12 月，SKILL.md 已被 OpenAI、GitHub、Google 及更广泛的 AI 代码生态系统采用。

| 平台 | SKILL.md 支持 | 采用日期 |
|------|:-------------:|----------|
| Claude Code | ✅ 原生 | 2025/10 |
| OpenCode | ✅ 完整 | 2025/11 |
| GitHub Copilot | ✅ 完整 | 2025/12/18 |
| OpenAI Codex | ✅ 完整 | 2025/12 |
| Cline | ✅ 完整 | v3.48.0 |
| Roo Code | ✅ 完整 | 2025/12/27 |
| Windsurf | ✅ 完整 | 2026/01/09 |
| Gemini CLI | ✅ 预览版 | 2026/01/07 |
| Cursor | ❌ 尚未 | 已请求 |
| Antigravity | ❌ 否 | N/A |

**跨平台安装器**:
- [skilz](https://github.com/skilz-ai/skilz) - 通用 Skills 安装器（14+ 平台）
- [openskills](https://github.com/numman-ali/openskills) - 通用 skills 加载器
- UDS CLI (`uds init`) - 为多个 AI 工具生成配置

---

## 5. 配置参考

### 5.1 配置文件

| AI Agent | 项目配置 | 全局配置 | 字符限制 |
|----------|----------|----------|----------|
| Claude Code | `CLAUDE.md` | `~/.claude/CLAUDE.md` | ~100KB |
| OpenCode | `AGENTS.md` | `~/.config/opencode/AGENTS.md` | 无限制 |
| Cursor | `.cursor/rules/*.mdc` | `~/.cursor/rules/` | 每文件不同 |
| Windsurf | `.windsurfrules` | 设置 UI | 6K/文件，总计 12K |
| Cline | `.clinerules` | `~/.cline-rules/` | 无限制 |
| Roo Code | `.roorules` | `~/.roo/rules/` | 无限制 |
| GitHub Copilot | `.github/copilot-instructions.md` | 个人设置 | ~8KB |
| OpenAI Codex | `AGENTS.md` | `~/.codex/AGENTS.md` | 32KB |
| Gemini CLI | `GEMINI.md` | `~/.gemini/GEMINI.md` | 1M tokens |
| Antigravity | N/A | `~/.antigravity/` | N/A |

### 5.2 配置合并行为

| AI Agent | 合并策略 | 优先顺序（高到低） |
|----------|----------|-------------------|
| Claude Code | 串接 | 目录范围 > 项目 > 个人 |
| OpenCode | 串接 | 项目 > 全局 |
| Cursor | 替换/选择性 | `.mdc` 按 glob，alwaysApply 标志 |
| Windsurf | 达限制时截断 | 全局 > 工作区 > 模式特定 |
| Cline | 附加 | 项目目录 > 根文件 |
| GitHub Copilot | 组合 | 个人 > 仓库 > 组织 |
| OpenAI Codex | 串接 | 覆盖文件 > 基础，较近者优先 |
| Gemini CLI | 串接 | 所有文件支持 `@import` |
| Antigravity | N/A | N/A |

### 5.3 Skills 文件格式

> **标准格式**: 带有 YAML frontmatter 的 SKILL.md 是大多数工具支持的通用格式。

| AI Agent | Skills 格式 | 配置格式 | Frontmatter |
|----------|:-----------:|----------|-------------|
| Claude Code | ✅ SKILL.md | `CLAUDE.md` | YAML (`---`) |
| OpenCode | ✅ SKILL.md | `AGENTS.md` | YAML |
| GitHub Copilot | ✅ SKILL.md | `copilot-instructions.md` | YAML |
| Cline | ✅ SKILL.md | `.clinerules/` | YAML |
| Roo Code | ✅ SKILL.md | `.roo/rules/` | YAML |
| OpenAI Codex | ✅ SKILL.md | `AGENTS.md` | YAML |
| Windsurf | ✅ SKILL.md | `.windsurfrules` | YAML |
| Gemini CLI | ✅ SKILL.md | `GEMINI.md` | YAML |
| Cursor | ❌ `.mdc` | `.cursor/rules/` | YAML (globs, alwaysApply) |
| Antigravity | ❌ N/A | N/A | N/A |

---

## 6. 资源

### 官方文档

| 工具 | 文档 |
|------|------|
| Claude Code | [docs.anthropic.com/claude-code](https://docs.anthropic.com/claude-code) |
| OpenCode | [opencode.ai/docs](https://opencode.ai/docs) |
| Cursor | [docs.cursor.com](https://docs.cursor.com) |
| GitHub Copilot | [docs.github.com/copilot](https://docs.github.com/copilot) |
| Windsurf | [docs.windsurf.com](https://docs.windsurf.com/) |
| OpenAI Codex | [developers.openai.com/codex](https://developers.openai.com/codex/guides/agents-md/) |
| Gemini CLI | [github.com/google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) |

### Skills 市场

| 平台 | URL |
|------|-----|
| n-skills | [github.com/numman-ali/n-skills](https://github.com/numman-ali/n-skills) |
| claude-plugins.dev | [claude-plugins.dev/skills](https://claude-plugins.dev/skills) |
| agentskills.io | [agentskills.io](https://agentskills.io) |

### 贡献指南

1. 研究工具的配置格式
2. 在 `integrations/<tool-name>/` 下创建集成目录
3. 添加包含设置说明的 README.md
4. 更新本文档
5. 按照 [CONTRIBUTING.md](../../../CONTRIBUTING.md) 提交 PR

**问题反馈**: [GitHub Issues](https://github.com/anthropics-tw/universal-dev-standards/issues)

---

## 附录：未来发展

### 潜在新工具

| 工具 | 优先度 | 备注 |
|------|--------|------|
| Aider | 高 | Git 感知、自动提交、本地模型支持 |
| Continue.dev | 高 | 社区驱动、开源 |
| Amazon Q Developer | 中 | AWS 生态系统 |
| JetBrains AI Assistant | 中 | JetBrains 生态系统 |
| Sourcegraph Cody | 中 | 企业功能 |

### 功能增强路线图

| 功能 | 描述 | 状态 |
|------|------|------|
| SKILL.md 标准 | 通用 Skills 格式 | ✅ 已达成 (2025/12) |
| 跨工具兼容性 | 大多数工具可读取 `.claude/skills/` | ✅ 已达成 |
| Skills 市场 | 发布和发现 Skills | ✅ 多个平台 |
| 多 Agent 安装 | 一次安装 Skills 到多个 Agent | ✅ v3.5.0 |
| Gemini CLI TOML | 自动转换命令为 TOML 格式 | ✅ v3.5.0 |
| Cursor Skills 支持 | 原生 SKILL.md 支持 | ⏳ 社区已请求 |
| CLI 自动检测 | 检测已安装的 AI 工具 | 计划中 |

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 2.3.0 | 2026-01-21 | 新增 Antigravity 至所有表格以与 CLI 保持一致 |
| 2.2.0 | 2026-01-15 | 新增多 Agent 安装、Gemini CLI TOML 转换 |
| 2.1.0 | 2026-01-15 | 更新所有工具的 Skills 支持状态（业界广泛采用） |
| 2.0.0 | 2026-01-15 | 重大重构：整合内容、减少表格 |
| 1.1.0 | 2026-01-15 | 新增配置文件矩阵、Skills 系统配置 |
| 1.0.0 | 2026-01-14 | 初始发布 |
