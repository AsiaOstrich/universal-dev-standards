---
name: release
scope: universal
description: "[UDS] Guide release process and changelogs"
allowed-tools: Read, Write, Grep, Bash(git:*), Bash(npm version:*)
argument-hint: "[version]"
prerequisites: ["release-check"]
disable-model-invocation: true
---

# Release Assistant | 發布助手

Guide the release process following Semantic Versioning and changelog best practices.

引導遵循語義化版本和變更日誌最佳實踐的發布流程。

## Subcommands | 子命令

| Subcommand | Mode | Description | 說明 |
|------------|------|-------------|------|
| `start` | All | Start a release branch/process | 開始發布流程 |
| `finish` | CI/CD | Finalize release (tag, merge) | 完成發布（標籤、合併） |
| `promote` | Manual/Hybrid | Promote RC to Stable | RC → Stable 晉升 |
| `deploy` | Manual/Hybrid | Record deployment to environment | 記錄部署紀錄 |
| `manifest` | Manual/Hybrid | Generate build-manifest.json | 產生打包資訊清單 |
| `verify` | Manual/Hybrid | Verify manifest consistency | 驗證清單一致性 |
| `changelog` | All | Generate or update CHANGELOG.md | 產生或更新變更日誌 |
| `check` | All | Run pre-release verification | 執行發布前檢查 |

## Release Modes | 發布模式

Configure via `uds init` or `uds config --type release_mode`:

| Mode | Description | 說明 |
|------|-------------|------|
| `ci-cd` | Automatic publishing via CI/CD pipeline (default) | CI/CD 自動發布（預設） |
| `manual` | Manual packaging + RC workflow | 手動打包 + RC 工作流程 |
| `hybrid` | CI builds artifact + manual deployment | CI 建置 + 手動部署 |

## Version Types | 版本類型

| Type | Pattern | npm Tag | 用途 |
|------|---------|---------|------|
| Stable | `X.Y.Z` | `@latest` | Production release | 正式版 |
| Beta | `X.Y.Z-beta.N` | `@beta` | Public testing | 公開測試 |
| Alpha | `X.Y.Z-alpha.N` | `@alpha` | Internal testing | 內部測試 |
| RC | `X.Y.Z-rc.N` | `@rc` | Release candidate | 候選版本 |

## Workflow | 工作流程

1. **Determine version** - Decide version type based on changes (MAJOR/MINOR/PATCH)
2. **Update version files** - Update package.json and related version references
3. **Update CHANGELOG** - Move [Unreleased] entries to new version section
4. **Run pre-release checks** - Verify tests, lint, and standards compliance
5. **Create git tag** - Tag with `vX.Y.Z` format
6. **Commit and push** - Commit version bump and push tags

### Version Increment Rules | 版本遞增規則

| Change Type | Increment | Example |
|-------------|-----------|---------|
| Breaking changes | MAJOR | 1.9.5 → 2.0.0 |
| New features (backward-compatible) | MINOR | 2.3.5 → 2.4.0 |
| Bug fixes (backward-compatible) | PATCH | 3.1.2 → 3.1.3 |

## Usage | 使用方式

### CI/CD Mode (default)
- `/release start 1.2.0` - Start release process for v1.2.0
- `/release changelog 1.2.0` - Update CHANGELOG for v1.2.0
- `/release finish 1.2.0` - Finalize and tag v1.2.0
- `/release check` - Run pre-release verification

### Manual Mode (RC workflow)
- `/release start 1.2.0-rc.1` - Create RC version
- `uds release manifest` - Generate build-manifest.json
- `uds release deploy staging` - Record staging deployment
- `uds release deploy staging --result passed` - Record test result
- `/release promote 1.2.0` - Promote RC to stable
- `uds release deploy production` - Record production deployment
- `uds release verify` - Verify manifest consistency

## Next Steps Guidance | 下一步引導

After `/release` completes, the AI assistant should suggest:

> **發布流程完成。建議下一步 / Release process complete. Suggested next steps:**
> - 驗證 npm 發布狀態 `npm view <pkg> dist-tags` ⭐ **Recommended / 推薦** — Verify npm publication status
> - 建立 GitHub Release 並撰寫發布說明 — Create GitHub Release with notes
> - 通知利害關係人新版本已發布 — Notify stakeholders of new release

## Reference | 參考

- Detailed guide: [guide.md](./guide.md)
- Core standard: [versioning.md](../../core/versioning.md)


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/release`](../commands/release.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/release`](../commands/release.md#ai-agent-behavior--ai-代理行為)
