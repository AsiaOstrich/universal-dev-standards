---
source: ../../../core/smoke-test.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 391e5c330eb1
status: current
---

# Smoke Test 标准

> **语言**: [English](../../../core/smoke-test.md) | [繁體中文](../../zh-TW/core/smoke-test.md) | 简体中文

## 概述

Smoke test 是部署后的第一道防线。它在 30 秒内回答一个问题：「系统是否基本正常工作？」如果 smoke test 通过，你可以高度确信部署成功。如果失败，立即回滚——不要在 production 上排查。

## 该测什么

| ✅ Smoke Test | ❌ 非 Smoke Test |
|--------------|-----------------|
| 服务器启动并绑定端口 | 业务逻辑正确性 |
| Health endpoint 返回 200 | 边界情况处理 |
| 核心 API 路由返回响应 | 性能基准测试 |
| 数据库连接存活 | 完整集成场景 |

## 实现

### Shell 脚本（installer/smoke.sh）

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

### npm 脚本

```json
{ "smoke": "bash installer/smoke.sh" }
```

### CI 集成（部署后步骤）

```yaml
- name: Smoke test
  run: npm run smoke
  env:
    VIBEOPS_URL: http://localhost:3000
```

## 相关标准

- [Testing Standards](testing.md) — 整体测试金字塔
- [Deployment Standards](deployment-standards.md) — 部署流水线
- [Performance Standards](performance-standards.md) — 延迟 SLO


**范围**: universal
