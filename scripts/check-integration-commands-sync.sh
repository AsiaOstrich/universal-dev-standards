#!/bin/bash
# Thin wrapper — scripts/check-integration-commands-sync.ts is the only copy
# of the comparison logic. This file used to be a full second implementation
# (bash) with a header that already read "DEPRECATED: Use ... .ts instead"
# — but the deprecation marker was never enforced: pre-release-check.sh
# step 7.5 still called this .sh filename directly (unconditional run_check,
# its exit code counted toward PASSED/FAILED), and
# tests/scripts/check-scripts-passing.bats targets it by filename. The .ts
# was only reachable via `npm run check:integration-commands` or a manual
# `tsx` call.
#
# The .sh also had a real, intermittent defect the .ts does not share: its
# per-command match used `echo "$file_content" | grep -qE "..."` — `grep -q`
# exits as soon as it finds a match, which can close the pipe's read end
# before `echo` finishes writing, producing a bash "write error: Broken
# pipe" line on stderr. Reproduced 3 consecutive runs against this repo's
# real integrations/REGISTRY.json + agent instruction files: 0, 9, then 0
# stray "Broken pipe" lines — a timing-dependent count, not a fixed one.
# Those lines would leak into pre-release-check.sh's captured `2>&1` output
# on a real release-gate run. The .ts version matches with an in-memory
# RegExp.test() — no subprocess, no pipe, no possible SIGPIPE — and was
# immune across the same 3 runs.
#
# Fixed by converging on one implementation instead of maintaining two: this
# file now execs check-integration-commands-sync.ts. Kept (not deleted)
# because tests/scripts/check-scripts-passing.bats targets this filename
# directly. Do not add logic here — add it to the .ts file.
#
# 極薄 wrapper —— scripts/check-integration-commands-sync.ts 是唯一一份比對
# 邏輯。這個檔案曾是完整的第二份實作（bash），檔頭本來就寫著「DEPRECATED:
# Use ... .ts instead」——但這個棄用標記從未被強制執行：pre-release-check.sh
# 第 7.5 步仍直接呼叫這個 .sh 檔名（無條件的 run_check，其 exit code 會計入
# PASSED/FAILED），且 tests/scripts/check-scripts-passing.bats 是用這個檔名
# 直接定址的。.ts 只能透過 `npm run check:integration-commands` 或手動
# `tsx` 呼叫觸及。
#
# .sh 還有一個 .ts 沒有的真實、間歇性缺陷：它逐一比對指令時用的是
# `echo "$file_content" | grep -qE "..."`——`grep -q` 一找到匹配就會提早結
# 束，可能在 `echo` 寫完之前就關閉管線的讀取端，讓 bash 在 stderr 印出
# 「write error: Broken pipe」。對這個 repo 真實的 integrations/REGISTRY.json
# 與 agent 指令檔連續跑 3 次重現：0、9、再 0 筆雜訊「Broken pipe」——次數
# 隨時序而變，不是固定值。這些雜訊在真正的發版閘門執行時會透過 `2>&1` 洩漏
# 進 pre-release-check.sh 捕捉到的輸出。.ts 版本用記憶體內的
# RegExp.test() 比對——沒有子行程、沒有管線、不可能有 SIGPIPE——同樣 3 次
# 執行完全不受影響。
#
# 解法是收斂成一份實作而非維護兩份：這個檔案現在直接 exec
# check-integration-commands-sync.ts。保留（不刪除）是因為
# tests/scripts/check-scripts-passing.bats 是用這個檔名直接定址的。不要在
# 這裡加邏輯——邏輯一律加在 .ts 檔。
#
# Usage: ./scripts/check-integration-commands-sync.sh [options]

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
    echo "tsx not found — cannot run check-integration-commands-sync.ts" >&2
    echo "Install it (npm i) or add tsx to PATH." >&2
    exit 1
fi

exec $TSX "$SCRIPT_DIR/check-integration-commands-sync.ts" "$@"
