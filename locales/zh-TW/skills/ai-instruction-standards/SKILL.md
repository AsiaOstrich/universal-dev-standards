---
source: ../../../../skills/ai-instruction-standards/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-02-05
status: current
scope: partial
description: |
  建立和維護 AI 指令檔案（CLAUDE.md、.cursorrules 等）並採用適當結構。
  使用時機：建立 AI 指令檔案、區分通用與專案特定規則、配置 AI 工具。
  關鍵字：CLAUDE.md, cursorrules, windsurfrules, clinerules, AI instructions, system prompt, 指令檔案, AI 設定.
---

# AI 指令檔案標準指南

> **語言**: [English](../../../../skills/ai-instruction-standards/SKILL.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-01-25
**適用範圍**: Claude Code Skills

---

> **核心標準**: 本技能實作 [AI 指令檔案標準](../../core/ai-instruction-standards.md)。完整方法論文件請參閱核心標準。

## 目的

本技能協助建立和維護 AI 指令檔案，適當區分通用標準與專案特定配置。

## 快速參考

### 支援的 AI 工具

| AI 工具 | 指令檔案 | 格式 |
|---------|----------|------|
| Claude Code | `CLAUDE.md` | Markdown |
| Cursor | `.cursorrules` | Markdown |
| Windsurf | `.windsurfrules` | Markdown |
| Cline | `.clinerules` | Markdown |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |
| OpenCode | `.opencode/instructions.md` | Markdown |

### 核心原則：通用 vs 專案特定

| 類型 | 包含內容 | 範例 |
|------|----------|------|
| **通用** | 通用規則 | 「提交前執行測試」 |
| **專案特定** | 具體命令 | 「提交前執行 `npm test`」 |

### 建議配置

```markdown
# [專案名稱] - AI 指令

## 通用標準
<!-- 適用於任何專案的規則 -->
- Commit 訊息格式
- 程式碼審查清單
- 測試標準
- 反幻覺規則

---

## 專案特定配置
<!-- 此專案獨有的設定 -->

### 技術棧
[你的技術在此]

### 快速命令
[你的建置/測試/部署命令]

### 檔案結構
[你的專案結構]
```

## 詳細指南

完整標準請參閱：
- [AI 指令檔案標準](../../core/ai-instruction-standards.md)

### AI 優化格式（Token 效率）

AI 助手可使用 YAML 格式檔案以減少 Token 使用：
- 基礎標準：`ai/standards/ai-instruction-standards.ai.yaml`

## 內容指南

### 通用內容（保持通用）

| 類別 | 良好範例 |
|------|----------|
| **提交標準** | 「遵循 Conventional Commits 格式」 |
| **程式碼審查** | 「使用 BLOCKING、IMPORTANT、SUGGESTION 前綴」 |
| **測試** | 「維持最低 80% 覆蓋率」 |
| **AI 行為** | 「分析前務必先讀取程式碼」 |

**通用區段應避免：**
- 特定命令（`npm test`、`pytest`）
- 固定路徑（`cli/src/`、`/var/www/`）
- 版本號（`Node.js 18`、`Python 3.11`）
- 專案名稱和 URL

### 專案特定內容

| 類別 | 範例 |
|------|------|
| **技術棧** | Node.js 18、React 18、PostgreSQL 15 |
| **命令** | `npm run lint`、`./scripts/deploy.sh` |
| **檔案結構** | `src/`、`cli/`、`tests/` |
| **團隊慣例** | 繁體中文註解 |

## 標籤慣例

### 選項 A：區段標題

```markdown
## 通用標準
[通用內容]

## 專案特定配置
[專案特定內容]
```

### 選項 B：行內標記

```markdown
> ⚠️ **專案特定**：本區段包含此專案獨有的配置。

### 技術棧
...
```

### 選項 C：註解標註

```markdown
<!-- 通用：以下適用於所有專案 -->
### Commit 訊息格式
...

<!-- 專案特定：為你的專案自訂 -->
### 快速命令
...
```

## 多工具配置

使用多個 AI 工具時，保持一致性：

```
project/
├── CLAUDE.md              # Claude Code 指令
├── .cursorrules           # Cursor 指令（可從 CLAUDE.md 匯入）
├── .windsurfrules         # Windsurf 指令
└── .github/
    └── copilot-instructions.md  # Copilot 指令
```

**最佳實踐**：建立共用的 `docs/ai-standards.md` 並從各工具檔案引用，避免重複。

## 維護檢查清單

提交 AI 指令檔案變更前：

- [ ] 通用區段不包含專案特定的路徑、命令或版本
- [ ] 專案特定區段有明確標記
- [ ] 標準文件的交叉引用正確
- [ ] 格式與現有區段一致

---

## 配置偵測

本技能支援專案特定配置。

### 偵測順序

1. 檢查是否存在 `CLAUDE.md` 或等效檔案
2. 分析內容結構是否區分通用/專案特定
3. 若未找到，**建議建立結構化 AI 指令檔案**

### 首次設定

若未找到 AI 指令檔案：

1. 詢問：「此專案沒有 AI 指令檔案。是否要建立一個？」
2. 確定專案類型和技術棧
3. 產生包含適當區段的範本
4. 若包含敏感資訊，新增到 `.gitignore`

---

## 相關標準

- [AI 指令檔案標準](../../core/ai-instruction-standards.md) - 核心標準
- [文件撰寫標準](../../core/documentation-writing-standards.md) - 撰寫指南
- [反幻覺規範](../../core/anti-hallucination.md) - AI 準確性規則
- [AI 友善架構](../../core/ai-friendly-architecture.md) - 上下文優化

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-25 | 初始發布 |

---

## 授權

本技能以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。

**來源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
