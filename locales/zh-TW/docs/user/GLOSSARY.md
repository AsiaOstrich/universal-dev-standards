---
source: docs/user/GLOSSARY.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# UDS 術語表

> **語言**: [English](../../../../docs/user/GLOSSARY.md) | 繁體中文

UDS 專屬，或在 UDS 脈絡下有特定用法的術語。

---

## A

**AC（Acceptance Criterion，驗收條件）**
一條可測試的陳述，定義一個功能何時算完成。以 Given-When-Then 或一般英文撰寫。AC 記錄在 Spec 檔中，並在測試裡被引用。
_參見：`/atdd`、`/sdd`、`acceptance-test-driven-development` 標準_

**Activity（活動）**
在 DEC-051 四層分類模型中，Activity 是一個具名的工作流程步驟（例如「撰寫失敗的測試」、「執行回歸測試」）。Activity 定義於 UDS 標準中，並由 Skill 執行。

**ADR（Architecture Decision Record，架構決策記錄）**
記錄一項重大技術決策的文件：脈絡、考量過的選項、所選方案，以及後果。
_參見：`/adr`、`adr-standards` 標準_

**ATDD（Acceptance Test-Driven Development，驗收測試驅動開發）**
一種實務做法：在開始實作前先定義驗收條件，並撰寫測試來驗證這些 AC。橋接 BDD 與 TDD。
_參見：`/atdd`_

---

## B

**BDD（Behavior-Driven Development，行為驅動開發）**
一種使用自然語言 Given-When-Then 場景來描述系統行為的開發實務。場景同時作為文件與測試規格。
_參見：`/bdd`、`behavior-driven-development` 標準_

**Bundle（Bundle 層）**
包含在 `npm install` 套件中的 UDS 標準子集（供採用者使用）。與 Source 層不同——後者包含所有標準，含治理與維護工具。
_參見：DEC-045_

---

## C

**Core Standard（核心標準）**
位於 `core/`（以及 `.standards/*.md`）的 Markdown 檔，包含某個 UDS 標準完整、人類可讀的版本。涵蓋背後理由、邊界案例、範例與參考資料。
_對比：AI Standard_

**AI Standard（AI 標準）**
位於 `.standards/`（以及 `ai/standards/`）的 `.ai.yaml` 檔，是 Core Standard 的 token 精簡、為 AI 最佳化的編碼。Skill 在執行時讀取它。

---

## D

**DEC（Decision，決策）**
記錄於 `dev-platform/cross-project/decisions/DEC-NNN-*.md` 的跨專案架構或產品決策。DEC 依序編號，追蹤重大選擇背後的「為什麼」。

**Dual-Layer Architecture（雙層架構）**
UDS 的兩層設計：Core Standards（完整知識、人類可讀）+ AI Standards（token 精簡、機器可讀）。Skill 使用 AI Standards；開發者閱讀 Core Standards。

---

## S

**SDD（Spec-Driven Development，規格驅動開發）**
一種 UDS 實務做法：在寫程式碼前先建立規格文件。Spec 定義背景、範圍、驗收條件與範圍外項目。
_參見：`/sdd`、`spec-driven-development` 標準_

**Skill**
封裝為 SKILL.md 檔的預建 AI 工作流程。在 Claude Code 輸入 `/<name>` 即可啟動。Skill 運用 AI Standards 來實作 UDS 的活動。
_參見：[SKILLS-INDEX.md](../../../../docs/user/SKILLS-INDEX.md)_

**Skill Budget（Skill 預算）**
Claude Code 的 context window 中保留用於列出可用 skill 的比例。當有 55+ 個 skill 時，描述可能被截斷。UDS 以 Tier 來管理這項預算。
_參見：DEC-061、[skill-budget-tuning.md](../../../../docs/skill-budget-tuning.md)_

**Skill Tier（Skill 分級，DEC-061）**
依使用頻率對 skill 進行分類，藉以控制列出行為：
- **Tier 1（Core）**：15 個 skill，每日使用，永遠以描述列出
- **Tier 2（Advanced）**：28 個 skill，每週使用，預設以描述列出
- **Tier 3（Specialist）**：12 個 skill，事件驅動，預設僅列出名稱（仍可透過 `/<name>` 呼叫）

**Standard（標準）**
涵蓋某項特定實務（例如 commit 訊息、API 設計、測試）的 UDS 準則文件。標準與技術、語言無關。每個標準同時存在為 Core Standard（`.md`）與 AI Standard（`.ai.yaml`）。

**Source（Source 層）**
完整的 UDS 儲存庫，包含所有標準、治理工具與維護腳本。是 Bundle 層的超集合。
_參見：DEC-045_

---

## T

**TDD（Test-Driven Development，測試驅動開發）**
一種在實作程式碼前先撰寫測試的開發實務。RED-GREEN-REFACTOR 循環：寫一個失敗的測試 → 讓它通過 → 重構。
_參見：`/tdd`、`test-driven-development` 標準_

---

## U

**UDS（Universal Development Standards，通用開發標準）**
本專案。一套與語言無關、與框架無關的軟體開發品質彙集，含 149 個核心標準、55 個 AI skill 與 51 個斜線命令。

**UDS Manifest（`uds-manifest.json`）**
所有 UDS 標準與 skill 的機器可讀索引。包含統計數據、skill 對命令的對照，以及分類歸屬。供 UDS CLI 與文件產生器使用。

---

## X

**XSPEC（Cross-Project Spec，跨專案規格）**
位於 `dev-platform/cross-project/specs/XSPEC-NNN-*.md` 的規格文件。用於影響多個子專案（UDS、VibeOps、telemetry）的功能，或新的 UDS 功能。
_依集中化政策（2026-04-22），所有新 spec 一律建立為 XSPEC。_

---

## 術語正規化（Canonical Forms，標準形式）

> 跨標準反覆出現的術語與符號之單一真實來源（XSPEC-292 T6）。這些表格把**既有、刻意為之**的慣例明文化，讓新標準對齊而非漂移。它們**不會**重新命名任何東西——多數看似「雙重術語」的情況其實是依層級設計、各得其所（例如 JSON body 中的 `createdAt` 對比資料庫欄位的 `created_at` 是正確的，並非衝突）。

### 依層級的欄位命名

同一個概念依其所在層級的慣例書寫。跨越層級邊界是一種轉換，而非不一致。

| 層級 | 慣例 | 範例 |
|------|------|------|
| 結構化日誌（JSON） | `snake_case` | `trace_id`、`request_id`、`http_method`、`db_table` |
| API JSON body | `camelCase` | `createdAt`、`firstName`、`httpStatus` |
| API 查詢參數 | `snake_case` | `?sort_by=created_at` |
| URL 路徑片段 | `kebab-case` | `/user-profiles` |
| HTTP header 名稱 | `lowercase-hyphen` | `x-request-id`、`traceparent` |
| 資料庫資料表／欄位 | `snake_case`（單數資料表）| `user_account`、`created_at` |
| 程式碼識別子 | 語言原生 | `camelCase`（JS/TS）、`snake_case`（Python/Go）|

_標準：`logging-standards`、`api-design-standards`、`database-standards`。_

### 測試層級縮寫

大寫＝該術語；小寫＝環境識別子。`IT` 永遠指 Integration Testing（整合測試），絕非 Information Technology。

| 縮寫 | 全稱 | 典型環境 |
|------|------|----------|
| `UT` | Unit Testing（單元測試）| `local` |
| `IT` | Integration Testing（整合測試）| `local` / `ci` |
| `ST` | System Testing（系統測試）| `ci` / `sit` |
| `E2E` | End-to-End Testing（端到端測試）| `staging` |
| `AT` | Acceptance Testing（驗收測試）| — |
| `UAT` | User Acceptance Testing（使用者驗收測試）| — |
| `SIT` | System Integration Testing（系統整合測試，該術語）；`sit` 是 SIT **環境** id | `ci` |

_標準：`testing`（testing-standards）、`test-governance`。_

### 狀態：文字 vs 符號

**文字**是標準／機器可讀的值；**符號**是可選的視覺呈現。兩者成對，並非互相競爭。

| 標準文字 | 符號 | 領域 |
|----------|------|------|
| `covered` | ✅ | AC／測試覆蓋 |
| `partial` | ⚠️ | AC／測試覆蓋 |
| `uncovered` | ❌ | AC／測試覆蓋（測試缺口）|
| `not_implemented` | 🚫 | AC（程式碼缺口，非測試缺口）|

_領域專屬的生命週期各自維持獨立的狀態機——ADR（`Proposed → Accepted → Deprecated → Superseded`）、文件生命週期（`draft → active → archived`），以及上方的 AC 覆蓋彼此不同，**不會**被合併。標準：`acceptance-criteria-traceability`、`adr-standards`、`documentation-structure`。_

---

## 另見

- [FAQ.md](FAQ.md) — 常見問題
- [SKILLS-INDEX.md](../../../../docs/user/SKILLS-INDEX.md) — 所有 skill 與描述
- [GETTING-STARTED.md](GETTING-STARTED.md) — 首次設定
