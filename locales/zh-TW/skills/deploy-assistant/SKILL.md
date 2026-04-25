---
name: deploy
source: ../../../../skills/deploy-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-26
status: current
description: "[UDS] 引導無 CI/CD 平台下的可靠部署 — 生成 deploy.sh、verify.sh、rollback.sh、Makefile"
allowed-tools: Read, Bash(cat VERSION:*), Bash(git describe:*), Bash(which nginx:*), Bash(which rsync:*)
argument-hint: "[project type | 專案類型: node/python/docker/go]"
---

# 無 CI/CD 部署助手

> **語言**: [English](../../../../skills/deploy-assistant/SKILL.md) | 繁體中文

在沒有 GitHub Actions 或 GitLab CI 的環境中，引導建立可靠的部署腳本組。採用三層架構：防錯、驗證、回復。

## 三層部署架構

```
Layer 1: 防止錯誤部署
  └─ set -euo pipefail + 版本 tag 強制 + deploy.lock

Layer 2: 驗證部署正確
  └─ Smoke Test + /health 端點 + 版本號比對 + 自動 rollback

Layer 3: 快速回復能力
  └─ Blue-Green 切換（Nginx）+ rollback.sh（< 30 秒）
```

## 引導式問答

Skill 啟動後，AI 助手應詢問：

| 問題 | 選項 | 影響 |
|------|------|------|
| 專案類型 | node / python / go / docker | 建置命令 |
| 部署目標 | SSH+rsync / Docker Compose | 傳輸方式 |
| 是否支援 Blue-Green | yes / no | 生成 rollback.sh |
| 健康檢查 URL | 輸入 URL | verify.sh 目標 |
| 版本來源 | VERSION 檔案 / package.json / git tag | 版本比對邏輯 |

## 生成的腳本組

### deploy.sh（主部署腳本）

```bash
#!/usr/bin/env bash
set -euo pipefail

LOCK_FILE="/tmp/deploy.lock"
trap "rm -f $LOCK_FILE" EXIT

# 防並發
if [ -f "$LOCK_FILE" ]; then
  echo "❌ 部署進行中（PID: $(cat $LOCK_FILE)）"
  exit 1
fi
echo $$ > "$LOCK_FILE"

# 版本 tag 強制
CURRENT_TAG=$(git describe --exact-match --tags HEAD 2>/dev/null || echo "")
if [ -z "$CURRENT_TAG" ]; then
  echo "❌ 請先建立版本 tag：git tag vX.Y.Z && git push --tags"
  exit 1
fi

echo "[1/4] 執行測試..."
# {TEST_COMMAND}

echo "[2/4] 建置產物..."
# {BUILD_COMMAND}

echo "[3/4] 推送到伺服器..."
rsync -avz --delete ./dist/ {USER}@{SERVER}:/app/

echo "[4/4] 驗證部署..."
./verify.sh || { echo "驗證失敗，執行 rollback..."; ./rollback.sh; exit 1; }

echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"version\":\"$CURRENT_TAG\",\"operator\":\"$(whoami)\",\"result\":\"success\"}" >> /var/log/deployments.jsonl
echo "✅ 部署成功：$CURRENT_TAG"
```

### verify.sh（Smoke Test）

```bash
#!/usr/bin/env bash
set -euo pipefail

HEALTH_URL="${HEALTH_URL:-{HEALTH_URL}}"
EXPECTED_VERSION=$(cat VERSION)

for i in $(seq 1 3); do
  RESPONSE=$(curl -sf --max-time 10 "$HEALTH_URL" 2>/dev/null) && break
  echo "健康檢查嘗試 $i/3 失敗，等待 5s..."
  sleep 5
done

ACTUAL_VERSION=$(echo "$RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin)['version'])")

if [ "$ACTUAL_VERSION" != "$EXPECTED_VERSION" ]; then
  echo "❌ 版本不符！預期 $EXPECTED_VERSION，實際 $ACTUAL_VERSION"
  exit 1
fi

echo "✅ 版本驗證通過：$ACTUAL_VERSION"
```

### rollback.sh（Blue-Green 回滾）

```bash
#!/usr/bin/env bash
set -euo pipefail

CURRENT=$(readlink /app/current 2>/dev/null || echo "/app/blue")
TARGET=$([[ "$CURRENT" == *"green"* ]] && echo "/app/blue" || echo "/app/green")

ln -sfn "$TARGET" /app/current
nginx -s reload

echo "✅ 已切回 $TARGET（$(date -u +%Y-%m-%dT%H:%M:%SZ)）"
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
	@echo "Current slot: $$(readlink /app/current 2>/dev/null || echo 'N/A')"
	@curl -s $${HEALTH_URL:-http://localhost/health} | python3 -m json.tool 2>/dev/null || echo "Health check failed"
```

## 使用方式

```bash
/deploy              # 互動式引導，自動偵測專案類型
/deploy node         # 指定 Node.js 專案直接生成
/deploy docker       # Docker Compose 部署模式
/deploy --verify-only  # 只生成 verify.sh
```

## 輸出確認清單

生成後，AI 助手必須確認：

- [ ] `deploy.sh` 包含 `set -euo pipefail`
- [ ] `deploy.sh` 包含 deploy.lock 防並發邏輯
- [ ] `verify.sh` 比對版本號（不只檢查 HTTP 200）
- [ ] `rollback.sh` 在驗證失敗時自動觸發
- [ ] `Makefile` 提供 `make deploy / make rollback / make status`

## 下一步引導

`/deploy` 完成後，AI 助手應建議：

> **部署腳本已生成。建議下一步：**
> - `chmod +x deploy.sh verify.sh rollback.sh` — 設定執行權限
> - `make verify` — 測試健康檢查設定
> - `git tag v1.0.0 && git push --tags` — 建立版本 tag
> - `make deploy` — 執行第一次部署

## 參考

- 核心標準：[no-cicd-deployment.md](../../../../core/no-cicd-deployment.md)
- 核心標準：[deployment-standards.md](../../../../core/deployment-standards.md)
- 相關 Skill：[ci-cd-assistant](../../skills/ci-cd-assistant/SKILL.md) — 有 CI/CD 平台的場景
