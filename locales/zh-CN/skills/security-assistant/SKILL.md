---
source: ../../../../skills/security-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-23
status: current
description: |
  引导安全审查和漏洞评估，遵循 OWASP 标准。
  使用时机：安全审计、漏洞检查、安全编码审查、威胁建模。
  关键字：security, OWASP, vulnerability, authentication, authorization, 安全, 漏洞, 认证。
---

# 安全审计助手

> **语言**: [English](../../../../skills/security-assistant/SKILL.md) | 简体中文

引导系统化的安全审查，遵循 OWASP Top 10 和业界最佳实践。

## 快速检查清单 — OWASP Top 10 预防

| ID | 风险 | 预防措施 |
|----|------|----------|
| A01 | 访问控制失效 | 最小权限原则，默认拒绝 |
| A02 | 加密失败 | 使用强加密算法，保护密钥 |
| A03 | 注入攻击 | 参数化查询、输入验证 |
| A04 | 不安全设计 | 威胁建模、安全设计模式 |
| A05 | 安全配置错误 | 强化默认值、最小权限 |
| A06 | 易受攻击的组件 | 追踪依赖包、定期修补 |
| A07 | 认证失败 | 多因素认证、强密码策略 |
| A08 | 数据完整性失败 | 验证签名、使用可信来源 |
| A09 | 日志记录失败 | 记录安全事件、监控告警 |
| A10 | SSRF | 验证 URL、限制对外流量 |

## 安全审查工作流程

```
SCOPE ──► SCAN ──► ANALYZE ──► REPORT
```

### 1. Scope — 定义审计范围
识别目标模块、数据流和信任边界。

### 2. Scan — 识别漏洞
检查代码的 OWASP Top 10 模式、检查依赖包、检视配置。

### 3. Analyze — 评估风险
依严重程度（Critical/High/Medium/Low）和可利用性分类。

### 4. Report — 记录发现
产出可行动的发现报告，附带修复建议。

## 严重程度分类

| 等级 | 标准 |
|------|------|
| **Critical** | 远程代码执行、数据泄露 |
| **High** | 认证绕过、权限提升 |
| **Medium** | 信息泄露、CSRF |
| **Low** | 缺少 Header、冗长错误信息 |

## 使用方式

- `/security` - 完整安全审查
- `/security src/auth` - 审计特定模块
- `/security --owasp` - OWASP Top 10 重点审查

## 下一步引导

`/security` 完成后，AI 助手应建议：

> **安全审查完成。建议下一步：**
> - 执行 `/checkin` 确认修复符合提交规范
> - 执行 `/review` 进行代码审查
> - 执行 `/commit` 提交安全修复
> - 检查依赖包更新 → `npm audit` 或 `pip audit`

## 参考

- 核心规范：[security-standards.md](../../../../core/security-standards.md)
