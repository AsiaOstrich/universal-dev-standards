#!/bin/bash
# Thin wrapper — scripts/check-flow-gate-report.ts is the only copy of the
# comparison logic. This file used to be a full second implementation (bash)
# that, when `jq` was present, called `jq` directly with `set -euo pipefail`:
# on a malformed flow_gate_report.json, jq's own parse error aborted the
# script (exit 5, raw "jq: parse error: ..." text) instead of reaching the
# case statement's "malformed or missing summary.status field" branch (exit
# 1, with a pointer to core/flow-based-testing.md). The .ts version has no
# such branch — JSON.parse failures are always caught and always produce the
# friendly message — so this gap only existed on the .sh path, which is what
# pre-release-check.sh's step 22 called at release-gate time.
#
# Fixed by converging on one implementation instead of maintaining two: this
# file now execs check-flow-gate-report.ts. Kept (not deleted) because
# pre-release-check.sh still probes for this filename with `[ -f ... ]`
# before running it, and because deleting entry-point files outright is a
# separate decision (XSPEC-376 OQ1), not this convergence. Do not add logic
# here — add it to the .ts file.
#
# 極薄 wrapper —— scripts/check-flow-gate-report.ts 是唯一一份比對邏輯。這個
# 檔案曾是完整的第二份實作（bash），在 `jq` 存在時直接呼叫 `jq`，並搭配
# `set -euo pipefail`：遇到格式錯誤的 flow_gate_report.json 時，jq 自己的
# parse error 會讓腳本直接中止（exit 5，印出原始的「jq: parse error: ...」），
# 而不會走到 case 陳述式裡「malformed or missing summary.status field」那個
# 分支（exit 1，並附上 core/flow-based-testing.md 的指引）。.ts 版本沒有這個
# 分岔——JSON.parse 失敗一律被攔截，一律印出友善訊息——所以這個落差只存在於
# .sh 路徑，而 pre-release-check.sh 第 22 步在發版閘門時呼叫的正是這支 .sh。
#
# 解法是收斂成一份實作而非維護兩份：這個檔案現在直接 exec
# check-flow-gate-report.ts。保留（不刪除）是因為 pre-release-check.sh 仍會用
# `[ -f ... ]` 探測這個檔名存在才呼叫它，而完全刪除進入點檔案是另一個決定
# （XSPEC-376 OQ1），不在本次收斂範圍內。不要在這裡加邏輯——邏輯一律加在
# .ts 檔。
#
# Usage: ./scripts/check-flow-gate-report.sh

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
    echo "tsx not found — cannot run check-flow-gate-report.ts" >&2
    echo "Install it (npm i) or add tsx to PATH." >&2
    exit 1
fi

exec $TSX "$SCRIPT_DIR/check-flow-gate-report.ts" "$@"
