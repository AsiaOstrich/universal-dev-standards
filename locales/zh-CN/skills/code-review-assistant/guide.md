---
source: ../../../../skills/code-review-assistant/guide.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-16
source_hash: 8255f4464f62
status: current
description: |
  系统化的程序码审查检查清单和提交前品质关卡。
  使用时机：审查 pull request、检查程序码品质、提交程序码前。
  关鍵字：review, PR, pull request, checklist, quality, commit, 审查, 检查, 簽入。
---

# 程序码审查助理

> **语言**: English | [繁体中文](../../../zh-TW/skills/code-review-assistant/SKILL.md)

**版本**: 1.0.0
**最后更新**: 2025-12-24
**适用范围**: Claude Code Skills

---

> **核心标准**：此技能实作 [Code Review Checklist](../../core/code-review-checklist.md)。有关完整的方法论文件，请参阅核心标准。

## 目的

此技能提供系统化的程序码审查和提交前验证检查清单。

## 快速参考

### 注解前缀

| 前缀 | 意义 | 需要采取的行动 |
|--------|---------|------------------|
| **❗ BLOCKING** | 合并前必须修正 | 🔴 必要 |
| **⚠️ IMPORTANT** | 应该修正，但不阻挡合并 | 🟡 建议 |
| **💡 SUGGESTION** | 可改进之处 | 🟢 选择性 |
| **❓ QUESTION** | 需要厘清 | 🔵 讨论 |
| **📝 NOTE** | 信息性质，无需行动 | ⚪ 信息 |

### 审查检查清单类别

1. **功能性** - 是否正常运作？
2. **设计** - 架构是否正确？
3. **品质** - 程序码是否干净？
4. **可读性** - 是否容易理解？
5. **测试** - 涵盖率是否足够？
6. **安全性** - 是否有漏洞？
7. **效能** - 是否高效？
8. **错误处理** - 是否妥善处理？
9. **文件** - 是否更新？
10. **依赖项** - 是否必要？

### 提交前检查清单

- [ ] 建置成功（零错误、零警告）
- [ ] 所有测试通过
- [ ] 程序码符合项目标准
- [ ] 无安全漏洞
- [ ] 文件已更新
- [ ] 分支已与目标同步

## 详细指南

完整标准请参阅：
- [审查检查清单](./review-checklist.md)
- [提交前检查清单](./checkin-checklist.md)

### AI 优化格式（节省 Token）

对于 AI 助理，使用 YAML 格式文件以减少 Token 使用量：
- 基础标准：`ai/standards/code-review.ai.yaml`

## 审查注解范例

```markdown
❗ BLOCKING: 此处有潜在的 SQL injection 漏洞。
请使用参数化查询而非字串串接。

⚠️ IMPORTANT: 此方法做太多事情了（120 行）。
考虑将验证逻辑提取到独立方法。

💡 SUGGESTION: 考虑在此使用 Map 而非阵列以达到 O(1) 查找。

❓ QUESTION: 为什么这里使用 setTimeout 而不是 async/await？

📝 NOTE: 这是个聪明的解决方案！很好地运用了 reduce。
```

## 核心原则

1. **保持尊重** - 审查程序码，而非审查人
2. **保持彻底** - 检查功能性，而非仅检查语法
3. **保持及时** - 在 24 小时内完成审查
4. **保持清晰** - 解释“为什么”，而非仅“是什么”

---

## 签入品质关卡（YAML 压缩）

```yaml
# === MANDATORY CHECKLIST ===
build:
  - code_compiles: "zero errors, zero warnings"
  - dependencies: "all installed, versions locked"
  verify: "run build locally, exit code 0"

test:
  - existing_pass: "100% pass rate (unit/integration/e2e)"
  - new_code_tested: "features→tests, bugfix→regression"
  - coverage: "not decreased, critical paths tested"
  verify: "run all suites, review coverage report"

quality:
  - standards: "naming, formatting, comments"
  - no_smells: "methods≤50 lines, nesting≤3, complexity≤10, no duplication"
  - security: "no hardcoded secrets, no SQLi, no XSS, no insecure deps"
  verify: "run linter, static analysis, security scanner"

docs:
  - api_docs: "public APIs documented"
  - readme: "updated if needed"
  - changelog: "user-facing changes → [Unreleased]"

workflow:
  - branch_naming: "feature/, fix/, docs/, chore/"
  - commit_message: "conventional commits format"
  - synced: "merged/rebased with target branch"

# === NEVER COMMIT WHEN ===
blockers:
  - "Build has errors"
  - "Tests failing"
  - "Feature incomplete (would break functionality)"
  - "Contains WIP/TODO in critical logic"
  - "Contains debugging code (console.log, print)"
  - "Contains commented-out code blocks"

# === COMMIT TIMING ===
good_times:
  - "Completed functional unit"
  - "Specific bug fixed with regression test"
  - "Independent refactor (all tests pass)"
  - "Runnable state"

bad_times:
  - "Build failures"
  - "Test failures"
  - "Incomplete features"
  - "Experimental code with TODOs"

# === GRANULARITY ===
ideal_size:
  files: "1-10 (split if >10)"
  lines: "50-300"
  scope: "single concern"

split_principle:
  combine: ["feature + its tests", "tightly related multi-file"]
  separate: ["Feature A + Feature B", "refactor + new feature", "bugfix + incidental refactor"]
```

---

## 配置侦测

此技能支援项目特定配置。

### 侦测顺序

1. 检查 `CONTRIBUTING.md` 的“Disabled Skills”区段
   - 如果此技能被列出，则在此项目中停用
2. 检查 `CONTRIBUTING.md` 的“Code Review Language”区段
3. 若未找到，**预设使用英文**

### 首次设置

如果未找到配置且情境不明确：

1. 询问使用者：“此项目尚未配置程序码审查语言。您想使用哪个选项？（English / 中文）”
2. 使用者选择后，建议在 `CONTRIBUTING.md` 中记录：

```markdown
## Code Review Language

This project uses **[chosen option]** for code review comments.
<!-- Options: English | 中文 -->
```

### 配置范例

在项目的 `CONTRIBUTING.md` 中：

```markdown
## Code Review Language

This project uses **English** for code review comments.
<!-- Options: English | 中文 -->

### Comment Prefixes
BLOCKING, IMPORTANT, SUGGESTION, QUESTION, NOTE
```

---

## 相关标准

- [Code Review Checklist](../../core/code-review-checklist.md) - 核心程序码审查标准
- [Checkin Standards](../../core/checkin-standards.md) - 提交前品质关卡
- [Testing Standards](../../core/testing-standards.md) - 测试要求

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|---------|------|---------|
| 1.0.0 | 2025-12-24 | 新增：标准区段（目的、相关标准、版本历史、授权） |

---

## 授权

此技能依据 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权释出。

**来源**: [universal-dev-standards](https://github.com/AsiaOstrich/universal-dev-standards)
