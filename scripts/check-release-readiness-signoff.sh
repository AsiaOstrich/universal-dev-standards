#!/bin/bash
# Thin wrapper — scripts/check-release-readiness-signoff.ts is the only copy
# of the comparison logic. This file used to be a full second implementation
# (bash) whose count patterns were `grep -c "PATTERN" "$file" 2>/dev/null ||
# echo "0"`. `grep -c` exits 1 (not 0) when it finds zero matches — even
# though it still prints "0" — so on the common case of a clean sign-off
# (zero "| FAIL" lines, zero unchecked "[ ] **GO**" lines) the `||` fired
# anyway and appended a second "0", leaving the variable holding "0\n0"
# instead of "0". The subsequent `[ "$var" -gt 0 ]` then failed with "integer
# expression expected" on every single run against a clean document. It
# happened not to flip the final pass/fail outcome here (an erroring `[ ]` in
# an `if` condition is exempt from `set -e` and is treated as false, which is
# the correct answer when the true count is 0) — but it polluted the
# script's own stderr on every normal run, and would have surfaced as
# confusing noise anywhere its combined output got displayed. The .ts version
# has no such gap: it counts matches with an explicit per-line loop instead
# of an external tool whose exit code conflates "zero matches" with "error".
#
# Fixed by converging on one implementation instead of maintaining two: this
# file now execs check-release-readiness-signoff.ts. Kept (not deleted)
# because pre-release-check.sh still probes for this filename with
# `[ -f ... ]` before running it. Do not add logic here — add it to the .ts
# file.
#
# 極薄 wrapper —— scripts/check-release-readiness-signoff.ts 是唯一一份比對
# 邏輯。這個檔案曾是完整的第二份實作（bash），它的計數寫法是
# `grep -c "PATTERN" "$file" 2>/dev/null || echo "0"`。`grep -c` 在零筆命中
# 時會回傳 exit 1（即使它仍然印出「0」）——所以在最常見的情境（乾淨的簽核文
# 件，零筆「| FAIL」、零筆未勾選的「[ ] **GO**」）下，`||` 還是會觸發，多印
# 一個「0」，讓變數變成「0\n0」而不是「0」。接下來的 `[ "$var" -gt 0 ]` 因
# 此在每一次對乾淨文件的執行中都會噴出「integer expression expected」錯
# 誤。這裡剛好沒有改變最終的通過/失敗結論（`if` 條件裡出錯的 `[ ]` 不受
# `set -e` 影響、且會被當成假，而真實計數為 0 時「假」正是對的答案）——但
# 它汙染了每一次正常執行的 stderr，且只要合併輸出被顯示出來就會變成干擾雜
# 訊。.ts 版本沒有這個落差：它用逐行迴圈明確計數，不依賴一個把「零筆命中」
# 和「錯誤」混在同一個 exit code 裡的外部工具。
#
# 解法是收斂成一份實作而非維護兩份：這個檔案現在直接 exec
# check-release-readiness-signoff.ts。保留（不刪除）是因為
# pre-release-check.sh 呼叫前仍會用 `[ -f ... ]` 探測這個檔名。不要在這裡加
# 邏輯——邏輯一律加在 .ts 檔。
#
# Usage: ./scripts/check-release-readiness-signoff.sh

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
    echo "tsx not found — cannot run check-release-readiness-signoff.ts" >&2
    echo "Install it (npm i) or add tsx to PATH." >&2
    exit 1
fi

exec $TSX "$SCRIPT_DIR/check-release-readiness-signoff.ts" "$@"
