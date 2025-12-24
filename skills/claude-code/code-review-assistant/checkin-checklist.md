# Pre-Commit Checklist

## Mandatory Checks | 必檢清單

### 1. Build Verification | 建置驗證

- [ ] **Code compiles successfully**
  - Zero build errors
  - Zero build warnings (or documented exceptions)

- [ ] **Dependencies are satisfied**
  - All package dependencies installed
  - Dependency versions locked
  - No missing imports

---

### 2. Test Verification | 測試驗證

- [ ] **All existing tests pass**
  - Unit tests: 100% pass rate
  - Integration tests: 100% pass rate

- [ ] **New code is tested**
  - New features have corresponding tests
  - Bug fixes include regression tests

- [ ] **Test coverage maintained**
  - Coverage percentage not decreased
  - Critical paths tested

---

### 3. Code Quality | 程式碼品質

- [ ] **Follows coding standards**
  - Naming conventions adhered to
  - Code formatting consistent
  - Comments present where needed

- [ ] **No code smells**
  - Methods ≤50 lines
  - Nesting depth ≤3 levels
  - Cyclomatic complexity ≤10
  - No duplicated code blocks

- [ ] **Security checked**
  - No hardcoded secrets
  - No SQL injection vulnerabilities
  - No XSS vulnerabilities
  - No insecure dependencies

---

### 4. Documentation | 文件

- [ ] **API documentation updated**
  - Public APIs have doc comments
  - Parameters explained
  - Return values documented

- [ ] **README updated (if needed)**
  - New features documented
  - Breaking changes noted

- [ ] **CHANGELOG updated (if applicable)**
  - User-facing changes added to `[Unreleased]`
  - Breaking changes marked

---

### 5. Workflow Compliance | 工作流程合規

- [ ] **Branch naming correct**
  - Follows project convention (`feature/`, `fix/`)

- [ ] **Commit message formatted**
  - Follows conventional commits or project standard

- [ ] **Synchronized with target branch**
  - Merged latest changes from target branch
  - No merge conflicts

---

## Commit Timing Guidelines | 簽入時機指引

### ✅ Appropriate Times to Commit

1. **Completed Functional Unit**
   - Feature fully implemented
   - Tests written and passing
   - Documentation updated

2. **Specific Bug Fixed**
   - Bug reproduced and fixed
   - Regression test added

3. **Independent Refactor**
   - Refactoring complete
   - No functional changes
   - All tests still pass

4. **Runnable State**
   - Code compiles without errors
   - Application can run/start
   - Core functionality not broken

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

4. **Experimental Code**
   - TODO comments scattered
   - Debugging code left in
   - Commented-out code blocks

---

## Commit Granularity | Commit 粒度

### Ideal Commit Size

| Metric | Recommended |
|--------|-------------|
| File Count | 1-10 files |
| Lines Changed | 50-300 lines |
| Scope | Single concern |

### Splitting Principles

**Combine into one commit**:
- Feature implementation + corresponding tests
- Tightly related multi-file changes

**Separate commits**:
- Feature A + Feature B → separate
- Refactoring + new feature → separate
- Bug fix + incidental refactoring → separate

---

## Special Scenarios | 特殊情境

### Emergency Leave (WIP)

**Option 1: Git Stash (Recommended)**
```bash
git stash save "WIP: description of incomplete work"
# Resume later
git stash pop
```

**Option 2: WIP Branch**
```bash
git checkout -b wip/feature-temp
git commit -m "WIP: progress save (do not merge)"
```

### Hotfix

1. Create hotfix branch from main
2. Minimize changes (only fix the problem)
3. Quick verification (ensure tests pass)
4. Mark urgency in commit message:
   ```
   fix(module): [URGENT] fix critical issue
   ```

---

## Common Violations | 常見違規

### ❌ "WIP" Commits

```
git commit -m "WIP"
git commit -m "save work"
git commit -m "trying stuff"
```

**Solution**: Use `git stash` or squash before merging

### ❌ Commented-Out Code

**Problem**: Clutters codebase, confuses future developers

**Solution**: Delete it. Git history preserves old code.

### ❌ Mixing Concerns

```
git commit -m "fix bug and refactor and add feature"
```

**Solution**: Separate into multiple commits:
```
git commit -m "fix(module-a): resolve null pointer error"
git commit -m "refactor(module-b): extract validation logic"
git commit -m "feat(module-c): add export feature"
```

---

**License**: CC BY 4.0 | **Source**: [universal-doc-standards](https://github.com/AsiaOstrich/universal-doc-standards)
