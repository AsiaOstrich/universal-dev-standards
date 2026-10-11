---
source: ../../../../skills/commands/code-review.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-11
source_hash: 63440740fb7c
status: current
---

---
description: [UDS] Perform systematic code review with checklist
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git show:*)
argument-hint: "[file path or branch | 文件路径或分支名称]"
---

# Code Review Assistant | 代码审查助手

Perform systematic code review using standardized checklists and comment prefixes.

执行系统性的代码审查，使用标准化的检查清单和评论前缀。

## Workflow | 工作流程

1. **识别变更** - 获取待审查文件的 diff
2. **应用检查清单** - 系统性地检查每个类别
3. **生成报告** - 使用标准前缀输出发现
4. **总结** - 提供整体评估

## Review Categories | 审查类别

1. **功能性** - 是否正确运行？
2. **设计** - 架构是否合适？
3. **质量** - 代码是否整洁、可维护？
4. **可读性** - 是否易于理解？
5. **测试** - 是否有足够的测试覆盖？
6. **安全性** - 是否有漏洞？
7. **性能** - 是否高效？
8. **错误处理** - 是否正确处理错误？

## Comment Prefixes | 评论前缀

| Prefix | Meaning | Action |
|--------|---------|--------|
| **BLOCKING** | 必须在合并前修复 | 必需 |
| **IMPORTANT** | 应该修复 | 建议 |
| **SUGGESTION** | 锦上添花 | 可选 |
| **QUESTION** | 需要澄清 | 讨论 |
| **NOTE** | 信息性说明 | 仅供参考 |

## Usage | 使用方式

- `/code-review` - 审查当前分支的所有变更
- `/code-review src/auth.js` - 审查特定文件
- `/code-review feature/login` - 审查特定分支

## AI Agent Behavior | AI 代理行为

> 遵循 [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 进入路由

| 输入 | AI 动作 |
|------|---------|
| `/code-review` | 执行 `git diff` 获取当前分支所有变更，开始审查 |
| `/code-review <file>` | 仅审查指定文件 |
| `/code-review <branch>` | 审查指定分支相对于 main 的差异 |

### Interaction Script | 交互脚本

1. 获取变更内容（git diff / 读取文件）
2. 逐一应用 8 个审查类别
3. 为每个发现标记严重度前缀（BLOCKING / IMPORTANT / SUGGESTION / QUESTION / NOTE）
4. 生成审查报告

**Decision: 发现冲突**
- IF 多个发现互相矛盾（如性能 vs 可读性） → 明确说明取舍，标记为 QUESTION 请用户决定
- ELSE → 依严重度排序呈现

🛑 **STOP**: 报告生成后展示结果，等待用户决定处理方式

### Stop Points | 停止点

| 停止点 | 等待内容 |
|--------|---------|
| 审查报告展示后 | 用户决定是否修复 BLOCKING 项目 |

### Error Handling | 错误处理

| 错误条件 | AI 动作 |
|----------|---------|
| 无变更可审查 | 告知无差异，建议先修改代码 |
| 文件/分支不存在 | 列出可用的文件或分支 |
| 变更量过大（>500 行） | 建议分批审查，列出建议的分批方式 |

## Reference | 参考

- Full standard: [code-review-assistant](../code-review-assistant/SKILL.md)
- Core guide: [code-review-checklist](../../core/code-review-checklist.md)
