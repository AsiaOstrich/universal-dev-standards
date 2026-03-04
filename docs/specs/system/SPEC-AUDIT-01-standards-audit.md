# [SPEC-AUDIT-01] UDS Health & Feedback System | UDS 健康檢查與回饋系統

**Priority**: P1
**Status**: Draft
**Created**: 2026-03-04
**Last Updated**: 2026-03-05
**Feature ID**: SYS-AUDIT-001
**Scope**: universal
**Dependencies**: None (`gh` CLI optional, enhances feedback submission)

---

## Summary | 摘要

A user-facing diagnostic and feedback system that helps UDS users (1) detect UDS installation/configuration errors in their projects, (2) identify development patterns worth standardizing, and (3) detect UDS standards that are impractical or violate conventions — then automatically submit structured feedback to the UDS GitHub repository as issues.

面向使用者的診斷與回饋系統，幫助 UDS 使用者：(1) 偵測專案中 UDS 安裝/設定錯誤，(2) 識別值得規範化的開發模式，(3) 偵測 UDS 規範本身不合實用或違反慣例的情況 — 然後自動將結構化回饋提交至 UDS GitHub 儲存庫作為 issue。

---

## Motivation | 動機

### Problem Statement | 問題陳述

1. **Silent UDS failures** — After `uds init`, files may be missing, AI config references may be broken, or `.standards/` may be incomplete. Users have no way to diagnose these issues.
2. **No feedback loop** — UDS has no mechanism to learn from real-world usage. Users encounter impractical standards or discover useful patterns, but have no easy way to report back.
3. **Standards drift from practice** — Some UDS standards may not align with real-world conventions. Without user feedback, these issues persist across versions.

1. **UDS 靜默失敗** — 執行 `uds init` 後，檔案可能遺失、AI 設定參考可能損壞、`.standards/` 可能不完整。使用者無法診斷這些問題。
2. **無回饋循環** — UDS 沒有機制從實際使用中學習。使用者遇到不實用的規範或發現有用的模式，卻沒有簡易的回報方式。
3. **規範偏離實務** — 某些 UDS 規範可能與真實開發慣例不一致。缺乏使用者回饋，這些問題會持續存在。

### Solution | 解決方案

A three-layer system:

三層系統：

- **Layer 1: Health Check** — Validate UDS installation integrity in user's project (files, configs, references).
- **Layer 2: Pattern Analyzer** — Scan user's project for development patterns that could become new standards, or detect existing standards that cause friction.
- **Layer 3: Feedback Reporter** — Collect findings and submit structured GitHub issues to the UDS repository with user confirmation.

- **第一層：健康檢查** — 驗證使用者專案中 UDS 安裝的完整性（檔案、設定、參考）。
- **第二層：模式分析器** — 掃描使用者專案，找出可成為新規範的開發模式，或偵測現有規範的摩擦點。
- **第三層：回饋回報器** — 收集發現並在使用者確認後，提交結構化的 GitHub issue 至 UDS 儲存庫。

---

## User Stories | 使用者故事

### US-1: Developer diagnoses UDS errors | 開發者診斷 UDS 錯誤

As a developer using UDS, I want to check if my UDS installation is healthy, so that I can fix broken configs or missing files before they cause problems.

身為 UDS 使用者，我希望檢查 UDS 安裝是否健康，以便在問題發生前修復損壞的設定或遺失的檔案。

### US-2: Developer discovers standardization opportunities | 開發者發現規範化機會

As a developer, I want the system to detect recurring patterns in my project that aren't covered by existing standards, so that I can request new standards from the UDS project.

身為開發者，我希望系統偵測專案中尚未被現有規範覆蓋的重複模式，以便我向 UDS 專案請求新規範。

### US-3: Developer reports impractical standards | 開發者回報不實用的規範

As a developer, I want to report when a UDS standard is impractical or conflicts with my project's conventions, so that UDS can evolve based on real usage.

身為開發者，我希望在 UDS 規範不實用或與專案慣例衝突時回報，讓 UDS 能根據實際使用經驗演進。

### US-4: UDS maintainer receives structured feedback | UDS 維護者收到結構化回饋

As a UDS maintainer, I want to receive structured, machine-actionable issue reports from users, so that I can prioritize improvements based on real data.

身為 UDS 維護者，我希望收到結構化、可操作的 issue 報告，以便根據真實數據排列改進優先順序。

---

## Acceptance Criteria | 驗收條件

### AC-1: UDS health check | UDS 健康檢查

**Given** a project with UDS installed (`uds init` was run),
**When** the user runs `uds audit`,
**Then** the system checks:
- `.standards/` directory exists and all expected files are present
- `manifest.json` is valid and matches installed files
- AI config files (`CLAUDE.md`, `.cursorrules`, etc.) exist and reference `.standards/` correctly
- No orphaned or corrupted standard files

And produces a report with severity levels: `ERROR`, `WARNING`, `INFO`.

**Edge case: UDS not installed | 未安裝 UDS 的情況**:

**Given** a project where `uds init` was never run (no `.standards/` directory),
**When** the user runs `uds audit`,
**Then** the system outputs:
- `ERROR`: UDS not initialized in this project
- Suggestion: Run `uds init` to install standards
- Layer 2 (patterns) still runs if `--patterns` is specified (does not require `.standards/`)
- Layer 3 (report) is skipped

未安裝 UDS 時，健康檢查報告 ERROR 並建議執行 `uds init`。模式偵測仍可獨立執行（不依賴 `.standards/`）。

### AC-2: Pattern detection | 模式偵測

**Given** a project with source code and commit history,
**When** the user runs `uds audit --patterns`,
**Then** the system identifies potential standardization opportunities by:
- Scanning directory structure for common patterns not covered by installed standards (e.g., `deploy/`, `monitoring/`, `api/v*/`)
- Analyzing recent commit messages (last 100) for recurring topics without corresponding standards
- Comparing project tech stack against known standard categories

Each pattern includes: name, evidence (files/commits), and suggested standard.

**Commit topic extraction strategy | Commit 主題提取策略**:

1. Run `git log --oneline -100` to get recent commits
2. Extract scope from conventional commits: `feat(deploy):` → topic `deploy`
3. Match subject keywords against the Known Standard Categories keyword list (e.g., `docker`, `migrate`, `monitor`, `pipeline`)
4. A topic is considered "recurring" when it appears in **3 or more commits** AND matches **2 or more files** in the project directory

提取 conventional commit 的 scope 欄位作為主題，並比對 subject 中的關鍵字與已知標準類別清單。主題出現在 3 個以上 commit 且對應 2 個以上檔案時，視為「重複模式」。

### AC-3: Friction detection (diff-based) | 摩擦偵測（差異比對式）

**Given** a project using UDS standards,
**When** the user runs `uds audit --friction`,
**Then** the system detects potential standard issues by:
- **Diff-based detection**: Comparing user's `.standards/` files against UDS official versions using `manifest.json` `fileHashes`. Files that were deliberately modified by the user are the strongest friction evidence.
- **Unused standard detection**: Checking for `.standards/` files that are never referenced in any AI config file (`CLAUDE.md`, `.cursorrules`, etc.)
- **Orphan detection**: Finding standards in `.standards/` that are not tracked in `manifest.json`

Each friction point includes: standard name, modification type, diff summary (for modified files), and evidence.

**Friction types | 摩擦類型**:

| Type | Severity | Description | 說明 |
|------|----------|-------------|------|
| `modified` | HIGH | File hash differs from official version | 檔案雜湊與官方版本不同 |
| `unused` | LOW | Standard file exists but never referenced in AI config | 標準存在但未被 AI 設定引用 |
| `orphaned` | MEDIUM | File in `.standards/` not tracked in `manifest.json` | `.standards/` 中的檔案未被 manifest 追蹤 |

**差異比對式偵測**：比對使用者的 `.standards/` 檔案與 UDS 官方版本（透過 `manifest.json` 的 `fileHashes`）。使用者刻意修改的檔案是最強的摩擦證據。
**未使用偵測**：檢查 `.standards/` 中從未被任何 AI 設定檔引用的標準。
**孤立偵測**：找出 `.standards/` 中未被 `manifest.json` 追蹤的標準。

### AC-4: Interactive feedback submission | 互動式回饋提交

**Given** the audit report is generated,
**When** the user runs `uds audit --report`,
**Then** the system:
1. Displays the full audit report for user review
2. Asks the user to confirm which findings to submit
3. Allows the user to add free-text comments
4. Submits via fallback chain (see below)
5. The issue follows a structured template with labels (`audit-health`, `audit-pattern`, `audit-friction`)

**Submission Fallback Chain | 提交退回鏈**:

| Priority | Method | Condition | 條件 |
|----------|--------|-----------|------|
| 1st | `gh issue create` | `gh` CLI installed and authenticated | `gh` CLI 已安裝且已認證 |
| 2nd | Browser deeplink | Generate pre-filled `https://github.com/.../issues/new?title=...&body=...&labels=...` URL and open in browser | 產生預填 URL 並開啟瀏覽器 |
| 3rd | Copy to clipboard | Copy formatted Markdown to clipboard with manual URL | 複製格式化 Markdown 至剪貼簿 |

The deeplink approach requires no dependencies and gives users full control to review/edit in browser before submitting.

deeplink 方式不需要額外依賴，且讓使用者在提交前於瀏覽器中完整控制內容。

**URL Length Handling | URL 長度處理**:

Browser deeplink URLs have practical limits (~2000-8000 chars depending on browser). When the report exceeds the safe limit (2000 chars for the `body` parameter):
1. Truncate the body to a summary (health status + counts only)
2. Append note: "Full report copied to clipboard. Please paste it into the issue body."
3. Automatically copy the full Markdown report to clipboard

瀏覽器 deeplink URL 有實際長度限制。當報告超出安全限制（`body` 參數 2000 字元）時：
1. 截斷 body 為摘要（僅健康狀態 + 統計數字）
2. 附加提示：「完整報告已複製至剪貼簿，請貼入 issue 內文。」
3. 自動將完整 Markdown 報告複製至剪貼簿

**Privacy**: Only UDS-related metadata is included. No source code, secrets, or project-specific content is sent.

### AC-5: Machine-readable output | 機器可讀輸出

**Given** the user runs `uds audit --format json`,
**When** the audit completes,
**Then** the output is valid JSON:

```json
{
  "timestamp": "2026-03-05T10:00:00Z",
  "udsVersion": "5.0.0-rc.3",
  "health": {
    "status": "WARNING",
    "issues": []
  },
  "patterns": [],
  "frictions": [],
  "reportUrl": "https://github.com/AsiaOstrich/universal-dev-standards/issues/new?title=...&body=..."
}
```

### AC-6: Skill integration | 技能整合

**Given** the user is in an AI assistant session,
**When** the user runs `/audit`,
**Then** the AI assistant performs the same analysis with natural language summary and guides the user through feedback submission.

---

## Technical Design | 技術設計

### Relationship with existing commands | 與現有指令的關係

| Command | Purpose | Scope | 用途 |
|---------|---------|-------|------|
| `uds check` | Validate installed standards integrity | Local project | 驗證已安裝標準完整性 |
| `uds audit` | Diagnose UDS health + collect feedback | Local → GitHub | 診斷 UDS 健康 + 收集回饋 |
| `pre-release-check.sh` | UDS internal release checks | UDS repo only | UDS 內部發布檢查 |

`uds audit` is user-facing and universal. `pre-release-check.sh` remains UDS-internal.

**`uds audit` reuses `uds check` internals | `uds audit` 重用 `uds check` 內部模組**:

Layer 1 Health Check does NOT re-implement validation. Instead, it imports and wraps the existing `StandardValidator` class from `cli/src/utils/standard-validator.js` (used by `uds check`), then extends it with:
- AI config reference checking (not in `uds check`)
- Severity classification and structured report output (not in `uds check`)
- Integration with Layer 2 and Layer 3 pipeline

第一層健康檢查不重新實作驗證邏輯，而是匯入並包裝 `uds check` 使用的 `StandardValidator` 類別，再擴充：
- AI 設定檔參考檢查（`uds check` 無此功能）
- 嚴重性分類與結構化報告輸出（`uds check` 無此功能）
- 與第二層、第三層管線的整合

```
uds check ──► StandardValidator (file hashes, YAML validity)
                    │
uds audit ──► health-checker.js ──► reuses StandardValidator
              + AI config reference check
              + severity classification
              + pipes to Layer 2 & 3
```

### Component Architecture | 元件架構

```
┌──────────────────────────────────────────────────────┐
│                    uds audit                          │
│                (CLI Entry Point)                      │
├────────────┬────────────────┬────────────────────────┤
│  Layer 1   │  Layer 2       │  Layer 3               │
│  Health    │  Pattern &     │  Feedback              │
│  Check     │  Friction      │  Reporter              │
│            │  Analyzer      │                        │
│ ┌────────┐ │ ┌────────────┐ │ ┌────────────────────┐ │
│ │Manifest│ │ │ Directory  │ │ │ Report Formatter   │ │
│ │Checker │ │ │ Scanner    │ │ │ (terminal/JSON)    │ │
│ ├────────┤ │ ├────────────┤ │ ├────────────────────┤ │
│ │Config  │ │ │ Commit     │ │ │ User Confirmation  │ │
│ │Checker │ │ │ Analyzer   │ │ │ (interactive)      │ │
│ ├────────┤ │ ├────────────┤ │ ├────────────────────┤ │
│ │File    │ │ │ Friction   │ │ │ Issue Submitter    │ │
│ │Checker │ │ │ Detector   │ │ │ (gh/deeplink/copy) │ │
│ └────────┘ │ └────────────┘ │ └────────────────────┘ │
├────────────┴────────────────┴────────────────────────┤
│              Unified Audit Report                     │
│          (terminal / JSON / GitHub issue)             │
└──────────────────────────────────────────────────────┘
```

### File Structure | 檔案結構

```
cli/src/
├── commands/
│   └── audit.js                # CLI command entry point
├── utils/
│   ├── health-checker.js       # Layer 1: UDS installation diagnostics
│   ├── pattern-analyzer.js     # Layer 2a: Development pattern detection
│   ├── friction-detector.js    # Layer 2b: Standard friction analysis
│   └── feedback-reporter.js    # Layer 3: GitHub issue submission
skills/
└── audit-assistant/
    └── SKILL.md                # /audit slash command
```

### CLI Interface | CLI 介面

```bash
# Full audit (health + patterns + friction)
uds audit

# Health check only (Layer 1)
uds audit --health

# Pattern detection only (Layer 2a)
uds audit --patterns

# Friction detection only (Layer 2b)
uds audit --friction

# JSON output
uds audit --format json

# Submit feedback to GitHub (interactive, uses fallback chain)
uds audit --report

# Preview issue content without submitting
uds audit --report --dry-run

# Force use gh CLI for submission (skip deeplink)
uds audit --report --gh

# Summary only (for scripts/CI)
uds audit --quiet
```

### Output Format | 輸出格式

#### Terminal Output

```
══════════════════════════════════════
  UDS Audit Report
  UDS 審計報告
══════════════════════════════════════

🏥 Health Check
  ✅ .standards/ directory: 40 files, all intact
  ✅ manifest.json: valid
  ⚠️  CLAUDE.md: references 2 standards not in .standards/
       → ai-agreement-standards.ai.yaml (file exists but not in manifest)
       Fix: Run `uds init` to re-sync

🔍 Patterns Detected (2)
  [HIGH]   monitoring — Recurring pattern without standard
           Evidence: monitoring.config.js, logging/, 5 related commits
           Suggested: New "monitoring" standard

  [MEDIUM] api-versioning — API version patterns detected
           Evidence: /api/v1/, /api/v2/ routes
           Suggested: New "api-versioning" standard

⚡ Friction Points (2)
  [HIGH]   testing.ai.yaml — User modified (diff detected)
           Changes: naming_convention: "should_X_when_Y" → "test_X_given_Y"
           Action: This modification may indicate the standard needs more flexibility

  [LOW]    virtual-organization-standards.ai.yaml — Unused
           Not referenced in any AI config file
           Action: Consider removing with `uds uninstall --standard virtual-organization`

📮 Submit feedback? Run: uds audit --report
```

#### JSON Output

```json
{
  "timestamp": "2026-03-05T10:00:00Z",
  "udsVersion": "5.0.0-rc.3",
  "nodeVersion": "v20.11.0",
  "health": {
    "status": "WARNING",
    "issues": [
      {
        "severity": "WARNING",
        "component": "CLAUDE.md",
        "message": "References 2 standards not in .standards/",
        "fix": "Run `uds init` to re-sync"
      }
    ]
  },
  "patterns": [
    {
      "name": "monitoring",
      "value": "HIGH",
      "evidence": ["monitoring.config.js", "logging/", "5 related commits"],
      "suggestion": "New monitoring standard"
    }
  ],
  "frictions": [
    {
      "standard": "testing.ai.yaml",
      "type": "modified",
      "severity": "HIGH",
      "diff": "naming_convention: should_X_when_Y → test_X_given_Y",
      "suggestion": "Standard may need more flexible naming convention support"
    },
    {
      "standard": "virtual-organization-standards.ai.yaml",
      "type": "unused",
      "severity": "LOW",
      "diff": null,
      "suggestion": "Not referenced in any AI config file"
    }
  ]
}
```

#### GitHub Issue Template | GitHub Issue 模板

When `uds audit --report` is confirmed by user:

```markdown
## UDS Audit Feedback | UDS 審計回饋

**UDS Version**: 5.0.0-rc.3
**Node Version**: v20.11.0
**OS**: darwin arm64

### Health Issues (1)
- ⚠️ CLAUDE.md references 2 standards not in .standards/

### Pattern Suggestions (2)
- **[HIGH] monitoring** — Evidence: monitoring.config.js, logging/, 5 commits
- **[MEDIUM] api-versioning** — Evidence: /api/v1/, /api/v2/ routes

### Friction Reports (2)
- **testing.ai.yaml** — User modified: `naming_convention` changed from `should_X_when_Y` to `test_X_given_Y`
- **virtual-organization-standards.ai.yaml** — Unused: not referenced in any AI config

### User Comments
> (User's free-text comments here)
```

### Privacy & Security | 隱私與安全

| Data | Included | Not Included |
|------|----------|-------------|
| **UDS metadata** | ✅ Version, installed standards list, health status | |
| **Pattern names** | ✅ Directory names, commit topic keywords | |
| **Source code** | | ❌ Never sent |
| **File contents** | | ❌ Never sent |
| **Environment secrets** | | ❌ Never sent |
| **Project name** | | ❌ Not sent unless user adds it |

All submissions require explicit user confirmation via interactive prompt.

所有提交都需要使用者透過互動式提示明確確認。

### Known Standard Categories | 已知標準類別

For pattern detection, compare user's project against:

| Category | UDS Standard Exists | Detection Signal |
|----------|:------------------:|------------------|
| Commit messages | ✅ | — |
| Testing | ✅ | — |
| Code review | ✅ | — |
| Security | ✅ | — |
| Performance | ✅ | — |
| Accessibility | ✅ | — |
| Deployment | ✅ | — |
| Monitoring | ❌ | `monitoring/`, logging configs, APM setup |
| API versioning | ❌ | `/api/v*/` routes, version headers |
| Database migration | ❌ | `migrations/`, schema files |
| Feature flags | ❌ | Feature flag configs, `flags/`, LaunchDarkly |
| Incident response | ❌ | Runbooks, on-call configs, PagerDuty |
| Containerization | ❌ | `Dockerfile`, `docker-compose.yml`, `k8s/` |
| CI/CD pipeline | ❌ | `.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile` |

---

## Risks | 風險

| Risk | Impact | Mitigation |
|------|--------|-----------|
| False positive patterns | LOW | Require frequency threshold (>3 signals) before suggesting |
| Privacy concerns | HIGH | Never send source code; require explicit user confirmation; show full report before submission |
| GitHub API rate limits | LOW | Batch reports; local cache; `--dry-run` option |
| `gh` CLI not installed | LOW | Fallback chain: deeplink URL → clipboard copy. `gh` is optional enhancement |
| Deeplink URL too long | MEDIUM | Auto-truncate body to summary; copy full report to clipboard with note |
| Spam issues | MEDIUM | Rate limit: max 1 report per project per day; structured templates for easy triage |

---

## Out of Scope | 範圍外

- Auto-fixing detected health issues (separate feature, could be `uds repair`)
- AI-powered code analysis for standard violations
- Real-time file watching / daemon mode
- UDS internal checks (remain in `pre-release-check.sh`)
- Telemetry / automatic data collection (all submissions are user-initiated)

---

## Implementation Phases | 實作階段

| Phase | Scope | Deliverables |
|-------|-------|-------------|
| **Phase 1** | Health Check | `uds audit` with installation diagnostics |
| **Phase 2** | Pattern Analyzer | `--patterns` flag with directory/commit scanning |
| **Phase 3** | Friction Detector | `--friction` flag with convention mismatch detection |
| **Phase 4** | Feedback Reporter | `--report` with GitHub issue creation |
| **Phase 5** | Skill Integration | `/audit` slash command with AI-native UX |

---

## Sync Checklist | 同步清單

- [ ] `cli/src/commands/audit.js` — CLI command entry point
- [ ] `cli/src/utils/health-checker.js` — Installation diagnostics
- [ ] `cli/src/utils/pattern-analyzer.js` — Pattern detection engine
- [ ] `cli/src/utils/friction-detector.js` — Friction analysis
- [ ] `cli/src/utils/feedback-reporter.js` — GitHub issue submission
- [ ] `skills/audit-assistant/SKILL.md` — Skill definition (EN)
- [ ] `locales/zh-TW/skills/audit-assistant/SKILL.md` — zh-TW translation
- [ ] `locales/zh-CN/skills/audit-assistant/SKILL.md` — zh-CN translation
- [ ] `cli/tests/commands/audit.test.js` — Unit tests
- [ ] `cli/src/messages/messages.en.js` — i18n messages
- [ ] `cli/src/messages/messages.zh-TW.js` — i18n messages
- [ ] `cli/src/messages/messages.zh-CN.js` — i18n messages
- [x] `docs/specs/README.md` — Update spec index

---

## References | 參考資料

- Check command: `cli/src/commands/check.js`
- Standard validator: `cli/src/utils/standard-validator.js`
- Manifest schema: `.standards/manifest.json`
- GitHub CLI (optional): `gh issue create`
- GitHub Issue Deeplink: `https://github.com/{owner}/{repo}/issues/new?title=...&body=...&labels=...`

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-03-05 | Review fixes — clarified uds check reuse (StandardValidator), deeplink URL length handling, friction type definitions, commit analysis strategy, UDS-not-installed edge case, added --quiet flag and reportUrl JSON field |
| 1.1.0 | 2026-03-05 | Brainstorm integration — gh CLI now optional (deeplink fallback chain), friction detection changed to diff-based approach, added --gh/--dry-run flags |
| 1.0.0 | 2026-03-05 | Major rewrite — pivoted from UDS-internal audit to user-facing health & feedback system. New three-layer architecture (Health Check + Pattern/Friction Analyzer + Feedback Reporter). Added privacy design, GitHub issue integration, friction detection. |
| 0.2.0 | 2026-03-05 | Review fixes — corrected script count, fixed categories, added JSON suggestions field |
| 0.1.0 | 2026-03-04 | Initial draft — dual-layer audit architecture (UDS-internal, superseded) |
