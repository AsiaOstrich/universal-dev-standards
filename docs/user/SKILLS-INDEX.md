# UDS Skills Index

> **Auto-generated** — do not edit manually.
> Run `npm run docs:generate-index` to update.
> Last regenerated: 2026-08-18 | UDS v6.7.5 | 55 skills

Use skills by typing their command in Claude Code (e.g., `/sdd`, `/tdd`, `/commit`).
Skills not in Tier 1 are always callable via `/<name>` even if not listed in the context menu.

---

## By Tier (DEC-061)

Tiers control how much context budget is spent on skill descriptions in Claude Code.
See [skill-budget-tuning.md](../skill-budget-tuning.md) for customization.

### Tier 1 — Core (15 skills · daily use · always listed)

| Skill | Command | Description |
|-------|---------|-------------|
| `adr-assistant` | `/adr` | Create, manage, and track Architecture Decision Records (ADR). |
| `bdd-assistant` | `/bdd` | Reference for Behavior-Driven Development: Gherkin Given-When-Then format and Three Amigos structure. |
| `checkin-assistant` | `/checkin` | Reference for pre-commit quality gates: gate definitions, checklist items, and never-commit rules. |
| `code-review-assistant` | `/code-review` | Reference for systematic code review: eight review categories and BLOCKING/IMPORTANT/SUGGESTION comment prefixes. |
| `commit-standards` | `/commit` | Generate commit messages that follow Conventional Commits, including the bilingual format. |
| `dev-workflow-guide` | `/dev-workflow` | Map the current software development phase to the right UDS commands and skills. |
| `git-workflow-guide` | `/git-workflow-guide` | Guide Git branching strategies, branch naming, and merge operations. |
| `orchestrate` | `/orchestrate` | Orchestrate multi-task execution plans using Claude's native Agent tool (DAG-based, no external engine). |
| `plan` | `/plan` | Generate plan.json from Spec documents, OpenSpec changes, or free-text requirements. |
| `push` | `/push` | AI-assisted safety layer for git push operations with quality gates and collaboration guardrails. |
| `refactoring-assistant` | `/refactor` | Guide refactoring decisions and strategy selection, including the refactor-versus-rewrite call. |
| `requirement-assistant` | `/requirement` | Write user stories and requirements that satisfy the INVEST criteria. |
| `spec-driven-dev` | `/sdd` | Create and review specification documents before writing code — spec format, states, and delta operations. |
| `tdd-assistant` | `/tdd` | Reference for Test-Driven Development: the Red-Green-Refactor cycle, FIRST principles, and Arrange-Act-Assert structure. |
| `testing-guide` | `/testing-guide` | Testing pyramid and test writing standards for UT/IT/ST/E2E. |

### Tier 2 — Advanced (28 skills · weekly use · listed by default)

| Skill | Command | Description |
|-------|---------|-------------|
| `ac-coverage` | `/ac-coverage` | Analyze AC-to-test traceability and generate requirement-level coverage reports. |
| `ai-friendly-architecture` | `/ai-friendly-architecture` | Design AI-friendly architecture with explicit patterns, layered documentation, and semantic boundaries. |
| `ai-instruction-standards` | `/ai-instruction-standards` | Create and maintain AI instruction files (CLAUDE.md, AGENTS.md, .cursor/rules/, etc.) with proper structure. |
| `api-design-assistant` | `/api-design` | Guide API design following REST, GraphQL, and gRPC best practices. |
| `atdd-assistant` | `/atdd` | Reference for Acceptance Test-Driven Development: INVEST criteria, Gherkin AC format, and Three Amigos structure. |
| `audit-assistant` | `/audit` | Diagnose UDS installation health and submit structured feedback upstream. |
| `changelog-guide` | `/changelog` | Generate and maintain CHANGELOG.md entries in Keep a Changelog format. |
| `ci-cd-assistant` | `/ci-cd` | Guide CI/CD pipeline design, configuration, and optimization. |
| `contract-test-assistant` | `/contract-test` | Guide contract testing strategy for APIs and microservices. |
| `database-assistant` | `/database` | Guide database design, migration, and query optimization. |
| `deploy-assistant` | `/deploy` | Guide reliable deployments without CI/CD platforms (GitHub Actions / GitLab CI). |
| `dev-methodology` | `/methodology` | Select and track the active development methodology (SDD, BDD, TDD) for a project. |
| `docs-generator` | `/docgen` | Generate usage documentation (cheatsheets, references, guides) from project sources. |
| `documentation-guide` | `/documentation-guide` | Guide documentation structure, content requirements, and project documentation best practices. |
| `e2e-assistant` | `/e2e` | Generate E2E test skeletons from BDD .feature scenarios, with framework detection and coverage gap analysis. |
| `error-code-guide` | `/error-code-guide` | Design consistent error codes following the PREFIX_CATEGORY_NUMBER format. |
| `journey-test-assistant` | `/journey-test-assistant` | Generate coherent user-journey test plans (TESTPLAN) and journey E2E skeletons from a project description. |
| `knowledge-graph` | `/knowledge-graph` | Trace impact chains across specs, decisions, and code via a knowledge graph, with a Markdown fallback when no engine is present. |
| `logging-guide` | `/logging-guide` | Implement structured logging with proper log levels and sensitive data handling. |
| `pr-automation-assistant` | `/pr` | Guide pull request creation, review automation, and merge strategies. |
| `project-discovery` | `/discover` | Assess project health, architecture, and risks before adding features to an existing codebase. |
| `project-structure-guide` | `/project-structure-guide` | Guide for organizing project directories following language-specific best practices. |
| `release-standards` | `/release` | Guide the release process — semantic versioning, release modes, and the start/finish/promote/deploy sequence. |
| `reverse-engineer` | `/reverse` | System archeology — reverse engineer an existing system across the Logic, Data, and Runtime dimensions. |
| `security-assistant` | `/security` | Guide security review and vulnerability assessment following OWASP standards. |
| `spec-derivation` | `/spec-derive` | Derive BDD scenarios, TDD skeletons, integration and E2E tests, and ATDD tables from an approved specification. |
| `sweep` | `/sweep` | Scan codebase for debug artifacts and code quality issues; optionally auto-fix safe patterns. |
| `test-coverage-assistant` | `/coverage` | Analyze code-level test coverage across the eight-dimension framework and recommend which gaps to close. |

### Tier 3 — Specialist (12 skills · event-driven · name-only by default)

> Tier 3 skills save context budget by showing only the skill name in listings.
> They remain fully callable via `/<name>`.

| Skill | Command | Description |
|-------|---------|-------------|
| `ai-collaboration-standards` | `/ai-collaboration-standards` | Prevent AI hallucination and ensure evidence-based responses when analyzing code or making suggestions. |
| `brainstorm-assistant` | `/brainstorm` | Structured multi-persona brainstorming with a scored quality gate, run before a spec exists. |
| `durable-execution-assistant` | `/durable` | Guide fault-tolerant workflow design with checkpoints, retry policies, and rollback plans. |
| `incident-response-assistant` | `/incident` | Guide incident response, root cause analysis, and post-mortem documentation. |
| `metrics-dashboard-assistant` | `/metrics` | Track development metrics, code quality indicators, and technical debt over time. |
| `migration-assistant` | `/migrate` | Guide systematic code migration, framework upgrades, and technology modernization. |
| `observability-assistant` | `/observability` | Guide observability setup, metrics design, and alerting configuration. |
| `retrospective-assistant` | `/retrospective` | Guide structured team retrospectives for Sprint and Release cycles. |
| `runbook-assistant` | `/runbook` | Guide runbook creation, maintenance, and drill exercises. |
| `security-scan-assistant` | `/scan` | Guide automated security scanning, dependency auditing, and secret detection. |
| `skill-builder` | `/skill-builder` | Turn a repeated manual process into a properly scoped Skill, with the right amount of process along the way. |
| `slo-assistant` | `/slo` | Guide SLI selection, SLO setting, and Error Budget management. |

---

## By Category

### Development

| Skill | Command | Tier | Description |
|-------|---------|------|-------------|
| `ai-friendly-architecture` | `/ai-friendly-architecture` | T2 | Design AI-friendly architecture with explicit patterns, layered documentation, and semantic boundaries. |
| `atdd-assistant` | `/atdd` | T2 | Reference for Acceptance Test-Driven Development: INVEST criteria, Gherkin AC format, and Three Amigos structure. |
| `bdd-assistant` | `/bdd` | T1 | Reference for Behavior-Driven Development: Gherkin Given-When-Then format and Three Amigos structure. |
| `contract-test-assistant` | `/contract-test` | T2 | Guide contract testing strategy for APIs and microservices. |
| `error-code-guide` | `/error-code-guide` | T2 | Design consistent error codes following the PREFIX_CATEGORY_NUMBER format. |
| `logging-guide` | `/logging-guide` | T2 | Implement structured logging with proper log levels and sensitive data handling. |
| `project-structure-guide` | `/project-structure-guide` | T2 | Guide for organizing project directories following language-specific best practices. |
| `refactoring-assistant` | `/refactor` | T1 | Guide refactoring decisions and strategy selection, including the refactor-versus-rewrite call. |
| `requirement-assistant` | `/requirement` | T1 | Write user stories and requirements that satisfy the INVEST criteria. |
| `spec-derivation` | `/spec-derive` | T2 | Derive BDD scenarios, TDD skeletons, integration and E2E tests, and ATDD tables from an approved specification. |
| `spec-driven-dev` | `/sdd` | T1 | Create and review specification documents before writing code — spec format, states, and delta operations. |
| `tdd-assistant` | `/tdd` | T1 | Reference for Test-Driven Development: the Red-Green-Refactor cycle, FIRST principles, and Arrange-Act-Assert structure. |

### Quality

| Skill | Command | Tier | Description |
|-------|---------|------|-------------|
| `checkin-assistant` | `/checkin` | T1 | Reference for pre-commit quality gates: gate definitions, checklist items, and never-commit rules. |
| `code-review-assistant` | `/code-review` | T1 | Reference for systematic code review: eight review categories and BLOCKING/IMPORTANT/SUGGESTION comment prefixes. |
| `commit-standards` | `/commit` | T1 | Generate commit messages that follow Conventional Commits, including the bilingual format. |
| `git-workflow-guide` | `/git-workflow-guide` | T1 | Guide Git branching strategies, branch naming, and merge operations. |
| `pr-automation-assistant` | `/pr` | T2 | Guide pull request creation, review automation, and merge strategies. |
| `push` | `/push` | T1 | AI-assisted safety layer for git push operations with quality gates and collaboration guardrails. |
| `sweep` | `/sweep` | T2 | Scan codebase for debug artifacts and code quality issues; optionally auto-fix safe patterns. |

### Testing

| Skill | Command | Tier | Description |
|-------|---------|------|-------------|
| `ac-coverage` | `/ac-coverage` | T2 | Analyze AC-to-test traceability and generate requirement-level coverage reports. |
| `e2e-assistant` | `/e2e` | T2 | Generate E2E test skeletons from BDD .feature scenarios, with framework detection and coverage gap analysis. |
| `journey-test-assistant` | `/journey-test-assistant` | T2 | Generate coherent user-journey test plans (TESTPLAN) and journey E2E skeletons from a project description. |
| `test-coverage-assistant` | `/coverage` | T2 | Analyze code-level test coverage across the eight-dimension framework and recommend which gaps to close. |
| `testing-guide` | `/testing-guide` | T1 | Testing pyramid and test writing standards for UT/IT/ST/E2E. |

### Governance

| Skill | Command | Tier | Description |
|-------|---------|------|-------------|
| `adr-assistant` | `/adr` | T1 | Create, manage, and track Architecture Decision Records (ADR). |
| `ai-collaboration-standards` | `/ai-collaboration-standards` | T3 | Prevent AI hallucination and ensure evidence-based responses when analyzing code or making suggestions. |
| `ai-instruction-standards` | `/ai-instruction-standards` | T2 | Create and maintain AI instruction files (CLAUDE.md, AGENTS.md, .cursor/rules/, etc.) with proper structure. |
| `audit-assistant` | `/audit` | T2 | Diagnose UDS installation health and submit structured feedback upstream. |
| `dev-methodology` | `/methodology` | T2 | Select and track the active development methodology (SDD, BDD, TDD) for a project. |
| `dev-workflow-guide` | `/dev-workflow` | T1 | Map the current software development phase to the right UDS commands and skills. |
| `retrospective-assistant` | `/retrospective` | T3 | Guide structured team retrospectives for Sprint and Release cycles. |

### Documentation

| Skill | Command | Tier | Description |
|-------|---------|------|-------------|
| `changelog-guide` | `/changelog` | T2 | Generate and maintain CHANGELOG.md entries in Keep a Changelog format. |
| `docs-generator` | `/docgen` | T2 | Generate usage documentation (cheatsheets, references, guides) from project sources. |
| `documentation-guide` | `/documentation-guide` | T2 | Guide documentation structure, content requirements, and project documentation best practices. |
| `knowledge-graph` | `/knowledge-graph` | T2 | Trace impact chains across specs, decisions, and code via a knowledge graph, with a Markdown fallback when no engine is present. |
| `release-standards` | `/release` | T2 | Guide the release process — semantic versioning, release modes, and the start/finish/promote/deploy sequence. |

### Automation

| Skill | Command | Tier | Description |
|-------|---------|------|-------------|
| `orchestrate` | `/orchestrate` | T1 | Orchestrate multi-task execution plans using Claude's native Agent tool (DAG-based, no external engine). |
| `plan` | `/plan` | T1 | Generate plan.json from Spec documents, OpenSpec changes, or free-text requirements. |
| `reverse-engineer` | `/reverse` | T2 | System archeology — reverse engineer an existing system across the Logic, Data, and Runtime dimensions. |

### Operations

| Skill | Command | Tier | Description |
|-------|---------|------|-------------|
| `durable-execution-assistant` | `/durable` | T3 | Guide fault-tolerant workflow design with checkpoints, retry policies, and rollback plans. |
| `incident-response-assistant` | `/incident` | T3 | Guide incident response, root cause analysis, and post-mortem documentation. |
| `metrics-dashboard-assistant` | `/metrics` | T3 | Track development metrics, code quality indicators, and technical debt over time. |
| `migration-assistant` | `/migrate` | T3 | Guide systematic code migration, framework upgrades, and technology modernization. |
| `observability-assistant` | `/observability` | T3 | Guide observability setup, metrics design, and alerting configuration. |
| `runbook-assistant` | `/runbook` | T3 | Guide runbook creation, maintenance, and drill exercises. |
| `slo-assistant` | `/slo` | T3 | Guide SLI selection, SLO setting, and Error Budget management. |

### Security

| Skill | Command | Tier | Description |
|-------|---------|------|-------------|
| `security-assistant` | `/security` | T2 | Guide security review and vulnerability assessment following OWASP standards. |
| `security-scan-assistant` | `/scan` | T3 | Guide automated security scanning, dependency auditing, and secret detection. |

### Other

| Skill | Command | Tier | Description |
|-------|---------|------|-------------|
| `api-design-assistant` | `/api-design` | T2 | Guide API design following REST, GraphQL, and gRPC best practices. |
| `brainstorm-assistant` | `/brainstorm` | T3 | Structured multi-persona brainstorming with a scored quality gate, run before a spec exists. |
| `ci-cd-assistant` | `/ci-cd` | T2 | Guide CI/CD pipeline design, configuration, and optimization. |
| `database-assistant` | `/database` | T2 | Guide database design, migration, and query optimization. |
| `deploy-assistant` | `/deploy` | T2 | Guide reliable deployments without CI/CD platforms (GitHub Actions / GitLab CI). |
| `skill-builder` | `/skill-builder` | T3 | Turn a repeated manual process into a properly scoped Skill, with the right amount of process along the way. |

---

## 觸發時機速查 (When to Use)

| 我想做... | Skill | Command |
|----------|-------|---------|
| 建立新功能規格 | `spec-driven-dev` | `/sdd` |
| 撰寫/推送 git commit | `commit-standards` | `/commit` |
| 安全推送到遠端 | `push` | `/push` |
| 測試驅動開發（TDD） | `tdd-assistant` | `/tdd` |
| 行為驅動開發（BDD） | `bdd-assistant` | `/bdd` |
| 驗收測試驅動（ATDD） | `atdd-assistant` | `/atdd` |
| 建立架構決策紀錄 | `adr-assistant` | `/adr` |
| 程式碼審查 | `code-review-assistant` | `/code-review` |
| 重構決策 | `refactoring-assistant` | `/refactor` |
| 撰寫使用者故事/需求 | `requirement-assistant` | `/requirement` |
| 設計 API | `api-design-assistant` | `/api-design` |
| 資料庫設計/遷移 | `database-assistant` | `/database` |
| 規劃並執行多任務計畫 | `plan + orchestrate` | `/plan / /orchestrate` |
| 掃描清理 debug 殘留 | `sweep` | `/sweep` |
| 追蹤 AC 與測試覆蓋 | `ac-coverage` | `/ac-coverage` |
| Git 分支策略 | `git-workflow-guide` | `/git-workflow` |
| 安全審查（OWASP） | `security-assistant` | `/security` |
| 部署腳本 | `deploy-assistant` | `/deploy` |
| CI/CD 管線設計 | `ci-cd-assistant` | `/ci-cd` |
| 查詢開發工作流程指引 | `dev-workflow-guide` | `/dev-workflow` |
| 日誌實作標準 | `logging-guide` | `/logging` |
| 錯誤碼設計 | `error-code-guide` | `/error-code` |

---

## Related

- [COMMANDS-INDEX.md](COMMANDS-INDEX.md) — all slash commands alphabetically
- [GETTING-STARTED.md](GETTING-STARTED.md) — first-time setup
- [FAQ.md](FAQ.md) — common questions
- [skill-budget-tuning.md](../skill-budget-tuning.md) — customize Tier 3 visibility
