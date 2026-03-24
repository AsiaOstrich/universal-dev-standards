---
source: ../../../../skills/commands/security.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Guide security review and vulnerability assessment following OWASP standards"
allowed-tools: Read, Grep, Glob
argument-hint: "[module or file to audit | 要审计的模块或文件]"
---

# Security Assistant | 安全助手

Guide security review and vulnerability assessment following OWASP standards.

引导安全审查和漏洞评估，遵循 OWASP 标准。

## Workflow | 工作流程

```
SCOPE ──► SCAN ──► ANALYZE ──► REPORT
```

## Usage | 使用方式

- `/security` - 启动交互式安全审查
- `/security src/auth` - 审查特定模块
- `/security --owasp` - 聚焦 OWASP Top 10 审查

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/security` | 询问审查范围，进入 SCOPE |
| `/security <path>` | 直接审查指定路径 |
| `/security --owasp` | 聚焦 OWASP Top 10 审查 |

### Interaction Script | 交互脚本

1. 确认审查范围
2. 扫描代码，识别潜在漏洞
3. 依严重程度分类（Critical / High / Medium / Low）
4. 生成安全审查报告

**Decision: 发现严重漏洞**
- IF Critical → 立即标记，建议优先修复
- IF High → 标记为重要，建议尽快修复
- ELSE → 列入报告，建议排期修复

**STOP**: 报告展示后等待用户决定

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 安全报告展示后 | 用户决定修复优先顺序 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 目标路径不存在 | 列出可用路径 |
| 代码过大无法全面扫描 | 建议聚焦高风险区域（auth、input handling、API） |

## Reference | 参考

- Full standard: [security-assistant](../security-assistant/SKILL.md)
- Core guide: [security-standards](../../core/security-standards.md)
