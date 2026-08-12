#!/bin/bash
# Thin wrapper — scripts/check-ai-behavior-sync.ts is the only copy of the
# comparison logic. This file used to be a full second implementation
# (bash) with a header that already read "DEPRECATED: Use ... .ts instead"
# — but the deprecation marker was never enforced: pre-release-check.sh
# step 16 still called this .sh filename directly (unconditional run_check,
# its exit code counted toward PASSED/FAILED), and
# tests/scripts/check-scripts-passing.bats targets it by filename. The .ts
# was only reachable via `npm run check:ai-behavior` or a manual `tsx` call.
# A fix landing only in the "documented canonical" .ts file (as its own
# comment instructs future edits to do) would silently never run through
# the release gate — verified: a temporary probe line added to the .ts
# main() printed when run via `tsx`, but not through `bash
# check-ai-behavior-sync.sh` before this change.
#
# The two implementations were otherwise a faithful port (same whitelist,
# same --verbose/--help handling, same coverage counting) — confirmed by
# running both against the real skills/commands/ directory and diffing
# output.
#
# Fixed by converging on one implementation instead of maintaining two: this
# file now execs check-ai-behavior-sync.ts. Kept (not deleted) because
# tests/scripts/check-scripts-passing.bats targets this filename directly.
# Do not add logic here — add it to the .ts file.
#
# 極薄 wrapper —— scripts/check-ai-behavior-sync.ts 是唯一一份比對邏輯。這個
# 檔案曾是完整的第二份實作（bash），檔頭本來就寫著「DEPRECATED: Use ... .ts
# instead」——但這個棄用標記從未被強制執行：pre-release-check.sh 第 16 步仍
# 直接呼叫這個 .sh 檔名（無條件的 run_check，其 exit code 會計入
# PASSED/FAILED），且 tests/scripts/check-scripts-passing.bats 是用這個檔名
# 直接定址的。.ts 只能透過 `npm run check:ai-behavior` 或手動 `tsx` 呼叫觸
# 及。一個只落在「文件上寫明的正典」.ts 檔（它自己的註解也指示未來的修改都
# 加在這裡）的修正，會透過發版閘門悄悄地永遠不會執行——已驗證：在 .ts 的
# main() 加一行暫時的探針，透過 `tsx` 執行時會印出，但透過 `bash
# check-ai-behavior-sync.sh`（收斂前）執行時不會。
#
# 兩份實作在其餘部分是忠實移植（相同的 whitelist、相同的
# --verbose/--help 處理、相同的覆蓋率計數）——已透過對真實
# skills/commands/ 目錄執行兩者並比對輸出確認。
#
# 解法是收斂成一份實作而非維護兩份：這個檔案現在直接 exec
# check-ai-behavior-sync.ts。保留（不刪除）是因為
# tests/scripts/check-scripts-passing.bats 是用這個檔名直接定址的。不要在
# 這裡加邏輯——邏輯一律加在 .ts 檔。
#
# Usage: ./scripts/check-ai-behavior-sync.sh [options]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Same tsx-resolution fallback as scripts/pre-release-check.sh and
# scripts/check-registry-completeness.sh: `tsx` is not on PATH in every shell
# (nvm-managed installs, non-login shells, a bats subshell), so resolve it
# explicitly rather than assume a bare `tsx` works.
if command -v tsx >/dev/null 2>&1; then
    TSX="tsx"
elif [ -x "$ROOT_DIR/node_modules/.bin/tsx" ]; then
    TSX="$ROOT_DIR/node_modules/.bin/tsx"
elif npx --no-install tsx --version >/dev/null 2>&1; then
    TSX="npx --no-install tsx"
else
    echo "tsx not found — cannot run check-ai-behavior-sync.ts" >&2
    echo "Install it (npm i) or add tsx to PATH." >&2
    exit 1
fi

exec $TSX "$SCRIPT_DIR/check-ai-behavior-sync.ts" "$@"
