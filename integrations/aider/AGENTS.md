# Universal Development Standards

**Version**: 1.0.0
**Last Updated**: 2026-03-24

This project follows the Universal Dev Standards to ensure high-quality, hallucination-free code and documentation.

---

## Core Standards Usage Rule

> **Core Standards Usage Rule**:
> When verifying standards, checking code, or performing tasks, **PRIORITIZE** reading the concise rules in `core/` (e.g., `core/testing-standards.md`).
> **ONLY** read `core/guides/` or `methodologies/guides/` when explicitly asked for educational content, detailed explanations, or tutorials.
> This ensures token efficiency and focused context.

---

## Spec-Driven Development (SDD) Priority

**Rule**: When an SDD tool (such as OpenSpec, Spec Kit, etc.) is integrated in this project and provides specific commands (e.g., slash commands like `/openspec` or `/sdd`), you MUST prioritize using these commands over manual file editing.

**Detection**:
- OpenSpec: Check for `openspec/` directory or `openspec.json`
- Spec Kit: Check for `specs/` directory or `.speckit` configuration

**Rationale**:
- **Consistency**: Tools ensure spec structure follows strict schemas
- **Traceability**: Commands handle logging, IDs, and linking automatically
- **Safety**: Tools have built-in validation preventing invalid states

Reference: `core/spec-driven-development.md`

---

## Anti-Hallucination Protocol

Reference: `core/anti-hallucination.md`

### 1. Evidence-Based Analysis

- You MUST read files before analyzing them.
- Do NOT guess APIs, class names, or library versions.
- If you haven't seen the code, state: "I need to read [file] to confirm".

### 2. Source Attribution

Every factual claim about the code MUST cite sources:
- Code: `[Source: Code] path/to/file:line`
- External docs: `[Source: External] http://url (Accessed: Date)`

### 3. Certainty Classification

Use tags to indicate confidence level:
- `[Confirmed]` - Verified from source
- `[Inferred]` - Logically deduced
- `[Assumption]` - Reasonable guess
- `[Unknown]` - Cannot determine

### 4. Recommendations

When presenting options, you MUST explicitly state a "Recommended" choice with reasoning.

---

## Aider-Specific Integration Points

### Conventions File

Aider reads a conventions file (`.aider.conf.yml` or via `--read` flag) for project rules. Load this AGENTS.md as a read-only context file:

```bash
aider --read AGENTS.md
```

Or add to `.aider.conf.yml`:

```yaml
read:
  - AGENTS.md
```

### Commit Standards

Aider generates commits automatically. Configure it to follow Conventional Commits (reference: `core/commit-message-guide.md`):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, chore, test, refactor, style

Use the `--commit-prompt` flag or set `commit-prompt` in `.aider.conf.yml` to enforce the format:

```yaml
commit-prompt: "Generate a commit message using Conventional Commits format: <type>(<scope>): <subject>"
```

### Lint and Test Integration

Configure Aider to run linting and tests after edits:

```yaml
auto-lint: true
auto-test: true
lint-cmd: "npm run lint"
test-cmd: "npm test"
```

---

## Documentation & Commits

### File Structure

Follow documentation structure guidelines (reference: `core/documentation-structure.md`).

### Quality Gates

Before finishing, verify work against `core/checkin-standards.md`:
- [ ] Code compiles successfully
- [ ] All tests pass
- [ ] No hardcoded secrets
- [ ] Documentation updated if applicable

---

## Workflow Enforcement Gates

**CRITICAL**: Before executing any workflow phase command, you MUST check prerequisites.

### Phase Gates

| Workflow | Phase | Prerequisite | On Failure |
|---------|-------|-------------|------------|
| SDD | implement | Spec status = Approved | Approve spec first |
| SDD | verify | All ACs have code + tests | Implement first |
| TDD | GREEN | Failing test exists | Stay in RED |
| TDD | REFACTOR | All tests passing | Stay in GREEN |
| BDD | AUTOMATION | `.feature` file exists | FORMULATION |
| Commit | feat/fix | Check active specs | Suggest `Refs: SPEC-XXX` |

**NEVER** write implementation code before a failing test exists (TDD).
**NEVER** write step definitions before `.feature` files exist (BDD).

Reference: `.standards/workflow-enforcement.ai.yaml`

---

## Code Review Standards

Reference: `core/code-review-checklist.md`

When reviewing code, check:
1. **Functionality** - Does it work as intended?
2. **Security** - No vulnerabilities (OWASP Top 10)?
3. **Performance** - Efficient algorithms and queries?
4. **Maintainability** - Clean, readable code?
5. **Tests** - Adequate test coverage?

---

## AI Response Navigation / AI 回應導航

**Rule**: Every substantive AI response MUST end with a Navigation Footer suggesting next steps.
**規則**：每個實質性的 AI 回應結尾必須包含導航區塊，建議下一步行動。

**Key behaviors / 關鍵行為**:
- Append navigation suggestions after completing tasks, providing analysis, asking questions, or reporting errors
- Mark the recommended option with ⭐ when providing multiple choices
- Use contextual templates (task completed, user question, error/failure, in progress, informational reply)
- Adapt option count to context (1-5, never exceed 5)
- Prefer slash commands in suggestions when applicable

**豁免 / Exemption**: Ultra-short confirmations ("OK", "Done") may omit navigation.

Reference: `.standards/ai-response-navigation.ai.yaml` (or `core/ai-response-navigation.md`)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-24 | Initial Aider integration |

---

## License

This document is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
