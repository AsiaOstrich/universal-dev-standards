---
source: ../../../core/disaster-recovery-drill.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: c97a5f4a554b
status: current
---

# 災難復原演練標準

> **Language**: [English](../../../core/disaster-recovery-drill.md) | 繁體中文

## 概述

未經測試的 DR 計畫只是虛假的安全感。從未在壓力下實際執行過復原 runbook 的團隊，會在最糟糕的時間點才發現缺口。DR 演練能安全地暴露這些缺口。

## RTO/RPO 目標

在撰寫 runbook 之前先定義這些指標：

| 指標 | 定義 | 商用等級目標 |
|--------|-----------|--------------------------|
| RTO (Recovery Time Objective) | 可接受的最大停機時間 | < 1 小時 |
| RPO (Recovery Point Objective) | 可接受的最大資料遺失量 | < 24 小時（每日備份） |

## 備份還原腳本

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

## Game Day 協議

1. **公告（Announce）**：提前一週通知團隊，定義演練範圍
2. **基準（Baseline）**：記錄目前系統狀態
3. **注入（Inject）**：模擬故障（重新命名/刪除 DB、kill process 等）
4. **執行（Execute）**：團隊從頭遵循 runbook 操作——不准抄捷徑
5. **量測（Measure）**：記錄 RTO、RPO 與遭遇到的問題
6. **回顧（Retrospective）**：哪裡不夠清楚？哪裡有遺漏？

## Runbook 範本

完整 runbook 範本請見 `docs/DR-RUNBOOK.md`。

## 相關標準

- [Deployment Standards](deployment-standards.md) — 部署管線
- [Chaos Engineering Standards](chaos-engineering-standards.md) — 故障注入
- [Verification Evidence Standards](verification-evidence.md) — 演練紀錄


**Scope**: universal
