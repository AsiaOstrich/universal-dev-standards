# [UPDATE-01] Version Checking Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Stable
**Spec ID**: UPDATE-01

---

## Summary

This specification defines the version checking logic for the `uds update` command, including npm registry queries, version comparison, and CLI update detection.

---

## Detailed Design

### Version Sources

| Source | Purpose | Method |
|--------|---------|--------|
| Manifest | Current installed version | `readManifest().upstream.version` |
| npm Registry | Latest available version | `npm-registry.js` API |
| CLI Package | Current CLI version | `package.json` version |

### Version Comparison

```typescript
interface VersionCheck {
  /** Currently installed UDS version */
  current: string;
  /** Latest available UDS version */
  latest: string;
  /** Whether an update is available */
  updateAvailable: boolean;
  /** CLI version check results */
  cli: {
    current: string;
    latest: string;
    updateAvailable: boolean;
  };
}
```

### npm Registry Query

```javascript
async function checkLatestVersion() {
  const response = await fetch('https://registry.npmjs.org/universal-dev-standards');
  const data = await response.json();
  return data['dist-tags'].latest;
}
```

---

## Acceptance Criteria

- [ ] Correctly queries npm registry for latest version
- [ ] Handles network errors gracefully
- [ ] Compares semver versions correctly
- [ ] Detects CLI update availability
- [ ] Caches version check results for session

---

## Related Specifications

- [UPDATE-00 Update Overview](00-update-overview.md)
- [UPDATE-02 Standards Update](02-standards-update.md)
