---
source: ../../../../integrations/google-antigravity/AGENTS.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: dcee96a2ef3b
status: current
---

# Antigravity 系統指令

> **語言**: [English](../../../../integrations/google-antigravity/AGENTS.md) | 繁體中文 | [简体中文](../../../zh-CN/integrations/google-antigravity/AGENTS.md)

**版本**: 1.0.0
**最後更新**: 2026-01-09

本文件包含 Google Antigravity (Gemini Advanced Agent) 的推薦系統指令，以確保符合通用文件規範。

## 系統提示詞片段

請將以下內容新增至您的代理系統指令或全域上下文中：

```markdown
<universal_doc_standards_compliance>
你必須遵循本專案定義的 **通用文件規範**。

### 核心標準使用規則

> **核心標準使用規則**：
> 在驗證標準、檢查程式碼或執行任務時，**優先**閱讀 `core/` 中的精簡規則（例如 `core/testing-standards.md`）。
> **僅在**明確要求教學內容、詳細說明或教學指南時，才閱讀 `core/guides/` 或 `methodologies/guides/`。
> 這可確保 token 效率與聚焦的上下文。

### 規格驅動開發 (SDD) 優先

**規則**：當專案中整合了 SDD 工具（如 OpenSpec、Spec Kit 等）並提供特定命令（例如 `/openspec` 或 `/sdd` 等斜線指令）時，你必須優先使用這些命令，而非手動編輯檔案。

**偵測方式**：
- OpenSpec：檢查是否有 `openspec/` 目錄或 `openspec.json`
- Spec Kit：檢查是否有 `specs/` 目錄或 `.speckit` 配置

**原因**：
- **一致性**：工具確保規格結構遵循嚴格的 schema
- **可追溯性**：命令自動處理日誌、ID 和連結
- **安全性**：工具內建驗證以防止無效狀態

參考：`core/spec-driven-development.md`

### 核心協議：防幻覺
參考：`core/anti-hallucination.md`

1. **證據基礎分析**：
   - 在分析檔案之前，你必須先讀取檔案。
   - 不要猜測 API、類別名稱或函式庫版本。
   - 如果你還沒看過程式碼，請說明「我需要讀取 [檔案] 來確認」。

2. **來源標註**：
   - 每個關於程式碼的事實陳述都必須標註來源。
   - 格式：`[來源: 程式碼] 路徑/檔案:行號`
   - 外部文件：`[來源: 外部] http://網址 (存取日期: 日期)`

3. **確定性分類**：
   - 使用標籤表示信心程度：`[已確認]`、`[推論]`、`[假設]`、`[未知]`。

4. **建議**：
   - 當提供選項時，你必須明確說明「推薦」的選擇及其理由。

### AI 回應導航

**規則**：每個實質性的 AI 回應結尾都必須包含導航區塊（Navigation Footer），建議下一步行動。

**關鍵行為**：
- 在完成任務、提供分析、提出問題或回報錯誤後，附加導航建議
- 提供多個選項時，以 ⭐ 標記推薦選項
- 使用情境範本（任務完成、使用者提問、錯誤/失敗、進行中、資訊性回覆）
- 依情境調整選項數量（1-5 個，絕不超過 5 個）
- 適用時，建議中優先使用斜線指令

**豁免**：極短的確認（"OK"、"Done"）可省略導航。

參考：`.standards/ai-response-navigation.ai.yaml`（或 `core/ai-response-navigation.md`）

### 文件與提交
1. **Commit 訊息**：遵循 Conventional Commits — `<type>(<scope>): <subject>`。
   **類型**：feat、fix、docs、chore、test、refactor、style、perf、ci、build、revert。
   完整規則：`core/commit-message-guide.md`。
2. **檔案結構**：遵循 `core/documentation-structure.md`。
3. **品質檢查**：完成前依據 `core/checkin-standards.md` 驗證工作。

</universal_doc_standards_compliance>
```

---

## Available UDS Slash Commands | UDS 可用命令

> 為 SPEC-INTSYNC-001 同步合規自動產生的索引。權威描述位於 `skills/commands/*.md` 與 `skills/commands/COMMAND-INDEX.json`。

### core

- `/commit`
- `/code-review`
- `/sdd`
- `/check`
- `/init`
- `/update`
- `/config`

### testing

- `/tdd`
- `/bdd`
- `/atdd`
- `/e2e`
- `/coverage`
- `/ac-coverage`
- `/derive`
- `/derive-bdd`
- `/derive-tdd`
- `/derive-atdd`
- `/derive-all`
- `/journey-test`

### quality

- `/checkin`
- `/refactor`
- `/scan`
- `/security`
- `/reverse`
- `/reverse-sdd`
- `/reverse-bdd`
- `/reverse-tdd`

### docs

- `/docs`
- `/docgen`
- `/changelog`
- `/requirement`
- `/brainstorm`
- `/sdd-retro`
- `/pr`

### ops

- `/observability`
- `/slo`
- `/runbook`
- `/incident`
- `/metrics`
- `/durable`
- `/ci-cd`

### methodology

- `/methodology`
- `/dev-workflow`
- `/discover`
- `/release`
- `/audit`
- `/migrate`
- `/skill-builder`

### reference

- `/database`
- `/api-design`
