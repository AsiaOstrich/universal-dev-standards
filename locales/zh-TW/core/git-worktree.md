---
source: ../../../core/git-worktree.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: 12acb15a4884
status: current
---

# Git Worktree 隔離

> **語言**: [English](../../../core/git-worktree.md) | 繁體中文

**版本**: 1.1.0
**最後更新**: 2026-06-18
**適用性**: 所有使用 Git 進行版本控制的專案
**範圍**: universal（通用）
**靈感來源**: [Superpowers](https://github.com/obra/superpowers) — using-git-worktrees (MIT)

---

## 目的

定義 Git Worktree 的完整生命週期管理標準，確保環境乾淨、安全合併與適當清理。Worktree 允許在多個分支上並行工作，無需 stash 或切換。

---

## 術語表

| 術語 | 定義 |
|------|-----------|
| Worktree | Git 儲存庫在不同分支上的連結工作副本 |
| 基準測試（Baseline Test） | 在新建 worktree 上執行的測試，用於驗證環境是乾淨的 |
| Worktree 目錄 | 建立 worktree 的檔案系統路徑 |

---

## 核心原則 — 隔離與責任

> **每個 worktree 必須以乾淨狀態開始（基準測試）、在隔離環境中工作、以合併或明確清理結束。**

---

## 生命週期階段

### 階段 1：Setup（建立）

1. **選擇 worktree 位置** — 優先順序：
   - 既有的設定路徑
   - `.uds/worktrees/` 或類似的專案內目錄
   - 詢問使用者
2. **驗證 `.gitignore`** — 執行 `git check-ignore` 確認 worktree 目錄已被忽略
3. **建立 worktree** — `git worktree add <path> -b <branch-name>`
4. **安裝依賴** — 視需要執行套件管理器的安裝指令

```bash
# Example setup
git worktree add .worktrees/feature-auth -b feature/auth
cd .worktrees/feature-auth
pnpm install  # or npm install, pip install, etc.
```

### 階段 2：Baseline（基準驗證）

1. 在新建的 worktree 中**執行測試套件**
2. **確認所有測試通過** — 藉此驗證環境乾淨
3. **若測試失敗** — 以退避方式最多重試 2 次，排除暫時性的不穩定／逾時；若仍失敗，則中止並報告環境問題（不得繼續）

```bash
# Baseline verification
pnpm test  # Must pass before any work begins
```

基準測試失敗代表環境有問題，必須中止並報告。

### 階段 3：Execute（執行）

1. 將隔離的 worktree 當作一般開發環境進行工作
2. 照常提交
3. 變更後執行測試

### 階段 4：Merge（合併）

1. 在 worktree 中**確認所有測試通過**
2. **合併回主線** — 使用 `--no-ff` 保留分支歷史
3. 若發生衝突，**處理衝突**

```bash
git checkout main
git merge --no-ff feature/auth
```

### 階段 5：Cleanup（清理）

1. **移除 worktree** — `git worktree remove <path>`
2. **刪除分支** — `git branch -d <branch-name>`
3. **清除過時的 worktree** — `git worktree prune`

```bash
git worktree remove .worktrees/feature-auth
git branch -d feature/auth
git worktree prune
```

**重要**：清理必須在異常退出時也執行，使用 try/finally 模式或清理 hook。

---

## 規則

| ID | 觸發條件 | 動作 | 優先級 |
|----|---------|--------|----------|
| GW-001 | Worktree 目錄不在 `.gitignore` 中 | 自動加入 `.gitignore` | Critical |
| GW-002 | 基準測試失敗 | 對暫時性失敗最多重試 2 次（指數退避）；若持續失敗，中止任務並報告環境問題 | High |
| GW-003 | Worktree 操作期間異常退出 | 確保執行清理 | High |
| GW-004 | 分支合併／刪除後 worktree 仍存在 | 清除過時的 worktree 參照 | Medium |

---

## 最佳實踐

| 實踐 | 理由 |
|----------|-----------|
| 使用一致的 worktree 目錄（例如 `.worktrees/`） | 易於加入 `.gitignore` 與定位 |
| 一律執行基準測試 | 避免環境問題造成的假性失敗 |
| 合併時使用 `--no-ff` | 在歷史中保留分支拓樸 |
| 合併後立即清理 | 避免過時 worktree 累積 |

---

## 參考資料

- **Superpowers**：[using-git-worktrees](https://github.com/obra/superpowers) (MIT)
- **Git 文件**：[git-worktree](https://git-scm.com/docs/git-worktree)
