# scripts/

Maintenance, sync-check and release-automation scripts for the UDS repository.
維護、同步檢查與發版自動化腳本集中於此。

## Layout / 目錄

- `*.sh` — POSIX/bash scripts (primary on macOS / Linux CI; legacy where `.mjs`/`.ts` exists)
- `*.ps1` — PowerShell mirrors (Windows contributors; superseded by `.ts` for new scripts)
- `*.mjs` — Node.js ESM scripts (cross-platform, no transpilation)
- `*.ts` — TypeScript scripts (cross-platform via `tsx`); preferred for new scripts
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

### Pre-commit hook (cross-platform) / 預提交鉤子（跨平台）

The git pre-commit hook is implemented in Node.js for cross-platform support
(XSPEC-180):

- `.githooks/pre-commit` — Thin POSIX `sh` shim (works on macOS / Linux /
  Windows via Git for Windows' bundled `sh`).
- `scripts/pre-commit.mjs` — Real logic (Node.js ESM, no bash dependencies).

Install once with `node scripts/install-hooks.mjs`. The hook is **advisory**:
it warns when modifying `core/*.md` standards without updating translations,
but never blocks the commit. Hard gates (exit 1) live in
`pre-release-check.sh`, not here.

The translation sync check is platform-aware: PowerShell + `.ps1` on Windows,
bash + `.sh` on macOS/Linux (via the same `buildCmd()` pattern as
`bump-version.mjs`).

git pre-commit hook 已改為 Node.js 跨平台實作（XSPEC-180）：`.githooks/pre-commit`
為極簡 POSIX `sh` 殼層，實際邏輯在 `scripts/pre-commit.mjs`。Hook 為 advisory，
僅在修改 `core/*.md` 但翻譯未同步時警告，不會擋 commit。

## Cross-platform check scripts (TypeScript) / 跨平台檢查腳本（TypeScript）

The following quality-check scripts are implemented in TypeScript and run via
`tsx`. They replace the legacy bash variants for cross-platform consistency
(XSPEC-179 Phase 2).

以下品質檢查腳本以 TypeScript 實作，透過 `tsx` 執行。它們取代了原 bash 版本以
達成跨平台一致性（XSPEC-179 Phase 2）。

| Script | npm script | Replaces |
|--------|------------|----------|
| `check-ai-behavior-sync.ts` | `npm run check:ai-behavior` | `check-ai-behavior-sync.sh` |
| `check-commit-spec-reference.ts` | `npm run check:commit-spec` | `check-commit-spec-reference.sh` |
| `check-flow-gate-report.ts` | `npm run check:flow-gate` | `check-flow-gate-report.sh` |
| `check-integration-commands-sync.ts` | `npm run check:integration-commands` | `check-integration-commands-sync.sh` |
| `check-registry-completeness.ts` | `npm run check:registry` | `check-registry-completeness.sh` |
| `check-release-readiness-signoff.ts` | `npm run check:release-signoff` | `check-release-readiness-signoff.sh` |
| `check-workflow-compliance.ts` | `npm run check:workflow-compliance` | `check-workflow-compliance.sh` |

### Strategy: single TypeScript source / 策略：單一 TypeScript 來源

This batch deliberately avoids the previous bash + PowerShell dual-track
pattern. A single `.ts` file runs unchanged on macOS / Linux / Windows via
`tsx`, eliminating the "can only verify on Windows" feedback gap.

本批次刻意避開先前 bash + PowerShell 雙軌模式。單一 `.ts` 檔透過 `tsx` 在
macOS / Linux / Windows 上執行結果一致，消除「只能在 Windows 驗證」的反饋落差。

The original `.sh` files are kept with `DEPRECATED` notices for legacy
Linux/macOS compatibility but should not be added to.

原 `.sh` 檔保留並加 `DEPRECATED` 警告供 legacy Linux/macOS 相容，但不應再新增。

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

### When adding a new script / 新增腳本時

For **new scripts**, prefer TypeScript:

1. Implement `scripts/<name>.ts`
2. Add an npm script entry in root `package.json` (`tsx scripts/<name>.ts`)
3. Optionally add a Vitest unit test (XSPEC-179 Phase 3, evaluation pending)

For **legacy shell scripts** that already exist, BATS smoke tests remain
valid — see template above.

新增**新腳本**時優先採用 TypeScript：
1. 實作 `scripts/<name>.ts`
2. 在 root `package.json` 新增對應 npm script（`tsx scripts/<name>.ts`）
3. 可選擇加入 Vitest 單元測試（XSPEC-179 Phase 3，待 ADR）

對於**既有的 shell 腳本**，BATS 冒煙測試仍然有效，見上方樣板。
