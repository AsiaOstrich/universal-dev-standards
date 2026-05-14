# No-CI/CD Deployment Strategy

> **補充**: 本文件補充 `deployment-standards.md`，專注於無 CI/CD 平台（GitHub Actions / GitLab CI）環境下的可靠部署設計。

## 核心三層架構

```
Layer 1: 防止錯誤部署
  └─ set -euo pipefail、版本 tag 強制、deploy.lock

Layer 2: 驗證部署正確
  └─ Smoke Test、健康檢查、版本號比對、自動 rollback

Layer 3: 快速回復能力
  └─ Blue-Green 切換、< 30 秒 rollback
```

## Layer 1：防止錯誤部署

### Shell 腳本強制執行

所有部署腳本必須以下列標頭開始：

```bash
#!/usr/bin/env bash
set -euo pipefail
```

- `set -e`：任何命令失敗立即退出
- `set -u`：引用未定義變數視為錯誤
- `set -o pipefail`：管線中任何命令失敗都會傳播錯誤

### 強制部署順序

```bash
echo "[1/4] 執行測試..."
npm test

echo "[2/4] 建置產物..."
npm run build

echo "[3/4] 推送到伺服器..."
rsync -avz --delete ./dist/ user@server:/app/

echo "[4/4] 驗證部署..."
./verify.sh || { echo "驗證失敗，執行 rollback..."; ./rollback.sh; exit 1; }
```

### deploy.lock 防並發

```bash
LOCK_FILE="/tmp/deploy.lock"
trap "rm -f $LOCK_FILE" EXIT

if [ -f "$LOCK_FILE" ]; then
  echo "❌ 部署進行中（PID: $(cat $LOCK_FILE)），請等待完成"
  exit 1
fi

echo $$ > "$LOCK_FILE"
```

### 版本 Tag 強制

```bash
CURRENT_TAG=$(git describe --exact-match --tags HEAD 2>/dev/null || echo "")
if [ -z "$CURRENT_TAG" ]; then
  echo "❌ 當前 commit 沒有版本 tag，請先執行："
  echo "   git tag v$(cat VERSION) && git push --tags"
  exit 1
fi
```

## Layer 2：驗證部署正確

### Smoke Test 腳本 (verify.sh)

```bash
#!/usr/bin/env bash
set -euo pipefail

HEALTH_URL="${HEALTH_URL:-https://example.com/health}"
EXPECTED_VERSION=$(cat VERSION)
MAX_RETRIES=3
RETRY_INTERVAL=5

for i in $(seq 1 $MAX_RETRIES); do
  RESPONSE=$(curl -sf --max-time 10 "$HEALTH_URL" 2>/dev/null) && break
  echo "健康檢查失敗 ($i/$MAX_RETRIES)，等待 ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

ACTUAL_VERSION=$(echo "$RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin)['version'])")

if [ "$ACTUAL_VERSION" != "$EXPECTED_VERSION" ]; then
  echo "❌ 版本不符！預期 $EXPECTED_VERSION，實際 $ACTUAL_VERSION"
  exit 1
fi

echo "✅ 版本驗證通過：$ACTUAL_VERSION"
```

### 健康檢查端點規格

應用程式必須提供 `/health` 端點，回應格式：

```json
{
  "status": "ok",
  "version": "1.2.3",
  "timestamp": "2026-04-26T10:00:00Z"
}
```

## Layer 3：快速回復能力

### Blue-Green 架構

```
[Nginx]
  │
  ├─── Blue (port 3001) ← 穩定版（當前 active）
  └─── Green (port 3002) ← 新版（部署目標）
```

**Nginx 配置**：

```nginx
upstream app {
  server 127.0.0.1:3001;  # blue
  # server 127.0.0.1:3002;  # green（切換時啟用此行並停用上一行）
}

server {
  listen 80;
  location / {
    proxy_pass http://app;
  }
}
```

### Rollback 腳本 (rollback.sh)

```bash
#!/usr/bin/env bash
set -euo pipefail

CURRENT=$(readlink /app/current)
if [[ "$CURRENT" == *"green"* ]]; then
  TARGET="/app/blue"
else
  TARGET="/app/green"
fi

ln -sfn "$TARGET" /app/current
nginx -s reload

echo "✅ 已切回 $TARGET（$(date -u +%Y-%m-%dT%H:%M:%SZ)）"

# 記錄 rollback 事件
echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"event\":\"rollback\",\"from\":\"$CURRENT\",\"to\":\"$TARGET\",\"operator\":\"$(whoami)\"}" >> /var/log/deployments.jsonl
```

### 完整 Makefile

```makefile
.PHONY: deploy rollback verify

deploy:
	@./deploy.sh

rollback:
	@./rollback.sh

verify:
	@./verify.sh

status:
	@echo "Current: $$(readlink /app/current)"
	@curl -s $${HEALTH_URL:-http://localhost/health} | python3 -m json.tool
```

## Deployment Log 格式

每次部署（成功或失敗）都必須寫入 JSON Lines 格式的日誌：

```json
{"timestamp":"2026-04-26T10:00:00Z","version":"1.2.3","git_commit":"abc1234","operator":"albert","result":"success","duration_seconds":45,"slot":"green"}
{"timestamp":"2026-04-26T11:30:00Z","version":"1.2.4","git_commit":"def5678","operator":"albert","result":"failure","duration_seconds":12,"slot":"green","error":"version_mismatch"}
```

## 適用場景

| 場景 | 建議 |
|------|------|
| 個人 VPS / 小型專案 | Layer 1 + Layer 2（無需 Blue-Green） |
| 自架伺服器（多人團隊） | 三層全套 + deploy.lock |
| Air-gapped 環境 | 三層全套 + 本地 artifact registry |
| 容器化部署 | 搭配 `docker compose` 執行 |

## 相關標準

- `deployment-standards.ai.yaml` — 有 CI/CD 平台的部署策略（本文件的補充前提）
- `health-check-standards.ai.yaml` — /health 端點設計規範
- `circuit-breaker.ai.yaml` — 斷路器整合（進階場景）


**Scope**: universal
