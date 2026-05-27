# Threads Caption — v5.14.0

> **Format**: 3-post thread (use Threads "Add to thread" feature to chain them)
> **Separator**: `---` between posts (machine-parseable for future automation)
> **Posted**: (fill in after posting)

---

## Post 1 (hook + Cover 圖)

```
universal-dev-standards v5.14.0 上 npm。

你的工具說「少了 2 個標準」，
但打開資料夾，那兩個檔案就在那裡。

🐛「error-code-standards — missing」
🐛「logging-standards — missing」

false positive — 警報是假的，標準一直都在。
根因怎麼藏進去的 👇
```

---

## Post 2 (root cause + fix)

```
v5.14.0 的修法：

🔍 uds check false-positive 根因
manifest 路徑在讀取時被轉成 registry ID：
  error-codes.ai.yaml → error-code-standards

check 直接拿 ID 去 grep CLAUDE.md。
但 CLAUDE.md 寫的是實際檔名，不是 ID。
這兩個剛好命名不一致，所以永遠找不到。

修法：建一張 id → 實際檔名 查找表，
ID 比對失敗時用真實檔名再確認一次。
順帶加了 regression test。

📋 release-reminder 附帶 TODO 清單
週一 reminder issue 現在自動帶出
RELEASE-FLOW-TODOS.md 的 open 項目，
缺口跨版本持續追蹤，不再遺失在 commit history。
```

---

## Post 3 (trust signal + CTA)

```
這個 bug 是在用 uds check 驗自家專案時發現的。

工具必須對自己誠實——
否則「全綠」只是讓人放心的假象。

69/69 ✅ 現在是真的。

npm install universal-dev-standards
github.com/AsiaOstrich/universal-dev-standards
```
