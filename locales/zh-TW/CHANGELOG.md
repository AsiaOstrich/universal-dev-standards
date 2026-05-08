---
source: ../../CHANGELOG.md
source_version: 5.7.0
translation_version: 5.7.0
last_synced: 2026-05-08
status: current
---

# 變更日誌

> **語言**: [English](../../CHANGELOG.md) | 繁體中文 | [简体中文](../zh-CN/CHANGELOG.md)

本專案的所有重要變更都將記錄在此檔案中。

格式基於 [Keep a Changelog](https://keepachangelog.com/)，
並遵循[語義化版本](https://semver.org/)。

## [Unreleased]

## [5.7.0] - 2026-05-08

> **跨平台腳本遷移**（XSPEC-179 + XSPEC-180）：bash 腳本逐步被單一來源的
> TypeScript / Node.js ESM 等價實作取代，可在 macOS / Linux / Windows 上以
> 相同方式執行。原 `.sh` 檔保留並加上 `DEPRECATED` 警告以維持向後相容。

### 新增

- **AI 工具表格補全**（`README.md`、`locales/zh-TW/README.md`、`locales/zh-CN/README.md`）：補上五個遺漏工具——GitHub Copilot、OpenAI Codex、Aider、Continue、Google Antigravity。新增 ⚠ Minimal 狀態圖例。（`1b588e1`）
- **`scripts/bump-version.mjs`**（XSPEC-179 Phase 1）：跨平台版本升版實作，與原 `.sh` 對等。（`1a44e14`）
- **`scripts/install-hooks.mjs`**（XSPEC-179 Phase 1）：跨平台 git hooks 安裝程式；於 Windows 自動跳過 `chmod`。（`1a44e14`）
- **`scripts/pre-commit.mjs`**（XSPEC-180）：pre-commit hook 的 Node.js ESM 實作，平台分支於 Windows 呼叫 `check-translation-sync.ps1`，其他平台呼叫 `.sh`。（`1572869`）
- **7 個 TypeScript 檢查腳本**（XSPEC-179 Phase 2，`0a26d14`）：從 bash 遷移至單一 TypeScript 來源，透過 `tsx` 執行：
  - `scripts/check-ai-behavior-sync.ts`
  - `scripts/check-commit-spec-reference.ts`
  - `scripts/check-flow-gate-report.ts`
  - `scripts/check-integration-commands-sync.ts`
  - `scripts/check-registry-completeness.ts`
  - `scripts/check-release-readiness-signoff.ts`
  - `scripts/check-workflow-compliance.ts`
- **`tsx@^4.20.0`** 加入 root `devDependencies`（XSPEC-179 Phase 2，`0a26d14`）。
- **7 個 npm scripts** 串接 TypeScript 檢查腳本（`0a26d14`）：`check:ai-behavior`、`check:commit-spec`、`check:flow-gate`、`check:integration-commands`、`check:registry`、`check:release-signoff`、`check:workflow-compliance`。

### 變更

- **下游專案解耦**（6 批次，`ebe716c`–`2392c0f`）：所有公開敘述中對特定下游產品（DevAP / VibeOps）的直接引用已替換為採用層中性術語，涵蓋 130+ 個檔案。UDS 重申為純 MIT + CC BY 4.0 標準庫，與任何特定採用層無依賴關係。
- **REGISTRY**：`roo-code` integration tier 從 `planned` 升為 `partial`；AI 工具表格中將 Roo Code 獨立成列（不再與 Cline 合併）。（`1b588e1`）
- **`.githooks/pre-commit`**（XSPEC-180，`1572869`）：從 51 行 bash 縮減為 16 行 POSIX `sh` 薄殼層，將實際邏輯委派給 `scripts/pre-commit.mjs`。
- **`scripts/bump-version.mjs`**（`19ad314`）：新增 `buildCmd()` 輔助函式，於 Windows 自動切換為 PowerShell + `.ps1` 來呼叫 `check-version-sync` / `check-translation-sync`，恢復 Windows 平台對等性。
- **XSPEC-179 Phase 2 策略修訂**（`0a26d14`）：放棄先前的 `.sh` + `.ps1` 雙軌方案，改採**單一 TypeScript 來源**策略。單一 `.ts` 透過 `tsx` 在所有平台上行為一致，消除「只能在 Windows 驗證」的反饋落差。

### 棄用

- **`scripts/bump-version.sh`**（`1a44e14`）：標記為 DEPRECATED，由 `bump-version.mjs` 取代。
- **`scripts/install-hooks.sh`**（`1a44e14`）：標記為 DEPRECATED，由 `install-hooks.mjs` 取代。
- **7 個 legacy `check-*.sh` 腳本**（`0a26d14`）：對應的 `.ts` 版本（如上）已成為 canonical 實作。`.sh` 檔保留供 legacy Linux/macOS 環境使用，但不應再新增功能。

### 移除

- **`.devap/` 目錄**（`2392c0f`）：移除孤兒 DevAP dogfooding 安裝目錄。DevAP 已於 2026-04-28 退場（XSPEC-086/095）；UDS 現使用原生 `flows/commit.flow.yaml` 與 `scripts/bump-version.mjs`。

### 修復

- **`scripts/check-release-readiness-signoff.sh`**（`0a26d14`，於 TypeScript 移植時順帶修復的潛伏 bug）：原本錯誤的 `grep -c "0\n0"` 樣式（永遠無法比對到字面 `\n`）已修正，現在能可靠偵測缺漏的 sign-off 訊號。
- **`scripts/check-integration-commands-sync.sh`**（`0a26d14`，於 TypeScript 移植時順帶修復的潛伏 bug）：消除 `find` 與下游 consumer 之間 broken pipe 引發的 SIGPIPE 噪音。

## [5.3.2] - 2026-04-27

> **修補版本發布**：Bug 修復 —— `uds update -y` 現在會自動安裝/更新 Skills 和 Commands，不再只顯示提示訊息。

### 修復
- **`uds update --yes` / `-y`**（`cli/src/commands/update.js`）：`--yes` 旗標先前對 Skills 和 Commands 安裝完全跳過，只顯示「New features available」提示。現在與互動模式行為一致 —— 缺少的 Skills/Commands 立即安裝，過時的直接更新，並同步刷新 manifest 與整合檔案。修復了 `uds update -y` 讓 `.claude/` Skills 保持不變而互動式 `uds update` 正常更新的行為差異。

## [5.3.1] - 2026-04-27

> **修補版本發布**：Bug 修復 —— `uds update` 後 `uds check` 不再誤報「AGENTS.md 標準不同步」。

### 修復
- **`generateAgentsMdSummary()`**（`integration-generator.js`）：移除導致 AGENTS.md 只列出 30 項標準的 `.slice(0, 30)` 截斷。`uds check` 與 manifest 全量標準比對，截斷導致永遠誤報 `30/64 out of sync`。現在列出全部已安裝標準，check 正常通過。

## [5.3.0] - 2026-04-26

> **次版本發布**：四個新標準 + 一個新 Skill（XSPEC-085/064）—— `no-cicd-deployment`、`rollback-standards`、`cd-deployment-strategies`、`pipeline-security-gates`，以及無 CI/CD 環境的 `/deploy` Skill。標準總數：136。

### 新增
- **`no-cicd-deployment.ai.yaml`**（XSPEC-085 Phase 1）：無 CI/CD 平台的三層部署架構 — `set -euo pipefail` + deploy.lock + 版本 tag 強制；Smoke Test + 自動 rollback；Blue-Green 切換 <30 秒。
- **`rollback-standards.ai.yaml`**（XSPEC-064 Phase 1）：Rollback 觸發條件矩陣 — 自動（error rate >2× baseline）、輔助（SLO 違反）、手動（延遲在 SLO 內）。Error budget <10% 升級為自動。P0–P3 嚴重級別與 SLA。
- **`cd-deployment-strategies.ai.yaml`**（XSPEC-064 Phase 1）：部署策略選用矩陣 — blue-green / canary / rolling / recreate 決策樹（流量 × 風險 × 成本）。含無 CI/CD 相容性說明。
- **`pipeline-security-gates.ai.yaml`**（XSPEC-064 Phase 1）：CI 安全檢查點 — pre-commit secrets 掃描、post-build SAST、post-staging DAST、package 階段 SCA+SBOM。Critical/High 阻擋 pipeline；Medium 需要審核。
- **`/deploy` Skill**（`skills/deploy-assistant/`，XSPEC-085 Phase 1b）：無 CI/CD 互動式部署腳本生成器，含繁體中文本地化翻譯。

## [5.2.0] - 2026-04-24

> **次版本發布**：三項新標準/技能（XSPEC-080/081/082）—— `/release package` 子命令、`/push` 品質守門 Skill、以及 `agent-behavior-discipline` 標準（Karpathy 四大原則：問/減/準/測）。Bundle 一致性加固。文件集中至 dev-platform。標準總數：74。

### 新增
- **`agent-behavior-discipline.ai.yaml`**（Trial 試驗期至 2026-10-24，XSPEC-082 / DEC-048）：新治理標準，系統化整合 Andrej Karpathy 提煉的四大 AI Agent 行為紀律——問（執行前揭露假設）、減（最小充分代碼）、準（精準修改邊界）、測（定義可驗證成功標準 + 自我修正循環）。已加入 `uds-manifest.json`（第 74 個標準）及 `cli/standards-registry.json`。
- **`/push` Skill**（`skills/push/`，XSPEC-081）：Git Push 品質守門與跨人協作護欄——受保護分支偵測、force-push 護欄、pre-push gate 驗證、push 稽核日誌、PR 整合入口。包含兩個配置選項：`options/push/single-owner-mode.ai.yaml`（單人倉庫簡化護欄）和 `options/push/team-mode.ai.yaml`（團隊全護欄，需確認）。
- **`/release package` 子命令**（`skills/release/`，XSPEC-080）：10 種目標格式的打包指引——npm/Node.js、Python/PyPI、Go 二進位、Electron App、Homebrew（Wave 1）+ Rust/Cargo、Tauri 桌面、Docker 映像、VS Code Extension、GitHub Release 資產（Wave 2）。偵測優先設計：自動偵測專案類型再套用打包步驟。

### 修正
- **Bundle 一致性**（XSPEC-072 Phase 2）：解決 `ai/standards/` 與 `bundle/` 之間的差異——74 個標準現在全部納入 bundle。CI 硬性失敗（exit 1）於任何差異，防止靜默的 bundle 落差。
- **i18n NO META frontmatter**（BUG-A06）：補齊 36 個翻譯檔案缺少的 YAML frontmatter，修復翻譯同步驗證誤報。

### 變更
- **文件集中化（DEC-047 Batch 2）**：UDS 規劃/治理文件已遷移至 AsiaOstrich dev-platform 規劃中心，不再隨 UDS 發布：
  - `docs/AI-AGENT-ROADMAP.md`、`docs/OPERATION-WORKFLOW.md`、`docs/internal/` 下四份文件已移除
  - `locales/zh-TW/docs/`、`locales/zh-CN/docs/` 副本亦已移除

[5.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.1...v5.2.0

## [5.1.1] - 2026-04-20

> **修補版本**：Windows CI 修正、53 個 SKILL.md 補 `name` 欄位、三份 `.md` 源文件依 BUG-A08 事後分析新增規則、zh-TW/zh-CN 翻譯同步。

### 修正
- **`cli/src/utils/directory-mapper.js`**：以 `path.basename(dir)` 取代 `dir.split('/').pop()`，修正 Windows CI 路徑分隔符相容性問題（修復 Windows CI runner 上 `directory-mapper.test.js` 測試失敗）。

### 新增
- **`name` 欄位** 補齊至 9 個源目錄 `skills/*/SKILL.md` 及 44 個 `locales/zh-TW/skills/*/SKILL.md`，符合 Skill 驗證工具需求。

### 變更
- **`core/test-governance.md`** 1.0.0 → 1.1.0：新增 `test-execution-continuity` 規則（BUG-A08 事後分析 — 22 個測試存在但未連接任何 CI 執行觸發器）。
- **`core/checkin-standards.md`** 1.5.0 → 1.6.0：新增舊版專案檔案同步（`project-file-sync`）章節 — 磁碟上的每個源文件必須登錄於舊版專案 manifest 中。
- **`core/testing-standards.md`** 3.1.0 → 3.2.0：新增 E2E 前置條件範圍（`e2e-precondition-scope`）章節 — E2E 前置檢查必須驗證所有受測頁面/端點，而非僅驗證認證入口。
- **zh-TW 與 zh-CN 翻譯** 已同步 `test-governance.md`、`checkin-standards.md`、`testing-standards.md` 三份文件。

[5.1.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.0...v5.1.1

## [5.1.0] - 2026-04-20

> **正式版**：BUG-A06 i18n 完整性 — 新增 32 份缺失翻譯、Semver 感知翻譯閘門、新增 `translation-lifecycle-standards` UDS 標準。BUG-A07 Shell 測試覆蓋 — 20+ 腳本的 bats smoke tests。BUG-A08 假通過測試稽核 — 修正 22 個測試。Pre-release Batch 0：6 個標準從 Trial 升至 Adopt（DEC-021/025/031/035/038/040）。標準總數：106 個。

### 新增
- **`translation-lifecycle-standards`**（Trial，到期 2026-10-20）：新 UDS 標準，定義 MISSING 與 OUTDATED 的區別、Semver 嚴重度分級（MISSING/MAJOR = 發布阻塞器，MINOR/PATCH = advisory），以及自動化整合（pre-commit hook、release gate、bump-version 整合）。來源：BUG-A06 事後分析。
- **`.githooks/pre-commit`** + **`scripts/install-hooks.sh`**：commit 時若暫存 `core/*.md` 檔案則顯示 OUTDATED 警告，永不阻塞 commit。透過 `./scripts/install-hooks.sh` 啟用。
- **32 份 zh-TW 與 zh-CN 翻譯**（BUG-A06）：所有核心標準現已有完整 zh-TW 和 zh-CN 翻譯，包含 `circuit-breaker`、`token-budget`、`dual-phase-output`、`failure-source-taxonomy`、`immutability-first`、`security-decision`、`capability-declaration`、`recovery-recipe-registry`、`retry-standards`、`health-check-standards`、`timeout-standards`、`skill-standard-alignment-check`、`standard-admission-criteria`、`standard-lifecycle-management`、`packaging-standards`、`frontend-design-standards`、`translation-lifecycle-standards` 等。
- **bats smoke tests**（BUG-A07）：`tests/scripts/` — 20+ 個 Shell 腳本的 smoke tests，涵蓋 `check-translation-sync.sh`、`check-version-sync.sh`、`bump-version.sh`、`install-hooks.sh` 等。

### 變更
- **`check-translation-sync.sh`**：Semver 感知嚴重度 — MAJOR 版本落差現在 exit 1（發布阻塞器）；MINOR/PATCH 落差 exit 0 附 advisory 警告。新增 `semver_diff()` 函式與 `[MAJOR]`/`[MINOR]`/`[PATCH]` 嚴重度標籤。
- **`bump-version.sh`**：更新版本檔案後自動執行 `check-translation-sync.sh`，在升版時提供翻譯健康狀態快照。
- **`scripts/pre-release-check.sh`**：更新為將 `check-translation-sync.sh` 作為硬閘門（MISSING + MAJOR = exit 1）。

### 修正
- **zh-CN `anti-hallucination.md`**（BUG-A06）：從 1.5.0 更新至 1.5.1 — 補上缺失的「Agent 认识论校准」章節（Answer/Ask/Abstain 框架，XSPEC-008）。該章節自 2026-04-13 起在 zh-CN 中完全缺失。
- **22 個假通過測試**（BUG-A08）：修正未正確驗證行為的測試，加入真實斷言。

### 升至 Adopt（Pre-release Batch 0）
- `circuit-breaker`（DEC-021）：Trial 6 個月後升至 Adopt
- `token-budget`（DEC-025）：Trial 6 個月後升至 Adopt
- `dual-phase-output`（DEC-031）：Trial 6 個月後升至 Adopt
- `security-decision`（DEC-035）：Trial 6 個月後升至 Adopt
- `immutability-first`（DEC-038）：Trial 6 個月後升至 Adopt
- `failure-source-taxonomy`（DEC-040）：Trial 6 個月後升至 Adopt

[5.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.0-beta.7...v5.1.0

## [5.1.0-beta.7] - 2026-04-17

> **Beta Release**：DEC-043 Wave 1 — 六個 Trial 狀態標準，涵蓋可靠性模式與治理 Meta 框架。

### 新增
- **Reliability 包（XSPEC-067）**：三個 Trial 狀態的韌性模式標準。
  - `retry-standards`：重試策略（指數退避、Jitter、冪等性保護）。
  - `timeout-standards`：分層 timeout 預算（call / request / end-to-end）與傳遞規則。
  - `health-check-standards`：Liveness / Readiness / Startup probe 語義。
- **治理 Meta 包（XSPEC-070，Wave 1 前置）**：三個定義「標準如何被納入、管理、與 Skill 對齊」的 Trial 標準。
  - `standard-admission-criteria`：新標準提案的入場門檻。
  - `standard-lifecycle-management`：Trial → Stable → Deprecated → Archived 狀態流轉。
  - `skill-standard-alignment-check`：Skill 與其引用標準之間的對齊稽核。
- 六份標準皆遵循 UDS 三方同步要求：`.ai.yaml`（機器）+ `.md`（人類）+ `cli/standards-registry.json` entry（+66 行）。

### 背景
- 由 **DEC-043**（UDS 覆蓋完整性路線圖）驅動。治理 Meta 包為 Wave 1 前置條件，解鎖 Wave 2–4（八個主題標準包：SRE / CI-CD / IaC / 合規 / Reliability / 資料工程 / 產品 / 治理 — XSPEC-063~070）。
- PR：#77

## [5.1.0-beta.6] - 2026-04-13

> **Beta 版本**：修復 `uds init` 當機問題、E2E 測試隔離問題，以及 macOS 顯示語言偵測失效問題。

### 修復

- **`uds init --yes` 當機**（`manifest-installer.js`）：`contentMode: 'auto'` 未被 `|| 'minimal'` 後備值攔截，導致 Schema 驗證失敗，`manifest.json` 無法寫入
- **macOS 顯示語言被忽略**：新增 `~/.udsrc ui.language` 的讀取，修復英文語系 macOS 忽略使用者語言偏好的問題
- **E2E 測試隔離**（`cli-runner.js`）：所有子行程 spawn 改以獨立的 `TEST_HOME_DIR` 覆蓋 `HOME`，消除開發者 `~/.udsrc` 對測試輸出的干擾
- **E2E 計數斷言**（`update-flow.test.js`）：過濾 `manifest.standards` 僅計算 `.ai.yaml` 檔案，排除 `.md` 範本檔案的干擾

### 新增

- **認知校準框架**（XSPEC-008）：反幻覺標準新增認知校準框架章節
- **`/e2e-assistant` Skill**：從 BDD Gherkin 場景自動生成 E2E 測試骨架的互動式技能
- **`/process-to-skill` Skill**：Process-to-Skill 治理框架技能
- **`execution-history.ai.yaml`**：同步至 XSPEC-003-SDD 規格格式

## [5.1.0-beta.5] - 2026-04-10

> **Beta 版本**：大規模 CLI 擴展（SDLC Flow Engine、Standards-as-Hooks 編譯器、分層 CLAUDE.md、SuperSpec Phase 4、opt-in 遙測上傳）與 Skill 治理框架（/process-to-skill、DEC 評估框架）。

### 新增

**新功能 — CLI & 標準**
- **opt-in 遙測上傳**（SPEC-TELEMETRY-002）：Hook 執行結果可選擇性上傳至遠端分析端點；雙重防護（`telemetryUpload=true` + `telemetryApiKey` 非空）；SHA-256 匿名 user_id，不含個人資料
- **DEC 借鑲評估框架**（XSPEC-014 Layer 1）：技術雷達、假設書、Reversal DEC 三大評估工具，支援借鑲決策記錄
- **SuperSpec Phase 4 — 收尾功能**（XSPEC-005）：`uds spec archive`、`uds spec search`、`uds spec quickstart`、`uds spec split`
- **SuperSpec Phase 2 — 驗證管線**：`spec-linter`、品質評分（0-100 分）、`context sync`
- **spec 大小閘門**（AC-3）：`validateSpecSize()` — 超過 600 行觸發警告，超過 1200 行阻擋提交
- **YAML 標準擴展**（AC-18）：`.standards/*.ai.yaml` 支援 `enforcement` 區塊與 `required_fields`
- **SDLC Flow Engine**（SPEC-FLOW-001）：自訂工作流程引擎，含狀態機持久化、可插拔品質閘門、Export/Import
- **Standards-as-Hooks 編譯器**（SPEC-COMPILE-001）：`uds compile` — 自動將 YAML enforcement 區塊轉譯為 hook 腳本
- **分層 CLAUDE.md**（SPEC-LAYERED-001）：`uds init --content-layout` 支援多層目錄獨立 CLAUDE.md
- **Hook 整合**（SPEC-HOOKS-001）：`uds init --with-hooks` 一鍵安裝 hook 腳本
- **Hook 執行遙測**（SPEC-TELEMETRY-001）：本地端 hook 執行統計，寫入 `.uds/hook-stats.jsonl`
- **執行歷史倉庫標準**（`execution-history`）：AI Agent 跨對話持久化記憶標準
- **`/e2e` 斜線命令**（SPEC-E2E-001）：從 BDD Gherkin 場景自動生成 E2E 測試骨架
- **`/process-to-skill` Skill**（XSPEC-020）：Process-to-Skill 治理框架；3-Times Rule；Simple/Complex/Delta 決策樹
- **Skill 治理模板**：`templates/SKILL-CANDIDATES.md`、`templates/SKILL-BRIEF-TEMPLATE.md`
- **Integration Commands Sync**（SPEC-INTSYNC-001）：自動偵測 AI 工具整合檔是否引用所有斜線命令
- `COMMAND-INDEX.json`：47 個 commands 的 Single Source of Truth
- `/derive` 擴展：感知 `test_levels`；支援 IT + E2E 測試推演（SPEC-DERIVE-001）
- **三個核心標準新增 `enforcement` 區塊**：`commit-message-guide`、`testing-standards`、`checkin-standards`

**文件與規格**
- 批次歸檔 28 個已完成的 orphan specs 為 Archived 狀態
- 歸檔 6 份規格：SPEC-TELEMETRY-001、SPEC-COMPILE-001、SPEC-LAYERED-001、SPEC-HOOKS-001、SPEC-FLOW-001、SPEC-E2E-001

### 變更
- `REGISTRY.json`：所有 tier 新增 `requiredCategories` 欄位
- `REGISTRY.json`：Cursor 從 `complete` 降為 `partial` tier
- `spec dependency tracking`：新增 `depends_on` 欄位與 dual mode 支援

### 修復
- `check-orphan-specs.sh`：排除 traceability 文件的誤判
- `check-orphan-specs.sh`：修復支援 list 前綴和中文狀態欄位的 regex

### 雜項
- `.gitignore`：新增 `.workflow-state/`
- 移除 11 個測試檔案中過時的 `[TODO]` 標記

## [3.5.0-beta.13] - 2026-01-13

### 新增
- **CLI**：將 OpenCode 加入 skills 相容工具
  - `uds init` 現在將 OpenCode 視為 Claude Code 處理，提供精簡安裝
  - `uds check` 顯示 OpenCode skills 相容性狀態
  - Skills 自動安裝到 `.claude/skills/`（OpenCode 自動偵測此路徑）
- **文件**：在 skills-mapping.md 新增跨工具相容性章節
  - 7 個 AI Agent 的路徑對照表（Claude Code、OpenCode、Cursor、OpenAI Codex、GitHub Copilot、Windsurf、Cline）
  - 說明 UDS 為何使用 `.claude/skills/` 作為預設路徑
  - 不相容工具的跨工具安裝說明
- **文件**：重構 README 建立獨立的 Agent Skills 安裝章節
  - 將 skills 安裝方法整合在一處
  - 新增社群 marketplace（n-skills、claude-plugins.dev、agentskills.io）
- **文件**：新增 beta 版本安裝說明
  - `npm install -g universal-dev-standards@beta`
  - `npx universal-dev-standards@beta init`

### 變更
- **文件**：更新 integrations/opencode/ 文件
  - 版本 1.4.0 包含跨工具相容性資訊
  - 雙語翻譯同步（zh-TW、zh-CN）

## [3.5.0-beta.12] - 2026-01-13

### 新增
- **文件**：新增使用模式比較文件
  - 比較僅 Skills vs 僅規範文件 vs 兩者並用
  - 包含功能覆蓋率、Token 效率、和建議
  - 雙語支援（英文和繁體中文）
  - 參見 `docs/USAGE-MODES-COMPARISON.md`
- **文件**：重構 README 安裝文件
  - npm CLI 作為主要安裝方式
  - AI 工具擴充作為可選功能
  - 完整列出 9 個支援的 AI 工具及正確狀態

### 修復
- **CLI**：修復 detector.js 缺失的 AI 工具偵測
  - 現在可偵測全部 9 個 AI 工具：Claude Code、Cursor、Windsurf、Cline、GitHub Copilot、Antigravity、Codex、OpenCode、Gemini CLI
  - 修復 `uds init` 時的自動偵測功能

## [3.5.0-beta.11] - 2026-01-12

### 新增
- **文件**：在 README 新增功能可用性表格
  - 清楚比較穩定版 (3.4.2) 與 beta 版 (3.5.x) 功能
  - 以 🧪 標記實驗性功能
  - 雙語支援（英文和繁體中文）

### 修復
- **i18n**：為 6 個翻譯檔案新增缺失的 YAML front matter
  - `docs/CLI-INIT-OPTIONS.md`
  - `skills/commands/bdd.md`
  - `skills/commands/methodology.md`
  - `skills/methodology-system/SKILL.md`
  - `skills/methodology-system/create-methodology.md`
  - `skills/methodology-system/runtime.md`
- **文件**：更新穩定版本參考從 3.3.0 至 3.4.2

## [3.5.0-beta.10] - 2026-01-12

### 新增
- **方法論系統**：新增完整開發方法論支援
  - 內建方法論：TDD、BDD、SDD、ATDD
  - YAML 格式方法論定義，含 JSON Schema 驗證
  - 階段追蹤、檢查清單和檢查點
  - 自訂方法論模板，支援團隊特定工作流
  - `/methodology` 命令：狀態、切換、階段管理
  - CLI 整合：`uds init` 和 `uds configure` 方法論選擇
- **命令**：新增 `/bdd` 行為驅動開發命令
  - 完整 BDD 工作流：探索 → 制定 → 自動化 → 活文件
  - Gherkin 格式範例和三劍客會議引導
  - 階段檢查清單和指示器
- **命令**：整合 `/tdd` 與方法論系統
  - 調用時自動啟用 TDD 方法論
  - 顯示階段指示器（🔴 紅燈、🟢 綠燈、🔵 重構）
- **文件**：新增方法論系統雙語文件
  - 英文和繁體中文翻譯
  - SKILL.md、runtime.md、create-methodology.md

### 變更
- **Skills**：更新安裝腳本以包含 methodology-system（共 16 個 skills）
- **Registry**：在 standards-registry.json 新增 methodologies 區塊

## [3.5.0-beta.9] - 2026-01-11

### 新增
- **腳本**：新增統一預發布檢查腳本
  - `scripts/pre-release-check.sh` 適用於 Unix/macOS
  - `scripts/pre-release-check.ps1` 適用於 Windows PowerShell
  - 單一指令執行所有 7 項驗證檢查
  - 選項：`--fail-fast`、`--skip-tests`
- **CI**：在 GitHub Actions 發布工作流程中新增預發布驗證
  - 在 npm publish 前執行版本同步、標準同步、linting 和測試
  - 任何檢查失敗則阻止發布

### 變更
- **文件**：在 release-workflow.md 新增「自動化預發布檢查」區塊
- **文件**：在 CLAUDE.md 的快速指令中加入 pre-release-check.sh

## [3.5.0-beta.8] - 2026-01-11

### 修復
- **CLI**：修復 `standards-registry.json` 版本不一致問題
  - 同步 `standards-registry.json` 版本與 `package.json`（之前停留在 3.5.0-beta.5）
  - 這導致 `uds update` 顯示過時的「最新版本」資訊

### 變更
- **發布**：將版本同步檢查加入預發布檢查清單
  - 在自動化驗證區塊新增 `./scripts/check-version-sync.sh` 驗證步驟
  - 防止未來版本不一致問題

## [3.5.0-beta.7] - 2026-01-11

### 修復
- **CLI**：修復 Windows 未追蹤檔案偵測的路徑分隔符問題
  - 在 `scanDirectory` 函數中標準化路徑分隔符為正斜線
  - 確保比對 manifest 路徑時的跨平台一致性

## [3.5.0-beta.6] - 2026-01-11

### 新增
- **文件**：新增 18 個 `options/` 目錄的人類可讀 Markdown 檔案
  - `options/changelog/`：keep-a-changelog.md、auto-generated.md
  - `options/code-review/`：pr-review.md、pair-programming.md、automated-review.md
  - `options/documentation/`：api-docs.md、markdown-docs.md、wiki-style.md
  - `options/project-structure/`：kotlin.md、php.md、ruby.md、rust.md、swift.md
  - `options/testing/`：contract-testing.md、industry-pyramid.md、istqb-framework.md、performance-testing.md、security-testing.md
  - 完成雙格式架構：`ai/options/*.ai.yaml` 供 AI 工具使用，`options/*.md` 供人類開發者使用
- **AI 標準**：新增 `ai/standards/test-driven-development.ai.yaml`
  - AI 優化的 TDD 標準，含 Red-Green-Refactor 循環
  - FIRST 原則與適用性指南
- **文件**：新增完整的 CLI init 選項指南（三語支援）
  - `docs/CLI-INIT-OPTIONS.md` - 完整的 `uds init` 選項文件
  - 涵蓋：AI 工具、技能位置、標準範圍、採用等級、格式、標準選項、擴充、整合配置、內容模式
  - 包含使用案例、決策流程和 CLI 參數參考
  - 三語版本：英文、繁體中文 (`locales/zh-TW/`)、簡體中文 (`locales/zh-CN/`)
- **發布**：將 CLI 文件新增至預發布檢查清單
  - `release-workflow.md` 現在包含 CLI-INIT-OPTIONS.md 驗證
- **發布**：將標準一致性檢查新增至預發布檢查清單
  - 驗證 `core/` ↔ `ai/standards/` 內容對齊
  - 驗證 `options/` ↔ `ai/options/` 雙格式完整性
- **腳本**：新增自動化標準一致性檢查腳本
  - `scripts/check-standards-sync.sh` 用於 Unix/macOS
  - `scripts/check-standards-sync.ps1` 用於 Windows PowerShell
  - 檢查 `core/` ↔ `ai/standards/` 和 `options/` ↔ `ai/options/` 一致性

### 變更
- **CLI**：改進整合產生器的 minimal 內容模式
  - Minimal 模式現在包含簡化的標準參考清單
  - 確保 AI 工具即使在 minimal 模式下也知道有哪些標準可用
  - 新增 `generateMinimalStandardsReference()` 函數
- **CLI**：優化 `uds init` 提示訊息
  - 統一所有提示的標題格式
  - 改善術語：Starter/Professional/Complete（等級）、Compact/Detailed（格式）、Standard（內容模式）、Lean（標準範圍）
  - 增強顏色標示：推薦選項使用綠色
  - 簡化選擇後的說明文字

## [3.5.0-beta.5] - 2026-01-09

### 新增
- **CLI**：增強 AI 工具整合，自動符合標準
  - 支援 9 個 AI 工具：Claude Code、Cursor、Windsurf、Cline、GitHub Copilot、Google Antigravity、OpenAI Codex、Gemini CLI、OpenCode
  - 新增內容模式選擇：`full`、`index`（推薦）、`minimal`
  - 產生標準合規指示，含 MUST/SHOULD 優先順序
  - 產生標準索引，列出所有已安裝標準
  - 處理 Codex 和 OpenCode 之間的 `AGENTS.md` 共享
- **CLI**：增強 `uds configure` 命令
  - 新選項：AI 工具 - 新增/移除 AI 工具整合
  - 新選項：採用等級 - 變更 Level 1/2/3
  - 新選項：內容模式 - 變更 full/index/minimal
  - 設定變更時自動重新產生整合檔案
- **CLI**：增強 `uds update` 命令
  - 新旗標：`--integrations-only` - 只更新整合檔案
  - 新旗標：`--standards-only` - 只更新標準檔案
  - 標準更新時自動同步整合檔案
- **CLI**：增強 `uds check` 命令
  - 新區段：AI 工具整合狀態
  - 驗證整合檔案存在且正確參考標準
  - 回報缺少的標準參考並提供修復建議
- **Skills**：新增 `/config` 斜線命令用於標準配置

### 變更
- **CLI**：整合檔案現在預設包含合規指示和標準索引（index 模式）

## [3.5.0-beta.4] - 2026-01-09

### 新增
- **CLI**：AI 整合檔案的參考同步功能
  - `uds check` 現在顯示「參考同步狀態」區段
    - 偵測孤立參考（整合檔案中的參考不在 manifest 中）
    - 回報缺少參考（manifest 中的標準未被參考）
  - `uds update --sync-refs` 根據 manifest 標準重新產生整合檔案
  - manifest 中新增 `integrationConfigs` 欄位以保存產生設定
- **Utils**：新增 `reference-sync.js` 模組，含類別對標準的對應

### 變更
- **CLI**：Manifest 版本從 3.1.0 升級至 3.2.0
  - 新增 `integrationConfigs` 欄位儲存整合檔案產生設定
  - 允許 `uds update --sync-refs` 使用相同選項重新產生（類別、詳細等級、語言）

## [3.5.0-beta.3] - 2026-01-09

### 修復
- **CLI**：修復 `uds update` 顯示錯誤版本號
  - `standards-registry.json` 版本與 `package.json` 未同步
  - 現在顯示正確的當前和最新版本資訊

### 新增
- **腳本**：新增版本同步檢查腳本
  - `scripts/check-version-sync.sh` 用於 Unix/macOS
  - `scripts/check-version-sync.ps1` 用於 Windows PowerShell
  - 驗證 `standards-registry.json` 版本與 `package.json` 一致
- **文件**：將版本同步檢查新增至 `release-workflow.md` 預發布檢查清單

## [3.5.0-beta.2] - 2026-01-09

### 新增
- **整合**：OpenAI Codex CLI 整合，使用 `AGENTS.md`
- **整合**：Gemini CLI 整合，使用 `GEMINI.md`
- **整合**：OpenCode 整合，使用 `AGENTS.md`
- **整合**：Google Antigravity 專案級規則檔案 (`.antigravity/rules.md`)

### 移除
- **CLI**：從 `uds check` 移除未追蹤檔案掃描
  - `uds check` 現在只驗證 manifest 中記錄的檔案
  - 不再提示追蹤 `.standards/` 目錄中的未知檔案

## [3.5.0-beta.1] - 2026-01-09

### 新增
- **CLI**：新增 `uds configure` 命令用於後安裝配置
  - 子命令：`add-tool`、`remove-tool`、`set-level`
  - 互動模式支援
- **CLI**：改進 `uds init` 流程
  - 新增 AI 工具選擇提示
  - 新增整合檔案配置選項
- **CLI**：manifest 版本升級至 3.2.0
  - 新增 `aiTools` 欄位追蹤選擇的 AI 工具
  - 新增 `integrations` 欄位列出產生的整合檔案

### 變更
- **CLI**：重構整合產生器以支援多 AI 工具
- **CLI**：改進錯誤處理和使用者回饋

## [3.4.1] - 2026-01-08

### 修復
- **CLI**：修復 `uds update` 建議從較新版本降級的問題
  - 新增正確的語義版本比較，支援預發布版本（alpha/beta/rc）
  - 現在能正確識別當前版本比 registry 版本更新的情況
  - 當使用者版本比 registry 更新時顯示提示訊息
- **CLI**：更新 `standards-registry.json` 版本與 package.json 一致

## [3.4.0] - 2026-01-08

### 新增
- **CLI**：`uds check` 新增基於雜湊值的檔案完整性檢查
  - 透過比較 SHA-256 雜湊值偵測修改的檔案
  - 新增選項：`--diff`、`--restore`、`--restore-missing`、`--no-interactive`、`--migrate`
  - 互動模式：偵測到問題時提示操作（檢視差異、還原、保留、跳過）
  - 舊版 manifest 遷移：`uds check --migrate` 升級至基於雜湊值的追蹤
- **CLI**：manifest 中儲存檔案雜湊值（版本 3.1.0）
  - `uds init` 在安裝時計算並儲存檔案雜湊值
  - `uds update` 在更新檔案後重新計算雜湊值
- **Utils**：新增 `hasher.js` 工具模組用於 SHA-256 檔案雜湊

### 變更
- **CLI**：manifest 版本從 3.0.0 升級至 3.1.0
  - 新增 `fileHashes` 欄位追蹤檔案完整性
  - 向後相容舊版 manifest

### 修復
- **CLI**：修復 `uds check` 錯誤顯示「Skills 已標記為已安裝但找不到」警告
  - 現在正確識別 Plugin Marketplace 安裝路徑（`~/.claude/plugins/cache/`）
- **CLI**：修復 `uds update` 指令失敗並顯示「undefined」錯誤
  - 為非同步 `copyStandard()` 和 `copyIntegration()` 呼叫新增遺漏的 `await`

## [3.3.0] - 2026-01-08

### 新增
- **Skills**：新增 9 個斜線命令，用於手動觸發工作流程
  - `/commit` - 產生 conventional commit message
  - `/review` - 執行系統性程式碼審查
  - `/release` - 引導發布流程
  - `/changelog` - 更新 CHANGELOG.md
  - `/requirement` - 撰寫用戶故事和需求
  - `/spec` - 建立規格文件
  - `/tdd` - 測試驅動開發工作流程
  - `/docs` - 建立/更新文件
  - `/coverage` - 分析測試覆蓋率
- **Core**：新增測試驅動開發 (TDD) 標準
  - 新增 `core/test-driven-development.md`，涵蓋 Red-Green-Refactor 循環
  - SDD + TDD 整合工作流程指南
- **Skills**：新增 `tdd-assistant` 技能（第 15 個技能）

### 變更
- **Skills**：簡化斜線命令格式，從 `/uds:xxx` 改為 `/xxx`
  - 移除 `uds:` 命名空間前綴，使命令調用更簡潔
- **Plugin Marketplace**：將 marketplace 名稱從 `universal-dev-standards` 改為 `asia-ostrich`
  - 新安裝命令：`/plugin install universal-dev-standards@asia-ostrich`

### 修復
- **CLI**：`uds skills` 現在優先偵測新的 `@asia-ostrich` marketplace
- **CLI**：將 `tdd-assistant` 新增至 standards-registry.json

### 遷移指南
如果你使用舊的 marketplace 名稱安裝，請進行遷移：

```bash
/plugin uninstall universal-dev-standards@universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.5] - 2026-01-07

### 新增
- **Skills**：新增 9 個斜線命令，用於手動觸發工作流程
  - `/commit` - 產生 commit message
  - `/review` - 執行程式碼審查
  - `/release` - 引導發布流程
  - `/changelog` - 更新變更日誌
  - `/requirement` - 撰寫用戶故事
  - `/spec` - 建立規格文件
  - `/tdd` - TDD 工作流程
  - `/docs` - 文件撰寫
  - `/coverage` - 測試覆蓋率
  - 命令與技能的差異：命令為手動觸發，技能為自動觸發

### 修復
- **CLI**：`uds skills` 現在優先偵測新的 `@asia-ostrich` marketplace
  - 當偵測到舊版 `@universal-dev-standards` marketplace 時顯示遷移提示
  - 確保遷移期間的相容性

## [3.3.0-beta.4] - 2026-01-07

### 變更
- **Plugin Marketplace**：將 marketplace 名稱從 `universal-dev-standards` 改為 `asia-ostrich`
  - 新安裝命令：`/plugin install universal-dev-standards@asia-ostrich`
  - 這提供與 AsiaOstrich 組織更好的品牌一致性

### 遷移指南
如果你使用舊的 marketplace 名稱安裝，請進行遷移：

```bash
# 1. 卸載舊版本
/plugin uninstall universal-dev-standards@universal-dev-standards

# 2. 安裝新版本
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.3] - 2026-01-07

### 修復
- **CLI**：將 `tdd-assistant` 新增至 standards-registry.json
  - 新增 TDD 的技能檔案列表和標準項目
  - `uds skills` 現在正確顯示 15/15 個技能

## [3.3.0-beta.2] - 2026-01-07

### 新增
- **Core**：新增測試驅動開發 (TDD) 標準
  - 新增 `core/test-driven-development.md` 涵蓋 Red-Green-Refactor 循環、FIRST 原則、TDD vs BDD vs ATDD
  - SDD + TDD 整合工作流程指引
  - ML 測試邊界（模型準確度 vs 資料工程）
  - 遺留系統的 Golden Master 測試
- **Skills**：為 Claude Code 新增 `tdd-assistant` 技能（第 15 個技能）
  - `skills/tdd-assistant/SKILL.md` - TDD 工作流程指引
  - `skills/tdd-assistant/tdd-workflow.md` - 逐步 TDD 流程
  - `skills/tdd-assistant/language-examples.md` - 6 種語言範例
  - 所有 TDD 檔案的完整繁體中文翻譯

### 變更
- **核心標準**：更新相關標準中的交叉引用
  - `spec-driven-development.md` - 新增 TDD 整合引用
  - `testing-standards.md` - 新增 TDD 交叉引用
  - `test-completeness-dimensions.md` - 新增 TDD 交叉引用
- **發布流程**：擴展預發布檢查清單，加入完整的檔案驗證
  - 新增版本檔案檢查清單，涵蓋所有版本相關檔案
  - 重新命名為文件驗證檢查清單，加入正確性驗證
  - 新增內容正確性驗證區塊，包含 grep 指令
  - 使用 `locales/*` 萬用字元涵蓋所有語言版本

## [3.2.2] - 2026-01-06

### 新增
- **CLI**：新增 `uds skills` 指令列出已安裝的 Claude Code skills
  - 顯示來自 Plugin Marketplace、使用者層級和專案層級的安裝
  - 顯示每個安裝的版本、路徑和 skill 數量
  - 對已棄用的手動安裝顯示警告
- **CLI**：根據安裝位置改善 Skills 更新指示

### 棄用
- **Skills**：透過 `install.sh` / `install.ps1` 手動安裝現已棄用
  - 建議：使用 Plugin Marketplace 以獲得自動更新
  - 腳本將顯示棄用警告並要求確認
  - 將在未來的主要版本中移除

### 變更
- **CLI**：`uds update` 現在對手動安裝的 Skills 顯示棄用警告
  - 建議遷移至 Plugin Marketplace
- **Skills**：更新 README.md 將手動安裝標記為棄用

### 修復
- **CLI**：更新標準註冊表版本至 3.2.2

## [3.2.2-beta.2] - 2026-01-05

### 新增
- **CLI**：根據安裝位置改善 Skills 更新指示
  - Marketplace：透過 Plugin Marketplace UI 更新的指引
  - 使用者層級：`cd ~/.claude/skills/... && git pull`
  - 專案層級：`cd .claude/skills/... && git pull`

### 修復
- **CLI**：更新標準註冊表版本至 3.2.2
  - 讓 `uds update` 能偵測現有專案的新版本

## [3.2.2-beta.1] - 2026-01-05

### 新增
- **Skills**：新增發布流程指南，提供完整的發布流程
  - 新增 `skills/release-standards/release-workflow.md` 包含逐步發布指示
  - 涵蓋 beta、alpha、rc 和穩定版發布工作流程
  - 包含 npm dist-tag 策略、疑難排解和 AI 助理指南
  - 在 CLAUDE.md 中新增發布流程章節供 AI 助理參考
- **CLI**：為 AI 工具整合新增對話語言設定
  - 所有 AI 工具整合檔案現在都包含對話語言指示
  - 支援英文、繁體中文和雙語模式
  - 為 Claude Code 使用者生成包含語言設定的 CLAUDE.md
- **CLI**：為 prompts 和 utils 模組新增完整測試
  - 測試覆蓋率從 42.78% 提升至 72.7%
  - 總測試數從 94 增加至 210

### 修復
- **CLI**：僅在 Claude Code 是唯一選擇的 AI 工具時才詢問 Skills
  - 修復選擇多個 AI 工具與 Skills 時可能導致其他工具遺漏完整標準的問題
- **CI/CD**：修復 npm 發布工作流程，正確標記 beta/alpha/rc 版本
  - 在 `.github/workflows/publish.yml` 中新增自動版本偵測
  - Beta 版本現在使用 `@beta` 標籤而非 `@latest`
  - 使用者現在可以使用 `npm install -g universal-dev-standards@beta` 安裝 beta 版本

### 變更
- **核心規範**：為 5 個核心標準新增業界參考標準
  - `error-code-standards.md` v1.0.0 → v1.1.0: RFC 7807, RFC 9457, HTTP Status Codes
  - `logging-standards.md` v1.0.0 → v1.1.0: OWASP Logging, RFC 5424, OpenTelemetry, 12 Factor App
  - `code-review-checklist.md` v1.1.0 → v1.2.0: SWEBOK v4.0 Ch.10 (Software Quality)
  - `checkin-standards.md` v1.2.5 → v1.3.0: SWEBOK v4.0 Ch.6 (Configuration Management)
  - `spec-driven-development.md` v1.1.0 → v1.2.0: IEEE 830-1998, SWEBOK v4.0 Ch.1 (Requirements)
- **測試標準**：新增 SWEBOK v4.0 參考和新章節
  - `testing-standards.md` v2.0.0 → v2.1.0: Testing Fundamentals, Test-Related Measures, Pairwise/Data Flow Testing
- **文件**：更新 MAINTENANCE.md 加入 npm dist-tag 策略
  - 新增不同版本模式的 dist-tag 表格
  - 新增手動修正標籤的指令說明

## [3.2.1-beta.1] - 2026-01-02

### 新增
- **CLI**：在 Skills 安裝流程中新增 Plugin Marketplace 支援
  - 在 Skills 安裝提示中新增「Plugin Marketplace (推薦)」選項
  - CLI 在 manifest 中追蹤透過 marketplace 安裝的 Skills，不嘗試本地安裝
  - `uds check` 指令現在會顯示 marketplace 安裝狀態

### 修復
- **CLI**：修復 standards registry 中通配符路徑處理導致 404 錯誤
  - 將 `templates/requirement-*.md` 通配符替換為明確檔案路徑
  - 為 requirement-checklist.md、requirement-template.md、requirement-document-template.md 新增明確條目
- **CLI**：修復 `uds init`、`uds configure` 和 `uds update` 指令執行後程式未退出的問題
  - 新增明確的 `process.exit(0)` 以防止 inquirer readline interface 阻擋程式終止

## [3.2.0] - 2026-01-02

### 新增
- **Claude Code Plugin Marketplace 支援**：啟用透過 Plugin Marketplace 分發
  - 新增 `.claude-plugin/plugin.json` - Plugin manifest 配置
  - 新增 `.claude-plugin/marketplace.json` - Marketplace 分發配置
  - 新增 `.claude-plugin/README.md` - Plugin 文檔和維護指南
  - 更新 `skills/README.md` 新增方法 1：Marketplace 安裝（推薦）

### 優點
- 使用者可以用單一指令安裝所有 14 個技能：`/plugin install universal-dev-standards@universal-dev-standards`
- 新版本發布時自動更新
- 透過 Claude Code marketplace 提升可發現性
- 保持與腳本安裝的向後相容性（方法 2 和 3）

### 變更
- 在 `CLAUDE.md` 新增 AI 助手對話語言要求（繁體中文）

### 修復
- 修復 CLI 版本讀取，改用 `package.json` 而非硬編碼值

## [3.1.0] - 2025-12-30

### 新增
- **簡體中文 (zh-CN) 翻譯**：為簡體中文使用者提供完整本地化
  - 新增 `locales/zh-CN/README.md` - 完整 README 翻譯
  - 新增 `locales/zh-CN/CLAUDE.md` - 專案指南翻譯
  - 新增 `locales/zh-CN/docs/WINDOWS-GUIDE.md` - Windows 指南翻譯
- 在所有 README 版本中新增語言切換連結（EN, zh-TW, zh-CN）

- **完整 Windows 支援**：為 Windows 使用者提供完整的跨平台相容性
  - 新增 `.gitattributes` 確保跨平台換行符一致性
  - 新增 `scripts/check-translation-sync.ps1` - 翻譯檢查器 PowerShell 版本
  - 新增 `skills/install.ps1` - Skills 安裝器 PowerShell 版本
  - 新增 `scripts/setup-husky.js` - 跨平台 Husky 設定腳本
  - 新增 `docs/WINDOWS-GUIDE.md` - 完整的 Windows 開發指南
- **5 個新 Claude Code 技能**：技能庫從 9 個擴充至 14 個
  - `spec-driven-dev` - SDD 工作流程指引（觸發詞：spec, proposal, 提案）
  - `test-coverage-assistant` - 7 維度測試完整性框架（觸發詞：test coverage, dimensions, 測試覆蓋）
  - `changelog-guide` - 變更日誌撰寫標準（觸發詞：changelog, release notes, 變更日誌）
  - `error-code-guide` - 錯誤碼設計模式（觸發詞：error code, 錯誤碼）
  - `logging-guide` - 結構化日誌標準（觸發詞：logging, log level, 日誌）
- 新增**雙重性質標準**分類至 `STATIC-DYNAMIC-GUIDE.md` - 同時具有靜態和動態元件的標準
- 新增**動態 vs 靜態分類**章節至 `MAINTENANCE.md` - 標準分類指南
- 將 `checkin-standards` 核心規則加入 `CLAUDE.md` 作為靜態標準
- 新增 5 個新技能的完整繁體中文翻譯（共 10 個檔案）

### 變更
- 更新 `cli/package.json` 的 prepare 腳本使用跨平台 `setup-husky.js`
- 更新 `README.md`、`cli/README.md`、`CLAUDE.md` 添加 Windows 安裝說明
- 更新 `STATIC-DYNAMIC-GUIDE.md` 至 v1.1.0 - 引入雙重性質標準概念，更新至 14 個技能
- 更新 `MAINTENANCE.md` - 新增 `STATIC-DYNAMIC-GUIDE.md` 交叉引用，擴展 Workflow 4 分類檢查清單
- 更新 `MAINTENANCE.md` 技能表格從 9 個擴充至 14 個（35 個技能檔案 + 10 個共用/README = 45 個檔案）
- 同步 `MAINTENANCE.md` 和 `STATIC-DYNAMIC-GUIDE.md` 的繁體中文翻譯

## [3.0.0] - 2025-12-30

### 新增
- **AI 優化標準架構**：新增 `.ai.yaml` 雙格式支援
- 新增 `ai/standards/` 目錄，包含 15 個 AI 優化標準檔案
- 新增 `ai/options/` 目錄，包含語言特定和工作流程選項
- 新增 `MAINTENANCE.md` - 專案維護指南與檔案結構概覽
- 新增 `ai/MAINTENANCE.md` - AI 標準維護工作流程指南
- 新增 `STANDARDS-MAPPING.md` - 標準與技能對應矩陣
- 新增 6 個 AI 優化標準：
  - `anti-hallucination.ai.yaml` - AI 協作標準
  - `checkin-standards.ai.yaml` - 程式碼簽入標準
  - `documentation-writing-standards.ai.yaml` - 文件撰寫指南
  - `spec-driven-development.ai.yaml` - SDD 工作流程
  - `test-completeness-dimensions.ai.yaml` - 7 維度測試框架
  - `versioning.ai.yaml` - 語義化版本標準
- 新增所有新標準和技能的完整繁體中文翻譯（共 78 個檔案）

### 變更
- 統一核心標準的版本格式為 `**Version**: x.x.x`
- 為所有 zh-TW 翻譯的 YAML front matter 新增 `source` 欄位以追蹤同步
- 更新翻譯同步腳本，改進驗證功能

### 修正
- 修正 `core/error-code-standards.md` 和 `core/logging-standards.md` 的版本格式不一致
- 修正 zh-TW 技能翻譯中的來源路徑

## [2.3.0] - 2025-12-25

### 新增
- **多語言支援**：新增 `locales/` 目錄結構用於國際化
- 新增所有文件的繁體中文 (zh-TW) 翻譯（44 個檔案）
  - `locales/zh-TW/core/` - 13 個核心規範翻譯
  - `locales/zh-TW/skills/` - 25 個 skill 檔案翻譯
  - `locales/zh-TW/adoption/` - 5 個採用指南翻譯
  - `locales/zh-TW/README.md` - 完整的中文 README
- 為所有英文文件新增語言切換器
- 新增 `scripts/check-translation-sync.sh` - 翻譯同步檢查腳本
- 為 Skills 文件新增靜態與動態規範分類說明
- 新增 `templates/CLAUDE.md.template` - 靜態規範整合範本
- 新增 `adoption/STATIC-DYNAMIC-GUIDE.md` - 詳細分類指南

### 變更
- 將雙語內容分離到專用語言檔案（AI 工具減少約 50% token 消耗）
- 英文版本現在僅包含英文內容並帶有語言切換器
- 更新 `skills/README.md` - 新增靜態與動態區塊及觸發關鍵字

## [2.2.0] - 2025-12-24

### 新增
- 為所有 Skills 文件新增標準區段（23 個檔案）
  - 8 個 SKILL.md 檔案：新增目的、相關標準、版本歷史、授權區段
  - 15 個支援文件：新增雙語標題、metadata 及標準區段

### 變更
- 統一 Skills 文件格式與 Core 標準
- 新增 Skills 與 Core 文件之間的交叉引用

## [2.1.0] - 2025-12-24

### 新增
- **整合 Skills**：將 `universal-dev-skills` 合併至 `skills/` 目錄
- 新增 `skills/` - 所有 Claude Code Skills 現已包含在主儲存庫中
- 新增 `skills/_shared/` - 用於多 AI 工具支援的共享模板
- 為未來 AI 工具新增佔位目錄：`skills/cursor/`、`skills/windsurf/`、`skills/cline/`、`skills/copilot/`

### 變更
- CLI 現在從本地 `skills/` 安裝技能，而非從遠端儲存庫獲取
- 更新 `standards-registry.json` 以反映整合的 skills 架構

### 遷移指南
- 如果您之前單獨使用 `universal-dev-skills`，現在可以使用本儲存庫中包含的 skills
- 執行 `cd skills && ./install.sh` 從整合位置重新安裝 skills

## [2.0.0] - 2025-12-24

### 變更

**破壞性變更**：專案從 `universal-doc-standards` 更名為 `universal-dev-standards`

這反映了專案擴展的範圍，涵蓋所有開發標準，而不僅僅是文件。

#### 遷移指南

- 從新的儲存庫重新 clone：`git clone https://github.com/AsiaOstrich/universal-dev-standards.git`
- 如果使用全域安裝，請在 CLI 目錄重新執行 `npm link`
- 使用 `npx universal-dev-standards` 取代 `npx universal-doc-standards`
- `uds` 命令保持不變

### 新增
- 新增 `extensions/languages/php-style.md` - 基於 PSR-12 的 PHP 8.1+ 編碼風格指南
- 新增 `extensions/frameworks/fat-free-patterns.md` - Fat-Free Framework v3.8+ 開發模式

## [1.3.1] - 2025-12-19

### 新增
- 新增 Mock 限制章節至 `testing-standards.md` - Mock 需要整合測試的指南
- 新增測試資料管理模式至 `testing-standards.md` - 識別碼區分與複合鍵指南
- 新增「何時需要整合測試」表格至 `testing-standards.md` - 6 種必須整合測試的情境

## [1.3.0] - 2025-12-16

### 新增
- 新增 `changelog-standards.md` - 完整的變更日誌撰寫指南
- 新增決策樹和選擇矩陣至 `git-workflow.md`，協助工作流程策略選擇
- 新增語言選擇指南至 `commit-message-guide.md`，協助選擇提交訊息語言

### 變更
- 更新 `versioning.md` - 新增交叉引用至 changelog-standards.md
- 更新 `git-workflow.md` - 在發布準備中新增 CHANGELOG 更新指南
- 更新 `zh-tw.md` - 新增術語：變更日誌、發布說明、破壞性變更、棄用、語義化版本
- 更新 `changelog-standards.md` - 與 versioning.md 統一排除規則，新增交叉引用
- 更新 `checkin-standards.md` - 釐清 CHANGELOG 更新僅適用於使用者可感知的變更
- 更新 `code-review-checklist.md` - 與 changelog-standards.md 統一 CHANGELOG 區段

### 修正
- 修正 `commit-message-guide.md` 和 `documentation-writing-standards.md` 標頭格式不一致問題
- 統一交叉引用使用 markdown 連結格式而非反引號

## [1.2.0] - 2025-12-11

### 新增
- 新增 `project-structure.md` - 專案目錄結構規範
- 在 `documentation-structure.md` 新增實體 DFD 層

### 變更
- 更新 `documentation-structure.md` - 釐清流程/圖表分離，改進檔案命名規範
- 更新 `checkin-standards.md` - 新增目錄衛生指南
- 改進通用性，將專案特定範例替換為通用佔位符

## [1.1.0] - 2025-12-05

### 新增
- 新增 `testing-standards.md` - 完整測試金字塔標準（單元/整合/系統/端對端測試）
- 新增 `documentation-writing-standards.md` - 文件內容需求標準

### 變更
- 更新 `anti-hallucination.md` - 強化出處標示指南
- 更新 `zh-tw.md` - 與 commit-message-guide.md v1.2.0 同步

## [1.0.0] - 2025-11-12

### 新增
- 初始發布，包含核心標準
- 核心標準：反幻覺、簽入標準、提交訊息指南、Git 工作流程、程式碼審查檢查清單、版本標準、文件結構
- 擴充：C# 風格指南、繁體中文本地化
- 範本：需求文件範本
- 整合：OpenSpec 框架

[Unreleased]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.7.0...HEAD
[5.7.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.6.0...v5.7.0
[3.4.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.3.0...v3.4.0
[3.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.0.0...v3.3.0
[3.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.3.0...v3.0.0
[2.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.1...v2.0.0
[1.3.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/releases/tag/v1.0.0
