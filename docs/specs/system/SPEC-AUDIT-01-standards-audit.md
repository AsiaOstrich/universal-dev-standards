# [SPEC-AUDIT-01] Standards Audit & Gap Detection | 標準審計與缺口偵測

**Priority**: P1
**Status**: Draft
**Created**: 2026-03-04
**Last Updated**: 2026-03-04
**Feature ID**: SYS-AUDIT-001
**Dependencies**: None (leverages existing check scripts)

---

## Summary | 摘要

A unified audit system that automatically detects errors, standards gaps, and suggests new standards when valuable patterns emerge. Combines existing 15 check scripts into a single intelligent reporting pipeline with gap analysis capabilities.

統一審計系統，自動偵測錯誤、規範缺口，並在發現有價值的模式時建議建立新規範。將現有 15 個檢查腳本整合為單一智慧型報告管線，具備缺口分析能力。

---

## Motivation | 動機

### Problem Statement | 問題陳述

1. **Fragmented error reporting** — 15 check scripts run independently, each with different output formats. Developers must manually aggregate results and determine priority.
2. **No standards gap detection** — When a project grows, new patterns emerge (e.g., deployment, monitoring, API versioning) that existing standards don't cover. Currently no mechanism to detect these gaps.
3. **No actionable suggestions** — Even when gaps are found, there's no guided workflow to evaluate whether a new standard is warranted.

1. **錯誤報告分散** — 15 個檢查腳本各自獨立執行，輸出格式不一。開發者必須手動彙整結果並判斷優先順序。
2. **無規範缺口偵測** — 當專案成長，新的模式出現（如部署、監控、API 版本控制），現有規範未涵蓋。目前無機制偵測這些缺口。
3. **無可操作建議** — 即使發現缺口，也沒有引導式流程來評估是否需要建立新規範。

### Solution | 解決方案

A two-layer audit system:

- **Layer 1: Error Aggregator** — Runs all check scripts, normalizes output into a unified report with severity, category, and fix suggestions.
- **Layer 2: Gap Analyzer** — Scans project structure, commit history, and existing standards to identify uncovered areas, then evaluates whether a new standard would add value.

雙層審計系統：

- **第一層：錯誤彙整器** — 執行所有檢查腳本，將輸出標準化為統一報告，包含嚴重性、分類和修復建議。
- **第二層：缺口分析器** — 掃描專案結構、提交歷史和現有規範，識別未涵蓋的領域，並評估新規範是否具有建立價值。

---

## User Stories | 使用者故事

### US-1: Developer runs unified audit | 開發者執行統一審計

As a developer, I want to run a single command that checks all standards compliance, so that I get a prioritized list of issues instead of running 15 scripts manually.

身為開發者，我希望執行單一指令來檢查所有標準合規性，這樣我就能得到一份依優先順序排列的問題清單，而不用手動執行 15 個腳本。

### US-2: Maintainer detects standards gaps | 維護者偵測規範缺口

As a project maintainer, I want to know which areas of my project lack standards coverage, so that I can decide whether to create new standards proactively.

身為專案維護者，我希望知道專案中哪些領域缺乏規範覆蓋，這樣我就能主動決定是否建立新規範。

### US-3: AI assistant suggests new standards | AI 助手建議新規範

As a user of AI-assisted development, I want the system to suggest when a new standard would be valuable based on detected patterns, so that standards evolve organically with the project.

身為 AI 輔助開發的使用者，我希望系統根據偵測到的模式建議何時新規範具有價值，讓規範隨專案有機演進。

---

## Acceptance Criteria | 驗收條件

### AC-1: Unified error report | 統一錯誤報告

**Given** the project has existing check scripts,
**When** the user runs `uds audit`,
**Then** the system executes all applicable checks and produces a single report with:
- Severity levels: `ERROR`, `WARNING`, `INFO`
- Category grouping (sync, translation, standards, docs, tests)
- Fix suggestions for each issue
- Summary statistics (total, by severity, by category)

### AC-2: Machine-readable output | 機器可讀輸出

**Given** the user runs `uds audit --format json`,
**When** the audit completes,
**Then** the output is valid JSON with structured fields: `{ summary, issues[], gaps[], suggestions[] }`.

### AC-3: Standards gap detection | 規範缺口偵測

**Given** the project has source code and existing standards,
**When** the user runs `uds audit --gaps`,
**Then** the system identifies areas not covered by existing standards by:
- Scanning directory structure for common patterns (e.g., `deploy/`, `monitoring/`, `api/`)
- Checking if topics in commit messages lack corresponding standards
- Comparing against a known checklist of common standard categories

### AC-4: New standard suggestion with value assessment | 新規範建議含價值評估

**Given** a gap is detected,
**When** the gap meets the value threshold (frequency > 3 commits, or affects > 2 files),
**Then** the system suggests creating a new standard with:
- Suggested standard name and scope
- Evidence (files, commits, patterns that triggered the suggestion)
- Value assessment: `HIGH` / `MEDIUM` / `LOW`
- Quick action: `uds audit --create-standard <name>` to scaffold

### AC-5: Incremental mode | 增量模式

**Given** the user wants a quick check,
**When** the user runs `uds audit --changed`,
**Then** only files changed since the last commit are checked (faster feedback loop).

### AC-6: Skill integration | 技能整合

**Given** the audit is complete,
**When** the user is in an AI assistant session,
**Then** `/audit` slash command provides the same functionality with natural language summary and interactive next-step suggestions.

---

## Technical Design | 技術設計

### Component Architecture | 元件架構

```
┌─────────────────────────────────────────────────┐
│                  uds audit                       │
│              (CLI Entry Point)                   │
├──────────────────┬──────────────────────────────┤
│  Layer 1         │  Layer 2                      │
│  Error           │  Gap                          │
│  Aggregator      │  Analyzer                     │
│                  │                               │
│  ┌────────────┐  │  ┌─────────────────────────┐  │
│  │ Script     │  │  │ Directory Scanner       │  │
│  │ Runner     │  │  │ (pattern matching)      │  │
│  ├────────────┤  │  ├─────────────────────────┤  │
│  │ Output     │  │  │ Commit Analyzer         │  │
│  │ Normalizer │  │  │ (topic extraction)      │  │
│  ├────────────┤  │  ├─────────────────────────┤  │
│  │ Report     │  │  │ Standards Coverage Map  │  │
│  │ Generator  │  │  │ (checklist comparison)  │  │
│  └────────────┘  │  ├─────────────────────────┤  │
│                  │  │ Value Assessor          │  │
│                  │  │ (frequency + impact)    │  │
│                  │  └─────────────────────────┘  │
├──────────────────┴──────────────────────────────┤
│              Unified Report                      │
│  (terminal / JSON / markdown)                    │
└─────────────────────────────────────────────────┘
```

### File Structure | 檔案結構

```
cli/src/
├── commands/
│   └── audit.js              # CLI command entry point
├── utils/
│   ├── audit-runner.js       # Script runner & output normalizer
│   ├── gap-analyzer.js       # Standards gap detection engine
│   └── value-assessor.js     # New standard value evaluation
skills/
└── audit-assistant/
    └── SKILL.md              # /audit slash command
scripts/
└── check-*.sh                # (existing, unchanged)
```

### CLI Interface | CLI 介面

```bash
# Full audit (all checks + gap analysis)
uds audit

# Errors only (run check scripts, skip gap analysis)
uds audit --checks-only

# Gaps only (skip check scripts)
uds audit --gaps

# JSON output for CI/CD
uds audit --format json

# Only check changed files
uds audit --changed

# Scaffold a suggested new standard
uds audit --create-standard deployment
```

### Output Format | 輸出格式

#### Terminal Output

```
══════════════════════════════════════
  UDS Standards Audit Report
  標準審計報告
══════════════════════════════════════

📊 Summary
  Checks:  15 passed, 2 failed, 1 warning
  Gaps:    3 detected (1 HIGH, 2 MEDIUM)

❌ ERRORS (2)
  [sync] Translation missing: skills/new-feature/SKILL.md → zh-TW
         Fix: Add zh-TW translation file
  [test] Test coverage decreased: src/commands/config.js (78% → 72%)
         Fix: Add tests for new config options

⚠️ WARNINGS (1)
  [docs] CHANGELOG not updated for 5 commits
         Fix: Run /changelog to update

🔍 GAPS DETECTED (3)
  [HIGH]   deployment — No deployment standard found
           Evidence: deploy/ directory, 8 deploy-related commits
           → Run: uds audit --create-standard deployment

  [MEDIUM] monitoring — No monitoring/observability standard
           Evidence: monitoring.config.js, 3 related commits
           → Run: uds audit --create-standard monitoring

  [MEDIUM] api-versioning — No API versioning standard
           Evidence: /api/v1/, /api/v2/ routes detected
           → Run: uds audit --create-standard api-versioning
```

#### JSON Output

```json
{
  "timestamp": "2026-03-04T10:00:00Z",
  "summary": {
    "checks": { "passed": 15, "failed": 2, "warnings": 1 },
    "gaps": { "total": 3, "high": 1, "medium": 2, "low": 0 }
  },
  "issues": [
    {
      "severity": "ERROR",
      "category": "sync",
      "message": "Translation missing: skills/new-feature/SKILL.md → zh-TW",
      "fix": "Add zh-TW translation file",
      "source": "check-translation-sync.sh"
    }
  ],
  "gaps": [
    {
      "name": "deployment",
      "value": "HIGH",
      "evidence": ["deploy/ directory", "8 deploy-related commits"],
      "suggestion": "Create deployment-standards.ai.yaml"
    }
  ]
}
```

### Known Standard Categories Checklist | 已知標準類別清單

For gap detection, compare against these common categories:

| Category | Standard Exists | Detection Signal |
|----------|:--------------:|------------------|
| Commit messages | ✅ | — |
| Testing | ✅ | — |
| Code review | ✅ | — |
| Security | ✅ | — |
| Performance | ✅ | — |
| Accessibility | ✅ | — |
| Deployment | ❌ | `deploy/`, `Dockerfile`, CI/CD configs |
| Monitoring | ❌ | `monitoring/`, logging configs |
| API versioning | ❌ | `/api/v*/` routes, version headers |
| Database migration | ❌ | `migrations/`, schema files |
| Feature flags | ❌ | Feature flag configs, `flags/` |
| Incident response | ❌ | Runbooks, on-call configs |

---

## Risks | 風險

| Risk | Impact | Mitigation |
|------|--------|-----------|
| False positive gaps | LOW | Use frequency threshold (>3 signals) before suggesting |
| Slow execution | MEDIUM | Support `--changed` incremental mode; parallelize script execution |
| Noisy output | MEDIUM | Default to summary view; `--verbose` for details |

---

## Out of Scope | 範圍外

- Auto-fixing detected errors (separate feature)
- AI-powered code analysis for standard violations
- Real-time file watching / daemon mode
- Integration with external CI/CD platforms (can consume JSON output)

---

## Implementation Phases | 實作階段

| Phase | Scope | Deliverables |
|-------|-------|-------------|
| **Phase 1** | Error Aggregator | `uds audit` with unified report from existing scripts |
| **Phase 2** | Gap Analyzer | `--gaps` flag with directory/commit scanning |
| **Phase 3** | Value Assessor + Scaffold | `--create-standard` with template generation |
| **Phase 4** | Skill Integration | `/audit` slash command with AI-native UX |

---

## Sync Checklist | 同步清單

- [ ] `cli/src/commands/audit.js` — CLI command implementation
- [ ] `cli/src/utils/audit-runner.js` — Script runner
- [ ] `cli/src/utils/gap-analyzer.js` — Gap detection engine
- [ ] `skills/audit-assistant/SKILL.md` — Skill definition (EN)
- [ ] `locales/zh-TW/skills/audit-assistant/SKILL.md` — zh-TW translation
- [ ] `locales/zh-CN/skills/audit-assistant/SKILL.md` — zh-CN translation
- [ ] `cli/tests/commands/audit.test.js` — Unit tests
- [ ] `cli/src/messages/messages.en.js` — i18n messages
- [ ] `cli/src/messages/messages.zh-TW.js` — i18n messages
- [ ] `docs/specs/README.md` — Update spec index

---

## References | 參考資料

- Existing check infrastructure: `scripts/check-*.sh` (15 scripts)
- Standard validator: `cli/src/utils/standard-validator.js`
- Check command: `cli/src/commands/check.js`
- Pre-release check: `scripts/pre-release-check.sh`

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-03-04 | Initial draft — dual-layer audit architecture |
