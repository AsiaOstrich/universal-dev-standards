---
source: ../../docs/CLI-INIT-OPTIONS.md
source_version: 3.5.1
translation_version: 3.5.1
last_synced: 2026-01-15
status: current
---

# UDS CLI Init 选项完整指南

> **语言**: [English](../../docs/CLI-INIT-OPTIONS.md) | [简体中文](../../zh-TW/docs/CLI-INIT-OPTIONS.md) | 简体中文
>
> **版本**: 3.5.0
> **最后更新**: 2026-01-09

本文档详细说明 `uds init` 命令的每一个选项，包含使用情境、影响范围和建议选择。

---

## 目录

1. [AI 工具选择](#1-ai-工具选择)
2. [Skills 安装位置](#2-skills-安装位置)
3. [Standards Scope（标准范围）](#3-standards-scope标准范围)
4. [Adoption Level（采用等级）](#4-adoption-level采用等级)
5. [Format（标准格式）](#5-format标准格式)
6. [Standard Options（标准选项）](#6-standard-options标准选项)
7. [Extensions（扩展）](#7-extensions扩展)
8. [Integration Configuration（集成配置）](#8-integration-configuration集成配置)
9. [Content Mode（内容模式）](#9-content-mode内容模式)
10. [Methodology（开发方法论）](#10-methodology开发方法论)
11. [CLI 参数对照表](#11-cli-参数对照表)

---

## 1. AI 工具选择

### 交互式提示

```
? Which AI tools are you using?
  ── Dynamic Skills ──
❯ ◉ Claude Code (推荐) - Anthropic CLI with dynamic Skills
  ── Static Rule Files ──
  ◯ Cursor (.cursorrules)
  ◯ Windsurf (.windsurfrules)
  ◯ Cline (.clinerules)
  ◯ GitHub Copilot (.github/copilot-instructions.md)
  ◯ Google Antigravity (INSTRUCTIONS.md) - Gemini Agent
  ── AGENTS.md Tools ──
  ◯ OpenAI Codex (AGENTS.md) - OpenAI Codex CLI
  ◯ OpenCode (AGENTS.md) - Open-source AI coding agent
  ── Gemini Tools ──
  ◯ Gemini CLI (GEMINI.md) - Google Gemini CLI
  ──────────────
  ◯ None / Skip
```

### 说明

选择你在项目中使用的 AI 编码助手。CLI 会根据选择生成对应的集成文件。

### 支持的工具

| 工具 | 生成文件 | 格式 | 说明 |
|------|----------|------|------|
| **Claude Code** | `CLAUDE.md` | Markdown | Anthropic CLI，支持动态 Skills |
| **Cursor** | `.cursorrules` | Plaintext | Cursor IDE 规则文件 |
| **Windsurf** | `.windsurfrules` | Plaintext | Windsurf IDE 规则文件 |
| **Cline** | `.clinerules` | Plaintext | Cline 扩展规则文件 |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Markdown | Copilot 自定义指示 |
| **Google Antigravity** | `INSTRUCTIONS.md` | Markdown | Gemini Agent 系统指令 |
| **OpenAI Codex** | `AGENTS.md` | Markdown | OpenAI Codex CLI |
| **OpenCode** | `AGENTS.md` | Markdown | 开源 AI 编码 Agent（与 Codex 共用文件） |
| **Gemini CLI** | `GEMINI.md` | Markdown | Google Gemini CLI |

### 分类

```
── Dynamic Skills ──
  Claude Code (推荐) - 支持动态 Skills 加载

── Static Rule Files ──
  Cursor, Windsurf, Cline, GitHub Copilot, Google Antigravity

── AGENTS.md Tools ──
  OpenAI Codex, OpenCode (共用 AGENTS.md)

── Gemini Tools ──
  Gemini CLI
```

### 使用情境

| 情境 | 建议选择 |
|------|----------|
| 主要使用 Claude Code | 只选 Claude Code，可使用 minimal scope |
| 团队成员使用不同工具 | 选择所有团队使用的工具 |
| 想要最完整的规则覆盖 | 选择 Claude Code + 其他工具 |

### 注意事项

- **Codex + OpenCode**：两者共用 `AGENTS.md`，只会生成一份文件
- **只选 Claude Code**：会触发 Skills 安装位置提示
- **选择多个工具**：会统一使用相同的集成配置

---

## 2. Skills 安装位置

### 交互式提示（多 Agent 选择）

```
? Select AI agents to install Skills for:
  ── Claude Code ──
❯ ◉ Claude Code (Plugin Marketplace) - Auto-managed (Recommended)
  ◯ Claude Code (User Level) - ~/.claude/skills/
  ◯ Claude Code (Project Level) - .claude/skills/
  ── OpenCode ──
  ◯ OpenCode (User Level) - ~/.config/opencode/skill/
  ◯ OpenCode (Project Level) - .opencode/skill/
  ── Cline ──
  ◯ Cline (User Level) - ~/.cline/skills/
  ◯ Cline (Project Level) - .cline/skills/
  ── 其他 Agents ──
  ◯ Roo Code, Codex, Copilot, Windsurf, Gemini CLI...
  ──────────────
  ◯ Skip Skills Installation
```

### 说明

选择要安装 Skills 的 AI agents。**v3.5.0 支持同时安装 Skills 到多个 agents**。每个 agent 有自己的 skills 目录路径。

### 选项

| Agent | User Level 路径 | Project Level 路径 | 备注 |
|-------|-----------------|-------------------|------|
| **Claude Code** | `~/.claude/skills/` | `.claude/skills/` | 也支持 Plugin Marketplace |
| **OpenCode** | `~/.config/opencode/skill/` | `.opencode/skill/` | 完整 SKILL.md 支持 |
| **Cline** | `~/.cline/skills/` | `.cline/skills/` | 使用 Claude skills 路径 |
| **Roo Code** | `~/.roo/skills/` | `.roo/skills/` | 模式特定: `.roo/skills-{mode}/` |
| **OpenAI Codex** | `~/.codex/skills/` | `.codex/skills/` | 完整 SKILL.md 支持 |
| **GitHub Copilot** | `~/.copilot/skills/` | `.github/skills/` | 完整 SKILL.md 支持 |
| **Windsurf** | `~/.codeium/windsurf/skills/` | `.windsurf/skills/` | 2026/01 起支持 Skills |
| **Gemini CLI** | `~/.gemini/skills/` | `.gemini/skills/` | 预览支持 |

> **注意**: Cursor 尚不支持 SKILL.md 格式（使用 `.mdc` rules 格式）。

### 详细说明

#### Plugin Marketplace (推荐)

```bash
# 如果尚未安装，执行：
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

**优点**：
- 自动更新到最新版本
- 无需手动管理
- 所有 15 个 Skills 一次安装

**缺点**：
- 无法锁定特定版本
- 需要网络连接

#### User Level

```
~/.claude/skills/
├── universal-dev-standards/
│   ├── ai-collaboration-standards/
│   ├── commit-standards/
│   └── ...
```

**优点**：
- 所有项目共用
- 可离线使用
- 可手动控制版本

**缺点**：
- 需要手动更新
- 不会随项目版本控制

#### Project Level

```
your-project/
├── .claude/
│   └── skills/
│       └── universal-dev-standards/
│           ├── ai-collaboration-standards/
│           └── ...
```

**优点**：
- 可加入 Git 版本控制
- 团队成员共享相同版本
- 项目独立，不影响其他项目

**缺点**：
- 增加项目大小
- 需要手动更新
- 建议加入 `.gitignore`（视需求）

### 决策流程

```
是否使用 Claude Code？
    │
    ├─ 否 → 选择 None
    │
    └─ 是 → 是否需要自动更新？
              │
              ├─ 是 → Plugin Marketplace
              │
              └─ 否 → 是否需要团队共享？
                        │
                        ├─ 是 → Project Level
                        │
                        └─ 否 → User Level
```

---

## 3. Standards Scope（标准范围）

### 交互式提示

```
? How should standards be installed?
❯ Lean (推荐) - Reference docs only, Skills handle the rest
  Complete - All standards as local files
```

### 说明

决定复制到 `.standards/` 目录的标准范围。**仅当 Skills 已安装时才会显示此选项**。

### 选项

| 范围 | 复制内容 | 适用情境 |
|------|----------|----------|
| **Minimal** (推荐) | 只有 Reference 类别标准 | 已安装 Skills，避免重复 |
| **Full** | Reference + Skill 类别标准 | 未安装 Skills，或需要完整文档 |

### 详细说明

#### Minimal 范围

只复制 **Reference** 类别的标准（没有对应 Skill 的标准）：

```
.standards/
├── checkin-standards.md          # Reference
├── spec-driven-development.md    # Reference
├── project-structure.md          # Reference (Level 3)
└── documentation-writing-standards.md  # Reference (Level 3)
```

**适用情境**：
- ✅ 已安装 Skills（Marketplace / User / Project）
- ✅ 想要避免 Skill 与文档重复
- ✅ 想要较小的 `.standards/` 目录

#### Full 范围

复制 **Reference + Skill** 类别的标准：

```
.standards/
├── anti-hallucination.md         # Skill 类别
├── commit-message-guide.md       # Skill 类别
├── code-review-checklist.md      # Skill 类别
├── git-workflow.md               # Skill 类别
├── testing-standards.md          # Skill 类别
├── checkin-standards.md          # Reference 类别
├── spec-driven-development.md    # Reference 类别
└── ...
```

**适用情境**：
- ✅ 未安装 Skills
- ✅ 需要完整的本地文档参考
- ✅ 团队成员不使用 Claude Code

### 重要提醒

> **原则**：对于有 Skill 的标准，使用 Skill **或**复制文档 — **不要同时使用两者**。

---

## 4. Adoption Level（采用等级）

### 交互式提示

```
? Select adoption level:
  Level 1: Starter (基本) - 6 core standards
❯ Level 2: Professional (推荐) - 12 standards
  Level 3: Complete (完整) - All 16 standards
```

### 说明

决定采用的标准数量和深度。等级越高，包含的标准越完整。

### 选项

| 等级 | 名称 | 标准数量 | 设定时间 | 适用情境 |
|------|------|----------|----------|----------|
| **Level 1** | Starter (基本) | 6 个核心标准 | ~30 分钟 | 个人项目、快速启动 |
| **Level 2** | Professional (推荐) | 12 标准 | ~2 小时 | 团队项目、专业开发 |
| **Level 3** | Complete (完整) | 全部 16 标准 | 1-2 天 | 企业项目、法规遵循 |

### Level 1: Starter (基本)

**包含标准**：
- `anti-hallucination.md` - AI 协作防幻觉
- `checkin-standards.md` - 代码签入检查
- `commit-message-guide.md` - 提交信息格式
- `spec-driven-development.md` - 规格驱动开发

**适用情境**：
- 个人 side project
- 快速原型开发
- 刚开始导入标准的团队

**Standard Options**：
- ✅ Commit Language

### Level 2: Professional (推荐)

**包含 Level 1 + 额外标准**：
- `code-review-checklist.md` - 代码审查
- `git-workflow.md` - Git 工作流程
- `versioning.md` - 语义化版本
- `changelog-standards.md` - 变更日志
- `testing-standards.md` - 测试标准
- 适用的语言/框架扩展

**适用情境**：
- 多人协作的团队项目
- 需要 Code Review 流程
- 有 CI/CD 的项目

**Standard Options**：
- ✅ Git Workflow
- ✅ Merge Strategy
- ✅ Commit Language
- ✅ Test Levels

### Level 3: Complete (完整)

**包含 Level 2 + 额外标准**：
- `documentation-structure.md` - 文档结构
- `documentation-writing-standards.md` - 文档撰写
- `project-structure.md` - 项目结构
- 完整模板套件

**适用情境**：
- 企业级项目
- 法规遵循要求（金融、医疗等）
- 需要完整文档的项目

---

## 5. Format（标准格式）

### 交互式提示

```
? Select standards format:
❯ Compact (推荐) - YAML format, optimized for AI reading
  Detailed - Full Markdown, best for human reading
  Both (进阶) - Include both formats
```

### 说明

决定复制的标准文件格式。

### 选项

| 格式 | 文件类型 | Token 使用量 | 适用情境 |
|------|----------|--------------|----------|
| **Compact** (推荐) | `.ai.yaml` | ~80% 减少 | AI 助手使用、自动化 |
| **Detailed** | `.md` | 标准 | 人工阅读、团队培训 |
| **Both** | 两种都有 | 较高 | 需要两种用途 |

### 详细说明

#### Compact (推荐)

```yaml
# commit-message.ai.yaml
format: "<type>(<scope>): <subject>"
types:
  feat: New feature
  fix: Bug fix
  docs: Documentation
rules:
  - subject_max_length: 72
  - use_imperative_mood: true
```

**特点**：
- Token 效率高（约减少 80%）
- 结构化 YAML 格式
- 适合 AI 解析

#### Detailed

```markdown
# Commit Message Guide

## Format
<type>(<scope>): <subject>

## Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation

## Rules
- Subject line maximum 72 characters
- Use imperative mood: "add" not "added"
```

**特点**：
- 易于人工阅读
- 详细说明和示例
- 适合团队培训

#### Both

同时复制两种格式，适合需要：
- AI 自动化处理
- 人工参考阅读

---

## 6. Standard Options（标准选项）

### 说明

针对特定标准的配置选项。选项会根据 Adoption Level 显示。

### 6.1 Git Workflow（Level 2+）

#### 交互式提示

```
? Select Git branching strategy:
❯ GitHub Flow (推荐) - Simple, continuous deployment
  GitFlow - Structured releases with develop/release branches
  Trunk-Based - Direct commits to main, feature flags
```

决定团队的 Git 分支策略。

| 策略 | 说明 | 适用情境 |
|------|------|----------|
| **GitHub Flow** (推荐) | 简单，持续部署 | 小团队、Web 应用、持续部署 |
| **GitFlow** | 结构化，有 develop/release 分支 | 大团队、定期发布、多版本维护 |
| **Trunk-Based** | 直接提交 main，feature flags | 高度自动化、成熟 CI/CD |

#### GitHub Flow

```
main ──────────────────────────────>
       \         /
        feature ─
```

- 只有 `main` 分支
- Feature branch → PR → Merge
- 适合持续部署

#### GitFlow

```
main    ─────────────────────────────>
              \         /
develop ───────────────────────────>
           \   /     \   /
         feature   release
```

- `main` + `develop` 分支
- Feature → develop → release → main
- 适合计划性发布

#### Trunk-Based

```
main ─────────────────────────────>
       │   │   │
       ↑   ↑   ↑
     直接提交或极短 PR
```

- 所有人直接提交 main
- 使用 feature flags
- 需要高度自动化测试

### 6.2 Merge Strategy（Level 2+）

#### 交互式提示

```
? Select merge strategy:
❯ Squash Merge (推荐) - Clean history, one commit per PR
  Merge Commit - Preserve full branch history
  Rebase + Fast-Forward - Linear history, advanced
```

决定 PR 合并方式。

| 策略 | 说明 | 适用情境 |
|------|------|----------|
| **Squash Merge** (推荐) | 压缩为单一 commit | 干净历史、大多数项目 |
| **Merge Commit** | 保留完整分支历史 | 需要追踪详细历史 |
| **Rebase + Fast-Forward** | 线性历史，进阶 | 追求完美线性历史 |

### 6.3 Commit Language（Level 1+）

#### 交互式提示

```
? Select commit message language:
❯ English (推荐) - Standard international format
  简体中文 (简体中文) - For Chinese-speaking teams
  Bilingual (双语) - Both English and Chinese
```

决定提交信息的语言。

| 语言 | 示例 | 适用情境 |
|------|------|----------|
| **English** (推荐) | `feat(auth): add OAuth2 support` | 国际团队、开源项目 |
| **简体中文** | `新增(认证): 实作 OAuth2 支援` | 繁体中文团队 |
| **Bilingual** | `feat(auth): add OAuth2 / 新增 OAuth2` | 双语环境 |

### 6.4 Test Levels（Level 2+）

#### 交互式提示

```
? Select test levels to include:
❯ ◉ Unit Testing (70% pyramid base)
  ◉ Integration Testing (20%)
  ◯ System Testing (7%)
  ◯ E2E Testing (3% pyramid top)
```

选择要包含的测试层级。

| 层级 | 覆盖率建议 | 说明 |
|------|------------|------|
| **Unit Testing** | 70% | 单元测试（默认选中）|
| **Integration Testing** | 20% | 集成测试（默认选中）|
| **System Testing** | 7% | 系统测试 |
| **E2E Testing** | 3% | 端到端测试 |

---

## 7. Extensions（扩展）

### 说明

根据项目的语言、框架、地区设置，复制对应的扩展标准。

### 7.1 Language Extensions（语言扩展）

#### 交互式提示

```
? Detected language(s). Select style guides to include:
❯ ◉ C# Style Guide
  ◉ PHP Style Guide (PSR-12)
```

> 注意：此提示仅在项目中检测到相关语言时才会显示。

| 扩展 | 文件 | 检测方式 |
|------|------|----------|
| **C#** | `csharp-style.md` | `.cs` 文件、`.csproj` |
| **PHP** | `php-style.md` | `.php` 文件、`composer.json` |

### 7.2 Framework Extensions（框架扩展）

#### 交互式提示

```
? Detected framework(s). Select patterns to include:
❯ ◉ Fat-Free Framework Patterns
```

> 注意：此提示仅在项目中检测到相关框架时才会显示。

| 扩展 | 文件 | 检测方式 |
|------|------|----------|
| **Fat-Free** | `fat-free-patterns.md` | Fat-Free Framework 相关文件 |

### 7.3 Locale Extensions（地区扩展）

#### 交互式提示

```
? Use 简体中文 (简体中文) locale? (y/N)
```

| 扩展 | 文件 | 说明 |
|------|------|------|
| **zh-TW** | `zh-cn.md` | 繁体中文本地化指引 |

### 自动检测

CLI 会自动检测项目特征并预选相关扩展：

```bash
uds init
# Detecting project characteristics...
# Languages: javascript, typescript
# Frameworks: react
# AI Tools: cursor
```

---

## 8. Integration Configuration（集成配置）

### 说明

针对非 Claude Code 工具（Cursor、Windsurf、Cline 等）的集成文件配置。

### 配置项目

#### 规则类别

选择要嵌入的规则类别：

| 类别 | 说明 |
|------|------|
| `anti-hallucination` | 反幻觉协议 |
| `commit-standards` | 提交信息标准 |
| `code-review` | 代码审查清单 |
| `testing` | 测试标准 |
| `git-workflow` | Git 工作流程 |
| `documentation` | 文档标准 |
| `error-handling` | 错误处理 |
| `project-structure` | 项目结构 |
| `spec-driven-development` | 规格驱动开发 |

#### Detail Level（详细程度）

| 程度 | 说明 | 文件大小 |
|------|------|----------|
| **Minimal** | 最精简的规则 | 最小 |
| **Standard** (默认) | 标准详细度 | 中等 |
| **Comprehensive** | 完整详细说明 | 较大 |

#### 现有文件处理

如果集成文件已存在：

| 策略 | 说明 |
|------|------|
| **Overwrite** | 完全覆写 |
| **Merge** | 合并（避免重复区段）|
| **Append** | 附加到现有内容 |
| **Keep** | 保留现有文件 |

### 共享配置

当选择多个 AI 工具时，所有工具会共享相同的配置：

```
选择: Cursor + Windsurf + Cline
     ↓
共享配置提示（一次设定）
     ↓
生成三个文件，使用相同规则
```

---

## 9. Content Mode（内容模式）

### 交互式提示

```
? Select content level:
❯ Standard (推荐) - Summary + links to full docs
  Full Embed - All rules in one file (larger)
  Minimal - Core rules only (smallest)
```

### 说明

决定 AI 工具集成文件中嵌入多少标准内容。这是影响 AI 合规程度的关键设置。

### 选项

| 模式 | 文件大小 | AI 可见性 | 适用情境 |
|------|----------|-----------|----------|
| **Standard** (推荐) | 中等 | 高 | 大多数项目 |
| **Full Embed** | 最大 | 最高 | 企业级合规 |
| **Minimal** | 最小 | 低 | 旧项目迁移 |

### 详细说明

#### Minimal 模式

**生成内容**：简单的标准参考列表

```markdown
## 规范文档参考

**重要**：执行相关任务时，务必读取并遵循 `.standards/` 目录下的对应规范：

**核心规范：**
- `.standards/anti-hallucination.md`
- `.standards/commit-message.ai.yaml`
- `.standards/checkin-standards.md`

**选项：**
- `.standards/options/github-flow.ai.yaml`
```

**特点**：
- 只列出文件路径
- AI 需要主动读取 `.standards/`
- 最小文件大小

**适用情境**：
- ✅ 旧项目迁移，不想大幅改动
- ✅ 小型项目 / 原型
- ✅ 文件大小敏感
- ⚠️ 风险：AI 可能不会主动读取

#### Standard 模式 (推荐)

**生成内容**：合规指示 + 标准索引

```markdown
## Standards Compliance Instructions

**MUST follow** (每次都要遵守):
| Task | Standard | When |
|------|----------|------|
| AI collaboration | anti-hallucination.md | Always |
| Writing commits | commit-message.ai.yaml | Every commit |
| Committing code | checkin-standards.md | Every commit |

**SHOULD follow** (相关任务时参考):
| Task | Standard | When |
|------|----------|------|
| Adding logging | logging-standards.md | When writing logs |
| Writing tests | testing.ai.yaml | When creating tests |

## Installed Standards Index

本项目采用 **Level 2** 标准。所有规范位于 `.standards/`：

### Core (6 standards)
- `anti-hallucination.md` - AI 协作防幻觉规范
- `commit-message.ai.yaml` - 提交信息格式
...
```

**特点**：
- **MUST / SHOULD** 优先级分类
- 任务对应表（Task → Standard → When）
- 告诉 AI **何时**该读取哪个标准
- 平衡文件大小与可见性

**适用情境**：
- ✅ 大多数项目
- ✅ 希望 AI 遵守规范但不想文件太大
- ✅ AI 工具会读取项目文件

#### Full Embed 模式

**生成内容**：完整嵌入所有规则

```markdown
## Anti-Hallucination Protocol
Reference: .standards/anti-hallucination.md

### Core Principle
You are an AI assistant that prioritizes accuracy over confidence...

### Evidence-Based Analysis
1. **File Reading Requirement**
   - You MUST read files before analyzing them
   - Do not guess APIs, class names, or library versions
...

---

## Commit Message Standards
Reference: .standards/commit-message-guide.md

### Format Structure
<type>(<scope>): <subject>

### Commit Types
| Type | Description | Example |
| feat | New feature | feat(auth): add OAuth2 login |
...
```

**特点**：
- 所有核心规则直接嵌入
- AI **保证**看到所有标准
- 文件大小可能是 Index 的 3-5 倍

**适用情境**：
- ✅ 企业级合规要求
- ✅ AI 可能不读取外部文件
- ✅ 不能容许 AI 遗漏任何规则
- ✅ 新团队导入，确保完全了解规范

### 决策流程

```
开始选择内容模式
        │
        ▼
  ┌─────────────────────────────┐
  │ AI 是否会主动读取项目文件？  │
  └─────────────────────────────┘
        │
    ┌───┴───┐
    │       │
   是       否
    │       │
    ▼       ▼
Index    Full
    │
    ▼
  ┌─────────────────────────────┐
  │ 是否有严格合规要求？         │
  └─────────────────────────────┘
        │
    ┌───┴───┐
    │       │
   是       否
    │       │
    ▼       ▼
 Full    Index


旧项目迁移 / 想要最小改动？ → Minimal
```

### 使用案例

| 案例 | 推荐模式 | 理由 |
|------|----------|------|
| 创业团队的 SaaS 项目 | **Index** | 平衡效率与规范 |
| 银行核心系统 | **Full** | 法规要求，不能遗漏 |
| 个人 side project | **Minimal** | 轻量就好 |
| 开源项目 | **Index** | 让贡献者 AI 知道规范 |
| 从旧设置迁移 | **Minimal** | 保留现有设置 |
| 新导入 AI 的传统企业 | **Full** | 确保 AI 完全遵循 |

---

## 10. Methodology（开发方法论）

### 交互式提示

```
? Which development methodology do you want to use?
❯ TDD - Test-Driven Development (Red → Green → Refactor)
  BDD - Behavior-Driven Development (Given-When-Then)
  SDD - Spec-Driven Development (Spec First, Code Second)
  ATDD - Acceptance Test-Driven Development
  ──────────────
  None - No specific methodology
```

> **⚠️ 实验性功能**：此功能需要使用 `-E` 或 `--experimental` 标志才能启用。将在 v4.0 重新设计。

### 说明

选择开发方法论来指导项目的工作流程。此选项仅在使用 `--experimental` 标志时才会出现。

### 选项

| 方法论 | 全名 | 说明 |
|--------|------|------|
| **TDD** | Test-Driven Development | Red → Green → Refactor 循环 |
| **BDD** | Behavior-Driven Development | Given-When-Then 情境 |
| **SDD** | Spec-Driven Development | Spec First, Code Second |
| **ATDD** | Acceptance Test-Driven Development | 以验收标准为焦点 |
| **None** | - | 不使用特定方法论 |

### 启用实验性功能

```bash
# 启用实验性功能
uds init -E

# 或使用完整形式
uds init --experimental
```

---

## 11. CLI 参数对照表

### 交互模式 vs 非交互模式

| 选项 | 交互式提示 | CLI 参数 | 默认值 |
|------|------------|----------|--------|
| AI Tools | `promptAITools()` | - (检测) | 自动检测 |
| Skills Location | `promptSkillsInstallLocation()` | `--skills-location` | `marketplace` |
| Standards Scope | `promptStandardsScope()` | - | 依 Skills 决定 |
| Level | `promptLevel()` | `-l, --level` | `2` |
| Format | `promptFormat()` | `-f, --format` | `ai` |
| Git Workflow | `promptGitWorkflow()` | `--workflow` | `github-flow` |
| Merge Strategy | `promptMergeStrategy()` | `--merge-strategy` | `squash` |
| Commit Language | `promptCommitLanguage()` | `--commit-lang` | `english` |
| Test Levels | `promptTestLevels()` | `--test-levels` | `unit,integration` |
| Language | `promptLanguage()` | `--lang` | 自动检测 |
| Framework | `promptFramework()` | `--framework` | 自动检测 |
| Locale | `promptLocale()` | `--locale` | - |
| Content Mode | `promptContentMode()` | `--content-mode` | `index` |
| Methodology | `promptMethodology()` | - | `null` (需 `-E`) |

### 控制标志

| 标志 | CLI 参数 | 说明 |
|------|----------|------|
| 非交互模式 | `-y, --yes` | 跳过交互提示，使用默认值 |
| 实验性功能 | `-E, --experimental` | 启用实验性功能（开发方法论选择） |
| 模式（已弃用） | `-m, --mode` | 安装模式（skills, full）- 请改用 `--skills-location` |

### 完整 CLI 示例

```bash
# 完全交互式
uds init

# 非交互式，使用默认值
uds init -y

# 指定所有选项
uds init -y \
  --level 2 \
  --format ai \
  --skills-location marketplace \
  --workflow github-flow \
  --merge-strategy squash \
  --commit-lang english \
  --test-levels unit,integration \
  --content-mode index

# Level 1 快速设置
uds init -y --level 1

# 企业级完整设置
uds init -y --level 3 --content-mode full

# 繁体中文团队
uds init -y --level 2 --commit-lang traditional-chinese --locale zh-cn

# PHP 项目
uds init -y --level 2 --lang php --framework fat-free
```

---

## 相关文档

- [CLI README](../../cli/README.md) - CLI 基本使用
- [ADOPTION-GUIDE.md](../adoption/ADOPTION-GUIDE.md) - 采用指南
- [CLAUDE.md](../../CLAUDE.md) - 项目开发指引
- [CHANGELOG.md](../../CHANGELOG.md) - 版本历史

---

**由 Universal Dev Standards 团队维护**
