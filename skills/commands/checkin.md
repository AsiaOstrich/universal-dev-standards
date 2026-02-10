---
name: checkin
description: "[UDS] Pre-commit quality gates verification"
---

# Check-in Assistant | 簽入助手

Verify pre-commit quality gates before committing code to ensure codebase stability.

在提交程式碼前驗證品質關卡，確保程式碼庫的穩定性。

## Usage | 用法

```bash
/checkin
```

## Workflow | 工作流程

1. **Check git status** - Run `git status` and `git diff` to understand pending changes
2. **Run tests** - Execute `npm test` (or project test command) to verify all tests pass
3. **Run linting** - Execute `npm run lint` to check code style compliance
4. **Verify quality gates** - Check each gate against the checklist below
5. **Report results** - Present pass/fail summary and recommend next steps

## Quality Gates | 品質關卡

| Gate | Check | 檢查項目 |
|------|-------|---------|
| **Build** | Code compiles with zero errors | 編譯零錯誤 |
| **Tests** | All existing tests pass (100%) | 所有測試通過 |
| **Coverage** | Test coverage not decreased | 覆蓋率未下降 |
| **Code Quality** | Follows coding standards, no code smells | 符合編碼規範 |
| **Security** | No hardcoded secrets or vulnerabilities | 無硬編碼密鑰 |
| **Documentation** | API docs and CHANGELOG updated if needed | 文件已更新 |
| **Workflow** | Branch naming and commit message correct | 分支和提交格式正確 |

## Never Commit When | 禁止提交的情況

- Build has errors | 建置有錯誤
- Tests are failing | 測試失敗
- Feature is incomplete and would break functionality | 功能不完整會破壞現有功能
- Contains debugging code (console.log, print) | 包含除錯程式碼
- Contains commented-out code blocks | 包含被註解的程式碼區塊

## Next Steps | 後續步驟

After verification passes, proceed with `/commit` to create the commit message.

## References | 參考

*   [Check-in Assistant Skill](../checkin-assistant/SKILL.md)
*   [Core Standard](../../core/checkin-standards.md)
