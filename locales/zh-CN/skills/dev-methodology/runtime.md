---
source: skills/dev-methodology/runtime.md
source_version: 1.0.0
translation_version: 1.0.0
status: current
---

# Methodology Runtime 指南

> **语言**: [English](../../../../skills/dev-methodology/runtime.md) | 简体中文

> [!WARNING]
> **实验性功能 / Experimental Feature**
>
> 此功能正在积极开发中，可能在 v4.0 中有重大变更。
> This feature is under active development and may change significantly in v4.0.

**版本**: 1.0.0
**最后更新**: 2026-01-12

---

## 概览

本文档定义 AI 助手在某个开发 methodology 启用时应有的行为。它提供 phase 跟踪、checkpoint 处理及用户交互的指引。

---

## AI 行为规格

### 1. Context 感知

当某个 methodology 启用时，AI 应该：

- **始终知道当前的 phase**
- **在响应中显示 phase 指示器**
- **建议符合该 phase 的动作**

#### Phase 状态显示

在相关响应的开头加入 methodology 状态：

```
┌────────────────────────────────────────────────┐
│ 📋 Methodology: TDD                             │
│ 📍 Phase: 🔴 RED (writing failing test)         │
│ ⏱️  Duration: 3 minutes                         │
└────────────────────────────────────────────────┘
```

### 2. 主动指引

根据当前的 phase 提供符合 context 的建议：

```markdown
**Current Phase: 🔴 RED (TDD)**

You're writing a failing test for: user login validation

**Next step**: Write a test that describes the expected behavior.

Would you like me to:
1. Generate a test skeleton
2. Show TDD best practices for this scenario
3. Continue with your manual approach
```

### 3. Phase 转换检测

监控那些代表 phase 转换的条件：

| Signal | Transition |
|--------|------------|
| Test 执行失败 | RED → ready for GREEN |
| 所有 test 通过 | GREEN → ready for REFACTOR |
| 用户确认 refactor 完成 | REFACTOR → next cycle or DONE |
| 时间超过 phase duration | 显示提醒 |
| 检测到 Git commit | 重置 phase 计时器 |

### 4. Checkpoint 行为

当 checkpoint 条件触发时，显示 checkpoint 通知：

```
┌────────────────────────────────────────────────┐
│ 🔔 Methodology Checkpoint                       │
├────────────────────────────────────────────────┤
│ GREEN phase completed                          │
│                                                │
│ Checklist Status:                              │
│   ✅ Minimum code written                      │
│   ✅ Test passes                               │
│   ✅ All other tests pass                      │
│   ⬜ (Optional) Consider edge cases            │
│                                                │
│ Change Statistics:                             │
│   - Files: 3                                   │
│   - Added: 45 lines                            │
│   - Deleted: 2 lines                           │
│                                                │
│ Suggested commit:                              │
│   test(auth): add email validation test        │
│   feat(auth): implement email validation       │
│                                                │
│ Options:                                       │
│   [1] Commit now (show git commands)           │
│   [2] Continue to REFACTOR phase               │
│   [3] View detailed changes                    │
└────────────────────────────────────────────────┘
```

### 5. Skip 跟踪

跟踪连续的 skip 并适当地警告：

| Skip Count | Action |
|------------|--------|
| 1-2 | 不采取动作，记录 skip |
| 3 | 警告通知 |
| 4+ | 强烈警告，建议 commit |

#### Skip 警告显示

```
┌────────────────────────────────────────────────┐
│ ⚠️ Skip Warning                                 │
├────────────────────────────────────────────────┤
│ You have skipped check-in 3 times consecutively│
│                                                │
│ Current accumulated changes:                   │
│   - Files: 8                                   │
│   - Added: 320 lines                           │
│   - Deleted: 45 lines                          │
│                                                │
│ Recommendation: Commit your changes now to     │
│ avoid losing work and maintain atomic commits. │
│                                                │
│ [1] Commit now  [2] Skip anyway  [3] View diff │
└────────────────────────────────────────────────┘
```

---

## Methodology 检测

### 自动检测

AI 应从以下来源检测 methodology context：

1. **Manifest 配置**
   ```json
   // .standards/manifest.json
   { "methodology": { "active": "tdd" } }
   ```

2. **关键字检测**
   - "Let's use TDD for this"
   - "Write a failing test first"
   - "Given-When-Then"
   - "Create a spec for this change"

3. **命令调用**
   - `/tdd`, `/bdd`, `/sdd`, `/atdd`
   - `/methodology switch <id>`

### 加载 Methodology 定义

```
Methodology Loading Priority:
1. Custom: .standards/methodologies/{id}.methodology.yaml
2. Built-in: methodologies/{id}.methodology.yaml
3. Fallback: Generic phase-less workflow
```

---

## Checklist 管理

### 显示格式

```markdown
### Phase Checklist

**Required:**
- [ ] Test describes expected behavior
- [x] Test name is clear
- [ ] Test follows AAA pattern

**Optional:**
- [ ] Consider edge cases
```

### 跟踪

- 根据用户动作与代码分析更新 checklist 项目
- 若 required 项目未完成则阻挡 phase 转换（strict mode）
- 记录完成状态以供审计轨迹使用

---

## 集成点

### 与 Git 集成

- 检测 commit 以重置 phase 计时器
- 根据 methodology 建议 commit message
- 自动纳入 spec/story 引用

### 与 Test Runner 集成

- 检测 test 通过/失败以触发 phase 转换
- 报告与当前 phase 相关的 test 覆盖率

### 与 Code Review 集成

- 加入 methodology 专属的 review 检查
- 在 PR 描述中引用启用中的 methodology

---

## 错误处理

### 找不到 Methodology

```
⚠️ Methodology 'custom-workflow' not found.

Available methodologies:
- tdd (built-in)
- bdd (built-in)
- sdd (built-in)
- atdd (built-in)

Use `/methodology list` to see all options.
```

### 无效的 Phase 转换

```
⚠️ Cannot transition from RED to REFACTOR.

TDD requires: RED → GREEN → REFACTOR

Current phase: RED
Valid next phases: GREEN

Complete the RED phase checklist first.
```

---

## 性能考量

- 首次加载后缓存 methodology 定义
- 仅在 manifest 变更时才重新加载
- 最小化 checkpoint 频率以避免打断
- 批量执行 git status 检查

---

## 本地化（Localization）

所有面向用户的文字都应使用适当的语言字段：

```yaml
# If user's locale is zh-TW
name: nameZh || name
description: descriptionZh || description
prompt: promptZh || prompt
```

---

## 6. Prerequisite 检查 / Prerequisite Checking

在执行任何 slash 命令之前，请遵循定义于
[`prerequisite-check.md`](../../../../skills/dev-methodology/prerequisite-check.md) 的 prerequisite 检查协议。

**Priority**: 此检查会在 phase 跟踪与 methodology 检测之前执行。

**与 Phase 跟踪的集成**：
- 若用户处于启用中的 methodology session，使用该 methodology 的 phase
  序列作为主要的 prerequisite 来源
- 若无启用中的 methodology，使用 [`workflow-prerequisites.yaml`](../../../../methodologies/workflow-prerequisites.yaml) 作为 fallback
- 若多个 workflow 都包含该命令，只需满足其中一个即可

**Reference**: 完整的算法、evidence 检测规则及用户提示模板，请参阅 [`prerequisite-check.md`](../../../../skills/dev-methodology/prerequisite-check.md)。

---

## 版本历史

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-02-12 | 新增 §6 Prerequisite Checking 集成 |
| 1.0.0 | 2026-01-12 | Initial runtime specification |
