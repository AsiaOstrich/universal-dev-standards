# UDS DevAP 設定（dogfooding）

> 目的：UDS 自身採用 DevAP 流程，作為 [XSPEC-086 Phase 7](../../cross-project/specs/XSPEC-086-uds-devap-responsibility-split.md) 的 dogfooding 驗證。

## 安裝確認

```bash
$ devap --version
0.2.0
```

DevAP 已透過 npm link 從 dev-autopilot/packages/cli 全域安裝。

## 檔案說明

| 檔案 | 用途 | 對應規格 |
|------|------|---------|
| `flows/commit.flow.yaml` | Commit 三步流程閘門定義 | [XSPEC-088](../../cross-project/specs/XSPEC-088-devap-commit-flow-gate.md) |
| `release-config.json` | UDS 自身 release 設定 | [XSPEC-089](../../cross-project/specs/XSPEC-089-devap-release-command.md) |

## Dogfooding 意義

UDS 本身定義了 `/commit-standards` Skill 與相關流程標準。但 [DEC-049](../../cross-project/decisions/DEC-049-uds-devap-responsibility-split.md) 拍板：
- **UDS** = 活動定義層（commit message 格式、品質標準）
- **DevAP** = 流程編排層（強制 commit 三步流程）

UDS 自己採用 DevAP commit 閘門，正是「UDS 提供活動定義 + DevAP 提供流程編排」的最佳示範：UDS 的開發者也應該被 DevAP 閘門保護，不能繞過自家定義的 commit 流程。

## Release 流程切換

UDS 目前使用 `scripts/bump-version.sh` 手動 bump 版本（feedback memory: uds_release_bump_script）。
`release-config.json` 已對齊該腳本的版本檔列表，未來可漸進切換到：

```bash
# 舊：scripts/bump-version.sh 5.3.3
# 新：
devap release --bump patch --dry-run    # 預覽
devap release --bump patch --platform npm  # 實際執行（依 GitHub Actions publish.yml）
```

⚠️ 切換前需驗證 `devap release` 與 `bump-version.sh` 的副作用完全一致（cli/package.json + standards-registry.json 三個欄位 + uds-manifest.json + README/CHANGELOG 三語）。

## 可用命令

```bash
devap --help              # 列出所有命令
devap commit              # 三步驟 commit 流程（XSPEC-088 runtime）
devap commit -m "..."     # 提供訊息但仍需 y/n 確認

# Release 流程（XSPEC-089）— 切換前先 dry-run
devap release --bump patch --dry-run
```
