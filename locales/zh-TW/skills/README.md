---
source: ../../../skills/README.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-01-07
status: current
---

# 技能 - AI 編程助手規則

此目錄包含各種 AI 編程助手的技能/規則實作，皆衍生自本倉庫的核心標準。

## 目錄結構

```
skills/
├── _shared/           # 共用模板和生成工具
├── claude-code/       # Claude Code 技能（SKILL.md 格式）
├── cursor/            # Cursor 規則（.cursorrules、Notepads）
├── windsurf/          # Windsurf 規則（.windsurfrules）
├── cline/             # Cline 規則（.clinerules）
└── copilot/           # GitHub Copilot（copilot-instructions.md）
```

## 快速開始

### Claude Code

```bash
# 全域安裝所有技能
cd skills/claude-code
./install.sh

# 或複製特定技能
cp -r skills/claude-code/commit-standards ~/.claude/skills/
```

### Cursor

```bash
# 複製規則到您的專案
cp skills/cursor/.cursorrules .cursorrules
```

### Windsurf

```bash
cp skills/windsurf/.windsurfrules .windsurfrules
```

### Cline

```bash
cp skills/cline/.clinerules .clinerules
```

### GitHub Copilot

```bash
mkdir -p .github
cp skills/copilot/copilot-instructions.md .github/copilot-instructions.md
```

## 可用技能

| 技能 | 說明 | Claude Code | Cursor | Windsurf | Cline | Copilot |
|------|------|:-----------:|:------:|:--------:|:-----:|:-------:|
| AI 協作 | 防止幻覺 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 變更日誌指南 | 變更日誌撰寫 | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| 程式碼審查 | 審查檢查表 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 提交標準 | Conventional Commits | ✅ | ✅ | ✅ | ✅ | ✅ |
| 文件 | README 模板 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 錯誤碼指南 | 錯誤碼標準 | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| Git 工作流程 | 分支策略 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 日誌指南 | 日誌最佳實踐 | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| 專案結構 | 目錄規範 | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| 發布標準 | 語意化版本 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 需求 | 使用者故事指引 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 規格驅動開發 | SDD 方法論 | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| 測試覆蓋率 | 覆蓋率分析 | ✅ | 🚧 | 🚧 | 🚧 | 🚧 |
| 測試指南 | 測試最佳實踐 | ✅ | ✅ | ✅ | ✅ | ✅ |

圖例：✅ 完成 | 🚧 計劃中 | ❌ 不適用

## 與核心標準的關係

這些技能是核心標準的**互動式實作**：

```
core/anti-hallucination.md
    ↓ 轉換為
skills/claude-code/ai-collaboration-standards/SKILL.md
skills/cursor/.cursorrules（AI 區段）
```

**重要**：使用技能或複製核心文件——同一標準**不要兩者並用**。

## 貢獻

請參閱 [CONTRIBUTING.md](../CONTRIBUTING.md) 了解新增技能或支援其他 AI 工具的指南。
