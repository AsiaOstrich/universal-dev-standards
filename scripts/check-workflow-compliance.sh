#!/bin/bash
# Thin wrapper — scripts/check-workflow-compliance.ts is the only copy of the
# comparison logic. This file used to be a full second implementation
# (POSIX sh) with a header that already read "DEPRECATED: Use ... .ts
# instead" — but the deprecation marker was never enforced: two real, active
# entry points still called this .sh filename directly:
#   - cli/.husky/pre-commit (the real pre-commit hook — this repo's
#     core.hooksPath is cli/.husky/_) runs it unconditionally on every commit
#     and ignores its exit code entirely.
#   - pre-release-check.sh step 17 ran it and counted "⚠️" occurrences in its
#     output.
# The .ts was only reachable via `npm run check:workflow-compliance` or a
# manual `tsx` call. A fix landing only in the "documented canonical" .ts
# file (as its own comment instructs future edits to do) would silently
# never run through either real entry point — verified: a temporary probe
# line added to the .ts main() printed when run via `tsx`, but not through
# `bash check-workflow-compliance.sh` before this change.
#
# The two implementations were otherwise a faithful port — including
# preserving the one subtle behavioral distinction between its two workflow-
# state checks: Check 1 (active workflows) recurses into subdirectories
# (`find -name`), Check 3 (stale workflow states) only looks at top-level
# files (a bash glob, `"$DIR"/*.yaml`). The .ts mirrors both, not just one.
#
# Fixed by converging on one implementation instead of maintaining two: this
# file now execs check-workflow-compliance.ts. Kept (not deleted) because
# cli/.husky/pre-commit and tests/scripts/check-scripts-passing.bats both
# target this filename directly. Do not add logic here — add it to the .ts
# file.
#
# 極薄 wrapper —— scripts/check-workflow-compliance.ts 是唯一一份比對邏輯。
# 這個檔案曾是完整的第二份實作（POSIX sh），檔頭本來就寫著「DEPRECATED: Use
# ... .ts instead」——但這個棄用標記從未被強制執行：有兩個真正、生效中的進
# 入點仍直接呼叫這個 .sh 檔名：
#   - cli/.husky/pre-commit（真正的 pre-commit hook——本 repo 的
#     core.hooksPath 是 cli/.husky/_）在每一次 commit 都無條件執行它，且完
#     全忽略它的 exit code。
#   - pre-release-check.sh 第 17 步會執行它並計算輸出中「⚠️」出現的次數。
# .ts 只能透過 `npm run check:workflow-compliance` 或手動 `tsx` 呼叫觸及。一
# 個只落在「文件上寫明的正典」.ts 檔（它自己的註解也指示未來的修改都加在這
# 裡）的修正，會透過這兩個真正進入點悄悄地永遠不會執行——已驗證：在 .ts 的
# main() 加一行暫時的探針，透過 `tsx` 執行時會印出，但透過 `bash
# check-workflow-compliance.sh`（收斂前）執行時不會。
#
# 兩份實作在其餘部分是忠實移植——包括保留了它兩項工作流程狀態檢查之間一個
# 細微的行為差異：Check 1（活躍工作流程）會遞迴進子目錄（`find -name`），
# Check 3（過期工作流程狀態）只看頂層檔案（bash glob，`"$DIR"/*.yaml`）。
# .ts 兩者都對應到了，不是只做了其中一個。
#
# 解法是收斂成一份實作而非維護兩份：這個檔案現在直接 exec
# check-workflow-compliance.ts。保留（不刪除）是因為 cli/.husky/pre-commit
# 與 tests/scripts/check-scripts-passing.bats 都是用這個檔名直接定址的。不
# 要在這裡加邏輯——邏輯一律加在 .ts 檔。
#
# Usage: ./scripts/check-workflow-compliance.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Same tsx-resolution fallback as scripts/pre-release-check.sh and
# scripts/check-registry-completeness.sh: `tsx` is not on PATH in every shell
# (nvm-managed installs, non-login shells, a bats subshell, or a bare `git
# commit` outside an interactive login shell), so resolve it explicitly
# rather than assume a bare `tsx` works. This check is advisory-only (never
# blocks a commit either way, per its own "Always exit 0" contract), so a
# missing tsx here degrades to a silent no-op rather than an error.
if command -v tsx >/dev/null 2>&1; then
    TSX="tsx"
elif [ -x "$ROOT_DIR/node_modules/.bin/tsx" ]; then
    TSX="$ROOT_DIR/node_modules/.bin/tsx"
elif npx --no-install tsx --version >/dev/null 2>&1; then
    TSX="npx --no-install tsx"
else
    exit 0
fi

exec $TSX "$SCRIPT_DIR/check-workflow-compliance.ts" "$@"
