# UDS CLI E2E 測試案例規格

此文件記錄 UDS CLI 的端對端（E2E）測試案例，作為測試的永久規格文件與程式碼審查依據。

## 總覽

### 測試統計

| 指令 | 測試數量 | 檔案 |
|------|----------|------|
| `uds init` | 20 | `e2e/init-flow.test.js` |
| `uds config` | 10 | `e2e/config-flow.test.js` |
| `uds check` | 14 | `e2e/check-flow.test.js` |
| `uds update` | 10 | `e2e/update-flow.test.js` |
| `uds list` | 11 | `e2e/list-flow.test.js` |
| `uds skills` | 6 | `e2e/skills-flow.test.js` |
| **總計** | **71** | |

### 指令覆蓋摘要

| 指令 | 選項覆蓋 | 場景覆蓋 |
|------|----------|----------|
| `init` | `--yes`, `--level`, `--skills-location`, `--content-mode`, `--format` | 已初始化、非互動模式、檔案輸出 |
| `config` | `--type`, `--yes`, `--help`, `-E` | 未初始化、設定顯示、狀態驗證 |
| `check` | `--summary`, `--diff`, `--restore`, `--migrate`, `--offline`, `--help` | 未初始化、狀態顯示、檔案完整性 |
| `update` | `--yes`, `--integrations-only`, `--standards-only`, `--sync-refs`, `--skills`, `--commands`, `--offline`, `--help` | 未初始化、版本更新、整合更新 |
| `list` | `--level`, `--category`, `--help` | 分類篩選、等級篩選、錯誤處理 |
| `skills` | `--help` | 技能列表、狀態顯示 |

---

## 測試案例詳情

### uds init（20 tests）

#### Scenario D: Already Initialized（1 test）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should show warning when .standards/ already exists | 當專案已初始化時，顯示警告訊息並提示使用 `uds update` |

#### Scenario C: Non-Interactive Mode（8 tests）

| # | 測試案例 | 選項 | 預期行為 |
|---|----------|------|----------|
| 1 | should complete with default settings | `--yes` | 使用預設設定完成初始化，建立 manifest.json |
| 2 | should respect --level option | `--yes --level=3` | 使用指定等級（Level 3）初始化 |
| 3 | should use marketplace when --skills-location=marketplace | `--yes --skills-location=marketplace` | 使用 Plugin Marketplace，範圍設為 Lean |
| 4 | should use complete scope when --skills-location=none | `--yes --skills-location=none` | 不使用 skills，範圍設為 Complete |
| 5 | should respect --content-mode=full | `--yes --content-mode=full` | 使用 Full Embed 模式 |
| 6 | should respect --content-mode=minimal | `--yes --content-mode=minimal` | 使用 Minimal 模式 |
| 7 | should generate .md files when --format=human | `--yes --format=human` | 生成 .md 格式檔案，Format 顯示為 Detailed |
| 8 | should generate both formats when --format=both | `--yes --format=both` | 同時生成 .md 和 .ai.yaml 檔案 |
| 9 | should generate .ai.yaml files when --format=ai | `--yes --format=ai` | 生成 .ai.yaml 格式檔案，Format 顯示為 Compact |

#### Output Message Coverage（4 tests）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should show all header messages | 顯示標題與分隔線 |
| 2 | should show detected languages in output | 顯示偵測到的程式語言 |
| 3 | should show all summary section labels | 顯示所有摘要區塊標籤（Level, Format, Scope 等） |
| 4 | should show success and next steps messages | 顯示成功訊息與後續步驟 |

#### File Output Verification（6 tests）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should create .standards/manifest.json with correct structure | manifest.json 包含 version, upstream, level, format, standards, integrations, skills |
| 2 | should copy standard files based on level | 根據等級複製對應的標準檔案 |
| 3 | should record content mode in manifest | manifest 記錄 contentMode 設定 |
| 4 | should save standard options to manifest | manifest 保存 options（workflow, merge_strategy, commit_language, test_levels） |
| 5 | should save detected aiTools to manifest when CLAUDE.md exists | 偵測到 CLAUDE.md 時，aiTools 包含 claude-code |
| 6 | should auto-install commands when AGENTS.md exists | 偵測到 AGENTS.md 時，自動安裝 OpenCode commands |

---

### uds config（10 tests）

#### Pre-requisite Checks（2 tests）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should show error when not initialized | 顯示「not initialized」錯誤並提示執行 `uds init` |
| 2 | should show header when initialized | 已初始化時顯示標題 |

#### Configuration Display（3 tests）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should display current configuration labels | 顯示 Current Configuration、Level、Format、AI Tools 標籤 |
| 2 | should display AI tools when configured | 顯示已設定的 AI 工具（如 cursor） |
| 3 | should show methodology with -E flag | 使用 `-E` 時顯示 Methodology 設定 |

#### Manifest State（2 tests）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should have correct structure after init | manifest 包含正確的 level、format、aiTools、options |
| 2 | should preserve options from init | options 保留 workflow、merge_strategy、commit_language |

#### Integration Files State（2 tests）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should create .cursorrules when cursor detected | 偵測到 cursor 時建立 .cursorrules |
| 2 | should track integrations in manifest | manifest.integrations 包含 .cursorrules |

#### Command Help（1 test）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should show help with --help | 顯示 config、--type、--yes 選項說明 |

---

### uds check（14 tests）

#### Pre-requisite Checks（1 test）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should show error when not initialized | 顯示「not initialized」錯誤並提示執行 `uds init` |

#### Basic Check Output（3 tests）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should show header and status when initialized | 顯示標題、initialized 狀態、Adoption Status |
| 2 | should show level and version information | 顯示 Level 和 Version 資訊 |
| 3 | should show file integrity section | 顯示 File Integrity 區塊，包含 unchanged 狀態 |

#### Summary Mode（2 tests）

| # | 測試案例 | 選項 | 預期行為 |
|---|----------|------|----------|
| 1 | should show compact summary with --summary flag | `--summary` | 顯示 Status Summary、Version、Level、Files |
| 2 | should show not initialized in summary mode | `--summary` | 未初始化時顯示「not initialized」 |

#### Coverage and Skills Status（2 tests）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should show coverage summary | 顯示 Coverage Summary 區塊 |
| 2 | should show skills status section | 顯示 Skills Status 區塊 |

#### Modified Files Detection（1 test）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should detect modified files | 偵測檔案修改並顯示 Summary |

#### Diff Mode（1 test）

| # | 測試案例 | 選項 | 預期行為 |
|---|----------|------|----------|
| 1 | should show diff output with --diff flag | `--diff` | 顯示 File Integrity 區塊 |

#### Restore Mode（1 test）

| # | 測試案例 | 選項 | 預期行為 |
|---|----------|------|----------|
| 1 | should restore modified files with --restore flag | `--restore` | 還原修改的檔案，顯示相關輸出 |

#### Offline Mode（1 test）

| # | 測試案例 | 選項 | 預期行為 |
|---|----------|------|----------|
| 1 | should skip CLI update check with --offline flag | `--offline` | 跳過 CLI 更新檢查，顯示標題 |

#### Migrate Mode（1 test）

| # | 測試案例 | 選項 | 預期行為 |
|---|----------|------|----------|
| 1 | should show migrate output with --migrate flag | `--migrate` | 顯示 migration 相關輸出 |

#### Command Help（1 test）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should show help with --help | 顯示 check、--summary、--diff、--restore、--migrate、--offline 選項 |

---

### uds update（10 tests）

#### Pre-requisite Checks（1 test）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should show error when not initialized | 顯示「not initialized」錯誤並提示執行 `uds init` |

#### Basic Update Output（2 tests）

| # | 測試案例 | 選項 | 預期行為 |
|---|----------|------|----------|
| 1 | should show header and version info when initialized | `--yes --offline` | 顯示標題和版本資訊 |
| 2 | should show up-to-date message when no updates | `--yes --offline` | 顯示「up to date」訊息 |

#### Integrations Only Mode（2 tests）

| # | 測試案例 | 選項 | 預期行為 |
|---|----------|------|----------|
| 1 | should show no AI tools error when none configured | `--integrations-only` | 顯示「No AI tools」錯誤 |
| 2 | should regenerate integration files | `--integrations-only` | 重新生成整合檔案，顯示成功訊息 |

#### Standards Only Mode（1 test）

| # | 測試案例 | 選項 | 預期行為 |
|---|----------|------|----------|
| 1 | should update only standards | `--standards-only --yes --offline` | 僅更新標準，顯示標題 |

#### Sync Refs Mode（1 test）

| # | 測試案例 | 選項 | 預期行為 |
|---|----------|------|----------|
| 1 | should sync integration references | `--sync-refs` | 同步整合參考，顯示相關輸出 |

#### Skills Update Mode（1 test）

| # | 測試案例 | 選項 | 預期行為 |
|---|----------|------|----------|
| 1 | should show skills status | `--skills` | 顯示 skills 更新狀態或「No Skills」 |

#### Commands Update Mode（1 test）

| # | 測試案例 | 選項 | 預期行為 |
|---|----------|------|----------|
| 1 | should show commands status | `--commands` | 顯示 commands 更新狀態 |

#### Command Help（1 test）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should show help with --help | 顯示 update、--integrations-only、--standards-only、--sync-refs、--skills、--commands、--yes 選項 |

---

### uds list（11 tests）

#### Basic List Output（4 tests）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should show header and version | 顯示標題與版本 |
| 2 | should show standards categories | 顯示 Skill、Reference 分類 |
| 3 | should show summary at bottom | 顯示 Total 與 standards 標籤 |
| 4 | should show init hint at bottom | 顯示 `uds init` 提示 |

#### Level Filtering（3 tests）

| # | 測試案例 | 選項 | 預期行為 |
|---|----------|------|----------|
| 1 | should filter by level 1 | `--level=1` | 顯示「Showing Level」與等級 1 |
| 2 | should filter by level 2 | `--level=2` | 顯示「Showing Level」與等級 2 |
| 3 | should show error for invalid level | `--level=5` | 顯示「Level must be」錯誤 |

#### Category Filtering（3 tests）

| # | 測試案例 | 選項 | 預期行為 |
|---|----------|------|----------|
| 1 | should filter by skill category | `--category=skill` | 顯示 Category 與 Skill |
| 2 | should filter by reference category | `--category=reference` | 顯示 Category 與 Reference |
| 3 | should show error for invalid category | `--category=invalid` | 顯示「Unknown category」錯誤 |

#### Command Help（1 test）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should show help with --help | 顯示 list、--level、--category 選項 |

---

### uds skills（6 tests）

#### Basic Skills Output（3 tests）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should show header | 顯示「Installed Skills」標題 |
| 2 | should show no skills message when none installed | 顯示無技能訊息或技能列表 |
| 3 | should show marketplace install hint when no skills | 無技能時顯示安裝提示 |

#### Skills Status Display（2 tests）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should show version info when skills are installed | 有技能時顯示版本 |
| 2 | should show path info when skills are installed | 有技能時顯示路徑 |

#### Command Help（1 test）

| # | 測試案例 | 預期行為 |
|---|----------|----------|
| 1 | should show help with --help | 顯示 skills 相關說明 |

---

## 選項覆蓋矩陣

### uds init

| 選項 | 有測試 | 測試案例 |
|------|--------|----------|
| `--yes` | ✅ | 所有 Non-Interactive 測試 |
| `--level` | ✅ | should respect --level option |
| `--skills-location=marketplace` | ✅ | should use marketplace when... |
| `--skills-location=none` | ✅ | should use complete scope when... |
| `--content-mode=full` | ✅ | should respect --content-mode=full |
| `--content-mode=minimal` | ✅ | should respect --content-mode=minimal |
| `--format=human` | ✅ | should generate .md files when... |
| `--format=both` | ✅ | should generate both formats when... |
| `--format=ai` | ✅ | should generate .ai.yaml files when... |
| `--locale` | ❌ | 待新增 |

### uds config

| 選項 | 有測試 | 測試案例 |
|------|--------|----------|
| `--type` | ✅ | Pre-requisite Checks |
| `--yes` | ✅ | Pre-requisite Checks |
| `--help` | ✅ | Command Help |
| `-E` (experimental) | ✅ | should show methodology with -E flag |

### uds check

| 選項 | 有測試 | 測試案例 |
|------|--------|----------|
| `--summary` | ✅ | Summary Mode tests |
| `--diff` | ✅ | Diff Mode |
| `--restore` | ✅ | Restore Mode |
| `--migrate` | ✅ | Migrate Mode |
| `--offline` | ✅ | Offline Mode |
| `--help` | ✅ | Command Help |
| `--no-interactive` | ✅ | 多個測試使用 |

### uds update

| 選項 | 有測試 | 測試案例 |
|------|--------|----------|
| `--yes` | ✅ | Basic Update Output |
| `--integrations-only` | ✅ | Integrations Only Mode |
| `--standards-only` | ✅ | Standards Only Mode |
| `--sync-refs` | ✅ | Sync Refs Mode |
| `--skills` | ✅ | Skills Update Mode |
| `--commands` | ✅ | Commands Update Mode |
| `--offline` | ✅ | Basic Update Output |
| `--help` | ✅ | Command Help |

### uds list

| 選項 | 有測試 | 測試案例 |
|------|--------|----------|
| `--level` | ✅ | Level Filtering tests |
| `--category` | ✅ | Category Filtering tests |
| `--help` | ✅ | Command Help |

### uds skills

| 選項 | 有測試 | 測試案例 |
|------|--------|----------|
| `--help` | ✅ | Command Help |

---

## 維護指引

### 新增測試時

1. 在對應的 `e2e/*-flow.test.js` 檔案中新增測試
2. 更新此文件的對應指令區塊
3. 更新選項覆蓋矩陣
4. 執行 `npm test` 確認所有測試通過

### 修改預期行為時

1. 更新對應的 `fixtures/*-scenarios/expected-messages.json`
2. 更新此文件的案例說明
3. 確認測試仍能通過

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
│   ├── init-scenarios/
│   │   └── expected-messages.json
│   ├── config-scenarios/
│   │   └── expected-messages.json
│   ├── check-scenarios/
│   │   └── expected-messages.json
│   ├── update-scenarios/
│   │   └── expected-messages.json
│   ├── list-scenarios/
│   │   └── expected-messages.json
│   └── skills-scenarios/
│       └── expected-messages.json
├── utils/
│   └── cli-runner.js
└── E2E-TEST-CASES.md  ← 本文件
```

---

## 版本歷程

| 日期 | 版本 | 變更說明 |
|------|------|----------|
| 2025-01-18 | 1.0.0 | 初始版本，記錄 71 個 E2E 測試案例 |
