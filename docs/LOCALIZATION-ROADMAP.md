# UDS 多語言擴展支援計劃

> **狀態**：中遠期計劃（暫不執行）
> **建立日期**：2026-01-14
> **資料來源**：GitHub Octoverse 2025、Stack Overflow Developer Survey 2025

---

## 目標

將 Universal Development Standards 從目前的 3 種語言（EN/zh-TW/zh-CN）擴展至 10 種語言的完整翻譯支援。

## 目標語言（按開發者數量排序）

| 優先級 | 語言 | 目錄 | 主要市場 | 開發者規模 |
|:---:|------|------|---------|-----------|
| P0 | English | `core/` (源) | 全球 | 31.8% 貢獻 |
| P0 | 简体中文 | `zh-CN/` | 中國 | 第3大開發者群體 |
| P0 | 繁體中文 | `zh-TW/` | 台灣/香港 | ✅ 已完成 |
| P1 | 日本語 | `ja/` | 日本 | 第二梯隊，3倍增長 |
| P1 | 한국어 | `ko/` | 韓國 | 第二梯隊貢獻國 |
| P1 | Português | `pt-BR/` | 巴西 | 第4大，5年4倍增長 |
| P2 | Español | `es/` | 西班牙/拉美 | 第二梯隊貢獻國 |
| P2 | Deutsch | `de/` | 德國 | 第二梯隊，3倍增長 |
| P2 | Français | `fr/` | 法國 | Stack Overflow 前5 |
| P3 | Bahasa Indonesia | `id/` | 印尼 | 5年4倍增長 |

## 翻譯範圍（完整翻譯）

每個語言需翻譯約 **119+ 個文件**：

```
locales/{lang}/
├── README.md                 # 入口頁面
├── CHANGELOG.md              # 變更日誌
├── CLAUDE.md                 # 專案規範
├── core/                     # 核心規範 (16 files)
│   ├── anti-hallucination.md
│   ├── changelog-standards.md
│   ├── checkin-standards.md
│   └── ... (13 more)
├── docs/                     # 文件
│   ├── AI-AGENT-ROADMAP.md
│   ├── OPERATION-WORKFLOW.md
│   └── ...
├── options/                  # 選項指南
│   ├── git-workflow/
│   ├── commit-message/
│   ├── testing/
│   └── project-structure/
├── adoption/                 # 採用指南
└── skills/claude-code/       # Skills (15 skills)
```

## 實施階段

### Phase 1: 基礎建設（準備工作）
- [ ] 建立翻譯指南文件 `docs/TRANSLATION-GUIDE.md`
- [ ] 建立術語表 `docs/GLOSSARY.md`（統一專業術語翻譯）
- [ ] 更新 `locales/README.md` 加入新語言狀態
- [ ] 擴展 `check-translation-sync.sh` 支援新語言

### Phase 2: P1 語言（高優先）
目標語言：日文、韓文、葡萄牙文

每個語言的步驟：
1. 建立目錄結構 `locales/{lang}/`
2. 翻譯核心文件（README, CLAUDE.md, core/ 16 files）
3. 翻譯 docs/ 目錄
4. 翻譯 options/ 目錄
5. 翻譯 adoption/ 目錄
6. 翻譯 skills/ 目錄
7. 執行翻譯同步檢查

### Phase 3: P2 語言（中優先）
目標語言：西班牙文、德文、法文

（同 Phase 2 步驟）

### Phase 4: P3 語言（擴展）
目標語言：印尼文

（同 Phase 2 步驟）

## 技術實施

### 1. 目錄結構模板
```bash
# 為新語言建立目錄結構
mkdir -p locales/{lang}/{core,docs,options,adoption,skills}
```

### 2. 翻譯文件模板（YAML front matter）
```yaml
---
source: ../../core/example.md
source_version: 3.5.0-beta.14
translation_version: 3.5.0-beta.14
last_synced: 2026-01-14
status: current
translator: AI-assisted / Human
---
```

### 3. 翻譯同步腳本更新
需更新 `scripts/check-translation-sync.sh` 支援新語言目錄。

### 4. CI/CD 整合
考慮在 GitHub Actions 中加入翻譯同步檢查。

## 翻譯策略：AI 輔助翻譯

### 工作流程
1. **初步翻譯**：使用 Claude 進行批量翻譯
2. **術語一致性**：參照 GLOSSARY.md 確保專業術語統一
3. **格式保留**：保持 Markdown 格式和 YAML front matter
4. **人工審核**：翻譯完成後進行人工品質檢查

### 翻譯指令模板
```
請將以下 Markdown 文件翻譯成 {語言}：
- 保留所有 Markdown 格式
- 保留 YAML front matter（僅翻譯內容）
- 保留程式碼區塊中的程式碼不翻譯
- 技術術語參照術語表
- 使用 {語言} 開發者社群慣用的表達方式
```

### 品質保證
- 使用 Pull Request 進行翻譯審核
- 定期執行翻譯同步檢查
- 收集社群回饋持續改進

## 工作量估算

| 語言 | 文件數 | 預估工作量 |
|------|-------|----------|
| 日文 (ja) | 119 | 大 |
| 韓文 (ko) | 119 | 大 |
| 葡萄牙文 (pt-BR) | 119 | 大 |
| 西班牙文 (es) | 119 | 大 |
| 德文 (de) | 119 | 大 |
| 法文 (fr) | 119 | 大 |
| 印尼文 (id) | 119 | 大 |

**總計**：7 種新語言 × 119 文件 = **833 個翻譯文件**

## 驗證步驟

1. 每個語言完成後執行 `./scripts/check-translation-sync.sh {lang}`
2. 驗證 README.md 語言切換連結正確
3. 測試 CLI `uds init` 對新語言的支援
4. 更新 locales/README.md 的語言狀態表

## 待確認事項

1. 翻譯優先順序是否正確？
2. 是否需要社群貢獻者協助翻譯？
3. 是否要建立翻譯記憶庫（Translation Memory）以提高一致性？
4. 是否要整合翻譯平台（如 Crowdin, Weblate）？

---

## 參考資料

- [GitHub Octoverse 2025](https://github.blog/news-insights/octoverse/)
- [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/)
- [Localize - Top 10 Languages](https://localizejs.com/articles/top-10-languages-for-website-localization)
