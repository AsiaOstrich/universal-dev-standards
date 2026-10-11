---
source: ../../../../skills/security-scan-assistant/SKILL.md
source_version: 1.0.0
translation_version: 1.1.0
last_synced: 2026-10-11
source_hash: 731552ef9632
status: current
description: |
  引导自动化安全扫描、依赖包审计与密钥检测。
  Use when: 依赖包审计、CVE 扫描、密钥检测、许可证合规。
  Not for: 人工的威胁建模与安全设计审查——请用 /security；一般的代码整洁度——请用 /sweep。
  Keywords: scan, audit, CVE, dependency, secret, SBOM, vulnerability, 扫描, 审计, 依赖包, 密钥检测.
---

# 安全扫描助手

> **语言**: [English](../../../../skills/security-scan-assistant/SKILL.md) | 简体中文

自动化依赖包、机密信息和许可证合规的安全扫描。

## 扫描类型

| 类型 | 工具示例 | 用途 |
|------|----------|------|
| **依赖包审计** | npm audit, pip-audit, Snyk | 检测依赖包中的已知 CVE |
| **机密检测** | gitleaks, trufflehog | 检测代码中泄露的凭证 |
| **许可证合规** | license-checker, SPDX | 验证开源许可证兼容性 |
| **SAST** | Semgrep, CodeQL | 静态分析代码模式 |

## 工具集成

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

1. **Scan** — 对代码库与依赖包运行自动化扫描器
2. **Triage** — 过滤误报，确认真实漏洞
3. **Prioritize** — 依严重程度与可利用性排序
4. **Fix** — 应用补丁、更新依赖包、轮换密钥
5. **Verify** — 重新扫描以确认已修复

## 使用方式

```
/scan                - 完整扫描（依赖包 + 机密 + 许可证）
/scan --deps         - 仅依赖包审计
/scan --secrets      - 仅机密检测
/scan --license      - 许可证合规检查
```

## 下一步引导

`/scan` 完成后，AI 助手应建议：

> **扫描完成。建议下一步：**
> - 执行 `/security` 深入安全审查 ⭐ **推荐**
> - 执行 `/checkin` 确认修复符合提交规范
> - 执行 `/commit` 提交安全修复
> - 更新依赖包 → `npm update` 或 `pip install --upgrade`

## 参考

- 核心规范：[security-standards.md](../../../../core/security-standards.md)

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0.0 | 2026-03-23 | 初始版本 |


## AI 代理行为

> 完整的 AI 行为定义请参阅对应的命令文档：[`/scan`](../commands/scan.md#ai-agent-behavior--ai-代理行为)

## 授权

CC BY 4.0 — 文档内容
