---
name: deploy
source: ../../../../skills/deploy-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-05-28
scope: universal
description: |
  [UDS] 無 CI/CD 平台環境下的可靠部署指引（不依賴 GitHub Actions / GitLab CI）。
  Use when: deploying to VPS, air-gapped servers, or environments without CI/CD infrastructure.
  Keywords: deployment, no-cicd, shell script, blue-green, smoke test, rollback, 無CI/CD, 部署.
allowed-tools: Read, Bash(cat VERSION:*), Bash(git describe:*), Bash(which nginx:*), Bash(which rsync:*)
argument-hint: "[專案類型: node/python/docker/go]"
---

# 無 CI/CD 部署助手

> **語言**: [English](../../../../skills/deploy-assistant/SKILL.md) | 繁體中文

引導無 CI/CD 平台環境下的可靠部署，採用三層架構：防錯、驗證、快速回復。

## 三層部署架構

```
Layer 1：防止錯誤部署            Layer 2：驗證正確性             Layer 3：快速回復
  set -euo pipefail                Smoke Test + /health           Blue-Green 切換
  版本 tag 強制                    版本號比對                     rollback.sh < 30s
  deploy.lock 並發守衛             驗證失敗自動回滾
```

## 引導式問答

| 問題 | 選項 | 影響 |
|------|------|------|
| 專案類型 | node / python / go / docker | 建置指令 |
| 部署目標 | SSH+rsync / Docker Compose | 傳輸方式 |
| Blue-Green 支援 | yes / no | rollback.sh 是否生成 |
| 健康檢查 URL | URL 輸入 | verify.sh 目標 |
| 版本來源 | VERSION 檔 / package.json / git tag | 版本比對邏輯 |

## 生成的腳本組

### deploy.sh — 主要部署腳本

```bash
#!/usr/bin/env bash
set -euo pipefail

LOCK_FILE="/tmp/deploy.lock"
trap "rm -f $LOCK_FILE" EXIT

# 防並發守衛
if [ -f "$LOCK_FILE" ]; then
  echo "❌ 已有部署進行中（PID: $(cat $LOCK_FILE)）"
  exit 1
fi
echo $$ > "$LOCK_FILE"

# 版本 tag 強制
CURRENT_TAG=$(git describe --exact-match --tags HEAD 2>/dev/null || echo "")
if [ -z "$CURRENT_TAG" ]; then
  echo "❌ HEAD 沒有版本 tag。請執行：git tag vX.Y.Z && git push --tags"
  exit 1
fi

echo "[1/4] 執行測試..."
# {TEST_COMMAND}

echo "[2/4] 建置產物..."
# {BUILD_COMMAND}

echo "[3/4] 同步至伺服器..."
rsync -avz --delete ./dist/ {USER}@{SERVER}:/app/

echo "[4/4] 驗證部署..."
./verify.sh || { echo "驗證失敗，啟動回滾..."; ./rollback.sh; exit 1; }

echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"version\":\"$CURRENT_TAG\",\"operator\":\"$(whoami)\",\"result\":\"success\"}" >> /var/log/deployments.jsonl
echo "✅ 部署成功：$CURRENT_TAG"
```

### verify.sh — Smoke Test

```bash
#!/usr/bin/env bash
set -euo pipefail

HEALTH_URL="${HEALTH_URL:-{HEALTH_URL}}"
EXPECTED_VERSION=$(cat VERSION)

for i in $(seq 1 3); do
  RESPONSE=$(curl -sf --max-time 10 "$HEALTH_URL" 2>/dev/null) && break
  echo "健康檢查第 $i/3 次失敗，5 秒後重試..."
  sleep 5
done

ACTUAL_VERSION=$(echo "$RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin)['version'])")

if [ "$ACTUAL_VERSION" != "$EXPECTED_VERSION" ]; then
  echo "❌ 版本不符！預期 $EXPECTED_VERSION，實際 $ACTUAL_VERSION"
  exit 1
fi

echo "✅ 版本驗證通過：$ACTUAL_VERSION"
```

### rollback.sh — Blue-Green 回滾

```bash
#!/usr/bin/env bash
set -euo pipefail

CURRENT=$(readlink /app/current 2>/dev/null || echo "/app/blue")
TARGET=$([[ "$CURRENT" == *"green"* ]] && echo "/app/blue" || echo "/app/green")

ln -sfn "$TARGET" /app/current
nginx -s reload

echo "✅ 已回滾至 $TARGET ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"event\":\"rollback\",\"from\":\"$CURRENT\",\"to\":\"$TARGET\",\"operator\":\"$(whoami)\"}" >> /var/log/deployments.jsonl
```

### Makefile

```makefile
.PHONY: deploy rollback verify status

deploy:
	@./deploy.sh

rollback:
	@./rollback.sh

verify:
	@./verify.sh

status:
	@echo "目前 slot：$$(readlink /app/current 2>/dev/null || echo 'N/A')"
	@curl -s $${HEALTH_URL:-http://localhost/health} | python3 -m json.tool 2>/dev/null || echo "健康檢查失敗"
```

## 輸出確認清單

腳本生成後，AI 助手必須確認：

- [ ] `deploy.sh` 含 `set -euo pipefail`
- [ ] `deploy.sh` 含 deploy.lock 並發守衛
- [ ] `verify.sh` 比對版本號（不只是 HTTP 200）
- [ ] `rollback.sh` 在 verify 失敗時自動觸發
- [ ] `Makefile` 提供 `make deploy / make rollback / make status`

## 使用方式

```bash
/deploy              # 互動模式 — 自動偵測專案類型
/deploy node         # Node.js 專案，直接生成
/deploy docker       # Docker Compose 部署模式
/deploy --verify-only  # 僅生成 verify.sh
```

## 下一步引導

`/deploy` 完成後，AI 助手應建議：

> **部署腳本已生成，建議下一步：**
> - `chmod +x deploy.sh verify.sh rollback.sh` — 設定執行權限
> - `make verify` — 測試健康檢查設定
> - `git tag v1.0.0 && git push --tags` — 建立版本 tag
> - `make deploy` — 執行第一次部署

## 參考

- 核心標準：[no-cicd-deployment.md](../../../../core/no-cicd-deployment.md)
- 核心標準：[deployment-standards.md](../../../../core/deployment-standards.md)
- 核心標準：[deployment-standards.md § Defensive Deployment Ordering](../../../../core/deployment-standards.md#defensive-deployment-ordering) — **強制**遵循 extract-verify-then-delete 順序
- 核心標準：[packaging-standards.md § Archive Format Integrity](../../../../core/packaging-standards.md#archive-format-integrity) — 消費 archive 前先驗證格式
- 相關：[ci-cd-assistant](../ci-cd-assistant/SKILL.md) — 適用於有 CI/CD 的環境

## 版本歷史

| 版本 | 日期 | 變更說明 |
|------|------|----------|
| 1.0.0 | 2026-04-26 | 初始版本 — XSPEC-085 Phase 1b |

## 授權

CC BY 4.0 — 文件內容
