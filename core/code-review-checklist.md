# Code Review Checklist
# 程式碼審查檢查清單

**Version**: 1.0.0
**Last Updated**: 2025-11-12
**Applicability**: All software projects with code review processes
**適用範圍**: 所有進行程式碼審查的軟體專案

---

## Purpose | 目的

This standard provides a comprehensive checklist for reviewing code changes, ensuring quality, maintainability, and consistency before merging.

本標準提供全面的程式碼審查檢查清單，確保合併前的品質、可維護性與一致性。

---

## Core Principles | 核心原則

1. **Be Respectful** | 尊重他人
   - Review code, not the person
   - Assume good intentions
   - Be constructive, not critical

2. **Be Thorough** | 徹底審查
   - Check functionality, not just syntax
   - Consider edge cases
   - Think about future maintenance

3. **Be Timely** | 及時回應
   - Review within 24 hours (or team SLA)
   - Don't block progress unnecessarily
   - Prioritize unblocking others

4. **Be Clear** | 清楚表達
   - Explain WHY, not just WHAT
   - Provide examples when suggesting changes
   - Distinguish blocking vs. non-blocking comments

---

## Review Checklist | 審查檢查清單

### 1. Functionality | 功能性

- [ ] **Code does what it's supposed to do** | 程式碼實現預期功能
  - Requirement/spec alignment verified
  - Acceptance criteria met
  - Edge cases handled

- [ ] **No obvious bugs** | 無明顯錯誤
  - Null/undefined checks present
  - Array bounds checked
  - Error conditions handled

- [ ] **Logic is correct** | 邏輯正確
  - Conditions make sense
  - Loops terminate properly
  - Calculations are accurate

---

### 2. Design & Architecture | 設計與架構

- [ ] **Follows project architecture** | 遵循專案架構
  - Layering respected (API, service, data layers)
  - Separation of concerns maintained
  - Dependency direction correct

- [ ] **Appropriate design patterns used** | 使用合適的設計模式
  - Not over-engineered
  - Not under-engineered
  - Patterns applied correctly

- [ ] **Code is in the right place** | 程式碼位於正確位置
  - Files organized logically
  - Related code grouped together
  - Clear module boundaries

---

### 3. Code Quality | 程式碼品質

- [ ] **Follows coding standards** | 遵循編碼標準
  - Naming conventions adhered to
  - Formatting consistent
  - Style guide followed

- [ ] **No code smells** | 無程式碼異味
  - Methods ≤50 lines (or project standard)
  - Classes have single responsibility
  - Cyclomatic complexity ≤10
  - No deeply nested conditionals (≤3 levels)

- [ ] **DRY principle applied** | 遵循 DRY 原則
  - No duplicated code blocks
  - Common logic extracted
  - Reusable utilities used

- [ ] **SOLID principles respected** | 遵循 SOLID 原則
  - Single Responsibility
  - Open/Closed
  - Liskov Substitution
  - Interface Segregation
  - Dependency Inversion

---

### 4. Readability & Maintainability | 可讀性與可維護性

- [ ] **Code is easy to understand** | 程式碼易於理解
  - Variable names are descriptive
  - Function names reveal intent
  - Logic flows naturally

- [ ] **Comments are helpful** | 註解有幫助
  - Complex logic explained
  - WHY documented, not WHAT
  - No commented-out code
  - No misleading comments

- [ ] **Consistent style** | 風格一致
  - Indentation correct
  - Spacing consistent
  - Naming patterns uniform

---

### 5. Testing | 測試

- [ ] **Tests are present** | 存在測試
  - New code has tests
  - Tests cover happy path
  - Tests cover error cases
  - Edge cases tested

- [ ] **Tests are good quality** | 測試品質良好
  - Tests are readable
  - Test names describe scenarios
  - Assertions are clear
  - No flaky tests

- [ ] **Test coverage maintained** | 測試覆蓋率維持
  - Coverage not decreased
  - Critical paths covered
  - Integration tests for key flows

---

### 6. Security | 安全性

- [ ] **No security vulnerabilities** | 無安全漏洞
  - No SQL injection risks
  - No XSS vulnerabilities
  - No hardcoded secrets
  - No insecure dependencies

- [ ] **Input validation present** | 存在輸入驗證
  - User input sanitized
  - Type checking performed
  - Size limits enforced

- [ ] **Authentication/Authorization correct** | 認證/授權正確
  - Proper auth checks
  - Role-based access enforced
  - Sensitive data protected

- [ ] **Data handling secure** | 資料處理安全
  - Sensitive data encrypted
  - Passwords hashed
  - PII handled appropriately

---

### 7. Performance | 效能

- [ ] **No obvious performance issues** | 無明顯效能問題
  - No N+1 queries
  - No unnecessary loops
  - No blocking operations in hot paths

- [ ] **Efficient algorithms used** | 使用高效演算法
  - Complexity considered (O(n) vs O(n²))
  - Appropriate data structures
  - Caching where beneficial

- [ ] **Resource management proper** | 資源管理適當
  - Connections closed
  - Memory leaks prevented
  - File handles released

---

### 8. Error Handling | 錯誤處理

- [ ] **Errors handled appropriately** | 錯誤處理適當
  - Try-catch blocks present
  - Specific exceptions caught
  - Generic catch avoided

- [ ] **Error messages helpful** | 錯誤訊息有幫助
  - Messages are descriptive
  - Actionable information included
  - No sensitive data exposed

- [ ] **Logging is adequate** | 日誌記錄充足
  - Errors logged with context
  - Log levels appropriate
  - No excessive logging

---

### 9. Documentation | 文件

- [ ] **API documentation present** | API 文件存在
  - Public methods documented
  - Parameters explained
  - Return values described
  - Exceptions documented

- [ ] **README updated if needed** | README 已更新（如需要）
  - New features documented
  - Setup instructions current
  - Examples provided

- [ ] **CHANGELOG updated** | CHANGELOG 已更新
  - Entry added for change
  - Breaking changes highlighted
  - Version number correct

---

### 10. Dependencies | 依賴

- [ ] **Dependencies justified** | 依賴合理
  - New dependencies necessary
  - License compatible
  - No security vulnerabilities
  - Actively maintained

- [ ] **Dependency versions locked** | 依賴版本鎖定
  - Exact versions specified
  - No wildcard versions
  - Lock file updated

---

## Review Comment Types | 審查評論類型

Use these prefixes to clarify comment intent:

### Comment Prefixes | 評論前綴

| Prefix | Meaning | Action Required |
|--------|---------|------------------|
| **❗ BLOCKING** | Must fix before merge | 🔴 Required |
| **⚠️ IMPORTANT** | Should fix, but not blocking | 🟡 Recommended |
| **💡 SUGGESTION** | Nice-to-have improvement | 🟢 Optional |
| **❓ QUESTION** | Need clarification | 🔵 Discuss |
| **📝 NOTE** | Informational, no action | ⚪ Informational |

### Example Comments | 評論範例

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

---

## Review Process | 審查流程

### For Reviewers | 審查者

#### Step 1: Understand Context | 理解背景

1. Read PR description and linked issues
2. Understand WHY the change is needed
3. Review design/spec documents if linked

#### Step 2: High-Level Review | 高層級審查

1. Check overall approach
2. Verify architecture alignment
3. Assess scope appropriateness

#### Step 3: Detailed Review | 詳細審查

1. Review each file change
2. Check functionality and logic
3. Look for bugs and edge cases
4. Verify tests

#### Step 4: Provide Feedback | 提供回饋

1. Use comment prefixes (BLOCKING, SUGGESTION, etc.)
2. Be specific and provide examples
3. Acknowledge good code
4. Suggest alternatives when criticizing

#### Step 5: Approve or Request Changes | 核准或要求變更

- **Approve**: If no blocking issues
- **Request Changes**: If blocking issues present
- **Comment**: If only suggestions/questions

---

### For Authors | 作者

#### Before Requesting Review | 請求審查前

1. **Self-review your code** | 自我審查程式碼
2. **Run tests locally** | 本地執行測試
3. **Check CI status** | 檢查 CI 狀態
4. **Write clear PR description** | 撰寫清楚的 PR 描述

#### During Review | 審查期間

1. **Respond promptly** | 及時回應
2. **Address all comments** | 處理所有評論
3. **Ask questions if unclear** | 不清楚時提問
4. **Push fixes quickly** | 快速推送修正

#### After Review | 審查後

1. **Mark conversations resolved** | 標記對話已解決
2. **Re-request review if needed** | 需要時重新請求審查
3. **Thank reviewers** | 感謝審查者

---

## Review Automation | 審查自動化

### Automated Checks (CI/CD) | 自動化檢查

Configure these checks to run automatically:

```yaml
# Example: GitHub Actions
name: PR Quality Checks

on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

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

## Code Review Anti-Patterns | 程式碼審查反模式

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

## Review Time Guidelines | 審查時間指引

### Target Response Times | 目標回應時間

| PR Size | Initial Response | Complete Review |
|---------|------------------|-----------------|
| < 50 lines | 2 hours | 4 hours |
| 50-200 lines | 4 hours | 1 day |
| 200-500 lines | 1 day | 2 days |
| > 500 lines | 🚨 Consider splitting | 3+ days |

### Reviewer Availability | 審查者可用性

- Set "review hours" in team calendar
- Use GitHub/GitLab "away" status when unavailable
- Assign backup reviewers for urgent PRs

---

## Special Cases | 特殊情況

### Hotfix Reviews | 緊急修復審查

- **Expedited process** | 加速流程
- Focus on: correctness, security, rollback plan
- Skip: minor style issues, nice-to-have optimizations
- **Post-merge review** allowed for critical issues

---

### Dependency Updates | 依賴更新

- Check CHANGELOG for breaking changes
- Verify test pass
- Review security advisories
- Consider automated with Dependabot/Renovate

---

### Documentation-Only Changes | 僅文件變更

- Check for accuracy
- Verify formatting (Markdown, etc.)
- Ensure examples are runnable
- Lighter review acceptable

---

### Refactoring PRs | 重構 PR

- Verify no functional changes
- Check test coverage unchanged
- Ensure readability improved
- Consider "before/after" comparison

---

## Project-Specific Customization | 專案特定化

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

## Tools and Integrations | 工具與整合

### Code Review Platforms | 程式碼審查平台

- **GitHub Pull Requests**
- **GitLab Merge Requests**
- **Bitbucket Pull Requests**
- **Gerrit** (for git-native workflows)
- **Review Board**

### Linters and Formatters | 檢查與格式化工具

| Language | Linter | Formatter |
|----------|--------|-----------|
| JavaScript/TypeScript | ESLint | Prettier |
| Python | Pylint, Flake8 | Black |
| C# | StyleCop, Roslyn Analyzers | dotnet format |
| Java | Checkstyle, PMD | Google Java Format |
| Go | golangci-lint | gofmt |
| Ruby | RuboCop | RuboCop |

### Static Analysis | 靜態分析

- **SonarQube** - Code quality and security
- **CodeClimate** - Maintainability analysis
- **Snyk** - Security vulnerabilities
- **Coveralls** - Code coverage tracking

---

## Quick Reference Card | 快速參考卡

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

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-12 | Initial code review checklist |

---

## References | 參考資料

- [Google Engineering Practices - Code Review](https://google.github.io/eng-practices/review/)
- [Microsoft Code Review Guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/pull-requests)
- [Effective Code Reviews](https://www.oreilly.com/library/view/making-software/9780596808310/)

---

## License | 授權

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
