# Image Generation Prompts — v5.13.3

> **Originally prompted style**: synthwave / cyberpunk retro tech
> **Actual rendered style**: modern infographic cards (中英混排, 藍綠紫漸層, 6 images instead of planned 5)
> Generator: ChatGPT free tier (DALL-E 3 / GPT-Image-1), 2026-05-26
> Outcome: ChatGPT auto-adapted style to maximize readability for technical content + Chinese text. Accepted the change — final images more useful for the technical audience than synthwave would have been.

> If you want the synthwave look next time, **add explicit style anchors at the END of every prompt**:
> `(IMPORTANT: render exact synthwave/cyberpunk aesthetic with neon pink #FF006E and cyan #00F5FF, retro 80s grid horizon, NO modern infographic card style, NO illustrative diagrams)`

> If you want this clean infographic style next time, copy the actual prompts ChatGPT effectively used (see commit history / screenshots if available).

> Quota note: free tier rendered all 6 images in one session (more than the documented 5/day limit — likely benefited from GPT-Image-1 newer quota).
> Alternative: Microsoft Copilot (free, DALL-E 3), Leonardo.ai (free daily).

---

## Style anchor (共用色票)

```
Color palette:
  Neon pink     #FF006E
  Neon cyan     #00F5FF
  Electric violet #B026FF
  Deep purple bg #1A0033
  Sunset orange #FF9E00 (accent)

Visual lexicon:
  retro 80s grid horizon · neon light beams · floating geometric monoliths ·
  soft chromatic aberration · subtle VHS scan lines · lens flare ·
  high contrast · vaporwave atmosphere
```

---

## 1. Cover (`images/cover.png`)

```
Create a 1:1 square synthwave poster. Retro 80s grid horizon receding into the distance at the bottom third. Neon pink and cyan light beams cutting through a deep purple sky. Three floating geometric monoliths in the foreground representing software standards. Soft chromatic aberration, subtle VHS scan lines, lens flare from a central glowing sun on the horizon. Distant stars scattered in the dark purple sky. Vaporwave editorial aesthetic. No text, no letters, no words anywhere in the image.
```

## 2. Card 1 — self-review-protocol (`images/card-1-self-review.png`)

```
Create a 1:1 square synthwave illustration. A glowing electric cyan scanner beam sweeps vertically across stacked translucent data layers floating in mid-air. Retro CRT scan effect overlays the scene. Deep purple background with hot pink accents on the edges of the layers. Lens flare emanates from the scanner beam origin. Subtle VHS scan lines. Vaporwave poster style. No text, no letters, no words anywhere.
```

## 3. Card 2 — Deployment defensive pairing (`images/card-2-defensive-deploy.png`)

```
Create a 1:1 square synthwave illustration. Two neon-outlined archive boxes float in foreground, connected by a glowing chain of cyan checkmarks. A large translucent shield silhouette wraps protectively in front of them, set against a retro grid horizon receding into distance. Deep purple background with hot pink and electric cyan glow. Soft chromatic aberration. Vaporwave poster aesthetic. No text, no letters, no words anywhere.
```

## 4. Card 3 — Dual-trigger log rotation (`images/card-3-dual-trigger.png`)

```
Create a 1:1 square synthwave illustration. Two large interlocking neon gears centered on a retro grid floor that recedes into the distance. The left gear has a glowing electric cyan clock face symbol; the right gear has a glowing hot pink size scale symbol. Both gears connected by a glowing ampersand glyph between them. Deep purple sky with lens flare. Vaporwave poster style. No text, no letters, no words anywhere.
```

## 5. Card 4 — Release flow 3-layer (`images/card-4-release-flow.png`)

```
Create a 1:1 square synthwave illustration. Three concentric neon pipeline rings ascending from a retro grid horizon into a vanishing point in the sky. Each ring glows brighter than the one below, ascending from cyan at the bottom, through violet in the middle, to hot pink at the top. Geometric arrows connecting the rings. Deep purple background with soft chromatic aberration and lens flare at the top. Vaporwave editorial poster style. No text, no letters, no words anywhere.
```

---

## Text overlay (post-process in Canva)

| Element | Font | Size | Color |
|---|---|---|---|
| Headline | Monoton | 80-100pt | `#00F5FF` cyan + `#FF006E` pink text-shadow 3px offset |
| Subheadline | Orbitron | 28-36pt | `#FFFFFF` + 30% opacity black plate |

| Card | Headline | Subheadline |
|---|---|---|
| Cover | `UDS v5.13.3` | `LIVE ON NPM · 4 NEW STANDARDS` |
| 1 self-review | `SELF-REVIEW` | `CROSS-REF CHECKS BEFORE COMMIT` |
| 2 defensive deploy | `DEFENSIVE DEPLOY` | `VERIFY BEFORE DELETE` |
| 3 dual-trigger | `DUAL-TRIGGER ROTATION` | `SIZE AND TIME · NOT OR` |
| 4 release flow | `RELEASE FLOW INFRA` | `ADVISORY · GATE · REMINDER` |
