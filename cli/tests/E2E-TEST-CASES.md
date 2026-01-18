# UDS CLI E2E 測試案例規格

> **自動生成文件** - 由 `npm run generate:e2e-spec` 從測試程式碼生成
>
> 最後更新: 2026-01-18 | 總測試數: 73

此文件記錄 UDS CLI 的端對端（E2E）測試案例，作為測試的永久規格文件與程式碼審查依據。

## 總覽

### 測試統計

| 指令 | 測試數量 | 檔案 |
|------|----------|------|
| `uds init` | 20 | `e2e/init-flow.test.js` |
| `uds config` | 10 | `e2e/config-flow.test.js` |
| `uds check` | 16 | `e2e/check-flow.test.js` |
| `uds update` | 10 | `e2e/update-flow.test.js` |
| `uds list` | 11 | `e2e/list-flow.test.js` |
| `uds skills` | 6 | `e2e/skills-flow.test.js` |
| **總計** | **73** | |

---

## 測試案例詳情

### uds init（20 tests）

#### Scenario D: Already Initialized Project（1 test）

| # | 測試案例 |
|---|----------|
| 1 | should show warning when .standards/ already exists |

#### Scenario C: Non-Interactive Mode (--yes)（9 tests）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should complete with default settings | `-` |
| 2 | should respect --level option | `--level=3` |
| 3 | should use marketplace when --skills-location=marketplace | `--skills-location=marketplace` |
| 4 | should use complete scope when --skills-location=none | `--skills-location=none` |
| 5 | should respect --content-mode=full | `--content-mode=full` |
| 6 | should respect --content-mode=minimal | `--content-mode=minimal` |
| 7 | should generate .md files when --format=human | `--format=human` |
| 8 | should generate both formats when --format=both | `--format=both` |
| 9 | should generate .ai.yaml files when --format=ai (default) | `--format=ai` |

#### Output Message Coverage（4 tests）

| # | 測試案例 |
|---|----------|
| 1 | should show all header messages |
| 2 | should show detected languages in output |
| 3 | should show all summary section labels |
| 4 | should show success and next steps messages |

#### File Output Verification（6 tests）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should create .standards/manifest.json with correct structure | `-` |
| 2 | should copy standard files based on level | `--level=2` |
| 3 | should record content mode in manifest | `--content-mode=full` |
| 4 | should save standard options to manifest in non-interactive mode | `-` |
| 5 | should save detected aiTools to manifest when CLAUDE.md exists | `-` |
| 6 | should auto-install commands when AGENTS.md exists (OpenCode detection) | `-` |

---

### uds config（10 tests）

#### Pre-requisite Checks（2 tests）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show error when not initialized | `--type=format --yes` |
| 2 | should show header when initialized | `--type=format --yes` |

#### Configuration Display（3 tests）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should display current configuration labels | `--level=2 --type=format --yes` |
| 2 | should display AI tools when configured | `--type=format --yes` |
| 3 | should show methodology with -E flag | `--type=format --yes -E` |

#### Manifest State（2 tests）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should have correct structure after init | `--level=2` |
| 2 | should preserve options from init | `-` |

#### Integration Files State（2 tests）

| # | 測試案例 |
|---|----------|
| 1 | should create .cursorrules when cursor detected |
| 2 | should track integrations in manifest |

#### Command Help（1 test）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show help with --help | `--help` |

---

### uds check（16 tests）

#### Pre-requisite Checks（1 test）

| # | 測試案例 |
|---|----------|
| 1 | should show error when not initialized |

#### Basic Check Output（3 tests）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show header and status when initialized | `--no-interactive` |
| 2 | should show level and version information | `--level=2 --no-interactive` |
| 3 | should show file integrity section | `--no-interactive` |

#### Summary Mode（2 tests）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show compact summary with --summary flag | `--summary` |
| 2 | should show not initialized in summary mode when not initialized | `--summary` |

#### Coverage and Skills Status（2 tests）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show coverage summary | `--level=2 --no-interactive` |
| 2 | should show skills status section | `--no-interactive` |

#### Modified Files Detection（1 test）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should detect modified files | `--no-interactive` |

#### Diff Mode（2 tests）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show diff output with --diff flag | `--diff --no-interactive` |
| 2 | / | `-` |

#### Restore Mode（2 tests）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should restore modified files with --restore flag | `--restore --no-interactive` |
| 2 | / | `-` |

#### Offline Mode（1 test）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should skip CLI update check with --offline flag | `--offline --no-interactive` |

#### Migrate Mode（1 test）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show migrate output with --migrate flag | `--migrate --no-interactive` |

#### Command Help（1 test）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show help with --help | `--help` |

---

### uds update（10 tests）

#### Pre-requisite Checks（1 test）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show error when not initialized | `--yes` |

#### Basic Update Output（2 tests）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show header and version info when initialized | `--yes --offline` |
| 2 | should show up-to-date message when no updates available | `--yes --offline` |

#### Integrations Only Mode（2 tests）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show no AI tools error when none configured | `--skills-location=none --integrations-only` |
| 2 | should regenerate integration files with --integrations-only | `--integrations-only` |

#### Standards Only Mode（1 test）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should update only standards with --standards-only | `--yes --offline --standards-only` |

#### Sync Refs Mode（1 test）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should sync integration references with --sync-refs | `--sync-refs` |

#### Skills Update Mode（1 test）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show skills status with --skills | `--skills` |

#### Commands Update Mode（1 test）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show commands status with --commands | `--commands` |

#### Command Help（1 test）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show help with --help | `--help` |

---

### uds list（11 tests）

#### Basic List Output（4 tests）

| # | 測試案例 |
|---|----------|
| 1 | should show header and version |
| 2 | should show standards categories |
| 3 | should show summary at bottom |
| 4 | should show init hint at bottom |

#### Level Filtering（3 tests）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should filter by level 1 | `--level=1` |
| 2 | should filter by level 2 | `--level=2` |
| 3 | should show error for invalid level | `--level=5` |

#### Category Filtering（3 tests）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should filter by skill category | `--category=skill` |
| 2 | should filter by reference category | `--category=reference` |
| 3 | should show error for invalid category | `--category=invalid` |

#### Command Help（1 test）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show help with --help | `--help` |

---

### uds skills（6 tests）

#### Basic Skills Output（3 tests）

| # | 測試案例 |
|---|----------|
| 1 | should show header |
| 2 | should show no skills message when none installed |
| 3 | should show marketplace install hint when no skills |

#### Skills Status Display（2 tests）

| # | 測試案例 |
|---|----------|
| 1 | should show version info when skills are installed |
| 2 | should show path info when skills are installed |

#### Command Help（1 test）

| # | 測試案例 | 選項 |
|---|----------|------|
| 1 | should show help with --help | `--help` |

---

## 選項覆蓋矩陣

### uds init

| 選項 | 有測試 | 測試案例 |
|------|--------|----------|
| `--yes` | ❌ | 待新增 |
| `--level` | ✅ | should respect --level option |
| `--skills-location` | ✅ | should use marketplace when --skills-... |
| `--content-mode` | ✅ | should respect --content-mode=full |
| `--format` | ✅ | should generate .md files when --form... |
| `--locale` | ❌ | 待新增 |

### uds config

| 選項 | 有測試 | 測試案例 |
|------|--------|----------|
| `--type` | ✅ | should show error when not initialized |
| `--yes` | ✅ | should show error when not initialized |
| `--help` | ✅ | should show help with --help |
| `-E` | ✅ | should show methodology with -E flag |

### uds check

| 選項 | 有測試 | 測試案例 |
|------|--------|----------|
| `--summary` | ✅ | should show compact summary with --su... |
| `--diff` | ✅ | should show diff output with --diff flag |
| `--restore` | ✅ | should restore modified files with --... |
| `--migrate` | ✅ | should show migrate output with --mig... |
| `--offline` | ✅ | should skip CLI update check with --o... |
| `--help` | ✅ | should show help with --help |
| `--no-interactive` | ✅ | should show header and status when in... |

### uds update

| 選項 | 有測試 | 測試案例 |
|------|--------|----------|
| `--yes` | ✅ | should show error when not initialized |
| `--integrations-only` | ✅ | should show no AI tools error when no... |
| `--standards-only` | ✅ | should update only standards with --s... |
| `--sync-refs` | ✅ | should sync integration references wi... |
| `--skills` | ✅ | should show skills status with --skills |
| `--commands` | ✅ | should show commands status with --co... |
| `--offline` | ✅ | should show header and version info w... |
| `--help` | ✅ | should show help with --help |

### uds list

| 選項 | 有測試 | 測試案例 |
|------|--------|----------|
| `--level` | ✅ | should filter by level 1 |
| `--category` | ✅ | should filter by skill category |
| `--help` | ✅ | should show help with --help |

### uds skills

| 選項 | 有測試 | 測試案例 |
|------|--------|----------|
| `--help` | ✅ | should show help with --help |


## 維護指引

### 自動同步機制

此文件由腳本自動生成，確保與測試程式碼同步：

```bash
# 重新生成規格文件
npm run generate:e2e-spec

# 檢查規格文件是否最新（用於 CI）
npm run generate:e2e-spec -- --check
```

### 新增測試時

1. 在對應的 `e2e/*-flow.test.js` 檔案中新增測試
2. 執行 `npm run generate:e2e-spec` 更新此文件
3. 提交測試程式碼與更新後的規格文件

### 測試檔案結構

```
cli/tests/
├── e2e/
│   ├── init-flow.test.js
│   ├── config-flow.test.js
│   ├── check-flow.test.js
│   ├── update-flow.test.js
│   ├── list-flow.test.js
│   └── skills-flow.test.js
├── fixtures/
│   └── *-scenarios/
│       └── expected-messages.json
└── E2E-TEST-CASES.md  ← 本文件（自動生成）
```
