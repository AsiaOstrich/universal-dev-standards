---
source: ../../../../skills/runbook-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-04-10
status: current
description: "[UDS] 引导 Runbook 撰写、维护、演练和覆盖率报告"
---

# Runbook 助手

> **语言**: [English](../../../../skills/runbook-assistant/SKILL.md) | 简体中文

引导 Runbook 撰写、维护、演练和覆盖率报告。

## 功能

| 功能 | 说明 |
|------|------|
| **创建 Runbook** | 从标准模板生成 Runbook（7 个区段） |
| **演练规划** | 规划和记录演练 |
| **覆盖率报告** | 检查 P1-P4 告警的 Runbook 覆盖率 |
| **质量审查** | 验证 Runbook 质量（6 个原则） |
| **过期检查** | 识别过期需审查的 Runbook |

## 使用方式

```bash
/runbook                              # 显示 Runbook 指南
/runbook create "api-latency-high"    # 为告警创建 Runbook
/runbook drill                        # 规划演练
/runbook coverage                     # 生成覆盖率报告
```

## 下一步引导

> **Runbook 引导完成。建议下一步：**
> - 执行 `/observability --alerting` 连接告警到 Runbook ⭐ **推荐**
> - 执行 `/incident --postmortem` 从事故更新 Runbook
> - 执行 `/checkin` 提交变更

## 参考

- 核心规范：[runbook-standards.md](../../../../core/runbook-standards.md)
- 相关：[alerting-standards.md](../../../../core/alerting-standards.md)
- 相关：[postmortem-standards.md](../../../../core/postmortem-standards.md)
