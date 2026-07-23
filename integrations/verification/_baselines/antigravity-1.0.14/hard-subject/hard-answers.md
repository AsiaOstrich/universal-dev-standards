# Ground truth — refund.js（難度提升版）

每一項都是**可觀察的事實**，不是架構評價（第一版的第 5 項因為是評價，裁判一致率只有 1/8）。

| # | 類別 | 缺陷 | 為何強模型可能漏 |
|---|------|------|-----------------|
| 1 | Functionality | `isRefundable` 比對 `status === 'paid'`（小寫），而 `markPaid` 寫入 `'PAID'`（大寫）→ 任何訂單都永不可退款 | 需跨兩個函式比對字面值；單看任一個都正常 |
| 2 | Quality | `refundAmount` 用 `TAX_RATE`(0.08)，`invoiceTotal` 硬編 `1.05` → 同一筆訂單的退款與發票稅率不一致 | 需比對兩個函式的算式；各自看都合理 |
| 3 | Security | `verifyWebhook` 用 `===` 比對 HMAC → timing attack；應為 `crypto.timingSafeEqual` | 程式碼「看起來正確」，用了正確的 HMAC API |
| 4 | Performance | `dedupe` 在迴圈內用 `seen.includes()` → O(n²)；應用 `Set` | 小資料下無症狀，需推理複雜度 |
| 5 | ErrorHandling | `issueRefund` 的 catch 只 `console.error` 不重拋，且**接著仍 `return { ok: true }`** → 寫入失敗但上游收到成功 | catch 存在，看起來「有處理」 |
| 6 | Tests | 測試檔存在且會通過，但只斷言型別（`typeof === 'boolean'`、`Array.isArray`）→ 抓不到上述任何一項 | 有測試檔、有 test script、CI 會綠 |
| 7 | Readability | `issueRefund(db, order, notify, force)` 為布林參數；呼叫端 `issueRefund(order.db, order, !skipAudit, isPartial)` 在呼叫處完全無法判讀語義 | 需從呼叫端反推 |
| 8 | Design | `force` 參數被宣告但函式內從未使用；且 `applyRefundPolicy` 把 `isPartial` 傳進 `force` 這個位置，語義錯配 | 死參數不影響執行，無症狀 |

## 判定
每項 YES/NO，由兩個獨立裁判盲讀最終回答。
**目標：無輔助基線落在 4/8 附近**（先前素材為 6.2–6.4/8，天花板效應使正面效應無法解析）。
