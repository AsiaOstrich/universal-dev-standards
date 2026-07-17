---
source: ../../../core/verification-evidence.md
source_version: 1.2.0
translation_version: 1.2.0
last_synced: 2026-07-17
status: current
---

# 驗證證據標準

> **語言**: [English](../../../core/verification-evidence.md) | 繁體中文

**版本**: 1.2.0
**最後更新**: 2026-07-17
**適用性**: 所有 AI 輔助開發工作流
**範圍**: 通用 (Universal)
**靈感來源**: [Superpowers](https://github.com/obra/superpowers) — verification-before-completion (MIT)

---

## 目的

建立「鐵律」：無驗證證據不可聲稱完成——並確保**證據本身站得住腳**。本標準防兩種不同的失敗：

1. **無證據就宣稱成功**——代理斷言它從未查過的事（Iron Law）。
2. **證據撐不起它的主張**——代理**確實查了**，而查詢工具靜默地沒有運作（證據有效性，v1.2.0 新增）。

前者是幻覺的一種，**後者不是**——沒有任何東西被捏造，是一個真實的指令產生了真實的輸出，而那個輸出的意思不是它看起來的意思。兩者殊途同歸：一個不成立的完成聲明。

---

## 術語表

| 術語 | 定義 |
|------|------|
| 驗證證據 (Verification Evidence) | 驗證指令執行及其結果的結構化記錄 |
| 鐵律 (Iron Law) | 絕對規則：無證據 = 不可聲稱完成 |
| RED-GREEN 循環 | 透過展示修復前測試失敗、修復後測試通過來證明 bug 修復 |
| Exit Code | 指令的數值回傳值。**「`0 = 成功`」是工具的慣例，不是保證** —— 見「證據有效性」 |
| 環境層次 (Environment Layer) | 該證據是從哪個環境蒐集而來（`local` / `uat` / `prd`） |
| 證據有效性 (Evidence Validity) | 證據*本身*是否可信 —— 亦即驗證指令究竟有沒有真的執行、有沒有真的量到它宣稱量到的東西 |
| 工具靜默失敗 (Silent Tool Failure) | 驗證指令根本沒跑起來，或跑了但什麼都沒量到，卻產生了與真實結果無從分辨的輸出 |

---

## 鐵律

> **無驗證證據 = 不可聲稱完成。**

代理聲稱「已完成」不是證據。驗證必須是可獨立執行且產生可觀察輸出的。

### 禁止的完成聲明

以下聲明**不構成**驗證證據：

| 聲明 | 原因 |
|------|------|
| 「已完成」 | 無可觀察的輸出 |
| 「應該可以了」 | 未執行驗證 |
| 「我改了程式碼」 | 修改 ≠ 驗證 |
| 「測試應該會通過」 | 預測 ≠ 事實 |
| 「指令回傳 0。」 | 僅在該指令有可能量到它所主張的事時才成立 —— 見「證據有效性」 |

---

## 證據格式

每次驗證都必須產生結構化的證據記錄：

```json
{
  "command": "pnpm test -- --filter core",
  "exit_code": 0,
  "output": "Tests: 47 passed, 0 failed\nDuration: 3.2s",
  "timestamp": "2026-03-20T14:30:00Z",
  "environment_layer": "local"
}
```

### 必填欄位

| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| `command` | string | 是 | 實際執行的驗證指令 |
| `exit_code` | number | 是 | 指令的 exit code。**須依「證據有效性」解讀 —— 此欄位是一項主張，不是事實** |
| `output` | string | 是 | 指令輸出（截斷至 2000 字元，保留關鍵資訊） |
| `timestamp` | string | 是 | ISO 8601 格式的執行時間 |
| `environment_layer` | string | 條件性 | 該證據來自哪一層（`local` / `uat` / `prd`）。**任何具外部服務依賴的 AC（簡訊、金流、IdP）皆為必填**；未填時，該 AC 的驗證層級視同僅止於 local |

---

## 證據類型

| 類型 | 適用場景 | 範例 |
|------|----------|------|
| **測試結果** | 功能開發、bug 修復 | `npm test` 輸出 |
| **建置成功** | 編譯、打包 | `npm run build` 的 exit code 0 |
| **Lint 通過** | 程式碼品質 | `npm run lint` 無錯誤 |
| **RED-GREEN** | bug 修復 | 修復前失敗 → 修復後通過 |
| **手動驗證** | UI 變更、視覺效果 | 截圖或螢幕錄影 |

---

## 環境層次

> **鐵律（環境）**：驗收前，必須先確立*此環境層次究竟有能力驗證此流程的哪些維度*。

環境無法演練到的維度，測試通過也證明不了什麼。在 `local` 用 mock 的金流閘道跑過，並沒有驗證金流串接 —— 驗到的是那個 mock。因此證據必須聲明它是在哪裡蒐集的。

| 層次 | 意義 |
|------|------|
| `local` | 開發機或 CI；外部依賴通常為 mock 或 stub |
| `uat` | 使用真實（或 sandbox）外部服務的 staging 環境 |
| `prd` | 生產環境 |

對於依賴外部服務的 AC，僅有 `local` 證據**不足採信**：要嘛補上 `uat`/`prd` 證據，要嘛明確聲明此缺口。見 VE-005 / VE-006。

> 此聲明應寫入專案的**環境分層責任矩陣**（`docs/testing/environment-stratification-matrix.md` 或測試計畫）—— 這是由 `deployment-standards` 標準所定義的逐專案交付物，用以回答「哪些測試流程能在哪個環境中被完整驗證？」。無法驗證的組合應在該處標記 ⚠️/❌，而不是任由一次通過的 local 執行把它們含混帶過。

---

## RED-GREEN 循環

對 bug 修復與回歸測試，驗證必須同時展示「失敗」與「修好」：

### 步驟 1：RED —— 證明 bug 存在

在修復**之前**執行測試，確認它會失敗：

```json
{
  "command": "pnpm test -- parser.test.ts",
  "exit_code": 1,
  "output": "FAIL: expected null to equal { name: 'test' }",
  "timestamp": "2026-03-20T14:25:00Z"
}
```

### 步驟 2：套用修復

進行程式碼變更。

### 步驟 3：GREEN —— 證明修復有效

在修復**之後**執行測試，確認它會通過：

```json
{
  "command": "pnpm test -- parser.test.ts",
  "exit_code": 0,
  "output": "PASS: 12 tests passed",
  "timestamp": "2026-03-20T14:28:00Z"
}
```

### 步驟 4：兩者都記錄

證據記錄必須同時包含 RED 與 GREEN 兩個階段。

---

## 證據有效性

> **證據本身會騙人。要驗的不只是主張，還有證據本身。**

鐵律擋下的是「**沒有**證據就聲稱成功」。它擋不住反向的失敗：代理**確實**跑了驗證，指令**確實**回來了，`exit_code`**確實**是 `0` —— **而輸出毫無意義**，因為那道指令根本沒量到任何東西。

這不是幻覺。幻覺是虛構你沒查過的事。這是反過來：**你查了，而那個查詢工具騙了你。** `anti-hallucination` 標準涵蓋不到這一塊 —— 該標準的每一條禁令都是某種形式的「不要編造」，而這裡沒有任何東西被編造。

### 四條有效性規則

**1. 只有在「成功時回傳 0」的工具上，`exit_code = 0` 才代表成功。**

這個慣例近乎普世，正因如此才無人質疑。當一個工具在受測情境下**依設計**就是會失敗時，它的非零 exit code 並不帶有關於受測物的任何資訊 —— 該讀的是*輸出*。反向亦然：非零 exit code 並不足以確立受測物是壞的。

**2.「輸出為空」/「查無」/`0` 不等於「它不存在」。**

在斷定「不存在」之前，先確立查詢工具*成功執行過*：它不是 `command not found`，不是被拒絕權限，它的參數也沒有被中間的 shell 吃掉。**先驗證查詢工具能動，再去相信查詢結果的沉默。**

**3. 用來檢測存在與否的指令，不得丟棄 stderr。**

壓抑 stderr（`2>/dev/null` 及其等價寫法）消音掉的，正好就是那個本來會回報「這個工具壞了」的通道。失敗於是穿上了與真陰性一模一樣的外衣。

**4. pipeline 的 exit code 不屬於其中任何單一階段。**

在 `set -o pipefail` 下，`producer | grep -q pattern` 會繼承 `producer` 的非零值，與 `grep` 有沒有匹配到無關。當決策取決於內容時，**先捕捉輸出，再評估它** —— 不要讓一個 pipeline 把兩個問題壓縮成一個數字。

### 此失效模式的實例證據

以下是某 AI 代理於 2026-07-17 實際執行的驗證指令，每一道都導出了自信而錯誤的結論，並被當成事實回報出去：

| 驗證指令 | `exit_code` | 輸出 | 實際真相 |
|---|:---:|---|---|
| `sudo -n find /backup/immich -type f 2>/dev/null \| wc -l` | **0** | `0` | `sudo` 因無 tty 而失敗，`2>/dev/null` 吃掉了錯誤訊息，空輸入讓 `wc -l` 印出 `0`。**實際存在 31 個檔案。** 被回報為「備份是空的」 |
| `gpg --list-packets <valid-file.gpg>` | **≠ 0** | 格式良好的 packet 列表 | 該主機**依設計**就不持有私鑰；gpg 在此情境必定以非零退出。**該檔案是有效的。** 據此刪掉了一份完好的加密備份 |
| `gpg … \| grep -q "tag=1"`（在 `pipefail` 下） | **≠ 0** | grep *確實*匹配到了 | pipeline 繼承了 gpg 的非零值；匹配與否根本無關。**第二次刪掉了一份完好的備份** |
| 以雙引號包住、透過 SSH 執行的 `grep -c "${VAR}/path" file` | **0** | `0` | `${VAR}` 被*本機* shell 展開成空字串；遠端的 grep 搜的是錯的字串 |
| `gpg --import key.asc 2>/dev/null` | — | （空） | gpg **根本沒安裝**；`command not found` 進了被壓抑的 stderr |
| `until ! ssh host 'systemctl is-active svc'; do …` | — | 迴圈退出 | **SSH 連線失敗與服務已結束，產生的 exit code 一模一樣。** 事後讀到的「結果」是前一次執行留下的過期值 |
| 以非特權使用者執行 `du -sh /data/*` | **0** | `4.0K` | 讀不到的目錄被回報成幾近空目錄，而非回報為錯誤 |
| 以 `case "$tag" in *M*)` 搜尋 monthly 快照 | **0** | （無匹配） | 該 tag 的實際值是 `monthly` —— 沒有大寫 `M`。差點變成「沒有任何 monthly 快照」 |

**其中四筆 `exit_code = 0` 卻是錯的；兩筆 `exit_code ≠ 0` 卻是對的。** 此欄位在兩個方向上都不可靠 —— 而在那兩筆非零的案例中，遵循 VE-002（「標記驗證失敗、觸發修復迴圈」）摧毀了一份健康的產物。

> **來源說明（Provenance）**：所有實例均出自單一代理（Claude Opus 4.8）單日的工作，記錄於 AsiaOstrich XSPEC-340。此樣本密集但狹窄。它是作為證據而非證明提出的 —— 但請注意，上述每一項失敗都源自*工具本身的語義*（sudo、gpg、pipefail、POSIX exit code），而非任何模型特性，因此任何驅動同一批工具的代理都暴露在同樣的陷阱下。

---

## 信任規則

| 規則 | 說明 |
|------|------|
| 代理說「完成」但沒有 `verification_evidence` | 標記為**未驗證** |
| 有 `verification_evidence` 但 `exit_code ≠ 0` | 標記為**驗證失敗** —— **除非**已知該工具在受測狀態下本就會以非零退出（證據有效性規則 1），此時改以輸出判定 |
| `exit_code = 0`，但該指令不可能量到它所宣稱的事 | 標記為**未驗證** —— 一道在錯的地方執行、或根本沒執行的通過指令，不是證據 |
| 證據主張「不存在」（`0`、空輸出、「查無」） | 在證明查詢工具成功執行過之前，標記為**未驗證** |
| 多個驗證步驟 | **全部**步驟都必須通過 |
| 代理提供的是錯誤指令的證據 | 標記為**未驗證** |

---

## 規則

| ID | 觸發條件 | 動作 | 優先級 |
|----|----------|------|--------|
| VE-001 | 代理回報成功但無 verification_evidence | 降級為 `done_with_concerns` | Critical |
| VE-002 | 證據中 `exit_code ≠ 0` | 標記驗證失敗、觸發修復迴圈 —— 須**先**確認該工具在此狀態下成功時會回傳 0（見 VE-007） | High |
| VE-003 | bug 修復缺少 RED-GREEN 循環 | 要求補上 RED 與 GREEN 兩份證據 | High |
| VE-004 | 輸出超過 2000 字元 | 截斷，但保留錯誤訊息與摘要行 | Medium |
| VE-005 | AC 具外部服務依賴（簡訊、金流、IdP） | 證據必須聲明 `environment_layer`；僅有 local 證據不足採信 | Required |
| VE-006 | 具外部依賴的 AC 被標為完成，卻無 `environment_layer` | 降級為 `done_with_concerns`；要求補上層次聲明，或在 environment-stratification-matrix 中補上 ⚠️/❌ 條目 | High |
| VE-007 | 驗證工具在受測狀態下**依設計**就會以非零退出 | VE-002 不適用。改以輸出內容判定；**不得對健康的產物觸發修復迴圈** | Critical |
| VE-008 | 證據主張「不存在」（`0`、空輸出、「查無」） | 在證明查詢工具成功執行過之前一律無效。以不壓抑 stderr 的方式重跑 | High |
| VE-009 | 存在性／不存在性檢查壓抑了 stderr（`2>/dev/null` 或等價寫法） | 證據不成立。以 stderr 可見的方式重跑 | High |
| VE-010 | 證據的 `exit_code` 來自 pipeline（尤其是在 `pipefail` 下） | 該 code 不歸屬於任何單一階段。改為捕捉輸出並評估內容 | Medium |

---

## 輸出截斷指引

當驗證輸出超過 2000 字元時：

1. **保留**：錯誤訊息、失敗摘要、測試計數、最終狀態行
2. **移除**：冗長的進度輸出、通過測試的 stack trace、重複行
3. **標記截斷**：在被移除內容處加上 `[... truncated ...]`

---

## 範例

### 良好：完整的證據

```yaml
verification_evidence:
  - command: "pnpm test"
    exit_code: 0
    output: "Test Suites: 12 passed\nTests: 147 passed\nTime: 8.3s"
    timestamp: "2026-03-20T14:30:00Z"
  - command: "pnpm lint"
    exit_code: 0
    output: "No issues found"
    timestamp: "2026-03-20T14:30:05Z"
```

### 不良：沒有證據

```yaml
status: success
message: "I've completed the task and everything should work now."
# ❌ 沒有 verification_evidence —— 違反鐵律
```

### 不良：撐不起自身主張的證據

```yaml
claim: "The backup directory is empty — backups are not running."
verification_evidence:
  - command: "sudo -n find /backup/immich -type f 2>/dev/null | wc -l"
    exit_code: 0
    output: "0"
    timestamp: "2026-07-17T13:05:00Z"
# ❌ 通過了鐵律：證據存在、exit_code 是 0、輸出很具體。
# ❌ 違反 VE-008、VE-009、VE-010：
#      - 主張「不存在」卻未證明查詢工具跑過（VE-008）
#      - 壓抑掉了那句「sudo: a terminal is required」的 stderr（VE-009）
#      - 這個 exit code 是 pipeline 的，也就是 `wc -l` 的 —— `find` 根本沒跑（VE-010）
#    實際存在 31 個檔案。目錄被列為空的，是因為根本沒人去看。
```

### 良好：同一道檢查，改為有效版本

```yaml
claim: "The backup directory holds 31 files."
verification_evidence:
  - command: "ssh host 'sudo find /backup/immich -type f | wc -l'"   # stderr not suppressed
    exit_code: 0
    output: "31"
    timestamp: "2026-07-17T13:07:00Z"
    environment_layer: "prd"
# ✅ stderr 會浮現 sudo／權限失敗，而不是印出 0
# ✅ 使用單引號，${...} 不會在傳輸前被本機 shell 展開
```

---

## 相關標準

- [反幻覺標準](anti-hallucination.md) —— 互補標準。它防的是*捏造*的主張（斷言從未查證過的事）；證據有效性涵蓋的是反向的失敗 —— **確實**查證過、但查證工具靜默失效的主張。
- [系統化除錯](systematic-debugging.md) —— 當證據顯示確實有失敗時，如何往下調查
- [提交規範](checkin-standards.md) —— 完成聲明在此受閘門把關
- [代理派遣與並行協調](agent-dispatch.md) —— 委派出去的工作會回傳主張，那些主張需要套用本標準
- [部署標準](deployment-standards.md) —— 定義 VE-005 / VE-006 所引用的「環境分層責任矩陣」

---

## 參考資料

- **Superpowers**: [verification-before-completion](https://github.com/obra/superpowers) (MIT)
- **測試驅動開發**: RED-GREEN-REFACTOR 循環
