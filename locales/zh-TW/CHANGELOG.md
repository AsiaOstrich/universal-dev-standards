---
source: ../../CHANGELOG.md
source_version: 6.7.0
translation_version: 6.7.0
last_synced: 2026-08-17
status: current
---

# 變更日誌

> **語言**: [English](../../CHANGELOG.md) | 繁體中文 | [简体中文](../zh-CN/CHANGELOG.md)

本專案的所有重要變更都將記錄在此檔案中。

格式基於 [Keep a Changelog](https://keepachangelog.com/)，
並遵循[語義化版本](https://semver.org/)。

## [Unreleased]

## [6.7.0] - 2026-08-17

### 修正

- **skill 觸發面在三層全數復原——55 個 skill × 英文、zh-TW、zh-CN。** 一個 skill 的 `description` 是模型決定要不要叫用它時**唯一看得到的東西**。commit `d415937e`（2026-02-10）把其中 17 個改寫成 `[UDS] <標籤>`，刪掉 `Use when:` 與 `Keywords:` 兩行、**連中文關鍵字一起**；相鄰 commit 的標題寫著 `token optimization`。當時**只有 token 可數**——沒有任何東西在量觸發面，於是那個取捨看起來是單邊的，而它不是。2026-08-14 量測：55 個含 `SKILL.md` 的 skill 中，**27 個有觸發條件、27 個有關鍵字、0 個有排除條件、28 個兩者皆無**——而那 28 個正是方法論核心：tdd、bdd、atdd、spec-driven-dev、code-review、commit-standards、checkin、requirement。
  - **英文來源**：28 個復原，且**全部 55 個補上排除條件**（`Not for:`）。只加觸發不加排除，換來的是過度觸發；而一個不該響卻響的 skill 會被整個關掉，**連帶拖走還能用的那些**。15 個可從 git 歷史救回者中**有 8 個被重寫**，因為歷史文字已不描述現行行為——其中六個宣稱自己會引導某套生命週期，而那已於 XSPEC-095 移交採用層。**救回一個過期的描述，比不救更糟。**
  - **語系層**：zh-TW 與 zh-CN **各 55/55，是翻譯不是轉碼**。**這一半才是重點**——以 `--locale zh-tw` 安裝的專案，在英文來源已修好時仍拿到被剝過的描述，這個修正本來到不了它要給的那個讀者。繁體與簡體各自用道地用詞，另修正三份 zh-CN 描述中混入的繁體字。
  - **翻譯 drift 62 → 38**，剩下的 38 是刻意的停點：24 份漂移完全來自本次 description 編輯者更新了 hash，12 份本文早已漂移者保留過期 hash——更新它們等於宣稱整份檔案已同步，而那件事沒有人驗證過。
  - ⚠️ **28 個中有 10 個帶著 `disable-model-invocation: true`**，由同一個 `d415937e` 加入。對那 10 個而言，補描述**並不會**讓它們變成可被選中——擋住的是那個旗標，而要不要拿掉它是**設計決定不是缺陷**。模型真正選得到的數量是 **45，不是 55**。

### 新增

- **`ai-response-navigation` 1.2.0 → 1.3.0 —— 選用規則 R10 與 R11。** 它們的來源與 R7–R9 不同：使用者在同一次工作階段中**兩度**指出，一個正確且完整的回答讀不懂，而當時 R7–R9 已經出貨且正在被遵守。**先講發現並不足夠。**
  - **R10 —— 白話是主詞，識別字是佐證。** *觸發*：任何向人解釋一個情況、一個缺陷、或一個系統行為的回應。用讀者會用的話說清楚發生了什麼；路徑、符號、行號、指令輸出、版本字串屬於它們所支持的那句話**之後**，而不是那句話本身。它**不是**可以省略它們的許可——想驗證的讀者必須驗得了。**與 R7 分開是刻意的**：R7 管的是「先發現後證據」的順序，而一個回應可以先講發現、卻仍用只有作者持有的詞彙講它。兩者都讓讀者無法行動，但它們是不同的失效。
  - **R11 —— 每個選項都要帶自己的優劣。** *觸發*：要求讀者在兩個以上做法之間選擇的回應。規則 2 已要求標示推薦項並給出**它的**理由；R11 要求**每一個**選項都說明它換到什麼、代價是什麼。一份只有推薦項被論證的清單，等於**把比較的工作丟回給讀者**——而那正是他請你做的事；而沒標代價的選項讀起來像是沒有代價。**優劣不是模稜兩可**：「稍微難一點」不是代價，「重寫 110 個檔且翻譯需要人審」才是。空白的代價欄讀起來是「沒有分析過」，而讀者分不出這兩者。

## [6.6.0] - 2026-08-17

### 新增

- **`spec-driven-development` 2.3.0 → 2.4.0 —— 沒有驗證項的 AC 不是 AC。** 每一條驗收標準都必須有一個**指向它的驗證項**——測試、檢查、閘門，或一則明確記錄的手動步驟。沒有任何驗證項引用的 AC 是一張沒有人兌現的支票，而且它**不會**大聲失敗：它只是安靜地停止成立，而規格繼續宣稱它為真。**規則**：這樣的 AC 必須**降級為設計意圖**，不得繼續掛在 AC 欄——降級是誠實的，未經驗證的 AC 不是。標準同時寫明什麼**不算**驗證項：「審查者會注意到」不是驗證項，因為審查者讀的是規格，而規格說那條 AC 成立。新增規則 `SDD-AC-VERIFIED`。
  - **實測案例**：一份 2026-05-14 的規格寫著 `AC-7：舊版系統報告完整保留（無回歸）`。它的 Test Plan 有七項，**沒有一項指向 AC-7**。該報告的 timer 是 disabled、部署函式從未被呼叫——**從那條 AC 被寫下的同一天起**。三個月後在驗證一件無關的安裝時偶然撞到。它不是接上了檢查後來鬆脫，**它從來沒有被接上過**。

- **`ai-response-navigation` 1.1.0 → 1.2.0 —— 選用規則 R7–R9，管答案本身**（XSPEC 借鑒 B-10，來源 [`ayghri/i-have-adhd`](https://github.com/ayghri/i-have-adhd)，MIT）。規則 1–6 管的是答案**之後**要附什麼：導航區塊、標記過的推薦、匹配回應類型的模板。**答案本身沒有任何規則在管。** 於是一個回應可以把結論埋在一整面證據底下，只要結尾附上正確的導航區塊，它仍然滿足**本標準的每一條**——而找不到答案的讀者，不會因為被告知下一步而得到幫助。
  - **R7 —— 先講發現，不要先講過程。** *觸發*：回答問題、回報調查結果、或提出決策的回應。第一行寫**查到了什麼**或**該做什麼**——不是方法、不是把問題複述一遍、不是回答的計畫。證據（`file:line`、指令輸出、表格、量測數字）是**佐證**，應放在它所支持的主張之後；以證據開場會迫使讀者自行重建結論，而那正是他請你做的工作。本條規範的是**順序**，**不**代表可以省略證據。
  - **R8 —— 每一輪重述進度。** *觸發*：跨 3 輪以上的對話，或含 3 個以上步驟的任務。用一行說明工作進行到哪裡。不能假設讀者能在訊息之間記住「我們在 5 步中的第 3 步」，而重述它的成本是一個句子。與模板 4（進行中）互補：**R8 管開頭，模板管結尾。**
  - **R9 —— 不要開場白。** *觸發*：任何實質性回應。本條把一項既有禁令一般化：[`anti-sycophancy-prompting`](../../core/anti-sycophancy-prompting.md) 已經禁止「以正面肯定開場批評」，但**僅限批評情境**。R9 把同一項禁令擴及每一個實質回應，理由不同——不是為了防拍馬屁，而是為了消除它在讀者與答案之間製造的延遲。**R9 不適用於結語**；R1 的導航區塊要求依然成立。
  - **來源十條只取三條，其餘七條的淘汰理由寫進標準本文**，不是只寫在待辦清單裡。兩條與 R1–R2 重複。三條與本標準或其他標準衝突：它的「不要 recap／不要結語」**與 R1 的導航區塊直接矛盾**；它的「清單上限 5 項」會切斷證據表格與走訪分母；它的「具體時間估計」已由 [`estimation-standards`](../../core/estimation-standards.md) 涵蓋。
  - **選用的語義同 R6**（模型級別標注）：採用者不必啟用、既有 skill 不需回頭補，專案**可以**在自己的設定中把任一條提升為必須。**不可選的是每一條都帶有精確的觸發條件**——一條鬆到永遠不會啟動的規則，與沒有這條規則無從分辨，那正是 XSPEC-378 記錄的失效模式。
  - **擴充既有標準而非新建一支**：再開一支管「AI 怎麼對人類寫回答」的標準，會讓同一條軸出現兩個實作。

## [6.5.0] - 2026-08-14

### 新增

- **四份既有標準的五條補強，借鑒自 `AmazingAng/old-coder`**（XSPEC 借鑒 B-01）。**未新增任何標準**，每一條都是既有標準內部的條文。同一來源另有兩項主張被**駁回**，因為我方版本更嚴——`verification-evidence` 早已有四條證據有效性規則配八個實例對照表，而 `class-level-fix` 早已要求負向控制**逐子集**執行並**指名**違規成員，來源沒有這一條。
  - **`verification-evidence` 1.2.0 → 1.3.0 —— VE-011，證據新鮮度。** 證據紀錄裡的每一個數字，必須來自**它所驗證的產物最後一次編輯之後的單一次新鮮執行**；中途執行的結果是 stale，不得列入。VE-001 到 VE-010 管的都是結果**怎麼被解讀**，沒有一條管**它何時被產生**。它關掉的失效是：測試全綠 → 之後才改提示詞或設定 → 提交，而通過的那一套是最後一次變更**之前**的；抓到它的守衛正好是釘內容雜湊的那一種，而型別檢查與 lint 從不驚動它。
  - **`test-governance` 1.1.0 → 1.2.0 —— 門檻閘必須 fail-closed。** 一個印出百分比卻不論有沒有達標都 exit `0` 的量測層是報告，不是閘門：它會在數字一路下滑時保持綠燈，而沒有東西擋下一次合併。強制必須來自工具自己的旗標（`--cov-fail-under`、`diff-cover --fail-under`、`nyc --check-coverage`），而不是事後重新解析輸出的包裝腳本。放在這份標準而非 `verification-evidence`，是因為這份管的是**檢查怎麼被建造**，那份管的是 exit code 產生**之後怎麼被解讀**；兩者現有交叉引用。
  - **`mutation-testing` 1.0.0 → 1.1.0 —— kill 歸因、單邊不變式、equivalent mutant。** `Killed` 的意思是**某一個**測試失敗了；工具不記錄是哪一個，也沒有任何工具記錄是哪一**層**。所以 7/7 驗證的是跑過的**整套**，不是其中的 property 套件——要主張「property 驗證了 X」，必須單獨對 property 套件重跑 mutants。單邊不變式（「永不超過上限」）**結構上抓不到** fail-closed 的 mutant，因為全部拒絕永遠不會產生超限輸出；每個單邊性質現在都需要它的相反邊界。而存活的 mutant 不自動等於缺口——語意等價者必須附理由分類，而不是用一個只為了讓數字好看的斷言去殺它。
  - **`class-level-fix` 1.0.0 → 1.1.0 —— 一次通過的負向控制不證明什麼。** 通過一次，證明的是**一個**已知壞案例能到達檢查器的失敗路徑。它**不證明**該檢查器認得它所宣稱守護的規則的**每一種**違反。一道 grep 閘可以 fail-closed 得很完美，卻守著一個拼字而不是一個行為：那個合成成員證明的是線路接通了，不是那張網夠寬。
  - **VE-012 / CLF-008 —— 窄閘門必須登記，不是只要揭露。** 當一道檢查的實際涵蓋面窄於它所服務的規則，說出來是必要而不充分：**光是揭露不滿足本規則**，因為寫「本檢查不涵蓋全部」遠比擴大涵蓋面便宜，於是每道窄閘門都會長出一段誠實的文字然後維持窄。該缺口必須在例外清冊裡有一筆帶複查日期的登記。**這正是本 repo 反覆的失效**——一次雜湊掃描 115 份進去 2 份出來、一個參考檢查器整個略過一個出貨目錄、一道索引閘門只對日期戳發作——每一次都是閘門窄於規則而沒有東西說出來。

### 變更

- **`model-selection` 1.0.1 → 2.1.0 —— 一個軸變成兩個**（XSPEC-362）。原標準以**一個任務改動幾個檔案**決定模型層級。三個檔案的模組邊界重新設計比八個檔案的機械改名難，所以那個訊號**朝固定方向**錯分了「深而窄」的工作——是偏誤，不是雜訊。它活下來是因為便宜好量，不是因為它預測得準。改為兩個準則：**推理天花板需求**（有沒有一個成分是再多思考時間也解不掉的？）與**規格明確度**，且後者明確是**雙向**的——把模稜兩可的任務交給照字面執行的模型，得到的是「精確地執行了錯的那句話」，而把寫死的步驟清單餵給高天花板模型會**降低**輸出品質。層級 id（`fast` / `standard` / `capable`）不變，只有準則換了。
  - **新增 effort 軸，與模型軸正交。** 思考深度現在是**單次派工的參數**，不是模型的屬性：廠商中立的 `low` / `medium` / `high` / `very-high` / `max`，由各平台在本地對映。標準明白寫出哪種失敗配哪種處置——輸出淺但無誤是**深度不足**（同一模型提高 effort），在 max effort 下輸出**種類**就錯了是**天花板不足**（升層級）——並寫明兩者不可互換。**沒有把 effort 用盡就升層級，是對「短缺的是哪一個軸」下了一個未經測試的假設。**
  - **新增反向排除章節。** 舊標準只說什麼工作該**升**到哪一層，從不說什麼不該**送**進哪一層。**硬邊界**（context 容量、effort 參數支援、模態）是能力的缺席而非程度較低，必須在**成本比較之前**排除——事後排除會讓一個較便宜但做不到的模型在價格上勝出。**反向風險**：高能力層可能透過安全分類器拒絕規格敏感的工作，而**該拒絕不是錯誤**——它以帶著拒絕標記的正常回應抵達。對一個只看 exit code 或只看有沒有拋例外的呼叫端，那是**靜默失敗**：管線記錄成功，而工作從未被做。呼叫端現在必須檢查該標記。
  - **`capability_dimensions` 子維度拆成 `declared` 與 `measured`。** 一個 1–5 分同時扛著兩件不同的事實：*它到底能不能做*（二元、廠商宣告、連線時免費取得）與*做得多好*（連續、需要 benchmark）。合在一起，便宜的事實與昂貴的事實變得無從分辨。`declared: false` 現在是硬邊界；`declared: true` 而 `measured` 缺席即 `UNKNOWN`。禁止從分數推導 `supported`，且**失敗的量測不得記為分數**——包含 `0`，它不在 1–5 的量尺上，而且它會讓「我們量不到」看起來與「我們量了而它很差」一模一樣。
  - **`routing_rules` 從三態擴為四態。** `UNSUPPORTED` 原本意指「分數 ≤ 1 **或未註冊**」，把「量過且不可靠」與「從未量過」塌縮在一起。後果是新偵測到的模型在第一次評估就被排除、且永不再進入候選池——與「支援更多模型」的目的正好相反。`UNKNOWN` 現在是獨立狀態並**排入校準佇列**，且兩者必須在**回傳結構中**可分辨，而不只是在 log 裡：呼叫端得分出「這個模型做不到」與「我還不知道」，因為它們導向不同的下一步。
  - **重新量測現有三個獨立觸發**：版本識別字變更、`measured.at` 超過 90 天、以及降級偵測告警（DEC-033）。版本變更是**充分**條件而非必要條件——DEC-033 存在的理由正是行為會在版本字串不變的情況下改變，所以一個只綁版本變更的實作，會漏掉它當初被建造要抓的整個情境。
  - **移除章節版本**（R6a）。該檔同時帶著一個全檔版本 `1.0.1` **與**一個標記 `2.0.0` 的章節，而沒有任何規則說明 `.ai.yaml` 的 `meta.version` 追蹤的是哪一個——於是「版本有同步」不是一個可檢查的主張。現在只有一個版本欄位，而「`.ai.yaml` 追蹤它」這條規則寫在標準裡。2026-04-13 新增的能力管理章節——**它從來沒有被寫進版本歷史**——現已補記。

### 新增（XSPEC-362 續）

- **`check-model-pin-freshness` —— 給 `capability_registry` 一個時鐘**（XSPEC-362 R4）。DEC-031 D1 要求 `pin_date` 被**記錄**；從來沒有東西要求它被**讀取**。出貨的範例躺在**超過自己 90 天門檻整整 120 天**的位置，而在頁面上，一筆過期條目與一筆有效條目無從分辨。這道檢查回報兩種腐壞：超過門檻的日期，以及**出貨範例裡的具體廠商模型 ID**——一個被寫進標準的模型 ID 是一則帶到期日而無人認領的引用，所以範例改用佔位符。它是 **WARN 永不 BLOCK**（依 XSPEC-361 R8 對檔內不變式實測的偽陽性率）；只有掃描未完成才非零離開，因為「檢查器壞了」與「檢查器沒找到東西」不可以產生相同的輸出。它**走訪**出貨樹而非讀一份手打清單，並印出分母與排除數。`--self-test` 對已知判定的 fixture 跑兩個判準，因為一個掃了 366 個檔案卻什麼都沒報的檢查器，看起來與一個判準從不觸發的檢查器一模一樣。已接進 `pre-release-check.sh` 第 18.8 步。
- **`model-selection` 的 Claude Code 宿主層對映**（XSPEC-362 R5）：`integrations/claude-code/model-selection-mapping.md` 與其機器可讀孿生檔、四份參考 subagent 定義、以及一份跨 repo 派工模板。標準**依規則**廠商中立——它定義 `fast` / `standard` / `capable` 與 `low` … `max` 為標籤，並聲明它無法說某個模型接受哪些 effort 等級，那些格子標 `?`。這個目錄為單一宿主回答它們，且是本 repo **唯一**該出現具體模型識別字的地方。`core/` 未變動，仍帶**零**個具體模型 ID。
  - **這份對映存在，是因為名字對不上。** UDS 的 `very-high` 在 Claude Code 裡叫 `xhigh` —— 唯一被改名的等級。標準不為了遷就工具而彎折；改名在宿主層被吸收，那正是 R5 的用途。
  - **`fast` 層在這個宿主上沒有 effort 軸**，因為它的模型根本不接受任何 effort 等級。那是一條硬邊界，且對標準自己的規則有後果：**MS-005**（「同一模型提高 effort」）**在那裡無法執行**，而改用 MS-001 並不違反順序規則——該層的 effort 集合從一開始就是空的。
  - **硬邊界登記為 `declared` 而非分數**（依 R7b），而 `measured` 全程缺席因為沒有跑過 benchmark ——記為 `UNKNOWN`，絕不以預設值填充。登記表另外點名兩條在 agent 檔案裡看不見的邊界：同一個別名在不同 provider 解析到不同模型（在某些上面 `effort` 是靜默失效的），以及背景 subagent —— v2.1.198 起的預設 —— 會靜默失去固定集合以外的內建工具，且不回報任何錯誤。
  - **R3b 是引述廠商，不是斷言。** 宿主自己的文件說它最高能力的模型在安全分類器觸發時會自動 fallback，且要從它得到好輸出的方法是「描述結果，不要描述步驟」—— 分別是 R3b 第 1 點與第 2 點，由對方說出口。
  - **派工模板的理由是量出來的，而且它更正了本 repo 正在出貨的一項主張。** `agent-dispatch.ai.yaml` 說 subagent 不載入目標專案的指令、也不能叫用它的技能。**兩半都是假的**：subagent 會載入 CLAUDE.md 階層，也能叫用技能。真正的限制更窄也更容易錯過——**它們載入的是主 session 工作目錄的階層，不是它們被派去工作的那個 repo 的**。2026-08-12 實測：派一個被拒絕工具權限的 subagent，在它獲准跑 `pwd` 之前先問它 context 裡有哪些 CLAUDE.md——正好兩份，兩份都不是目標的。同 repo 派工不需要模板；跨 repo 派工沒有別的規則來源。該註記已就地更正，附上量測，並明確警告不要在讀完廠商文件後把這個機制刪掉。
  - **`check-model-pin-freshness` 現在也走訪 `integrations/`。** 它的 `VENDOR` 判準在那裡被抑制——具體 ID 在宿主對映裡是**必需**的形式——而 `STALE` 仍然適用，那正是掃描該樹的全部理由：「模型 ID 是一則帶到期日而無人認領的引用」這個論證，不會因為那個 ID 搬到了正當的家就不成立。被抑制的命中計入 `skipped` 而非丟棄，讓那條豁免留在分母裡；且 `--self-test` 在**兩個方向**都增加了案例——一條只朝它抑制的方向測過的抑制規則，與一條把所有東西都吞掉的抑制規則無從分辨。
- **`agent-dispatch` 機器可讀標準復位**（XSPEC-362 R5a）：`ai/standards/agent-dispatch.ai.yaml`、自採用複本、以及 registry ＋ manifest 條目。`core/agent-dispatch.md` 在 npm bundle 裡持續出貨，但 `.ai.yaml` 在 6.0.0（XSPEC-086 Phase 2 / DEC-049）被移除，前提是 `dev-autopilot` 擁有正規的機器可讀副本。**那個擁有者在 2026-04-28 進入維護模式**——就在遷移落地的隔天——而移除在兩個月後照樣執行。以 `--format ai` 安裝的採用者自此拿到的是 bundle 裡的散文，而規則哪裡都沒有。`agent-dispatch` 已從四個帶有該清單的檢查腳本的 `REFERENCE_ONLY` 中移除；同批的另外七個標準維持 reference-only，**本次不處理**。
  - 責任邊界，以免兩份標準長出同一組規則的重複副本：`agent-dispatch` 管**怎麼派工**（平行安全、獨立領域、狀態協定、提示詞設計）；`model-selection` 管**派給誰、派多深**。兩者交叉引用而非互相複述。

## [6.4.0] - 2026-08-10

### 新增

- **`class-level-fix` 標準——修正瞄準集合，不是瞄準成員。** 一個缺陷幾乎從不孤單：它是分派鏈裡的一個旗標、manifest 裡的一條宣告、`agents/` 底下的一個目錄。修掉被指出的那一員，集合裡其餘的原封不動，**而沒有東西會通知你下一個在哪**——它會在幾個月後以新事故的形式回來，那正是這類工作感覺沒完沒了的原因。規則：修之前先指出缺陷所屬的可窮舉集合，並加上一個**走訪**該集合的檢查。第三個問題決定這道檢查活不活得下去——走訪從哪裡讀出成員？必須是系統自己讀的那個來源（CLI 定義、目錄、manifest），**絕不是誰手打的清單**，因為手打的清單正確到第四個成員出現為止，而不會有東西告訴你。列舉失敗時是靜默的；走訪配排除清單失敗時是吵的，因為那條排除必須由一個人寫下來、而他得說明理由。檢查必須印出分母**與被排除的數量**——「檢查了 4,012 條宣告」讀起來像涵蓋率，而篩選器悄悄跳過了每一條目錄條目。而且它在被信任之前要**逐子集**證明非空跑，因為一道涵蓋五份清單卻只對第一份測過的檢查，是一道涵蓋一份清單的檢查。

  標準裡每一個實例都是 2026-08-10 量出來的。最有份量的是那個反例：本 repo **十一天前已經為 `--integrations-only` 修過完全相同的缺陷，還留了一段說明通則的註解**，而另外三個分支原封不動。知識就在那個檔案裡，只是沒有到達它的兄弟。**一段描述類別的註解，不等於一道涵蓋類別的檢查。**

  標準明白寫出**它沒有自動閘門**——沒有東西能走訪「現在正在被修的所有缺陷」——並記下理由、由什麼執行（review，只問一句：*這是哪個集合的一員？*）、以及什麼條件下閘門會變得可能。不寫那一段，它就會變成它所要防止的那件事的下一個實例。

### 修正

- **`--plan` 與 `--apply` 的組合行為現在也到得了 `--help`。** 6.3.10 記錄該行為的方式是編輯 `docs/reference/FEATURE-REFERENCE.md`——一份**產生的檔案**。那次編輯活到有人重新產生為止。文字現在住在 `cli/bin/uds.js` 的 `.option()` 字串裡，於是它也會出現在 `uds update --help`，而手改的那一份從來不會。

## [6.3.10] - 2026-08-10

### 修正

- **`--plan` 會被另外四個旗標吃掉，而唯一能防止破壞的正是被忽略的那一個。** `uds update --plan --skills` 會安裝 Skills；`--plan --sync-refs` 會改寫整合檔與 manifest。那個文件寫著「Show reconciliation plan without executing (like terraform plan)」的旗標被靜默丟棄——因為範圍旗標（`--skills`、`--commands`、`--integrations-only`、`--sync-refs`）在一條先到先得、每個分支都 return 的鏈裡，排在模式旗標（`--plan`、`--apply`、`--force`、`--rollback`）之前。`--integrations-only` 早在 2026-07-30 就為了同一件事修過；另外三個沒有被碰，十一天後它們仍在寫檔。現在模式先於範圍決定，而測試改為**從 CLI 定義讀出旗標清單**而非人工列舉——之後新增的旗標不需要有人記得就會被涵蓋。第四個實例正是那個測試找出來的。
- **`--apply --skills` 只升級 Skills、安靜地把標準留在原地，並回報成功。** 同一條鏈：`--skills` 在調和器執行之前就 return 了。以此方式升級一個真實專案，結果它停在舊的標準版本，而畫面上沒有任何一行說明。現在 `--apply` 與 `--force` 會執行調和**並且**執行所要求的範圍。
- **沒有人能回答的確認提示，回傳 exit 0。** 非互動 shell 下 `@inquirer/prompts` 會擲 `ExitPromptError`，該例外從未被攔截而程序仍以 exit code 0 結束——於是在 CI 裡「什麼都沒寫」與「更新成功」回傳同一個值。現在它會說明沒有任何東西被寫入、指向 `--yes`，並以 exit 2 結束。偵測方式是**提示真的失敗了**，而不是探測 `process.stdin.isTTY`——後者在兩個方向上都會答錯。
- **`--rollback` 現在會說明 `--skills`／`--commands` 無法縮小它的範圍**，而不是接受它們卻照樣還原全部。

## [6.3.9] - 2026-08-09

### 修正

- **標準索引宣告的數字與 sync 檢查對不上，而兩者描述的是同一份 manifest。** 6.3.8 讓檢查改為透過 registry 解析 manifest 項目；而索引區塊仍直接宣告 manifest 的 `installedStandards.length`。在一個真實專案上那是 78 對 70，差額正是 `MIGRATION-v6` §2 於 6.0.0 移除的八個機器可讀標準——它們在兩個主版本之後仍宣告於 manifest 中，因為 `uds update` 不會修剪它們。撇開檢查不談，七十八本來就是錯的數字：它就寫在「權威清單為 `.standards/manifest.json` 的 `standards` 欄位」正上方——把讀者指向這個差異的來源、彷彿那就解決了它——並且告訴 agent 去期待八個並不存在的檔案。區塊現在數的是解析得到檔案的項目，其餘在下方指名並說明它們為何還在，於是兩個數字都會出現，都不必用推的。

## [6.3.8] - 2026-08-08

### 修正

- **`uds deps` 對一個它沒有檢查過的集合打了綠勾。** 對一個沒有執行期相依、且使用 pnpm lockfile 的專案執行時，它印出 `0 runtime dependencies checked`，接著 `no package-lock.json — nothing to compare the registry against`，接著 `✓ every dependency resolves to the version you test against`，然後 exit 0。兩項事實都為真；合起來卻宣稱一個這個指令讀不了的 repo 已被檢查而且沒問題，而任何接在這個 exit code 上的閘門都會同意。`clean` 的定義是三個空清單的合取，在空集合上恆真——而涵蓋它的測試正是以「分母會跟著結論一起走」為由斷言了這件事。分母確實跟著走了，卻什麼也沒改變：打勾緊接其後，而 exit code 完全沒有帶上那個計數。**印出分母不足以阻止空集合被讀成安心；拒絕給出結論才可以。** 同時修正該訊息的後半：該專案有一份完全正常的 `pnpm-lock.yaml`，而被告知「你沒有 lockfile」正是讀者判定工具搞錯、從此不再讀它的方式。指令現在會說出找到的是什麼、以及自己讀的是哪一種格式。
- **registry ID 不是檔名，而有八個地方把它當成檔名用。** manifest 的 `standards` 陣列是刻意混合的：core 標準自 v3.4.0 起改為 registry ID，option 條目維持其上游來源路徑，因為 option 沒有 ID。而每個消費端都對兩者一律套 `basename()`——對路徑正確，對 ID 是 no-op。`error-code-standards` 安裝為 `error-codes.ai.yaml`、`logging-standards` 為 `logging.ai.yaml`、`ai-agreement` 為 `ai-agreement-standards.ai.yaml`；多數 ID 確實等於它的 basename，這正是它能存活的原因。同一個錯誤導出三種失效：minimal 模式印出 `.standards/<id>`，使**某採用者 AGENTS.md 的七十個路徑中有七個指不到東西**，而它們正下方那一行寫著「你必須讀取並遵循 `.standards/` 裡的標準」；索引區塊用 `.ai.yaml` 後綴過濾，而沒有任何 ID 帶這個後綴，於是**所有核心標準都被丟掉**，同一個採用者先前的區塊列了七個 option、六十三項核心標準一個也沒有；任務對應表以檔名為鍵，ID 一個也對不上，該標準就安靜地沒有對應。解析現在是一個匯出的函式，八個呼叫點共用，而解析不出的條目會列在清單下方回報，不會被印成路徑。
- **那個專門用來抓這種漂移的檢查，帶著同一個缺陷。** `AGENTS.md Standards Sync` 對一份七十項的 manifest 回報 `7/7`：`.ai.yaml` 過濾只留下七個 option 條目，七個都在，於是打勾——升級前六十三項標準不在區塊裡時打勾，升級後區塊裡有七個死路徑時也打勾。對它所量測對象的九成視而不見，而且全程綠燈。在同一個專案上現在是 67/67，而手動弄壞一個路徑會回報 66/67 並指名該檔。它需要的那份對照，早就建在它上方一百七十行處，註解甚至指名了那個案例。
- **產生器仍把 6.0.0 移除的路徑寫進採用者的指令檔。** `MIGRATION-v6` §2 移除了八個機器可讀標準，它們的執行期已移往採用層；三行 `Reference:` 與一筆 MUST 等級的任務對應仍指向 `.standards/workflow-enforcement.ai.yaml`。人類可讀的 `core/workflow-enforcement.md` 是刻意保留在上游的，但採用者收到的是 `.standards/` 而非 `core/`，所以它不是替代路徑——這幾行是刪除而非改指。控制該段落的判斷式比對的檔名，自 3.4.0 起沒有任何 manifest 持有，於是那段落對兩個仍宣告該標準的專案早已悄悄不再產生；現在兩種形式都比對。

## [6.3.7] - 2026-08-07

### Fixed

- **`uds deps` 只讀 root 的 manifest，於是 monorepo 得到一個關於自己一部分的乾淨答案。** npm workspaces 會把宣告放在不只一份 `package.json`，而這個指令只看了其中一份。實測於一個真實專案：回報 34 個相依，實際宣告 47 個——**在 workspace 裡的那 13 個是隱形的，而其中一個帶著 high 等級的公告**。**一個沒有帶著自己範圍的計數，與一個完整的計數無從分辨**，而那正是這個指令存在要回報的失效。現在會從 `workspaces` 欄位展開、檢查每一份 manifest，並在報告中印出納入了哪些 workspace，讓分母自己帶著範圍。每一列漂移都標明它來自哪個 workspace——否則讀者知道某個套件漂移了，卻不知道該去改哪一份 `package.json`。
- 三個細節決定了「有涵蓋 workspaces」與「看起來有涵蓋」的差別。lockfile 的條目可能被 hoist 到 root，**也可能**巢狀在 workspace 底下，所以兩處都查；只查一處會把另一處回報成「not present in package-lock.json」，而**一個被捏造出來的未知讀起來像一個發現**。workspace 相依於另一個 workspace 時是檔案連結而非已發布套件，因此跳過而不查詢——問 npm 會得到 404 並被記成 unverifiable。以及，比「最後一段結尾一個 `*`」更複雜的 `workspaces` 模式現在會**大聲失敗**而非匹配一個子集：**靜靜地涵蓋得比作者本意少，是同一個缺陷換個地方發生**。

## [6.3.6] - 2026-08-07

### Fixed

- **6.3.5 說出貨的標準全部可解析。它數的是 287 份裡的 141 份。** 6.3.5 加的那道閘門**明文列舉三個目錄且不遞迴**，於是 `ai/options/`、`locales/`、`skills/`——三者皆由 `prepack` 打包進 tarball——都落在它的分母之外。6.3.5 發布後，那些目錄裡仍有 **10 份無法解析**，散在兩個中文語系與 `skills/`。**一道自行列舉範圍的閘門，在下一次有人新增目錄時就過期了**，因此它已改為走訪整個 repo、檢查建置與 vendor 路徑之外的每一份 `.ai.yaml`——本 repo 為 759 份，而它先前宣稱「完整」的是 423 份。
- **另有 8 份能解析、但解析出來是錯的——這是任何「能不能解析」的檢查都看不見的。** `{UT:70%,IT:20%}` 不是對映：冒號後沒有空格時，YAML 讀到的是一個純量鍵 `UT:70%`、其值為 null。未加引號的 `- git commit -m "feat: add model"` 會變成 `{'git commit -m "feat': 'add model"'}`。**它們通過每一項語法檢查，同時交給 agent 一堆胡言。** 閘門現在也會拒絕「鍵含引號字元」或「冒號後無空格」——那是純量被靜默讀成對映的指紋——兩個分支皆以對照組實測而非假設。

## [6.3.5] - 2026-08-07

### Fixed

- **四份出貨的 `.ai.yaml` 標準無法解析。** 6.3.4 交付了 141 份機器可讀標準，其中 `agent-behavior-discipline`、`container-security`、`full-coverage-testing`、`knowledge-graph-memory` 是語法無效的 YAML。同樣四份也在 `.standards/`——那正是 `uds init` 放進採用者目錄的東西。**agent 讀它們得到的是例外而非空內容**，而下游若 catch 掉，得到的沉默與「這份標準沒有規則」無從分辨。四份的失敗方式相同：未加引號的純量帶著 YAML 語意字元——括號內的冒號、flow 序列後接散文、在值中途結束的引號、與兄弟項不同縮排的鍵。以加引號或調縮排修正，不重構結構。

### Added

- **`npm run check:ai-yaml`——每一份 `.ai.yaml` 都必須可解析，並已接上 pre-commit 與發版流程。** 上述四份之所以進得了發版，是因為有八個腳本會讀那個目錄而**沒有一個解析全集**；`check-standards-sync.sh` 比對的是版本與註冊表項目，一份無法解析的檔案能安然通過。此檢查讀 `ai/`、`.standards/` 與 `cli/bundled/` 三處，且**無條件執行**而非藏在路徑 glob 後面——一個窄到會跳過這次的 glob 就是同一個錯誤換個位置。**exit 2 保留給「檢查跑不起來」**：讀不到的目錄、裡面沒有 `.ai.yaml` 的目錄、載不到的 YAML 函式庫。那不算通過，而且會擋下發版——因為一個「沒問題」與「查不了」輸出相同的檢查，會把未知轉成安心。

## [6.3.4] - 2026-08-07

### Fixed

- **`uds deps` 指名了一個 npm 不會安裝的版本。** 解析欄位原本取「所有已發布版本中滿足宣告範圍的最高版本」。那是 semver 的規則，不是 npm 的：`npm-pick-manifest` 在 `latest` dist-tag 滿足範圍時優先採用它，存在的目的正是不讓帶著普通版本號的 `next` 或 `beta` 發布落到只要了一個 caret 的人身上。以 `@anthropic-ai/claude-agent-sdk` 實測（`latest = 0.3.223`、`next = 0.3.224`）：指令回報 0.3.224，而 `npm install …@^0.3` 實際裝 0.3.223。**那個欄位存在的全部目的就是說出「安裝會拿到什麼」，而它指名了沒有任何安裝會拿到的東西。** 現改為單次 `npm view` 同時取版本清單與 dist-tags，套用 npm 自己的優先順序；`latest` 落在範圍外時退回「範圍內最高版本」——鎖在舊 major 的專案仍得到誠實的答案。兩個分支各有測試覆蓋。
- 前兩個版本修的是這個指令的**措辭**，這一版修的是它的**算術**。值得直說：先前那些修正只是讓一個錯的數字變得更好讀。

## [6.3.3] - 2026-08-07

### Fixed

- **6.3.2 改好了說明，卻把說明剛剛撤回的那個主張留在它上方的標題裡。** 漂移區段的標題是 `N shipped ≠ tested`——黃色，就在那段說明「出貨的與測到的是否不同，取決於專案怎麼出貨」的 dim 文字上一行。對隨產物出貨 lockfile 的產物而言，出貨的**就是**測到的，因此那個標題在整份報告最醒目的位置說了與事實相反的話。這正是 1.1.0 改寫 Lock Strategy 條目所要根除的形狀：一句誤導的話，下面附一句限定。標題現在改為指出兩個不一致的欄位——`N tested ≠ resolves`——這是對量測結果的陳述，不是對「誰收到了它」的結論。已加測試釘住。
- **另有兩處在說同一件事，其中一處是採用者最先讀到的。** `uds deps --help` 把這個指令描述為「Compare what you test against what your users install (published packages ship no lockfile)」，模組自身的摘要行則寫「does what you test match what your users install?」。兩者現在都改以「宣告範圍會解析到什麼」表述。發現方式是修完標題後對整個 repo grep 已撤回的措辭——那是我自己那一輪修正漏掉的兩處。

## [6.3.2] - 2026-08-06

### 修復

- **`uds deps` 斷言了一個它無從得知的出貨管道。** 報告結尾寫著「consumers resolve the range themselves, because a published package does not ship a lockfile」，第三欄標為 `users get=`。對一個以 `npm ci` 建置、出貨 Docker image 的產品，這兩句都是錯的——它的使用者拿到的正是 `tested=` 那一欄，而解析出的那一欄實際代表的是「下一次 lockfile 重新產生時會被無人審閱地拉進來的東西」。發現方式是拿這個指令去跑一個出貨 Docker image、根本沒發到 npm 的閉源產品。欄位改為 `resolves=`，報告同時陳述兩種讀法——因為單獨讀一列時，它不能說出與事實相反的話。這與 1.1.0 對 Lock Strategy 條目所做的修正是同一件事：在一句誤導的話下面補「但是……」，那句話仍然誤導，而報告和標準表格一樣，多半是一次讀一行。現在有三個測試把措辭釘住，先前一個都沒有。

## [6.3.1] - 2026-08-06

### 修復

- **6.3.0 從來沒有到達 npm——而這一版的存在，正是因為它自己描述的那個失效。** 發版流程有跑，它的 clean-room job 在 `npm ci` 這一步失敗，錯誤是 `EUSAGE … Missing: @emnapi/core@1.11.3 from lock file`，`Publish to npm` 被跳過。lock 檔是被 `npm install --save semver` 重新產生的，過程中掉了 `npm ci` 需要的傳遞相依項目；我在本機跑的檢查接受了它，所以這個不一致要到發版 job 才顯形——那時 tag 與 GitHub Release 都已經公開。改以最後一份 `npm ci` 確實能通過的 lock 檔為基礎重建，只加進 semver 那一筆，並在整個 CI 矩陣上驗證，而不是只在一台機器上。
- **`v6.3.0` 保留不刪，其 release 說明已改為註明它從未發布。** 一個沒有 npm 對應版本的 tag，正是 `uds deps` 被寫出來要抓的那種不一致；刪掉它移除的是證據，不是落差。**6.3.1 完整包含 6.3.0 的全部內容**，見下方。

## [6.3.0] - 2026-08-04

### 新增

- **`uds deps`——你測的東西，跟你使用者裝的是同一個嗎？** 發布出去的套件不帶 lockfile：你的 CI 測的是 `package-lock.json` 鎖定的版本，你的使用者拿到的是宣告範圍在他們安裝當下解析出的版本。兩者不同時，整套測試會對著一個沒有人會安裝的組合亮綠燈，而那個綠燈與真綠燈無從分辨。此指令逐一比對每個 runtime 相依的三個數字，**只回報差異**並附上分母——一份大多一致的表格會被略過，而其中真正有問題的那幾列也跟著被略過。
  - **原生相依適用更嚴格的規則。** 帶原生綁定的套件只要以範圍宣告就會被標出，**不論它今天是否正在漂移**。semver 對原生 ABI 相容性沒有任何承諾，而這在本生態已被在 minor 範圍內打破過。一個只對應到單一已發布版本的範圍，安全是因為上游還沒再發布，不是因為有任何保障——等漂移，等於等到使用者已經拿到為止。
  - **查詢失敗絕不記為一致。** 它會成為 `unverifiable` 並使整次檢查失敗。一個「沒問題」與「我查不到」長得一樣的檢查，會把未知轉成安心。
  - `--path`、`--json`、`--concurrency`。

### 變更

- **`supply-chain-security-standards` 1.0.0 → 1.1.0——Lock Strategy 條目是對的，但不完整。** 它寫「使用 lock 檔，一律進版控」，讀起來是完整的，因此照著做的人沒有任何理由再往下查——而一份提交的 lock 檔約束的是**你自己的**建置，碰不到你任何一個使用者。回頭改寫本文而非加但書，因為在一條未變動的規則下方補「但請注意……」，會讓原文那一行繼續誤導只讀那一行的人，而標準表格多半就是一行一行讀的。新章節以產生它的那個案例陳述失效、對會發布套件的專案給出四項要求，並明確限定於發布出去的產物——部署的服務會連同 lock 檔一起出貨，不受影響。

### 備註

- 該標準的 `.ai.yaml` 仍是五行的殼、沒有任何機器可讀規則——**141 份中的四份之一**，另含 `design-document-standards`、`estimation-standards` 與 `privacy-standards`，因此讀 `ai/` 層的 agent 對這四份得到的都是空的。本次發版刻意沒有把新增的那一條規則加進去：一條規則躺在一個原本全空的檔案裡，會讓覆蓋率看起來比實際好。該缺口現已記在檔案內部。

## [6.2.8] - 2026-07-31

### 修復

- **下載回來的標準，中文是壞的。** HTTPS 回應以 `data += chunk` 累積，而那會對每一個分塊各自解碼——於是任何位元組跨在分塊邊界上的字元都變成替換字元（`日期` → `日�期`）。單位元組的拉丁文不受影響；三位元組的中日韓文字受影響。**過程中沒有任何一步失敗**：傳輸完成、檔案寫入、動作回報成功，損壞只有讀文字才看得見。在一台機器上實測，**11 個專案的已安裝標準裡共約 278 個替換字元**。損害集中在 `requirement-checklist.md`、`requirement-template.md`、`requirement-document-template.md` 與 locale 包——也就是發布包不出貨的那些檔（`files` 不含 `templates/` 與 `extensions/`），它們只可能靠下載取得。**若你的標準裡有 `�`，請在 6.2.8 以上跑 `uds update --force`——重新下載的內容是正確的，會覆蓋掉它們。**

## [6.2.7] - 2026-07-31

### 修復

- **reconciler 在任何 npm 安裝下都取不到 extension。** `manifest.extensions` 的項目（locale 包之類）抵達 executor 時沒有已解析的來源路徑，因為發布包的 `files` 清單不含 `extensions/` 目錄——於是 `uds update --force` 對它們回報 `No source path available`，而 `uds update` 卻更新了同一個檔案。executor 現在改以 `copyStandard` 解析 extension，那是它處理 registry entry 時本來就在用的 bundled → repo → download fallback，也正是 legacy 路徑一直在用的那一條。完全沒有任何來源的項目仍然會失敗，本來就該如此。

## [6.2.6] - 2026-07-31

### 新增

- **`uds update --apply`** —— 套用 `uds update --plan` 印出的那個計畫，一字不差。

### 修復

- **`--plan` 叫你去跑一個會忽略計畫的指令。** 它印出「Run `uds update` to apply these changes」，但 `uds update` 根本到不了 reconciler——它走 legacy 路徑、更新既有標準，然後為**那件事**回報成功。某次升級它印出 `✓ 已更新 69 個標準檔案`，而上方計畫裡的 8 個刪除、2 個新增一個都沒做，那些檔事後仍在磁碟上。**沒有任何一步失敗**，所以輸出與「已套用計畫」無從分辨。`--force` 也不是答案：它以 `force: true` 重算，那是一個會重寫每個受管檔案的更大計畫。**如果你過去讀完計畫後都是跑 `uds update`，那些刪除與新增從未被套用**——請重跑 `uds update --plan` 看還有什麼未處理。

## [6.2.5] - 2026-07-31

### 修復

- **`uds update` 的備份目錄可能被提交進你的 repo。** `.uds-backup-<時間戳>/` 會寫在專案旁供回滾，而沒有任何規則忽略它——於是一次 `git add -A` 就把它掃了進去。這在我們自己的 repo 發生過兩次，其中一次把 360 個檔、73,992 行帶進了公開 repo。備份現在會忽略自己：建立時就在目錄內寫一個內容為 `*` 的 `.gitignore`，`git status` 與 `git add -A` 不再看得到它，而**你的** `.gitignore` 不會被修改。舊版本產生的既有備份不會被追溯隱藏——請自行刪除或補上規則。

## [6.2.4] - 2026-07-31

### 修復

- **`uds update` 會提議刪掉你自己寫的技能。** 來源判定只要 `manifest.skillHashes` 記錄了某個技能底下的任一檔案，就把它當成 UDS 自己的資產。那個判準之所以安全，只因為 hasher 是壞的——它為 78 個已安裝技能只留下 2 筆紀錄。6.2.2 修好 hasher 之後，同一份 map 被填滿技能資料夾底下全部 137 個檔案，包括手寫的那些；它們於是落在「以 UDS 出貨內容建構的期望狀態」之外，被判為應刪除的孤兒。某個專案的計畫提議刪掉 18 個目錄，其中 14 個是它自己的維運技能。來源判定現在只保留一個訊號：名稱存在於 UDS 自己的 `skills/` 樹下。UDS 已下架的技能改為發警告而非刪除——磁碟上沒有任何東西能把它們和你自己的作品區分開，而**留下一個帶警告的陳舊目錄，比刪掉別人手寫的檔案，是比較好的失敗方式**。**若你正在使用 6.2.2 或 6.2.3，且自己的技能與 UDS 的並存，套用任何變更前請先跑 `uds update --plan`。**

## [6.2.3] - 2026-07-31

### 修復

- **重新選取已安裝的 agent 會追加一筆重複的 manifest 紀錄。** 四個 manifest 寫入端以 `[...existing, ...new]` 追加安裝紀錄，於是一個已被記錄的 agent 每次被重新選取就多一筆；某個專案的 manifest 讀起來是 `['claude-code', 'claude-code']`。安裝器本身從未受影響——`installSkillsToMultipleAgents` 會對輸入去重。損害僅限於**紀錄**，以及每一個會迭代它的消費端：`checkNewFeatures`、reconciler 的掃描器與期望狀態計算器都把那個 agent 走了兩次。效果無害——**這正是它跨越五次升級都沒被注意到的原因**。四個寫入端現在改用安裝器早就在用的那個 helper。

## [6.2.2] - 2026-07-31

### 修復

- **`uds check` 的技能完整性只檢查了你檔案中的一小部分。** 某個專案上它印出 `✓ All skill files intact (6 files)`，而實際安裝了 **345** 個。`scanDirectory` 以 `fullPath.slice(basePath.length + 1)` 推導相對路徑，這假設了 base path 不帶尾端分隔符——而三個 agent 的技能路徑帶（`.claude/skills/`、`.opencode/skill/`、`.cursor/skills/`）。於是每個項目都被砍掉第一個字元（`ac-coverage` → `c-coverage`、`.manifest.json` → `manifest.json`）；`computeDirectoryHashes` 用這個壞掉的名字重組絕對路徑、找不到檔案、跳過該項。**掃了 115 個檔，只算出 2 個雜湊。** 過程中沒有任何一步失敗——目錄存在、迴圈跑完、函式回傳物件，而檢查在 2% 的表面上印了綠勾。`manifest.skillHashes` 現在會被正確填入；同一個專案回報 345。


## [6.2.1] - 2026-07-31

### 修復

- **`uds update --locale <x> --skills` 現在會記錄它安裝的是哪個語系。** `manifest.skills.locale` 只有 `init` 會寫，其他路徑一律不寫——與 6.2.0 剛決定不再信任的 `skills.names` 是同一種「設計上就會過期」的形狀。把專案的技能切換到在地化變體時，磁碟上每個檔案都被換掉，而這個欄位動也沒動。**這個欄位在 6.2.0 之後變成承重的**：該版的 locale 修復會優先讀 `skills.locale`、讀不到才退回 `display_language`。當兩者不一致時——例如顯示語言是英文、技能卻是以 `--locale zh-tw` 安裝的專案——下一次 reconcile 會無聲地把它們全部換回英文。**正是 6.2.0 修掉的那個缺陷，從另一扇門走回來。** 五個技能安裝路徑現在都會記錄實際安裝的語系。


## [6.2.0] - 2026-07-31

> **Reconciler 一直在刪除不是它安裝的東西，事後還回報成功。** `uds update --plan` 在某個採用 repo 提議移除 86 個檔案，其中 72 個是 UDS 有出貨、專案也正在用的技能、指令與選項檔。十二個缺陷，形狀完全相同：一個格式完好、卻永遠對不上的名字——所以什麼都不會報錯，而計畫看起來很權威。**如果你曾看著 `--plan` 的輸出、納悶它為什麼要刪掉你的東西——那不是你的問題。**

### 新增

- **`CLAUDE.md` / `AGENTS.md` 的標準索引改為陳述數量並指向 manifest**，不再逐條列出標準名稱（XSPEC-358 R1）。原本的列舉每個專案約佔 2 KB 的常駐 context，且與 `.standards/manifest.json` 重複——後者才是權威來源且永遠不會過期。區塊會在下次 `uds update` 時自行重生，你不需要做任何事。**若你有工具在解析那份列舉，請改讀 `manifest.standards`。**

### 修復

- **Reconciler 不再刪除你自己寫的技能。** `isUDSManaged` 對技能資料夾底下的每一個目錄都回傳 true，於是任何不是當前 UDS 版本出貨的東西都被提議移除。某個採用端的計畫列出了十四個手寫的 ops 技能要刪。現在改由 UDS 自己的 `skills/` 樹判定來源——這同時涵蓋舊版 CLI 誤複製進來的非技能兄弟目錄（`_shared`、`agents`、`ai`、`tools`、`workflows`），所以它們仍可被清理——或由已記錄的雜湊判定。其餘一律發警告而非移除。**刻意付出的代價**：四個 UDS 此後已下架的技能改為只警告不刪除，因為磁碟上沒有任何東西能把它們和你自己的作品區分開。
- **`manifest.skills.names` 與 `commands.names` 不再被當成期望狀態。** 兩者都只有 `init` 會寫，其他程式路徑一律不寫。某個 repo 的清單跨越 9 個 commit、5 次 UDS 升級一直凍結在 32 個技能，而出貨集合已成長到 55——於是 40 個可用的技能被判為「no longer in desired state」。期望集合現在改為「執行中的 UDS 版本出貨什麼」，那本來就是 `uds update` 實際安裝的東西。全部 18 個安裝點也改為同步維護這兩份清單。
- **Gemini CLI 的指令不再被提議刪除。** 掃描器寫死剝除 `.md`，而 Gemini 的指令是 `.toml`，鍵值停在 `commit.toml`，永遠對不上期望鍵 `commit`——30 個全被判為孤兒。副檔名現在由 agent 設定提供，與寫出這些檔案的安裝器共用同一份。
- **UDS 不再提議刪除它自己的安裝紀錄。** 指令安裝器寫出的 `.manifest.json` 被當成了散落的指令。
- **已選取的選項不再被提議刪除。** `calculateOptions` 把 `manifest.options` 的鍵當成標準 id 迭代，找不到叫 `workflow` 的標準就跳過——於是每個專案的期望選項集合都是空的。某個 repo 的計畫提議刪掉它自己 manifest 指名的全部七個選項。manifest 鍵到註冊表類別的對應現在放在單一份表，安裝器與計算器共用。
- **語系包與其他 extensions 不再被提議刪除。** `manifest.extensions` 在 reconciler 裡根本沒有分支，於是每個已安裝的 extension——語系包、語言風格指南、框架樣式——都落在期望狀態之外，而 manifest 仍列著它、說它已安裝。
- **Reconcile 不再把所有技能重裝成英文。** 技能安裝路徑漏掉了指令路徑有傳的 locale 參數，於是在地化技能被無聲換成英文 canonical 版，而 `skills.locale` 全程仍記著原本的語系。
- **成功的 reconcile 現在會記下它 reconcile 到哪個版本。** `upstream.version` 從不更新，於是 `uds check` 仍回報專案落後，任何讀取該欄位的落後監測也會一直標記它。
- **重寫過的整合區塊不再把自己回報為「已修改」。** `migrate_block` 刷新了 `integrationBlockHashes`，卻沒刷新 `fileHashes`——而後者才是檔案完整性比對的對象。
- **Reconciler 與 `uds update` 現在產生相同的整合區塊。** 兩個獨立的建構者早已漂移：reconciler 那份完全沒有內容類別，於是 reconcile 一個專案會無聲刪掉它的提交訊息段落；它也把輸出語言一律預設為英文（無視 `options.output_language`），並以工具鍵查 `integrationConfigs`，而 manifest 是以檔名為鍵。
- **索引區塊的選項數量計算正確了。** 原本從 `manifest.standards` 數，而該欄位記錄選項的方式並不一致——某個 repo 明明裝了七個選項，區塊卻寫著「options 0」。
- **`uds check` 不再對新的索引區塊回報假的「未同步」。** 有兩處檢查仍以已廢止的列舉為契約、逐一 grep 標準名，於是升級後回報 `5/70` 與 `0/7`，並建議執行 `uds update`——而那會重新產生同一個區塊。兩處現在改為核對宣告數量與 manifest 是否一致，這反而抓得到「數量過期」，那是名稱 grep 永遠抓不到的。
- **`manifest.integrations` 兩種形狀都能正確讀取。** 它被一條路徑寫成工具鍵、被另一條寫成檔案路徑；實測 21 個 repo 中有 20 個存的是檔案路徑，而 reconciler 只懂工具鍵——於是它在這 20 個 repo 全都提議剝掉 `CLAUDE.md` / `AGENTS.md` 的 UDS 區塊。
- **`uds update --plan --integrations-only` 不再寫檔。** `--integrations-only` 的分支排在 `--plan` 檢查之前。
- **`uds init` 不再把 husky 裝進 UDS source repo**（從 repo root 執行測試套件時）。

### 變更

- **發版閘門重新開始量測。** `pre-release-check.sh` 直接呼叫 `tsx`，於是在 PATH 上沒有 tsx 的 shell 中，三項檢查會因為找不到執行檔而回報「✗ Failed」——與真正查出問題無從分辨；現在它會先解析 `tsx`，找不到就直接中止。另外它的 dogfooding 閘門執行 `uds check` 時沒帶 `--force`，而 DEC-044 的自我採用守衛會在本 repo 內拒絕該指令——**這個閘門自 5.15.1 加入以來，每一次發版都是紅的。**


## [6.1.1] - 2026-07-18

> **`uds check` 悄悄量錯了東西。** 它的落後檢查拿你的標準去比 CLI 自己 bundled 的副本、而非 npm——CLI 一舊就吐出倒退、無意義的訊息，且結構上永遠說不出「你的標準過期了」——還把那則訊息埋在逐檔一行的「未變更」底下。

### Fixed

- **`uds check` 現在拿你安裝的標準比對 npm 上的最新版，而非 CLI 自己 bundled 的副本**（XSPEC-342）。`displayAdoptionStatus` 原本拿 `manifest.upstream.version` 去比**跑這支 CLI 內建的**標準副本。CLI 一舊，那副本就比 npm 舊——於是檢查印出倒退的 `⚠ 有可用更新：6.1.0 → 5.12.1`（叫你「更新」到*更舊*的版本），且結構上永遠無法回報你的標準落後。現在改問 npm 最新版；當你的標準落後時，訊息改為 **「你安裝的標準落後最新版」**，並給出完整兩步驟修復——`npm update -g universal-dev-standards` **然後** `uds update`——因為只更新 CLI 不會動到你專案的 `.standards/`。`--offline` 靜默略過比對，不再退回誤導的 bundled 檢查。

### Changed

- **`uds check` 不再逐檔列出未變更的檔案**（XSPEC-342）。它原本對每個追蹤檔印一行 `✓ …（未變更）`——約佔指令輸出的 70%（實測 121 → 41 行）——淹沒了真正該讀的訊息，也讓輸出大到被自動化呼叫端（pre-commit agent）截斷。逐檔「未變更」列印已移除；計數仍保留在一行的完整性摘要，已修改／遺失／未雜湊的檔案仍逐一列出。

## [6.1.0] - 2026-07-17

> **同一種形狀的兩個失敗，一個在標準裡、一個在 CLI 裡**：一道檢查跑了、回傳了、回報成功，卻什麼都沒量到。`verification-evidence` 補上了為它命名的那一層；`uds init` 則不再是它的一個實例。

### 修正

- **`uds init` 不再覆蓋既有的 `prepare` script**（XSPEC-341）。自 2026-02-04 起，`uds init` 會對任何沒有 `.husky/` 目錄的 Node 專案執行 `npx husky init`。該指令是為**全新**專案設計的一次性 bootstrap：它會無條件把 `"prepare"` 設成 `"husky"`。若你的專案原本就有 `prepare`——而對一個要發布的套件而言，`prepare` 通常就是 build 步驟——**它會被靜默取代**，而 CLI 回報成功。`uds init` 現在改為串接而非覆寫（`"tsup"` → `"tsup && husky"`），會印出它所修改的每一個 `package.json` 欄位，也不再丟棄 husky 的 stderr。

  > **⚠️ 若你曾在原本就有 `prepare` script 的專案上跑過 `uds init`，請立即檢查。** 這次修正保護的是往後的執行；它無法還原一個已經被改寫的 `package.json`。症狀是：你預期看到自己的 build 指令，實際看到的卻是 `"prepare": "husky"`——而如果你的套件會發布建置產物（`files: ["dist"]`、`main` 指向 `dist/`）且沒有 `prepack`／`prepublishOnly`，那麼你下一次 `npm publish` 送出去的將是一個未建置或過期的目錄。請以串接方式復原：`"prepare": "<你原本的指令> && husky"`。

- **`uds init` 不再把 `npm test` 塞進 `.husky/pre-commit`**（XSPEC-341）。那一行來自 husky 的 init 範本，不是來自 UDS——它等於在每一次 commit 上架了一道採用者從未選擇加入的完整測試套件閘門。UDS 現在只附加自己的 `npx uds check`，而且是附加到既有 hook 之後，而不是改寫它們。

- **新建的 husky hook 改以 v9 格式寫入**（XSPEC-341）。fallback 的 hook 範本仍在輸出 v8 的 `#!/usr/bin/env sh` + `. "$(dirname -- "$0")/_/husky.sh"` 前導段，該寫法在 husky v9 已棄用、v10 已移除——而 `uds init` 安裝的正是 husky `^9`。這原本是潛伏問題（過去 hook 是由 husky init 寫出的）；移除 `husky init` 後，fallback 升為主要路徑，因此一併修正。

### 變更

- **`verification-evidence` 1.1.0 → 1.2.0 —— 證據有效性**（XSPEC-340）。本標準原本把 `exit_code` 當成事實真相：`trust_rules` 寫著「`exit_code ≠ 0` → 驗證失敗」、`physical_spec.checks` 問的是「`exit_code` 是否為 0（成功）？」、VE-002 只要非零就觸發修復迴圈。**這三處現已全數加上限定條件**，因為一道驗證指令可以跑完、可以回傳，卻什麼意義都沒有：
  - **新增 `evidence_validity` 層次與規則 VE-007 – VE-010**：只有在「成功時回傳 0」的工具上，`exit_code = 0` 才代表成功（VE-007）；在證明查詢工具確實執行過之前，「空／查無／0」不等於不存在（VE-008）；存在性檢查不得丟棄 stderr（VE-009）；pipeline 的 exit code 不屬於其中任何單一階段（VE-010）。
  - **新增 `non_evidence_claims`**：「已完成」／「應該可以了」／「我改了程式碼」／「測試應該會通過」／「指令回傳 0」。
  - 有別於 `anti-hallucination`——後者的禁令全都是「不要斷言你沒查過的事」的變形。這裡是相反的失敗：**確實查了，而查詢工具靜默地沒有運作**。`core/verification-evidence.md` 收錄了八筆真實案例作為證據。
- **`verification-evidence` 的人類文件補上了 v1.1.0 的落差。** v1.1.0 的 `environment_layer` 工作（XSPEC-204）已落地於全部三份 `.ai.yaml`，卻**一份 `.md` 都沒有更新**（共四份）——人類文件自 2026-05-13 起就一直在錯誤地描述這個標準。`core/*.md` 現已載明 `environment_layer`、Environment Layers 章節，以及 VE-005 / VE-006。
- **`verification-evidence` 新增三個先前只存在於 zh-TW 譯文的章節**：非證據的聲明（Non-Evidence Claims）、證據類型（Evidence Types）、相關標準（Related Standards）。譯文比它的來源更完整；這些章節現已上溯至英文來源，並同時存在於兩個語系。

## [6.0.0] - 2026-07-06

> ⚠️ **重大版本（Major release）。** 包含一項 breaking 更名，並移除 8 個已棄用的機器可讀標準與 4 個已棄用的 CLI 命令（皆自 5.4.0 起帶有「將於 6.0.0 移除」告示）。**請參閱 [v6 遷移指南](docs/MIGRATION-v6.md)**（[English](../../docs/MIGRATION-v6.md) | [简体中文](../zh-CN/docs/MIGRATION-v6.md)）。

### 變更 — BREAKING

- **`review` 命令／skill 更名為 `code-review`**（T1）。`/review` 的呼叫端必須遷移至 `/code-review`；flow-id `review-flow` → `code-review-flow`。見遷移指南 §1。

### 移除 — BREAKING（自 5.4.0 起排定）

- **移除 8 個已棄用的 `.ai.yaml` 標準 stub**（runtime 已依 XSPEC-086/095 / DEC-049 於 5.4.0 移至 adoption layer）：`agent-communication-protocol`、`agent-dispatch`、`branch-completion`、`change-batching-standards`、`execution-history`、`pipeline-integration-standards`、`workflow-enforcement`、`workflow-state-protocol`。人類可讀的 `core/*.md` 文件保留作為參考（現列於 registry-check 的 REFERENCE_ONLY 清單）；registry 條目已移除。見遷移指南 §2。
- **移除 4 個已棄用的 CLI 命令**：`uds start` / `uds mission:*`、`uds workflow:*`、`uds flow:*`、`uds sweep`（orchestration 屬 adoption layer 職責；`/sweep` skill 取代 `uds sweep`）。並清理引用已移除命令的死 i18n 鍵與過時的 in-CLI 提示（`config` next-steps、`quickstart` recipes）。見遷移指南 §3。

### 新增 — 新標準（coverage-roadmap waves + 旗艦標準）

- **領域與生命週期標準補齊**：product — `prd-standards`、`product-metrics`、`user-story-mapping`（XSPEC-069）；infra — `container-image`、`secret-management`、`iac-design`（XSPEC-065）；SRE — `incident-response`、`slo-sli`、`runbook`（XSPEC-063）；data engineering — `data-pipeline`、`schema-evolution`、`data-contract`（XSPEC-068）；compliance — `audit-trail`、`pii-classification`（XSPEC-066）。
- **旗艦標準**：`verification-oracle`（XSPEC-256）、`model-provenance`（XSPEC-255）、`resource-cost-boundary`（XSPEC-277）。
- **`user-journey-testing`** 以一級標準（first-class standard）身分發布（ai/standards + core + zh-TW + registry）。
- **`logging-standards` 強制事件目錄（mandatory events catalog）**（XSPEC-234）。

### 新增 — UDS Stage 2 硬化（T5–T16）

- **Canonical AC 註記**（T5）：涵蓋 `acceptance-criteria-traceability` 與 worked examples。
- **附出處的量化門檻**（T8）：`browser-compatibility` 95%/90% gate、`checkin` code-smell、`accessibility` session-timeout、`code-review` PR 大小／回應時間 + 大量變更例外、`project-context-memory` 7 天陳舊度、`developer-memory` 退役、`privacy` DPIA「large scale」。
- **Failure Handling 章節**（T7）：`git-worktree` 暫時性失敗重試、`reverse-engineering` 升級（escalation）、`forward-derivation` 復原。
- **跨職能交接**（T16）：`security-testing` finding-remediation 生命週期、`pii-classification` 發現與交接契約。
- **Glossary 術語正規化**：作為 canonical 真實來源（T6）。
- **CLI 硬化**（T11/T12）：Mission `FAILED` 終止狀態 + resume 防護、具 rollback 的 transactional `init`、`hitl`/`run`/`release`/config 的輸入驗證。

### 新增 — 遷移與重構完整性家族

- `migration-assistant` 切換後（post-cutover）資料對帳（XSPEC-284 P0）、狀態機與時序對等（XSPEC-287）；`full-coverage-testing` 遷移錯誤路徑完整性（XSPEC-288）；`performance-standards` 遷移非功能對等（XSPEC-286）。

### 新增 — 工具與工作流程

- **`/brainstorm` v4 的 BQS v1 品質契約**（XSPEC-296）。
- **`ci-cd-assistant` skill 新增 CI Job Orchestration Patterns** — trigger 分離、共用資源序列化、change-detection gating、advisory vs gating、`npm ci` `EUSAGE` 疑難排解（UDS #126 / XSPEC-300）。
- **`pipeline-security-gates` 新增部署前 attestation 驗證閘門**。
- **release 流程新增發版前 issue/PR triage 閘門**（XSPEC-265）。
- `release verify` 現在使用已記錄的 manifest checksum。
- `/journey-test` 與 `/skill-builder` 註冊為正式命令。
- 可選的 model-tier 註記（R6，XSPEC-270 Work Package A）。
- `sync-standard` 四層同步工具；Phase 2 內容覆蓋稽核 metadata。

### 新增 — 事故驅動的防漂移與可測試性

- **`refactoring-standards` Semantic Duplication 與 Copy-Drift**（#142）：命名 Copy-Drift 反模式（同一領域事實在多處重複實作，或儲存的衍生彙總值與其來源之間沒有強制綁定——文字型重複度量測不到），以及 Single-Source-of-Truth / Derive-Don't-Duplicate 對策（每個事實一個單元、以推導取代儲存、儲存的彙總值在單一收斂點重算、以 golden + architecture 測試鎖住），另加遷移用的 Intentional-Divergence Registry。
- **`mock-boundary` 可注入的背景執行**（#143）：將 in-process fire-and-forget 工作（`Task.Run`、未 await 的 promise、`setTimeout`、goroutine、executor）視為如同時鐘般的可注入接縫——production 保留真實 fire-and-forget，測試 dispatcher 則 inline 執行並追蹤 task 以達成確定性完成；新增 Poll/Sleep-for-Background-Result 反模式與 no-poll/sleep 規則。

### 變更

- **API versioning 與 deprecation 整併為單一真實來源** — producer 端的 API-versioning 內容併入 `api-design-standards`；不一致的 deprecation 時程已調和（XSPEC-298 R8）。
- **`versioning` 新增 Deployment Version Identity 章節**，含 build-metadata 判別符（discriminator）注意事項（XSPEC-298 R1）。
- **`versioning` 建置身分與多語言 versioning**（XSPEC-298 R2/R3）：.NET／JVM／多語言專案的 git-height 推導 versioning（MinVer / Nerdbank.GitVersioning / GitVersion）；建置身分升級為需求——已部署服務 MUST 經由 `/version`|`/health` 揭露 `version + commit sha + build time`，且 Phase-5 驗證 MUST 斷言 sha 與已部署 artifact 相符（#138）。

### 棄用

- **6 個 workflow skill** 標記為 `reference` 並附可見的棄用告示；已棄用的 runtime 命令加上結構化 `@superseded-by` 指標（XSPEC-291 §4）。

### 修正

- **`uds audit` 假陽性**：`options/` 檔案被誤報 missing（health check 現在會遞迴進子目錄）、CP950 主控台亂碼、非 TTY 崩潰（#115）；unused-standard 偵測改以 canonical id 而非檔名比對（#125）。
- **Bundle ⇄ source 對等已恢復** — 25 個標準已同步進 `.standards/` self-adoption tree。
- 多項 docs/i18n 完整性修正：過時的標準／skill／命令數量、壞掉的 locale 交叉連結、command/skill 索引重新產生、anchor-slugger 與 table-parity 路徑。

## [5.17.0] - 2026-06-08

### 新增 — 可執行 SDD 一致性與 AC 格式擴充（XSPEC-262/263/264）

- **`/sdd analyze` 跨 artifact 一致性（XSPEC-262，`scripts/sdd-analyze.ts`）**：acceptance-criteria-traceability + forward-derivation single-spine 的可執行面。7 類信號——孤兒測試／未覆蓋／not_implemented／跨 spec AC 衝突／孤兒 .feature／AC 無 scenario／手冊↔E2E drift（`T-NNN`，實現 XSPEC-260 R5）。`npm run sdd:analyze`；12 bats 測試。
- **EARS 記法作為可選 AC 格式（XSPEC-263）**：spec-driven-development v2.3.0 加 5 種 EARS 模板；schema 加可選 `ears` 欄位（given/when/then 由 required 放寬、向後相容）。GWT 維持預設首選。
- **結構化 Bugfix 規格模板（XSPEC-264）**：sdd-guide 決策樹細分 trivial vs regression-prone，新增輕量 `<BUG-ID>.bugfix.md` 模板（current/expected/**unchanged** + root-cause + regression-test 當 AC）。

> 註：Bugfix 模板的 sdd-guide locale（zh-TW/zh-CN）同步交 XSPEC-248 迴路（既有 locale drift）。

## [5.16.0] - 2026-06-08

### 新增 — 測試推導鏈延伸至使用者指南（XSPEC-260）

- **`core/forward-derivation-standards.md`**：新增 `## Terminal Projection: User Guide`（終端投影：使用者指南）段 + `### Single-Spine Principle`（單一主幹原則）。把推導管道從測試延伸到使用者指南——使用者指南是 journey／E2E 測試以機器驗證的同一條 AC 主幹的終端投影。定義共用 `T-NNN` 編號（使用者指南步驟的 `T-NNN` 必須等於某個真實 journey／E2E 測試的 id）、user-facing AC 篩選與保守預設，以及單一主幹原則：測試／文件來源是同一 AC 主幹的 N×1 投影、非 N×N 平行對照；另立平行編號體系即為違規。
- **`ai/standards/forward-derivation-standards.ai.yaml`**：對應 `terminal_projection` 區塊 + 3 條 rules（`single-spine-no-parallel-numbering`、`user-guide-shared-tnnn`、`user-facing-ac-conservative-default`）。
- **`core/acceptance-criteria-traceability.md`**：新增 `## User-Documentation Coverage`（使用者文件覆蓋）維度——追蹤 user-facing AC 是否被使用者指南記載。含 user-facing AC 篩選（保守預設：判不準歸 user-facing）、沿用 ✅/⚠️/❌ 狀態，及排除非 user-facing 與 `not_implemented` AC 的覆蓋率公式。
- **`ai/standards/acceptance-criteria-traceability.ai.yaml`**：對應 `user_doc_coverage` 區塊 + 2 條 rules（`user-doc-user-facing-only`、`user-doc-shared-tnnn`）。
- **zh-TW / zh-CN 語言版**：兩標準的新段落均完整翻譯。

## [5.15.0] - 2026-05-28

### 新增 — i18n 分層語言策略（XSPEC-239）

- **`core/ai-instruction-standards.md` v1.0.0 → v1.1.0**：新增 `## 國際化（i18n）` 章節，定義 SKILL.md 與 root 級 AI 指令檔的 L1/L2/L3/L4 分層語言策略。**範圍延伸**自原本只規範 root 級（`CLAUDE.md`、`.cursorrules` 等）擴張至涵蓋 skill 級檔案（`SKILL.md`）。定義 canonical/locale 檔案結構、責任邊界、chimera 防範規則、採用者安裝模式。
- **`ai/standards/ai-instruction-standards.ai.yaml` v1.0.0 → v1.1.0**：對應的 `i18n:` 區塊 + 4 條新規則（`i18n-canonical-english-only`、`i18n-locale-must-match-language`、`i18n-l3-template-language-controls-output`、`i18n-no-manual-canonical-edits-by-adopters`）。
- **10 個缺漏 zh-TW locale skill 變體**：`ac-coverage`、`deploy-assistant`、`dev-methodology`、`journey-test-assistant`、`orchestrate`、`plan`、`push`、`skill-builder`、`spec-derivation`、`sweep`。zh-TW skill 覆蓋率達 54/54（100%）。
- **`cli/src/lint/i18n.js` + `uds check --i18n` 命令**：強制執行 5 條 chimera 防範規則（`canonical:description-must-be-ascii` 錯誤、`locale:description-must-match-language` 錯誤、`locale:must-have-source-frontmatter` 錯誤、`canonical:l3-language-consistency` 警告、`translation-drift-warn` 警告）。Error 退出碼 1。`--json` 模式給 CI 用。
- **`scripts/generate-locale-coverage.mjs` + 自動產生的 `locales/COVERAGE.md`**：依 skill/standard × locale 的覆蓋率矩陣 + drift 警告。npm script `docs:locale-coverage`。
- **`UDS_LOCALE` 環境變數支援**：在 `cli/src/i18n/messages.js detectLanguage()` 與 `cli/src/commands/update.js resolveLocale()` 讀取。接受 `zh-tw`、`zh_tw`、`zh-cn`、`zh_cn`、`en`（不分大小寫）。
- **`.uds/install.yaml` `locale:` 欄位支援**：`cli/src/utils/config-manager.js readInstallYaml()` 讀取可選 `locale:`，讓採用者宣告偏好 locale 一次，免去每次 `--locale`。
- **Locale fallback WARN**：當 `installSingleSkill` 從缺漏的 locale 變體 fallback 到英文時，安裝結束時統一以黃色 WARN 區塊列出受影響 skill。取代原本的 silent fallback。
- **i18n 訊息**：在 en/zh-tw/zh-cn locale 中新增 `localeFallbackTitle` / `localeFallbackHint` 鍵。

### 變更

- **CLI locale 解析優先順序**（`cli/src/commands/update.js resolveLocale()`）：現為 6 階層 — `--locale` CLI 旗標 > `.uds/install.yaml` `locale:` > `UDS_LOCALE` env > manifest > `.standards/` 偵測 > `'en'`。`init` 與 `update` 一致。
- **`core/ai-instruction-standards.md` 譯本**：zh-TW 與 zh-CN locale 同步至 v1.1.0 含完整在地化 i18n 章節。（zh-CN 章節標記 pending-review，依 XSPEC-239 O-2 — 簡中翻譯品質策略未定。）

### 修正

- **29 個 canonical SKILL.md 描述 chimera 修正**（XSPEC-239 Phase 1B）：自下列 skill 的 `description:` frontmatter 移除 CJK 內容：`adr-assistant`、`ai-collaboration-standards`、`ai-friendly-architecture`、`ai-instruction-standards`、`api-design-assistant`、`audit-assistant`、`ci-cd-assistant`、`contract-test-assistant`、`database-assistant`、`deploy-assistant`、`documentation-guide`、`error-code-guide`、`git-workflow-guide`、`incident-response-assistant`、`journey-test-assistant`、`logging-guide`、`observability-assistant`、`orchestrate`、`plan`、`pr-automation-assistant`、`project-structure-guide`、`push`、`retrospective-assistant`、`runbook-assistant`、`security-assistant`、`security-scan-assistant`、`slo-assistant`、`sweep`、`testing-guide`。譯本改放於 `locales/{lang}/skills/`。原本依賴 `.claude/skills/` 中繁中描述的採用者應重跑 `uds update --locale zh-TW`（或 `--locale zh-CN`）。
- **`skills/reverse-engineer/SKILL.md` description em dash（U+2014）** 改為 ASCII hyphen — canonical 描述必須純 ASCII（依新 lint 規則）。
- **`locales/zh-TW/core/self-review-protocol.md` 缺 YAML frontmatter** 已補（`source:`、`source_version:`、`translation_version:`、`last_synced:`、`status:`），與其他 zh-TW core 變體一致。

### 採用者升級注意

對於以 `--locale zh-TW` 或 `--locale zh-CN` 安裝 UDS（或被 `LANG=zh_*` 偵測）的專案，本次 release 可能造成使用者可見的變化：

- **升級後請執行 `uds update`**。原本描述含中文的 skill，canonical 中的 `description:` 會變英文，繁中 `description:` + body 在 locale 變體中。`.claude/skills/{name}/SKILL.md` 會從 locale 變體自動重新安裝。
- **手動編輯過 canonical** 檔案（在 `.claude/skills/` 加繁中描述）的採用者，請將客製化內容調整至 locale 變體或 overlay — 詳見 `core/ai-instruction-standards.md` 的 `XSPEC-239` 遷移章節。
- 新的 `uds check --i18n` lint 可驗證專案乾淨：errors 阻擋，warnings（例如 `translation-drift-warn`）只進 dashboard 不預設 fail CI。

## [5.14.0] - 2026-05-27

### 新增
- **`.github/RELEASE-FLOW-TODOS.md`**：發版流程改善項目的持久追蹤檔案，記錄 dogfood 過程中發現的問題。包含 TODO-001 ~ TODO-005（bump-version.mjs 自動執行 docs:generate-index、FB/Threads prompt 捕捉習慣、下次 bootstrap 驗證 `_template/`、Phase 1.5 social-assets 硬閘、Phase 2 Meta API 自動發布 workflow）。維護者可直接編輯此檔案新增或關閉項目。

### 變更
- **`.github/workflows/release-reminder.yml`**：現在讀取 `.github/RELEASE-FLOW-TODOS.md` 並將 open TODO 顯示在每週一 09:00 UTC reminder issue 內文中。改善項目在每個發布週期持續累積，不再遺失在 commit history 裡。

### 修復
- **`cli/src/commands/check.js` — AI 工具整合 check 誤報 missing 標準**：`uds check` 錯誤地將 `error-code-standards` 和 `logging-standards` 報告為 missing，即使實際 `.ai.yaml` 檔案（`error-codes.ai.yaml`、`logging.ai.yaml`）已正確寫入 `CLAUDE.md`。根因：`migrateStandardsPathsToIds()` 將 manifest 路徑轉為 registry ID（如 `ai/standards/error-codes.ai.yaml` → `error-code-standards`），但整合檔案是以實際檔名生成的。check 現在從 registry 建立 `id → aiFilename` 查找表，在 ID 未直接出現於整合檔案時以實際檔名進行第二次比對。

## [5.13.3] - 2026-05-26

### 修復
- **`scripts/pre-release-check.sh` Step 22.5 邏輯升級**：原始實作（v5.13.0）只接受 Pass A（`[Unreleased]` 非空）。CHANGELOG promotion（`[Unreleased]` → `[X.Y.Z]`）後該 section 正確清空但原 check 誤判失敗，需 `--skip-changelog` 繞過。新邏輯加 **Pass B（post-promotion）**：最新 dated section 是 today AND 有內容也 pass。並新增 **Fail D**：今日 dated section 存在但僅有 template。發版 v5.13.0 時 surface — gate 自己的 pre-release-check 退到 `--skip-changelog` 因為已是情境 B。

### 備註（翻譯回填）
- `locales/zh-TW/CHANGELOG.md` 與 `locales/zh-CN/CHANGELOG.md` 補回 v5.13.1 hotfix commit 時遺漏的 [5.13.1] section（Edit 工具當時遇到 tool-state 問題擋住這兩份翻譯）。

## [5.13.1] - 2026-05-26 [PUBLISH 失敗 — 見 5.13.2]

### 修復
- **`.github/workflows/publish.yml` Clean-room Install Test（XSPEC-221 hotfix）**：在 alpine clean-room job 的 `npm install -g .` 之前新增 `npm ci --ignore-scripts` 步驟。

## [5.13.2] - 2026-05-26

### 修復
- **`.github/workflows/publish.yml` Clean-room Install Test（XSPEC-221 hotfix v2）**：將 `uds init --dry-run`（CLI 未實作此 option）換成 `uds init --help` 作為安全的 non-mutating 驗證。v5.13.1 publish 失敗時 surface — 錯誤訊息 `error: unknown option '--dry-run'`。gate 第二次自我 bug 被抓出；gate 經此次端對端驗證。

## [5.13.1] - 2026-05-26 [PUBLISH 失敗 — 見 5.13.2]

### 修復
- **`.github/workflows/publish.yml` Clean-room Install Test（XSPEC-221 hotfix）**：在 alpine clean-room job 的 `npm install -g .` 之前新增 `npm ci --ignore-scripts` 步驟。

## [5.13.0] - 2026-05-26

### 新增
- **`core/self-review-protocol.md` v1.0.0**（含 `ai/standards/self-review-protocol.ai.yaml`、`locales/zh-TW/core/self-review-protocol.md`、`cli/standards-registry.json` 註冊項）：新標準，要求**大型 markdown 編輯（> 50 行）commit 前必跑 self-review**。明列 **6 類內部 cross-reference 不一致** — diagram/step 不同步、changelog 編號錯位、計數錯位、stale 範本、錯誤工具引用、placeholder 與 rule 不對齊 — 並附具體檢查方法。與 code review（程式碼）、內容自我審計（完整性）、同儕審查（設計）三者分工互補。觀察源：下游 skill 編輯出現的 `v1.X→v1.X.1` patch 慣性。
- **`scripts/pre-release-check.sh` Step 22.5 — CHANGELOG hard gate**：當 `CHANGELOG.md [Unreleased]` 為空時拒絕發版。新增 `--skip-changelog` flag 提供 escape valve（發版 commit message 須註明理由）。插在 flow gate（step 22）與 dogfooding gate（step 23）之間。
- **`scripts/pre-commit.mjs` Step 1.5 — CHANGELOG drift advisory**：當 staged commit 改 substantive source（`core/`、`ai/standards/`、`cli/src`、`cli/bin`、`scripts/`、`skills/*/SKILL.md`、`.github/workflows/`）但沒 stage `CHANGELOG.md` 時，黃色 warning（不擋 commit，exit 0）。訊息指向 release-time hard gate 讓使用者知道忽略警告的後果。
- **`.github/workflows/release-reminder.yml`**：每週一 09:00 UTC cron，當 `CHANGELOG.md [Unreleased]` 非空 **且** 距離 latest semver tag ≥ 7 天時，開或更新標 `release-reminder` + `auto-generated` 的 issue。條件不再滿足時（發完版或 [Unreleased] 清空）自動 close。內建 semver bump heuristic（依條目內容推 major/minor/patch）。
- **`scripts/check-skill-structural-integrity.ts`**（XSPEC-223，P1 發版 gate）：驗證 skill `SKILL.md` 結構完整性（frontmatter 欄位、必要 section）。串接到 `pre-release-check.sh` step 18.5；任何 skill 結構不全則擋發版。
- **`packaging-standards`**（XSPEC-233 / #112）：新增 API migration contract test fixtures section — 定義跨版本 API 遷移相容性測試的 fixture 格式。
- **Clean-room install gate**（XSPEC-221）於 `.github/workflows/publish.yml`：Alpine Node 20 容器跑 `npm install -g .`（從 `cli/`），驗證 `uds --version` / `uds list` / `uds init --dry-run`。任何步驟失敗則擋 `publish` job。
- **Dogfooding gate**（XSPEC-222）— `scripts/pre-release-check.sh` step 23：新 CLI build 必須能跑 `uds check` 通過自身驗證才能發版。

### 變更
- **`core/deployment-standards.md`**（XSPEC-231 / #110 + #113）：部署防禦性配對 — 強制歸檔格式驗證 + 解壓-驗證-才刪除 模式。關閉「壓縮檔損毀但先被刪除」失敗類別。
- **`core/logging-standards.md`**（XSPEC-232 / #111）：強制雙觸發日誌輪替策略 — size **AND** time 兩種觸發都必須配置（非 OR）。關閉「size 門檻未達所以輪替從未觸發」失敗模式。
- **`skills/contract-test-assistant/SKILL.md`** 與 **`skills/runbook-assistant/SKILL.md`**：配合 XSPEC-231/232/233 模式的小幅更新。
- **依賴升級（`cli/`）**：`lint-staged` 17.0.3→17.0.4（#107）、`@inquirer/prompts` 8.4.2→8.4.3（#106）、`eslint` 10.3.0→10.4.0（#105）、`@vitest/coverage-v8` 4.1.5→4.1.6（#103）、`vitest` 4.1.5→4.1.6（#101）、`@commitlint/cli` 21.0.0→21.0.1（#104）、`tsx` 4.21.0→4.22.3（#109）。
- **CI actions**：`actions/checkout` 4→6（#98）、`actions/setup-node` 4→6（#99）。

## [5.12.1] - 2026-05-19

### 變更
- **`full-coverage-testing.ai.yaml`**（`no-tautology-assertions` 規則，XSPEC-220）：AI agent 生成未實作測試骨架時，**必須**使用 `it.todo("AC-XXX: ...")`，禁止使用含 `expect(true).toBe(true)` 的 `it()` callback——無論由人類或 AI agent 生成，均視為 `[ANTI-FAKE-001]` 違規。
- **`test-governance.ai.yaml`**（`gate-wiring-required` 規則，XSPEC-220）：品質偵測腳本（anti-fake、stub-check、coverage ratchet）**必須**同時出現在至少一個 CI workflow job 與至少一個 local hook。腳本存在於 `scripts/` 但從未被 CI 呼叫，等同不存在，視為治理缺口。
- **`acceptance-criteria-traceability.ai.yaml`**（`not_implemented` 狀態，XSPEC-220）：明確定義 `it.todo()` 佔位符對應 `not_implemented 🚫` 狀態（不計入覆蓋率分母），補充決策樹區分 `not_implemented`（有意識標記）與 `uncovered`（遺漏）。

## [5.12.0] - 2026-05-16

### 新增
- **`docs/user/` 使用者文件體系**（XSPEC-211）：新增雙軌文件結構，仿照 VibeOps 慣例，包含 8 份文件：
  - `docs/user/GETTING-STARTED.md` — 5 分鐘端到端教學（install → `uds init` → `/sdd` → `/commit`）
  - `docs/user/SKILLS-INDEX.md` — 自動生成的 54 個 skill 索引，依 Tier（DEC-061）與 Category 分類，含「觸發時機速查」表
  - `docs/user/COMMANDS-INDEX.md` — 自動生成的 48 個 slash command 字母序清單，含 skill 對應
  - `docs/user/FAQ.md` — 14 題常見問題（安裝、skill、SDD、升級、架構）
  - `docs/user/GLOSSARY.md` — UDS、SDD、ATDD、BDD、TDD、XSPEC、Dual-Layer、Skill Tier、Standard、Activity、Bundle/Source、ADR、AC 等術語定義
  - `docs/user/TROUBLESHOOTING.md` — 問題→解法指南，整合 `SKILL-FALLBACK-GUIDE.md` 內容
  - `docs/user/README.md` — 三類受眾入口（新手 / 日常使用者 / 維護者）+ 文件地圖
  - `docs/user/CHEATSHEET.md` — 從 `docs/` 移入（內容不變）
- **`scripts/generate-skill-index.ts`** — 從 `uds-manifest.json` + `skills/*/SKILL.md` frontmatter 生成 SKILLS-INDEX.md 與 COMMANDS-INDEX.md。執行：`npm run docs:generate-index`
- **`scripts/check-skill-index.ts`** — pre-commit 守門；重生成後 diff，不同步則 exit 非零。執行：`npm run docs:check-index`
- **`scripts/setup-hooks.sh`** — 安裝 `.git/hooks/pre-commit`，每次 commit 自動呼叫 `docs:check-index`
- **`.github/workflows/docs-check.yml`** — CI job：PR 修改 manifest/SKILL.md/registry 時驗證 INDEX 文件已同步
- **`docs/reference/FEATURE-REFERENCE.md`** — FEATURE-REFERENCE.md 從 `docs/` 遷移至 `docs/reference/`（自動生成，內容不變）
- **`docs/archive/USER-MANUAL-2026-03-24.md`** — 已廢棄 User Manual 的歸檔備份

### 變更
- **`package.json`**：新增 `docs:generate-index` 與 `docs:check-index` npm scripts
- **`scripts/generate-usage-docs.mjs`**：更新英文輸出路徑（FEATURE-REFERENCE → `docs/reference/`，CHEATSHEET → `docs/user/`）
- **`skills/README.md`**：新增 banner 指向 `docs/user/SKILLS-INDEX.md` 與 `COMMANDS-INDEX.md`
- **`README.md`**：Quick Start 段落新增「📚 Documentation」表格，列出 7 份 `docs/user/` 文件直連
- **`docs/USER-MANUAL.md`**：新增 deprecation banner 指向 `docs/user/README.md`；歸檔備份保留於 `docs/archive/`

### 移除
- **`docs/SKILL-FALLBACK-GUIDE.md`**：內容已整合至 `docs/user/TROUBLESHOOTING.md`。非 Claude Code 工具的 fallback 策略與 Skill→Core Standard 對應表保留於「Using UDS Without Claude Code」段落

## [5.11.0] - 2026-05-14

### 新增 / Added
- **`spec-driven-development`** SPEC Type Agent 變體：`acceptance-criteria-traceability.ai.yaml` 與 SDD 模板新增 `spec-type: feature | agent | infrastructure` 欄位，以及 Agent SPEC 五段式模板（能力範圍 / 決策邊界 / 可觀測性 / 失敗模式 / 跨 Agent 不變量）。讓 Builder/QA/Planner 風格的 SPEC 可獨立於 feature SPEC 追蹤，並透過新增的 `agent-id` 欄位連回特定 Agent。(XSPEC-205)
- **`reverse-engineering-standards`** 移植清單雙向驗證：新增路由驅動的發現方法（禁止以 filesystem-glob 為起點）、target→source 雙向掃描，以及對「無對應來源產物」的發現的 `[GAP]` 標記協議。搭配 `testing.ai.yaml` 新增 `migration_testing` 區段，要求以 3 步驟 schema parity pattern 並由 CI gate 強制執行。關閉 UDS Issue #96 與 #97。(XSPEC-206)

### 修復 / Fixed
- **`uds update` 對 schema 3.x manifest 誤報「CLAUDE.md.md：無法判斷來源」還原失敗**（`cli/src/utils/integration-generator.js`、`cli/src/commands/update.js`）：schema 3.x manifest 在 `manifest.integrations` 存的是**檔名**（如 `"CLAUDE.md"`）而非工具名。`integration-generator.js:56` 的 `getToolFileName` fallback 無條件附加 `".md"`，導致 `getToolFilePath("CLAUDE.md")` 回傳 `"CLAUDE.md.md"`，被當成遺失檔案而無法還原（`getSourcePathFromRelative` 對該合成路徑沒有 mapping）。Commit `79532b3`（5.10.0）修了反向案例（工具名輸入），但漏這個檔名變體。修補：從 `SUPPORTED_AI_TOOLS` 預計算 `KNOWN_TOOL_FILES`，對已知整合檔名或已含已知副檔名（`.md`/`.yaml`/`.yml`/`.json`）的輸入短路回傳。`integration-generator.test.js` 新增 5 個 regression test。(XSPEC-208 BUG-208-01)
- **`uds update` / `uds check` 誤報「Integration UDS Block Integrity：GEMINI.md/AGENTS.md 遺失」警告**（`cli/src/commands/update.js`、`cli/src/i18n/messages.js`）：`manifest.integrationBlockHashes` 每次安裝都累加但從不清理。當 `manifest.aiTools` 縮減（如 `["claude-code","gemini-cli"]` → `["claude-code"]`），GEMINI.md 的 hash 仍殘留，`check.js:1491 checkIntegrationBlocksIntegrity` 誤報該檔遺失。修補：在 integration 重生步驟後，依 `manifest.aiTools`（宣告的設定，而非 `results.integrations`，後者在暫時性寫入失敗時會 over-prune）反推預期檔名集合並移除孤兒 hash。被清理的檔名透過新增 i18n key `prunedOrphanedBlockHashes`（en / zh-TW / zh-CN）回報。`update.test.js` 新增 3 個 regression test。在 machine-setup `uds update` 5.1.0-beta.4 → 5.10.0 觸發；於 5.10.0 → 5.11.0 驗證修復。(XSPEC-208 BUG-208-02)

## [5.10.0] - 2026-05-13

### 新增
- **`multi-environment-e2e-testing`**（`ai/standards/multi-environment-e2e-testing.ai.yaml`）：新增多部署目標 E2E 測試設定標準。核心原則：「執行指令即文件」。涵蓋：BASE_URL 內嵌於測試框架設定（不依賴 .env）；各環境含自我檢查前置條件的 runner 腳本；環境能力矩陣 commit 至 repo；CI Gate 映射；憑證處理規則。關閉 UDS Issue #95。（XSPEC-204）

### 修改
- **`mock-boundary`**（v1.0.0 → v1.1.0）：新增 Level 1 / Level 2 mock 層次區分。Level 1 = 程式碼級 mock，受 STUB 標記規則管制。Level 2 = 基礎設施級 stub server（WireMock、MockSoap），受環境分層規則管制，**不受** STUB 部署封鎖規則管轄。新增 `external_dependency_testability_matrix` 模板（✅/⚠️/❌ 各服務 × 環境）。新增規則：`level-2-stub-server-rules`、`no-stub-server-in-prd`。關閉 UDS Issue #94 盲點二。（XSPEC-204）
- **`deployment-standards`**（v1.0.0 → v1.1.0）：新增 `environment_stratification_matrix` 區塊——有外部依賴的專案必須在測試計畫階段建立此矩陣；模板包含 10 大流程 × 三層環境對照表。新增 `stub_server_cicd_rules` 區塊——選項 A（sidecar 部署）/ 選項 B（推遲至 PRD Smoke）；production artifact 排除規則；PRD 禁止規則；禁止狀態定義。關閉 UDS Issue #94 盲點一與盲點三。（XSPEC-204）
- **`verification-evidence`**（v1.0.0 → v1.1.0）：新增 Iron Law（環境維度）：有外部服務依賴的 AC 驗收證據必須標明 `environment_layer`。在 evidence format 新增 `environment_layer` 欄位（有外部服務依賴的功能為必填）。新增規則 VE-005、VE-006。（XSPEC-204）
- **`test-completeness-dimensions`**（v1.2.0 → v1.3.0）：新增第 11 維度：**環境可驗證性（Environment Verifiability）**——有外部服務依賴的 AC 須標明最低可驗證環境層次（local/UAT/PRD），追蹤 PRD-only 項目，要求 smoke 測試計畫。更新功能類型對照：外部整合 → [1,3,7,11]；新增類型「外部依賴工作流程」→ [1,3,4,5,9,10,11]。更新 use-checklist 規則。（XSPEC-204）

### 修正
- **`uds update` 整合工具名稱誤當檔案路徑的假警報**：`manifest.integrations` 包含 `"claude-code"`、`"opencode"` 等工具識別碼時，update 指令將其直接推入 `allTrackedFiles` 當作檔案路徑，導致 `existsSync("claude-code")` 回傳 false，觸發假的「⚠ N 個檔案缺失」警告與「✗ claude-code: 無法判斷來源」還原失敗。修正方式：先用 `getToolFilePath(int)` 轉換為真實路徑（如 `"CLAUDE.md"`）再推入清單；無法對應的 entry 跳過。問題出現於 `uds update` 5.7.2 → 5.8.0。

## [5.9.0] - 2026-05-13

### 新增
- **`feature-discovery-standards`**（`ai/standards/feature-discovery-standards.ai.yaml`、`core/feature-discovery-standards.md`）：新增標準，定義遺留系統功能窮舉發現的語言無關方法論。確立 **Deterministic-First 原則**（AI 在 Discovery Phase 禁止透過推論產生功能清單）。定義七種軟體形式分類法（web/cli/gui/daemon/library/mobile/embedded），各含偵測信號與提取工具。定義五個靜態地基（入口點→呼叫圖→字串挖掘→資源檔→外部介面）、動態觀察協議（三平台）、人力觀察協議（confidence: 0.7 規則）與多層交叉比對矩陣模板。流水線位置：Discovery → feature-manifest → behavior-snapshot。（XSPEC-202）
- **`ai/language-packs/language-pack-php-to-csharp.ai.yaml`**：UDS 首個語言包，提供 PHP→C#（ASP.NET Core）移植風險標籤，含 7 個標籤（SESSION_HANDLING、ORM_DIFFERENCES、TIMEZONE_HANDLING、FILE_UPLOAD_PATH、REGEX_DIFFERENCES、ARRAY_FUNCTIONS、EXCEPTION_HIERARCHY）各附詳細說明。（XSPEC-203）
- **`ai/language-packs/README.md`**：語言包命名規範、使用指南與貢獻說明。（XSPEC-203）

### 變更
- **`feature-manifest-standard`**（v1.0.0 → v1.1.0）：重構 `migration_risks` 為語言無關架構。移除硬編的 `php_to_csharp` 區塊（已移入 `ai/language-packs/`）。新增 `language_packs` Extension Point（`extension_point: true`）。新增三個通用風險標籤：CONCURRENCY_MODEL、PACKAGE_ECOSYSTEM、TYPE_SYSTEM。（XSPEC-203）
- **`behavior-snapshot`**（v1.0.0 → v1.1.0）：從純 HTTP 擴充為多模態格式。新增 `adapter` 欄位（預設 `http`，向下相容）。新增 `adapters` 區段，含 4 種 schema：`http` / `cli` / `file` / `event`。新增 `adapter-selection` 與 `backward-compatibility` 規則。現有不含 `adapter` 欄位的 HTTP 快照無需修改。（XSPEC-203）

## [5.8.0] - 2026-05-12

### 新增
- **`feature-manifest-standard`**（`ai/standards/feature-manifest-standard.ai.yaml`、`core/feature-manifest-standard.md`）：新增標準，定義移植/重構專案的 FM-NNN 機器可讀功能盤點格式。含信心評分、移植風險標籤（PHP→C#）、`FEATURE_STUB:` 標記協議與 Gate 1 完整性閘門。（XSPEC-200）
- **`behavior-snapshot`**（`ai/standards/behavior-snapshot.ai.yaml`、`core/behavior-snapshot.md`）：新增標準，定義 HTTP 金文件快照格式，用於移植同等性驗證與重構特徵化測試。含快照結構、`ignore_fields` 指引、parity gate exit codes 與 Gate 0 特徵化測試協議。（XSPEC-201）

### 修改
- **`acceptance-criteria-traceability`**：新增第 4 個 AC 狀態 `not_implemented`（🚫）——區分「程式碼不存在」與 `uncovered`（程式碼存在但無測試）。更新覆蓋率公式（分母排除 `not_implemented`）。新增 CI blocking gate：`not_implemented_count > 0` → blocking（獨立於覆蓋率 % gate）。新增狀態分類決策樹。（XSPEC-199）

## [5.7.3] - 2026-05-08

### 修復
- **`uds update` 跳過無效 ID**（`cli/src/commands/update.js`）：display、copy、hash 重算、post-update integrity check 四個迴圈，現在會跳過 `manifest.standards` 中無法解析的 short ID（沒有 `/` 或 `.` 且 registry 無對應 entry，例如殘留的 AI 工具名稱 `claude-code`、`opencode`）。修正前，這類條目會在 `uds update` 中觸發無意義的「缺失檔案」警告與失敗的還原嘗試。

## [5.7.1] - 2026-05-08

### 修復
- **`cli/package-lock.json`**：同步 lock file，修正 GitHub Actions `npm ci` 失敗（`@emnapi/core`、`@emnapi/runtime` 條目缺失）。

### 移除
- **`specs/`**：刪除已遷移至 dev-platform 的 4 個 spec 檔案（XSPEC-026/005/006 對應）。保留 `execution-history-spec.md`（Archived）、`schemas/`、`standards-effectiveness-schema.json`。
- **`docs/archive/`**：刪除 7 個過時的遷移指南與工作流程分析文件。
- **`.project-context/`**：刪除 gemini-cli 自動生成的架構文件（內容已由 CLAUDE.md 涵蓋）。

### 新增
- **`.npmignore`**：排除 `tests/`、`scripts/`、`.github/` 等開發用目錄，不再隨 npm publish 發出（v5.7.0 前這些目錄一直被誤打包）。

## [5.7.0] - 2026-05-08

> **跨平台腳本遷移**（XSPEC-179 + XSPEC-180）：bash 腳本逐步被單一來源的
> TypeScript / Node.js ESM 等價實作取代，可在 macOS / Linux / Windows 上以
> 相同方式執行。原 `.sh` 檔保留並加上 `DEPRECATED` 警告以維持向後相容。

### 新增

- **AI 工具表格補全**（`README.md`、`locales/zh-TW/README.md`、`locales/zh-CN/README.md`）：補上五個遺漏工具——GitHub Copilot、OpenAI Codex、Aider、Continue、Google Antigravity。新增 ⚠ Minimal 狀態圖例。（`1b588e1`）
- **`scripts/bump-version.mjs`**（XSPEC-179 Phase 1）：跨平台版本升版實作，與原 `.sh` 對等。（`1a44e14`）
- **`scripts/install-hooks.mjs`**（XSPEC-179 Phase 1）：跨平台 git hooks 安裝程式；於 Windows 自動跳過 `chmod`。（`1a44e14`）
- **`scripts/pre-commit.mjs`**（XSPEC-180）：pre-commit hook 的 Node.js ESM 實作，平台分支於 Windows 呼叫 `check-translation-sync.ps1`，其他平台呼叫 `.sh`。（`1572869`）
- **7 個 TypeScript 檢查腳本**（XSPEC-179 Phase 2，`0a26d14`）：從 bash 遷移至單一 TypeScript 來源，透過 `tsx` 執行：
  - `scripts/check-ai-behavior-sync.ts`
  - `scripts/check-commit-spec-reference.ts`
  - `scripts/check-flow-gate-report.ts`
  - `scripts/check-integration-commands-sync.ts`
  - `scripts/check-registry-completeness.ts`
  - `scripts/check-release-readiness-signoff.ts`
  - `scripts/check-workflow-compliance.ts`
- **`tsx@^4.20.0`** 加入 root `devDependencies`（XSPEC-179 Phase 2，`0a26d14`）。
- **7 個 npm scripts** 串接 TypeScript 檢查腳本（`0a26d14`）：`check:ai-behavior`、`check:commit-spec`、`check:flow-gate`、`check:integration-commands`、`check:registry`、`check:release-signoff`、`check:workflow-compliance`。

### 變更

- **下游專案解耦**（6 批次，`ebe716c`–`2392c0f`）：所有公開敘述中對特定下游產品（DevAP / VibeOps）的直接引用已替換為採用層中性術語，涵蓋 130+ 個檔案。UDS 重申為純 MIT + CC BY 4.0 標準庫，與任何特定採用層無依賴關係。
- **REGISTRY**：`roo-code` integration tier 從 `planned` 升為 `partial`；AI 工具表格中將 Roo Code 獨立成列（不再與 Cline 合併）。（`1b588e1`）
- **`.githooks/pre-commit`**（XSPEC-180，`1572869`）：從 51 行 bash 縮減為 16 行 POSIX `sh` 薄殼層，將實際邏輯委派給 `scripts/pre-commit.mjs`。
- **`scripts/bump-version.mjs`**（`19ad314`）：新增 `buildCmd()` 輔助函式，於 Windows 自動切換為 PowerShell + `.ps1` 來呼叫 `check-version-sync` / `check-translation-sync`，恢復 Windows 平台對等性。
- **XSPEC-179 Phase 2 策略修訂**（`0a26d14`）：放棄先前的 `.sh` + `.ps1` 雙軌方案，改採**單一 TypeScript 來源**策略。單一 `.ts` 透過 `tsx` 在所有平台上行為一致，消除「只能在 Windows 驗證」的反饋落差。

### 棄用

- **`scripts/bump-version.sh`**（`1a44e14`）：標記為 DEPRECATED，由 `bump-version.mjs` 取代。
- **`scripts/install-hooks.sh`**（`1a44e14`）：標記為 DEPRECATED，由 `install-hooks.mjs` 取代。
- **7 個 legacy `check-*.sh` 腳本**（`0a26d14`）：對應的 `.ts` 版本（如上）已成為 canonical 實作。`.sh` 檔保留供 legacy Linux/macOS 環境使用，但不應再新增功能。

### 移除

- **`.devap/` 目錄**（`2392c0f`）：移除孤兒 DevAP dogfooding 安裝目錄。DevAP 已於 2026-04-28 退場（XSPEC-086/095）；UDS 現使用原生 `flows/commit.flow.yaml` 與 `scripts/bump-version.mjs`。

### 修復

- **`scripts/check-release-readiness-signoff.sh`**（`0a26d14`，於 TypeScript 移植時順帶修復的潛伏 bug）：原本錯誤的 `grep -c "0\n0"` 樣式（永遠無法比對到字面 `\n`）已修正，現在能可靠偵測缺漏的 sign-off 訊號。
- **`scripts/check-integration-commands-sync.sh`**（`0a26d14`，於 TypeScript 移植時順帶修復的潛伏 bug）：消除 `find` 與下游 consumer 之間 broken pipe 引發的 SIGPIPE 噪音。

## [5.3.2] - 2026-04-27

> **修補版本發布**：Bug 修復 —— `uds update -y` 現在會自動安裝/更新 Skills 和 Commands，不再只顯示提示訊息。

### 修復
- **`uds update --yes` / `-y`**（`cli/src/commands/update.js`）：`--yes` 旗標先前對 Skills 和 Commands 安裝完全跳過，只顯示「New features available」提示。現在與互動模式行為一致 —— 缺少的 Skills/Commands 立即安裝，過時的直接更新，並同步刷新 manifest 與整合檔案。修復了 `uds update -y` 讓 `.claude/` Skills 保持不變而互動式 `uds update` 正常更新的行為差異。

## [5.3.1] - 2026-04-27

> **修補版本發布**：Bug 修復 —— `uds update` 後 `uds check` 不再誤報「AGENTS.md 標準不同步」。

### 修復
- **`generateAgentsMdSummary()`**（`integration-generator.js`）：移除導致 AGENTS.md 只列出 30 項標準的 `.slice(0, 30)` 截斷。`uds check` 與 manifest 全量標準比對，截斷導致永遠誤報 `30/64 out of sync`。現在列出全部已安裝標準，check 正常通過。

## [5.3.0] - 2026-04-26

> **次版本發布**：四個新標準 + 一個新 Skill（XSPEC-085/064）—— `no-cicd-deployment`、`rollback-standards`、`cd-deployment-strategies`、`pipeline-security-gates`，以及無 CI/CD 環境的 `/deploy` Skill。標準總數：136。

### 新增
- **`no-cicd-deployment.ai.yaml`**（XSPEC-085 Phase 1）：無 CI/CD 平台的三層部署架構 — `set -euo pipefail` + deploy.lock + 版本 tag 強制；Smoke Test + 自動 rollback；Blue-Green 切換 <30 秒。
- **`rollback-standards.ai.yaml`**（XSPEC-064 Phase 1）：Rollback 觸發條件矩陣 — 自動（error rate >2× baseline）、輔助（SLO 違反）、手動（延遲在 SLO 內）。Error budget <10% 升級為自動。P0–P3 嚴重級別與 SLA。
- **`cd-deployment-strategies.ai.yaml`**（XSPEC-064 Phase 1）：部署策略選用矩陣 — blue-green / canary / rolling / recreate 決策樹（流量 × 風險 × 成本）。含無 CI/CD 相容性說明。
- **`pipeline-security-gates.ai.yaml`**（XSPEC-064 Phase 1）：CI 安全檢查點 — pre-commit secrets 掃描、post-build SAST、post-staging DAST、package 階段 SCA+SBOM。Critical/High 阻擋 pipeline；Medium 需要審核。
- **`/deploy` Skill**（`skills/deploy-assistant/`，XSPEC-085 Phase 1b）：無 CI/CD 互動式部署腳本生成器，含繁體中文本地化翻譯。

## [5.2.0] - 2026-04-24

> **次版本發布**：三項新標準/技能（XSPEC-080/081/082）—— `/release package` 子命令、`/push` 品質守門 Skill、以及 `agent-behavior-discipline` 標準（Karpathy 四大原則：問/減/準/測）。Bundle 一致性加固。文件集中至 dev-platform。標準總數：74。

### 新增
- **`agent-behavior-discipline.ai.yaml`**（Trial 試驗期至 2026-10-24，XSPEC-082 / DEC-048）：新治理標準，系統化整合 Andrej Karpathy 提煉的四大 AI Agent 行為紀律——問（執行前揭露假設）、減（最小充分代碼）、準（精準修改邊界）、測（定義可驗證成功標準 + 自我修正循環）。已加入 `uds-manifest.json`（第 74 個標準）及 `cli/standards-registry.json`。
- **`/push` Skill**（`skills/push/`，XSPEC-081）：Git Push 品質守門與跨人協作護欄——受保護分支偵測、force-push 護欄、pre-push gate 驗證、push 稽核日誌、PR 整合入口。包含兩個配置選項：`options/push/single-owner-mode.ai.yaml`（單人倉庫簡化護欄）和 `options/push/team-mode.ai.yaml`（團隊全護欄，需確認）。
- **`/release package` 子命令**（`skills/release/`，XSPEC-080）：10 種目標格式的打包指引——npm/Node.js、Python/PyPI、Go 二進位、Electron App、Homebrew（Wave 1）+ Rust/Cargo、Tauri 桌面、Docker 映像、VS Code Extension、GitHub Release 資產（Wave 2）。偵測優先設計：自動偵測專案類型再套用打包步驟。

### 修正
- **Bundle 一致性**（XSPEC-072 Phase 2）：解決 `ai/standards/` 與 `bundle/` 之間的差異——74 個標準現在全部納入 bundle。CI 硬性失敗（exit 1）於任何差異，防止靜默的 bundle 落差。
- **i18n NO META frontmatter**（BUG-A06）：補齊 36 個翻譯檔案缺少的 YAML frontmatter，修復翻譯同步驗證誤報。

### 變更
- **文件集中化（DEC-047 Batch 2）**：UDS 規劃/治理文件已遷移至 AsiaOstrich dev-platform 規劃中心，不再隨 UDS 發布：
  - `docs/AI-AGENT-ROADMAP.md`、`docs/OPERATION-WORKFLOW.md`、`docs/internal/` 下四份文件已移除
  - `locales/zh-TW/docs/`、`locales/zh-CN/docs/` 副本亦已移除

[5.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.1...v5.2.0

## [5.1.1] - 2026-04-20

> **修補版本**：Windows CI 修正、53 個 SKILL.md 補 `name` 欄位、三份 `.md` 源文件依 BUG-A08 事後分析新增規則、zh-TW/zh-CN 翻譯同步。

### 修正
- **`cli/src/utils/directory-mapper.js`**：以 `path.basename(dir)` 取代 `dir.split('/').pop()`，修正 Windows CI 路徑分隔符相容性問題（修復 Windows CI runner 上 `directory-mapper.test.js` 測試失敗）。

### 新增
- **`name` 欄位** 補齊至 9 個源目錄 `skills/*/SKILL.md` 及 44 個 `locales/zh-TW/skills/*/SKILL.md`，符合 Skill 驗證工具需求。

### 變更
- **`core/test-governance.md`** 1.0.0 → 1.1.0：新增 `test-execution-continuity` 規則（BUG-A08 事後分析 — 22 個測試存在但未連接任何 CI 執行觸發器）。
- **`core/checkin-standards.md`** 1.5.0 → 1.6.0：新增舊版專案檔案同步（`project-file-sync`）章節 — 磁碟上的每個源文件必須登錄於舊版專案 manifest 中。
- **`core/testing-standards.md`** 3.1.0 → 3.2.0：新增 E2E 前置條件範圍（`e2e-precondition-scope`）章節 — E2E 前置檢查必須驗證所有受測頁面/端點，而非僅驗證認證入口。
- **zh-TW 與 zh-CN 翻譯** 已同步 `test-governance.md`、`checkin-standards.md`、`testing-standards.md` 三份文件。

[5.1.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.0...v5.1.1

## [5.1.0] - 2026-04-20

> **正式版**：BUG-A06 i18n 完整性 — 新增 32 份缺失翻譯、Semver 感知翻譯閘門、新增 `translation-lifecycle-standards` UDS 標準。BUG-A07 Shell 測試覆蓋 — 20+ 腳本的 bats smoke tests。BUG-A08 假通過測試稽核 — 修正 22 個測試。Pre-release Batch 0：6 個標準從 Trial 升至 Adopt（DEC-021/025/031/035/038/040）。標準總數：106 個。

### 新增
- **`translation-lifecycle-standards`**（Trial，到期 2026-10-20）：新 UDS 標準，定義 MISSING 與 OUTDATED 的區別、Semver 嚴重度分級（MISSING/MAJOR = 發布阻塞器，MINOR/PATCH = advisory），以及自動化整合（pre-commit hook、release gate、bump-version 整合）。來源：BUG-A06 事後分析。
- **`.githooks/pre-commit`** + **`scripts/install-hooks.sh`**：commit 時若暫存 `core/*.md` 檔案則顯示 OUTDATED 警告，永不阻塞 commit。透過 `./scripts/install-hooks.sh` 啟用。
- **32 份 zh-TW 與 zh-CN 翻譯**（BUG-A06）：所有核心標準現已有完整 zh-TW 和 zh-CN 翻譯，包含 `circuit-breaker`、`token-budget`、`dual-phase-output`、`failure-source-taxonomy`、`immutability-first`、`security-decision`、`capability-declaration`、`recovery-recipe-registry`、`retry-standards`、`health-check-standards`、`timeout-standards`、`skill-standard-alignment-check`、`standard-admission-criteria`、`standard-lifecycle-management`、`packaging-standards`、`frontend-design-standards`、`translation-lifecycle-standards` 等。
- **bats smoke tests**（BUG-A07）：`tests/scripts/` — 20+ 個 Shell 腳本的 smoke tests，涵蓋 `check-translation-sync.sh`、`check-version-sync.sh`、`bump-version.sh`、`install-hooks.sh` 等。

### 變更
- **`check-translation-sync.sh`**：Semver 感知嚴重度 — MAJOR 版本落差現在 exit 1（發布阻塞器）；MINOR/PATCH 落差 exit 0 附 advisory 警告。新增 `semver_diff()` 函式與 `[MAJOR]`/`[MINOR]`/`[PATCH]` 嚴重度標籤。
- **`bump-version.sh`**：更新版本檔案後自動執行 `check-translation-sync.sh`，在升版時提供翻譯健康狀態快照。
- **`scripts/pre-release-check.sh`**：更新為將 `check-translation-sync.sh` 作為硬閘門（MISSING + MAJOR = exit 1）。

### 修正
- **zh-CN `anti-hallucination.md`**（BUG-A06）：從 1.5.0 更新至 1.5.1 — 補上缺失的「Agent 认识论校准」章節（Answer/Ask/Abstain 框架，XSPEC-008）。該章節自 2026-04-13 起在 zh-CN 中完全缺失。
- **22 個假通過測試**（BUG-A08）：修正未正確驗證行為的測試，加入真實斷言。

### 升至 Adopt（Pre-release Batch 0）
- `circuit-breaker`（DEC-021）：Trial 6 個月後升至 Adopt
- `token-budget`（DEC-025）：Trial 6 個月後升至 Adopt
- `dual-phase-output`（DEC-031）：Trial 6 個月後升至 Adopt
- `security-decision`（DEC-035）：Trial 6 個月後升至 Adopt
- `immutability-first`（DEC-038）：Trial 6 個月後升至 Adopt
- `failure-source-taxonomy`（DEC-040）：Trial 6 個月後升至 Adopt

[5.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.1.0-beta.7...v5.1.0

## [5.1.0-beta.7] - 2026-04-17

> **Beta Release**：DEC-043 Wave 1 — 六個 Trial 狀態標準，涵蓋可靠性模式與治理 Meta 框架。

### 新增
- **Reliability 包（XSPEC-067）**：三個 Trial 狀態的韌性模式標準。
  - `retry-standards`：重試策略（指數退避、Jitter、冪等性保護）。
  - `timeout-standards`：分層 timeout 預算（call / request / end-to-end）與傳遞規則。
  - `health-check-standards`：Liveness / Readiness / Startup probe 語義。
- **治理 Meta 包（XSPEC-070，Wave 1 前置）**：三個定義「標準如何被納入、管理、與 Skill 對齊」的 Trial 標準。
  - `standard-admission-criteria`：新標準提案的入場門檻。
  - `standard-lifecycle-management`：Trial → Stable → Deprecated → Archived 狀態流轉。
  - `skill-standard-alignment-check`：Skill 與其引用標準之間的對齊稽核。
- 六份標準皆遵循 UDS 三方同步要求：`.ai.yaml`（機器）+ `.md`（人類）+ `cli/standards-registry.json` entry（+66 行）。

### 背景
- 由 **DEC-043**（UDS 覆蓋完整性路線圖）驅動。治理 Meta 包為 Wave 1 前置條件，解鎖 Wave 2–4（八個主題標準包：SRE / CI-CD / IaC / 合規 / Reliability / 資料工程 / 產品 / 治理 — XSPEC-063~070）。
- PR：#77

## [5.1.0-beta.6] - 2026-04-13

> **Beta 版本**：修復 `uds init` 當機問題、E2E 測試隔離問題，以及 macOS 顯示語言偵測失效問題。

### 修復

- **`uds init --yes` 當機**（`manifest-installer.js`）：`contentMode: 'auto'` 未被 `|| 'minimal'` 後備值攔截，導致 Schema 驗證失敗，`manifest.json` 無法寫入
- **macOS 顯示語言被忽略**：新增 `~/.udsrc ui.language` 的讀取，修復英文語系 macOS 忽略使用者語言偏好的問題
- **E2E 測試隔離**（`cli-runner.js`）：所有子行程 spawn 改以獨立的 `TEST_HOME_DIR` 覆蓋 `HOME`，消除開發者 `~/.udsrc` 對測試輸出的干擾
- **E2E 計數斷言**（`update-flow.test.js`）：過濾 `manifest.standards` 僅計算 `.ai.yaml` 檔案，排除 `.md` 範本檔案的干擾

### 新增

- **認知校準框架**（XSPEC-008）：反幻覺標準新增認知校準框架章節
- **`/e2e-assistant` Skill**：從 BDD Gherkin 場景自動生成 E2E 測試骨架的互動式技能
- **`/process-to-skill` Skill**：Process-to-Skill 治理框架技能
- **`execution-history.ai.yaml`**：同步至 XSPEC-003-SDD 規格格式

## [5.1.0-beta.5] - 2026-04-10

> **Beta 版本**：大規模 CLI 擴展（SDLC Flow Engine、Standards-as-Hooks 編譯器、分層 CLAUDE.md、SuperSpec Phase 4、opt-in 遙測上傳）與 Skill 治理框架（/process-to-skill、DEC 評估框架）。

### 新增

**新功能 — CLI & 標準**
- **opt-in 遙測上傳**（SPEC-TELEMETRY-002）：Hook 執行結果可選擇性上傳至遠端分析端點；雙重防護（`telemetryUpload=true` + `telemetryApiKey` 非空）；SHA-256 匿名 user_id，不含個人資料
- **DEC 借鑲評估框架**（XSPEC-014 Layer 1）：技術雷達、假設書、Reversal DEC 三大評估工具，支援借鑲決策記錄
- **SuperSpec Phase 4 — 收尾功能**（XSPEC-005）：`uds spec archive`、`uds spec search`、`uds spec quickstart`、`uds spec split`
- **SuperSpec Phase 2 — 驗證管線**：`spec-linter`、品質評分（0-100 分）、`context sync`
- **spec 大小閘門**（AC-3）：`validateSpecSize()` — 超過 600 行觸發警告，超過 1200 行阻擋提交
- **YAML 標準擴展**（AC-18）：`.standards/*.ai.yaml` 支援 `enforcement` 區塊與 `required_fields`
- **SDLC Flow Engine**（SPEC-FLOW-001）：自訂工作流程引擎，含狀態機持久化、可插拔品質閘門、Export/Import
- **Standards-as-Hooks 編譯器**（SPEC-COMPILE-001）：`uds compile` — 自動將 YAML enforcement 區塊轉譯為 hook 腳本
- **分層 CLAUDE.md**（SPEC-LAYERED-001）：`uds init --content-layout` 支援多層目錄獨立 CLAUDE.md
- **Hook 整合**（SPEC-HOOKS-001）：`uds init --with-hooks` 一鍵安裝 hook 腳本
- **Hook 執行遙測**（SPEC-TELEMETRY-001）：本地端 hook 執行統計，寫入 `.uds/hook-stats.jsonl`
- **執行歷史倉庫標準**（`execution-history`）：AI Agent 跨對話持久化記憶標準
- **`/e2e` 斜線命令**（SPEC-E2E-001）：從 BDD Gherkin 場景自動生成 E2E 測試骨架
- **`/process-to-skill` Skill**（XSPEC-020）：Process-to-Skill 治理框架；3-Times Rule；Simple/Complex/Delta 決策樹
- **Skill 治理模板**：`templates/SKILL-CANDIDATES.md`、`templates/SKILL-BRIEF-TEMPLATE.md`
- **Integration Commands Sync**（SPEC-INTSYNC-001）：自動偵測 AI 工具整合檔是否引用所有斜線命令
- `COMMAND-INDEX.json`：47 個 commands 的 Single Source of Truth
- `/derive` 擴展：感知 `test_levels`；支援 IT + E2E 測試推演（SPEC-DERIVE-001）
- **三個核心標準新增 `enforcement` 區塊**：`commit-message-guide`、`testing-standards`、`checkin-standards`

**文件與規格**
- 批次歸檔 28 個已完成的 orphan specs 為 Archived 狀態
- 歸檔 6 份規格：SPEC-TELEMETRY-001、SPEC-COMPILE-001、SPEC-LAYERED-001、SPEC-HOOKS-001、SPEC-FLOW-001、SPEC-E2E-001

### 變更
- `REGISTRY.json`：所有 tier 新增 `requiredCategories` 欄位
- `REGISTRY.json`：Cursor 從 `complete` 降為 `partial` tier
- `spec dependency tracking`：新增 `depends_on` 欄位與 dual mode 支援

### 修復
- `check-orphan-specs.sh`：排除 traceability 文件的誤判
- `check-orphan-specs.sh`：修復支援 list 前綴和中文狀態欄位的 regex

### 雜項
- `.gitignore`：新增 `.workflow-state/`
- 移除 11 個測試檔案中過時的 `[TODO]` 標記

## [3.5.0-beta.13] - 2026-01-13

### 新增
- **CLI**：將 OpenCode 加入 skills 相容工具
  - `uds init` 現在將 OpenCode 視為 Claude Code 處理，提供精簡安裝
  - `uds check` 顯示 OpenCode skills 相容性狀態
  - Skills 自動安裝到 `.claude/skills/`（OpenCode 自動偵測此路徑）
- **文件**：在 skills-mapping.md 新增跨工具相容性章節
  - 7 個 AI Agent 的路徑對照表（Claude Code、OpenCode、Cursor、OpenAI Codex、GitHub Copilot、Windsurf、Cline）
  - 說明 UDS 為何使用 `.claude/skills/` 作為預設路徑
  - 不相容工具的跨工具安裝說明
- **文件**：重構 README 建立獨立的 Agent Skills 安裝章節
  - 將 skills 安裝方法整合在一處
  - 新增社群 marketplace（n-skills、claude-plugins.dev、agentskills.io）
- **文件**：新增 beta 版本安裝說明
  - `npm install -g universal-dev-standards@beta`
  - `npx universal-dev-standards@beta init`

### 變更
- **文件**：更新 integrations/opencode/ 文件
  - 版本 1.4.0 包含跨工具相容性資訊
  - 雙語翻譯同步（zh-TW、zh-CN）

## [3.5.0-beta.12] - 2026-01-13

### 新增
- **文件**：新增使用模式比較文件
  - 比較僅 Skills vs 僅規範文件 vs 兩者並用
  - 包含功能覆蓋率、Token 效率、和建議
  - 雙語支援（英文和繁體中文）
  - 參見 `docs/USAGE-MODES-COMPARISON.md`
- **文件**：重構 README 安裝文件
  - npm CLI 作為主要安裝方式
  - AI 工具擴充作為可選功能
  - 完整列出 9 個支援的 AI 工具及正確狀態

### 修復
- **CLI**：修復 detector.js 缺失的 AI 工具偵測
  - 現在可偵測全部 9 個 AI 工具：Claude Code、Cursor、Windsurf、Cline、GitHub Copilot、Antigravity、Codex、OpenCode、Gemini CLI
  - 修復 `uds init` 時的自動偵測功能

## [3.5.0-beta.11] - 2026-01-12

### 新增
- **文件**：在 README 新增功能可用性表格
  - 清楚比較穩定版 (3.4.2) 與 beta 版 (3.5.x) 功能
  - 以 🧪 標記實驗性功能
  - 雙語支援（英文和繁體中文）

### 修復
- **i18n**：為 6 個翻譯檔案新增缺失的 YAML front matter
  - `docs/CLI-INIT-OPTIONS.md`
  - `skills/commands/bdd.md`
  - `skills/commands/methodology.md`
  - `skills/dev-methodology/SKILL.md`
  - `skills/dev-methodology/create-methodology.md`
  - `skills/dev-methodology/runtime.md`
- **文件**：更新穩定版本參考從 3.3.0 至 3.4.2

## [3.5.0-beta.10] - 2026-01-12

### 新增
- **方法論系統**：新增完整開發方法論支援
  - 內建方法論：TDD、BDD、SDD、ATDD
  - YAML 格式方法論定義，含 JSON Schema 驗證
  - 階段追蹤、檢查清單和檢查點
  - 自訂方法論模板，支援團隊特定工作流
  - `/methodology` 命令：狀態、切換、階段管理
  - CLI 整合：`uds init` 和 `uds configure` 方法論選擇
- **命令**：新增 `/bdd` 行為驅動開發命令
  - 完整 BDD 工作流：探索 → 制定 → 自動化 → 活文件
  - Gherkin 格式範例和三劍客會議引導
  - 階段檢查清單和指示器
- **命令**：整合 `/tdd` 與方法論系統
  - 調用時自動啟用 TDD 方法論
  - 顯示階段指示器（🔴 紅燈、🟢 綠燈、🔵 重構）
- **文件**：新增方法論系統雙語文件
  - 英文和繁體中文翻譯
  - SKILL.md、runtime.md、create-methodology.md

### 變更
- **Skills**：更新安裝腳本以包含 methodology-system（共 16 個 skills）
- **Registry**：在 standards-registry.json 新增 methodologies 區塊

## [3.5.0-beta.9] - 2026-01-11

### 新增
- **腳本**：新增統一預發布檢查腳本
  - `scripts/pre-release-check.sh` 適用於 Unix/macOS
  - `scripts/pre-release-check.ps1` 適用於 Windows PowerShell
  - 單一指令執行所有 7 項驗證檢查
  - 選項：`--fail-fast`、`--skip-tests`
- **CI**：在 GitHub Actions 發布工作流程中新增預發布驗證
  - 在 npm publish 前執行版本同步、標準同步、linting 和測試
  - 任何檢查失敗則阻止發布

### 變更
- **文件**：在 release-workflow.md 新增「自動化預發布檢查」區塊
- **文件**：在 CLAUDE.md 的快速指令中加入 pre-release-check.sh

## [3.5.0-beta.8] - 2026-01-11

### 修復
- **CLI**：修復 `standards-registry.json` 版本不一致問題
  - 同步 `standards-registry.json` 版本與 `package.json`（之前停留在 3.5.0-beta.5）
  - 這導致 `uds update` 顯示過時的「最新版本」資訊

### 變更
- **發布**：將版本同步檢查加入預發布檢查清單
  - 在自動化驗證區塊新增 `./scripts/check-version-sync.sh` 驗證步驟
  - 防止未來版本不一致問題

## [3.5.0-beta.7] - 2026-01-11

### 修復
- **CLI**：修復 Windows 未追蹤檔案偵測的路徑分隔符問題
  - 在 `scanDirectory` 函數中標準化路徑分隔符為正斜線
  - 確保比對 manifest 路徑時的跨平台一致性

## [3.5.0-beta.6] - 2026-01-11

### 新增
- **文件**：新增 18 個 `options/` 目錄的人類可讀 Markdown 檔案
  - `options/changelog/`：keep-a-changelog.md、auto-generated.md
  - `options/code-review/`：pr-review.md、pair-programming.md、automated-review.md
  - `options/documentation/`：api-docs.md、markdown-docs.md、wiki-style.md
  - `options/project-structure/`：kotlin.md、php.md、ruby.md、rust.md、swift.md
  - `options/testing/`：contract-testing.md、industry-pyramid.md、istqb-framework.md、performance-testing.md、security-testing.md
  - 完成雙格式架構：`ai/options/*.ai.yaml` 供 AI 工具使用，`options/*.md` 供人類開發者使用
- **AI 標準**：新增 `ai/standards/test-driven-development.ai.yaml`
  - AI 優化的 TDD 標準，含 Red-Green-Refactor 循環
  - FIRST 原則與適用性指南
- **文件**：新增完整的 CLI init 選項指南（三語支援）
  - `docs/CLI-INIT-OPTIONS.md` - 完整的 `uds init` 選項文件
  - 涵蓋：AI 工具、技能位置、標準範圍、採用等級、格式、標準選項、擴充、整合配置、內容模式
  - 包含使用案例、決策流程和 CLI 參數參考
  - 三語版本：英文、繁體中文 (`locales/zh-TW/`)、簡體中文 (`locales/zh-CN/`)
- **發布**：將 CLI 文件新增至預發布檢查清單
  - `release-workflow.md` 現在包含 CLI-INIT-OPTIONS.md 驗證
- **發布**：將標準一致性檢查新增至預發布檢查清單
  - 驗證 `core/` ↔ `ai/standards/` 內容對齊
  - 驗證 `options/` ↔ `ai/options/` 雙格式完整性
- **腳本**：新增自動化標準一致性檢查腳本
  - `scripts/check-standards-sync.sh` 用於 Unix/macOS
  - `scripts/check-standards-sync.ps1` 用於 Windows PowerShell
  - 檢查 `core/` ↔ `ai/standards/` 和 `options/` ↔ `ai/options/` 一致性

### 變更
- **CLI**：改進整合產生器的 minimal 內容模式
  - Minimal 模式現在包含簡化的標準參考清單
  - 確保 AI 工具即使在 minimal 模式下也知道有哪些標準可用
  - 新增 `generateMinimalStandardsReference()` 函數
- **CLI**：優化 `uds init` 提示訊息
  - 統一所有提示的標題格式
  - 改善術語：Starter/Professional/Complete（等級）、Compact/Detailed（格式）、Standard（內容模式）、Lean（標準範圍）
  - 增強顏色標示：推薦選項使用綠色
  - 簡化選擇後的說明文字

## [3.5.0-beta.5] - 2026-01-09

### 新增
- **CLI**：增強 AI 工具整合，自動符合標準
  - 支援 9 個 AI 工具：Claude Code、Cursor、Windsurf、Cline、GitHub Copilot、Google Antigravity、OpenAI Codex、Gemini CLI、OpenCode
  - 新增內容模式選擇：`full`、`index`（推薦）、`minimal`
  - 產生標準合規指示，含 MUST/SHOULD 優先順序
  - 產生標準索引，列出所有已安裝標準
  - 處理 Codex 和 OpenCode 之間的 `AGENTS.md` 共享
- **CLI**：增強 `uds configure` 命令
  - 新選項：AI 工具 - 新增/移除 AI 工具整合
  - 新選項：採用等級 - 變更 Level 1/2/3
  - 新選項：內容模式 - 變更 full/index/minimal
  - 設定變更時自動重新產生整合檔案
- **CLI**：增強 `uds update` 命令
  - 新旗標：`--integrations-only` - 只更新整合檔案
  - 新旗標：`--standards-only` - 只更新標準檔案
  - 標準更新時自動同步整合檔案
- **CLI**：增強 `uds check` 命令
  - 新區段：AI 工具整合狀態
  - 驗證整合檔案存在且正確參考標準
  - 回報缺少的標準參考並提供修復建議
- **Skills**：新增 `/config` 斜線命令用於標準配置

### 變更
- **CLI**：整合檔案現在預設包含合規指示和標準索引（index 模式）

## [3.5.0-beta.4] - 2026-01-09

### 新增
- **CLI**：AI 整合檔案的參考同步功能
  - `uds check` 現在顯示「參考同步狀態」區段
    - 偵測孤立參考（整合檔案中的參考不在 manifest 中）
    - 回報缺少參考（manifest 中的標準未被參考）
  - `uds update --sync-refs` 根據 manifest 標準重新產生整合檔案
  - manifest 中新增 `integrationConfigs` 欄位以保存產生設定
- **Utils**：新增 `reference-sync.js` 模組，含類別對標準的對應

### 變更
- **CLI**：Manifest 版本從 3.1.0 升級至 3.2.0
  - 新增 `integrationConfigs` 欄位儲存整合檔案產生設定
  - 允許 `uds update --sync-refs` 使用相同選項重新產生（類別、詳細等級、語言）

## [3.5.0-beta.3] - 2026-01-09

### 修復
- **CLI**：修復 `uds update` 顯示錯誤版本號
  - `standards-registry.json` 版本與 `package.json` 未同步
  - 現在顯示正確的當前和最新版本資訊

### 新增
- **腳本**：新增版本同步檢查腳本
  - `scripts/check-version-sync.sh` 用於 Unix/macOS
  - `scripts/check-version-sync.ps1` 用於 Windows PowerShell
  - 驗證 `standards-registry.json` 版本與 `package.json` 一致
- **文件**：將版本同步檢查新增至 `release-workflow.md` 預發布檢查清單

## [3.5.0-beta.2] - 2026-01-09

### 新增
- **整合**：OpenAI Codex CLI 整合，使用 `AGENTS.md`
- **整合**：Gemini CLI 整合，使用 `GEMINI.md`
- **整合**：OpenCode 整合，使用 `AGENTS.md`
- **整合**：Google Antigravity 專案級規則檔案 (`.antigravity/rules.md`)

### 移除
- **CLI**：從 `uds check` 移除未追蹤檔案掃描
  - `uds check` 現在只驗證 manifest 中記錄的檔案
  - 不再提示追蹤 `.standards/` 目錄中的未知檔案

## [3.5.0-beta.1] - 2026-01-09

### 新增
- **CLI**：新增 `uds configure` 命令用於後安裝配置
  - 子命令：`add-tool`、`remove-tool`、`set-level`
  - 互動模式支援
- **CLI**：改進 `uds init` 流程
  - 新增 AI 工具選擇提示
  - 新增整合檔案配置選項
- **CLI**：manifest 版本升級至 3.2.0
  - 新增 `aiTools` 欄位追蹤選擇的 AI 工具
  - 新增 `integrations` 欄位列出產生的整合檔案

### 變更
- **CLI**：重構整合產生器以支援多 AI 工具
- **CLI**：改進錯誤處理和使用者回饋

## [3.4.1] - 2026-01-08

### 修復
- **CLI**：修復 `uds update` 建議從較新版本降級的問題
  - 新增正確的語義版本比較，支援預發布版本（alpha/beta/rc）
  - 現在能正確識別當前版本比 registry 版本更新的情況
  - 當使用者版本比 registry 更新時顯示提示訊息
- **CLI**：更新 `standards-registry.json` 版本與 package.json 一致

## [3.4.0] - 2026-01-08

### 新增
- **CLI**：`uds check` 新增基於雜湊值的檔案完整性檢查
  - 透過比較 SHA-256 雜湊值偵測修改的檔案
  - 新增選項：`--diff`、`--restore`、`--restore-missing`、`--no-interactive`、`--migrate`
  - 互動模式：偵測到問題時提示操作（檢視差異、還原、保留、跳過）
  - 舊版 manifest 遷移：`uds check --migrate` 升級至基於雜湊值的追蹤
- **CLI**：manifest 中儲存檔案雜湊值（版本 3.1.0）
  - `uds init` 在安裝時計算並儲存檔案雜湊值
  - `uds update` 在更新檔案後重新計算雜湊值
- **Utils**：新增 `hasher.js` 工具模組用於 SHA-256 檔案雜湊

### 變更
- **CLI**：manifest 版本從 3.0.0 升級至 3.1.0
  - 新增 `fileHashes` 欄位追蹤檔案完整性
  - 向後相容舊版 manifest

### 修復
- **CLI**：修復 `uds check` 錯誤顯示「Skills 已標記為已安裝但找不到」警告
  - 現在正確識別 Plugin Marketplace 安裝路徑（`~/.claude/plugins/cache/`）
- **CLI**：修復 `uds update` 指令失敗並顯示「undefined」錯誤
  - 為非同步 `copyStandard()` 和 `copyIntegration()` 呼叫新增遺漏的 `await`

## [3.3.0] - 2026-01-08

### 新增
- **Skills**：新增 9 個斜線命令，用於手動觸發工作流程
  - `/commit` - 產生 conventional commit message
  - `/review` - 執行系統性程式碼審查
  - `/release` - 引導發布流程
  - `/changelog` - 更新 CHANGELOG.md
  - `/requirement` - 撰寫用戶故事和需求
  - `/spec` - 建立規格文件
  - `/tdd` - 測試驅動開發工作流程
  - `/docs` - 建立/更新文件
  - `/coverage` - 分析測試覆蓋率
- **Core**：新增測試驅動開發 (TDD) 標準
  - 新增 `core/test-driven-development.md`，涵蓋 Red-Green-Refactor 循環
  - SDD + TDD 整合工作流程指南
- **Skills**：新增 `tdd-assistant` 技能（第 15 個技能）

### 變更
- **Skills**：簡化斜線命令格式，從 `/uds:xxx` 改為 `/xxx`
  - 移除 `uds:` 命名空間前綴，使命令調用更簡潔
- **Plugin Marketplace**：將 marketplace 名稱從 `universal-dev-standards` 改為 `asia-ostrich`
  - 新安裝命令：`/plugin install universal-dev-standards@asia-ostrich`

### 修復
- **CLI**：`uds skills` 現在優先偵測新的 `@asia-ostrich` marketplace
- **CLI**：將 `tdd-assistant` 新增至 standards-registry.json

### 遷移指南
如果你使用舊的 marketplace 名稱安裝，請進行遷移：

```bash
/plugin uninstall universal-dev-standards@universal-dev-standards
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.5] - 2026-01-07

### 新增
- **Skills**：新增 9 個斜線命令，用於手動觸發工作流程
  - `/commit` - 產生 commit message
  - `/review` - 執行程式碼審查
  - `/release` - 引導發布流程
  - `/changelog` - 更新變更日誌
  - `/requirement` - 撰寫用戶故事
  - `/spec` - 建立規格文件
  - `/tdd` - TDD 工作流程
  - `/docs` - 文件撰寫
  - `/coverage` - 測試覆蓋率
  - 命令與技能的差異：命令為手動觸發，技能為自動觸發

### 修復
- **CLI**：`uds skills` 現在優先偵測新的 `@asia-ostrich` marketplace
  - 當偵測到舊版 `@universal-dev-standards` marketplace 時顯示遷移提示
  - 確保遷移期間的相容性

## [3.3.0-beta.4] - 2026-01-07

### 變更
- **Plugin Marketplace**：將 marketplace 名稱從 `universal-dev-standards` 改為 `asia-ostrich`
  - 新安裝命令：`/plugin install universal-dev-standards@asia-ostrich`
  - 這提供與 AsiaOstrich 組織更好的品牌一致性

### 遷移指南
如果你使用舊的 marketplace 名稱安裝，請進行遷移：

```bash
# 1. 卸載舊版本
/plugin uninstall universal-dev-standards@universal-dev-standards

# 2. 安裝新版本
/plugin install universal-dev-standards@asia-ostrich
```

## [3.3.0-beta.3] - 2026-01-07

### 修復
- **CLI**：將 `tdd-assistant` 新增至 standards-registry.json
  - 新增 TDD 的技能檔案列表和標準項目
  - `uds skills` 現在正確顯示 15/15 個技能

## [3.3.0-beta.2] - 2026-01-07

### 新增
- **Core**：新增測試驅動開發 (TDD) 標準
  - 新增 `core/test-driven-development.md` 涵蓋 Red-Green-Refactor 循環、FIRST 原則、TDD vs BDD vs ATDD
  - SDD + TDD 整合工作流程指引
  - ML 測試邊界（模型準確度 vs 資料工程）
  - 遺留系統的 Golden Master 測試
- **Skills**：為 Claude Code 新增 `tdd-assistant` 技能（第 15 個技能）
  - `skills/tdd-assistant/SKILL.md` - TDD 工作流程指引
  - `skills/tdd-assistant/tdd-workflow.md` - 逐步 TDD 流程
  - `skills/tdd-assistant/language-examples.md` - 6 種語言範例
  - 所有 TDD 檔案的完整繁體中文翻譯

### 變更
- **核心標準**：更新相關標準中的交叉引用
  - `spec-driven-development.md` - 新增 TDD 整合引用
  - `testing-standards.md` - 新增 TDD 交叉引用
  - `test-completeness-dimensions.md` - 新增 TDD 交叉引用
- **發布流程**：擴展預發布檢查清單，加入完整的檔案驗證
  - 新增版本檔案檢查清單，涵蓋所有版本相關檔案
  - 重新命名為文件驗證檢查清單，加入正確性驗證
  - 新增內容正確性驗證區塊，包含 grep 指令
  - 使用 `locales/*` 萬用字元涵蓋所有語言版本

## [3.2.2] - 2026-01-06

### 新增
- **CLI**：新增 `uds skills` 指令列出已安裝的 Claude Code skills
  - 顯示來自 Plugin Marketplace、使用者層級和專案層級的安裝
  - 顯示每個安裝的版本、路徑和 skill 數量
  - 對已棄用的手動安裝顯示警告
- **CLI**：根據安裝位置改善 Skills 更新指示

### 棄用
- **Skills**：透過 `install.sh` / `install.ps1` 手動安裝現已棄用
  - 建議：使用 Plugin Marketplace 以獲得自動更新
  - 腳本將顯示棄用警告並要求確認
  - 將在未來的主要版本中移除

### 變更
- **CLI**：`uds update` 現在對手動安裝的 Skills 顯示棄用警告
  - 建議遷移至 Plugin Marketplace
- **Skills**：更新 README.md 將手動安裝標記為棄用

### 修復
- **CLI**：更新標準註冊表版本至 3.2.2

## [3.2.2-beta.2] - 2026-01-05

### 新增
- **CLI**：根據安裝位置改善 Skills 更新指示
  - Marketplace：透過 Plugin Marketplace UI 更新的指引
  - 使用者層級：`cd ~/.claude/skills/... && git pull`
  - 專案層級：`cd .claude/skills/... && git pull`

### 修復
- **CLI**：更新標準註冊表版本至 3.2.2
  - 讓 `uds update` 能偵測現有專案的新版本

## [3.2.2-beta.1] - 2026-01-05

### 新增
- **Skills**：新增發布流程指南，提供完整的發布流程
  - 新增 `skills/release-standards/release-workflow.md` 包含逐步發布指示
  - 涵蓋 beta、alpha、rc 和穩定版發布工作流程
  - 包含 npm dist-tag 策略、疑難排解和 AI 助理指南
  - 在 CLAUDE.md 中新增發布流程章節供 AI 助理參考
- **CLI**：為 AI 工具整合新增對話語言設定
  - 所有 AI 工具整合檔案現在都包含對話語言指示
  - 支援英文、繁體中文和雙語模式
  - 為 Claude Code 使用者生成包含語言設定的 CLAUDE.md
- **CLI**：為 prompts 和 utils 模組新增完整測試
  - 測試覆蓋率從 42.78% 提升至 72.7%
  - 總測試數從 94 增加至 210

### 修復
- **CLI**：僅在 Claude Code 是唯一選擇的 AI 工具時才詢問 Skills
  - 修復選擇多個 AI 工具與 Skills 時可能導致其他工具遺漏完整標準的問題
- **CI/CD**：修復 npm 發布工作流程，正確標記 beta/alpha/rc 版本
  - 在 `.github/workflows/publish.yml` 中新增自動版本偵測
  - Beta 版本現在使用 `@beta` 標籤而非 `@latest`
  - 使用者現在可以使用 `npm install -g universal-dev-standards@beta` 安裝 beta 版本

### 變更
- **核心規範**：為 5 個核心標準新增業界參考標準
  - `error-code-standards.md` v1.0.0 → v1.1.0: RFC 7807, RFC 9457, HTTP Status Codes
  - `logging-standards.md` v1.0.0 → v1.1.0: OWASP Logging, RFC 5424, OpenTelemetry, 12 Factor App
  - `code-review-checklist.md` v1.1.0 → v1.2.0: SWEBOK v4.0 Ch.10 (Software Quality)
  - `checkin-standards.md` v1.2.5 → v1.3.0: SWEBOK v4.0 Ch.6 (Configuration Management)
  - `spec-driven-development.md` v1.1.0 → v1.2.0: IEEE 830-1998, SWEBOK v4.0 Ch.1 (Requirements)
- **測試標準**：新增 SWEBOK v4.0 參考和新章節
  - `testing-standards.md` v2.0.0 → v2.1.0: Testing Fundamentals, Test-Related Measures, Pairwise/Data Flow Testing
- **文件**：更新 MAINTENANCE.md 加入 npm dist-tag 策略
  - 新增不同版本模式的 dist-tag 表格
  - 新增手動修正標籤的指令說明

## [3.2.1-beta.1] - 2026-01-02

### 新增
- **CLI**：在 Skills 安裝流程中新增 Plugin Marketplace 支援
  - 在 Skills 安裝提示中新增「Plugin Marketplace (推薦)」選項
  - CLI 在 manifest 中追蹤透過 marketplace 安裝的 Skills，不嘗試本地安裝
  - `uds check` 指令現在會顯示 marketplace 安裝狀態

### 修復
- **CLI**：修復 standards registry 中通配符路徑處理導致 404 錯誤
  - 將 `templates/requirement-*.md` 通配符替換為明確檔案路徑
  - 為 requirement-checklist.md、requirement-template.md、requirement-document-template.md 新增明確條目
- **CLI**：修復 `uds init`、`uds configure` 和 `uds update` 指令執行後程式未退出的問題
  - 新增明確的 `process.exit(0)` 以防止 inquirer readline interface 阻擋程式終止

## [3.2.0] - 2026-01-02

### 新增
- **Claude Code Plugin Marketplace 支援**：啟用透過 Plugin Marketplace 分發
  - 新增 `.claude-plugin/plugin.json` - Plugin manifest 配置
  - 新增 `.claude-plugin/marketplace.json` - Marketplace 分發配置
  - 新增 `.claude-plugin/README.md` - Plugin 文檔和維護指南
  - 更新 `skills/README.md` 新增方法 1：Marketplace 安裝（推薦）

### 優點
- 使用者可以用單一指令安裝所有 14 個技能：`/plugin install universal-dev-standards@universal-dev-standards`
- 新版本發布時自動更新
- 透過 Claude Code marketplace 提升可發現性
- 保持與腳本安裝的向後相容性（方法 2 和 3）

### 變更
- 在 `CLAUDE.md` 新增 AI 助手對話語言要求（繁體中文）

### 修復
- 修復 CLI 版本讀取，改用 `package.json` 而非硬編碼值

## [3.1.0] - 2025-12-30

### 新增
- **簡體中文 (zh-CN) 翻譯**：為簡體中文使用者提供完整本地化
  - 新增 `locales/zh-CN/README.md` - 完整 README 翻譯
  - 新增 `locales/zh-CN/CLAUDE.md` - 專案指南翻譯
  - 新增 `locales/zh-CN/docs/WINDOWS-GUIDE.md` - Windows 指南翻譯
- 在所有 README 版本中新增語言切換連結（EN, zh-TW, zh-CN）

- **完整 Windows 支援**：為 Windows 使用者提供完整的跨平台相容性
  - 新增 `.gitattributes` 確保跨平台換行符一致性
  - 新增 `scripts/check-translation-sync.ps1` - 翻譯檢查器 PowerShell 版本
  - 新增 `skills/install.ps1` - Skills 安裝器 PowerShell 版本
  - 新增 `scripts/setup-husky.js` - 跨平台 Husky 設定腳本
  - 新增 `docs/WINDOWS-GUIDE.md` - 完整的 Windows 開發指南
- **5 個新 Claude Code 技能**：技能庫從 9 個擴充至 14 個
  - `spec-driven-dev` - SDD 工作流程指引（觸發詞：spec, proposal, 提案）
  - `test-coverage-assistant` - 7 維度測試完整性框架（觸發詞：test coverage, dimensions, 測試覆蓋）
  - `changelog-guide` - 變更日誌撰寫標準（觸發詞：changelog, release notes, 變更日誌）
  - `error-code-guide` - 錯誤碼設計模式（觸發詞：error code, 錯誤碼）
  - `logging-guide` - 結構化日誌標準（觸發詞：logging, log level, 日誌）
- 新增**雙重性質標準**分類至 `STATIC-DYNAMIC-GUIDE.md` - 同時具有靜態和動態元件的標準
- 新增**動態 vs 靜態分類**章節至 `MAINTENANCE.md` - 標準分類指南
- 將 `checkin-standards` 核心規則加入 `CLAUDE.md` 作為靜態標準
- 新增 5 個新技能的完整繁體中文翻譯（共 10 個檔案）

### 變更
- 更新 `cli/package.json` 的 prepare 腳本使用跨平台 `setup-husky.js`
- 更新 `README.md`、`cli/README.md`、`CLAUDE.md` 添加 Windows 安裝說明
- 更新 `STATIC-DYNAMIC-GUIDE.md` 至 v1.1.0 - 引入雙重性質標準概念，更新至 14 個技能
- 更新 `MAINTENANCE.md` - 新增 `STATIC-DYNAMIC-GUIDE.md` 交叉引用，擴展 Workflow 4 分類檢查清單
- 更新 `MAINTENANCE.md` 技能表格從 9 個擴充至 14 個（35 個技能檔案 + 10 個共用/README = 45 個檔案）
- 同步 `MAINTENANCE.md` 和 `STATIC-DYNAMIC-GUIDE.md` 的繁體中文翻譯

## [3.0.0] - 2025-12-30

### 新增
- **AI 優化標準架構**：新增 `.ai.yaml` 雙格式支援
- 新增 `ai/standards/` 目錄，包含 15 個 AI 優化標準檔案
- 新增 `ai/options/` 目錄，包含語言特定和工作流程選項
- 新增 `MAINTENANCE.md` - 專案維護指南與檔案結構概覽
- 新增 `ai/MAINTENANCE.md` - AI 標準維護工作流程指南
- 新增 `STANDARDS-MAPPING.md` - 標準與技能對應矩陣
- 新增 6 個 AI 優化標準：
  - `anti-hallucination.ai.yaml` - AI 協作標準
  - `checkin-standards.ai.yaml` - 程式碼簽入標準
  - `documentation-writing-standards.ai.yaml` - 文件撰寫指南
  - `spec-driven-development.ai.yaml` - SDD 工作流程
  - `test-completeness-dimensions.ai.yaml` - 7 維度測試框架
  - `versioning.ai.yaml` - 語義化版本標準
- 新增所有新標準和技能的完整繁體中文翻譯（共 78 個檔案）

### 變更
- 統一核心標準的版本格式為 `**Version**: x.x.x`
- 為所有 zh-TW 翻譯的 YAML front matter 新增 `source` 欄位以追蹤同步
- 更新翻譯同步腳本，改進驗證功能

### 修正
- 修正 `core/error-code-standards.md` 和 `core/logging-standards.md` 的版本格式不一致
- 修正 zh-TW 技能翻譯中的來源路徑

## [2.3.0] - 2025-12-25

### 新增
- **多語言支援**：新增 `locales/` 目錄結構用於國際化
- 新增所有文件的繁體中文 (zh-TW) 翻譯（44 個檔案）
  - `locales/zh-TW/core/` - 13 個核心規範翻譯
  - `locales/zh-TW/skills/` - 25 個 skill 檔案翻譯
  - `locales/zh-TW/adoption/` - 5 個採用指南翻譯
  - `locales/zh-TW/README.md` - 完整的中文 README
- 為所有英文文件新增語言切換器
- 新增 `scripts/check-translation-sync.sh` - 翻譯同步檢查腳本
- 為 Skills 文件新增靜態與動態規範分類說明
- 新增 `templates/CLAUDE.md.template` - 靜態規範整合範本
- 新增 `adoption/STATIC-DYNAMIC-GUIDE.md` - 詳細分類指南

### 變更
- 將雙語內容分離到專用語言檔案（AI 工具減少約 50% token 消耗）
- 英文版本現在僅包含英文內容並帶有語言切換器
- 更新 `skills/README.md` - 新增靜態與動態區塊及觸發關鍵字

## [2.2.0] - 2025-12-24

### 新增
- 為所有 Skills 文件新增標準區段（23 個檔案）
  - 8 個 SKILL.md 檔案：新增目的、相關標準、版本歷史、授權區段
  - 15 個支援文件：新增雙語標題、metadata 及標準區段

### 變更
- 統一 Skills 文件格式與 Core 標準
- 新增 Skills 與 Core 文件之間的交叉引用

## [2.1.0] - 2025-12-24

### 新增
- **整合 Skills**：將 `universal-dev-skills` 合併至 `skills/` 目錄
- 新增 `skills/` - 所有 Claude Code Skills 現已包含在主儲存庫中
- 新增 `skills/_shared/` - 用於多 AI 工具支援的共享模板
- 為未來 AI 工具新增佔位目錄：`skills/cursor/`、`skills/windsurf/`、`skills/cline/`、`skills/copilot/`

### 變更
- CLI 現在從本地 `skills/` 安裝技能，而非從遠端儲存庫獲取
- 更新 `standards-registry.json` 以反映整合的 skills 架構

### 遷移指南
- 如果您之前單獨使用 `universal-dev-skills`，現在可以使用本儲存庫中包含的 skills
- 執行 `cd skills && ./install.sh` 從整合位置重新安裝 skills

## [2.0.0] - 2025-12-24

### 變更

**破壞性變更**：專案從 `universal-doc-standards` 更名為 `universal-dev-standards`

這反映了專案擴展的範圍，涵蓋所有開發標準，而不僅僅是文件。

#### 遷移指南

- 從新的儲存庫重新 clone：`git clone https://github.com/AsiaOstrich/universal-dev-standards.git`
- 如果使用全域安裝，請在 CLI 目錄重新執行 `npm link`
- 使用 `npx universal-dev-standards` 取代 `npx universal-doc-standards`
- `uds` 命令保持不變

### 新增
- 新增 `extensions/languages/php-style.md` - 基於 PSR-12 的 PHP 8.1+ 編碼風格指南
- 新增 `extensions/frameworks/fat-free-patterns.md` - Fat-Free Framework v3.8+ 開發模式

## [1.3.1] - 2025-12-19

### 新增
- 新增 Mock 限制章節至 `testing-standards.md` - Mock 需要整合測試的指南
- 新增測試資料管理模式至 `testing-standards.md` - 識別碼區分與複合鍵指南
- 新增「何時需要整合測試」表格至 `testing-standards.md` - 6 種必須整合測試的情境

## [1.3.0] - 2025-12-16

### 新增
- 新增 `changelog-standards.md` - 完整的變更日誌撰寫指南
- 新增決策樹和選擇矩陣至 `git-workflow.md`，協助工作流程策略選擇
- 新增語言選擇指南至 `commit-message-guide.md`，協助選擇提交訊息語言

### 變更
- 更新 `versioning.md` - 新增交叉引用至 changelog-standards.md
- 更新 `git-workflow.md` - 在發布準備中新增 CHANGELOG 更新指南
- 更新 `zh-tw.md` - 新增術語：變更日誌、發布說明、破壞性變更、棄用、語義化版本
- 更新 `changelog-standards.md` - 與 versioning.md 統一排除規則，新增交叉引用
- 更新 `checkin-standards.md` - 釐清 CHANGELOG 更新僅適用於使用者可感知的變更
- 更新 `code-review-checklist.md` - 與 changelog-standards.md 統一 CHANGELOG 區段

### 修正
- 修正 `commit-message-guide.md` 和 `documentation-writing-standards.md` 標頭格式不一致問題
- 統一交叉引用使用 markdown 連結格式而非反引號

## [1.2.0] - 2025-12-11

### 新增
- 新增 `project-structure.md` - 專案目錄結構規範
- 在 `documentation-structure.md` 新增實體 DFD 層

### 變更
- 更新 `documentation-structure.md` - 釐清流程/圖表分離，改進檔案命名規範
- 更新 `checkin-standards.md` - 新增目錄衛生指南
- 改進通用性，將專案特定範例替換為通用佔位符

## [1.1.0] - 2025-12-05

### 新增
- 新增 `testing-standards.md` - 完整測試金字塔標準（單元/整合/系統/端對端測試）
- 新增 `documentation-writing-standards.md` - 文件內容需求標準

### 變更
- 更新 `anti-hallucination.md` - 強化出處標示指南
- 更新 `zh-tw.md` - 與 commit-message-guide.md v1.2.0 同步

## [1.0.0] - 2025-11-12

### 新增
- 初始發布，包含核心標準
- 核心標準：反幻覺、簽入標準、提交訊息指南、Git 工作流程、程式碼審查檢查清單、版本標準、文件結構
- 擴充：C# 風格指南、繁體中文本地化
- 範本：需求文件範本
- 整合：OpenSpec 框架

[Unreleased]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.7.1...HEAD
[5.7.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.7.0...v5.7.1
[5.7.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v5.6.0...v5.7.0
[3.4.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.3.0...v3.4.0
[3.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v3.0.0...v3.3.0
[3.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.3.0...v3.0.0
[2.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.1...v2.0.0
[1.3.1]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/AsiaOstrich/universal-dev-standards/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/AsiaOstrich/universal-dev-standards/releases/tag/v1.0.0
