---
name: sweep
source: ../../../../skills/sweep/SKILL.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-02
source_hash: 712e596d091a
status: current
scope: universal
description: |
  [UDS] 扫描代码库的调试残留与代码质量问题；可自动修正安全模式。
  Use when: before committing, during PR review, or periodic codebase cleanup.
  Keywords: sweep, debug cleanup, console.log, debugger, TODO, ts-any, code quality, 扫描, 清理.
allowed-tools: Read, Grep, Glob, Bash(find:*), Edit, Write
argument-hint: "[--fix] [--report] [--path <dir>] [--exclude <pattern>]"
---

# 扫码助手

> **语言**: [English](../../../../skills/sweep/SKILL.md) | 简体中文

扫描代码库的调试残留、代码质量问题与技术债标记。
可选择性自动修正安全模式（console.log、debugger 等语句）。

---

## 扫描模式

| Pattern ID | 名称 | 可自动修正 | 说明 |
|------------|------|-----------|------|
| `console-log` | console.log / console.debug / console.trace | ✅ 是 | 留在生产环境的调试输出 |
| `debugger` | debugger 语句 | ✅ 是 | 留在代码中的断点 |
| `todo-fixme` | TODO / FIXME / HACK / XXX | ❌ 仅报告 | 技术债标记 |
| `ts-any` | TypeScript `any` 类型 | ❌ 仅报告 | 类型安全违规 |

---

## 使用方式

```bash
/sweep                        # 扫描当前目录，报告发现
/sweep --fix                  # 扫描并自动修正可修复项
/sweep --report               # 扫描并将报告写入 .uds/sweep-report.json
/sweep --path src/            # 扫描指定目录
/sweep --exclude "**/*.test.ts"  # 排除模式（glob）
```

---

## 执行工作流程

### Step 1：搜索文件
使用 Glob tool 找出目标路径下所有源代码文件。
默认排除：`node_modules/`、`dist/`、`.git/`、`*.min.js`、`coverage/`。

### Step 2：逐 Pattern 扫描
对每个 pattern 使用 Grep 在所有文件中查找匹配结果。
汇总发现：`{ file, line, column, pattern_id, label, fixable, content }`。

### Step 3：报告发现
输出结构化摘要：
```
📊 扫描结果
─────────────────────────────────────
console-log:   12 条  （可自动修正）
debugger:       2 条  （可自动修正）
todo-fixme:    28 条  （仅报告）
ts-any:         5 条  （仅报告）
─────────────────────────────────────
合计：47 条  |  可修正：14 条
```

### Step 4：HITL 闸门（--fix 且发现数 > 20）
若设置 `--fix` **且**可修正发现总数超过 20：
**暂停并要求用户明确确认**后才应用修正。
显示将被修改的文件清单。

### Step 5：应用修正（确认 --fix 后）
对每条可修正发现：
- `console-log`：若该行仅含 console 语句则删除该行
- `debugger`：若该行仅含 debugger 语句则删除该行

使用 Edit tool 逐文件应用变更。
报告：「已修正 N 条，影响 M 个文件。」

### Step 6：保存报告（--report）
将发现写入 `.uds/sweep-report.json`：
```json
{
  "timestamp": "<ISO8601>",
  "total_findings": 47,
  "fixable": 14,
  "fixed": 14,
  "findings_by_pattern": { "console-log": 12, "debugger": 2, "todo-fixme": 28, "ts-any": 5 },
  "files_modified": ["src/auth.ts", "src/utils.ts"]
}
```

---

## 设置

通过 `uds.project.yaml` 设置：

```yaml
sweep:
  default_path: "src/"
  exclude_patterns:
    - "**/*.test.ts"
    - "**/*.spec.ts"
    - "**/fixtures/**"
  hitl_threshold: 20       # 可修正项超过此值时需确认
  patterns:
    enabled:
      - console-log
      - debugger
      - todo-fixme
      - ts-any
```

---

## 下一步引导

`/sweep` 完成后建议：

> - 执行 `/checkin` 在提交前验证整体代码质量
> - 执行 `/code-review` 审查清理后的变更
> - 执行 `/commit` 提交修正

---

## 相关标准

- [Checkin Standards](../../../../.standards/checkin-standards.ai.yaml) — Pre-commit 质量闸门
- [Code Review](../code-review-assistant/SKILL.md) — 代码审查助手
- [Testing Guide](../testing-guide/SKILL.md) — 测试标准

---

## 版本历程

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0.0 | 2026-04-28 | 初始版本 — XSPEC-097 Phase 1（从上游迁移） |

---

## 授权

本 Skill 采用 [MIT License](https://opensource.org/licenses/MIT) 与 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 双重授权发布。
