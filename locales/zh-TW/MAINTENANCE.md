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

- 歸檔版本 v1.1.0 — 原始獨立指南（歷史檔案已移除）

## Bundle-Source 一致性（XSPEC-072 / DEC-045）

npm bundle 標準（`cli/bundled/`，由 `ai/` 產生）必須是真實來源 `.standards/`
的**子集**。布局契約定義於 DEC-045 §6.2。

### 發版時強制（自動 — XSPEC-072 Phase 4.2）

`scripts/bump-version.mjs`（及舊版 `bump-version.sh`）會在改動任何版本檔
**之前**先跑 pre-flight 一致性閘門，一致性漂移即**中止發版**。等效手動指令：

```bash
cd cli
npm run prepack                # 從 ai/ 重新產生 cli/bundled/
npm run check:bundle-parity    # 必須以 exit 0 結束（source == bundled，扣除排除項）
```

Break-glass：`SKIP_BUNDLE_PARITY=1 node scripts/bump-version.mjs <version>`
可跳過閘門（會大聲警告）——僅在工具鏈壞損**且**你已用其他方式確認一致性時使用。

GHA 工作流程 `bundle-parity.yml` 會在 PR 和推送至 `main` 時，對任何不符獨立
強制失敗。這兩點（發版閘門 + CI）即強制面；本地 pre-commit/pre-push hook
（XSPEC-072 Phase 3.2）**刻意不加**——它會在每次 push 重跑 `prepack`，相較上述
兩道閘門邊際效益太低。

### 新增標準時的 bundle 決策流程（DEC-045 §6.2）

在 `.standards/` 新增 `.ai.yaml` 時，決定其 bundle 範圍：

1. **Bundle ⊂ Source** — 每個 bundle 檔案都須在 `.standards/` 有對應；不允許 bundle-only。
2. **預設啟發式（規則 5）：** **level ≤ 2** 的 core 標準也進 bundle → 加入 `ai/standards/<name>.ai.yaml`（供採用者使用）。**level ≥ 3** 或治理／AI 協作類標準維持 source-only → 將其路徑加入 `cli/scripts/bundle-exclude.json`，格式 `{ "path", "reason" }`（可推翻）。
3. **選項檔** → 一律採巢狀布局 `options/<category>/<choice>.ai.yaml`；禁止平坦路徑。
4. **禁止歧義重複** — 兩個同 basename 但不同路徑的檔案必須歸一，不能並存。

之後執行 `cd cli && npm run prepack && npm run check:bundle-parity`，確認 exit 0。

### 若一致性檢查失敗

1. **`.standards/` 中的新檔案不在 `ai/`** → 複製至 `ai/standards/`（若供採用者使用），或加入 `cli/scripts/bundle-exclude.json`（若僅供 UDS 內部使用）
2. **`ai/` 中的新檔案不在 `.standards/`** → 複製至 `.standards/`
3. **新選項檔案** → 確保同時存在於 `ai/options/<cat>/` 與 `.standards/options/<cat>/`

## 翻譯版本

- [繁體中文](./MAINTENANCE.md)
- [简体中文](../zh-CN/MAINTENANCE.md)
