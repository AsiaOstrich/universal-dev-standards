# Disaster Recovery Drill Standards

## Overview

An untested DR plan is a false sense of security. Teams that have never executed their recovery runbook under pressure will discover gaps at the worst possible time. DR drills expose these gaps safely.

## RTO/RPO Targets

Define these before writing the runbook:

| Metric | Definition | VibeOps Commercial Target |
|--------|-----------|--------------------------|
| RTO (Recovery Time Objective) | Max acceptable downtime | < 1 hour |
| RPO (Recovery Point Objective) | Max acceptable data loss | < 24 hours (daily backup) |

## Backup Restore Script

```bash
#!/usr/bin/env bash
# scripts/backup-restore.sh — DR drill backup restore verification
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/vibeops}"
RESTORE_DIR="${RESTORE_DIR:-/tmp/dr-restore}"
DB_FILE="${DB_FILE:-vibeops.db}"

echo "=== DR Drill: Backup Restore Verification ==="
echo "Source: ${BACKUP_DIR}/${DB_FILE}.backup"
echo "Target: ${RESTORE_DIR}/${DB_FILE}"

mkdir -p "$RESTORE_DIR"

# Find latest backup
LATEST=$(ls -t "${BACKUP_DIR}"/*.backup 2>/dev/null | head -1)
if [[ -z "$LATEST" ]]; then
  echo "FAIL: No backup found in ${BACKUP_DIR}"
  exit 1
fi

# Restore
cp "$LATEST" "${RESTORE_DIR}/${DB_FILE}"

# Verify integrity (SQLite)
if command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 "${RESTORE_DIR}/${DB_FILE}" "PRAGMA integrity_check;" | grep -q "ok" && \
    echo "OK: Database integrity check passed" || \
    { echo "FAIL: Integrity check failed"; exit 1; }
fi

BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LATEST" 2>/dev/null || stat -f %m "$LATEST")) / 3600 ))
echo "OK: Backup age: ${BACKUP_AGE} hours (RPO target: 24h)"

echo "=== PASS: Restore complete ==="
```

## Game Day Protocol

1. **Announce**: Notify team 1 week in advance, define scope
2. **Baseline**: Document current system state
3. **Inject**: Simulate failure (rename/delete DB, kill process, etc.)
4. **Execute**: Team follows runbook from scratch — no shortcuts
5. **Measure**: Record RTO, RPO, issues encountered
6. **Retrospective**: What was unclear? What was missing?

## Runbook Template

See `docs/DR-RUNBOOK.md` for the full runbook template.

## Related Standards

- [Deployment Standards](deployment-standards.md) — deployment pipeline
- [Chaos Engineering Standards](chaos-engineering-standards.md) — failure injection
- [Verification Evidence Standards](verification-evidence.md) — drill records
