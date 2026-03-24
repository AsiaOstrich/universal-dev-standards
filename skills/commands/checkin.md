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
| **AC Coverage** | AC-to-test coverage ≥ 80% ([`/ac-coverage`](./ac-coverage.md)) | AC 覆蓋率 ≥ 80% |
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

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/checkin` | 自動執行所有品質關卡檢查 |

### Interaction Script | 互動腳本

1. 執行 `git status` 確認有待提交的變更
2. 依序檢查每個品質關卡：
   - Build → Tests → Coverage → Code Quality → Security → Documentation → Workflow
3. 為每個關卡標記 ✅ PASS / ❌ FAIL
4. 生成摘要報告

**Decision: 測試指令偵測**
- IF 專案有 `package.json` → 使用 `npm test`
- IF 專案有 `pyproject.toml` → 使用 `pytest`
- IF 無法偵測 → 詢問使用者

**Decision: 檢查結果**
- IF 全部通過 → 建議執行 `/commit`
- IF 有 FAIL → 列出失敗項目和修復建議，不建議 commit

🛑 **STOP**: 報告展示後等待使用者決定（修復 or 強制 commit）

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 品質報告展示後 | 使用者決定修復或 commit |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 無待提交變更 | 告知無變更可檢查 |
| 測試指令執行失敗 | 報告錯誤，建議檢查測試環境 |
| lint 工具未安裝 | 跳過該關卡，標記 ⚠️ SKIP |

## References | 參考

*   [Check-in Assistant Skill](../checkin-assistant/SKILL.md)
*   [Core Standard](../../core/checkin-standards.md)
*   [AC Coverage Command](./ac-coverage.md) — AC-to-test traceability analysis
*   [AC Traceability Standard](../../core/acceptance-criteria-traceability.md)
