# Image Generation Prompts — v5.14.0

> Style: **synthwave / cyberpunk retro tech**（對齊 v5.13.3 視覺系列）
> Generator: ChatGPT free tier (DALL-E 3 / GPT-Image-1) — 建議一次 session 生完所有圖
> Alternative: Microsoft Copilot (free, DALL-E 3), Leonardo.ai (free daily)
> **⚠ 若 ChatGPT 自動改成 infographic 風格（上次發生過），在 prompt 末尾加 style anchor 強制鎖定**

---

## Style anchor（每張圖 prompt 結尾都加）

```
(IMPORTANT: render exact synthwave/cyberpunk aesthetic —
neon pink #FF006E and cyan #00F5FF, retro 80s grid horizon,
deep purple background #1A0033, VHS scan lines, lens flare.
NO modern infographic card style. NO illustrative diagrams.
NO text, no letters, no words anywhere in the image.)
```

---

## 共用色票

```
Color palette:
  Neon pink       #FF006E
  Neon cyan       #00F5FF
  Electric violet #B026FF
  Deep purple bg  #1A0033
  Sunset orange   #FF9E00 (accent)

Visual lexicon:
  retro 80s grid horizon · neon light beams · floating geometric monoliths ·
  soft chromatic aberration · subtle VHS scan lines · lens flare ·
  high contrast · vaporwave atmosphere
```

---

## 1. Cover (`images/ig/01-cover.png` / `images/threads/post-1.png`)

> 用途：IG carousel slide 1、Threads post 1 背景圖
> 尺寸：1080×1080（IG） → 裁成 1080×1350 用於 Threads

```
Create a 1:1 square synthwave poster. Retro 80s grid horizon receding into the distance at the bottom third. Neon pink and cyan light beams cutting through a deep purple sky. Two floating geometric monoliths in the foreground — one slightly cracked with a glowing cyan crack line, symbolizing a repaired bug. Soft chromatic aberration, subtle VHS scan lines, lens flare from a central glowing sun on the horizon. Distant stars scattered in the dark purple sky. Vaporwave editorial aesthetic. No text, no letters, no words anywhere in the image.
(IMPORTANT: render exact synthwave/cyberpunk aesthetic — neon pink #FF006E and cyan #00F5FF, retro 80s grid horizon, deep purple background #1A0033, VHS scan lines, lens flare. NO modern infographic card style. NO illustrative diagrams. NO text, no letters, no words anywhere in the image.)
```

---

## 2. Card 1 — Bug fix / False positive (`images/ig/02-false-positive.png` / `images/threads/post-2.png`)

> 概念：掃描器射出警報光束，但被掃描的結構完好無損 → 假警報被戳破

```
Create a 1:1 square synthwave illustration. A glowing neon cyan scanner beam sweeps across a floating translucent data structure in the center. Above the structure, a large neon pink warning triangle hovers — but it is surrounded by an electric cyan X-circle overriding it, indicating a false alarm. The data structure beneath is intact and glowing. Retro 80s grid floor below. Deep purple sky with scattered stars. Hot pink accents on the edges of the data structure. Soft chromatic aberration and subtle VHS scan lines. Vaporwave poster style.
(IMPORTANT: render exact synthwave/cyberpunk aesthetic — neon pink #FF006E and cyan #00F5FF, retro 80s grid horizon, deep purple background #1A0033, VHS scan lines, lens flare. NO modern infographic card style. NO illustrative diagrams. NO text, no letters, no words anywhere in the image.)
```

---

## 3. Card 2 — Release-reminder TODO surfacing (`images/ig/03-release-todo.png` / `images/threads/post-3.png`)

> 概念：週期性信標/鐘發出提醒脈衝，附帶一張光暈 checklist 從中展開

```
Create a 1:1 square synthwave illustration. A large glowing neon cyan signal beacon tower stands on a retro 80s grid horizon, emitting concentric pulse rings outward in neon pink. From the pulse rings, translucent floating checklist panels emerge to the sides, glowing softly with electric violet borders and cyan check marks. The sky above is deep purple with lens flare at the beacon's apex. Soft chromatic aberration and subtle VHS scan lines throughout. Vaporwave editorial poster style.
(IMPORTANT: render exact synthwave/cyberpunk aesthetic — neon pink #FF006E and cyan #00F5FF, retro 80s grid horizon, deep purple background #1A0033, VHS scan lines, lens flare. NO modern infographic card style. NO illustrative diagrams. NO text, no letters, no words anywhere in the image.)
```

---

## 4. FB Cover (`images/fb/cover.png`)

> 尺寸：1200×630 橫式
> 可請 ChatGPT 直接生成 landscape 版，或將 01-cover.png 在 Canva 裁切

```
Create a landscape 16:9 synthwave poster, wider than tall. Retro 80s grid horizon stretching across the full width at the lower third. Neon pink and cyan light beams fan out from a central glowing point on the horizon. Two floating geometric monoliths flank the center — the left one has a visible glowing cyan repair crack, symbolizing a fixed bug. Electric violet aurora-like glow in the upper sky. Soft chromatic aberration, subtle VHS scan lines, lens flare from the center horizon. Deep purple background. Vaporwave editorial aesthetic, cinematic wide format.
(IMPORTANT: render exact synthwave/cyberpunk aesthetic — neon pink #FF006E and cyan #00F5FF, retro 80s grid horizon, deep purple background #1A0033, VHS scan lines, lens flare. NO modern infographic card style. NO text, no letters, no words anywhere in the image.)
```

---

## Text overlay（Canva 後製）

| Element | Font | Size | Color |
|---|---|---|---|
| Headline | Monoton | 80–100pt | `#00F5FF` cyan + `#FF006E` pink text-shadow 3px offset |
| Subheadline | Orbitron | 28–36pt | `#FFFFFF` + 30% opacity black backing plate |

| 圖 | Headline | Subheadline |
|---|---|---|
| 01 Cover | `UDS v5.14.0` | `LIVE ON NPM · BUG FIX + RELEASE FLOW` |
| 02 Bug fix | `FALSE POSITIVE` | `ID ≠ FILENAME · FIXED IN CHECK.JS` |
| 03 Release TODO | `RELEASE TODOS` | `WEEKLY REMINDER · NOTHING GETS LOST` |
| FB Cover | `UDS v5.14.0` | `FALSE POSITIVE FIXED · 69/69 ✓` |
