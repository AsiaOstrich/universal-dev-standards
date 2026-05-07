---
name: sweep
scope: universal
description: |
  Scan codebase for debug artifacts and code quality issues; optionally auto-fix safe patterns.
  Use when: before committing, during PR review, or periodic codebase cleanup.
  Keywords: sweep, debug cleanup, console.log, debugger, TODO, ts-any, code quality, 掃描, 清理.
allowed-tools: Read, Grep, Glob, Bash(find:*), Edit, Write
argument-hint: "[--fix] [--report] [--path <dir>] [--exclude <pattern>]"
---

# Sweep Assistant | 掃碼助手

> **Language**: English | 繁體中文

Scan the codebase for debug artifacts, code quality issues, and technical debt markers.
Optionally auto-fix safe patterns (console.log, debugger statements).

---

## Scan Patterns | 掃描模式

| Pattern ID | Label | Auto-fixable | Description |
|------------|-------|-------------|-------------|
| `console-log` | console.log / console.debug / console.trace | ✅ Yes | Debug output left in production code |
| `debugger` | debugger statement | ✅ Yes | Debugger breakpoints left in code |
| `todo-fixme` | TODO / FIXME / HACK / XXX | ❌ Report only | Technical debt markers |
| `ts-any` | TypeScript `any` type | ❌ Report only | Type safety violations |

---

## Usage | 使用方式

```bash
/sweep                        # Scan current directory, report findings
/sweep --fix                  # Scan and auto-fix fixable patterns
/sweep --report               # Scan and save report to .uds/sweep-report.json
/sweep --path src/            # Scan specific directory
/sweep --exclude "**/*.test.ts"  # Exclude patterns (glob)
```

---

## Workflow | 執行工作流程

### Step 1: Discover Files
Use Glob tool to find all source files under the target path.
Default excludes: `node_modules/`, `dist/`, `.git/`, `*.min.js`, `coverage/`.

### Step 2: Scan Each Pattern
For each pattern, use Grep to find matches across all files.
Collect findings: `{ file, line, column, pattern_id, label, fixable, content }`.

### Step 3: Report Findings
Output a structured summary:
```
📊 Sweep Results
─────────────────────────────────────
console-log:   12 findings  (auto-fixable)
debugger:       2 findings  (auto-fixable)
todo-fixme:    28 findings  (report only)
ts-any:         5 findings  (report only)
─────────────────────────────────────
Total: 47 findings  |  Fixable: 14
```

### Step 4: HITL Gate (if --fix and findings > 20)
If `--fix` flag is set AND total fixable findings exceed 20:
**Pause and require explicit user confirmation** before applying fixes.
Show the list of files that will be modified.

### Step 5: Apply Fixes (if --fix confirmed)
For each fixable finding:
- `console-log`: Remove the line if it contains only the console statement
- `debugger`: Remove the line if it contains only the debugger statement

Use Edit tool to apply changes file by file.
Report: "Fixed N findings in M files."

### Step 6: Save Report (if --report)
Write findings to `.uds/sweep-report.json`:
```json
{
  "timestamp": "<ISO8601>",
  "total_findings": 47,
  "fixable": 14,
  "fixed": 14,
  "findings_by_pattern": { "console-log": 12, "debugger": 2, "todo-fixme": 28, "ts-any": 5 },
  "files_modified": ["src/auth.ts", "src/utils.ts"]
}
```

---

## Configuration | 設定

Configure via `uds.project.yaml`:

```yaml
sweep:
  default_path: "src/"
  exclude_patterns:
    - "**/*.test.ts"
    - "**/*.spec.ts"
    - "**/fixtures/**"
  hitl_threshold: 20       # Require confirmation if fixable findings exceed this
  patterns:
    enabled:
      - console-log
      - debugger
      - todo-fixme
      - ts-any
```

---

## Next Steps Guidance | 下一步引導

After `/sweep` completes, suggest:

> - Run `/checkin` to verify overall code quality before committing
> - Run `/review` to review the cleaned-up changes
> - Run `/commit` to commit the fixes

---

## Related Standards | 相關標準

- [Checkin Standards](../../.standards/checkin-standards.ai.yaml) — Pre-commit quality gates
- [Code Review](../code-review-assistant/SKILL.md) — Code review assistant
- [Testing Guide](../testing-guide/SKILL.md) — Testing standards

---

## Version History | 版本歷程

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-28 | Initial release — XSPEC-097 Phase 1 (從上游遷移) |

---

## License | 授權

This skill is released under [MIT License](https://opensource.org/licenses/MIT) and [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
