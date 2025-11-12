# Code Check-in Standards
# 程式碼簽入檢查點標準

**Version**: 1.0.0
**Last Updated**: 2025-11-12
**Applicability**: All software projects using version control
**適用範圍**: 所有使用版本控制的軟體專案

---

## Purpose | 目的

This standard defines quality gates that MUST be passed before committing code to version control. It ensures every commit maintains codebase stability and quality.

本標準定義提交程式碼到版本控制前必須通過的品質關卡。確保每次提交都維持程式碼庫的穩定性與品質。

---

## Core Philosophy | 核心哲學

**Every commit should**:
- ✅ Be a complete logical unit of work
- ✅ Leave the codebase in a working state
- ✅ Be reversible without breaking functionality
- ✅ Contain its own tests (for new features)
- ✅ Be understandable to future developers

**每次提交應該**:
- ✅ 是完整的邏輯工作單元
- ✅ 讓程式碼庫處於可運作狀態
- ✅ 可回退而不破壞功能
- ✅ 包含自己的測試（新功能）
- ✅ 讓未來開發者能理解

---

## Mandatory Checklist | 必檢清單

### 1. Build Verification | 建置驗證

- [ ] **Code compiles successfully** | 程式碼成功編譯
  - Zero build errors
  - Zero build warnings (or documented exceptions)

- [ ] **Dependencies are satisfied** | 依賴已滿足
  - All package dependencies installed
  - Dependency versions locked/documented
  - No missing imports or modules

**Project-Specific Build Commands | 專案特定建置指令**:
```bash
# Example: .NET project
dotnet build --configuration Release --warnaserror

# Example: Node.js project
npm install && npm run build

# Example: Python project
pip install -r requirements.txt && python -m py_compile src/**/*.py
```

**Verification | 驗證**:
- Run the build command locally before committing
- Ensure exit code is 0 (success)
- Check build output for warnings

---

### 2. Test Verification | 測試驗證

- [ ] **All existing tests pass** | 所有現有測試通過
  - Unit tests: 100% pass rate
  - Integration tests: 100% pass rate
  - End-to-end tests (if applicable): 100% pass rate

- [ ] **New code is tested** | 新程式碼已測試
  - New features have corresponding tests
  - Bug fixes include regression tests
  - Edge cases are covered

- [ ] **Test coverage maintained or improved** | 測試覆蓋率維持或提升
  - Coverage percentage not decreased
  - Critical paths are tested

**Project-Specific Test Commands | 專案特定測試指令**:
```bash
# Example: .NET project
dotnet test --no-build --verbosity normal

# Example: Node.js project with Jest
npm test -- --coverage

# Example: Python project with pytest
pytest --cov=src tests/
```

**Verification | 驗證**:
- Run all test suites locally
- Review test coverage report
- Ensure new code paths are tested

---

### 3. Code Quality | 程式碼品質

- [ ] **Follows coding standards** | 遵循編碼標準
  - Naming conventions adhered to
  - Code formatting consistent
  - Comments/documentation present

- [ ] **No code smells** | 無程式碼異味
  - Methods ≤50 lines (or project standard)
  - Nesting depth ≤3 levels
  - Cyclomatic complexity ≤10
  - No duplicated code blocks

- [ ] **Security checked** | 安全性已檢查
  - No hardcoded secrets (passwords, API keys)
  - No SQL injection vulnerabilities
  - No XSS vulnerabilities
  - No insecure dependencies

**Project-Specific Quality Tools | 專案特定品質工具**:
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

**Verification | 驗證**:
- Run linter/formatter tools
- Review static analysis reports
- Check for security warnings

---

### 4. Documentation | 文件

- [ ] **API documentation updated** | API 文件已更新
  - Public APIs have doc comments
  - Parameter descriptions complete
  - Return value documented
  - Exceptions documented

- [ ] **README updated (if needed)** | README 已更新（如需要）
  - New features documented
  - Breaking changes noted
  - Setup instructions current

- [ ] **CHANGELOG updated** | CHANGELOG 已更新
  - Entry added for this change
  - Version number correct
  - Breaking changes highlighted

**Documentation Formats | 文件格式**:
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

---

### 5. Workflow Compliance | 工作流程合規

- [ ] **Branch naming correct** | 分支命名正確
  - Follows project convention (e.g., `feature/`, `fix/`)
  - Descriptive name used

- [ ] **Commit message formatted** | Commit 訊息已格式化
  - Follows conventional commits or project standard
  - Clear and descriptive

- [ ] **Synchronized with target branch** | 已與目標分支同步
  - Merged latest changes from target branch
  - No merge conflicts
  - Rebase completed (if rebasing workflow)

**Verification | 驗證**:
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

## Check-in Timing Guidelines | 簽入時機指引

### ✅ Appropriate Times to Commit | 適合提交的時機

1. **Completed Functional Unit** | 完成功能單元
   - Feature fully implemented
   - Tests written and passing
   - Documentation updated

2. **Specific Bug Fixed** | 修復特定 Bug
   - Bug reproduced and fixed
   - Regression test added
   - Verified fix works

3. **Independent Refactor** | 獨立重構
   - Refactoring complete
   - No functional changes
   - All tests still pass

4. **Runnable State** | 可執行狀態
   - Code compiles without errors
   - Application can run/start
   - Core functionality not broken

**Example Scenarios | 範例情境**:
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

### ❌ Inappropriate Times to Commit | 不適合提交的時機

1. **Build Failures** | 建置失敗
   - Compilation errors present
   - Unresolved dependencies

2. **Test Failures** | 測試失敗
   - One or more tests failing
   - Tests not yet written for new code

3. **Incomplete Features** | 未完成功能
   - Feature partially implemented
   - Would break existing functionality
   - Missing critical components

4. **Experimental Code** | 實驗性程式碼
   - TODO comments scattered
   - Debugging code left in
   - Commented-out code blocks

**Example Scenarios | 範例情境**:
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

## AI Assistant Integration | AI 助理整合

When AI assistants complete code changes, they MUST follow this workflow:

當 AI 助理完成程式碼變更時，必須遵循此工作流程:

### Step 1: Evaluate Check-in Timing | 評估簽入時機

**AI must assess**:
- Is this a complete logical unit?
- Is the codebase in a working state?
- Are there incomplete TODOs?

**Example Assessment | 評估範例**:
```
✅ Complete: "Implemented user registration with validation, tests, and docs"
⚠️ Incomplete: "Added registration form but backend validation pending"
❌ Not Ready: "Started working on registration, several TODOs remain"
```

---

### Step 2: Run Checklist | 執行檢查清單

**AI must verify**:
- [ ] Build command succeeds
- [ ] Tests pass (or note if tests need user verification)
- [ ] Code follows project standards
- [ ] Documentation updated
- [ ] Commit message prepared

**Checklist Output Format | 檢查清單輸出格式**:
```
### 檢查結果 | Checklist Results

✅ Build: dotnet build --no-warnings succeeded
✅ Code Quality: Follows project C# standards
⚠️ Tests: Unit tests pass, integration tests need user verification
✅ Documentation: XML comments added to all public methods
✅ Commit Message: Prepared following conventional commits format
```

---

### Step 3: Prompt User for Confirmation | 提示使用者確認

**AI MUST use this mandatory prompt format**:

```
## 請確認是否簽入 | Please Confirm Check-in

已完成: [Brief description of work completed]
Completed: [Brief description in English if bilingual project]

### 檢查結果 | Checklist Results
✅ Item 1
✅ Item 2
⚠️ Item 3 (needs user verification)
✅ Item 4

建議 commit message | Suggested commit message:
```
<type>(<scope>): <description>

<detailed explanation>

<footer>
```

是否立即建立 commit? | Proceed with commit now?
```

---

### Step 4: Wait for Confirmation | 等待確認

**AI must NOT**:
- ❌ Automatically execute `git add`
- ❌ Automatically execute `git commit`
- ❌ Automatically execute `git push`

**AI must**:
- ✅ Wait for explicit user approval
- ✅ Provide clear checklist summary
- ✅ Allow user to decline or request changes

---

## Project-Specific Customization | 專案特定化

Each project should customize this standard by:

每個專案應透過以下方式自訂此標準:

### 1. Define Build Commands | 定義建置指令

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

### 2. Define Test Commands | 定義測試指令

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

### 3. Define Quality Tools | 定義品質工具

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

### 4. Define "Definition of Done" | 定義「完成定義」

```markdown
## Definition of Done

A feature is considered "done" when:
1. ✅ All acceptance criteria met
2. ✅ Code reviewed by 2 team members
3. ✅ Tests written (min 80% coverage)
4. ✅ Documentation updated
5. ✅ Deployed to staging environment
6. ✅ Product owner approved

功能完成定義：
1. ✅ 所有驗收標準達成
2. ✅ 2 位團隊成員已審查程式碼
3. ✅ 已撰寫測試（最低 80% 覆蓋率）
4. ✅ 文件已更新
5. ✅ 已部署至測試環境
6. ✅ 產品負責人已核准
```

---

## Enforcement Mechanisms | 執行機制

### Pre-commit Hooks | 提交前掛鉤

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

### CI/CD Integration | CI/CD 整合

Configure CI to reject commits that fail checks:

```yaml
# Example: GitHub Actions
name: Code Quality Gate

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

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

## Common Violations and Solutions | 常見違規與解決方案

### Violation 1: "WIP" Commits | 違規 1: "WIP" 提交

**Problem | 問題**:
```bash
git commit -m "WIP"
git commit -m "save work"
git commit -m "trying stuff"
```

**Why it's bad | 為何不好**:
- No clear purpose
- Likely contains broken code
- Pollutes git history

**Solution | 解決方案**:
- Use `git stash` for temporary saves
- Only commit when work is complete
- Squash WIP commits before merging

---

### Violation 2: Committing Commented Code | 違規 2: 提交註解程式碼

**Problem | 問題**:
```javascript
function calculateTotal(items) {
  // Old implementation
  // return items.reduce((sum, item) => sum + item.price, 0);

  // New implementation
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

**Why it's bad | 為何不好**:
- Clutters codebase
- Git history already preserves old code
- Confuses future developers

**Solution | 解決方案**:
- Delete commented code
- Rely on git history for old versions
- Add commit message explaining what changed

---

### Violation 3: Mixing Concerns | 違規 3: 混合關注點

**Problem | 問題**:
```bash
git commit -m "fix bug and refactor and add feature"
```
One commit contains:
- Bug fix in module A
- Refactoring in module B
- New feature in module C

**Why it's bad | 為何不好**:
- Hard to review
- Can't cherry-pick specific changes
- Difficult to revert

**Solution | 解決方案**:
Separate into multiple commits:
```bash
git commit -m "fix(module-a): resolve null pointer error"
git commit -m "refactor(module-b): extract validation logic"
git commit -m "feat(module-c): add export to CSV feature"
```

---

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-12 | Initial standard published |

---

## References | 參考資料

- [Conventional Commits](https://www.conventionalcommits.org/)
- [The Art of the Commit](https://alistapart.com/article/the-art-of-the-commit/)
- [Git Best Practices](https://sethrobertson.github.io/GitBestPractices/)

---

## License | 授權

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
