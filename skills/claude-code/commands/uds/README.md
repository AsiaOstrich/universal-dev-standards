# UDS Slash Commands | UDS 斜線命令

Universal Development Standards (UDS) slash commands for quick access to development workflows.

UDS 斜線命令，快速存取開發工作流程。

## Available Commands | 可用命令

| Command | Description | 說明 |
|---------|-------------|------|
| `/uds:commit` | Generate commit messages | 產生 commit message |
| `/uds:review` | Perform code review | 執行程式碼審查 |
| `/uds:release` | Guide release process | 引導發布流程 |
| `/uds:changelog` | Update CHANGELOG | 更新變更日誌 |
| `/uds:requirement` | Write user stories | 撰寫用戶故事 |
| `/uds:spec` | Create specifications | 建立規格文件 |
| `/uds:tdd` | TDD workflow | TDD 工作流程 |
| `/uds:docs` | Documentation | 文件撰寫 |
| `/uds:coverage` | Test coverage | 測試覆蓋率 |

## Quick Reference | 快速參考

### Daily Development | 日常開發
```bash
/uds:commit              # After staging changes
/uds:review              # Before merging PR
```

### Release Workflow | 發布流程
```bash
/uds:changelog           # Update CHANGELOG
/uds:release patch       # Create patch release
```

### Planning | 規劃
```bash
/uds:requirement         # Write user stories
/uds:spec                # Create specifications
```

### Testing | 測試
```bash
/uds:tdd                 # Test-driven development
/uds:coverage            # Analyze test coverage
```

## Relationship with Skills | 與 Skills 的關係

These commands are **manual shortcuts** to the corresponding Skills:

這些命令是對應 Skills 的**手動快捷方式**：

- **Skills** = Automatically triggered by Claude based on context
- **Commands** = Manually invoked by user with `/command`

Both use the same underlying standards and guidelines.

兩者都使用相同的底層標準和指南。

## Installation | 安裝

These commands are included with the UDS plugin:

這些命令已包含在 UDS 插件中：

```bash
/plugin marketplace add AsiaOstrich/universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

## License | 授權

Dual-licensed: CC BY 4.0 (documentation) + MIT (code)
