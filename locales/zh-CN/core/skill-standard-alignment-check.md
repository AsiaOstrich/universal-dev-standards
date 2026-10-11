---
source: ../../../core/skill-standard-alignment-check.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: fce59c063b19
status: current
---

# Skill-Standard 对齐检查

> **语言**: [English](../../../core/skill-standard-alignment-check.md) | 简体中文

> **来源**: XSPEC-070 | **驱动来源**: DEC-043 Wave 1 Governance Meta Pack | **状态**: Trial（2026-04-17 ~ 2026-10-17）
>
> **Phase 1**（anchor 存在性 / orphan 检测）— Implemented。
> **Phase 2**（content-coverage audit：版本偏移 / mandatory keyword / 规模落差）— Implemented（XSPEC-292 T4，`scripts/check-skill-content-coverage.ts`）。

## 概述

Skill 必有 Standard 作为锚点，Standard 可无 Skill；定期识别孤儿 Skill。Skill 是 UX 糖衣，Standard 是 standards-of-truth。若 Skill 无锚定 Standard，其行为就没有明文依据，会随作者口味漂移。本标准规范 Skill 必须指明锚定哪个 Standard，并定期识别「孤儿 Skill」（无对应 Standard），触发补 Standard 的流程。反向允许 Standard 无 Skill（不强制每个 Standard 都造 Skill）。

## 关键原则

- **Skill 必锚 Standard**：所有 Skill frontmatter 必须含 `anchor_standard`（至少一个）
- **Anchor 有效性**：必须指向 Trial / Active / Deprecated 状态的标准 id
- **Standard 可独立**：Standard 无对应 Skill 是合法的（非错误，仅信息）
- **Orphan 治理**：无 anchor 的 Skill 列为 orphan，下一版必补或降 Proposed
- **定期检查**：建议季度执行 alignment check，产出 orphan 清单

## 对齐规则

### Skill 必须有 Standard

- Frontmatter 必须含 `anchor_standard: <standard-id>` 或 `[<id1>, <id2>, ...]`
- CI / pre-release 强制，缺字段视为 fail
- **例外**：纯 utility Skill（如 docs-generator）可标 `anchor_standard: none` + 填 `utility_reason`

### Standard 可以有 Skill

- Standard 独立存在合法（可被 QualityGate / Agent 直接消费）
- 强制每个 Standard 造 Skill 会导致 Skill 库膨胀
- 示例：`immutability-first` 无对应 Skill 合法

### Orphan 检测

- 无 `anchor_standard` 的 Skill → orphan
- 检测后动作：列入季度报告 → 建立对应 Standard 的 XSPEC（走 admission 流程） → 无法建立则降 Skill 为 Proposed

## 已知 Orphan（截至 2026-04）

本 XSPEC-070 识别的现存 orphan Skill（由 XSPEC-063~069 补齐）：

| Skill | 所需 Standard | 规划 XSPEC |
|-------|----------------|---------------|
| `slo-assistant` | slo-standards | XSPEC-063 |
| `runbook-assistant` | runbook-standards | XSPEC-064 |
| `incident-response-assistant` | incident-response-standards | XSPEC-063 |
| `observability-assistant` | observability-standards | XSPEC-063 |
| `metrics-dashboard-assistant` | metrics-dashboard-standards | XSPEC-063 |
| `ci-cd-assistant` | ci-cd-standards | XSPEC-066 |

清单将随 XSPEC-063~069 实现逐步清空。

## 对齐检查工作流程

1. 扫描 `skills/**/*.md` 提取 frontmatter `anchor_standard`
2. 扫描 `ai/standards/*.ai.yaml` 提取所有 `standard.id`
3. 计算差集：Skill without anchor → orphan 清单
4. 计算反向差集：Standard without Skill → informational
5. 验证 anchor 指向存在且非 Archived 的 id
6. 产出 `alignment-report.json` / `alignment-report.md`

## Content-Coverage Audit（Phase 2）

> **驱动来源**: XSPEC-292 T4（3 个真实 skill↔standard 内容漂移）。Phase 1 只证明 anchor
> *存在*（防 orphan）；一个 Skill 可带着有效 `anchor_standard` 仍漂移——标准新增 mandatory
> 段落、bump 版本、或成长到远超 Skill 的陈旧摘要。Phase 2 把对齐从「锚点存在」延伸到
> 「锚点内容同步」。

每个 `(skill, anchor_standard)` 配对执行三项内容层检查（默认 advisory，`--strict` 转硬闸）：

| 检查 | 错误码 | 触发条件 |
|------|--------|----------|
| **版本偏移** | `CONTENT-001` | Skill `**Version**` < anchor 标准版本（取自 `core/<id>.md`）。Skill 无版本则记 `CONTENT-001A`（advisory，永不阻挡）。 |
| **mandatory keyword 覆盖** | `CONTENT-002` | 标准在 `.ai.yaml` 声明为 mandatory 的关键字（`audit.mandatory_keywords`）未出现在 Skill 正文。 |
| **规模落差** | `CONTENT-003` | Skill 行数 / 标准行数 < `audit.min_skill_ratio`（默认 0.15），即 underspecified 骨架。 |

### Audit 声明（标准侧 opt-in）

mandatory keyword 与规模门槛由**标准自己**在其 `.ai.yaml` 声明（反幻觉：审核器不臆测什么是
mandatory，只读标准作者明文声明的清单）。支持两种 schema 位置：顶层 `audit:` 或 `standard.audit:`。

```yaml
# ai/standards/logging.ai.yaml
audit:
  mandatory_keywords:    # logging 的 9 canonical events
    - application_startup
    - request_received
    # ...
  min_skill_ratio: 0.15  # 選填，覆寫預設
```

### Advisory → Strict 升级路径

- 默认 **advisory**：列出所有 finding，exit 0，让 audit 能在所有漂移修完前先落地。
- `--strict`：将 `CONTENT-001/002/003` 升为阻挡失败（exit 1）；`CONTENT-001A`（无版本）始终
  为信息性、永不阻挡。
- 建议：先以 advisory 进 CI 观察 → 漂移清零后于 pre-release gate 加 `--strict`。

脚本：`scripts/check-skill-content-coverage.ts`（npm script `check:content-coverage`）。

## 使用示例

- **场景 1 —— 健康对齐**：`retry-assistant` frontmatter 含 `anchor_standard: retry-standards`，指向 Trial 状态标准 → 检查通过
- **场景 2 —— Orphan 检测**：`slo-assistant` 无 `anchor_standard` → 列入 orphan 清单，报告标注「需建立 slo-standards 或降 Proposed」
- **场景 3 —— 孤立 Standard 合法**：`immutability-first.ai.yaml` 存在但无 Skill → `standalone-standard` 计数 +1，非错误

## 错误码

Phase 1（anchor 存在性）：

- `ALIGN-001` — `SKILL_MISSING_ANCHOR`
- `ALIGN-002` — `BROKEN_ANCHOR`（指向不存在的 standard id）
- `ALIGN-003` — `ARCHIVED_ANCHOR`（指向已 Archived 的标准）
- `ALIGN-004` — `UTILITY_MISSING_REASON`

Phase 2（内容覆盖）：

- `CONTENT-001` — `VERSION_SKEW`（Skill 版本 < anchor 标准版本，stale；`--strict` 下阻挡）
- `CONTENT-001A` — `SKILL_UNVERSIONED`（Skill 无版本，无法比对；仅 advisory）
- `CONTENT-002` — `MISSING_MANDATORY_KEYWORD`（标准声明的 mandatory keyword 未出现于 Skill）
- `CONTENT-003` — `UNDERSPECIFIED`（Skill 规模远小于 anchor 标准）
- `CONTENT-000` — `ANCHOR_NOT_IN_REGISTRY`（内容覆盖无法评估；broken anchor 属 ALIGN-002 范畴）

## 参考资料

- AI 优化版：[ai/standards/skill-standard-alignment-check.ai.yaml](../../../ai/standards/skill-standard-alignment-check.ai.yaml)
- Phase 2 audit 脚本：`scripts/check-skill-content-coverage.ts`（npm `check:content-coverage`）
- XSPEC-070：DEC-043 Wave 1 Governance Meta Pack 跨项目规格
- DEC-043：UDS 覆盖完整性路线图（XSPEC-063~069 目的之一即清空本标准识别的 orphan 清单）
- 相关：`standard-admission-criteria`, `standard-lifecycle-management`
- 内部：AsiaOstrich DEC-043 七主题缺口分析（slo/runbook/observability 等 40+ Skill 部分无 Standard 锚点）


**范围**: universal
