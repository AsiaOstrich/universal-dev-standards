---
source: ../../../core/checkin-standards.md
source_version: 1.4.0
translation_version: 1.4.0
last_synced: 2026-01-16
status: current
---

# 程式碼簽入檢查點標準

> **語言**: [English](../../core/checkin-standards.md) | 繁體中文

**版本**: 1.4.0
**最後更新**: 2026-01-16
**適用範圍**: 所有使用版本控制的軟體專案

---

## 目的

本標準定義提交程式碼到版本控制前必須通過的品質關卡。確保每次提交都維持程式碼庫的穩定性與品質。

---

## 核心哲學

**每次提交應該**:
- ✅ 是完整的邏輯工作單元
- ✅ 讓程式碼庫處於可運作狀態
- ✅ 可回退而不破壞功能
- ✅ 包含自己的測試（新功能）
- ✅ 讓未來開發者能理解

---

## 必檢清單

### 1. 建置驗證

- [ ] **程式碼成功編譯**
  - Zero build errors
  - Zero build warnings (or documented exceptions)

- [ ] **依賴已滿足**
  - All package dependencies installed
  - Dependency versions locked/documented
  - No missing imports or modules

**專案特定建置指令**:
```bash
# Example: .NET project
dotnet build --configuration Release --warnaserror

# Example: Node.js project
npm install && npm run build

# Example: Python project
pip install -r requirements.txt && python -m py_compile src/**/*.py
```

**驗證**:
- Run the build command locally before committing
- Ensure exit code is 0 (success)
- Check build output for warnings

---

### 2. 測試驗證

- [ ] **所有相關測試通過**
  - 單元測試：已修改模組的所有測試通過
  - 整合測試：與已變更元件相關的所有測試通過
  - 端對端測試（如適用）：所有關鍵路徑測試通過

  > **注意**：「相關測試」指直接執行已變更程式碼的測試，以及可能受變更影響的測試。如有可用的測試影響分析工具，請使用。

- [ ] **新程式碼已測試**
  - New features have corresponding tests
  - Bug fixes include regression tests
  - Edge cases are covered

- [ ] **測試覆蓋率維持或提升**
  - Coverage percentage not decreased
  - Critical paths are tested

**專案特定測試指令**:
```bash
# Example: .NET project
dotnet test --no-build --verbosity normal

# Example: Node.js project with Jest
npm test -- --coverage

# Example: Python project with pytest
pytest --cov=src tests/
```

**驗證**:
- Run all test suites locally
- Review test coverage report
- Ensure new code paths are tested

#### Bug 修復測試評估

修復 bug 時，評估是否需要新增回歸測試：

**✅ 必須加測試（高價值）**：
| 情況 | 原因 |
|------|------|
| 安全相關的 bug | 防止漏洞再次發生 |
| 資料完整性相關的 bug | 保護關鍵業務資料 |
| 造成服務中斷的 bug | 確保系統穩定性 |
| 曾經重複出現的 bug | 打破重複出現的循環 |
| 複雜業務邏輯的 bug | 記錄預期行為 |

**⚠️ 測試為可選（低價值）**：
| 情況 | 原因 |
|------|------|
| 單純的 typo 修正 | 再發風險低 |
| 顯而易見的邏輯錯誤（如 `>` 寫成 `<`） | 審查時容易發現 |
| 已被現有測試覆蓋 | 避免重複測試 |
| 一次性的配置錯誤 | 不會在程式碼中再發生 |

**快速決策問題**：
1. 這個 bug 是否可能因未來的程式碼變更而重現？ → 是 = 加測試
2. 現有的測試是否能捕捉到這個 bug？ → 否 = 加測試
3. 這是否影響核心功能或關鍵路徑？ → 是 = 加測試
4. 這個 bug 曾經出現過嗎？ → 是 = 加測試

**回歸測試命名**：
```javascript
describe('Regression: [BUG-ID or description]', () => {
  it('should [correct behavior] when [trigger condition]', () => {
    // Test that would have caught the bug
  });
});
```

---

### 3. 程式碼品質

- [ ] **遵循編碼標準**
  - Naming conventions adhered to
  - Code formatting consistent
  - Comments/documentation present

- [ ] **無程式碼異味**
  - Methods ≤50 lines (or project standard)
  - Nesting depth ≤3 levels
  - Cyclomatic complexity ≤10
  - No duplicated code blocks

- [ ] **安全性已檢查**
  - No hardcoded secrets (passwords, API keys)
  - No SQL injection vulnerabilities
  - No XSS vulnerabilities
  - No insecure dependencies

**專案特定品質工具**:
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

**驗證**:
- Run linter/formatter tools
- Review static analysis reports
- Check for security warnings

---

### 4. 文件

- [ ] **API 文件已更新**
  - Public APIs have doc comments
  - Parameter descriptions complete
  - Return value documented
  - Exceptions documented

- [ ] **README 已更新（如需要）**
  - New features documented
  - Breaking changes noted
  - Setup instructions current

- [ ] **CHANGELOG 已更新（如適用）**
  - 對於使用者可感知的變更：已新增條目至 `[Unreleased]` 區段
  - Breaking changes marked with **BREAKING** prefix
  - 遵循 [versioning.md](versioning.md) 和 [changelog-standards.md](changelog-standards.md) 排除規則
  - 注意：內部重構、僅測試、僅文件的變更通常不需要 CHANGELOG 條目

**文件格式**:
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

#### 適用性判斷標準

使用此表格判斷選用項目何時適用：

| 項目 | 何時適用 | 何時不適用 |
|------|---------|-----------|
| **README 更新** | 新增功能、設定變更、API 行為變更 | 內部重構、僅測試變更、依賴更新 |
| **CHANGELOG 條目** | 使用者可見的變更、影響使用者的錯誤修復、重大變更 | 內部重構、僅測試變更、僅文件變更、開發依賴更新 |
| **端對端測試** | 使用者流程變更、關鍵路徑受影響、整合點修改 | 純後端變更且無 UI 影響、獨立的工具函式 |
| **API 文件** | 公開 API 變更、新增端點、參數含義變更 | 私有方法、內部工具、測試程式碼 |

---

### 5. 工作流程合規

- [ ] **分支命名正確**
  - Follows project convention (e.g., `feature/`, `fix/`)
  - Descriptive name used

- [ ] **Commit 訊息已格式化**
  - Follows conventional commits or project standard
  - Clear and descriptive

- [ ] **已與目標分支同步**
  - Merged latest changes from target branch
  - No merge conflicts
  - Rebase completed (if rebasing workflow)

**驗證**:
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

## 簽入時機指引

### ✅ 適合提交的時機

1. **完成功能單元**
   - Feature fully implemented
   - Tests written and passing
   - Documentation updated

2. **修復特定 Bug**
   - Bug reproduced and fixed
   - Regression test added
   - Verified fix works

3. **獨立重構**
   - Refactoring complete
   - No functional changes
   - All tests still pass

4. **可執行狀態**
   - Code compiles without errors
   - Application can run/start
   - Core functionality not broken

**範例情境**:
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

## Commit 粒度指引

### 理想的 Commit 大小

| 指標 | 建議值 | 說明 |
|------|--------|------|
| 檔案數量 | 1-10 個 | 超過 10 個檔案應考慮拆分 |
| 變更行數 | 50-300 行 | 過大難以 review，過小缺乏意義 |
| 功能範圍 | 單一關注點 | 一個 commit 只做一件事 |

### 拆分原則

**應該合併為一個 commit**:
- Feature implementation + corresponding tests
- Tightly related multi-file changes

**應該分開 commit**:
- Feature A + Feature B → separate
- Refactoring + new feature → separate
- Bug fix + incidental refactoring → separate

### 頻率建議

| 情境 | 建議頻率 |
|------|---------|
| 功能開發 | 每完成一個可測試的子功能即 commit |
| Bug 修復 | 每修復一個獨立的 bug 即 commit |
| 重構 | 每完成一個安全的重構步驟即 commit（保持測試通過） |

---

## 協作情境

### 多人開發同一功能

當多人同時開發同一功能（例如前後端分工）:

1. **分支策略**: Create sub-branches from feature branch
   ```
   feature/order-book
   ├── feature/order-book-api      (Developer A)
   └── feature/order-book-ui       (Developer B)
   ```

2. **簽入節奏**:
   - Commit and push after each integrable unit
   - Frequently sync with main feature branch to reduce conflicts

3. **整合點**:
   - Define clear interfaces/contracts
   - Commit interface definitions first, then implement separately

### Code Review 前後

**Review 前**:
- Ensure all commits are complete logical units
- Clean up commit history (squash WIP commits)
- Write clear PR description

**Review 後**:
- After making changes based on review feedback, add new commit (don't amend already pushed commits)
- Commit message can note: `fix(auth): adjust error handling per review feedback`

### 避免衝突的簽入策略

1. **小批量、高頻率**: Small commits are easier to merge than large ones
2. **頻繁同步**: At least once daily `git pull origin main`
3. **避免長時間分支**: Feature branch lifecycle should not exceed 1-2 weeks

---

## 簽入檢查觸發點

### 自動觸發時機

在開發工作流程執行過程中，以下時機應觸發簽入提醒：

| 觸發點 | 條件 | 提醒強度 |
|--------|------|---------|
| Phase 完成 | 完成一個開發階段 | 建議 |
| Checkpoint | 到達定義的檢查點 | 建議 |
| 變更累積 | 檔案 ≥5 個 或 行數 ≥200 行 | 建議 |
| 連續跳過 | 連續跳過簽入 3 次 | 警告 |
| 工作完成 | 結束前有未 commit 變更 | 強烈建議 |

### 提醒行為

- **建議性質**: User can choose to skip and continue working
- **不中斷流程**: After choosing "later", automatically continue to next stage
- **手動執行**: AI only displays git commands, **must not auto-execute** git add/commit

### 提醒格式

```
┌────────────────────────────────────────────────┐
│ 🔔 簽入檢查點                                  │
├────────────────────────────────────────────────┤
│ Phase 1 已完成                                 │
│                                                │
│ 變更統計:                                      │
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

### 跳過後的追蹤

當用戶選擇「稍後再 commit」時：

1. **記錄跳過次數**
2. **連續跳過 3 次** → Display warning:
   ```
   ⚠️ Warning: You have skipped check-in 3 times consecutively
   Current accumulated changes: 15 files, +520 lines
   Recommend committing soon to avoid changes becoming too large to review
   ```
3. **工作結束前** → If uncommitted changes exist, strongly recommend check-in

---

## 特殊情境處理

### 緊急離開

當需要暫時離開但工作未完成時:

**選項 1: Git Stash（推薦）**
```bash
# Stash incomplete work
git stash save "WIP: matching engine - pending price validation"

# Resume next day
git stash pop
```

**選項 2: WIP 分支**
```bash
# Create temporary branch
git checkout -b wip/order-matching-temp
git add .
git commit -m "WIP: matching engine progress save (do not merge)"

# Return to main branch next day
git checkout feature/order-matching
git cherry-pick <wip-commit>
```

⚠️ **禁止**: Committing WIP code directly on feature branch

### 實驗性開發

進行技術探索或 POC 時:

1. **建立實驗分支**
   ```bash
   git checkout -b experiment/redis-stream-poc
   ```

2. **實驗中可自由 commit** (no strict format required)

3. **實驗成功後**:
   - Clean up commit history
   - Squash into meaningful commits
   - Merge to feature branch

4. **實驗失敗後**:
   - Document lessons learned (optional)
   - Delete experiment branch

### 緊急修復

生產環境緊急問題:

1. **從 main 建立 hotfix 分支**
   ```bash
   git checkout main
   git checkout -b hotfix/critical-null-pointer
   ```

2. **最小化變更**: Only fix the problem, no additional refactoring

3. **快速驗證**: Ensure tests pass

4. **Commit 訊息標註緊急性**:
   ```
   fix(matching): [URGENT] fix null pointer causing match failures

   - Issue: Market orders missing price field causes NullPointerException
   - Impact: All market orders cannot be matched
   - Fix: Add null check and default value handling

   Fixes #456
   ```

---

### ❌ 不適合提交的時機

1. **建置失敗**
   - Compilation errors present
   - Unresolved dependencies

2. **測試失敗**
   - One or more tests failing
   - Tests not yet written for new code

3. **未完成功能**
   - Feature partially implemented
   - Would break existing functionality
   - Missing critical components

4. **實驗性程式碼**
   - TODO comments scattered
   - Debugging code left in
   - Commented-out code blocks

**範例情境**:
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

## AI 助理整合

當 AI 助理完成程式碼變更時，必須遵循此工作流程:

### Step 1: 評估簽入時機

**AI must assess**:
- Is this a complete logical unit?
- Is the codebase in a working state?
- Are there incomplete TODOs?

**評估範例**:
```
✅ Complete: "Implemented user registration with validation, tests, and docs"
⚠️ Incomplete: "Added registration form but backend validation pending"
❌ Not Ready: "Started working on registration, several TODOs remain"
```

---

### Step 2: 執行檢查清單

**AI must verify**:
- [ ] Build command succeeds
- [ ] Tests pass (or note if tests need user verification)
- [ ] Code follows project standards
- [ ] Documentation updated
- [ ] Commit message prepared

**檢查清單輸出格式**:
```
### 檢查結果

✅ Build: dotnet build --no-warnings succeeded
✅ Code Quality: Follows project C# standards
⚠️ Tests: Unit tests pass, integration tests need user verification
✅ Documentation: XML comments added to all public methods
✅ Commit Message: Prepared following conventional commits format
```

---

### Step 3: 提示使用者確認

**AI MUST use this mandatory prompt format**:

```
## 請確認是否簽入

已完成: [Brief description of work completed]

### 檢查結果
✅ Item 1
✅ Item 2
⚠️ Item 3 (needs user verification)
✅ Item 4

建議 commit message:
```
<type>(<scope>): <description>

<detailed explanation>

<footer>
```

是否立即建立 commit?
```

---

### Step 4: 等待確認

**AI must NOT**:
- ❌ Automatically execute `git add`
- ❌ Automatically execute `git commit`
- ❌ Automatically execute `git push`

**AI must**:
- ✅ Wait for explicit user approval
- ✅ Provide clear checklist summary
- ✅ Allow user to decline or request changes

---

## 專案特定化

每個專案應透過以下方式自訂此標準:

### 1. 定義建置指令

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

### 2. 定義測試指令

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

### 3. 定義品質工具

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

### 4. 定義「完成定義」

```markdown
## 功能完成定義

功能完成定義：
1. ✅ 所有驗收標準達成
2. ✅ 2 位團隊成員已審查程式碼
3. ✅ 已撰寫測試（最低 80% 覆蓋率）
4. ✅ 文件已更新
5. ✅ 已部署至測試環境
6. ✅ 產品負責人已核准
```

---

## 執行機制

### 提交前掛鉤

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

### CI/CD 整合

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

## 提交前目錄衛生

### IDE 與工具產生檔案

提交前，驗證沒有不需要的檔案被加入暫存區：

**常見需檢查的檔案**:

| Pattern | Source | Action |
|---------|--------|--------|
| `.idea/` | JetBrains IDEs | Should be gitignored |
| `.vs/` | Visual Studio | Should be gitignored |
| `*.user`, `*.suo` | Visual Studio | Should be gitignored |
| `.vscode/` | VS Code | Usually gitignored (except shared settings) |
| `${workspaceFolder}/` | VS Code variable expansion error | Delete immediately |
| `.DS_Store` | macOS | Should be gitignored |
| `Thumbs.db` | Windows | Should be gitignored |

### 驗證指令

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

### 預防

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

## 常見違規與解決方案

### 違規 1: "WIP" 提交

**問題**:
```bash
git commit -m "WIP"
git commit -m "save work"
git commit -m "trying stuff"
```

**為何不好**:
- No clear purpose
- Likely contains broken code
- Pollutes git history

**解決方案**:
- Use `git stash` for temporary saves
- Only commit when work is complete
- Squash WIP commits before merging

---

### 違規 2: 提交註解程式碼

**問題**:
```javascript
function calculateTotal(items) {
  // Old implementation
  // return items.reduce((sum, item) => sum + item.price, 0);

  // New implementation
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

**為何不好**:
- Clutters codebase
- Git history already preserves old code
- Confuses future developers

**解決方案**:
- Delete commented code
- Rely on git history for old versions
- Add commit message explaining what changed

---

### 違規 3: 混合關注點

**問題**:
```bash
git commit -m "fix bug and refactor and add feature"
```
One commit contains:
- Bug fix in module A
- Refactoring in module B
- New feature in module C

**為何不好**:
- Hard to review
- Can't cherry-pick specific changes
- Difficult to revert

**解決方案**:
Separate into multiple commits:
```bash
git commit -m "fix(module-a): resolve null pointer error"
git commit -m "refactor(module-b): extract validation logic"
git commit -m "feat(module-c): add export to CSV feature"
```

---

## 版本歷史

| 版本 | 日期 | 變更 |
|---------|------|---------|
| 1.4.0 | 2026-01-16 | 新增：Bug 修復測試評估章節與決策矩陣 |
| 1.3.0 | 2026-01-05 | 新增：SWEBOK v4.0 第 6 章（軟體配置管理）至參考資料 |
| 1.2.5 | 2025-12-16 | Clarified: CHANGELOG update is for user-facing changes only, added to [Unreleased] section |
| 1.2.4 | 2025-12-11 | Added: Pre-commit directory hygiene section (IDE artifacts, verification commands) |
| 1.2.3 | 2025-12-05 | Added: Reference to testing-standards.md |
| 1.2.2 | 2025-12-04 | Updated: GitHub Actions checkout to v4 |
| 1.2.1 | 2025-12-04 | Added: Cross-reference to versioning.md CHANGELOG exclusion rules |
| 1.2.0 | 2025-11-28 | Added: Commit granularity guidelines, collaboration scenarios, check-in trigger points, special scenarios (emergency leave, experimental dev, hotfix) |
| 1.0.0 | 2025-11-12 | Initial standard published |

---

## 相關標準

- [專案結構標準](project-structure.md)
- [測試標準](testing-standards.md)（或使用 `/testing-guide` 技能）
- [Commit 訊息規範](commit-message-guide.md)
- [程式碼審查清單](code-review-checklist.md)

---

## 參考資料

- [Conventional Commits](https://www.conventionalcommits.org/)
- [The Art of the Commit](https://alistapart.com/article/the-art-of-the-commit/)
- [Git Best Practices](https://sethrobertson.github.io/GitBestPractices/)
- [SWEBOK v4.0 - 第 6 章：軟體配置管理](https://www.computer.org/education/bodies-of-knowledge/software-engineering) - IEEE Computer Society

---

## 授權

本標準以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授權發布。
