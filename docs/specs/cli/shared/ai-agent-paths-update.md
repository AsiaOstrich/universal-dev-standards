# [SHARED-07] AI Agent Paths Configuration Update

**Version**: 1.0.0
**Last Updated**: 2026-01-24
**Status**: Approved
**Spec ID**: SHARED-07
**Parent Spec**: SHARED-06

---

## Summary

This specification defines updates to the AI agent paths configuration module (`ai-agent-paths.js`) to align with official documentation from each AI tool vendor as of January 2026.

---

## Background

### Problem Statement

Claude Code v2.1.3+ has merged slash commands and skills into a unified system. Additionally, research shows that some AI tool path configurations in the codebase were outdated compared to official documentation.

### Research Sources (2026-01-24)

| AI Tool | Official Source | Previous Config Status |
|---------|----------------|------------------------|
| Claude Code | [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills) | ✅ Correct |
| OpenCode | [opencode.ai/docs/commands](https://opencode.ai/docs/commands/) | ✅ Correct |
| Roo Code | [docs.roocode.com/features/slash-commands](https://docs.roocode.com/features/slash-commands) | ✅ Correct |
| Gemini CLI | [cloud.google.com/blog](https://cloud.google.com/blog/topics/developers-practitioners/gemini-cli-custom-slash-commands) | ⚠️ Format note needed |
| GitHub Copilot | [docs.github.com](https://docs.github.com/copilot/get-started/getting-started-with-prompts-for-copilot-chat) | ⚠️ CLI limitation note needed |
| Cline | [docs.cline.bot](https://docs.cline.bot/features/slash-commands/workflows) | ❌ Path incorrect |
| Windsurf | [docs.windsurf.com](https://docs.windsurf.com/windsurf/cascade/workflows) | ❌ Workflows not configured |
| Cursor | [cursor.com/docs/context/rules](https://cursor.com/docs/context/rules) | ✅ Correct |

---

## Detailed Design

### REQ-001: Update Cline Configuration

**Previous (Incorrect)**:
```javascript
'cline': {
  skills: {
    project: '.cline/skills/',
    user: join(homedir(), '.cline', 'skills')
  },
  workflows: {
    project: '.cline/workflows/',
    user: join(homedir(), '.cline', 'workflows')
  }
}
```

**Updated (Correct)**:
```javascript
'cline': {
  skills: {
    project: '.clinerules/skills/',
    user: join(homedir(), '.clinerules', 'skills')
  },
  workflows: {
    // Official path per docs.cline.bot/features/slash-commands/workflows
    project: '.clinerules/workflows/',
    user: join(homedir(), '.clinerules', 'workflows')
  }
}
```

### REQ-002: Update Windsurf Configuration

**Previous (Missing workflows)**:
```javascript
'windsurf': {
  skills: {
    project: '.windsurf/skills/',
    user: join(homedir(), '.codeium', 'windsurf', 'skills')
  },
  workflows: null
}
```

**Updated (Correct)**:
```javascript
'windsurf': {
  skills: {
    project: '.windsurf/skills/',
    user: join(homedir(), '.codeium', 'windsurf', 'skills')
  },
  workflows: {
    // Official path per docs.windsurf.com/windsurf/cascade/workflows
    project: '.windsurf/rules/',
    user: join(homedir(), '.codeium', 'windsurf', 'rules')
  }
}
```

### REQ-003: Add Gemini CLI Format Note

Add `commandFormat` field to clarify TOML format requirement:

```javascript
'gemini-cli': {
  commands: {
    project: '.gemini/commands/',
    user: join(homedir(), '.gemini', 'commands')
  },
  // Gemini CLI uses TOML format for commands, not Markdown
  // See: cloud.google.com/blog/topics/developers-practitioners/gemini-cli-custom-slash-commands
  commandFormat: 'toml',
  // ...
}
```

### REQ-004: Add GitHub Copilot CLI Limitation

Update commands.user to null with explanation:

```javascript
'copilot': {
  commands: {
    project: '.github/prompts/',
    // Note: Custom prompts only work in VS Code IDE, not CLI or Cloud
    // See: docs.github.com/copilot/get-started/getting-started-with-prompts-for-copilot-chat
    user: null
  },
  // ...
}
```

### REQ-005: Update Documentation

Add Claude Code skills/commands merger note to `skills/claude-code/README.md`:

```markdown
## Slash Commands | 斜線命令

> **Claude Code v2.1.3+ Note**: Slash commands and skills are now merged.
> Both `.claude/commands/review.md` and `.claude/skills/review/SKILL.md`
> create `/review` and work identically.
>
> **For other AI tools**: OpenCode, Roo Code, Gemini CLI and others
> still use the traditional commands format.
```

---

## Agent Capability Matrix (Updated)

| Agent | Skills | Commands | Workflows | Format | Notes |
|-------|--------|----------|-----------|--------|-------|
| claude-code | ✅ | ✅ (merged) | ✅ | .md | Commands merged into Skills v2.1.3+ |
| opencode | ✅ | ✅ | ❌ | .md | TUI support |
| roo-code | ✅ | ✅ | ✅ | .md | Full support |
| gemini-cli | ✅ | ✅ | ✅ | .toml | Uses TOML format |
| copilot | ✅ | ⚠️ | ❌ | .prompt.md | VS Code only, not CLI |
| cline | ✅ | ❌ | ✅ | .md | Uses workflows, path: `.clinerules/` |
| windsurf | ✅ | ❌ | ✅ | .md | Uses rules/workflows |
| cursor | ✅ | ❌ | ❌ | .mdc | Rules + Agent Skills |
| codex | ✅ | ❌ | ❌ | .md | AGENTS.md based |

---

## Acceptance Criteria

### Functional Requirements

- [x] AC-001: Cline paths use `.clinerules/` instead of `.cline/`
- [x] AC-002: Windsurf workflows configured with `.windsurf/rules/`
- [x] AC-003: Gemini CLI has `commandFormat: 'toml'` field
- [x] AC-004: GitHub Copilot `commands.user` is `null` with comment
- [x] AC-005: Claude Code README has skills/commands merger note

### Test Coverage

- [ ] Unit test: `ai-agent-paths.test.js` - Updated path assertions for Cline
- [ ] Unit test: `ai-agent-paths.test.js` - Windsurf workflows path
- [ ] Integration test: Verify installation paths work correctly

---

## Migration Impact

### Breaking Changes

**None** - Existing installations continue to work. This update affects new installations only.

### Affected Files

1. `cli/src/config/ai-agent-paths.js` - Configuration updates
2. `skills/claude-code/README.md` - Documentation updates
3. `CHANGELOG.md` - Change documentation

---

## Related Specifications

- [SHARED-06 AI Agent Paths](ai-agent-paths.md)
- [SHARED-05 Skills Installation](skills-installation.md)
- [INIT-02 Configuration Flow](../init/02-configuration-flow.md)
