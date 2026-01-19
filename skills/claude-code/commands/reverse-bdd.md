---
description: Transform SDD acceptance criteria into BDD Gherkin scenarios
allowed-tools: Read, Write, Grep, Glob
argument-hint: "[SPEC file path | 規格檔案路徑]"
---

# Transform SDD to BDD Scenarios | SDD 轉換為 BDD 場景

Convert acceptance criteria from SDD specification documents into Gherkin format BDD scenarios.

將 SDD 規格文件中的驗收標準轉換為 Gherkin 格式的 BDD 場景。

## Workflow | 工作流程

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Parse SPEC     │───▶│ Detect AC       │───▶│ Transform to    │
│  File           │    │ Format          │    │ Gherkin         │
│  解析規格檔案    │    │ 偵測 AC 格式    │    │ 轉換為 Gherkin  │
└─────────────────┘    └─────────────────┘    └────────┬────────┘
                                                       │
                                                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Human Review   │◀───│ Generate        │◀───│ Apply Labels    │
│  人類審查        │    │ .feature File   │    │ 套用標籤        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Anti-Hallucination Compliance | 反幻覺合規

**CRITICAL**: All outputs MUST follow [Anti-Hallucination Standards](../../../core/anti-hallucination.md).

**關鍵**：所有輸出必須遵循[反幻覺標準](../../../core/anti-hallucination.md)。

### Certainty Labels | 確定性標籤

| Label | Use When | 使用時機 |
|-------|----------|---------|
| `[Confirmed]` | AC already in Given-When-Then format | AC 已是 GWT 格式 |
| `[Inferred]` | AC converted from bullet point format | AC 從條列式轉換 |
| `[Assumption]` | Missing preconditions assumed | 假設缺少的前置條件 |
| `[Unknown]` | Requires human clarification | 需要人類確認 |

## Steps | 步驟

### 1. Parse SPEC File | 解析規格檔案

Read the SDD specification document and locate:

讀取 SDD 規格文件並定位：

- **Acceptance Criteria** section (驗收標準區塊)
- **User Stories** for context (使用者故事作為背景)
- **Functional Requirements** for additional scenarios (功能需求)

### 2. Detect AC Format | 偵測 AC 格式

Identify the format of acceptance criteria:

識別驗收標準的格式：

| Format | Detection Pattern | Action |
|--------|------------------|--------|
| **Given-When-Then** | Contains "Given", "When", "Then" keywords | Direct conversion `[Confirmed]` |
| **Bullet Points** | `- [ ]` or `- ` list items | AI transforms `[Inferred]` |
| **Mixed** | Contains both formats | Process separately |

### 3. Transform Bullet Points to GWT | 將條列式轉換為 GWT

For bullet point AC, apply this transformation:

對於條列式 AC，套用以下轉換：

**Input (Bullet Point)**:
```markdown
- [ ] 使用者可以用 email/密碼登入
```

**Output (Gherkin)**:
```gherkin
Scenario: 使用者可以用 email/密碼登入
  Given 使用者在登入頁面  # [Assumption] 前置條件推斷
  When 使用者輸入 email 和密碼
  Then 登入成功  # [Inferred]
  # [Source: specs/SPEC-AUTH.md:45]
```

### 4. Apply Certainty Labels | 套用確定性標籤

**All transformed scenarios MUST include**:

**所有轉換的場景必須包含**：

1. Source attribution: `# [Source: {file}:{line}]`
2. Certainty labels for each step
3. Comments for assumptions

### 5. Generate Feature File | 生成 Feature 檔案

Create a `.feature` file with:

建立 `.feature` 檔案包含：

```gherkin
# Feature: [Feature Name]
# Source: [SPEC file path]
# Generated: [timestamp]
# ⚠️ Review items marked [Inferred] and [Assumption]

Feature: 使用者認證
  As a user
  I want to log in with email and password
  So that I can access my account

  @automated @confirmed
  Scenario: 成功登入
    Given 使用者在登入頁面
    When 使用者輸入有效的 email 和密碼
    Then 使用者應該看到首頁
    # [Source: specs/SPEC-AUTH.md:42-44] [Confirmed]

  @needs-review @inferred
  Scenario: 登入失敗 - 密碼錯誤
    Given 使用者在登入頁面
    When 使用者輸入正確的 email 但錯誤的密碼
    Then 使用者應該看到錯誤訊息 "密碼錯誤"  # [Assumption] 錯誤訊息內容
    # [Source: specs/SPEC-AUTH.md:48] [Inferred]
```

## Output Format | 輸出格式

### File Naming | 檔案命名

```
Input:  specs/SPEC-AUTH.md
Output: features/auth.feature

Input:  specs/SPEC-CART-001.md
Output: features/cart-001.feature
```

### Feature File Header | Feature 檔案標頭

```gherkin
# ============================================================
# Feature: [Name from SPEC]
# Source: [SPEC file path]
# Generated: [YYYY-MM-DD HH:mm]
#
# Review Status:
#   - [Confirmed]: Ready for automation
#   - [Inferred]: Needs validation
#   - [Assumption]: Requires stakeholder input
# ============================================================
```

## Transformation Rules | 轉換規則

### Rule 1: Action Extraction | 動作提取

Extract the core action from bullet point:

從條列式中提取核心動作：

| Pattern | When | Then |
|---------|------|------|
| "可以..." / "can..." | 執行動作 | 動作成功 |
| "應該..." / "should..." | 觸發條件 | 預期結果 |
| "不能..." / "cannot..." | 嘗試動作 | 動作被阻止 |
| "必須..." / "must..." | 違反條件時 | 強制執行 |

### Rule 2: Given Inference | Given 推斷

When preconditions are not explicit:

當前置條件不明確時：

| Scenario Type | Default Given | Certainty |
|---------------|---------------|-----------|
| Authentication | "在登入頁面" | `[Assumption]` |
| Cart Operations | "有商品在購物車" | `[Assumption]` |
| Form Submission | "在表單頁面" | `[Assumption]` |
| API Calls | "系統已啟動" | `[Assumption]` |

### Rule 3: Tag Assignment | 標籤分配

```gherkin
@confirmed     # AC was already GWT format
@inferred      # AC was transformed from bullet
@assumption    # Contains assumed preconditions
@needs-review  # Requires human validation
@critical      # High priority scenario
```

## Usage Examples | 使用範例

```bash
# Transform a single SPEC file
/reverse-bdd specs/SPEC-AUTH.md

# Transform with output path
/reverse-bdd specs/SPEC-CART.md --output features/shopping/

# Transform all specs in directory
/reverse-bdd specs/

# Review transformed scenarios
/reverse-bdd specs/SPEC-PAYMENT.md --review
```

## Error Handling | 錯誤處理

### No Acceptance Criteria Found

```markdown
⚠️ Warning: No Acceptance Criteria section found in SPEC-XXX.md

Possible reasons:
1. SPEC may use different section naming
2. SPEC may be incomplete

Suggestions:
- Check for "Requirements", "Test Cases", or "Validation" sections
- Use /reverse-spec first to generate complete SPEC
```

### Mixed Format Detection

```markdown
ℹ️ Info: Mixed AC formats detected in SPEC-XXX.md

- Lines 42-48: Given-When-Then format [Confirmed]
- Lines 52-58: Bullet point format [Will transform]

Proceeding with format-specific processing...
```

## Integration | 整合

### Pipeline Integration | 管道整合

```bash
# Complete reverse engineering pipeline
/reverse-spec src/auth/           # → specs/SPEC-AUTH.md
/reverse-bdd specs/SPEC-AUTH.md   # → features/auth.feature
/reverse-tdd features/auth.feature # → Coverage report
```

### With /bdd Command | 與 /bdd 命令整合

After generating feature files:

生成 feature 檔案後：

1. Use `/bdd validate` to check Gherkin syntax
2. Use `/bdd automate` to generate step definitions
3. Use `/bdd review` to conduct Three Amigos session

## Reference | 參考

- Full workflow guide: [bdd-extraction.md](../reverse-engineer/bdd-extraction.md)
- BDD standards: [core/behavior-driven-development.md](../../../core/behavior-driven-development.md)
- Anti-hallucination: [core/anti-hallucination.md](../../../core/anti-hallucination.md)
- Gherkin syntax: [bdd-assistant/gherkin-guide.md](../bdd-assistant/gherkin-guide.md)
