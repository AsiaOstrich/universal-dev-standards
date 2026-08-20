#!/bin/bash
# Thin wrapper — scripts/check-commit-spec-reference.ts is the only copy of
# the comparison logic. This file used to be a full second implementation
# (POSIX sh) with a header that already read "DEPRECATED: Use ... .ts
# instead" — but the deprecation marker was never enforced: cli/.husky/
# commit-msg (the real, active commit-msg hook — this repo's core.hooksPath
# is cli/.husky/_) calls this .sh filename directly on every commit, while
# the .ts is only reachable through `npm run check:commit-spec` or a manual
# `tsx` invocation. A fix landing only in the "documented canonical" .ts file
# (as its own comment instructs future edits to do) would silently never run
# through the real hook — verified: a temporary probe line added to the .ts
# main() printed when run via `tsx`, but not through `bash
# check-commit-spec-reference.sh` before this change.
#
# The two implementations were otherwise a faithful line-for-line port
# (same active-spec detection, same feat/fix/功能/修正 pattern, same Refs:
# skip) — the only observed difference was SPEC_IDS list ordering (bash
# `find` traversal order vs. Node `readdirSync` order), not a check either
# side lacks.
#
# Fixed by converging on one implementation instead of maintaining two: this
# file now execs check-commit-spec-reference.ts. Kept (not deleted) because
# cli/.husky/commit-msg and tests/scripts/check-scripts-passing.bats both
# target this filename directly. Do not add logic here — add it to the .ts
# file.
#
# 極薄 wrapper —— scripts/check-commit-spec-reference.ts 是唯一一份比對邏
# 輯。這個檔案曾是完整的第二份實作（POSIX sh），檔頭本來就寫著「DEPRECATED:
# Use ... .ts instead」——但這個棄用標記從未被強制執行：cli/.husky/commit-msg
# （這個 repo 真正、生效中的 commit-msg hook——本 repo 的 core.hooksPath 是
# cli/.husky/_）在每一次 commit 都直接呼叫這個 .sh 檔名，而 .ts 只能透過
# `npm run check:commit-spec` 或手動 `tsx` 呼叫觸及。一個只落在「文件上寫明
# 的正典」.ts 檔（它自己的註解也指示未來的修改都加在這裡）的修正，會透過真
# 正的 hook 悄悄地永遠不會執行——已驗證：在 .ts 的 main() 加一行暫時的探針，
# 透過 `tsx` 執行時會印出，但透過 `bash check-commit-spec-reference.sh`（收
# 斂前）執行時不會。
#
# 兩份實作在其餘部分是逐行對應的忠實移植（相同的 active-spec 偵測、相同的
# feat/fix/功能/修正 pattern、相同的 Refs: 略過邏輯）——唯一觀察到的差異是
# SPEC_IDS 清單順序（bash `find` 走訪順序 vs. Node `readdirSync` 順序），不
# 是任一側缺少的檢查項。
#
# 解法是收斂成一份實作而非維護兩份：這個檔案現在直接 exec
# check-commit-spec-reference.ts。保留（不刪除）是因為 cli/.husky/commit-msg
# 與 tests/scripts/check-scripts-passing.bats 都是用這個檔名直接定址的。不
# 要在這裡加邏輯——邏輯一律加在 .ts 檔。
#
# Usage: ./scripts/check-commit-spec-reference.sh <commit-msg-file>

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Same tsx-resolution fallback as scripts/pre-release-check.sh and
# scripts/check-workflow-compliance.sh (the repo's other real-git-hook
# wrapper): `tsx` is not on PATH in every shell
# (nvm-managed installs, non-login shells, a bats subshell, or a bare `git
# commit` outside an interactive login shell), so resolve it explicitly
# rather than assume a bare `tsx` works. This check is advisory-only
# (never blocks a commit either way), so a missing tsx here degrades to a
# silent no-op rather than an error, matching the original .sh's "never
# exits with non-zero status" contract.
if command -v tsx >/dev/null 2>&1; then
    TSX="tsx"
elif [ -x "$ROOT_DIR/node_modules/.bin/tsx" ]; then
    TSX="$ROOT_DIR/node_modules/.bin/tsx"
elif npx --no-install tsx --version >/dev/null 2>&1; then
    TSX="npx --no-install tsx"
else
    exit 0
fi

exec $TSX "$SCRIPT_DIR/check-commit-spec-reference.ts" "$@"
