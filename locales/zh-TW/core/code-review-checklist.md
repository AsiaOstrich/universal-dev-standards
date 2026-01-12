---
source: core/code-review-checklist.md
source_version: 1.3.0
translation_version: 1.3.0
last_synced: 2026-01-12
status: current
---

# 程式碼審查檢查清單

> **語言**: [English](../../../core/code-review-checklist.md) | 繁體中文

**版本**: 1.3.0
**最後更新**: 2026-01-12
**適用範圍**: 所有進行程式碼審查的軟體專案

---

## 目的

本標準提供全面的程式碼審查檢查清單，確保合併前的品質、可維護性與一致性。

---

## 核心原則

1. **尊重他人**
   - Review code, not the person
   - Assume good intentions
   - Be constructive, not critical

2. **徹底審查**
   - Check functionality, not just syntax
   - Consider edge cases
   - Think about future maintenance

3. **及時回應**
   - Review within 24 hours (or team SLA)
   - Don't block progress unnecessarily
   - Prioritize unblocking others

4. **清楚表達**
   - Explain WHY, not just WHAT
   - Provide examples when suggesting changes
   - Distinguish blocking vs. non-blocking comments

---

## 審查檢查清單

### 1. 功能性

- [ ] **程式碼實現預期功能**
  - Requirement/spec alignment verified
  - Acceptance criteria met
  - Edge cases handled

- [ ] **無明顯錯誤**
  - Null/undefined checks present
  - Array bounds checked
  - Error conditions handled

- [ ] **邏輯正確**
  - Conditions make sense
  - Loops terminate properly
  - Calculations are accurate

---

### 2. 設計與架構

- [ ] **遵循專案架構**
  - Layering respected (API, service, data layers)
  - Separation of concerns maintained
  - Dependency direction correct

- [ ] **使用合適的設計模式**
  - Not over-engineered
  - Not under-engineered
  - Patterns applied correctly

- [ ] **程式碼位於正確位置**
  - Files organized logically
  - Related code grouped together
  - Clear module boundaries

---

### 3. 程式碼品質

- [ ] **遵循編碼標準**
  - Naming conventions adhered to
  - Formatting consistent
  - Style guide followed

- [ ] **無程式碼異味**
  - Methods ≤50 lines (or project standard)
  - Classes have single responsibility
  - Cyclomatic complexity ≤10
  - No deeply nested conditionals (≤3 levels)

- [ ] **遵循 DRY 原則**
  - No duplicated code blocks
  - Common logic extracted
  - Reusable utilities used

- [ ] **遵循 SOLID 原則**
  - Single Responsibility
  - Open/Closed
  - Liskov Substitution
  - Interface Segregation
  - Dependency Inversion

---

### 4. 可讀性與可維護性

- [ ] **程式碼易於理解**
  - Variable names are descriptive
  - Function names reveal intent
  - Logic flows naturally

- [ ] **註解有幫助**
  - Complex logic explained
  - WHY documented, not WHAT
  - No commented-out code
  - No misleading comments

- [ ] **風格一致**
  - Indentation correct
  - Spacing consistent
  - Naming patterns uniform

---

### 5. 測試

- [ ] **存在測試**
  - New code has tests
  - Tests cover happy path
  - Tests cover error cases
  - Edge cases tested

- [ ] **測試品質良好**
  - Tests are readable
  - Test names describe scenarios
  - Assertions are clear
  - No flaky tests

- [ ] **測試覆蓋率維持**
  - Coverage not decreased
  - Critical paths covered
  - Integration tests for key flows

---

### 6. 安全性

- [ ] **無安全漏洞**
  - No SQL injection risks
  - No XSS vulnerabilities
  - No hardcoded secrets
  - No insecure dependencies

- [ ] **存在輸入驗證**
  - User input sanitized
  - Type checking performed
  - Size limits enforced

- [ ] **認證/授權正確**
  - Proper auth checks
  - Role-based access enforced
  - Sensitive data protected

- [ ] **資料處理安全**
  - Sensitive data encrypted
  - Passwords hashed
  - PII handled appropriately

---

### 7. 效能

- [ ] **無明顯效能問題**
  - No N+1 queries
  - No unnecessary loops
  - No blocking operations in hot paths

- [ ] **使用高效演算法**
  - Complexity considered (O(n) vs O(n²))
  - Appropriate data structures
  - Caching where beneficial

- [ ] **資源管理適當**
  - Connections closed
  - Memory leaks prevented
  - File handles released

---

### 8. 錯誤處理

- [ ] **錯誤處理適當**
  - Try-catch blocks present
  - Specific exceptions caught
  - Generic catch avoided

- [ ] **錯誤訊息有幫助**
  - Messages are descriptive
  - Actionable information included
  - No sensitive data exposed

- [ ] **日誌記錄充足**
  - Errors logged with context
  - Log levels appropriate
  - No excessive logging

---

### 9. 文件

- [ ] **API 文件存在**
  - Public methods documented
  - Parameters explained
  - Return values described
  - Exceptions documented

- [ ] **README 已更新（如需要）**
  - New features documented
  - Setup instructions current
  - Examples provided

- [ ] **CHANGELOG 已更新（如適用）**
  - 對於使用者可感知的變更：已新增條目至 `[Unreleased]` 區段
  - Breaking changes highlighted with **BREAKING** prefix
  - 遵循 [versioning.md](versioning.md) 和 [changelog-standards.md](changelog-standards.md) 排除規則

---

### 10. 依賴

- [ ] **依賴合理**
  - New dependencies necessary
  - License compatible
  - No security vulnerabilities
  - Actively maintained

- [ ] **依賴版本鎖定**
  - Exact versions specified
  - No wildcard versions
  - Lock file updated

---

## 審查評論類型

Use these prefixes to clarify comment intent:

### 評論前綴

| Prefix | Meaning | Action Required |
|--------|---------|------------------|
| **❗ BLOCKING** | Must fix before merge | 🔴 Required |
| **⚠️ IMPORTANT** | Should fix, but not blocking | 🟡 Recommended |
| **💡 SUGGESTION** | Nice-to-have improvement | 🟢 Optional |
| **❓ QUESTION** | Need clarification | 🔵 Discuss |
| **📝 NOTE** | Informational, no action | ⚪ Informational |

### 評論範例

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

### 替代方案：文字標籤

對於偏好純文字標籤（無 emoji）的團隊：

| 標籤 | 意義 | Action |
|------|------|--------|
| `[必要]` | 必須修正才能合併 | 🔴 Required |
| `[建議]` | 建議修正但非阻擋 | 🟡 Recommended |
| `[問題]` | 需要澄清 | 🔵 Discuss |
| `[NIT]` | 小建議，可忽略 | 🟢 Optional |
| `[讚]` | 正面回饋 | ⚪ Informational |

**評論範例**

```markdown
[必要] 此處有 SQL 注入風險。

[建議] 可考慮使用 StringBuilder 提升效能。

[問題] 當輸入為 null 時，預期行為是什麼？

[NIT] 變數名稱可以更明確。

[讚] 優雅的解法！重構得很好。
```

---

## 審查流程

### 審查者

#### Step 1: 理解背景

1. Read PR description and linked issues
2. Understand WHY the change is needed
3. Review design/spec documents if linked

#### Step 2: 高層級審查

1. Check overall approach
2. Verify architecture alignment
3. Assess scope appropriateness

#### Step 3: 詳細審查

1. Review each file change
2. Check functionality and logic
3. Look for bugs and edge cases
4. Verify tests

#### Step 4: 提供回饋

1. Use comment prefixes (BLOCKING, SUGGESTION, etc.)
2. Be specific and provide examples
3. Acknowledge good code
4. Suggest alternatives when criticizing

#### Step 5: 核准或要求變更

- **Approve**: If no blocking issues
- **Request Changes**: If blocking issues present
- **Comment**: If only suggestions/questions

---

### 作者

#### 請求審查前

1. **自我審查程式碼**
2. **本地執行測試**
3. **檢查 CI 狀態**
4. **撰寫清楚的 PR 描述**

#### 審查期間

1. **及時回應**
2. **處理所有評論**
3. **不清楚時提問**
4. **快速推送修正**

#### 審查後

1. **標記對話已解決**
2. **需要時重新請求審查**
3. **感謝審查者**

---

## 審查自動化

### 自動化檢查

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

## 程式碼審查反模式

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

## 審查時間指引

### 目標回應時間

| PR Size | Initial Response | Complete Review |
|---------|------------------|-----------------|
| < 50 lines | 2 hours | 4 hours |
| 50-200 lines | 4 hours | 1 day |
| 200-500 lines | 1 day | 2 days |
| > 500 lines | 🚨 Consider splitting | 3+ days |

### 審查者可用性

- Set "review hours" in team calendar
- Use GitHub/GitLab "away" status when unavailable
- Assign backup reviewers for urgent PRs

---

## 特殊情況

### 緊急修復審查

- **加速流程**
- Focus on: correctness, security, rollback plan
- Skip: minor style issues, nice-to-have optimizations
- **Post-merge review** allowed for critical issues

---

### 依賴更新

- Check CHANGELOG for breaking changes
- Verify test pass
- Review security advisories
- Consider automated with Dependabot/Renovate

---

### 僅文件變更

- Check for accuracy
- Verify formatting (Markdown, etc.)
- Ensure examples are runnable
- Lighter review acceptable

---

### 重構 PR

重構變更需要特別注意，以確保行為保持不變的同時改善程式碼品質。

#### 審查前檢查清單

- [ ] **範圍已記錄**：PR 描述中清楚說明重構範圍
- [ ] **純重構**：沒有功能變更混入重構
- [ ] **測試通過**：重構前後所有測試皆通過
- [ ] **覆蓋率維持**：測試覆蓋率未下降

#### 審查重點

- [ ] **程式碼異味已處理**：修復了哪些異味？（Long Method、Duplicate Code 等）
- [ ] **重構模式正確**：是否套用了正確的技術？
- [ ] **命名改善**：新名稱是否有意義且一致？
- [ ] **複雜度降低**：程式碼是否可量化地更簡單？（考慮 cyclomatic complexity）
- [ ] **耦合降低**：依賴關係是否更清晰？

#### 大型重構（>500 行變更）

- [ ] **計畫已記錄**：連結到重構計畫或設計文件
- [ ] **增量提交**：每個 commit 可獨立審查
- [ ] **回滾策略**：如何在問題發生時復原？
- [ ] **效能評估**：是否影響執行時期效能？
- [ ] **特徵測試**：遺留程式碼已受行為捕捉測試保護

#### 警示信號

- ❗ **隱藏新功能**：功能變更偽裝成重構
- ❗ **測試行為變更**：斷言被修改而非保留
- ❗ **缺少文件**：沒有說明改了什麼或為什麼改
- ❗ **無關變更**：格式修正混入邏輯重構

#### 最佳實踐

- 偏好**多個小 PR** 而非一個大型重構 PR
- PR 標題使用 **[Refactor]** 前綴以便篩選
- 包含**重構前後**的程式碼片段或複雜度指標
- 參考所處理的**程式碼異味**（例如：「修復 UserService.process() 中的 Long Method」）

---

## 專案特定化

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

## 工具與整合

### 程式碼審查平台

- **GitHub Pull Requests**
- **GitLab Merge Requests**
- **Bitbucket Pull Requests**
- **Gerrit** (for git-native workflows)
- **Review Board**

### 檢查與格式化工具

| Language | Linter | Formatter |
|----------|--------|-----------|
| JavaScript/TypeScript | ESLint | Prettier |
| Python | Pylint, Flake8 | Black |
| C# | StyleCop, Roslyn Analyzers | dotnet format |
| Java | Checkstyle, PMD | Google Java Format |
| Go | golangci-lint | gofmt |
| Ruby | RuboCop | RuboCop |

### 靜態分析

- **SonarQube** - Code quality and security
- **CodeClimate** - Maintainability analysis
- **Snyk** - Security vulnerabilities
- **Coveralls** - Code coverage tracking

---

## 快速參考卡

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

## 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.3.0 | 2026-01-12 | 新增：完整重構 PR 段落，包含審查前檢查清單、審查重點、大型重構指南、警示信號及最佳實踐 |
| 1.2.0 | 2026-01-05 | 新增：SWEBOK v4.0 第 10 章（軟體品質）至參考資料 |
| 1.1.0 | 2025-12-22 | Added: Alternative text labels section for review comments (中文標籤支援) |
| 1.0.3 | 2025-12-16 | Clarified: CHANGELOG section aligned with changelog-standards.md, use markdown links for cross-references |
| 1.0.2 | 2025-12-05 | Added: Reference to testing-standards.md |
| 1.0.1 | 2025-12-04 | Updated: GitHub Actions checkout to v4, cross-reference to versioning.md |
| 1.0.0 | 2025-11-12 | Initial code review checklist |

---

## 相關標準

- [Refactoring Standards](refactoring-standards.md) - 重構標準（遺留程式碼策略、大規模模式、度量指標）
- [Testing Standards](testing-standards.md) - 測試標準 (UT/IT/ST/E2E)（或使用 `/testing-guide` 技能）
- [Code Check-in Standards](checkin-standards.md) - 程式碼簽入標準
- [Commit Message Guide](commit-message-guide.md) - Commit 訊息規範

---

## 參考資料

- [Google Engineering Practices - Code Review](https://google.github.io/eng-practices/review/)
- [Microsoft Code Review Guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/pull-requests)
- [Effective Code Reviews](https://www.oreilly.com/library/view/making-software/9780596808310/)
- [SWEBOK v4.0 - 第 10 章：軟體品質](https://www.computer.org/education/bodies-of-knowledge/software-engineering) - IEEE Computer Society

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
