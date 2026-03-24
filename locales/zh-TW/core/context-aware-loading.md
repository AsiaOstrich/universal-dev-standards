---
source: ../../../core/context-aware-loading.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
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
| **Manifest 領域** | 領域到標準對應的單一事實來源（`manifest.json`） |

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

### 1.2 按需載入標準

這些標準在偵測到對應的任務情境時自動載入：

| 領域 | 觸發條件 | 載入的標準 |
|------|----------|-----------|
| `testing` | 撰寫測試、修改測試 | testing、unit-testing、integration-testing |
| `security` | 認證、授權、密鑰 | security-standards |
| `deployment` | CI/CD、部署、發布 | deployment-standards、changelog |
| `documentation` | 文件、README | documentation-writing-standards |

## 2. 載入協定

### 2.1 工作流程

```
1. 載入常駐標準
2. 分析使用者任務上下文
3. 比對任務關鍵字與領域觸發條件
4. 按需載入匹配的標準
5. 在工作階段中保持已載入的標準
```

### 2.2 觸發比對

AI 工具應透過以下方式比對觸發條件：

| 比對方式 | 說明 |
|----------|------|
| 檔案路徑 | 修改 `tests/` 下的檔案觸發 testing 領域 |
| 使用者指令 | `/tdd`、`/bdd` 等觸發 testing 領域 |
| 關鍵字 | 使用者訊息中的「測試」、「部署」等關鍵字 |

## 相關標準

- [專案情境記憶](project-context-memory.md)
- [反幻覺標準](anti-hallucination.md)
