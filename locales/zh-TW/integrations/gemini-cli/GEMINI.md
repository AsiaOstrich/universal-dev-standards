---
source: ../../../../integrations/gemini-cli/GEMINI.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# 通用開發標準

本專案遵循通用文件規範，以確保高品質、無幻覺的程式碼與文件。

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

## 版本歷史

| 版本 | 日期 | 變更 |
|------|------|------|
| 1.0.0 | 2026-01-09 | 初始 Gemini CLI 指令檔案 |

---

## 授權

本文件以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
