---
source: ../../../../skills/audit-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-04
status: current
description: |
  UDS 健康检查与反馈系统。诊断安装完整性、检测开发模式、识别摩擦点。
  使用时机：检查 UDS 安装、报告问题、发现规范化机会。
  关键字：audit, health, pattern, friction, feedback, 审计, 健康, 模式, 摩擦, 反馈。
---

# 审计助手

> **语言**: [English](../../../../skills/audit-assistant/SKILL.md) | 简体中文

**版本**: 1.0.0
**最后更新**: 2026-03-04

诊断 UDS 安装健康状态、检测值得规范化的开发模式、识别与现有标准的摩擦点，并向 UDS 仓库提交结构化反馈。

## 工作流程

```
DIAGNOSE ──► ANALYZE ──► REPORT
诊断健康      分析模式      报告反馈
```

### 阶段 1：DIAGNOSE | 诊断

执行 UDS 安装健康检查。

| 检查项目 | 说明 |
|---------|------|
| `.standards/` 存在 | 验证目录与文件 |
| `manifest.json` 有效 | 解析验证 manifest |
| 文件完整性 | 对比哈希与 manifest |
| AI 配置引用 | 验证 AI 配置文件引用 `.standards/` |

### 阶段 2：ANALYZE | 分析

检测模式与摩擦点。

| 分析方法 | 说明 |
|---------|------|
| 目录模式 | 扫描已知标准类别 |
| Commit 模式 | 分析近 100 条 commit 的重复主题 |
| 已修改标准 | 对比文件哈希（差异对比式）|
| 未使用标准 | 检查 AI 配置引用 |
| 孤立文件 | 找出 `.standards/` 中未追踪的文件 |

### 阶段 3：REPORT | 报告

将发现以结构化 GitHub issue 提交。

| 方法 | 条件 |
|------|------|
| `gh issue create` | gh CLI 已安装 |
| 浏览器链接 | 回退至预填 URL |
| 剪贴板复制 | 最终手段 |

## 使用方式

```bash
# 完整审计（所有层级）
uds audit

# 仅健康检查
uds audit --health

# 仅模式检测
uds audit --patterns

# 仅摩擦检测
uds audit --friction

# JSON 输出
uds audit --format json

# 仅摘要（适用于脚本）
uds audit --quiet

# 交互式提交反馈
uds audit --report

# 预览报告不提交
uds audit --report --dry-run
```

## 与其他技能的整合

当被其他技能（如 `/checkin`、`/commit`、`/review`、`/sdd`）建议时，`/audit` 可根据情境执行针对性的检查：

| 情境 | 建议指令 |
|------|---------|
| `/checkin` 失败后诊断 | `/audit --health` |
| `/commit` 后回报发现 | `/audit --report` |
| `/review` 发现摩擦时 | `/audit --friction` |
| `/sdd` 规格建立后检查覆盖率 | `/audit --patterns` |

## 后续步骤

| 发现 | 建议动作 |
|------|---------|
| 健康 ERROR | 执行 `uds init` 或 `uds check --restore` |
| 检测到模式 | 考虑通过 `--report` 请求新标准 |
| 已修改标准 | 检视标准是否需要更多灵活性 |
| 未使用标准 | 考虑以 `uds uninstall` 移除 |

## 相关规范

- [checkin-standards](../../../../core/checkin-standards.md) — 代码提交规范
- [testing-standards](../../../../core/testing-standards.md) — 测试规范

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-03-04 | 初版 — 三层审计系统 |

## 许可

CC BY 4.0 — 详见 [LICENSE](../../../../LICENSE)。
