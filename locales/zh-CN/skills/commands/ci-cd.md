---
source: ../../../../skills/commands/ci-cd.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Guide CI/CD pipeline design, configuration and optimization"
allowed-tools: Read, Grep, Glob
argument-hint: "[pipeline config or stage | Pipeline 配置或阶段]"
---

# CI/CD Assistant | CI/CD 助手

Guide CI/CD pipeline design, configuration and optimization.

引导 CI/CD 管线设计、配置和优化。

## Workflow | 工作流程

```
BUILD ──► TEST ──► ANALYZE ──► DEPLOY ──► VERIFY
```

## Usage | 使用方式

- `/ci-cd` - 启动交互式管线设计
- `/ci-cd github-actions` - 为特定平台设计
- `/ci-cd --optimize` - 优化现有管线
- `/ci-cd build` - 聚焦构建阶段

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/ci-cd` | 检测现有 CI 配置（`.github/workflows/`、`.gitlab-ci.yml` 等），展示状态或开始设计 |
| `/ci-cd <platform>` | 为指定平台设计管线 |
| `/ci-cd --optimize` | 分析现有管线，提出优化建议 |
| `/ci-cd <stage>` | 聚焦特定阶段（build/test/deploy） |

### Interaction Script | 交互脚本

1. 检测项目技术栈和现有 CI 配置
2. 依据需求设计或优化管线

**Decision: 现有配置**
- IF 已有 CI 配置 → 分析现状，建议优化
- IF 无 CI 配置 → 引导从头设计
- IF `--optimize` → 直接进入优化分析

3. 逐阶段设计（BUILD→TEST→ANALYZE→DEPLOY→VERIFY）
4. 展示完整管线配置

**STOP**: 配置展示后等待用户确认写入

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 管线设计完成后 | 确认配置正确并写入 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 无法检测 CI 平台 | 列出支持的平台供选择 |
| 现有配置语法错误 | 报告错误位置，建议修正 |

## Reference | 参考

- Full standard: [ci-cd-assistant](../ci-cd-assistant/SKILL.md)
