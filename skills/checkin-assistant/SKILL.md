---
name: checkin
scope: partial
description: "[UDS] Pre-commit quality gates verification"
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git status:*), Bash(npm test:*), Bash(npm run lint:*)
disable-model-invocation: true
---

# Check-in Assistant | 簽入助手

Verify pre-commit quality gates before committing code to ensure codebase stability.

在提交程式碼前驗證品質關卡，確保程式碼庫的穩定性。

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
| **Upstream** | No `.standards/` or `.claude/skills/` modifications (advisory) | 無 UDS 上游檔案修改（建議性） |

## Never Commit When | 禁止提交的情況

- Build has errors | 建置有錯誤
- Tests are failing | 測試失敗
- Feature is incomplete and would break functionality | 功能不完整會破壞現有功能
- Contains WIP/TODO in critical logic | 關鍵邏輯中有 WIP/TODO
- Contains debugging code (console.log, print) | 包含除錯程式碼
- Contains commented-out code blocks | 包含被註解的程式碼區塊

## Usage | 使用方式

- `/checkin` - Run full quality gate verification on current changes
- After verification, proceed with `/commit` to create the commit message

## Next Steps Guidance | 下一步引導

After `/checkin` completes, the AI assistant should suggest:

> **品質關卡驗證完成。建議下一步 / Quality gate verification complete. Suggested next steps:**
> - 全部通過 ✅ → 執行 `/commit` 提交變更 ⭐ **Recommended / 推薦** — All passed → Run `/commit` to commit
> - 有失敗項目 ❌ → 修復問題後重新執行 `/checkin` — Failures found → Fix then re-run `/checkin`
> - 需要程式碼審查 → 執行 `/review` 進行自我審查 — Need review → Run `/review` for self-review
> - UDS 安裝有異常 → 執行 `/audit` 診斷問題 — UDS issues detected → Run `/audit` to diagnose

## Reference | 參考

- Detailed guide: [guide.md](./guide.md)
- Core standard: [checkin-standards.md](../../core/checkin-standards.md)


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/checkin`](../commands/checkin.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/checkin`](../commands/checkin.md#ai-agent-behavior--ai-代理行為)
