# [UPDATE-02] Standards Update Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Stable
**Spec ID**: UPDATE-02

---

## Summary

This specification defines the standards update logic, including file copying, hash comparison, conflict resolution, and manifest updating.

---

## Detailed Design

### Update Decision Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Standards Update Decision Flow                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   For each standard in manifest.standards:                                   │
│                                                                              │
│   1. Get stored hash from manifest.fileHashes                                │
│   2. Compute current file hash                                               │
│   3. Get upstream hash from new UDS version                                  │
│                                                                              │
│   Decision Matrix:                                                           │
│   ┌──────────────┬──────────────┬──────────────┬────────────────────────┐   │
│   │ Current vs   │ Current vs   │              │                        │   │
│   │ Stored       │ Upstream     │ Action       │ Reason                 │   │
│   ├──────────────┼──────────────┼──────────────┼────────────────────────┤   │
│   │ Match        │ Match        │ Skip         │ Already up to date     │   │
│   │ Match        │ Different    │ Update       │ New version available  │   │
│   │ Different    │ Match        │ Skip/Prompt  │ Local mod, up to date  │   │
│   │ Different    │ Different    │ Prompt       │ Local mod, new version │   │
│   │ Missing      │ -            │ Copy         │ File was deleted       │   │
│   └──────────────┴──────────────┴──────────────┴────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Update Operation

```javascript
async function updateStandard(standardPath, projectPath, manifest) {
  const fullPath = path.join(projectPath, '.standards', standardPath);
  const storedHash = manifest.fileHashes[`.standards/${standardPath}`];
  const currentHash = computeFileHash(fullPath);
  const upstreamHash = await getUpstreamHash(standardPath);

  // Decision logic
  if (!currentHash) {
    // File missing - restore
    return await copyStandard(standardPath, path.dirname(standardPath), projectPath);
  }

  if (currentHash.hash === upstreamHash.hash) {
    // Already up to date
    return { status: 'unchanged', path: standardPath };
  }

  if (currentHash.hash === storedHash?.hash) {
    // No local modifications - safe to update
    return await copyStandard(standardPath, path.dirname(standardPath), projectPath);
  }

  // Local modifications exist
  return { status: 'conflict', path: standardPath, currentHash, upstreamHash };
}
```

---

## Acceptance Criteria

- [ ] Correctly compares local, stored, and upstream hashes
- [ ] Updates unmodified files automatically
- [ ] Detects and reports local modifications
- [ ] Prompts for conflict resolution
- [ ] Updates file hashes in manifest after successful update

---

## Related Specifications

- [UPDATE-00 Update Overview](00-update-overview.md)
- [SHARED-03 Hash Tracking](../shared/hash-tracking.md)
