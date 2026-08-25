#!/usr/bin/env bash
# XSPEC-392 R6 棘輪：新的翻譯必須帶 source_hash，既有的欠債冷凍為基線。
#
# 為什麼是棘輪而不是「補齊」
# ──────────────────────────
# `source_hash` 是 UDS 已經發明出來的正確答案——它雜湊**來源檔的內容**，
# 來源一改就對不上，**與有沒有人記得更新日期無關**。
# `check-translation-sync.sh` 自己的圖例把它叫做 `the anti-lie check`。
#
# 而它只到達 804 份裡的 210 份。剩下 594 份的漂移在結構上偵測不到。
#
# 🔴 **不要批次補雜湊。** 現在對 594 份寫入今天的來源雜湊，
# 等於宣稱「它們此刻與來源同步」——**而那件事沒有人驗證過**。
# 那正是 XSPEC-392 §2.1 在罵的 `new Date()` fallback，換一個欄位重演。
# `refresh-translation-hash.ts` 自己的檔頭也是這樣寫的：
# 「蓋一枚雜湊是一項宣稱；錯誤的宣稱會把真的漂移重新藏起來。」
#
# 所以：**既有的凍結，新的必須合規。** 基線只證明「不再變糟」，
# 不證明存量沒事——那兩件事刻意分開報。
#
# 三態
#   0 = 沒有基線外的無雜湊翻譯
#   1 = 有新的無雜湊翻譯，或基線已到期
#   2 = 判不了（走訪 0 份、基線讀不到、自測臂失敗）。**這不是綠燈。**
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCALES="${ROOT}/locales"
BASELINE="${ROOT}/scripts/translation-hash-ratchet-baseline.txt"
BASELINE_EXPIRY="2026-11-25"

fail() { echo "[hash-ratchet] $*" >&2; exit 2; }
[ -d "${LOCALES}" ] || fail "locales/ 不存在：${LOCALES}"

# ── 自測臂：先證明抽取器在工作（主路徑必跑）──────────────────────
# 一支壞掉的抽取器對每個檔都回「沒有 source_hash」，那會製造大量假紅；
# 反過來若它對每個檔都回「有」，整個閘門就變成永遠綠。兩個方向都要證。
st_dir="$(mktemp -d)"; trap 'rm -rf "${st_dir}"' EXIT
printf -- '---\nsource: ../x.md\nsource_hash: abc123def456\n---\n' > "${st_dir}/has.md"
printf -- '---\nsource: ../x.md\nlast_synced: 2026-01-01\n---\n' > "${st_dir}/none.md"
has_hash() { grep -qE '^source_hash:[[:space:]]*[0-9a-fA-F]' "$1"; }
st_ok=1
if ! has_hash "${st_dir}/has.md"; then
  echo "[hash-ratchet] ✗ 自測（正向）：帶 source_hash 的檔被判成沒有" >&2; st_ok=0
fi
if has_hash "${st_dir}/none.md"; then
  echo "[hash-ratchet] ✗ 自測（負向）：不帶 source_hash 的檔被判成有 —— 閘門會永遠綠" >&2; st_ok=0
fi
[ "${st_ok}" -eq 1 ] || fail "自測臂失敗 —— 在修好之前，這支閘門的任何結果都不可信"
echo "[hash-ratchet] 探針自證：✓ 正向　✓ 負向"

[ -f "${BASELINE}" ] || fail "基線不存在：${BASELINE} —— 沒有基線就分不出「既有欠債」與「新增違規」"

TODAY="$(date +%Y-%m-%d)"
if [ "${BASELINE_EXPIRY}" \< "${TODAY}" ]; then
  echo "[hash-ratchet] 🔴 基線已於 ${BASELINE_EXPIRY} 到期 —— 重新判斷，不得自動延期" >&2
  exit 1
fi

# ── 走訪並排除，不列舉 ────────────────────────────────────────────
# 「有哪些翻譯」由 find 走訪產生。手打清單會在新增語系時靜默漏掉整個目錄。
walked=0; nohash=0; newv=0; baselined=0
new_lines=""
tmp_missing="$(mktemp)"; trap 'rm -rf "${st_dir}" "${tmp_missing}"' EXIT
while IFS= read -r f; do
  walked=$((walked + 1))
  grep -qE '^source:[[:space:]]*\S' "${f}" || continue   # 沒宣告來源的不是受管翻譯
  if has_hash "${f}"; then continue; fi
  nohash=$((nohash + 1))
  rel="${f#"${ROOT}/"}"
  printf '%s\n' "${rel}" >> "${tmp_missing}"
  if grep -qxF "${rel}" "${BASELINE}"; then
    baselined=$((baselined + 1))
  else
    newv=$((newv + 1))
    new_lines="${new_lines}  ✗ ${rel}
"
  fi
done < <(find "${LOCALES}" -type f -name '*.md')

if [ "${walked}" -eq 0 ]; then
  fail "走訪到 0 份翻譯 —— 走訪器失效，非「沒有翻譯」"
fi

# 基線裡有、但已經補上雜湊的 → 可以從基線刪掉（讓基線只會縮不會漲）
resolved=0
while IFS= read -r b; do
  case "${b}" in ''|'#'*) continue ;; esac
  grep -qxF "${b}" "${tmp_missing}" || resolved=$((resolved + 1))
done < "${BASELINE}"

echo "[hash-ratchet] ${TODAY}　走訪 ${walked} 份 locales/*.md"
echo "               無 source_hash：${nohash}（基線內 ${baselined}／🔴 基線外 ${newv}）"
echo "               基線內已補上雜湊、可從基線移除：${resolved}"
echo "               🔴 **「在基線內」不等於「沒問題」**——它等於「這筆欠債在 ${BASELINE_EXPIRY} 前不擋你」。"
echo "               ⚠️ 補雜湊要走 refresh-translation-hash.ts，而且**只在確認翻譯真的跟上來源之後**。"
echo "                  批次蓋雜湊會把真的漂移重新藏起來——那正是本規格在罵的那件事。"

if [ "${newv}" -gt 0 ]; then
  echo
  echo "[hash-ratchet] 🔴 ${newv} 份翻譯不在基線內且沒有 source_hash：" >&2
  printf '%s' "${new_lines}" >&2
  echo "               新增或改寫翻譯時必須一併蓋雜湊，否則它的漂移偵測不到。" >&2
  exit 1
fi
echo "[hash-ratchet] ✓ 沒有基線外的無雜湊翻譯。"
