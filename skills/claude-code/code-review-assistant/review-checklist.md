# Code Review Checklist

## 1. Functionality | 功能性

- [ ] **Code does what it's supposed to do**
  - Requirement/spec alignment verified
  - Acceptance criteria met
  - Edge cases handled

- [ ] **No obvious bugs**
  - Null/undefined checks present
  - Array bounds checked
  - Error conditions handled

- [ ] **Logic is correct**
  - Conditions make sense
  - Loops terminate properly
  - Calculations are accurate

---

## 2. Design & Architecture | 設計與架構

- [ ] **Follows project architecture**
  - Layering respected
  - Separation of concerns maintained
  - Dependency direction correct

- [ ] **Appropriate design patterns used**
  - Not over-engineered
  - Not under-engineered
  - Patterns applied correctly

- [ ] **Code is in the right place**
  - Files organized logically
  - Related code grouped together

---

## 3. Code Quality | 程式碼品質

- [ ] **Follows coding standards**
  - Naming conventions adhered to
  - Formatting consistent
  - Style guide followed

- [ ] **No code smells**
  - Methods ≤50 lines
  - Classes have single responsibility
  - Cyclomatic complexity ≤10
  - No deeply nested conditionals (≤3 levels)

- [ ] **DRY principle applied**
  - No duplicated code blocks
  - Common logic extracted

---

## 4. Readability | 可讀性

- [ ] **Code is easy to understand**
  - Variable names are descriptive
  - Function names reveal intent
  - Logic flows naturally

- [ ] **Comments are helpful**
  - Complex logic explained
  - WHY documented, not WHAT
  - No commented-out code

---

## 5. Testing | 測試

- [ ] **Tests are present**
  - New code has tests
  - Tests cover happy path
  - Tests cover error cases
  - Edge cases tested

- [ ] **Tests are good quality**
  - Tests are readable
  - Test names describe scenarios
  - Assertions are clear
  - No flaky tests

- [ ] **Test coverage maintained**
  - Coverage not decreased
  - Critical paths covered

---

## 6. Security | 安全性

- [ ] **No security vulnerabilities**
  - No SQL injection risks
  - No XSS vulnerabilities
  - No hardcoded secrets
  - No insecure dependencies

- [ ] **Input validation present**
  - User input sanitized
  - Type checking performed
  - Size limits enforced

- [ ] **Auth/Authorization correct**
  - Proper auth checks
  - Role-based access enforced
  - Sensitive data protected

---

## 7. Performance | 效能

- [ ] **No obvious performance issues**
  - No N+1 queries
  - No unnecessary loops
  - No blocking operations in hot paths

- [ ] **Efficient algorithms used**
  - Complexity considered
  - Appropriate data structures
  - Caching where beneficial

- [ ] **Resource management proper**
  - Connections closed
  - Memory leaks prevented
  - File handles released

---

## 8. Error Handling | 錯誤處理

- [ ] **Errors handled appropriately**
  - Try-catch blocks present
  - Specific exceptions caught
  - Generic catch avoided

- [ ] **Error messages helpful**
  - Messages are descriptive
  - Actionable information included
  - No sensitive data exposed

- [ ] **Logging is adequate**
  - Errors logged with context
  - Log levels appropriate
  - No excessive logging

---

## 9. Documentation | 文件

- [ ] **API documentation present**
  - Public methods documented
  - Parameters explained
  - Return values described
  - Exceptions documented

- [ ] **README updated if needed**
  - New features documented
  - Setup instructions current

- [ ] **CHANGELOG updated (if applicable)**
  - User-facing changes added to `[Unreleased]`
  - Breaking changes marked with **BREAKING**

---

## 10. Dependencies | 依賴

- [ ] **Dependencies justified**
  - New dependencies necessary
  - License compatible
  - No security vulnerabilities
  - Actively maintained

- [ ] **Dependency versions locked**
  - Exact versions specified
  - Lock file updated

---

## Quick Reference Card

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
```

---

**License**: CC BY 4.0 | **Source**: [universal-doc-standards](https://github.com/AsiaOstrich/universal-doc-standards)
