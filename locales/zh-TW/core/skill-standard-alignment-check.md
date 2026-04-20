---
source: ../../../core/skill-standard-alignment-check.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# Skill-Standard 對齊檢查標準

> **語言**: [English](../../../core/skill-standard-alignment-check.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-04-17
**狀態**: Trial（到期 2026-10-17）
**適用範圍**: universal
**來源**: XSPEC-070（DEC-043 Wave 1 治理 Meta 套件）

---

## 目的

Skill 必有 Standard 作為錨點，Standard 可無 Skill；定期識別孤兒 Skill。

Skill 是 UX 糖衣，Standard 是 standards-of-truth。若 Skill 無錨定 Standard，其行為就沒有明文依據，會隨作者口味飄移。本標準規範 Skill 必須指明錨定哪個 Standard，並定期識別「孤兒 Skill」（無對應 Standard），觸發補 Standard 的流程。反向允許 Standard 無 Skill（不強制每個 Standard 都造 Skill）。

---

## 核心規範

- 所有 Skill 必須在 frontmatter 指明 `anchor_standard`（至少一個）
- `anchor_standard` 必須指向 Trial / Active / Deprecated 狀態的標準 id
- Skill 無 `anchor_standard` 視為 orphan，必須在下一版補上或降級為 Proposed
- Standard 無對應 Skill 是合法的（Standard 可獨立存在，Skill 僅為 UX 加速）
- 定期（建議季度）執行 alignment check，產出 orphan Skill 清單

---

## 對齊規則

### Skill 必須有 Standard

- **規則**：Skill 的 frontmatter 必須包含 `anchor_standard` 欄位
- **格式**：`anchor_standard: <standard-id>` 或 `[<standard-id-1>, <standard-id-2>, ...]`
- **強制執行**：CI / pre-release check，缺欄位視為 fail
- **例外**：純 utility Skill（如 docs-generator）可標記 `anchor_standard: none` + 填 `utility_reason`

### Standard 不必有 Skill

- **規則**：Standard 是否有對應 Skill 不強制
- **理由**：Standard 是 standards-of-truth，可被 QualityGate / Agent 直接消費；強制每 Standard 都造 Skill 會導致 Skill 庫膨脹
- **範例**：`immutability-first` 標準無對應 Skill — 合法

### 孤兒 Skill 偵測

- 沒有 `anchor_standard` 的 Skill 視為 orphan
- **偵測後行動**：
  1. 列入季度報告
  2. 建立對應 Standard 的 XSPEC（循 admission-criteria 流程）
  3. 若無法建立 Standard，降 Skill 為 Proposed 直到有錨點

---

## 2026-04 已知孤兒 Skill 清單

| Skill ID | 所需 Standard |
|----------|--------------|
| `slo-assistant` | slo-standards（XSPEC-063 規劃中） |
| `runbook-assistant` | runbook-standards（XSPEC-064 規劃中） |
| `incident-response-assistant` | incident-response-standards（XSPEC-063 規劃中） |
| `observability-assistant` | observability-standards（XSPEC-063 規劃中） |
| `metrics-dashboard-assistant` | metrics-dashboard-standards（XSPEC-063 規劃中） |
| `ci-cd-assistant` | ci-cd-standards（XSPEC-066 規劃中） |

清單將隨 XSPEC-063~069 實作逐步清空。

---

## 對齊檢查工作流程

1. 掃描 `skills/**/*.md` 抽取 frontmatter `anchor_standard`
2. 掃描 `ai/standards/*.ai.yaml` 抽取所有 `standard.id`
3. 計算差集：Skill without anchor_standard → orphan 清單
4. 計算反向差集：Standard without Skill → informational（非錯誤）
5. 若 `anchor_standard` 指向不存在的 id 或已 Archived 的 id → 錯誤
6. 輸出 `alignment-report.json` / `alignment-report.md`（含 orphan 清單、broken anchor 清單）

---

## 遙測事件

**`alignment_check_run`**

| 欄位 | 類型 |
|------|------|
| `total_skills` | `number` |
| `total_standards` | `number` |
| `orphan_skills_count` | `number` |
| `broken_anchors_count` | `number` |
| `standalone_standards_count` | `number` |
| `timestamp` | `string` |

---

## 錯誤碼

| 代碼 | 說明 |
|------|------|
| `ALIGN-001` | `SKILL_MISSING_ANCHOR` — Skill frontmatter 缺 anchor_standard |
| `ALIGN-002` | `BROKEN_ANCHOR` — anchor_standard 指向不存在的 standard id |
| `ALIGN-003` | `ARCHIVED_ANCHOR` — anchor_standard 指向已 Archived 的標準 |
| `ALIGN-004` | `UTILITY_MISSING_REASON` — utility Skill 標 anchor_standard=none 但缺 utility_reason |
