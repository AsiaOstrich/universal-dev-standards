---
source: ../../../docs/AI-AGENT-ROADMAP.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
last_updated: 2026-01-14
---

# AI Agent 集成规划

> **Language**: [English](../../../docs/AI-AGENT-ROADMAP.md) | [繁體中文](../../zh-TW/docs/AI-AGENT-ROADMAP.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-01-14

本文档记录 Universal Development Standards (UDS) 目前支持的 AI Agent 状态及未来发展规划。

---

## 目录

1. [目前支持状态](#1-目前支持状态)
2. [集成深度分类](#2-集成深度分类)
3. [Skills 兼容性矩阵](#3-skills-兼容性矩阵)
4. [Skills 存放位置](#4-skills-存放位置)
5. [未来发展方向](#5-未来发展方向)
6. [社区资源](#6-社区资源)
7. [贡献指南](#7-贡献指南)

---

## 1. 目前支持状态

UDS 目前支持 **11 个 AI Agent/工具**，按集成深度分类：

| 等级 | AI Agent | 集成类型 | 目录位置 | 状态 |
|------|----------|---------|---------|------|
| **Level 1** | Claude Code | 18 个原生 Skills | `skills/claude-code/` | ✅ 完整 |
| **Level 1** | OpenCode | Skills + AGENTS.md | `integrations/opencode/` | ✅ 完整 |
| **Level 2** | Cursor | 可读取 `.claude/skills/` | `skills/cursor/`, `integrations/cursor/` | ✅ 完整 |
| **Level 2** | GitHub Copilot | 部分 Skills 支持 | `skills/copilot/`, `integrations/github-copilot/` | ✅ 完整 |
| **Level 3** | Windsurf | .windsurfrules | `skills/windsurf/`, `integrations/windsurf/` | ✅ 完整 |
| **Level 3** | Cline | .clinerules | `skills/cline/`, `integrations/cline/` | ✅ 完整 |
| **Level 4** | OpenAI Codex | AGENTS.md | `integrations/codex/` | ✅ 完整 |
| **Level 4** | OpenSpec | AGENTS.md | `integrations/openspec/` | ✅ 完整 |
| **Level 4** | Spec Kit | AGENTS.md | `integrations/spec-kit/` | ✅ 完整 |
| **Level 5** | Google Gemini CLI | GEMINI.md | `integrations/gemini-cli/` | ✅ 完整 |
| **Level 5** | Google Antigravity | rules.md | `integrations/google-antigravity/` | ✅ 完整 |

---

## 2. 集成深度分类

### Level 1: 原生 Skills 支持
- **完整 Skills 兼容性**：可直接使用全部 18 个 Claude Code Skills
- **斜杠命令支持**：支持 `/commit`、`/review`、`/tdd` 等命令
- **自动触发**：关键字自动调用相关 Skills
- **工具**：Claude Code、OpenCode

### Level 2: Skills 兼容
- **可读取 Skills**：能读取 `.claude/skills/` 目录
- **有限斜杠命令**：部分工具不支持所有命令
- **需手动调用**：某些功能需要明确调用
- **工具**：Cursor、GitHub Copilot

### Level 3: 规则文件格式
- **专用规则文件**：使用工具特定的格式
- **静态规则**：规则在启动时加载，无动态 Skills
- **跨工具生成**：UDS CLI 可为这些工具生成规则文件
- **工具**：Windsurf (.windsurfrules)、Cline (.clinerules)

### Level 4: 代理规则
- **AGENTS.md 格式**：遵循 OpenAI Codex 代理规范
- **SDD 工具支持**：包含 Spec-Driven Development 工具
- **静态配置**：规则定义在 markdown 文件中
- **工具**：OpenAI Codex、OpenSpec、Spec Kit

### Level 5: 指令文件
- **自定义格式**：每个工具有自己的指令格式
- **基础集成**：提供核心开发标准
- **功能有限**：无 Skills 或斜杠命令支持
- **工具**：Google Gemini CLI (GEMINI.md)、Google Antigravity (rules.md)

---

## 3. Skills 兼容性矩阵

### 18 个 Claude Code Skills

| # | Skill | 斜杠命令 | Claude | OpenCode | Cursor | Copilot |
|---|-------|---------|--------|----------|--------|---------|
| 1 | ai-collaboration-standards | - | ✅ | ✅ | ✅ | ✅ |
| 2 | checkin-assistant | `/check` | ✅ | ✅ | ⚠️ | ⚠️ |
| 3 | commit-standards | `/commit` | ✅ | ✅ | ⚠️ | ⚠️ |
| 4 | code-review-assistant | `/review` | ✅ | ✅ | ⚠️ | ⚠️ |
| 5 | testing-guide | - | ✅ | ✅ | ✅ | ✅ |
| 6 | tdd-assistant | `/tdd` | ✅ | ✅ | ⚠️ | ⚠️ |
| 7 | release-standards | `/release` | ✅ | ✅ | ⚠️ | ❌ |
| 8 | git-workflow-guide | - | ✅ | ✅ | ✅ | ✅ |
| 9 | documentation-guide | `/docs` | ✅ | ✅ | ⚠️ | ❌ |
| 10 | requirement-assistant | `/requirement` | ✅ | ✅ | ⚠️ | ⚠️ |
| 11 | changelog-guide | `/changelog` | ✅ | ✅ | ⚠️ | ❌ |
| 12 | spec-driven-dev | `/spec` | ✅ | ✅ | ⚠️ | ⚠️ |
| 13 | test-coverage-assistant | `/coverage` | ✅ | ✅ | ⚠️ | ⚠️ |
| 14 | refactoring-assistant | - | ✅ | ✅ | ✅ | ✅ |
| 15 | error-code-guide | - | ✅ | ✅ | ✅ | ✅ |
| 16 | methodology-system | `/methodology` | ✅ | ✅ | ⚠️ | ❌ |
| 17 | project-structure-guide | `/config` | ✅ | ✅ | ⚠️ | ❌ |
| 18 | logging-guide | - | ✅ | ✅ | ✅ | ✅ |

**图例**：✅ 完整支持 | ⚠️ 部分/手动 | ❌ 不支持

---

## 4. Skills 存放位置

### 项目级路径

| AI Agent | 主要路径 | 备用路径 | Claude 兼容 |
|----------|---------|---------|------------|
| Claude Code | `.claude/skills/` | - | ✅ 原生 |
| OpenCode | `.opencode/skill/` | `.claude/skills/` | ✅ 支持 |
| Cursor | `.cursor/skills/` | `.claude/skills/` | ✅ 支持 |
| GitHub Copilot | `.github/skills/` | `.claude/skills/` (Legacy) | ✅ 支持 |
| OpenAI Codex | `.codex/skills/` | - | ❌ 独立 |
| Windsurf | `.windsurf/skills/` | - | ❌ 独立 |
| Cline | `.cline/skills/` | - | ❌ 独立 |

### 用户级路径

| AI Agent | 用户路径 |
|----------|-----------|
| Claude Code | `~/.claude/skills/` |
| OpenCode | `~/.config/opencode/skill/` |
| Cursor | `~/.cursor/skills/` |
| GitHub Copilot | `~/.copilot/skills/` |
| OpenAI Codex | `~/.codex/skills/` |
| Windsurf | `~/.codeium/windsurf/skills/` |
| Cline | `~/.cline/skills/` |

### 建议

**使用 `.claude/skills/` 作为默认安装路径**，以获得最大的跨工具兼容性。大多数 Skills 兼容工具都支持从此位置读取。

---

## 5. 未来发展方向

### 5.1 潜在新增工具

| 工具 | 类型 | 优先级 | 备注 |
|------|------|--------|------|
| Amazon Q Developer | IDE 插件 | 中 | AWS 生态系统集成 |
| JetBrains AI Assistant | IDE 插件 | 中 | JetBrains 生态系统 |
| Tabnine | 代码补全 | 低 | 隐私优先选项 |
| Sourcegraph Cody | 代码搜索 + AI | 中 | 企业功能 |
| Continue.dev | 开源 | 高 | 社区驱动，开放 |

### 5.2 功能增强规划

| 功能 | 描述 | 目标工具 |
|------|------|---------|
| Skills v2 格式 | 增强的 metadata、依赖性 | 所有 Level 1-2 |
| 跨工具同步 | 自动生成规则文件 | Level 3-5 |
| CLI 自动检测 | 检测已安装的 AI 工具 | 全部 |
| Skills 市场 | 发布和发现 Skills | Level 1-2 |

### 5.3 集成改进

- **Windsurf/Cline**：探索采用 Skills 格式
- **Copilot**：更深入的 Chat 集成
- **Codex**：监控 Skills 支持
- **OpenCode**：持续作为参考实现

---

## 6. 社区资源

### Skills 市场

| 平台 | 网址 | 支持工具 |
|------|------|---------|
| n-skills | https://github.com/numman-ali/n-skills | Claude、Cursor、Windsurf、Cline、OpenCode、Codex |
| claude-plugins.dev | https://claude-plugins.dev/skills | Claude、Cursor、OpenCode、Codex |
| agentskills.io | https://agentskills.io | 所有 Skills 兼容工具 |

### 官方文档

| 工具 | 文档 |
|------|------|
| Claude Code | https://docs.anthropic.com/claude-code |
| OpenCode | https://opencode.ai/docs |
| Cursor | https://docs.cursor.com |
| GitHub Copilot | https://docs.github.com/copilot |

---

## 7. 贡献指南

### 新增 AI 工具支持

1. 研究该工具的配置格式
2. 在 `integrations/<tool-name>/` 下创建集成目录
3. 新增 README.md 说明设置步骤
4. 若为 Skills 兼容，新增 skills-mapping.md
5. 更新本规划文档
6. 按照 [CONTRIBUTING.md](../../../CONTRIBUTING.md) 提交 PR

### 报告问题

- 集成问题：[GitHub Issues](https://github.com/anthropics-tw/universal-dev-standards/issues)
- 功能请求：使用 `enhancement` 标签
- 文档问题：使用 `documentation` 标签

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-01-14 | 初始版本 |
