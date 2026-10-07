---
source: ../../../docs/AVAILABLE-STANDARDS.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-10-07
source_hash: a189829f9324
status: current
---

# 可用標準：UDS 有出貨、你的專案沒有裝的標準

> **語言**: [English](../../../docs/AVAILABLE-STANDARDS.md) | 繁體中文 | [简体中文](../../zh-CN/docs/AVAILABLE-STANDARDS.md)

用舊版 UDS 設定的專案，只保有當時裝的標準。之後 UDS 新增的標準**不會**被 `uds update --apply` 裝上，
因為更新只維護專案清單（`.standards/manifest.json`）列出的東西。這個功能出現之前，沒有任何指令會告訴你
它們存在。現在有三個指令會告訴你，另一個讓你挑著裝。

## 唯一的規則

一個標準同時符合下列三點，就是**可用但未安裝**：

1. 它的類別是 `uds init` 會安裝的類別（`reference` 或 `skill`，見下表），
2. 在你專案的 `format`（預設 `ai`）下有來源檔（只有技能、沒有檔案的項目不算），
3. `manifest.standards` 裡沒有同名檔案。

這條規則只寫在一個函式裡（`getAvailableStandards`，`cli/src/utils/available-standards.js`）。`uds update` 舊的
互動路徑、`uds update --plan`／`--apply`、`uds check`、`uds audit --friction` 都問它，所以不會各說各話。

## 類別

| 類別 | 列為「可用」？ | 原因 |
|---|---|---|
| `reference` | 是 | `uds init` 會把它裝進 `.standards/`。 |
| `skill` | 是 | `uds init` 會把它裝進 `.standards/`。 |
| `core` | **否，但會計數、可用 id 安裝** | 2026 年 3 月才加進登記表，晚於安裝程式「只裝 reference 或 skill」的過濾（2025 年 12 月）。`uds init` 從來沒裝過它，所以對專案而言它從來不是「新的」。這是歷史意外，不是設計決定。 |
| `testing`、`security`、`deployment`、`operations` | **否，但會計數、可用 id 安裝** | 與 `core` 相同：後來才加，init 從沒裝過。 |
| `extension` | 否，**`--add-standard` 也不安裝** | 由 init 的語言／框架／語系選項（`--lang`、`--framework`、`--locale`）安裝。 |
| `integration` | 否，`--add-standard` 也不安裝 | 每個 AI 工具各一個整合檔，由 init 的 AI 工具選項安裝。 |
| `template` | 否，`--add-standard` 也不安裝 | 要複製使用的文件範本，不是標準檔。 |

其他類別不會被悄悄丟掉：`uds update --plan` 結尾會有一行說明有幾個、在哪些類別；可安裝的類別都能用 id 指名安裝
（見下）。它們是否該像 `reference`／`skill` 一樣被**列出**，是還沒決定的事（XSPEC-458 OQ1）。

## 與這件事無關的 manifest 欄位

| 欄位 | 狀態 | 作用 |
|---|---|---|
| `level` | 死欄位 | 6.11.0 寫的 manifest 只在 `integrationConfigs[<檔案>].level` 裡留有殘值。沒有任何程式碼用它決定安裝什麼。登記表的「等級系統」是已棄用的空殼。 |
| `profile` | 不存在 | CLI 與任何 manifest 都沒有這個欄位。 |
| `contentMode` | 有作用，但與此無關 | 決定 `CLAUDE.md` 怎麼產生（`minimal` 或 `index`）。它從不決定裝哪些標準。 |

## 指令

```sh
uds update --plan            # 先印計畫，再印「上游有、專案沒裝（N 個）」，依類別分組
uds update --apply           # 套用計畫；結尾印出有幾個可用、怎麼裝
uds update --apply --add-standard open-work-tracking     # 裝一個，並記入 manifest
uds update --apply --add-standard a --add-standard b     # 裝多個
uds update --plan --add-standard open-work-tracking      # 先預覽
uds check                    # 一行：「上游有 N 個標準未安裝」
uds audit --friction         # 一項低嚴重度發現（不進 --report、不影響 --score）
```

- 除了 `--add-standard`，上面全是**純資訊**：計畫的動作、`uds check` 的判定與結束碼、`uds audit --score`
  都與以前完全相同。`uds audit --score` 不讀這項發現。
- `--add-standard` 要搭配 `--plan` 或 `--apply`。它會記入 `manifest.standards`，所以之後的 `uds update --apply`
  會保留它（manifest 沒列出的檔會被當成多餘的）。再跑一次 `--plan` 沒有變動；`uds update --rollback` 會把它
  拿掉（manifest 一起還原）。
- 未知的 id 以非 0 結束並列出最相近的 id；已安裝的 id 會說明已安裝並以 0 結束；`extension`、`integration`、
  `template` 的 id 會被拒絕並說明原因。
