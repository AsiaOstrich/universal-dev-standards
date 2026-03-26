---
source: ../../../../skills/incident-response-assistant/SKILL.md
source_version: 1.1.0
translation_version: 1.1.0
last_synced: 2026-03-26
status: current
description: |
  引导事故回应、根因分析和事后复盘文档撰写。
  使用时机：生产事故、故障响应、事后复盘撰写、根因分析。
  关键字：incident, outage, post-mortem, RCA, root cause, 事故, 故障, 根因分析。
---

# 事故回应助手

> **语言**: [English](../../../../skills/incident-response-assistant/SKILL.md) | 简体中文

引导结构化的事故回应流程，从检测到事后复盘。

## 严重程度分类

| 等级 | 名称 | 标准 | 响应时间 |
|------|------|------|----------|
| **SEV-1** | 重大 | 全面服务中断、数据丢失 | 立即（< 15 分钟） |
| **SEV-2** | 高 | 主要功能降级、部分中断 | < 30 分钟 |
| **SEV-3** | 中 | 次要功能受影响、有替代方案 | < 4 小时 |
| **SEV-4** | 低 | 外观问题、最小用户影响 | 下一个工作日 |

## 回应工作流程

```
DETECT ──► TRIAGE ──► MITIGATE ──► RESOLVE ──► POST-MORTEM ──► IMPROVE
检测         分级        缓解          解决         事后复盘       持续改善
```

### 1. Detect — 检测事故
监控告警、用户反馈、错误量飙升。

### 2. Triage — 分级严重程度
指定严重等级、确定事故指挥官（IC）。

### 3. Mitigate — 缓解影响
应用临时修复：回滚、功能开关、流量切换。

### 4. Resolve — 永久修复
根因分析、实现正确修复、部署。

### 5. Post-Mortem — 事后复盘
记录时间轴、影响范围、根因、行动项。

### 6. Improve — 持续改善
追踪行动项完成度、分析事故趋势、防止再发。

## 事后复盘模板

```markdown
## 事后复盘：[事故标题]
**日期**: YYYY-MM-DD  |  **严重程度**: SEV-N  |  **持续时间**: Xh Ym

### 时间轴
| 时间 | 事件 |
|------|------|
| HH:MM | 告警触发 |
| HH:MM | 指派事故指挥官 |
| HH:MM | 应用缓解措施 |
| HH:MM | 解决 |

### 影响
- 受影响用户数：N
- 营收影响：$N
- SLA 违反：是/否

### 根本原因
[根本原因描述]

### 行动项
| 行动 | 负责人 | 截止日期 | 优先级 | 状态 |
|------|--------|----------|--------|------|
| [修复] | @name | YYYY-MM-DD | P0 | 开启 |

### 事故指标
- MTTR（平均恢复时间）：Xh Ym
- 检测时间：Xm（告警到指派 IC）
- 再发性：首次 / 重复（链接至先前事故）
```

## 沟通模板

```
[SEV-N] [服务名称] — [简短描述]
状态：调查中 / 缓解中 / 已解决
影响：[谁受到影响及如何影响]
下次更新：[时间]
```

## 使用方式

- `/incident` - 显示完整事故回应指南
- `/incident "API 500 errors"` - 特定事故引导回应
- `/incident --post-mortem` - 生成事后复盘模板
- `/incident --sev1` - SEV-1 快速响应清单
- `/incident --actions` - 列出未完成行动项
- `/incident --metrics` - 显示事故趋势指标

## 改善追踪

### 行动项生命周期

```
Open ──► In Progress ──► Done ──► Verified
```

| 状态 | 说明 |
|------|------|
| **Open** | 已识别，未开始 |
| **In Progress** | 进行中 |
| **Done** | 已实现修复 |
| **Verified** | 已验证有效 |

### 事故存放

```
docs/incidents/
├── INC-2026-03-15-api-outage.md
├── INC-2026-03-20-db-pool-exhaustion.md
└── README.md    # 索引（可选）
```

### 追踪指标

| 指标 | 说明 |
|------|------|
| **MTTR** | 平均恢复时间 |
| **MTTD** | 平均检测时间 |
| **Frequency** | 每期事故数 |
| **Recurrence** | 重复根因比例 |
| **Action Completion** | 行动项完成率 |

## 下一步引导

`/incident` 完成后，AI 助手应建议：

> **事故回应指引已提供。建议下一步：**
> - 执行 `/commit` 创建修复提交 ⭐ **推荐**
> - 执行 `/review` 审查修复变更
> - 执行 `/docs` 更新文档
> - 执行 `/security` 检查安全影响
> - 执行 `/retrospective`（SEV-1/SEV-2 建议）— 团队回顾
> - 执行 `/incident --actions` — 查看未完成行动项

## 参考

- 核心规范：[deployment-standards.md](../../../../core/deployment-standards.md)
- 核心规范：[logging.md](../../../../core/logging.md)
