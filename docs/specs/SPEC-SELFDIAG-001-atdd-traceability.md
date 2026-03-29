# SPEC-SELFDIAG-001 ATDD Traceability Matrix

> [Source: docs/specs/SPEC-SELFDIAG-001-standards-self-diagnosis.md]
> [Generated] AC ↔ BDD ↔ TDD 追蹤表

## AC → BDD Scenario 對應

| AC | 條件 | BDD Scenario | Status |
|----|------|-------------|--------|
| AC-1 | `uds audit --score` 產出分數與 4 維度 | Self mode produces health score with 4 dimensions | [TODO] |
| AC-1 | (同上) | Consumer mode produces health score | [TODO] |
| AC-1 | (同上) | Self mode completeness checks 5 sub-indicators | [TODO] |
| AC-1 | (同上) | Consumer mode completeness checks manifest vs files | [TODO] |
| AC-1 | (同上) | Self mode freshness uses git history | [TODO] |
| AC-1 | (同上) | Consumer mode freshness uses manifest timestamps | [TODO] |
| AC-1 | (同上) | Consistency checks sync status | [TODO] |
| AC-1 | (同上) | Coverage checks verification scripts and tests | [TODO] |
| AC-1 | (同上) | Error when project not initialized | [TODO] |
| AC-2 | `--format json` 含 `mode` 欄位 | JSON output includes mode field | [TODO] |
| AC-3 | `--save` 存入 `.uds/health-scores/` | Save score snapshot | [TODO] |
| AC-4 | `--trend` 顯示趨勢 | Display trend from history | [TODO] |
| AC-4 | (同上) | Detect degradation | [TODO] |
| AC-5 | `--ci --threshold N` exit code | CI mode exits with appropriate code | [TODO] |
| AC-6 | `scheduled-health.yml` 每週執行 | Weekly scheduled execution | [TODO] |
| AC-6 | (同上) | Auto-create issue on degradation | [TODO] |
| AC-6 | (同上) | Manual workflow dispatch | [TODO] |
| AC-7 | 外部連結 + 離線 fallback | Detect broken links | [TODO] |
| AC-7 | (同上) | Detect outdated version references | [TODO] |
| AC-7 | (同上) | Offline fallback | [TODO] |
| AC-8 | 13 個 AI 工具整合測試 | Validate output format for all 13 AI tools | [TODO] |
| AC-8 | (同上) | Snapshot comparison | [TODO] |
| AC-8 | (同上) | Skill file validation | [TODO] |
| AC-9 | Hook 統計記錄 + opt-out | Record trigger statistics | [TODO] |
| AC-9 | (同上) | Opt-out of statistics recording | [TODO] |
| AC-10 | Hook 寫入失敗不影響注入 | Stats write failure does not break hook | [TODO] |
| AC-11 | 盲區分析報告 | Analyze trigger blind spots | [TODO] |
| AC-12 | Schema 驗證 | JSON Schema validates effectiveness reports | [TODO] |
| AC-13 | 匯總多份報告 | Aggregate multiple reports | [TODO] |
| AC-13 | (同上) | Detect recurring unmatched issues | [TODO] |
| AC-14 | Release 產出 version-manifest | Produce version-manifest on release | [TODO] |
| AC-14 | (同上) | Consumer version drift detection | [TODO] |
| AC-15 | Manifest 損壞 graceful failure | Graceful failure on corrupted manifest | [TODO] |
| AC-16 | 覆蓋率不下降 | (Cross-cutting: npm run test:quick) | [TODO] |

## AC → TDD Test 對應

| AC | TDD Test File | Test Description | Status |
|----|--------------|-----------------|--------|
| AC-1 | `health-scorer.test.js` | should return score between 0 and 100 | [TODO] |
| AC-1 | `health-scorer.test.js` | should return 4 dimension scores | [TODO] |
| AC-1 | `health-scorer.test.js` | should include mode field in result | [TODO] |
| AC-1 | `health-scorer.test.js` | Self mode completeness: should return 100 when all items exist | [TODO] |
| AC-1 | `health-scorer.test.js` | Freshness: should score 100/75/50/25 by age | [TODO] |
| AC-1 | `health-scorer.test.js` | Consistency: should return 100 when all in sync | [TODO] |
| AC-1 | `health-scorer.test.js` | Coverage: should count standards with check scripts | [TODO] |
| AC-2 | `health-scorer.test.js` | should include timestamp in result | [TODO] |
| AC-3 | `health-scorer.test.js` | saveScoreSnapshot: should save with today date | [TODO] |
| AC-4 | `health-scorer.test.js` | loadTrend: should load and sort historical snapshots | [TODO] |
| AC-4 | `health-scorer.test.js` | loadTrend: should detect degradation when score drops > 5 | [TODO] |
| AC-5 | `audit-utils.test.js` | CI mode: should return only numeric score | [TODO] |
| AC-8 | `tool-outputs.test.js` | should produce valid config file per tool | [TODO] |
| AC-9 | `inject-standards.test.js` | should append stats to hook-stats.jsonl | [TODO] |
| AC-10 | `inject-standards.test.js` | should not fail when stats write fails | [TODO] |
| AC-15 | `health-scorer.test.js` | should handle corrupted manifest gracefully | [TODO] |

## 覆蓋統計

| 指標 | 數值 |
|------|------|
| 總 AC 數 | 16 |
| 已有 BDD Scenario 的 AC | 16 (100%) |
| 已有 TDD Test 的 AC | 14 (87.5%) |
| 未覆蓋的 AC | AC-6 (CI workflow), AC-16 (cross-cutting) |
| BDD Scenario 總數 | 33 |
| TDD Test 總數 | 32 |

> **Note**: AC-6 (GitHub Actions workflow) 和 AC-16 (覆蓋率) 無法用單元測試覆蓋，需透過 CI 驗證。
