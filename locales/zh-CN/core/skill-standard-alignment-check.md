---
source: ../../../core/skill-standard-alignment-check.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-20
status: current
---

# Skill-Standard 对齐检查标准

> **语言**: [English](../../../core/skill-standard-alignment-check.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-04-17
**状态**: Trial（到期 2026-10-17）
**适用范围**: universal
**来源**: XSPEC-070（DEC-043 Wave 1 治理 Meta 套件）

---

## 目的

Skill 必有 Standard 作为锚点，Standard 可无 Skill；定期识别孤儿 Skill。

Skill 是 UX 糖衣，Standard 是 standards-of-truth。若 Skill 无锚定 Standard，其行为就没有明文依据，会随作者口味漂移。本标准规范 Skill 必须指明锚定哪个 Standard，并定期识别「孤儿 Skill」（无对应 Standard），触发补 Standard 的流程。反向允许 Standard 无 Skill（不强制每个 Standard 都造 Skill）。

---

## 核心规范

- 所有 Skill 必须在 frontmatter 指明 `anchor_standard`（至少一个）
- `anchor_standard` 必须指向 Trial / Active / Deprecated 状态的标准 id
- Skill 无 `anchor_standard` 视为 orphan，必须在下一版补上或降级为 Proposed
- Standard 无对应 Skill 是合法的（Standard 可独立存在，Skill 仅为 UX 加速）
- 定期（建议季度）执行 alignment check，产出孤儿 Skill 清单

---

## 对齐规则

### Skill 必须有 Standard

- **规则**：Skill 的 frontmatter 必须包含 `anchor_standard` 字段
- **格式**：`anchor_standard: <standard-id>` 或 `[<standard-id-1>, <standard-id-2>, ...]`
- **强制执行**：CI / pre-release check，缺字段视为 fail
- **例外**：纯 utility Skill（如 docs-generator）可标记 `anchor_standard: none` + 填 `utility_reason`

### Standard 不必有 Skill

- **规则**：Standard 是否有对应 Skill 不强制
- **理由**：Standard 是 standards-of-truth，可被 QualityGate / Agent 直接消费；强制每 Standard 都造 Skill 会导致 Skill 库膨胀
- **范例**：`immutability-first` 标准无对应 Skill — 合法

### 孤儿 Skill 检测

- 没有 `anchor_standard` 的 Skill 视为 orphan
- **检测后行动**：
  1. 列入季度报告
  2. 建立对应 Standard 的 XSPEC（循 admission-criteria 流程）
  3. 若无法建立 Standard，降 Skill 为 Proposed 直到有锚点

---

## 2026-04 已知孤儿 Skill 清单

| Skill ID | 所需 Standard |
|----------|--------------|
| `slo-assistant` | slo-standards（XSPEC-063 规划中） |
| `runbook-assistant` | runbook-standards（XSPEC-064 规划中） |
| `incident-response-assistant` | incident-response-standards（XSPEC-063 规划中） |
| `observability-assistant` | observability-standards（XSPEC-063 规划中） |
| `metrics-dashboard-assistant` | metrics-dashboard-standards（XSPEC-063 规划中） |
| `ci-cd-assistant` | ci-cd-standards（XSPEC-066 规划中） |

清单将随 XSPEC-063~069 实现逐步清空。

---

## 对齐检查工作流程

1. 扫描 `skills/**/*.md` 提取 frontmatter `anchor_standard`
2. 扫描 `ai/standards/*.ai.yaml` 提取所有 `standard.id`
3. 计算差集：Skill without anchor_standard → orphan 清单
4. 计算反向差集：Standard without Skill → informational（非错误）
5. 若 `anchor_standard` 指向不存在的 id 或已 Archived 的 id → 错误
6. 输出 `alignment-report.json` / `alignment-report.md`（含孤儿清单、broken anchor 清单）

---

## 遥测事件

**`alignment_check_run`**

| 字段 | 类型 |
|------|------|
| `total_skills` | `number` |
| `total_standards` | `number` |
| `orphan_skills_count` | `number` |
| `broken_anchors_count` | `number` |
| `standalone_standards_count` | `number` |
| `timestamp` | `string` |

---

## 错误码

| 代码 | 说明 |
|------|------|
| `ALIGN-001` | `SKILL_MISSING_ANCHOR` — Skill frontmatter 缺 anchor_standard |
| `ALIGN-002` | `BROKEN_ANCHOR` — anchor_standard 指向不存在的 standard id |
| `ALIGN-003` | `ARCHIVED_ANCHOR` — anchor_standard 指向已 Archived 的标准 |
| `ALIGN-004` | `UTILITY_MISSING_REASON` — utility Skill 标 anchor_standard=none 但缺 utility_reason |
