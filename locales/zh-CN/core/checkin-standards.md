---
source: ../../../core/checkin-standards.md
source_version: 1.5.0
translation_version: 1.5.0
last_synced: 2026-03-18
status: current
---

# 程序码签入检查点标准

> **语言**: [English](../../../core/checkin-standards.md) | 繁体中文

**版本**: 1.5.0
**最后更新**: 2026-03-18
**适用范围**: 所有使用版本控制的软体专案

---

## 目的

本标准定义提交程序码到版本控制前必须通过的品质关卡。确保每次提交都维持程序码库的稳定性与品质。

---

## 核心哲学

**每次提交应该**:
- ✅ 是完整的逻辑工作单元
- ✅ 让程序码库处于可运作状态
- ✅ 可回退而不破坏功能
- ✅ 包含自己的测试（新功能）
- ✅ 让未来开发者能理解

---

## 必检清单

### 1. 建置验证

- [ ] **程序码成功编译**
  - Zero build errors
  - Zero build warnings (or documented exceptions)

- [ ] **依赖已满足**
  - All package dependencies installed
  - Dependency versions locked/documented
  - No missing imports or modules

**专案特定建置指令**:
```bash
# Example: .NET project
dotnet build --configuration Release --warnaserror

# Example: Node.js project
npm install && npm run build

# Example: Python project
pip install -r requirements.txt && python -m py_compile src/**/*.py
```

**验证**:
- Run the build command locally before committing
- Ensure exit code is 0 (success)
- Check build output for warnings

---

### 2. 测试验证

- [ ] **所有相关测试通过**
  - 单元测试：已修改模组的所有测试通过
  - 集成测试：与已变更元件相关的所有测试通过
  - 端对端测试（如适用）：所有关键路径测试通过

  > **注意**：「相关测试」指直接执行已变更程序码的测试，以及可能受变更影响的测试。如有可用的测试影响分析工具，请使用。

- [ ] **新程序码已测试**
  - New features have corresponding tests
  - Bug fixes include regression tests
  - Edge cases are covered

- [ ] **测试覆盖率维持或提升**
  - Coverage percentage not decreased
  - Critical paths are tested

- [ ] **AC 覆盖率已验证**（如使用规格驱动工作流）
  - 所有验收条件有对应测试（参见[验收条件追溯标准](acceptance-criteria-traceability.md)）
  - AC 覆盖率达到专案阈值（预设：签入时 80%）
  - 已覆盖的 AC 未退化为未覆盖

**专案特定测试指令**:
```bash
# Example: .NET project
dotnet test --no-build --verbosity normal

# Example: Node.js project with Jest
npm test -- --coverage

# Example: Python project with pytest
pytest --cov=src tests/
```

**验证**:
- Run all test suites locally
- Review test coverage report
- Ensure new code paths are tested

#### Bug 修复测试评估

修复 bug 时，评估是否需要新增回归测试：

**✅ 必须加测试（高价值）**：
| 情况 | 原因 |
|------|------|
| 安全相关的 bug | 防止漏洞再次发生 |
| 数据完整性相关的 bug | 保护关键业务数据 |
| 造成服务中断的 bug | 确保系统稳定性 |
| 曾经重复出现的 bug | 打破重复出现的循环 |
| 复杂业务逻辑的 bug | 记录预期行为 |

**⚠️ 测试为可选（低价值）**：
| 情况 | 原因 |
|------|------|
| 单纯的 typo 修正 | 再发风险低 |
| 显而易见的逻辑错误（如 `>` 写成 `<`） | 审查时容易发现 |
| 已被现有测试覆盖 | 避免重复测试 |
| 一次性的配置错误 | 不会在程序码中再发生 |

**快速决策问题**：
1. 这个 bug 是否可能因未来的程序码变更而重现？ → 是 = 加测试
2. 现有的测试是否能捕捉到这个 bug？ → 否 = 加测试
3. 这是否影响核心功能或关键路径？ → 是 = 加测试
4. 这个 bug 曾经出现过吗？ → 是 = 加测试

**回归测试命名**：
```javascript
describe('Regression: [BUG-ID or description]', () => {
  it('should [correct behavior] when [trigger condition]', () => {
    // Test that would have caught the bug
  });
});
```

---

### 3. 程序码品质

- [ ] **遵循编码标准**
  - Naming conventions adhered to
  - Code formatting consistent
  - Comments/documentation present

- [ ] **无程序码异味**
  - Methods ≤50 lines (or project standard)
  - Nesting depth ≤3 levels
  - Cyclomatic complexity ≤10
  - No duplicated code blocks

- [ ] **安全性已检查**
  - No hardcoded secrets (passwords, API keys)
  - No SQL injection vulnerabilities
  - No XSS vulnerabilities
  - No insecure dependencies

**专案特定品质工具**:
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

**验证**:
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

- [ ] **CHANGELOG 已更新（如适用）**
  - 对于使用者可感知的变更：已新增条目至 `[Unreleased]` 区段
  - Breaking changes marked with **BREAKING** prefix
  - 遵循 [versioning.md](versioning.md) 和 [changelog-standards.md](changelog-standards.md) 排除规则
  - 注意：内部重构、仅测试、仅文件的变更通常不需要 CHANGELOG 条目

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

#### 适用性判断标准

使用此表格判断选用项目何时适用：

| 项目 | 何时适用 | 何时不适用 |
|------|---------|-----------|
| **README 更新** | 新增功能、设定变更、API 行为变更 | 内部重构、仅测试变更、依赖更新 |
| **CHANGELOG 条目** | 使用者可见的变更、影响使用者的错误修复、重大变更 | 内部重构、仅测试变更、仅文件变更、开发依赖更新 |
| **端对端测试** | 使用者流程变更、关键路径受影响、集成点修改 | 纯后端变更且无 UI 影响、独立的工具函数 |
| **API 文档** | 公开 API 变更、新增端点、参数含义变更 | 私有方法、内部工具、测试程序码 |

---

### 5. 工作流程合规

- [ ] **分支命名正确**
  - Follows project convention (e.g., `feature/`, `fix/`)
  - Descriptive name used

- [ ] **Commit 讯息已格式化**
  - Follows conventional commits or project standard
  - Clear and descriptive

- [ ] **已与目标分支同步**
  - Merged latest changes from target branch
  - No merge conflicts
  - Rebase completed (if rebasing workflow)

**验证**:
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

## 签入时机指引

### ✅ 适合提交的时机

1. **完成功能单元**
   - Feature fully implemented
   - Tests written and passing
   - Documentation updated

2. **修复特定 Bug**
   - Bug reproduced and fixed
   - Regression test added
   - Verified fix works

3. **独立重构**
   - Refactoring complete
   - No functional changes
   - All tests still pass

4. **可执行状态**
   - Code compiles without errors
   - Application can run/start
   - Core functionality not broken

**范例情境**:
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

| 指标 | 建议值 | 说明 |
|------|--------|------|
| 档案数量 | 1-10 个 | 超过 10 个档案应考虑拆分 |
| 变更行数 | 50-300 行 | 过大难以 review，过小缺乏意义 |
| 功能范围 | 单一关注点 | 一个 commit 只做一件事 |

### 拆分原则

**应该合并为一个 commit**:
- Feature implementation + corresponding tests
- Tightly related multi-file changes

**应该分开 commit**:
- Feature A + Feature B → separate
- Refactoring + new feature → separate
- Bug fix + incidental refactoring → separate

### 频率建议

| 情境 | 建议频率 |
|------|---------|
| 功能开发 | 每完成一个可测试的子功能即 commit |
| Bug 修复 | 每修复一个独立的 bug 即 commit |
| 重构 | 每完成一个安全的重构步骤即 commit（保持测试通过） |

---

## 协作情境

### 多人开发同一功能

当多人同时开发同一功能（例如前后端分工）:

1. **分支策略**: Create sub-branches from feature branch
   ```
   feature/order-book
   ├── feature/order-book-api      (Developer A)
   └── feature/order-book-ui       (Developer B)
   ```

2. **签入节奏**:
   - Commit and push after each integrable unit
   - Frequently sync with main feature branch to reduce conflicts

3. **集成点**:
   - Define clear interfaces/contracts
   - Commit interface definitions first, then implement separately

### Code Review 前后

**Review 前**:
- Ensure all commits are complete logical units
- Clean up commit history (squash WIP commits)
- Write clear PR description

**Review 后**:
- After making changes based on review feedback, add new commit (don't amend already pushed commits)
- Commit message can note: `fix(auth): adjust error handling per review feedback`

### 避免冲突的签入策略

1. **小批量、高频率**: Small commits are easier to merge than large ones
2. **频繁同步**: At least once daily `git pull origin main`
3. **避免长时间分支**: Feature branch lifecycle should not exceed 1-2 weeks

---

## 签入检查触发点

### 自动触发时机

在开发工作流程执行过程中，以下时机应触发签入提醒：

| 触发点 | 条件 | 提醒强度 |
|--------|------|---------|
| Phase 完成 | 完成一个开发阶段 | 建议 |
| Checkpoint | 到达定义的检查点 | 建议 |
| 变更累积 | 档案 ≥5 个 或 行数 ≥200 行 | 建议 |
| 连续跳过 | 连续跳过签入 3 次 | 警告 |
| 工作完成 | 结束前有未 commit 变更 | 强烈建议 |
| 批次阈值 | 待处理变更达到配置阈值 | 建议 |

### 提醒行为

- **建议性质**: User can choose to skip and continue working
- **不中断流程**: After choosing "later", automatically continue to next stage
- **手动执行**: AI only displays git commands, **must not auto-execute** git add/commit

### 提醒格式

```
┌────────────────────────────────────────────────┐
│ 🔔 签入检查点                                  │
├────────────────────────────────────────────────┤
│ Phase 1 已完成                                 │
│                                                │
│ 变更统计:                                      │
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

### 跳过后的追踪

当用户选择「稍后再 commit」时：

1. **记录跳过次数**
2. **连续跳过 3 次** → Display warning:
   ```
   ⚠️ Warning: You have skipped check-in 3 times consecutively
   Current accumulated changes: 15 files, +520 lines
   Recommend committing soon to avoid changes becoming too large to review
   ```
3. **工作结束前** → If uncommitted changes exist, strongly recommend check-in

### 批次阈值触发

当使用自动化 Pipeline 与变更批次处理时（参见[变更批次合并标准](change-batching-standards.md)）：

- **计数阈值**：累积变更数量 ≥ 配置的 `maxChanges` 时触发
- **分数阈值**：累计变更分数 ≥ 配置的 `maxScore` 时触发
- **时间阈值**：最旧的待处理变更超过配置的 `maxAge` 时触发
- **行为**：批次阈值触发签入建议，而非自动提交（除非启用 `autoCheckin`）

### 自动签入

当 Pipeline 配置中启用 `autoCheckin` 时（参见 [Pipeline 整合标准](pipeline-integration-standards.md)）：

| 前提条件 | 必须 | 说明 |
|---------|------|------|
| 所有测试通过 | 是 | 完整测试套件通过，包括新测试 |
| Lint 通过 | 是 | 变更档案无 lint 错误 |
| AC 覆盖率达标 | 是 | AC 覆盖率达到专案阈值 |
| 无冲突 | 是 | 与目标分支可干净合并 |
| 批次已验证 | 是（如启用批次） | 批次中所有变更已一并验证 |

**安全规则**：
- 自动签入**不得**推送到受保护的分支
- 自动签入**必须**创建正式的 commit 讯息（非「auto-commit」）
- 自动签入**必须**可稽核（记录 who/what/when）
- 用户可随时以手动 commit 覆盖

---

## 特殊情境处理

### 紧急离开

当需要暂时离开但工作未完成时:

**选项 1: Git Stash（推荐）**
```bash
# Stash incomplete work
git stash save "WIP: matching engine - pending price validation"

# Resume next day
git stash pop
```

**选项 2: WIP 分支**
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

### 实验性开发

进行技术探索或 POC 时:

1. **建立实验分支**
   ```bash
   git checkout -b experiment/redis-stream-poc
   ```

2. **实验中可自由 commit** (no strict format required)

3. **实验成功后**:
   - Clean up commit history
   - Squash into meaningful commits
   - Merge to feature branch

4. **实验失败后**:
   - Document lessons learned (optional)
   - Delete experiment branch

### 紧急修复

生产环境紧急问题:

1. **从 main 建立 hotfix 分支**
   ```bash
   git checkout main
   git checkout -b hotfix/critical-null-pointer
   ```

2. **最小化变更**: Only fix the problem, no additional refactoring

3. **快速验证**: Ensure tests pass

4. **Commit 讯息标注紧急性**:
   ```
   fix(matching): [URGENT] fix null pointer causing match failures

   - Issue: Market orders missing price field causes NullPointerException
   - Impact: All market orders cannot be matched
   - Fix: Add null check and default value handling

   Fixes #456
   ```

---

### ❌ 不适合提交的时机

1. **建置失败**
   - Compilation errors present
   - Unresolved dependencies

2. **测试失败**
   - One or more tests failing
   - Tests not yet written for new code

3. **未完成功能**
   - Feature partially implemented
   - Would break existing functionality
   - Missing critical components

4. **实验性程序码**
   - TODO comments scattered
   - Debugging code left in
   - Commented-out code blocks

**范例情境**:
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

## AI 助理集成

当 AI 助理完成程序码变更时，必须遵循此工作流程:

### Step 1: 评估签入时机

**AI must assess**:
- Is this a complete logical unit?
- Is the codebase in a working state?
- Are there incomplete TODOs?

**评估范例**:
```
✅ Complete: "Implemented user registration with validation, tests, and docs"
⚠️ Incomplete: "Added registration form but backend validation pending"
❌ Not Ready: "Started working on registration, several TODOs remain"
```

---

### Step 2: 执行检查清单

**AI must verify**:
- [ ] Build command succeeds
- [ ] Tests pass (or note if tests need user verification)
- [ ] Code follows project standards
- [ ] Documentation updated
- [ ] Commit message prepared

**检查清单输出格式**:
```
### 检查结果

✅ Build: dotnet build --no-warnings succeeded
✅ Code Quality: Follows project C# standards
⚠️ Tests: Unit tests pass, integration tests need user verification
✅ Documentation: XML comments added to all public methods
✅ Commit Message: Prepared following conventional commits format
```

---

### Step 3: 提示使用者确认

**AI MUST use this mandatory prompt format**:

```
## 请确认是否签入

已完成: [Brief description of work completed]

### 检查结果
✅ Item 1
✅ Item 2
⚠️ Item 3 (needs user verification)
✅ Item 4

建议 commit message:
```
<type>(<scope>): <description>

<detailed explanation>

<footer>
```

是否立即建立 commit?
```

---

### Step 4: 等待确认

**AI must NOT**:
- ❌ Automatically execute `git add`
- ❌ Automatically execute `git commit`
- ❌ Automatically execute `git push`

**AI must**:
- ✅ Wait for explicit user approval
- ✅ Provide clear checklist summary
- ✅ Allow user to decline or request changes

---

## 专案特定化

每个专案应透过以下方式自订此标准:

### 1. 定义建置指令

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

### 2. 定义测试指令

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

### 3. 定义品质工具

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

### 4. 定义「完成定义」

```markdown
## 功能完成定义

功能完成定义：
1. ✅ 所有验收标准达成
2. ✅ 2 位团队成员已审查程序码
3. ✅ 已撰写测试（最低 80% 覆盖率）
4. ✅ 文件已更新
5. ✅ 已部署至测试环境
6. ✅ 产品负责人已核准
```

---

## 执行机制

### 提交前挂钩

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

### CI/CD 集成

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

## 提交前目录卫生

### IDE 与工具产生档案

提交前，验证没有不需要的档案被加入暂存区：

**常见需检查的档案**:

| Pattern | Source | Action |
|---------|--------|--------|
| `.idea/` | JetBrains IDEs | Should be gitignored |
| `.vs/` | Visual Studio | Should be gitignored |
| `*.user`, `*.suo` | Visual Studio | Should be gitignored |
| `.vscode/` | VS Code | Usually gitignored (except shared settings) |
| `${workspaceFolder}/` | VS Code variable expansion error | Delete immediately |
| `.DS_Store` | macOS | Should be gitignored |
| `Thumbs.db` | Windows | Should be gitignored |

### 验证指令

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

### 预防

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

## 常见违规与解决方案

### 违规 1: "WIP" 提交

**问题**:
```bash
git commit -m "WIP"
git commit -m "save work"
git commit -m "trying stuff"
```

**为何不好**:
- No clear purpose
- Likely contains broken code
- Pollutes git history

**解决方案**:
- Use `git stash` for temporary saves
- Only commit when work is complete
- Squash WIP commits before merging

---

### 违规 2: 提交注解程序码

**问题**:
```javascript
function calculateTotal(items) {
  // Old implementation
  // return items.reduce((sum, item) => sum + item.price, 0);

  // New implementation
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

**为何不好**:
- Clutters codebase
- Git history already preserves old code
- Confuses future developers

**解决方案**:
- Delete commented code
- Rely on git history for old versions
- Add commit message explaining what changed

---

### 违规 3: 混合关注点

**问题**:
```bash
git commit -m "fix bug and refactor and add feature"
```
One commit contains:
- Bug fix in module A
- Refactoring in module B
- New feature in module C

**为何不好**:
- Hard to review
- Can't cherry-pick specific changes
- Difficult to revert

**解决方案**:
Separate into multiple commits:
```bash
git commit -m "fix(module-a): resolve null pointer error"
git commit -m "refactor(module-b): extract validation logic"
git commit -m "feat(module-c): add export to CSV feature"
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|---------|------|---------|
| 1.5.0 | 2026-03-18 | 新增：AC 覆盖率验证、批次阈值触发、自动签入规则 |
| 1.4.0 | 2026-01-16 | 新增：Bug 修复测试评估章节与决策矩阵 |
| 1.3.0 | 2026-01-05 | 新增：SWEBOK v4.0 第 6 章（软体配置管理）至参考资料 |
| 1.2.5 | 2025-12-16 | Clarified: CHANGELOG update is for user-facing changes only, added to [Unreleased] section |
| 1.2.4 | 2025-12-11 | Added: Pre-commit directory hygiene section (IDE artifacts, verification commands) |
| 1.2.3 | 2025-12-05 | Added: Reference to testing-standards.md |
| 1.2.2 | 2025-12-04 | Updated: GitHub Actions checkout to v4 |
| 1.2.1 | 2025-12-04 | Added: Cross-reference to versioning.md CHANGELOG exclusion rules |
| 1.2.0 | 2025-11-28 | Added: Commit granularity guidelines, collaboration scenarios, check-in trigger points, special scenarios (emergency leave, experimental dev, hotfix) |
| 1.0.0 | 2025-11-12 | Initial standard published |

---

## Linting 策略

### 规则严重性分类

| 层级 | CI 行为 | 适用场景 | 示例 |
|------|---------|----------|------|
| **Error** | 阻断 CI（build 失败） | 可能的 Bug、安全问题 | 未使用变量、未处理 Promise、`eval` 使用 |
| **Warning** | 通过但报告 | 质量建议 | 函数过长、嵌套过深、TODO 标记 |
| **Info** | 静默通过 | 风格偏好 | 行尾空白、import 排序 |

### Auto-fix 策略

| 类别 | 示例 | 允许自动修复 |
|------|------|-------------|
| **安全修复** | 缩进、分号、import 排序 | 是 |
| **需确认** | 变量重命名、类型推断 | 确认后修复 |
| **禁止自动修复** | 移除未使用变量、重构复杂逻辑 | 否（需人工判断） |

**Auto-fix 时机：**

| 时机 | 行为 | 理由 |
|------|------|------|
| **Pre-commit hook** | 修复安全规则（格式化） | 快速反馈、干净提交 |
| **CI pipeline** | 仅检查，不修复 | 确保开发者了解问题 |
| **PR review** | 以 PR 评论建议 | 不阻断、具教育意义 |

### 团队一致性原则

| 原则 | 说明 |
|------|------|
| **团队决定** | 风格选择由团队投票，非个人偏好 |
| **配置纳入版控** | Lint 配置文件必须提交至 Git |
| **决定后不辩论** | 采用后全员遵循，避免 bikeshedding |
| **自动化优先** | 能由工具强制的规则不依赖人工审查 |
| **新项目严格** | 新项目使用严格规则集；既有项目渐进采用 |

### 渐进采用

1. **仅对新增/修改文件应用严格规则** — 不要求一次修复整个 codebase
2. **允许 `// eslint-disable-next-line` 但设上限** — 例如每项目 < 100 个
3. **每季减少 disable 数量** — 每季减少 25%
4. **全面强制** — 最终于所有文件启用

---

## 相关标准

- [专案结构标准](project-structure.md)
- [测试标准](testing-standards.md)（或使用 `/testing-guide` 技能）
- [Commit 讯息规范](commit-message-guide.md)
- [程序码审查清单](code-review-checklist.md)
- [部署标准](deployment-standards.md) - 品质关卡与部署就绪性
- [验收条件追溯标准](acceptance-criteria-traceability.md) - AC 覆盖率验证
- [变更批次合并标准](change-batching-standards.md) - 批次阈值触发
- [Pipeline 整合标准](pipeline-integration-standards.md) - 自动签入

---

## 参考资料

- [Conventional Commits](https://www.conventionalcommits.org/)
- [The Art of the Commit](https://alistapart.com/article/the-art-of-the-commit/)
- [Git Best Practices](https://sethrobertson.github.io/GitBestPractices/)
- [SWEBOK v4.0 - 第 6 章：软体配置管理](https://www.computer.org/education/bodies-of-knowledge/software-engineering) - IEEE Computer Society

---

## 授权

本标准以 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 授权发布。
