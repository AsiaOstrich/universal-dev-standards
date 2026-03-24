---
source: ../../../../skills/security-scan-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-23
status: current
description: |
  引导自动化安全扫描、依赖包审计和机密检测。
  使用时机：依赖审计、CVE 扫描、机密检测、许可证合规。
  关键字：scan, audit, CVE, dependency, secret, SBOM, vulnerability, 扫描, 漏洞。
---

# 安全扫描助手

> **语言**: [English](../../../../skills/security-scan-assistant/SKILL.md) | 简体中文

自动化依赖包、机密信息和许可证合规的安全扫描。

## 扫描类型

| 类型 | 工具范例 | 用途 |
|------|----------|------|
| **依赖包审计** | npm audit, pip-audit, Snyk | 检测已知 CVE |
| **机密检测** | gitleaks, trufflehog | 检测泄露的凭证 |
| **许可证合规** | license-checker, SPDX | 验证开源许可证兼容性 |
| **SAST** | Semgrep, CodeQL | 静态分析代码模式 |

## 工具整合

| 工具 | 命令 | 范围 |
|------|------|------|
| npm audit | `npm audit --json` | Node.js 依赖包 |
| Snyk | `npx snyk test` | 多语言依赖包 |
| Trivy | `trivy fs .` | 文件系统与容器 |
| gitleaks | `gitleaks detect` | Git 历史机密 |
| SPDX | `npx spdx-tool` | 许可证 SBOM 产出 |

## 严重程度分类与 SLA

| 严重程度 | SLA | 标准 |
|----------|-----|------|
| **Critical** | 24 小时 | 远程执行、认证绕过、数据外泄 |
| **High** | 72 小时 | 权限提升、SQL 注入 |
| **Medium** | 2 周 | XSS、CSRF、信息泄露 |
| **Low** | 下个 Sprint | 缺少 Header、冗长错误信息 |

## 工作流程

```
SCAN ──► TRIAGE ──► PRIORITIZE ──► FIX ──► VERIFY
```

## 使用方式

- `/scan` - 完整扫描（依赖包 + 机密 + 许可证）
- `/scan --deps` - 仅依赖包审计
- `/scan --secrets` - 仅机密检测
- `/scan --license` - 许可证合规检查

## 下一步引导

`/scan` 完成后，AI 助手应建议：

> **扫描完成。建议下一步：**
> - 执行 `/security` 深入安全审查
> - 执行 `/checkin` 确认修复符合提交规范
> - 执行 `/commit` 提交安全修复
> - 更新依赖包 → `npm update` 或 `pip install --upgrade`

## 参考

- 核心规范：[security-standards.md](../../../../core/security-standards.md)
