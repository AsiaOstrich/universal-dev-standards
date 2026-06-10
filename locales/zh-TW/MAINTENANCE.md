---
source: ../../MAINTENANCE.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: ec4410b9245b
status: current
---

# 維護指南

> **維護流程已遷至 AsiaOstrich dev-platform 規劃中心。**
>
> 自 v2.0.0 起，所有維護工作流程整合至 `OPERATION-WORKFLOW.md`；自 v5.1.1 起依 DEC-047 遷至內部規劃中心（`cross-project/ops/uds-operation.md`）。
>
> **Maintenance workflow has moved to the AsiaOstrich dev-platform planning hub.**
>
> Merged into `OPERATION-WORKFLOW.md` in v2.0.0; migrated to internal planning hub in v5.1.1 per DEC-047.

## 快速參考

日常維護請遵循 `CLAUDE.md` 中的驗證步驟（§Post-Modification Verification）。

- [歸檔版本 v1.1.0](../../docs/archive/MAINTENANCE-v1.md) — 原始獨立指南

## Bundle-Source 一致性（XSPEC-072 / DEC-045）

每次發行前，請確認 bundle 一致性檢查通過：

```bash
cd cli
npm run prepack                # 從 ai/ 重新產生 cli/bundled/
npm run check:bundle-parity    # 必須以 exit 0 結束（source == bundled，扣除排除項）
```

若一致性檢查失敗：
1. **`.standards/` 中的新檔案不在 `ai/`** → 複製至 `ai/standards/`（若供採用者使用），或加入 `cli/scripts/bundle-exclude.json`（若僅供 UDS 內部使用）
2. **`ai/` 中的新檔案不在 `.standards/`** → 複製至 `.standards/`
3. **新選項檔案** → 確保同時存在於 `ai/options/<cat>/` 與 `.standards/options/<cat>/`

`scripts/bump-version.sh` 目前**不會**自動執行一致性檢查 — 請在標記版本前手動執行。GHA 工作流程 `bundle-parity.yml` 會在 PR 和推送至 `main` 時發生任何不符時強制失敗。

## 翻譯版本

- [繁體中文](locales/zh-TW/MAINTENANCE.md)
- [简体中文](locales/zh-CN/MAINTENANCE.md)
