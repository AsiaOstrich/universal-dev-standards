# [CHECK-01] Integrity Checking Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Stable
**Spec ID**: CHECK-01

---

## Summary

This specification defines the integrity checking logic for verifying file hashes of standards, skills, commands, and integration blocks.

---

## Detailed Design

### Check Types

| Check Type | Hash Source | Files Checked |
|------------|-------------|---------------|
| Standards | `manifest.fileHashes` | `.standards/**/*.md` |
| Skills | `manifest.skillHashes` | `.{agent}/skills/**/*` |
| Commands | `manifest.commandHashes` | `.{agent}/commands/*.md` |
| Integrations | `manifest.integrationBlockHashes` | Integration file UDS blocks |

### Integrity Check Implementation

```javascript
async function checkIntegrity(manifest, projectPath) {
  const results = {
    standards: { unchanged: [], modified: [], missing: [] },
    skills: { unchanged: [], modified: [], missing: [] },
    commands: { unchanged: [], modified: [], missing: [] },
    integrations: { unchanged: [], modified: [], missing: [] }
  };

  // Check standards
  for (const [filePath, storedInfo] of Object.entries(manifest.fileHashes || {})) {
    const fullPath = path.join(projectPath, filePath);
    const status = compareFileHash(fullPath, storedInfo);
    results.standards[status === 'unchanged' ? 'unchanged' : status].push(filePath);
  }

  // Check skills
  for (const [filePath, storedInfo] of Object.entries(manifest.skillHashes || {})) {
    const [agent, level, ...rest] = filePath.split('/');
    const basePath = getSkillsDirForAgent(agent, level, projectPath);
    const fullPath = path.join(basePath, ...rest);
    const status = compareFileHash(fullPath, storedInfo);
    results.skills[status === 'unchanged' ? 'unchanged' : status].push(filePath);
  }

  // Check commands
  for (const [filePath, storedInfo] of Object.entries(manifest.commandHashes || {})) {
    const [agent, ...rest] = filePath.split('/');
    const basePath = getCommandsDirForAgent(agent, 'project', projectPath);
    const fullPath = path.join(basePath, ...rest);
    const status = compareFileHash(fullPath, storedInfo);
    results.commands[status === 'unchanged' ? 'unchanged' : status].push(filePath);
  }

  // Check integration blocks
  for (const [filePath, storedInfo] of Object.entries(manifest.integrationBlockHashes || {})) {
    const fullPath = path.join(projectPath, filePath);
    const currentHash = computeIntegrationBlockHash(fullPath);

    if (!currentHash) {
      results.integrations.missing.push(filePath);
    } else if (currentHash.hash === storedInfo.hash) {
      results.integrations.unchanged.push(filePath);
    } else {
      results.integrations.modified.push(filePath);
    }
  }

  return results;
}
```

---

## Acceptance Criteria

- [ ] Checks all files in manifest.fileHashes
- [ ] Checks all skills in manifest.skillHashes
- [ ] Checks all commands in manifest.commandHashes
- [ ] Checks all integration blocks in manifest.integrationBlockHashes
- [ ] Correctly categorizes as unchanged/modified/missing
- [ ] Handles missing hash entries gracefully (legacy manifests)

---

## Related Specifications

- [CHECK-00 Check Overview](00-check-overview.md)
- [SHARED-03 Hash Tracking](../shared/hash-tracking.md)
