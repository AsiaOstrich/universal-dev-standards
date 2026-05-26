---
name: deploy
scope: universal
description: |
  Guide reliable deployments without CI/CD platforms (GitHub Actions / GitLab CI).
  Use when: deploying to VPS, air-gapped servers, or environments without CI/CD infrastructure.
  Keywords: deployment, no-cicd, shell script, blue-green, smoke test, rollback, 無CI/CD, 部署.
allowed-tools: Read, Bash(cat VERSION:*), Bash(git describe:*), Bash(which nginx:*), Bash(which rsync:*)
argument-hint: "[project type | 專案類型: node/python/docker/go]"
---

# No-CI/CD Deploy Assistant | 無 CI/CD 部署助手

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/deploy-assistant/SKILL.md)

Guide reliable deployments in environments without GitHub Actions or GitLab CI, using a three-layer architecture: prevent errors, verify correctness, recover fast.

引導無 CI/CD 平台環境下的可靠部署，採用三層架構：防錯、驗證、快速回復。

## Three-Layer Architecture | 三層部署架構

```
Layer 1: Prevent Wrong Deployments   Layer 2: Verify Correctness   Layer 3: Fast Recovery
  set -euo pipefail                    Smoke Test + /health           Blue-Green switching
  Version tag enforcement              Version number comparison      rollback.sh < 30s
  deploy.lock concurrency guard        Auto-rollback on failure
```

## Interactive Questionnaire | 引導式問答

| Question | Options | Impact |
|----------|---------|--------|
| Project type | node / python / go / docker | Build command |
| Deploy target | SSH+rsync / Docker Compose | Transfer method |
| Blue-Green support | yes / no | rollback.sh generation |
| Health check URL | URL input | verify.sh target |
| Version source | VERSION file / package.json / git tag | Version comparison logic |

## Generated Script Set | 生成的腳本組

### deploy.sh — Main Deploy Script

```bash
#!/usr/bin/env bash
set -euo pipefail

LOCK_FILE="/tmp/deploy.lock"
trap "rm -f $LOCK_FILE" EXIT

# Concurrency guard | 防並發
if [ -f "$LOCK_FILE" ]; then
  echo "❌ Deploy in progress (PID: $(cat $LOCK_FILE))"
  exit 1
fi
echo $$ > "$LOCK_FILE"

# Version tag enforcement | 版本 tag 強制
CURRENT_TAG=$(git describe --exact-match --tags HEAD 2>/dev/null || echo "")
if [ -z "$CURRENT_TAG" ]; then
  echo "❌ No version tag on HEAD. Run: git tag vX.Y.Z && git push --tags"
  exit 1
fi

echo "[1/4] Running tests..."
# {TEST_COMMAND}

echo "[2/4] Building artifact..."
# {BUILD_COMMAND}

echo "[3/4] Syncing to server..."
rsync -avz --delete ./dist/ {USER}@{SERVER}:/app/

echo "[4/4] Verifying deployment..."
./verify.sh || { echo "Verification failed, rolling back..."; ./rollback.sh; exit 1; }

echo "{\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"version\":\"$CURRENT_TAG\",\"operator\":\"$(whoami)\",\"result\":\"success\"}" >> /var/log/deployments.jsonl
echo "✅ Deploy successful: $CURRENT_TAG"
```

### verify.sh — Smoke Test

```bash
#!/usr/bin/env bash
set -euo pipefail

HEALTH_URL="${HEALTH_URL:-{HEALTH_URL}}"
EXPECTED_VERSION=$(cat VERSION)

for i in $(seq 1 3); do
  RESPONSE=$(curl -sf --max-time 10 "$HEALTH_URL" 2>/dev/null) && break
  echo "Health check attempt $i/3 failed, retrying in 5s..."
  sleep 5
done

ACTUAL_VERSION=$(echo "$RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin)['version'])")

if [ "$ACTUAL_VERSION" != "$EXPECTED_VERSION" ]; then
  echo "❌ Version mismatch! Expected $EXPECTED_VERSION, got $ACTUAL_VERSION"
  exit 1
fi

echo "✅ Version verified: $ACTUAL_VERSION"
```

### rollback.sh — Blue-Green Rollback

```bash
#!/usr/bin/env bash
set -euo pipefail

CURRENT=$(readlink /app/current 2>/dev/null || echo "/app/blue")
TARGET=$([[ "$CURRENT" == *"green"* ]] && echo "/app/blue" || echo "/app/green")

ln -sfn "$TARGET" /app/current
nginx -s reload

echo "✅ Rolled back to $TARGET ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
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

## Output Checklist | 輸出確認清單

After generation, AI assistant must confirm:

- [ ] `deploy.sh` includes `set -euo pipefail`
- [ ] `deploy.sh` includes deploy.lock concurrency guard
- [ ] `verify.sh` compares version number (not just HTTP 200)
- [ ] `rollback.sh` triggers automatically on verify failure
- [ ] `Makefile` provides `make deploy / make rollback / make status`

## Usage | 使用方式

```bash
/deploy              # Interactive mode — auto-detect project type
/deploy node         # Node.js project, generate directly
/deploy docker       # Docker Compose deploy mode
/deploy --verify-only  # Generate verify.sh only
```

## Next Steps Guidance | 下一步引導

After `/deploy` completes, the AI assistant should suggest:

> **Deploy scripts generated. Suggested next steps / 部署腳本已生成，建議下一步：**
> - `chmod +x deploy.sh verify.sh rollback.sh` — Set executable permissions | 設定執行權限
> - `make verify` — Test health check configuration | 測試健康檢查設定
> - `git tag v1.0.0 && git push --tags` — Create version tag | 建立版本 tag
> - `make deploy` — First deployment | 執行第一次部署

## Reference | 參考

- Core standard: [no-cicd-deployment.md](../../core/no-cicd-deployment.md)
- Core standard: [deployment-standards.md](../../core/deployment-standards.md)
- Core standard: [deployment-standards.md § Defensive Deployment Ordering](../../core/deployment-standards.md#defensive-deployment-ordering) — **MANDATORY** extract-verify-then-delete sequence for destructive updates / **強制**遵循 extract-verify-then-delete 順序
- Core standard: [packaging-standards.md § Archive Format Integrity](../../core/packaging-standards.md#archive-format-integrity) — verify archive format before consuming / 消費 archive 前先驗證格式
- Related: [ci-cd-assistant](../ci-cd-assistant/SKILL.md) — For environments WITH CI/CD

## Version History | 版本歷史

| Version | Date | Changes | 變更說明 |
|---------|------|---------|----------|
| 1.0.0 | 2026-04-26 | Initial release — XSPEC-085 Phase 1b | 初始版本 |

## License | 授權

CC BY 4.0 — Documentation content
