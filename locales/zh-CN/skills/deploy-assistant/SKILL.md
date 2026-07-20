---
name: deploy
source: ../../../../skills/deploy-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-07-09
source_hash: fc0996a2853c
status: current
scope: universal
description: |
  [UDS] 无 CI/CD 平台环境下的可靠部署指引（不依赖 GitHub Actions / GitLab CI）。
  Use when: deploying to VPS, air-gapped servers, or environments without CI/CD infrastructure.
  Keywords: deployment, no-cicd, shell script, blue-green, smoke test, rollback, 无CI/CD, 部署.
allowed-tools: Read, Bash(cat VERSION:*), Bash(git describe:*), Bash(which nginx:*), Bash(which rsync:*)
argument-hint: "[项目类型: node/python/docker/go]"
---

# 无 CI/CD 部署助手

> **语言**: [English](../../../../skills/deploy-assistant/SKILL.md) | 简体中文

引导无 CI/CD 平台环境下的可靠部署，采用三层架构：防错、验证、快速恢复。

## 三层部署架构

```
Layer 1：防止错误部署            Layer 2：验证正确性             Layer 3：快速恢复
  set -euo pipefail                Smoke Test + /health           Blue-Green 切换
  版本 tag 强制                    版本号比对                     rollback.sh < 30s
  deploy.lock 并发守卫             验证失败自动回滚
```

## 引导式问答

| 问题 | 选项 | 影响 |
|------|------|------|
| 项目类型 | node / python / go / docker | 构建命令 |
| 部署目标 | SSH+rsync / Docker Compose | 传输方式 |
| Blue-Green 支持 | yes / no | rollback.sh 是否生成 |
| 健康检查 URL | URL 输入 | verify.sh 目标 |
| 版本来源 | VERSION 文件 / package.json / git tag | 版本比对逻辑 |

## 生成的脚本组

### deploy.sh — 主要部署脚本

```bash
#!/usr/bin/env bash
set -euo pipefail

LOCK_FILE="/tmp/deploy.lock"
trap "rm -f $LOCK_FILE" EXIT

# 防并发守卫
if [ -f "$LOCK_FILE" ]; then
  echo "❌ 已有部署进行中（PID: $(cat $LOCK_FILE)）"
  exit 1
fi
echo $$ > "$LOCK_FILE"

# 版本 tag 强制
CURRENT_TAG=$(git describe --exact-match --tags HEAD 2>/dev/null || echo "")
if [ -z "$CURRENT_TAG" ]; then
  echo "❌ HEAD 没有版本 tag。请执行：git tag vX.Y.Z && git push --tags"
  exit 1
fi

echo "[1/4] 执行测试..."
# {TEST_COMMAND}

echo "[2/4] 构建产物..."
# {BUILD_COMMAND}

echo "[3/4] 同步至服务器..."
rsync -avz --delete ./dist/ {USER}@{SERVER}:/app/

echo "[4/4] 验证部署..."
./verify.sh || { echo "验证失败，启动回滚..."; ./rollback.sh; exit 1; }

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
  echo "健康检查第 $i/3 次失败，5 秒后重试..."
  sleep 5
done

ACTUAL_VERSION=$(echo "$RESPONSE" | python3 -c "import json,sys; print(json.load(sys.stdin)['version'])")

if [ "$ACTUAL_VERSION" != "$EXPECTED_VERSION" ]; then
  echo "❌ 版本不符！预期 $EXPECTED_VERSION，实际 $ACTUAL_VERSION"
  exit 1
fi

echo "✅ 版本验证通过：$ACTUAL_VERSION"
```

### rollback.sh — Blue-Green 回滚

```bash
#!/usr/bin/env bash
set -euo pipefail

CURRENT=$(readlink /app/current 2>/dev/null || echo "/app/blue")
TARGET=$([[ "$CURRENT" == *"green"* ]] && echo "/app/blue" || echo "/app/green")

ln -sfn "$TARGET" /app/current
nginx -s reload

echo "✅ 已回滚至 $TARGET ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
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
	@echo "当前 slot：$$(readlink /app/current 2>/dev/null || echo 'N/A')"
	@curl -s $${HEALTH_URL:-http://localhost/health} | python3 -m json.tool 2>/dev/null || echo "健康检查失败"
```

## 输出确认清单

脚本生成后，AI 助手必须确认：

- [ ] `deploy.sh` 含 `set -euo pipefail`
- [ ] `deploy.sh` 含 deploy.lock 并发守卫
- [ ] `verify.sh` 比对版本号（不只是 HTTP 200）
- [ ] `rollback.sh` 在 verify 失败时自动触发
- [ ] `Makefile` 提供 `make deploy / make rollback / make status`

## 使用方式

```bash
/deploy              # 交互模式 — 自动检测项目类型
/deploy node         # Node.js 项目，直接生成
/deploy docker       # Docker Compose 部署模式
/deploy --verify-only  # 仅生成 verify.sh
```

## 下一步引导

`/deploy` 完成后，AI 助手应建议：

> **部署脚本已生成，建议下一步：**
> - `chmod +x deploy.sh verify.sh rollback.sh` — 设置执行权限
> - `make verify` — 测试健康检查配置
> - `git tag v1.0.0 && git push --tags` — 创建版本 tag
> - `make deploy` — 执行第一次部署

## 参考

- 核心标准：[no-cicd-deployment.md](../../../../core/no-cicd-deployment.md)
- 核心标准：[deployment-standards.md](../../../../core/deployment-standards.md)
- 核心标准：[deployment-standards.md § Defensive Deployment Ordering](../../../../core/deployment-standards.md#defensive-deployment-ordering) — **强制**遵循 extract-verify-then-delete 顺序
- 核心标准：[packaging-standards.md § Archive Format Integrity](../../../../core/packaging-standards.md#archive-format-integrity) — 消费 archive 前先验证格式
- 相关：[ci-cd-assistant](../ci-cd-assistant/SKILL.md) — 适用于有 CI/CD 的环境

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0.0 | 2026-04-26 | 初始版本 — XSPEC-085 Phase 1b |

## 授权

CC BY 4.0 — 文档内容
