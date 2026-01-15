/**
 * i18n messages for CLI prompts
 *
 * Supported languages:
 * - en: English (default)
 * - zh-tw: Traditional Chinese
 */

export const messages = {
  en: {
    // Common labels
    recommended: 'Recommended',
    advanced: 'Advanced',

    // Content Mode
    contentMode: {
      title: 'Content Mode:',
      description: 'Control how much standards content is embedded in AI tool config files',
      description2: 'This affects AI Agent execution behavior and compliance',
      question: 'Select content mode:',
      choices: {
        index: 'Summary + task mapping, AI knows when to read which standard',
        full: 'Embed all rules, AI can use immediately but larger file',
        minimal: 'File references only, best with Skills'
      },
      explanations: {
        index: [
          '  → Includes rule summaries + MUST/SHOULD task mapping',
          '  → AI can determine "which standard to read for which task"',
          '  → Balance between context usage and compliance'
        ],
        full: [
          '  → All rules embedded in config file (~10-15 KB)',
          '  → AI needs no extra file reads, highest compliance',
          '  → Best for short tasks or strict compliance projects'
        ],
        minimal: [
          '  → Only contains .standards/ file list',
          '  → AI needs to actively read standard files',
          '  → Best with Skills (provides real-time guidance)'
        ]
      }
    },

    // Adoption Level
    level: {
      title: 'Adoption Level:',
      description: 'Choose how many standards to adopt, higher levels are more comprehensive',
      question: 'Select adoption level:',
      choices: {
        1: '6 core standards: commit, anti-hallucination, checkin, etc.',
        2: 'Adds testing, Git workflow, error handling - 12 total',
        3: 'Includes versioning, logging, SDD - all 16 standards'
      },
      details: {
        1: [
          '  Includes: commit-message, anti-hallucination, checkin-standards,',
          '            code-review-checklist, changelog, versioning'
        ],
        2: [
          '  Includes all of Level 1, plus:',
          '            testing, git-workflow, error-code, logging, documentation, naming'
        ],
        3: [
          '  Includes all of Level 1+2, plus:',
          '            spec-driven-development, test-completeness, api-design, security'
        ]
      }
    },

    // Standards Format
    format: {
      title: 'Standards Format:',
      description: 'Choose file format for standards, affects AI reading efficiency and human readability',
      question: 'Select standards format:',
      choices: {
        ai: 'YAML format, fewer tokens, faster AI parsing',
        human: 'Full Markdown with examples, best for team learning',
        both: 'Install both, AI uses YAML, humans use Markdown'
      },
      explanations: {
        ai: '  → Smaller files (~50% tokens), higher AI processing efficiency',
        human: '  → Includes complete examples and explanations, good for new team members',
        both: '  → Double the files, but balances AI efficiency and human readability'
      }
    },

    // Standards Scope
    scope: {
      title: 'Standards Installation:',
      description: 'Choose how many standard files to install in project',
      description2: '(Skills installed, lean installation available)',
      question: 'Select installation scope:',
      choices: {
        minimal: 'Reference docs only, Skills provide real-time task guidance',
        full: 'Install all standard files, independent of Skills'
      },
      explanations: {
        minimal: [
          '  → .standards/ contains only reference files (~6 files)',
          '  → Skills provide real-time guidance when you perform tasks'
        ],
        full: [
          '  → .standards/ contains all standards (~16 files)',
          '  → Can view complete standards even if Skills unavailable'
        ]
      }
    },

    // Git Workflow
    gitWorkflow: {
      title: 'Git Workflow:',
      description: 'Choose branching strategy, affects team collaboration and release process',
      question: 'Select Git branching strategy:',
      choices: {
        'github-flow': 'Simple PR workflow, good for continuous deployment',
        gitflow: 'develop/release branches, good for scheduled releases',
        'trunk-based': 'Direct commits to main + feature flags, for mature CI/CD'
      },
      details: {
        'github-flow': [
          '  → main + feature branches, merge via PR',
          '  → Best for: small teams, continuous deployment, web apps'
        ],
        gitflow: [
          '  → main + develop + feature/release/hotfix branches',
          '  → Best for: large projects, scheduled releases, multi-version maintenance'
        ],
        'trunk-based': [
          '  → Develop mainly on main, use feature flags for control',
          '  → Best for: mature CI/CD, high-frequency deployment, senior teams'
        ]
      }
    },

    // Merge Strategy
    mergeStrategy: {
      title: 'Merge Strategy:',
      description: 'Choose merge strategy, affects how Git history is displayed',
      question: 'Select merge strategy:',
      choices: {
        squash: 'One commit per PR, clean history',
        'merge-commit': 'Preserve full branch history, create merge commit',
        'rebase-ff': 'Linear history, requires rebase, advanced'
      },
      details: {
        squash: [
          '  + Clean history, easy to rollback',
          '  - Loses individual commit details from branch'
        ],
        'merge-commit': [
          '  + Preserves complete development history, traceable',
          '  - More complex history with merge branches'
        ],
        'rebase-ff': [
          '  + Completely linear history, cleanest',
          '  - Team needs to be familiar with rebase operations'
        ]
      }
    },

    // Test Levels
    testLevels: {
      title: 'Test Coverage:',
      description: 'Select test levels to include (test pyramid)',
      description2: 'Percentages are recommended coverage ratios',
      question: 'Select test levels:',
      choices: {
        unit: 'Test individual functions, fast feedback',
        integration: 'Test component interactions, API calls',
        system: 'Test complete system behavior',
        e2e: 'Test user workflows (through UI)'
      },
      pyramid: [
        '  Test Pyramid:',
        '        /\\         <- E2E (few, slow)',
        '       /  \\        <- System',
        '      /----\\       <- Integration',
        '     /------\\      <- Unit (many, fast)'
      ]
    },

    // Content Mode Change (configure)
    contentModeChange: {
      currentMode: 'Current mode:',
      warning: 'Changing Content Mode will regenerate all AI tool config files',
      explanations: {
        index: '  → AI will determine when to read standards based on task mapping',
        full: '  → All rules embedded directly, highest AI compliance',
        minimal: '  → AI must actively read standards, recommend using with Skills'
      }
    }
  },

  'zh-tw': {
    // Common labels
    recommended: '推薦',
    advanced: '進階',

    // Content Mode
    contentMode: {
      title: 'Content Mode:',
      description: '控制 AI 工具設定檔中嵌入多少規範內容',
      description2: '這會影響 AI Agent 的執行行為和合規程度',
      question: '選擇內容模式 / Select content mode:',
      choices: {
        index: '摘要 + 任務對照表，AI 知道何時讀哪個規範',
        full: '完整嵌入所有規則，AI 立即可用但檔案較大',
        minimal: '僅檔案參考，適合搭配 Skills 使用'
      },
      explanations: {
        index: [
          '  → 包含規則摘要 + MUST/SHOULD 任務對照表',
          '  → AI 能判斷「做什麼任務時要讀哪個規範」',
          '  → 平衡 Context 使用量和合規程度'
        ],
        full: [
          '  → 所有規則直接嵌入設定檔（檔案約 10-15 KB）',
          '  → AI 無需額外讀檔，合規率最高',
          '  → 適合短期任務或需要嚴格遵循的專案'
        ],
        minimal: [
          '  → 僅包含 .standards/ 檔案清單',
          '  → AI 需要主動讀取規範檔案',
          '  → 適合搭配 Skills（Skills 會提供即時指引）'
        ]
      }
    },

    // Adoption Level
    level: {
      title: 'Adoption Level:',
      description: '選擇要採用的標準數量，等級越高涵蓋越完整',
      question: '選擇採用等級 / Select adoption level:',
      choices: {
        1: '提交規範、反幻覺、簽入檢查等 6 項核心',
        2: '加入測試、Git 流程、錯誤處理共 12 項',
        3: '含版本控制、日誌、SDD 全部 16 項'
      },
      details: {
        1: [
          '  包含：commit-message, anti-hallucination, checkin-standards,',
          '        code-review-checklist, changelog, versioning'
        ],
        2: [
          '  包含 Level 1 全部，加上：',
          '        testing, git-workflow, error-code, logging, documentation, naming'
        ],
        3: [
          '  包含 Level 1+2 全部，加上：',
          '        spec-driven-development, test-completeness, api-design, security'
        ]
      }
    },

    // Standards Format
    format: {
      title: 'Standards Format:',
      description: '選擇標準檔案的格式，影響 AI 讀取效率和人類可讀性',
      question: '選擇標準格式 / Select standards format:',
      choices: {
        ai: 'YAML 格式，token 少，AI 解析快',
        human: '完整 Markdown，含範例說明，適合團隊學習',
        both: '兩種都裝，AI 用 YAML，人用 Markdown'
      },
      explanations: {
        ai: '  → 檔案較小（約 50% token），AI 處理效率高',
        human: '  → 包含完整範例和說明，適合新成員學習規範',
        both: '  → 檔案數量加倍，但兼顧 AI 效率和人類可讀性'
      }
    },

    // Standards Scope
    scope: {
      title: 'Standards Installation:',
      description: '選擇要安裝多少標準檔案到專案中',
      description2: '（已安裝 Skills，可選擇精簡安裝）',
      question: '選擇安裝範圍 / Select installation scope:',
      choices: {
        minimal: '只裝參考文件，Skills 即時提供任務導向指引',
        full: '安裝全部標準檔案，不依賴 Skills'
      },
      explanations: {
        minimal: [
          '  → .standards/ 只包含參考文件（約 6 個檔案）',
          '  → Skills 會在你執行任務時提供即時指引'
        ],
        full: [
          '  → .standards/ 包含全部標準（約 16 個檔案）',
          '  → 即使 Skills 不可用也能查閱完整規範'
        ]
      }
    },

    // Git Workflow
    gitWorkflow: {
      title: 'Git Workflow:',
      description: '選擇分支策略，影響團隊協作和發布流程',
      question: '選擇 Git 分支策略 / Select Git branching strategy:',
      choices: {
        'github-flow': '簡單 PR 流程，適合持續部署',
        gitflow: 'develop/release 分支，適合定期發布',
        'trunk-based': '直接提交 main + feature flags，適合成熟 CI/CD'
      },
      details: {
        'github-flow': [
          '  → main + feature branches，透過 PR 合併',
          '  → 適合：小團隊、持續部署、Web 應用'
        ],
        gitflow: [
          '  → main + develop + feature/release/hotfix branches',
          '  → 適合：大型專案、排程發布、需要多版本維護'
        ],
        'trunk-based': [
          '  → 主要在 main 開發，用 feature flags 控制功能',
          '  → 適合：成熟 CI/CD、高頻部署、資深團隊'
        ]
      }
    },

    // Merge Strategy
    mergeStrategy: {
      title: 'Merge Strategy:',
      description: '選擇合併策略，影響 Git 歷史紀錄的呈現方式',
      question: '選擇合併策略 / Select merge strategy:',
      choices: {
        squash: '每個 PR 一個 commit，歷史乾淨',
        'merge-commit': '保留完整分支歷史，建立合併 commit',
        'rebase-ff': '線性歷史，需要 rebase，進階'
      },
      details: {
        squash: [
          '  ✓ 歷史乾淨，容易回滾',
          '  ✗ 遺失分支中的個別 commit 細節'
        ],
        'merge-commit': [
          '  ✓ 保留完整開發歷史，可追溯',
          '  ✗ 歷史較複雜，有合併分岔'
        ],
        'rebase-ff': [
          '  ✓ 完全線性歷史，最乾淨',
          '  ✗ 需要團隊熟悉 rebase 操作'
        ]
      }
    },

    // Test Levels
    testLevels: {
      title: 'Test Coverage:',
      description: '選擇要包含的測試層級（測試金字塔）',
      description2: '百分比為建議的覆蓋率比例',
      question: '選擇測試層級 / Select test levels:',
      choices: {
        unit: '測試個別函式，快速回饋',
        integration: '測試元件互動、API 呼叫',
        system: '測試完整系統行為',
        e2e: '測試使用者流程（透過 UI）'
      },
      pyramid: [
        '  測試金字塔 (Test Pyramid):',
        '        /\\         ← E2E (少量，慢)',
        '       /  \\        ← System',
        '      /────\\       ← Integration',
        '     /──────\\      ← Unit (大量，快)'
      ]
    },

    // Content Mode Change (configure)
    contentModeChange: {
      currentMode: '目前模式:',
      warning: '變更 Content Mode 將重新生成所有 AI 工具設定檔',
      explanations: {
        index: '  → AI 會根據任務對照表判斷何時讀取規範',
        full: '  → 所有規則直接嵌入，AI 合規率最高',
        minimal: '  → AI 需主動讀取規範，建議搭配 Skills'
      }
    }
  }
};

// Current language setting (can be changed at runtime)
let currentLang = 'en';

/**
 * Set the current UI language
 * @param {string} lang - Language code ('en' or 'zh-tw')
 */
export function setLanguage(lang) {
  if (messages[lang]) {
    currentLang = lang;
  } else {
    currentLang = 'en';
  }
}

/**
 * Get the current UI language
 * @returns {string} Current language code
 */
export function getLanguage() {
  return currentLang;
}

/**
 * Get messages for the current language
 * @returns {Object} Messages object for current language
 */
export function t() {
  return messages[currentLang] || messages.en;
}

/**
 * Get a specific message by path
 * @param {string} path - Dot-separated path to message (e.g., 'contentMode.title')
 * @returns {*} Message value or undefined
 */
export function msg(path) {
  const parts = path.split('.');
  let result = messages[currentLang] || messages.en;
  for (const part of parts) {
    if (result && typeof result === 'object') {
      result = result[part];
    } else {
      return undefined;
    }
  }
  return result;
}

/**
 * Detect language from environment or locale setting
 * @param {string|null} locale - Locale setting from CLI options
 * @returns {string} Detected language code
 */
export function detectLanguage(locale) {
  // If locale is explicitly set to zh-tw, use Chinese
  if (locale === 'zh-tw') {
    return 'zh-tw';
  }

  // Check environment variables
  const envLang = process.env.LANG || process.env.LC_ALL || process.env.LC_MESSAGES || '';
  if (envLang.toLowerCase().includes('zh_tw') || envLang.toLowerCase().includes('zh-tw')) {
    return 'zh-tw';
  }

  // Default to English
  return 'en';
}
