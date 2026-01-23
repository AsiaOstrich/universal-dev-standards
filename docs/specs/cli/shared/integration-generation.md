# [SHARED-04] Integration Generation Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Draft
**Spec ID**: SHARED-04

---

## Summary

This specification defines the integration file generation module (`integration-generator.js`) which creates AI tool configuration files with dynamic content based on installed standards.

---

## Detailed Design

### Module Location

```
cli/src/utils/integration-generator.js
```

### Tool File Mapping

| Tool | Target File | Format |
|------|-------------|--------|
| claude-code | CLAUDE.md | markdown |
| cursor | .cursorrules | plaintext |
| windsurf | .windsurfrules | plaintext |
| cline | .clinerules | plaintext |
| copilot | .github/copilot-instructions.md | markdown |
| opencode | .opencode/rules.md | markdown |
| aider | .aider/CONVENTIONS.md | markdown |
| roo | .roo/rules.md | markdown |
| antigravity | .antigravity/rules.md | markdown |

### Content Modes

| Mode | Description | Output Size |
|------|-------------|-------------|
| minimal | Reference links only | ~1KB |
| index | Standard index with descriptions | ~5-10KB |
| full | Embed full standard content | ~50-100KB |

### UDS Block Markers

```markdown
<!-- UDS:START -->
... UDS managed content ...
<!-- UDS:END -->
```

### Main API

```typescript
interface WriteIntegrationFileOptions {
  projectPath: string;
  tool: string;
  targetFile: string;
  format: 'markdown' | 'plaintext';
  standards: string[];
  contentMode: 'minimal' | 'index' | 'full';
  locale: 'en' | 'zh-TW' | 'zh-CN';
  language: 'english' | 'chinese' | 'bilingual';
  level: 1 | 2 | 3;
}

async function writeIntegrationFile(options: WriteIntegrationFileOptions): Promise<void>;
```

### Content Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Integration File Generation Flow                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. Check for existing file                                                 │
│      ├── Exists → Extract user content outside UDS blocks                   │
│      └── New → Start with empty user content                                 │
│                                                                              │
│   2. Generate UDS block content                                              │
│      ├── Header section                                                      │
│      ├── Standard index (based on contentMode)                               │
│      ├── Dynamic content (commit message table, etc.)                        │
│      └── Footer section                                                      │
│                                                                              │
│   3. Merge content                                                           │
│      ├── User content (before UDS block)                                     │
│      ├── UDS block                                                           │
│      └── User content (after UDS block)                                      │
│                                                                              │
│   4. Write file                                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### User Content Preservation

```javascript
function extractUserContent(filePath) {
  if (!fs.existsSync(filePath)) {
    return { before: '', after: '' };
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const udsStartMatch = content.match(/<!-- UDS:START -->/);
  const udsEndMatch = content.match(/<!-- UDS:END -->/);

  if (!udsStartMatch || !udsEndMatch) {
    // No UDS block - preserve all content as "before"
    return { before: content, after: '' };
  }

  const startIndex = udsStartMatch.index;
  const endIndex = udsEndMatch.index + udsEndMatch[0].length;

  return {
    before: content.substring(0, startIndex),
    after: content.substring(endIndex)
  };
}
```

---

## Acceptance Criteria

- [ ] Generates correct files for all 9 AI tools
- [ ] Supports all 3 content modes
- [ ] Preserves user content outside UDS blocks
- [ ] Generates dynamic commit message tables
- [ ] Handles locale-specific content
- [ ] Creates parent directories as needed

---

## Related Specifications

- [INIT-03 Execution Stages](../init/03-execution-stages.md)
- [CONFIG-00 Configure Overview](../configure/00-configure-overview.md)
