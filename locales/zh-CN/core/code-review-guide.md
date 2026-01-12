---
source: ../../../core/code-review-checklist.md
source_version: 1.3.0
translation_version: 1.3.0
last_synced: 2026-01-12
status: current
---

# 代码审查检查清单

> **语言**: [English](../../../core/code-review-checklist.md) | [繁體中文](../../zh-TW/core/code-review-checklist.md) | 简体中文

**版本**: 1.3.0
**最后更新**: 2026-01-12
**适用范围**: 所有进行代码审查的软件项目

---

## 目的

本标准提供全面的代码审查检查清单，确保合并前的质量、可维护性与一致性。

---

## 核心原则

1. **尊重他人**
   - Review code, not the person
   - Assume good intentions
   - Be constructive, not critical

2. **彻底审查**
   - Check functionality, not just syntax
   - Consider edge cases
   - Think about future maintenance

3. **及时响应**
   - Review within 24 hours (or team SLA)
   - Don't block progress unnecessarily
   - Prioritize unblocking others

4. **清楚表达**
   - Explain WHY, not just WHAT
   - Provide examples when suggesting changes
   - Distinguish blocking vs. non-blocking comments

---

## 审查检查清单

### 1. 功能性

- [ ] **代码实现预期功能**
  - Requirement/spec alignment verified
  - Acceptance criteria met
  - Edge cases handled

- [ ] **无明显错误**
  - Null/undefined checks present
  - Array bounds checked
  - Error conditions handled

- [ ] **逻辑正确**
  - Conditions make sense
  - Loops terminate properly
  - Calculations are accurate

---

### 2. 设计与架构

- [ ] **遵循项目架构**
  - Layering respected (API, service, data layers)
  - Separation of concerns maintained
  - Dependency direction correct

- [ ] **使用合适的设计模式**
  - Not over-engineered
  - Not under-engineered
  - Patterns applied correctly

- [ ] **代码位于正确位置**
  - Files organized logically
  - Related code grouped together
  - Clear module boundaries

---

### 3. 代码质量

- [ ] **遵循编码标准**
  - Naming conventions adhered to
  - Formatting consistent
  - Style guide followed

- [ ] **无代码异味**
  - Methods ≤50 lines (or project standard)
  - Classes have single responsibility
  - Cyclomatic complexity ≤10
  - No deeply nested conditionals (≤3 levels)

- [ ] **遵循 DRY 原则**
  - No duplicated code blocks
  - Common logic extracted
  - Reusable utilities used

- [ ] **遵循 SOLID 原则**
  - Single Responsibility
  - Open/Closed
  - Liskov Substitution
  - Interface Segregation
  - Dependency Inversion

---

### 4. 可读性与可维护性

- [ ] **代码易于理解**
  - Variable names are descriptive
  - Function names reveal intent
  - Logic flows naturally

- [ ] **注释有帮助**
  - Complex logic explained
  - WHY documented, not WHAT
  - No commented-out code
  - No misleading comments

- [ ] **风格一致**
  - Indentation correct
  - Spacing consistent
  - Naming patterns uniform

---

### 5. 测试

- [ ] **存在测试**
  - New code has tests
  - Tests cover happy path
  - Tests cover error cases
  - Edge cases tested

- [ ] **测试质量良好**
  - Tests are readable
  - Test names describe scenarios
  - Assertions are clear
  - No flaky tests

- [ ] **测试覆盖率维持**
  - Coverage not decreased
  - Critical paths covered
  - Integration tests for key flows

---

### 6. 安全性

- [ ] **无安全漏洞**
  - No SQL injection risks
  - No XSS vulnerabilities
  - No hardcoded secrets
  - No insecure dependencies

- [ ] **存在输入验证**
  - User input sanitized
  - Type checking performed
  - Size limits enforced

- [ ] **认证/授权正确**
  - Proper auth checks
  - Role-based access enforced
  - Sensitive data protected

- [ ] **数据处理安全**
  - Sensitive data encrypted
  - Passwords hashed
  - PII handled appropriately

---

### 7. 性能

- [ ] **无明显性能问题**
  - No N+1 queries
  - No unnecessary loops
  - No blocking operations in hot paths

- [ ] **使用高效算法**
  - Complexity considered (O(n) vs O(n²))
  - Appropriate data structures
  - Caching where beneficial

- [ ] **资源管理适当**
  - Connections closed
  - Memory leaks prevented
  - File handles released

---

### 8. 错误处理

- [ ] **错误处理适当**
  - Try-catch blocks present
  - Specific exceptions caught
  - Generic catch avoided

- [ ] **错误消息有帮助**
  - Messages are descriptive
  - Actionable information included
  - No sensitive data exposed

- [ ] **日志记录充足**
  - Errors logged with context
  - Log levels appropriate
  - No excessive logging

---

### 9. 文档

- [ ] **API 文档存在**
  - Public methods documented
  - Parameters explained
  - Return values described
  - Exceptions documented

- [ ] **README 已更新（如需要）**
  - New features documented
  - Setup instructions current
  - Examples provided

- [ ] **CHANGELOG 已更新（如适用）**
  - 对于用户可感知的变更：已添加条目至 `[Unreleased]` 区段
  - Breaking changes highlighted with **BREAKING** prefix
  - 遵循 [versioning.md](versioning.md) 和 [changelog-standards.md](changelog-standards.md) 排除规则

---

### 10. 依赖

- [ ] **依赖合理**
  - New dependencies necessary
  - License compatible
  - No security vulnerabilities
  - Actively maintained

- [ ] **依赖版本锁定**
  - Exact versions specified
  - No wildcard versions
  - Lock file updated

---

## 审查评论类型

Use these prefixes to clarify comment intent:

### 评论前缀

| Prefix | Meaning | Action Required |
|--------|---------|------------------|
| **❗ BLOCKING** | Must fix before merge | 🔴 Required |
| **⚠️ IMPORTANT** | Should fix, but not blocking | 🟡 Recommended |
| **💡 SUGGESTION** | Nice-to-have improvement | 🟢 Optional |
| **❓ QUESTION** | Need clarification | 🔵 Discuss |
| **📝 NOTE** | Informational, no action | ⚪ Informational |

### 评论示例

```markdown
❗ BLOCKING: Potential SQL injection vulnerability here.
Please use parameterized queries instead of string concatenation.

⚠️ IMPORTANT: This method is doing too much (120 lines).
Consider extracting validation logic to a separate method.

💡 SUGGESTION: Consider using a Map here instead of an array for O(1) lookup.
Not critical, but could improve performance if list grows large.

❓ QUESTION: Why are we using setTimeout here instead of async/await?
Is there a specific reason for this approach?

📝 NOTE: This is a clever solution! Nice use of reduce here.
```

### 替代方案：文字标签

对于偏好纯文字标签（无 emoji）的团队：

| 标签 | 意义 | Action |
|------|------|--------|
| `[必要]` | 必须修正才能合并 | 🔴 Required |
| `[建议]` | 建议修正但非阻挡 | 🟡 Recommended |
| `[问题]` | 需要澄清 | 🔵 Discuss |
| `[NIT]` | 小建议，可忽略 | 🟢 Optional |
| `[赞]` | 正面回馈 | ⚪ Informational |

**评论示例**

```markdown
[必要] 此处有 SQL 注入风险。

[建议] 可考虑使用 StringBuilder 提升性能。

[问题] 当输入为 null 时，预期行为是什么？

[NIT] 变量名称可以更明确。

[赞] 优雅的解法！重构得很好。
```

---

## 审查流程

### 审查者

#### Step 1: 理解背景

1. Read PR description and linked issues
2. Understand WHY the change is needed
3. Review design/spec documents if linked

#### Step 2: 高层级审查

1. Check overall approach
2. Verify architecture alignment
3. Assess scope appropriateness

#### Step 3: 详细审查

1. Review each file change
2. Check functionality and logic
3. Look for bugs and edge cases
4. Verify tests

#### Step 4: 提供反馈

1. Use comment prefixes (BLOCKING, SUGGESTION, etc.)
2. Be specific and provide examples
3. Acknowledge good code
4. Suggest alternatives when criticizing

#### Step 5: 核准或要求变更

- **Approve**: If no blocking issues
- **Request Changes**: If blocking issues present
- **Comment**: If only suggestions/questions

---

### 作者

#### 请求审查前

1. **自我审查代码**
2. **本地执行测试**
3. **检查 CI 状态**
4. **撰写清楚的 PR 描述**

#### 审查期间

1. **及时响应**
2. **处理所有评论**
3. **不清楚时提问**
4. **快速推送修正**

#### 审查后

1. **标记对话已解决**
2. **需要时重新请求审查**
3. **感谢审查者**

---

## 审查自动化

### 自动化检查

Configure these checks to run automatically:

```yaml
# Example: GitHub Actions
name: PR Quality Checks

on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Build check
      - name: Build
        run: npm run build

      # Test check
      - name: Tests
        run: npm test -- --coverage

      # Linter check
      - name: Lint
        run: npm run lint

      # Security check
      - name: Security Audit
        run: npm audit --audit-level=high

      # Coverage check
      - name: Coverage Report
        run: |
          coverage=$(npx nyc report | grep 'Lines' | awk '{print $3}' | sed 's/%//')
          if (( $(echo "$coverage < 80" | bc -l) )); then
            echo "Coverage $coverage% below 80%"
            exit 1
          fi

      # Complexity check
      - name: Complexity Check
        run: npx eslint src --ext .js,.ts --max-warnings=0
```

---

## 代码审查反模式

### ❌ Nitpicking Style Without Auto-Formatting

**Problem**: Spending review time on formatting issues
**Solution**: Use automated formatters (Prettier, Black, etc.)

---

### ❌ Approving Without Reading

**Problem**: Rubber-stamp approvals
**Solution**: Actually review the code, or decline to review

---

### ❌ Being Vague

**Bad**: "This doesn't look right"
**Good**: "Line 45: This condition will always be true because X. Consider Y instead."

---

### ❌ Blocking on Personal Preferences

**Bad**: "I don't like ternary operators, please use if-else"
**Good**: "💡 SUGGESTION: You could use if-else here for clarity (personal preference)"

---

### ❌ Not Explaining WHY

**Bad**: "Change this"
**Good**: "Change this because it creates a memory leak when the array grows beyond 10k items"

---

### ❌ Reviewing Too Much at Once

**Problem**: 500+ line PRs are hard to review thoroughly
**Solution**: Break large changes into smaller PRs

---

## 审查时间指引

### 目标响应时间

| PR Size | Initial Response | Complete Review |
|---------|------------------|-----------------|
| < 50 lines | 2 hours | 4 hours |
| 50-200 lines | 4 hours | 1 day |
| 200-500 lines | 1 day | 2 days |
| > 500 lines | 🚨 Consider splitting | 3+ days |

### 审查者可用性

- Set "review hours" in team calendar
- Use GitHub/GitLab "away" status when unavailable
- Assign backup reviewers for urgent PRs

---

## 特殊情况

### 紧急修复审查

- **加速流程**
- Focus on: correctness, security, rollback plan
- Skip: minor style issues, nice-to-have optimizations
- **Post-merge review** allowed for critical issues

---

### 依赖更新

- Check CHANGELOG for breaking changes
- Verify test pass
- Review security advisories
- Consider automated with Dependabot/Renovate

---

### 仅文档变更

- Check for accuracy
- Verify formatting (Markdown, etc.)
- Ensure examples are runnable
- Lighter review acceptable

---

### 重构 PR

重构变更需要特别注意，以确保行为保持不变的同时改善代码质量。

#### 审查前检查清单

- [ ] **范围已记录**：PR 描述中清楚说明重构范围
- [ ] **纯重构**：没有功能变更混入重构
- [ ] **测试通过**：重构前后所有测试皆通过
- [ ] **覆盖率维持**：测试覆盖率未下降

#### 审查重点

- [ ] **代码异味已处理**：修复了哪些异味？（Long Method、Duplicate Code 等）
- [ ] **重构模式正确**：是否套用了正确的技术？
- [ ] **命名改善**：新名称是否有意义且一致？
- [ ] **复杂度降低**：代码是否可量化地更简单？（考虑 cyclomatic complexity）
- [ ] **耦合降低**：依赖关系是否更清晰？

#### 大型重构（>500 行变更）

- [ ] **计划已记录**：链接到重构计划或设计文档
- [ ] **增量提交**：每个 commit 可独立审查
- [ ] **回滚策略**：如何在问题发生时恢复？
- [ ] **性能评估**：是否影响运行时期性能？
- [ ] **特征测试**：遗留代码已受行为捕捉测试保护

#### 警示信号

- ❗ **隐藏新功能**：功能变更伪装成重构
- ❗ **测试行为变更**：断言被修改而非保留
- ❗ **缺少文档**：没有说明改了什么或为什么改
- ❗ **无关变更**：格式修正混入逻辑重构

#### 最佳实践

- 偏好**多个小 PR** 而非一个大型重构 PR
- PR 标题使用 **[Refactor]** 前缀以便筛选
- 包含**重构前后**的代码片段或复杂度指标
- 参考所处理的**代码异味**（例如：「修复 UserService.process() 中的 Long Method」）

---

## 项目特定化

Add to `CONTRIBUTING.md`:

```markdown
## Code Review Guidelines

### Required Reviewers
- Backend changes: @backend-team
- Frontend changes: @frontend-team
- Database migrations: @db-admin + @backend-lead
- Security-sensitive: @security-team

### Review SLA
- Small PRs (<100 lines): 4 hours
- Medium PRs (100-300 lines): 1 day
- Large PRs (>300 lines): 2 days

### Approval Requirements
- **Standard PRs**: 1 approval
- **Critical path code**: 2 approvals
- **Security changes**: 2 approvals (including security team)

### Review Focus Areas
1. [Project-specific concern 1]
2. [Project-specific concern 2]
3. [Project-specific concern 3]

### Automated Checks
All PRs must pass:
- ✅ Build
- ✅ Unit tests (>80% coverage)
- ✅ Integration tests
- ✅ Linter (0 errors, <5 warnings)
- ✅ Security scan (no high/critical vulnerabilities)
```

---

## 工具与集成

### 代码审查平台

- **GitHub Pull Requests**
- **GitLab Merge Requests**
- **Bitbucket Pull Requests**
- **Gerrit** (for git-native workflows)
- **Review Board**

### 检查与格式化工具

| Language | Linter | Formatter |
|----------|--------|-----------|
| JavaScript/TypeScript | ESLint | Prettier |
| Python | Pylint, Flake8 | Black |
| C# | StyleCop, Roslyn Analyzers | dotnet format |
| Java | Checkstyle, PMD | Google Java Format |
| Go | golangci-lint | gofmt |
| Ruby | RuboCop | RuboCop |

### 静态分析

- **SonarQube** - Code quality and security
- **CodeClimate** - Maintainability analysis
- **Snyk** - Security vulnerabilities
- **Coveralls** - Code coverage tracking

---

## 快速参考卡

```
┌─────────────────────────────────────────┐
│ Code Review Quick Checklist            │
├─────────────────────────────────────────┤
│ ✓ Functionality - Does it work?        │
│ ✓ Design - Right architecture?         │
│ ✓ Quality - Clean code?                │
│ ✓ Readability - Easy to understand?    │
│ ✓ Tests - Adequate coverage?           │
│ ✓ Security - No vulnerabilities?       │
│ ✓ Performance - Efficient?             │
│ ✓ Errors - Properly handled?           │
│ ✓ Docs - Updated?                      │
│ ✓ Dependencies - Necessary?            │
└─────────────────────────────────────────┘

Comment Prefixes:
❗ BLOCKING - Must fix
⚠️ IMPORTANT - Should fix
💡 SUGGESTION - Nice to have
❓ QUESTION - Need clarification
📝 NOTE - Informational
```

---

## 版本历史

| Version | Date | Changes |
|---------|------|---------|
| 1.3.0 | 2026-01-12 | 新增：完整重构 PR 段落，包含审查前检查清单、审查重点、大型重构指南、警示信号及最佳实践 |
| 1.2.0 | 2026-01-05 | 新增：SWEBOK v4.0 第 10 章（软件质量）至参考资料 |
| 1.1.0 | 2025-12-22 | Added: Alternative text labels section for review comments (中文标签支援) |
| 1.0.3 | 2025-12-16 | Clarified: CHANGELOG section aligned with changelog-standards.md, use markdown links for cross-references |
| 1.0.2 | 2025-12-05 | Added: Reference to testing-standards.md |
| 1.0.1 | 2025-12-04 | Updated: GitHub Actions checkout to v4, cross-reference to versioning.md |
| 1.0.0 | 2025-11-12 | Initial code review checklist |

---

## 相关标准

- [Refactoring Standards](refactoring-standards.md) - 重构标准（遗留代码策略、大规模模式、度量指标）
- [Testing Standards](testing-standards.md) - 测试标准 (UT/IT/ST/E2E)（或使用 `/testing-guide` 技能）
- [Code Check-in Standards](checkin-standards.md) - 代码签入标准
- [Commit Message Guide](commit-message-guide.md) - Commit 消息规范

---

## 参考资料

- [Google Engineering Practices - Code Review](https://google.github.io/eng-practices/review/)
- [Microsoft Code Review Guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/pull-requests)
- [Effective Code Reviews](https://www.oreilly.com/library/view/making-software/9780596808310/)
- [SWEBOK v4.0 - 第 10 章：软件质量](https://www.computer.org/education/bodies-of-knowledge/software-engineering) - IEEE Computer Society

---

## 授权

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
