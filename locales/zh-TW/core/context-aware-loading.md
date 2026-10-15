---
source: ../../../core/context-aware-loading.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 20a78d490360
status: current
---

# 情境感知標準載入

> **語言**: [English](../../../core/context-aware-loading.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-16
**適用性**: 所有使用 AI 最佳化標準（.ai.yaml）的專案
**範圍**: 通用 (Universal)

---

## 目的

本標準定義 AI 工具根據當前任務情境選擇性載入開發標準的協定。AI 工具不會一次載入所有標準，而是始終載入核心集合，並按需啟動額外標準，以減少 token 使用量並提升焦點。

---

## 快速參考

| 概念 | 說明 |
|------|------|
| **領域 (Domain)** | 一組相關標準的命名群組（如 `testing`、`quality`） |
| **常駐載入 (Always-On)** | 無論任務為何都會在每次工作階段載入的標準 |
| **按需載入 (On-Demand)** | 僅在任務情境符合其領域觸發條件時載入的標準 |
| **Manifest 領域** | 領域→標準對應的單一事實來源（`manifest.json`） |

---

## 1. 領域分類

### 1.1 常駐標準

這些標準是每次 AI 互動的基礎，必須始終載入：

| 標準 | 原因 |
|------|------|
| `anti-hallucination` | 防止每個任務中的虛構 |
| `commit-message` | 每次工作階段都可能產生提交 |
| `checkin-standards` | 品質關卡適用於所有變更 |
| `project-context-memory` | 專案決策必須始終被尊重 |
| `developer-memory` | 過去的洞見應始終可用 |

### 1.2 按需領域

| 領域 | 標準 | 啟動觸發條件 |
|------|------|-------------|
| `testing` | testing, unit-testing, integration-testing, test-completeness-dimensions, tdd, bdd, atdd | 撰寫測試、編輯測試檔案、「測試覆蓋率」討論 |
| `specification` | spec-driven-development, forward-derivation, reverse-engineering, requirement-engineering | `/sdd`、`/spec` 指令、編輯規格檔案 |
| `quality` | code-review, refactoring, security, performance, accessibility | `/code-review` 指令、PR 審查、「重構」討論 |
| `documentation` | documentation-structure, documentation-writing, ai-instruction, changelog | 撰寫文件、編輯 README/CHANGELOG |
| `workflow` | git-workflow, github-flow, squash-merge, versioning, deployment | 分支操作、發布準備、合併 |
| `architecture` | ai-friendly-architecture, project-structure, error-codes, logging | 架構決策、專案設定 |

---

## 2. 啟動協定

### 2.1 載入決策流程

```
Session Start
  ├─ Load all always-on standards
  ├─ Scan user request for trigger keywords
  ├─ Match file patterns if user is editing files
  ├─ Detect slash commands (/sdd, /code-review, etc.)
  └─ Load matching on-demand standards
```

### 2.2 Manifest 領域設定

專案在 `manifest.json` 中設定領域對應：

```json
{
  "domains": {
    "always-on": [
      "ai/standards/anti-hallucination.ai.yaml",
      "ai/standards/commit-message.ai.yaml",
      "ai/standards/checkin-standards.ai.yaml",
      "ai/standards/project-context-memory.ai.yaml",
      "ai/standards/developer-memory.ai.yaml"
    ],
    "testing": [
      "ai/standards/testing.ai.yaml",
      "ai/options/testing/unit-testing.ai.yaml",
      "ai/options/testing/integration-testing.ai.yaml",
      "ai/standards/test-completeness-dimensions.ai.yaml",
      "ai/standards/test-driven-development.ai.yaml",
      "ai/standards/behavior-driven-development.ai.yaml",
      "ai/standards/acceptance-test-driven-development.ai.yaml"
    ]
  }
}
```

---

## 3. 自訂領域

專案可以在 `manifest.json` 中使用 `extensions` 陣列定義自訂領域。自訂領域**僅限累加**——無法覆寫內建領域。

### 3.1 擴充格式

```json
{
  "extensions": [
    {
      "type": "custom-domain",
      "domain": "ml-pipeline",
      "description": "Standards for ML pipeline workflows",
      "triggers": ["pipeline", "model training", "dataset", "*.pipeline.*"],
      "standards": ["ai/standards/custom-ml-pipeline.ai.yaml"]
    }
  ]
}
```

### 3.2 自訂領域規則

| 規則 | 說明 |
|------|------|
| **僅限累加 (Additive only)** | 自訂領域無法覆寫或遮蔽內建領域 |
| **唯一名稱 (Unique names)** | 領域名稱不得與內建領域名稱衝突 |
| **標準路徑 (Standard paths)** | 參照的標準必須存在於專案中 |
| **觸發格式 (Trigger format)** | 與內建領域觸發條件格式相同（關鍵字、檔案模式、指令） |

### 3.3 基於 Hook 的強制執行（選用）

對於 Claude Code 使用者，`UserPromptSubmit` hook 可根據使用者的提示詞自動注入相關標準。該 hook 會讀取提示詞，將其與 manifest 領域觸發條件（包括內建與自訂）進行比對，並輸出相符的標準檔案路徑作為情境。

**需求：**
- Hook 執行必須在 < 500ms 內完成
- Hook 失敗不得阻擋使用者的提示詞
- 參考實作請見 `scripts/hooks/inject-standards.mjs`

---

## 4. 實作指引

### 4.1 給標準作者

- 在 `manifest.json` 中的適當領域下註冊新標準
- 僅針對確實適用於每次互動的標準選擇 `always-on`
- 在領域設定中定義具體、可操作的觸發條件（而非模糊的關鍵字）
- 將每個標準指定給恰好一個領域

### 4.2 給 AI 工具整合

- 在工作階段開始時，始終載入 `always-on` 領域
- 在載入額外標準之前，解析使用者的第一則訊息以尋找觸發關鍵字
- 有疑慮時，直接載入標準——誤報比遺漏情境更好
- 在工作階段期間快取領域成員資格

### 4.3 回溯相容性

- 沒有 `domains` 的現有 `manifest.json` 仍可繼續運作（載入所有標準）
- `domains` 欄位為累加性質——它不會移除現有的 `standards` 清單行為

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-03-16 | 初始標準定義 |

---

## 授權條款

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 釋出。
