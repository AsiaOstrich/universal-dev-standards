# Universal Development Skills

This directory contains the reference implementations of Universal Development Standards (UDS) skills. These skills are designed to be tool-agnostic where possible, serving as the "Source of Truth" for AI coding assistants.

> Derived from [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards) core standards.

## Directory Structure

```
skills/
├── commands/          # Universal Slash Command definitions (.md)
├── agents/            # Universal Agent definitions (.md)
├── workflows/         # Universal Workflow definitions (.yaml)
├── tools/             # Tool-specific adapters and configs
│   ├── cline/         # Cline (.clinerules)
│   ├── cursor/        # Cursor (.cursorrules)
│   ├── windsurf/      # Windsurf (.windsurfrules)
│   └── copilot/       # GitHub Copilot (instructions.md)
├── _shared/           # Shared templates and utilities
└── [skill-name]/      # Individual skill definitions (e.g., git-workflow-guide/)
```

## Universal Skills & Commands

These skills provide standard guidance and workflows. They can be accessed via slash commands in supporting tools (like Claude Code, OpenCode) or referenced manually.

| Skill (Folder) | Command | Description |
|----------------|---------|-------------|
| `guide` | `/guide` | [UDS] Access all standard guides |
| `checkin-assistant` | `/checkin` | [UDS] Pre-commit quality gates |
| `commit-standards` | `/commit` | [UDS] Conventional Commits format |
| `code-review-assistant` | `/review` | [UDS] Systematic code review |
| `tdd-assistant` | `/tdd` | [UDS] Test-Driven Development |
| `bdd-assistant` | `/bdd` | [UDS] Behavior-Driven Development |
| `atdd-assistant` | `/atdd` | [UDS] Acceptance Test-Driven Development |
| `e2e-assistant` | `/e2e` | [UDS] E2E test skeleton generation from BDD scenarios |
| `journey-test-assistant` | `/journey-test` | [UDS] Connected user journey test plan (TESTPLAN) + E2E skeleton generation |
| `release-standards` | `/release` | [UDS] Release & Changelog management |
| `documentation-guide` | `/docs` | [UDS] Documentation management |
| `requirement-assistant` | `/requirement` | [UDS] Requirement writing |
| `reverse-engineer` | `/reverse` | [UDS] Reverse engineer code |
| `spec-derivation` | `/spec-derive` | [UDS] Derive BDD/TDD/ATDD artifacts from spec |
| `spec-driven-dev` | `/sdd` | [UDS] Spec-Driven Development |
| `test-coverage-assistant` | `/coverage` | [UDS] Test coverage analysis |
| `dev-methodology` | `/methodology` | [UDS] Development methodology |
| `refactoring-assistant` | `/refactor` | [UDS] Refactoring guidance |
| `project-discovery` | `/discover` | [UDS] Assess project health and risks |
| `brainstorm-assistant` | `/brainstorm` | [UDS] Structured AI-assisted ideation |
| `changelog-guide` | `/changelog` | [UDS] Generate changelog entries |
| `dev-workflow-guide` | `/dev-workflow` | [UDS] Map development phases to UDS commands |
| `docs-generator` | `/docgen` | [UDS] Generate usage documentation |
| `security-assistant` | `/security` | [UDS] Security review and vulnerability assessment |
| `security-scan-assistant` | `/scan` | [UDS] Automated security scanning and dependency audit |
| `api-design-assistant` | `/api-design` | [UDS] API design (REST, GraphQL, gRPC) |
| `database-assistant` | `/database` | [UDS] Database design, migration, query optimization |
| `ci-cd-assistant` | `/ci-cd` | [UDS] CI/CD pipeline design and optimization |
| `incident-response-assistant` | `/incident` | [UDS] Incident response and post-mortem |
| `pr-automation-assistant` | `/pr` | [UDS] Pull request creation and review automation |
| `metrics-dashboard-assistant` | `/metrics` | [UDS] Development metrics and project health |
| `durable-execution-assistant` | `/durable` | [UDS] Workflow fault recovery and rollback |
| `migration-assistant` | `/migrate` | [UDS] Code migration and framework upgrades |
| `audit-assistant` | `/audit` | [UDS] Standards compliance audit |
| `observability-assistant` | `/observability` | [UDS] Observability setup, metrics, alerting 🆕 |
| `slo-assistant` | `/slo` | [UDS] SLI selection, SLO setting, Error Budget 🆕 |
| `runbook-assistant` | `/runbook` | [UDS] Runbook creation, drills, coverage 🆕 |
| `skill-builder` | `/skill-builder` | [UDS] Identify repeated processes and build Skills with the right development depth |

> **Note**: For reference guides (e.g., Git Workflow, Logging, Error Codes), use the `/guide` command.

## Skill Tiers (Listing Budget Optimization)

> Background: Claude Code reserves a fraction of context (default 1%) for skill listings via `skillListingBudgetFraction`. With 40+ UDS skills and adopter-installed plugins, descriptions can be truncated. UDS organizes skills into three tiers so adopters can optionally suppress less-used descriptions while keeping skills callable via `/<name>`.
>
> See [DEC-061](https://github.com/AsiaOstrich/dev-platform/blob/main/cross-project/decisions/DEC-061-uds-skill-listing-budget.md) for the decision and tradeoffs. Reference settings live in [`examples/skill-overrides-recommended.json`](../examples/skill-overrides-recommended.json). Detailed tuning: [`docs/skill-budget-tuning.md`](../docs/skill-budget-tuning.md).

### Tier 1 — Core (daily use)
**Listing default**: `"on"` (full description shown). Always auto-discoverable.

`commit-standards`, `push`, `git-workflow-guide`, `tdd-assistant`, `bdd-assistant`, `testing-guide`, `code-review-assistant`, `refactoring-assistant`, `requirement-assistant`, `spec-driven-dev`, `adr-assistant`, `dev-workflow-guide`, `checkin-assistant`

### Tier 2 — Advanced (weekly use)
**Listing default**: `"on"` (full description shown).

`atdd-assistant`, `e2e-assistant`, `journey-test-assistant`, `contract-test-assistant`, `security-assistant`, `deploy-assistant`, `ci-cd-assistant`, `error-code-guide`, `logging-guide`, `documentation-guide`, `api-design-assistant`, `database-assistant`, `project-structure-guide`, `ai-instruction-standards`, `release-standards`, `changelog-guide`, `test-coverage-assistant`, `pr-automation-assistant`, `spec-derivation`, `reverse-engineer`, `project-discovery`, `dev-methodology`, `audit-assistant`, `docs-generator`

### Tier 3 — Specialist (monthly or event-driven)
**Listing default**: `"name-only"` in reference overrides — saves tokens; **still callable via `/<name>`**.

`incident-response-assistant`, `observability-assistant`, `slo-assistant`, `runbook-assistant`, `retrospective-assistant`, `durable-execution-assistant`, `metrics-dashboard-assistant`, `migration-assistant`, `security-scan-assistant`, `brainstorm-assistant`, `skill-builder`

> Tier rationale & criteria: [`flows/skill-tiering-rationale.md`](../flows/skill-tiering-rationale.md). Adopters may freely override the reference (promote a Tier 3 skill to `"on"` if they use it daily, or demote any to `"name-only"`).

## Tool Adapters

Specific configurations for various AI tools are located in `skills/tools/`.

### Claude Code / OpenCode
The files in the root of `skills/` (commands, agents, workflows) are directly compatible with Claude Code and OpenCode.

**Installation (Plugin Marketplace):**
```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

### Cursor
Located in `skills/tools/cursor/`.
```bash
cp skills/tools/cursor/.cursorrules .cursorrules
```

### Windsurf
Located in `skills/tools/windsurf/`.
```bash
cp skills/tools/windsurf/.windsurfrules .windsurfrules
```

### Cline
Located in `skills/tools/cline/`.
```bash
cp skills/tools/cline/.clinerules .clinerules
```

### GitHub Copilot
Located in `skills/tools/copilot/`.
```bash
mkdir -p .github
cp skills/tools/copilot/copilot-instructions.md .github/copilot-instructions.md
```

## Contributing

See [CONTRIBUTING.template.md](CONTRIBUTING.template.md) for guidelines on adding new skills or supporting additional AI tools.

## License

Dual-licensed: CC BY 4.0 (documentation) + MIT (code)