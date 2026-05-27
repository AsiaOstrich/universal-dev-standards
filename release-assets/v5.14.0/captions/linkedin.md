# LinkedIn Caption — v5.14.0

> **Format**: Single post
> **Posted**: (fill in after posting)

---

```
🔍 工具說「標準 missing」——但標準就在那裡。

在驗自家專案時，uds check 持續回報：

  ⚠ CLAUDE.md:
    67/69 項標準已參考
    缺少：error-code-standards, logging-standards

但打開 .standards/ 資料夾，這兩個 .ai.yaml 檔案完好如初。


**Root cause**

manifest 在讀取時會把路徑轉換成 registry ID：
  ai/standards/error-codes.ai.yaml → error-code-standards

check 接著拿這個 ID 去做字串比對，
但 CLAUDE.md 是用實際檔名（error-codes.ai.yaml）生成的，
兩者不一致 → 永遠 false positive。

69 個標準裡只有這 2 個 ID 和檔名不吻合。
其他標準的 ID 恰好是檔名的子字串，所以都過了——問題被掩蓋了很久。


**The fix**

從 registry 建立 id → 實際 AI 檔名的查找表。
check 時，如果 ID 比對失敗，就用真實檔名再試一次。
補了一個 regression test，確保類似的命名例外不會再靜默 break。

v5.14.0：69/69 ✅，不再假警報。


**Takeaway**

一個工具如果對自己的輸出說謊，「全綠」就失去了意義。
維護開發工具，必須對自己的使用者誠實——包括自己。

這個 bug 是用 uds check 驗自家專案時發現的。


→ npm install universal-dev-standards@latest
github.com/AsiaOstrich/universal-dev-standards

#OpenSource #DeveloperTools #BugFix #SoftwareEngineering
```
