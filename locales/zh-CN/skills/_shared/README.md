---
source: ../../../../skills/_shared/README.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 共用资源

用于从核心标准生成 AI 工具专用规则的共用模板和工具。

## 目的

此目录包含：
- **模板**：跨不同 AI 工具使用的通用模式
- **工具**：生成工具专用配置的脚本
- **对应**：每个 AI 助手的标准对规则对应

## 核心标准对应

| 核心标准 | 技能概念 | 说明 |
|----------|----------|------|
| `anti-hallucination.md` | AI 协作 | 证据导向回应、确定性标签 |
| `commit-message-guide.md` | 提交标准 | Conventional Commits 格式 |
| `code-review-checklist.md` | 程序码审查 | 审查检查表和模式 |
| `git-workflow.md` | Git 工作流程 | 分支策略 |
| `testing-standards.md` | 测试指南 | 测试金字塔、覆盖率 |
| `versioning.md` | 发布标准 | 语意化版本 |
| `documentation-structure.md` | 文件 | README 模板、结构 |

## AI 工具相容性矩阵

| 功能 | Claude Code | Cursor | Windsurf | Cline | Copilot |
|------|-------------|--------|----------|-------|---------|
| 技能/规则 | ✅ SKILL.md | ✅ .cursorrules | ✅ .windsurfrules | ✅ .clinerules | ✅ instructions.md |
| 自动触发 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 专案层级 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 全域层级 | ✅ | ✅ | ✅ | ✅ | ❌ |
| Notepads | ❌ | ✅ | ❌ | ❌ | ❌ |

## 使用方式

**macOS / Linux:**
```bash
# 为特定工具生成规则
./generate.sh cursor

# 为所有工具生成规则
./generate.sh all
```

**Windows PowerShell:**
```powershell
# 为特定工具生成规则
.\generate.ps1 cursor

# 为所有工具生成规则
.\generate.ps1 all
```

## 贡献

新增核心标准时：
1. 在上方对应表新增条目
2. 在 `templates/` 建立模板
3. 更新生成脚本
4. 用每个支援的 AI 工具测试
