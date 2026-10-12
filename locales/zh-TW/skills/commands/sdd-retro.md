---
source: ../../../../skills/commands/sdd-retro.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-12
source_hash: 34792a9bf741
---

---
description: [UDS] 為未追蹤的 feat/fix commits 建立追溯規格
allowed-tools: Read, Write, Grep, Glob, Bash(git log:*), Bash(git show:*), Bash(git diff:*), Bash(mkdir:*)
argument-hint: "[--since=<date> | --last=<N> | 自動掃描]"
---

# 追溯 Spec 產生器

> **Language**: [English](../../../../skills/commands/sdd-retro.md) | 繁體中文

為過去未追蹤 spec 的已提交變更，建立輕量規格文件。

## 工作流程

1. **掃描** — 搜尋 `git log` 中訊息不含 `Refs:` 的 `feat`/`fix` commits
2. **分組** — 依 scope 將相關 commits 聚類
3. **產生** — 使用標準 SDD 格式建立追溯規格，`Status: Draft`
4. **確認** — 在寫入 `docs/specs/` 前呈現給使用者審查

## 選項

| 選項 | 說明 |
|------|------|
| `--since=2026-01-01` | 僅掃描指定日期後的 commits |
| `--last=20` | 僅掃描最近 N 筆 commits |
| （無引數） | 掃描所有 feat/fix commits |

## 使用方式

```
/sdd-retro              # 掃描所有未追蹤的 commits
/sdd-retro --since=2026-01-01
/sdd-retro --last=10
```

## AI Agent Behavior | AI 代理行為

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| 輸入 | AI 動作 |
|------|---------|
| `/sdd-retro` | 掃描所有 feat/fix commits（無 `Refs:` footer），顯示摘要 |
| `/sdd-retro --since=<date>` | 僅掃描指定日期後的 commits |
| `/sdd-retro --last=<N>` | 僅掃描最近 N 筆 commits |

### Interaction Script | 互動腳本

1. 執行 `git log` 掃描符合條件的 commits
2. 過濾已有 `Refs: SPEC-` 的 commits
3. 依 scope 分群相關 commits

**決策：掃描結果**
- IF 無未追蹤的 commits → 告知使用者「所有 feat/fix commits 都已追蹤」，結束
- IF 有未追蹤的 commits → 顯示分群清單，問使用者要為哪些群組建立 retro spec
- ELSE → 顯示清單供選擇

🛑 **STOP**: 掃描結果展示後等待使用者選擇要追蹤的群組

4. 為使用者選定的群組生成 retro spec（使用 SDD 格式，status: Archived）
5. 展示生成的 spec 內容

🛑 **STOP**: 展示 spec 內容後等待使用者確認寫入檔案

6. 寫入 `docs/specs/` 並建議更新原 commits 的 footer（如有需要）

### Stop Points | 停止點

| 停止點 | 等待內容 |
|--------|---------|
| 掃描結果展示後 | 使用者選擇要追蹤哪些群組 |
| Spec 內容生成後 | 確認寫入檔案 |

### Error Handling | 錯誤處理

| 錯誤條件 | AI 動作 |
|----------|---------|
| 不在 git 儲存庫中 | 告知使用者需要在 git 儲存庫中執行 |
| git log 無結果 | 告知無符合條件的 commits |
| `docs/specs/` 目錄不存在 | 自動建立目錄 |
| commit message 格式不符合 Conventional Commits | 標記為 `[Unknown]` scope，仍嘗試分析 |

## 參考

- SDD 工作流程：[sdd 指令](sdd.md)
- Commit 規範：[commit 指令](commit.md)
- 規格：[SPEC-011](../../../../docs/specs/cli/shared/SPEC-011-retroactive-spec-tracking.md)
