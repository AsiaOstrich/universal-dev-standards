# X (Twitter) Caption — v5.14.0

> **Format**: 3-tweet thread
> **Posted**: (fill in after posting)
> **Char note**: CJK = 2, URL = 23, limit = 280 per tweet

---

## Tweet 1 — Hook

```
uds check 誤報 2 個標準 missing。
但 .standards/ 裡，檔案就在那裡。

root cause: registry ID ≠ .ai.yaml 檔名
fix: id → filename lookup map

v5.14.0 修好了。69/69 ✅

👇
```

---

## Tweet 2 — Root cause

```
manifest 讀取時路徑被轉成 registry ID：

  error-codes.ai.yaml
    → error-code-standards

check 拿 ID 做字串比對，
CLAUDE.md 寫的是檔名，不是 ID。

69 個標準裡只有這 2 個命名不一致，
其他碰巧都是 ID ⊆ 檔名，就蒙混過了。

修法：建 id→filename map，比兩次。
```

---

## Tweet 3 — CTA

```
加了 regression test。
下次遇到命名例外不會再靜默 break。

這個 bug 是用 uds check 驗自家專案時發現的——
工具必須對自己誠實。

npm i -g universal-dev-standards
github.com/AsiaOstrich/universal-dev-standards
```
