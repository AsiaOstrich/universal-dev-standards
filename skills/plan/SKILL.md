---
name: plan
version: 2.0.0
scope: universal
description: |
  Generate plan.json from Spec documents, OpenSpec changes, or free-text requirements.
  Use when: converting specifications into executable task plans for /orchestrate.
  Keywords: plan, spec, task plan, 計畫, 規格, 任務, plan.json, DAG.
argument-hint: "[spec-file.md | openspec-dir/ | \"requirement text\" | (interactive)]"
---

# /plan — 從 Spec 自動生成 plan.json

## 用法

```
/plan <spec-file.md>              # Spec 模式（自有格式 / SpecKit）
/plan <openspec-change-dir/>      # OpenSpec 模式
/plan "需求描述文字"               # 需求模式
/plan                             # 互動模式（自動偵測）
```

---

## 執行流程

### Step 1: 輸入辨識與格式偵測

根據引數類型判斷使用模式：

**引數是 .md 檔案：**
1. 讀取檔案內容
2. 偵測格式：
   - 含 `## Requirements` **且** `## Technical Design` → **自有格式**（SPEC-NNN-*.md）
   - 含 `## Summary` **且** `## Detailed Design` → **SpecKit 格式**
   - 其他 .md → 嘗試解析為通用 Spec（按自有格式處理，缺少的欄位由 AI 補充）

**引數是目錄：**
1. 檢查是否含 `proposal.md` + `tasks.md` → **OpenSpec 格式**
2. 否則報錯：「此目錄不符合 OpenSpec 結構」

**引數是字串描述（非檔案路徑）：**
→ **需求模式**

**無引數：**
→ **互動模式**
1. 偵測 `openspec/` 目錄存在？ → 列出 changes 讓使用者選擇
2. 偵測 `specs/*.md` 存在？ → 列出可用 Spec 讓使用者選擇
3. 都沒有 → 進入需求模式問答

---

### Step 2: 專案 Context 收集

讀取目標專案的關鍵資訊：

1. **CLAUDE.md / AGENTS.md** — 語言、框架、測試工具、開發規範
2. **package.json / pyproject.toml** — 可用 scripts（build, test, lint）

從 Context 推斷：
- 主要語言（TypeScript / Python / 其他）
- 預設 verify_command（如 `pnpm build && pnpm test`、`pytest -x`）
- 預設 lint_command（如 `pnpm lint`、`ruff check .`）

---

### Step 3: Spec 解析

依偵測到的格式，解析 Spec 內容：

#### 自有格式（SPEC-NNN-*.md）

提取以下區段：
- **Summary / Motivation** → 理解背景與需求動機
- **Requirements (REQ-NNN)** → 功能需求列表
- **Acceptance Criteria (AC-N)** → Given/When/Then 驗收條件
- **Technical Design** → Phase 分層、每個 Phase 的實作項目
- **Test Plan** → 測試清單
- **Risks** → 風險評估

#### OpenSpec（change 目錄）

讀取以下檔案：
- `proposal.md` → Why（動機）、What Changes（變更項目）、Impact
- `tasks.md` → `- [ ]` checklist 項目
- `design.md`（若存在）→ 技術決策
- `specs/*/spec.md`（若存在）→ Requirements（SHALL/MUST 語句）、Scenarios

#### SpecKit（SPEC-ID.md）

提取以下區段：
- **Summary / Motivation** → 背景
- **Detailed Design** → 技術實作步驟
- **Acceptance Criteria** → checkbox 驗收條件
- **Dependencies** → 外部依賴
- **Risks** → 風險

---

### Step 4: Task 切分

依格式套用不同映射規則：

#### 自有格式映射規則

| Spec 區段 | plan.json 欄位 | 映射規則 |
|-----------|---------------|----------|
| Technical Design > Phase | 一組 tasks | 每個 Phase 的每個實作項目 = 1 個 task |
| Phase 實作項目描述 | `task.spec` | 合併：項目描述 + 相關 REQ + 技術細節 |
| Acceptance Criteria (AC-N) | `task.acceptance_criteria` | 分配到最相關的 task |
| Summary / Motivation | `task.user_intent` | 萃取與 task 最相關的意圖 |
| Test Plan | `task.verify_command` | 推斷測試指令 |

#### OpenSpec 映射規則

| OpenSpec 檔案 | plan.json 欄位 | 映射規則 |
|--------------|---------------|----------|
| `tasks.md` 的 checklist 項目 | tasks | 每個 `- [ ]` 項目 = 1 個 task |
| `proposal.md` > Why | `task.user_intent` | 所有 tasks 共用 |
| `proposal.md` > What Changes | 融入 `task.spec` | 提供變更脈絡 |
| `design.md` 技術細節 | 融入 `task.spec` | 補充實作指引 |
| `specs/*/spec.md` > Scenarios | `task.acceptance_criteria` | 每個 Scenario 映射為一條 criteria |
| `specs/*/spec.md` > Requirements | 融入 `task.spec` | SHALL/MUST 語句轉為具體實作指引 |

---

### Step 5: 依賴推斷

為 tasks 建立 `depends_on` 關係：

1. **Phase/Stage 順序**：後面的 Phase 的第一個 task depends_on 前面 Phase 的最後一個 task
2. **同 Phase 內順序**：型別定義 → 實作 → 整合 → 測試
3. **檔案依賴**：A 建立的檔案被 B import → B depends_on A
4. **無依賴的 tasks**：`depends_on: []`（可並行）

---

### Step 6: verify_command 推斷

依以下優先順序推斷：

1. **Test Plan / Scenarios 有明確測試項** → 對應測試指令
2. **TypeScript 專案** → `pnpm build && pnpm test`
3. **Python 專案** → `pytest -x`
4. **其他** → 使用 Step 2 收集的專案 scripts
5. **無法推斷** → 不設（後續品質警告會提醒）

---

### Step 7: 品質設定

- 預設 `quality: "standard"`
- 使用者可在互動確認時調整

---

### Step 8: 組裝 plan.json

```json
{
  "project": "<專案名稱>",
  "quality": "standard",
  "defaults": {
    "max_turns": 30,
    "max_budget_usd": 2.0,
    "verify_command": "<推斷的預設驗證指令>"
  },
  "tasks": [
    {
      "id": "T-001",
      "title": "<task 標題>",
      "spec": "<詳細的 task 規格說明>",
      "depends_on": [],
      "verify_command": "<task 層級驗證指令（可選）>",
      "acceptance_criteria": ["<驗收條件 1>"],
      "user_intent": "<使用者意圖>"
    }
  ]
}
```

**注意事項：**
- Task ID 格式：`T-NNN`（如 T-001, T-002）
- `spec` 欄位應詳盡——它是 agent 執行任務的唯一規格輸入
- `acceptance_criteria` 每條都必須是可觀察、可驗證的

---

### Step 9: 驗證（Claude-native）

Claude 對 plan.json 執行以下驗證（無需外部引擎）：

1. **結構驗證**：`tasks` 陣列存在且非空、每個 task 含必填欄位（id, title, spec）
2. **DAG 合法性**：`depends_on` 中的所有 ID 均存在、無循環依賴
3. **安全掃描**：task.spec 不含危險指令（`rm -rf /`、`DROP DATABASE`、`git push --force`）
4. **品質警告**：task 缺少 verify_command、spec 過短（< 20 字）等

若發現問題，在呈現前先自動修正（若可修正）或標示警告。

---

### Step 10: 呈現與確認

向使用者呈現生成結果：

1. **摘要表格**：
   ```
   | Task ID | 標題 | 依賴 | 驗證指令 |
   |---------|------|------|----------|
   | T-001   | ...  | -    | ...      |
   | T-002   | ...  | T-001| ...      |
   ```

2. **DAG 拓撲**：
   ```
   Layer 0: T-001, T-002（並行）
   Layer 1: T-003（依賴 T-001）
   Layer 2: T-004（依賴 T-002, T-003）
   ```

3. **品質設定**：`quality: standard`

4. **品質警告**（若有）

5. **詢問使用者**：確認或修改？確認後寫入檔案（預設路徑：`plans/<spec-name>.plan.json`）

---

## 版本歷程

| 版本 | 日期 | 變更 |
|------|------|------|
| 2.0.0 | 2026-04-28 | 升格為 UDS 正式 Skill；移除 [DEVAP] 標記；Step 9 改為 Claude-native 驗證（XSPEC-097 Phase 3） |
| 1.0.0 | 2026-04-09 | 初始發布（從上游遷移） |
