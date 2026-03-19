---
source: ../../../../skills/commands/init.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
status: current
---

---
description: [UDS] Initialize development standards in current project
allowed-tools: Read, Bash(uds init:*), Bash(npx:*)
argument-hint: "[--level N | --yes]"
---

# 初始化标准

在当前专案初始化 Universal Development Standards。

## 互动模式（默认）

当不带 `--yes` 执行时，使用 AskUserQuestion 询问用户偏好后再执行。

### 步骤 1：检测专案

首先，CLI 会自动检测专案特性：
- 语言（JavaScript、TypeScript、Python、Go 等）
- 框架（React、Vue、Express 等）
- AI 工具（Claude Code、Cursor、Copilot 等）

### 步骤 2：询问 AI 工具选择

使用 AskUserQuestion（多选）询问要配置哪些 AI 工具：

| AI Tool | Integration File | Skills Support | Commands Support |
|---------|-----------------|----------------|------------------|
| **Claude Code** | `CLAUDE.md` | ✅ | ❌ |
| **Cursor** | `.cursorrules` | ✅ | ❌ |
| **Windsurf** | `.windsurfrules` | ✅ | ❌ |
| **Cline** | `.clinerules` | ✅ | ❌ |
| **GitHub Copilot** | `.github/copilot-instructions.md` | ✅ | ✅ |
| **OpenCode** | `AGENTS.md` | ✅ | ✅ |
| **Gemini CLI** | `GEMINI.md` | ✅ | ✅ |
| **Codex** | `AGENTS.md` | ✅ | ❌ |
| **Antigravity** | `INSTRUCTIONS.md` | ✅ | ❌ |

预选环境中检测到的工具。注意：Codex 和 OpenCode 共用 `AGENTS.md`。

### 步骤 3：询问 Skills 安装

对于支持 Skills 的工具，根据工具数量使用**智能分组**策略。

**重要：AskUserQuestion 最多只能有 4 个选项。** 使用智能分组来处理。

#### 策略 A：1-2 个工具 → 合并询问

**范例（仅 Claude Code）：**
```
Question: "Skills 要安装到哪里？"
Options:
1. Plugin Marketplace（建议）- 自动更新，易于管理
2. User Level (~/.claude/skills/) - 所有专案共用
3. Project Level (.claude/skills/) - 仅此专案
4. 跳过 - 不安装 Skills
```

**范例（Claude Code + OpenCode）：**
```
Question: "Skills 要安装到哪里？"
Options:
1. Plugin Marketplace + OpenCode Project Level（建议）
2. 全部 User Level - 所有专案共用
3. 全部 Project Level - 仅此专案
4. 跳过 - 不安装 Skills
```

#### 策略 B：3+ 个工具 → 两阶段询问

**阶段 1：询问统一或个别**
```
Question: "您选择了 3 个以上的 AI 工具，Skills 安装层级要如何设定？"
Options:
1. 统一层级（建议）- 所有工具使用相同层级
2. 个别设定 - 为每个工具分别选择层级
3. 跳过 - 不安装 Skills
```

**阶段 2a：如果统一 → 询问一次层级**
```
Question: "所有 Skills 要安装到哪个层级？"
Options:
1. User Level - 所有专案共用
2. Project Level（建议）- 仅此专案
```
注意：Claude Code 默认使用 Plugin Marketplace；仅其他工具使用所选层级。

**阶段 2b：如果个别 → 逐工具询问**
为每个工具分别询问（参见策略 A 范例）。

### 步骤 4：询问 Commands 安装

对于支持 Commands 的工具（OpenCode、Copilot、Gemini CLI），使用**智能分组**策略。

**重要：AskUserQuestion 最多只能有 4 个选项。** 使用智能分组来处理。

#### 策略 A：1-2 个工具 → 合并询问

**范例（仅 OpenCode）：**
```
Question: "Commands 要安装到哪里？"
Options:
1. User Level (~/.config/opencode/command/) - 所有专案共用
2. Project Level (.opencode/command/) - 仅此专案（建议）
3. 跳过 - 使用 Skills 即可
```

**范例（OpenCode + Copilot）：**
```
Question: "Commands 要安装到哪里？"
Options:
1. 全部 User Level - 所有专案共用
2. 全部 Project Level（建议）- 仅此专案
3. 跳过 - 使用 Skills 即可
```

#### 策略 B：3+ 个工具 → 两阶段询问

**阶段 1：询问统一或个别**
```
Question: "您选择了多个支持 Commands 的 AI 工具，安装层级要如何设定？"
Options:
1. 统一层级（建议）- 所有工具使用相同层级
2. 个别设定 - 为每个工具分别选择层级
3. 跳过 - 不安装 Commands
```

**阶段 2a：如果统一 → 询问一次层级**
```
Question: "所有 Commands 要安装到哪个层级？"
Options:
1. User Level - 所有专案共用
2. Project Level（建议）- 仅此专案
```

**阶段 2b：如果个别 → 逐工具询问**
为每个工具分别询问（参见策略 A 范例）。

### 步骤 5：询问标准范围

使用 AskUserQuestion（仅在安装 Skills 时显示）：

| 选项 | 说明 |
|------|------|
| **精简（建议）** | 仅参考文档，Skills 提供实时任务指导 |
| **完整** | 安装所有标准文件，独立于 Skills |

### 步骤 6：询问采用层级

使用 AskUserQuestion：

| 选项 | 说明 |
|------|------|
| **Level 1：入门** | 6 个核心标准：commit、反幻觉、checkin 等 |
| **Level 2：专业（建议）** | 增加测试、Git 工作流、错误处理 — 共 12 个 |
| **Level 3：完整** | 包含版本管理、日志、SDD — 全部 16 个标准 |

### 步骤 7：询问标准格式

使用 AskUserQuestion：

| 选项 | 说明 |
|------|------|
| **AI（精简）** | 为 AI 消费优化（建议） |
| **人类（详细）** | 人类可读格式 |
| **两者** | 同时生成两种格式 |

### 步骤 8：询问标准选项

根据采用层级，询问：
- **Git 工作流**: github-flow、gitflow、trunk-based
- **合并策略**: squash、merge、rebase
- **提交语言**: english、traditional-chinese、bilingual
- **测试层级**: unit-testing、integration-testing、e2e-testing

### 步骤 9：询问语言扩展

如果检测到语言，询问是否包含特定语言标准：
- C# Style Guide
- PHP Style Guide
- 等

### 步骤 10：询问框架扩展

如果检测到框架，询问是否包含特定框架模式：
- Fat-Free Patterns
- 等

### 步骤 11：询问地区设定

使用 AskUserQuestion：

| 选项 | 说明 |
|------|------|
| **English（默认）** | 英文文档 |
| **Traditional Chinese** | 繁体中文文档 |

### 步骤 12：询问内容模式

使用 AskUserQuestion 设定整合文件内容：

| 选项 | 说明 |
|------|------|
| **标准（建议）** | 摘要 + 任务映射，AI 知道何时读取哪个标准 |
| **完整嵌入** | 嵌入所有规则，AI 可立即使用但文件较大 |
| **最简** | 仅文件引用，搭配 Skills 使用最佳 |

### 步骤 13：确认并执行

显示配置摘要并在执行前确认。

确认后，CLI 一次性执行所有安装：
- 将标准复制到 `.standards/`
- 生成整合文件
- 安装 Skills（如果已选择）
- 安装 Commands（如果已选择）
- 创建 `manifest.json`

## 快速模式

当带有 `--yes` 或特定选项执行时，跳过互动询问：

```bash
/init --yes                    # 使用所有默认值
/init --level 2 --yes          # 指定层级并使用默认值
/init --skills-location none   # 不安装 Skills
/init --content-mode standard  # 指定内容模式
```

## 选项参考

| Option | Description | 说明 |
|--------|-------------|------|
| `--yes`, `-y` | Non-interactive mode | 非互动模式 |
| `--level N` | Adoption level (1, 2, or 3) | 采用层级 |
| `--skills-location` | marketplace, user, project, or none | Skills 位置 |
| `--content-mode` | standard, full, or minimal | 内容模式 |
| `--format` | ai, human, or both | 格式 |
| `-E`, `--experimental` | Enable experimental features (methodology) | 启用实验性功能 |

详见 `uds init --help` 获取所有选项。

## 采用层级

| Level | Name | Standards Count | Description | 说明 |
|-------|------|-----------------|-------------|------|
| 1 | Starter | 6 | Core standards for small projects | 核心标准（小型专案） |
| 2 | Professional | 12 | Adds testing, Git workflow, error handling | 团队专业质量标准 |
| 3 | Complete | 16 | All 16 standards including SDD | 完整的 16 项标准 |

## 安装内容

- `.standards/` 目录包含核心标准
- 整合文件（`CLAUDE.md`、`.cursorrules` 等）
- Skills（通过 Plugin Marketplace 或本地安装）
- Commands（针对支持的 AI 工具）
- `manifest.json` 用于追踪安装

## 参考

- CLI 文档: `uds init --help`
- 采用指南: [ADOPTION-GUIDE.md](../../adoption/ADOPTION-GUIDE.md)
- 检查命令: [/check](./check.md)
- 更新命令: [/update](./update.md)
