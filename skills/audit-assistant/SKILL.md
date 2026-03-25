---
name: audit
scope: universal
description: "[UDS] UDS Health & Feedback System | UDS 健康檢查與回饋系統"
allowed-tools: Read, Grep, Glob, Bash(git log, uds audit)
argument-hint: "[--health | --patterns | --friction | --report]"
disable-model-invocation: true
---

# Audit Assistant | 審計助手

> **Language**: English | [繁體中文](../../locales/zh-TW/skills/audit-assistant/SKILL.md)

**Version**: 1.0.0
**Last Updated**: 2026-03-04

Diagnose UDS installation health, detect development patterns worth standardizing, identify friction with existing standards, and submit structured feedback to the UDS repository.

診斷 UDS 安裝健康狀態、偵測值得規範化的開發模式、識別與現有標準的摩擦點，並向 UDS 儲存庫提交結構化回饋。

## Workflow | 工作流程

```
DIAGNOSE ──► ANALYZE ──► REPORT
診斷健康      分析模式      回報回饋
```

### Phase 1: DIAGNOSE | 診斷

Run health check on UDS installation.

執行 UDS 安裝健康檢查。

| Check | Description | 檢查項目 |
|-------|-------------|---------|
| `.standards/` exists | Verify directory and files | 驗證目錄與檔案 |
| `manifest.json` valid | Parse and validate manifest | 解析驗證 manifest |
| File integrity | Compare hashes against manifest | 比對雜湊與 manifest |
| AI config references | Verify AI config files reference `.standards/` | 驗證 AI 設定檔引用 |

### Phase 2: ANALYZE | 分析

Detect patterns and friction points.

偵測模式與摩擦點。

| Analysis | Method | 分析方法 |
|----------|--------|---------|
| Directory patterns | Scan for known standard categories | 掃描已知標準類別 |
| Commit patterns | Analyze recent 100 commits for recurring topics | 分析近 100 筆 commit |
| Modified standards | Compare file hashes (diff-based) | 比對檔案雜湊 |
| Unused standards | Check AI config references | 檢查 AI 設定引用 |
| Orphaned files | Find untracked files in `.standards/` | 找出未追蹤檔案 |

### Phase 3: REPORT | 回報

Submit findings as structured GitHub issue.

將發現以結構化 GitHub issue 提交。

| Method | Condition | 方法 |
|--------|-----------|------|
| `gh issue create` | `gh` CLI installed | gh CLI 已安裝 |
| Browser deeplink | Fallback to pre-filled URL | 退回至預填 URL |
| Clipboard copy | Last resort | 最終手段複製至剪貼簿 |

## Usage | 使用方式

```bash
# Full audit (all layers)
uds audit

# Health check only
uds audit --health

# Pattern detection only
uds audit --patterns

# Friction detection only
uds audit --friction

# JSON output
uds audit --format json

# Summary only (for scripts)
uds audit --quiet

# Submit feedback interactively
uds audit --report

# Preview report without submitting
uds audit --report --dry-run
```

## Integration with Other Skills | 與其他技能的整合

When suggested by other skills (e.g., `/checkin`, `/commit`, `/review`, `/sdd`), `/audit` can be invoked to:

當被其他技能建議時，`/audit` 可根據情境執行針對性的檢查：

| Context | Recommended Command | 情境 |
|---------|--------------------|------|
| After `/checkin` failure | `/audit --health` | checkin 失敗後診斷 |
| After `/commit` | `/audit --report` | 提交後回報發現 |
| After `/review` finds friction | `/audit --friction` | 審查發現摩擦時 |
| After `/sdd` spec creation | `/audit --patterns` | 規格建立後檢查覆蓋率 |

## Next Steps | 後續步驟

After running audit:

| Finding | Action | 建議動作 |
|---------|--------|---------|
| Health ERROR ⭐ **Recommended / 推薦** | Run `uds init` or `uds check --restore` | 執行修復指令 |
| Pattern detected | Consider requesting new standard via `--report` | 考慮透過 `--report` 請求新標準 |
| Modified standard | Review if standard needs more flexibility | 檢視標準是否需要更多彈性 |
| Unused standard | Consider removing with `uds uninstall` | 考慮移除未使用標準 |

## Related Standards | 相關規範

- [checkin-standards](../../core/checkin-standards.md) — Code check-in requirements
- [testing-standards](../../core/testing-standards.md) — Testing requirements

## Version History | 版本歷史

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-04 | Initial release — three-layer audit system |

## License

CC BY 4.0 — See [LICENSE](../../LICENSE) for details.
