# Ground truth — checkout.js，一個類別一個缺陷

| # | 類別 | 位置 | 缺陷 |
|---|------|------|------|
| 1 | **Security** | 第 6 行 | 生產資料庫密碼硬編在原始碼 |
| 2 | **Performance** | for 迴圈 | N+1 查詢：每個品項兩次往返；應批次查詢 |
| 3 | **Error Handling** | `fetch(...)` | 付款請求未 await、無 catch → unhandled rejection，且失敗時訂單已建立 |
| 4 | **Functionality** | 迴圈 + INSERT | 無交易包覆：庫存已扣但 INSERT 失敗會留下不一致狀態；且未檢查 `stock` 是否足夠 |
| 5 | **Design** | 整個函式 | HTTP handler 直接持有 DB 連線與付款呼叫，無分層；`conn` 為模組級單例 |
| 6 | **Quality** | `0.92` / `500` | magic number，無具名常數或說明 |
| 7 | **Readability** | `fmt(d, t, x)` | 函式名與參數名皆無意義 |
| 8 | **Tests** | 專案層級 | 無測試檔、package.json 無 test script，而這是金流關鍵路徑 |

## 主要指標：類別覆蓋數（0–8）
一個回報只要指出該類別的問題即算涵蓋（不要求用 UDS 的類別名）。

## 為何這份素材才測得出差異
UDS 宣稱的能力是「8 大類別的系統性覆蓋」。前一份素材 3/8 缺陷集中在 Security，
且完全沒有 Design / Tests / Performance —— 那是在考模型本來就會的部分。
本素材每類各一，其中 Design、Tests、Performance 是模型預設最不會主動檢查的。
