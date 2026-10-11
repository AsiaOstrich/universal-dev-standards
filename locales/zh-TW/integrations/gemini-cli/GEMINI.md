---
source: ../../../../integrations/gemini-cli/GEMINI.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: 078673081b26
status: current
---

# 通用開發標準

> **語言**: [English](../../../../integrations/gemini-cli/GEMINI.md) | 繁體中文 | [简体中文](../../../zh-CN/integrations/gemini-cli/GEMINI.md)

**版本**: 1.1.0
**最後更新**: 2026-01-21

本專案遵循通用文件規範，以確保高品質、無幻覺的程式碼與文件。

---

## 核心標準使用規則

> **核心標準使用規則**：
> 在驗證標準、檢查程式碼或執行任務時，**優先**閱讀 `core/` 中的精簡規則（例如 `core/testing-standards.md`）。
> **僅在**明確要求教學內容、詳細說明或教學指南時，才閱讀 `core/guides/` 或 `methodologies/guides/`。
> 這可確保 token 效率與聚焦的上下文。

---

## 規格驅動開發 (SDD) 優先

**規則**：當專案中整合了 SDD 工具（如 OpenSpec、Spec Kit 等）並提供特定命令時（例如 `/openspec` 或 `/spec` 等斜線命令），你必須優先使用這些命令，而非手動編輯檔案。

**偵測方式**：
- OpenSpec：檢查是否有 `openspec/` 目錄或 `openspec.json`
- Spec Kit：檢查是否有 `specs/` 目錄或 `.speckit` 配置

**原因**：
- **一致性**：工具確保規格結構遵循嚴格的 schema
- **可追溯性**：命令自動處理日誌、ID 和連結
- **安全性**：工具內建驗證以防止無效狀態

參考：`core/spec-driven-development.md`

---

## 防幻覺協議

參考：`core/anti-hallucination.md`

### 1. 證據基礎分析

- 在分析檔案之前，你必須先讀取檔案。
- 不要猜測 API、類別名稱或函式庫版本。
- 如果你還沒看過程式碼，請說明：「我需要讀取 [檔案] 來確認」。

### 2. 來源標註

每個關於程式碼的事實陳述都必須標註來源：
- 程式碼：`[來源: 程式碼] 路徑/檔案:行號`
- 外部文件：`[來源: 外部] http://網址 (存取日期: 日期)`

### 3. 確定性分類

使用標籤表示信心程度：
- `[已確認]` - 已從來源驗證
- `[推論]` - 邏輯推論
- `[假設]` - 合理假設
- `[未知]` - 無法確定

### 4. 建議

當提供選項時，你必須明確說明「推薦」的選擇及其理由。

---

## 文件與提交

### Commit 訊息

遵循 Conventional Commits 格式（參考：`core/commit-message-guide.md`）：

```
<類型>(<範圍>): <主題>

<內文>

<頁尾>
```

**類型**：feat、fix、docs、chore、test、refactor、style

### 檔案結構

遵循文件結構指南（參考：`core/documentation-structure.md`）。

### 品質檢查

完成前，依據 `core/checkin-standards.md` 驗證工作：
- [ ] 程式碼編譯成功
- [ ] 所有測試通過
- [ ] 無硬編碼的秘密資訊
- [ ] 如適用，已更新文件

---

## 工作流程強制閘門

**關鍵**：在執行任何工作流程階段指令之前，你必須檢查先決條件。

### 會話啟動協定
會話開始時，檢查是否有進行中的工作流程：`ls .workflow-state/*.yaml 2>/dev/null`
若發現進行中的工作流程 → 告知使用者並提供繼續執行的選項。

### 階段閘門

| 工作流程 | 階段 | 先決條件 | 失敗時 |
|---------|-------|-------------|------------|
| SDD | implement | 規格狀態 = Approved | → `/sdd approve` |
| SDD | verify | 所有 AC 皆有程式碼 + 測試 | → `/sdd implement` |
| TDD | GREEN | 已存在失敗的測試 | → 停留在 RED |
| TDD | REFACTOR | 所有測試通過 | → 停留在 GREEN |
| BDD | AUTOMATION | `.feature` 檔案存在 | → FORMULATION |
| Commit | feat/fix | 檢查進行中的規格 | → 建議 `Refs: SPEC-XXX` |

**絕不**在失敗的測試存在之前撰寫實作程式碼（TDD）。
**絕不**在 `.feature` 檔案存在之前撰寫步驟定義（BDD）。

參考：`.standards/workflow-enforcement.ai.yaml`

---

## 重構指南

參考：`core/refactoring-standards.md`

### 三層策略

| 層級 | 策略 | 時間尺度 |
|------|------|----------|
| **戰術** | 童子軍法則、準備性重構、紅綠重構 | 分鐘 |
| **戰略** | 絞殺者無花果、防腐層、分支抽象 | 週至月 |
| **安全** | 特徵測試、草稿重構、尋找接縫 | 前置作業 |

### 決策樹

1. 在生產環境？否 → 考慮重寫
2. 理解程式碼？否 → 先寫特徵測試
3. 覆蓋率 >60%？否 → 先加測試
4. 架構可挽救？否 → 絞殺者無花果；是 → 漸進重構

### 快速參考

| 情況 | 策略 |
|------|------|
| 功能被雜亂程式碼阻擋 | **準備性重構** |
| 修 bug 的機會 | **童子軍法則** |
| 替換遺留系統 | **絞殺者無花果** |
| 與遺留系統共存 | **防腐層** |
| 未測試的遺留程式碼 | **先寫特徵測試** |

---

## AI 回應導航

**規則**：每個實質性的 AI 回應結尾都必須包含導航區塊（Navigation Footer），建議下一步行動。

**關鍵行為**：
- 在完成任務、提供分析、提出問題或回報錯誤後，附加導航建議
- 提供多個選項時，以 ⭐ 標記推薦選項
- 使用情境範本（任務完成、使用者提問、錯誤/失敗、進行中、資訊性回覆）
- 依情境調整選項數量（1-5 個，絕不超過 5 個）
- 適用時，建議中優先使用斜線指令

**豁免**：極短的確認（"OK"、"Done"）可省略導航。

參考：`.standards/ai-response-navigation.ai.yaml`（或 `core/ai-response-navigation.md`）

---

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.1.0 | 2026-01-21 | 新增重構指南章節 |
| 1.0.0 | 2026-01-09 | 初始 Gemini CLI 指令檔案 |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
