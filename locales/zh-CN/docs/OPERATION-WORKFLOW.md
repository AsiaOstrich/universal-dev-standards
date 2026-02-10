---
source: ../../../docs/OPERATION-WORKFLOW.md
source_version: 1.3.0
translation_version: 1.3.0
status: current
last_updated: 2026-01-26
translator: Claude
---

# UDS 作业流程

> **Language**: [English](../../docs/OPERATION-WORKFLOW.md) | [繁體中文](../zh-TW/docs/OPERATION-WORKFLOW.md) | 简体中文

**版本**: 1.3.0
**最后更新**: 2026-01-26

本文档提供 Universal Development Standards (UDS) 项目的完整作业流程，涵盖从核心规范到文件生成的所有流程。

---

## 目录

1. [概览](#1-概览)
2. [核心规范层](#2-核心规范层)
3. [衍生格式生成](#3-衍生格式生成)
4. [Claude Code Skills](#4-claude-code-skills)
5. [AI 工具集成](#5-ai-工具集成)
6. [CLI 执行流程](#6-cli-执行流程)
7. [维护流程](#7-维护流程)
8. [开发指南](#8-开发指南)
9. [发布流程](#9-发布流程)
10. [文件路径参考](#10-文件路径参考)

---

## 1. 概览

### 1.1 项目架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      核心规范层 (core/)                          │
│   16 个标准：Essential(6) + Recommended(6) + Enterprise(4)      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  AI 格式      │  │  选项文件     │  │  本地化       │
│  ai/standards/│  │  options/     │  │  locales/     │
│  16 个 YAML   │  │  7 类 36 个   │  │  zh-TW/zh-CN  │
└───────┬───────┘  └───────┬───────┘  └───────────────┘
        │                  │
        └────────┬─────────┘
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Claude Code Skills                            │
│   skills/ - 15 个 Skills                            │
│   每个 Skill 对应 1+ 个核心规范                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AI 工具集成                                 │
│   integrations/ - 10 种工具模板                                 │
│   CLI 动态生成：CLAUDE.md, .cursorrules, .windsurfrules 等     │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 文件关系摘要

| 来源 | 衍生格式 | 数量 |
|------|----------|------|
| `core/*.md` | 人类可读规范 | 16 |
| `ai/standards/*.ai.yaml` | AI 优化规范 | 16 |
| `options/*/*.md` | 实践选项 | 36 |
| `ai/options/*/*.ai.yaml` | AI 优化选项 | 36 |
| `skills/*/` | Claude Code 技能 | 15 |
| `integrations/*/` | AI 工具模板 | 10 |
| `locales/zh-TW/` | 繁体中文 | ~129 |
| `locales/zh-CN/` | 简体中文 | 部分 |

---

## 2. 核心规范层

### 2.1 按采用层级分类

#### 层级 1：Essential（6 个规范）

| ID | 文件 | 说明 |
|----|------|------|
| anti-hallucination | `core/anti-hallucination.md` | AI 协作防幻觉指南 |
| commit-message | `core/commit-message-guide.md` | Conventional Commits 规范 |
| checkin-standards | `core/checkin-standards.md` | 代码签入标准 |
| git-workflow | `core/git-workflow.md` | Git 工作流程标准 |
| changelog | `core/changelog-standards.md` | CHANGELOG 格式规范 |
| versioning | `core/versioning.md` | 语义化版本规范 |

#### 层级 2：Recommended（6 个规范）

| ID | 文件 | 说明 |
|----|------|------|
| code-review | `core/code-review-checklist.md` | 代码审查清单 |
| documentation-structure | `core/documentation-structure.md` | 文档组织结构 |
| documentation-writing | `core/documentation-writing-standards.md` | 文档撰写标准 |
| project-structure | `core/project-structure.md` | 项目目录结构 |
| testing | `core/testing-standards.md` | 测试标准 |
| logging | `core/logging-standards.md` | 日志记录标准 |

#### 层级 3：Enterprise（4 个规范）

| ID | 文件 | 说明 |
|----|------|------|
| tdd | `core/test-driven-development.md` | 测试驱动开发 |
| test-completeness | `core/test-completeness-dimensions.md` | 测试完整性维度 |
| spec-driven | `core/spec-driven-development.md` | 规格驱动开发 |
| error-codes | `core/error-code-standards.md` | 错误码标准 |

### 2.2 规范文档模板

```markdown
# [规范名称]

> **Language**: English | [简体中文](../locales/zh-TW/core/[file].md)

**版本**: X.Y.Z
**最后更新**: YYYY-MM-DD

---

## 目的

[规范目的说明]

## 主要指南

[详细指南]

## 相关规范

- [相关规范链接]

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| X.Y.Z | YYYY-MM-DD | 说明 |

## 许可

本规范采用 [CC BY 4.0](...)
```

---

## 3. 衍生格式生成

### 3.1 AI 优化格式（`ai/`）

**转换规则：**
```
core/commit-message-guide.md（人类可读）
        ↓ 转换
ai/standards/commit-message.ai.yaml（AI 优化）
```

**名称映射：**
| 核心文件 | AI 文件 |
|----------|---------|
| `changelog-standards` | `changelog` |
| `code-review-checklist` | `code-review` |
| `commit-message-guide` | `commit-message` |
| `error-code-standards` | `error-codes` |
| `logging-standards` | `logging` |
| `testing-standards` | `testing` |
| 其他 | 相同名称 |

**AI YAML 结构：**
```yaml
---
name: commit-message
description: AI 助手的简要说明
keywords: [commit, conventional, message, 提交, 消息]
---

# Commit Message Standards

## Quick Reference
[简洁内容]

## Configuration Detection
[项目配置检测逻辑]

## Related Standards
- [核心规范链接]

## Version History
[表格]

## License
CC BY 4.0
```

### 3.2 选项文件（`options/`）

| 类别 | 选项 | 路径 |
|------|------|------|
| Git 工作流 | github-flow, gitflow, trunk-based | `options/git-workflow/` |
| 合并策略 | squash, merge-commit, rebase-ff | `options/git-workflow/` |
| 提交消息语言 | english, traditional-chinese, bilingual | `options/commit-message/` |
| 测试类型 | unit, integration, e2e, system 等 | `options/testing/` |
| 代码审查 | pr-review, pair-programming, automated | `options/code-review/` |
| 文档类型 | markdown, api-docs, wiki-style | `options/documentation/` |
| 项目结构 | nodejs, python, java, go 等 | `options/project-structure/` |

### 3.3 本地化（`locales/`）

**同步层级：**
```
core/*.md（主要来源）
    ↓
locales/zh-TW/core/*.md（繁体中文）
    ↓
locales/zh-CN/core/*.md（简体中文）
```

**YAML Front Matter 模板：**
```yaml
---
source: ../../../docs/OPERATION-WORKFLOW.md
source_version: 1.2.0
translation_version: 1.2.0
status: current
last_updated: 2026-01-10
translator: [名称]
---
```

**状态值：**
- `current` - 翻译已同步
- `outdated` - 来源已更新
- `needs_review` - 需要审查

---

## 4. Claude Code Skills

### 4.1 Skills 清单（15 个 Skills）

| Skill 名称 | 对应核心规范 | 路径 |
|------------|--------------|------|
| ai-collaboration-standards | anti-hallucination | `skills/ai-collaboration-standards/` |
| changelog-guide | changelog | `skills/changelog-guide/` |
| code-review-assistant | code-review, checkin | `skills/code-review-assistant/` |
| commit-standards | commit-message | `skills/commit-standards/` |
| documentation-guide | documentation-* | `skills/documentation-guide/` |
| error-code-guide | error-codes | `skills/error-code-guide/` |
| git-workflow-guide | git-workflow | `skills/git-workflow-guide/` |
| logging-guide | logging | `skills/logging-guide/` |
| project-structure-guide | project-structure | `skills/project-structure-guide/` |
| release-standards | versioning | `skills/release-standards/` |
| requirement-assistant | （需求文档） | `skills/requirement-assistant/` |
| spec-driven-dev | spec-driven | `skills/spec-driven-dev/` |
| tdd-assistant | tdd | `skills/tdd-assistant/` |
| test-coverage-assistant | test-completeness | `skills/test-coverage-assistant/` |
| testing-guide | testing | `skills/testing-guide/` |

### 4.2 Skill 目录结构

```
skills/[skill-name]/
├── SKILL.md              # 主要技能文档（YAML 前置 + 内容）
├── [guide1].md           # 详细指南
├── [guide2].md           # 详细指南
└── commands/             # 可选：命令文件
    └── [command].md
```

### 4.3 SKILL.md 模板

```markdown
---
name: skill-name
description: |
  简要说明。
  使用时机：触发此技能的时机。
  关键字：[keyword1, keyword2]
---

# 技能标题

> **Language**: English | [简体中文](翻译路径)

**版本**: 1.0.0
**最后更新**: YYYY-MM-DD
**适用范围**: Claude Code Skills

---

## 目的
[清楚说明]

## 快速参考
[快速参考指南]

## 详细指南
完整信息请参阅：
- [guide1.md](./guide1.md)

## 配置检测
[项目配置检测]

## 相关规范
- [core/related-standard.md](路径)

## 版本历史
| 版本 | 日期 | 变更 |
|------|------|------|

## 许可
CC BY 4.0
```

---

## 5. AI 工具集成

### 5.1 支持工具（10 种工具）

| 工具 | 集成文件 | 格式 |
|------|----------|------|
| Claude Code | `CLAUDE.md` | Markdown |
| Cursor | `.cursorrules` | 纯文本 |
| Windsurf | `.windsurfrules` | 纯文本 |
| Cline | `.clinerules` | 纯文本 |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |
| Google Antigravity | `INSTRUCTIONS.md` | Markdown |
| OpenAI Codex | `AGENTS.md` | Markdown |
| OpenCode | `AGENTS.md`（共用） | Markdown |
| Gemini CLI | `GEMINI.md` | Markdown |
| OpenSpec | `AGENTS.md` | Markdown |

> **相关文档**：完整的 AI Agent 支持状态、Skills 兼容性矩阵及未来规划，请参阅 [AI-AGENT-ROADMAP.md](./AI-AGENT-ROADMAP.md)。

### 5.2 集成目录结构

```
integrations/[tool-name]/
├── README.md           # 安装和使用指南
├── [config-file]       # 工具特定配置
└── examples/           # 可选：示例配置
```

---

## 6. CLI 执行流程

### 6.1 完整流程图（`uds init`）

```
┌─────────────────────────────────────────────────────────────────┐
│ 阶段 1：初始化检查                                              │
│ - 检查 .standards/manifest.json 是否存在                        │
│ - 如已初始化，提示使用 uds update                               │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 阶段 2：项目检测（detector.js）                                 │
│ - detectLanguage(): C#, PHP, TypeScript, JavaScript, Python     │
│ - detectFramework(): Fat-Free, React, Vue, Angular, .NET        │
│ - detectAITools(): 9 种 AI 工具检测                             │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 阶段 3：交互配置（prompts/init.js）                             │
│ - AI 工具选择（1-9 种）                                         │
│ - Skills 安装位置（marketplace/user/project/none）              │
│ - 采用层级（Essential/Recommended/Enterprise）                  │
│ - 格式选择（ai/human/both）                                     │
│ - 标准选项（workflow, commit_language, test_levels）            │
│ - 内容模式（minimal/index/full）                                │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 阶段 4：标准查询（registry.js）                                 │
│ - 加载 cli/standards-registry.json                              │
│ - getStandardsByLevel() 筛选标准                                │
│ - getStandardSource() 获取来源路径                              │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 阶段 5：文件复制（copier.js）                                   │
│ - 核心规范 → .standards/*.md                                    │
│ - AI 格式 → .standards/*.ai.yaml                                │
│ - 选项文件 → .standards/options/                                │
│ - 扩展文件 → .standards/（语言/框架/本地化）                    │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 阶段 6：集成文件生成（integration-generator.js）                │
│ - 根据选择的 AI 工具动态生成                                    │
│ - 依据 contentMode 调整内容量                                   │
│ - 支持多语言（en/zh-cn）                                        │
│ 生成文件：                                                      │
│ - CLAUDE.md（Claude Code）                                      │
│ - .cursorrules（Cursor）                                        │
│ - .windsurfrules（Windsurf）                                    │
│ - .clinerules（Cline）                                          │
│ - .github/copilot-instructions.md（Copilot）                    │
│ - AGENTS.md（Codex/OpenCode）                                   │
│ - GEMINI.md（Gemini CLI）                                       │
│ - INSTRUCTIONS.md（Antigravity）                                │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 阶段 7：Skills 安装（github.js）                                │
│ - 用户级：~/.claude/skills/                                     │
│ - 项目级：.claude/skills/                                       │
│ - 下载全部 15 个 Skills 文件                                    │
│ - 写入 skills-manifest.json                                     │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 阶段 8：哈希计算（hasher.js）                                   │
│ - 计算所有复制文件的 SHA-256 哈希                               │
│ - 用于 uds check 完整性验证                                     │
└─────────────────────────────┬───────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 阶段 9：Manifest 生成                                           │
│ - 写入 .standards/manifest.json                                 │
│ - 记录：版本、配置、文件路径、哈希、时间戳                      │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 生成文件结构

```
project-root/
├── .standards/                     # 标准目录
│   ├── manifest.json              # 跟踪清单
│   ├── anti-hallucination.md      # 核心规范（Markdown）
│   ├── anti-hallucination.ai.yaml # 核心规范（AI YAML）
│   ├── commit-message.md
│   ├── commit-message.ai.yaml
│   ├── ...（其他规范）
│   └── options/                   # 选项文件
│       ├── github-flow.md
│       ├── english.md
│       └── unit-testing.md
│
├── CLAUDE.md                      # Claude Code 集成
├── .cursorrules                   # Cursor 集成
├── .windsurfrules                 # Windsurf 集成
├── .clinerules                    # Cline 集成
├── AGENTS.md                      # Codex/OpenCode 集成
├── .github/
│   └── copilot-instructions.md    # Copilot 集成
│
└── .claude/                       # Claude Code Skills
    └── skills/
        ├── commit-standards/
        ├── code-review-assistant/
        └── ...（其他 skills）
```

### 6.3 CLI 源码结构

```
cli/
├── bin/
│   └── uds.js                    # 入口点
├── src/
│   ├── index.js                  # 主要导出
│   ├── commands/                 # 命令实现
│   │   ├── init.js              # init 命令（约 920 行）
│   │   ├── list.js              # list 命令
│   │   ├── check.js             # check 命令
│   │   ├── update.js            # update 命令
│   │   ├── configure.js         # configure 命令
│   │   └── skills.js            # skills 命令
│   ├── prompts/                  # 交互提示
│   │   ├── init.js              # init 提示（约 1007 行）
│   │   └── integrations.js      # 集成提示
│   └── utils/                    # 工具模块
│       ├── registry.js          # 标准注册表（207 行）
│       ├── copier.js            # 文件复制（143 行）
│       ├── github.js            # GitHub 下载（508 行）
│       ├── detector.js          # 项目检测（159 行）
│       ├── hasher.js            # 哈希计算（219 行）
│       ├── integration-generator.js  # 集成生成（2310 行）
│       └── reference-sync.js    # 引用同步（189 行）
├── standards-registry.json       # 标准注册表（约 1000 行）
└── package.json                  # 依赖包
```

---

## 7. 维护流程

### 7.1 同步检查脚本

| 脚本 | 用途 | 命令 |
|------|------|------|
| `check-translation-sync.sh` | 检查翻译同步 | `./scripts/check-translation-sync.sh [locale]` |
| `check-standards-sync.sh` | 检查 MD ↔ AI YAML 同步 | `./scripts/check-standards-sync.sh` |
| `check-version-sync.sh` | 检查版本一致性 | `./scripts/check-version-sync.sh` |
| `check-install-scripts-sync.sh` | 检查安装脚本同步 | `./scripts/check-install-scripts-sync.sh` |
| `pre-release.sh` | 预发布自动化 | `./scripts/pre-release.sh --version X.Y.Z` |

### 7.2 翻译同步机制

**检查流程：**
```bash
# 检查 zh-TW 翻译
./scripts/check-translation-sync.sh

# 检查 zh-CN 翻译
./scripts/check-translation-sync.sh zh-CN
```

**输出状态：**
- `[CURRENT]`（绿色）- 翻译已同步
- `[OUTDATED]`（红色）- 翻译版本过旧
- `[NO META]`（黄色）- 缺少 YAML Front Matter
- `[MISSING]`（红色）- 来源文件不存在

**更新流程：**
1. 执行同步检查
2. 打开过时的翻译文件
3. 更新内容
4. 更新 YAML Front Matter 中的 `source_version` 和 `translation_version`
5. 再次执行同步检查验证

### 7.3 标准同步机制

**检查流程：**
```bash
./scripts/check-standards-sync.sh
```

**第一阶段：core/ ↔ ai/standards/**
```
core/changelog-standards.md ↔ ai/standards/changelog.ai.yaml
core/commit-message-guide.md ↔ ai/standards/commit-message.ai.yaml
...
```

**第二阶段：options/ ↔ ai/options/**
```
options/git-workflow/github-flow.md ↔ ai/options/git-workflow/github-flow.ai.yaml
options/commit-message/english.md ↔ ai/options/commit-message/english.ai.yaml
...
```

### 7.4 版本同步机制

**版本文件位置（6 处）：**

| 文件 | 字段 | 更新频率 |
|------|------|----------|
| `cli/package.json` | `"version"` | 每次发布 |
| `.claude-plugin/plugin.json` | `"version"` | 每次发布 |
| `.claude-plugin/marketplace.json` | `"version"` | 每次发布 |
| `cli/standards-registry.json` | 根 `"version"` | 每次发布 |
| `cli/standards-registry.json` | `repositories.standards.version` | 每次发布 |
| `cli/standards-registry.json` | `repositories.skills.version` | 每次发布 |
| `README.md` | `**Version**:` | 仅稳定版本 |

**检查流程：**
```bash
./scripts/check-version-sync.sh
```

### 7.5 CLI 与斜线命令同步

#### 关系概述

UDS 有两个相关但独立的组件：

| 组件 | 类型 | 位置 | 用途 |
|------|------|------|------|
| UDS CLI | Node.js 程序 | `cli/src/` | 执行实际操作（`uds init`、`uds check` 等）|
| 斜线命令 | Markdown 文档 | `skills/commands/` | 指导 AI 如何使用 CLI |

**执行流程：**
```
用户在 Claude Code 输入 /update
    ↓
AI 读取 skills/commands/update.md
    ↓
AI 执行 CLI 命令（uds check、uds update）
    ↓
AI 根据 CLI 输出向用户报告结果
```

#### 同步要求

修改 CLI 功能时，对应的斜线命令文档**必须**同步更新：

| CLI 文件 | 斜线命令 |
|----------|----------|
| `cli/src/commands/init.js` | `skills/commands/init.md` |
| `cli/src/commands/check.js` | `skills/commands/check.md` |
| `cli/src/commands/update.js` | `skills/commands/update.md` |
| `cli/src/commands/configure.js` | `skills/commands/configure.md` |
| `cli/src/commands/list.js` | `skills/commands/list.md` |
| `cli/src/commands/skills.js` | `skills/commands/skills.md` |

#### 同步检查清单

添加 CLI 功能时：

1. [ ] 在 CLI 实现功能（`cli/src/commands/*.js` 或 `cli/src/utils/*.js`）
2. [ ] 添加单元测试（`cli/tests/`）
3. [ ] 更新斜线命令文档（`skills/commands/*.md`）
4. [ ] 如需要，更新翻译（`locales/zh-TW/skills/`、`locales/zh-CN/skills/`）
5. [ ] 运行验证：`cd cli && npm test && npm run lint`

#### 示例：添加 Marketplace Skills 版本检测

当 CLI `check.js` 更新以检测 Plugin Marketplace Skills 版本时：

```
步骤 1：在 cli/src/utils/github.js 添加 getMarketplaceSkillsInfo()
        - 读取 ~/.claude/plugins/installed_plugins.json
        - 返回 universal-dev-standards plugin 的版本信息
        ↓
步骤 2：更新 cli/src/commands/check.js 的 displaySkillsStatus()
        - 对 Marketplace 安装调用 getMarketplaceSkillsInfo()
        - 显示版本和最后更新日期
        ↓
步骤 3：在 cli/tests/utils/github.test.js 添加单元测试
        - 测试各种场景（文件存在、找不到、解析错误）
        ↓
步骤 4：更新 skills/commands/check.md
        - 在 Skills Status 区段记录新的版本输出
        ↓
步骤 5：更新 skills/commands/update.md
        - 添加说明如何检查 Skills 版本的章节
```

**关键洞察**：如果不更新斜线命令文档，AI 将不知道新的 CLI 功能，可能向用户提供不准确的信息。

---

## 8. 开发指南

### 8.1 新增核心规范

**完整流程（10 步骤）：**

```
步骤 1：创建 core/new-standard.md
        ↓
步骤 2：创建 ai/standards/new-standard.ai.yaml
        ↓
步骤 3：创建 options/new-standard/*.md（如适用）
        ↓
步骤 4：创建 ai/options/new-standard/*.ai.yaml（如适用）
        ↓
步骤 5：创建 skills/new-skill/（如适用）
        ↓
步骤 6：创建 locales/zh-TW/core/new-standard.md
        ↓
步骤 7：创建 locales/zh-CN/core/new-standard.md
        ↓
步骤 8：更新 cli/standards-registry.json
        ↓
步骤 9：更新 CHANGELOG.md
        ↓
步骤 10：执行所有同步检查脚本
```

**详细步骤：**

1. **创建核心规范**
   ```bash
   # 创建 markdown 文件
   touch core/new-standard.md
   # 遵循标准模板结构
   ```

2. **创建 AI 优化版本**
   ```bash
   touch ai/standards/new-standard.ai.yaml
   # 使用简洁的 YAML 格式
   ```

3. **创建选项（如适用）**
   ```bash
   mkdir -p options/new-standard
   touch options/new-standard/option-1.md
   touch options/new-standard/option-2.md

   mkdir -p ai/options/new-standard
   touch ai/options/new-standard/option-1.ai.yaml
   touch ai/options/new-standard/option-2.ai.yaml
   ```

4. **创建 Skill（如适用）**
   ```bash
   mkdir -p skills/new-standard-skill
   touch skills/new-standard-skill/SKILL.md
   touch skills/new-standard-skill/guide.md
   ```

5. **创建翻译**
   ```bash
   touch locales/zh-TW/core/new-standard.md
   touch locales/zh-CN/core/new-standard.md
   # 添加含来源跟踪的 YAML Front Matter
   ```

6. **更新注册表**
   ```json
   // 在 cli/standards-registry.json 中
   {
     "standards": [
       {
         "id": "new-standard",
         "name": "New Standard Name",
         "level": 2,
         "category": "reference",
         "source": {
           "ai": "ai/standards/new-standard.ai.yaml",
           "human": "core/new-standard.md"
         }
       }
     ]
   }
   ```

7. **验证**
   ```bash
   ./scripts/check-standards-sync.sh
   ./scripts/check-translation-sync.sh
   ./scripts/check-translation-sync.sh zh-CN
   cd cli && npm test
   ```

### 8.2 新增 Skill

**完整流程（6 步骤）：**

```
步骤 1：创建 skills/new-skill/ 目录
        ↓
步骤 2：创建含 YAML 前置的 SKILL.md
        ↓
步骤 3：创建辅助指南文件
        ↓
步骤 4：在 locales/ 中创建翻译
        ↓
步骤 5：更新文档（README.md 等）
        ↓
步骤 6：执行验证脚本
```

### 8.3 新增 AI 工具集成

**完整流程（14 步骤）：**

```
阶段 1：研究与规划（3 步骤）
步骤 1：研究目标工具的指令格式与功能
步骤 2：识别相较于 Claude Code 的限制
步骤 3：创建 Skills 对照计划（哪些 Claude Code 功能要迁移）
        ↓
阶段 2：核心文件 - 4 文件模式（4 步骤）
步骤 4：创建 integrations/[tool-name]/ 目录
步骤 5：创建 README.md（安装指南、限制说明、功能比较）
步骤 6：创建 [tool]-instructions.md（主要 AI 指令）
步骤 7：创建 CHAT-REFERENCE.md（适用于无斜线命令的工具）
步骤 8：创建 skills-mapping.md（Claude Code → 工具功能对照）
        ↓
阶段 3：翻译（2 步骤）
步骤 9：创建 locales/zh-TW/integrations/[tool-name]/（4 个文件）
步骤 10：创建 locales/zh-CN/integrations/[tool-name]/（4 个文件）
        ↓
阶段 4：集成更新（3 步骤）
步骤 11：更新 integration-generator.js（如需 CLI 动态生成）
步骤 12：更新 skills/[tool]/ 精简版（如存在）
步骤 13：更新相关文档（README.md 等）
        ↓
阶段 5：验证（1 步骤）
步骤 14：执行所有验证脚本
```

#### 4 文件模式（必要结构）

完整的 AI 工具集成需创建这 4 个文件：

| 文件 | 用途 | 必要 |
|------|------|------|
| `README.md` | 安装指南、快速开始、限制说明、功能比较 | ✅ 必要 |
| `[tool]-instructions.md` | 工具的主要 AI 指令 | ✅ 必要 |
| `CHAT-REFERENCE.md` | Chat 提示模板（适用于无斜线命令的工具） | ⚠️ 视情况 |
| `skills-mapping.md` | Claude Code → 工具功能对照 | ✅ 必要 |

**示例：**
```
integrations/github-copilot/
├── README.md                    # 集成概述
├── copilot-instructions.md      # 主要指令
├── COPILOT-CHAT-REFERENCE.md    # Chat 提示模板
└── skills-mapping.md            # Skills 迁移指南
```

#### README.md 模板

```markdown
# [工具名称] 集成

## 概述
[简要说明]

## 快速开始

### 方式 1：从仓库复制
### 方式 2：使用 curl 下载
### 方式 3：使用 UDS CLI

## 配置方式
[IDE 特定设置：VS Code、JetBrains 等]

## 限制说明
[与 Claude Code 和其他工具的功能比较表]

## 包含的规范
[集成中包含的规范表格]

## 验证集成
[如何验证集成是否正常工作]

## 相关规范
## 版本历史
## 许可
```

#### Skills 对照方法论

将 Claude Code 功能迁移到其他工具时：

| Claude Code 功能 | 迁移策略 |
|------------------|----------|
| Skills（18 个） | → 指令文件中的专用章节 |
| 斜线命令（16 个） | → CHAT-REFERENCE.md 中的 Chat 提示模板 |
| MCP 支持 | → 记录为限制，建议替代方案 |
| 全局配置 | → 记录为限制 |
| 自动触发关键字 | → 建议使用 IDE 代码片段/快捷键作为替代 |
| 方法论跟踪 | → 记录为限制，建议手动跟踪 |

#### 翻译要求

每个集成需要 8 个翻译文件（每种语言 4 个）：

**目录：**
- `locales/zh-TW/integrations/[tool-name]/`（繁体中文）
- `locales/zh-CN/integrations/[tool-name]/`（简体中文）

**YAML 前置模板：**
```yaml
---
source: ../../../docs/OPERATION-WORKFLOW.md
source_version: X.Y.Z
translation_version: X.Y.Z
last_synced: YYYY-MM-DD
status: current
---
```

#### 验证检查清单

完成集成后，验证：

```bash
# 翻译同步检查
./scripts/check-translation-sync.sh
./scripts/check-translation-sync.sh zh-CN

# 标准一致性检查
./scripts/check-standards-sync.sh

# CLI 测试（如修改了 integration-generator.js）
cd cli && npm test && npm run lint

# 完整预发布检查
./scripts/pre-release-check.sh
```

#### 功能比较表模板

在 README.md 中包含此表格：

| 功能 | [新工具] | Claude Code | 其他工具 |
|------|----------|-------------|----------|
| 项目指令 | ✅/❌ | ✅ | ... |
| 全局配置 | ✅/❌ | ✅ | ... |
| 斜线命令 | ✅/❌ | ✅（18 个 skills） | ... |
| MCP 支持 | ✅/❌ | ✅ | ... |
| 自定义 skills | ✅/❌ | ✅ | ... |
| 多文件上下文 | ✅/❌ | ✅ | ... |

---

## 9. 发布流程

### 9.1 预发布检查清单

**任何发布前：**
- [ ] 所有测试通过（`npm test`）
- [ ] Linting 通过（`npm run lint`）
- [ ] 版本同步检查通过（`./scripts/check-version-sync.sh`）
- [ ] CHANGELOG.md 已更新
- [ ] Git 工作目录干净

**版本文件检查清单（6 个文件）：**
- [ ] `cli/package.json` - `"version": "X.Y.Z"`
- [ ] `.claude-plugin/plugin.json` - `"version": "X.Y.Z"`
- [ ] `.claude-plugin/marketplace.json` - `"version": "X.Y.Z"`
- [ ] `cli/standards-registry.json` - 3 处位置
- [ ] `README.md` - `**Version**:`（仅稳定版本）

### 9.2 版本类型与 npm Tags

| 类型 | 版本格式 | npm Tag | 用途 |
|------|----------|---------|------|
| 稳定版 | `3.3.0` | `@latest` | 正式发布 |
| Beta | `3.3.0-beta.1` | `@beta` | 测试新功能 |
| Alpha | `3.3.0-alpha.1` | `@alpha` | 早期内部测试 |
| RC | `3.3.0-rc.1` | `@rc` | 最终预发布测试 |

### 9.3 完整发布工作流

```
步骤 1：预发布准备
        ./scripts/pre-release.sh --version X.Y.Z
        ↓
步骤 2：更新 CHANGELOG.md
        （遵循 Keep a Changelog 格式）
        ↓
步骤 3：提交变更
        git add -A
        git commit -m "chore(release): prepare vX.Y.Z"
        ↓
步骤 4：创建 Git 标签
        git tag vX.Y.Z
        git push origin main --tags
        ↓
步骤 5：创建 GitHub Release
        （在 GitHub UI 中手动操作）
        ↓
步骤 6：GitHub Actions 自动发布
        - 检测版本类型（stable/beta/alpha/rc）
        - npm publish --tag [latest/beta/alpha/rc]
        ↓
步骤 7：验证发布
        npm view universal-dev-standards dist-tags
```

### 9.4 GitHub Actions 工作流

**CI 工作流（`.github/workflows/ci.yml`）：**
- 触发条件：Push 到 main、PR 到 main
- 工作：Linting、测试（多矩阵）、翻译同步检查

**发布工作流（`.github/workflows/publish.yml`）：**
- 触发条件：GitHub Release 发布
- 自动从 package.json 检测版本类型
- 使用适当的 tag 发布到 npm

---

## 10. 文件路径参考

### 10.1 核心目录

| 目录 | 说明 | 数量 |
|------|------|------|
| `core/` | 人类可读核心规范 | 16 文件 |
| `ai/standards/` | AI 优化规范 | 16 文件 |
| `ai/options/` | AI 优化选项 | 36 文件 |
| `options/` | 人类可读选项 | 36 文件 |
| `skills/` | Claude Code skills | 15 目录 |
| `integrations/` | AI 工具集成模板 | 10 目录 |
| `locales/zh-TW/` | 繁体中文翻译 | ~129 文件 |
| `locales/zh-CN/` | 简体中文翻译 | 部分 |

### 10.2 维护脚本

| 脚本 | 路径 | 用途 |
|------|------|------|
| 翻译同步 | `scripts/check-translation-sync.sh` | 检查翻译同步 |
| 标准同步 | `scripts/check-standards-sync.sh` | 检查 MD ↔ YAML 同步 |
| 版本同步 | `scripts/check-version-sync.sh` | 检查版本一致性 |
| 安装脚本同步 | `scripts/check-install-scripts-sync.sh` | 检查安装脚本 |
| 预发布 | `scripts/pre-release.sh` | 预发布自动化 |

### 10.3 配置文件

| 文件 | 用途 |
|------|------|
| `cli/package.json` | 主版本来源、依赖包 |
| `cli/standards-registry.json` | 标准注册表、版本信息 |
| `.claude-plugin/plugin.json` | Plugin 配置 |
| `.claude-plugin/marketplace.json` | Marketplace 配置 |
| `cli/.eslintrc.json` | ESLint 配置 |
| `cli/vitest.config.js` | 测试配置 |

### 10.4 GitHub Actions

| 文件 | 用途 |
|------|------|
| `.github/workflows/ci.yml` | CI 工作流（测试、linting） |
| `.github/workflows/publish.yml` | npm 发布工作流 |

---

## 附录：快速参考命令

### 日常维护

```bash
# 执行所有同步检查
./scripts/check-standards-sync.sh
./scripts/check-translation-sync.sh
./scripts/check-version-sync.sh

# 执行测试和 linting
cd cli && npm test && npm run lint
```

### 预发布

```bash
# 自动化预发布准备
./scripts/pre-release.sh --version 3.4.0

# 或使用选项
./scripts/pre-release.sh --version 3.4.0-beta.1 --skip-translations
```

### 发布

```bash
# 提交并标记
git add -A
git commit -m "chore(release): prepare v3.4.0"
git tag v3.4.0
git push origin main --tags

# 在 GitHub Release 后验证
npm view universal-dev-standards dist-tags
```

---

## 许可

本文档采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。

**来源**：[universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
