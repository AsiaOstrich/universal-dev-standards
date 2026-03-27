# Code Review Checklist

> **Language**: English | [繁體中文](../locales/zh-TW/core/code-review-checklist.md)

**Version**: 1.3.0
**Last Updated**: 2026-01-12
**Applicability**: All software projects with code review processes
**Scope**: universal
**Industry Standards**: SWEBOK v4.0 Chapter 10
**References**: [google.github.io](https://google.github.io/eng-practices/review/)

---

## Purpose

This standard provides a comprehensive checklist for reviewing code changes, ensuring quality, maintainability, and consistency before merging.

---

## Core Principles

1. **Be Respectful**
   - Review code, not the person
   - Assume good intentions
   - Be constructive, not critical

2. **Be Thorough**
   - Check functionality, not just syntax
   - Consider edge cases
   - Think about future maintenance

3. **Be Timely**
   - Review within 24 hours (or team SLA)
   - Don't block progress unnecessarily
   - Prioritize unblocking others

4. **Be Clear**
   - Explain WHY, not just WHAT
   - Provide examples when suggesting changes
   - Distinguish blocking vs. non-blocking comments

---

## Review Checklist

### 1. Functionality

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

### 2. Design & Architecture

- [ ] **Follows project architecture**
  - Layering respected (API, service, data layers)
  - Separation of concerns maintained
  - Dependency direction correct

- [ ] **Appropriate design patterns used**
  - Not over-engineered
  - Not under-engineered
  - Patterns applied correctly

- [ ] **Code is in the right place**
  - Files organized logically
  - Related code grouped together
  - Clear module boundaries

---

### 3. Code Quality

- [ ] **Follows coding standards**
  - Naming conventions adhered to
  - Formatting consistent
  - Style guide followed

- [ ] **No code smells**
  - Methods ≤50 lines (or project standard)
  - Classes have single responsibility
  - Cyclomatic complexity ≤10
  - No deeply nested conditionals (≤3 levels)

- [ ] **DRY principle applied**
  - No duplicated code blocks
  - Common logic extracted
  - Reusable utilities used

- [ ] **SOLID principles respected**
  - Single Responsibility
  - Open/Closed
  - Liskov Substitution
  - Interface Segregation
  - Dependency Inversion

---

### 4. Readability & Maintainability

- [ ] **Code is easy to understand**
  - Variable names are descriptive
  - Function names reveal intent
  - Logic flows naturally

- [ ] **Comments are helpful**
  - Complex logic explained
  - WHY documented, not WHAT
  - No commented-out code
  - No misleading comments

- [ ] **Consistent style**
  - Indentation correct
  - Spacing consistent
  - Naming patterns uniform

---

### 5. Testing

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
  - Integration tests for key flows

---

### 6. Security

- [ ] **No security vulnerabilities**
  - No SQL injection risks
  - No XSS vulnerabilities
  - No hardcoded secrets
  - No insecure dependencies

- [ ] **Input validation present**
  - User input sanitized
  - Type checking performed
  - Size limits enforced

- [ ] **Authentication/Authorization correct**
  - Proper auth checks
  - Role-based access enforced
  - Sensitive data protected

- [ ] **Data handling secure**
  - Sensitive data encrypted
  - Passwords hashed
  - PII handled appropriately

---

### 7. Performance

- [ ] **No obvious performance issues**
  - No N+1 queries
  - No unnecessary loops
  - No blocking operations in hot paths

- [ ] **Efficient algorithms used**
  - Complexity considered (O(n) vs O(n²))
  - Appropriate data structures
  - Caching where beneficial

- [ ] **Resource management proper**
  - Connections closed
  - Memory leaks prevented
  - File handles released

---

### 8. Error Handling

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

### 9. Documentation

- [ ] **API documentation present**
  - Public methods documented
  - Parameters explained
  - Return values described
  - Exceptions documented

- [ ] **README updated if needed**
  - New features documented
  - Setup instructions current
  - Examples provided

- [ ] **CHANGELOG updated (if applicable)**
  - For user-facing changes: entry added to `[Unreleased]` section
  - Breaking changes highlighted with **BREAKING** prefix
  - Follow exclusion rules in [versioning.md](versioning.md) and [changelog-standards.md](changelog-standards.md)

---

### 10. Dependencies

- [ ] **Dependencies justified**
  - New dependencies necessary
  - License compatible
  - No security vulnerabilities
  - Actively maintained

- [ ] **Dependency versions locked**
  - Exact versions specified
  - No wildcard versions
  - Lock file updated

---

## Review Comment Types

Use these prefixes to clarify comment intent:

### Comment Prefixes

| Prefix | Meaning | Action Required |
|--------|---------|------------------|
| **❗ BLOCKING** | Must fix before merge | 🔴 Required |
| **⚠️ IMPORTANT** | Should fix, but not blocking | 🟡 Recommended |
| **💡 SUGGESTION** | Nice-to-have improvement | 🟢 Optional |
| **❓ QUESTION** | Need clarification | 🔵 Discuss |
| **📝 NOTE** | Informational, no action | ⚪ Informational |

### Example Comments

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

> This comment prefix approach aligns with the [Conventional Comments](https://conventionalcomments.org/) specification, which standardizes review feedback across teams and tools.

### Alternative: Text Labels

For teams preferring plain text labels without emojis:

| Label | Meaning | Action |
|-------|---------|--------|
| `[REQUIRED]` | Must fix before merge | 🔴 Required |
| `[SUGGESTION]` | Recommended but not blocking | 🟡 Recommended |
| `[QUESTION]` | Need clarification | 🔵 Discuss |
| `[NIT]` | Minor suggestion, can ignore | 🟢 Optional |
| `[PRAISE]` | Positive feedback | ⚪ Informational |

**Example Comments**

```markdown
[REQUIRED] Potential SQL injection vulnerability here.

[SUGGESTION] Consider using StringBuilder for better performance.

[QUESTION] What's the intended behavior when input is null?

[NIT] Variable name could be more descriptive.

[PRAISE] Elegant solution! Nice refactoring.
```

---

## Review Process

### For Reviewers

#### Step 1: Understand Context

1. Read PR description and linked issues
2. Understand WHY the change is needed
3. Review design/spec documents if linked

#### Step 2: High-Level Review

1. Check overall approach
2. Verify architecture alignment
3. Assess scope appropriateness

#### Step 3: Detailed Review

1. Review each file change
2. Check functionality and logic
3. Look for bugs and edge cases
4. Verify tests

#### Step 4: Provide Feedback

1. Use comment prefixes (BLOCKING, SUGGESTION, etc.)
2. Be specific and provide examples
3. Acknowledge good code
4. Suggest alternatives when criticizing

#### Step 5: Approve or Request Changes

- **Approve**: If no blocking issues
- **Request Changes**: If blocking issues present
- **Comment**: If only suggestions/questions

---

### For Authors

#### Before Requesting Review

1. **Self-review your code**
2. **Run tests locally**
3. **Check CI status**
4. **Write clear PR description**

#### During Review

1. **Respond promptly**
2. **Address all comments**
3. **Ask questions if unclear**
4. **Push fixes quickly**

#### After Review

1. **Mark conversations resolved**
2. **Re-request review if needed**
3. **Thank reviewers**

---

## Review Automation

### Automated Checks (CI/CD)

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

## Code Review Anti-Patterns

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

## Review Time Guidelines

### Target Response Times

| PR Size | Initial Response | Complete Review |
|---------|------------------|-----------------|
| < 50 lines | 2 hours | 4 hours |
| 50-200 lines | 4 hours | 1 day |
| 200-500 lines | 1 day | 2 days |
| > 500 lines | 🚨 Consider splitting | 3+ days |

### Reviewer Availability

- Set "review hours" in team calendar
- Use GitHub/GitLab "away" status when unavailable
- Assign backup reviewers for urgent PRs

---

## Special Cases

### Hotfix Reviews

- **Expedited process**
- Focus on: correctness, security, rollback plan
- Skip: minor style issues, nice-to-have optimizations
- **Post-merge review** allowed for critical issues

---

### Dependency Updates

- Check CHANGELOG for breaking changes
- Verify test pass
- Review security advisories
- Consider automated with Dependabot/Renovate

---

### Documentation-Only Changes

- Check for accuracy
- Verify formatting (Markdown, etc.)
- Ensure examples are runnable
- Lighter review acceptable

---

### Refactoring PRs

Refactoring changes require special attention to ensure behavior is preserved while code quality improves.

#### Pre-Review Checklist

- [ ] **Scope documented**: Refactoring scope clearly stated in PR description
- [ ] **Pure refactoring**: No functional changes mixed with refactoring
- [ ] **Tests pass**: All tests pass before AND after refactoring
- [ ] **Coverage maintained**: Test coverage not decreased

#### Review Focus Areas

- [ ] **Code smells addressed**: Which smells were fixed? (Long Method, Duplicate Code, etc.)
- [ ] **Refactoring pattern correct**: Was the appropriate technique applied?
- [ ] **Naming improved**: Are new names meaningful and consistent?
- [ ] **Complexity reduced**: Is the code measurably simpler? (Consider cyclomatic complexity)
- [ ] **Coupling reduced**: Are dependencies cleaner?

#### Large Refactoring (>500 lines changed)

- [ ] **Plan documented**: Link to refactoring plan or design doc
- [ ] **Incremental commits**: Each commit is reviewable independently
- [ ] **Rollback strategy**: How to revert if issues arise?
- [ ] **Performance assessed**: Any impact on runtime performance?
- [ ] **Characterization tests**: Legacy code protected by behavior-capturing tests

#### Red Flags

- ❗ **New features hidden**: Functional changes disguised as refactoring
- ❗ **Test behavior changed**: Assertions modified rather than preserved
- ❗ **Missing documentation**: No explanation of what changed or why
- ❗ **Unrelated changes**: Formatting fixes mixed with logic refactoring

#### Best Practices

- Prefer **multiple small PRs** over one large refactoring PR
- Use **[Refactor]** prefix in PR title for easy filtering
- Include **before/after** code snippets or complexity metrics
- Reference the **code smell** being addressed (e.g., "Fixes Long Method in UserService.process()")

---

## Project-Specific Customization

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

## Tools and Integrations

### Code Review Platforms

- **GitHub Pull Requests**
- **GitLab Merge Requests**
- **Bitbucket Pull Requests**
- **Gerrit** (for git-native workflows)
- **Review Board**

### Linters and Formatters

| Language | Linter | Formatter |
|----------|--------|-----------|
| JavaScript/TypeScript | ESLint | Prettier |
| Python | Pylint, Flake8 | Black |
| C# | StyleCop, Roslyn Analyzers | dotnet format |
| Java | Checkstyle, PMD | Google Java Format |
| Go | golangci-lint | gofmt |
| Ruby | RuboCop | RuboCop |

### Static Analysis

- **SonarQube** - Code quality and security
- **CodeClimate** - Maintainability analysis
- **Snyk** - Security vulnerabilities
- **Coveralls** - Code coverage tracking

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

Comment Prefixes:
❗ BLOCKING - Must fix
⚠️ IMPORTANT - Should fix
💡 SUGGESTION - Nice to have
❓ QUESTION - Need clarification
📝 NOTE - Informational
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.3.0 | 2026-01-12 | Added: Comprehensive Refactoring PRs section with pre-review checklist, review focus areas, large refactoring guidelines, red flags, and best practices |
| 1.2.0 | 2026-01-05 | Added: SWEBOK v4.0 Chapter 10 (Software Quality) to References |
| 1.1.0 | 2025-12-22 | Added: Alternative text labels section for review comments (Chinese label support) |
| 1.0.3 | 2025-12-16 | Clarified: CHANGELOG section aligned with changelog-standards.md, use markdown links for cross-references |
| 1.0.2 | 2025-12-05 | Added: Reference to testing-standards.md |
| 1.0.1 | 2025-12-04 | Updated: GitHub Actions checkout to v4, cross-reference to versioning.md |
| 1.0.0 | 2025-11-12 | Initial code review checklist |

---

## Related Standards

- [Testing Standards](testing-standards.md) - Testing standards (UT/IT/ST/E2E) (or use `/testing-guide` skill)
- [Code Check-in Standards](checkin-standards.md) - Code check-in standards
- [Commit Message Guide](commit-message-guide.md) - Commit message standards

---

## References

- [Google Engineering Practices - Code Review](https://google.github.io/eng-practices/review/)
- [Microsoft Code Review Guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/pull-requests)
- [Effective Code Reviews](https://www.oreilly.com/library/view/making-software/9780596808310/)
- [SWEBOK v4.0 - Chapter 10: Software Quality](https://www.computer.org/education/bodies-of-knowledge/software-engineering) - IEEE Computer Society

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
