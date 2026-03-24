---
source: ../../../../skills/commands/scan.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-25
status: current
---

---
description: "[UDS] Guide automated security scanning, dependency auditing and secret detection"
allowed-tools: Read, Grep, Glob, Bash(npm:audit, npx:*)
argument-hint: "[scan type or target | 扫描类型或目标]"
---

# Security Scan Assistant | 安全扫描助手

Guide automated security scanning, dependency auditing and secret detection.

引导自动化安全扫描、依赖包审计和机密检测。

## Workflow | 工作流程

```
SCAN ──► TRIAGE ──► PRIORITIZE ──► FIX ──► VERIFY
```

## Usage | 使用方式

- `/scan` - 执行所有安全扫描
- `/scan --deps` - 依赖漏洞扫描
- `/scan --secrets` - 机密检测扫描
- `/scan --license` - 许可证合规检查

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/scan` | 执行所有扫描类型 |
| `/scan --deps` | 仅执行依赖包漏洞扫描 |
| `/scan --secrets` | 仅执行机密检测 |
| `/scan --license` | 仅执行许可证合规检查 |

### Interaction Script | 交互脚本

1. 执行指定类型的扫描
2. 收集结果，依严重程度分类
3. 展示分类报告

**Decision: 扫描结果**
- IF 发现 Critical/High → 列出 SLA 修复时限，建议立即处理
- IF 仅 Medium/Low → 列入报告，建议排期处理
- IF 发现机密泄漏 → 立即警告，建议轮换密钥

**STOP**: 报告展示后等待用户决定修复优先顺序

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 扫描报告展示后 | 用户决定修复项目 |
| 修复建议展示后 | 确认应用修复 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 扫描工具未安装 | 建议安装（npm audit 通常内置） |
| 无 package.json 或 lock 文件 | 告知无法执行依赖扫描 |

## Reference | 参考

- Full standard: [security-scan-assistant](../security-scan-assistant/SKILL.md)
