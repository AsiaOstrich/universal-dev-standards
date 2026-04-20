# Bundle-Source Triage Decision Table

> **XSPEC-072 Phase 1 產物**（2026-04-19 Subagent 預備）
> **狀態**: ✅ Albert 已 review 完成（2026-04-20）— 待 Phase 2 執行
> **規範**: XSPEC-072 Req 1.2 / DEC-045
> **Parity 基準**: 2026-04-19 跑 `node cli/scripts/check-bundle-parity.mjs`
>   結果 = `source=71 bundled=68 excludes=0`，30 source-only + 27 bundle-only = **57 差異**（與 XSPEC-072 附錄 A 完全一致）

---

## 如何 review

- 在「Albert [x]」欄勾選 `[x]` = 接受預設決策
- 若要覆蓋預設，在「備註」欄寫「改為 ADD_TO_BUNDLE」或其他覆蓋 + 原因
- 標記 `⚠️ AMBIGUOUS` 者必須 review（DEC-045 § 六 規則無法明確仲裁）
- 標記 `⚠️ CONFLICT` 者必須 review + 看「同名衝突 diff 摘要」段
- 完成後本表會被 Phase 2 subagent 讀取執行

### 決策類別代碼

- `EXCLUDE`：source 保留、bundle 不收，填 `bundle-exclude.json` + reason
- `ADD_TO_BUNDLE`：補進 bundle（修改 `prepack.mjs` 或 bundle source）
- `ADD_TO_SOURCE`：補進 source（建立 `.standards/*.ai.yaml` + 同步 .md + manifest）
- `RENAME_FLAT_TO_NESTED`：路徑正規化（source 平坦 → 分類）
- `DELETE_FROM_SOURCE`：source 移除（含 deprecated/duplicate 的舊版本）
- `DELETE_FROM_BUNDLE`：bundle 移除（若確認非預期資產）

### 預設規則來源（DEC-045 § 六）

1. 標準名含 `governance` / `ai-` / `agent-` / `workflow-` / `pipeline-` / `audit` / `retrospective` / `execution-history` / `test-governance` → 預設 `EXCLUDE`（UDS 內部治理）
2. 標準名含 `standards` / `api-design` / `database` / `documentation` 且 `scope: public` → 預設 `ADD_TO_BUNDLE`（採用者需要）
3. 路徑為 `options/*.ai.yaml` 平坦 options → 預設 `RENAME_FLAT_TO_NESTED`
4. 其他不確定 → 預設 `EXCLUDE` 並標 `⚠️ AMBIGUOUS`

---

## A.1 Source-only（30 項）

| #  | 路徑 | 預設決策 | Reason | Albert [x] | 備註 |
|----|------|---------|--------|:----------:|------|
| 1  | `acceptance-criteria-traceability.ai.yaml` | EXCLUDE | UDS 內部治理（AC traceability matrix），採用者不需 | [x] | |
| 2  | `adr-standards.ai.yaml` | **ADD_TO_BUNDLE** | 採用者也常需要寫 ADR，應給 | [x] | Albert 覆蓋：改為 ADD_TO_BUNDLE |
| 3  | `agent-communication-protocol.ai.yaml` | EXCLUDE | UDS 跨專案 Agent 治理協定，採用者通常無多 Agent 場景 | [x] | |
| 4  | `agent-dispatch.ai.yaml` | EXCLUDE | UDS 內部 subagent 派遣標準，採用者不需 | [x] | |
| 5  | `ai-command-behavior.ai.yaml` | EXCLUDE | UDS Skill/command 設計治理，採用者不需 | [x] | |
| 6  | `ai-response-navigation.ai.yaml` | EXCLUDE | UDS AI 回應 footer 治理，採用者不需 | [x] | |
| 7  | `anti-sycophancy-prompting.ai.yaml` | **ADD_TO_BUNDLE** | 對下游 AI app 開發者有實際價值，對外分享 | [x] | Albert 覆蓋：改為 ADD_TO_BUNDLE |
| 8  | `api-design-standards.ai.yaml` | ADD_TO_BUNDLE | 公開 API 設計標準（REST/GraphQL/gRPC），採用者明顯需要 | [x] | |
| 9  | `branch-completion.ai.yaml` | EXCLUDE | UDS 內部分支完成治理（4 選項決策），採用者用一般 git workflow 即可 | [x] | |
| 10 | `change-batching-standards.ai.yaml` | EXCLUDE | UDS 內部 pending changes 狀態機治理 | [x] | |
| 11 | `context-aware-loading.ai.yaml` | EXCLUDE | UDS manifest.json domain 載入治理，採用者不需 | [x] | |
| 12 | `database-standards.ai.yaml` | ADD_TO_BUNDLE | 公開資料庫設計標準，採用者明顯需要 | [x] | |
| 13 | `documentation-lifecycle.ai.yaml` | ADD_TO_BUNDLE | co-update / shift-left 對採用者有用 | [x] | Albert 確認預設 ADD_TO_BUNDLE |
| 14 | `execution-history.ai.yaml` | EXCLUDE | UDS 內部 L1/L2/L3 執行歷史治理（XSPEC-003），採用者通常不需 | [x] | |
| 15 | `git-worktree.ai.yaml` | EXCLUDE | UDS 內部 worktree 隔離治理，採用者用一般 git 即可 | [x] | |
| 16 | `model-selection.ai.yaml` | EXCLUDE | UDS 內部 AI 模型分級治理 | [x] | |
| 17 | `options/bilingual.ai.yaml` | CONFLICT + RENAME_FLAT_TO_NESTED | source 版本比 bundle 版本更豐富（多 anti_patterns + 詳細 instruction）→ 以 source 為準覆蓋 bundle，再刪 source 平坦 | [x] | 接受衝突 1 處理方式 |
| 18 | `options/english.ai.yaml` | RENAME_FLAT_TO_NESTED | 遷移至 `options/commit-message/english.ai.yaml`，diff 後覆蓋或合併 | [x] | |
| 19 | `options/github-flow.ai.yaml` | RENAME_FLAT_TO_NESTED | 內容與 bundle 完全相同，刪 source 平坦即可 | [x] | |
| 20 | `options/integration-testing.ai.yaml` | DELETE_FROM_SOURCE | 語言中立版已在 source+bundle，平坦 JS 版廢棄；Albert 方針：保持語言中立 | [x] | Albert 確認：語言中立優先 |
| 21 | `options/squash-merge.ai.yaml` | RENAME_FLAT_TO_NESTED | 內容與 bundle 完全相同，刪 source 平坦即可 | [x] | |
| 22 | `options/unit-testing.ai.yaml` | DELETE_FROM_SOURCE | 語言中立版已在 source+bundle，平坦 JS 版廢棄；Albert 方針：保持語言中立 | [x] | Albert 確認：語言中立優先 |
| 23 | `pipeline-integration-standards.ai.yaml` | EXCLUDE | UDS 內部 pipeline 階段模型治理（含 `pipeline-` 前綴） | [x] | |
| 24 | `retrospective-standards.ai.yaml` | EXCLUDE | UDS 內部回顧治理（含 `retrospective` 關鍵字） | [x] | |
| 25 | `structured-task-definition.ai.yaml` | EXCLUDE | UDS 內部 AI task 定義治理 | [x] | |
| 26 | `systematic-debugging.ai.yaml` | **ADD_TO_BUNDLE** | 4 階段除錯流程對採用者的 AI 有教育價值，對外分享 | [x] | Albert 覆蓋：改為 ADD_TO_BUNDLE |
| 27 | `test-governance.ai.yaml` | EXCLUDE | 含 `test-governance` 關鍵字（UDS 內部 test policy 治理） | [x] | |
| 28 | `verification-evidence.ai.yaml` | EXCLUDE | UDS 內部 anti-hallucination 驗證證據治理 | [x] | |
| 29 | `workflow-enforcement.ai.yaml` | EXCLUDE | 含 `workflow-` 關鍵字（machine-enforceable workflow gate 治理） | [x] | |
| 30 | `workflow-state-protocol.ai.yaml` | EXCLUDE | 含 `workflow-` 關鍵字（跨 session 狀態持久化治理） | [x] | |

### A.1 預設分類統計

- EXCLUDE 預設: **18 項**（# 1, 3, 4, 5, 6, 9, 10, 11, 14, 15, 16, 23, 24, 25, 27, 28, 29, 30 + 預設值 #2/#7）
  - 嚴格規則 1 命中: 16 項
  - 規則 1 邊界（含 ⚠️ AMBIGUOUS 預設 EXCLUDE）: #2, #7, #26 共 3 項
- ADD_TO_BUNDLE 預設: **3 項**（#8, #12, #13）
- RENAME_FLAT_TO_NESTED 預設: **3 項**（#17, #18, #19, #21 — 含 1 個 conflict）
  - 注意：#17 conflict 需先 reconcile 內容
- DELETE_FROM_SOURCE 預設: **2 項**（#20, #22 — 平坦 testing 重複）
- ⚠️ AMBIGUOUS 標記: **5 項**（#2, #7, #13, #20, #22, #26 — 6 項，含 #26）
- ⚠️ CONFLICT 標記: **1 項**（#17）

> 預設分類數與 30 對齊（18 EXCLUDE + 3 ADD_TO_BUNDLE + 3 RENAME + 2 DELETE_FROM_SOURCE + 4 純 AMBIGUOUS = 30；其中 #17 同屬 RENAME 與 CONFLICT）

---

## A.2 Bundle-only（27 項）

| #  | 路徑 | 預設決策 | Reason | Albert [x] | 備註 |
|----|------|---------|--------|:----------:|------|
| 1  | `options/changelog/auto-generated.ai.yaml` | ADD_TO_SOURCE | 採用者 changelog 選項，UDS source 缺；補進 source + manifest 三方同步 | [x] | |
| 2  | `options/changelog/keep-a-changelog.ai.yaml` | ADD_TO_SOURCE | 同上 | [x] | |
| 3  | `options/code-review/automated-review.ai.yaml` | ADD_TO_SOURCE | 採用者 code review 選項 | [x] | |
| 4  | `options/code-review/pair-programming.ai.yaml` | ADD_TO_SOURCE | 同上 | [x] | |
| 5  | `options/code-review/pr-review.ai.yaml` | ADD_TO_SOURCE | 同上 | [x] | |
| 6  | `options/commit-message/bilingual.ai.yaml` | CONFLICT → 由 source A.1 #17 reconcile 後同步 | 與 source `options/bilingual.ai.yaml` 衝突且 source 內容更豐富 → 用 source 覆蓋 bundle | [x] | 接受衝突 1 處理方式 |
| 7  | `options/commit-message/english.ai.yaml` | ADD_TO_SOURCE 配合 #18 rename | source 平坦 `options/english.ai.yaml` 應 rename 至此；先 diff 兩者 | [x] | |
| 8  | `options/commit-message/traditional-chinese.ai.yaml` | ADD_TO_SOURCE | source 缺繁中 commit-message 選項，補進 | [x] | |
| 9  | `options/documentation/api-docs.ai.yaml` | ADD_TO_SOURCE | 採用者 documentation 選項 | [x] | |
| 10 | `options/documentation/markdown-docs.ai.yaml` | ADD_TO_SOURCE | 同上 | [x] | |
| 11 | `options/documentation/wiki-style.ai.yaml` | ADD_TO_SOURCE | 同上 | [x] | |
| 12 | `options/git-workflow/gitflow.ai.yaml` | ADD_TO_SOURCE | 採用者 git-workflow 選項 | [x] | |
| 13 | `options/git-workflow/github-flow.ai.yaml` | RENAME 已就緒（含 source A.1 #19）| 內容與 source 平坦相同 → source 平坦遷移到此即補齊 | [x] | |
| 14 | `options/git-workflow/merge-commit.ai.yaml` | ADD_TO_SOURCE | 同 #12 | [x] | |
| 15 | `options/git-workflow/rebase-ff.ai.yaml` | ADD_TO_SOURCE | 同上 | [x] | |
| 16 | `options/git-workflow/squash-merge.ai.yaml` | RENAME 已就緒（含 source A.1 #21）| 內容與 source 平坦相同 | [x] | |
| 17 | `options/git-workflow/trunk-based.ai.yaml` | ADD_TO_SOURCE | 同 #12 | [x] | |
| 18 | `options/project-structure/dotnet.ai.yaml` | ADD_TO_SOURCE | 多語言 project-structure（10 項全補進 source） | [x] | |
| 19 | `options/project-structure/go.ai.yaml` | ADD_TO_SOURCE | 同上 | [x] | |
| 20 | `options/project-structure/java.ai.yaml` | ADD_TO_SOURCE | 同上 | [x] | |
| 21 | `options/project-structure/kotlin.ai.yaml` | ADD_TO_SOURCE | 同上 | [x] | |
| 22 | `options/project-structure/nodejs.ai.yaml` | ADD_TO_SOURCE | 同上 | [x] | |
| 23 | `options/project-structure/php.ai.yaml` | ADD_TO_SOURCE | 同上 | [x] | |
| 24 | `options/project-structure/python.ai.yaml` | ADD_TO_SOURCE | 同上 | [x] | |
| 25 | `options/project-structure/ruby.ai.yaml` | ADD_TO_SOURCE | 同上 | [x] | |
| 26 | `options/project-structure/rust.ai.yaml` | ADD_TO_SOURCE | 同上 | [x] | |
| 27 | `options/project-structure/swift.ai.yaml` | ADD_TO_SOURCE | 同上 | [x] | |

### A.2 預設分類統計

- ADD_TO_SOURCE 預設: **24 項**（#1-5, #7-12, #14-15, #17, #18-27）
- RENAME 已就緒（與 source 配對）: **2 項**（#13, #16，已在 A.1 reconcile）
- ⚠️ CONFLICT: **1 項**（#6 — 由 A.1 #17 處理）

---

## 同名衝突 diff 摘要

### 衝突 1: `options/bilingual.ai.yaml` vs `options/commit-message/bilingual.ai.yaml`

- **內容不一致**（diff 42 行）
- **差異摘要**:
  - source 版本（`.standards/options/bilingual.ai.yaml`）有完整 `instruction` 多行說明（5 步驟）+ `priority: required`
  - bundle 版本（`cli/bundled/ai/options/commit-message/bilingual.ai.yaml`）只有單行 `instruction: Write body in both languages, English first` + `priority: recommended`
  - source 額外有 `anti_patterns` 段（27 行：`mixed-language-body` 與 `missing-chinese-body`，含 bad/good 範例）
- **建議**: source 內容是後續強化版本（與 dev-platform 雙語規範吻合），應以 source 內容覆蓋 bundle 版本，再刪 source 平坦路徑

### 衝突 2: `options/github-flow.ai.yaml` vs `options/git-workflow/github-flow.ai.yaml`

- **內容完全一致**（diff 0 行）
- **建議**: 直接 `RENAME_FLAT_TO_NESTED`（刪 source 平坦保留 bundle 分類路徑）

### 衝突 3: `options/squash-merge.ai.yaml` vs `options/git-workflow/squash-merge.ai.yaml`

- **內容完全一致**（diff 0 行）
- **建議**: 直接 `RENAME_FLAT_TO_NESTED`（刪 source 平坦保留 bundle 分類路徑）

### 額外發現：source 內 testing 平坦/分類雙存

- `.standards/options/integration-testing.ai.yaml`（**JS 風格範例 + tools 寫死**）vs `.standards/options/testing/integration-testing.ai.yaml`（**語言中立 pseudocode + ai_instruction**）
- `.standards/options/unit-testing.ai.yaml` vs `.standards/options/testing/unit-testing.ai.yaml` 同模式
- 兩組**內容差異很大**（diff 數十行），nested 是後續推廣的「語言中立」版（已在 bundle）；flat 是早期帶 JS 範例的版本
- **建議**: 預設 `DELETE_FROM_SOURCE` 平坦版，但 Albert 須確認 JS/Python/Java 等具體範例不再需要保留

---

## Albert 決策後下一步

1. Albert 把所有 `[ ]` 改為 `[x]`，需要覆蓋預設者在備註填 `改為 XXX` + 原因
2. 特別注意：
   - **6 個 ⚠️ AMBIGUOUS 必看**: A.1 #2, #7, #13, #20, #22, #26
   - **1 個 ⚠️ CONFLICT 必看**: A.1 #17（影響 A.2 #6 reconcile 方向）
3. Review 完成後回 dev-platform，產生 XSPEC-072 Phase 2 subagent prompt：指向本決策表執行
4. Phase 2 完成後 `npm run check:bundle-parity` 應 exit 0，再切 hard fail（Phase 3）
