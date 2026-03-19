---
source: ../../../../skills/commands/config.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-19
---

---
description: [UDS] Configure project development standards
allowed-tools: Read, Bash(uds config:*), Bash(uds configure:*), Bash(uds check:*)
argument-hint: "[type] [--ai-tool <tool>]"
---

# 配置标准

配置当前专案的 Universal Development Standards 设定。

## 互动模式（默认）

当不指定类型时，使用 AskUserQuestion 询问要配置什么。

### 步骤 0：显示当前状态

首先，执行 `uds check --summary` 显示当前安装状态。

```bash
uds check --summary
```

这帮助用户在修改前了解当前的配置。

### 步骤 1：询问配置类型

使用 AskUserQuestion 提供以下选项：

| 类别 | 选项 |
|------|------|
| **基本选项** | Format, Git Workflow, Merge Strategy, Commit Language, Test Levels |
| **AI 工具** | 添加或移除 AI 工具集成 |
| **Skills** | 管理 Skills 安装（安装/更新/重新安装已拒绝的） |
| **Commands** | 管理 Commands 安装 |
| **进阶** | Adoption Level, Content Mode |
| **全部** | 配置所有选项 |

### 步骤 2：根据选择执行

**如果选择 AI 工具：**
```bash
uds configure --type ai_tools
```

**如果选择 Skills：**
```bash
uds configure --type skills
```

**如果选择 Commands：**
```bash
uds configure --type commands
```

**如果选择 Adoption Level：**
```bash
uds configure --type level
```

**如果选择 Content Mode：**
```bash
uds configure --type content_mode
```

## 快速模式

指定类型时，跳过互动式问题：

```bash
/config ai_tools      # Directly configure AI tools
/config skills        # Directly manage Skills
/config commands      # Directly manage Commands
/config level         # Directly configure adoption level
/config content_mode  # Directly configure content mode
```

### 非互动式安装

使用 `--ai-tool` 选项为特定工具安装 Skills/Commands，无需提示：

```bash
# Install Skills for specific tool (project level, default)
uds configure --type skills --ai-tool opencode

# Install Skills for specific tool (user level)
uds configure --type skills --ai-tool opencode --skills-location user

# Install Skills for specific tool (project level, explicit)
uds configure --type skills --ai-tool claude-code --skills-location project

# Install Commands for specific tool
uds configure --type commands --ai-tool copilot
```

**Skills 位置选项：**

| 选项 | 路径 | 说明 |
|------|------|------|
| `project` | `.claude/skills/`, `.opencode/skill/` | 专案级别（默认） |
| `user` | `~/.claude/skills/`, `~/.opencode/skill/` | 跨所有专案共享 |

## 配置类型

| 类型 | 说明 |
|------|------|
| `ai_tools` | AI 工具集成 |
| `skills` | Skills 安装管理 |
| `commands` | Commands 安装管理 |
| `level` | 采用等级 (1/2/3) |
| `content_mode` | 集成文件内容模式 |
| `format` | AI/人类文档格式 |
| `workflow` | Git 工作流程策略 |
| `merge_strategy` | 合并策略 |
| `commit_language` | 提交消息语言 |
| `test_levels` | 测试层级 |
| `methodology` | 开发方法论（实验性，需要 -E） |
| `all` | 配置所有选项 |

## Skills 配置

选择 `skills` 类型时，CLI 显示：

1. **当前状态** - 显示每个 AI 工具已安装的 Skills
2. **已拒绝状态** - 显示用户之前拒绝 Skills 的工具
3. **操作菜单**：
   - 安装/更新 Skills
   - 重新安装已拒绝的 Skills
   - 仅查看状态

```
Current Skills status:
  ✓ Claude Code:
    - User: v3.5.1
  ○ OpenCode: Not installed
  ⊘ Copilot: Previously declined

? What would you like to do?
❯ Install/Update Skills
  Reinstall declined Skills
  View status only
  Cancel
```

## Commands 配置

选择 `commands` 类型时，CLI 显示：

1. **当前状态** - 显示每个支持工具已安装的 Commands
2. **已拒绝状态** - 显示用户之前拒绝 Commands 的工具
3. **操作菜单** 类似 Skills

支持 Commands 的工具：
- OpenCode (`.opencode/commands/`)
- GitHub Copilot (`.github/commands/`)
- Gemini CLI (`.gemini/commands/`)
- Roo Code (`.roo-code/commands/`)

## 内容模式选项

| 模式 | 说明 |
|------|------|
| `standard` | 摘要 + 任务映射，AI 知道何时读取哪个标准（推荐） |
| `full` | 在集成文件中完整嵌入所有标准 |
| `minimal` | 仅嵌入核心规则 |

## 配置变更的影响

| 配置 | 影响 |
|------|------|
| AI 工具（添加） | 生成新的集成文件 |
| AI 工具（移除） | 删除集成文件 |
| Skills | 安装/更新 Skills 到配置路径 |
| Commands | 安装/更新 Commands 到配置路径 |
| 等级 | 更新标准，重新生成集成 |
| 内容模式 | 重新生成所有集成文件 |

## 已拒绝的功能

CLI 在 `manifest.declinedFeatures` 中追踪已拒绝的 Skills/Commands：

- 之前拒绝的工具不会在 `/update` 提示中出现
- 使用 `/config skills` 或 `/config commands` 重新安装已拒绝的功能
- 从菜单中选择"重新安装已拒绝的 Skills/Commands"

## 选项参考

| 选项 | 说明 |
|------|------|
| `--type <type>` | 配置类型 |
| `--ai-tool <tool>` | 特定 AI 工具（非互动式） |
| `--skills-location <loc>` | Skills 安装位置: project, user |
| `--yes`, `-y` | 跳过确认提示 |
| `-E`, `--experimental` | 启用实验性功能 |

## 参考

- CLI 文档: `uds configure --help`
- 初始化命令: [/init](./init.md)
- 检查命令: [/check](./check.md)
- 更新命令: [/update](./update.md)
