#!/bin/bash
# 以兩位評審逐份評分；每次 240 秒上限，輸出不是恰好 8 行 YES/NO 就重試一次。
X="$1"; P="$2"
for judge in "gemini:Gemini 3.1 Pro (High)" "claude:Claude Sonnet 4.6 (Thinking)"; do
  tag="${judge%%:*}"; model="${judge#*:}"; mkdir -p "$X/blind/verdicts-$tag"
  for a in "$X"/blind/answers/R*.txt; do
    r=$(basename "$a"); out="$X/blind/verdicts-$tag/$r"
    for attempt in 1 2; do
      q="$(cat "$P")
$(cat "$a")"
      perl -e 'alarm 240; exec @ARGV' agy --log-file "$out.log" --model "$model" --print-timeout 200s --print "$q" > "$out.raw" 2>&1 </dev/null
      grep -E '^[1-8]: (YES|NO)$' "$out.raw" > "$out"
      [ "$(wc -l < "$out" | tr -d ' ')" = "8" ] && break
    done
    echo "$tag $r 行數=$(wc -l < "$out" | tr -d ' ') 嘗試=$attempt"
  done
done
