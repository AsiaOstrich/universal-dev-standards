---
source: ../../../core/branch-completion.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 630cbaa0dc61
status: current
---

# 分支完成工作流程

<!-- UDS:REFERENCE-ONLY since=6.0.0 -->
> **僅供參考——UDS 不會安裝這條標準。** 它的機器可讀檔
> `.ai.yaml` 已於 6.0.0 移除；本文件保留在此，供實作它的採用層
> 參考，且**不由 `uds init` 或
> `uds update` 發布**。本告示所對照的清單是
> [`scripts/reference-only-standards.json`](../../../scripts/reference-only-standards.json)；
> 遷移紀錄見 [`docs/MIGRATION-v6.md`](../docs/MIGRATION-v6.md) §2。

> **語言**: [English](../../../core/branch-completion.md) | 繁體中文

**版本**: 1.0.0
**最後更新**: 2026-03-20
**適用性**: 所有使用 Git 分支工作流程的專案
**範圍**: 通用 (universal)
**靈感來源**: [Superpowers](https://github.com/obra/superpowers) — finishing-a-development-branch (MIT)

---

## 目的

定義分支完成的標準化工作流程，包含前置檢查、四個完成選項與安全丟棄流程。本標準可防止過早合併、遺忘分支與意外資料遺失。

定義分支完成的標準化工作流，包含前置檢查、四個完成選項與安全丟棄流程。防止過早合併、遺忘分支與意外資料遺失。

---

## 術語表

| 術語 | 定義 |
|------|-----------|
| 分支完成 (Branch Completion) | 完成功能／修復分支工作的流程 |
| 前置條件 (Prerequisites) | 分支被視為完成前必須滿足的條件 |
| 丟棄確認 (Discard Confirmation) | 刪除工作前需要明確輸入的安全機制 |

---

## 核心原則 — 先測試再討論

> **所有測試必須通過，才能討論任何完成選項。**

所有測試必須通過，才能討論完成選項。

---

## 前置條件

在分支可以被完成之前，下列所有檢查項目都必須通過：

| 檢查項目 | 指令（範例） | 必要 |
|-------|-------------------|----------|
| 所有測試通過 | `pnpm test` | 是 |
| Lint 通過 | `pnpm lint` | 是 |
| 型別檢查通過 | `pnpm tsc --noEmit` | 是 |
| 無未提交的變更 | `git status --porcelain` | 是 |

若有任何前置條件失敗，該分支即**尚未準備好完成**。請先修復問題。

---

## 四個完成選項

### 選項 1: 本地合併 (Merge Locally)

在你的本地機器上將分支合併至目標分支。

```bash
git checkout main
git merge --no-ff feature/my-feature
git branch -d feature/my-feature
# If worktree exists:
git worktree remove .worktrees/my-feature
```

**適用時機**: 小型變更、個人工作、無需審查。

### 選項 2: 建立 PR (Create Pull Request)

推送分支並建立 Pull Request 以供審查。

```bash
git push -u origin feature/my-feature
gh pr create --title "feat: add my feature" --body "..."
```

**適用時機**: 團隊專案、需要審查的變更、CI/CD 管線。

### 選項 3: 保持現狀 (Keep As-Is)

保留分支，不進行合併也不建立 PR。

- 記錄分支狀態與推遲原因
- 設定提醒以便後續重新檢視

**適用時機**: 進行中的工作、等待相依項目、探索替代方案。

### 選項 4: 丟棄 (Discard)

刪除分支及其所有變更。

**安全要求**: 使用者必須透過輸入分支名稱進行**明確確認**。

```
⚠️  You are about to discard branch 'feature/my-feature'.
    This will permanently delete all uncommitted and committed changes on this branch.
    Type the branch name to confirm: feature/my-feature
```

```bash
# After confirmation:
git checkout main
git branch -D feature/my-feature
# If worktree exists:
git worktree remove .worktrees/my-feature
```

**適用時機**: 放棄的實驗、已被取代的做法。

丟棄操作需要使用者明確確認（輸入分支名稱），防止誤刪。

---

## 決策流程

```
Prerequisites pass?
  ├── No → Fix issues first
  └── Yes → Choose completion option:
        ├── 1. Merge locally
        ├── 2. Create PR
        ├── 3. Keep as-is
        └── 4. Discard (requires confirmation)
```

---

## Worktree 整合

如果分支有相關聯的 worktree，worktree 必須作為完成流程的一部分進行清理：

| 完成選項 | Worktree 操作 |
|------------------|----------------|
| 本地合併 | 合併後移除 worktree |
| 建立 PR | 保留 worktree 直到 PR 合併 |
| 保持現狀 | 保留 worktree |
| 丟棄 | 立即移除 worktree |

---

## 規則

| ID | 觸發條件 | 行動 | 優先級 |
|----|---------|--------|----------|
| BC-001 | 使用者選擇丟棄 | 要求分支名稱確認 | 緊急 (Critical) |
| BC-002 | 分支具有關聯的 worktree | 完成時清理 worktree | 高 (High) |
| BC-003 | 未滿足前置條件 | 阻擋完成，顯示未通過的檢查 | 高 (High) |
| BC-004 | 分支閒置超過 14 天 | 通知使用者完成或丟棄 | 中 (Medium) |

---

## 參考資料

- **Superpowers**: [finishing-a-development-branch](https://github.com/obra/superpowers) (MIT)
- **Git Flow**: 分支生命週期管理
- **Trunk-Based Development**: 短期分支模式

---

> **分支完成 ≠ 發布就緒。** 完成的分支代表其自身的所有品質閘門皆已通過。這並不代表產品已準備好出貨。關於正式環境部署前必須通過的 16 維度發布閘門，請參閱 `release-readiness-gate.md`。
