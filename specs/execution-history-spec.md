# Execution History Repository Standard — 開發規格

**狀態**: Draft
**建立日期**: 2026-04-02
**上游規格**: dev-platform XSPEC-003-SDD（Approved）
**參考實作**: dev-autopilot SPEC-008（Implemented Phase 1-3）

---

## 摘要

在 UDS 中新增 `execution-history` 標準，定義 agent 執行歷史的 artifact 格式、目錄結構與分層存取模型。此標準將透過 `uds init` 安裝到下游專案，供 AI 工具（Claude Code、OpenCode 等）自動遵循。

## 動機

Meta-Harness 論文（arXiv:2603.28052）證實：給 agent 完整的先前執行歷史（而非壓縮摘要）能大幅提升效果。目前缺乏統一標準來規範執行歷史的保留格式。

---

## 要新增/修改的檔案

### 1. `ai/standards/execution-history.ai.yaml`（新增）

AI 優化版標準。格式參照 `developer-memory.ai.yaml`。

**結構大綱：**

```yaml
standard:
  id: execution-history
  name: "Execution History Repository Standards"
  description: "..."
  guidelines: [5 條核心指引]

  meta:
    version: "1.0.0"
    updated: "2026-04-02"
    source: core/execution-history.md

  schema:
    storage:           # 雙後端（local + file_server）
    directory_structure: # .execution-history/ 目錄結構
    artifacts:          # 6 required + 2 optional artifact 定義
    access_layers:      # L1/L2/L3 分層存取模型
    retention_policy:   # 保留策略（max_runs, archive threshold）
    sensitive_data:     # redaction patterns

  definitions:         # JSON Schema（test-results, log-entry, token-usage, final-status）

  rules:
    - id: record-on-completion     # 任務完成時記錄（required）
    - id: use-l1-first             # 先讀 L1 再深入（required）
    - id: redact-sensitive         # 寫入前 redact（required）
    - id: respect-retention        # 保留策略清理（recommended）
    - id: archive-stale-tasks      # 90 天歸檔（recommended）
    - id: cross-project-l1-only    # 跨專案僅 L1（required）

  storage:
    directory: ".execution-history/"
    format: "JSON + Markdown + JSONL + Patch"

  architecture:
    classification: always-on-protocol
    note: "與 developer-memory、project-context-memory 同屬 Always-On Protocol。"
```

**關鍵：** schema 內容直接來自 XSPEC-003-SDD 的 `standard.schema` 區塊，保持一致。

### 2. `core/execution-history.md`（新增）

完整 Markdown 參考文件。

**章節大綱：**

1. **概述** — 標準目的與適用場景
2. **動機與研究依據** — Meta-Harness 論文洞見
3. **核心概念**
   - Artifact 類型（6 required + 2 optional）
   - 目錄結構圖
   - L1/L2/L3 分層存取模型
4. **Schema 定義**
   - index.json（L1）JSON Schema + 範例
   - manifest.json（L2）JSON Schema + 範例
   - 各 artifact 格式說明
5. **儲存後端**
   - Local（預設）：gitignore 規則
   - FileServer：storage.json 配置
6. **保留策略** — max_runs, archive threshold, cleanup strategy
7. **敏感資料 Redaction** — 預設 patterns（API key, GitHub token, password, private key）
8. **跨專案存取規則** — L1 only for cross-project
9. **使用範例** — Agent 如何讀取和寫入歷史
10. **相關標準** — developer-memory, project-context-memory, workflow-state-protocol

### 3. `cli/standards-registry.json`（修改）

在 `standards` 陣列中新增 entry：

```json
{
  "id": "execution-history",
  "name": "Execution History Repository Standards",
  "nameZh": "執行歷史倉庫標準",
  "source": {
    "human": "core/execution-history.md",
    "ai": "ai/standards/execution-history.ai.yaml"
  },
  "category": "reference",
  "skillName": null,
  "description": "Structured system for persisting agent execution artifacts with L1/L2/L3 tiered access model"
}
```

---

## 驗證方式

| 項目 | 方法 |
|------|------|
| YAML 語法 | `node -e "require('js-yaml').load(require('fs').readFileSync('ai/standards/execution-history.ai.yaml'))"` |
| Registry JSON | `node -e "JSON.parse(require('fs').readFileSync('cli/standards-registry.json'))"` |
| 標準列表 | `node cli/bin/uds.js list` 應顯示 execution-history |
| 與 XSPEC-003-SDD 一致性 | 人工比對 schema 區塊 |
| Markdown 結構 | 確認章節完整、範例可讀 |

---

## 實作注意事項

- `architecture.classification` 設為 `always-on-protocol`（與 developer-memory 一致）
- 不需要建立 skill 或 slash command（此標準由 AI 自動遵循）
- `category` 為 `reference`（非 skill）
- Markdown 中的 JSON Schema 範例直接引用 XSPEC-003-SDD 的 definitions 區塊
