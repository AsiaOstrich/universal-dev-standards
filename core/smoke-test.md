# Smoke Test Standards

## Overview

Smoke tests are the first line of defence after deployment. They answer one question: "Is the system basically working?" in under 30 seconds. If smoke tests pass, you have high confidence that the deployment succeeded. If they fail, roll back immediately — do not investigate in production.

## What to Test

| ✅ Smoke Test | ❌ Not Smoke Test |
|--------------|-----------------|
| Server starts and binds to port | Business logic correctness |
| Health endpoint returns 200 | Edge case handling |
| Core API route returns a response | Performance benchmarks |
| Database connection is alive | Full integration scenarios |

## Implementation

### Shell Script (installer/smoke.sh)

```bash
#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-only
set -euo pipefail

BASE_URL="${VIBEOPS_URL:-http://localhost:3000}"
TIMEOUT=5

check() {
  local path="$1"
  local expected="${2:-200}"
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "${BASE_URL}${path}")
  if [[ "$status" != "$expected" ]]; then
    echo "FAIL: ${path} → HTTP ${status} (expected ${expected})"
    exit 1
  fi
  echo "OK:   ${path} → HTTP ${status}"
}

echo "=== VibeOps Smoke Test ==="
check "/health"
check "/api/status"
echo "=== PASS ==="
```

### npm Script

```json
{ "smoke": "bash installer/smoke.sh" }
```

### CI Integration (post-deploy step)

```yaml
- name: Smoke test
  run: npm run smoke
  env:
    VIBEOPS_URL: http://localhost:3000
```

## Related Standards

- [Testing Standards](testing.md) — overall test pyramid
- [Deployment Standards](deployment-standards.md) — deployment pipeline
- [Performance Standards](performance-standards.md) — latency SLOs
