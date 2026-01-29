# [SPEC-DETECT-01] AI Tool Auto-Detection / AI 工具自動偵測

**Priority**: P2
**Status**: Draft
**Last Updated**: 2026-01-28
**Feature ID**: SYS-DETECT-001
**Dependencies**: [SPEC-CASCADE-01 Cascading Config]

---

## Summary / 摘要

AI Tool Auto-Detection provides automatic detection of the AI development environment and adapts UDS behavior accordingly. It detects tools like Claude Code, Cursor, Copilot, and adjusts skill formats, agent execution modes, and configuration paths.

AI 工具自動偵測提供自動偵測 AI 開發環境並相應調整 UDS 行為。它偵測 Claude Code、Cursor、Copilot 等工具，並調整技能格式、代理執行模式和配置路徑。

---

## Motivation / 動機

### Problem Statement / 問題陳述

1. **Manual Configuration**: Users must manually specify AI tool
2. **Version Incompatibilities**: Different tool versions have different capabilities
3. **Format Mismatches**: Skills may not work if formatted for wrong tool
4. **Feature Gaps**: Can't leverage tool-specific features

### Solution / 解決方案

An auto-detection system that:
- Detects AI tool from environment
- Determines tool version and capabilities
- Adapts UDS output formats accordingly
- Enables tool-specific optimizations

---

## User Stories / 使用者故事

### US-1: Automatic Adaptation

```
As a developer switching between Cursor and Claude Code,
I want UDS to detect which tool I'm using,
So that it works correctly without reconfiguration.

作為在 Cursor 和 Claude Code 之間切換的開發者，
我想要 UDS 偵測我正在使用哪個工具，
讓它無需重新配置就能正確運作。
```

### US-2: Version-Specific Features

```
As a developer using Cursor v2.3,
I want UDS to detect that SKILL.md is supported,
So that skills are installed in the correct format.

作為使用 Cursor v2.3 的開發者，
我想要 UDS 偵測到支援 SKILL.md，
讓技能以正確的格式安裝。
```

### US-3: Capability Reporting

```
As a developer troubleshooting an issue,
I want to see what UDS detected about my environment,
So that I can understand why something isn't working.

作為排除問題的開發者，
我想要看到 UDS 偵測到的環境資訊，
讓我了解為什麼某些功能不起作用。
```

---

## Acceptance Criteria / 驗收條件

### AC-1: Tool Detection

**Given** UDS commands are run
**When** environment is analyzed
**Then** AI tool is detected:

| Detection Method | Tool | Indicators |
|-----------------|------|------------|
| Process | Claude Code | `claude` process, `CLAUDE_*` env vars |
| Process | Cursor | `cursor` process, `CURSOR_*` env vars |
| Process | VS Code + Copilot | `code` process, `GITHUB_COPILOT_*` |
| Process | Windsurf | `windsurf` process |
| Config Files | Claude Code | `.claude/` directory |
| Config Files | Cursor | `.cursorrules` file |
| Config Files | OpenCode | `.opencode/` directory |

### AC-2: Version Detection

**Given** tool is detected
**When** version is analyzed
**Then** version info is extracted:

```json
{
  "tool": "cursor",
  "version": "2.3.35",
  "features": {
    "skill-md": true,
    "task-tool": false,
    "agents": true,
    "workflows": false
  }
}
```

### AC-3: Capability Matrix

**Given** tool and version are known
**When** capabilities are determined
**Then** matrix is applied:

| Tool | Version | SKILL.md | Task Tool | Agents | Workflows |
|------|---------|----------|-----------|--------|-----------|
| Claude Code | >= 1.0 | ✓ | ✓ | ✓ | ✓ |
| Cursor | >= 2.3 | ✓ | ✗ | ✓ (inline) | ✗ |
| Cursor | < 2.3 | ✗ | ✗ | ✗ | ✗ |
| OpenCode | >= 0.5 | ✓ | ✓ | ✓ | ✓ |
| Copilot | any | ✗ | ✗ | ✓ (inline) | ✗ |
| Windsurf | >= 1.0 | ✓ | ✗ | ✓ | ✗ |

### AC-4: Automatic Adaptation

**Given** capabilities are known
**When** UDS performs actions
**Then** behavior adapts:

| Action | Adaptation |
|--------|------------|
| Skill install | Choose SKILL.md or instructions format |
| Agent run | Use Task tool or inline injection |
| Workflow run | Execute or show manual steps |
| Path selection | Use tool-specific directories |

### AC-5: Detection Override

**Given** auto-detection may be wrong
**When** user wants to override
**Then** override is supported:

```bash
# Override tool detection
uds --tool cursor check

# Set in config
uds configure set tool cursor

# Environment variable
UDS_TOOL=cursor uds check
```

### AC-6: Detection Report

**Given** I run `uds env`
**When** environment is analyzed
**Then** report is displayed:

```
UDS Environment Report

AI Tool Detection:
  Detected: cursor
  Version: 2.3.35
  Confidence: high (process + config files)

Capabilities:
  ✓ SKILL.md format
  ✗ Task tool
  ✓ Agent definitions (inline mode)
  ✗ Workflow execution

Paths:
  Skills: .cursor/skills/
  Agents: .cursor/agents/
  Config: .cursorrules

Override: uds configure set tool <tool>
```

---

## Technical Design / 技術設計

### Detection Flow / 偵測流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Detection Flow                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Start Detection                                                        │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 1. Check Override                                       │           │
│   │    • Config setting                                     │           │
│   │    • Environment variable                               │           │
│   │    • CLI flag                                           │           │
│   └────────────────────────────────────────────────────────┘           │
│        │ (if no override)                                               │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 2. Process Detection                                    │           │
│   │    • Check running processes                            │           │
│   │    • Check environment variables                        │           │
│   └────────────────────────────────────────────────────────┘           │
│        │ (if inconclusive)                                              │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 3. File Detection                                       │           │
│   │    • Check config directories                           │           │
│   │    • Check config files                                 │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ▼                                                                │
│   ┌────────────────────────────────────────────────────────┐           │
│   │ 4. Version Detection                                    │           │
│   │    • Parse version from process/files                   │           │
│   │    • Determine capabilities                             │           │
│   └────────────────────────────────────────────────────────┘           │
│        │                                                                │
│        ▼                                                                │
│   Detection Result                                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Detector Implementation / 偵測器實作

```javascript
// detection/tool-detector.js
export class ToolDetector {
  async detect() {
    // Check override first
    const override = this.getOverride();
    if (override) {
      return { tool: override, source: 'override', confidence: 'high' };
    }

    // Process detection
    const processResult = await this.detectFromProcess();
    if (processResult.confidence === 'high') {
      return processResult;
    }

    // File detection
    const fileResult = await this.detectFromFiles();
    if (fileResult.confidence === 'high') {
      return fileResult;
    }

    // Combine results
    return this.combineResults(processResult, fileResult);
  }

  async detectFromProcess() {
    const detectors = [
      { name: 'claude-code', check: () => process.env.CLAUDE_PROJECT_ROOT },
      { name: 'cursor', check: () => process.env.CURSOR_SESSION_ID },
      { name: 'vscode', check: () => process.env.TERM_PROGRAM === 'vscode' },
    ];

    for (const detector of detectors) {
      if (await detector.check()) {
        return { tool: detector.name, source: 'process', confidence: 'high' };
      }
    }

    return { tool: null, confidence: 'low' };
  }

  async detectFromFiles() {
    const indicators = [
      { path: '.claude/', tool: 'claude-code' },
      { path: '.cursorrules', tool: 'cursor' },
      { path: '.opencode/', tool: 'opencode' },
      { path: '.github/copilot/', tool: 'copilot' },
    ];

    for (const indicator of indicators) {
      if (await exists(indicator.path)) {
        return { tool: indicator.tool, source: 'files', confidence: 'medium' };
      }
    }

    return { tool: null, confidence: 'low' };
  }
}
```

### Capability Registry / 能力註冊表

```javascript
// detection/capabilities.js
export const capabilities = {
  'claude-code': {
    '*': {
      'skill-md': true,
      'task-tool': true,
      agents: true,
      workflows: true,
      paths: {
        skills: '.claude/skills/',
        agents: '.claude/agents/',
        workflows: '.claude/workflows/',
      },
    },
  },
  cursor: {
    '>=2.3': {
      'skill-md': true,
      'task-tool': false,
      agents: 'inline',
      workflows: false,
      paths: {
        skills: '.cursor/skills/',
        agents: '.cursor/agents/',
      },
    },
    '<2.3': {
      'skill-md': false,
      'task-tool': false,
      agents: false,
      workflows: false,
    },
  },
  // ... more tools
};
```

### CLI Commands / CLI 命令

```bash
# Show environment report
uds env

# Force detection refresh
uds env --refresh

# Override tool
uds configure set tool cursor
uds configure set tool-version 2.3.35

# Check specific capability
uds env --capability skill-md
```

---

## Risks / 風險

| Risk | Impact | Mitigation |
|------|--------|------------|
| False detection | Medium | Confidence levels, manual override |
| Version mismatch | Low | Conservative capability mapping |
| Tool updates break detection | Medium | Regular detector updates |

---

## Out of Scope / 範圍外

- IDE plugin integration
- Tool installation/management
- Cross-tool session sync
- Tool-specific feature development

---

## Sync Checklist

### Starting from System Spec
- [ ] Create tool detector module
- [ ] Define capability registry
- [ ] Integrate with existing commands
- [ ] Add `uds env` command
- [ ] Update translations (zh-TW, zh-CN)

---

## References / 參考資料

- [Claude Code Documentation](https://docs.anthropic.com/claude-code/)
- [Cursor Documentation](https://cursor.sh/docs)
- [Cascading Config Spec](./cascading-config.md)

---

## Version History / 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial specification |

---

## License

This specification is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
