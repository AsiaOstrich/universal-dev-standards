# Code Check-in Standards

> **Language**: English | [繁體中文](../locales/zh-TW/core/checkin-standards.md)

**Version**: 1.4.0
**Last Updated**: 2026-01-16
**Applicability**: All software projects using version control
**Scope**: partial
**Industry Standards**: SWEBOK v4.0 Chapter 6
**References**: [computer.org](https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4)

---

## Purpose

This standard defines quality gates that MUST be passed before committing code to version control. It ensures every commit maintains codebase stability and quality.

---

## Core Philosophy

**Every commit should**:
- ✅ Be a complete logical unit of work
- ✅ Leave the codebase in a working state
- ✅ Be reversible without breaking functionality
- ✅ Contain its own tests (for new features)
- ✅ Be understandable to future developers

---

## Mandatory Checklist

### 1. Build Verification

- [ ] **Code compiles successfully**
  - Zero build errors
  - Zero build warnings (or documented exceptions)

- [ ] **Dependencies are satisfied**
  - All package dependencies installed
  - Dependency versions locked/documented
  - No missing imports or modules

**Project-Specific Build Commands**:
```bash
# Example: .NET project
dotnet build --configuration Release --warnaserror

# Example: Node.js project
npm install && npm run build

# Example: Python project
pip install -r requirements.txt && python -m py_compile src/**/*.py
```

**Verification**:
- Run the build command locally before committing
- Ensure exit code is 0 (success)
- Check build output for warnings

---

### 2. Test Verification

- [ ] **All relevant tests pass**
  - Unit tests: All tests in modified modules pass
  - Integration tests: All tests related to changed components pass
  - End-to-end tests (if applicable): All critical path tests pass

  > **Note**: "Relevant tests" means tests directly exercising changed code plus tests that may be affected by the changes. Use your project's test impact analysis tools if available.

- [ ] **New code is tested**
  - New features have corresponding tests
  - Bug fixes include regression tests
  - Edge cases are covered

- [ ] **Test coverage maintained or improved**
  - Coverage percentage not decreased
  - Critical paths are tested

**Project-Specific Test Commands**:
```bash
# Example: .NET project
dotnet test --no-build --verbosity normal

# Example: Node.js project with Jest
npm test -- --coverage

# Example: Python project with pytest
pytest --cov=src tests/
```

**Verification**:
- Run all test suites locally
- Review test coverage report
- Ensure new code paths are tested

#### Bug Fix Testing Evaluation

When fixing bugs, evaluate whether to add regression tests:

**✅ MUST Add Tests (High Value)**:
| Condition | Reason |
|-----------|--------|
| Security-related bugs | Prevent recurrence of vulnerabilities |
| Data integrity bugs | Protect critical business data |
| Bugs that caused outages | Ensure system stability |
| Bugs that recurred | Break the cycle of repeated issues |
| Complex business logic bugs | Document expected behavior |

**⚠️ OPTIONAL Tests (Lower Value)**:
| Condition | Reason |
|-----------|--------|
| Simple typos | Low recurrence risk |
| Obvious logic errors (e.g., `>` vs `<`) | Easy to spot in review |
| Already covered by existing tests | Avoid redundant tests |
| One-time configuration errors | Won't recur in code |

**Quick Decision Questions**:
1. Could this bug recur from future code changes? → YES = Add test
2. Would existing tests have caught this bug? → NO = Add test
3. Is this a critical path or core functionality? → YES = Add test
4. Did this bug occur before? → YES = Add test

**Regression Test Naming**:
```javascript
describe('Regression: [BUG-ID or description]', () => {
  it('should [correct behavior] when [trigger condition]', () => {
    // Test that would have caught the bug
  });
});
```

---

### 3. Code Quality

- [ ] **Follows coding standards**
  - Naming conventions adhered to
  - Code formatting consistent
  - Comments/documentation present

- [ ] **No code smells**
  - Methods ≤50 lines (or project standard)
  - Nesting depth ≤3 levels
  - Cyclomatic complexity ≤10
  - No duplicated code blocks

- [ ] **Security checked**
  - No hardcoded secrets (passwords, API keys)
  - No SQL injection vulnerabilities
  - No XSS vulnerabilities
  - No insecure dependencies

**Project-Specific Quality Tools**:
```bash
# Example: ESLint for JavaScript
npx eslint src/

# Example: Pylint for Python
pylint src/

# Example: ReSharper for C#
dotnet tool run jb inspectcode ProjectName.sln

# Example: Security scanner
npm audit
pip-audit
dotnet list package --vulnerable
```

**Verification**:
- Run linter/formatter tools
- Review static analysis reports
- Check for security warnings

---

### 4. Documentation

- [ ] **API documentation updated**
  - Public APIs have doc comments
  - Parameter descriptions complete
  - Return value documented
  - Exceptions documented

- [ ] **README updated (if needed)**
  - New features documented
  - Breaking changes noted
  - Setup instructions current

- [ ] **CHANGELOG updated (if applicable)**
  - For user-facing changes: entry added to `[Unreleased]` section
  - Breaking changes marked with **BREAKING** prefix
  - Follow exclusion rules in [versioning.md](versioning.md) and [changelog-standards.md](changelog-standards.md)
  - Note: Internal refactoring, test-only, docs-only changes typically don't need CHANGELOG entries

**Documentation Formats**:
```
// Example: C# XML documentation
/// <summary>
/// Validates user credentials and returns authentication token
/// </summary>
/// <param name="username">User login name</param>
/// <param name="password">User password</param>
/// <returns>JWT token if valid, null otherwise</returns>
/// <exception cref="ArgumentNullException">If username or password is null</exception>
public string Authenticate(string username, string password)

// Example: Python docstring
def authenticate(username: str, password: str) -> Optional[str]:
    """
    Validates user credentials and returns authentication token.

    Args:
        username: User login name
        password: User password

    Returns:
        JWT token if valid, None otherwise

    Raises:
        ValueError: If username or password is empty
    """
```

#### Applicability Criteria

Use this table to determine when optional items apply:

| Item | When It Applies | When It Doesn't Apply |
|------|-----------------|----------------------|
| **README update** | New features added, setup changed, API behavior changed | Internal refactoring, test-only changes, dependency updates |
| **CHANGELOG entry** | User-facing changes, bug fixes affecting users, breaking changes | Internal refactoring, test-only changes, documentation-only changes, dev dependency updates |
| **E2E tests** | User flows changed, critical paths affected, integration points modified | Backend-only changes with no UI impact, isolated utility functions |
| **API documentation** | Public API changed, new endpoints added, parameter meanings changed | Private methods, internal utilities, test code |

---

### 5. Workflow Compliance

- [ ] **Branch naming correct**
  - Follows project convention (e.g., `feature/`, `fix/`)
  - Descriptive name used

- [ ] **Commit message formatted**
  - Follows conventional commits or project standard
  - Clear and descriptive

- [ ] **Synchronized with target branch**
  - Merged latest changes from target branch
  - No merge conflicts
  - Rebase completed (if rebasing workflow)

**Verification**:
```bash
# Check branch name
git branch --show-current

# Sync with target branch (example: develop)
git fetch origin
git merge origin/develop
# OR
git rebase origin/develop

# Verify no conflicts
git status
```

---

## Check-in Timing Guidelines

### ✅ Appropriate Times to Commit

1. **Completed Functional Unit**
   - Feature fully implemented
   - Tests written and passing
   - Documentation updated

2. **Specific Bug Fixed**
   - Bug reproduced and fixed
   - Regression test added
   - Verified fix works

3. **Independent Refactor**
   - Refactoring complete
   - No functional changes
   - All tests still pass

4. **Runnable State**
   - Code compiles without errors
   - Application can run/start
   - Core functionality not broken

**Example Scenarios**:
```
✅ GOOD: "feat(auth): add OAuth2 Google login support"
   - OAuth flow implemented
   - Tests for happy path and errors
   - README updated with setup instructions
   - All existing tests pass

✅ GOOD: "fix(api): resolve memory leak in user session cache"
   - Memory leak identified and fixed
   - Regression test added
   - Load test shows leak resolved

✅ GOOD: "refactor(service): extract email validation to helper"
   - Email validation logic extracted
   - All call sites updated
   - Tests confirm identical behavior
```

---

## Commit Granularity Guidelines

### Ideal Commit Size

| Metric | Recommended | Description |
|--------|-------------|-------------|
| File Count | 1-10 files | Consider splitting if >10 files |
| Lines Changed | 50-300 lines | Too large is hard to review, too small lacks meaning |
| Scope | Single concern | One commit does one thing |

### Splitting Principles

**Should be combined into one commit**:
- Feature implementation + corresponding tests
- Tightly related multi-file changes

**Should be separate commits**:
- Feature A + Feature B → separate
- Refactoring + new feature → separate
- Bug fix + incidental refactoring → separate

### Frequency Recommendations

| Scenario | Recommended Frequency |
|----------|----------------------|
| Feature Development | Commit after each testable sub-feature |
| Bug Fix | Commit after each independent bug is fixed |
| Refactoring | Commit after each safe refactoring step (keep tests passing) |

---

## Collaboration Scenarios

### Multiple Developers on Same Feature

When multiple developers work on the same feature (e.g., frontend/backend split):

1. **Branch Strategy**: Create sub-branches from feature branch
   ```
   feature/order-book
   ├── feature/order-book-api      (Developer A)
   └── feature/order-book-ui       (Developer B)
   ```

2. **Check-in Rhythm**:
   - Commit and push after each integrable unit
   - Frequently sync with main feature branch to reduce conflicts

3. **Integration Points**:
   - Define clear interfaces/contracts
   - Commit interface definitions first, then implement separately

### Before and After Code Review

**Before Review**:
- Ensure all commits are complete logical units
- Clean up commit history (squash WIP commits)
- Write clear PR description

**After Review**:
- After making changes based on review feedback, add new commit (don't amend already pushed commits)
- Commit message can note: `fix(auth): adjust error handling per review feedback`

### Conflict Avoidance Strategies

1. **Small batches, high frequency**: Small commits are easier to merge than large ones
2. **Frequent sync**: At least once daily `git pull origin main`
3. **Avoid long-lived branches**: Feature branch lifecycle should not exceed 1-2 weeks

---

## Check-in Trigger Points

### Automatic Trigger Timing

During development workflow execution, the following events should trigger check-in reminders:

| Trigger | Condition | Reminder Intensity |
|---------|-----------|-------------------|
| Phase Complete | Completed a development phase | Suggest |
| Checkpoint | Reached a defined checkpoint | Suggest |
| Change Accumulation | Files ≥5 or lines ≥200 | Suggest |
| Consecutive Skips | Skipped check-in 3 times | Warning |
| Work Complete | Uncommitted changes before finishing | Strongly Recommend |

### Reminder Behavior

- **Advisory nature**: User can choose to skip and continue working
- **Non-blocking**: After choosing "later", automatically continue to next stage
- **Manual execution**: AI only displays git commands, **must not auto-execute** git add/commit

### Reminder Format

```
┌────────────────────────────────────────────────┐
│ 🔔 Check-in Checkpoint                         │
├────────────────────────────────────────────────┤
│ Phase 1 completed                              │
│                                                │
│ Change Statistics:                             │
│   - Files: 5                                   │
│   - Added: 180 lines                           │
│   - Deleted: 12 lines                          │
│                                                │
│ Test Status: ✅ Passed                         │
│                                                │
│ Suggested commit message:                      │
│   feat(module): complete Phase 1 Setup         │
│                                                │
│ Options:                                       │
│   [1] Commit now (will show git commands)      │
│   [2] Commit later, continue to next Phase     │
│   [3] View detailed changes                    │
└────────────────────────────────────────────────┘
```

### Skip Tracking

When user chooses "commit later":

1. **Record skip count**
2. **After 3 consecutive skips** → Display warning:
   ```
   ⚠️ Warning: You have skipped check-in 3 times consecutively
   Current accumulated changes: 15 files, +520 lines
   Recommend committing soon to avoid changes becoming too large to review
   ```
3. **Before work completion** → If uncommitted changes exist, strongly recommend check-in

---

## Special Scenarios

### Emergency Leave (End of Day)

When you need to leave temporarily with work incomplete:

**Option 1: Git Stash (Recommended)**
```bash
# Stash incomplete work
git stash save "WIP: matching engine - pending price validation"

# Resume next day
git stash pop
```

**Option 2: WIP Branch**
```bash
# Create temporary branch
git checkout -b wip/order-matching-temp
git add .
git commit -m "WIP: matching engine progress save (do not merge)"

# Return to main branch next day
git checkout feature/order-matching
git cherry-pick <wip-commit>
```

⚠️ **Prohibited**: Committing WIP code directly on feature branch

### Experimental Development

When doing technical exploration or POC:

1. **Create experiment branch**
   ```bash
   git checkout -b experiment/redis-stream-poc
   ```

2. **Free commits during experiment** (no strict format required)

3. **After experiment succeeds**:
   - Clean up commit history
   - Squash into meaningful commits
   - Merge to feature branch

4. **After experiment fails**:
   - Document lessons learned (optional)
   - Delete experiment branch

### Hotfix

For production emergency issues:

1. **Create hotfix branch from main**
   ```bash
   git checkout main
   git checkout -b hotfix/critical-null-pointer
   ```

2. **Minimize changes**: Only fix the problem, no additional refactoring

3. **Quick verification**: Ensure tests pass

4. **Mark urgency in commit message**:
   ```
   fix(matching): [URGENT] fix null pointer causing match failures

   - Issue: Market orders missing price field causes NullPointerException
   - Impact: All market orders cannot be matched
   - Fix: Add null check and default value handling

   Fixes #456
   ```

---

### ❌ Inappropriate Times to Commit

1. **Build Failures**
   - Compilation errors present
   - Unresolved dependencies

2. **Test Failures**
   - One or more tests failing
   - Tests not yet written for new code

3. **Incomplete Features**
   - Feature partially implemented
   - Would break existing functionality
   - Missing critical components

4. **Experimental Code**
   - TODO comments scattered
   - Debugging code left in
   - Commented-out code blocks

**Example Scenarios**:
```
❌ BAD: "WIP: trying to fix login"
   - Build has errors
   - Tests fail
   - Unclear what was attempted

❌ BAD: "feat(api): new endpoint (incomplete)"
   - Endpoint returns hardcoded data
   - No validation implemented
   - Tests say "TODO: write tests"

❌ BAD: "refactor: experimenting with new structure"
   - Half the files moved
   - Old code commented out instead of deleted
   - Multiple TODOs in code
```

---

## AI Assistant Integration

When AI assistants complete code changes, they MUST follow this workflow:

### Step 1: Evaluate Check-in Timing

**AI must assess**:
- Is this a complete logical unit?
- Is the codebase in a working state?
- Are there incomplete TODOs?

**Example Assessment**:
```
✅ Complete: "Implemented user registration with validation, tests, and docs"
⚠️ Incomplete: "Added registration form but backend validation pending"
❌ Not Ready: "Started working on registration, several TODOs remain"
```

---

### Step 2: Run Checklist

**AI must verify**:
- [ ] Build command succeeds
- [ ] Tests pass (or note if tests need user verification)
- [ ] Code follows project standards
- [ ] Documentation updated
- [ ] Commit message prepared

**Checklist Output Format**:
```
### Checklist Results

✅ Build: dotnet build --no-warnings succeeded
✅ Code Quality: Follows project C# standards
⚠️ Tests: Unit tests pass, integration tests need user verification
✅ Documentation: XML comments added to all public methods
✅ Commit Message: Prepared following conventional commits format
```

---

### Step 3: Prompt User for Confirmation

**AI MUST use this mandatory prompt format**:

```
## Please Confirm Check-in

Completed: [Brief description of work completed]

### Checklist Results
✅ Item 1
✅ Item 2
⚠️ Item 3 (needs user verification)
✅ Item 4

Suggested commit message:
```
<type>(<scope>): <description>

<detailed explanation>

<footer>
```

Proceed with commit now?
```

---

### Step 4: Wait for Confirmation

**AI must NOT**:
- ❌ Automatically execute `git add`
- ❌ Automatically execute `git commit`
- ❌ Automatically execute `git push`

**AI must**:
- ✅ Wait for explicit user approval
- ✅ Provide clear checklist summary
- ✅ Allow user to decline or request changes

---

## Project-Specific Customization

Each project should customize this standard by:

### 1. Define Build Commands

Create a `BUILD.md` or add to `CONTRIBUTING.md`:
```markdown
## Build Commands

### Development Build
```bash
npm run build:dev
```

### Production Build
```bash
npm run build:prod
```

### Build with Warnings as Errors
```bash
npm run build:strict
```
```

---

### 2. Define Test Commands

```markdown
## Test Commands

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run with Coverage
```bash
npm run test:coverage
```

### Minimum Coverage Required
- Line Coverage: 80%
- Branch Coverage: 75%
```

---

### 3. Define Quality Tools

```markdown
## Code Quality Tools

### Linter
```bash
npm run lint
```

### Formatter
```bash
npm run format
```

### Security Audit
```bash
npm audit
```

### Acceptable Warnings
- ESLint `no-console` warnings in development files
- Deprecated dependency X (upgrading in Q2 2025)
```

---

### 4. Define "Definition of Done"

```markdown
## Definition of Done

A feature is considered "done" when:
1. ✅ All acceptance criteria met
2. ✅ Code reviewed by 2 team members
3. ✅ Tests written (min 80% coverage)
4. ✅ Documentation updated
5. ✅ Deployed to staging environment
6. ✅ Product owner approved
```

---

## Enforcement Mechanisms

### Pre-commit Hooks

Use Git hooks to automate checks:

```bash
# .git/hooks/pre-commit
#!/bin/sh

echo "Running pre-commit checks..."

# Build check
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Commit rejected."
  exit 1
fi

# Test check
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Commit rejected."
  exit 1
fi

# Linter check
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linter failed. Commit rejected."
  exit 1
fi

echo "✅ All checks passed. Proceeding with commit."
exit 0
```

---

### CI/CD Integration

Configure CI to reject commits that fail checks:

```yaml
# Example: GitHub Actions
name: Code Quality Gate

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: npm run build

      - name: Test
        run: npm test

      - name: Lint
        run: npm run lint

      - name: Security Audit
        run: npm audit --audit-level=moderate
```

---

## Pre-commit Directory Hygiene

### IDE and Tool Artifacts

Before committing, verify no unwanted files are staged:

**Common Artifacts to Check**:

| Pattern | Source | Action |
|---------|--------|--------|
| `.idea/` | JetBrains IDEs | Should be gitignored |
| `.vs/` | Visual Studio | Should be gitignored |
| `*.user`, `*.suo` | Visual Studio | Should be gitignored |
| `.vscode/` | VS Code | Usually gitignored (except shared settings) |
| `${workspaceFolder}/` | VS Code variable expansion error | Delete immediately |
| `.DS_Store` | macOS | Should be gitignored |
| `Thumbs.db` | Windows | Should be gitignored |

### Verification Commands

```bash
# Check for common unwanted files in staging area
git diff --cached --name-only | grep -E '\.idea|\.vs/|\.user$|\.suo$|\.DS_Store|Thumbs\.db'

# Check for abnormal directories (e.g., ${workspaceFolder})
git ls-files | grep -E '^\$'

# If abnormal files found, unstage them
git reset HEAD <file>

# If abnormal directories exist but not tracked, remove them
rm -rf '${workspaceFolder}'
```

### Prevention

Ensure your `.gitignore` includes:

```gitignore
# IDE
.idea/
.vs/
*.user
*.suo
.vscode/

# OS
.DS_Store
Thumbs.db
desktop.ini

# Build outputs
dist/
build/
bin/
obj/
node_modules/
```

---

## Common Violations and Solutions

### Violation 1: "WIP" Commits

**Problem**:
```bash
git commit -m "WIP"
git commit -m "save work"
git commit -m "trying stuff"
```

**Why it's bad**:
- No clear purpose
- Likely contains broken code
- Pollutes git history

**Solution**:
- Use `git stash` for temporary saves
- Only commit when work is complete
- Squash WIP commits before merging

---

### Violation 2: Committing Commented Code

**Problem**:
```javascript
function calculateTotal(items) {
  // Old implementation
  // return items.reduce((sum, item) => sum + item.price, 0);

  // New implementation
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

**Why it's bad**:
- Clutters codebase
- Git history already preserves old code
- Confuses future developers

**Solution**:
- Delete commented code
- Rely on git history for old versions
- Add commit message explaining what changed

---

### Violation 3: Mixing Concerns

**Problem**:
```bash
git commit -m "fix bug and refactor and add feature"
```
One commit contains:
- Bug fix in module A
- Refactoring in module B
- New feature in module C

**Why it's bad**:
- Hard to review
- Can't cherry-pick specific changes
- Difficult to revert

**Solution**:
Separate into multiple commits:
```bash
git commit -m "fix(module-a): resolve null pointer error"
git commit -m "refactor(module-b): extract validation logic"
git commit -m "feat(module-c): add export to CSV feature"
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.4.0 | 2026-01-16 | Added: Bug Fix Testing Evaluation section with decision matrix |
| 1.3.0 | 2026-01-05 | Added: SWEBOK v4.0 Chapter 6 (Software Configuration Management) to References |
| 1.2.5 | 2025-12-16 | Clarified: CHANGELOG update is for user-facing changes only, added to [Unreleased] section |
| 1.2.4 | 2025-12-11 | Added: Pre-commit directory hygiene section (IDE artifacts, verification commands) |
| 1.2.3 | 2025-12-05 | Added: Reference to testing-standards.md |
| 1.2.2 | 2025-12-04 | Updated: GitHub Actions checkout to v4 |
| 1.2.1 | 2025-12-04 | Added: Cross-reference to versioning.md CHANGELOG exclusion rules |
| 1.2.0 | 2025-11-28 | Added: Commit granularity guidelines, collaboration scenarios, check-in trigger points, special scenarios (emergency leave, experimental dev, hotfix) |
| 1.0.0 | 2025-11-12 | Initial standard published |

---

## Related Standards

- [Project Structure Standard](project-structure.md)
- [Testing Standards](testing-standards.md) (or use `/testing-guide` skill)
- [Commit Message Guide](commit-message-guide.md)
- [Code Review Checklist](code-review-checklist.md)
- [Deployment Standards](deployment-standards.md) - Quality gates feed into deployment readiness

---

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [The Art of the Commit](https://alistapart.com/article/the-art-of-the-commit/)
- [Git Best Practices](https://sethrobertson.github.io/GitBestPractices/)
- [SWEBOK v4.0 - Chapter 6: Software Configuration Management](https://www.computer.org/education/bodies-of-knowledge/software-engineering) - IEEE Computer Society

---

## License

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
