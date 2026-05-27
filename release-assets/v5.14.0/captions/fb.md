# Facebook Caption — v5.14.0

> **Format**: Single post with Cover image
> **Link**: FB supports inline clickable URLs — no "bio link" workaround needed
> **Posted**: (fill in after posting)

---

```
🔧 universal-dev-standards v5.14.0 上 npm 了，這版修了一個 uds check 的 false-positive，並改善 release 提醒流程。

✅ Bug Fix — uds check 誤報 missing 標準
uds check 會把 error-code-standards 和 logging-standards 永遠報成 ⚠ missing，即使 error-codes.ai.yaml 和 logging.ai.yaml 都已正確安裝在 .standards/ 裡。

根因是一個命名不一致：manifest 路徑在讀取時被轉換成 registry ID（如 ai/standards/error-codes.ai.yaml → error-code-standards），但 CLAUDE.md 是用實際檔名寫入的。check 直接拿 ID 做字串比對，這兩個 ID 和檔名剛好不一樣，所以永遠 false positive。

修法：從 registry 建立 id → 實際 AI 檔名的查找表，在 ID 比對失敗時用真實檔名再確認一次。同時加了 regression test，確保類似命名例外以後不會再靜默 break。

✅ release-reminder 顯示 TODO 清單（新功能）
週一 09:00 UTC 的 release reminder issue 現在自動附帶 RELEASE-FLOW-TODOS.md 裡的 open 改善項目。流程缺口在每個 release 週期持續累積追蹤，不再遺失在 commit history 裡。

🧪 這個 bug 是用 uds check 驗自家專案時發現的。工具必須對自己誠實，「全綠」才有意義。修好前：67/69。修好後：69/69 ✅

試用：
npm install universal-dev-standards@latest
npx universal-dev-standards init

GitHub: github.com/AsiaOstrich/universal-dev-standards

#開源 #DevOps #DocumentationStandards #繁體中文開發
```
