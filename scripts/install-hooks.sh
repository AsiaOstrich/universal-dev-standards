#!/bin/bash
# Thin wrapper — scripts/install-hooks.mjs is the only copy of the installer
# logic. This file used to be a full second implementation (bash). Unlike the
# bump-version pair, no check was missing here: on macOS/Linux the two files
# did the same three things (set core.hooksPath, chmod the hooks, list them),
# so this convergence closes a drift risk rather than a present defect.
#
# The risk was real, though, because the two entry points disagreed about
# which file to run. core/translation-lifecycle-standards.md and its
# .standards/ + ai/ .ai.yaml copies name this .sh in their machine-readable
# `setup:` field, while scripts/README.md, scripts/pre-commit.mjs and
# .githooks/pre-commit name the .mjs. Control-group test before this change: a
# temporary probe line added only to install-hooks.mjs printed under `node
# scripts/install-hooks.mjs` but not under `bash scripts/install-hooks.sh` —
# the path the standard's `setup:` field sends you down. Anything fixed in the
# file every comment calls canonical would never have reached that path.
#
# Do not add logic here — add it to the .mjs file.
#
# 極薄 wrapper —— scripts/install-hooks.mjs 是唯一一份安裝邏輯。這個檔案曾是
# 完整的第二份實作（bash）。與 bump-version 那一對不同，這裡沒有任何缺漏的
# 檢查：在 macOS/Linux 上兩份做的是同樣三件事（設定 core.hooksPath、對 hooks
# 執行 chmod、列出它們），所以這次收斂關掉的是漂移風險，不是現存缺陷。
#
# 但風險是真的，因為兩個入口對「該跑哪一份」的說法不一致。
# core/translation-lifecycle-standards.md 及它在 .standards/ 與 ai/ 的
# .ai.yaml 複本，在機器可讀的 `setup:` 欄位指名這支 .sh；而
# scripts/README.md、scripts/pre-commit.mjs 與 .githooks/pre-commit 指名的是
# .mjs。改動前的對照組實測：只加在 install-hooks.mjs 的一行暫時探針，在
# `node scripts/install-hooks.mjs` 下會印出，在 `bash
# scripts/install-hooks.sh` 下不會——而後者正是標準的 `setup:` 欄位把人送去
# 的那條路徑。任何修在「所有註解都稱之為正典」那個檔案上的東西，都到不了這
# 條路徑。
#
# 不要在這裡加邏輯——邏輯一律加在 .mjs 檔。
#
# Usage: ./scripts/install-hooks.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v node >/dev/null 2>&1; then
    echo "node not found — cannot run install-hooks.mjs" >&2
    echo "Install Node.js (or add it to PATH) and retry." >&2
    exit 1
fi

exec node "$SCRIPT_DIR/install-hooks.mjs" "$@"
