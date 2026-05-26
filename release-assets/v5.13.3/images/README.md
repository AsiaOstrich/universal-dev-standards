# v5.13.3 Social Images

Per-platform sub-folder structure (each platform uses different image strategy).

```
images/
├── ig/                          ← Instagram (6-image carousel, 1080×1080)
│   ├── 01-cover.png             — UDS v5.13.3 上 npm 了 + 火箭 + npm install
│   ├── 02-self-review.png       — 2/6 self-review-protocol（新標準）— 6 類 cross-ref 檢查
│   ├── 03-defensive-deploy.png  — 3/6 部署防禦性配對 — 打包 → 驗證 → 解壓驗證 → 才刪除
│   ├── 04-dual-trigger.png      — 4/6 日誌雙觸發輪替 — size AND time
│   ├── 05-release-flow.png      — 5/6 release flow 三層基建
│   └── 06-bonus-dogfood.png     — 6/6 額外升級 + Dogfooding 成果 + QR + hashtags
├── fb/                          ← Facebook (single all-in-one infographic)
│   └── cover.png                — 橫式 all-in-one：4 features + bonus + Dogfooding in one card
└── threads/                     ← Threads (1 image per post, supports the 3-post thread)
    ├── post-1.png               — hook：3 類 silent 失敗 + 1 commit-time 漂移 + Standards as Code
    ├── post-2.png               — features 細節（POST 2 標籤）：4 大標準 + 7 dep + 2 CI
    └── post-3.png               — trust signal（POST 3 標籤）：dogfood + 失敗 tag + trophy + CTA
```

---

## Per-platform strategy

| Platform | Format | Why this strategy |
|---|---|---|
| **IG** | 6-image carousel (1080×1080 each) | IG algorithm rewards swipe depth + saves; each card focuses on one feature for easy comprehension |
| **FB** | Single landscape all-in-one (~1200×630) | FB feed favors single high-info-density images; readers scroll fast, one comprehensive visual works better than carousel |
| **Threads** | 3 portrait images, one per thread post (~1080×1350) | Threads is text+image; per-post image reinforces each post's specific role (hook / features / trust signal). Images even include `POST 2` / `POST 3` labels for thread continuity cues |

## Style notes

- **IG cards**: modern infographic, 中英混排, 1080×1080 square, 藍綠紫漸層 + 多色 feature icons
- **FB image**: dark theme, 橫式 dashboard layout, 整合 4 features + bonus + Dogfooding 標籤
- **Threads images**: portrait orientation, dark theme, narrative-driven (hook visual → features grid → trophy/celebration), with `POST 2` / `POST 3` labels for thread continuity
- All 3 styles **departed from the originally prompted synthwave** — ChatGPT auto-adapted to maximize readability for technical/Chinese content. Style change accepted.

## Regeneration

If files need to be regenerated:
1. Open ChatGPT (or Copilot / Leonardo.ai)
2. Use `../prompts.md` for IG carousel prompts
3. For FB all-in-one and Threads post-1/2/3, **no prompts were captured** (were generated in separate ChatGPT sessions before / after the IG carousel)

> **Action item for future releases**: capture FB and Threads prompts this time and store in `../prompts.md` under new sections.
