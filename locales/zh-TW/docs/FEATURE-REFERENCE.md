# UDS 功能參考手冊

> Universal Development Standards - 完整功能文件
> Auto-generated | Last updated: 2026-08-21

**Language**: [English](../../../docs/reference/FEATURE-REFERENCE.md) | 繁體中文 | [简体中文](../../zh-CN/docs/FEATURE-REFERENCE.md)

---

## 目錄

1. [CLI 指令](#cli-commands) (23)
2. [斜線命令](#slash-commands) (51)
3. [技能](#skills) (55)
4. [代理](#agents) (5)
5. [工作流程](#workflows) (5)
6. [核心規範](#core-standards) (150)
7. [腳本](#scripts) (57)

**Total Features: 346**

---

## CLI 指令

### `uds list`

**說明**: List available standards

**選項**:
| Option | 說明 |
|--------|-------------|
| `-c, --category` | Filter by category (skill, reference, extension, integration, template) |

### `uds init`

**說明**: Initialize standards in current project

**選項**:
| Option | 說明 |
|--------|-------------|
| `-m, --mode` | Installation mode (skills, full) |
| `-f, --format` | Standards format (ai, human, both) |
| `--workflow` | Git workflow (github-flow, gitflow, trunk-based) |
| `--merge-strategy` | Merge strategy (squash, merge-commit, rebase-ff) |
| `--output-lang` | Output language (english, traditional-chinese, bilingual) |
| `--test-levels` | Test levels, comma-separated (unit-testing,integration-testing,...) |
| `--lang` | Language extension (csharp, php) |
| `--framework` | Framework extension (fat-free) |
| `--locale` | Locale extension (zh-tw) |
| `--skills-location` | Skills location (marketplace, user, project, none) [default: marketplace] |
| `--content-mode` | Content mode for integration files (minimal, index) [default: index]; full is retired and resolves to index |
| `--agents-md` | Generate AGENTS.md universal summary |
| `--no-agents-md` | Skip AGENTS.md generation |
| `--with-hooks` | Install enforcement hooks (commit-msg, security, logging) |
| `--content-layout` | Content layout (flat, layered) [default: flat] |
| `-y, --yes` | Use defaults, skip interactive prompts |
| `-E, --experimental` | Enable experimental features (methodology) |
| `--force` | Bypass UDS source-repo self-adoption guard (DEC-044 / XSPEC-071) |

### `uds config`

**說明**: Manage UDS configuration and project settings

### `uds hitl`

**說明**: Human-in-the-Loop controls

**選項**:
| Option | 說明 |
|--------|-------------|
| `--op` | Operation description |

### `uds configure`

**說明**: Alias for "uds config" — Modify project settings

**選項**:
| Option | 說明 |
|--------|-------------|
| `-t, --type` | Option type to configure (format, workflow, merge_strategy, output_language, test_levels, skills, commands, all) |
| `--ai-tool` | Specific AI tool to configure (claude-code, opencode, copilot, etc.) |
| `--skills-location` | Skills installation location (project, user) |
| `-y, --yes` | Apply changes immediately without prompting |
| `-E, --experimental` | Enable experimental features (methodology) |

### `uds check`

**說明**: Check file integrity and adoption status (quick validation). For deep health diagnosis, use "uds audit"

**選項**:
| Option | 說明 |
|--------|-------------|
| `-s, --standard` | Validate against a specific standard physical spec |
| `--json` | Output result in JSON format |
| `--summary` | Show compact status summary (for use by other commands) |
| `--diff` | Show diff for modified files |
| `--restore` | Restore all modified and missing files |
| `--restore-missing` | Restore only missing files |
| `--no-interactive` | Disable interactive mode |
| `--ci` | CI mode: disable interactive prompts and set exit code on issues |
| `--migrate` | Migrate legacy manifest to hash-based tracking |
| `--offline` | Skip npm registry check for CLI updates |
| `--force` | Bypass UDS source-repo self-adoption guard (DEC-044 / XSPEC-071) |
| `--i18n` | Run i18n lint rules (XSPEC-239) across canonical + locale variants |

### `uds lint`

**說明**: Check spec dependency validity and size against installed specs (specs/*.md)

**選項**:
| Option | 說明 |
|--------|-------------|
| `--json` | Output result in JSON format |

### `uds simulate`

**說明**: Simulate a standard check with input (Predictive Validation)

**選項**:
| Option | 說明 |
|--------|-------------|
| `-s, --standard` | Standard to simulate against |
| `-i, --input` | Input string to test |
| `--json` | Output result in JSON format |

### `uds fix`

**說明**: Auto-fix standard violations (Self-Healing)

**選項**:
| Option | 說明 |
|--------|-------------|
| `-s, --standard` | Standard to fix |
| `--json` | Output result in JSON format |

### `uds update`

**說明**: Update standards to latest version

**選項**:
| Option | 說明 |
|--------|-------------|
| `-y, --yes` | Skip confirmation prompts |
| `--sync-refs` | Sync integration file references with manifest standards |
| `--integrations-only` | Only regenerate integration files (CLAUDE.md, etc.) |
| `--standards-only` | Only update standards, skip integration files |
| `--offline` | Skip npm registry check for CLI updates |
| `--beta` | Check for beta version updates |
| `--skills` | Install/update Skills for configured AI tools |
| `--commands` | Install/update slash commands for configured AI tools |
| `--debug` | Show debug output for Skills/Commands detection |
| `--plan` | Show reconciliation plan without executing (like terraform plan); combines with --skills/--commands to plan just that scope, still writing nothing |
| `--apply` | Apply exactly the plan --plan prints (plain `uds update` does not); with --skills/--commands it does the reconciliation AND that scope, not only the scope |
| `--force` | Force update all files, ignoring hash comparison |
| `--prune` | Delete .standards/ files UDS wrote but no longer ships (listed without this flag; never touches files UDS did not write) |
| `--rollback` | Rollback to the most recent backup |
| `--locale` | Override locale for skills install (zh-tw, zh-cn, en); also reads .uds/install.yaml + UDS_LOCALE env |

### `uds skills`

**說明**: List installed Claude Code skills

### `uds audit`

**說明**: Deep health diagnosis with pattern detection and feedback (strategic). For quick file check, use "uds check"

**選項**:
| Option | 說明 |
|--------|-------------|
| `--health` | Health check only |
| `--patterns` | Pattern detection only |
| `--friction` | Friction detection only |
| `--report` | Interactive feedback submission |
| `--yes` | Submit all findings without interactive selection (CI / non-TTY) |
| `--dry-run` | Preview report without submitting |
| `--gh` | Force gh CLI for submission |
| `--format` | Output format (json) |
| `--quiet` | Summary only |
| `--score` | Run multi-dimensional health score analysis |
| `--self` | Self mode: analyze UDS repo itself (use with --score) |
| `--save` | Save score snapshot for trend tracking (use with --score) |
| `--trend` | Show historical score trend (use with --score) |
| `--ci` | CI mode: output score only, exit 1 if below threshold (use with --score) |
| `--threshold` | Score threshold for CI mode (default: 75) |
| `--effects` | Static effect boundary gate: do the implementations of each declared effect interface reach anything outside this process |
| `--effects-config` | Path to the effect-family config (default: .uds/effect-boundary.json) |

### `uds deps`

**說明**: Compare the versions you test against the versions your declared ranges resolve to

**選項**:
| Option | 說明 |
|--------|-------------|
| `--path` | Directory containing package.json (default: cwd) |
| `--json` | Output raw JSON |
| `--concurrency` | Parallel registry lookups (default: 8) |

### `uds uninstall`

**說明**: Remove UDS standards, integrations, skills, and hooks

**選項**:
| Option | 說明 |
|--------|-------------|
| `--all` | Remove everything including user-level installations |
| `--standards-only` | Remove only .standards/ directory |
| `--skills-only` | Remove only skills and commands |
| `--integrations-only` | Remove only UDS blocks from integration files |
| `--dry-run` | Preview mode, no files modified |
| `-y, --yes` | Skip confirmation prompts |

### `uds compile`

**說明**: Compile enforcement standards into hook configurations

**選項**:
| Option | 說明 |
|--------|-------------|
| `--target` | Target platform (claude-code) |
| `--dry-run` | Preview output without writing files |

### `uds report`

**說明**: Analyze hook telemetry and show adoption report

### `uds release`

**說明**: Manage release process (promote, deploy, manifest, verify)

### `uds spec`

**說明**: Manage lightweight micro-specs for vibe coding. For full spec lifecycle with review, use "/sdd"

**選項**:
| Option | 說明 |
|--------|-------------|
| `-s, --scope` | Scope (frontend, backend, fullstack) |
| `-o, --output` | Output directory (default: specs/) |
| `-y, --yes` | Auto-confirm without prompting |
| `--status` | Filter by status (draft, confirmed, archived) |
| `-o, --output` | Specs directory (default: specs/) |
| `-o, --output` | Specs directory (default: specs/) |
| `-o, --output` | Specs directory (default: specs/) |
| `-o, --output` | Specs directory (default: specs/) |
| `-y, --yes` | Skip confirmation |
| `-o, --output` | Specs directory (default: specs/) |
| `--archived` | Search only archived specs |
| `-o, --output` | Specs directory |
| `-o, --output` | Specs directory |

### `uds quickstart`

**說明**: Interactive workflow guide — find the right commands quickly

### `uds agent`

**說明**: Manage UDS agents for AI tools

**選項**:
| Option | 說明 |
|--------|-------------|
| `--installed` | Show installation status for all AI tools |
| `-t, --tool` | Target AI tool (default: claude-code) |
| `-g, --global` | Install to user level instead of project level |
| `-y, --yes` | Skip confirmation prompts |

### `uds ai-context`

**說明**: Manage .ai-context.yaml configuration for AI-friendly architecture

### `uds mcp`

**說明**: MCP server commands for AI tool integration

### `uds run`

**說明**: Run a project command by intent (test/lint/build/security) via uds.project.yaml

---

## 斜線命令

| Command | 說明 |
|---------|-------------|
| `/ac-coverage` | "[UDS] Generate AC-to-test traceability matrix and coverage report" |
| `/api-design` | "[UDS] Guide API design following REST, GraphQL and gRPC best practices" |
| `/atdd` | [UDS] Guide through Acceptance Test-Driven Development workflow |
| `/audit` | "[UDS] UDS health check and feedback system, diagnose installation integrity and detect development patterns" |
| `/bdd` | [UDS] Guide through Behavior-Driven Development workflow |
| `/brainstorm` | "[UDS] Structured AI-assisted brainstorming before spec creation" |
| `/changelog` | "[UDS] Generate and maintain CHANGELOG.md entries" |
| `/check` | [UDS] Verify standards adoption status |
| `/checkin` | "[UDS] Pre-commit quality gates verification" |
| `/ci-cd` | "[UDS] Guide CI/CD pipeline design, configuration and optimization" |
| `/code-review` | [UDS] Perform systematic code review with checklist |
| `/commit` | [UDS] Generate commit messages following Conventional Commits standard |
| `/config` | [UDS] Configure project development standards |
| `/coverage` | [UDS] Analyze test coverage and provide recommendations |
| `/database` | "[UDS] Guide database design, migration planning and query optimization" |
| `/derive-all` | [UDS] Derive all test structures (BDD, TDD, ATDD) from SDD specification |
| `/derive-atdd` | [UDS] Derive ATDD acceptance tests from SDD specification |
| `/derive-bdd` | [UDS] Derive BDD Gherkin scenarios from SDD specification |
| `/derive-tdd` | [UDS] Derive TDD test skeletons from SDD specification |
| `/derive` | [UDS] Derive BDD scenarios, TDD skeletons, or ATDD tables from specifications. |
| `/dev-workflow` | "[UDS] Guide for mapping software development phases to UDS commands and features" |
| `/discover` | "[UDS] Assess project health, architecture, and risks before adding features" |
| `/docgen` | "[UDS] Generate usage documentation from project sources" |
| `/docs` | [UDS] Manage, guide, and generate documentation. |
| `/durable` | "[UDS] Guide workflow failure recovery with checkpoints, retries and rollback strategies" |
| `/e2e` | [UDS] Generate E2E test skeletons from BDD scenarios with framework detection |
| `/guide` | [UDS] Access Universal Development Standards guides and references. |
| `/incident` | "[UDS] Guide incident response, root cause analysis and post-mortem documentation" |
| `/init` | [UDS] Initialize development standards in current project |
| `/journey-test` | [UDS] Generate coherent user journey test plans (TESTPLAN) and E2E skeletons from a project description. |
| `/methodology` | [UDS] Manage development methodology workflow |
| `/metrics` | "[UDS] Track development metrics, code quality indicators and project health" |
| `/migrate` | "[UDS] Guide code migration, framework upgrades and technology modernization" |
| `/observability` | "[UDS] Guide observability setup, metrics design, alerting, and maturity assessment" |
| `/pr` | "[UDS] Guide Pull Request creation, review automation and merge strategies" |
| `/refactor` | [UDS] Guide refactoring decisions and strategy selection |
| `/release` | [UDS] Manage release process and changelogs. |
| `/requirement` | [UDS] Write user stories and requirements following INVEST criteria |
| `/reverse-bdd` | [UDS] Transform SDD acceptance criteria to BDD scenarios |
| `/reverse-sdd` | [UDS] Reverse engineer code into SDD specification document |
| `/reverse-tdd` | [UDS] Analyze BDD-TDD coverage gaps |
| `/reverse` | [UDS] Reverse engineer code to Specs, BDD, or TDD coverage. |
| `/runbook` | "[UDS] Guide runbook creation, maintenance, drills, and coverage reporting" |
| `/scan` | "[UDS] Guide automated security scanning, dependency auditing and secret detection" |
| `/sdd-retro` | [UDS] Create retroactive specs for untracked feat/fix commits |
| `/sdd` | [UDS] Create or review specification documents for Spec-Driven Development |
| `/security` | "[UDS] Guide security review and vulnerability assessment following OWASP standards" |
| `/skill-builder` | [UDS] Identify repeated processes and build Skills with the right development depth. |
| `/slo` | "[UDS] Guide SLI selection, SLO setting, and Error Budget management" |
| `/tdd` | [UDS] Guide through Test-Driven Development workflow |
| `/update` | [UDS] Update development standards to latest version |

---

## 技能

| Skill | 說明 |
|-------|-------------|
| `ac-coverage` | [UDS] 分析驗收條件（AC）與測試之間的追蹤關係，並產生需求層級的覆蓋率報告。 |
| `adr-assistant` | [UDS] 建立、管理並追蹤架構決策記錄（ADR）。 |
| `ai-collaboration-standards` | 防止 AI 幻覺，確保分析程式碼或提出建議時給出以證據為基礎的回應。 |
| `ai-friendly-architecture` | 設計 AI 友善架構，包含明確的模式、分層文件與語意邊界。 |
| `ai-instruction-standards` | 建立並維護 AI 指令檔（CLAUDE.md、AGENTS.md、.cursor/rules/ 等），並採用適當結構。 |
| `api-design-assistant` | 引導 API 設計，遵循 REST、GraphQL 與 gRPC 最佳實踐。 |
| `atdd-assistant` | [UDS] 驗收測試驅動開發（ATDD）的參考資料：INVEST 準則、Gherkin 驗收條件格式與 Three Amigos 結構。 |
| `audit-assistant` | [UDS] 診斷 UDS 安裝的健康狀態，並向上游提交結構化回饋。 |
| `bdd-assistant` | [UDS] 行為驅動開發（BDD）的參考資料：Gherkin 的 Given-When-Then 格式與 Three Amigos 結構。 |
| `brainstorm-assistant` | [UDS] 在規格出現之前執行的結構化多角色腦力激盪，並附帶評分品質關卡。 |
| `changelog-guide` | [UDS] 以 Keep a Changelog 格式產生並維護 CHANGELOG.md 條目。 |
| `checkin-assistant` | [UDS] 提交前品質關卡的參考資料：關卡定義、檢查清單項目，以及絕不可提交的規則。 |
| `ci-cd-assistant` | 引導 CI/CD 管線的設計、設定與最佳化。 |
| `code-review-assistant` | [UDS] 系統性程式碼審查的參考資料：八大審查類別，以及 BLOCKING/IMPORTANT/SUGGESTION 評論前綴。 |
| `commit-standards` | [UDS] 產生符合 Conventional Commits 規範的 commit message，包含雙語格式。 |
| `contract-test-assistant` | [UDS] 引導 API 與微服務的合約測試策略。 |
| `database-assistant` | 引導資料庫設計、遷移與查詢最佳化。 |
| `deploy-assistant` | 引導在沒有 CI/CD 平台（GitHub Actions／GitLab CI）的情況下完成可靠部署。 |
| `dev-methodology` | [UDS] 為專案選擇並追蹤當前採用的開發方法論（SDD、BDD、TDD）。 |
| `dev-workflow-guide` | [UDS] 把目前的軟體開發階段對應到正確的 UDS 指令與 Skill。 |
| `docs-generator` | [UDS] 從專案原始檔產生使用文件（速查表、參考手冊、使用指南）。 |
| `documentation-guide` | 引導文件結構、內容需求與專案文件的最佳實踐。 |
| `durable-execution-assistant` | [UDS] 引導容錯工作流程設計，包含檢查點、重試策略與回滾計畫。 |
| `e2e-assistant` | [UDS] 從 BDD 的 .feature 場景產生 E2E 測試骨架，並支援框架偵測與覆蓋缺口分析。 |
| `error-code-guide` | 設計一致的錯誤碼，遵循 PREFIX_CATEGORY_NUMBER 格式。 |
| `git-workflow-guide` | 引導 Git 分支策略、分支命名與合併操作。 |
| `incident-response-assistant` | 引導事故回應、根因分析與事後檢討文件撰寫。 |
| `journey-test-assistant` | [UDS] 從專案描述產生連貫的使用者旅程測試計畫（TESTPLAN）與旅程 E2E 骨架。 |
| `knowledge-graph` | [UDS] 透過知識圖追蹤規格、決策與程式碼之間的影響鏈；沒有引擎時以 Markdown 後備方案運作。 |
| `logging-guide` | 實作結構化日誌，包含適當的日誌層級與敏感資料處理。 |
| `metrics-dashboard-assistant` | [UDS] 長期追蹤開發指標、程式碼品質指標與技術債。 |
| `migration-assistant` | [UDS] 引導系統性的程式碼遷移、框架升級與技術現代化。 |
| `observability-assistant` | 引導可觀測性建置、指標設計與告警設定。 |
| `orchestrate` | 以 Claude 原生 Agent tool 編排多任務執行計畫（以 DAG 為基礎，不需外部引擎）。 |
| `plan` | 從 Spec 文件、OpenSpec 變更或自由文字需求生成 plan.json。 |
| `pr-automation-assistant` | 引導 pull request 建立、審查自動化與合併策略。 |
| `project-discovery` | [UDS] 在既有程式碼庫新增功能之前，評估專案健康度、架構與風險。 |
| `project-structure-guide` | 依各語言的最佳實踐組織專案目錄結構的指南。 |
| `push` | AI 輔助的 git push 安全層，提供品質關卡與協作護欄。 |
| `refactoring-assistant` | [UDS] 引導重構決策與策略選擇，包含「重構還是重寫」這個判斷。 |
| `release-standards` | [UDS] 引導發布流程——語意化版本、發布模式，以及 start/finish/promote/deploy 的順序。 |
| `requirement-assistant` | [UDS] 撰寫符合 INVEST 準則的使用者故事與需求。 |
| `retrospective-assistant` | [UDS] 引導 Sprint 與 Release 週期的結構化團隊回顧。 |
| `reverse-engineer` | [UDS] 系統考古——從邏輯、資料、執行環境三個維度對既有系統做反向工程。 |
| `runbook-assistant` | 引導 Runbook 的撰寫、維護與演練。 |
| `security-assistant` | 引導安全審查與弱點評估，遵循 OWASP 標準。 |
| `security-scan-assistant` | 引導自動化安全掃描、相依套件稽核與機密偵測。 |
| `skill-builder` | [UDS] 把重複的手動流程轉成範圍界定得宜的 Skill，過程中拿捏恰當的流程份量。 |
| `slo-assistant` | 引導 SLI 選取、SLO 設定與 Error Budget 管理。 |
| `spec-derivation` | [UDS] 從已核准的規格推導出 BDD 場景、TDD 骨架、整合與 E2E 測試，以及 ATDD 表格。 |
| `spec-driven-dev` | [UDS] 在寫程式碼之前建立並審查規格文件——規格格式、狀態與差異操作。 |
| `sweep` | 掃描程式碼庫中的除錯殘留與程式碼品質問題；可選擇自動修正安全的模式。 |
| `tdd-assistant` | [UDS] 測試驅動開發（TDD）的參考資料：紅-綠-重構循環、FIRST 原則與 Arrange-Act-Assert 結構。 |
| `test-coverage-assistant` | [UDS] 以八維度框架分析程式碼層級的測試覆蓋率，並建議該優先補上哪些缺口。 |
| `testing-guide` | 測試金字塔，以及 UT/IT/ST/E2E 的測試撰寫標準。 |

---

## 代理

| Agent | 角色 | 說明 |
|-------|------|-------------|
| `code-architect` | specialist | Software architecture specialist for system design and technical planning. |
| `doc-writer` | specialist | Documentation specialist for technical writing, API docs, and user guides. |
| `reviewer` | reviewer | Code review specialist for quality assessment, security analysis, and best practices enforcement. |
| `spec-analyst` | specialist | Specification analysis specialist for requirement extraction and spec generation. |
| `test-specialist` | specialist | Testing strategy specialist for test design, coverage analysis, and quality assurance. |

---

## 工作流程

| Workflow | 說明 |
|----------|-------------|
| `code-review` | Comprehensive code review workflow for PRs and code changes. |
| `feature-dev` | Standard feature development workflow from requirements to deployment. |
| `integrated-flow` | Complete development workflow integrating ATDD, SDD, BDD, and TDD methodologies. |
| `large-codebase-analysis` | RLM-enhanced workflow for analyzing large codebases with 50+ files. |
| `release` | Complete release workflow for software projects. |

---

## 核心規範

| Standard | 版本 | 說明 |
|----------|---------|-------------|
| `acceptance-criteria-traceability` | 1.1.0 |  |
| `acceptance-test-driven-development` | 1.1.0 |  |
| `accessibility-standards` | 1.1.0 | This standard defines comprehensive guidelines for creating accessible software  |
| `adr-standards` | 1.0.0 | Architecture Decision Records capture the context, options, and rationale behind |
| `adversarial-test` | - |  |
| `agent-behavior-discipline` | 1.0.0 | This standard defines four behavioral disciplines for AI agents that elevate per |
| `agent-communication-protocol` | 1.0.0 | Define a unified communication protocol for AI agents across the AsiaOstrich pro |
| `agent-dispatch` | 1.0.0 | Define standards for dispatching AI sub-agents in parallel, coordinating their w |
| `ai-agreement-standards` | 1.0.0 | This standard formalizes the interaction between Human (Acquirer) and AI (Suppli |
| `ai-command-behavior` | 1.0.0 | This standard defines a structure for specifying AI Agent runtime behavior in co |
| `ai-friendly-architecture` | 1.0.0 | This standard defines architecture and documentation practices that maximize the |
| `ai-instruction-standards` | 1.1.1 | This standard defines best practices for creating and maintaining AI instruction |
| `ai-response-navigation` | 1.3.0 | This standard defines navigation behavior for AI responses: every substantive AI |
| `alerting-standards` | 1.0.0 |  |
| `anti-hallucination` | 1.5.1 | This standard defines strict guidelines for AI assistants to prevent hallucinati |
| `anti-sycophancy-prompting` | 1.0.0 | This standard defines techniques and rules for designing prompts that elicit gen |
| `api-design-standards` | 1.1.0 | This standard defines comprehensive guidelines for designing, building, and main |
| `audit-trail` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `behavior-driven-development` | 1.1.0 |  |
| `behavior-snapshot` | - |  |
| `branch-completion` | 1.0.0 | Define a standardized workflow for completing development branches, including pr |
| `browser-compatibility-standards` | 1.0.2 | This standard defines supported browser and device matrices, testing automation  |
| `capability-declaration` | - |  |
| `cd-deployment-strategies` | - |  |
| `change-batching-standards` | - |  |
| `changelog-standards` | 1.0.2 | This standard defines how to write and maintain a CHANGELOG.md file to communica |
| `chaos-engineering-standards` | 1.0.0 |  |
| `chaos-injection-tests` | - |  |
| `checkin-standards` | 1.8.0 | This standard defines quality gates that MUST be passed before committing code t |
| `circuit-breaker` | - |  |
| `class-level-fix` | 1.1.0 | A defect is almost never alone. It is one member of a set — one flag in a dispat |
| `code-review-checklist` | 1.4.0 | This standard provides a comprehensive checklist for reviewing code changes, ens |
| `commit-message-guide` | 1.3.0 | Standardized commit messages improve code review efficiency, facilitate automate |
| `container-image-standards` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `container-security` | - |  |
| `containerization-standards` | 1.0.0 |  |
| `context-aware-loading` | 1.0.0 | This standard defines a protocol for AI tools to selectively load development st |
| `contract-testing-standards` | 1.0.0 | Contract testing verifies that a provider (API server) and its consumers (client |
| `cost-budget-test` | - |  |
| `cross-flow-regression` | 1.0.1 | This standard defines cross-flow regression testing — verifying that changes to  |
| `data-contract` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `data-migration-testing` | - |  |
| `data-pipeline` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `database-standards` | 1.0.0 | This standard defines guidelines for database design, querying, migration, and o |
| `deployment-standards` | 1.1.0 | This standard defines guidelines for safely deploying software to production, co |
| `deprecation-standards` | 1.1.0 |  |
| `design-document-standards` | 1.0.0 |  |
| `developer-memory` | 1.1.1 | This standard defines a structured system for capturing, retrieving, and surfaci |
| `disaster-recovery-drill` | - |  |
| `documentation-lifecycle` | 1.0.0 | This standard defines **when** to update documentation, **when** to check it, an |
| `documentation-structure` | 1.5.0 | This standard defines a consistent documentation structure for software projects |
| `documentation-writing-standards` | 1.2.0 | This standard defines documentation requirements based on project types and prov |
| `dual-phase-output` | - |  |
| `environment-standards` | 1.0.0 |  |
| `error-code-standards` | 1.2.1 |  |
| `estimation-standards` | 1.0.0 |  |
| `execution-history` | 1.0.0 |  |
| `failure-source-taxonomy` | - |  |
| `feature-discovery-standards` | 1.0.0 | **Status**: Active | **Updated**: 2026-05-13 |  |
| `feature-flag-standards` | 1.0.0 |  |
| `feature-manifest-standard` | - |  |
| `flaky-test-management` | - |  |
| `flow-based-testing` | 1.3.1 | This document defines a systematic methodology for testing multi-step processes. |
| `forward-derivation-standards` | 1.3.0 | This standard defines the principles and workflows for Forward Derivation—automa |
| `frontend-design-standards` | 1.1.0 | This standard defines a machine-readable frontend design specification format (D |
| `full-coverage-testing` | - |  |
| `git-workflow` | 1.4.0 | This standard defines Git branching strategies and workflows to ensure consisten |
| `git-worktree` | 1.1.0 | Define a lifecycle for using Git worktrees to isolate development work, ensuring |
| `governance-layer` | 1.1.0 | A governance layer provides a shared anchor for all agents and roles in a projec |
| `health-check-standards` | - |  |
| `iac-design-principles` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `immutability-first` | - |  |
| `incident-response` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `knowledge-graph-memory` | 1.0.0 | This standard defines a **relationship schema** so that specifications, decision |
| `knowledge-transfer-standards` | 1.0.0 |  |
| `license-compliance` | 2.1.0 | **Status**: Active | **Updated**: 2026-05-16 |  |
| `llm-output-validation` | - |  |
| `logging-standards` | 1.4.0 |  |
| `mock-boundary` | 1.1.0 | This document defines rules for what can and cannot be mocked in tests. Its goal |
| `model-provenance` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `model-selection` | 2.1.0 | Define how to choose **which model** and **how deeply it should think** — two in |
| `multi-environment-e2e-testing` | 1.0.0 | **Status**: Active | **Updated**: 2026-05-13 |  |
| `mutation-testing` | 1.1.0 | Mutation testing evaluates test suite effectiveness by injecting artificial bugs |
| `no-cicd-deployment` | - |  |
| `observability-standards` | 1.0.0 |  |
| `packaging-standards` | 1.1.0 | This standard defines a Recipe-based packaging framework that enables user proje |
| `performance-standards` | 1.2.0 | This standard defines comprehensive guidelines for software performance engineer |
| `pii-classification` | 1.1.0 | **Status**: Active | **Updated**: 2026-06-19 |  |
| `pipeline-integration-standards` | - |  |
| `pipeline-security-gates` | - |  |
| `policy-as-code-testing` | - |  |
| `postmortem-standards` | 1.0.0 |  |
| `prd-standards` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `privacy-standards` | 1.1.0 |  |
| `product-metrics-standards` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `project-context-memory` | 1.2.0 | This standard defines a structured system for capturing, retrieving, and enforci |
| `project-structure` | 1.2.0 | This standard defines conventions for project directory structure beyond documen |
| `prompt-regression` | - |  |
| `property-based-testing` | - |  |
| `push-standards` | 1.1.0 | **Status**: Active | **Updated**: 2026-07-09 |  |
| `recovery-recipe-registry` | - |  |
| `refactoring-standards` | 2.2.0 | This standard defines comprehensive guidelines for code refactoring, covering ev |
| `release-quality-manifest` | - |  |
| `release-readiness-gate` | 1.0.0 | This standard defines a **single, aggregated Release Readiness Gate** that unifi |
| `replay-test` | - |  |
| `requirement-engineering` | 1.1.0 |  |
| `resource-cost-boundary` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `retrospective-standards` | 1.0.0 | Retrospectives are structured team reflections that identify what worked well, w |
| `retry-standards` | - |  |
| `reverse-engineering-standards` | 1.3.0 | This standard defines the principles, workflows, and best practices for reverse  |
| `rollback-standards` | - |  |
| `runbook-standards` | 1.0.0 |  |
| `runbook` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `sast-advanced` | 1.0.0 | This standard defines Advanced Static Application Security Testing (SAST) practi |
| `schema-evolution` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `secret-management-standards` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `secure-op` | - |  |
| `security-decision` | - |  |
| `security-standards` | 1.1.0 | This standard defines comprehensive security guidelines for software development |
| `security-testing` | 1.1.0 | This document defines the security testing methodology for software projects. It |
| `self-review-protocol` | 1.1.0 | This standard mandates a **self-review pass** on large markdown edits before com |
| `server-ops-security` | - |  |
| `skill-standard-alignment-check` | - |  |
| `slo-sli` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `slo-standards` | 1.0.0 |  |
| `smoke-test` | - |  |
| `spec-driven-development` | 2.4.0 |  |
| `standard-admission-criteria` | - |  |
| `standard-lifecycle-management` | - |  |
| `structured-task-definition` | 1.0.0 |  |
| `supply-chain-attestation` | - |  |
| `supply-chain-security-standards` | 1.1.0 |  |
| `systematic-debugging` | 1.0.0 | Define a structured, four-phase debugging workflow that prevents the common anti |
| `tech-debt-standards` | 1.1.0 |  |
| `test-completeness-dimensions` | 1.1.0 | This document defines a systematic framework for evaluating test completeness. I |
| `test-data-standards` | 1.0.0 |  |
| `test-driven-development` | 1.2.0 |  |
| `test-governance` | 1.2.0 |  |
| `testing-standards` | 3.2.0 | This standard defines actionable testing rules and conventions for AI agents and |
| `timeout-standards` | - |  |
| `token-budget` | - |  |
| `translation-lifecycle-standards` | 1.0.1 | Translation lifecycle standards: MISSING vs OUTDATED distinction, semver-aware s |
| `user-journey-testing` | - |  |
| `user-story-mapping` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `verification-evidence` | 1.3.0 | Establish an "Iron Law" that no task can be claimed as complete without verifica |
| `verification-oracle` | 1.0.0 | **Status**: Active | **Updated**: 2026-06-17 |  |
| `versioning` | 1.5.0 | This standard defines how to version software releases using Semantic Versioning |
| `virtual-organization-standards` | 1.0.0 | This standard treats the AI ecosystem as a "Virtual Organization." It defines ho |
| `workflow-enforcement` | - |  |
| `workflow-state-protocol` | 1.0.0 |  |

---

## 腳本

| Script | 說明 |
|--------|-------------|
| `add-industry-standards-metadata.mjs` | Add industry standards metadata to core/ |
| `aggregate-effectiveness.mjs` | Aggregate Standards Effectiveness Reports |
| `analyze-hook-stats.mjs` | Hook Statistics Analyzer (SPEC-SELFDIAG-001 REQ-7, AC-11) |
| `bump-version.mjs` | Build a platform-aware shell command for a .sh script. |
| `bump-version.sh` | Thin wrapper — scripts/bump-version.mjs is the only copy of the bump logic. |
| `check-ai-agent-sync.ps1` | Check Ai Agent Sync |
| `check-ai-agent-sync.sh` | AI Agent Sync Checker |
| `check-ai-yaml-parses.mjs` | Every shipped .ai.yaml must parse, and must parse into what it says. |
| `check-bump-sync-roundtrip.mjs` | check-bump-sync-roundtrip — 測「跑完 bump 之後 check 必須通過」這個不變量。 |
| `check-cli-docs-sync.ps1` | Check Cli Docs Sync |
| `check-cli-docs-sync.sh` | CLI-to-Documentation Sync Checker |
| `check-commands-sync.ps1` | Check Commands Sync |
| `check-commands-sync.sh` | Commands Sync Checker |
| `check-commit-spec-reference.sh` | Thin wrapper — scripts/check-commit-spec-reference.ts is the only copy of |
| `check-docs-integrity.ps1` | Check Docs Integrity |
| `check-docs-integrity.sh` | Documentation Integrity Checker |
| `check-docs-sync.ps1` | Check Docs Sync |
| `check-docs-sync.sh` | Documentation Sync Checker |
| `check-external-references.mjs` | External Reference Checker (SPEC-SELFDIAG-001 REQ-5, AC-7) |
| `check-orphan-specs.ps1` | Check Orphan Specs |
| `check-orphan-specs.sh` | Orphan Spec Detection Script |
| `check-scope-sync.ps1` | Check Scope Sync |
| `check-scope-sync.sh` | Scope Consistency Check Script |
| `check-skill-next-steps-sync.ps1` | Check Skill Next Steps Sync |
| `check-skill-next-steps-sync.sh` | Skill Next Steps Guidance Sync Checker |
| `check-spec-sync.ps1` | Core↔Skill Sync Check Script |
| `check-spec-sync.sh` | Core↔Skill Sync Check Script |
| `check-standards-reference-sync.ps1` | Check Standards Reference Sync |
| `check-standards-reference-sync.sh` | check-standards-reference-sync.sh |
| `check-standards-sync.ps1` | Check Standards Sync |
| `check-standards-sync.sh` | Standards Consistency Checker |
| `check-translation-sync.ps1` | Check Translation Sync |
| `check-translation-sync.sh` | Translation Sync Checker |
| `check-usage-docs-sync.ps1` | Check if usage documentation needs to be regenerated |
| `check-usage-docs-sync.sh` | check-usage-docs-sync.sh |
| `check-version-sync.ps1` | Check Version Sync |
| `check-version-sync.sh` | Version Sync Checker |
| `check-workflow-compliance.sh` | Thin wrapper — scripts/check-workflow-compliance.ts is the only copy of the |
| `commitlint-bilingual-rule.mjs` | commitlint-bilingual-rule.mjs — custom commitlint rules enforcing the |
| `convert-md-to-yaml.mjs` | Markdown to AI-YAML Conversion Script |
| `fix-manifest-paths.ps1` | Fix Manifest Paths |
| `fix-manifest-paths.sh` | Manifest Path Fixer |
| `generate-adoption-skills.mjs` | Self-Adoption Skill Copy Generator and Drift Gate — XSPEC-385 |
| `generate-docs.mjs` | Look up the release date for `version` from CHANGELOG.md's own |
| `generate-llms-txt.mjs` | llms.txt Generator and Drift Gate — XSPEC-385 |
| `generate-locale-coverage.mjs` | Locale Coverage Generator |
| `generate-version-manifest.mjs` | Generate Version Manifest (SPEC-SELFDIAG-001 REQ-9, AC-14) |
| `install-hooks.mjs` | Install Hooks |
| `install-hooks.sh` | Thin wrapper — scripts/install-hooks.mjs is the only copy of the installer |
| `pre-commit.mjs` | Build a platform-aware shell command for a .sh script. |
| `pre-release-check.ps1` | Pre Release Check |
| `pre-release-check.sh` | Pre-release Check Script |
| `pre-release.ps1` | Pre-Release Preparation Script for Universal Development Standards |
| `pre-release.sh` | Pre-Release Preparation Script |
| `setup-husky.mjs` | Cross-platform Husky Setup Script |
| `sync-manifest.mjs` | Extract top-level Commander command names registered directly on the |
| `watch-model-versions.sh` | Model / tool version watch — XSPEC-357 AC-6.2 |

---

## License

This documentation is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

**Source**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
