# [CHECK-02] Status Display Specification

**Version**: 1.0.0
**Last Updated**: 2026-01-23
**Status**: Stable
**Spec ID**: CHECK-02

---

## Summary

This specification defines the status display logic for presenting check results in various formats (default, summary, verbose, JSON).

---

## Detailed Design

### Output Formats

| Format | Flag | Use Case |
|--------|------|----------|
| Default | (none) | Human-readable overview |
| Summary | `--summary` | Quick status check |
| Verbose | `--verbose` | Detailed debugging |
| JSON | `--json` | CI/CD integration |

### Coverage Report

```javascript
function generateCoverageReport(results) {
  const standards = results.standards;
  const total = standards.unchanged.length + standards.modified.length + standards.missing.length;
  const healthy = standards.unchanged.length;

  return {
    percentage: Math.round((healthy / total) * 100),
    total,
    healthy,
    modified: standards.modified.length,
    missing: standards.missing.length
  };
}
```

### Status Determination

```javascript
function determineOverallStatus(results) {
  const hasMissing =
    results.standards.missing.length > 0 ||
    results.skills.missing.length > 0 ||
    results.commands.missing.length > 0 ||
    results.integrations.missing.length > 0;

  const hasModified =
    results.standards.modified.length > 0 ||
    results.skills.modified.length > 0 ||
    results.commands.modified.length > 0 ||
    results.integrations.modified.length > 0;

  if (hasMissing) {
    return 'critical';
  }
  if (hasModified) {
    return 'issues';
  }
  return 'healthy';
}
```

---

## Acceptance Criteria

- [ ] Default output is clear and informative
- [ ] Summary output fits in one screen
- [ ] Verbose output shows per-file details
- [ ] JSON output is valid and parseable
- [ ] Coverage percentage is accurate
- [ ] Overall status reflects actual state

---

## Related Specifications

- [CHECK-00 Check Overview](00-check-overview.md)
- [CHECK-01 Integrity Checking](01-integrity-checking.md)
