# Ground truth — src/orders.js（不放在測試專案內）

## 8 個真缺陷
| ID | 位置 | 缺陷 | 類別 | 預期嚴重度 |
|----|------|------|------|-----------|
| D1 | `API_SECRET` | 硬編的 live 密鑰 | security | 最高 |
| D2 | `findOrder` | SQL 字串拼接 → injection | security | 最高 |
| D3 | `login` | 密碼寫進 console.log | security | 最高 |
| D4 | `login` | `==` 鬆散比較做密碼驗證 | correctness | 中高 |
| D5 | `totalPages` | `- 1` off-by-one | correctness | 中 |
| D6 | `firstItemName` | `items[0]` 無 null/空陣列防護 | correctness | 中 |
| D7 | `applyDiscount` | `0.87` magic number | maintainability | 低 |
| D8 | 檔尾 | `legacyFindOrder` 註解掉的程式碼 | maintainability | 低 |

## 2 個誘餌（回報即為誤報）
| ID | 位置 | 為何不是缺陷 |
|----|------|-------------|
| B1 | `RETRY_LIMIT = 3` | 具名常數且下一行有註解說明來源。指為 magic number 即誤報 |
| B2 | `safeFindOrder` / `parseCount` | 已參數化查詢；錯誤已捕捉並帶 cause 重拋。指為問題即誤報 |

## 判定規則
- **Recall** = 找到的 D 數 / 8
- **誤報** = 回報 B1 或 B2 的次數
- **分級正確性** = D1/D2/D3 是否被標為最高級（僅適用於有 UDS 的組）
- 額外項目（非 D 非 B）記為 extra，不計入誤報但需記錄
