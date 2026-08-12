#!/bin/bash
# Thin wrapper — scripts/bump-version.mjs is the only copy of the bump logic.
# This file used to be a full second implementation (bash), and it was missing
# one step the .mjs has: updating cli/package-lock.json's version fields
# (top-level `version` + `packages[""].version`). CLAUDE.md's release procedure
# names THIS file as the mandatory Step 0, so every release run through the
# documented path left the lockfile pinned at the previous version — and
# nothing downstream noticed: check-version-sync.sh never reads package-lock
# .json, and `npm ci` does not fail (or self-correct) on a root-version
# mismatch. Verified before this change: `bash scripts/bump-version.sh 9.9.9`
# produced cli/package.json 9.9.9 with cli/package-lock.json still 6.4.0, and
# check-version-sync.sh reported "All versions are in sync!".
#
# Fixed by converging on one implementation instead of maintaining two: this
# file now execs bump-version.mjs and is kept only because
# tests/scripts/bump-version.bats targets this filename directly, and because
# CLAUDE.md / core/translation-lifecycle-standards.md / detect-self-adoption.js
# still name it — all of which now route to the .mjs through here.
# Do not add logic here — add it to the .mjs file.
#
# 極薄 wrapper —— scripts/bump-version.mjs 是唯一一份升版邏輯。這個檔案曾是
# 完整的第二份實作（bash），而它少了 .mjs 有的一個步驟：更新
# cli/package-lock.json 的版本欄位（頂層 `version` 與 `packages[""].version`）。
# CLAUDE.md 的發版流程把「這個檔案」列為必經的 Step 0，所以每一次照文件走的
# 發版都會留下停在舊版號的 lockfile——而下游沒有任何東西會發現：
# check-version-sync.sh 從不讀 package-lock.json，`npm ci` 對 root version
# 不一致既不失敗也不修正。改動前已驗證：`bash scripts/bump-version.sh 9.9.9`
# 產出 cli/package.json 9.9.9 而 cli/package-lock.json 仍是 6.4.0，
# check-version-sync.sh 回報「All versions are in sync!」。
#
# 解法是收斂成一份實作而非維護兩份：這個檔案現在直接 exec bump-version.mjs，
# 保留只是因為 tests/scripts/bump-version.bats 用這個檔名直接定址，以及
# CLAUDE.md / core/translation-lifecycle-standards.md / detect-self-adoption.js
# 仍然指名它——這些指向現在都會經由這裡路由到 .mjs。
# 不要在這裡加邏輯——邏輯一律加在 .mjs 檔。
#
# Usage: ./scripts/bump-version.sh <version>

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# node is not a new requirement: the previous implementation already shelled
# out to `npm run prepack` / `npm run check:bundle-parity` /
# `npm run docs:generate-index`, so a machine without node could never have
# completed a bump through this file either.
if ! command -v node >/dev/null 2>&1; then
    echo "node not found — cannot run bump-version.mjs" >&2
    echo "Install Node.js (or add it to PATH) and retry." >&2
    exit 1
fi

exec node "$SCRIPT_DIR/bump-version.mjs" "$@"
