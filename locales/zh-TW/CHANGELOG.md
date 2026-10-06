---
source: ../../CHANGELOG.md
source_version: 6.14.0-beta.4
translation_version: 6.14.0-beta.4
last_synced: 2026-10-06
status: current
---

# 變更日誌

> **語言**: [English](../../CHANGELOG.md) | 繁體中文 | [简体中文](../zh-CN/CHANGELOG.md)

本專案的所有重要變更都將記錄在此檔案中。

格式基於 [Keep a Changelog](https://keepachangelog.com/)，
並遵循[語義化版本](https://semver.org/)。

## [Unreleased]

### Changed

- **行為改變——`uds check --diff` 現在以你所安裝的 UDS 套件內的檔為原稿，不再對照 GitHub `main`。** 這個差異回答的是「我改了 UDS 給我的哪些地方」；它過去從 GitHub `main` 下載原稿，所以離線會失敗（擴充檔也一樣），而且 UDS 在你安裝後自己改過的內容，會被列成你改的差異。現在原稿一律從所裝套件讀取——標準、選項、擴充檔皆同——不下載任何東西。指令會印出比對基準（`installed UDS package (version X)`），並提示看 UDS 之後的變更請用 `uds update --plan`。若專案內的標準是從另一個 UDS 版本安裝的、與目前安裝的套件版本不同，也會明說，因為兩版之間 UDS 改過的檔會顯示成差異。套件內找不到某個受追蹤檔的原稿時，指令會**點名**該檔、不下載、以結束碼 1 結束；不再退回 GitHub，也不再靜默略過。沒有被修改的檔時，`--diff` 現在會說「沒有差異可顯示」，而不是什麼都不印。**誰會看到不同：**執行 `uds check --diff`（或在互動式 `uds check` 按「檢視」）的人——凡是 `main` 與你所裝版本不同之處，差異可能與以往不同；而原本在套件缺原稿時讀到結束碼 0 的腳本，現在會讀到 1。**要做什麼：**不用做任何事；要看上游有什麼新內容，請執行 `uds update --plan`。落實 dev-platform XSPEC-453 R1。

### Removed

- **移除 `extensions/languages/php/`**——兩個沒有任何東西引用的檔（`php-style.md`、`fat-free-patterns.md`，約 37 KB）；安裝器、registry 與文件使用的是 `extensions/languages/php-style.md` 與 `extensions/frameworks/fat-free-patterns.md`，兩者不變。npm 套件因此少了這兩個檔，現在剛好只含安裝器裝得到的 5 個擴充檔；新增的測試會在有未宣告的擴充檔被打包時變紅。`uds init --lang php` 與 `--framework fat-free` 裝的檔與先前相同。落實 dev-platform XSPEC-453 R2。

### 修正

- **健康分數的覆蓋度維度不再回報永遠是 0 的 `has_tests`。**`calculateCoverage` 宣告了 `hasTests = 0` 卻從未改動它，所以 `uds audit --score` 印出一個看起來像「標準有沒有測試」的量測、實際上不會動的數字。它已從加總與 `details` 移除；**任何專案的覆蓋度分數都不變**（分母本來就是每個標準兩份——`check-<id>.sh` 與 `check-<id>-sync.sh`）。（XSPEC-444 R5）
- **行為改變——`uds check` 現在會把遺失或被改過的技能檔算進判定。它以前會印出紅色 ✗，結尾卻仍說「專案符合標準」、exit 0。** Skills 完整性檢查的結果算出來之後被丟掉了。現在刪掉或改過技能檔，`uds check` 會說「偵測到一些問題」並點名該檔，`uds check --ci` 會 exit 1（不帶 `--ci` 時 exit code 仍是 0，與其他各類發現一致；UDS 寫的 pre-commit hook 執行的是不帶參數的 `uds check`，所以不會因此被擋）。**誰會看到差別：**技能資料夾被改過或掉了檔的專案。**怎麼處理：**執行訊息印出的指令 `uds update --apply --skills`。**幽靈紀錄先處理，所以既有專案不會突然開始失敗：**專案的 manifest 可能列著 UDS 從未安裝的技能檔——採用者自己的技能，以及舊版 UDS 因為雜湊整個資料夾而誤拷進技能資料夾的 `agents/`、`workflows/`、`_shared/`，後來 `uds update` 把它們刪了卻沒忘掉紀錄（有個專案顯示 26 個「遺失」，6.11.0 與 6.14.0-beta.4 相同）。現在安裝器只記錄自己裝的技能（也不記錄自己的 `.manifest.json`）；`uds update` 刪掉技能資料夾時一併刪掉它的紀錄；`uds check` 忽略不描述任何出貨技能的紀錄並說出有幾筆（`N skill record(s) ignored`）；`uds update`（`--apply`、`--skills`，或已是最新版的路徑）會把它們從 `.standards/manifest.json` 永久清掉。落實 dev-platform XSPEC-454 R2。
- **`uds update --rollback` 現在還原整個升級，而不只是標準檔。** 依序執行 `update --apply`、`update --apply --skills`、`update --apply --commands` 後，一次 `--rollback` 只還原標準檔與 `CLAUDE.md`／`AGENTS.md`，新增的技能資料夾（`comprehension-ladder`）、技能與命令的 `.manifest.json`、以及 `.standards/manifest.json` 裡的雜湊紀錄都留在新版，於是 `uds check` 報修改過的檔，專案同時不符合兩個版本。原因：備份只記錄計畫要覆寫的檔（沒有更新所建立的檔，也沒有 `.standards/manifest.json`）；`--skills` 與 `--commands` 寫檔時完全沒有備份；還原用的 `copyFileSync` 還原不了資料夾。現在 `--apply`、`--apply --skills`、`--apply --commands` 的每一步都建立備份，並記錄它所建立的檔（`--skills`／`--commands` 自己建立備份，沒有備份就不寫；只備份 UDS 出貨的技能與命令，不碰你自己的）；不帶 `--apply` 的一般 `uds update` 仍和以前一樣不建立備份；連續的步驟以 `.standards/manifest.json` 前後的雜湊串起來，所以一次 `--rollback` 會一路退過整串沒有被打斷的升級，並在中間有別的變更處停下來、明說；還原後會讀回驗證；指令會印出還原了什麼、移除了什麼，若有任何失敗，**不會以「成功」收尾**（exit 1，並說明怎麼重試）。**沒有涵蓋、並會如實印出：**使用者層級的技能／命令（`~/.claude/skills`，由所有專案共用），以及舊版本做的備份（它們從未記錄所建立的檔與 manifest）。落實 dev-platform XSPEC-454 R1。
- **`uds update --commands` 把命令數印成了工具數**（只有一個 OpenCode 卻印「為 51 個 AI 工具更新」）。該訊息鍵在每個語言都寫成「N 個 AI 工具」，卻被填入命令檔數。現在有獨立的訊息，兩個欄位各放各的數字：「Updated 51 commands for 1 AI tool(s)」／「已為 1 個 AI 工具更新 51 個斜線命令」／「已为 1 个 AI 工具更新 51 个斜线命令」。舊鍵的其他用法本來就傳工具數，不變。落實 dev-platform XSPEC-454 R4。

### 新增

- **`uds init` 現在會附上 `full-coverage-testing` 一直要你自己寫的假測試與空殼掃描腳本，`uds check` 會把它們找到的東西以警告印出。**標準一直寫著「新增 `scripts/check-stubs.sh` 與 `scripts/check-anti-fake-tests.sh`」，驗證器也只檢查這兩個檔案存在——但 UDS 兩個都沒附，這條指示根本照做不了。`uds init` 現在會寫入 `scripts/check-anti-fake-tests.mjs`（找**沒有斷言**的測試、唯一的斷言是 `expect(true).toBe(true)` 或 `assert 200 == 200` 這類**恆真式**的測試、**每支測試都被跳過或標 todo** 的測試檔）與 `scripts/check-stubs.mjs`（`// WARNING: STUB` 標記、宣稱**尚未實作**而旁邊沒有標記的函式本體、本體**為空**而旁邊沒有標記的具名函式）。純 Node、零相依、不預設測試框架；它們是你的檔案。單獨執行時，找到東西就以非 0 結束。**`uds check`——pre-commit hook 執行的指令——會執行它們並把找到的東西印成警告；不擋任何東西**，除非你在 `.standards/test-policy.json` 設 `"mode": "block"`。有暫存檔案時掃描那些檔案；沒有暫存任何東西時（CI 執行）掃描整個專案。**測試檔規則涵蓋 JavaScript／TypeScript、Python、Java／Kotlin／Scala／C#、Go、Rust、Ruby、Elixir、PHP、Swift、Dart、Lua 與 C／C++；其他語言的測試檔會被列為「未掃描」，絕不當成乾淨。**它們讀的是文字、不執行你的測試，所以用掃描器認不得的名稱做斷言的輔助函式會被報為「no-assertion」（請命名為 `assert*`／`verify*`／`expect*`，或把樣式列在 `assertionPatterns`）。每次執行都先拿已知的假測試與好測試檢驗自己，失敗就以 `2`（「無法判定」，絕不算通過）結束。已存在的檔案絕不覆寫；`uds uninstall` 只移除 `uds init` 寫入且未被改動的檔案；較早初始化的專案由 `uds update` 詢問是否寫入（提示的預設為否；**`uds update -y` 會直接回答是**，所以升級指令是 `uds update -y` 的專案，下次更新就會多這兩個檔案）。**誰會看到差別：**本版之後每次 `uds init` 會在 `scripts/` 多兩個檔案，每次提交 `uds check` 會多印兩行（或找到的東西）。**怎麼處理：**讀它的發現；想讓某類檔案不再被報，加一份 `test-policy.json`；想強制執行，設 `"mode": "block"` 或在 CI 跑這兩支腳本。`uds check --standard full-coverage-testing` 現在會執行這兩支腳本，不再只檢查它們存在。（XSPEC-444 R5）
- **`uds check` 在一次提交改了程式碼卻沒動任何測試時發出警告。**有檔案暫存時，`uds check` 會在「改了程式檔、同一次提交沒有測試檔變動」時列出那些程式檔，並列出它不認得類型的變更檔案（絕不當成沒事，也絕不擋）。刪除不需要測試；純重新命名（git `R100`）與符合 `exempt` 條目的路徑可免，輸出會記下理由。哪些路徑是測試、哪些是程式，是附有常見生態預設值的資料——`*.test.*`、`*_test.go`、`test_*.py`、`*Test.java`、`tests/` 等——由 `.standards/test-policy.json`（`testDirs`、`testPatterns`、`sourceExtensions`、`nonCodeExtensions`、`ignore`，以及每筆都必須附 `reason` 否則不生效的 `exempt`）**加進**而不是取代。**它只警告、放行提交。**同一份檔案裡的 `"mode": "block"` 會讓它擋下提交；這是目前提供的唯一收緊步驟。**沒有做，因為規格沒有定義：**未配測試的變更數棘輪（基線放在哪、以什麼計數），以及逐次提交的豁免理由（pre-commit hook 讀不到提交訊息）。（XSPEC-444 R2）
- **`uds audit --offline`。** `check` 與 `update` 早就有，`audit` 卻回「unknown option」。加上它之後，`audit` 不發任何網路請求——包含每個指令結束後的「有新版本」提示（它對 `check`、`update` 也忽略 `--offline`，現在都遵守）；`--report` 會說「離線模式：不提交回報。」（並指出出路 `--dry-run`），而不是去啟動 `gh`、瀏覽器或剪貼簿。落實 dev-platform XSPEC-454 R3。

## [6.14.0-beta.4] - 2026-10-06

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **行為改變：**`uds check --standard checkin-standards` 在 lint 或測試失敗時會失敗；非 Node 專案的原生 pre-commit hook 現在擋得住提交。見下方 Fixed 的相關條目。

### 修正
- **`extensions/` 現在放進 npm 套件，`uds init`、`uds update` 與 reconciler 只從套件內安裝擴充檔——三者都不再從 GitHub 下載。** 6.13.1 版套件裡 `extensions/` 底下的 7 個檔（語言風格規範、框架模式、繁中與簡中語系包）一個都沒有，所以 `uds init --lang csharp`、`--lang php`、`--framework fat-free`、`--locale zh-tw`／`zh-cn` 安裝時是去 GitHub `main` 下載。後果有兩個：離線或公司內網裝不了這些擴充；而且拿到的是 `main` 當天的內容，不是你所裝版本對應的那個檔。同一個備援也把缺少的 `zh-cn.md` 藏了好幾個月。現在 `cli/scripts/prepack.mjs` 會把整個目錄打包；套件內容一致性檢查會逐檔、逐位元比對 `extensions/` 與套件（以前只比對 `.ai.yaml` 標準，所以一個擴充檔都沒有的套件也會顯示「bundle parity holds」）；宣告的擴充檔若不在套件內，安裝會**失敗並點名該檔**——不下載、也不靜默略過。**誰會看到差別：**從 npm 安裝的人多拿到 7 個檔（約 152 KB），且這些檔不再發出任何網路請求；`uds update` 也從套件內更新 `manifest.extensions` 的項目。**沒有改的：**其他在本機缺檔時仍會嘗試 GitHub 的地方（標準、選項、整合檔、技能），以及 `uds check --diff`——它仍會從 GitHub `main` 抓任何追蹤檔（含擴充檔）的原稿來比對。這份清單列在規格裡，本次不動。新增的測試會執行 `npm pack`、把壓縮檔裝進拋棄式目錄、封鎖並記錄網路，對已安裝套件宣告的每一個擴充選項執行 `uds init`，再逐位元讀回每個已安裝的檔；第二支測試從套件移除一個宣告的檔，要求安裝以該檔的名稱失敗，且沒有任何下載嘗試。落實 dev-platform XSPEC-452 的 R1、R2、R3。
- **`uds init --locale` 不分大小寫，且不支援的語系會明說**：`--locale zh-CN` 以前會安裝英文並回報成功，現在會裝簡體中文。不支援的值（例如 `fr`）仍改用英文安裝，但會印出警告，不再靜默。（dev-platform XSPEC-451 後續）

- **行為改變——`uds check --standard checkin-standards` 在你的 lint 或測試失敗時現在會失敗；它以前會說「通過」。** 該驗證器原本是 `(npm test --if-present || echo "No test script")`。`--if-present` 本來就處理「沒有測試腳本」的情況；`|| echo` 因此只做了一件事：把失敗的 `npm test` 或 `npm run lint` 變成 exit 0。UDS 自己的 `test-governance` 標準要求閘門 fail-closed，它自己出貨的檢查卻沒做到。現在：lint 或測試腳本失敗會回非 0，並指出是哪一個（`FAILED: npm run test exited with 1`，後面接該腳本自己的輸出）；真的沒有該腳本不算失敗，並且**只有這時**才印 `No lint script`／`No test script`；`npm init` 為 `test` 寫的預設佔位（`echo "Error: no test specified" && exit 1`）視為沒有；沒有 `package.json` 的專案通過，並印出 lint 與測試**沒有**被執行；`package.json` 存在卻無法解析會失敗，不會被當成「沒有腳本」。缺 `CHANGELOG.md` 仍只是提示。**誰會看到差別：**pre-commit hook 執行 `check --standard checkin-standards` 的專案（UDS 在 2026-02-04 至 2026-03-04 寫的 hook，`uds update` 會把它保留成區塊的參數），以及在 CI 或腳本裡執行該指令的人。過去帶著失敗的測試也能提交成功的 commit，現在會被擋下——這正是目的。**怎麼處理：**執行 `npm test`／`npm run lint`，修掉它們回報的問題。沒有測試的專案不受影響。全新的 `uds init` 所寫的 hook 執行的是不帶參數的 `uds check`，它不評估這個驗證器；它該不該評估是另一個決定，本次不變。驗證器現在會執行 `node`，凡是在跑 `uds` CLI 的專案本來就有。
- **`pipeline-security-gates` 驗證器不再在沒有任何 pipeline 提到安全閘門時通過。**它把 `grep` 接到 `head -1`，再以 `|| echo 'no-ci-pipeline'` 兜底；`head` 永遠回 0，所以兜底從不執行，這個檢查不可能失敗。現在改用 `grep -q`，除非 `.github/workflows/`、`.gitlab-ci.yml` 或 `Jenkinsfile` 提到 `secrets`、`sast`、`sca` 或 `dast`，否則回非 0。只有 `uds check --standard pipeline-security-gates` 會執行它。
- **`uds init` 為非 Node 專案寫的原生 `.git/hooks/pre-commit` 現在真的能擋下 commit。**它原本把每個 linter 都寫成 `... 2>/dev/null || true`，把 `uds check 2>/dev/null || true` 也是，最後印出「Pre-commit checks passed」——什麼都擋不了，還把自己的錯誤藏起來。現在：已安裝的 linter（`ruff`、`go vet`、`cargo clippy`）失敗會擋下 commit，沒安裝的 linter 則略過；UDS 檢查改用與 husky hook 相同的標記區塊，所以它的結束碼會擋下 commit，而找不到 `universal-dev-standards` CLI 時會說明如何安裝並擋下，不再靜默略過。`uds uninstall` 會整段移除該區塊，連你改過的腳本也一樣。**磁碟上既有的 hook 維持原樣**——UDS 無法證明一個被改過的檔案是自己寫的，這一項也沒有隨本次變更附上遷移。
- **`uds init --locale zh-cn` 現在可用。它以前會失敗並把整個安裝回滾。** 安裝程式宣告了 `zh-cn`，並會複製 `extensions/locales/zh-cn.md`，但這個檔案不存在（只有 `zh-tw.md`），所以安裝以 `extensions/locales/zh-cn.md: File not available` 收場，並移除它裝過的所有東西——沒有人能用簡體中文安裝 UDS，而且沒有任何測試用簡體中文跑過安裝，所以一直壞著。現在這個檔案存在了：它是以大陸通行術語寫成的簡體中文語系包（不是把繁體版逐字轉換——它的術語表寫「Performance → 性能」，繁體版寫的正好相反）。它以 `zh-cn-locale` 登錄在 `zh-tw-locale` 旁邊。新增的測試對安裝程式宣告的每一個語系實際執行真正的 `uds init`（清單從安裝程式讀出，不寫在測試裡），並讀回語系包、manifest 與已安裝的技能；有語系宣告了卻沒有對應檔，測試就會變紅並指出是哪個語系。理解階梯的安裝測試現在也讓 zh-CN 走 `uds init`。**npm 安裝的注意事項：**寫下這一條時 `extensions/` 不在 npm 套件裡，語系包是安裝時從 GitHub（`main`）下載的；現在它已放進套件（見上方 `extensions/` 那一條）。落實 dev-platform XSPEC-451 的 R1、R2。

### 新增

- **`ai-response-navigation` 1.3.0 → 1.4.0——R12 受控語言，其中一條為必須。** 把文字簡化會讓它更好讀，而最好讀的句子是肯定的句子，所以「簡化」會朝肯定的方向漂移：「可能」變成「是」。R12 把答案分成兩半。**12.1 屬必須**：為非原作者的讀者縮短、簡化、改寫或翻譯文字時，要保留寫作者的不確定語氣（might、could、probably、可能、推斷、尚未確認），不可把不確定的論斷改成確定的，也不可加入原文沒說的事實。只有這一部分的失敗會讓讀者相信不真實的事，而且不需要校準：檢查就是拿改寫前後比對，任何語言都做得到。**12.2 屬選用**，理由已寫進標準：以該語言自己的單位計句長（起始範圍，依語言校準）、同物同名、主動語態、一步一動作、少用分號、數字帶單位。R10 現在指向 R12。
  - **不附英文詞典，並在標準裡明說。** 這些原則取自 ASD-STE100，但它的核可字表與時態限制依賴英文，不適用於中文或其他非英文文字。標準只取原則、不附任何字表，並警告：以空白斷詞的計數器會把一整段中文看成一個詞，永遠通過。
  - **一組中文範例**：同一段文字的原文、約 80%、嚴格三個版本，全部保留不確定語氣，外加第四個更短卻錯誤的改寫（把「可能」改成直接陳述的原因、把「尚未重現」改成「已確認」）。同步 zh-TW 與 zh-CN、兩份 `.ai.yaml`，以及一支讀取實際出貨檔案的測試——必須條款被削弱或刪除時它會變紅。
- **新增技能 `comprehension-ladder`（`/comprehend`）1.0.0 — 把一段難懂的 AI 輸出換成較好懂的形式，而且不改變事實。** 技能先從原文建立一份大綱，再從大綱做出最多三階：受控文字、Mermaid 圖、單檔 HTML 解說頁（可離線開啟，不從網路載入任何東西）。沒有影片階。**三條防護為必須**，各附正例與反例：不加原文沒有的事實、保留每一個不確定語氣（「可能」仍是「可能」）、每一項都附對應原文的位置與「沒涵蓋」註記。技能本身依 [ai-response-navigation](../../core/ai-response-navigation.md) 第 12 條（受控語言）寫成，防護 G2 就是 12.1 條。
  - **尚未證明有幫助。** `skills/comprehension-ladder/eval-cases.md` 有 5 段為此撰寫的原文，各附理解題與標準答案，並附一套跑法，會產出兩個數字：前後的答對率，以及防護違反次數。實跑需要模型呼叫，目前還沒做。做完之前，技能不宣稱有效。
  - 提供 `zh-TW` 與 `zh-CN` 版本，並登錄於 registry、manifest、`llms.txt` 與技能索引。有一支測試會在拋棄式專案裡執行真正的 `uds init`，讀回安裝後的技能：三條防護都在、且標為必須，HTML 階禁止外部資源，也沒有影片階。

## [6.14.0-beta.3] - 2026-09-30

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **既有採用者：請執行一次 `uds update`。**舊版 `uds init` 寫進 pre-commit hook 的是單行 `npx uds check`，它可能請 npm 去拿一個叫 `uds`、但不是本專案的套件。新安裝不再寫這一行，而 `uds update` 會替換既有 `.husky/pre-commit` 裡 UDS 自己寫的那一行。另外：`uds uninstall` 只移除能證明是 UDS 寫的東西（早期 UDS 安裝的專案會保留一部分檔案並說明原因），`uds open-work next-action` 讀得懂寫成表格欄的下一步。

### 變更

- **`uds open-work next-action` 現在讀得懂寫成 Markdown 表格欄的「下一步」，不再只認小節標題與行內標籤。** 表頭在「下一步」詞彙內的欄（`Next action`、`Next step`、`下一步`、`下一動`，以及新加的 `回來要做什麼`）每一列都會被讀，回報帶行號與該列第一格內容，方便定位。詞彙仍然只有一份：標題、行內標籤與表頭都讀同一份。放在引用區塊（`> | … |`）裡的表格現在看得見；程式碼片段內或反斜線之後的 `|` 不再切開儲存格。欄數與表頭不一致的列會列為 `UNDECIDABLE`（判定不了），不會被當成空白；別處沒有違反時結束碼為 2，因為乾淨的結果只涵蓋了欄位的一部分。空白、`—`、`-` 的儲存格只計數、不評估，也不算 OWT-019 違反。此事是在真實工作紀錄上量測 DEC-122 H2 基準時發現的：80 列中有 32 列的欄數與表頭不同。`回來要做什麼` 是該工作紀錄實際使用的表頭（它的文字說明把該欄叫作 下一動），屬未校準判斷（OWT-016）。檢查器自己的突變測試新增八個表格突變，原有十七個仍然轉紅。

### 修正

- **`uds uninstall` 不再留下 UDS 自己寫的檔案，也不再移除它無法證明是 UDS 寫的東西。** 走過 `init` → `update --with-hooks` → `uninstall -y` 之後，它回報「已移除 5、已跳過 1、錯誤 0」，卻留下 `scripts/hooks/` 底下 15 個 hook 腳本、一個空的 `.codex/`、一份生成標頭仍指向已刪除 `.standards/` 的 AGENTS.md，以及 `uds init` 寫入的 `.git/hooks/pre-commit` 腳本主體。現在的規則是：整個檔案只有在 manifest 記錄了「UDS 寫的」（`installedArtifacts`，由 `init` 與 `update --with-hooks` 寫入）**而且**內容仍與記錄的雜湊相符時才會刪除。其他一律保留，並在輸出說明原因（`kept: modified since UDS wrote it`、`kept: no install record — ...`）。資料夾只有在 UDS 建立且現已為空時才移除；採用者自己的 `scripts/hooks/*.mjs`、`.agents/rules/*` 與 hook 項目都會保留。由舊版 UDS 安裝的專案沒有記錄，其腳本、AGENTS.md 生成文字與原生 pre-commit 主體會被保留並說明，而不是猜測。每一行「已移除」現在都對應一次真實的刪除或修改，帶著錯誤結束的執行也會以非 0 結束。
- **`uds uninstall` 在沒有人能回答時不再畫出提示或噴錯誤堆疊，做不了事時也不再以 0 結束。** `--dry-run` 從不提示（它不寫任何東西），並預覽所有類別。沒有 `--yes` 又沒有終端機時，實際執行會以結束碼 2 拒絕，而不是假定「是」；提示被關閉時結束碼為 130；專案未初始化時結束碼為 1。
- **`uds init --with-hooks` 在 Windows 上不再印出 `'chmod' is not recognized`。** pre-commit hook 原本用 try/catch 包住的 `execSync("chmod +x ...")` 賦予執行權限；catch 對程式碼藏起了失敗，但 `execSync` 已先把 cmd.exe 的錯誤送到終端機。現在改用 `fs.chmodSync`，並在沒有執行位元的 Windows 上略過此步驟。
- **安全性：`uds init` 寫入的 pre-commit hook 不再向 npm 要一個叫 `uds`、但不是本專案的套件。** 該 hook 原本是單行 `npx uds check`。`npx` 先找 `node_modules/.bin` 與 `PATH`，兩處都沒有才去 npm registry，而 registry 上的 `uds` 是不相干的專案（維護者 wizawu、`github.com/wizawu/uds`、v0.3.6、2022 年後未更新、目前沒有 `bin`）。裝了 UDS 的機器不受影響；沒裝的 clone 則會用名稱去抓陌生人的套件——目前無害只是因為該套件*尚*無可執行檔，對方一旦發布帶 `uds` bin 的版本，每位採用者的每次 commit 都會執行它。`--no-install` 不是解法：用會記錄每個請求的本機 registry 實測（npm 10.9.9、11.20.0、12.1.0，三者一致），`npx --no-install uds` 仍會發出 `GET /uds`，而 `npx --no-install --package=universal-dev-standards uds` 完全找不到全域安裝。hook 現在兩者都不用：它在專案的 `node_modules/.bin`、再到 `PATH` 找 `universal-dev-standards`（套件本名，只有本專案能發布）並執行 `check`；兩處都找不到時印出該裝什麼並以非 0 結束——不跳過檢查、不下載任何東西，而且即使採用者自己的指令排在後面，檢查失敗也會擋下 commit。`uds uninstall` 依標記整塊移除新寫法。給人看的文字同樣修正：產生的 `CLAUDE.md`/`AGENTS.md` 區塊內的警告行與 hook 提示改寫為 `npx universal-dev-standards init` / `update`（警告行多了幾個 token，所以 `scripts/prompt-footprint-baseline.json` 依實測值各調高 3–6）。**既有採用者：**`uds update`（除了 `--skills`、`--commands`、`--integrations-only`、`--standards-only` 與 `--rollback` 之外的所有模式，以及 `--with-hooks`；`--plan` 只回報不寫入）會替換 `.husky/pre-commit` 中 UDS 自己寫的那一行——只認 UDS 曾產生過的兩種確切寫法（`npx uds check`，以及較早的 `npx uds check --standard checkin-standards`），且必須緊接在 `# UDS Standard Check` 標記下方；你自己寫或改過的行不會被動，並會連同行號回報。此步驟在「已是最新版本」的提前返回**之前**執行，所以標準已是最新的採用者也會被處理。`uds check` 現在會警告仍使用裸名稱的 hook。新增一個測試走訪 `npm pack` 出貨的全部內容，只要有字串以套件執行器（npx、bunx、pnpm dlx、yarn dlx、npm exec）執行裸名稱 `uds` 就會失敗；非 Node 專案的原生 hook（`uds check`，只從 `PATH` 解析、不經 registry）不受影響，維持原樣。

## [6.14.0-beta.2] - 2026-09-30

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **修正 6.14.0-beta.1 的已知限制：**既有專案現在可以用 `uds update --with-hooks` 補裝 Antigravity CLI 關卡（以及缺少的 Claude Code / Codex / Gemini CLI 關卡）。

### Added

- **`uds open-work next-action | revision | separation | self-test` —— `open-work-tracking` 1.1.0 的參考檢查（OWT-017/018/019）現在隨 npm 安裝包出貨。** 6.14.0-beta.1 的這些檢查只在 repo 的 `scripts/` 裡，而 npm 安裝包不含該目錄，採用者不 clone UDS 就跑不了。規則現在只住在一個地方，`cli/src/utils/open-work-tracking.mjs`（在安裝包內）；`uds open-work` 與舊的 `node scripts/check-open-work-tracking.mjs`（現在是一個不含規則、只重新匯出該模組的薄殼）跑的是同一份，並有測試要求兩者輸出完全相同。檢查本身沒有任何改變：結束碼相同（0 沒有違反、1 有違反、2 判定不了——2 不是通過），檢查器仍先跑自己的自測臂，每次執行仍聲明涵蓋率未知（OWT-011）、詞彙未校準（OWT-016）。它仍是作為證據提供的參考判定程序，不是閘門。**每次測試都觀察到會紅：**新測試複製 CLI，讓指令吞掉結束碼（永遠 0）或讓共用規則永遠通過，並要求違反的樣本對副本變綠；並斷言 `npm pack --dry-run` 的清單包含該模組。標準的「什麼在執行本標準」一節改為指向該指令，而不是只在 repo 裡的路徑。

- **`uds update --with-hooks`——為已初始化的專案補裝強制執行 hooks，並放寬 Antigravity 的偵測規則。** Hooks 過去只有 `uds init --with-hooks` 會接線，而 `uds init` 不能跑第二次，所以既有採用者永遠拿不到 UDS 在他們初始化之後才開始支援的工具的 hook（這是把 6.14.0-beta.1 安裝包裝進全新專案時發現的，已記為那一版的已知限制）。`uds update --with-hooks` 會重新偵測工具（manifest 裡的工具，加上專案檔案現在看得出來的）並補裝缺少的 hooks；`--ai-tool <清單>`（`claude-code`、`codex`、`gemini-cli`、`antigravity`）可改為直接指定，找不到任何工具時它會說明如何指定並以 1 結束，而不是猜。已經裝好的 hook 不會被重寫（重跑一次不會有任何變化），採用者自己的 hooks 絕不會被移除或重排（Claude／Codex／Gemini 是合併進去；agy 的 `.agents/hooks.json` 只寫在 UDS 自己的 `uds-turn-completion-integrity` 鍵底下，不是合法 JSON 的檔案原樣保留），採用者改過的 hook 腳本會被保留、除非加 `--force`，`--plan` 則什麼都不寫。它與 `--claude-target`、`--sync-refs` 一樣是獨立模式；在已初始化的專案執行 `uds init --with-hooks`，現在會指向它，而不是默默什麼都沒做。**Antigravity 偵測：**原本要求 `.agents/AGENTS.md`，而一個專案可以長期使用 agy 卻從不建立這個檔。現在也接受 `.agents/rules/`、`.agents/workflows/`、`.agents/plugins/` 與 `.agents/hooks.json`——這些是 agy 自己的執行檔帶著、且 antigravity.google 有文件記載的名稱——並且刻意**不**把 `.agents/skills/` 算進去，因為 Codex 也讀它（根目錄 `AGENTS.md` 加 `.agents/skills/` 的 repo 仍是 Codex；有測試）。偵測只看專案目錄：agy 記錄已開啟專案的 `~/.gemini/projects.json` 有被考慮，但因為它是機器本地的而不採用。`.agents/hooks.json` 是標記，但它同時也是 UDS 自己寫的檔，所以安裝之後它證明的是「裝過」，不是「採用者在用 agy」。**每次測試都觀察到會紅：**測試把真的 CLI 當子行程對一個已初始化的專案跑，並要求把補裝拿掉的 CLI 複本——刪掉該分支、一個回報成功卻什麼都沒寫的安裝器、偵測退回只看 `.agents/AGENTS.md`——對真 CLI 會通過的同一組斷言失敗。agy 關卡仍然只驗證過 `agy -p` 模式下沒有用工具的單一回合。

### Fixed

- **`turn-completion-integrity` 在使用者的前提子句超過固定字數時，會把「正在等使用者」的一輪擋下——自 6.13 起就存在。** 條件式承諾（「你選好後，我會套用」）的豁免，在英文語言包是 `you` 到逗號之間最多 20 個字元，在 zh-TW 語言包是 `你` 到 `後` 之間 1–6 個字；兩個數字都是憑感覺訂的。以已發佈的 6.14.0-beta.1、真實的 Claude Code Stop hook 輸入實測：「Once you choose A, I will apply it.」放行，「Once you choose option A or B, I will apply it.」（21 個字元）被擋，「After you choose option A or B, I will apply it.」同樣被擋——決定結果的是子句長度，不是 `once`／`after`。此 hook 只看一輪的**最後**一則訊息，所以採用者看到的是：代理明明已經正確地停下來問人，卻被逼著繼續講話。修正：豁免改為延伸到子句邊界（逗號、句末標點或換行），不再是字數，因此「Once you've reviewed the three options above and picked one, I will apply it.」與「你看完上面三個選項並選好一個之後，我會接著套用。」都放行。放寬上限就是讓真承諾漏過的方向，所以改用兩道規則取代字數：英文的子句內不得含有我自己的承諾（「After you merged it I will follow up, I will push the tag.」仍被擋）；zh-TW 的 `你` 必須是子句的開頭、且不能是「你的」（「我看了你的設定檔並判斷需要重構之後，我會接著改。」仍被擋——那裡的 `你` 是我自己那句話裡的所有格）。「I will apply it once the build finishes.」不是在等使用者，仍被擋。**每次測試都觀察到會紅：**新測試複製 hook 目錄、把兩個舊上限各自放回去，要求同樣那幾句話對複本重新被擋（且 `--self-test` 失敗）。**已知限制，沒有改變：**豁免以段落為單位，含有一個這種條件子句的段落，會連帶豁免旁邊不相干的無條件承諾（原本就如此）；沒有逗號的條件句（「After you merged it I will follow up」）仍會被擋。

- **執行 `scripts/pre-release-check.sh`——以及在這個 repo 裡 `git commit`——會把 UDS 技能寫進執行者真實的家目錄。** 2026-09-29，維護者在自己的機器上跑發版前檢查，54 個技能資料夾與一個 `.manifest.json` 被寫進真實的 `~/.claude/skills/`。使用者層技能會遮蔽專案層技能，於是一個使用繁中技能的專案靜默地跑起英文測試版。每一步都是綠的：做這件事的那些步驟是在 `mkdtemp` 目錄裡跑 CLI，而那隔離的是**專案**，不是**使用者**——`uds init -y` 與 `uds update` 不論在哪裡跑，都會寫使用者層檔案（`~/.claude/skills`、`~/.uds`）。用拋棄式 `HOME` 重現並實測，不是推測：`scripts/check-upgrade-fidelity.sh` 寫入 115 個檔案（它的 `uds update` 與前一版的 `npx … init` 都繼承了真實 `HOME`）；一開始被懷疑的 `check-adopter-instruction-files.ts` 什麼也沒寫。另外兩處寫入者是逐檔二分單元測試找到的：`tests/commands/update-language-fidelity.test.js` 與 `update-agents-md-generator-fidelity.test.js` 呼叫真的 `updateCommand`（115 個檔案進 `~/.claude/skills`），`tests/commands/check.test.js` 寫了 `~/.uds/update-check.json`——而 pre-commit hook 會跑單元測試，所以**這個 repo 的每一次 commit 都會這樣**；修正者自己在修正落地前的下一次 commit 就又對真實家目錄做了一次。修正分三層：每一支會跑 CLI 的腳本現在都在拋棄式 `HOME` 下跑，且統一出自 `scripts/lib/isolated-home.{mjs,sh}`（`HOME`、`USERPROFILE`、`XDG_*`、`APPDATA`、`CODEX_HOME`；變數清單只有一份，bash 端執行 mjs 來讀它），涵蓋 `pre-release-check.sh` 的自我採用步驟、`check-upgrade-fidelity.sh`、`check-prompt-footprint.mjs`、`check-adopter-instruction-files.ts`、`check-skills-install-paths.ts`、`generate-usage-docs.mjs`、`cli/scripts/check-command-existence.mjs`、`cli/scripts/test-upgrade-path.mjs` 與 `cli/scripts/test-refactoring.sh`；測試套件在 `cli/tests/setup.js` 為每個測試檔換掉 `HOME`；`pre-release-check.sh` 開始前先對 `HOME` 底下 UDS 會寫的位置拍快照，結束時若有任何新增或修改就在摘要失敗（`scripts/check-home-untouched.mjs`）。被監看的位置不是手列的：從安裝器的路徑表與 `cli/src` 裡以 `homedir()` 為根的路徑走訪得出，並印出數量，所以縮成空集合的守衛不可能通過。**每次測試都觀察到會紅，且是端到端：**不隔離地對一個代表真實家目錄的目錄跑 CLI，守衛 exit 1 並點名 `~/.claude/skills`；有隔離則 exit 0；一支測試走訪每一支會 spawn CLI 的腳本，某個呼叫點的隔離被拿掉就紅；一支探針測試在沒有 `tests/setup.js` 時會失敗。**如果你在這個修正之前跑過 `pre-release-check.sh`，或在這個 repo 裡 commit 過，**請檢查 `~/.claude/skills/`：若有 `installedDate` 是當天的 `.manifest.json` 與旁邊的 UDS 技能資料夾，而那不是你自己裝的，就移除它們（使用者層技能會遮蔽專案層）。**刻意不監看：**`~/.claude/skills/synced/`——Claude Code 自己在執行時會把帳號的 claude.ai 技能同步進去（在真實家目錄上的第一次完整執行就因它失敗，寫入者正是執行檢查的那個 Claude Code 工作階段）；它是守衛排除清單裡唯一一項、附有理由，每次比對都會印出，且排除被拿掉或放寬成整個 `~/.claude/skills` 時測試會失敗。**未涵蓋：**沒有任何安裝器點名的路徑上的寫入；以及端到端（`tests/e2e`）測試——已逐檔二分過，沒有寫入。

## [6.14.0-beta.1] - 2026-09-29

> **測試版**——以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、如何退回正式版：[docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。
>
> **已知限制（2026-09-29 把安裝包裝進全新專案實測發現）：** Antigravity CLI 的關卡**只有**在「**全新**專案、且已經有 `.agents/AGENTS.md`」時，由 `uds init --with-hooks` 裝上（init 靠這個檔案判斷專案在用 Antigravity）。既有專案執行 `uds update` **不會**補裝，而 `uds init` 不能對同一個專案跑第二次。因此這個測試版裡，既有專案拿不到 agy 關卡；預計下一版修正。

### Added

- **`open-work-tracking` 1.1.0：在 OWT-016 之後新增三條要求——意圖與進度分開存放、意圖被修改要留痕、下一步要點名對象。** OWT-017（warning）：承載一件工作之目標、驗收條件或限制的載體，不同時承載它的進度或下一步，以走訪各載體的結構判定、絕不看檔名，所以更新進度不必碰目標。OWT-018（error）：對該意圖的每次修改都留下改了什麼、誰核可、為什麼的紀錄；沒有核可者的修改在 OWT-007 交回點被列出、不得靜默，且列出永不阻斷（OWT-008）。OWT-019（warning）：「下一步」欄位點名檔案路徑、測試名稱、指令或需求編號之一，只有動詞不算；這個檢查判斷有沒有點名對象，不判斷句子寫得好不好。嚴重度的理由寫在標準裡。標準也記下對促成本次修改之提示詞刻意**不**採納的部分——那是使用者轉貼、作者不明、沒有實作的文字，只借了設計形狀：以手寫狀態檔當狀態真相（會過期，而戳比過期內容新是隱形的）、固定的開工儀式（由各代理工具設定，且會變成沒有任何 artefact 檢查判定得了的要求）。新增 `scripts/check-open-work-tracking.mjs`，是這三條要求的參考判定程序，作為 OWT-015 證據而非閘門提供（UDS 仍不設閘門，也沒有接進 `pre-release-check.sh`）：`next-action` 回報「點名且已找到／點名但未找到／未點名」，`revision` 比對兩個版本（或一個檔案對 `--base <git rev>`）的驗收／目標／限制區段並要求一筆新增且完整的紀錄、把沒有核可者的修改列給交回點，`separation` 檢查沒有任何載體同時裝著兩者。它判定前先跑自己的自測臂、判定不了時 exit 2（不是 0），並寫明自己判定不了的事——紀錄是否誠實描述了修改、被點名的對象是否正確。**每次跑測試都被觀察到會紅：**測試套件複製該腳本、改它的原始碼文字，要求對真腳本通過的斷言對 17 個突變版失敗（每條要求的永遠通過與永遠失敗、每個辨認分支逐一關掉、舊紀錄被當成新紀錄、不完整的紀錄被接受）。**未校準（OWT-016）：標題詞彙、指令清單、副檔名清單與編號樣式都是初始判斷，不是量測**——例如 `已知限制` 會被讀成限制區段；採用者應傳入自己的編號樣式。在真實歷史上重放，它回報 XSPEC-436 的驗收條件有變動而沒有修訂紀錄，以及 dev-platform 工作紀錄裡一筆未點名的下一步。

- **`turn-completion-integrity` 1.5.0：Antigravity CLI（`agy`）現已支援，依據是真實工作階段觀察到的契約。** 這份標準過去寫 agy「尚未支援」，因為它的 Stop hook 契約還沒被觀察過（R3：不對未經觀察的契約出適配層）。2026-09-29 已觀察（agy 1.2.12、`agy -p`、單輪、無工具呼叫），適配層 `scripts/hooks/check-turn-completion-agy.mjs` 建立在那次實跑的產出上，而不只是文件：hook 傳入資料只有 `transcriptPath`，所以最後一則回覆取最後一筆 `MODEL`/`PLANNER_RESPONSE`，人的訊息取最後一筆 `USER_EXPLICIT`/`USER_INPUT`（從 `<USER_REQUEST>` 內取出，後面的系統區塊丟掉）。`SYSTEM_MESSAGE` 紀錄絕不當成人說的話——agy 會把這個 hook 自己的 `continue` 理由寫回成這種紀錄，讀成人的話會讓 R9 叫停豁免失效。攔截是 `{"decision":"continue","reason":...}`，放行是 `{}`，所有失敗路徑都放行。`uds init --with-hooks` 在選了 Google Antigravity 時寫入 `.agents/hooks.json`（遇到無法解析的 `hooks.json` 不覆蓋），`uds uninstall` 只移除 UDS 自己的 handler、保留使用者其他 hook。**已驗證範圍：單輪、無工具呼叫、`agy -p`。未驗證：多輪、含工具呼叫的回合、互動模式、`fullyIdle: false`、`error` 非空、`.agents/hooks.json` 是否需要已登記的 Antigravity 專案、以及工作目錄是否永遠是 `.agents/`**——標準、適配層與安裝輸出都寫明了這一點。**同日實測：agy 執行 hook 時的工作目錄是 `.agents/`（不是專案根目錄），且對啟動失敗的 hook 靜默放行，所以安裝的指令是 `node ../scripts/hooks/check-turn-completion-agy.mjs`。**

## [6.13.1] - 2026-09-28

> **修補版**：修正 6.13.0 暴露的兩個「以 `uds update` 升級既有專案」的缺陷（繁中的提交訊息語言段落變成英文；AGENTS.md 被改寫成另一種格式且少了「這是索引」提醒），並新增一道發版前檢查，實際從上一個正式版升級一次。**若你已用 `uds update` 升到 6.13.0，請在升級至 6.13.1 後再執行一次 `uds update`**，以還原那些段落。

### 新增

- **`scripts/check-upgrade-fidelity.sh`，已接進 `pre-release-check.sh` 第 24 步：每次發版前跑一次真實的跨版本 `uds update` 升級檢查。** 上面修的兩個缺陷有同一個共同形狀——只有「既有專案、已經被上一個正式版更新過，再對更新版執行 `uds update`／`uds update --apply`」時才會發作——而 pre-release-check.sh 其餘 31 步與 CI 全都沒抓到，因為沒有任何一步做真正的跨版本升級：`uds init` 是全新跑一次（沒有東西可以回歸）；`uds update` 對照的 bundled registry 版本又跟 manifest 已記錄的版本相同，會在走到出問題的那段程式碼前就提早返回。此檢查用真實、已發布在 npm 上的上一個正式版建立三種專案形狀（對應三個真的踩到這兩個缺陷的專案），分別用一般 `uds update -y` 與 `uds update --apply` 讓待檢查的 CLI 升級，並斷言：UDS 標記區塊外的內容永不改變；區塊內只允許一次真實升級該有的標準清單／數量變化；CLAUDE.md 的提交訊息語言標題逐字不變（不是「有出現」就算過）；「這只是索引」的提醒存在；一般 update 與 `--apply` 對「該用哪個產生器」意見一致；連續兩次 `--apply`，第二次不再有任何變化。npm 連不上或上一版從未發布時**直接失敗**（結束碼 2，不是略過）——這個檢查唯一的價值就是跑一次真實的發布版，沒有它卻悄悄回報通過，正是要堵住的那個盲點重新打開。已雙向驗證：用 `--cli="npx -y universal-dev-standards@6.13.0"` 重現了上面兩個缺陷（CLAUDE.md 語言被換掉、AGENTS.md 產生器被換掉），並印出實際差異；本機開發版 CLI（已套用 commit `e1524872` 與 `8373207d`）在三種形狀上全部乾淨通過。

### 修正

- **一般（非 `--apply`）的 `uds update -y` 會把專案 CLAUDE.md 裡繁體中文的提交訊息標題悄悄換成英文版，`--plan --integrations-only` 的預演差異也可能忽略專案的顯示語言設定。** `updateCommand` 主流程與其 `--plan` 預演各自獨立地只用 `output_language`／`commit_language`（提交訊息語言）推導整合區塊的內容語言，完全忽略 `display_language`（`uds init` 與 reconciler 一直用來決定「你想讀哪種語言」的設定）。一個以 `display_language: zh-tw` 與 `output_language: bilingual` 安裝的專案——一種常見組合——因此從 `init` 拿到正確的「## 提交訊息語言」標題，卻在下一次一般 `uds update` 拿到「## Commit Message Language」，丟掉了原本正確的語言選擇。已對兩個真實採用者（asiaostrich-telemetry-server、EngramGraph）從 6.12.0 升到 6.13.0 實測驗證。此缺陷早於 6.13.0 就存在（自 2026-03-25 的 commit `ad555d41` 起），且在 `uds update` 對一個已是最新版的專案執行時完全隱形——因為那種情況下它在走到這段程式碼前就提早返回——只有在真正跨版本升級時才會發作，這正是它看起來像 6.13.0 新回歸的原因。`buildToolIntegrationConfig`（`--apply`／reconciler 使用）在 2026-09-16 已修好正確的推導邏輯；現在剩下的兩個呼叫點都改用新增的 `resolveIntegrationLanguage(manifest)` 共用同一份邏輯。新增的回歸測試對著真實臨時專案與真正的產生器（無 mock）重現了確切的缺陷，另有一支靜態守衛測試，只要那段舊的內嵌推導在 CLI 原始碼任何地方重新出現就會變紅。
- **`uds update --apply`（reconciler）只要專案曾經由 `generateAgentsMd` 寫出過 AGENTS.md，就會把它整份改寫成完全不同、opencode 樣式的文件——即使是在剛跑完 `uds init` 後緊接著的第一次 `--apply`，其他什麼都沒改也一樣。** `desired-state-calculator.js` 的 `calculateIntegrations` 會把 `manifest.integrations` 裡任何叫做 `AGENTS.md` 的條目，透過 `resolveToolKey` 解析成 `opencode` 這個工具——不論 opencode（或它的別名 `codex`）是否真的被選為 AI 工具。`uds init` 只要通用摘要寫出過一次，就一定會把 `AGENTS.md` 記進 `manifest.integrations`（那只是一個追蹤標記，不是工具選擇的紀錄），所以每一個 `generateAgentsMd: true` 而且沒選 codex／opencode 的專案都受影響。依產生器本身 2026-08-20 加入的設計說明：per-tool 樣板本來就該只在真的選了 codex 或 opencode 時才取代通用摘要。已在三個真實專案（asiaostrich-telemetry-server、EngramGraph、dev-platform 自己的 `.standards/`）上確認，三者的 `aiTools` 都不含 codex／opencode。`calculateIntegrations`（與 `plan-executor.js` 的 `executeMigrateBlock`）現在會先檢查工具是否真的被選，沒有的話改用一般 `uds update` 本來就在用的同一個 `writeAgentsMdSummary`——`--apply` 與一般 `uds update` 現在會一致。新增的回歸測試驅動真正的 `uds init`／`uds update`（無 mock）；已對還原修正的版本確認會紅，其中一支「第二次 `--apply`」冪等性檢查還額外抓到了修正過程中自己引入的一個雜湊不收斂問題（見下一條）。
- **通用 AGENTS.md 摘要「這個檔案是索引，不是標準本文」的提醒（2026-08-18 加入）從未送到既有專案的受管區塊——只到了檔頭，而檔頭在檔案已存在時，標記式更新從來不會重新產生。** `writeAgentsMdSummary` 對已存在的檔案，永遠只替換 `<!-- UDS:STANDARDS:START/END -->` 兩個標記之間的內容；提醒卻寫在標記外的檔頭。已對兩個真實採用者（asiaostrich-telemetry-server、EngramGraph）實測：不論更新前後，提醒在檔頭和區塊裡都不存在。提醒現在也寫進標記區塊內（措辭與 per-tool 產生器自己的揭露文字 `generateIndexDisclosure` 對齊，不另創第三種），於是每個專案在下一次 `uds update`／`--apply`（不論是新檔還是既有檔）都會收到它。順手把這個區塊也改用 per-tool 產生器本來就在用的同一個 `wrapWithMarkers` 輔助函式組出來（而非手寫標記行），過程中也修掉一個相關缺口：全新的 AGENTS.md 檔案原本也從未帶有「請勿手動編輯」的警告註解，因為過去只有合併路徑才會加上它。

## [6.13.0] - 2026-09-28

> **正式版**：包含下方 6.13.0-beta.1 至 beta.5 的全部內容，beta.5 之後沒有任何變更。重點：回合收尾關卡（agent 說了下一步卻沒做就不得結束回合）現在涵蓋 **Claude Code 與 Codex**，兩者都以從 npm 安裝的版本在真實工作階段驗證過（Codex 要先用 `/hooks` 信任才會執行）；Claude Code 關卡真的會擋（到 beta.4 為止每個回合都放行）；Windows 上可用；`uds uninstall` 會移除它；`uds init` 讓提交前檢查真的執行；`developer-memory` 1.2.0。Gemini CLI 標為過時（Google 已對個人帳號停用，改由 Antigravity CLI 取代，後者尚未支援）。

## [6.13.0-beta.5] - 2026-09-28

> **測試版** — 以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、已知限制、如何退回正式版：見 [docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。**裝過 6.13.0-beta.1～beta.4 的請升級：那幾版的 Claude Code 回合收尾關卡從未擋下過。**

### 修正

- **Claude Code 的回合收尾關卡在真實的 Claude Code 工作階段裡從未擋下過任何回合——6.13.0-beta.1 到 beta.4 的每個採用者都接上了、也在執行，而它放行了每一個回合。** 2026-09-28 以 Claude Code 2.1.283 在真實 `claude -p` 工作階段實測：Stop hook 執行的那一刻，逐字稿裡還沒有最後一則 AI 回覆，因此只讀逐字稿的適配層看到空訊息，應擋的 5 次全部放行；在較長的對話裡，它判斷的會是上一輪的回覆。自我測試與單元測試從頭到尾都通過，因為每一支都餵給適配層一份已經寫完的逐字稿。適配層現在改從 stdin 的 `last_assistant_message`（Claude Code 會送）取得最後一則回覆，逐字稿只用來讀人的那一側（R9），以及在不送這個欄位的版本上當備援。修正後已再次實測。新測試重現關卡當下實際看到的形狀，在舊適配層上會失敗。
- **Codex 的關卡裝上了卻從未執行，而且沒有任何提示。** Codex 會略過專案層級的 hook，直到專案被信任、且這一支 hook 透過 `/hooks` 被信任為止——在 `codex exec` 底下完全無聲。`uds init --with-hooks` 現在會在 Codex 安裝那一行旁邊說明這件事，標準的〈支援的執行環境〉與 `docs/PRE-RELEASE.md` 也補上這個步驟。信任之後，Codex 適配層的擋與放行與它的測試完全一致（2026-09-28 實測，codex-cli 0.155.1）。

### 變更

- **`turn-completion-integrity` 1.4.1：Gemini CLI 適配層標為過時，並明列 Antigravity CLI 尚未支援。** Google 於 2026-06-18 對個人帳號停用 Gemini CLI，改由 Antigravity CLI（`agy`）取代；企業帳號兩者都還能用。適配層為他們保留，但從未在真實的 Gemini CLI 工作階段中驗證過，因此不再與 Claude Code、Codex 適配層並列。Antigravity CLI 文件記載的 Stop hook 契約與所有已出貨的適配層都不同（設定在 `.agents/hooks.json`；傳入資料只有 `transcriptPath`，沒有最後一則回覆或人的訊息；攔截是 `{"decision":"continue"}`），因此在真實工作階段中觀察到這份契約之前不出貨適配層——與 Cursor 不支援是同一條規則。行為不變：選了 Gemini CLI 時，`uds init --with-hooks` 仍會接上它的關卡。

## [6.13.0-beta.4] - 2026-09-28

> **測試版** — 以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、已知限制、如何退回正式版：見 [docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。注意：6.13.0-beta.3 從未上架 npm，其內容隨本版出貨。

### 修復

- **`turn-completion-integrity` 的 Stop hook 在 Windows 上一路到 6.13.0-beta.3 都靜默失效——它照跑、找不到任何語言包、然後放行每一輪對話，且什麼都不印。** `engine.mjs` 的 `loadPacks()` 用 `join(HERE, 'locales', ...)` 組出每個語言包的路徑，直接把這個檔案系統路徑交給動態 `import()`；在 Windows 上那是 `C:\...` 這種路徑，不是合法的 ESM import 指定字串（POSIX 上的絕對路徑恰好也能被解析成合法指定字串，這正是為何在 macOS/Linux 上從未被發現）。2026-09-27 於 CI（windows-latest）實測：每一個出貨的語言包都載入失敗，而每一個原本該回 `block`/`deny` 決策的介接層（Claude Code、Codex、Gemini CLI）全部回傳 `undefined`。修法改用 `pathToFileURL(...).href`，與 `cli/src/utils/standard-fixer.js`／`standard-validator.js` 既有的正確寫法一致。四支 `scripts/check-*.ts` 開發工具腳本有同樣的寫法（Windows CI job 不會跑到它們，因為它們只在 `ubuntu-latest` 上執行，但那裡同樣是壞的），一併以同樣方式修正。新增一支全 repo 走訪測試（`cli/tests/unit/scripts/no-fs-path-dynamic-import.test.js`）掃描 `scripts/`、`cli/src/`、`cli/scripts/` 找這個寫法，未來新增的一處不需要有人記得這次事故也會被擋下。
- **由 `uds init` 寫入的 husky 管理 `.husky/pre-commit`，即使 `core.hooksPath` 已正確接好，在 Windows 上一路到 6.13.0-beta.3 都會讓每一次提交失敗，錯誤是 `error: cannot spawn .husky/pre-commit: No such file or directory`。** husky v9 自己的範本沒有 shebang 行，這在 macOS/Linux 上一直能動，因為 POSIX git 在腳本沒有 shebang 時（`ENOEXEC`）會退回用 `/bin/sh` 執行；git for Windows 沒有這個後備機制，完全無法對沒有 shebang 的檔案 spawn，而且錯誤訊息指向 hook 檔本身而非缺少的直譯器——很容易被誤判成 wiring 問題而非內容問題。`uds init` 現在會在缺少 shebang 時，於 husky 管理的 hook 最前面補上 `#!/bin/sh`，不分平台一律如此，無論是寫新 hook 還是動到既有的採用者檔案（只會插入，絕不重寫採用者自己的 shebang 或任何其他行）。`uds check` 的 `[pre-commit]` 警告新增 `missingShebang` 訊號，獨立於 wiring 回報（一個 hook 可以完全接好但在 Windows 上仍因此失敗），且維持既有設計，只讀不寫。

## [6.13.0-beta.3] - 2026-09-27

> **測試版** — 以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、已知限制、如何退回正式版：見 [docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。

### Fixed

- **`uds init` 會寫入提交前檢查（`.husky/pre-commit`，非 Node 專案則為 `.git/hooks/pre-commit`），卻從未確認 git 真的會執行它。** 它依賴 husky 自己的 bootstrap 機制——`npm install` 觸發 husky 的 `prepare` script 去設定 `core.hooksPath`——而這個時機只在**下一次** `npm install` 執行時才會發生；如果 `node_modules` 早就存在，這件事就永遠不會發生。實測三個既有採用者（asiaostrich-telemetry-server、asiaostrich-telemetry-client、machine-setup，2026-09-26）：三者都有呼叫 `npx uds check` 的 `.husky/pre-commit`，但 `core.hooksPath` 皆未設定，提交時檢查從未跑過——而且完全沒有任何錯誤訊息。`uds init` 現在不再替使用者安裝 husky 或改動 package.json 的依賴；改成直接執行 `git config --local core.hooksPath .husky`（與 husky 自己 bootstrap 內部做的事完全相同），讓檢查在 `uds init` 執行完就立刻生效，無論 husky 有沒有裝。絕不覆蓋使用者既有的 `core.hooksPath`，或既有的 `.git/hooks/pre-commit`——兩者都會被保留原狀，並印出訊息說明檢查**未啟用**及原因。非 Node 專案的原生 hook 路徑也不再無條件覆寫既有的 `.git/hooks/pre-commit`（過去會）。新增 `uds check` 警告 `[pre-commit]`：偵測 UDS 寫入的檢查檔存在，但實際不在 git 真正會執行的路徑上（涵蓋直接設定、husky 自己的 `<dir>/_` shim 轉呼叫、以及原生預設路徑三種形狀），並附上修復方式——這就是像上述三個既有採用者這樣「已經中招」的專案能發現問題的管道。此警告只提示不影響 `uds check --ci` 的結束碼，因為這是每個 clone 各自的本機設定落差，不是標準本身不合規。`core.hooksPath` 不會進版控，所以這道啟用只對執行 `uds init` 的那個 clone 生效——訊息與新警告都會說明這一點。

- **後續修正（2026-09-27）：上面那個修法，若既有採用者手上的 `.husky/pre-commit` 還是 husky v8 舊範本（含 `_/husky.sh` 那一行），照做反而會讓每一次提交都失敗。** 實測其中一個既有採用者的拋棄式 clone：照 `uds check` 原本建議的修法（`git config --local core.hooksPath .husky`）執行，結果印出 `.husky/pre-commit: line 2: .husky/_/husky.sh: No such file or directory`，`git commit` 以 exit 1 失敗——比原本「靜默不跑」的缺陷更糟，因為 `.husky/_/` 這個目錄只有在 husky 自己的 bootstrap 真的跑過後才存在，而直接把 `core.hooksPath` 設成 `.husky` 會讓 git 原封不動地執行這個檔案。`uds init` 的 `setupHuskyHook` 現在會偵測並移除這一行後再改寫 `.husky/pre-commit`（其餘內容——使用者自己加的指令、既有的 `uds check` 那一行——全部保留）；`uds check` 的 `[pre-commit]` 警告偵測到這種舊範本時，不再只單獨建議設定 hooksPath，改成給「先刪那一行、再設定 hooksPath」的兩步修法——因為 `uds init` 對已初始化的專案會直接拒絕執行，修不了這三個既有採用者的問題。`git-hooks.js` 新增共用函式 `hasLegacyHuskyShLine`／`stripLegacyHuskyShLine`。

- **`bump-version.mjs` 在「預發布→預發布」的版本升版時，把 `SECURITY.md`「最新正式版」那一列標錯——實測發生於 6.13.0-beta.2 發版當下（2026-09-26），當時以手動更正。** 它的 `SECURITY.md` 修補邏輯找「裸版號（無尾碼）那一列」來認定是正式版列；新的預發布版號（如 `6.13.0-beta.2`）永遠帶著連字號、永遠不會符合「裸版號」，於是修補邏輯退而求其次改到唯一真正裸版號的那一列——也就是不相關的正式版列——把它的版號換成新的預發布版號，而原本該更新、已經過期的預發布列（仍是 `6.13.0-beta.1`）反而原封不動。已將產生表格的邏輯（`generate-docs.mjs` 原本就寫對、但 `bump-version.mjs` 未使用）抽成共用的 `scripts/lib/security-versions.mjs`，兩支腳本現在都改成用 `(version, stableVersion)` 整段重新產生 2 或 3 列的表格，而不是找一列去 patch——已針對全部四種版本型態轉換（正式→正式、正式→預發布、預發布→預發布、預發布→正式）、三種語言，透過對隔離複本執行一次真正的端到端 `bump-version.mjs` 驗證正確。`check-version-sync.sh` 原本的 SECURITY.md 檢查只比對第一列資料的版號是否等於 `package.json`（一種位置代理，恰好抓到了這次事故）；現在還會逐列比對「標籤」與「該列版號的形狀」是否吻合（「最新正式版／Latest stable」列若版號帶連字號、或「預發布版本／Pre-release」列若版號不帶連字號，即使位置檢查會通過，仍會被標記為錯誤）。

## [6.13.0-beta.2] - 2026-09-26

> **測試版** — 以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、已知限制、如何退回正式版：見 [docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。

### 修正

- **`uds uninstall` 從未移除 `installHooks()`／`installCodexHooks()`／`installGeminiHooks()` 寫入的關卡——不只是 Codex 與 Gemini CLI（6.13.0-beta.1 記載的已知限制），Claude Code 自己的 `.claude/settings.json` 也有一模一樣的缺口，而且從未被記錄過。** `hooks` 這個 uninstall 分類原本只處理 `.husky/pre-commit` 與 `.git/hooks/pre-commit`；三支安裝函式實際寫入的設定檔完全沒有任何 uninstaller 在管，導致每一個關卡在 `uds uninstall` 之後仍持續執行。新增的 `uninstallClaudeCodeHooks`／`uninstallCodexHooks`／`uninstallGeminiHooks`（`src/uninstallers/hook-uninstaller.js`）現在會精準移除 `.claude/settings.json`、`.codex/hooks.json`、`.gemini/settings.json` 裡 UDS 安裝的項目——辨識依據是指令路徑**加上**一份 UDS 目前確實有出貨的腳本檔名清單，不是只看路徑，這樣使用者自己放進 UDS 同一個 `scripts/hooks/` 目錄底下的 hook 就不會被誤刪。移除後變空的事件陣列會一併從設定裡移除；設定檔若因此變成完全空的物件（代表整份都是 UDS 寫入的）就直接刪除檔案，否則保留檔案並寫回其餘內容。JSON 格式損壞時回報錯誤並保持原樣，不會覆寫。已接入 `uds uninstall` 既有的 `hooks` 分類、`--dry-run` 預覽，以及互動選單裡該分類的說明文字。
- **Codex 轉接層的 R9 豁免（「使用者叫停就放行」）在真實 Codex 安裝上從未真的生效過——`scripts/hooks/check-turn-completion-codex.mjs` 的 `bestEffortLastUserMessage()` 試過的兩種紀錄形狀都讀不到欄位。** 已對真實 codex-cli 0.156.1 的 `~/.codex/sessions/**/*.jsonl` 逐字稿坐實：一則使用者訊息紀錄長這樣——`{"type":"response_item","payload":{"type":"message","role":"user","content":[{"type":"input_text","text":...}]}}`——訊息住在 `payload` 底下，不在該筆紀錄最外層、也不在 `message` 鍵底下，所以那個欄位一直被讀成不存在，R9 從未真的豁免過任何一輪 Codex 回合。現在優先讀 `payload.type === "message"`（其餘紀錄型別若剛好用到原本那兩種形狀仍保留為後備），一併支援 `input_text` 內容項目（與既有的 `text` 形狀並存），且不把 `role: "developer"` 的紀錄當成使用者訊息。`core/turn-completion-integrity.md`「支援的執行環境」一節與 `docs/PRE-RELEASE.md` 已從「未對照真實安裝驗證過」更新為已坐實的真實形狀。
- **R9 的 zh-TW 叫停偵測漏掉「要離開、稍後再續」這一族——已實測：「我要出門了，等我回來再繼續」在 2026-09-25 真的誤擋了一次 Claude Code 的回合完成關卡。** 這句與「暫停，我要出門」都沒有被既有的任何一支 `STOP_REQUEST` 樣式接住。新增兩支窄樣式：離開類詞（出門／離開一下／先走）必須跟「稍後再續」類詞（等我回來／回來再／明天再／晚點再／待會再）或裸的「暫停」同時出現在同一小段裡——單獨的離開詞（例如「出門前把這三件做完」，這是要求離開前做完，不是叫停）語料仍必須判 false。順手查了 en 語料包有沒有一樣的缺口，發現 `\bI'?m (heading|going) (home|out)\b` 是永遠打不中的死碼：`isStopRequest()` 一律先呼叫 `normalize()`，會把 "I'm" 改寫成 "I am"，只認縮寫形的樣式因此永遠配不到；已修成 `I(?:'m| am) (heading|going) (home|out)`，坐實裸的 "I'm heading out." 修前為 false、修後為 true。

## [6.13.0-beta.1] - 2026-09-26

> **測試版** — 以 `npm install -g universal-dev-standards@beta` 安裝。要測什麼、已知限制、如何退回正式版：見 [docs/PRE-RELEASE.md](../../docs/PRE-RELEASE.md)。已知限制：`uds uninstall` 尚不會移除 Codex／Gemini CLI 設定裡的關卡。

### 新增

- **`turn-completion-integrity` 1.4.0 把 Stop 關卡推廣到 Codex 與 Gemini CLI，與既有的 Claude Code 轉接層並存。** 判斷邏輯（語料包、冷卻、滾動視窗、自我回音標記）抽到共用的 `turn-completion/engine.mjs`，三支工具腳本各自只轉譯自己工具的契約，不再各帶一份判斷邏輯。Codex（`.codex/hooks.json`，Stop 事件）直接從 stdin 讀 `last_assistant_message`，在 exit 0 時於 stdout 印 `{"decision":"block","reason":...}` 來擋下——官方文件寫明這個事件純文字或空輸出無效，這點與 Claude Code 的「沉默即放行」不同；使用者的最後一則訊息用 `transcript_path` 盡力讀取，因為其確切格式未對照真實安裝驗證過，所以 R9（豁免使用者主動喊停的回合）在 Codex 上是文件記載的已知落差，不是靜默失效。Gemini CLI（`.gemini/settings.json`，`AfterAgent` 事件）的 stdin 直接給 `prompt` 與 `prompt_response`，完全不需要解析逐字稿，擋下方式是 `{"decision":"deny","reason":...}`——官方文件標記為優先於 exit code 2 的做法。`uds init --with-hooks` 現在也會呼叫 `installCodexHooks`／`installGeminiHooks`，門檻是採用者有沒有選那個工具，沒用到 Codex 或 Gemini CLI 的專案不會被寫入任何東西。Cursor 已評估，明確標記為不支援（Cursor 的 stop hook 能不能真的擋下一個回合仍未確定）。見[支援的執行環境](../../core/turn-completion-integrity.md#supported-harnesses)與 [CLI-INIT-OPTIONS.md](../../docs/CLI-INIT-OPTIONS.md#claude-code-以外的強制執行-hooks)。

- **`developer-memory` 1.2.0：新增 `code-reference` 過期查核——記憶引用的檔案路徑或符號一旦搬走或不存在，浮出前就會被標記，不再被悄悄沿用。** 沿用 `knowledge-graph-memory` 1.0.0 已定義的雙模式（§2），不另外發明第三種：降級模式（沒有圖引擎——AI 自己用 Glob／Grep／Read 確認引用還在，與既有的記憶驗證原則同一套機制）與引擎模式（有圖引擎時，例如 EngramGraph 的 `egr refs check`，回報每個引用的狀態：`present`／`moved`（附新位置）／`missing`／`unresolvable`）。`unresolvable` 一律不得當成 `present` 或 `missing`——它代表查核器無法判斷，不是引用沒事或已消失。時機掛在既有的 `proactive-surfacing` 規則（§4.1），查核在記憶浮出**之前**進行，不是之後。第一批只涵蓋檔案路徑與符號名稱（函式／類別）；`file:line` 明確排除在外——行號會隨任何不相關的編輯漂移，屬於不同種類的過期（見 DEC-115 OQ-1，2027-01-31 前重新評估）。`core/developer-memory.md` §11 加入一段非規範性的 Claude Code `SessionStart` hook 範例；其他工具則改走各自 repo 的說明檔（CLAUDE.md／AGENTS.md／.cursorrules 等）。（DEC-115-L1）

### 修正

- **`turn-completion-integrity` 的 zh-TW 與 en 偵測器，會在前提是使用者自己決定的條件式承諾上誤擋。** 「你選定後，我會把這一輪的發想寫成正式決策紀錄…」被判成未兌現的承諾——既有的豁免只涵蓋「要求資訊」與「要求回報」，沒有涵蓋「前提是使用者的決定」這種條件句。zh-TW 新增一支窄樣式：你 + 短決定動詞（選定/選好/決定/確認/回覆/點頭）+ 後 + 逗號 + 我；en 新增以文法為準（不是動詞清單，延續本包既有設計）的 `(once|after|as soon as) you ..., I` 樣式。兩份語料都補了成對的反例（主詞不是你/you，或只有一半的形狀），證明收窄沒有連帶漏擋真的未兌現承諾；en 版本也記下一個刻意留下未解的已知限制（前提與 "I" 之間沒有逗號時仍會誤擋——放寬會漏擋真的未兌現承諾）。

## [6.12.0] - 2026-09-25

### 新增

- **新標準 `open-work-tracking`——`deferred-item-exit` 的下游一半。** `deferred-item-exit` 要求被延後的項目離開原文件、走向可追溯的出口，但刻意不規定出口的承載處；東西進了承載處之後，沒有任何規則防止承載處本身腐壞。本標準以 16 條要求（OWT-001～016）補上：低摩擦的記錄點（必填欄位至多兩個）、每個等待中的項目旁寫明解除條件、可推導的欄位由產生而非手寫、以內容證明「最新」而非可隨手改的時間戳、覆蓋率數字要寫出它看不到什麼，以及每輪結束時回報未完成工作但**從不阻擋**的檢查點。最後一點刻意與掛在同一事件、會阻擋的 `turn-completion-integrity` 相反；標準內附對照表，避免採用者把兩者接成同一件事。其中兩個數字門檻標明為初始判斷、非量測結果。

## [6.11.0] - 2026-09-18

### 修正

- **`uds update --plan`／`--apply` 對整合檔永遠不會收斂：即使剛跑完 `--apply`、檔案內容與產生器會產生的內容逐位元組相同，仍會顯示 `Migrate Block: N`。** `diffIntegrations` 對任何帶有 UDS 標記的整合檔都無條件產生 `migrate_block` 動作——「我們一律更新整合檔，因為內容是動態產生的」——因為 desired state 從未帶有可比對的雜湊（`hash: null`，註解說「產生後才計算」，但從未真的算過）。desired-state calculator 現在會用 `--apply` 自己會用的同一條路徑（`buildToolIntegrationConfig` ＋ `generateIntegrationContent`）產生整合檔內容，並只對 UDS 區塊算雜湊，讓 `diffIntegrations` 能像其他每個類別一樣分辨「內容已經相符」與「內容不同」，雜湊相符時回報 `unchanged` 而非 `migrate_block`。一份區塊真的過期的檔案（手動編輯過，或由舊版 CLI 產生）仍會照舊產生 `migrate_block`。產生失敗（例如 registry 解不出某個工具）時回退成修正前的無條件行為，不會讓計畫當掉。
- **`uds check` 可能在同一次執行裡對同一個整合檔印出兩則互相矛盾的「已參考」宣告。** `standardsReferenced`（「{count}/{total} 項標準已參考」）掃描整個整合檔本文——標準名稱在任何地方被提到都算。`standardsNotReferenced`（「未參考的標準（選用）：」）只看結構化的 `Reference:`／`參考:` 行。一個標準在檔案散文中被提到、卻沒有列在任何 `Reference:` 行上，會在同一次執行裡同時滿足第一則宣告、又落在第二則宣告裡——同一個詞（「已參考」／「參考」），量測的是兩件不同的事，讀起來像矛盾。三語的第二則訊息都已改寫成精確描述它實際檢查的內容（沒有出現在 `Reference:`／`參考:` 行），取代原本籠統的「未參考」宣告。
- **單純的 `uds update --plan` 與 `uds check` 從未提示 Skills 或 Commands 版本落後最新 UDS 釋出版。** 版本落後只由 `uds update --plan --skills`／`--plan --commands` 計算——一般的調和 `--plan`（不帶範圍旗標）呼叫的是另一個從未碰觸這件事的函式，`uds check` 則完全沒有對等的檢查。使用者跑純粹的 `--plan` 或 `check` 時，看到的是一份乾淨的報告，儘管 Skills 落後了一整個小版本，也沒有任何提示說帶範圍的 plan、或 `uds update --skills` 有事可做。兩者現在都會在任何已安裝的 Skills 或 Commands 版本落後時，印出簡短的「`<工具>`（`<位置>`）：v舊 → v新」提示，並附上修復指令。這比照既有的頂層「Version: X → Y ⚠」列，而非整合區塊完整性檢查（XSPEC-418 R1）：落後最新版是使用者更新前的常態，不是像 UDS 區塊被修改／遺失那樣的合規缺陷，因此不會讓 `uds check --ci` 失敗。
- **6.10.0 的死連結修正（P2）把一則寫著 6.0.0 之前檔名的參考直接刪掉，而不是改寫它，還可能留下一個懸空的逗號。** `resolveStandardReferences` 比對一行 `Reference:` 的 stem 時只查 manifest 已安裝清單，從未查過 `STANDARD_ID_MAPPING`（conversion-rules.js）——這正是 `yaml-generator.js` 別處已在用、記錄「舊檔名 → 現行 id」的對照表。一行寫著舊檔名 `.standards/commit-message-guide.md` 而專案其實裝了 `commit-message` 的參考，看起來和一個專案刻意不裝、已停用的 UDS 標準一模一樣，於是被整行刪掉，而不是改寫成 `.standards/commit-message.ai.yaml`。另外，刪掉一項參考後的逗號清理只處理了尾端逗號、重複逗號、逗號前多餘空白，沒處理「一行裡第一項參考被刪掉、逗號緊貼在冒號後面」的狀況（`Reference:, .standards/other.ai.yaml`）。整段改寫成「拆項 → 解析或捨棄 → 重新 join」，取代在原地修補被刪字串周圍標點的作法。
- **被 6.10.0 `resolveStandardReferences` 缺陷刪掉的主要標準參考，即使套用上面的修正也不會自己回來。** 把刪除動作留下的懸空逗號清掉，修好的只是那一行的標點，不是把被刪掉的項目帶回來——像「## 提交訊息標準」這樣的 UDS 範本段落活在 UDS 標記之外，一旦某一項被刪掉，就沒有任何東西會重新產生那段內容。針對這個特定情境新增一個範圍刻意收窄的自動補回機制：當一行的標題與某個 UDS 範本標題完全相同（`RULE_TEMPLATES` 出貨的任一語言版本），而且該範本的主要參考（它自己「`Reference:`」／「`參考:`」行上的第一個 `.standards/...` 項）不在檔案那一行裡，且該標準確實已安裝，就會把它補回該行最前面——行內其他內容（專案自有項目、options 檔、既有順序）原樣不動，不會補回任何次要範本項目，使用者自己寫的段落（任何其他標題）一律不碰。此修復是冪等的。只修復 6.10.0 那次刪除造成的問題，不嘗試修復由無關手動編輯造成的參考損壞。
- **單純的 `uds update` 從未修復上面 Q1 缺陷留下的壞掉 `integrationConfigs[file].categories`——只有 `--sync-refs` 會。** 一份已經帶著 `categories: []`（來自較舊、有缺陷的 `--sync-refs` 執行）的 manifest，會在之後每一次單純的 `uds update --yes` 都維持壞掉：該指令自己的整合同步步驟會寫 `integrationBlockHashes`，卻完全不會讀取 `integrationConfigs`，所以沒有任何東西修正它——而下一次 `uds check --restore-missing` 就會用那份壞掉的儲存設定重建整合檔，再次悄悄漏掉段落。`uds update` 現在會用 `--sync-refs` 同樣的方式（`calculateCategoriesFromStandards`）修復空的或無法辨識的 `categories` 值，而已經有效的清單維持原樣不動，讓單純的 update 不會每次都變成完整的重新同步。
- **`uds update --sync-refs`／`--integrations-only`／`uds check --migrate`／`uds config` 可能悄悄把 `manifest.version` 降版，同一條同步路徑還會在一份正常的 3.4.0 manifest 上算出空的分類集合。** 五個寫入點寫死了一個較舊的 schema 版本字面值（`'3.1.0'`／`'3.2.0'`／`'3.3.0'`），而不是 CLI 目前的 schema 版本（`3.4.0`）——對一份已經是最新版的 manifest 執行上述任一指令，都會把版本寫回舊的。另外，`calculateCategoriesFromStandards`（`--sync-refs` 用來決定 CLAUDE.md／AGENTS.md 該含哪些段落的函式）用檔名查每個標準，但 3.4.0 manifest 存的是純 stem（`commit-message`，而非 `commit-message.ai.yaml`）——每次查詢都落空，分類集合變成空的，下一次 `--sync-refs`（或 `--restore-missing` 重建）就會重新產生一份完全漏掉反幻覺／commit-message／code-review 段落的檔案。兩者現在都在同一個真實來源處修復：一個共用的 `bumpManifestVersion` 輔助函式，只會讓 manifest 版本朝最新前進，不會倒退；以及同檔案裡別處已在用、支援 stem 的分類查找（`categoryForStandard`）。這讓分類計算恢復成 `--sync-refs` 在 6.10.0 之前的算法——依實際已安裝的標準計算，而非固定清單——所以完整重新產生（`--sync-refs`、`--integrations-only`，或單純的 `uds update`）現在會寫出每一個有範本、且背後有已安裝標準的段落（目前 9 段），而不只是全新 `uds init` 播種的那 3 段；對一個已經有完整段落的專案做純區塊更新則不受影響。
- **一句單純提到 UDS 標記文字的句子，可能被誤認成真正的區塊邊界，導致從那句話到真正 END 標記之間的所有內容——包含採用者自己的內容——都被刪除（v3.5.0–6.10.0）。** 每一個定位標記的呼叫點都直接用 `content.indexOf('<!-- UDS:STANDARDS:START -->')`／`.indexOf('...:END -->')`，這會比對到檔案中任何位置出現的標記文字：一句逐字引用標記語法來解釋它的句子（本專案自己的 CLAUDE.md 就是這樣做），或程式碼區塊裡含有它的範例，都和真正的邊界無從分辨。這影響了所有四條會重新產生整合檔 UDS 區塊的寫入路徑：`uds update --integrations-only`、`uds update --apply` 的 `migrate_block` reconciler 路徑、`uds update --sync-refs`，以及 `uds check --restore`（XSPEC-418 R6 讓它也會還原受損的 UDS 區塊）。標記現在只在（去除前後空白後）獨占一整行、且那一行不在 fenced code block（``` ／ ~~~）內時才算數；所有呼叫點現在都經過同一個共用的 `locateMarkerBlock` 輔助函式，並以靜態掃描守衛測試強制執行，避免未來的呼叫點又退回直接用 `indexOf`／`includes`。含有兩組真正標記對的檔案（損壞，或手動編輯出錯）不再被猜測——每條寫入路徑都會拒絕執行並列出兩個標記所在行號，`uds check` 也會明確回報這個狀態，不再併入「已修改」或「找不到標記」。
- **`uds check --ci` 可能畫面上印出整合區塊的 ✗，結尾卻仍宣稱專案符合標準並以結束碼 0 收尾。** `checkIntegrationBlocksIntegrity` 的檢查結果（區塊被修改／遺失／UDS 標記被移除）算出來也印出來了，卻在最終判定被丟棄——判定只看標準檔完整性。若你的 CI 一直對某個 CLAUDE.md／GEMINI.md 等檔案的 UDS 區塊實際上已被移除或改動的專案顯示綠燈，那就是這個缺陷；`--ci` 現在會正確地失敗，直到區塊被復原（`uds update --integrations-only`）或專案以其他方式恢復同步為止。互動式 `uds check`（不加 `--ci`）不受影響——仍以結束碼 0 收尾，不中斷一般使用。（XSPEC-418 R1）
- **整合檔（CLAUDE.md、CLAUDE.local.md、AGENTS.md 等）同時被整份內容與 UDS 區塊兩套雜湊追蹤，兩套檢查在同一次執行裡可能互相矛盾。** 全新 `uds init` 從不替這些檔案記錄整份雜湊，但 `uds update --integrations-only` 會——跑過一次之後，使用者在 UDS 區塊**外**的任何修改（正是 marker-based update 承諾保留的自訂內容）都會讓 `uds check --ci` 報 `CLAUDE.md（已修改）` 並結束碼 1，而同一次輸出裡自己的區塊完整性檢查卻說區塊完好。另外，`uds check --restore` 正確地重寫了損壞的區塊（保留區塊外內容，沒有資料遺失），卻只更新了整份雜湊，從未更新區塊雜湊——於是下一次 check 對一個才剛被正確還原的區塊報 `CLAUDE.md（UDS 區塊已修改）`。整合檔現在不再寫進 `fileHashes`（只寫進本來就只追蹤區塊的 `integrationBlockHashes`）——走訪了所有寫入點，不只原始回報的兩處，包含 `--apply`／`--plan` 的 reconciler 路徑與 `--sync-refs`；既有 manifest 裡這類檔案殘留的整份雜湊，會在下一次 `uds update`（或 `uds check --restore`／`--migrate`）時被移除，區塊雜湊保留。`uds check --restore` 還原整合檔後，現在會把區塊雜湊更新成實際寫入的內容。已用一份真實採用者的 manifest（恰好帶有這個殘留欄位）驗證：同一份輸入，修正前 `uds check --ci` 結束碼 1，修正後結束碼 0。後續複核另發現兩個缺口，一併修掉：`uds check --restore` 過去對受損的 UDS 區塊完全無作用——它靠的是 `fileStatus`，而那完全由 `fileHashes` 建構，已不含整合檔，於是它悄悄還原了 0 個檔案而區塊仍是壞的；`--restore` 現在也會還原被判定為「已修改」或「標記遺失」的區塊（不動區塊外內容，`--restore-missing` 行為不變）。另外，因為上面新增的清除邏輯只掛在寫入路徑，既有 manifest 裡殘留的整份雜湊若不曾跑過寫入，純 `check` 永遠沒有機會清掉它——標準檔完整性檢查現在也會在讀取時略過同時被 `integrationBlockHashes` 追蹤的鍵，讓未跑過 `update` 的既有專案也能回報乾淨。（XSPEC-418 R6）

### 新增

- **`uds init --claude-target <project|local>` 與 `uds update --claude-target <project|local>`：在已有團隊 `CLAUDE.md` 的 repo 裡個人採用 UDS。** 過去 UDS 的 Claude Code 整合一律寫入 `CLAUDE.md`——團隊共用、會進版控的檔案——沒有任何改寫目標的方式。在已有團隊 `CLAUDE.md` 的 repo 裡個人採用 UDS 的使用者，只能手動把 UDS 區塊搬到 `CLAUDE.local.md`（Claude Code 原生支援、緊接在 `CLAUDE.md` 之後讀入的檔案），而從那一刻起 `check`／`update`／`uninstall` 全都回報錯誤，或悄悄寫回團隊檔案——包含在例行孤兒清理中把搬移後檔案自己的雜湊當「孤兒」刪掉。
  `uds init` 的 `--claude-target local` 從一開始就把整合內容寫進 `CLAUDE.local.md`；團隊的 `CLAUDE.md` 完全不會被動到。`uds update --claude-target <project|local>` 則讓**既有**安裝不必重裝就能切換目標：從舊檔移除 UDS 區塊（保留寫在裡面的其他內容；若舊檔在移除後只剩 UDS 內容則整個刪除，與 `uninstall` 既有規則一致）、寫入新目標、並更新 manifest，不論新目標是否已存在手動搬過去的區塊。`check`、`update`（含 `--integrations-only`／`--force`）與孤兒雜湊清理現在都經同一個函式解出工具的實際目標檔，不再各自假設預設值——從未使用 `--claude-target` 的專案完全不受影響：manifest 只有在選擇 `local` 時才會多出 `integrationTargets` 欄位。`--claude-target` 不影響 `AGENTS.md`；若不想讓它進版控，一樣要自己透過 `.git/info/exclude` 排除。UDS 不會自動把 `CLAUDE.local.md` 寫進 `.gitignore`——請自行加入——且因為它未受版控，只存在於建立它的那個 git worktree。詳見 [CLI-INIT-OPTIONS.md](docs/CLI-INIT-OPTIONS.md)（「Claude Code 整合目標檔」一節）。（XSPEC-418 R2–R4）

## [6.10.0] - 2026-09-16

### 修正

- **`uds update --apply` 會忘掉它沒有動到的每一個斜線命令，而 `uds check` 說一切完整。** 一個裝有 51 個 OpenCode 命令的專案，三個檔案內容漂移：plan 列出那三個，`--apply` 之後 manifest 只剩三筆 `commandHashes`——另外 48 個檔案仍在磁碟上，卻沒有任何東西在追蹤它們。同一次 `uds check` 同時印出「Commands: 51 installed」與「✓ All command files intact (3 files)」，而竄改那 48 個之一，兩行都不會變（2026-09-16 於乾淨暫存專案在 6.9.0 上實測）。reconciler 在合併新雜湊前，會先刪掉該工具的所有雜湊鍵——只有在安裝器重裝了該工具全部命令時才正確，`uds update` 自己的呼叫點是如此，plan 這條路不是。現在改為合併，與 skills 路徑一直以來的做法相同；plan 標記刪除時，只移除該檔案那一筆。`uds check` 另外列出磁碟上沒有任何雜湊涵蓋的命令檔，兩個數字不再能各說各話。
- **整合檔指向磁碟上不存在的標準，而參考檢查說它們同步。** 以 `--format ai` 安裝的專案，`uds update --integrations-only` 寫出 `Reference: .standards/anti-hallucination.md` 與 `.standards/checkin-standards.md`，這兩個檔案只存在於 `human` 格式。規則模板一律以 `.md` 書寫參考路徑，不看實際安裝格式；而規則段落位於 UDS 標記之外，標記式更新從不刷新它們——由舊版 CLI 首次寫出的檔案，在該檔案停止出貨兩個主版本之後，仍留著 `.standards/commit-message-guide.md`。現在無論是產生新檔或更新既有檔案，參考路徑都會對照這個專案實際安裝的標準與格式解析；指向未採用標準的參考會被移除，而不是留成死連結。`uds check` 改為回報「檔案不存在」的參考，而不是以去掉副檔名的名稱比對。只有 UDS 自己出貨的標準會被移除：專案自行放進 `.standards/` 的檔案，其參考原字不動。
- **`uds check` 建議執行 `uds update --sync-refs`，而它跑不起來。** manifest 沒有 `integrationConfigs` 時 `--sync-refs` 直接中止，而這個鍵只有 `uds init` 的互動流程會寫入——以 `uds init -y` 建立的專案從第一天起就是 `{}`，所以一個全新的 6.9.0 專案，已經處在那段錯誤訊息歸咎於「舊版本、手動複製」的狀態。`--sync-refs` 現在會從 manifest（integrations、AI 工具、標準、選項）重建設定，而不是拒絕執行；`uds check` 只在它確實可執行時才提它，否則改指 `uds update --integrations-only`。
- **`uds check` 把已採用的標準報成索引中缺少。** id 對檔名的表只從 `source.ai` 建立，但部分 registry 條目的 `source` 是字串——`zh-tw-locale` 是 `extensions/locales/zh-tw.md`——於是它安裝出的 `.standards/zh-tw.md` 從未被認出，在明明列出該檔的整合檔上顯示「67/68 項標準已參考，缺少：zh-tw-locale」。
- **參考同步把選項檔報成孤兒，並建議 UDS 已不再出貨的檔名。** 選項記在 `manifest.options` 而非 `manifest.standards`，於是每個 `.standards/options/*.ai.yaml` 參考都被報成「未在 manifest 中」；而「未參考的標準」清單來自一張手寫的 6.0.0 之前檔名表（`git-workflow.md`、`error-code-standards.md`、`project-structure.md`）。現在選項會被認得，清單也只列出這個專案實際持有的檔案。
- **`uds check` 把 `AGENTS.md` 列了兩次。** Codex 與 OpenCode 共用同一份檔案，而檢查是逐工具而非逐檔案進行。現在每個檔案只回報一次，並標明共用它的工具。
- **七條 `core/*.md` 標準自 6.0.0 起就沒有被安裝過，而它們一個字都沒說（[#180](https://github.com/AsiaOstrich/universal-dev-standards/issues/180)）。** 它們的 `.ai.yaml` 在 6.0.0 被移除，文件則刻意留在 `core/` 當作採用層的參考——這個決定合理，也記在 `docs/MIGRATION-v6.md` §2 與 `scripts/reference-only-standards.json` 裡，但**沒有記在讀者真正會遇到它的地方**。遷移指南在升級時讀一次，`core/` 是持續被讀的：走訪它來回答「UDS 有哪些標準」的人或 agent 會數到 152 份，其中七份 `uds init` 從未安裝過。七份現在都在開頭帶一段 `<!-- UDS:REFERENCE-ONLY -->` 告示，英文、繁中、簡中三份都有，並指向遷移紀錄與那份機器可讀清單。新閘門（`npm run check:reference-only`，已接進 CI 並附兩臂自測）從 registry 裡每一條 `source.human` 現算出貨面，把它與 `core/*.md` 的差集當成 reference-only 集合，要求每一份都要揭露——**反過來也要求有在出貨的文件不得帶著這段告示**，所以一條重新開始出貨的標準不會留下一句謊話。用現算而不是比對那七個名字，是為了讓下一次縮減範圍不會重演同一種沉默。
- **`--format human` 的安裝把 `testing-standards.md` 掛在兩個標準 id 底下送出，而全覆蓋那一份從來沒送到。** `full-coverage-testing` 的 registry 條目把 `source.human` 指到 `core/testing-standards.md`，於是 `core/full-coverage-testing.md`——一條活著的標準，最近一次維護是 XSPEC-288——沒有任何人裝得到，而 human 格式的 manifest 裡同一條路徑出現兩次。`check-registry-completeness.ts` 的 Check 2 看不到它：那支只要 human 或 ai 任一條路徑出現在 registry 文字裡就算通過，而 ai 那條在。由上面那支閘門首跑時抓到，是七份預期之外的第八份。修正前後各跑一次真正的 `uds init --format human` 驗證。
- **`uds update --sync-refs` 寫進去的標準數，`uds check` 當場否認。** manifest 有 73 條標準的專案，`--sync-refs` 把 CLAUDE.md 改成宣告 76 條，`uds check` 隨即回「索引宣告 76 條標準，manifest 實際有 73 條」；而 `--integrations-only` 算得出正確數字，於是它看起來像計數錯誤，其實是**來源錯誤**。`--sync-refs` 是從 `integrationConfigs[檔名]` 重新產生的，那裡面的 `installedStandards` 是安裝當時的快照、**沒有任何路徑會更新它**——跨大版本升級過的專案，它仍列著 6.0.0 就停止出貨的標準，而它列什麼，檔案內容就是什麼。現在改為從 manifest 重新產生，正如 `buildToolIntegrationConfig` 自己的註解一直寫著的那樣；舊快照只剩 `outputLanguage` 還有發言權，避免一個早於該選項的 manifest 把使用者的選擇悄悄重設。
- **已安裝標準索引在每個專案都寫「options 0」。** `uds init` 把安裝清單縮成純檔名，而下游一律以 `/options/` 這個路徑片段判斷選項——在 `contentLayout: flat` 底下根本沒有目錄可以還原它。一個有 66 條核心標準與 7 個選項的專案，被告知自己有「73 條（core 73、options 0）」。同一個縮減也讓 AGENTS.md 裡每個選項檔都被寫成 `.standards/<名稱>.ai.yaml`，比選項實際安裝的位置高一層，於是每一條都是死連結——而它們就列在一句「你必須讀這些標準」底下。現在路徑完整傳遞，AGENTS.md 的選項寫在 `.standards/options/`，並且依專案實際格式而非一律假設 `ai`（`--format human` 的專案先前拿到的是一串 `.ai.yaml` 檔名，而它手上是 `.md`）。
- **照著遷移指南做，會讓 `uds check` 報錯，而它給的解法不可能成功。** MIGRATION-v6 §2 說要手動刪掉七個已降級的 `.ai.yaml`。刪掉之後 `fileHashes` 紀錄還在，`uds check` 於是把七個檔案報成遺失並建議 `uds check --restore`，而那個還原在每一個檔案上都失敗（「無法判斷來源」）——上游自 6.0.0 起就沒有來源了。**工具要求採用者推翻它自己的文件，用的還是一個它已經知道跑不動的指令。** 現在，一個 UDS 已不再出貨的檔案不見了，會與真正的遺失分開回報、用灰色、並給出真的有用的解法；`uds update` 會清掉那些紀錄並逐筆說出清了什麼，**包含已經在最新版的專案**——照指南做過的人必然都在那個狀態。`--prune` 碰不到它們：它刪的是走訪 `.standards/` 時找得到的檔案，而這些正是已經不在那裡的。
- **UDS 重新產生了 AGENTS.md，卻沒有記下自己寫了什麼。** `uds update --integrations-only` 之後緊接著 `uds check`，會在一個只有 UDS 動過的檔案上報 `AGENTS.md（已修改）`。三個寫 AGENTS.md 的呼叫點都記了 `integrationBlockHashes`，沒有一個記 `fileHashes`。現在已存在的紀錄會被更新；manifest 沒在追蹤的檔案仍然不會被納入追蹤——那份摘要本來就是給採用者擴寫的。
- **在 Windows PowerShell 上，跑成功看起來像失敗。** 進度訊息走 stderr，而 PowerShell 5.1 會把原生指令的任何 stderr 輸出包成 `NativeCommandError`——**包括 `✔ 已重新產生 2 個整合檔案` 這句報告成功的話**。改動前實測：stdout 9 行、stderr 2 行，兩行都是 spinner。47 個 spinner 現在一律寫 stdout，成功的一趟 stderr 是空的。
- **刪除計畫用同一句話解釋三種完全不同的情況。** 「no longer in desired state」同時被印給「上游已移除的標準」「專案自己取消選取的選項」「desired state 根本沒有模型化的路徑」——三種情況的正確反應各不相同。現在理由會說出是哪一種，以及重新選取能不能把檔案救回來。`.standards/release-config.yaml` 則完全不再是刪除候選：它是 `uds init` 依使用者挑的發版模式寫出、`uds config` 會改寫的檔案，刪掉它是在丟掉一個設定卻自稱在對帳。它被保留，而且理由會被印出來，不是默默跳過。
- **一個 .NET Framework 專案拿到四個指令，其中三個跑不動。** `.csproj` 自 2017 年起同時指涉兩套互不相容的建置系統，而偵測只看副檔名：舊式專案（`<TargetFrameworkVersion>`、沒有 `Sdk` 屬性）拿到 `dotnet build`（以 `MSB4019` 失敗）與 `dotnet list package --vulnerable`（對 `packages.config` 專案靜靜地什麼都不報，因為它只讀 `PackageReference`）。舊式專案現在 `build` 給 `msbuild`，其餘留白——未知生態那一支本來就回傳空字串「讓使用者自己填」，而**一個人類會補完的空格，勝過一個看起來很權威、第一次執行就失敗的指令**。
- **每一份生成的指示檔，開頭都叫 AI 去讀一個永遠不會被安裝的目錄。** 九個工具、每種語言，全都以「**優先**讀取 `core/` 中的精簡規則（例如 `core/testing-standards.md`）」開場。`uds init` 安裝到 `.standards/`，從來沒有在採用者的專案裡建立過 `core/`——那是標準在 UDS repo 裡的位置，不是在採用它的 repo 裡。同樣兩句話有 36 份副本、錯法一模一樣，而且乾淨的 6.9.0 安裝就會寫出它們。現在它們指向 `.standards/`，並有一支測試走訪生成結果，讓第十個工具沒辦法把它重新帶回來。
- **`uds update` 把中文的 CLAUDE.md 改寫成英文。** `uds init` 依 `display_language` 產生整合檔內容，而每一條重新產生的路徑都是從 `output_language`（commit 訊息語言，預設 `english`）推導的。現在內容語言依 `display_language`，只有在沒有顯示語言設定可依據時才退回 `output_language`。


### 新增

- **`uds check` 現在會報出指示檔裡提到、但實際不存在的路徑。** 先前它只讀 `Reference:`／`參考:` 開頭的行、而且只看 `.standards/` 路徑——對「參考同步」而言那是正確的範圍（那些行是 UDS 自己生成的），對「這條指示有沒有指到東西」而言則是錯的範圍。UDS 標記之外、由舊版安裝留下、之後沒有任何重新產生會回頭看的散文，把 agent 指向不存在的檔案。這支掃描以**檔案存不存在**為準而非以路徑長相為準，所以一個真的有自己 `core/` 目錄的專案不會被冤枉，網址裡的路徑也會被排除。它首跑就找到了本次修正中的兩項缺陷。

## [6.9.0] - 2026-09-14

### 採用者升級注意

- **uds update 不再自動刪除檔案；會列出可移除的 UDS 舊檔，加 --prune 才會刪，且只刪 UDS 自己寫過的檔案。原本依賴自動清檔的流程請加上 --prune。**（#168、#165，詳見「修正」）
- **--content-mode 給了不認得的值，現在會印出警告並照舊使用 index（6.8.0 也是產生 index 的內容）；7.0.0 起會改成直接報錯。** `--content-mode full` 已棄用，會解析為 `index` 並附說明。（詳見「棄用」）
- **以 `uds init -y` 安裝的 Codex、OpenCode 等非 Claude 工具，技能現在會裝進它們自己的目錄**（例如 Codex 是 `.agents/skills/`），不再裝進 `.claude/skills/`。既有安裝跑 `uds update` 會自動遷移。（詳見「修正」）
- **Antigravity 現在會拿到 `.agents/skills/` 與 `.agents/AGENTS.md`**，以前是什麼都沒有、指示檔寫成 `INSTRUCTIONS.md`。Antigravity 只在該目錄是已登記的專案時才會讀 `.agents/`，`uds init` 會印出這個提示。
- **6.8.0 以前 uds init --with-hooks 寫進 .claude/settings.json 的 hook 是從未執行的字串格式，uds update 不會處理 hook，重跑 uds init --with-hooks 也不會刪掉舊項目與 scripts/hooks/*.js。要取得可用的 hook，請重跑 uds init --with-hooks，並可手動刪除舊的 .js 項目。**

### 修正

- **`uds update` 不再靠「查一張雜湊表」來決定檔案是誰的（XSPEC-384，issue [#165](https://github.com/AsiaOstrich/universal-dev-standards/issues/165) 與 [#168](https://github.com/AsiaOstrich/universal-dev-standards/issues/168)）。** 兩位使用者對同一支指令回報了方向相反的缺陷：它刪掉了使用者手寫放在 `.standards/` 下的專案文件，沒有警告、沒有 diff、沒有詢問、沒有備份（#168，是逐行比對 `git status` 才發現的）；同時它把 registry 已經移除的標準留在 manifest 與磁碟上，而 `upstream.version` 照樣前進到「最新」（#165）。兩者都源自同一個布林值在回答兩個彼此獨立的問題——**這個檔是不是 UDS 寫的**、**它現在還是不是現行標準**——而每個 issue 各撞上這個超載軸的一端。所有權現在改成在 UDS 寫入的當下記錄，存進 manifest 新增的 `provenance` 欄位，並以複製動作實際回傳的路徑為鍵，而不是從來源檔名重新推算的路徑（正是那個重新推算，讓 `fileHashes` 裡出現五筆 `.standards/options/<name>.ai.yaml`，而真正的檔案住在 `options/<category>/<name>.ai.yaml`）。provenance 是唯增的，`fileHashes` 是當前狀態；若兩者同進同退，provenance 會在同一刻一起失效，也就毫無作用。刪除現在必須兩件事同時成立，其餘每一種組合一律保留，**並印出保留的理由**。無法判定所有權時歸向保留——那正是舊程式不肯選的那一邊。既有安裝沒有 provenance，因此首次升級無從歸屬、也不會刪任何東西；provenance 只在一次完整寫入全套標準的執行結束時才建立。刪除另外需要新的 `--prune` 旗標，刻意不用 `--yes`：`--yes` 會被設在 CI 裡，讓它一併授權刪除，等於正好在沒有人看得到的地方把破壞性路徑打開。「預設就刪」的分階段策略放在單一具名常數（`PRUNE_POLICY`），因為 XSPEC-384 §4 尚未裁決。每一份刪除報告都印出分母——檢查了幾個、我方擁有幾個、非我方幾個、判不了幾個、排除幾個以及為什麼——因為一份只列出動作對象的報告，與「它只看到這幾個」無從分辨。兩個 issue 都由先證明會紅的測試釘住。
- **九個工具裡有八個，技能被裝進它們不會讀的目錄。** 非互動路徑（`uds init -y`）下，除了 Claude Code 以外每個能裝技能的工具，技能都被寫進 `.claude/skills/`；一個 codex repo 下 `--mode skills -y` 會得到零個技能、零則訊息。現在「能不能裝技能」與「要不要走 marketplace」都改成問路徑表；偵測到、但沒有查證路徑的工具什麼都不裝而且會出聲；`uds update` 轉換舊 manifest 時會重新推導工具，不再假設 `claude-code`。Codex 那句未經查證的 `fallbackSkillsPath: '.claude/skills/'` 已移除。互動流程從來沒有這個問題。
- **Roo Code 永遠裝不起來。** 路徑表裡有它，偵測器裡沒有；它的識別字在一張表叫 `roo`、其他地方都叫 `roo-code`，於是 `uds init` 把指示寫進根目錄的 `roo-code.md`。偵測改用 `.roo/` 與 `.roorules`（刻意不用 `.clinerules`，那是 Cline 自己的標記）；技能也不再退回 `.claude/skills/`，因為 Roo Code 文件列出的位置裡沒有它。依據是 Roo Code 的文件，沒有在真的 Roo Code 上實測。
- **Antigravity：UDS 六個月來什麼都沒幫它裝，而且寫的指示檔是它不會讀的那一份（XSPEC-355 OQ6）。** 技能改裝進 `.agents/skills/`、指示改寫進 `.agents/AGENTS.md`，由工具的二進位檔、隨附說明文件、以及一次帶誘餌路徑的實跑三方確認。它的 tier 從 `minimal` 升為 `partial`。
- **UDS 至今出貨的每一支 hook 都是死的，而採用者拿到四支壞掉的 hook。** hook 項目寫成裸字串（只有物件形式會跑）；`scripts/hooks` 沒有進 npm 套件；hook 是 ESM `.js`，在 `"type": "commonjs"` 下會失敗（改為 `.mjs`）；commit message 驗證掛在 `UserPromptSubmit`，每打一句話就跑一次、每次 exit 1（改掛 `PreToolUse(Bash)`，只看真正的 `git commit -m`）。
- **`uds check` 的還原會拿一份過期模板蓋掉生成的整合檔。** Claude Code 那份是 140 行、最後修改於 2026-03-25 的檔案。還原現在改用安裝器記下的設定重新生成，受管區塊外的內容不動；Antigravity 與 Gemini CLI 第一次有了還原路徑，Codex 的後備來源也不再指向不存在的目錄。
- **Codex／OpenCode 的 `AGENTS.md` 沒有揭露句。** 2026-08-18 的揭露修正只到了兩個產生器中的一個；選 codex 或 opencode 時，`AGENTS.md` 走的是另一個。兩種語言、兩種輸出格式都已修正。
- **cline、windsurf、roo-code 與 Antigravity 的整合檔只寫「照 commit-message 規則」，沒有寫出規則本身。** 格式與合法型別現在直接寫在檔案裡，與 Codex 那份原本的做法相同。

### 新增

- **`turn-completion-integrity`——agent 不得在說了下一步之後、沒做就結束回合。** 由 Stop hook 在回合結束時執法，而不是寫成指令。偵測器附英文與 zh-TW 語言包及做過突變測試的語料；它會讀使用者的最後一則訊息，所以被叫停不會被當成未兌現的承諾；逐項列出「誰卡在誰身上」的清單被認得是合法的結束方式；「做完跟我說，我再驗」被當成條件式。`uds init --with-hooks` 現在會在你的語言沒有語言包時警告，因為在未列出的語言下，hook 裝好了卻不可能觸發。含 zh-TW 與 zh-CN 翻譯。
- **`deferred-item-exit`——六條標準會產出延後項目，而沒有一條說那些項目要去哪（XSPEC-391）。** 一位採用者的一次設計工作產出了一份 ADR 與一份規格，其中帶有五個標為「待決定」／「另案處理」／「不在 v1」的項目，而**五項全都沒有進入任何追蹤系統**。原因不是健忘。對會產出這類項目的六條標準——`adr-standards`、`spec-driven-development`、`retrospective-standards`、`feature-discovery-standards`、`code-review-checklist`、`acceptance-criteria-traceability`——grep `issue|tracker|backlog|task id|work item` 共 13 個命中，而**沒有任何一個是出口**：ADR 的 `Technical Story` 是輸入參照、retrospective 把 tracker 當指標來源、feature-discovery 把工單當需求輸入、AC-traceability 只對外部阻塞的覆蓋要求連結，而 code-review 的 8 個命中全是英文單字 "issues"，意思是「問題」。每條標準都說明如何把自己的文件寫好；文件寫完就是終點。新標準把缺少的那個關係陳述一次——延後項目在文件之外有一個可追溯的出口，而文件帶著那個出口的識別碼——六條產出端標準加上 `brainstorm-assistant` skill 各自取得**一行指向它的指標，而不是一份副本**，因為同一條規則的六份副本會往六個方向腐壞。**載體刻意不指定**：issue、受追蹤的 TODO、manifest 的一列、backlog 檔案裡的一行都符合，判準是「這個項目離開文件了嗎」，永遠不是「用了哪個工具」。三個發現決定了條文。第一，出口必須在產出該文件的那次變更落地*之後*仍然解析得到——兩個觀察到的洩漏滿足其他所有條件，仍然遺失了項目（待辦寫進一個會被本次合併關閉的 issue；待辦寫進出口的留言，被後續留言推出視線）。第二，**連結存在不等於連結有效**：回報者自己的閘門會放行他最強的那個例子——一份寫著「與 issue #19 一併決定」的文件，而 #19 裡根本沒有這件事——所以 DEX-005/006 要求「有連結且內容已驗證」與「有連結、內容未驗證」永遠不得印出同一個綠，因為一個被回報成通過的未知，比一個被回報成未知的未知更糟。第三，錨點是文件的**結構**（ADR 的 `Consequences`、規格的範圍外章節、retrospective 的 `Action Items`），不是它的措辭：結構可以窮舉，措辭清單不行，所以 DEX-008 要求任何措辭清單都要宣告其涵蓋率未知，DEX-009 要求任何窗口大小（「3 行以內」）都要載明來歷，否則標為未校準。依 DEC-049，這條標準完全寫成「必須存在的關係」，絕不寫成「必須維持它的機制」——而且它在自己的本文裡明白寫出 **UDS 不為它提供任何閘門**，因為一條陳述了規則卻沒有東西執行它的標準，不承認這一點時比承認時更糟。`adr-standards` 另外補上一條它從未陳述過的邊界（對它 grep `acceptance criteria|\bAC\b|驗收` 得到**零**命中，對照組 `acceptance-criteria-traceability` 為 84 個命中）：**驗收標準只在一處維護——SPEC**，ADR 以連結指向它——被複製的清單有兩個擁有者，其中一個永遠不會被更新，實測後果是工作出貨後 ADR 裡的勾選框全部仍是未勾選，而只讀規格的覆蓋率工具看不到它。
- **`AUTH_SCOPE_EXTRACTION`——租戶界限是一個 `WHERE` 子句，而遷移流程裡沒有任何東西強迫你去找它（`reverse-engineering-standards` 1.3.0，issue [#166](https://github.com/AsiaOstrich/universal-dev-standards/issues/166)）。** 一次真實的 PHP → C# 遷移中，一個以租戶為界的帳號列表 endpoint 在重寫過程中弄丟了它的隔離述詞：依角色限縮範圍被換成粗糙的「這個帳號是不是任何一個已啟用的管理員？」檢查，於是不論是誰在問，它都回傳資料庫裡的每一個帳號。它出貨了、通過了所有既有測試（那個方法一個測試都沒有），最後是客戶回報「我看到了不該看到的帳號資訊」才浮現。`test-completeness-dimensions` 的維度 4 早就點名跨租戶存取，所以缺的從來不是維度，缺的是一個在遷移當下強迫想起它的步驟。有三個性質讓這一類缺陷穿過每一道閘門：那條安全關鍵的程式碼因為住在查詢裡而非請求／回應契約裡，讀起來就像眾多過濾條件之一；基於形狀的斷言看不見範圍，所以「200 加非空清單」在子句被刪掉之後照樣通過；而程式庫別處存在一支共用 scope resolver 會被讀成覆蓋，同時一個新的 call site 正在不呼叫它地重寫這個查詢。新階段與隱含規則掃描並行，機械化地推導出每一個以操作者自身身分為界的述詞——包含由 ORM global scope、repository 基底類別、RLS 政策、注入過濾條件的 middleware 在 SQL 之外執行的範圍，因為只 grep SQL 會回報一個比實際更小的集合，而在這裡更小的集合讀起來恰好就像更安全的集合。每個命中都記下 `file:line`、自我綁定與觸發分支；oracle 是「每個角色分支、逐 call site 的述詞等價性」，不是輸出形狀。RE-AUTH-001 要求一個斷言另一操作者紀錄**不存在**的負向測試（附自我檢查：在暫存副本裡把述詞刪掉，若測試還是通過，那它從來就不是在測範圍）；RE-AUTH-002 則對任何「移植後等價物未經驗證」的述詞 block cutover。
- **寫下來的日期現在必須代表某件事（`tech-debt-standards` 1.1.0、`governance-layer` 1.1.0）。** 登記表範本從 1.0.0 起就要求 `Owner` 與 `Target Resolution Date`，而兩份標準裡沒有任何一處說那個日期過了會怎樣——對 `core/tech-debt-standards.md` grep `overdue|past due|expired|exceed` 零命中，而對照組 grep `Owner` 有命中，證明那個「查無」是真的、不是查詢工具壞掉。更嚴重的是 `Registry Storage Options` 把「專用試算表」列為完全合法：一份沒有任何程式讀得到的表格滿足本節其餘每一條要求，它沒有任何地方是錯的——直到日期過了，然後什麼都沒發生。`tech-debt-standards` 新增**到期處置**——到期時只有三種合法處置（做掉／撤銷／延期並寫明理由）、TD-EXP-001..006、明文禁止把到期實作成自動延期或自動關閉（兩者都讓時鐘停止，且都不留下停了的痕跡），以及給跑不動檢查的團隊的合規替代方案**無人看管宣告**。每個儲存選項現在都帶著「在什麼條件下它才合法」；試算表刻意保留，因為它常是出錢的人唯一會打開的格式。`governance-layer` 新增風險接受條款的 `review_by`（`review_by` 已過的接受不是有效條款，pipeline 必須 fail closed，與沒有條款時一樣）、**待裁決事項**（GOV-PD-001..004——待裁決是一種帶時鐘、帶固定列舉標記的受治理狀態，不是自由書寫的散文）、**匯總報告**（GOV-RPT-001..005——通過／失敗／**判不了**分開印出、寫出分母與其推導方式、不得合併成單一分數，因為一個「什麼都不做」與「把工作做完」得分相同的指標，量的不是那份工作），以及**新鮮度指標**（GOV-FRESH-001..004——指標必須指名自己讀的是編輯時間還是對帳時間，兩者不得共用欄位；一份今天剛編輯、從未與現實對過的文件，在其中一個時鐘上是零天、在另一個上是無上限）。兩份標準都在標準本文裡明白寫出 UDS 對這些規則不提供任何檢查器：最低標準不是「去建一支檢查器」，而是「絕不讓一筆記載在無聲中變成無人看管」。
- **`uds audit --effects` —— 一道去問「這個回報成功的元件，到底做了什麼沒有」的閘門（XSPEC-383 R8）。** 形狀 D：可達、被呼叫、跑得動、回傳 `{ok: true}`，而它什麼都沒碰。R3 的可達性閘門看不見它——**可達性問的是入邊（誰呼叫它），形狀 D 的病灶在出邊（它最終碰到什麼），方向相反**。根因是**宣稱與證據共用同一個作者**：回傳值既是「我做了什麼」也是唯一的證據，而型別系統驗的那個形狀，對真實作與空殼**完全同構**。本閘門走訪每個宣告的實作的呼叫圖，量它是否觸及跨程序邊界。**邊界集合從 runtime 自讀**——由家族根名規則走訪 `builtinModules` 展開（`fs`、`child_process`、`net`/`dgram`/`tls`、`http`/`https`/`http2`、`dns`、`worker_threads`），不是手打清單，因此 `fs/promises` 與未來任何子路徑都不需要改程式；且**每條規則都印出自己展開了幾個**，展開 0 個就是規則過期了。免 import 的全域 API（`fetch`、`WebSocket`、`process.dlopen`）先探測當前 runtime 才納入，這個 Node 沒有的那些也一併印出來。家族**用 glob 宣告**在 `.uds/effect-boundary.json`，**不用檔名清單**——檔名清單在有人加上第七個 adapter 的那一刻就不再為真，而那正是本閘門存在的理由。判定三態：零命中判 RED（家族中位數 > 0 時帶「兄弟有對照組」的佐證；整個家族全為零時**組內比較集體沉默**，報告會明說這個 RED 只由絕對零判準支撐）；零命中但帶著無法分類的外部相依則是 **UNDECIDABLE 並 exit 2**——判成綠是 fail-open，判成紅是誣告。依 R7-b，**宣告 `NOT_IMPLEMENTED` 且從不回傳成功形狀的實作是合法的，不需要白名單**——這個連言很重要：只認關鍵字的話，那個字就是每個空殼將來要走的洞，而兩者同時出現的檔案會被**指名判 RED**。R7-c 抽出字串拼接產生的網域（模板內插與 `+` 串接一律折成 `*`，所以 `` `https://${env}.api.acme.example` `` 仍可判定，`` `https://api.${tld}` `` 不可判定），對照**來源可插拔**的持有清單：檔案、環境變數，或**指令**——那正是接註冊商或雲帳戶 DNS zone API 的位置。**宣告了卻讀不到 → exit 2**，絕不當成「清單為空所以什麼都合法」。基線是 **TSV，每列一個到期日**（§7.11.2），格式壞掉的列 exit 2，因為**壞掉的基線不是「沒有基線」**。做的過程中它第一次自測就抓到自己的真缺陷：**type-only import 被當成呼叫圖的邊**，於是空殼繼承了介面檔的邊界命中而判綠——型別 import 編譯後整行消失，把它算成命中是**憑空多出來的綠燈**。那個案例現在由一支專屬對照臂釘住。**它證明不了什麼**：碰到的那個邊界是不是**對的**那一個——打一發裝飾性 log 請求就能過關。那是 R9，本輪未做。UDS 自己沒有效果家族，所以不帶 config 直接跑會 exit 2，這是設計而非故障；CI 跑的是 `--self-test`，十七臂（五個探針對照組、分母、綠、紅、R7-b 濫用、R7-b 豁免、跨檔呼叫圖、邊界金絲雀、網域金絲雀、讀不到清單、空集合、不可判定、探針失效）在一份為本 repo 自己寫的合成語料上各自證明得出來。
- **一道採用者跑得動的錯誤出口閘門。** `templates/gates/check-error-exit.mjs` 現在隨套件出貨。`uds check` 會在有 `src/` 卻沒有這道閘門的專案上報告，但從不寫入；`uds update` 會說明它是什麼並提議寫入，預設答案是**不要**，檔案已存在時絕不覆蓋。閘門容許一個檔案格式化錯誤訊息，第二個出現時才判紅；設定好之前一律 exit 2。
- **`brainstorm-assistant`：判官現在需要心智，不只需要座位（XSPEC-388）。** BQS D4 必須同時有獨立 context 與宣告的模型層級才算通過，模型層級只能用 `core/model-selection.md` 的廠商中立標籤表達，指名具體廠商模型即違規。CONVERGE 評審提示改寫為「目標＋約束」。沒有移除任何 v3 機制。
- **`llms.txt` 改為生成，不再手寫。** 由 `uds-manifest.json`、`core/`、`skills/`、`integrations/REGISTRY.json` 與 `cli/package.json` 推導，`--check` 在已提交的檔案差一個位元組時就失敗。

### 變更

- **P1 與 P3 回到探針集，而它們當初被砍的理由，現在成了另一種錯誤的實例（XSPEC-408）。** 兩者都在 2026-07-23 以「基線已通過」為由退役：在沒有安裝 UDS 的情況下對 Antigravity CLI 1.0.14 執行，模型會先讀檔再回答（P1），也會主動給出自己的推薦（P3）。這些觀察仍然成立；站不住的是退役這個結論。**每一支探針量的是兩件事——一個行為與一個宣告的標記——而被推翻的只有行為。** P1 的退役紀錄自己就寫出了這一點（「剩下的是：UDS 要求明確的 `[Source: <path>]` 標註，而基線用的是 markdown 檔案連結」），接著卻引用 §2.2「探針斷言結構，不斷言用詞」把剩下的部分丟掉。那個讀法不可能正確，因為 **P2 正是靠比對四個字面標籤存活**，而且是整組裡最耐用的探針；§4 自己的總結也早已得出「always-read 層耐用的部分看起來是宣告的形式與內部慣例，而不是知識」，而兩支宣告形式的探針就被砍在它下面幾段。§2.2 現在寫出它本來就該承載的區分：比對模型碰巧寫出的句子，量到的是運氣；比對**標準要求模型印出的標記**，量到的是標準有沒有送達。P1 與 P3 改寫成只問這個較窄的問題，而且兩者現在都會在答案*事實正確但沒有標記*時明確失敗——那正是它們存在要抓的情形。它們的 §2.3 入場基線不花任何一次新執行：留存的 2026-07-23 逐字稿重新計分後，`[Source:` 出現 **0 次**、`[Recommended]` 出現 **0 次**，各自都對照同一個讀取器在同一份檔案裡找到的陽性控制字串，所以那個 0 是「不存在」，而不是搜尋壞掉。`scripts/check-reinstated-probe-baselines.ts` 在每次 CI 執行時重新推導這兩個數字——一個讀過一次就打進文件的 0 是一枚戳，而這個 repo 已經記錄過戳會發生什麼事——其 `--self-test` 臂涵蓋標記出現（紅）、控制字串缺失（判不了，絕不是綠）與空逐字稿（判不了），三者皆經突變確認。**這件事沒有做到的**：提高 n。每支探針一次執行、一個工具、一個前沿模型、重讀一遍。`DELTA-TREND.md` 把這次重新計分記在它自己的子表裡，並明文禁止併入上方的總表；Codex 那一列加註其 50% 指的是*已退役*的 P1/P3——Codex 沒有留存任何 P1/P3 逐字稿，所以不像 Antigravity 有東西可以重新計分。當初讓這些探針被退役的那群對象——採用者在 aider 與 continue-dev 下執行的本機與量化模型——至今仍未被量測過，而一支探針的全部價值，就是在那群對象不再需要這條規則時告訴你。復原探針是把感測器裝回去；它沒有說它會讀到什麼。
- **技能：每一個兄弟檔現在都能從自己的 `SKILL.md` 一跳到達。** 原本有 13 個兄弟檔（3,193 行）沒有任何東西指向它們，另有 56 個只能經由另一個兄弟檔到達；`skills/` 與各語系樹的 168 個兄弟檔現在全部是一跳，每一條指路都寫明檔案內容與何時該讀。這消除的是結構風險，並不證明兄弟檔真的會被讀。
- **出貨的 `.ai.yaml` 的 `meta.updated` 改取自來源檔的 git 歷史**；git 查無紀錄時直接省略該欄位，不再用手打的日期或 transform 執行當天。
- **`governance-layer`：Enforcement Reality 一節現在也點名較舊的風險接受欄位**（`review_by`、`risks_accepted`、`gates_bypassed`）沒有任何程式在讀。
- **相依套件：** `chalk` 5.6.2 → 6.0.0、`js-yaml` 5.2.1 → 5.2.3（CLI 執行期）；`eslint`、`globals`、`lint-staged`、`tsx`（開發用）。
- **repo 內部驗證（不影響採用者拿到的內容）：** 實跑 `uds init` 的採用者指示檔檢查；走訪路徑表每個工具的安裝路徑閘門；實際執行已安裝 Stop hook 的 hook 投遞閘門；比對內容的 bundle parity；skill 觸發面閘門；出貨戳一致性檢查器；翻譯 `source_hash` 棘輪；名稱提及分類器；STATUS.md 矛盾閘門；本 repo 的 `.claude/skills` 副本改為生成；skill 金絲雀儀器（XSPEC-408 R2）與它的首批真跑；P7 探針砍除；bump／sync 往返檢查移到每次 CI；測試套件不再受機器語系影響。

### 棄用

- **`contentMode: 'full'`——一個既有模式的第二個名字（XSPEC-357 R7）。** manifest schema 接受它、`--content-mode` 提供它、init 提示把它包裝成「拿 context 預算換合規」的取捨（「完整嵌入所有規則、約 10-15 KB、合規率最高」），而且每一個 `partial` 層級的工具都被自動指派它。這些一項都沒有被實作：產生器對模式的唯一判斷是 `=== 'minimal'`，因此 `full` 與 `index` 走同一條分支，**在實測的 24 組（工具 × 語言）組合中寫出逐位元相同的檔案**，且對照組證明該比較確實抓得到差異（`full` 對 `minimal` 在 24 組中全部不同）。它也不可能照宣稱的方式運作——`.standards/` 約 248k token，遠超過任何整合檔案裝得下的量。採用者是在兩個標籤之間選擇同一種行為，而那個標籤承諾了一個不存在的差異；文件甚至以法規理由建議銀行核心系統採用 `full`。**這次棄用對採用者的代價是零**：`--content-mode full` 仍然接受並解析為 `index`（附說明），manifest 中記錄的 `full` 會在下次讀取時改寫為 `index`，而由於兩個模式本來就產生相同的位元組，**任何專案產生的檔案都不會改變**。不認得的模式仍然解析為 `index`，但現在會印出警告並寫明那個值；7.0.0 起會改成直接報錯。`check-adopter-instruction-files.ts` 裡的 `content-mode=full` 情境——正是它「8 個檔案全部逐位元相同」的發現促成了這次移除——一併移除，而不是留著拿 `index` 跟 `index` 比、然後永遠回報「相同」。
## [6.8.0] - 2026-08-20

### 新增

- **一道去問「這條 `uds <cmd>` 指示真的跑得動嗎」的閘門（XSPEC-383 R4）。** 2026-08-19 查到三個頂層指令（`uds install`、`uds lint`、`uds sync`）與兩個旗標（`uds check --spec-size`、`uds spec create --boost`）出現在出貨的指引裡而**它們都不存在**——落點包括 `quickstart.js`（它的整個工作就是「快速找到對的指令」）與 `integration-generator.js`（它把指令**寫進每一個採用者的 `CLAUDE.md`／`AGENTS.md`**）。兩處早已修掉（`465335e4`），而**沒有任何東西在確認那個修正會維持**。`check-command-existence.mjs` 走訪 `core/`、`locales/`、`ai/standards/`、`cli/src/`、`skills/`、`docs/` 與 repo 根目錄的 `*.md`，抽出每一個 `uds <cmd>` 樣式，用 `uds <path> --definitely-not-a-real-flag` 對本次 commit 自己的 CLI 探測——**不是 `--help`**：commander 對**未知**指令會回答通用指令表而不是報錯，而那正是 `uds lint`／`uds sync` 在第一輪檢查中存活的原因。
- **同一支探針對現況再跑一次，翻出第一次事故的修正從未碰到的漂移。** `uds workflow`（v6.0.0 移除）在 `docs/user/CHEATSHEET.md`、`docs/reference/FEATURE-REFERENCE.md`、`skills/workflows/README.md`（及 zh-TW／zh-CN 鏡像）**被當成現行指令展示了五個月**，而 `docs/MIGRATION-v6.md` 自己就給了能抓到它的那條 grep。`uds config --lang`／`--mode` 從未存在（root `README.md`、兩份 locale、`docs/reference/INTEGRATION-VERIFICATION.md`）。`uds agent install --all` 把位置參數寫成旗標。`uds reverse-tdd` 是為了一段 GitHub Actions 範例**虛構出來的 CLI**。`uds check --interactive` 不存在，因為互動模式本來就是預設。**29 個發現，29 個修好，0 個殘留。**
- **一道去問「有沒有人到得了這段程式碼」的閘門（XSPEC-383 R3）。** 單元測試證明函式是對的，對「有沒有使用者叫得到」一個字都沒說。2026-04-07 有一次 commit 加了 `spec-linter.js`（172 行、14 個測試全過）與 `sync.js`（133 行）——**兩者都從未被註冊**，而同一天有下游產品把自己接上 `npx uds lint --json`，一個因此永遠不會存在的指令。四個半月，兩邊全綠，中間沒有一條通的路。`check-module-reachability.mjs` 從 package.json 的 `bin` 與 `main` 出發做 BFS，**手查找到 2 個，走訪找到 24 個**，含整個九模組的 `src/flow/` 子系統。
- **`uds lint`（XSPEC-383 R5）。** 註冊那個 linter 自 2026-04-07 起就在等的指令，帶著兩項禁得起真實 spec 考驗的檢查：相依有效性與篇幅。

### 變更

- **雜湊前先正規化行尾（#155）。** `uds check` 比對的是磁碟上的原始 bytes，於是 Windows 在 `core.autocrlf=true` 下的 checkout 把每個 LF 換成 CRLF，**每一個雜湊都不再吻合**——而「N 個檔案已修改」這句話，無論是有人改了 N 個檔還是平台改寫了每一個換行，讀起來完全一樣。走訪另外找到兩套從不經過 `hasher.js` 的雜湊實作，四處全修。新增 21 個測試，含負向對照：真實內容差異與尾隨空白差異，在 CRLF checkout 上仍須偵測得到。`uds check --force` 的輸出前後逐位元組相同，既有 manifest 不需要重新蓋章。
- **使用說明產生器改為問 CLI，而不是背誦一份清單。** `scanCliCommands` 把 `cli/bin/uds.js` 讀進一個變數然後忽略它，改用一份註記著「based on uds.js analysis」的手寫陣列。於是**每一次重新產生都把已移除的 `uds workflow` 寫回文件**，也從來不會加入 `uds lint`。現在它解析 `uds --help`——CLI 對自己有哪些指令的權威回答，涵蓋任何單檔解析看不到的註冊寫法（`mcp` 完全由另一個模組註冊）。涵蓋率從 19/24 變成 **23/23**。

### 移除

- **`uds sync` 與 AC 覆蓋檢查（XSPEC-383 R5，選項 E）。** `sync.js` 零消費者。AC 覆蓋檢查對 93 份真實 spec 量測，回報 98 條驗收條件中 0 條被覆蓋——**不是因為它們沒有測試**，而是因為它用**位置**生成 AC 識別字（`AC-1`、`AC-2`）而不是讀規格宣告的那些，再用寫死的 `@` 前綴去找。一個寫 `AC-045-001` 並且標註不帶 `@` 的專案，無論追溯做得多完整都會得到零覆蓋。**它報的不是「這個專案沒有追溯」，而是「我用我自己的慣例去找，找不到」，而這兩句話印出來一模一樣。** 它是移除而不是留著不接：它是一個正確實作了一個唯一已知消費者並不使用的慣例的東西，躺在樹上等著被人重新接上。跨 repo 的 AC 識別字慣例調解是協商，不是補丁，另案處理。

## [6.7.5] - 2026-08-18

### 變更

- **八個 skill 重新可以被模型選中。** `audit-assistant`、`changelog-guide`、`commit-standards`、`docs-generator`、`project-discovery`、`release-standards`、`reverse-engineer` 與 `spec-derivation` 都帶著 `disable-model-invocation: true`，那是 `d415937e` 在改寫描述時一併加上的，**沒有依循任何說得出口的規則**。2026-08-17 刻意沒有動它們，而那個理由在當時是對的：當時定下的規則是「reference 是可以被模型叫用的」，而這些**一個都沒有 `status` 欄位**，解除它們等於用一個沒有規則的動作，換掉一個沒有規則的狀態。此後量測：**八個全都有完整的 `Use when:` 觸發條件與 `Not for:` 排除條件、八個描述的都是動作而非參考資料、八個都已經有對應的斜線指令**——這正是 `code-review-assistant` 的形狀，而它的 `/code-review` 已被裁定不構成保留該旗標的理由。`journey-test-assistant` 是現成的先例：同樣的「Generate X」形狀、`status: stable`、從未被禁用。每一份現在都記上 `status: stable` 並在檔內寫明理由。用 `stable` 而非新值，因為 `skills/` 只用 reference、stable、experimental 三個值，**發明第四個等於換了件衣服的同一個無規則動作**。
- **模型實際選得到的 skill 數,現在是 55/55。** 先前是 45。

### 修正

- **英文來源移除旗標後，locale 版仍然照樣出貨帶著它。** `spec-derivation` 是唯一在 locale 包裡自帶 `disable-model-invocation` 的 skill，而 frontmatter 合併**只複製英文來源「有」的欄位**——所以一個英文已經不再宣告的欄位，會在 locale 檔裡原封不動地留下並照樣出貨。zh-TW 與 zh-CN 均已更正。以解析 **60 個 skill × 3 個 locale ＝ 165 份安裝結果**驗證：零個仍被禁用。

## [6.7.4] - 2026-08-18

### 修正

- **6.7.3 讓 `uds check` 每個 repo 報出 52 個不存在的「遺失」檔案。** 6.7.3 的兩個改動要**同時在場**才會互相作用：R1 給了 skill 內容雜湊，使它們第一次走進 `unchanged` 分支；而 R6b 會把那個分支的項目收進 `manifest.fileHashes`。那張表是用 `isFile()` 驗證的，而 skill 是目錄，於是每一個都被報成遺失。**沒有任何東西被刪除——錯的是紀錄不是磁碟**（已驗證：59 個 skill 目錄與其內容完好）。`verifiedPristine` 現在限縮於檔案類別；而且**修好寫入端不會讓已經寫進去的東西消失**，所以 `uds update` 也會清掉 `fileHashes` 裡的 `.claude/skills/` 與 `.claude/commands/` 鍵——**一個壞掉的鍵不會有第二次機會被造訪**，因為磁碟上沒有任何東西對應它。
- **commands 也改為內容比對（XSPEC-382 R7）。** R1 只涵蓋 skills，把 commands 留在 `hash: null`，於是無條件重裝的分支對它們仍然活著。與 skills 同一個形狀：`resolveCommandContent(name, agent, locale)` 說明一次安裝會包含什麼（locale 選擇＋英文回退，加上逐 agent 的轉換），安裝器寫它、計畫器雜湊它。
- **裝了 locale 版的人，拿到的 SKILL.md 指向從來不會被安裝的檔案。** locale 包不是英文來源的完整複本——實測 **zh-TW 59 個中有 4 個、zh-CN 59 個中有 5 個**缺少英文有出貨的檔——而安裝器把 locale 目錄整包換上去，於是那些伴隨檔根本沒被寫入。其中兩個缺口**是被引用的**：zh-TW 的 `dev-workflow-guide/SKILL.md` 引用 `workflow-phases.md` 三次、`testing-guide/SKILL.md` 引用 `test-skeleton-templates.md` 三次。**回退改為逐檔而非逐 skill**——locale 有就用 locale 的，沒有就用英文的。
- **UDS 不出貨的檔案，不再讓一個 skill 永遠停在「已變更」。** 安裝一個 skill 現在會移除其目錄下**解析結果沒有指名**的頂層檔案（實地發現：`deploy-assistant/guide.md`，它不在任何 UDS skills 樹裡，而且從來就不在）。範圍由同一個 provenance 判準界定，也就是讓採用者自己的 skill 目錄不進入此處任何路徑的那一個——**已驗證手寫的 skill 目錄與其額外檔案在 `--force` 之後完好無損**——子目錄一律不動，因為安裝器從來沒有寫過它們。

## [6.7.3] - 2026-08-18

### 修正

- **skill 改為內容比對，升級不再重印 55 列毫無意義的變更。** diff 兩端都硬寫 `hash: null`，於是每個 skill 都是無條件重裝。**兩端各算來源目錄的雜湊行不通**——安裝不是逐位元複製：locale 版的 `SKILL.md` 會被併入英文 frontmatter（`brainstorm-assistant`：23,753 bytes 的 zh-TW 來源變成 23,866 bytes 的安裝結果）、來源是執行期依 locale 逐 skill 選擇並可回退英文、子目錄被略過。照那樣做，55 個全都會顯示為內容**變更**，每次升級皆然——**與真的變更無從分辨，比那個已知的無訊號更糟**。改為只有一個函式：`resolveSkillFiles(name, locale)` 說明一次安裝會包含什麼，**安裝器寫它、計畫器雜湊它**，兩者因此不可能漂移。與真實已安裝的專案對帳：110 個檔逐位元相符、0 個不符，18 個採用者自寫的 skill 正確地解不出來。actual 端**只對 UDS 管理的目錄計算雜湊**；採用者自己的 skill 永遠不被比較、也永遠不會變成刪除候選。真實升級中的 `Update (57)` 現在是 `Update: 0, Unchanged: 127`。
- **`uds check --restore` 對 72 個受追蹤標準中的 64 個無法還原。** 它拿 `entry.endsWith(fileName)` 去比對 `manifest.standards`，而那些條目**自 3.4.0 起是 ID（`commit-message`）而非路徑**——這個比較永遠不可能為真。會動的那 8 個是仍存路徑格式的 `options/`，**這正是失敗從來看起來不像全面失敗的原因**；其餘一律回報「Could not determine source」。同一段 ID→來源的解析在這個檔案裡已經存在兩次，而這一處從來沒拿到過，所以修法是在 `registry.js` 收斂出一支解析器，**與它必須一致的那支檔名解析器配對**。
- **一個逐位元正確的標準，沒辦法停止被報成「已修改」。** actual state 是從磁碟算雜湊的，所以與上游相符的檔案被歸為 `unchanged`、不產生動作、也永遠不會被重新雜湊——而 reconciliation 在計畫為空時早退出、連 manifest 都不寫。**沒有回頭路。** diff 現在回報它**證明過**與上游相同的那些檔案，並在早退出之前補正記錄。**刻意做得很窄**：只有在證明磁碟與 desired 相符之後才記錄，所以手改永遠不會被吸收。把記錄同步成磁碟上的任何內容，會讓 `uds check` 從此再也報不出任何被改過的標準。
- **備份不含 skills，而且沒有任何東西說出這件事。** skill 是目錄，而備份對它們呼叫 `copyFileSync`，那在每個平台都會拋（本機兩個檔案系統實測皆 ENOTSUP——**不是暫存目錄的產物**）。失敗被藏了兩層：執行器只在**一個都沒成功**時中止，於是單一一次成功掩蓋了任意數量的失敗；備份 manifest 沒有 errors 欄位，使得「129 個計畫路徑備了 74 個」在磁碟上與完整備份無從分辨。修正前於真實 repo 量測：備份 manifest 記錄 74 個路徑、而計畫有 129 個動作，其中 **55 個 skill 目錄一個都不在裡面**——**一個不涵蓋它即將覆寫的最大一塊的回復點**。現在目錄遞迴複製、manifest 記錄 `failedToBackUp` 與 `coverage: {planned, backedUp, failed}`，且**任一**備份失敗即中止整次執行：拒絕覆寫一個沒能先複製起來的檔案，正是備份的用途。

### 變更

- **無條件重裝的摺疊保留，措辭放寬。** commands 仍然沒有內容比對，所以那個分支是活的。它沒有跟著 skill 那一半一起移除，因為**一個靜默停止套用的摺疊，與一個本來就沒東西可摺的計畫，長得一模一樣**。

## [6.7.2] - 2026-08-18

### 修正

- **`uds update --skills` 更新了全部內容，卻永不前進版本標記。** 五個採用 repo 中有四個停在 6.6.0，而同一份 manifest 的 `skills.version` 已經是 6.7.0；唯一前進的，正是那個沒裝 skills 的。兩次執行都 exit 0、都印「57 succeeded」、都沒印任何失敗。先前對此的判讀——「有東西回報了失敗而它沒有浮上來」——**是錯的**。探針量到 `results=57 failing=0`、registry 版本解為 `"6.7.1"`、準備寫入的值也正確：**reconciler 每一步都做對了，是較晚的一次寫入撤銷了它。** `update.js` 在指令開頭讀一次 manifest，那是在 reconciler 執行之前；`updateSkillsOnly()` 隨後把那份過期的記憶體物件寫回去覆蓋掉它。`updateCommandsOnly()` 有一模一樣的缺陷，**它是走訪找出來的，不是撞到的**。兩處現在各自重讀 manifest，並且**只套用自己擁有的欄位**——把整份物件複製回去，會讓任何後續步驟新增的欄位重蹈同一個缺陷。這件事之所以要緊，是因為該機制自己的註解寫著：它存在的目的，就是讓每週陳舊度偵察（讀的正是這個欄位）不再誤報。
- **一份列出 57 項變更、其中 55 項是無條件的計畫。** skill 沒有內容比對（XSPEC-382 R1），於是每次升級都重印同樣的 55 列、理由完全相同，把審閱者真正需要核可的那 2 列埋在底下。現在它們摺疊成一行，**而那一行寫出自己摺了幾個**，總數不變——一個不聲明自己設限的上限，讀起來就像「就這些了」。摘要那行同樣改為 `Update: 57 (2 changed, 55 unconditional reinstall)`；單獨的 `Update: 57` 是真的，而且什麼都沒回答，**而決定要不要核可一次升級時讀的正是摘要**。

### 變更

- **無條件重裝的理由字串收斂為單一匯出常數**，不再是產生端一份、渲染端一份。兩份副本之間的漂移在這裡是無聲的：摺疊會單純地停止摺疊，而計畫看起來與它一直以來的樣子一模一樣。

### 測試

- **為版本標記補上行為層測試，與既有的形狀測試並存。** 隨修正加入的迴歸測試斷言的是原始碼文字——那兩個函式含有 `readManifest(projectPath)`——若有人重構成「呼叫它然後丟掉結果」，它仍然全綠。而這裡宣稱的是行為，所以 `tests/e2e/update-version-advances.test.js` 會真的跑一次安裝、種下探針版本、執行 `update --apply --yes --skills`，再斷言標記真的動了。已雙向驗過：修正在場為綠，還原缺陷為紅。
- 兩份新測試都斷言**正反兩臂**。摺疊測試會檢查一般計畫完全不受影響，因為只驗「那 55 列不見了」的測試，對一個把所有 update 列都丟掉的渲染器也照樣會過。

## [6.7.1] - 2026-08-18

### 修正

- **各語系的速查表內嵌的是英文 skill 描述——每一個語系、每一次都是。** `scripts/generate-usage-docs.mjs` 在語系迴圈**之外**掃描 skill 一次，且固定讀 `skills/`（英文來源），於是三份速查表與功能參考共用同一組描述。修正前實測：**`locales/zh-TW/docs/CHEATSHEET.md` 的 82 則描述與英文版逐位元組相同**——而且是 6.7.0 之前那個被剝過的 `[UDS] <標籤>` 形式，所以繁體中文讀者看到的是**用錯語言的過期描述**，而他實際安裝的 `SKILL.md` 帶著完整的中文觸發面。`scanSkills()` 現在接受語系並在**迴圈內**呼叫，優先取語系版、缺漏時逐個 skill 回退英文。**修在產生器而不是那 82 列**：手改的速查表下一次編輯必然再度與 `SKILL.md` 分岔。
- **`code-review-assistant` 與 `checkin-assistant` 的 `disable-model-invocation: true` 已移除。** 那個旗標**不遵循任何可陳述的規則**：六個帶 `status: reference` 的 skill 中，**有四個（`tdd`、`bdd`、`atdd`、`pr-automation`）從未被禁用**，而它們經歷的是同一次 XSPEC-095 生命週期遷移——同一個類別、相反的處置——另外八個被禁用的**連 `status` 都沒有**。系統自己早已記下後果：`pr-automation-assistant` 把*「審查的實質內容——請用 `/code-review`」*導向那裡，**而那條轉介在任何模型自主的路徑上都到不了**。六個 reference 現在處置一致，規則因此說得出口：**reference 一律可被模型叫用**。兩個檔案內都就地記錄了理由。**其餘八個刻意不動**——它們沒有 `status`，拿掉等於用另一個沒有規則的動作覆蓋一個沒有規則的狀態；它們已在 XSPEC-378 R5 具名，不再是「不知道為什麼關著」。

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
