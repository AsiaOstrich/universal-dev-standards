---
source: ../../../skills/README.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-07
status: current
---

# 技能 - AI 编程助手规则

此目录包含各种 AI 编程助手的技能/规则实作，皆衍生自本仓库的核心标准。

## 目录结构

```
skills/
├── _shared/           # 共用模板和生成工具
├── claude-code/       # Claude Code 技能（SKILL.md 格式）
├── cursor/            # Cursor 规则（.cursorrules、Notepads）
├── windsurf/          # Windsurf 规则（.windsurfrules）
├── cline/             # Cline 规则（.clinerules）
└── copilot/           # GitHub Copilot（copilot-instructions.md）
```

## 快速开始

### Claude Code

**推荐：Plugin Marketplace**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

**替代方案：手动复制（macOS / Linux）**
```bash
mkdir -p ~/.claude/skills
cp -r skills/claude-code/commit-standards ~/.claude/skills/
```

**替代方案：手动安装（Windows PowerShell）**
```powershell
# 复制特定技能
Copy-Item -Recurse skills\claude-code\commit-standards $env:USERPROFILE\.claude\skills\
```

### Cursor

**macOS / Linux:**
```bash
# 复制规则到您的专案
cp skills/cursor/.cursorrules .cursorrules
```

**Windows PowerShell:**
```powershell
Copy-Item skills\cursor\.cursorrules .cursorrules
```

### Windsurf

**macOS / Linux:**
```bash
cp skills/windsurf/.windsurfrules .windsurfrules
```

**Windows PowerShell:**
```powershell
Copy-Item skills\windsurf\.windsurfrules .windsurfrules
```

### Cline

**macOS / Linux:**
```bash
cp skills/cline/.clinerules .clinerules
```

**Windows PowerShell:**
```powershell
Copy-Item skills\cline\.clinerules .clinerules
```

### GitHub Copilot

**macOS / Linux:**
```bash
mkdir -p .github
cp skills/copilot/copilot-instructions.md .github/copilot-instructions.md
```

**Windows PowerShell:**
```powershell
New-Item -ItemType Directory -Force -Path .github
Copy-Item skills\copilot\copilot-instructions.md .github\copilot-instructions.md
```

## 可用技能

| 技能 | 说明 | Claude Code | Cursor | Windsurf | Cline | Copilot |
|------|------|:-----------:|:------:|:--------:|:-----:|:-------:|
| AI 协作 | 防止幻觉 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 变更日志指南 | 变更日志撰写 | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| 程序码审查 | 审查检查表 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 提交标准 | Conventional Commits | ✅ | ✅ | ✅ | ✅ | ✅ |
| 文件 | README 模板 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 错误码指南 | 错误码标准 | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| Git 工作流程 | 分支策略 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 日志指南 | 日志最佳实践 | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| 专案结构 | 目录规范 | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| 发布标准 | 语意化版本 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 需求 | 使用者故事指引 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 规格驱动开发 | SDD 方法论 | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| 测试覆盖率 | 覆盖率分析 | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| 测试指南 | 测试最佳实践 | ✅ | ✅ | ✅ | ✅ | ✅ |

图例：✅ 完成 | 🚧 计划中 | ❌ 不适用

## 与核心标准的关系

这些技能是核心标准的**互动式实作**：

```
core/anti-hallucination.md
    ↓ 转换为
skills/claude-code/ai-collaboration-standards/SKILL.md
skills/cursor/.cursorrules（AI 区段）
```

**重要**：使用技能或复制核心文件——同一标准**不要两者并用**。

## 贡献

请参阅 [CONTRIBUTING.md](../CONTRIBUTING.md) 了解新增技能或支援其他 AI 工具的指南。
