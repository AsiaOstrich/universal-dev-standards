---
source: ../../../skills/_shared/README.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-30
status: current
---

# 共用資源

用於從核心標準生成 AI 工具專用規則的共用模板和工具。

## 目的

此目錄包含：
- **模板**：跨不同 AI 工具使用的通用模式
- **工具**：生成工具專用配置的腳本
- **對應**：每個 AI 助手的標準對規則對應

## 核心標準對應

| 核心標準 | 技能概念 | 說明 |
|----------|----------|------|
| `anti-hallucination.md` | AI 協作 | 證據導向回應、確定性標籤 |
| `commit-message-guide.md` | 提交標準 | Conventional Commits 格式 |
| `code-review-checklist.md` | 程式碼審查 | 審查檢查表和模式 |
| `git-workflow.md` | Git 工作流程 | 分支策略 |
| `testing-standards.md` | 測試指南 | 測試金字塔、覆蓋率 |
| `versioning.md` | 發布標準 | 語意化版本 |
| `documentation-structure.md` | 文件 | README 模板、結構 |

## AI 工具相容性矩陣

| 功能 | Claude Code | Cursor | Windsurf | Cline | Copilot |
|------|-------------|--------|----------|-------|---------|
| 技能/規則 | ✅ SKILL.md | ✅ .cursorrules | ✅ .windsurfrules | ✅ .clinerules | ✅ instructions.md |
| 自動觸發 | ✅ | ❌ | ❌ | ❌ | ❌ |
| 專案層級 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 全域層級 | ✅ | ✅ | ✅ | ✅ | ❌ |
| Notepads | ❌ | ✅ | ❌ | ❌ | ❌ |

## 使用方式

**macOS / Linux:**
```bash
# 為特定工具生成規則
./generate.sh cursor

# 為所有工具生成規則
./generate.sh all
```

**Windows PowerShell:**
```powershell
# 為特定工具生成規則
.\generate.ps1 cursor

# 為所有工具生成規則
.\generate.ps1 all
```

## 貢獻

新增核心標準時：
1. 在上方對應表新增條目
2. 在 `templates/` 建立模板
3. 更新生成腳本
4. 用每個支援的 AI 工具測試
