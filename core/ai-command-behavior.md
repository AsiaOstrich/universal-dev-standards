# AI Command Behavior Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/ai-command-behavior.md) | [简体中文](../locales/zh-CN/core/ai-command-behavior.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-24
**Applicability**: All projects using AI-assisted commands or skills
**Scope**: universal
**Industry Standards**: None (Emerging AI tool practice)
**References**: [SPEC-STD-07](../docs/specs/standards/SPEC-STD-07-ai-command-behavior.md)

---

## Purpose

This standard defines a structure for specifying AI Agent runtime behavior in command/skill definition files. It ensures that AI agents produce consistent, predictable interactions when executing commands — regardless of which AI model or tool runs them.

**Problem**: Commands define "what" to do but lack "how" the AI should interact with the user, leading to unpredictable behavior.

**Solution**: A standard `## AI Agent Behavior` section with four subsections covering entry routing, interaction flow, stop points, and error handling.

---

## AI Behavior Section Structure

Every command definition file that requires AI interaction SHOULD include:

```markdown
## AI Agent Behavior | AI 代理行為

### Entry Router | 進入路由

### Interaction Script | 互動腳本

### Stop Points | 停止點

### Error Handling | 錯誤處理
```

---

## Section Definitions

### 1. Entry Router

Defines what the AI does for each invocation pattern. Use a decision table for commands with multiple invocation patterns.

**Format:**

```markdown
| Input | AI Action |
|-------|-----------|
| `/cmd` | [action when no arguments] |
| `/cmd <name>` | [action with name argument] |
| `/cmd <phase>` | [action with phase subcommand] |
| `/cmd <phase> <target>` | [action with phase and target] |
```

**Simple commands** (single invocation pattern) may use a one-line description instead.

**Rules:**
- Every documented invocation pattern MUST have a corresponding entry
- The "no arguments" case MUST always be defined
- Entry actions MUST be deterministic — no ambiguity in what happens first

### 2. Interaction Script

Defines step-by-step AI behavior using **mixed granularity**:

| Element | Granularity | Reason |
|---------|-------------|--------|
| Decision points | Precise (IF/THEN) | Affects downstream flow |
| General steps | Guideline (numbered list) | AI needs flexibility |

**Decision point format:**

```markdown
**Decision: [Name]**
- IF [condition A] → [specific action]
- IF [condition B] → [specific action]
- ELSE → [default action]
```

**General step format:**

```markdown
1. [Step description]
2. [Step description]
3. [Step description]
```

**Rules:**
- Decision points MUST use explicit IF/THEN/ELSE
- General steps SHOULD use numbered lists
- Output format (what the AI shows to the user) SHOULD be specified for key outputs

### 3. Stop Points

Defines moments where the AI MUST pause and wait for user confirmation.

**Marker format:**

```markdown
🛑 **STOP**: [description] — wait for user confirmation before continuing
```

**Default stop principles** (apply when no explicit stop points are defined):

| Situation | Action |
|-----------|--------|
| About to write/modify files | 🛑 STOP |
| About to execute irreversible operations | 🛑 STOP |
| Phase/stage completion | 🛑 STOP |
| Need additional information from user | 🛑 STOP |
| Read-only analysis complete, showing results | ▶️ CONTINUE |

**Rules:**
- Stop points MUST be explicit — do not rely on AI judgment
- Each stop point MUST describe what the AI is waiting for
- The number of stop points should be proportional to the operation's risk

### 4. Error Handling

Defines AI behavior when prerequisites fail or unexpected states occur.

**Format:**

```markdown
| Error Condition | AI Action |
|-----------------|-----------|
| [prerequisite not met] | [guide to correct step] |
| [unexpected state] | [stop and ask user] |
```

**Default error principles:**

1. **State the problem**: Tell user which prerequisite failed
2. **Guide to resolution**: Suggest the correct command or step
3. **Never silently skip**: Do not proceed by ignoring failures
4. **Never auto-fix without permission**: Unless explicitly allowed in the command definition
5. **Ask when uncertain**: Stop and ask rather than guess

---

## Applicability Rules

Not all commands need a full `## AI Agent Behavior` section.

| Condition | Full Definition Required | Reason |
|-----------|-------------------------|--------|
| Multi-phase workflow | ✅ Yes | Complex flow needs guidance |
| Multiple invocation patterns | ✅ Yes | Entry routing is ambiguous otherwise |
| Single clear action | ❌ No | Behavior is self-evident |
| Pure information query | ❌ No | No interaction decisions to make |
| Orchestration of sub-commands | ✅ Yes | Coordination logic needs definition |

**Heuristic**: If two different AI models could reasonably interpret the command differently, it needs a behavior definition.

---

## Example: Minimal Behavior Section

For a command like `/coverage` with moderate complexity:

```markdown
## AI Agent Behavior

### Entry Router

| Input | AI Action |
|-------|-----------|
| `/coverage` | Detect test framework, run coverage, show summary |
| `/coverage <path>` | Run coverage for specific path only |

### Interaction Script

1. Detect project test framework (look for jest.config, vitest.config, etc.)
2. Run coverage command
3. Parse output and present summary table

**Decision: Low coverage detected**
- IF coverage < project threshold → highlight gaps, suggest files to test
- ELSE → show summary only

### Stop Points

🛑 **STOP**: After showing coverage summary — ask if user wants detailed file-by-file breakdown

### Error Handling

| Error Condition | AI Action |
|-----------------|-----------|
| No test framework detected | Ask user which framework to use |
| Tests fail during coverage run | Show failures first, ask if user wants coverage anyway |
```

---

## Quick Reference Card

### Section Checklist

| Section | Must Define | Key Rule |
|---------|------------|----------|
| Entry Router | All invocation patterns | "No arguments" case is mandatory |
| Interaction Script | Decision points + general flow | Decision = precise, Steps = guideline |
| Stop Points | Every pause moment | Explicit markers, no AI guessing |
| Error Handling | Prerequisite failures | Never silently skip |

### Granularity Guide

| Element | Level | Format |
|---------|-------|--------|
| Entry Router | Precise | Decision table |
| Stop Points | Precise | 🛑 markers |
| Interaction Script | Guideline | Numbered steps + IF/THEN for decisions |
| Error Handling | Principles | Error table + default rules |

---

## Related Standards

- [AI Instruction Standards](ai-instruction-standards.md) — file structure for AI instruction files
- [AI Agreement Standards](ai-agreement-standards.md) — human-AI collaboration agreements
- [Anti-Hallucination Standards](anti-hallucination.md) — evidence-based AI behavior

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-24 | Initial release |

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
