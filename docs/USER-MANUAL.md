> **⚠️ DEPRECATED** — This manual is outdated (last updated 2026-03-24) and is no longer maintained.
> See the new user documentation at **[docs/user/README.md](user/README.md)** for current guides.
> Archived at: [docs/archive/USER-MANUAL-2026-03-24.md](archive/USER-MANUAL-2026-03-24.md)

---

# User Manual (Archived)

**Version**: 1.0.0
**Last Updated**: 2026-03-24

> **Language**: English | [繁體中文](../locales/zh-TW/docs/USER-MANUAL.md) | [简体中文](../locales/zh-CN/docs/USER-MANUAL.md)

This manual guides software developers from installation to daily productive use of Universal Development Standards (UDS).

---

## Table of Contents

- [What is UDS?](#what-is-uds)
- [Why UDS?](#why-uds)
- [Architecture](#architecture)
- [Installation](#installation)
- [Post-Installation Verification](#post-installation-verification)
- [Your First Command: /discover](#your-first-command-discover)
- [Daily Workflow Map](#daily-workflow-map)
- [Workflow A: Spec-Driven Development (SDD)](#workflow-a-spec-driven-development-sdd)
- [Workflow B: TDD Red-Green-Refactor](#workflow-b-tdd-red-green-refactor)
- [Choosing the Right Workflow](#choosing-the-right-workflow)
- [Legacy Code Strategy](#legacy-code-strategy)
- [Quality Commands](#quality-commands)
- [All Slash Commands Reference](#all-slash-commands-reference)
- [Incremental Adoption Strategy](#incremental-adoption-strategy)
- [A Full Day with UDS](#a-full-day-with-uds)
- [Supported AI Tools](#supported-ai-tools)
- [FAQ](#faq)
- [Next Steps & Resources](#next-steps--resources)

---

## What is UDS?

Universal Development Standards is a **language-agnostic, framework-agnostic** development standards framework designed for the AI era. It provides a unified set of standards, skills, and commands that work across any technology stack.

| Category | Count | Description |
|----------|-------|-------------|
| **Core Standards** | 53 | Universal development guidelines (Markdown) |
| **AI Skills** | 43 | Interactive skills (YAML) |
| **Slash Commands** | 45 | Quick actions for daily development |
| **CLI Commands** | 6 | Command-line tools |

**Three defining characteristics:**

1. **Language-agnostic** — Works with JavaScript, Python, Go, Rust, Java, and any other language
2. **Framework-agnostic** — Works with React, Vue, Spring, Django, and any other framework
3. **AI-native** — Designed specifically for AI-assisted development workflows

---

## Why UDS?

| Problem | UDS Solution |
|---------|--------------|
| Inconsistent commit messages across the team | Standardized Conventional Commits via `/commit` |
| Code reviews that miss critical issues | Systematic 8-dimension review checklist via `/code-review` |
| AI tools giving inconsistent advice | Unified standards that AI tools read and follow |
| New team members take weeks to onboard | Clear standards and guided workflows |
| No one agrees on test coverage expectations | Testing pyramid with explicit ratios (70/20/7/3) |
| Unclear development process | Two methodology systems (SDD and Double-Loop TDD) |

### Design Philosophy

**"Touch a little, protect a little"** — You do not need to adopt all 140+ standards at once. UDS is designed for incremental adoption:

- Start with `/commit` alone — zero cost, immediate benefit
- Add `/code-review` next — catch issues before merge
- Gradually introduce `/tdd` and `/sdd` as the team gets comfortable

> **Boy Scout Rule**: Leave the code better than you found it. Each time you touch code, add a little protection (tests, docs).

---

## Architecture

UDS content is organised along **two independent axes**. They answer different questions, and
conflating them is the most common way to misread the layout.

### Axis 1 — Depth: how much must always be loaded

A behavioural contract telling an AI agent what to read up front and what to leave until asked.
This is the axis that determines context cost.

```
       AI Agent / Developer
              |
              v
      Rules  (core/*.md)                    <- ALWAYS READ
      actionable rules, checklists, thresholds
              |
              +--- needs an explanation? --> Guides (core/guides/*.md)        read on demand
              |
              +--- needs a methodology?  --> Methodologies                    read on demand
                                             (methodologies/guides/*.md)
```

### Axis 2 — Format: how the same standard is encoded

This axis carries **no depth claim**. A standard's `.ai.yaml` and `.md` forms are two encodings
of the same material, chosen by who is reading.

| Aspect | `ai/standards/*.ai.yaml` | `core/*.md` |
|--------|--------------------------|-------------|
| Encoding | Structured YAML | Prose Markdown |
| Best for | Deterministic machine lookup | Human reading and review |
| Relative size | ~69% of the Markdown form — a reformat, not a compaction tier | baseline |

In practice, AI tools load the Rules layer automatically. You only need to reach for Guides when
you want to understand the "why" behind a rule.

> 📐 The depth contract, where it is enforced across integrations, and the measured gap between
> the contract and the current tree are documented in
> [Content Architecture](reference/CONTENT-ARCHITECTURE.md).

---

## Installation

### Method 1: Global Install (Recommended)

```bash
npm install -g universal-dev-standards
cd your-project
uds init
```

### Method 2: No Installation Required

```bash
npx universal-dev-standards init
```

### What `uds init` Does

The interactive initialization will:

1. **Detect** your project type (Node.js, Python, etc.)
2. **Ask** which AI tool(s) you use (Claude Code, Cursor, etc.)
3. **Install** standards to `.standards/` directory
4. **Configure** your AI tool's configuration file (CLAUDE.md, .cursorrules, etc.)

---

## Post-Installation Verification

After running `uds init`, your project gains these new files:

```
your-project/
├── .standards/           # AI standards (.ai.yaml files)
│   ├── testing.ai.yaml
│   ├── commit-message.ai.yaml
│   ├── code-review.ai.yaml
│   └── ...
├── CLAUDE.md             # Claude Code config (if selected)
├── .cursorrules          # Cursor config (if selected)
└── ...your existing files remain untouched
```

**Verify your installation:**

```bash
uds check    # Check adoption status and file integrity
uds skills   # List installed skills
```

---

## Your First Command: /discover

Before modifying an existing codebase, run `/discover` to assess its health:

```bash
/discover              # Full project health assessment
/discover auth         # Focused assessment of auth modules
/discover payments     # Assess risks before adding payment features
```

### Example Output

```
Project Health Report
=====================
Overall Score: 7.2 / 10

| Dimension       | Score | Status  | Key Finding              |
|-----------------|-------|---------|--------------------------|
| Architecture    | 8/10  | Good    | Clean module boundaries  |
| Dependencies    | 6/10  | Warning | 5 outdated, 1 critical   |
| Test Coverage   | 7/10  | Fair    | 72% line coverage        |
| Security        | 8/10  | Good    | No critical vulnerabilities |
| Technical Debt  | 6/10  | Warning | 23 TODOs, 3 hotspots     |

Verdict: CONDITIONAL
Recommendations:
1. [HIGH] Update lodash to fix CVE-2024-XXXX
2. [MED]  Add tests for src/payments/ (0% coverage)
3. [LOW]  Resolve TODO backlog in src/utils/
```

### Assessment Dimensions

| Dimension | What It Checks |
|-----------|---------------|
| **Architecture** | Module structure, dependency graph, entry points |
| **Dependencies** | Outdated packages, known vulnerabilities, license risks |
| **Test Coverage** | Existing test suite, coverage gaps, test quality |
| **Security** | npm audit findings, hardcoded secrets, exposed endpoints |
| **Technical Debt** | TODOs, code duplication, complexity hotspots |

---

## Daily Workflow Map

Use this decision tree to choose the right workflow for your task:

```
First time in this codebase?
│
├─ Yes → /discover (assess first)
│
└─ No (familiar with codebase)
   │
   ├─ New feature?
   │   └─ Yes → SDD workflow: /sdd → /derive-all → implement
   │
   ├─ Bug fix?
   │   └─ Yes → Write failing test → fix → /commit
   │
   ├─ Modifying existing code?
   │   ├─ Has tests? → Direct /tdd cycle
   │   └─ No tests? → Write characterization test first
   │
   └─ Pure refactoring?
       └─ Ensure test coverage → refactor → tests pass
```

> **Key principle**: Choose the right workflow for the task, not memorize all commands.

---

## Workflow A: Spec-Driven Development (SDD)

SDD is optimized for **new features** and **AI-assisted development**. The core idea: **spec first, code second**.

### The 5 Phases

```
Phase 1        Phase 2        Phase 3         Derive          Phase 4         Phase 5
Create Spec → Review Spec → Approve Spec → Generate Tests → Implement    → Verify
/sdd          /sdd review    /sdd approve    /derive-all     /sdd implement  /sdd verify
```

| Phase | Command | Input | Output |
|-------|---------|-------|--------|
| 1. Create | `/sdd user-auth` | Requirements description | `SPEC-001.md` |
| 2. Review | `/sdd review` | SPEC file | Review comments |
| 3. Approve | `/sdd approve` | SPEC file | Updated status |
| Derive | `/derive-all` | SPEC file | `.feature` + `.test.ts` |
| 4. Implement | `/sdd implement` | SPEC file | Progress tracking |
| 5. Verify | `/sdd verify` | SPEC file | Verification report |

### Example: Adding Two-Factor Authentication

**Step 1 — Create specification:**

```bash
/sdd two-factor-authentication
```

The AI guides you to define:
- **User story**: As a user, I want to enable 2FA to improve account security
- **Acceptance criteria (AC)**:
  - AC-1: User can generate TOTP secret key
  - AC-2: User can scan QR code
  - AC-3: System verifies 6-digit OTP
  - AC-4: Backup codes are provided

Output: `docs/specs/SPEC-001.md`

**Step 2 — Derive tests from the approved spec:**

```bash
/derive-all docs/specs/SPEC-001.md
```

This automatically generates:

**BDD scenarios (.feature):**
```gherkin
@SPEC-001 @AC-1
Scenario: User generates TOTP secret key
  Given the user is logged in
  When the user enables two-factor authentication
  Then the system should generate a TOTP secret key
  And display a QR code for scanning
```

**TDD test skeletons (.test.ts):**
```typescript
describe('SPEC-001: Two-Factor Authentication', () => {
  describe('AC-1: Generate TOTP secret key', () => {
    it('should generate valid TOTP secret when user enables 2FA', () => {
      // Arrange - [TODO]
      // Act - [TODO]
      // Assert - [TODO]
    });
  });
});
```

> Each acceptance criterion maps 1:1 to a test — the spec is the blueprint for your tests.

---

## Workflow B: TDD Red-Green-Refactor

TDD is best for **bug fixes**, **small features**, and **modifying existing code**.

### The Three Phases

```
    ┌──────────────────────────────────┐
    │                                  │
    │   RED         GREEN      REFACTOR│
    │   /tdd red    /tdd green /tdd refactor
    │     │           │           │    │
    │     v           v           v    │
    │   Write       Minimum     Improve│
    │   failing     code to     code   │
    │   test        pass test   quality│
    │     │           │           │    │
    │     └───────────┴───────────┘    │
    │            Repeat cycle          │
    └──────────────────────────────────┘
```

| Phase | Command | Rule |
|-------|---------|------|
| RED | `/tdd red` | Write test only, no implementation. Test must fail. |
| GREEN | `/tdd green` | Write the minimum code to pass the test. Nothing more. |
| REFACTOR | `/tdd refactor` | Improve code quality. Tests must keep passing. |

### Example: Implementing `isValidEmail()`

**Step 1: `/tdd red` — Write failing test**

```javascript
// tests/email.test.js
test('should return true for valid email', () => {
  expect(isValidEmail('user@example.com')).toBe(true);
});

test('should return false for invalid email', () => {
  expect(isValidEmail('not-an-email')).toBe(false);
});
```

**Step 2: `/tdd green` — Minimum implementation**

```javascript
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

**Step 3: `/tdd refactor` — Improve quality**

```javascript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
}
```

---

## Choosing the Right Workflow

| Scenario | Recommended Workflow |
|----------|---------------------|
| New project with AI assistance | `/sdd` → `/derive-all` → implement |
| New feature with clear requirements | `/sdd` → `/derive-all` → implement |
| Legacy system modification | `/bdd` → `/tdd` cycles |
| Quick prototype | `/tdd` only |
| Complex business logic | `/bdd discovery` → `/tdd` |
| Bug fix | Write failing test → fix → `/commit` |
| Vague idea, need exploration | `/brainstorm` → `/requirement` → `/sdd` |
| Multiple stakeholders need alignment | `/atdd` → `/sdd` or `/bdd` |

> **Simple rule**: New things → SDD. Changing old things → TDD. Not sure → `/discover` first.

---

## Legacy Code Strategy

### Three-Step Safe Modification

```
Step 1: Write Characterization Test (record current behavior)
        ↓
Step 2: /tdd cycle to add new behavior
        ↓
Step 3: Gradually refactor
```

### What is a Characterization Test?

A test that captures what the code *currently does* — whether it is correct or not. It serves as your safety net before making changes.

```javascript
// Record current behavior, even if it is a bug
test('characterization: login validates email format', () => {
  const result = login('invalid-email', 'password');
  // Observation: current code accepts invalid email (this is a bug)
  expect(result.success).toBe(true); // Record as-is
});
```

### Reverse Engineering Commands

For larger legacy code comprehension:

```bash
/reverse spec          # Reverse engineer code into specifications
/reverse-bdd           # Convert to BDD scenarios
/reverse-tdd           # Analyze BDD-TDD coverage gap
```

> **Key principle**: Protect before modifying. Never change legacy code without tests.

---

## Quality Commands

### `/commit` — Standardized Commits

After completing your code, use `/commit` to generate a well-formatted commit message:

```bash
/commit                     # Auto-analyze staged changes
/commit fix login bug       # Generate message from description
```

**Generated format:**

```
feat(auth): add two-factor authentication support

Implement TOTP secret generation, QR code display, and OTP verification.
Users can enable 2FA in account settings and receive backup codes.

Refs: SPEC-001
```

**Commit types:**

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): add 2FA` |
| `fix` | Bug fix | `fix(login): fix password validation` |
| `refactor` | Code refactoring | `refactor(utils): extract shared function` |
| `docs` | Documentation | `docs(api): update API documentation` |
| `test` | Tests | `test(auth): add login tests` |
| `chore` | Maintenance | `chore(deps): update dependencies` |

### `/code-review` — Code Review

Before submitting, use `/code-review` for systematic review:

```bash
/code-review                    # Review all changes in current branch
/code-review src/auth.js        # Review specific file
/code-review feature/login      # Review specific branch
```

**8 review dimensions:**

| # | Dimension | Focus |
|---|-----------|-------|
| 1 | Functionality | Does it work correctly? |
| 2 | Design | Is the architecture appropriate? |
| 3 | Quality | Is the code clean and maintainable? |
| 4 | Readability | Is it easy to understand? |
| 5 | Tests | Is there adequate test coverage? |
| 6 | Security | Are there any vulnerabilities? |
| 7 | Performance | Is it efficient? |
| 8 | Error Handling | Are errors handled properly? |

**Comment prefix system:**

| Prefix | Meaning | Action |
|--------|---------|--------|
| **BLOCKING** | Must fix before merge | Required |
| **IMPORTANT** | Should fix | Recommended |
| **SUGGESTION** | Nice-to-have | Optional |
| **QUESTION** | Need clarification | Discuss |

### `/checkin` — Pre-Commit Quality Gates

Run `/checkin` before committing to verify all quality gates pass (tests, linting, standards compliance).

---

## All Slash Commands Reference

| Family | Commands | Purpose |
|--------|----------|---------|
| **Explore** | `/discover`, `/dev-workflow` | Assess project, guide workflow |
| **Spec** | `/sdd`, `/requirement`, `/brainstorm` | Spec-driven development |
| **Derive** | `/derive-all`, `/derive-bdd`, `/derive-tdd`, `/derive-atdd` | Generate tests from specs |
| **Develop** | `/tdd`, `/bdd`, `/atdd` | Methodology workflows |
| **Quality** | `/commit`, `/code-review`, `/checkin`, `/coverage`, `/ac-coverage` | Daily quality management |
| **Docs** | `/docs`, `/docgen`, `/changelog`, `/release` | Documentation & release |
| **Reverse** | `/reverse`, `/reverse-sdd`, `/reverse-bdd`, `/reverse-tdd` | Legacy code reverse engineering |
| **Refactor** | `/refactor` | Refactoring guidance |
| **Tools** | `/init`, `/check`, `/update`, `/config`, `/methodology`, `/guide` | Setup & configuration |

> Don't memorize them all. Type `/dev-workflow` and it will guide you to the right command.

---

## Incremental Adoption Strategy

You don't need to learn all commands at once. Adopt in stages:

### Week 1: Zero-Cost Start

```bash
/commit     # Standardize commit messages
/code-review     # Self-review before push
```

> These two commands alone will immediately improve code quality.

### Weeks 2-3: Add Test Protection

```bash
/discover   # Understand project health
/tdd        # Write new features with TDD
```

### Week 4+: Full Workflow

```bash
/sdd        # Spec-driven development
/derive-all # Auto-generate tests
/bdd        # Behavior-driven development
```

> **Mindset**: Learn one new command per week. In a month, you'll be fully productive.

---

## A Full Day with UDS

```
09:00  /discover auth          # Assess the auth module before changes
       → Health score 7.2/10, CONDITIONAL

09:15  /sdd add-2fa           # Create two-factor auth specification
       → Output: SPEC-001.md

09:30  /sdd review            # Review spec completeness
       → 4 ACs confirmed, no gaps

09:45  /derive-all            # Generate BDD + TDD from spec
       → Output: 4 .feature files + 4 .test.ts files

10:00  /tdd red               # Start TDD cycle
10:30  /tdd green             # Implement minimum code
11:00  /tdd refactor          # Improve quality
       → Repeat cycle until all ACs complete

12:00  /commit                # Standardized commit
       → feat(auth): add two-factor authentication

12:05  /code-review                # Final review
       → 0 BLOCKING, 1 SUGGESTION
```

---

## Supported AI Tools

| AI Tool | Status | Skills | Slash Commands | Config File |
|---------|--------|--------|----------------|-------------|
| **Claude Code** | Complete | 26 | 30 | `CLAUDE.md` |
| **OpenCode** | Complete | 26 | 30 | `AGENTS.md` |
| **Gemini CLI** | Preview | 18+ | 20+ | `GEMINI.md` |
| **Cursor** | Complete | Core | Simulated | `.cursorrules` |
| **Cline / Roo Code** | Partial | Core | Workflow | `.clinerules` |
| **Windsurf** | Partial | Yes | Rulebook | `.windsurfrules` |

> **One set of standards, multiple tools** — switching AI tools doesn't mean re-learning standards.

---

## FAQ

**Q: Will UDS restrict my technology choices?**
A: No. UDS is language-agnostic and framework-agnostic. It defines process and quality standards, not technology choices.

**Q: Do I need an AI tool to use UDS?**
A: No. Core standards are Markdown files that humans can read directly. AI tools just make the workflow smoother.

**Q: Can I use UDS alone without my team adopting it?**
A: Yes. The incremental adoption design supports individual use. Start with `/commit` and `/code-review` on your own, then introduce the team when they see results.

**Q: Does UDS conflict with ESLint / Prettier?**
A: They are complementary. ESLint/Prettier handle code formatting. UDS handles higher-level development process and quality standards.

**Q: What if I don't need specs for everything?**
A: You shouldn't write specs for everything. UDS follows the "touch a little, protect a little" principle. Only use `/sdd` for significant new features. Bug fixes and small changes just need `/tdd` and `/commit`.

**Q: How do I update to a newer version of UDS?**
A: Run `uds update` in your project directory. It will update standards while preserving your customizations.

---

## Next Steps & Resources

### Start Now

```bash
npm install -g universal-dev-standards
cd your-project
uds init
```

### Recommended Learning Path

1. Start with `/commit` + `/code-review` to build habits
2. Try `/sdd` when building a new feature
3. When unsure what to do next, type `/dev-workflow`

### Reference Documents

| Resource | Description |
|----------|-------------|
| [Daily Workflow Guide](../adoption/DAILY-WORKFLOW-GUIDE.md) | Complete daily workflow reference |
| [Command Family Overview](../skills/commands/COMMAND-FAMILY-OVERVIEW.md) | Command architecture and scenarios |
| [Cheatsheet](user/CHEATSHEET.md) | Quick reference for all features |
| [Feature Reference](reference/FEATURE-REFERENCE.md) | Complete feature catalog (182 features) |
| [README](../README.md) | Project overview |

### Getting Help

- Type `/dev-workflow` for guided workflow selection
- Type `/guide <standard-name>` for specific standard reference
- Visit the [GitHub repository](https://github.com/AsiaOstrich/universal-dev-standards) for issues and discussions

---

## License

- Documentation (Markdown): CC BY 4.0
- Code (JavaScript): MIT
