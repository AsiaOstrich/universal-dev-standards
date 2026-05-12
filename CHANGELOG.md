# Changelog

> **Language**: English | [繁體中文](locales/zh-TW/CHANGELOG.md) | [简体中文](locales/zh-CN/CHANGELOG.md)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [5.8.0] - 2026-05-12

### Added
- **`feature-manifest-standard`** (`ai/standards/feature-manifest-standard.ai.yaml`, `core/feature-manifest-standard.md`): New standard defining the FM-NNN machine-readable feature inventory format for migration/refactoring projects. Includes confidence scoring, migration risk labels (PHP→C#), FEATURE_STUB: marker protocol, and Gate 1 completeness gate. (XSPEC-200)
- **`behavior-snapshot`** (`ai/standards/behavior-snapshot.ai.yaml`, `core/behavior-snapshot.md`): New standard defining HTTP golden-file snapshot format for migration parity verification and refactoring characterization tests. Includes snapshot schema, `ignore_fields` guidance, parity gate (exit codes 0/1/2), and Gate 0 characterization test protocol. (XSPEC-201)

### Changed
- **`acceptance-criteria-traceability`**: Added 4th AC status `not_implemented` (🚫) — distinct from `uncovered` (code exists but no test) and `not_implemented` (code does not exist). Updated coverage formula to exclude `not_implemented` from denominator. Added CI gate rule: `not_implemented_count > 0` → blocking (independent of coverage % gate). Added decision tree for status classification. (XSPEC-199)

## [5.7.3] - 2026-05-08

### Fixed
- **`uds update` stale-ID skip** (`cli/src/commands/update.js`): Four loops (display, copy, hash recomputation, post-update integrity check) now skip unrecognized short IDs in `manifest.standards` (entries that contain neither `/` nor `.` but have no matching registry entry, e.g. stale AI tool names `claude-code`, `opencode`). Previously these caused spurious "missing file" warnings and failed restore attempts during `uds update`.

## [5.7.2] - 2026-05-08

### Fixed
- **Manifest schema v3.4.0 — `standards` path→ID migration** (`cli/src/core/manifest.js`): Added `migrateToV340()` migration step and `migrateStandardsPathsToIds()` helper. Manifests whose `standards` array contains legacy path-format entries (e.g. `"ai/standards/foo.ai.yaml"`) are now automatically converted to short registry IDs (e.g. `"foo"`) when loaded. Option file paths (`ai/options/…`) are preserved as-is. An `ensureRequiredFields()` safety net runs even when the schema version already matches, guarding against partially-written manifests. (`cli/src/core/manifest.js`, `cli/src/reconciler/desired-state-calculator.js`)
- **`uds check` legacy existence check** (`cli/src/commands/check.js`): The no-hash fallback path now resolves registry-ID-format standards to their actual source filenames (e.g. `"testing"` → `"testing.ai.yaml"`), and correctly routes option file paths into `.standards/options/`. Previously, ID-format standards resulted in path-less lookups that always reported "missing".
- **`uds update` ID-format support** (`cli/src/commands/update.js`): Five code paths (`checkNewStandards`, file list display, file copy loop, hash recomputation, post-update integrity scan) now resolve ID-format standards to source paths via the registry, so projects whose manifests have been migrated to v3.4.0 continue to receive correct file operations.
- **`uds audit` health/friction checks** (`cli/src/utils/health-checker.js`, `cli/src/utils/friction-detector.js`): Both utilities now resolve ID-format standards to actual filenames before checking disk/CLAUDE.md references, preventing false-OK results on migrated manifests.

## [5.7.1] - 2026-05-08

### Fixed
- **`cli/package-lock.json`**: Sync lock file to fix `npm ci` failure on GitHub Actions (`@emnapi/core` and `@emnapi/runtime` entries were missing).

### Removed
- **`specs/`**: Removed 4 spec files already migrated to dev-platform as XSPECs (SPEC-frontend-design-standard, SPEC-mcp-design-standards-server, superspec-borrowing-phase1-2-spec, superspec-phase4-spec). Retained `execution-history-spec.md` (Archived), `schemas/`, and `standards-effectiveness-schema.json`.
- **`docs/archive/`**: Removed 7 outdated migration guides and workflow analysis documents.
- **`.project-context/`**: Removed gemini-cli auto-generated artifact (content covered by `CLAUDE.md`).

### Added
- **`.npmignore`**: Exclude `tests/`, `scripts/`, `.github/`, `.githooks/`, `.gemini/`, `.release-readiness/`, `docs/internal/` from the npm package. These were previously published unintentionally (no `files` field or `.npmignore` existed).

**Adopter note**: If you previously relied on any files from `tests/` or `scripts/` installed from npm, install them from the GitHub repo directly.

## [5.7.0] - 2026-05-08

> **Cross-platform script migration** (XSPEC-179 + XSPEC-180): Bash scripts are
> being progressively replaced by single-source TypeScript / Node.js ESM
> equivalents that run unchanged on macOS / Linux / Windows. Legacy `.sh` files
> remain with `DEPRECATED` notices for backward compatibility.

### Removed

- **Ecosystem section in README** (`README.md`, `locales/zh-TW/README.md`,
  `locales/zh-CN/README.md`): Removed `## 🌐 Ecosystem` / `## 🌐 生態系統` /
  `## 🌐 生态系统` section entirely. UDS is a standalone tool-agnostic standards
  library; the section's heading suggested an "ecosystem of products" that no
  longer applies after downstream-project decoupling (Batch 1–6, 2026-05-04).
  Tool compatibility list (Claude Code / Cursor / etc.) is preserved earlier in
  the README.

### Added

- **Skill tiering & budget tuning** (XSPEC-185 / DEC-061): Three-tier classification (Core / Advanced / Specialist) for the 40+ UDS skills, addressing Claude Code's `/doctor` warning about truncated skill descriptions when adopters install extra plugins. New artifacts:
  - `skills/README.md` §Skill Tiers — tier membership table
  - `flows/skill-tiering-rationale.md` — tiering criteria and DEC-051 mapping
  - `examples/skill-overrides-recommended.json` — copy-paste `skillOverrides` reference (Tier 3 → `"name-only"`)
  - `docs/skill-budget-tuning.md` — adopter guide (user/project settings, customization, raising budget)

  **Adopter action (optional)**: merge the `skillOverrides` block from `examples/skill-overrides-recommended.json` into your `~/.claude/settings.json` or project `.claude/settings.json`. Tier 3 skills remain callable via `/<name>` — only Claude's auto-discovery listing is suppressed. See `docs/skill-budget-tuning.md`.
- **AI tool table coverage** (`README.md`, `locales/zh-TW/README.md`, `locales/zh-CN/README.md`): Added five previously missing tools — GitHub Copilot, OpenAI Codex, Aider, Continue, Google Antigravity. Introduced a ⚠ Minimal status legend entry. (`1b588e1`)
- **`scripts/bump-version.mjs`** (XSPEC-179 Phase 1): Cross-platform version-bump implementation, on par with the legacy `.sh`. (`1a44e14`)
- **`scripts/install-hooks.mjs`** (XSPEC-179 Phase 1): Cross-platform git hooks installer; skips `chmod` automatically on Windows. (`1a44e14`)
- **`scripts/pre-commit.mjs`** (XSPEC-180): Node.js ESM implementation of the pre-commit hook, with a platform branch that calls `check-translation-sync.ps1` on Windows and `.sh` elsewhere. (`1572869`)
- **7 TypeScript check scripts** (XSPEC-179 Phase 2, `0a26d14`): Migrated from bash to a single TypeScript source executed via `tsx`:
  - `scripts/check-ai-behavior-sync.ts`
  - `scripts/check-commit-spec-reference.ts`
  - `scripts/check-flow-gate-report.ts`
  - `scripts/check-integration-commands-sync.ts`
  - `scripts/check-registry-completeness.ts`
  - `scripts/check-release-readiness-signoff.ts`
  - `scripts/check-workflow-compliance.ts`
- **`tsx@^4.20.0`** added to root `devDependencies` (XSPEC-179 Phase 2, `0a26d14`).
- **7 npm scripts** wiring the TypeScript checks (`0a26d14`): `check:ai-behavior`, `check:commit-spec`, `check:flow-gate`, `check:integration-commands`, `check:registry`, `check:release-signoff`, `check:workflow-compliance`.

### Changed

- **Downstream-project decoupling** (6 Batches, `ebe716c`–`2392c0f`): All public-facing references to specific downstream projects (DevAP / VibeOps) replaced with adoption-layer neutral terminology across 130+ files. UDS is reaffirmed as a pure MIT + CC BY 4.0 standards library independent of any specific adoption layer. Key areas: `README.md`/`CLAUDE.md`/locales, `.standards/`/`ai/standards/` DEPRECATED stubs, `core/*.md`/locale mirrors, `cli/` source + tests, `skills/*/SKILL.md`, `flows/*.flow.yaml`/`flows/README.md`, `docs/specs/`, `specs/` root, `packaging-standards`, `git-worktree` path examples.

- **REGISTRY**: `roo-code` integration tier moved from `planned` to `partial`; Roo Code split out from the Cline row in the AI tool table. (`1b588e1`)
- **`.githooks/pre-commit`** (XSPEC-180, `1572869`): Reduced from a 51-line bash implementation to a 16-line POSIX `sh` shim that delegates to `scripts/pre-commit.mjs`.
- **`scripts/bump-version.mjs`** (`19ad314`): Added `buildCmd()` helper that switches to PowerShell + `.ps1` on Windows when invoking `check-version-sync` / `check-translation-sync`, restoring parity on Windows.
- **XSPEC-179 Phase 2 strategy revision** (`0a26d14`): Abandoned the previous `.sh` + `.ps1` dual-track plan in favour of a **single TypeScript source** approach. A single `.ts` file runs unchanged across all platforms via `tsx`, eliminating the "can only verify on Windows" feedback gap.

### Deprecated

- **`scripts/bump-version.sh`** (`1a44e14`): Marked DEPRECATED; superseded by `bump-version.mjs`.
- **`scripts/install-hooks.sh`** (`1a44e14`): Marked DEPRECATED; superseded by `install-hooks.mjs`.
- **7 legacy `check-*.sh` scripts** (`0a26d14`): Their `.ts` counterparts (above) are now the canonical implementation. The `.sh` files are retained for legacy Linux/macOS environments but should not receive new features.

### Removed

- **`.devap/` directory** (`2392c0f`): Orphan DevAP dogfooding installation removed. DevAP retired 2026-04-28 (XSPEC-086/095); UDS now uses `flows/commit.flow.yaml` natively and `scripts/bump-version.mjs` for releases.

### Fixed

- **`scripts/check-release-readiness-signoff.sh`** (`0a26d14`, latent bug fixed in TypeScript port): Faulty `grep -c "0\n0"` pattern (which never matched a literal `\n`) corrected so missing sign-off signals are detected reliably.
- **`scripts/check-integration-commands-sync.sh`** (`0a26d14`, latent bug fixed in TypeScript port): Eliminated SIGPIPE noise originating from a broken pipe between `find` and downstream consumers.

## [5.6.0] - 2026-05-06

> **Minor Release**: Full Coverage Testing Paradigm (XSPEC-178) — abolishes pyramid thresholds in favour of behaviour-completeness (happy / edge / error path per public function), ratchet CI, anti-fake-test enforcement, and STUB marker protocol.

### Added

- **`ai/standards/full-coverage-testing.ai.yaml`** — New standard defining the Full Coverage Testing Paradigm: behaviour-completeness model, ratchet CI policy, anti-fake-test rules (no tautology assertions, no mocking core business logic), STUB marker protocol, `@ac` AC-traceability tagging, and `COVERAGE_EXEMPT` exemption format (XSPEC-178)
- **`core/full-coverage-testing.md`** — Human-readable companion to the new YAML standard; required by pre-commit standards-sync hook

### Changed

- **`ai/standards/testing.ai.yaml`**: Added `deprecated_rules` block; pyramid threshold rules (`follow-pyramid`) deprecated since v5.5.0 and replaced by `follow-full-coverage` pointing to the new standard
- **`ai/options/testing/unit-testing.ai.yaml`**: Removed `pyramid_percentage: 70%`; replaced with `coverage_policy: "Behaviour-completeness ratchet (XSPEC-178)"`
- **`ai/options/testing/integration-testing.ai.yaml`**: Removed `pyramid_percentage: 20%`; replaced with ratchet coverage policy targeting all critical integration paths
- **`cli/standards-registry.json`**: Added `full-coverage-testing` entry (category: `skill`, skillName: `testing-guide`); updated `testing` entry description to remove pyramid threshold percentages
- **`cli/src/commands/init.js`**: `standardOptions` now includes `coverage_model: 'full-coverage'` default
- **`cli/src/commands/update.js`**: v5.5.0 migration block sets `options.coverage_model = 'full-coverage'` on upgrade and prints paradigm-shift notice
- **`cli/src/commands/check.js`**: Added `checkFullCoverageCompliance()` — warns when `full-coverage-testing.ai.yaml` is missing in v5.5.0+ projects, reports STUB marker count in `src/`

### Also in this release (post-v5.5.0 fixes)

- **`core/`**: Added `release-readiness-gate.md` aggregation standard; extended `browser-compatibility-standards.md`; closed coverage gaps for a11y threshold, contract testing, cross-flow regression, and capacity sign-off
- **`templates/`**: Expanded flow test matrix to multi-gate model with UAT script column; added flow specification section to `requirement-template.md`
- **`flows/`**: Wired Multi-Gate Flow into RQM and pre-release pipeline
- **`cli/package.json`**: Bumped `@inquirer/prompts` 8.4.2, `ora` 9.4.0, `vitest` 4.1.5, `ajv` 8.20.0, `opencc-js` 1.3.0, `@commitlint` 20.5.3
- **CLAUDE.md / docs**: Added XSPEC-176 source-of-truth precedence note

### Migration from Pyramid Thresholds

Projects upgrading from `< 5.5.0` will receive a migration notice via `uds update`:

```
⚠ Testing paradigm migrated to Full Coverage (XSPEC-178).
  full-coverage-testing.ai.yaml installed. Remove coverageThreshold from jest/vitest config.
```

See `core/full-coverage-testing.md` for the complete migration checklist (delete `coverageThreshold`, install `.coverage-baseline.json`, add ratchet scripts to CI).

## [5.5.0] - 2026-05-05

> **Minor Release**: 17 New Standards — Testing Security, LLM Output Validation, Supply Chain Integrity, Release Quality. See [GitHub Release](https://github.com/AsiaOstrich/universal-dev-standards/releases/tag/v5.5.0) for full notes.

## [5.4.0] - 2026-04-27

> **Minor Release**: XSPEC-086 Phase 2 — 8 個純流程/編排標準遷移至 DevAP（deprecated stubs 保留向後相容）。UDS 職責回歸活動定義層，流程編排交由 DevAP 負責（DEC-049）。

### Deprecated（XSPEC-086 Phase 2 — 遷移至 DevAP）

下列 8 個標準已遷移至 `dev-autopilot/standards/`，成為 DevAP canonical 位置。UDS 保留 deprecated stub 至 v6.0.0。

**`ai/standards/flow/`（已遷入 DevAP `standards/flow/`）**
- `workflow-enforcement.ai.yaml` → `dev-autopilot/standards/flow/workflow-enforcement.ai.yaml`
- `workflow-state-protocol.ai.yaml` → `dev-autopilot/standards/flow/workflow-state-protocol.ai.yaml`
- `change-batching-standards.ai.yaml` → `dev-autopilot/standards/flow/change-batching-standards.ai.yaml`
- `branch-completion.ai.yaml` → `dev-autopilot/standards/flow/branch-completion.ai.yaml`
- `pipeline-integration-standards.ai.yaml` → `dev-autopilot/standards/flow/pipeline-integration-standards.ai.yaml`

**`ai/standards/orchestration/`（已遷入 DevAP `standards/orchestration/`）**
- `agent-dispatch.ai.yaml` → `dev-autopilot/standards/orchestration/agent-dispatch.ai.yaml`
- `agent-communication-protocol.ai.yaml` → `dev-autopilot/standards/orchestration/agent-communication-protocol.ai.yaml`
- `execution-history.ai.yaml` → `dev-autopilot/standards/orchestration/execution-history.ai.yaml`

### Changed

- `cli/standards-registry.json`：8 個標準條目標記 `deprecated: true`、`deprecatedSince: "5.4.0"`、`removalVersion: "6.0.0"`、`canonicalOwner: "devap"`、`canonicalPath`
- `cli/tests/unit/core/execution-history-standards.test.js`：測試更新為驗證 deprecated stub 結構（meta.deprecated + canonical_path），22 tests 通過

### Migration Guide

安裝 DevAP 並載入對應標準以取得完整的流程執行能力：

```bash
npm install -g dev-autopilot
# 各標準 canonical 位置見 dev-autopilot/standards/README.md
```

UDS 5.x 仍提供 deprecated stubs（含 fallback 規則），UDS 6.0.0 將完全移除。

## [5.3.2] - 2026-04-27

> **Patch Release**: Bug fix — `uds update -y` now auto-installs/updates Skills and Commands instead of only showing hints.

### Fixed
- **`uds update --yes` / `-y`** (`cli/src/commands/update.js`): The `--yes` flag previously skipped Skills and Commands installation entirely, printing a "New features available" hint instead. It now mirrors the interactive path — missing Skills/Commands are installed immediately and outdated ones are updated. The manifest and integration files are refreshed accordingly. Fixes the regression where `uds update -y` left `.claude/` Skills unchanged while interactive `uds update` updated them.

## [5.3.1] - 2026-04-27

> **Patch Release**: Bug fix — `uds check` no longer falsely warns "AGENTS.md standards out of sync" after `uds update`.

### Fixed
- **`generateAgentsMdSummary()`** (`integration-generator.js`): Removed `.slice(0, 30)` cap that caused AGENTS.md to list only 30 of all installed standards. `uds check` compares against all manifest standards, so the truncation always produced a false "out of sync" warning. Generator now lists all installed `.ai.yaml` standards; check passes cleanly.

## [5.3.0] - 2026-04-26

> **Minor Release**: Four new standards + one new Skill (XSPEC-085/064) — `no-cicd-deployment`, `rollback-standards`, `cd-deployment-strategies`, `pipeline-security-gates`, and `/deploy` Skill. Total standards: 136.

### Added
- **`no-cicd-deployment.ai.yaml`** (XSPEC-085 Phase 1): Three-layer deployment architecture for no-CI/CD environments — `set -euo pipefail` + deploy.lock + version tag enforcement; smoke test + auto-rollback; Blue-Green <30s rollback.
- **`rollback-standards.ai.yaml`** (XSPEC-064 Phase 1): Rollback trigger matrix — auto (error rate >2× baseline), assisted (SLO violated), manual (latency within SLO). Error budget <10% escalates to auto. P0–P3 severity with SLA.
- **`cd-deployment-strategies.ai.yaml`** (XSPEC-064 Phase 1): Strategy selection matrix — blue-green / canary / rolling / recreate decision tree (traffic × risk × cost). No-CI/CD compatibility notes included.
- **`pipeline-security-gates.ai.yaml`** (XSPEC-064 Phase 1): CI security gate positions — pre-commit secrets scan, post-build SAST, post-staging DAST, package-stage SCA+SBOM. Critical/High block pipeline; Medium requires approval.
- **`/deploy` Skill** (`skills/deploy-assistant/`, XSPEC-085 Phase 1b): Interactive no-CI/CD deployment script generator with zh-TW locale translation.

## [5.2.0] - 2026-04-24

> **Minor Release**: Three new standards/skills (XSPEC-080/081/082) — `/release package` sub-command, `/push` Quality Gate Skill, and `agent-behavior-discipline` standard (Karpathy four principles: Ask/Simple/Precision/Test). Bundle parity hardened. Docs centralized to dev-platform. Total standards: 74.

### Added
- **`agent-behavior-discipline.ai.yaml`** (Trial, expires 2026-10-24, XSPEC-082 / DEC-048): New governance standard encoding Andrej Karpathy's four AI Agent behavioral principles — Ask (surface assumptions before executing), Simple (minimum sufficient code), Precision (surgical changes only), Test (define verifiable success criteria + self-correction loop). Integrated into `uds-manifest.json` (74th entry) and `cli/standards-registry.json`.
- **`/push` Skill** (`skills/push/`, XSPEC-081): Git push quality gates and collaboration guardrails — protected branch detection, force-push guard, pre-push gate validation, push receipt audit log, PR integration entry point. Includes two configuration options: `options/push/single-owner-mode.ai.yaml` (reduced guardrails for solo repos) and `options/push/team-mode.ai.yaml` (full guardrails, confirmation required for teams).
- **`/release package` sub-command** (`skills/release/`, XSPEC-080): Packaging guidance for 10 target formats — npm/Node.js, Python/PyPI, Go binary, Electron app, Homebrew formula (Wave 1) + Rust/Cargo, Tauri desktop, Docker image, VS Code Extension, GitHub Release asset (Wave 2). Detection-first design: auto-detects project type before applying packaging steps.

### Fixed
- **Bundle parity** (XSPEC-072 Phase 2): Resolved parity gap between `ai/standards/` and `bundle/` — all 74 standards now present in the bundle. CI hardened to hard-fail (exit 1) on any parity mismatch, preventing silent bundle drift.
- **i18n NO META frontmatters** (BUG-A06): Added missing YAML frontmatter to 36 translation files that were flagged as `NO META` — fixes translation sync validation false positives.

### Changed
- **Docs centralization (DEC-047 Batch 2)**: Migrated UDS planning/governance docs to the AsiaOstrich dev-platform planning hub. These files are no longer distributed with UDS:
  - `docs/AI-AGENT-ROADMAP.md` → dev-platform `cross-project/roadmap/uds-agent-roadmap.md`
  - `docs/OPERATION-WORKFLOW.md` → dev-platform `cross-project/ops/uds-operation.md`
  - `docs/internal/AGENT-PROTOCOL.md` → dev-platform `cross-project/ops/uds-agent-protocol.md`
  - `docs/internal/AI-AGENT-SYNC-SOP.md` → dev-platform `cross-project/ops/uds-ai-agent-sync-sop.md`
  - `docs/internal/INTEGRATION-SIMPLIFICATION-PROPOSAL.md` → dev-platform `cross-project/ops/uds-integration-simplification-proposal.md`
  - Locale copies (`locales/zh-TW/docs/`, `locales/zh-CN/docs/`) of ROADMAP and OPERATION-WORKFLOW also removed.

[5.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.1...v5.2.0

## [5.1.1] - 2026-04-20

> **Patch Release**: Windows CI fix, skill `name` field added to 53 SKILL.md files, three `.md` source standards updated with incident rules from BUG-A08 post-mortem, zh-TW/zh-CN translations synced.

### Fixed
- **`cli/src/utils/directory-mapper.js`**: Replace `dir.split('/').pop()` with `path.basename(dir)` for Windows cross-platform compatibility — fixes `directory-mapper.test.js` failures on Windows CI runners.

### Added
- **`name` field** added to 9 source `skills/*/SKILL.md` files and 44 `locales/zh-TW/skills/*/SKILL.md` files — required by skill validation tooling.

### Changed
- **`core/test-governance.md`** 1.0.0 → 1.1.0: added `test-execution-continuity` rule (BUG-A08 post-mortem — 22 tests existed but were never wired to CI execution triggers).
- **`core/checkin-standards.md`** 1.5.0 → 1.6.0: added Legacy Project File Sync (`project-file-sync`) section — every source file on disk must be registered in legacy project manifest files.
- **`core/testing-standards.md`** 3.1.0 → 3.2.0: added E2E Precondition Scope (`e2e-precondition-scope`) section — E2E pre-checks must verify all pages/endpoints under test, not just the auth entry point.
- **zh-TW and zh-CN translations** synced for `test-governance.md`, `checkin-standards.md`, and `testing-standards.md`.

[5.1.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.0...v5.1.1

## [5.1.0] - 2026-04-20

> **Stable Release**: BUG-A06 i18n completeness — 32 missing translations added, semver-aware translation gate, new `translation-lifecycle-standards` UDS standard. BUG-A07 shell test coverage — bats smoke tests for 20+ scripts. BUG-A08 fake-pass test audit — 22 tests corrected. Pre-release Batch 0: 6 standards promoted from Trial to Adopt (DEC-021/025/031/035/038/040). Total standards: 106.

### Added
- **`translation-lifecycle-standards`** (Trial, expires 2026-10-20): New UDS standard codifying MISSING vs OUTDATED distinction, semver-aware severity classification (MISSING/MAJOR = release blocker, MINOR/PATCH = advisory), automation integration (pre-commit hook, release gate, bump-version integration). Source: BUG-A06 post-mortem.
- **`.githooks/pre-commit`** + **`scripts/install-hooks.sh`**: Commit-time reminder when `core/*.md` files are staged; shows OUTDATED warnings without blocking commits. Activate via `./scripts/install-hooks.sh`.
- **32 zh-TW and zh-CN translations** (BUG-A06): All core standards now have complete zh-TW and zh-CN translations including: `circuit-breaker`, `token-budget`, `dual-phase-output`, `failure-source-taxonomy`, `immutability-first`, `security-decision`, `capability-declaration`, `recovery-recipe-registry`, `retry-standards`, `health-check-standards`, `timeout-standards`, `skill-standard-alignment-check`, `standard-admission-criteria`, `standard-lifecycle-management`, `packaging-standards`, `frontend-design-standards`, `translation-lifecycle-standards`, and others.
- **bats smoke tests** (BUG-A07): `tests/scripts/` — smoke tests for 20+ shell scripts covering `check-translation-sync.sh`, `check-version-sync.sh`, `bump-version.sh`, `install-hooks.sh`, and others.

### Changed
- **`check-translation-sync.sh`**: Semver-aware severity — MAJOR version gap now exits 1 (release blocker); MINOR/PATCH gaps exit 0 with advisory warnings. Added `semver_diff()` function and `[MAJOR]`/`[MINOR]`/`[PATCH]` severity labels.
- **`bump-version.sh`**: Auto-runs `check-translation-sync.sh` after version files updated, providing translation health snapshot at release prep time.
- **`scripts/pre-release-check.sh`**: Updated to call `check-translation-sync.sh` as a hard gate (MISSING + MAJOR = exit 1).

### Fixed
- **zh-CN `anti-hallucination.md`** (BUG-A06): Updated from 1.5.0 → 1.5.1 — added missing "Agent Epistemic Calibration" section (Answer/Ask/Abstain framework from XSPEC-008). The section was absent in zh-CN since 2026-04-13.
- **22 fake-pass tests** (BUG-A08): Tests that passed without actually testing the correct behavior have been corrected with real assertions.

### Promoted to Adopt (Pre-release Batch 0)
- `circuit-breaker` (DEC-021): Adopted after 6-month Trial
- `token-budget` (DEC-025): Adopted after 6-month Trial
- `dual-phase-output` (DEC-031): Adopted after 6-month Trial
- `security-decision` (DEC-035): Adopted after 6-month Trial
- `immutability-first` (DEC-038): Adopted after 6-month Trial
- `failure-source-taxonomy` (DEC-040): Adopted after 6-month Trial

[5.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.0-beta.7...v5.1.0

## [5.1.0-beta.7] - 2026-04-17

> **Beta Release**: DEC-043 Wave 1 — six trial-status standards covering reliability patterns and governance meta-framework.

### Added
- **Reliability pack (XSPEC-067)**: Three trial-status standards for resilience patterns.
  - `retry-standards` (`ai/standards/retry-standards.ai.yaml`, `core/retry-standards.md`): retry policy with exponential backoff, jitter, and idempotency guards.
  - `timeout-standards` (`ai/standards/timeout-standards.ai.yaml`, `core/timeout-standards.md`): layered timeout budgets (call / request / end-to-end) and propagation rules.
  - `health-check-standards` (`ai/standards/health-check-standards.ai.yaml`, `core/health-check-standards.md`): liveness / readiness / startup probe semantics.
- **Governance meta pack (XSPEC-070, Wave 1 prerequisite)**: Three trial-status standards defining how standards themselves are admitted, managed, and aligned with Skills.
  - `standard-admission-criteria`: gating criteria for new standard proposals.
  - `standard-lifecycle-management`: Trial → Stable → Deprecated → Archived transitions.
  - `skill-standard-alignment-check`: alignment audit between Skills and the standards they reference.
- All six standards follow the UDS three-way sync requirement: `.ai.yaml` (machine) + `.md` (human) + `cli/standards-registry.json` entry (+66 lines).

### Context
- Driven by **DEC-043** (UDS coverage completeness roadmap). Governance meta pack is the Wave 1 prerequisite unblocking Wave 2–4 (eight topic standard packs: SRE / CI-CD / IaC / Compliance / Reliability / Data Engineering / Product / Governance — XSPEC-063~070).
- PR: #77

[5.1.0-beta.7]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.0-beta.6...v5.1.0-beta.7

## [5.1.0-beta.6] - 2026-04-13

> **Beta Release**: Bug fixes for `uds init` crash, E2E test isolation, and macOS display language detection.

### Fixed
- **`uds init --yes` crash** (`manifest-installer.js`): `contentMode: 'auto'` failed schema validation (allowed: `minimal/index/full`), causing init to crash after copying files without writing `manifest.json`. Now resolves `'auto'` to `'minimal'` before writing.
- **macOS display language ignored** (`bin/uds.js`, `config.js`, `update.js`): Three root causes prevented `uds config` display language from taking effect on English-locale macOS after upgrading from 3.5.1 to 5.1.0-beta.5. Fixed language detection priority chain and `display_language` backfill migration.
- **E2E test isolation** (`tests/utils/cli-runner.js`): Tests inherited developer's `~/.udsrc` (`zh-tw`), overriding language detection and breaking all English-output assertions. Added `HOME: TEST_HOME_DIR` isolation.
- **E2E test count assertion** (`tests/e2e/update-flow.test.js`): CLAUDE.md yaml count compared against total manifest standards including 3 non-yaml `.md` templates. Filter to `.ai.yaml` only before comparing.

### Added
- **Epistemic calibration framework** (`core/anti-hallucination.md`, XSPEC-008): Six calibration protocols — Certainty Gradient (CG), Evidence Chain (EC), Uncertainty Decomposition (UD), Boundary Awareness (BA), Calibration Feedback (CF), Meta-Uncertainty (MU).
- **`/e2e-assistant` Skill**: From BDD Gherkin scenarios, auto-generate E2E test skeletons; framework detection (Playwright/Cypress/Puppeteer); coverage gap analysis.
- **`/process-to-skill` Skill**: Process-to-Skill governance framework; 3-Times Rule; Simple/Complex/Delta decision tree.
- **`execution-history.ai.yaml`** synced with XSPEC-003-SDD schema.

## [5.1.0-beta.5] - 2026-04-10

> **Beta Release**: 大規模 CLI 擴展（SDLC Flow Engine、Standards-as-Hooks 編譯器、分層 CLAUDE.md、SuperSpec Phase 4、opt-in 遙測上傳）與 Skill 治理框架（/process-to-skill、DEC 評估框架）。

### Added

**新功能 — CLI & Standards**
- **opt-in 遙測上傳** (SPEC-TELEMETRY-002): Hook 執行結果可選擇性上傳至遠端分析端點；雙重防護（`telemetryUpload=true` + `telemetryApiKey` 非空）；SHA-256 匿名 user_id，不含 PII
- **DEC 借鑲評估框架** (XSPEC-014 Layer 1): 技術雷達（Technology Radar）、假設書（Hypothesis Document）、Reversal DEC 三大評估工具，支援借鑲決策記錄
- **SuperSpec Phase 4 — 收尾功能** (XSPEC-005): `uds spec archive`（歸檔索引）、`uds spec search`（全文搜尋）、`uds spec quickstart`（快速建立）、`uds spec split`（大型 spec 拆分）
- **SuperSpec Phase 2 — 驗證管線**: `spec-linter`（格式驗證）、品質評分（0-100 分）、`context sync`（AC 與文件同步）
- **spec 大小閘門** (AC-3): `validateSpecSize()` — 超過 600 行觸發警告，超過 1200 行阻擋提交
- **YAML 標準擴展** (AC-18): `.standards/*.ai.yaml` 格式擴展，支援 `enforcement` 區塊與 `required_fields` 定義
- **SDLC Flow Engine** (SPEC-FLOW-001): 自訂 SDLC 工作流程引擎，含狀態機持久化（Phase 1）、可插拔品質閘門（Phase 4）、Export/Import（Phase 6-7）、互動式建立（AC-12）
- **Standards-as-Hooks 編譯器** (SPEC-COMPILE-001): `uds compile` — 將 `.standards/*.ai.yaml` 的 `enforcement` 區塊自動轉譯為 Claude Code hook 腳本
- **分層 CLAUDE.md** (SPEC-LAYERED-001): `uds init --content-layout` 支援多層目錄的獨立 CLAUDE.md；`directory-mapper` + `generator` 核心模組
- **Hook 整合** (SPEC-HOOKS-001): `uds init --with-hooks` 一鍵安裝 hook 腳本（commit-msg / security / logging）；YAML enforcement 區塊自動注入
- **Hook 執行遙測** (SPEC-TELEMETRY-001): 本地端 hook 執行統計（exitCode、duration_ms、hook_type），寫入 `.uds/hook-stats.jsonl`
- **執行歷史倉庫標準** (`execution-history`): 新增 `core/execution-history.md` — AI Agent 工作階段跨對話持久化記憶標準，含 `@executes`/`@reads`/`@writes` 標註慣例
- **`/e2e` 斜線命令** (SPEC-E2E-001): 從 BDD Gherkin 場景自動生成 E2E 測試骨架；支援 Playwright/Cypress/Puppeteer；AC 分析、模式識別、覆蓋差距報告
- **`/process-to-skill` Skill** (XSPEC-020): Process-to-Skill 治理框架；3-Times Rule；Simple/Complex/Delta 決策樹；Placement Decision（專案 vs UDS）
- **Skill 治理模板**: `templates/SKILL-CANDIDATES.md`（候選追蹤）、`templates/SKILL-BRIEF-TEMPLATE.md`（Simple Skill 最小規格）
- **Integration Commands Sync** (SPEC-INTSYNC-001): `check-integration-commands-sync.sh` — 自動偵測 AI 工具整合檔是否引用所有斜線命令
- `COMMAND-INDEX.json`: 47 個 commands 的 Single Source of Truth，含 7 類分類
- `/derive` 擴展：感知 `test_levels` 配置 + AC Level Summary；支援 IT + E2E 測試推演（SPEC-DERIVE-001）
- **三個核心標準新增 `enforcement` 區塊**: `commit-message-guide`、`testing-standards`、`checkin-standards`
- Pre-release 新增 Step 7.5 整合命令同步檢查

**文件與規格**
- 批次歸檔 28 個已完成的 orphan specs 為 Archived 狀態
- 歸檔 SPEC-TELEMETRY-001、SPEC-COMPILE-001、SPEC-LAYERED-001、SPEC-HOOKS-001、SPEC-FLOW-001、SPEC-E2E-001（共 6 份規格）
- 新增 XSPEC-005 SuperSpec 借鑲規格與衍生測試工件

### Changed
- `REGISTRY.json`: 所有 tier 新增 `requiredCategories` 欄位；Complete 和 Partial tier 均要求全部 command categories
- `REGISTRY.json`: Cursor 依實際能力（不支援 Workflows）從 `complete` 降為 `partial` tier
- `spec dependency tracking`：新增 `depends_on` 欄位與 dual mode 支援（strict / advisory）

### Fixed
- `check-orphan-specs.sh`: 排除 traceability 文件的誤判（含 `SPEC-` 前綴的參考行被誤判為 orphan）
- `check-orphan-specs.sh`: 修復 orphan spec 偵測 regex（支援 list 前綴和中文狀態欄位）

### Chore
- `.gitignore`: 新增 `.workflow-state/`（排除工作流程狀態 ephemeral 檔案）
- 移除 11 個測試檔案中過時的 `[TODO]` 標記

## [5.1.0-beta.4] - 2026-04-01

> **Beta Release**: 大規模標準擴展（+17 新標準），覆蓋 SDLC 8 階段。SDLC 覆蓋率從 64% 提升至 84%。

### Added
- **Phase 1 — 監控維運標準** (5 個新 core 標準):
  - `observability-standards`: 三支柱框架（Logs/Metrics/Traces）、Golden Signals、L0-L4 成熟度模型
  - `slo-standards`: SLI 選取指南、SLO 設定方法論（5 步驟）、Error Budget 政策
  - `alerting-standards`: P1-P4 分級、Escalation 路徑、SLO-based alerting、告警品質指標
  - `runbook-standards`: 標準範本（7 段落）、5 類 Runbook、演練機制、品質 6 原則
  - `postmortem-standards`: Blameless 原則、5 種 RCA 方法、Action Items 生命週期
- **Phase 2 — 編碼實作標準** (3 新建 + 1 擴展):
  - `tech-debt-standards`: 6 類分類法、登記簿範本（11 欄位）、預算機制、3×3 影響矩陣
  - `feature-flag-standards`: 4 類 Flag、TTL 生命週期、腐化偵測、清理檢查表
  - `environment-standards`: 4 環境層級、5 層配置優先級、Secret 管理、IaC 原則
  - `checkin-standards` 擴展: Linting 三級分級、Auto-fix 策略、團隊一致性原則
- **Phase 3 — 部署與交付** (1 新建 + 2 擴展):
  - `containerization-standards`: Dockerfile 最佳實踐、Multi-stage Build、Image 標籤/安全/Registry
  - `deployment-standards` 擴展: 部署驗證（成功判定、觀察期、Smoke Test）
  - `environment-standards` 擴展: IaC 原則（聲明式/冪等/Drift Detection）
- **Phase 4 — 測試深化** (2 新建 + 2 擴展):
  - `test-data-standards`: 3 層資料策略、匿名化規則、隔離原則、Factory Pattern
  - `chaos-engineering-standards`: 4 步驟實驗流程、5 種故障注入、安全護欄、SLO 整合
  - `performance-standards` 擴展: 4 種效能測試類型、基準線管理、效能預算
  - `testing-standards` 擴展: 探索式測試 SBTM、SFDPOT 啟發法
- **Phase 5 — 退役與演進** (2 個新 core 標準):
  - `deprecation-standards`: API Sunset 6 階段、Feature Sunset 8 步清單、系統退役 7 步驟
  - `knowledge-transfer-standards`: 30 天 Onboarding 路線圖、Handoff 6 步清單、Bus Factor 評估
- **Phase 6-8 — 規劃/治理/品質** (4 個新 core 標準):
  - `supply-chain-security-standards`: SBOM（SPDX/CycloneDX）、SLSA L1-L4、License 合規矩陣
  - `estimation-standards`: 3 種估算方法、校準機制、5 個反模式、信心等級
  - `design-document-standards`: HLD（6 段落）/LLD（5 段落）範本、C4 架構圖、設計審查
  - `privacy-standards`: Privacy by Design 7 原則、資料分類、DPIA、使用者 5 項權利
- **3 個新 Skill**: `observability-assistant`、`slo-assistant`、`runbook-assistant`
- **翻譯**: 17 個新標準 × zh-TW + zh-CN = 34 個翻譯檔
- **同步工具**: `scripts/check-registry-completeness.sh`（core→ai.yaml→registry→.standards/ 完整性檢查）
- **Pre-release 檢查**: 新增 Step 18 registry completeness（總步驟 19→20）
- **SDD 工件**: 18 份規格、18 份 BDD Feature、693 個 TDD 測試（全部通過）

### Changed
- **Integration 精簡化**: `uds init`/`update` 根據 AI 工具 tier 自動選擇 contentMode
  - complete (Claude Code) → minimal, partial (Copilot) → full, preview (Gemini) → index
  - `ai-agent-paths.js` 新增 `tier` 欄位和 `getAgentTier()` 函式
  - `integration-generator.js` 新增 `resolveContentModeForTool()` 映射函式
  - `init.js` contentMode 預設值從 `'index'` 改為 `'auto'`
- **CLAUDE.md**: Installed Standards Index 從 61 → 78 標準、核心檔案數 49 → 71
- **OPERATION-WORKFLOW.md**: §8.1 新增標準同步清單從 10 步擴展為 12 步

### Added (carried from Unreleased)
- **標準自我診斷系統** (SPEC-SELFDIAG-001): 讓 UDS 從被動框架升級為能自我診斷的框架
  - `uds audit --score [--self]`: 4 維度健康評分（完整度/新鮮度/一致性/覆蓋度）
  - `--save / --trend`: 歷史趨勢追蹤與退化偵測
  - `--ci --threshold N`: CI 模式，以 exit code 反映健康狀態
  - `--format json`: 結構化 JSON 輸出
- **Hook 學習迴路**: inject-standards.js 支援觸發統計記錄（opt-in）
  - 啟用方式：在 `.uds/config.json` 設定 `{"hookStats": true}`
  - 分析工具：`node scripts/analyze-hook-stats.mjs`
  - 隱私保護：不記錄 prompt 內容，僅記錄匹配統計
  - 檔案大小上限 1MB，自動截斷舊記錄
- **排程自我診斷**: `.github/workflows/scheduled-health.yml`
  - 每週一 09:00 UTC 自動執行健康評分
  - 分數低於閾值時自動建立 GitHub Issue
  - 支援 `workflow_dispatch` 手動觸發
- **外部參考檢查**: `scripts/check-external-references.mjs`
  - 掃描 `core/*.md` 和 `.standards/*.ai.yaml` 中的外部 URL
  - 偵測失效連結（link-rot）和過期版本引用
  - 支援離線模式（`--offline`）和 JSON 輸出（`--json`）
- **跨產品標準效果回饋協議**: `specs/standards-effectiveness-schema.json`
  - 定義 DevAP/VibeOps → UDS 的標準效果回饋 JSON 格式
  - 匯總工具：`scripts/aggregate-effectiveness.mjs`
- **版本清單產出**: `scripts/generate-version-manifest.mjs`
  - Release 時產出 `.standards/version-manifest.json` 供消費者偵測版本漂移
- **整合冒煙測試**: `cli/tests/integration/tool-outputs.test.js`
  - 驗證全部 10 個 AI 工具的 `uds init` 產出格式

### Changed
- `.gitignore`: 新增 `.uds/` 排除本地統計資料

## [5.1.0-beta.3] - 2026-03-28

> **Beta Release**: 依賴大版本升級、文件生命週期標準、CLI bug 修復。供早期使用者測試。

### Added
- **文件生命週期標準** (SPEC-DOCLC-001): 新增 `core/documentation-lifecycle.md`
  - 定義文件更新觸發規則表（7 種觸發條件 × 6 種文件類型）
  - 定義文件檢查金字塔（Commit → PR → Release 三層）
  - 區分硬檢查（自動化）與軟檢查（人工審查）
  - 定義責任歸屬矩陣（角色 × 文件類型 × 時機）
- **Release Workflow 文件同步檢查**: `release-workflow.md` 新增 Documentation Sync Verification 章節
- **文件可及性標準**: `documentation-writing-standards.md` 新增 WCAG 2.1 可及性章節
- **業界標準引用增強**: 4 個文件標準補齊 ISO 26515、Diátaxis、Conventional Comments 引用
- **新技能與標準**: `/adr`、`/retrospective`、`/contract-test`、`/metrics` 技術債量化、`/incident` 改善追蹤、`/discover` 風險登記簿、`/ac-coverage` 四層追溯

### Changed
- **Commander v14**: 升級 commander 至 v14.0.0（無程式碼變更）
- **Inquirer → @inquirer/prompts**: 從 inquirer v9 遷移至 @inquirer/prompts v7
  - 刪除不再需要的 checkbox monkey patch
  - 所有 prompt 呼叫改用新 API 格式（15 個 source files + 7 個 test files）

### Fixed
- **Skill-only 標準 null path**: 修正 `project-discovery` 等純 skill 標準安裝時的 path 錯誤
- **GitHub 429 Rate Limit**: 修正 `uds check` 在 GitHub API 回應 429 時崩潰的問題
- **AI 工具連動安裝**: 新增 AI 工具時自動連動安裝 Skills 和 Commands
- **Windows 路徑重複**: 修正 Windows 環境下路徑重複問題
- **Manifest 殘留清理**: 修正移除 AI 工具時未清理 manifest 中的殘留元資料

## [5.1.0-beta.2] - 2026-03-25

> **Beta Release**: `output_language` 統一語言設定、文件生態系閉環。供早期使用者測試。

### Added
- **文件生態系閉環** (SPEC-DOCS-01): 新增 `/docs impact` 和 `/docs translate` 子命令
  - `/docs impact` — 主動分析程式碼變更對文件的影響，附建議命令
  - `/docs translate` — 翻譯狀態檢查與 AI 輔助翻譯同步
  - `sync-updates` 規則升級為自動 AI 行為，改完 code 自動提醒受影響文件
  - 命令建議映射表：每種文件類型對應建議的斜線命令
- **文件三層分級制度**: bilingual 模式下文件依 L1（強制）/ L2（建議）/ L3（不影響）分級

### Changed
- **`commit_language` → `output_language`**: 統一語言設定名詞，同時控制 commit message 和文件語言（74 檔案重命名）
  - 與 `display_language` 形成對稱：display = 顯示端、output = 產出端
  - 向後相容：manifest 自動遷移、`--commit-lang` 保留為 hidden alias
- **`/docs` 命令擴展**: 子命令從 4 個增加到 6 個（新增 `impact`、`translate`）

### Fixed
- **removeFromManifest 遺漏清理**: 修正解除安裝時未清理 `integrationBlockHashes` 和 `integrationConfigs` 的問題

## [5.1.0-beta.1] - 2026-03-25

> **Beta Release**: 手動打包部署 Release 模式、AI 回應導航標準。供早期使用者測試。

### Added
- **手動打包部署 Release 模式** (SPEC-RELEASE-01): 為未使用 CI/CD 的專案新增 RC 制版本管理流程
  - `uds release promote` — RC → Stable 版本晉升
  - `uds release deploy` — 記錄部署紀錄到 deployments.yaml
  - `uds release manifest` — 產生 build-manifest.json
  - `uds release verify` — 驗證 manifest 與 Git 狀態一致性
  - `uds init` 新增發布模式選擇（ci-cd / manual / hybrid）
  - `uds config --type release_mode` 支援模式切換
  - 4 個核心工具模組：version-promote、release-config、build-manifest、deployment-tracker
  - 87 個新增測試（70 單元 + 17 整合）
- **AI 回應導航標準** (SPEC-STD-08): 統一 AI 助手回應結尾的下一步引導格式

### Fixed
- **版本更新通知觸發範圍** (SPEC-CLI-UPDATE-NOTIFY): `uds --version` 現在會檢查並顯示新版本提示；`postAction` 從白名單（僅 4 指令）改為黑名單策略（排除 `update`/`simulate`/`fix`），大幅擴大觸發範圍
- **`--version` 實作方式**: 使用 `configureOutput({ outputVersion })` 攔截版本輸出，避免 Commander.js 的 `.option()` 覆寫導致 help 訊息洩漏

### Changed
- **version-check-on-uds-operation 規則**: `context-aware-loading.ai.yaml` 中 priority 從 `optional` 提升為 `required`，AI agent 首次使用斜線命令/Skills 時必須檢查版本
- **Release Standards Skill**: 新增手動模式文件和 AI Agent 行為定義
- **/release 命令**: 新增 promote、deploy、manifest、verify 子命令路由

### Dependencies
- bump glob 13.0.1 → 13.0.6 (patch, devDependency)
- bump ora 8.2.0 → 9.3.0 (major, Node 20 required)
- bump lint-staged 15.5.2 → 16.4.0 (major, devDependency)

## [5.0.0] - 2026-03-25

> **Stable Release**: First stable release of v5.0.0 — AI Command Behavior 標準、44 個指令完整覆蓋、19 步 pre-release 檢查。

### Added
- **AI Command Behavior 標準** (`core/ai-command-behavior.md`): 定義 AI Agent 在指令定義檔中的運行時行為結構（Entry Router、Interaction Script、Stop Points、Error Handling）
- **44 個指令完整覆蓋 AI Agent Behavior**: 為所有多步驟指令補齊行為定義，包含最後 6 個遺漏的指令（commit、init、config、methodology、update、check）
- **11 個新斜線命令**: `/security`、`/api-design`、`/database`、`/ci-cd`、`/incident`、`/pr`、`/scan`、`/metrics`、`/durable`、`/migrate`、`/audit`（命令總數 34→45）
- **AI Agent Behavior 覆蓋率檢查**: `check-ai-behavior-sync.sh` 腳本，整合至 pre-release-check.sh（Step 16，總步驟 17→19）
- **使用者手冊與入門教學簡報** (`docs/manual/`)
- ai-command-behavior 標準的 zh-TW 和 zh-CN 翻譯

### Changed
- **dev-workflow 技能更新**: 納入 11 個新命令與 2 個新場景
- **24 個互動式 SKILL.md 加入 AI Agent Behavior 引用**
- **.claude/skills SKILL.md 本地化**: 6 個 SKILL.md 轉為純繁中版本，加入 source/translation frontmatter
- 移除 SKILL.md 中冗餘的跨技能比較表

### Fixed
- **testing-standards 重構**: 以覆蓋率為核心指標重構測試標準
- **3 個命令 AI 行為定義補強**: 修復 4 個停止點標記
- **/commit next steps**: 修正不當建議每次更新 CHANGELOG

## [5.0.0-rc.16] - 2026-03-24

> **Release Candidate**: Sixteenth RC for v5.0.0 with 10 new skills, feature gap analysis, Windows path bug fix, translation completeness enforcement, and AI tool integration expansion.

### Added
- **10 new skills**: `/security`, `/api-design`, `/database`, `/ci-cd`, `/incident`, `/pr`, `/scan`, `/metrics`, `/durable`, `/migrate` — each with 5 platform files (canonical + Claude + Gemini + zh-TW + zh-CN)
- **2 new AI tool integrations**: Aider and Continue.dev (AGENTS.md + README.md + REGISTRY.json)
- **Translation completeness check**: `check-translation-sync.sh` now detects missing skill and core standard translations (not just outdated ones)
- **40 missing translations**: Backfilled zh-TW (20 files) and zh-CN (20 files) for previously untranslated skills and core standards
- **Skill disambiguation sections**: `/methodology` vs `/dev-workflow`, `/spec` vs `/sdd`, `/coverage` vs `/ac-coverage` comparison tables
- **AI Skills Hierarchy**: Three-layer system documentation in `/ai-collaboration`, `/ai-instruction-standards`, `/ai-friendly-architecture`
- **Testing Skills Navigator**: Decision tree in `/testing` for navigating 6 testing-related skills
- **Retroactive specs**: SPEC-NEW-SKILLS-BATCH-01, SPEC-TRANSLATION-COMPLETENESS, SPEC-NEW-INTEGRATIONS-BATCH-01

### Fixed
- **Windows path separator bug**: `manifest.fileHashes` keys now normalized to forward slashes (`/`) on all platforms — fixes duplicate file display and false "modified" detection after `uds update` on Windows
  - Fixed in: `update.js` (4 locations), `check.js` (3 locations), `standards-installer.js` (1 location), `manifest-migrator.js` (1 location)

### Changed
- **CLI descriptions clarified**: `uds check` vs `uds audit`, `uds spec` descriptions updated to cross-reference related commands
- **UDS skill count**: 30 → 40 skills
- **AI tool integrations**: 12 → 14 tools

## [5.0.0-rc.15] - 2026-03-23

> **Release Candidate**: Fifteenth RC for v5.0.0 with Skills version detection fix, skill description standardization, and CHANGELOG timing correction.

### Fixed
- **Skills version detection** (SPEC-015): `checkNewFeatures()` now treats null `installedVersion` as outdated instead of skipping the check
- **Skills location derivation**: `manifest.skills.location` is now derived from `installations` array during update, preventing legacy/unknown fallback
- **Reminder multi-source detection**: Skills update reminder uses installations → location → file-system detection chain
- **Commands version detection**: Same null version fix applied to Commands outdated check
- **CHANGELOG timing** (SPEC-016): `checkin-standards.md` now correctly states CHANGELOG is updated at pre-release only, not per commit — aligned with `changelog-standards.md`

### Changed
- **Skill descriptions standardized**: All 30 installed skill descriptions unified to single-line `[UDS]` prefix format (Chinese translation)
- **zh-TW skill translations**: 26 locale source files synchronized with same format
- `/dev-workflow` description translated to Traditional Chinese

### Added
- **README Acknowledgments**: Added attribution section for 8 open-source inspiration sources (Superpowers, GSD, PAUL, CARL, CrewAI, LangGraph, OpenHands, DSPy)
- **Pre-release checklist**: Added skill description format check to `OPERATION-WORKFLOW.md` §9.1
- **Retroactive specs**: SPEC-015 (update skills version detection) and SPEC-016 (CHANGELOG timing correction)
- **Internal confidential docs directory**: `docs/internal/confidential/` excluded via `.gitignore`
- 跨產品整合策略文件：README.md 生態定位、CLAUDE.md 標準流向說明
- SPEC-008 新增 DevAP / VibeOps CLI 整合模式規劃（`--target devap/vibeops`）

## [5.0.0-rc.14] - 2026-03-19

> **Release Candidate**: Fourteenth RC for v5.0.0 with workflow enforcement architecture, i18n completeness, and DX improvements.

### Added
- **Workflow Enforcement Architecture** (SPEC-014): Four-layer enforcement system that transforms UDS workflows from documentation to execution
  - **P0 — AI-Level**: Pre-Flight Checks in `/sdd`, `/tdd`, `/bdd`, `/commit` skills; new `workflow-enforcement.ai.yaml` standard; all 11 AI agent integration templates updated
  - **P1 — CLI-Level**: `WorkflowGate` phase transition validator; `workflow-definitions.js` SDD/TDD/BDD phase graphs; session start workflow report
  - **P2 — Git-Level**: `check-workflow-compliance.sh` pre-commit warning (non-blocking); `check-commit-spec-reference.sh` commit-msg spec suggestion; new `commit-msg` husky hook
  - **P3 — DX-Level**: `uds check` workflow status display (summary + full mode); `/dev-workflow` context-aware start with phase→command mapping; `pre-release-check.sh` step 16 workflow compliance
- **Core Standard**: `core/workflow-enforcement.md` — machine-enforceable workflow gates with 3 enforcement modes (enforce/suggest/off)
- **i18n — Commands Translation Completeness**: 30 zh-TW + 31 zh-CN slash command translations; `check-translation-sync.sh` now verifies commands translation completeness
- **AC Coverage Assistant** skill and SPEC-AC-COVERAGE
- **Traditional Chinese commit type options** (`.standards/options/traditional-chinese.ai.yaml`)

### Fixed
- **Language Switch Bug**: `installSkillsToMultipleAgents` missing `locale` parameter in `config.js` — skills always installed in English regardless of language setting (affects both single-language and 'all' config flows)
- **i18n Description Prefix**: 7 translated command files missing `[UDS]` prefix in YAML frontmatter description field
- **Workflow Compliance Script**: Integer comparison error (`grep -c` multi-line output); dual path detection for `.workflow-state/` and `.standards/workflow-state/`
- **test_levels Migration**: Cover 5.0.0 pre-release versions in migration check

### Changed
- **Config Menu**: Flattened config menu, advanced settings hidden, test_levels migration
- **Pre-release Checks**: 17 → 18 steps (added workflow compliance check)
- **Standards Count**: 49 → 50 core standards (added workflow-enforcement)
- **Skills**: Regenerated as English locale baseline

## [5.0.0-rc.13] - 2026-03-18

> **Release Candidate**: Thirteenth RC for v5.0.0 with post-restore integration regeneration fix.

### Fixed
- **Post-restore Integration Regeneration**: Fix CLAUDE.md not being regenerated after restoring missing files during `uds update` — add `regenerateIntegrations()` call after post-update integrity check restore, covering both interactive and `--yes` modes

### Changed
- **Stats sync**: Update Core Standards count 36→41, AI Skills count 29→30 in README, locales, and uds-manifest.json

## [5.0.0-rc.12] - 2026-03-18

> **Release Candidate**: Twelfth RC for v5.0.0 with new core standards and error codes enhancement.

### Added
- **API Design Standards** (`core/api-design-standards.md`): New universal standard covering REST, GraphQL, and gRPC API design principles, versioning strategies, pagination, authentication patterns, rate limiting, and RFC 7807 error responses (938 lines)
- **Database Standards** (`core/database-standards.md`): New universal standard covering schema design, migration strategy, indexing, query optimization, transaction management, SQL vs NoSQL decision matrix, and sensitive data handling (828 lines)
- **Error Codes v1.2 — API Error Serialization**: RFC 7807 Problem Details format, GraphQL/gRPC error handling patterns, retry and idempotency guidance (+225 lines)
- **Commands README**: Added 9 missing commands and complete 34-command→skill/standard mapping table
- **AC Coverage command** (`/ac-coverage`): AC traceability matrix and coverage report generation
- **Retroactive Specs**: SPEC-STD-03 (API Design), SPEC-STD-04 (Database), SPEC-STD-05 (Error Codes v1.2)

### Changed
- **Logging YAML**: Synced to v1.2.0 with distributed-tracing and observability-pillars rules
- **Standards count**: 47 → 49 core standards

## [5.0.0-rc.11] - 2026-03-18

> **Release Candidate**: Eleventh RC for v5.0.0 with integrationConfigs fix and template reference path correction.

### Fixed
- **Empty integrationConfigs**: Fix `installIntegrations()` not returning `manifestIntegrationConfigs`, causing `uds update --sync-refs` to fail with empty `integrationConfigs: {}`
- **Stale Template References**: Replace 12 occurrences of `.standards/commit-message-guide.md` → `.standards/commit-message.ai.yaml` in integration generator templates and static integration files

## [5.0.0-rc.10] - 2026-03-17

> **Release Candidate**: Tenth RC for v5.0.0 with update command display fix, stale commandHashes cleanup, and E2E regression tests.

### Fixed
- **Options Display Path**: Fix `uds update` file list showing `.standards/unit-testing.ai.yaml` instead of `.standards/options/unit-testing.ai.yaml` — use `getStandardTargetDir()` for display
- **Stale commandHashes Cleanup**: Fix `uds update --commands` not removing old commandHashes entries for renamed/deleted commands — add `replaceCommandHashesForUpdatedAgents()` to clean stale entries before merging

### Added
- **E2E Regression Tests**: Add 2 regression tests for `uds update` — options display path verification, stale commandHashes cleanup after commands update

## [5.0.0-rc.9] - 2026-03-17

> **Release Candidate**: Ninth RC for v5.0.0 with E2E bug regression tests, options subdirectory fix, and pre-release workflow improvement.

### Added
- **E2E Bug Regression Tests**: Add 5 regression test cases for `uds update` — options subdirectory, extensions type safety, null source, user content preservation, block hash sync
- **Pre-release E2E Step**: Split pre-release check Step 16 into Unit Tests (Step 16) + E2E Tests (Step 17), total checks 16→17

### Fixed
- **Options Subdirectory**: Fix `uds update` installing options standards (e.g., `english.ai.yaml`) to `.standards/` instead of `.standards/options/` via new `getStandardTargetDir()` helper

### Changed
- **Skills Sync**: Sync documentation-guide to v2.1.0 (Diátaxis classification, LLM discovery, quality metrics), update methodology SDD phase, expand workflows documentation
- **Gemini Sync**: Align Gemini commands/skills manifests to rc.8, expand `sdd.toml` command

## [5.0.0-rc.8] - 2026-03-17

> **Release Candidate**: Eighth RC for v5.0.0 with Windows compatibility fix and CI stability improvement.

### Fixed
- **Windows NULL File**: Fix `/dev/null` redirects creating literal `NULL` file on Windows — add EXIT trap cleanup to 12 scripts and `.gitignore` safety net
- **Windows CI**: Fix `update-checker.test.js` path separator assertion failure on Windows by using `path.join` instead of hardcoded Unix paths

## [5.0.0-rc.7] - 2026-03-17

> **Release Candidate**: Seventh RC for v5.0.0 with auto update notification, documentation standards enhancement, and bug fixes.

### Added
- **Auto Update Notification**: CLI commands (`init`, `list`, `add`, `config`) now display update notices with 24-hour throttling cache (`~/.uds/update-check.json`)
- **AI Agent Version Check Rule**: New `version-check-on-uds-operation` rule in `context-aware-loading` — AI agents check npm for UDS updates on first slash command per conversation
- **Documentation Standards Enhancement**: Diátaxis classification, LLM-friendly guidelines, ADR deep-dive, and quality metrics for documentation standards

### Fixed
- **Manifest Extensions Handling**: Fix crash when `manifest.extensions` contains non-string items

### Changed
- **Maintenance Docs Consolidation**: Merge `MAINTENANCE.md` into `OPERATION-WORKFLOW.md` and archive outdated files

## [5.0.0-rc.6] - 2026-03-17

> **Release Candidate**: Sixth RC for v5.0.0 with 12 SDD/workflow improvements inspired by GSD, CrewAI, LangGraph, OpenHands, and DSPy.

### Added
- **Discuss Phase** (from GSD): New structured discussion stage before SDD proposal — captures gray areas, locks scope, builds `read_first` list
- **Verification Loop Cap** (from GSD): SDD verify phase capped at 3 iterations; forced human intervention after cap reached
- **Structured Task Definition** (new standard): 4 required fields (`read_first`, `action`, `acceptance_criteria`, `verification`) for AI task definitions
- **Workflow State Protocol** (new standard): `.workflow-state/` directory with YAML state files and append-only event logs for cross-session persistence
- **Wave-Based Execution** (from GSD): Optional `wave` field in methodology schema for parallel step grouping
- **Validation Pipeline** (from CrewAI/DSPy): Two-layer validation (deterministic + semantic) with fail-fast principle
- **Agent Signatures** (from DSPy): Optional `signatures` field for structured I/O contracts in agent definitions
- **Traceability Matrix** (from GSD): REQ→AC→Test→Implementation→Commit mapping during SDD verify phase
- **Context Budget Tracking** (from CrewAI/GSD): Context window awareness rules (60%/80% thresholds) in context-aware-loading
- **HITL Interrupt** (from LangGraph): New `interrupt` checkpoint intensity that pauses workflow and saves state
- **Agent Communication Protocol** (from LangGraph/CrewAI/GSD): Three-layer protocol (artifact passing, reducer patterns, context isolation)
- **Trace Validation** (from DSPy): Intermediate step quality verification across SDD workflow phases

### Changed
- **SDD Workflow**: Updated from 5 phases to 6 phases (Discuss → Proposal → Review → Implementation → Verification → Archive)
- **Core Standards Count**: Updated from 34 to 36 across all CLAUDE.md, GEMINI.md, and translations
- **Standards Index**: Added `structured-task-definition` and `workflow-state-protocol` to manifest.json, standards-registry.json, CLAUDE.md, GEMINI.md

## [5.0.0-rc.5] - 2026-03-16

> **Release Candidate**: Fifth RC for v5.0.0 with context-aware loading, spec tracking, and 4-layer testing pyramid.

### Added
- **Context-Aware Loading**: New `core/context-aware-loading.md` standard — 7 domain categories with always-on/on-demand loading mechanism (SPEC-012)
- **Workflow State Tracking**: `project-context-memory` adds `workflow-state` type for cross-session state persistence (SPEC-013)
- **AI-Driven Spec Tracking**: `/commit` now assesses spec needs for `feat`/`fix` commits; new `/sdd-retro` command for retroactive spec creation (SPEC-011)
- **Orphan Spec Detection**: `check-orphan-specs.sh/.ps1` detects specs stuck in non-terminal states (integrated into pre-release step 15)
- **4-Layer Testing Pyramid**: Upgrade from 3-layer (70/20/10) to 4-layer (70/20/7/3) with System Tests (ST) tier
- **Test Governance Standard**: New `test-governance` standard with quality goals, completion criteria, and environment management
- **Test Templates**: Add `test-plan-template.md` and `test-case-template.md` (ISO 29119-3 inspired)

### Fixed
- **Command Locale Support**: `uds update` now installs slash commands using project locale settings, with `detectLocaleFromStandards()` fallback (#7)
- **Dev-Workflow Registration**: Register `/dev-workflow` in `AVAILABLE_COMMANDS` and sync usage docs
- **Bilingual Commit Body**: Upgrade `bilingual-body` rule from recommended to required with 5-step structure guide

### Changed
- **Spec Reference Footer**: Generalize commit `Spec References` to `Custom Reference Footers` supporting SPEC/JIRA/FEATURE/RFC prefixes
- **SPEC-012 Cleanup**: Remove redundant `activation` fields, merge REQ-003/004, renumber ACs
- **SPEC-011 Cleanup**: Remove duplicate technical design sections, consolidate 6 requirements to 4

## [5.0.0-rc.4] - 2026-03-05

> **Release Candidate**: Fourth RC for v5.0.0 with new audit command, file placement guide, and skill inter-linking.

### Added
- **`uds audit` Command**: New CLI command for UDS health checks and feedback collection (`--health`, `--patterns`, `--friction`, `--report`)
- **File Placement Decision Guide**: New `core/guides/file-placement-guide.md` — master decision tree, reverse lookup index (30+ file types), code organization deep dive, development artifacts lifecycle
- **Source Code Organization Terminology**: Added utils/helpers/shared/lib/internal disambiguation to `project-structure.md`
- **Configuration Files Placement**: Added standard locations for tool configs, app configs, env vars, CI/CD, IaC
- **Generated Code Placement**: Added `src/generated/` standard with gitignore guidelines
- **Development Artifacts Directory**: Added `docs/working/` structure with lifecycle management (brainstorms, RFCs, investigations, POCs)
- **Expanded Document Types Matrix**: Complete file type → destination mapping in `documentation-structure.md`
- **Audit Assistant Skill**: New `/audit` skill with health check and feedback workflows
- **Skill Inter-linking**: Added `/audit` next-step suggestions to `/checkin`, `/review`, `/commit`, `/sdd`
- **Next Steps Guidance**: Added next-step suggestions to 17 existing skills

### Fixed
- **Config Display Language**: Fix `displayLanguage` not passed to config path
- **Skills Uninstaller Tests**: Fix tests accidentally deleting user-level directories
- **Package Name in Docs**: Fix incorrect package name references

### Changed
- **README Structure**: Extract pre-release info and add config/uninstall/methodology sections
- **SPEC-AUDIT-01**: Rewritten as user-oriented specification with brainstorm integration

## [5.0.0-rc.2] - 2026-02-13

> **Release Candidate**: Second RC for v5.0.0 with documentation improvements and CLI bug fixes.

### Fixed
- **Slash Command Deduplication**: Prevent duplicate skill installation when selecting multiple levels for the same agent
- **Update Command**: Detect and install new standards during `uds update`

### Changed
- **README Structure**: Restructure all READMEs into modular and AI-optimized format

## [5.0.0-rc.1] - 2026-02-12

> **Release Candidate**: This is the first RC for v5.0.0. All major features are complete; this release focuses on final validation before stable.

### Added
- **3-Dimension Reverse Engineering**: Evolve `/reverse` to full system archeology with Logic, Data, and Runtime dimensions (`/reverse spec`, `/reverse data`, `/reverse runtime`)

### Fixed
- **Skills Count**: Fix `sync-manifest.mjs` to count only directories with `SKILL.md` (was 32, now correctly 27)
- **Missing Command Registration**: Register `/brainstorm` in `AVAILABLE_COMMANDS` and skills README tables

### Changed
- **Workflow Visualization**: Expand Mermaid diagram in `WORKFLOW-ANALYSIS.md` with 3-dimension reverse engineering sub-nodes and data flow arrows

## [5.0.0-beta.12] - 2026-02-12

### Added
- **Workflow Prerequisite System**: New `workflow-prerequisites.yaml` registry and `prerequisite-check.md` AI behavior protocol for checking command prerequisites before execution
- **Workflow Analysis Document**: Comprehensive `docs/WORKFLOW-ANALYSIS.md` with process inventory, decision quick reference, and adoption roadmap
- **Workflow Gaps Tracker**: `docs/WORKFLOW-GAPS.md` tracking 12 identified gaps (CI/CD, incident response, etc.)
- **Cross-Command Handoff Guidance**: `/discover`, `/reverse`, `/derive`, `/release` now suggest logical next steps after completion
- **Doc Generation Tooling**: `scripts/sync-manifest.mjs` and `scripts/generate-docs.mjs` for automated README stats sync
- **`/brainstorm` Skill**: Structured AI-assisted ideation skill

### Changed
- **Documentation Sync**: Update all READMEs, MAINTENANCE.md, STANDARDS-MAPPING.md, FEATURE-REFERENCE.md with accurate counts (32 standards, 26 skills, 30 commands)
- **AI Tool Support Table**: Expanded to include Gemini CLI, Cursor, Cline/Roo Code, Windsurf with detailed feature support
- **Pre-release Checks**: Add Step 1.5 `docs:sync` to `pre-release-check.sh`
- **Skill Prerequisites**: `/derive` now declares `spec-approved` prerequisite; `/release` declares `release-check` prerequisite

## [5.0.0-beta.11] - 2026-02-11

### Added
- **Display Language Setting**: New `uds config` option to set UI display language independently from commit language

### Fixed
- **Language Resolution Bug**: Fix language detection fallback logic in `uds config` to correctly resolve display language
- **Release Scripts**: Fix README version update bugs in release scripts

### Changed
- **README**: Add beta installation guide and sync version display to 5.0.0-beta.10

## [5.0.0-beta.10] - 2026-02-11

### Added
- **Commit Language Directive**: Integration files now include commit message language instructions, ensuring AI tools always know the expected language even without `commit-message.ai.yaml`
- **Config i18n**: Trilingual translations (en/zh-tw/zh-cn) for vibe coding presets and config preferences UI

### Fixed
- **Config Language Detection**: `uds config` now auto-detects UI language from project manifest, matching `uds configure` behavior
- **Documentation Integrity**: Skip reference sync section when no Reference markers exist
- **Broken Links**: Fix 153 broken markdown links across 212 files

### Changed
- **Documentation Integrity Checker**: New script with 4 sub-checks for pre-release validation
- **Commands Sync Checker**: New script integrated into pre-release checks

## [5.0.0-beta.9] - 2026-02-10

### Added
- **Missing Command Files**: Create `changelog.md`, `checkin.md`, `discover.md`, `docgen.md` in `skills/commands/` for Gemini CLI TOML conversion
- **Register `/docs` and `/guide`**: Add to `AVAILABLE_COMMANDS` so all agents can discover these commands

### Changed
- **Daily Workflow Guide v1.1.0**: Add Phase 0 project discovery section, update decision tree with `/discover` entry point, add `/discover` + `/reverse` as prerequisites in Strategy 3, expand commands reference with `/discover`, `/reverse`, `/refactor`
- **Translations Synced**: zh-TW and zh-CN DAILY-WORKFLOW-GUIDE.md updated to v1.1.0

## [5.0.0-beta.8] - 2026-02-10

### Added
- **Deployment Standards**: New core standard for deployment workflows with cross-references (`core/deployment-standards.md`)
- **`/discover` Skill**: Phase 0 project assessment skill for evaluating project readiness
- **Skill Harvesting SDD**: Specification for systematic skill extraction from existing workflows

### Changed
- **`/spec` → `/sdd` Rename**: Renamed `/spec` skill to `/sdd` (Spec-Driven Development), added missing subcommands, synced zh-CN split architecture
- **SKILL.md Split Architecture**: Skills now use slim command reference + detailed guide structure
- **`uds configure` → `uds config`**: Merged `uds configure` into `uds config` as unified entry point

### Fixed
- **Integration File Preservation**: `uds update` now preserves user-customized content in integration files (AGENTS.md, .cursorrules, etc.)
- **Translation Source Paths**: Fixed 143 broken relative paths in zh-CN and zh-TW translation files
- **Pre-release Check Script**: `check-docs-sync.sh` now correctly skips `.claude-plugin/` version checks for beta releases
- **Scope Marker**: Fixed `project-context-memory.md` scope from `Project-Specific (Local)` to `uds-specific`

## [5.0.0-beta.7] - 2026-02-09

### Added
- **Project Context Memory (PCM)**: New core standard for capturing, retrieving, and enforcing project-specific context, architectural decisions, and domain knowledge (`core/project-context-memory.md`, `.standards/project-context-memory.ai.yaml`)
- **Developer Persistent Memory (DPM)**: Integration of developer persistent memory standard with Always-On Protocol delivery pipeline (`core/developer-memory.md`, `.standards/developer-memory.ai.yaml`)
- **Memory Adoption Strategy**: Architecture guide for memory system adoption in `docs/specs/system/`
- **Initial Project Context**: Bootstrap project context document in `.project-context/uds-architecture.md`

## [5.0.0-beta.6] - 2026-02-06

### Fixed
- **Init → Integration Standards Passthrough**: Fixed `init` command not passing `installedStandards` to integration installer, causing integration files to use hardcoded default categories
- **Integration Category Filtering**: Changed integration installer to filter requested categories against actually installed standards, preventing orphaned `Reference:` lines in generated files (AGENTS.md, GEMINI.md, .cursorrules, etc.)
- **AI YAML Format Recognition**: Added `.ai.yaml` format entries to `STANDARD_TO_CATEGORY` mapping so `uds check` correctly recognizes AI-optimized standard files
- **Cross-Format Reference Comparison**: Rewrote `compareStandardsWithReferences` to compare at category level, handling `.md` vs `.ai.yaml` format differences correctly

### Added
- **Regression Tests**: Added 7 targeted tests covering category filtering, `.ai.yaml` format support, and cross-format reference comparison

## [5.0.0-beta.5] - 2026-02-06

### Fixed
- **Commands Integrity Path Resolution**: Fixed `checkCommandsIntegrity` calling `getCommandsDirForAgent` without `level` parameter, causing all tracked commands to report as "missing"
- **i18n Skills Labels**: Removed hardcoded `.claude/` paths from `skillsProject`/`skillsGlobal` labels to support multi-agent display correctly
- **Command Installations Display**: Fixed `commands.installations` objects rendering as `[object Object]` instead of `agent: level` format
- **AGENTS.md Path Mapping**: Added missing `AGENTS.md → codex` mapping in `getToolFromPath` for OpenAI Codex CLI integration detection

### Added
- **Regression Tests**: Added 4 targeted regression tests covering all bug fixes above

## [5.0.0-beta.4] - 2026-02-06

### Fixed
- **Integration Installer Config Resolution**: Fixed `displayLanguage` and `skillsConfig` config resolution in integration installer
  - Now correctly resolves configuration values when generating AI tool integration files

### Added
- **Integration Content Matrix Tests**: Added comprehensive data-driven matrix tests for `generateIntegrationContent`
  - Covers all language × config combinations for integration content generation

## [5.0.0-beta.3] - 2026-02-06

### Fixed
- **Husky Init Fallback**: Added fallback `.husky` directory creation when `husky init` fails
  - Ensures pre-commit hooks are properly set up even in environments where `husky init` encounters errors

## [5.0.0-beta.2] - 2026-02-05

### Fixed
- **E2E Tests**: Updated config-flow tests for new config command JSON API
  - Config command now outputs JSON format instead of UI labels
  - Skipped UI language tests pending redesign

## [5.0.0-beta.1] - 2026-02-05

### Added
- **Marketplace Version Strategy**: Implemented stable-only update policy for `.claude-plugin/` files
  - Pre-release versions (alpha/beta/rc) no longer update marketplace files
  - Marketplace users only receive stable, tested releases
  - Enhanced `check-version-sync.sh` script with pre-release detection

### Fixed
- **Bundled Path Resolution**: Corrected paths for skills, agents, and workflows installers
  - Fixed `skills/claude-code/agents` → `skills/agents`
  - Fixed `skills/claude-code/workflows` → `skills/workflows`
  - Fixed `skills/claude-code` → `skills`
- **E2E Test Expectations**: Updated init-flow tests to match actual CLI output format
  - Level format: `Level: Level 3` instead of `Level: 3`
  - Removed non-existent integrations summary label

## [5.0.0-alpha.2] - 2026-02-04

### Added
- **Dual-Layer Architecture**: Introduced Physical Spec (validators) alongside Imagination Layer (guidelines)
- **Predictive Simulation**: Added `uds simulate` command to preview compliance checks
- **Auto-Healing**: Added `uds fix` command to automatically resolve violations
- **Agent-Ready API**: Added `--json` output mode for check, simulate, and fix commands
- **Pre-commit Integration**: `uds init` now automatically configures Husky hooks
- **Smart Locator**: Enhanced standard file resolution with fuzzy matching and internal ID verification

### Changed
- Upgraded `changelog`, `versioning`, `testing`, `security`, `code-review`, `commit-message`, `project-structure` to v2 format with physical specs

## [5.0.0-alpha.1] - 2026-01-29

### Changed
- **Core Standards Slimming (Token Optimization)**: Major refactoring to reduce AI context load
  - **Rules vs. Guides Separation**: Split massive standard files into concise "Rules" (for AI) and detailed "Guides" (for Humans/Reference)
  - **Methodology Relocation**: Moved pure methodology tutorials from `core/` to `methodologies/guides/`
  - **New Directory Structure**:
    - `core/`: Contains only actionable rules, checklists, and thresholds (< 10KB each target)
    - `core/guides/`: Contains detailed explanations, tutorials, and examples
    - `methodologies/guides/`: Contains full methodology guides (TDD, BDD, SDD, etc.)
  - **Significant Size Reductions**:
    - `testing-standards.md`: 141KB → 14KB (90% reduction)
    - `test-driven-development.md`: 54KB → ~1KB Stub (Moved to methodologies)
    - `git-workflow.md`: 38KB → ~8KB (Split)
    - Overall `core/` directory size reduced by ~75%

## [4.3.0-alpha.1] - 2026-01-26

> ⚠️ **Alpha Release**: This is an internal validation release for local testing. Not recommended for production use.

### Changed
- **Methodology Refactoring**: Major separation of SDD from TDD/BDD/ATDD family
  - SDD (Spec-Driven Development, 2025) is now positioned as independent AI-era methodology
  - TDD/BDD/ATDD (1999-2011) classified as Traditional Development Methodologies
  - Removed incorrect "ATDD → SDD → BDD → TDD" sequence from all documents
  - Added Methodology Classification section to TDD, BDD, and ATDD standards
  - Based on literature research: GOOS (Freeman & Pryce), Thoughtworks, Martin Fowler

- **SDD Enhancements** (v2.0.0):
  - Added SDD as Independent Methodology section with historical context
  - Added SDD Maturity Levels (Spec-first, Spec-anchored, Spec-as-source) based on Martin Fowler 2025
  - Added Common Pitfalls section with industry warnings
  - Added Validation Layer section with theoretical foundation (Design by Contract, Contract Testing)
  - Added SDD + Testing Integration Model with practical workflow
  - Added new references: Thoughtworks, GitHub spec-kit, InfoQ, Specmatic

- **Forward Derivation Enhancements** (v1.1.0):
  - Added contract.json output format for contract verification
  - Added schema.json output format for schema validation
  - Added `/derive-contracts` command for verification artifact generation

- **Traditional Methodology Updates**:
  - TDD (v1.2.0): Added Methodology Classification, replaced Integration Pyramid with Double-Loop TDD (GOOS)
  - BDD (v1.1.0): Added Methodology Classification, Double-Loop TDD explanation, Collaborative Acceptance
  - ATDD (v1.1.0): Added Methodology Classification, ATDD as optional collaboration, Two-approach comparison

- **Test Completeness Dimensions**: Updated from 7 dimensions to 8 dimensions
  - Added dimension 8: AI Test Generation Quality (mutation testing, assertion depth, test purpose)
  - Updated skills, AI YAML, and integrations to reflect 8-dimension framework
- **Anti-Hallucination Standards**: Added Unified Tag System
  - Certainty Tags: For analyzing existing content (`[Confirmed]`, `[Inferred]`, `[Assumption]`, `[Unknown]`, `[Need Confirmation]`)
  - Derivation Tags: For generating new content (`[Source]`, `[Derived]`, `[Generated]`, `[TODO]`)
  - Workflow mapping specifies which tag category applies to each workflow type

### Documentation
- Updated skills for Phase 1-4 consistency synchronization:
  - `test-coverage-assistant`: 7→8 dimensions
  - `ai-collaboration-standards`: Added Unified Tag System
  - `reverse-engineer`: Added Unified Tag System reference
  - `forward-derivation`: Added Unified Tag System reference
- Updated AI standards (YAML):
  - `test-completeness-dimensions.ai.yaml`: Added dimension 8
  - `anti-hallucination.ai.yaml`: Added Unified Tag System with workflow mapping
- Updated integrations:
  - `github-copilot/copilot-instructions.md`: 7→8 dimensions

## [4.2.0] - 2026-01-24

### Added
- **CLI Specifications**: Published 31 CLI specification documents as Stable
  - Agent command specifications (2 docs): Overview, Installation
  - Workflow command specifications (2 docs): Overview, Installation
  - AI-Context command specifications (2 docs): Overview, Config Generation
  - Init command specifications (4 docs): Overview, Project Detection, Configuration Flow, Execution Stages
  - Check command specifications (4 docs): Overview, Integrity Checking, Status Display, Restore Operations
  - Update command specifications (4 docs): Overview, Version Checking, Standards Update, Feature Detection
  - Configure command specifications (3 docs): Overview, Option Types, AI Tools Management
  - Shared module specifications (7 docs): Manifest Schema, File Operations, Hash Tracking, Integration Generation, Skills Installation, AI Agent Paths, Prompts
  - List command specification (1 doc)
  - Skills command specification (1 doc)

### Changed
- **AI Agent Paths**: Updated configurations to match official vendor documentation (2026-01-24)
  - Cline: Path corrected from `.cline/` to `.clinerules/` per [official docs](https://docs.cline.bot/features/slash-commands/workflows)
  - Windsurf: Added workflows support with `.windsurf/rules/` path per [official docs](https://docs.windsurf.com/windsurf/cascade/workflows)
  - Gemini CLI: Added `commandFormat: 'toml'` field to document TOML format requirement
  - GitHub Copilot: Marked `commands.user` as unsupported (VS Code IDE only)

### Fixed
- **CLI**: `promptCommandsInstallation` now gracefully handles agents with `commands.user: null`
  - Skips user-level option for agents that don't support it (e.g., GitHub Copilot CLI)

### Documentation
- **Claude Code Skills/Commands merger note**: Added documentation explaining that Claude Code v2.1.3+ has merged slash commands and skills
  - Both `.claude/commands/review.md` and `.claude/skills/review/SKILL.md` create `/review`
  - Existing commands files continue to work
  - Other AI tools (OpenCode, Roo Code, Gemini CLI) still use traditional commands format
- **New Specification**: Added [SHARED-07] AI Agent Paths Update specification (`docs/specs/cli/shared/ai-agent-paths-update.md`)

## [4.1.0] - 2026-01-21

### Added
- **Refactoring Standards v2.0**: Enhanced with industry best practices
  - Tactical strategies: Preparatory Refactoring (Kent Beck), Boy Scout Rule (Robert C. Martin)
  - Strategic strategies: Anti-Corruption Layer (Eric Evans/DDD)
  - Decision Matrix Summary for quick strategy selection
- **New `/refactor` command**: Interactive refactoring assistant with decision tree
  - `/refactor decide` - Run refactor vs. rewrite decision tree
  - `/refactor tactical` - Suggest daily refactoring strategies
  - `/refactor strategic` - Guide architectural refactoring
  - `/refactor legacy` - Legacy code safety strategies
- **AI Tool Integrations**: Refactoring guidance for non-Claude Code tools
  - GitHub Copilot Chat prompt templates
  - Cursor/Windsurf rules sections
  - Gemini CLI guidelines

### Changed
- **Refactoring Standards**: Reorganized into three-tier classification
  - Tactical (daily, minutes-scale operations)
  - Strategic (architectural, weeks-months scale)
  - Safety (legacy code protection)
- **Registry**: `refactoring-standards` upgraded from "reference" to "skill" category with `refactoring-assistant` skill mapping

### Documentation
- Updated zh-TW translations for refactoring standards (v2.0.0)
- Updated zh-CN translations for refactoring standards (v2.0.0)
- New command translations: `/refactor` in zh-TW and zh-CN
- Updated AI-optimized YAML format for refactoring standards

---

## [4.0.0] - 2026-01-20

### Highlights

**Bidirectional Derivation System**: v4.0 introduces a complete spec-code lifecycle management system:
- **Forward Derivation**: Generate BDD/TDD/ATDD artifacts from SDD specifications
- **Reverse Engineering**: Extract specifications from existing code
- Together they form a bidirectional derivation cycle for maintaining spec-code consistency

### Added
- **6 New Core Standards**:
  - `behavior-driven-development.md` - BDD methodology and standards
  - `acceptance-test-driven-development.md` - ATDD methodology and standards
  - `reverse-engineering-standards.md` - Reverse engineering standards
  - `forward-derivation-standards.md` - Forward derivation standards
  - `ai-instruction-standards.md` - AI instruction writing standards
  - `refactoring-standards.md` - Refactoring standards and patterns
- **8 New Skills** (23 total):
  - `forward-derivation/` - Forward derivation commands (`/derive-bdd`, `/derive-tdd`, `/derive-atdd`, `/derive-all`)
  - `reverse-engineer/` - Enhanced reverse engineering (`/reverse-sdd`, `/reverse-bdd`, `/reverse-tdd`)
  - `bdd-assistant/` - BDD workflow assistant (`/bdd`)
  - `atdd-assistant/` - ATDD workflow assistant (`/atdd`)
  - `methodology-system/` - Methodology selection (`/methodology`)
  - `refactoring-assistant/` - Refactoring assistant
  - `checkin-assistant/` - Check-in assistant
  - `commands/` - Slash commands collection (`/checkin`, `/methodology`, etc.)
- **CLI Enhancements**:
  - Per-tool level selection (User Level or Project Level per AI tool)
  - `--debug` flag for troubleshooting
  - Declined features memory
  - Enhanced file integrity tracking
  - Commands installation path support for Claude Code

### Changed
- **Methodology System**: Now production-ready (previously experimental 🧪)
  - TDD/BDD/SDD/ATDD workflows fully integrated
  - Removed experimental flags
- **CLI**: Unified prompt format for Skills and Commands installation
- **Documentation**: Synced terminology across all components

### Fixed
- Marketplace detection reliability
- YAML frontmatter syntax in localized skills

---

## [4.0.0-beta.2] - 2026-01-20

### Added
- **CLI**: Claude Code Commands path support (`ai-agent-paths.js`)
  - Added `commands.project` and `commands.user` paths for Claude Code
  - Enables Commands installation to Claude Code

### Fixed
- **CLI**: Marketplace detection now only trusts actual installation status
  - Previously trusted both manifest record and actual status (could be stale)
  - Now checks `marketplaceInfo?.installed === true` instead of manifest `skills.location`
  - Fixes issue where stale manifest could cause incorrect marketplace detection
- **Skills**: YAML frontmatter syntax error in `argument-hint` field
  - Square brackets `[]` need to be quoted in YAML to avoid array interpretation
  - Fixed in `locales/zh-TW/` and `locales/zh-CN/` for `methodology.md` and `bdd.md`

## [4.0.0-beta.1] - 2026-01-19

### Added
- **Core Standard**: Forward Derivation Standards (`core/forward-derivation-standards.md`)
  - Derives BDD scenarios, TDD test skeletons, and ATDD acceptance tests from approved SDD specs
  - Complements Reverse Engineering to form bidirectional derivation system
  - Strict 1:1 AC mapping with anti-hallucination compliance
  - Certainty framework: `[Source]`, `[Derived]`, `[Generated]`, `[TODO]` tags
- **Skill**: Forward Derivation skill for Claude Code (`skills/forward-derivation/`)
  - New commands: `/derive-bdd`, `/derive-tdd`, `/derive-atdd`, `/derive-all`
  - Multi-language support: TypeScript, Python, Java, Go
  - AC Parser with Given-When-Then and bullet format support
- **Specification**: Core Standard Creation Workflow (`docs/specs/system/core-standard-workflow.md`)
  - Defines 8-phase workflow for creating/updating core standards
  - File checklist and skill applicability matrix
  - CLI integration requirements and verification checkpoints
- **CLI**: Per-tool level selection for Commands installation
  - Commands now use `{agent, level}` format (consistent with Skills)
  - User can choose User Level or Project Level per AI tool
  - Project Level checked by default

### Changed
- **CLI**: Unified prompt format for Skills and Commands installation
  - Both use multiSelect with per-tool User/Project level options
  - `update` command now uses same prompts as `init` for consistency
- **Documentation**: Slash commands synced with CLI terminology
  - Adoption levels: Essential/Recommended/Enterprise → Starter/Professional/Complete
  - Standards scope: Minimal/Full → Lean/Complete
  - Content mode: Index → Standard
  - Skills/Commands installation: Simple list → Per-tool multiSelect

### Documentation
- Updated `core/spec-driven-development.md` with Forward Derivation integration section
- Updated AI YAML files for Forward Derivation and SDD standards

## [3.5.1-beta.22] - 2026-01-19

### Added
- **CLI**: New `--debug` flag for `uds update` command
  - Shows detailed debug output for Skills/Commands detection
  - Helps diagnose why certain AI tools may not appear in installation prompts
  - Outputs: aiTools list, declined features, config checks, installation status

## [3.5.1-beta.21] - 2026-01-19

### Fixed
- **CLI**: Skills installation now works correctly with `--skills-location` option
  - Bug fix: Changed property name from `location` to `level` to match `installSkillsToMultipleAgents` API
  - Previously reported success but no files were created

## [3.5.1-beta.20] - 2026-01-19

### Added
- **CLI**: New `--skills-location` option for `uds configure` command
  - Allows specifying Skills installation level (project/user) in non-interactive mode
  - Example: `uds configure --type skills --ai-tool opencode --skills-location user`

### Changed
- **Commands**: `/update` Step 4 rewritten with multi-stage AskUserQuestion flow
  - Step 4a: Detect missing Skills
  - Step 4b: Ask which AI tools to install (multiSelect)
  - Step 4c: Ask installation location (project/user)
  - Step 4d-e: Similar flow for Commands
  - Addresses AskUserQuestion option limit (max 4) constraint

### Documentation
- **Commands**: `/config` command updated with `--skills-location` option examples

## [3.5.1-beta.19] - 2026-01-19

### Fixed
- **Skills**: Sync slash commands with CLI behavior
  - `/update`: Add declined features handling, outdated Skills update flow, project/user level selection, checkbox multi-select interface
  - `/init`: Align step order with CLI (AI Tools → Skills → Commands → ...), expand to 9 AI tools, add missing configuration steps
  - `/config`: Add skills/commands config types, `--ai-tool` option for non-interactive installation, declined features handling
  - `/check`: Add Interactive mode documentation, Skills/Commands integrity checks, remove obsolete manual verification steps

## [3.5.1-beta.18] - 2026-01-19

### Added
- **CLI**: Remember declined Skills/Commands choices
  - New `declinedFeatures` field in manifest stores declined items
  - `uds update` excludes previously declined Skills/Commands from prompts
  - `uds configure` shows declined items with option to reinstall
  - Supports both Skills and Commands tracking independently
- **CLI**: Dynamic Marketplace installation detection
  - `uds check` dynamically detects Marketplace Skills regardless of manifest
  - `uds configure` shows Marketplace status in Skills configuration
  - `uds update` shows "(already via Marketplace)" hint for Claude Code
  - Default unchecked for file-based installation when Marketplace detected
  - Adds coexistence note: file-based and Marketplace can work together

## [3.5.1-beta.17] - 2026-01-18

### Added
- **CLI**: Smart apply feature for `uds config` command
  - Auto-prompts to regenerate integration files after config changes
  - New `--yes` flag for non-interactive config changes
  - Extracted `regenerateIntegrations()` as reusable function from update.js
- **CLI**: Auto-sync mechanism for E2E test specification
  - New `npm run generate:e2e-spec` script generates E2E-TEST-CASES.md from test files
  - `--check` mode for CI verification that spec is up-to-date
  - Parses test files to extract describe/it blocks and CLI options
- **CLI**: Enhanced file tracking system for Skills, Commands, and Integration blocks
  - New `skillHashes` field in manifest tracks individual skill file integrity
  - New `commandHashes` field in manifest tracks slash command file integrity
  - New `integrationBlockHashes` field tracks UDS marker block content separately from user customizations
  - `uds check` now verifies integrity of Skills, Commands, and Integration UDS blocks
  - Users can modify content outside UDS markers without triggering warnings
- **Utils**: New hash computation functions in `hasher.js`
  - `computeIntegrationBlockHash()`: Computes hash for UDS marker block content only
  - `compareIntegrationBlockHash()`: Compares block hash, detects if markers removed
  - `computeDirectoryHashes()`: Recursively computes hashes for all files in directory
- **Tests**: Comprehensive E2E test coverage
  - 73 E2E tests across 6 commands (init, config, check, update, list, skills)
  - E2E-TEST-CASES.md specification document with option coverage matrix

### Changed
- **CLI**: Manifest version upgraded to `3.3.0` to mark enhanced file tracking feature
- **CLI**: `writeIntegrationFile()` now returns `blockHashInfo` with UDS block hash
- **CLI**: `installSkillsForAgent()` and `installCommandsForAgent()` now return `fileHashes`
- **CLI**: `installSkillsToMultipleAgents()` and `installCommandsToMultipleAgents()` aggregate hashes in `allFileHashes`

### Fixed
- **CLI**: Integration file path now returns relative path for manifest consistency
- **CLI**: `uds check` now tracks all installed standards correctly

## [3.5.1-beta.16] - 2026-01-16

### Added
- **Commands**: Add Skills verification diagnostics to `/check` command
  - Shows actual directory contents for each AI tool
  - Helps identify false positives in Skills installation reporting
  - Add `Bash(ls:*)` to allowed-tools

### Fixed
- **Commands**: `/update` now shows specific version type (Alpha/Beta/RC)
  - Option displays "更新至 Beta" instead of generic "更新至 Pre-release"
  - Includes stability indicators (🔴🟡🟢) in descriptions

## [3.5.1-beta.15] - 2026-01-16

### Added
- **Commands**: Add pre-release version types explanation to `/update` command
  - New section explains alpha, beta, rc stability levels (🔴🟡🟢)
  - Includes version comparison: `alpha < beta < rc < stable`
  - Links to `core/versioning.md` for detailed standards

## [3.5.1-beta.14] - 2026-01-16

### Fixed
- **Commands**: `/update` now shows correct version type in AskUserQuestion
  - Stable versions show "latest stable version X.Y.Z"
  - Pre-release versions show "pre-release version X.Y.Z-tag.N"
  - Fixes misleading "stable version 3.5.1-beta.13" description

## [3.5.1-beta.13] - 2026-01-16

### Changed
- **Commands**: Slash commands now use `AskUserQuestion` for interactive prompts
  - `/update` Step 4: Asks user to select Skills/Commands installation options
  - `/init` Step 3: Asks user to select AI tools for Skills/Commands installation
  - Design principle: "CLI prompts should be mirrored in slash commands"

### Added
- **CLI**: New `--ai-tool` option for `uds configure` command
  - Enables non-interactive Skills/Commands installation for specific tools
  - Usage: `uds configure --type skills --ai-tool claude-code`
  - Supports: claude-code, opencode, copilot, gemini-cli, roo-code, cursor, windsurf, cline, codex

## [3.5.1-beta.12] - 2026-01-16

### Changed
- **Commands**: Update `/update` command documentation
  - Reflects CLI's automatic Skills/Commands installation in Step 4
  - Adds `uds configure` to allowed-tools for non-TTY fallback
  - Documents checkbox multi-select interface for AI tool selection
  - Provides `uds configure` commands for non-TTY environments

## [3.5.1-beta.11] - 2026-01-16

### Changed
- **CLI**: `check` command is now read-only
  - No longer prompts to install missing Skills/Commands
  - Shows hint: "Run `uds update` to install missing Skills/Commands"
  - Follows single responsibility principle: check reports, update installs

### Removed
- **CLI**: Removed installation prompt from `check` command
  - `promptSkillsCommandsInstallation()` function removed
  - Unused imports cleaned up

## [3.5.1-beta.10] - 2026-01-16

### Fixed
- **Commands**: Quote `argument-hint` values in YAML frontmatter
  - Fixes YAML parsing error in OpenCode and other strict YAML parsers
  - Square brackets in values now properly quoted
  - Affected 16 command files
- **CLI**: Add TTY check before showing interactive prompts in check command
  - Prevents "ERR_USE_AFTER_CLOSE: readline was closed" error
  - Check command now only prompts when stdin/stdout are TTY
  - Fixes crash when running from non-interactive environments (e.g., Claude Code skills)

## [3.5.1-beta.9] - 2026-01-16

### Changed
- **CLI**: Skills/Commands installation now uses checkbox multi-select instead of yes/no
  - `uds update`: Users can now select specific AI tools to install Skills/Commands for
  - `uds check`: Added installation prompt for missing Skills/Commands after status display
  - All options default to checked (opt-out behavior)
  - Skip option available with validation

### Added
- **i18n**: New message keys for checkbox prompts in English, Traditional Chinese, and Simplified Chinese
  - `selectSkillsToInstall`, `selectCommandsToInstall`
  - `skipSkillsInstallation`, `skipCommandsInstallation`
  - `skipValidationError`

## [3.5.1-beta.8] - 2026-01-16

### Fixed
- **CLI**: Empty skills directory no longer detected as installed
  - `getInstalledSkillsInfoForAgent` now checks for actual `SKILL.md` files
  - `uds update` Step 4 correctly prompts to install Skills for OpenCode, GitHub Copilot, etc.
  - Resolves issue where empty `.claude/skills/`, `.github/skills/`, `.opencode/skills/` directories were falsely reported as having skills installed

### Added
- **Tests**: 2 new unit tests for empty directory detection
  - Tests empty skills directory returns `null`
  - Tests skills directory with empty subdirectories returns `null`

## [3.5.1-beta.7] - 2026-01-16

### Fixed
- **CLI**: Non-interactive mode (`--yes`) now correctly saves configuration to manifest
  - `aiTools` field now populated with detected AI tools (was empty `[]`)
  - `options` field now saves workflow, merge strategy, commit language, test levels (was all `null`)
  - Commands auto-installed for agents that support file-based commands (opencode, copilot, etc.)

### Added
- **Docs**: Testing Workflow section in CLAUDE.md
  - Documents when to run tests (development, pre-commit, pre-PR, CI/CD)
  - Lists git hook automated checks
  - Provides manual testing command reference
- **Tests**: 11 new tests for non-interactive mode bug fixes
  - 8 unit tests in `init.test.js`
  - 3 E2E tests in `init-flow.test.js`

## [3.5.1-beta.6] - 2026-01-16

### Fixed
- **CLI**: Skills and Commands now properly bundled in npm package
  - Added `skills/` to `prepack.mjs` bundle directories
  - `skills-installer.js` now prioritizes bundled path over development path
  - Resolves issue where "Installed commands for X AI tools" showed success but directories were empty
- **CLI**: Registered `--skills` and `--commands` options in update command
  - Options were implemented in code but not exposed to users
  - `uds update --skills` and `uds update --commands` now work correctly

## [3.5.1-beta.5] - 2026-01-16

### Changed
- **Skills**: `/update` slash command now prompts for Skills/Commands installation
  - Added Step 4 to check if Skills/Commands are installed after update
  - Uses AskUserQuestion to prompt user for installation
  - Ensures consistent behavior with CLI interactive mode

## [3.5.1-beta.4] - 2026-01-16

### Added
- **CLI**: New feature detection during update
  - `uds update` now detects AI tools in manifest that haven't installed Skills/Commands
  - Interactive mode prompts users to install missing features
  - `--yes` mode shows a hint instead of auto-installing (conservative behavior)
  - Supports all skills-compatible tools: Claude Code, OpenCode, Cursor, Copilot, etc.

## [3.5.1-beta.3] - 2026-01-16

### Fixed
- **CLI**: npm package now bundles standard files
  - Added `prepack` script to bundle `core/` and `locales/` directories
  - New `getSourcePath()` function prioritizes bundled files over GitHub download
  - Resolves 404 errors when updating standards via npm-installed CLI
  - Improved error messages for file download failures

## [3.5.1-beta.2] - 2026-01-16

### Added
- **Scripts**: Documentation sync check for pre-release
  - New `check-docs-sync.sh/.ps1` scripts
  - Validates CHANGELOG.md has entry for current version
  - Verifies version sync in plugin.json, marketplace.json, README.md
  - Provides reminder list for docs that may need updating
  - Pre-release check now runs 8 checks (7 with --skip-tests)

### Removed
- **Skills**: Deprecated installation scripts
  - Removed `skills/install.sh` and `install.ps1`
  - Removed `scripts/check-install-scripts-sync.sh` and `.ps1`
  - Plugin Marketplace is now the primary installation method

### Changed
- **Docs**: Updated all documentation to use Plugin Marketplace installation
  - Updated README.md (en, zh-TW, zh-CN)
  - Updated all adoption guides and checklists
  - Updated skills README files

## [3.5.1-beta.1] - 2026-01-15

### Added
- **CLI**: Multi-Agent Skills Installation
  - Support installing Skills to multiple AI agents simultaneously
  - Checkbox selection for target agents (Claude Code, OpenCode, Cline, Roo Code, etc.)
  - User-level and project-level installation paths for each agent
- **CLI**: Gemini CLI TOML Command Conversion
  - Auto-convert markdown commands to TOML format for Gemini CLI
  - Support `{{args}}` placeholder for command arguments
  - Proper TOML string escaping
- **CLI**: Slash Commands Installation
  - Install commands to agents that support them (OpenCode, Roo Code, Copilot, Gemini CLI)
  - `uds update --skills` and `uds update --commands` options
- **CLI**: Centralized AI Agent Path Configuration
  - New `src/config/ai-agent-paths.js` module
  - Unified path management for all 10 supported AI agents
- **Tests**: Comprehensive unit tests
  - `ai-agent-paths.test.js` (29 tests)
  - `skills-installer.test.js` (23 tests)
  - Total: 400 tests passing

### Changed
- **Docs**: Updated AI-AGENT-ROADMAP.md to v2.2.0
  - Added Multi-Agent Installation and Gemini CLI TOML to Feature Enhancement Roadmap
- **Docs**: Updated CLI-INIT-OPTIONS.md to v3.5.1
  - New multi-agent Skills installation section
  - Updated Skills paths table for all agents
- **Docs**: Updated README.md
  - New AI Tool Extensions table with Skills and Commands columns
  - Added Multi-Agent Skills and Gemini CLI TOML to What's New

## [3.5.0] - 2026-01-15

### Added
- **i18n**: Complete internationalization support
  - Simplified Chinese (zh-CN) localization for all 18 core standards, 20+ skills, adoption guides
  - CLI i18n: `--ui-lang` option (`en`, `zh-tw`, `zh-cn`, `auto`)
  - All 6 CLI commands and 8 interactive prompts support 3 languages
  - Environment variable detection (`LANG`, `LC_ALL`)
- **Methodology System** `[Experimental]`: Development methodology support
  - Built-in methodologies: TDD, BDD, SDD, ATDD
  - YAML-based definitions with JSON Schema validation
  - `/methodology`, `/tdd`, `/bdd` commands with phase tracking
  - CLI integration in `uds init` and `uds configure` (requires `-E` flag)
- **CLI**: Enhanced AI tool integration
  - Support 9 AI tools: Claude Code, Cursor, Windsurf, Cline, GitHub Copilot, Google Antigravity, OpenAI Codex, Gemini CLI, OpenCode
  - Content mode selection: `full`, `index` (recommended), `minimal`
  - Auto-generate Standards Compliance Instructions and Standards Index
- **CLI**: Enhanced commands
  - `uds configure`: AI Tools, Adoption Level, Content Mode options
  - `uds update`: `--integrations-only`, `--standards-only`, `--sync-refs`, `--beta` flags
  - `uds check`: AI Tool Integration Status, Reference Sync Status, Marketplace Skills version detection
  - `uds init/configure`: `-E, --experimental` flag for experimental features
- **Skills**: New `/config` slash command for standards configuration
- **Skills**: Interactive mode with AskUserQuestion for `/init`, `/config`, `/update`
- **Core**: New `ai-instruction-standards.md` (18th core standard)
- **Docs**: Windows PowerShell support for all adoption guides (33 files)
- **Docs**: Comprehensive CLI init options guide (`docs/CLI-INIT-OPTIONS.md`)
- **Docs**: Usage modes comparison (`docs/USAGE-MODES-COMPARISON.md`)
- **Docs**: 18 human-readable markdown files for `options/` directory
- **Docs**: LOCALIZATION-ROADMAP.md for future 10-language expansion
- **Scripts**: Unified pre-release check (`scripts/pre-release-check.sh`)
- **Scripts**: Standards consistency check (`scripts/check-standards-sync.sh`)
- **Scripts**: Version sync check (`scripts/check-version-sync.sh`)
- **CI**: Pre-release validation in GitHub Actions publish workflow

### Changed
- **CLI**: Manifest version upgraded to 3.2.0
  - New `fileHashes` field for integrity checking
  - New `integrationConfigs` field for integration settings
- **CLI**: Improved interactive prompt descriptions with bilingual support
- **CLI**: Integration files use index mode by default
- **Skills**: Slash command descriptions simplified to English-only
- **Skills**: Update install scripts to include methodology-system (16 skills total)

### Fixed
- **CLI**: Windows path separator issue in untracked file detection
- **CLI**: `require()` error in ES Module (init.js)
- **CLI**: Skills version detection showing stale version
- **CLI**: Version mismatch in `standards-registry.json`
- **CLI**: Missing AI tool detection (now detects all 9 tools)
- **CLI**: Registry references for `.ai.yaml` files in Compact format

### Removed
- **CLI**: Untracked file scanning from `uds check`

## [3.4.2] - 2026-01-08

### Fixed
- **Plugin**: Sync version numbers across all configuration files
  - `.claude-plugin/plugin.json`: 3.3.0 → 3.4.2
  - `.claude-plugin/marketplace.json`: 3.3.0 → 3.4.2
  - `.claude-plugin/README.md`: 3.2.0 → 3.4.2
  - `adoption/standards-registry.json`: 3.2.0 → 3.4.2
- **Plugin**: Fix `adoption/standards-registry.json` still referencing deprecated `universal-dev-skills` repo
  - Now correctly points to `skills` in main repository

## [3.4.1] - 2026-01-08

### Fixed
- **CLI**: Fix `uds update` suggesting downgrade from newer versions
  - Added proper semantic version comparison with prerelease support (alpha/beta/rc)
  - Now correctly identifies when current version is newer than registry version
  - Shows informative message when user has a newer version than the registry
- **CLI**: Update `standards-registry.json` versions to match package.json

## [3.4.0] - 2026-01-08

### Added
- **CLI**: Hash-based file integrity checking for `uds check`
  - Detects modified files by comparing SHA-256 hashes
  - New options: `--diff`, `--restore`, `--restore-missing`, `--no-interactive`, `--migrate`
  - Interactive mode: prompts for action when issues detected (view diff, restore, keep, skip)
  - Legacy manifest migration: `uds check --migrate` upgrades to hash-based tracking
- **CLI**: File hashes stored in manifest (version 3.1.0)
  - `uds init` computes and stores file hashes at installation
  - `uds update` recomputes hashes after updating files
- **Utils**: New `hasher.js` utility module for SHA-256 file hashing

### Changed
- **CLI**: Manifest version upgraded from 3.0.0 to 3.1.0
  - New `fileHashes` field tracks file integrity
  - Backward compatible with legacy manifests

### Fixed
- **CLI**: Fix `uds check` incorrectly showing "Skills marked as installed but not found" warning
  - Now correctly recognizes Plugin Marketplace installation paths (`~/.claude/plugins/cache/`)
- **CLI**: Fix `uds update` command failing with "undefined" errors
  - Added missing `await` for async `copyStandard()` and `copyIntegration()` calls

## [3.3.0] - 2026-01-08

### Added
- **Skills**: Add 9 slash commands for manual workflow triggers
  - `/commit` - Generate conventional commit messages
  - `/review` - Perform systematic code review
  - `/release` - Guide through release process
  - `/changelog` - Update CHANGELOG.md
  - `/requirement` - Write user stories and requirements
  - `/sdd` - Create specification documents
  - `/tdd` - Test-Driven Development workflow
  - `/docs` - Create/update documentation
  - `/coverage` - Analyze test coverage
- **Core**: Add Test-Driven Development (TDD) standard
  - New `core/test-driven-development.md` covering Red-Green-Refactor cycle
  - SDD + TDD integration workflow guidance
- **Skills**: Add `tdd-assistant` skill for Claude Code (skill #15)

### Changed
- **Skills**: Simplify slash command format from `/uds:xxx` to `/xxx`
  - Remove `uds:` namespace prefix for cleaner command invocation
- **Plugin Marketplace**: Rename marketplace from `universal-dev-standards` to `asia-ostrich`
  - New install command: `/plugin install universal-dev-standards@asia-ostrich`

### Fixed
- **CLI**: `uds skills` now prioritizes new `@asia-ostrich` marketplace
- **CLI**: Add `tdd-assistant` to standards-registry.json

### Migration
If you installed via the old marketplace name, please migrate:

```bash
/plugin uninstall universal-dev-standards@universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.5] - 2026-01-07

### Added
- **Skills**: Add 9 slash commands for manual workflow triggers
  - `/commit` - Generate conventional commit messages
  - `/review` - Perform systematic code review
  - `/release` - Guide through release process
  - `/changelog` - Update CHANGELOG.md
  - `/requirement` - Write user stories and requirements
  - `/sdd` - Create specification documents
  - `/tdd` - Test-Driven Development workflow
  - `/docs` - Create/update documentation
  - `/coverage` - Analyze test coverage
  - Commands vs Skills: Commands are manually triggered (`/command`), Skills are automatic (context-based)

### Fixed
- **CLI**: `uds skills` now prioritizes new `@asia-ostrich` marketplace
  - Adds migration notice when legacy `@universal-dev-standards` marketplace is detected
  - Ensures compatibility during migration period

## [3.3.0-beta.4] - 2026-01-07

### Changed
- **Plugin Marketplace**: Rename marketplace from `universal-dev-standards` to `asia-ostrich`
  - New install command: `/plugin install universal-dev-standards@asia-ostrich`
  - This provides better brand consistency with the AsiaOstrich organization

### Migration
If you installed via the old marketplace name, please migrate:

```bash
# 1. Uninstall old version
/plugin uninstall universal-dev-standards@universal-dev-standards

# 2. Install new version
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.3] - 2026-01-07

### Fixed
- **CLI**: Add `tdd-assistant` to standards-registry.json
  - Add skill files list and standard entry for TDD
  - `uds skills` now correctly shows 15/15 skills

## [3.3.0-beta.2] - 2026-01-07

### Added
- **Core**: Add Test-Driven Development (TDD) standard
  - New `core/test-driven-development.md` covering Red-Green-Refactor cycle, FIRST principles, TDD vs BDD vs ATDD
  - SDD + TDD integration workflow guidance
  - ML testing boundaries (model accuracy vs data engineering)
  - Golden Master Testing for legacy systems
- **Skills**: Add `tdd-assistant` skill for Claude Code (skill #15)
  - `skills/tdd-assistant/SKILL.md` - TDD workflow guidance
  - `skills/tdd-assistant/tdd-workflow.md` - Step-by-step TDD process
  - `skills/tdd-assistant/language-examples.md` - 6 language examples (JS/TS, Python, C#, Go, Java, Ruby)
  - Complete zh-TW translations for all TDD files

### Changed
- **Core Standards**: Update cross-references in related standards
  - `spec-driven-development.md` - Add TDD integration reference
  - `testing-standards.md` - Add TDD cross-reference
  - `test-completeness-dimensions.md` - Add TDD cross-reference
- **Release Workflow**: Expand pre-release checklist with comprehensive file verification
  - Add Version Files Checklist with all version-related files
  - Rename to Documentation Verification Checklist with accuracy verification
  - Add Content Accuracy Verification section with grep commands
  - Use `locales/*` pattern for all locale files

## [3.2.2] - 2026-01-06

### Added
- **CLI**: Add `uds skills` command to list installed Claude Code skills
  - Shows installations from Plugin Marketplace, user-level, and project-level
  - Displays version, path, and skill count for each installation
  - Warns about deprecated manual installations
- **CLI**: Improve Skills update instructions based on installation location

### Deprecated
- **Skills**: Manual installation via `install.sh` / `install.ps1` is now deprecated
  - Recommended: Use Plugin Marketplace for automatic updates
  - Scripts will show deprecation warning and prompt for confirmation
  - Will be removed in a future major version

### Changed
- **CLI**: `uds update` now shows deprecation warning for manual Skills installations
  - Recommends migration to Plugin Marketplace
- **Skills**: Update README.md to mark manual installation as deprecated

### Fixed
- **CLI**: Update standards-registry version to 3.2.2

## [3.2.2-beta.2] - 2026-01-05

### Added
- **CLI**: Improve Skills update instructions based on installation location
  - Marketplace: Guide to update via Plugin Marketplace UI
  - User-level: `cd ~/.claude/skills/... && git pull`
  - Project-level: `cd .claude/skills/... && git pull`

### Fixed
- **CLI**: Update standards-registry version to 3.2.2
  - Enables `uds update` to detect new versions for existing projects

## [3.2.2-beta.1] - 2026-01-05

### Added
- **Skills**: Add Release Workflow Guide for comprehensive release process
  - New `skills/release-standards/release-workflow.md` with step-by-step release instructions
  - Covers beta, alpha, rc, and stable release workflows
  - Includes npm dist-tag strategy, troubleshooting, and AI assistant guidelines
  - Add Release Process section in CLAUDE.md for AI assistants
- **CLI**: Add conversation language setting to AI tool integrations
  - All AI tool integration files now include conversation language directive
  - Supports English, Traditional Chinese, and Bilingual modes
  - Generates CLAUDE.md for Claude Code users with language setting
- **CLI**: Add comprehensive tests for prompts and utils modules
  - Test coverage improved from 42.78% to 72.7%
  - Total tests increased from 94 to 210

### Fixed
- **CLI**: Only prompt Skills when Claude Code is the only selected AI tool
  - Fixes bug where selecting multiple AI tools with Skills could cause other tools to miss full standards
- **CI/CD**: Fix npm publish workflow to correctly tag beta/alpha/rc versions
  - Add automatic version detection in `.github/workflows/publish.yml`
  - Beta versions now publish with `@beta` tag instead of `@latest`
  - Users can now install beta versions with `npm install -g universal-dev-standards@beta`

### Changed
- **Core Standards**: Add industry reference standards to 5 core documents
  - `error-code-standards.md` v1.0.0 → v1.1.0: RFC 7807, RFC 9457, HTTP Status Codes
  - `logging-standards.md` v1.0.0 → v1.1.0: OWASP Logging, RFC 5424, OpenTelemetry, 12 Factor App
  - `code-review-checklist.md` v1.1.0 → v1.2.0: SWEBOK v4.0 Ch.10 (Software Quality)
  - `checkin-standards.md` v1.2.5 → v1.3.0: SWEBOK v4.0 Ch.6 (Configuration Management)
  - `spec-driven-development.md` v1.1.0 → v1.2.0: IEEE 830-1998, SWEBOK v4.0 Ch.1 (Requirements)
- **Testing Standards**: Add SWEBOK v4.0 reference and new sections
  - `testing-standards.md` v2.0.0 → v2.1.0: Testing Fundamentals, Test-Related Measures, Pairwise/Data Flow Testing
- **Documentation**: Update MAINTENANCE.md with npm dist-tag strategy
  - Add dist-tag table for different version patterns
  - Add manual tag correction commands

## [3.2.1-beta.1] - 2026-01-02

### Added
- **CLI**: Add Plugin Marketplace support to Skills installation flow
  - New "Plugin Marketplace (Recommended)" option in Skills installation prompt
  - CLI tracks marketplace-installed Skills in manifest without attempting local installation
  - `uds check` command now displays marketplace installation status

### Fixed
- **CLI**: Fix wildcard path handling in standards registry causing 404 errors
  - Replace `templates/requirement-*.md` wildcard with explicit file paths
  - Add explicit entries for requirement-checklist.md, requirement-template.md, requirement-document-template.md
- **CLI**: Fix process hanging after `uds init`, `uds configure`, and `uds update` commands
  - Add explicit `process.exit(0)` to prevent inquirer readline interface from blocking termination

## [3.2.0] - 2026-01-02

### Added
- **Claude Code Plugin Marketplace Support**: Enable distribution via Plugin Marketplace
  - Add `.claude-plugin/plugin.json` - Plugin manifest with metadata
  - Add `.claude-plugin/marketplace.json` - Marketplace configuration for plugin distribution
  - Add `.claude-plugin/README.md` - Plugin documentation and maintenance guide
  - Update `skills/README.md` with Method 1: Marketplace Installation (Recommended)

### Benefits
- Users can install all 14 skills with a single command: `/plugin install universal-dev-standards@universal-dev-standards`
- Automatic updates when new versions are released
- Better discoverability through Claude Code marketplace
- Maintains backward compatibility with script installation (Method 2 and 3)

### Changed
- Add conversation language requirement (Traditional Chinese) to `CLAUDE.md` for AI assistants

### Fixed
- Fix CLI version reading to use `package.json` instead of hardcoded value

## [3.1.0] - 2025-12-30

### Added
- **Simplified Chinese (zh-CN) Translation**: Complete localization for Simplified Chinese users
  - Add `locales/zh-CN/README.md` - Full README translation
  - Add `locales/zh-CN/CLAUDE.md` - Project guidelines translation
  - Add `locales/zh-CN/docs/WINDOWS-GUIDE.md` - Windows guide translation
- Add language switcher links across all README versions (EN, zh-TW, zh-CN)

- **Full Windows Support**: Complete cross-platform compatibility for Windows users
  - Add `.gitattributes` for consistent line endings across platforms
  - Add `scripts/check-translation-sync.ps1` - PowerShell version of translation checker
  - Add `skills/install.ps1` - PowerShell version of skills installer
  - Add `scripts/setup-husky.js` - Cross-platform Husky setup script
  - Add `docs/WINDOWS-GUIDE.md` - Comprehensive Windows development guide
- **5 New Claude Code Skills**: Expand skill library from 9 to 14 skills
  - `spec-driven-dev` - SDD workflow guidance (triggers: spec, proposal)
  - `test-coverage-assistant` - 7-dimension test completeness framework (triggers: test coverage, dimensions)
  - `changelog-guide` - Changelog writing standards (triggers: changelog, release notes)
  - `error-code-guide` - Error code design patterns (triggers: error code)
  - `logging-guide` - Structured logging standards (triggers: logging, log level)
- Add **Hybrid Standards** category to `STATIC-DYNAMIC-GUIDE.md` - Standards with both static and dynamic components
- Add **Dynamic vs Static Classification** section to `MAINTENANCE.md` - Guidelines for categorizing standards
- Add `checkin-standards` core rules to `CLAUDE.md` as static standard
- Add complete zh-TW translations for all 5 new skills (10 files total)

### Changed
- Update `cli/package.json` prepare script to use cross-platform `setup-husky.js`
- Update `README.md`, `cli/README.md`, `CLAUDE.md` with Windows installation instructions
- Update `STATIC-DYNAMIC-GUIDE.md` to v1.1.0 - Introduce Hybrid Standards concept, update to 14 skills
- Update `MAINTENANCE.md` - Add cross-reference to `STATIC-DYNAMIC-GUIDE.md`, expand Workflow 4 with classification checklist
- Update skills table in `MAINTENANCE.md` from 9 to 14 skills (35 skill files + 10 shared/README = 45 files)
- Sync zh-TW translations for `MAINTENANCE.md` and `STATIC-DYNAMIC-GUIDE.md`

## [3.0.0] - 2025-12-30

### Added
- **AI-Optimized Standards Architecture**: Add dual-format support with `.ai.yaml` files
- Add `ai/standards/` directory with 15 AI-optimized standard files
- Add `ai/options/` directory with language-specific and workflow options
- Add `MAINTENANCE.md` - Project maintenance guide with file structure overview
- Add `ai/MAINTENANCE.md` - AI standards maintenance workflow guide
- Add `STANDARDS-MAPPING.md` - Standards to skills mapping matrix
- Add 6 new AI-optimized standards:
  - `anti-hallucination.ai.yaml` - AI collaboration standards
  - `checkin-standards.ai.yaml` - Code check-in standards
  - `documentation-writing-standards.ai.yaml` - Documentation writing guide
  - `spec-driven-development.ai.yaml` - SDD workflow
  - `test-completeness-dimensions.ai.yaml` - 7-dimension test framework
  - `versioning.ai.yaml` - Semantic versioning standards
- Add complete zh-TW translations for all new standards and skills (78 files total)

### Changed
- Standardize version format in core standards to `**Version**: x.x.x`
- Add `source` field to all zh-TW translation YAML front matter for sync tracking
- Update translation sync script with improved validation

### Fixed
- Fix version format inconsistency in `core/error-code-standards.md` and `core/logging-standards.md`
- Fix source paths in zh-TW skills translations

## [2.3.0] - 2025-12-25

### Added
- **Multilingual Support**: Add `locales/` directory structure for internationalization
- Add Traditional Chinese (zh-TW) translations for all documentation (44 files)
  - `locales/zh-TW/core/` - 13 core standard translations
  - `locales/zh-TW/skills/` - 25 skill file translations
  - `locales/zh-TW/adoption/` - 5 adoption guide translations
  - `locales/zh-TW/README.md` - Complete Chinese README
- Add language switcher to all English documentation files
- Add `scripts/check-translation-sync.sh` - Translation synchronization checker
- Add Static vs Dynamic standards classification to Skills documentation
- Add `templates/CLAUDE.md.template` - Ready-to-use template for static standards
- Add `adoption/STATIC-DYNAMIC-GUIDE.md` - Detailed classification guide

### Changed
- Separate bilingual content into dedicated language files (~50% token reduction for AI tools)
- English versions now contain English-only content with language switcher
- Update `skills/README.md` - Add Static vs Dynamic section with trigger keywords

## [2.2.0] - 2025-12-24

### Added
- Add standard sections to all Skills documentation (23 files)
  - 8 SKILL.md files: Added Purpose, Related Standards, Version History, License sections
  - 15 supporting docs: Added bilingual titles, metadata, and standard sections

### Changed
- Align Skills documentation format with Core standards
- Add cross-references between Skills and Core documents

## [2.1.0] - 2025-12-24

### Added
- **Integrated Skills**: Merge `universal-dev-skills` into `skills/` directory
- Add `skills/` - All Claude Code Skills now included in main repo
- Add `skills/_shared/` - Shared templates for multi-AI tool support
- Add placeholder directories for future AI tools: `skills/cursor/`, `skills/windsurf/`, `skills/cline/`, `skills/copilot/`

### Changed
- CLI now installs skills from local `skills/` instead of fetching from remote repository
- Update `standards-registry.json` to reflect integrated skills architecture

### Migration Guide
- If you previously used `universal-dev-skills` separately, you can now use the skills included in this repo
- Run `cd skills && ./install.sh` to reinstall skills from the integrated location

## [2.0.0] - 2025-12-24

### Changed

**BREAKING CHANGE**: Project renamed from `universal-doc-standards` to `universal-dev-standards`

This reflects the project's expanded scope covering all development standards, not just documentation.

#### Migration Guide

- Re-clone from the new repository: `git clone https://github.com/AsiaOstrich/universal-dev-standards.git`
- Re-run `npm link` in the CLI directory if using global installation
- Use `npx universal-dev-standards` instead of `npx universal-doc-standards`
- The `uds` command remains unchanged

### Added
- Add `extensions/languages/php-style.md` - PHP 8.1+ coding style guide based on PSR-12
- Add `extensions/frameworks/fat-free-patterns.md` - Fat-Free Framework v3.8+ development patterns

## [1.3.1] - 2025-12-19

### Added
- Add Mock Limitations section to `testing-standards.md` - Guidelines for when mocks require integration tests
- Add Test Data Management patterns to `testing-standards.md` - Distinct identifiers and composite key guidelines
- Add "When Integration Tests Are Required" table to `testing-standards.md` - 6 scenarios requiring integration tests

## [1.3.0] - 2025-12-16

### Added
- Add `changelog-standards.md` - Comprehensive changelog writing guide
- Add decision tree and selection matrix to `git-workflow.md` for workflow strategy selection
- Add language selection guide to `commit-message-guide.md` for choosing commit message language

### Changed
- Update `versioning.md` - Add cross-reference to changelog-standards.md
- Update `git-workflow.md` - Add CHANGELOG update guidance in release preparation
- Update `zh-tw.md` - Add terminology for Changelog, Release Notes, Breaking Change, Deprecate, Semantic Versioning
- Update `changelog-standards.md` - Align exclusion rules with versioning.md, add cross-reference
- Update `checkin-standards.md` - Clarify CHANGELOG updates apply to user-facing changes only
- Update `code-review-checklist.md` - Align CHANGELOG section with changelog-standards.md

### Fixed
- Fix inconsistent header format in `commit-message-guide.md` and `documentation-writing-standards.md`
- Standardize cross-references to use markdown link format instead of backticks

## [1.2.0] - 2025-12-11

### Added
- Add `project-structure.md` - Project directory conventions
- Add Physical DFD layer to `documentation-structure.md`

### Changed
- Update `documentation-structure.md` - Clarify flows/diagrams separation, improve file naming conventions
- Update `checkin-standards.md` - Add directory hygiene guidelines
- Improve universality by replacing project-specific examples with generic placeholders

## [1.1.0] - 2025-12-05

### Added
- Add `testing-standards.md` - Comprehensive testing pyramid (UT/IT/ST/E2E)
- Add `documentation-writing-standards.md` - Documentation content requirements

### Changed
- Update `anti-hallucination.md` - Enhance source attribution guidelines
- Update `zh-tw.md` - Sync with commit-message-guide.md v1.2.0

## [1.0.0] - 2025-11-12

### Added
- Initial release with core standards
- Core standards: `anti-hallucination.md`, `checkin-standards.md`, `commit-message-guide.md`, `git-workflow.md`, `code-review-checklist.md`, `versioning.md`, `documentation-structure.md`
- Extensions: `csharp-style.md`, `zh-tw.md`
- Templates: Requirement document templates
- Integrations: OpenSpec framework

[Unreleased]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.7.1...HEAD
[5.7.2]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.7.1...v5.7.2
[5.7.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.7.0...v5.7.1
[5.7.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.6.0...v5.7.0
[4.3.0-alpha.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v4.2.0...v4.3.0-alpha.1
[4.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v4.1.0...v4.2.0
[4.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.5.0...v4.0.0
[3.5.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.4.0...v3.5.0
[3.4.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.3.0...v3.4.0
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
