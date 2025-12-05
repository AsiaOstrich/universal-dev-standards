# Code Check-in Standards
# 程式碼簽入檢查點標準

**Version**: 1.2.2
**Last Updated**: 2025-12-04
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
  - Follow exclusion rules in `versioning.md` (ignore `.gitignore` directories)
  - 遵循 `versioning.md` 排除規則（忽略 `.gitignore` 目錄）

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

## Commit Granularity Guidelines | Commit 粒度指引

### Ideal Commit Size | 理想的 Commit 大小

| Metric | Recommended | Description |
|--------|-------------|-------------|
| File Count | 1-10 files | Consider splitting if >10 files |
| Lines Changed | 50-300 lines | Too large is hard to review, too small lacks meaning |
| Scope | Single concern | One commit does one thing |

| 指標 | 建議值 | 說明 |
|------|--------|------|
| 檔案數量 | 1-10 個 | 超過 10 個檔案應考慮拆分 |
| 變更行數 | 50-300 行 | 過大難以 review，過小缺乏意義 |
| 功能範圍 | 單一關注點 | 一個 commit 只做一件事 |

### Splitting Principles | 拆分原則

**Should be combined into one commit | 應該合併為一個 commit**:
- Feature implementation + corresponding tests
- Tightly related multi-file changes

**Should be separate commits | 應該分開 commit**:
- Feature A + Feature B → separate
- Refactoring + new feature → separate
- Bug fix + incidental refactoring → separate

### Frequency Recommendations | 頻率建議

| Scenario | Recommended Frequency |
|----------|----------------------|
| Feature Development | Commit after each testable sub-feature |
| Bug Fix | Commit after each independent bug is fixed |
| Refactoring | Commit after each safe refactoring step (keep tests passing) |

| 情境 | 建議頻率 |
|------|---------|
| 功能開發 | 每完成一個可測試的子功能即 commit |
| Bug 修復 | 每修復一個獨立的 bug 即 commit |
| 重構 | 每完成一個安全的重構步驟即 commit（保持測試通過） |

---

## Collaboration Scenarios | 協作情境

### Multiple Developers on Same Feature | 多人開發同一功能

When multiple developers work on the same feature (e.g., frontend/backend split):

當多人同時開發同一功能（例如前後端分工）:

1. **Branch Strategy | 分支策略**: Create sub-branches from feature branch
   ```
   feature/order-book
   ├── feature/order-book-api      (Developer A)
   └── feature/order-book-ui       (Developer B)
   ```

2. **Check-in Rhythm | 簽入節奏**:
   - Commit and push after each integrable unit
   - Frequently sync with main feature branch to reduce conflicts

3. **Integration Points | 整合點**:
   - Define clear interfaces/contracts
   - Commit interface definitions first, then implement separately

### Before and After Code Review | Code Review 前後

**Before Review | Review 前**:
- Ensure all commits are complete logical units
- Clean up commit history (squash WIP commits)
- Write clear PR description

**After Review | Review 後**:
- After making changes based on review feedback, add new commit (don't amend already pushed commits)
- Commit message can note: `fix(auth): adjust error handling per review feedback`

### Conflict Avoidance Strategies | 避免衝突的簽入策略

1. **Small batches, high frequency | 小批量、高頻率**: Small commits are easier to merge than large ones
2. **Frequent sync | 頻繁同步**: At least once daily `git pull origin main`
3. **Avoid long-lived branches | 避免長時間分支**: Feature branch lifecycle should not exceed 1-2 weeks

---

## Check-in Trigger Points | 簽入檢查觸發點

### Automatic Trigger Timing | 自動觸發時機

During development workflow execution, the following events should trigger check-in reminders:

在開發工作流程執行過程中，以下時機應觸發簽入提醒：

| Trigger | Condition | Reminder Intensity |
|---------|-----------|-------------------|
| Phase Complete | Completed a development phase | Suggest |
| Checkpoint | Reached a defined checkpoint | Suggest |
| Change Accumulation | Files ≥5 or lines ≥200 | Suggest |
| Consecutive Skips | Skipped check-in 3 times | Warning |
| Work Complete | Uncommitted changes before finishing | Strongly Recommend |

| 觸發點 | 條件 | 提醒強度 |
|--------|------|---------|
| Phase 完成 | 完成一個開發階段 | 建議 |
| Checkpoint | 到達定義的檢查點 | 建議 |
| 變更累積 | 檔案 ≥5 個 或 行數 ≥200 行 | 建議 |
| 連續跳過 | 連續跳過簽入 3 次 | 警告 |
| 工作完成 | 結束前有未 commit 變更 | 強烈建議 |

### Reminder Behavior | 提醒行為

- **Advisory nature | 建議性質**: User can choose to skip and continue working
- **Non-blocking | 不中斷流程**: After choosing "later", automatically continue to next stage
- **Manual execution | 手動執行**: AI only displays git commands, **must not auto-execute** git add/commit

### Reminder Format | 提醒格式

```
┌────────────────────────────────────────────────┐
│ 🔔 Check-in Checkpoint | 簽入檢查點             │
├────────────────────────────────────────────────┤
│ Phase 1 completed | Phase 1 已完成             │
│                                                │
│ Change Statistics | 變更統計:                  │
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

### Skip Tracking | 跳過後的追蹤

When user chooses "commit later":

當用戶選擇「稍後再 commit」時：

1. **Record skip count | 記錄跳過次數**
2. **After 3 consecutive skips | 連續跳過 3 次** → Display warning:
   ```
   ⚠️ Warning: You have skipped check-in 3 times consecutively
   Current accumulated changes: 15 files, +520 lines
   Recommend committing soon to avoid changes becoming too large to review
   ```
3. **Before work completion | 工作結束前** → If uncommitted changes exist, strongly recommend check-in

---

## Special Scenarios | 特殊情境處理

### Emergency Leave (End of Day) | 緊急離開

When you need to leave temporarily with work incomplete:

當需要暫時離開但工作未完成時:

**Option 1: Git Stash (Recommended) | 選項 1: Git Stash（推薦）**
```bash
# Stash incomplete work
git stash save "WIP: matching engine - pending price validation"

# Resume next day
git stash pop
```

**Option 2: WIP Branch | 選項 2: WIP 分支**
```bash
# Create temporary branch
git checkout -b wip/order-matching-temp
git add .
git commit -m "WIP: matching engine progress save (do not merge)"

# Return to main branch next day
git checkout feature/order-matching
git cherry-pick <wip-commit>
```

⚠️ **Prohibited | 禁止**: Committing WIP code directly on feature branch

### Experimental Development | 實驗性開發

When doing technical exploration or POC:

進行技術探索或 POC 時:

1. **Create experiment branch | 建立實驗分支**
   ```bash
   git checkout -b experiment/redis-stream-poc
   ```

2. **Free commits during experiment | 實驗中可自由 commit** (no strict format required)

3. **After experiment succeeds | 實驗成功後**:
   - Clean up commit history
   - Squash into meaningful commits
   - Merge to feature branch

4. **After experiment fails | 實驗失敗後**:
   - Document lessons learned (optional)
   - Delete experiment branch

### Hotfix | 緊急修復

For production emergency issues:

生產環境緊急問題:

1. **Create hotfix branch from main | 從 main 建立 hotfix 分支**
   ```bash
   git checkout main
   git checkout -b hotfix/critical-null-pointer
   ```

2. **Minimize changes | 最小化變更**: Only fix the problem, no additional refactoring

3. **Quick verification | 快速驗證**: Ensure tests pass

4. **Mark urgency in commit message | Commit 訊息標註緊急性**:
   ```
   fix(matching): [URGENT] fix null pointer causing match failures

   - Issue: Market orders missing price field causes NullPointerException
   - Impact: All market orders cannot be matched
   - Fix: Add null check and default value handling

   Fixes #456
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
| 1.2.3 | 2025-12-05 | Added: Reference to testing-standards.md |
| 1.2.2 | 2025-12-04 | Updated: GitHub Actions checkout to v4 |
| 1.2.1 | 2025-12-04 | Added: Cross-reference to versioning.md CHANGELOG exclusion rules |
| 1.2.0 | 2025-11-28 | Added: Commit granularity guidelines, collaboration scenarios, check-in trigger points, special scenarios (emergency leave, experimental dev, hotfix) |
| 1.0.0 | 2025-11-12 | Initial standard published |

---

## Related Standards | 相關標準

- [Testing Standards](testing-standards.md) - 測試標準 (UT/IT/ST/E2E)
- [Commit Message Guide](commit-message-guide.md) - Commit 訊息規範
- [Code Review Checklist](code-review-checklist.md) - 程式碼審查清單

---

## References | 參考資料

- [Conventional Commits](https://www.conventionalcommits.org/)
- [The Art of the Commit](https://alistapart.com/article/the-art-of-the-commit/)
- [Git Best Practices](https://sethrobertson.github.io/GitBestPractices/)

---

## License | 授權

This standard is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
