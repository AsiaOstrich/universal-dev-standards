#!/bin/bash
# Thin wrapper — scripts/check-registry-completeness.ts is the only copy of
# the comparison logic. This file used to be a full second implementation
# (bash), but its Check 3 only ever tested file *existence* ([ -f "$dot_file" ]),
# never content — so a .standards/ copy that drifted out of sync with its
# ai/standards/ source read as [OK] here while pre-release-check.sh's step 18
# called this .sh (not the .ts) at release-gate time. The content comparison
# added to the .ts version (sha256, catches exactly that drift) never ran in
# the actual release gate as a result.
#
# Fixed by converging on one implementation instead of maintaining two: this
# file now execs check-registry-completeness.ts and kept only because
# tests/scripts/check-registry-completeness.bats targets this filename
# directly. Do not add logic here — add it to the .ts file.
#
# 極薄 wrapper —— scripts/check-registry-completeness.ts 是唯一一份比對邏輯。
# 這個檔案曾是完整的第二份實作（bash），但它的第 3 項檢查一直只驗證檔案
# 是否「存在」（[ -f "$dot_file" ]），從未比對內容——所以一份已與
# ai/standards/ 來源漂移的 .standards/ 複本在這裡會顯示 [OK]，而
# pre-release-check.sh 第 18 步呼叫的正是這支 .sh（不是 .ts）。加在 .ts
# 版本上的內容比對（sha256，正好能抓到這種漂移）因此從未在真正的發版閘門
# 跑過。
#
# 解法是收斂成一份實作而非維護兩份：這個檔案現在直接 exec
# check-registry-completeness.ts，保留只是因為
# tests/scripts/check-registry-completeness.bats 是用這個檔名去呼叫的。
# 不要在這裡加邏輯——邏輯一律加在 .ts 檔。
#
# Usage: ./scripts/check-registry-completeness.sh [--verbose]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Same tsx-resolution fallback as scripts/pre-release-check.sh: `tsx` is not
# on PATH in every shell (nvm-managed installs, non-login shells, a bats
# subshell), so resolve it explicitly rather than assume a bare `tsx` works.
if command -v tsx >/dev/null 2>&1; then
    TSX="tsx"
elif [ -x "$ROOT_DIR/node_modules/.bin/tsx" ]; then
    TSX="$ROOT_DIR/node_modules/.bin/tsx"
elif npx --no-install tsx --version >/dev/null 2>&1; then
    TSX="npx --no-install tsx"
else
    echo "tsx not found — cannot run check-registry-completeness.ts" >&2
    echo "Install it (npm i) or add tsx to PATH." >&2
    exit 1
fi

exec $TSX "$SCRIPT_DIR/check-registry-completeness.ts" "$@"
