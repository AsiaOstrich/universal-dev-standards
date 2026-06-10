---
source: ../../../core/smoke-test.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 391e5c330eb1
status: current
---

# Smoke Test 標準

> **Language**: [English](../../../core/smoke-test.md) | 繁體中文

## 概述

Smoke test 是部署後的第一道防線。它在 30 秒內回答一個問題：「系統是否基本正常運作？」如果 smoke test 通過，你可以高度確信部署成功。如果失敗，立即回滾——不要在 production 上調查。

## 該測什麼

| ✅ Smoke Test | ❌ 非 Smoke Test |
|--------------|-----------------|
| 伺服器啟動並綁定 port | 業務邏輯正確性 |
| Health endpoint 回傳 200 | 邊界案例處理 |
| 核心 API 路由回傳回應 | 效能基準測試 |
| 資料庫連線存活 | 完整整合情境 |

## 實作

### Shell 腳本（installer/smoke.sh）

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

echo "=== Smoke Test ==="
check "/health"
check "/api/status"
echo "=== PASS ==="
```

### npm 腳本

```json
{ "smoke": "bash installer/smoke.sh" }
```

### CI 整合（部署後步驟）

```yaml
- name: Smoke test
  run: npm run smoke
  env:
    VIBEOPS_URL: http://localhost:3000
```

## 相關標準

- [Testing Standards](testing.md) — 整體測試金字塔
- [Deployment Standards](deployment-standards.md) — 部署管線
- [Performance Standards](performance-standards.md) — 延遲 SLO


**Scope**: universal
