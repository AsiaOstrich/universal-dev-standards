---
source: ../../../adoption/STATIC-DYNAMIC-GUIDE.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2025-12-25
status: current
---

# 靜態與動態規範指南

> **語言**: [English](../../adoption/STATIC-DYNAMIC-GUIDE.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2025-12-24
**適用範圍**: 使用本規範框架與 AI 助理協作的專案

---

## 目的

本指南說明如何根據應用時機分類和部署開發規範。

---

## 分類概覽

```
┌─────────────────────────────────────────────────────────────┐
│           靜態規範                                           │
│           隨時生效，嵌入專案文件中                             │
├─────────────────────────────────────────────────────────────┤
│  • anti-hallucination   → 確定性標籤、基於證據              │
│  • checkin-standards    → 編譯、測試、覆蓋率檢查點            │
│  • project-structure    → 目錄慣例                          │
└─────────────────────────────────────────────────────────────┘
                              ↑
                        隨時在 context 中
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           動態規範                                           │
│           關鍵字觸發，按需載入                                │
├─────────────────────────────────────────────────────────────┤
│  • commit-standards     ← "commit", "git"                   │
│  • code-review-assistant← "review", "PR"                    │
│  • git-workflow-guide   ← "branch", "merge"                 │
│  • testing-guide        ← "test", "coverage"                │
│  • release-standards    ← "version", "release"              │
│  • documentation-guide  ← "docs", "README"                  │
│  • requirement-assistant← "spec", "SDD", "新功能"            │
└─────────────────────────────────────────────────────────────┘
```

---

## 靜態規範

### 定義

無論執行何種任務，AI 互動時都應該**隨時生效**的規範。

### 特徵

- 適用於所有互動（無特定觸發）
- 內容精簡（適合放在專案 context 文件）
- 低 token 開銷
- 基礎行為準則

### 靜態規範清單

| 規範 | 核心規則 | 核心目的 |
|------|---------|---------|
| [anti-hallucination](../../core/anti-hallucination.md) | 確定性標籤、來源引用、建議原則 | 防止 AI 提出未經驗證的聲明 |
| [checkin-standards](../../core/checkin-standards.md) | 編譯通過、測試通過、覆蓋率維持 | 確保 commit 前的程式碼品質 |
| [project-structure](../../core/project-structure.md) | 目錄慣例、gitignore 規則 | 維持一致的專案組織 |

### 部署方式

將以下任一檔案加入專案根目錄：

- `CLAUDE.md` (Claude Code)
- `.cursorrules` (Cursor)
- `.github/copilot-instructions.md` (GitHub Copilot)
- `AI_GUIDELINES.md` (通用)

**範本**: 參見 [CLAUDE.md.template](../../../templates/CLAUDE.md.template)

---

## 動態規範

### 定義

由**特定關鍵字**或任務觸發，按需載入以提供詳細指引的規範。

### 特徵

- 有特定觸發條件（關鍵字、指令）
- 內容詳細（若隨時載入會使 context 膨脹）
- 僅在相關時載入
- 任務特定的工作流程

### 動態規範清單

| 規範 | Skill | 觸發關鍵字 |
|------|-------|-----------|
| [commit-message-guide](../../../core/commit-message-guide.md) | commit-standards | commit, git, 提交, feat, fix |
| [code-review-checklist](../../../core/code-review-checklist.md) | code-review-assistant | review, PR, 審查 |
| [git-workflow](../../../core/git-workflow.md) | git-workflow-guide | branch, merge, 分支 |
| [testing-standards](../../../core/testing-standards.md) | testing-guide | test, 測試, coverage |
| [test-completeness-dimensions](../../../core/test-completeness-dimensions.md) | testing-guide | test completeness |
| [versioning](../../../core/versioning.md) | release-standards | version, release, 版本 |
| [changelog-standards](../../../core/changelog-standards.md) | release-standards | changelog, 變更日誌 |
| [documentation-structure](../../../core/documentation-structure.md) | documentation-guide | README, docs |
| [documentation-writing-standards](../../../core/documentation-writing-standards.md) | documentation-guide | documentation |
| [spec-driven-development](../../../core/spec-driven-development.md) | requirement-assistant | spec, SDD, 規格, 新功能 |

### 部署方式

安裝為 Claude Code Skills：

```bash
# 安裝所有 skills
cd skills/claude-code && ./install.sh

# 或選擇性安裝
cp -r skills/claude-code/commit-standards ~/.claude/skills/
```

詳見 [Claude Code Skills README](../../../skills/claude-code/README.md)。

---

## 決策流程圖

```
                    ┌─────────────────┐
                    │    新規範       │
                    └────────┬────────┘
                             │
                             ▼
               ┌─────────────────────────┐
               │ 是否適用於所有           │
               │ AI 互動？               │
               └────────────┬────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
             是                           否
              │                           │
              ▼                           ▼
    ┌─────────────────┐      ┌─────────────────────────┐
    │ 靜態規範         │      │ 能否由關鍵字             │
    │ 加入專案         │      │ 觸發？                  │
    │ context 檔案    │      └────────────┬────────────┘
    └─────────────────┘                   │
                               ┌──────────┴──────────┐
                               │                     │
                              是                     否
                               │                     │
                               ▼                     ▼
                    ┌─────────────────┐   ┌─────────────────┐
                    │ 動態規範         │   │ 考慮是否應該      │
                    │ 建立為 Skill    │   │ 拆分或合併       │
                    │ 並設定關鍵字     │   └─────────────────┘
                    └─────────────────┘
```

---

## Skill 觸發機制

Skills 使用 YAML frontmatter 定義觸發條件：

```yaml
---
name: commit-standards
description: |
  遵循 conventional commits 標準格式化 commit 訊息。
  使用時機：撰寫 commit 訊息、git commit、檢閱 commit 歷史。
  關鍵字：commit, git, message, conventional, 提交, 訊息, feat, fix, refactor。
---
```

**關鍵元素**:
- `Use when:` - 描述觸發情境
- `Keywords:` - 列出觸發關鍵字（支援多語言）

---

## 最佳實踐

### 靜態規範

1. **保持精簡**：專案 context 檔案最多 100-200 行
2. **聚焦行為**：AI 應該隨時做/避免的事
3. **包含快速參考**：精簡表格，非完整文件
4. **連結詳細內容**：參考完整標準以深入了解

### 動態規範

1. **選擇清晰關鍵字**：明確、常用的術語
2. **支援多語言**：為中文使用者包含中文關鍵字
3. **群組相關規範**：如 testing-guide 涵蓋 testing-standards 與 test-completeness
4. **提供快速參考**：Skills 頂部應有精簡摘要

---

## 遷移指南

### 從完整規則到靜態+動態

如果目前所有規則都在一個檔案中：

1. **提取靜態規則**：將 anti-hallucination、checkin、結構規則移至 `CLAUDE.md`
2. **轉換動態規則為 Skills**：為任務特定規則建立或安裝 Skills
3. **移除重複內容**：從 context 檔案刪除重複的規則
4. **測試觸發**：驗證 Skills 在預期關鍵字時啟動

---

## 相關資源

- [CLAUDE.md 範本](../../../templates/CLAUDE.md.template) - 可立即使用的靜態規則範本
- [Claude Code Skills](../../../skills/claude-code/README.md) - Skill 安裝指南
- [採用指南](../ADOPTION-GUIDE.md) - 整體採用策略

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2025-12-24 | 初始指南 |

---

## 授權

本指南以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
