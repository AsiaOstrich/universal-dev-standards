# scripts/

Maintenance, sync-check and release-automation scripts for the UDS repository.
維護、同步檢查與發版自動化腳本集中於此。

## Layout / 目錄

- `*.sh` — POSIX/bash scripts (primary on macOS / Linux CI)
- `*.ps1` — PowerShell mirrors (Windows contributors)
- `*.mjs` — Node-based generators (manifest, docs, version); cross-platform replacements for critical `.sh` scripts
- `hooks/`, `transform/` — sub-tooling

## Cross-platform release scripts / 跨平台發版腳本

The following Node.js ESM scripts are the **recommended** way to run release operations
on any platform (macOS, Linux, Windows). The `.sh` originals are kept for legacy
compatibility but carry a DEPRECATED notice.

以下 Node.js ESM 腳本是在任何平台（macOS、Linux、Windows）執行發版操作的**推薦方式**。
`.sh` 原檔保留供舊環境相容，但已標記為棄用。

### `bump-version.mjs` — Version bump / 版本升版

```bash
# Bump to a beta release / 升版至 beta
node scripts/bump-version.mjs 5.7.0-beta.1

# Bump to a stable release / 升版至穩定版
node scripts/bump-version.mjs 5.7.0
```

Updates all version files atomically:
- `cli/package.json`
- `cli/standards-registry.json` (all `version` fields)
- `uds-manifest.json` (`version` + `last_updated`)
- `README.md`, `locales/zh-TW/README.md`, `locales/zh-CN/README.md`
- `locales/*/CHANGELOG.md` frontmatter (`source_version`, `translation_version`, `last_synced`)
- `.claude-plugin/plugin.json` and `marketplace.json` (stable releases only)

Then verifies consistency via `check-version-sync.sh` and runs `check-translation-sync.sh`
as an advisory check.

Legacy equivalent: `./scripts/bump-version.sh <version>` (macOS/Linux only)

### `install-hooks.mjs` — Git hooks installer / Git Hooks 安裝程式

```bash
node scripts/install-hooks.mjs
```

Configures git to use `.githooks/` as the hooks directory.
Skips `chmod` automatically on Windows.

Uninstall / 解除安裝:
```bash
git config --unset core.hooksPath
```

Legacy equivalent: `./scripts/install-hooks.sh` (macOS/Linux only)

## Testing convention / 測試慣例

All non-trivial shell scripts SHOULD have **smoke tests** under
`tests/scripts/<script-name>.bats` driven by [bats-core](https://github.com/bats-core/bats-core).

所有非瑣碎的 shell 腳本都應該在 `tests/scripts/<script-name>.bats` 下有冒煙測試，
使用 [bats-core](https://github.com/bats-core/bats-core)。

### Why / 為什麼
BUG-A07 (XSPEC-073, 2026-Q2 audit) flagged that 23 shell scripts had **zero**
unit tests, exposing the repo to silent regressions during refactors.
Phase 1 introduces the bats-core harness plus 3 smoke tests for the highest-
risk sync checkers; remaining scripts are queued for Phase 2.

BUG-A07 指出 23 個 shell 腳本**完全沒有**單元測試，重構時容易發生靜默回歸。
Phase 1 已建立 bats-core 框架並覆蓋 3 個高風險同步檢查腳本，其餘排入 Phase 2。

### How to run / 執行方式

```bash
# from repo root
npm run test:scripts
# or directly
tests/bats/bin/bats tests/scripts/
```

bats-core is vendored as a git submodule at `tests/bats/`. Run
`git submodule update --init` after a fresh clone.
bats-core 透過 git submodule 安裝在 `tests/bats/`，clone 後請執行
`git submodule update --init`。

### Smoke-test template / 冒煙測試樣板

A minimal `.bats` file should cover:
最小 `.bats` 檔應涵蓋：

1. Script file exists / 檔案存在
2. Script is executable (`-x`) / 可執行
3. Script runs from repo root with the documented exit code
   / 從 repo root 執行，回傳預期 exit code
4. Output contains a known stable keyword (summary line, error code, etc.)
   / 輸出包含穩定關鍵字（摘要行、錯誤碼等）

```bash
#!/usr/bin/env bats
setup() {
  REPO_ROOT="$(cd "$BATS_TEST_DIRNAME/../.." && pwd)"
  SCRIPT="$REPO_ROOT/scripts/<your-script>.sh"
}

@test "<script> exists" { [ -f "$SCRIPT" ]; }
@test "<script> is executable" { [ -x "$SCRIPT" ]; }
@test "<script> runs successfully from repo root" {
  cd "$REPO_ROOT"
  run bash "$SCRIPT"
  [ "$status" -eq 0 ]
}
```

See `tests/scripts/check-version-sync.bats` for a complete reference.
完整參考範例見 `tests/scripts/check-version-sync.bats`。

### When adding a new shell script / 新增 shell 腳本時

1. Implement `scripts/<name>.sh`
2. Add `tests/scripts/<name>.bats` with the smoke-test template above
3. Run `npm run test:scripts` locally before committing
