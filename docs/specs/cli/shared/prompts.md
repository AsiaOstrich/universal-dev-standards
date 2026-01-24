# [SHARED-07] Prompts Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Stable
**Spec ID**: SHARED-07

---

## Summary

This specification defines the interactive prompts module (`prompts/init.js`) which provides all user interaction prompts for UDS CLI commands.

---

## Detailed Design

### Module Location

```
cli/src/prompts/init.js
cli/src/prompts/integrations.js
```

### Prompt Types

| Type | Library | Use Case |
|------|---------|----------|
| select | inquirer | Single choice from list |
| checkbox | inquirer | Multiple selections |
| confirm | inquirer | Yes/No question |
| input | inquirer | Free-form text input |

### Main Prompts

| Function | Returns | Used By |
|----------|---------|---------|
| `promptAITools(detected)` | string[] | init, configure |
| `promptSkillsInstallLocation(agents)` | AgentInstallation[] | init, configure |
| `promptLevel()` | 1 \| 2 \| 3 | init, configure |
| `promptStandardsScope()` | 'minimal' \| 'full' | init |
| `promptContentMode()` | 'minimal' \| 'index' \| 'full' | init, configure |
| `promptLocale()` | 'en' \| 'zh-TW' \| 'zh-CN' | init, configure |
| `promptFormat()` | 'ai' \| 'human' \| 'both' | init |
| `promptLanguage(detected)` | string[] | init |
| `promptFramework(detected)` | string[] | init |
| `promptCommandsInstallation(agents)` | boolean | init |
| `promptIntegrationConfig(tools, detected)` | IntegrationConfig | init, configure |
| `promptConflictResolution(file)` | 'overwrite' \| 'keep' \| 'backup' | update |
| `promptRestoreItems(items)` | string[] | check --restore |

### Prompt Implementation Pattern

```javascript
import inquirer from 'inquirer';

export async function promptAITools(detected = []) {
  const allTools = [
    { name: 'Claude Code (CLAUDE.md)', value: 'claude-code' },
    { name: 'Cursor (.cursorrules)', value: 'cursor' },
    { name: 'Windsurf (.windsurfrules)', value: 'windsurf' },
    { name: 'Cline (.clinerules)', value: 'cline' },
    { name: 'GitHub Copilot', value: 'copilot' },
    { name: 'OpenCode', value: 'opencode' },
    { name: 'Aider', value: 'aider' },
    { name: 'Roo', value: 'roo' },
    { name: 'Antigravity', value: 'antigravity' }
  ];

  // Mark detected tools
  const choices = allTools.map(tool => ({
    ...tool,
    name: detected.includes(tool.value)
      ? `${tool.name} - detected`
      : tool.name,
    checked: detected.includes(tool.value)
  }));

  const { aiTools } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'aiTools',
      message: 'Select AI tools to configure:',
      choices,
      validate: (answer) => {
        if (answer.length === 0) {
          return 'At least one AI tool must be selected';
        }
        return true;
      }
    }
  ]);

  return aiTools;
}
```

### Validation Functions

```javascript
function validateLevel(level) {
  return [1, 2, 3].includes(level) ? true : 'Level must be 1, 2, or 3';
}

function validateAITools(tools) {
  return tools.length > 0 ? true : 'At least one tool must be selected';
}

function validateLocale(locale) {
  return ['en', 'zh-TW', 'zh-CN'].includes(locale) ? true : 'Invalid locale';
}
```

---

## Acceptance Criteria

- [ ] All prompts display correctly
- [ ] Detected items are pre-selected
- [ ] Validation prevents invalid inputs
- [ ] Prompts can be skipped with --yes flag
- [ ] Error messages are clear and helpful

---

## Related Specifications

- [INIT-02 Configuration Flow](../init/02-configuration-flow.md)
- [CONFIG-00 Configure Overview](../configure/00-configure-overview.md)
