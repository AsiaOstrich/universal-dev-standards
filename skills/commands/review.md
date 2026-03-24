---
description: [UDS] Perform systematic code review with checklist
allowed-tools: Read, Grep, Glob, Bash(git diff:*), Bash(git log:*), Bash(git show:*)
argument-hint: "[file path or branch | 檔案路徑或分支名稱]"
---

# Code Review Assistant | 程式碼審查助手

Perform systematic code review using standardized checklists and comment prefixes.

執行系統性的程式碼審查，使用標準化的檢查清單和評論前綴。

## Workflow | 工作流程

1. **Identify changes** - Get diff of files to review
2. **Apply checklist** - Check each category systematically
3. **Generate report** - Output findings with standard prefixes
4. **Summarize** - Provide overall assessment

## Review Categories | 審查類別

1. **Functionality** - Does it work correctly?
2. **Design** - Is the architecture appropriate?
3. **Quality** - Is the code clean and maintainable?
4. **Readability** - Is it easy to understand?
5. **Tests** - Is there adequate test coverage?
6. **Security** - Are there any vulnerabilities?
7. **Performance** - Is it efficient?
8. **Error Handling** - Are errors handled properly?

## Comment Prefixes | 評論前綴

| Prefix | Meaning | Action |
|--------|---------|--------|
| **BLOCKING** | Must fix before merge | Required |
| **IMPORTANT** | Should fix | Recommended |
| **SUGGESTION** | Nice-to-have | Optional |
| **QUESTION** | Need clarification | Discuss |
| **NOTE** | Informational | FYI |

## Usage | 使用方式

- `/review` - Review all changes in current branch
- `/review src/auth.js` - Review specific file
- `/review feature/login` - Review specific branch

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/review` | 執行 `git diff` 取得當前分支所有變更，開始審查 |
| `/review <file>` | 僅審查指定檔案 |
| `/review <branch>` | 審查指定分支相對於 main 的差異 |

### Interaction Script | 互動腳本

1. 取得變更內容（git diff / 讀取檔案）
2. 逐一套用 8 個審查類別
3. 為每個發現標記嚴重度前綴（BLOCKING / IMPORTANT / SUGGESTION / QUESTION / NOTE）
4. 生成審查報告

**Decision: 發現衝突**
- IF 多個發現互相矛盾（如效能 vs 可讀性） → 明確說明取捨，標記為 QUESTION 請使用者決定
- ELSE → 依嚴重度排序呈現

🛑 **STOP**: 報告生成後展示結果，等待使用者決定處理方式

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 審查報告展示後 | 使用者決定是否修復 BLOCKING 項目 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 無變更可審查 | 告知無差異，建議先修改程式碼 |
| 檔案/分支不存在 | 列出可用的檔案或分支 |
| 變更量過大（>500 行） | 建議分批審查，列出建議的分批方式 |

## Reference | 參考

- Full standard: [code-review-assistant](../code-review-assistant/SKILL.md)
- Core guide: [code-review-checklist](../../core/code-review-checklist.md)
