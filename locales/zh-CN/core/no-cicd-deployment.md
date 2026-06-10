---
source: ../../../core/no-cicd-deployment.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: dbe8c04bf6a4
status: current
---

# No-CI/CD Deployment Strategy

> **Language**: [English](../../../core/no-cicd-deployment.md) | [繁體中文](../../zh-TW/core/no-cicd-deployment.md) | 简体中文

> **补充**: 本文档补充 `deployment-standards.md`，专注于无 CI/CD 平台（GitHub Actions / GitLab CI）环境下的可靠部署设计。

## 核心三层架构

```
Layer 1: 防止错误部署
  └─ set -euo pipefail、版本 tag 强制、deploy.lock

Layer 2: 验证部署正确
  └─ Smoke Test、健康检查、版本号比对、自动 rollback

Layer 3: 快速恢复能力
  └─ Blue-Green 切换、< 30 秒 rollback
```

## Layer 1：防止错误部署

### Shell 脚本强制执行

所有部署脚本必须以下列标头开始：

```bash
#!/usr/bin/env bash
set -euo pipefail
```

- `set -e`：任何命令失败立即退出
- `set -u`：引用未定义变量视为错误
- `set -o pipefail`：管线中任何命令失败都会传播错误

### 强制部署顺序

```bash
echo "[1/4] 执行测试..."
npm test

echo "[2/4] 构建产物..."
npm run build

echo "[3/4] 推送到服务器..."
rsync -avz --delete ./dist/ user@server:/app/

echo "[4/4] 验证部署..."
./verify.sh || { echo "验证失败，执行 rollback..."; ./rollback.sh; exit 1; }
```

### deploy.lock 防并发

```bash
LOCK_FILE="/tmp/deploy.lock"
trap "rm -f $LOCK_FILE" EXIT

if [ -f "$LOCK_FILE" ]; then
  echo "❌ 部署进行中（PID: $(cat $LOCK_FILE)），请等待完成"
  exit 1
fi

echo $$ > "$LOCK_FILE"
```

### 版本 Tag 强制

```bash
CURRENT_TAG=$(git describe --exact-match --tags HEAD 2>/dev/null || echo "")
if [ -z "$CURRENT_TAG" ]; then
  echo "❌ 当前 commit 没有版本 tag，请先执行："
  echo "   git tag v$(cat VERSION) && git push --tags"
  exit 1
fi
```

## Layer 2：验证部署正确

### Smoke Test 脚本 (verify.sh)

```bash
#!/usr/bin/env bash
set -euo pipefail

HEALTH_URL="${HEALTH_URL:-https://example.com/health}"
EXPECTED_VERSION=$(cat VERSION)
MAX_RETRIES=3
RETRY_INTERVAL=5

for i in $(seq 1 $MAX_RETRIES); do
  RESPONSE=$(curl -sf --max-time 10 "$HEALTH_URL" 2>/dev/null) && break
  echo "健康检查失败 ($i/$MAX_RETRIES)，等待 ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

ACTUAL_VERSION=$(echo "$RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin)['version'])")

if [ "$ACTUAL_VERSION" != "$EXPECTED_VERSION" ]; then
  echo "❌ 版本不符！预期 $EXPECTED_VERSION，实际 $ACTUAL_VERSION"
  exit 1
fi

echo "✅ 版本验证通过：$ACTUAL_VERSION"
```

### 健康检查端点规格

应用程序必须提供 `/health` 端点，响应格式：

```json
{
  "status": "ok",
  "version": "1.2.3",
  "timestamp": "2026-04-26T10:00:00Z"
}
```

## Layer 3：快速恢复能力

### Blue-Green 架构

```
[Nginx]
  │
  ├─── Blue (port 3001) ← 稳定版（当前 active）
  └─── Green (port 3002) ← 新版（部署目标）
```

**Nginx 配置**：

```nginx
upstream app {
  server 127.0.0.1:3001;  # blue
  # server 127.0.0.1:3002;  # green（切换时启用此行并停用上一行）
}

server {
  listen 80;
  location / {
    proxy_pass http://app;
  }
}
```

### Rollback 脚本 (rollback.sh)

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

# 记录 rollback 事件
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

每次部署（成功或失败）都必须写入 JSON Lines 格式的日志：

```json
{"timestamp":"2026-04-26T10:00:00Z","version":"1.2.3","git_commit":"abc1234","operator":"albert","result":"success","duration_seconds":45,"slot":"green"}
{"timestamp":"2026-04-26T11:30:00Z","version":"1.2.4","git_commit":"def5678","operator":"albert","result":"failure","duration_seconds":12,"slot":"green","error":"version_mismatch"}
```

## 适用场景

| 场景 | 建议 |
|------|------|
| 个人 VPS / 小型项目 | Layer 1 + Layer 2（无需 Blue-Green） |
| 自架服务器（多人团队） | 三层全套 + deploy.lock |
| Air-gapped 环境 | 三层全套 + 本地 artifact registry |
| 容器化部署 | 搭配 `docker compose` 执行 |

## 相关标准

- `deployment-standards.ai.yaml` — 有 CI/CD 平台的部署策略（本文档的补充前提）
- `health-check-standards.ai.yaml` — /health 端点设计规范
- `circuit-breaker.ai.yaml` — 断路器集成（进阶场景）


**Scope**: universal
