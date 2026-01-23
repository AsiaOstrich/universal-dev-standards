# [CHECK-03] Restore Operations Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Draft
**Spec ID**: CHECK-03

---

## Summary

This specification defines the restore operations for repairing detected integrity issues.

---

## Detailed Design

### Restore Modes

| Mode | Flag | Behavior |
|------|------|----------|
| Interactive | `--restore` | Prompt for each issue |
| Auto-fix | `--fix` | Fix all issues without prompting |

### Restore Operations

| Issue Type | Restore Action |
|------------|----------------|
| Missing standard | Copy from UDS source |
| Modified standard | Overwrite with UDS source |
| Missing skill | Reinstall skill |
| Modified skill | Reinstall skill |
| Missing command | Reinstall command |
| Modified integration block | Regenerate integration file |

### Implementation

```javascript
async function restoreItem(item, type, projectPath, manifest) {
  switch (type) {
    case 'standard':
      const result = await copyStandard(
        item.replace('.standards/', ''),
        path.dirname(item.replace('.standards/', '')),
        projectPath
      );
      if (result.success) {
        manifest.fileHashes[item] = computeFileHash(result.path);
      }
      return result;

    case 'skill':
      const [agent, level, skillName] = item.split('/');
      return await installSkillsForAgent(agent, level, [skillName], projectPath);

    case 'command':
      const [cmdAgent, cmdName] = item.split('/');
      return await installCommandsForAgent(cmdAgent, 'project', [cmdName], projectPath);

    case 'integration':
      return await writeIntegrationFile({
        projectPath,
        tool: getToolFromPath(item),
        // ... other options from manifest
      });
  }
}
```

---

## Acceptance Criteria

- [ ] Interactive mode prompts for each issue
- [ ] Auto-fix mode repairs all issues
- [ ] Standards are restored from UDS source
- [ ] Skills are reinstalled correctly
- [ ] Commands are reinstalled correctly
- [ ] Integration blocks are regenerated
- [ ] Manifest is updated with new hashes

---

## Related Specifications

- [CHECK-00 Check Overview](00-check-overview.md)
- [SHARED-02 File Operations](../shared/file-operations.md)
- [SHARED-05 Skills Installation](../shared/skills-installation.md)
