---
name: release
source: ../../../../skills/release-standards/SKILL.md
source_version: 1.1.0
translation_version: 1.2.0
last_synced: 2026-10-16
source_hash: e9e935fd95a0
status: current
description: |
  [UDS] 引導發布流程——語意化版本、發布模式，以及 start/finish/promote/deploy 的順序。
  Use when: 切一個發布版本、決定語意化版本要升哪一位、把 release candidate 晉級為穩定版、記錄一次部署。
  Not for: 撰寫變更日誌條目本身——請用 /changelog；部署的實作機制——請用 /deploy。
  Keywords: release, semantic versioning, version bump, release candidate, promote, 發布, 語意化版本, 發版流程, 版本晉級.
allowed-tools: Read, Write, Grep, Bash(git:*), Bash(npm version:*)
scope: universal
argument-hint: "[version]"
---

# Release Assistant | 發布助手

Guide the release process following Semantic Versioning and changelog best practices.

引導遵循語意化版本和變更日誌最佳實踐的發布流程。

## Subcommands | 子命令

| Subcommand | Mode | Description | 說明 |
|------------|------|-------------|------|
| `start` | All | Start a release branch/process | 開始發布流程 |
| `finish` | CI/CD | Finalize release (tag, merge) | 完成發布（標籤、合併） |
| `promote` | Manual/Hybrid | Promote RC to Stable | RC → Stable 晉級 |
| `deploy` | Manual/Hybrid | Record deployment to environment | 記錄部署至環境 |
| `manifest` | Manual/Hybrid | Generate build-manifest.json | 產生 build-manifest.json |
| `verify` | Manual/Hybrid | Verify manifest consistency | 驗證資訊清單一致性 |
| `changelog` | All | Generate or update CHANGELOG.md | 產生或更新 CHANGELOG.md |
| `check` | All | Run pre-release verification | 執行發布前驗證 |

## Release Modes | 發布模式

Configure via `uds init` or `uds config --type release_mode`:

| Mode | Description | 說明 |
|------|-------------|------|
| `ci-cd` | Automatic publishing via CI/CD pipeline (default) | 透過 CI/CD 管線自動發布（預設） |
| `manual` | Manual packaging + RC workflow | 手動打包 + RC 工作流程 |
| `hybrid` | CI builds artifact + manual deployment | CI 建置產物 + 手動部署 |

## Version Types | 版本類型

| Type | Pattern | npm Tag | 用途 |
|------|---------|---------|------|
| Stable | `X.Y.Z` | `@latest` | Production release | 正式發布版 |
| Beta | `X.Y.Z-beta.N` | `@beta` | Public testing | 公開測試 |
| Alpha | `X.Y.Z-alpha.N` | `@alpha` | Internal testing | 內部測試 |
| RC | `X.Y.Z-rc.N` | `@rc` | Release candidate | 候選版本 |

## Workflow | 工作流程

1. **Determine version** - 根據變更決定版本類型（MAJOR/MINOR/PATCH）
2. **Triage open issues/PRs** - `gh pr list` + `gh issue list`；將每一項分類為 **帶上 vs 延後 (bring-in vs defer)** (XSPEC-265) / 掃描 issue/PR、每項二分（帶上 vs backlog）
3. **Update version files** - 更新 package.json 和相關版本參考
4. **Update CHANGELOG** - 將 [Unreleased] 條目移至新版本區段
5. **Run pre-release checks** - 驗證測試、lint、標準合規，**以及 issue/PR triage 閘門**
6. **Create git tag** - 使用 `vX.Y.Z` 格式建立標籤
7. **Commit and push** - 提交版本更新並推送標籤

### Pre-release Issue/PR Triage Gate | 發版前 issue/PR triage 閘門 (XSPEC-265)

在遞增版本之前，掃描開啟中的 issue/PR 並對每一項做出有意識的決策——**切勿**依賴記憶：

| Class | Action |
|-------|--------|
| **Bring-in** | patch dependabot PR / release-blocking 阻擋發布的 bug / 與此版本主題相關的修復 → 在遞增版本前合併 |
| **Defer** | major PR、audit/enhancement 稽核或強化議題、需要獨立評估 → 記錄於 signoff 的「deferred」+ release-notes 的 Known Issues |

- 確認 `cross-project/sub-project-triage.md` 快照為近期產出（≤7 天）；若過期則予以重新整理。
- 將結果記錄於 release sign-off (Tier-1)：`Pre-release issue/PR triage | PASS | N PRs / M issues: X merged / Y deferred`。
- **不要求清空 backlog** — 僅要求每項都有經過有意識的決策 + 留下記錄。不要求清空 backlog，只要求每項有意識決策 + 留紀錄。

### Version Increment Rules | 版本遞增規則

| Change Type | Increment | Example |
|-------------|-----------|---------|
| Breaking changes | MAJOR | 1.9.5 → 2.0.0 |
| New features (backward-compatible) | MINOR | 2.3.5 → 2.4.0 |
| Bug fixes (backward-compatible) | PATCH | 3.1.2 → 3.1.3 |

## Usage | 使用方式

### CI/CD Mode (default)
- `/release start 1.2.0` - 開始 v1.2.0 的發布流程
- `/release changelog 1.2.0` - 更新 v1.2.0 的 CHANGELOG
- `/release finish 1.2.0` - 完成並為 v1.2.0 上標籤
- `/release check` - 執行發布前驗證

### Manual Mode (RC workflow)
- `/release start 1.2.0-rc.1` - 建立 RC 版本
- `uds release manifest` - 產生 build-manifest.json
- `uds release deploy staging` - 記錄 staging 部署
- `uds release deploy staging --result passed` - 記錄測試結果
- `/release promote 1.2.0` - 將 RC 晉級為穩定版
- `uds release deploy production` - 記錄 production 部署
- `uds release verify` - 驗證資訊清單一致性

## Next Steps Guidance | 下一步引導

After `/release` completes, the AI assistant should suggest:

> **發布流程完成。建議下一步 / Release process complete. Suggested next steps:**
> - 驗證 npm 發布狀態 `npm view <pkg> dist-tags` ⭐ **Recommended / 推薦** — Verify npm publication status
> - 建立 GitHub Release 並撰寫發布說明 — Create GitHub Release with notes
> - 通知利害關係人新版本已發布 — Notify stakeholders of new release

## Reference | 參考

- [Changelog Format Guide](./changelog-format.md) — 撰寫或審查變更日誌條目時請閱讀此文件。
- [Release Workflow Guide](./release-workflow.md) — 實際執行發布、進行逐步操作時請閱讀此文件。
- [Semantic Versioning Guide](./semantic-versioning.md) — 決定變更屬於 major、minor 或 patch 時請閱讀此文件。
- Detailed guide: [guide.md](./guide.md)
- Core standard: [versioning.md](../../core/versioning.md)


## AI Agent Behavior | AI 代理行為

> 完整的 AI 行為定義請參閱對應的命令文件：[`/release`](../commands/release.md#ai-agent-behavior--ai-代理行為)
>
> For complete AI agent behavior definition, see the corresponding command file: [`/release`](../commands/release.md#ai-agent-behavior--ai-代理行為)
