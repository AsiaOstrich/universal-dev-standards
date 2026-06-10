---
source: ../../../core/disaster-recovery-drill.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: c97a5f4a554b
status: current
---

# 灾难恢复演练标准

> **Language**: [English](../../../core/disaster-recovery-drill.md) | [繁體中文](../../zh-TW/core/disaster-recovery-drill.md) | 简体中文

## 概述

未经测试的 DR 计划只是虚假的安全感。从未在压力下实际执行过恢复 runbook 的团队，会在最糟糕的时间点才发现缺口。DR 演练能安全地暴露这些缺口。

## RTO/RPO 目标

在撰写 runbook 之前先定义这些指标：

| 指标 | 定义 | 商用等级目标 |
|--------|-----------|--------------------------|
| RTO (Recovery Time Objective) | 可接受的最大停机时间 | < 1 小时 |
| RPO (Recovery Point Objective) | 可接受的最大数据丢失量 | < 24 小时（每日备份） |

## 备份还原脚本

```bash
#!/usr/bin/env bash
# scripts/backup-restore.sh — DR drill backup restore verification
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/app}"
RESTORE_DIR="${RESTORE_DIR:-/tmp/dr-restore}"
DB_FILE="${DB_FILE:-app.db}"

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

## Game Day 协议

1. **公告（Announce）**：提前一周通知团队，定义演练范围
2. **基准（Baseline）**：记录当前系统状态
3. **注入（Inject）**：模拟故障（重命名/删除 DB、kill process 等）
4. **执行（Execute）**：团队从头遵循 runbook 操作——不准抄捷径
5. **量测（Measure）**：记录 RTO、RPO 与遇到的问题
6. **回顾（Retrospective）**：哪里不够清晰？哪里有遗漏？

## Runbook 模板

完整 runbook 模板请见 `docs/DR-RUNBOOK.md`。

## 相关标准

- [Deployment Standards](deployment-standards.md) — 部署管线
- [Chaos Engineering Standards](chaos-engineering-standards.md) — 故障注入
- [Verification Evidence Standards](verification-evidence.md) — 演练记录


**Scope**: universal
