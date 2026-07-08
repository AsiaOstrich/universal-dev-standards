---
source: ../../../core/license-compliance.md
source_version: 2.1.0
translation_version: 2.1.0
last_synced: 2026-06-10
source_hash: 8ac1763bd1a1
status: current
---

# 授權合規標準

> **Language**: [English](../../../core/license-compliance.md) | 繁體中文

> **版本**: 2.1.0 | **狀態**: Active | **更新日期**: 2026-05-16
> **AI 最佳化版本**: `ai/standards/license-compliance.ai.yaml`
> **Agent Spec**: ASPEC-001 (cross-project/aspec/ASPEC-001-license-compliance-agent.md)

**Scope**: universal

## 概述

針對 AI 增強開發的完整授權合規標準，涵蓋一般 OSS 實務（Tier 1）以及針對 AI 生成程式碼的 AI 專屬規則（Tier 2）。

## Tier 1 — 一般 OSS 合規實務

適用於所有專案，無論是否使用 AI。

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | 授權分類與允許清單（allowlist） | MUST |
| REQ-002 | CI 中的自動化授權掃描 | MUST |
| REQ-003 | SBOM 產生（CycloneDX 1.5 或 SPDX 2.3） | MUST |
| REQ-004 | 授權署名與 NOTICES 檔案 | MUST |
| REQ-005 | 授權違規補救（5 個工作天） | MUST |
| REQ-006 | 採用新技術時的授權審查 | SHOULD |

### 授權分級

| 分級 | 授權 | 動作 |
|------|------|------|
| APPROVED | MIT, Apache 2.0, BSD-2/3-Clause, ISC, CC0 | 自動核准 |
| REVIEW-REQUIRED | LGPL-2.1/3.0, MPL-2.0, CDDL | 採用前須法務審查 |
| PROHIBITED | GPL-2.0/3.0, AGPL-3.0, SSPL-1.0, BUSL-1.1 | 立即封鎖 PR |

## Tier 2 — AI 專屬規則

對產生程式碼的 AI Agent（VibeOps Generator Agent 及同等者）具有約束力。

| ID | 規則 | 嚴重度 |
|----|------|--------|
| LC-001 | 必須查詢 SPDX ID | Blocking |
| LC-002 | 封鎖清單（blocklist）自動封鎖 | Blocking |
| LC-003 | 允許清單（allowlist）自動核准 | Informational |
| LC-004 | 灰名單（greylist）人工審查 | Review required |
| LC-005 | SBOM 強制產生 | Blocking |
| LC-006 | 著作權相似度閾值（≥0.85 封鎖） | Blocking |
| LC-007 | PII 樣式偵測 | Review required |
| LC-008 | EU AI Act 透明度標記 | Blocking |
| LC-009 | 客戶政策上限 | Informational |

## v2.1.0 增強（XSPEC-193 Phase 2）

### ClearlyDefined API（LC-001）

- 主要授權查詢來源：`https://api.clearlydefined.io/definitions/{type}/{provider}/{namespace}/{name}/{revision}`
- 知名套件的信賴度 ≥ 0.95（score.total ≥ 80）
- 24h TTL LRU 快取（cap=500）+ 404 negative cache
- Token bucket：10 req/s，burst 20
- 重試策略：5xx → exponential backoff × 3（200ms/1s/3s）；429 → batch fallback
- DEC-064 快取金鑰隔離：`sha256(client_salt + ':' + purl)`

### AST PII 分析（LC-007）

- Tree-sitter 支援：TypeScript、JavaScript、Python
- 上下文分類：
  - `hardcoded_value` → 嚴重度升級為 `critical`
  - `comment` → 嚴重度降級為 `info`
  - `schema_field` → 加註，嚴重度不變
- `// pii:ignore` pragma：抑制同一行的發現
- 選填欄位：`PIIPattern.confidence`、`PIIPattern.ast_context`
- tree-sitter 不可用時優雅降級（graceful fallback）為 regex

### EmbeddingProvider 策略（LC-006）

- `provider='onnx-minilm'`：ONNX 本機推論（all-MiniLM-L6-v2）
- `provider='ollama-bge-m3'`：Ollama 本機 API（localhost:11434）
- `provider='jaccard'`：Jaccard token 相似度（Phase 1 基準線，預設）
- 記憶體內 snippet 索引（`buildSnippetIndex()`）依客戶隔離（DEC-064 salt）
- 外部搜尋：透過 `enableExternalSearch=true` opt-in（預設=false）

## 原則

| ID | 原則 |
|----|------|
| P-1 | SPDX 優先 — 所有授權 ID 必須是 SPDX 標準 |
| P-2 | 獨立評估者 — 與 Generator 使用不同的模型類別 |
| P-3 | 證據導向決策 — 每個封鎖都附帶可追溯的證據 |
| P-4 | 預設透明 — 必須有 EU AI Act Article 50 標記 |
| P-5 | 客戶主權 — 政策可在 EULA §9 限制內客製化 |

## 工具序列（XSPEC-193 §2）

```
1. dependency_reader
2. license_lookup         ← ClearlyDefined API (v2.1.0)
3. license_blocklist_check
4. sbom_generator
5. pii_pattern_detector   ← AST-enhanced (v2.1.0)
6. copyright_similarity_check ← EmbeddingProvider (v2.1.0)
7. eu_ai_act_classifier
8. transparency_marker
9. block_pr
10. suggest_alternative
11. escalate_to_human
```

## 相關規格

- XSPEC-193 — License Compliance Agent 完整規格
- XSPEC-066 — Wave 3 Compliance Pack（v1.0.0 基準線）
- DEC-063 — VibeOps 法務與合規策略
- DEC-064 — 客戶 IP 隔離（cache salt）
- ASPEC-001 — License Compliance Agent SPEC（XSPEC-205 §REQ-2 格式）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-04-30 | 初版 — REQ-001~006 一般 OSS 實務 |
| v2.0.0 | 2026-05-14 | 新增 Tier 2 LC-001~009 AI 專屬規則 |
| v2.1.0 | 2026-05-16 | ClearlyDefined API + AST PII + EmbeddingProvider + ASPEC-001 參照 |
