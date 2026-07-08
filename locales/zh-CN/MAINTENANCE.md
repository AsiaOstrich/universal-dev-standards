---
source: ../../MAINTENANCE.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-07-08
source_hash: 5d0adbbf7d63
status: current
---

# 维护指南

> **维护流程已迁至 AsiaOstrich dev-platform 规划中心。**
>
> 自 v2.0.0 起，所有维护工作流程整合至 `OPERATION-WORKFLOW.md`；自 v5.1.1 起依 DEC-047 迁至内部规划中心（`cross-project/ops/uds-operation.md`）。
>
> **Maintenance workflow has moved to the AsiaOstrich dev-platform planning hub.**
>
> Merged into `OPERATION-WORKFLOW.md` in v2.0.0; migrated to internal planning hub in v5.1.1 per DEC-047.

## 快速参考

日常维护请遵循 `CLAUDE.md` 中的验证步骤（§Post-Modification Verification）。

- 归档版本 v1.1.0 — 原始独立指南（历史档案已移除）

## Bundle-Source 一致性（XSPEC-072 / DEC-045）

npm bundle 标准（`cli/bundled/`，由 `ai/` 产生）必须是真实来源 `.standards/`
的**子集**。布局契约定义于 DEC-045 §6.2。

### 发版时强制（自动 — XSPEC-072 Phase 4.2）

`scripts/bump-version.mjs`（及旧版 `bump-version.sh`）会在改动任何版本档
**之前**先跑 pre-flight 一致性闸门，一致性漂移即**中止发版**。等效手动指令：

```bash
cd cli
npm run prepack                # 从 ai/ 重新产生 cli/bundled/
npm run check:bundle-parity    # 必须以 exit 0 结束（source == bundled，扣除排除项）
```

Break-glass：`SKIP_BUNDLE_PARITY=1 node scripts/bump-version.mjs <version>`
可跳过闸门（会大声警告）——仅在工具链坏损**且**你已用其他方式确认一致性时使用。

GHA 工作流程 `bundle-parity.yml` 会在 PR 和推送至 `main` 时，对任何不符独立
强制失败。这两点（发版闸门 + CI）即强制面；本地 pre-commit/pre-push hook
（XSPEC-072 Phase 3.2）**刻意不加**——它会在每次 push 重跑 `prepack`，相较上述
两道闸门边际效益太低。

### 新增标准时的 bundle 决策流程（DEC-045 §6.2）

在 `.standards/` 新增 `.ai.yaml` 时，决定其 bundle 范围：

1. **Bundle ⊂ Source** — 每个 bundle 档案都须在 `.standards/` 有对应；不允许 bundle-only。
2. **预设启发式（规则 5）：** **level ≤ 2** 的 core 标准也进 bundle → 加入 `ai/standards/<name>.ai.yaml`（供采用者使用）。**level ≥ 3** 或治理／AI 协作类标准维持 source-only → 将其路径加入 `cli/scripts/bundle-exclude.json`，格式 `{ "path", "reason" }`（可推翻）。
3. **选项档** → 一律采巢状布局 `options/<category>/<choice>.ai.yaml`；禁止平坦路径。
4. **禁止歧义重复** — 两个同 basename 但不同路径的档案必须归一，不能并存。

之后执行 `cd cli && npm run prepack && npm run check:bundle-parity`，确认 exit 0。

### 若一致性检查失败

1. **`.standards/` 中的新档案不在 `ai/`** → 复制至 `ai/standards/`（若供采用者使用），或加入 `cli/scripts/bundle-exclude.json`（若仅供 UDS 内部使用）
2. **`ai/` 中的新档案不在 `.standards/`** → 复制至 `.standards/`
3. **新选项档案** → 确保同时存在于 `ai/options/<cat>/` 与 `.standards/options/<cat>/`

## 翻译版本

- [繁体中文](../zh-TW/MAINTENANCE.md)
- [简体中文](./MAINTENANCE.md)
