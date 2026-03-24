---
source: ../../../core/verification-evidence.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-03-24
status: current
---

> **语言**: [English](../../../core/verification-evidence.md) | 简体中文

# 验证证据标准

**版本**: 1.0.0
**最后更新**: 2026-03-20
**适用范围**: 所有 AI 辅助开发工作流
**范围**: universal
**灵感来源**: [Superpowers](https://github.com/obra/superpowers) — verification-before-completion (MIT)

---

## 目的

建立"铁律"：无验证证据不可声称完成。防止 AI 代理虚构成功结果，确保每个完成声明都有可执行的证据支持。

---

## 术语表

| 术语 | 定义 |
|------|------|
| 验证证据 | 验证命令执行及其结果的结构化记录 |
| 铁律 | 绝对规则：无证据 = 不可声称完成 |
| RED-GREEN 循环 | 通过显示测试修复前失败、修复后通过来证明 Bug 修复 |
| 退出码 | 命令的数字返回值（0 = 成功，非零 = 失败） |

---

## 铁律

> **无验证证据 = 不可声称完成。**

代理声称"已完成"不是证据。验证必须是可独立执行且产生可观察输出的。

---

## 证据格式

每次验证必须产生结构化的证据记录：

```json
{
  "command": "pnpm test -- --filter core",
  "exit_code": 0,
  "output": "Tests: 47 passed, 0 failed\nDuration: 3.2s",
  "timestamp": "2026-03-20T14:30:00Z"
}
```

### 必需字段

| 字段 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `command` | string | 是 | 执行的确切命令 |
| `exit_code` | number | 是 | 命令的退出码 |
| `output` | string | 是 | 命令输出（可截断） |
| `timestamp` | string | 是 | ISO 8601 时间戳 |

---

## 验证类型

| 类型 | 描述 | 命令示例 |
|------|------|---------|
| **测试套件** | 运行项目测试套件 | `pnpm test` |
| **类型检查** | 验证类型正确性 | `pnpm tsc --noEmit` |
| **Lint** | 检查代码风格 | `pnpm lint` |
| **构建** | 验证构建成功 | `pnpm build` |
| **手动验证** | 运行特定验证脚本 | `curl http://localhost:3000/health` |

---

## RED-GREEN 循环（Bug 修复）

修复 Bug 时，必须展示两个证据：

1. **RED**：修复前测试失败
2. **GREEN**：修复后测试通过

```json
[
  {
    "phase": "RED",
    "command": "pnpm test -- auth.test.ts",
    "exit_code": 1,
    "output": "FAIL: expected 200, received 401"
  },
  {
    "phase": "GREEN",
    "command": "pnpm test -- auth.test.ts",
    "exit_code": 0,
    "output": "PASS: all 3 tests passed"
  }
]
```

---

## 相关标准

- [系统化调试](systematic-debugging.md)
- [测试治理](test-governance.md)
- [测试标准](testing-standards.md)

---

## 许可证

本标准采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 发布。
