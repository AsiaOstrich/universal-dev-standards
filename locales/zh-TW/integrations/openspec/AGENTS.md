---
source: ../../../../integrations/openspec/AGENTS.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-01-13
status: current
---

# OpenSpec 指令

使用 OpenSpec 進行規格驅動開發的 AI 編碼助手指令。

## 快速檢查清單

- 搜尋現有工作：`openspec spec list --long`、`openspec list`（僅使用 `rg` 進行全文搜尋）
- 決定範圍：新功能 vs 修改現有功能
- 選擇唯一的 `change-id`：kebab-case，動詞開頭（`add-`、`update-`、`remove-`、`refactor-`）
- 建立骨架：`proposal.md`、`tasks.md`、`design.md`（僅在需要時），以及每個受影響功能的差異規格
- 撰寫差異：使用 `## ADDED|MODIFIED|REMOVED|RENAMED Requirements`；每個需求至少包含一個 `#### Scenario:`
- 驗證：`openspec validate [change-id] --strict` 並修復問題
- 請求核准：在提案核准前不要開始實作

## 三階段工作流程

### 階段 1：建立變更
在需要以下情況時建立提案：
- 新增功能或特性
- 進行破壞性變更（API、schema）
- 變更架構或模式
- 效能最佳化（改變行為）
- 更新安全模式

觸發條件（範例）：
- 「幫我建立變更提案」
- 「幫我規劃變更」
- 「幫我建立提案」
- 「我想建立規格提案」
- 「我想建立規格」

可跳過提案的情況：
- 錯誤修復（恢復預期行為）
- 錯字、格式、註解
- 依賴更新（非破壞性）
- 配置變更
- 現有行為的測試

**工作流程**
1. 審查 `openspec/project.md`、`openspec list` 和 `openspec list --specs` 以了解當前脈絡。
2. 選擇唯一的動詞開頭 `change-id`，在 `openspec/changes/<id>/` 下建立 `proposal.md`、`tasks.md`、選用的 `design.md` 和規格差異。
3. 使用 `## ADDED|MODIFIED|REMOVED Requirements` 草擬規格差異，每個需求至少有一個 `#### Scenario:`。
4. 執行 `openspec validate <id> --strict` 並在分享提案前解決所有問題。

### 階段 2：實作變更
將這些步驟作為待辦事項追蹤，逐一完成。
1. **閱讀 proposal.md** - 了解正在建構什麼
2. **閱讀 design.md**（如存在）- 審查技術決策
3. **閱讀 tasks.md** - 取得實作檢查清單
4. **依序實作任務** - 按順序完成
5. **確認完成** - 確保 `tasks.md` 中每個項目完成後才更新狀態
6. **更新檢查清單** - 所有工作完成後，將每個任務設為 `- [x]` 以反映實際狀態
7. **核准關卡** - 在提案審查和核准前不要開始實作

### 階段 3：封存變更
部署後，建立單獨的 PR：
- 將 `changes/[name]/` 移至 `changes/archive/YYYY-MM-DD-[name]/`
- 如功能有變更則更新 `specs/`
- 對於純工具類變更使用 `openspec archive <change-id> --skip-specs --yes`（始終明確傳遞 change ID）
- 執行 `openspec validate --strict` 確認封存的變更通過檢查

## 任何任務之前

**脈絡檢查清單：**
- [ ] 閱讀 `specs/[capability]/spec.md` 中的相關規格
- [ ] 檢查 `changes/` 中是否有衝突的待處理變更
- [ ] 閱讀 `openspec/project.md` 了解慣例
- [ ] 執行 `openspec list` 查看活躍變更
- [ ] 執行 `openspec list --specs` 查看現有功能

**建立規格前：**
- 始終檢查功能是否已存在
- 優先修改現有規格而非建立重複項
- 使用 `openspec show [spec]` 審查當前狀態
- 如請求模糊，在建立骨架前詢問 1-2 個澄清問題

### 搜尋指引
- 列舉規格：`openspec spec list --long`（或 `--json` 用於腳本）
- 列舉變更：`openspec list`（或 `openspec change list --json` - 已棄用但可用）
- 顯示詳情：
  - 規格：`openspec show <spec-id> --type spec`（使用 `--json` 進行過濾）
  - 變更：`openspec show <change-id> --json --deltas-only`
- 全文搜尋（使用 ripgrep）：`rg -n "Requirement:|Scenario:" openspec/specs`

## 快速開始

### CLI 指令

```bash
# 基本指令
openspec list                  # 列出活躍變更
openspec list --specs          # 列出規格
openspec show [item]           # 顯示變更或規格
openspec validate [item]       # 驗證變更或規格
openspec archive <change-id> [--yes|-y]   # 部署後封存（添加 --yes 用於非互動執行）

# 專案管理
openspec init [path]           # 初始化 OpenSpec
openspec update [path]         # 更新指令檔案

# 互動模式
openspec show                  # 提示選擇
openspec validate              # 批量驗證模式

# 除錯
openspec show [change] --json --deltas-only
openspec validate [change] --strict
```

### 指令標誌

- `--json` - 機器可讀輸出
- `--type change|spec` - 區分項目
- `--strict` - 全面驗證
- `--no-interactive` - 停用提示
- `--skip-specs` - 封存時不更新規格
- `--yes`/`-y` - 跳過確認提示（非互動封存）

## 目錄結構

```
openspec/
├── project.md              # 專案慣例
├── specs/                  # 當前真相 - 已建構的內容
│   └── [capability]/       # 單一聚焦功能
│       ├── spec.md         # 需求和場景
│       └── design.md       # 技術模式
├── changes/                # 提案 - 應該變更的內容
│   ├── [change-name]/
│   │   ├── proposal.md     # 為何、什麼、影響
│   │   ├── tasks.md        # 實作檢查清單
│   │   ├── design.md       # 技術決策（選用；見標準）
│   │   └── specs/          # 差異變更
│   │       └── [capability]/
│   │           └── spec.md # ADDED/MODIFIED/REMOVED
│   └── archive/            # 已完成變更
```

## 建立變更提案

### 決策樹

```
新請求？
├─ 恢復規格行為的錯誤修復？ → 直接修復
├─ 錯字/格式/註解？ → 直接修復
├─ 新功能/特性？ → 建立提案
├─ 破壞性變更？ → 建立提案
├─ 架構變更？ → 建立提案
└─ 不確定？ → 建立提案（較安全）
```

### 提案結構

1. **建立目錄：** `changes/[change-id]/`（kebab-case，動詞開頭，唯一）

2. **撰寫 proposal.md：**
```markdown
# 變更：[變更簡述]

## 為何
[1-2 句說明問題/機會]

## 變更內容
- [變更項目列表]
- [以 **BREAKING** 標記破壞性變更]

## 影響
- 受影響規格：[列出功能]
- 受影響程式碼：[關鍵檔案/系統]
```

3. **建立規格差異：** `specs/[capability]/spec.md`
```markdown
## ADDED Requirements
### Requirement: 新功能
系統應提供...

#### Scenario: 成功案例
- **WHEN** 使用者執行動作
- **THEN** 預期結果

## MODIFIED Requirements
### Requirement: 現有功能
[完整的修改後需求]

## REMOVED Requirements
### Requirement: 舊功能
**原因**：[移除原因]
**遷移**：[如何處理]
```
如果多個功能受影響，在 `changes/[change-id]/specs/<capability>/spec.md` 下建立多個差異檔案——每個功能一個。

4. **建立 tasks.md：**
```markdown
## 1. 實作
- [ ] 1.1 建立資料庫 schema
- [ ] 1.2 實作 API 端點
- [ ] 1.3 新增前端元件
- [ ] 1.4 撰寫測試
```

5. **在需要時建立 design.md：**
如符合以下任一條件則建立 `design.md`；否則省略：
- 跨模組變更（多個服務/模組）或新架構模式
- 新外部依賴或重大資料模型變更
- 安全、效能或遷移複雜度
- 在編碼前需要技術決策來消除歧義

## 規格檔案格式

### 重要：場景格式

**正確**（使用 #### 標題）：
```markdown
#### Scenario: 使用者登入成功
- **WHEN** 提供有效憑證
- **THEN** 回傳 JWT token
```

**錯誤**（不要使用項目符號或粗體）：
```markdown
- **Scenario: 使用者登入**  ❌
**Scenario**: 使用者登入     ❌
### Scenario: 使用者登入      ❌
```

每個需求必須至少有一個場景。

### 需求用語
- 使用 SHALL/MUST 表示規範性需求（除非刻意為非規範性，否則避免 should/may）

### 差異操作

- `## ADDED Requirements` - 新功能
- `## MODIFIED Requirements` - 行為變更
- `## REMOVED Requirements` - 棄用功能
- `## RENAMED Requirements` - 名稱變更

標題以 `trim(header)` 匹配 - 忽略空白。

## 最佳實踐

### 簡單優先
- 預設為 <100 行新程式碼
- 單檔實作直到證明不足
- 無明確理由不使用框架
- 選擇無聊、經過驗證的模式

### 複雜度觸發條件
僅在以下情況增加複雜度：
- 效能數據顯示當前解決方案過慢
- 具體的規模需求（>1000 使用者、>100MB 資料）
- 需要抽象的多個已驗證用例

### 清晰引用
- 使用 `file.ts:42` 格式標示程式碼位置
- 以 `specs/auth/spec.md` 格式引用規格
- 連結相關變更和 PR

### 功能命名
- 使用動詞-名詞：`user-auth`、`payment-capture`
- 每個功能單一目的
- 10 分鐘可理解規則
- 如描述需要「和」則拆分

### 變更 ID 命名
- 使用 kebab-case，簡短且描述性：`add-two-factor-auth`
- 優先使用動詞開頭前綴：`add-`、`update-`、`remove-`、`refactor-`
- 確保唯一性；若已被使用，附加 `-2`、`-3` 等

## 快速參考

### 階段指示
- `changes/` - 提議，尚未建構
- `specs/` - 已建構和部署
- `archive/` - 已完成變更

### 檔案用途
- `proposal.md` - 為何和什麼
- `tasks.md` - 實作步驟
- `design.md` - 技術決策
- `spec.md` - 需求和行為

### CLI 基本指令
```bash
openspec list              # 正在進行什麼？
openspec show [item]       # 查看詳情
openspec validate --strict # 是否正確？
openspec archive <change-id> [--yes|-y]  # 標記完成（添加 --yes 用於自動化）
```

記住：規格是真相。變更是提案。保持同步。
