# UDS CLI E2E 測試案例規格

> **自動生成文件** - 由 `npm run generate:e2e-spec` 從測試程式碼生成
>
> 最後更新: 2026-01-23 | 總測試數: 91

此文件記錄 UDS CLI 的端對端（E2E）測試案例，作為測試的永久規格文件與程式碼審查依據。

## 總覽

### 測試統計

| 指令 | 測試數量 | 檔案 |
|------|----------|------|
| `uds init` | 26 | `e2e/init-flow.test.js` |
| `uds config` | 13 | `e2e/config-flow.test.js` |
| `uds check` | 18 | `e2e/check-flow.test.js` |
| `uds update` | 12 | `e2e/update-flow.test.js` |
| `uds list` | 14 | `e2e/list-flow.test.js` |
| `uds skills` | 8 | `e2e/skills-flow.test.js` |
| **總計** | **91** | |

---

## 測試案例詳情

### uds init（26 tests）

#### 情境 D: 專案已初始化（1 test）

| # | 測試案例 | 預期結果 |
|---|----------|----------|
| 1 | 當 .standards/ 已存在時應顯示警告 | 包含 `Standards already initialized` 和 `uds update` 提示 |

#### 情境 C: 非互動模式 (--yes)（9 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 應以預設設定完成 | `-` | 包含 `Level: 2`、`Format: Compact`、`Standards initialized successfully` |
| 2 | 應遵循 --level 選項 | `--level=3` | 包含 `Level: 3`、`Standards initialized successfully` |
| 3 | 當 --skills-location=marketplace 時應使用 marketplace | `--skills-location=marketplace` | 包含 `Plugin Marketplace`、`Lean` |
| 4 | 當 --skills-location=none 時應使用完整範圍 | `--skills-location=none` | 包含 `Complete`，不包含 `Plugin Marketplace` |
| 5 | 應遵循 --content-mode=full | `--content-mode=full` | 包含 `Full Embed` |
| 6 | 應遵循 --content-mode=minimal | `--content-mode=minimal` | 包含 `Minimal` |
| 7 | 當 --format=human 時應生成 .md 檔案 | `--format=human` | 包含 `Format: Detailed`；生成 `.md` 檔案，無 `.ai.yaml` |
| 8 | 當 --format=both 時應生成兩種格式 | `--format=both` | 包含 `Format: Both`；同時生成 `.md` 和 `.ai.yaml` 檔案 |
| 9 | 當 --format=ai（預設）時應生成 .ai.yaml 檔案 | `--format=ai` | 包含 `Format: Compact`；生成 `.ai.yaml` 檔案 |

#### 輸出訊息覆蓋（4 tests）

| # | 測試案例 | 預期結果 |
|---|----------|----------|
| 1 | 應顯示所有標題訊息 | 包含 `Universal Development Standards - Initialize` |
| 2 | 應在輸出中顯示偵測到的語言 | 包含 `Languages:` 和偵測到的語言名稱 |
| 3 | 應顯示所有摘要區段標籤 | 包含 `Configuration Summary:`、`Level:`、`Format:`、`AI Tools:` |
| 4 | 應顯示成功及後續步驟訊息 | 包含 `Standards initialized successfully`、`Next steps:` |

#### 檔案輸出驗證（6 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 應建立結構正確的 .standards/manifest.json | `-` | 建立 manifest.json，包含 `version`、`level`、`format` 欄位 |
| 2 | 應根據等級複製標準檔案 | `--level=2` | level 2 時建立 6+ 個標準檔案 |
| 3 | 應在 manifest 中記錄內容模式 | `--content-mode=full` | manifest.json 包含 `contentMode: "full"` |
| 4 | 在非互動模式下應將標準選項儲存至 manifest | `-` | manifest.json 包含 `standardOptions` 物件 |
| 5 | 當 CLAUDE.md 存在時應將偵測到的 AI 工具儲存至 manifest | `-` | manifest.json 的 `aiTools` 包含 `claude-code` |
| 6 | 當 AGENTS.md 存在時應自動安裝命令（OpenCode 偵測） | `-` | manifest.json 的 `aiTools` 包含 `opencode` |

#### --ui-lang 旗標（2 tests）

| # | 測試案例 | 預期結果 |
|---|----------|----------|
| 1 | 設定 --ui-lang en 時應顯示英文介面 | UI 文字為英文 |
| 2 | 設定 --ui-lang zh-tw 時應顯示繁體中文介面 | UI 文字為繁體中文 |

#### 情境 A: 互動模式（預設流程）（1 test）

| # | 測試案例 | 預期結果 |
|---|----------|----------|
| 1 | 應能以逐步輸入完成 | stepOutputs 包含各步驟輸出；最終顯示 `Standards initialized successfully` |

#### 情境 B: 互動模式（自訂選項）（3 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 應能選擇多個 AI 工具 | `-` | manifest.json 的 `aiTools` 包含多個工具 |
| 2 | 應能選擇等級 3 | `--type=checkbox` | 輸出包含 `Level: 3` |
| 3 | 應能取消安裝 | `--type=checkbox` | 輸出包含 `cancelled`；不建立 `.standards/` |

---

### uds config（13 tests）

#### 前置條件檢查（2 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 未初始化時應顯示錯誤 | `--type=format --yes` | 包含 `not initialized` 或錯誤訊息 |
| 2 | 已初始化時應顯示標題 | `--type=format --yes` | 包含 `Universal Development Standards` |

#### 配置顯示（3 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 應顯示目前配置標籤 | `--level=2 --type=format --yes` | 包含 `Level:`、`Format:`、`AI Tools:` |
| 2 | 已配置時應顯示 AI 工具 | `--type=format --yes` | 包含已配置的 AI 工具名稱 |
| 3 | 使用 -E 旗標時應顯示方法論 | `--type=format --yes -E` | 包含 `Methodology:` 區段 |

#### Manifest 狀態（2 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 初始化後應有正確結構 | `--level=2` | manifest.json 包含必要欄位 |
| 2 | 應保留初始化時的選項 | `-` | config 顯示與 init 時相同的選項 |

#### 整合檔案狀態（2 tests）

| # | 測試案例 | 預期結果 |
|---|----------|----------|
| 1 | 偵測到 Cursor 時應建立 .cursorrules | 建立 `.cursorrules` 檔案 |
| 2 | 應在 manifest 中追蹤整合 | manifest.json 包含 `integrations` 陣列 |

#### 命令說明（1 test）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 使用 --help 時應顯示說明 | `--help` | 包含 `Usage:`、`Options:` 或命令說明 |

#### --ui-lang 旗標（3 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 即使 manifest 為繁體中文，設定 --ui-lang en 時仍應顯示英文介面 | `--type=format --yes` | UI 文字為英文（覆蓋 manifest 設定） |
| 2 | 設定 --ui-lang zh-tw 時應顯示繁體中文介面 | `--type=format --yes` | UI 文字為繁體中文 |
| 3 | 未指定 --ui-lang 時應使用 manifest 語言 | `--type=format --yes` | 使用 manifest 中設定的語言 |

---

### uds check（18 tests）

#### 前置條件檢查（1 test）

| # | 測試案例 | 預期結果 |
|---|----------|----------|
| 1 | 未初始化時應顯示錯誤 | 包含 `not initialized` 或錯誤訊息 |

#### 基本檢查輸出（3 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 已初始化時應顯示標題和狀態 | `--no-interactive` | 包含標題和 `Status:` 區段 |
| 2 | 應顯示等級和版本資訊 | `--level=2 --no-interactive` | 包含 `Level:`、`Version:` |
| 3 | 應顯示檔案完整性區段 | `--no-interactive` | 包含 `File Integrity:` 或檔案狀態資訊 |

#### 摘要模式（2 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 使用 --summary 旗標時應顯示精簡摘要 | `--summary` | 輸出為單行或精簡格式 |
| 2 | 未初始化時摘要模式應顯示未初始化 | `--summary` | 包含 `not initialized` |

#### 覆蓋率與技能狀態（2 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 應顯示覆蓋率摘要 | `--level=2 --no-interactive` | 包含覆蓋率百分比或統計 |
| 2 | 應顯示技能狀態區段 | `--no-interactive` | 包含 `Skills:` 或技能狀態資訊 |

#### 修改檔案偵測（1 test）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 應偵測修改的檔案 | `--no-interactive` | 包含 `modified` 或修改的檔案清單 |

#### 差異模式（2 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 使用 --diff 旗標時應顯示差異輸出 | `--diff --no-interactive` | 包含差異內容或 `diff` 輸出 |
| 2 | / | `-` | - |

#### 還原模式（2 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 使用 --restore 旗標時應還原修改的檔案 | `--restore --no-interactive` | 包含 `restored` 或還原成功訊息 |
| 2 | / | `-` | - |

#### 離線模式（1 test）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 使用 --offline 旗標時應跳過 CLI 更新檢查 | `--offline --no-interactive` | 不包含版本檢查訊息，快速完成 |

#### 遷移模式（1 test）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 使用 --migrate 旗標時應顯示遷移輸出 | `--migrate --no-interactive` | 包含 `migrate` 或遷移相關訊息 |

#### 命令說明（1 test）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 使用 --help 時應顯示說明 | `--help` | 包含 `Usage:`、`Options:` 或命令說明 |

#### --ui-lang 旗標（2 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 設定 --ui-lang en 時應顯示英文介面 | `--no-interactive` | UI 文字為英文 |
| 2 | 設定 --ui-lang zh-tw 時應顯示繁體中文介面 | `--no-interactive` | UI 文字為繁體中文 |

---

### uds update（12 tests）

#### 前置條件檢查（1 test）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 未初始化時應顯示錯誤 | `--yes` | 包含 `not initialized` 或錯誤訊息 |

#### 基本更新輸出（2 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 已初始化時應顯示標題和版本資訊 | `--yes --offline` | 包含標題和版本號 |
| 2 | 無可用更新時應顯示已是最新訊息 | `--yes --offline` | 包含 `up to date` 或 `already at latest` |

#### 僅整合模式（2 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 未配置 AI 工具時應顯示錯誤 | `--skills-location=none --integrations-only` | 包含錯誤訊息，指出未配置 AI 工具 |
| 2 | 使用 --integrations-only 時應重新生成整合檔案 | `--integrations-only` | 僅更新整合檔案，不更新標準 |

#### 僅標準模式（1 test）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 使用 --standards-only 時應僅更新標準 | `--yes --offline --standards-only` | 僅更新標準檔案，不更新整合 |

#### 同步參照模式（1 test）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 使用 --sync-refs 時應同步整合參照 | `--sync-refs` | 包含同步參照的訊息 |

#### 技能更新模式（1 test）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 使用 --skills 時應顯示技能狀態 | `--skills` | 包含技能狀態資訊 |

#### 命令更新模式（1 test）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 使用 --commands 時應顯示命令狀態 | `--commands` | 包含命令狀態資訊 |

#### 命令說明（1 test）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 使用 --help 時應顯示說明 | `--help` | 包含 `Usage:`、`Options:` 或命令說明 |

#### --ui-lang 旗標（2 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 設定 --ui-lang en 時應顯示英文介面 | `--yes --offline` | UI 文字為英文 |
| 2 | 設定 --ui-lang zh-tw 時應顯示繁體中文介面 | `--yes --offline` | UI 文字為繁體中文 |

---

### uds list（14 tests）

#### 基本列表輸出（4 tests）

| # | 測試案例 | 預期結果 |
|---|----------|----------|
| 1 | 應顯示標題和版本 | 包含 `Universal Development Standards` 和版本號 |
| 2 | 應顯示標準類別 | 包含類別名稱如 `core`、`skill`、`reference` |
| 3 | 應在底部顯示摘要 | 底部包含標準總數統計 |
| 4 | 應在底部顯示初始化提示 | 包含 `uds init` 提示 |

#### 等級篩選（3 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 應依等級 1 篩選 | `--level=1` | 僅顯示 level 1 的標準 |
| 2 | 應依等級 2 篩選 | `--level=2` | 顯示 level 1 和 level 2 的標準 |
| 3 | 無效等級時應顯示錯誤 | `--level=5` | 包含錯誤訊息 |

#### 類別篩選（3 tests）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 應依技能類別篩選 | `--category=skill` | 僅顯示 skill 類別的標準 |
| 2 | 應依參考類別篩選 | `--category=reference` | 僅顯示 reference 類別的標準 |
| 3 | 無效類別時應顯示錯誤 | `--category=invalid` | 包含錯誤訊息 |

#### 命令說明（1 test）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 使用 --help 時應顯示說明 | `--help` | 包含 `Usage:`、`Options:` 或命令說明 |

#### --ui-lang 旗標（3 tests）

| # | 測試案例 | 預期結果 |
|---|----------|----------|
| 1 | 設定 --ui-lang en 時應顯示英文介面 | UI 文字為英文 |
| 2 | 設定 --ui-lang zh-tw 時應顯示繁體中文介面 | UI 文字為繁體中文 |
| 3 | 設定 --ui-lang zh-cn 時應顯示簡體中文介面 | UI 文字為簡體中文 |

---

### uds skills（8 tests）

#### 基本技能輸出（3 tests）

| # | 測試案例 | 預期結果 |
|---|----------|----------|
| 1 | 應顯示標題 | 包含 `Skills` 標題 |
| 2 | 未安裝技能時應顯示無技能訊息 | 包含 `No skills installed` 或類似訊息 |
| 3 | 無技能時應顯示 marketplace 安裝提示 | 包含 marketplace 安裝說明 |

#### 技能狀態顯示（2 tests）

| # | 測試案例 | 預期結果 |
|---|----------|----------|
| 1 | 已安裝技能時應顯示版本資訊 | 包含技能版本號 |
| 2 | 已安裝技能時應顯示路徑資訊 | 包含技能安裝路徑 |

#### 命令說明（1 test）

| # | 測試案例 | 選項 | 預期結果 |
|---|----------|------|----------|
| 1 | 使用 --help 時應顯示說明 | `--help` | 包含 `Usage:`、`Options:` 或命令說明 |

#### --ui-lang 旗標（2 tests）

| # | 測試案例 | 預期結果 |
|---|----------|----------|
| 1 | 設定 --ui-lang en 時應顯示英文介面 | UI 文字為英文 |
| 2 | 設定 --ui-lang zh-tw 時應顯示繁體中文介面 | UI 文字為繁體中文 |

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
