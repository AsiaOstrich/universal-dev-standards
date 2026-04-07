# SuperSpec 功能借鑒 — UDS Phase 1-2 Implementation Spec

**狀態**: Draft
**建立日期**: 2026-04-07
**跨專案參考**: XSPEC-005（dev-platform/cross-project/specs/）
**參考來源**: [SuperSpec](https://github.com/asasugar/SuperSpec)

> **本文件為自足規格**，包含所有實作所需的完整變更描述、程式碼位置和介面設計。
> 不需要讀取 dev-platform 的文件即可進行開發。

---

## 摘要

選擇性借鑒 SuperSpec 框架的 6 項功能，增強 UDS 的規格管理能力：

| Phase | 功能 | 優先級 |
|-------|------|--------|
| 1A | Artifact Size Control + Enforce Gate | P1 |
| 1B | Spec Dependency Tracking (`depends_on`) | P1 |
| 1C | Dual Mode (Standard/Boost) + Approach 欄位 | P2 |
| 2A | Cross-Reference Validation (`uds lint`) | P1 |
| 2B | Checklist Scoring (/10, /25) | P2 |
| 2C | Git-Diff Context Sync (`uds sync`) | P3 |

## 動機

UDS 的 SDD 工作流程在以下面向缺乏支撐：

1. **規格無大小護欄** — 複雜 feature 的 spec 可超過 500 行，耗盡 AI context window
2. **交叉引用無自動驗證** — `acceptance-criteria-traceability.ai.yaml` 定義了追蹤矩陣但無 CLI 工具自動檢查
3. **micro-spec vs full SDD 是隱式分野** — 無正式 mode selector
4. **AC 只有布林值** — 缺乏量化品質評分
5. **Session 恢復依賴重量級 workflow-state** — 缺輕量 git diff 上下文匯出
6. **Spec 間依賴是散文描述** — 非機器可讀

---

## Phase 1：基礎標準擴展

### 1A. Artifact Size Control + Enforce Gate

#### 要修改的檔案

##### 1A-1. `.standards/spec-driven-development.ai.yaml`

在現有 `rules:` array 中新增一條 rule：

```yaml
  - id: spec-size-control
    description: "控制規格產物大小，防止 AI context window 溢出"
    when: "建立或修改 spec 檔案時"
    action: |
      檢查 spec 有效行數（排除 YAML frontmatter 和 fenced code blocks）：
      - ≤ 300 行：✅ 通過
      - 301-400 行：⚠️ 警告，建議精簡或拆分
      - > 400 行：❌ 超過 hard cap，必須拆分（使用 depends_on 串聯子 specs）
    config:
      target_lines: 300
      hard_cap_lines: 400
      exclude_patterns:
        - "^---$"           # YAML frontmatter delimiters
        - "^```"            # fenced code block delimiters
      configurable: true    # 可透過 .uds/config.yaml 覆寫
      config_path: "spec.size_control.target_lines / spec.size_control.hard_cap_lines"
```

##### 1A-2. `.standards/workflow-enforcement.ai.yaml`

在 `gates.sdd.phases` 的 `implement` phase 中，新增一個 prerequisite check（加在 `spec_approved` 之後）：

```yaml
      - check: spec_size_within_limit
        condition: "spec 有效行數 ≤ hard_cap_lines (預設 400)"
        on_fail:
          enforce: "STOP — Spec 超過 {hard_cap_lines} 行 hard cap。請先使用 `uds spec split` 或手動拆分為子 specs（用 depends_on 串聯），再進入實作階段。"
          suggest: "WARNING — Spec 超過 {hard_cap_lines} 行，建議拆分。繼續？[y/N]"
          off: null
        blocking: true  # enforce 模式下阻斷
```

##### 1A-3. `cli/src/utils/standard-validator.js`

在 `StandardValidator` class 中新增方法：

```javascript
/**
 * 驗證 spec 檔案的有效行數
 * @param {string} specFilePath - spec 檔案的絕對路徑
 * @param {Object} options - 選項
 * @param {number} options.targetLines - 目標行數（預設 300）
 * @param {number} options.hardCapLines - hard cap 行數（預設 400）
 * @returns {{ effectiveLines: number, status: 'pass'|'warn'|'fail', message: string }}
 */
validateSpecSize(specFilePath, options = {}) {
  const targetLines = options.targetLines ?? 300;
  const hardCapLines = options.hardCapLines ?? 400;

  // 讀取檔案
  // 計算有效行數：排除 YAML frontmatter (--- 到 ---) 和 fenced code blocks (``` 到 ```)
  // 回傳結果
}
```

計算邏輯：
1. 讀取檔案所有行
2. 跳過 YAML frontmatter（從第一個 `---` 到第二個 `---`）
3. 跳過 fenced code blocks（從 ` ``` ` 到下一個 ` ``` `）
4. 計算剩餘行數（含空行）
5. 判定 status：`pass` (≤ target) / `warn` (target < x ≤ hard_cap) / `fail` (> hard_cap)

##### 1A-4. `cli/src/commands/check.js`

新增 `--spec-size` flag：

在 `uds.js` 的 check command 註冊中新增：
```javascript
.option('--spec-size', 'Check spec file sizes against configured limits')
```

在 `checkCommand()` 中新增分支：
```javascript
if (options.specSize) {
  // 掃描 specs/ 目錄下所有 SPEC-*.md 檔案
  // 對每個檔案呼叫 validateSpecSize()
  // 以表格格式輸出結果：
  //   SPEC-001-xxx.md    250 lines  ✅ pass
  //   SPEC-002-xxx.md    350 lines  ⚠️ warning (target: 300)
  //   SPEC-003-xxx.md    450 lines  ❌ fail (hard cap: 400)
  // 如果 --ci 模式，有 fail 則 exit code 1
}
```

---

### 1B. Spec Dependency Tracking

#### 要修改的檔案

##### 1B-1. `cli/src/vibe/micro-spec.js`

**修改 `toMarkdown()` method**，在 template 中加入 `depends_on`：

現有 template（約 line 207-231）中，在 `**Type**:` 之後加入：

```markdown
**Depends On**: {dependsOn}
```

其中 `dependsOn` 格式為：
- 無依賴：`none`
- 有依賴：`SPEC-001, SPEC-003`

**修改 `create()` method**，接受 `options.dependsOn` 參數（string array），預設 `[]`。

**修改 `fromMarkdown()` method**，解析 `**Depends On**:` 行回 array。

**新增 `addDependency(id, targetId)` method**：
```javascript
addDependency(id, targetId) {
  // 讀取 spec
  // 加入 targetId 到 dependsOn array（去重）
  // 重新寫入
}
```

**新增 `removeDependency(id, targetId)` method**：
```javascript
removeDependency(id, targetId) {
  // 讀取 spec
  // 從 dependsOn array 移除 targetId
  // 重新寫入
}
```

##### 1B-2. `cli/src/commands/spec-deps.js`（新增檔案）

匯出三個 command functions：

```javascript
/**
 * uds spec deps add <id> --on <targetId>
 * 為 spec 加入依賴
 */
export async function specDepsAddCommand(id, options) {
  // 驗證 id 和 options.on 都存在
  // 驗證 targetId spec 存在（否則 warning: "SPEC-XXX not found, adding anyway"）
  // 呼叫 microSpec.addDependency(id, options.on)
  // 顯示更新後的依賴清單
}

/**
 * uds spec deps list [id]
 * 列出 spec 的依賴；無 id 時列出所有有依賴的 specs
 */
export async function specDepsListCommand(id, options) {
  // 如有 id：顯示該 spec 的 depends_on 清單，含各 target 的狀態
  // 如無 id：掃描所有 specs，顯示依賴圖
}

/**
 * uds spec deps remove <id> --on <targetId>
 * 移除 spec 的依賴
 */
export async function specDepsRemoveCommand(id, options) {
  // 呼叫 microSpec.removeDependency(id, options.on)
  // 顯示更新後的依賴清單
}
```

**在 `uds.js` 中註冊**（參考 spec 子指令的註冊方式）：

```javascript
const specDeps = spec.command('deps').description('Manage spec dependencies');
specDeps
  .command('add <id>')
  .option('--on <targetId>', 'Target spec to depend on')
  .action(specDepsAddCommand);
specDeps
  .command('list [id]')
  .action(specDepsListCommand);
specDeps
  .command('remove <id>')
  .option('--on <targetId>', 'Target spec to remove from dependencies')
  .action(specDepsRemoveCommand);
```

##### 1B-3. `.standards/spec-driven-development.ai.yaml`

在 `rules:` array 新增：

```yaml
  - id: dependency-tracking
    description: "規格之間的依賴應使用 depends_on 欄位追蹤"
    when: "spec 引用其他 spec 的產出或前置條件時"
    action: |
      在 spec 中加入 depends_on 欄位，列出依賴的 spec ID。
      - 使用 `uds spec deps add <id> --on <target>` 管理依賴
      - `uds lint` 會驗證 depends_on 目標是否存在
    format: "depends_on: [SPEC-001, SPEC-003]"
```

---

### 1C. Dual Mode Formalization + Approach 欄位

#### 要修改的檔案

##### 1C-1. `.standards/workflow-state-protocol.ai.yaml`

在 `state_file.optional_fields` 中新增：

```yaml
    - spec_mode:
        type: enum
        values: [standard, boost]
        description: "規格模式。standard = 輕量 micro-spec，boost = 完整 SDD 規格"
        default: standard
    - approach:
        type: enum
        values: [conventional, exploratory]
        description: "設計方法。conventional = 遵循既有架構，exploratory = 可提出新架構（需附理由）"
        default: conventional
        applies_to: boost  # 僅在 boost 模式有意義
```

##### 1C-2. `cli/src/commands/spec.js`

修改 `specCreateCommand`，新增兩個 option：

在 `uds.js` 的 spec create 註冊中新增：
```javascript
.option('--boost', 'Use boost mode (full SDD spec with design sections)')
.option('--approach <type>', 'Design approach: conventional or exploratory (boost only)', 'conventional')
```

在 `specCreateCommand()` 邏輯中：
```javascript
// 如果 --boost：
//   1. 設定 spec.specMode = 'boost'
//   2. 設定 spec.approach = options.approach
//   3. 使用 boost template（包含 Motivation, Detailed Design, Risks 等完整 sections）
// 否則：
//   1. 設定 spec.specMode = 'standard'
//   2. 使用現有 micro-spec template
```

##### 1C-3. `cli/src/vibe/micro-spec.js`

**修改 `toMarkdown()` method**，根據 `spec.specMode` 生成不同模板：

**Standard mode template**（現有模板 + spec_mode 欄位）：
```markdown
## Micro-Spec: {title}

**Status**: {status}
**Created**: {createdAt}
**Type**: {type}
**Spec Mode**: standard
**Depends On**: {dependsOn}

**Intent**: {intent}

**Scope**: {scope}

**Acceptance**:
- [ ] {criteria items}

**Confirmed**: {Yes/No}

**Notes**: {notes}
```

**Boost mode template**（新增）：
```markdown
## Spec: {title}

**Status**: {status}
**Created**: {createdAt}
**Type**: {type}
**Spec Mode**: boost
**Approach**: {approach}
**Depends On**: {dependsOn}

### Motivation

<!-- 為什麼需要這個變更？解決什麼問題？ -->

{auto-generated from intent}

### Detailed Design

<!-- 技術方案、架構、關鍵實作方式 -->
<!-- approach=exploratory 時：可提出新架構，需在 Trade-offs 說明偏離理由 -->

### Acceptance Criteria

- [ ] AC-1: {criteria}
- [ ] AC-2: {criteria}
- [ ] AC-3: {criteria}

### Risks & Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| | | |

### Open Questions

1.

**Confirmed**: {Yes/No}

**Notes**: {notes}
```

**修改 `parseIntent()`**，新增 boost 相關邏輯（如 intent 中包含 "redesign", "architecture", "breaking change" 等關鍵字時建議 boost mode）。

**修改 `fromMarkdown()`**，解析 `**Spec Mode**:` 和 `**Approach**:` 欄位。

---

## Phase 2：驗證管線

### 2A. Cross-Reference Validation (`uds lint`)

#### 要新增的檔案

##### 2A-1. `cli/src/utils/spec-linter.js`（新增檔案）

無狀態分析函式集合：

```javascript
/**
 * 檢查 spec 的 AC 是否被測試引用
 * @param {string} specId - e.g. "SPEC-001"
 * @param {string[]} acIds - e.g. ["AC-1", "AC-2", "AC-3"]
 * @param {string} projectPath - 專案根目錄
 * @returns {{ covered: string[], orphans: string[], coverage: number }}
 */
export function checkACCoverage(specId, acIds, projectPath) {
  // 掃描測試檔案（**/*.test.*, **/*.spec.*）
  // 搜尋 @AC-1, @AC-2 等標記
  // 回傳覆蓋率和孤兒清單
}

/**
 * 驗證 depends_on 引用的 specs 是否存在
 * @param {Object[]} specs - 所有 specs（含 depends_on）
 * @returns {{ valid: Object[], broken: Object[] }}
 */
export function checkDependencies(specs) {
  // 建立 spec ID set
  // 檢查每個 spec 的 depends_on 目標是否在 set 中
  // 回傳 broken references
}

/**
 * 檢查 spec 大小（復用 validateSpecSize 邏輯）
 * @param {string} specFilePath
 * @param {Object} options
 * @returns {{ effectiveLines: number, status: string }}
 */
export function checkSpecSize(specFilePath, options) {
  // 委託給 standard-validator.js 的 validateSpecSize
}

/**
 * 執行所有 lint 檢查
 * @param {string} projectPath
 * @returns {{ results: Object[], summary: { pass: number, warn: number, fail: number } }}
 */
export function lintAll(projectPath) {
  // 掃描 specs/ 目錄
  // 對每個 spec 執行 checkACCoverage + checkDependencies + checkSpecSize
  // 彙整結果
}
```

##### 2A-2. `cli/src/commands/lint.js`（新增檔案）

```javascript
/**
 * uds lint [options]
 * 執行規格品質 lint 檢查
 */
export async function lintCommand(options = {}) {
  // 1. 載入 specs/ 目錄下的所有 SPEC-*.md
  // 2. 呼叫 lintAll(projectPath)
  // 3. 格式化輸出：
  //
  //   Spec Lint Results
  //   ─────────────────
  //   SPEC-001-login    AC: 3/3 ✅  Deps: ok  Size: 250 ✅
  //   SPEC-002-auth     AC: 1/3 ⚠️  Deps: ok  Size: 350 ⚠️
  //   SPEC-003-payment  AC: 0/2 ❌  Deps: SPEC-099 broken ❌  Size: 450 ❌
  //
  //   Summary: 1 pass, 1 warn, 1 fail
  //
  // 4. --json 模式輸出 JSON
  // 5. --ci 模式有 fail 則 exit code 1
}
```

在 `uds.js` 中註冊：
```javascript
program
  .command('lint')
  .description('Lint spec files for quality and consistency')
  .option('--json', 'Output JSON')
  .option('--ci', 'CI mode with exit codes')
  .action(lintCommand);
```

##### 2A-3. `.standards/acceptance-criteria-traceability.ai.yaml`

在 `traceability_matrix` section 中新增：

```yaml
    lintable_fields:
      description: "可被 uds lint 自動驗證的欄位"
      fields:
        - ac_coverage:
            description: "AC 是否被測試引用（@AC-N 標記）"
            check: "掃描測試檔案中的 @AC-N 和 @SPEC-NNN 標記"
            severity: warning  # 初期為 warning，穩定後可升級為 error
        - dependency_validity:
            description: "depends_on 引用的 specs 是否存在"
            check: "驗證 depends_on 目標在 specs/ 目錄中存在"
            severity: error
        - spec_size:
            description: "spec 有效行數是否在限制內"
            check: "計算有效行數，與 size_control 設定比對"
            severity: warning  # 超過 target 為 warning，超過 hard_cap 為 error
```

---

### 2B. Checklist Scoring

#### 要修改的檔案

##### 2B-1. `.standards/spec-driven-development.ai.yaml`

在 `rules:` array 新增：

```yaml
  - id: checklist-scoring
    description: "規格品質量化評分"
    when: "spec 完成 review 前進行品質評估"
    action: |
      根據 spec_mode 執行不同深度的評分：

      ## Standard Mode (/10)

      ### Proposal Quality (5 分)
      1. Background and motivation are clear
      2. Goals are measurable
      3. Non-goals are explicit
      4. Risks identified with mitigations
      5. Impact scope assessed

      ### Requirements & Solution (5 分)
      6. Requirements are specific and splittable into tasks
      7. Boundary conditions identified
      8. Technical solution is concrete (modules/files specified)
      9. Dependencies are clear
      10. No blocking open questions (or marked non-blocking)

      ## Boost Mode (/25)

      ### Proposal Quality (5 分) — 同上 1-5

      ### Spec Completeness (5 分)
      11. All user stories have clear acceptance criteria
      12. Functional requirements cover all user stories
      13. Non-functional requirements defined
      14. Edge cases identified and documented
      15. Data model changes described

      ### Spec Consistency (5 分)
      16. Spec aligns with proposal goals
      17. User stories cover all proposal goals
      18. Acceptance criteria are testable
      19. No contradicting requirements
      20. Dependencies are clear

      ### Task Executability (5 分)
      21. Task granularity is reasonable (each < 2h)
      22. Dependencies are correct
      23. Parallel tasks marked correctly
      24. File paths specified
      25. Checkpoints are reasonable

      ### Cross Validation (5 分)
      26. proposal → spec: All goals have corresponding requirements
      27. spec → tasks: All requirements have corresponding tasks
      28. tasks → spec: No tasks beyond spec scope
      29. clarify → all: All clarifications reflected
      30. No orphan ACs (via uds lint)

    output: "Score: X / {10|25}"
```

##### 2B-2. `cli/src/utils/standard-validator.js`

新增方法：

```javascript
/**
 * 計算 spec 品質評分
 * @param {Object} spec - 解析後的 spec 物件
 * @param {string} specMode - 'standard' | 'boost'
 * @returns {{ score: number, maxScore: number, items: Array<{id: number, description: string, passed: boolean}> }}
 */
computeSpecScore(spec, specMode = 'standard') {
  // standard mode: 檢查 10 個項目
  // boost mode: 檢查 25 個項目（含 standard 的 10 個）
  // 每個項目 1 分，基於 spec 內容的啟發式判斷：
  //   - "Background clear" → spec 有 Motivation section 且 > 20 字
  //   - "Goals measurable" → 有 checkbox 格式的 goals
  //   - "AC testable" → AC 使用 Given/When/Then 或 checkbox 格式
  //   - etc.
  // 回傳 score, maxScore, 各項明細
}
```

---

### 2C. Git-Diff Context Sync (`uds sync`)

#### 要新增的檔案

##### 2C-1. `cli/src/commands/sync.js`（新增檔案）

```javascript
/**
 * uds sync [options]
 * 匯出當前工作上下文到 .workflow-state/context.md
 * Zero AI tokens — 純 shell/JS 執行
 */
export async function syncCommand(options = {}) {
  // 1. 取得 git 資訊（不用 AI）：
  //    - current branch: git rev-parse --abbrev-ref HEAD
  //    - base branch: 偵測 main/master
  //    - recent commits: git log --oneline {base}..HEAD (最多 20 筆)
  //    - changed files: git diff --stat {base}..HEAD
  //
  // 2. 讀取 workflow state（如果存在）：
  //    - 掃描 .workflow-state/*.yaml（排除 *.log.yaml）
  //    - 取最近更新的 state file
  //    - 提取: current_phase, spec_id, next_steps, open_questions
  //
  // 3. 組合成 context.md：
  //    ```markdown
  //    # Development Context
  //    > Auto-generated by `uds sync` at {timestamp}
  //    > This file helps restore context in a new AI session.
  //
  //    ## Git Status
  //    - **Branch**: {branch}
  //    - **Base**: {base} (+{n} commits)
  //
  //    ### Recent Commits
  //    {git log output}
  //
  //    ### Changed Files
  //    {git diff --stat output}
  //
  //    ## Workflow State
  //    - **Spec**: {spec_id}
  //    - **Phase**: {current_phase}
  //    - **Status**: {status}
  //
  //    ### Next Steps
  //    {next_steps from workflow state}
  //
  //    ### Open Questions
  //    {open_questions from workflow state}
  //    ```
  //
  // 4. 寫入 .workflow-state/context.md
  //    - 上限 500 行（超過則截斷 diff stat）
  //
  // 5. 顯示摘要：
  //    ✅ Context saved to .workflow-state/context.md (230 lines)
  //    Tip: Paste this file content in a new session to restore context.
}
```

在 `uds.js` 中註冊：
```javascript
program
  .command('sync')
  .description('Export current work context for session resume (zero AI tokens)')
  .action(syncCommand);
```

##### 2C-2. `.standards/workflow-state-protocol.ai.yaml`

在 `rules:` array 新增：

```yaml
  - id: context-sync-on-session-end
    description: "Session 結束前可執行 uds sync 匯出上下文"
    when: "AI session 即將結束或使用者切換 session"
    action: |
      建議使用者執行 `uds sync` 將當前上下文匯出到 .workflow-state/context.md。
      新 session 開始時，AI 可讀取此檔案快速恢復工作狀態。
      此操作消耗 0 AI tokens（純 shell/JS 執行）。
    output_file: ".workflow-state/context.md"
    max_lines: 500
```

---

## Acceptance Criteria

### Phase 1

- [ ] AC-1: `uds check --spec-size` 掃描 specs/ 並對每個 spec 輸出 pass/warn/fail
- [ ] AC-2: 超過 300 行的 spec 顯示 warning，超過 400 行顯示 fail
- [ ] AC-3: enforce 模式下，400+ 行 spec 阻斷 implement gate（AI 指令層，非 CLI 強制）
- [ ] AC-4: `uds spec deps add SPEC-001 --on SPEC-002` 更新 spec 的 depends_on 欄位
- [ ] AC-5: `uds spec deps list` 顯示所有 specs 的依賴關係
- [ ] AC-6: `uds spec deps remove` 移除依賴
- [ ] AC-7: `uds spec create "feature" --boost` 產生完整 SDD 模板（含 Motivation, Design, Risks）
- [ ] AC-8: `uds spec create "feature"`（無 --boost）維持現有 micro-spec 模板行為
- [ ] AC-9: Boost mode spec 包含 `approach: conventional | exploratory` 欄位
- [ ] AC-10: 所有新欄位（depends_on, spec_mode, approach）為 optional，不破壞現有 spec 格式

### Phase 2

- [ ] AC-11: `uds lint` 掃描所有 specs，檢查 AC coverage + dependency validity + size
- [ ] AC-12: `uds lint --json` 輸出 JSON 格式結果
- [ ] AC-13: `uds lint --ci` 有 fail 項時 exit code 1
- [ ] AC-14: `computeSpecScore()` 對 standard mode 回傳 /10 分數
- [ ] AC-15: `computeSpecScore()` 對 boost mode 回傳 /25 分數
- [ ] AC-16: `uds sync` 產生 `.workflow-state/context.md` 且不超過 500 行
- [ ] AC-17: `uds sync` 在無 workflow state 時仍可執行（只輸出 git 資訊）
- [ ] AC-18: `.standards/` YAML 檔案的新增 sections 格式正確，可被 AI 工具解讀

---

## 測試計畫

### Unit Tests

| 測試目標 | 測試檔案 | 方式 |
|---------|---------|------|
| `validateSpecSize()` | `cli/src/utils/__tests__/standard-validator.test.js` | 各種行數的 mock spec |
| `checkACCoverage()` | `cli/src/utils/__tests__/spec-linter.test.js` | Mock specs + mock test files |
| `checkDependencies()` | `cli/src/utils/__tests__/spec-linter.test.js` | Valid + broken deps |
| `computeSpecScore()` | `cli/src/utils/__tests__/standard-validator.test.js` | Standard + boost mode |
| `addDependency/removeDependency` | `cli/src/vibe/__tests__/micro-spec.test.js` | Add/remove/duplicate |
| `toMarkdown()` standard/boost | `cli/src/vibe/__tests__/micro-spec.test.js` | Template output 驗證 |

### Integration Tests

```bash
# Phase 1 驗證
uds check --spec-size                    # 掃描 specs/，驗證大小報告
uds spec create "test feature"           # 驗證 standard mode 輸出
uds spec create "test feature" --boost   # 驗證 boost mode 輸出
uds spec deps add SPEC-001 --on SPEC-002 # 驗證依賴新增
uds spec deps list SPEC-001              # 驗證依賴列表

# Phase 2 驗證
uds lint                                 # 驗證 lint 報告
uds lint --json                          # 驗證 JSON 輸出
uds sync                                 # 驗證 context.md 產出
cat .workflow-state/context.md           # 確認內容正確
```

---

## 實作順序建議

```
Phase 1A (Size Control)
  → 1A-3 validateSpecSize() 方法
  → 1A-4 check.js --spec-size flag
  → 1A-1 spec-driven-development.ai.yaml size_control rule
  → 1A-2 workflow-enforcement.ai.yaml implement gate

Phase 1B (Dependency Tracking)
  → 1B-1 micro-spec.js depends_on 支援
  → 1B-2 spec-deps.js 新指令
  → 1B-3 spec-driven-development.ai.yaml dependency-tracking rule

Phase 1C (Dual Mode)
  → 1C-3 micro-spec.js boost template
  → 1C-2 spec.js --boost/--approach flags
  → 1C-1 workflow-state-protocol.ai.yaml spec_mode field

Phase 2A (Lint)
  → 2A-1 spec-linter.js 分析函式
  → 2A-2 lint.js CLI 指令
  → 2A-3 acceptance-criteria-traceability.ai.yaml lintable_fields

Phase 2B (Scoring)
  → 2B-2 computeSpecScore() 方法
  → 2B-1 spec-driven-development.ai.yaml scoring rule

Phase 2C (Context Sync)
  → 2C-1 sync.js CLI 指令
  → 2C-2 workflow-state-protocol.ai.yaml context-sync rule
```
