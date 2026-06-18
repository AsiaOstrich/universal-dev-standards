# Skill-Standard Alignment Check

> **Source**: XSPEC-070 | **Driven by**: DEC-043 Wave 1 Governance Meta Pack | **Status**: Trial (2026-04-17 ~ 2026-10-17)
>
> **Phase 1**（anchor 存在性 / orphan 偵測）— Implemented。
> **Phase 2**（content-coverage audit：版本偏移 / mandatory keyword / 規模落差）— Implemented（XSPEC-292 T4，`scripts/check-skill-content-coverage.ts`）。

## Overview

Skill 必有 Standard 作為錨點，Standard 可無 Skill；定期識別孤兒 Skill。Skill 是 UX 糖衣，Standard 是 standards-of-truth。若 Skill 無錨定 Standard，其行為就沒有明文依據，會隨作者口味飄移。本標準規範 Skill 必須指明錨定哪個 Standard，並定期識別「孤兒 Skill」（無對應 Standard），觸發補 Standard 的流程。反向允許 Standard 無 Skill（不強制每個 Standard 都造 Skill）。

## Key Principles

- **Skill 必錨 Standard**：所有 Skill frontmatter 必須含 `anchor_standard`（至少一個）
- **Anchor 有效性**：必須指向 Trial / Active / Deprecated 狀態的標準 id
- **Standard 可獨立**：Standard 無對應 Skill 是合法的（非錯誤，僅資訊）
- **Orphan 治理**：無 anchor 的 Skill 列為 orphan，下一版必補或降 Proposed
- **定期檢查**：建議季度執行 alignment check，產出 orphan 清單

## Alignment Rules

### Skill must have Standard

- Frontmatter 必須含 `anchor_standard: <standard-id>` 或 `[<id1>, <id2>, ...]`
- CI / pre-release 強制，缺欄位視為 fail
- **例外**：純 utility Skill（如 docs-generator）可標 `anchor_standard: none` + 填 `utility_reason`

### Standard may have Skill

- Standard 獨立存在合法（可被 QualityGate / Agent 直接消費）
- 強制每 Standard 造 Skill 會導致 Skill 庫膨脹
- 範例：`immutability-first` 無對應 Skill 合法

### Orphan Detection

- 無 `anchor_standard` 的 Skill → orphan
- 偵測後動作：列入季度報告 → 建立對應 Standard 的 XSPEC（走 admission 流程） → 無法建立則降 Skill 為 Proposed

## Known Orphans (as of 2026-04)

本 XSPEC-070 識別的現存 orphan Skill（由 XSPEC-063~069 補齊）：

| Skill | Needs Standard | Planned XSPEC |
|-------|----------------|---------------|
| `slo-assistant` | slo-standards | XSPEC-063 |
| `runbook-assistant` | runbook-standards | XSPEC-064 |
| `incident-response-assistant` | incident-response-standards | XSPEC-063 |
| `observability-assistant` | observability-standards | XSPEC-063 |
| `metrics-dashboard-assistant` | metrics-dashboard-standards | XSPEC-063 |
| `ci-cd-assistant` | ci-cd-standards | XSPEC-066 |

清單將隨 XSPEC-063~069 實作逐步清空。

## Alignment Check Workflow

1. 掃描 `skills/**/*.md` 抽取 frontmatter `anchor_standard`
2. 掃描 `ai/standards/*.ai.yaml` 抽取所有 `standard.id`
3. 計算差集：Skill without anchor → orphan 清單
4. 計算反向差集：Standard without Skill → informational
5. 驗證 anchor 指向存在且非 Archived 的 id
6. 產出 `alignment-report.json` / `alignment-report.md`

## Content-Coverage Audit（Phase 2）

> **Driven by**: XSPEC-292 T4（3 個真實 skill↔standard 內容漂移）。Phase 1 只證明 anchor
> *存在*（防 orphan）；一個 Skill 可帶著有效 `anchor_standard` 仍漂移——標準新增 mandatory
> 段落、bump 版本、或成長到遠超 Skill 的陳舊摘要。Phase 2 把對齊從「錨點存在」延伸到
> 「錨點內容同步」。

每個 `(skill, anchor_standard)` 配對執行三項內容層檢查（預設 advisory，`--strict` 轉硬閘）：

| 檢查 | 錯誤碼 | 觸發條件 |
|------|--------|----------|
| **版本偏移** | `CONTENT-001` | Skill `**Version**` < anchor 標準版本（取自 `core/<id>.md`）。Skill 無版本則記 `CONTENT-001A`（advisory，永不阻擋）。 |
| **mandatory keyword 覆蓋** | `CONTENT-002` | 標準在 `.ai.yaml` 宣告為 mandatory 的關鍵字（`audit.mandatory_keywords`）未出現在 Skill 內文。 |
| **規模落差** | `CONTENT-003` | Skill 行數 / 標準行數 < `audit.min_skill_ratio`（預設 0.15），即 underspecified 骨架。 |

### Audit 宣告（標準側 opt-in）

mandatory keyword 與規模門檻由**標準自己**在其 `.ai.yaml` 宣告（反幻覺：審核器不臆測什麼是
mandatory，只讀標準作者明文宣告的清單）。支援兩種 schema 位置：頂層 `audit:` 或 `standard.audit:`。

```yaml
# ai/standards/logging.ai.yaml
audit:
  mandatory_keywords:    # logging 的 9 canonical events
    - application_startup
    - request_received
    # ...
  min_skill_ratio: 0.15  # 選填，覆寫預設
```

### Advisory → Strict 升級路徑

- 預設 **advisory**：列出所有 finding，exit 0，讓 audit 能在所有漂移修完前先落地。
- `--strict`：將 `CONTENT-001/002/003` 升為阻擋失敗（exit 1）；`CONTENT-001A`（無版本）始終
  資訊性、永不阻擋。
- 建議：先以 advisory 進 CI 觀察 → 漂移清零後於 pre-release gate 加 `--strict`。

腳本：`scripts/check-skill-content-coverage.ts`（npm script `check:content-coverage`）。

## Usage Examples

- **Scenario 1 — 健康對齊**：`retry-assistant` frontmatter 含 `anchor_standard: retry-standards`，指向 Trial 狀態標準 → 檢查通過
- **Scenario 2 — Orphan 偵測**：`slo-assistant` 無 `anchor_standard` → 列入 orphan 清單，報告標註「需建立 slo-standards 或降 Proposed」
- **Scenario 3 — 孤立 Standard 合法**：`immutability-first.ai.yaml` 存在但無 Skill → `standalone-standard` 計數 +1，非錯誤

## Error Codes

Phase 1（anchor 存在性）：

- `ALIGN-001` — `SKILL_MISSING_ANCHOR`
- `ALIGN-002` — `BROKEN_ANCHOR`（指向不存在的 standard id）
- `ALIGN-003` — `ARCHIVED_ANCHOR`（指向已 Archived 的標準）
- `ALIGN-004` — `UTILITY_MISSING_REASON`

Phase 2（內容覆蓋）：

- `CONTENT-001` — `VERSION_SKEW`（Skill 版本 < anchor 標準版本，stale；blocking under `--strict`）
- `CONTENT-001A` — `SKILL_UNVERSIONED`（Skill 無版本，無法比對；advisory only）
- `CONTENT-002` — `MISSING_MANDATORY_KEYWORD`（標準宣告的 mandatory keyword 未出現於 Skill）
- `CONTENT-003` — `UNDERSPECIFIED`（Skill 規模遠小於 anchor 標準）
- `CONTENT-000` — `ANCHOR_NOT_IN_REGISTRY`（內容覆蓋無法評估；broken anchor 屬 ALIGN-002 領域）

## References

- AI-optimized: [ai/standards/skill-standard-alignment-check.ai.yaml](../ai/standards/skill-standard-alignment-check.ai.yaml)
- Phase 2 audit 腳本: `scripts/check-skill-content-coverage.ts`（npm `check:content-coverage`）
- XSPEC-070: DEC-043 Wave 1 Governance Meta Pack 跨專案規格
- DEC-043: UDS 覆蓋完整性路線圖（XSPEC-063~069 目的之一即清空本標準識別的 orphan 清單）
- Related: `standard-admission-criteria`, `standard-lifecycle-management`
- Internal: AsiaOstrich DEC-043 七主題缺口分析（slo/runbook/observability 等 40+ Skill 部分無 Standard 錨點）


**Scope**: universal
