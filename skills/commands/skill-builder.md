---
name: skill-builder
description: [UDS] Identify repeated processes and build Skills with the right development depth.
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
argument-hint: "[process description | 流程描述]"
---

# /skill-builder Command

The `/skill-builder` command guides you from "I keep doing this manually" to
"I have a properly-built Skill", applying the right amount of process
governance along the way.

It is backed by the `skill-builder` skill (`skills/skill-builder/SKILL.md`).

## Usage

```bash
/skill-builder [process description]
```

## When to Use

- You have manually performed the same multi-step process 3+ times.
- A teammate asks "how do we do X?" for the 3rd time.
- You hacked together an ad-hoc skill and now want to formalize it.

## Path Selection

| Path | Trigger | Action |
|------|---------|--------|
| Simple | ≤7 steps, no branching, <3 standards, no source-code output | Fill a Skill Brief, create `SKILL.md` directly |
| Complex | any of the above is exceeded | Create an XSPEC first (`/sdd`), then build |
| Delta | modifying an existing Skill | Append `## MODIFIED` / `## ADDED`, bump version |

## AI Agent Behavior | AI 代理行為

> Follows [AI Command Behavior Standards](../../core/ai-command-behavior.md)

### Entry Router | 進入路由

| Input | AI Action |
|-------|-----------|
| `/skill-builder` | 讀取 `SKILL-CANDIDATES.md`：有已達 3 次的候選 → 列出供選擇；無 → 詢問重複流程的描述 |
| `/skill-builder <process description>` | 以該描述進入 Step 1，直接開始擷取流程 |

### Interaction Script | 互動腳本

先讀取 `skills/skill-builder/SKILL.md`，取得完整決策樹、放置規則、工作流程與輸出檢查表。

#### Step 1–2: 擷取流程並登記候選

1. 擷取重複序列：步驟與順序、目前手動執行過幾次、觸及哪些工具或檔案
2. 開啟專案的 `SKILL-CANDIDATES.md`（首次則從 `templates/SKILL-CANDIDATES.md` 複製）

**Decision: 觸發次數**
- IF 尚未登記 → 新增列，填入目前次數
- IF 已登記 → 次數 +1
- IF 次數 < 3 → **告知尚未達觸發門檻，登記後停止，不建立 SKILL.md**
- IF 次數 ≥ 3 → 標記觸發 ✅，繼續 Step 3

🛑 **STOP**: 次數未達 3 時停止於此，等待使用者明確要求才破例

#### Step 3: 路徑選擇

回答 4 個判斷問題，判定路徑：

- IF ≤7 步、無分支、<3 個標準、無原始碼產出 → **Simple**（Step 4a）
- IF 上述任一超出 → **Complex**（Step 4b）
- IF 修改既有 Skill → **Delta**（Step 4c）

🛑 **STOP**: 展示判定結果與理由後等待使用者確認路徑

#### Step 4: 依路徑分流

- **4a Simple** — 以 `templates/SKILL-BRIEF-TEMPLATE.md` 填寫 Brief：觸發情境、3–7 個核心步驟、2–3 條 AC、明確的 out of scope
- **4b Complex** — 執行 `/sdd` 建立 XSPEC；**XSPEC 未 Approved 前不進入 Step 5**
- **4c Delta** — 標定既有 SKILL.md 受影響章節，於檔末加 `## MODIFIED Requirements` 或 `## ADDED Requirements`

#### Step 5–7: 產出與登記

1. **放置決策**：步驟引用專案特有路徑（如 `TECH-RADAR.md`、`DEC-*.md`）→ `{project}/.claude/skills/`；步驟為通用 → UDS `skills/{name}/` **並建立 zh-TW locale**
2. 由 Brief 或 XSPEC 生成 SKILL.md，核對 frontmatter：`name`、`scope`、`description`、`allowed-tools`
3. 回填 `SKILL-CANDIDATES.md`：觸發 ✅、Skill 欄填入
4. 依 skill 的 commit 格式提交

🛑 **STOP**: commit 前展示輸出檢查表結果，等待使用者確認

### Stop Points | 停止點

| Stop Point | 等待內容 |
|-----------|---------|
| 觸發次數 < 3 | 使用者是否明確要求破例建立 |
| 路徑判定後 | 使用者確認 Simple / Complex / Delta |
| Complex 路徑 | XSPEC 經 `/sdd` 建立並 Approved |
| commit 前 | 使用者確認輸出檢查表 |

### Error Handling | 錯誤處理

| Error Condition | AI Action |
|-----------------|-----------|
| 未提供流程描述且無候選 | 詢問重複流程內容，**不得臆造流程** |
| `SKILL-CANDIDATES.md` 不存在 | 從 `templates/SKILL-CANDIDATES.md` 複製後繼續 |
| 觸發次數不足 3 次 | 登記候選後停止，說明門檻理由 |
| 同名 Skill 已存在 | 改走 Delta 路徑，不覆蓋既有 SKILL.md |
| 放置位置無法判定 | 列出「專案特有 vs 通用」判準請使用者裁定 |

## References | 參考

- [Skill Builder Skill](../skill-builder/SKILL.md)
- Related: [/sdd](./sdd.md) (Complex path creates an XSPEC first)
