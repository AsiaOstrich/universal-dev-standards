/**
 * i18n messages for CLI prompts
 *
 * Supported languages:
 * - en: English (default)
 * - zh-tw: Traditional Chinese
 * - zh-cn: Simplified Chinese
 */

export const messages = {
  en: {
    // Common labels
    recommended: 'Recommended',
    advanced: 'Advanced',
    checkboxHint: '(Space to select, A to toggle all, Enter to confirm)',

    // Display Language (first prompt - uses bilingual format)
    displayLanguage: {
      title: 'Display Language / 顯示語言',
      description: 'Select the language for CLI messages and AI Agent instructions',
      question: 'Select display language / 選擇顯示語言:',
      choices: {
        en: 'English',
        'zh-tw': '繁體中文 (Traditional Chinese)',
        'zh-cn': '简体中文 (Simplified Chinese)'
      },
      explanations: {
        en: '  → CLI messages and AI Agent instructions will be in English',
        'zh-tw': '  → CLI 訊息和 AI Agent 指示將使用繁體中文',
        'zh-cn': '  → CLI 消息和 AI Agent 指示将使用简体中文'
      }
    },

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
        full: 'Install all standard files, not just relying on Skills'
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
    },

    // AI Tools Selection
    aiTools: {
      title: 'AI Development Tools',
      description: 'Select the AI coding assistants you use with this project',
      question: 'Which AI tools are you using?',
      separators: {
        dynamicSkills: '── Dynamic Skills ──',
        staticRules: '── Static Rule Files ──',
        agentsMd: '── AGENTS.md Tools ──',
        gemini: '── Gemini Tools ──'
      },
      choices: {
        claudeCode: '',
        none: 'None / Skip'
      }
    },

    // Skills Installation Location
    skillsLocation: {
      title: 'Skills Installation:',
      description: 'Choose where to install Skills',
      descriptionWithTools: 'Skills will work with:',
      question: 'Where should Skills be installed?',
      questionMulti: 'Select where to install Skills:',
      marketplaceWarning: 'Claude Code Skills installed via Marketplace',
      coexistNote: 'File installation will coexist with Marketplace version',
      separatorFileInstall: '── Or choose file installation location ──',
      validationNoMix: 'Cannot select "Skip" with other options',
      installCount: 'Will install Skills to {count} location(s)',
      choices: {
        marketplace: 'Auto-updates, easy version management',
        userLevel: 'User Level',
        projectLevel: 'Project Level',
        user: 'Shared across all projects',
        project: 'This project only',
        none: 'No Skills installation'
      },
      explanations: {
        marketplace: '  → Automatic updates when new versions are released\n  → Easy install/uninstall via Claude Code Plugin system\n  → Run: /plugin install universal-dev-standards@asia-ostrich',
        user: '  → Skills available in all your projects',
        project: '  → Consider adding .claude/skills/ to .gitignore',
        none: '  → Full standards will be copied to .standards/'
      }
    },

    // Marketplace Installation Guide
    marketplaceInstall: {
      claudeCodeTip: 'Claude Code can be installed via Marketplace:',
      guide: 'Please run the following command in Claude Code:',
      note: 'After installation, Skills will auto-load and stay updated.',
      alreadyInstalled: 'Marketplace plugin already installed.',
      version: 'Version'
    },

    // Commands Installation
    commandsInstallation: {
      title: 'Slash Commands Installation',
      description: 'The following AI Agents support slash commands:',
      question: 'Select AI Agents to install slash commands',
      questionMulti: 'Select where to install slash commands:',
      installCount: 'Will install 15 slash commands for {count} AI Agent(s)',
      validationNoMix: 'Cannot select "Skip" with other options',
      choices: {
        skip: 'Skip (use Skills instead)',
        userLevel: 'User Level',
        projectLevel: 'Project Level'
      },
      explanations: {
        user: '  → Commands available in all your projects',
        project: '  → Commands only for this project'
      }
    },

    // Commit Message Language
    commitLanguage: {
      title: 'Commit Message Language:',
      description: 'What language for commit messages?',
      question: 'Select commit message language:',
      choices: {
        english: 'Standard international format',
        chinese: 'For Chinese-speaking teams',
        bilingual: 'Both English and Chinese'
      },
      labels: {
        english: 'English',
        chinese: 'Traditional Chinese',
        bilingual: 'Bilingual'
      }
    },

    // Install Mode
    installMode: {
      question: 'Select installation mode:',
      choices: {
        skills: 'Use Claude Code Skills',
        full: 'Install all standards without Skills'
      },
      explanations: {
        skills: [
          '  → Skills will be installed to ~/.claude/skills/',
          '  → Only static standards will be copied to .standards/'
        ],
        full: [
          '  → All standards will be copied to .standards/',
          '  → No Skills will be installed'
        ]
      }
    },

    // Adoption Level (configure)
    adoptionLevelConfig: {
      title: 'Adoption Level:',
      currentLevel: 'Current level:',
      question: 'Select new adoption level:',
      choices: {
        1: '6 core standards',
        2: '12 standards',
        3: 'All 16 standards'
      },
      warnings: {
        upgrade: '⚠ Upgrading level will add new standard files',
        downgrade: '⚠ Downgrading level will NOT remove existing files',
        downgradeHint: '  You may manually remove files from .standards/ if needed'
      }
    },

    // Methodology
    methodology: {
      title: 'Development Methodology:',
      experimental: '⚠️  [Experimental] This feature will be redesigned in v4.0',
      description: 'Select a methodology to guide your development workflow.',
      question: 'Which development methodology do you want to use?',
      choices: {
        tdd: 'Test-Driven Development (Red → Green → Refactor)',
        bdd: 'Behavior-Driven Development (Given-When-Then)',
        sdd: 'Spec-Driven Development (Spec First, Code Second)',
        atdd: 'Acceptance Test-Driven Development',
        none: 'No specific methodology'
      }
    },

    // AI Tools Management
    manageAITools: {
      title: 'AI Tools Management:',
      currentlyInstalled: 'Currently installed:',
      none: 'none',
      question: 'What would you like to do?',
      choices: {
        add: 'Add new AI tools',
        remove: 'Remove existing AI tools',
        view: 'View current AI tools',
        cancel: 'Cancel'
      },
      installedTitle: 'Installed AI Tools:',
      noTools: 'No AI tools installed',
      allInstalled: 'All AI tools are already installed!',
      noToolsToRemove: 'No AI tools to remove!',
      selectToAdd: 'Select AI tools to add:',
      selectToRemove: 'Select AI tools to remove:'
    },

    // Skills Update
    skillsUpdate: {
      upToDate: '✓ All Skills installations are up to date',
      title: 'Skills Update Available:',
      projectLevel: 'Project level (.claude/skills/):',
      userLevel: 'User level (~/.claude/skills/):',
      question: 'What would you like to do?',
      choices: {
        both: 'Update all Skills installations',
        project: 'Only update .claude/skills/',
        user: 'Only update ~/.claude/skills/',
        skip: 'Keep current versions'
      }
    },

    // Integration Configuration
    integration: {
      // promptIntegrationMode
      mode: {
        title: 'Integration Configuration:',
        description: 'Configure how AI tool rules are generated',
        question: 'How would you like to configure integration files?',
        choices: {
          default: 'Use standard rule set',
          custom: 'Select specific rules to include',
          merge: 'Merge with existing rules file'
        }
      },
      // promptRuleCategories
      categories: {
        title: 'Rule Categories:',
        description: 'Select which standards to include in integration files',
        question: 'Select rule categories:',
        validation: 'Please select at least one category'
      },
      // promptLanguageRules
      languageRules: {
        title: 'Language-Specific Rules:',
        description: 'Include language-specific coding standards',
        question: 'Include language-specific rules:'
      },
      // promptExclusions
      exclusions: {
        title: 'Custom Exclusions:',
        description: 'Specify patterns or rules to exclude from enforcement',
        question: 'Do you want to add custom exclusions?',
        inputPrompt: 'Enter exclusion patterns (comma-separated):'
      },
      // promptCustomRules
      customRules: {
        title: 'Project-Specific Rules:',
        description: 'Add custom rules specific to your project',
        question: 'Do you want to add project-specific custom rules?',
        inputPrompt: 'Enter custom rule (or empty to finish):'
      },
      // promptMergeStrategy (for integration files)
      mergeStrategy: {
        title: 'Existing Rules Detected:',
        description: 'Choose how to handle existing rules',
        question: 'How should we handle the existing rules?',
        choices: {
          append: 'Add new rules after existing ones',
          merge: 'Intelligently merge (avoid duplicates)',
          overwrite: 'Replace with new rules',
          keep: 'Keep existing, skip installation'
        }
      },
      // promptDetailLevel
      detailLevel: {
        title: 'Rule Detail Level:',
        description: 'Choose how detailed the generated rules should be',
        question: 'Select rule detail level:',
        choices: {
          minimal: 'Essential rules only (~50 lines)',
          standard: 'Balanced coverage (~150 lines)',
          comprehensive: 'Full documentation (~300+ lines)'
        },
        labels: {
          minimal: 'Minimal',
          standard: 'Standard',
          comprehensive: 'Comprehensive',
          complete: 'Complete'
        }
      },
      // promptRuleLanguage
      ruleLanguage: {
        question: 'Select rule documentation language:',
        choices: {
          en: 'English',
          zhTw: 'Traditional Chinese',
          bilingual: 'Bilingual'
        }
      },
      // Other messages
      noExistingFile: 'No existing rules file found. Using default mode.'
    },

    // Command output messages
    commands: {
      // Common messages used across commands
      common: {
        notInitialized: '✗ Standards not initialized in this project.',
        runInit: 'Run `uds init` to initialize.',
        couldNotReadManifest: '✗ Could not read manifest file.',
        version: 'Version',
        level: 'Level',
        format: 'Format',
        contentMode: 'Content Mode',
        aiTools: 'AI Tools',
        skills: 'Skills',
        methodology: 'Methodology',
        none: 'none',
        yes: 'Yes',
        no: 'No',
        cancelled: 'cancelled',
        total: 'Total',
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        tip: 'Tip'
      },

      // list command
      list: {
        title: 'Universal Development Standards',
        errorLevelRange: 'Error: Level must be 1, 2, or 3',
        showingLevel: 'Showing Level',
        errorUnknownCategory: 'Error: Unknown category',
        validCategories: 'Valid categories: skill, reference, extension, integration, template',
        category: 'Category',
        appliesTo: 'Applies to',
        totalSummary: 'standards',
        withSkills: 'with Skills',
        referenceOnly: 'reference-only',
        runInitHint: 'Run `uds init` to adopt standards in your project.',
        seeGuide: 'See: https://github.com/AsiaOstrich/universal-dev-standards/blob/main/adoption/ADOPTION-GUIDE.md'
      },

      // skills command
      skills: {
        title: 'Universal Dev Standards - Installed Skills',
        noSkillsInstalled: 'No Universal Dev Standards skills installed.',
        installViaMarketplace: 'Install via Plugin Marketplace:',
        orManually: 'Or install manually:',
        recommended: '(recommended)',
        legacyMarketplaceWarning: '⚠ Legacy marketplace detected.',
        legacyMarketplaceHint: 'Consider upgrading to Plugin Marketplace for automatic updates.',
        manualInstallDeprecated: '⚠ Manual installation is deprecated.',
        manualInstallHint: 'Consider migrating to Plugin Marketplace.',
        totalUniqueSkills: 'Total unique skills',
        recommendation: 'Recommendation: Migrate to Plugin Marketplace',
        benefits: 'Benefits: Automatic updates, better integration',
        migrateCommand: 'To migrate, run:'
      },

      // check command
      check: {
        title: 'Universal Documentation Standards - Check',
        // Basic status
        standardsInitialized: '✓ Standards initialized',
        adoptionStatus: 'Adoption Status:',
        installed: 'Installed',
        // Update info
        updateAvailable: '⚠ Update available: {current} → {latest}',
        runUpdate: 'Run `uds update` to update.',
        // File integrity
        fileIntegrity: 'File Integrity:',
        hashNotAvailable: 'ℹ Hash information not available (legacy manifest).',
        checkingExistence: 'Checking file existence only...',
        unchanged: 'unchanged',
        modified: 'modified',
        missing: 'missing',
        existsNoHash: 'exists, no hash',
        summary: 'Summary: {unchanged} unchanged, {modified} modified, {missing} missing',
        // Actions available
        actionsAvailable: 'Actions available:',
        restoreOption: '• Run `uds check --restore` to restore all modified/missing files',
        diffOption: '• Run `uds check --diff` to view changes',
        interactiveOption: '• Run `uds check --interactive` for file-by-file decisions',
        // Interactive mode
        interactiveMode: 'Interactive Mode:',
        filesNeedAttention: '{count} file(s) need attention.',
        modifiedLabel: 'Modified',
        missingLabel: 'Missing',
        actionPrompt: 'What would you like to do?',
        actionView: 'view    - View diff between current and original',
        actionRestore: 'restore - Restore to original version',
        actionKeep: 'keep    - Keep current version (update hash in manifest)',
        actionSkip: 'skip    - Skip this file for now',
        actionRestoreMissing: 'restore - Download and restore file',
        actionRemove: 'remove  - Remove from manifest (no longer track)',
        followUpPrompt: 'What would you like to do now?',
        keepingCurrent: '✓ Keeping current version. Hash updated.',
        removedFromManifest: '✓ Removed from manifest.',
        skipped: 'Skipped.',
        manifestUpdated: '✓ Manifest updated.',
        // Restore
        restoringFiles: 'Restoring files...',
        restoredCount: '✓ Restored {count} file(s)',
        restoreFailedCount: '✗ Failed to restore {count} file(s)',
        manifestUpdatedShort: 'Manifest updated.',
        // File restore messages
        restored: 'Restored',
        couldNotDetermineSource: 'Could not determine source',
        // Diff display
        couldNotReadFile: 'Could not read current file.',
        couldNotDetermineSource2: 'Could not determine original source path.',
        fetchingOriginal: 'Fetching original from GitHub...',
        couldNotFetchOriginal: 'Could not fetch original content.',
        diffOriginal: '--- Original',
        diffCurrent: '+++ Current',
        diffTruncated: '... (diff truncated, showing first 20 changes)',
        diffFor: 'Diff for: {file}',
        // Migration
        migratingToHash: 'Migrating to hash-based integrity checking...',
        migratedCount: '✓ Migrated {count} files to hash-based tracking',
        manifestUpgraded: 'Manifest version upgraded to 3.1.0',
        // Tip for migration
        tip: 'Tip:',
        migrateTip: 'Run `uds check --migrate` to enable hash-based integrity checking.',
        migrateTip2: 'This will compute hashes for all existing files.',
        // Skills status
        skillsStatus: 'Skills Status:',
        skillsViaMarketplace: '✓ Skills installed via Plugin Marketplace',
        skillsManaged: 'Managed by Claude Code plugin system',
        skillsNotFileBased: 'Note: Marketplace skills are not file-based',
        lastUpdated: 'Last updated',
        skillsInstalled: '✓ Skills installed',
        skillsGlobal: 'Global: ~/.claude/skills/',
        skillsProject: 'Project: .claude/skills/',
        compatible: 'Compatible',
        openCodeNote: 'Note: OpenCode auto-detects .claude/skills/',
        considerMigrating: '⚠ Consider migrating to Plugin Marketplace',
        marketplaceAutoUpdates: 'Marketplace provides automatic updates and easier management.',
        toMigrate: 'To migrate:',
        skillsMarkedNotFound: '⚠ Skills marked as installed but not found',
        recommendedInstall: 'Recommended: Install via Plugin Marketplace',
        skillsNotInstalled: 'Skills not installed (using reference documents only)',
        // Coverage
        coverageSummary: 'Coverage Summary:',
        levelRequires: 'Level {level} requires {count} standards:',
        withSkills: '{count} with Skills (interactive AI assistance)',
        referenceDocs: '{count} reference documents',
        yourCoverage: 'Your coverage:',
        viaSkills: '{count} via Skills',
        viaDocs: '{count} via copied documents',
        // AI tool integration
        aiToolIntegration: 'AI Tool Integration Status:',
        fileNotFound: 'File not found',
        couldNotRead: 'Could not read file',
        standardsIndexPresent: 'Standards index present',
        standardsReferenced: '{count}/{total} standards referenced',
        missingStandardsList: 'Missing: {list}',
        usingMinimalMode: 'Using minimal mode (no standards index)',
        coreRulesEmbedded: 'Core rules embedded',
        noAiToolFiles: 'No AI tool integration files configured.',
        toFixIntegration: 'To fix integration issues:',
        runUpdateToSync: '• Run `uds update` to sync all integration files',
        runConfigureTools: '• Run `uds configure --type ai_tools` to manage AI tools',
        // Reference sync
        refSyncStatus: 'Reference Sync Status:',
        noRefsFound: 'No standard references found',
        refsNotInManifest: 'References not in manifest:',
        standardsNotReferenced: 'Standards not referenced (optional):',
        refsInSync: '{path}: references in sync ({count} refs)',
        noIntegrationRefs: 'No integration files with standard references found.',
        runSyncRefs: 'Run `uds update --sync-refs` to fix reference issues.',
        // CLI update
        checkingCliUpdates: 'Checking for CLI updates...',
        couldNotCheckUpdates: 'ℹ Could not check for CLI updates (offline mode)',
        cliUpdateAvailable: 'CLI Update Available:',
        currentCli: 'Current CLI',
        latestOnNpm: 'Latest on npm',
        latestStable: 'Latest stable',
        runNpmUpdate: 'Run: npm update -g universal-dev-standards',
        // Final status
        projectCompliant: '✓ Project is compliant with standards',
        issuesDetected: '⚠ Some issues detected. Review above for details.',
        // Installation prompts
        offerSkillsInstallation: 'Skills Installation',
        offerCommandsInstallation: 'Commands Installation',
        selectSkillsToInstall: 'Select AI tools to install Skills for:',
        selectCommandsToInstall: 'Select AI tools to install Commands for:',
        skipInstallation: 'Skip',
        skillsInstalledSuccess: 'Installed Skills for {count} AI tools',
        commandsInstalledSuccess: 'Installed commands for {count} AI tools',
        // Read-only hint
        missingSkillsHint: 'Tip: Run `uds update` to install missing Skills/Commands',
        // Summary mode (--summary)
        summary_mode: {
          title: 'UDS Status Summary',
          notInitialized: 'Not initialized',
          manifestError: 'Manifest error',
          version: 'Version',
          level: 'Level',
          files: 'Files',
          skills: 'Skills',
          commands: 'Commands'
        }
      },

      // init command (commands/init.js)
      init: {
        title: 'Universal Development Standards - Initialize',
        alreadyInitialized: '⚠ Standards already initialized in this project.',
        useUpdateOrDelete: 'Use `uds update` to update, or delete .standards/ to reinitialize.',
        // Detection
        detectingProject: 'Detecting project characteristics...',
        analysisComplete: 'Project analysis complete',
        languages: 'Languages',
        frameworks: 'Frameworks',
        aiTools: 'AI Tools',
        // Skills status
        skillsStatus: 'Skills Status:',
        projectLevel: 'Project level',
        userLevel: 'User level',
        notInstalled: 'not installed',
        noSkillsDetected: 'No Skills installation detected',
        skillsMarketplaceInstalled: 'Marketplace',
        // No AI tools selected - exit
        noAiToolsSelected: 'No AI tools selected.',
        noAiToolsExplanation: '  UDS provides development standards for AI coding assistants.',
        noAiToolsExplanation2: '  Without an AI tool, there is nothing to install.',
        // Integration
        integrationConfig: 'Integration Configuration:',
        sharedRuleConfig: 'All selected tools will share the same rule configuration.',
        // Config summary
        configSummary: 'Configuration Summary:',
        standardsScope: 'Standards Scope',
        standardsScopeLean: 'Lean (Skills handle the rest)',
        standardsScopeComplete: 'Complete',
        contentModeLabel: 'Content Mode',
        contentModeFull: 'Full Embed',
        contentModeIndex: 'Standard (recommended)',
        contentModeMinimal: 'Minimal (core only)',
        displayLanguageLabel: 'Display Language',
        integrations: 'Integrations',
        skillsLabel: 'Skills',
        skillsMarketplace: 'Plugin Marketplace (managed by Claude Code)',
        skillsInstallTo: 'install/update to {location}',
        skillsUsingExisting: 'using existing ({location})',
        gitWorkflow: 'Git Workflow',
        mergeStrategy: 'Merge Strategy',
        commitLanguage: 'Commit Language',
        testLevels: 'Test Levels',
        // Prompts
        proceedInstall: 'Proceed with installation?',
        installCancelled: 'Installation cancelled.',
        // Spinners
        copyingStandards: 'Copying standards...',
        copiedStandards: 'Copied {count} standard files',
        copyingExtensions: 'Copying extensions...',
        copiedExtensions: 'Copied {count} extension files',
        generatingIntegrations: 'Generating integration files...',
        generatedIntegrations: 'Generated {count} integration files',
        generatingClaudeMd: 'Generating CLAUDE.md...',
        generatedClaudeMd: 'Generated CLAUDE.md',
        couldNotGenerateClaudeMd: 'Could not generate CLAUDE.md',
        installingSkills: 'Installing Claude Code Skills...',
        installedSkills: 'Installed {count} Skills to {locations}',
        installedSkillsWithErrors: 'Installed {count} Skills with {errors} errors',
        // Success
        initializedSuccess: '✓ Standards initialized successfully!',
        filesCopied: '{count} files copied to project',
        skillsUsingMarketplace: 'Skills: Using Plugin Marketplace installation',
        skillsInstalledTo: '{count} Skills installed to {locations}',
        manifestCreated: 'Manifest created at .standards/manifest.json',
        errorsOccurred: '⚠ {count} error(s) occurred:',
        // Next steps
        nextSteps: 'Next steps:',
        reviewDirectory: '1. Review .standards/ directory',
        addToVcs: '2. Add .standards/ to version control',
        restartAgent: '3. Restart {tools} to load new Skills',
        runCheck: 'Run `uds check` to verify adoption status'
      },

      // update command
      update: {
        title: 'Universal Documentation Standards - Update',
        // CLI update
        cliUpdateAvailable: '⚡ New CLI version available!',
        bundledVersion: 'Your bundled version',
        latestOnNpm: 'Latest on npm',
        whatToDo: 'What would you like to do?',
        updateCliFirst: 'Update CLI first (recommended)',
        continueWithCurrent: 'Continue with current CLI',
        cancel: 'Cancel',
        operationCancelled: 'Operation cancelled.',
        updatingCli: 'Updating CLI...',
        cliUpdated: 'CLI updated successfully!',
        rerunUpdate: '✓ Please run `uds update` again to update standards.',
        cliUpdateFailed: 'Failed to update CLI',
        permissionIssue: 'This may be due to permission issues.',
        tryManually: 'Try manually with sudo:',
        // Version info
        currentVersion: 'Current version',
        latestVersion: 'Latest version',
        upToDate: '✓ Standards are up to date.',
        newerVersion: '(You have a newer version than the registry: {version})',
        updateAvailable: 'Update available: {current} → {latest}',
        // Files
        filesToUpdate: 'Files to update:',
        // Confirmation
        confirmUpdate: 'Proceed with update? This will overwrite existing files.',
        updateCancelled: 'Update cancelled.',
        // Spinners
        updatingStandards: 'Updating standards...',
        updatedStandards: 'Updated {count} standard files',
        syncingIntegrations: 'Syncing integration files...',
        syncedIntegrations: 'Synced {count} integration files',
        // Success
        updateSuccess: '✓ Standards updated successfully!',
        versionUpdated: 'Version: {current} → {latest}',
        integrationsSynced: 'Integration files synced: {count}',
        errorsOccurred: '⚠ {count} file(s) could not be updated:',
        // Skills update
        skillsUpdateAvailable: 'Skills update available:',
        skillsCurrent: 'Current',
        skillsLatest: 'Latest',
        updateViaMarketplace: 'Update via Plugin Marketplace:',
        autoUpdate: 'Auto-update: Restart Claude Code (updates on startup)',
        manualUpdate: 'Manual: Run /plugin marketplace update anthropic-agent-skills',
        manualInstallDeprecated: '⚠️  Manual installation is deprecated',
        recommendedMigrate: 'Recommended: Migrate to Plugin Marketplace',
        orUpdateManually: 'Or update manually:',
        // Integrations only
        updatingIntegrationsOnly: 'Updating integration files only...',
        noAiToolsConfigured: '⚠ No AI tools configured in manifest.',
        runConfigure: 'Run `uds configure` to add AI tools.',
        regeneratingIntegrations: 'Regenerating integration files...',
        regeneratedIntegrations: 'Regenerated {count} integration files',
        integrationsSuccess: '✓ Integration files updated successfully!',
        filesUpdatedList: 'Files updated: {files}',
        integrationsErrors: '⚠ {count} error(s):',
        // Sync refs
        syncingRefs: 'Syncing integration references...',
        noIntegrationConfigs: '⚠ No integration configurations found in manifest.',
        integrationConfigsRequired: 'Integration configs are required for reference sync.',
        thisHappensWhen: 'This happens when:',
        oldVersion: '- The project was initialized with an older version of UDS',
        manuallyCopied: '- Integration files were manually copied, not generated',
        toFixThis: 'To fix this, you can either:',
        reinitialize: '1. Re-initialize the project: uds init (delete .standards/ first)',
        manuallyUpdateFiles: '2. Manually update the integration files',
        expectedCategories: 'Expected categories from manifest.standards:',
        skipping: 'Skipping {path}: file not found',
        alreadyInSync: '{path}: already in sync',
        unknownTool: '⚠ {path}: unknown tool, skipping',
        updated: '✓ Updated {path}',
        categoriesChanged: 'Categories: {old} → {new}',
        failedToUpdate: '✗ Failed to update {path}: {error}',
        updatedCount: '✓ Updated {count} integration file(s)',
        skippedCount: 'Skipped {count} file(s) (already in sync or not found)',
        // New features discovery
        newFeaturesAvailable: 'New Features Available',
        newFeaturesAvailableHint: 'Note: New features available for your AI tools',
        skillsNotInstalledFor: 'Skills not yet installed for these AI tools:',
        commandsNotInstalledFor: 'Slash commands not yet installed for these AI tools:',
        installSkillsNow: 'Would you like to install Skills for these AI tools?',
        installCommandsNow: 'Would you like to install slash commands for these AI tools?',
        selectSkillsToInstall: 'Select AI tools to install Skills for:',
        selectCommandsToInstall: 'Select AI tools to install Commands for:',
        skipSkillsInstallation: 'Skip Skills installation',
        skipCommandsInstallation: 'Skip Commands installation',
        skipValidationError: 'Cannot select Skip with other options',
        skillsLevelQuestion: 'Where should Skills be installed?',
        projectLevel: 'Project level',
        userLevel: 'User level',
        installingNewSkills: 'Installing Skills...',
        installingNewCommands: 'Installing commands...',
        newSkillsInstalled: 'Installed Skills for {count} AI tools',
        newSkillsInstalledWithErrors: 'Installed Skills with {errors} errors',
        newCommandsInstalled: 'Installed commands for {count} AI tools',
        newCommandsInstalledWithErrors: 'Installed commands with {errors} errors',
        // Outdated Skills/Commands
        skillsOutdatedFor: 'Skills updates available for these AI tools:',
        commandsOutdatedFor: 'Commands updates available for these AI tools:',
        selectSkillsToUpdate: 'Select AI tools to update Skills for:',
        selectCommandsToUpdate: 'Select AI tools to update Commands for:',
        skipSkillsUpdate: 'Skip Skills update',
        skipCommandsUpdate: 'Skip Commands update',
        updatingSkills: 'Updating Skills...',
        skillsUpdated: 'Updated Skills for {count} AI tools',
        skillsUpdatedWithErrors: 'Updated Skills with {errors} errors',
        updatingCommands: 'Updating Commands...',
        commandsUpdated: 'Updated Commands for {count} AI tools',
        commandsUpdatedWithErrors: 'Updated Commands with {errors} errors',
        // Marketplace detection
        alreadyViaMarketplace: 'already via Marketplace',
        marketplaceCoexistNote: 'Note: File-based installation will coexist with Marketplace version'
      },

      // configure command
      configure: {
        title: 'Universal Development Standards - Configure',
        currentConfig: 'Current Configuration:',
        selectOption: 'What would you like to configure?',
        // Menu options
        optionFormat: 'Format (AI/Human)',
        optionWorkflow: 'Git Workflow Strategy',
        optionMergeStrategy: 'Merge Strategy',
        optionCommitLanguage: 'Commit Message Language',
        optionTestLevels: 'Test Levels',
        optionAITools: 'AI Tools - Add/Remove AI integrations',
        optionLevel: 'Adoption Level - Change Level 1/2/3',
        optionContentMode: 'Content Mode - Change full/index/minimal',
        optionMethodology: 'Methodology - Change development methodology',
        optionAll: 'All Options',
        experimental: '[Experimental]',
        // Labels
        gitWorkflow: 'Git Workflow',
        mergeStrategy: 'Merge Strategy',
        commitLanguage: 'Commit Language',
        testLevels: 'Test Levels',
        // Spinners
        removingIntegrations: 'Removing integration files...',
        integrationsRemoved: 'Integration files removed',
        updatingConfig: 'Updating configuration...',
        configUpdated: 'Configuration updated',
        addingStandards: 'Adding new standards for higher level...',
        standardsAdded: 'New standards added',
        regeneratingIntegrations: 'Regenerating integration files...',
        regeneratedIntegrations: 'Regenerated {count} integration files',
        // Messages
        removed: 'Removed',
        couldNotRemove: 'Could not remove',
        noChanges: 'No changes made.',
        newConfig: 'New Configuration:',
        applyChanges: 'Apply these changes?',
        configCancelled: 'Configuration cancelled.',
        configSuccess: '✓ Configuration updated successfully!',
        newOptionsCopied: '{count} new option/standard files copied',
        integrationsRegenerated: '{count} integration files regenerated',
        errorsOccurred: '⚠ {count} error(s) occurred:',
        // Skills and Commands configuration
        optionSkills: 'Skills - Manage Skills installations',
        optionCommands: 'Commands - Manage slash commands',
        noAiToolsConfigured: 'No AI tools configured',
        addAiToolsFirst: 'Add AI tools first with: uds configure --type ai_tools',
        currentSkillsStatus: 'Current Skills status:',
        currentCommandsStatus: 'Current Commands status:',
        notInstalled: 'Not installed',
        skillsAction: 'What would you like to do with Skills?',
        commandsAction: 'What would you like to do with Commands?',
        installSkills: 'Install/Update Skills',
        installCommands: 'Install/Update Commands',
        viewStatus: 'View status only',
        installingSkills: 'Installing Skills...',
        installingCommands: 'Installing Commands...',
        skillsInstallSuccess: 'Skills installed successfully',
        skillsInstallPartial: 'Skills installed with some issues',
        commandsInstallSuccess: 'Commands installed successfully',
        commandsInstallPartial: 'Commands installed with some issues',
        totalInstalled: 'Total installed',
        errors: 'Errors',
        noCommandSupportedTools: 'No AI tools with command support configured',
        commandSupportedList: 'Tools that support commands: OpenCode, Copilot, Roo Code, Gemini CLI',
        commandsInstalled: 'commands',
        // Smart apply
        applyChangesNow: 'Apply changes now? (regenerate integration files)',
        runUpdateLater: 'Run `uds update --integrations-only` later to apply changes',
        applyingChanges: 'Applying changes...',
        changesApplied: 'Changes applied successfully',
        // Declined features
        previouslyDeclined: 'Previously declined',
        reinstallDeclinedSkills: 'Reinstall declined Skills',
        reinstallDeclinedCommands: 'Reinstall declined Commands',
        skillsLevelQuestion: 'Where should Skills be installed?',
        projectLevel: 'Project level',
        userLevel: 'User level',
        // Marketplace detection
        viaMarketplace: 'Via Marketplace',
        marketplaceOnly: 'Marketplace only (no local files)',
        marketplaceCoexistNote: 'Note: File-based installation will coexist with Marketplace version'
      }
    }
  },

  'zh-tw': {
    // Common labels
    recommended: '推薦',
    advanced: '進階',
    checkboxHint: '（空格選擇、A 全選/取消、Enter 確認）',

    // Display Language (first prompt - uses bilingual format)
    displayLanguage: {
      title: '顯示語言 / Display Language',
      description: '選擇 CLI 訊息和 AI Agent 指示的語言',
      question: '選擇顯示語言 / Select display language:',
      choices: {
        en: 'English',
        'zh-tw': '繁體中文 (Traditional Chinese)',
        'zh-cn': '简体中文 (Simplified Chinese)'
      },
      explanations: {
        en: '  → CLI messages and AI Agent instructions will be in English',
        'zh-tw': '  → CLI 訊息和 AI Agent 指示將使用繁體中文',
        'zh-cn': '  → CLI 消息和 AI Agent 指示将使用简体中文'
      }
    },

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
        full: '安裝全部標準檔案，不僅只依賴 Skills'
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
    },

    // AI Tools Selection
    aiTools: {
      title: 'AI 開發工具',
      description: '選擇你在此專案中使用的 AI 程式助手',
      question: '你使用哪些 AI 工具？',
      separators: {
        dynamicSkills: '── 動態 Skills ──',
        staticRules: '── 靜態規則檔案 ──',
        agentsMd: '── AGENTS.md 工具 ──',
        gemini: '── Gemini 工具 ──'
      },
      choices: {
        claudeCode: '',
        none: '無 / 跳過'
      }
    },

    // Skills Installation Location
    skillsLocation: {
      title: 'Skills 安裝位置:',
      description: '選擇 Skills 的安裝位置',
      descriptionWithTools: 'Skills 將支援:',
      question: 'Skills 要安裝在哪裡？/ Where should Skills be installed?',
      questionMulti: '選擇要安裝 Skills 的位置：',
      marketplaceWarning: 'Claude Code Skills 已透過 Marketplace 安裝',
      coexistNote: '檔案安裝將與 Marketplace 版本並存',
      separatorFileInstall: '── 或選擇檔案安裝位置 ──',
      validationNoMix: '選擇「跳過」時不能同時選擇其他選項',
      installCount: '將安裝 Skills 到 {count} 個位置',
      choices: {
        marketplace: '自動更新、輕鬆管理版本',
        userLevel: '使用者層級',
        projectLevel: '專案層級',
        user: '跨專案共享',
        project: '僅限此專案',
        none: '不安裝 Skills'
      },
      explanations: {
        marketplace: '  → 新版本發布時自動更新\n  → 透過 Claude Code 外掛系統輕鬆安裝/移除\n  → 執行: /plugin install universal-dev-standards@asia-ostrich',
        user: '  → Skills 可在所有專案中使用',
        project: '  → 建議將 .claude/skills/ 加入 .gitignore',
        none: '  → 完整標準將複製到 .standards/'
      }
    },

    // Marketplace Installation Guide
    marketplaceInstall: {
      claudeCodeTip: 'Claude Code 可透過 Marketplace 安裝：',
      guide: '請在 Claude Code 中執行以下指令：',
      note: '安裝完成後，Skills 將自動載入並保持更新。',
      alreadyInstalled: 'Marketplace 外掛已安裝。',
      version: '版本'
    },

    // Commands Installation
    commandsInstallation: {
      title: '斜線命令安裝',
      description: '以下 AI Agent 支援斜線命令：',
      question: '選擇要安裝斜線命令的 AI Agent',
      questionMulti: '選擇要安裝斜線命令的位置：',
      installCount: '將為 {count} 個 AI Agent 安裝 15 個斜線命令',
      validationNoMix: '無法同時選擇「跳過」和其他選項',
      choices: {
        skip: '跳過（使用 Skills 替代）',
        userLevel: '使用者層級',
        projectLevel: '專案層級'
      },
      explanations: {
        user: '  → 命令適用於您所有的專案',
        project: '  → 命令僅適用於此專案'
      }
    },

    // Commit Message Language
    commitLanguage: {
      title: 'Commit 訊息語言:',
      description: '選擇 commit 訊息的語言',
      question: '選擇 commit 訊息語言 / Select commit message language:',
      choices: {
        english: '標準國際格式',
        chinese: '適合中文團隊',
        bilingual: '英文和中文並用'
      },
      labels: {
        english: 'English',
        chinese: '繁體中文',
        bilingual: '雙語'
      }
    },

    // Install Mode
    installMode: {
      question: '選擇安裝模式 / Select installation mode:',
      choices: {
        skills: '使用 Claude Code Skills',
        full: '安裝所有標準，不使用 Skills'
      },
      explanations: {
        skills: [
          '  → Skills 將安裝到 ~/.claude/skills/',
          '  → 僅靜態標準會複製到 .standards/'
        ],
        full: [
          '  → 所有標準將複製到 .standards/',
          '  → 不安裝 Skills'
        ]
      }
    },

    // Adoption Level (configure)
    adoptionLevelConfig: {
      title: 'Adoption Level:',
      currentLevel: '目前等級:',
      question: '選擇新的採用等級 / Select new adoption level:',
      choices: {
        1: '6 項核心標準',
        2: '12 項標準',
        3: '全部 16 項標準'
      },
      warnings: {
        upgrade: '⚠ 升級等級將新增標準檔案',
        downgrade: '⚠ 降級等級不會移除現有檔案',
        downgradeHint: '  如有需要，請手動從 .standards/ 移除檔案'
      }
    },

    // Methodology
    methodology: {
      title: '開發方法論:',
      experimental: '⚠️  [實驗性] 此功能將在 v4.0 重新設計',
      description: '選擇指導開發流程的方法論',
      question: '你想使用哪種開發方法論？/ Which development methodology?',
      choices: {
        tdd: '測試驅動開發 (Red → Green → Refactor)',
        bdd: '行為驅動開發 (Given-When-Then)',
        sdd: '規格驅動開發 (先規格、後程式)',
        atdd: '驗收測試驅動開發',
        none: '不使用特定方法論'
      }
    },

    // AI Tools Management
    manageAITools: {
      title: 'AI 工具管理:',
      currentlyInstalled: '目前已安裝:',
      none: '無',
      question: '你想做什麼？/ What would you like to do?',
      choices: {
        add: '新增 AI 工具',
        remove: '移除現有 AI 工具',
        view: '檢視目前的 AI 工具',
        cancel: '取消'
      },
      installedTitle: '已安裝的 AI 工具:',
      noTools: '未安裝任何 AI 工具',
      allInstalled: '所有 AI 工具都已安裝！',
      noToolsToRemove: '沒有可移除的 AI 工具！',
      selectToAdd: '選擇要新增的 AI 工具:',
      selectToRemove: '選擇要移除的 AI 工具:'
    },

    // Skills Update
    skillsUpdate: {
      upToDate: '✓ 所有 Skills 安裝都是最新的',
      title: 'Skills 有可用更新:',
      projectLevel: '專案層級 (.claude/skills/):',
      userLevel: '使用者層級 (~/.claude/skills/):',
      question: '你想做什麼？/ What would you like to do?',
      choices: {
        both: '更新所有 Skills 安裝',
        project: '僅更新 .claude/skills/',
        user: '僅更新 ~/.claude/skills/',
        skip: '保持目前版本'
      }
    },

    // Integration Configuration
    integration: {
      // promptIntegrationMode
      mode: {
        title: '整合設定:',
        description: '設定 AI 工具規則的產生方式',
        question: '你想如何設定整合檔案？/ How would you like to configure integration files?',
        choices: {
          default: '使用標準規則集',
          custom: '選擇要包含的特定規則',
          merge: '與現有規則檔案合併'
        }
      },
      // promptRuleCategories
      categories: {
        title: '規則類別:',
        description: '選擇要包含在整合檔案中的標準',
        question: '選擇規則類別 / Select rule categories:',
        validation: '請至少選擇一個類別'
      },
      // promptLanguageRules
      languageRules: {
        title: '語言特定規則:',
        description: '包含程式語言特定的編碼標準',
        question: '包含語言特定規則 / Include language-specific rules:'
      },
      // promptExclusions
      exclusions: {
        title: '自訂排除:',
        description: '指定要排除執行的規則或模式',
        question: '是否要新增自訂排除？/ Do you want to add custom exclusions?',
        inputPrompt: '輸入排除模式（用逗號分隔）/ Enter exclusion patterns (comma-separated):'
      },
      // promptCustomRules
      customRules: {
        title: '專案特定規則:',
        description: '新增專案特定的自訂規則',
        question: '是否要新增專案特定的自訂規則？/ Do you want to add project-specific custom rules?',
        inputPrompt: '輸入自訂規則（留空結束）/ Enter custom rule (or empty to finish):'
      },
      // promptMergeStrategy (for integration files)
      mergeStrategy: {
        title: '偵測到現有規則:',
        description: '選擇如何處理現有規則',
        question: '如何處理現有規則？/ How should we handle the existing rules?',
        choices: {
          append: '在現有規則後新增',
          merge: '智慧合併（避免重複）',
          overwrite: '以新規則取代',
          keep: '保留現有，跳過安裝'
        }
      },
      // promptDetailLevel
      detailLevel: {
        title: '規則詳細程度:',
        description: '選擇產生規則的詳細程度',
        question: '選擇規則詳細程度 / Select rule detail level:',
        choices: {
          minimal: '僅基本規則（約 50 行）',
          standard: '平衡覆蓋（約 150 行）',
          comprehensive: '完整文件（約 300+ 行）'
        },
        labels: {
          minimal: '精簡',
          standard: '標準',
          comprehensive: '詳盡',
          complete: '完整'
        }
      },
      // promptRuleLanguage
      ruleLanguage: {
        question: '選擇規則文件語言 / Select rule documentation language:',
        choices: {
          en: 'English',
          zhTw: '繁體中文',
          bilingual: '雙語'
        }
      },
      // Other messages
      noExistingFile: '找不到現有規則檔案，使用預設模式。'
    },

    // Command output messages
    commands: {
      // Common messages used across commands
      common: {
        notInitialized: '✗ 此專案尚未初始化標準。',
        runInit: '執行 `uds init` 進行初始化。',
        couldNotReadManifest: '✗ 無法讀取 manifest 檔案。',
        version: '版本',
        level: '等級',
        format: '格式',
        contentMode: '內容模式',
        aiTools: 'AI 工具',
        skills: 'Skills',
        methodology: '方法論',
        none: '無',
        yes: '是',
        no: '否',
        cancelled: '已取消',
        total: '總計',
        success: '成功',
        error: '錯誤',
        warning: '警告',
        tip: '提示'
      },

      // list command
      list: {
        title: '通用開發標準',
        errorLevelRange: '錯誤：等級必須是 1、2 或 3',
        showingLevel: '顯示等級',
        errorUnknownCategory: '錯誤：未知類別',
        validCategories: '有效類別：skill, reference, extension, integration, template',
        category: '類別',
        appliesTo: '適用於',
        totalSummary: '項標準',
        withSkills: '含 Skills',
        referenceOnly: '僅參考',
        runInitHint: '執行 `uds init` 在專案中採用標準。',
        seeGuide: '參閱：https://github.com/AsiaOstrich/universal-dev-standards/blob/main/adoption/ADOPTION-GUIDE.md'
      },

      // skills command
      skills: {
        title: '通用開發標準 - 已安裝的 Skills',
        noSkillsInstalled: '未安裝任何通用開發標準 Skills。',
        installViaMarketplace: '透過 Plugin Marketplace 安裝：',
        orManually: '或手動安裝：',
        recommended: '（推薦）',
        legacyMarketplaceWarning: '⚠ 偵測到舊版 marketplace。',
        legacyMarketplaceHint: '建議升級到 Plugin Marketplace 以獲得自動更新。',
        manualInstallDeprecated: '⚠ 手動安裝已棄用。',
        manualInstallHint: '建議遷移到 Plugin Marketplace。',
        totalUniqueSkills: '唯一 Skills 總數',
        recommendation: '建議：遷移到 Plugin Marketplace',
        benefits: '好處：自動更新、更好的整合',
        migrateCommand: '遷移指令：'
      },

      // check command
      check: {
        title: '通用文件標準 - 檢查',
        // Basic status
        standardsInitialized: '✓ 標準已初始化',
        adoptionStatus: '採用狀態：',
        installed: '已安裝',
        // Update info
        updateAvailable: '⚠ 有可用更新：{current} → {latest}',
        runUpdate: '執行 `uds update` 進行更新。',
        // File integrity
        fileIntegrity: '檔案完整性：',
        hashNotAvailable: 'ℹ 無法取得 hash 資訊（舊版 manifest）。',
        checkingExistence: '僅檢查檔案是否存在...',
        unchanged: '未變更',
        modified: '已修改',
        missing: '遺失',
        existsNoHash: '存在，無 hash',
        summary: '摘要：{unchanged} 未變更，{modified} 已修改，{missing} 遺失',
        // Actions available
        actionsAvailable: '可用操作：',
        restoreOption: '• 執行 `uds check --restore` 還原所有已修改/遺失的檔案',
        diffOption: '• 執行 `uds check --diff` 檢視變更',
        interactiveOption: '• 執行 `uds check --interactive` 逐一處理檔案',
        // Interactive mode
        interactiveMode: '互動模式：',
        filesNeedAttention: '{count} 個檔案需要注意。',
        modifiedLabel: '已修改',
        missingLabel: '遺失',
        actionPrompt: '你想要做什麼？',
        actionView: 'view    - 檢視目前版本與原始版本的差異',
        actionRestore: 'restore - 還原為原始版本',
        actionKeep: 'keep    - 保留目前版本（更新 manifest 中的 hash）',
        actionSkip: 'skip    - 暫時跳過此檔案',
        actionRestoreMissing: 'restore - 下載並還原檔案',
        actionRemove: 'remove  - 從 manifest 移除（不再追蹤）',
        followUpPrompt: '你現在想要做什麼？',
        keepingCurrent: '✓ 保留目前版本。Hash 已更新。',
        removedFromManifest: '✓ 已從 manifest 移除。',
        skipped: '已跳過。',
        manifestUpdated: '✓ Manifest 已更新。',
        // Restore
        restoringFiles: '正在還原檔案...',
        restoredCount: '✓ 已還原 {count} 個檔案',
        restoreFailedCount: '✗ 無法還原 {count} 個檔案',
        manifestUpdatedShort: 'Manifest 已更新。',
        // File restore messages
        restored: '已還原',
        couldNotDetermineSource: '無法判斷來源',
        // Diff display
        couldNotReadFile: '無法讀取目前檔案。',
        couldNotDetermineSource2: '無法判斷原始來源路徑。',
        fetchingOriginal: '從 GitHub 取得原始檔案...',
        couldNotFetchOriginal: '無法取得原始內容。',
        diffOriginal: '--- 原始',
        diffCurrent: '+++ 目前',
        diffTruncated: '...（差異已截斷，僅顯示前 20 個變更）',
        diffFor: '差異：{file}',
        // Migration
        migratingToHash: '正在遷移到 hash 基礎完整性檢查...',
        migratedCount: '✓ 已遷移 {count} 個檔案到 hash 基礎追蹤',
        manifestUpgraded: 'Manifest 版本已升級到 3.1.0',
        // Tip for migration
        tip: '提示：',
        migrateTip: '執行 `uds check --migrate` 啟用 hash 基礎完整性檢查。',
        migrateTip2: '這將為所有現有檔案計算 hash。',
        // Skills status
        skillsStatus: 'Skills 狀態：',
        skillsViaMarketplace: '✓ Skills 已透過 Plugin Marketplace 安裝',
        skillsManaged: '由 Claude Code 外掛系統管理',
        skillsNotFileBased: '注意：Marketplace skills 不是基於檔案的',
        lastUpdated: '最後更新',
        skillsInstalled: '✓ Skills 已安裝',
        skillsGlobal: '全域：~/.claude/skills/',
        skillsProject: '專案：.claude/skills/',
        compatible: '相容',
        openCodeNote: '注意：OpenCode 自動偵測 .claude/skills/',
        considerMigrating: '⚠ 建議遷移到 Plugin Marketplace',
        marketplaceAutoUpdates: 'Marketplace 提供自動更新和更簡易的管理。',
        toMigrate: '遷移步驟：',
        skillsMarkedNotFound: '⚠ Skills 標記為已安裝但找不到',
        recommendedInstall: '建議：透過 Plugin Marketplace 安裝',
        skillsNotInstalled: 'Skills 未安裝（僅使用參考文件）',
        // Coverage
        coverageSummary: '覆蓋率摘要：',
        levelRequires: '等級 {level} 需要 {count} 項標準：',
        withSkills: '{count} 項有 Skills（互動式 AI 輔助）',
        referenceDocs: '{count} 項參考文件',
        yourCoverage: '你的覆蓋率：',
        viaSkills: '{count} 項透過 Skills',
        viaDocs: '{count} 項透過複製的文件',
        // AI tool integration
        aiToolIntegration: 'AI 工具整合狀態：',
        fileNotFound: '找不到檔案',
        couldNotRead: '無法讀取檔案',
        standardsIndexPresent: '標準索引存在',
        standardsReferenced: '{count}/{total} 項標準已參考',
        missingStandardsList: '缺少：{list}',
        usingMinimalMode: '使用最小模式（無標準索引）',
        coreRulesEmbedded: '核心規則已嵌入',
        noAiToolFiles: '未設定 AI 工具整合檔案。',
        toFixIntegration: '修復整合問題：',
        runUpdateToSync: '• 執行 `uds update` 同步所有整合檔案',
        runConfigureTools: '• 執行 `uds configure --type ai_tools` 管理 AI 工具',
        // Reference sync
        refSyncStatus: '參考同步狀態：',
        noRefsFound: '找不到標準參考',
        refsNotInManifest: '未在 manifest 中的參考：',
        standardsNotReferenced: '未參考的標準（選用）：',
        refsInSync: '{path}：參考已同步（{count} 個參考）',
        noIntegrationRefs: '找不到有標準參考的整合檔案。',
        runSyncRefs: '執行 `uds update --sync-refs` 修復參考問題。',
        // CLI update
        checkingCliUpdates: '正在檢查 CLI 更新...',
        couldNotCheckUpdates: 'ℹ 無法檢查 CLI 更新（離線模式）',
        cliUpdateAvailable: 'CLI 有可用更新：',
        currentCli: '目前 CLI',
        latestOnNpm: 'npm 最新版本',
        latestStable: '最新穩定版',
        runNpmUpdate: '執行：npm update -g universal-dev-standards',
        // Final status
        projectCompliant: '✓ 專案符合標準',
        issuesDetected: '⚠ 偵測到一些問題。請檢視上方詳情。',
        // Installation prompts
        offerSkillsInstallation: 'Skills 安裝',
        offerCommandsInstallation: '斜線命令安裝',
        selectSkillsToInstall: '選擇要安裝 Skills 的 AI 工具：',
        selectCommandsToInstall: '選擇要安裝斜線命令的 AI 工具：',
        skipInstallation: '跳過',
        skillsInstalledSuccess: '已為 {count} 個 AI 工具安裝 Skills',
        commandsInstalledSuccess: '已為 {count} 個 AI 工具安裝斜線命令',
        // Read-only hint
        missingSkillsHint: '提示：執行 `uds update` 安裝缺少的 Skills/斜線命令',
        // Summary mode (--summary)
        summary_mode: {
          title: 'UDS 狀態摘要',
          notInitialized: '尚未初始化',
          manifestError: 'Manifest 錯誤',
          version: '版本',
          level: '等級',
          files: '檔案',
          skills: 'Skills',
          commands: '斜線命令'
        }
      },

      // init command (commands/init.js)
      init: {
        title: '通用開發標準 - 初始化',
        alreadyInitialized: '⚠ 此專案已初始化標準。',
        useUpdateOrDelete: '使用 `uds update` 更新，或刪除 .standards/ 重新初始化。',
        // Detection
        detectingProject: '正在偵測專案特性...',
        analysisComplete: '專案分析完成',
        languages: '程式語言',
        frameworks: '框架',
        aiTools: 'AI 工具',
        // Skills status
        skillsStatus: 'Skills 狀態：',
        projectLevel: '專案層級',
        userLevel: '使用者層級',
        notInstalled: '未安裝',
        noSkillsDetected: '未偵測到 Skills 安裝',
        skillsMarketplaceInstalled: 'Marketplace',
        // No AI tools selected - exit
        noAiToolsSelected: '未選擇任何 AI 工具。',
        noAiToolsExplanation: '  UDS 為 AI 程式開發助手提供開發標準。',
        noAiToolsExplanation2: '  沒有選擇 AI 工具，就沒有需要安裝的內容。',
        // Integration
        integrationConfig: '整合設定：',
        sharedRuleConfig: '所有選取的工具將共用相同的規則設定。',
        // Config summary
        configSummary: '設定摘要：',
        standardsScope: '標準範圍',
        standardsScopeLean: '精簡（Skills 處理其餘）',
        standardsScopeComplete: '完整',
        contentModeLabel: '內容模式',
        contentModeFull: '完整嵌入',
        contentModeIndex: '標準（推薦）',
        contentModeMinimal: '最小（僅核心）',
        displayLanguageLabel: '顯示語言',
        integrations: '整合',
        skillsLabel: 'Skills',
        skillsMarketplace: 'Plugin Marketplace（由 Claude Code 管理）',
        skillsInstallTo: '安裝/更新到 {location}',
        skillsUsingExisting: '使用現有（{location}）',
        gitWorkflow: 'Git 工作流程',
        mergeStrategy: '合併策略',
        commitLanguage: '提交訊息語言',
        testLevels: '測試層級',
        // Prompts
        proceedInstall: '繼續安裝？',
        installCancelled: '安裝已取消。',
        // Spinners
        copyingStandards: '複製標準中...',
        copiedStandards: '已複製 {count} 個標準檔案',
        copyingExtensions: '複製延伸套件中...',
        copiedExtensions: '已複製 {count} 個延伸套件檔案',
        generatingIntegrations: '產生整合檔案中...',
        generatedIntegrations: '已產生 {count} 個整合檔案',
        generatingClaudeMd: '產生 CLAUDE.md 中...',
        generatedClaudeMd: '已產生 CLAUDE.md',
        couldNotGenerateClaudeMd: '無法產生 CLAUDE.md',
        installingSkills: '安裝 Claude Code Skills 中...',
        installedSkills: '已安裝 {count} 個 Skills 到 {locations}',
        installedSkillsWithErrors: '已安裝 {count} 個 Skills，有 {errors} 個錯誤',
        // Success
        initializedSuccess: '✓ 標準初始化成功！',
        filesCopied: '已複製 {count} 個檔案到專案',
        skillsUsingMarketplace: 'Skills：使用 Plugin Marketplace 安裝',
        skillsInstalledTo: '已安裝 {count} 個 Skills 到 {locations}',
        manifestCreated: 'Manifest 已建立於 .standards/manifest.json',
        errorsOccurred: '⚠ 發生 {count} 個錯誤：',
        // Next steps
        nextSteps: '後續步驟：',
        reviewDirectory: '1. 檢視 .standards/ 目錄',
        addToVcs: '2. 將 .standards/ 加入版本控制',
        restartAgent: '3. 重新啟動 {tools} 以載入新 Skills',
        runCheck: '執行 `uds check` 驗證採用狀態'
      },

      // update command
      update: {
        title: '通用文件標準 - 更新',
        // CLI update
        cliUpdateAvailable: '⚡ 有新的 CLI 版本可用！',
        bundledVersion: '你的內建版本',
        latestOnNpm: 'npm 最新版本',
        whatToDo: '你想要怎麼做？',
        updateCliFirst: '先更新 CLI（推薦）',
        continueWithCurrent: '繼續使用目前的 CLI',
        cancel: '取消',
        operationCancelled: '操作已取消。',
        updatingCli: '更新 CLI 中...',
        cliUpdated: 'CLI 更新成功！',
        rerunUpdate: '✓ 請再次執行 `uds update` 來更新標準。',
        cliUpdateFailed: 'CLI 更新失敗',
        permissionIssue: '這可能是權限問題。',
        tryManually: '嘗試手動使用 sudo：',
        // Version info
        currentVersion: '目前版本',
        latestVersion: '最新版本',
        upToDate: '✓ 標準已是最新版本。',
        newerVersion: '（你的版本比登錄庫更新：{version}）',
        updateAvailable: '有可用更新：{current} → {latest}',
        // Files
        filesToUpdate: '要更新的檔案：',
        // Confirmation
        confirmUpdate: '確定要更新嗎？這將覆寫現有檔案。',
        updateCancelled: '更新已取消。',
        // Spinners
        updatingStandards: '更新標準中...',
        updatedStandards: '已更新 {count} 個標準檔案',
        syncingIntegrations: '同步整合檔案中...',
        syncedIntegrations: '已同步 {count} 個整合檔案',
        // Success
        updateSuccess: '✓ 標準更新成功！',
        versionUpdated: '版本：{current} → {latest}',
        integrationsSynced: '已同步整合檔案：{count}',
        errorsOccurred: '⚠ {count} 個檔案無法更新：',
        // Skills update
        skillsUpdateAvailable: 'Skills 有可用更新：',
        skillsCurrent: '目前',
        skillsLatest: '最新',
        updateViaMarketplace: '透過 Plugin Marketplace 更新：',
        autoUpdate: '自動更新：重新啟動 Claude Code（啟動時更新）',
        manualUpdate: '手動：執行 /plugin marketplace update anthropic-agent-skills',
        manualInstallDeprecated: '⚠️  手動安裝已棄用',
        recommendedMigrate: '建議：遷移到 Plugin Marketplace',
        orUpdateManually: '或手動更新：',
        // Integrations only
        updatingIntegrationsOnly: '僅更新整合檔案中...',
        noAiToolsConfigured: '⚠ manifest 中未設定任何 AI 工具。',
        runConfigure: '執行 `uds configure` 來新增 AI 工具。',
        regeneratingIntegrations: '重新產生整合檔案中...',
        regeneratedIntegrations: '已重新產生 {count} 個整合檔案',
        integrationsSuccess: '✓ 整合檔案更新成功！',
        filesUpdatedList: '已更新的檔案：{files}',
        integrationsErrors: '⚠ {count} 個錯誤：',
        // Sync refs
        syncingRefs: '同步整合參考中...',
        noIntegrationConfigs: '⚠ manifest 中找不到整合設定。',
        integrationConfigsRequired: '參考同步需要整合設定。',
        thisHappensWhen: '這會發生在：',
        oldVersion: '- 專案使用較舊版本的 UDS 初始化',
        manuallyCopied: '- 整合檔案是手動複製的，不是產生的',
        toFixThis: '要修復這個問題，你可以：',
        reinitialize: '1. 重新初始化專案：uds init（先刪除 .standards/）',
        manuallyUpdateFiles: '2. 手動更新整合檔案',
        expectedCategories: 'manifest.standards 的預期分類：',
        skipping: '跳過 {path}：找不到檔案',
        alreadyInSync: '{path}：已同步',
        unknownTool: '⚠ {path}：未知工具，跳過',
        updated: '✓ 已更新 {path}',
        categoriesChanged: '分類：{old} → {new}',
        failedToUpdate: '✗ 更新 {path} 失敗：{error}',
        updatedCount: '✓ 已更新 {count} 個整合檔案',
        skippedCount: '已跳過 {count} 個檔案（已同步或找不到）',
        // New features discovery
        newFeaturesAvailable: '發現新功能',
        newFeaturesAvailableHint: '提示：您的 AI 工具有新功能可用',
        skillsNotInstalledFor: '以下 AI 工具尚未安裝 Skills：',
        commandsNotInstalledFor: '以下 AI 工具尚未安裝斜線命令：',
        installSkillsNow: '是否要為這些 AI 工具安裝 Skills？',
        installCommandsNow: '是否要為這些 AI 工具安裝斜線命令？',
        selectSkillsToInstall: '選擇要安裝 Skills 的 AI 工具：',
        selectCommandsToInstall: '選擇要安裝斜線命令的 AI 工具：',
        skipSkillsInstallation: '跳過 Skills 安裝',
        skipCommandsInstallation: '跳過斜線命令安裝',
        skipValidationError: '選擇「跳過」時不能同時選擇其他選項',
        skillsLevelQuestion: 'Skills 要安裝到哪裡？',
        projectLevel: '專案層級',
        userLevel: '使用者層級',
        installingNewSkills: '安裝 Skills 中...',
        installingNewCommands: '安裝斜線命令中...',
        newSkillsInstalled: '已為 {count} 個 AI 工具安裝 Skills',
        newSkillsInstalledWithErrors: '安裝 Skills 時發生 {errors} 個錯誤',
        newCommandsInstalled: '已為 {count} 個 AI 工具安裝斜線命令',
        newCommandsInstalledWithErrors: '安裝斜線命令時發生 {errors} 個錯誤',
        // Outdated Skills/Commands
        skillsOutdatedFor: '以下 AI 工具有 Skills 更新：',
        commandsOutdatedFor: '以下 AI 工具有斜線命令更新：',
        selectSkillsToUpdate: '選擇要更新 Skills 的 AI 工具：',
        selectCommandsToUpdate: '選擇要更新斜線命令的 AI 工具：',
        skipSkillsUpdate: '跳過 Skills 更新',
        skipCommandsUpdate: '跳過斜線命令更新',
        updatingSkills: '更新 Skills 中...',
        skillsUpdated: '已為 {count} 個 AI 工具更新 Skills',
        skillsUpdatedWithErrors: '更新 Skills 時發生 {errors} 個錯誤',
        updatingCommands: '更新斜線命令中...',
        commandsUpdated: '已為 {count} 個 AI 工具更新斜線命令',
        commandsUpdatedWithErrors: '更新斜線命令時發生 {errors} 個錯誤',
        // Marketplace detection
        alreadyViaMarketplace: '已透過 Marketplace 安裝',
        marketplaceCoexistNote: '注意：檔案安裝將與 Marketplace 版本並存'
      },

      // configure command
      configure: {
        title: '通用開發標準 - 設定',
        currentConfig: '目前設定：',
        selectOption: '你想要設定什麼？',
        // Menu options
        optionFormat: '格式（AI/Human）',
        optionWorkflow: 'Git 工作流程策略',
        optionMergeStrategy: '合併策略',
        optionCommitLanguage: '提交訊息語言',
        optionTestLevels: '測試層級',
        optionAITools: 'AI 工具 - 新增/移除 AI 整合',
        optionLevel: '採用等級 - 變更等級 1/2/3',
        optionContentMode: '內容模式 - 變更 full/index/minimal',
        optionMethodology: '方法論 - 變更開發方法論',
        optionAll: '全部選項',
        experimental: '[實驗性]',
        // Labels
        gitWorkflow: 'Git 工作流程',
        mergeStrategy: '合併策略',
        commitLanguage: '提交訊息語言',
        testLevels: '測試層級',
        // Spinners
        removingIntegrations: '移除整合檔案...',
        integrationsRemoved: '整合檔案已移除',
        updatingConfig: '更新設定...',
        configUpdated: '設定已更新',
        addingStandards: '為更高等級新增標準...',
        standardsAdded: '新標準已新增',
        regeneratingIntegrations: '重新產生整合檔案...',
        regeneratedIntegrations: '已重新產生 {count} 個整合檔案',
        // Messages
        removed: '已移除',
        couldNotRemove: '無法移除',
        noChanges: '未做任何變更。',
        newConfig: '新設定：',
        applyChanges: '套用這些變更？',
        configCancelled: '設定已取消。',
        configSuccess: '✓ 設定更新成功！',
        newOptionsCopied: '已複製 {count} 個選項/標準檔案',
        integrationsRegenerated: '已重新產生 {count} 個整合檔案',
        errorsOccurred: '⚠ 發生 {count} 個錯誤：',
        // Skills and Commands configuration
        optionSkills: 'Skills - 管理 Skills 安裝',
        optionCommands: '命令 - 管理斜線命令',
        noAiToolsConfigured: '未設定 AI 工具',
        addAiToolsFirst: '請先新增 AI 工具：uds configure --type ai_tools',
        currentSkillsStatus: '目前 Skills 狀態：',
        currentCommandsStatus: '目前命令狀態：',
        notInstalled: '未安裝',
        skillsAction: '你想對 Skills 做什麼？',
        commandsAction: '你想對命令做什麼？',
        installSkills: '安裝/更新 Skills',
        installCommands: '安裝/更新命令',
        viewStatus: '僅檢視狀態',
        installingSkills: '安裝 Skills 中...',
        installingCommands: '安裝命令中...',
        skillsInstallSuccess: 'Skills 安裝成功',
        skillsInstallPartial: 'Skills 安裝但有部分問題',
        commandsInstallSuccess: '命令安裝成功',
        commandsInstallPartial: '命令安裝但有部分問題',
        totalInstalled: '總共安裝',
        errors: '錯誤',
        noCommandSupportedTools: '未設定支援命令的 AI 工具',
        commandSupportedList: '支援命令的工具：OpenCode、Copilot、Roo Code、Gemini CLI',
        commandsInstalled: '個命令',
        // Smart apply
        applyChangesNow: '是否立即套用變更？（重新產生整合檔案）',
        runUpdateLater: '稍後執行 `uds update --integrations-only` 以套用變更',
        applyingChanges: '正在套用變更...',
        changesApplied: '變更套用成功',
        // Declined features
        previouslyDeclined: '先前已拒絕',
        reinstallDeclinedSkills: '重新安裝已拒絕的 Skills',
        reinstallDeclinedCommands: '重新安裝已拒絕的斜線命令',
        skillsLevelQuestion: 'Skills 要安裝到哪裡？',
        projectLevel: '專案層級',
        userLevel: '使用者層級',
        // Marketplace detection
        viaMarketplace: '透過 Marketplace',
        marketplaceOnly: '僅 Marketplace（無本機檔案）',
        marketplaceCoexistNote: '注意：檔案安裝將與 Marketplace 版本並存'
      }
    }
  },

  'zh-cn': {
    // Common labels
    recommended: '推荐',
    advanced: '高级',
    checkboxHint: '（空格选择、A 全选/取消、Enter 确认）',

    // Display Language (first prompt - uses bilingual format)
    displayLanguage: {
      title: '显示语言 / Display Language',
      description: '选择 CLI 消息和 AI Agent 指示的语言',
      question: '选择显示语言 / Select display language:',
      choices: {
        en: 'English',
        'zh-tw': '繁體中文 (Traditional Chinese)',
        'zh-cn': '简体中文 (Simplified Chinese)'
      },
      explanations: {
        en: '  → CLI messages and AI Agent instructions will be in English',
        'zh-tw': '  → CLI 訊息和 AI Agent 指示將使用繁體中文',
        'zh-cn': '  → CLI 消息和 AI Agent 指示将使用简体中文'
      }
    },

    // Content Mode
    contentMode: {
      title: 'Content Mode:',
      description: '控制 AI 工具配置文件中嵌入多少规范内容',
      description2: '这会影响 AI Agent 的执行行为和合规程度',
      question: '选择内容模式 / Select content mode:',
      choices: {
        index: '摘要 + 任务对照表，AI 知道何时读哪个规范',
        full: '完整嵌入所有规则，AI 立即可用但文件较大',
        minimal: '仅文件参考，适合搭配 Skills 使用'
      },
      explanations: {
        index: [
          '  → 包含规则摘要 + MUST/SHOULD 任务对照表',
          '  → AI 能判断"做什么任务时要读哪个规范"',
          '  → 平衡 Context 使用量和合规程度'
        ],
        full: [
          '  → 所有规则直接嵌入配置文件（文件约 10-15 KB）',
          '  → AI 无需额外读档，合规率最高',
          '  → 适合短期任务或需要严格遵循的项目'
        ],
        minimal: [
          '  → 仅包含 .standards/ 文件清单',
          '  → AI 需要主动读取规范文件',
          '  → 适合搭配 Skills（Skills 会提供实时指引）'
        ]
      }
    },

    // Adoption Level
    level: {
      title: 'Adoption Level:',
      description: '选择要采用的标准数量，等级越高涵盖越完整',
      question: '选择采用等级 / Select adoption level:',
      choices: {
        1: '提交规范、反幻觉、签入检查等 6 项核心',
        2: '加入测试、Git 流程、错误处理共 12 项',
        3: '含版本控制、日志、SDD 全部 16 项'
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
      description: '选择标准文件的格式，影响 AI 读取效率和人类可读性',
      question: '选择标准格式 / Select standards format:',
      choices: {
        ai: 'YAML 格式，token 少，AI 解析快',
        human: '完整 Markdown，含范例说明，适合团队学习',
        both: '两种都装，AI 用 YAML，人用 Markdown'
      },
      explanations: {
        ai: '  → 文件较小（约 50% token），AI 处理效率高',
        human: '  → 包含完整范例和说明，适合新成员学习规范',
        both: '  → 文件数量加倍，但兼顾 AI 效率和人类可读性'
      }
    },

    // Standards Scope
    scope: {
      title: 'Standards Installation:',
      description: '选择要安装多少标准文件到项目中',
      description2: '（已安装 Skills，可选择精简安装）',
      question: '选择安装范围 / Select installation scope:',
      choices: {
        minimal: '只装参考文档，Skills 实时提供任务导向指引',
        full: '安装所有标准文件，不仅只依赖 Skills'
      },
      explanations: {
        minimal: [
          '  → .standards/ 只包含参考文档（约 6 个文件）',
          '  → Skills 会在你执行任务时提供实时指引'
        ],
        full: [
          '  → .standards/ 包含全部标准（约 16 个文件）',
          '  → 即使 Skills 不可用也能查阅完整规范'
        ]
      }
    },

    // Git Workflow
    gitWorkflow: {
      title: 'Git Workflow:',
      description: '选择分支策略，影响团队协作和发布流程',
      question: '选择 Git 分支策略 / Select Git branching strategy:',
      choices: {
        'github-flow': '简单 PR 流程，适合持续部署',
        gitflow: 'develop/release 分支，适合定期发布',
        'trunk-based': '直接提交 main + feature flags，适合成熟 CI/CD'
      },
      details: {
        'github-flow': [
          '  → main + feature branches，通过 PR 合并',
          '  → 适合：小团队、持续部署、Web 应用'
        ],
        gitflow: [
          '  → main + develop + feature/release/hotfix branches',
          '  → 适合：大型项目、排程发布、需要多版本维护'
        ],
        'trunk-based': [
          '  → 主要在 main 开发，用 feature flags 控制功能',
          '  → 适合：成熟 CI/CD、高频部署、资深团队'
        ]
      }
    },

    // Merge Strategy
    mergeStrategy: {
      title: 'Merge Strategy:',
      description: '选择合并策略，影响 Git 历史记录的呈现方式',
      question: '选择合并策略 / Select merge strategy:',
      choices: {
        squash: '每个 PR 一个 commit，历史干净',
        'merge-commit': '保留完整分支历史，建立合并 commit',
        'rebase-ff': '线性历史，需要 rebase，进阶'
      },
      details: {
        squash: [
          '  ✓ 历史干净，容易回滚',
          '  ✗ 遗失分支中的个别 commit 细节'
        ],
        'merge-commit': [
          '  ✓ 保留完整开发历史，可追溯',
          '  ✗ 历史较复杂，有合并分岔'
        ],
        'rebase-ff': [
          '  ✓ 完全线性历史，最干净',
          '  ✗ 需要团队熟悉 rebase 操作'
        ]
      }
    },

    // Test Levels
    testLevels: {
      title: 'Test Coverage:',
      description: '选择要包含的测试层级（测试金字塔）',
      description2: '百分比为建议的覆盖率比例',
      question: '选择测试层级 / Select test levels:',
      choices: {
        unit: '测试个别函数，快速反馈',
        integration: '测试组件互动、API 调用',
        system: '测试完整系统行为',
        e2e: '测试使用者流程（透过 UI）'
      },
      pyramid: [
        '  测试金字塔 (Test Pyramid):',
        '        /\\         ← E2E (少量，慢)',
        '       /  \\        ← System',
        '      /----\\       ← Integration',
        '     /------\\      ← Unit (大量，快)'
      ]
    },

    // Content Mode Change (configure)
    contentModeChange: {
      currentMode: '目前模式:',
      warning: '变更 Content Mode 将重新生成所有 AI 工具配置文件',
      explanations: {
        index: '  → AI 会根据任务对照表判断何时读取规范',
        full: '  → 所有规则直接嵌入，AI 合规率最高',
        minimal: '  → AI 需主动读取规范，建议搭配 Skills'
      }
    },

    // AI Tools Selection
    aiTools: {
      title: 'AI 开发工具',
      description: '选择你在此项目中使用的 AI 编程助手',
      question: '你使用哪些 AI 工具？',
      separators: {
        dynamicSkills: '── 动态 Skills ──',
        staticRules: '── 静态规则文件 ──',
        agentsMd: '── AGENTS.md 工具 ──',
        gemini: '── Gemini 工具 ──'
      },
      choices: {
        claudeCode: '',
        none: '无 / 跳过'
      }
    },

    // Skills Installation Location
    skillsLocation: {
      title: 'Skills 安装位置:',
      description: '选择 Skills 的安装位置',
      descriptionWithTools: 'Skills 将支持:',
      question: 'Skills 要安装在哪里？/ Where should Skills be installed?',
      questionMulti: '选择要安装 Skills 的位置：',
      marketplaceWarning: 'Claude Code Skills 已通过 Marketplace 安装',
      coexistNote: '文件安装将与 Marketplace 版本并存',
      separatorFileInstall: '── 或选择文件安装位置 ──',
      validationNoMix: '选择「跳过」时不能同时选择其他选项',
      installCount: '将安装 Skills 到 {count} 个位置',
      choices: {
        marketplace: '自动更新、轻松管理版本',
        userLevel: '用户层级',
        projectLevel: '项目层级',
        user: '跨项目共享',
        project: '仅限此项目',
        none: '不安装 Skills'
      },
      explanations: {
        marketplace: '  → 新版本发布时自动更新\n  → 通过 Claude Code 插件系统轻松安装/移除\n  → 执行: /plugin install universal-dev-standards@asia-ostrich',
        user: '  → Skills 可在所有项目中使用',
        project: '  → 建议将 .claude/skills/ 加入 .gitignore',
        none: '  → 完整标准将复制到 .standards/'
      }
    },

    // Marketplace Installation Guide
    marketplaceInstall: {
      claudeCodeTip: 'Claude Code 可通过 Marketplace 安装：',
      guide: '请在 Claude Code 中执行以下指令：',
      note: '安装完成后，Skills 将自动加载并保持更新。',
      alreadyInstalled: 'Marketplace 插件已安装。',
      version: '版本'
    },

    // Commands Installation
    commandsInstallation: {
      title: '斜杠命令安装',
      description: '以下 AI Agent 支持斜杠命令：',
      question: '选择要安装斜杠命令的 AI Agent',
      questionMulti: '选择要安装斜杠命令的位置：',
      installCount: '将为 {count} 个 AI Agent 安装 15 个斜杠命令',
      validationNoMix: '无法同时选择「跳过」和其他选项',
      choices: {
        skip: '跳过（使用 Skills 替代）',
        userLevel: '用户级别',
        projectLevel: '项目级别'
      },
      explanations: {
        user: '  → 命令适用于您所有的项目',
        project: '  → 命令仅适用于此项目'
      }
    },

    // Commit Message Language
    commitLanguage: {
      title: 'Commit 消息语言:',
      description: '选择 commit 消息的语言',
      question: '选择 commit 消息语言 / Select commit message language:',
      choices: {
        english: '标准国际格式',
        chinese: '适合中文团队',
        bilingual: '英文和中文并用'
      },
      labels: {
        english: 'English',
        chinese: '简体中文',
        bilingual: '双语'
      }
    },

    // Command output messages
    commands: {
      // Common messages used across commands
      common: {
        notInitialized: '✗ 此项目尚未初始化标准。',
        runInit: '执行 `uds init` 进行初始化。',
        couldNotReadManifest: '✗ 无法读取 manifest 文件。',
        version: '版本',
        level: '等级',
        format: '格式',
        contentMode: '内容模式',
        aiTools: 'AI 工具',
        skills: 'Skills',
        methodology: '方法论',
        none: '无',
        yes: '是',
        no: '否',
        cancelled: '已取消',
        total: '总计',
        success: '成功',
        error: '错误',
        warning: '警告',
        tip: '提示'
      },

      // list command
      list: {
        title: '通用开发标准',
        errorLevelRange: '错误：等级必须是 1、2 或 3',
        showingLevel: '显示等级',
        errorUnknownCategory: '错误：未知类别',
        validCategories: '有效类别：skill, reference, extension, integration, template',
        category: '类别',
        appliesTo: '适用于',
        totalSummary: '项标准',
        withSkills: '含 Skills',
        referenceOnly: '仅参考',
        runInitHint: '执行 `uds init` 在项目中采用标准。',
        seeGuide: '参阅：https://github.com/AsiaOstrich/universal-dev-standards/blob/main/adoption/ADOPTION-GUIDE.md'
      },

      // init command
      init: {
        title: '通用开发标准 - 初始化',
        alreadyInitialized: '⚠ 此项目已初始化标准。',
        useUpdateOrDelete: '使用 `uds update` 更新，或删除 .standards/ 重新初始化。',
        // Detection
        detectingProject: '正在检测项目特性...',
        analysisComplete: '项目分析完成',
        languages: '编程语言',
        frameworks: '框架',
        aiTools: 'AI 工具',
        // Skills status
        skillsStatus: 'Skills 状态：',
        projectLevel: '项目级别',
        userLevel: '用户级别',
        notInstalled: '未安装',
        noSkillsDetected: '未检测到 Skills 安装',
        skillsMarketplaceInstalled: 'Marketplace',
        // No AI tools selected - exit
        noAiToolsSelected: '未选择任何 AI 工具。',
        noAiToolsExplanation: '  UDS 为 AI 编程助手提供开发标准。',
        noAiToolsExplanation2: '  没有选择 AI 工具，就没有需要安装的内容。',
        // Integration
        integrationConfig: '集成配置：',
        sharedRuleConfig: '所有选中的工具将共享相同的规则配置。',
        // Config summary
        configSummary: '配置摘要：',
        standardsScope: '标准范围',
        standardsScopeLean: '精简（Skills 处理其余）',
        standardsScopeComplete: '完整',
        contentModeLabel: '内容模式',
        contentModeFull: '完整嵌入',
        contentModeIndex: '标准（推荐）',
        contentModeMinimal: '最小（仅核心）',
        displayLanguageLabel: '显示语言',
        integrations: '集成',
        skillsLabel: 'Skills',
        skillsMarketplace: 'Plugin Marketplace（由 Claude Code 管理）',
        skillsInstallTo: '安装/更新到 {location}',
        skillsUsingExisting: '使用现有（{location}）',
        gitWorkflow: 'Git 工作流',
        mergeStrategy: '合并策略',
        commitLanguage: '提交消息语言',
        testLevels: '测试级别',
        // Prompts
        proceedInstall: '继续安装？',
        installCancelled: '安装已取消。',
        // Spinners
        copyingStandards: '正在复制标准...',
        copiedStandards: '已复制 {count} 个标准文件',
        copyingExtensions: '正在复制扩展...',
        copiedExtensions: '已复制 {count} 个扩展文件',
        generatingIntegrations: '正在生成集成文件...',
        generatedIntegrations: '已生成 {count} 个集成文件',
        generatingClaudeMd: '正在生成 CLAUDE.md...',
        generatedClaudeMd: '已生成 CLAUDE.md',
        couldNotGenerateClaudeMd: '无法生成 CLAUDE.md',
        installingSkills: '正在安装 Claude Code Skills...',
        installedSkills: '已安装 {count} 个 Skills 到 {locations}',
        installedSkillsWithErrors: '已安装 {count} 个 Skills，有 {errors} 个错误',
        // Success
        initializedSuccess: '✓ 标准初始化成功！',
        filesCopied: '已复制 {count} 个文件到项目',
        skillsUsingMarketplace: 'Skills：使用 Plugin Marketplace 安装',
        skillsInstalledTo: '已安装 {count} 个 Skills 到 {locations}',
        manifestCreated: 'Manifest 已创建于 .standards/manifest.json',
        errorsOccurred: '⚠ 发生 {count} 个错误：',
        // Next steps
        nextSteps: '后续步骤：',
        reviewDirectory: '1. 查看 .standards/ 目录',
        addToVcs: '2. 将 .standards/ 添加到版本控制',
        restartAgent: '3. 重启 {tools} 以加载新 Skills',
        runCheck: '执行 `uds check` 验证采用状态'
      },

      // skills command
      skills: {
        title: '通用开发标准 - 已安装的 Skills',
        noSkillsInstalled: '未安装任何通用开发标准 Skills。',
        installViaMarketplace: '通过 Plugin Marketplace 安装：',
        orManually: '或手动安装：',
        recommended: '（推荐）',
        legacyMarketplaceWarning: '⚠ 检测到旧版 marketplace。',
        legacyMarketplaceHint: '建议升级到 Plugin Marketplace 获得自动更新。',
        manualInstallDeprecated: '⚠ 手动安装已弃用。',
        manualInstallHint: '建议迁移到 Plugin Marketplace。',
        totalUniqueSkills: '唯一 Skills 总数',
        recommendation: '建议：迁移到 Plugin Marketplace',
        benefits: '好处：自动更新、更好的集成',
        migrateCommand: '迁移指令：'
      },

      // check command
      check: {
        title: '通用文档标准 - 检查',
        // Basic status
        standardsInitialized: '✓ 标准已初始化',
        adoptionStatus: '采用状态：',
        installed: '已安装',
        // Update info
        updateAvailable: '⚠ 有可用更新：{current} → {latest}',
        runUpdate: '执行 `uds update` 进行更新。',
        // File integrity
        fileIntegrity: '文件完整性：',
        hashNotAvailable: 'ℹ 哈希信息不可用（旧版 manifest）。',
        checkingExistence: '仅检查文件存在性...',
        unchanged: '未更改',
        modified: '已修改',
        missing: '缺失',
        existsNoHash: '存在，无哈希',
        summary: '摘要：{unchanged} 未更改，{modified} 已修改，{missing} 缺失',
        // Actions available
        actionsAvailable: '可用操作：',
        restoreOption: '• 执行 `uds check --restore` 恢复所有已修改/缺失文件',
        diffOption: '• 执行 `uds check --diff` 查看更改',
        interactiveOption: '• 执行 `uds check --interactive` 逐文件决策',
        // Interactive mode
        interactiveMode: '交互模式：',
        filesNeedAttention: '{count} 个文件需要关注。',
        modifiedLabel: '已修改',
        missingLabel: '缺失',
        actionPrompt: '您想要做什么？',
        actionView: '查看    - 查看当前和原始文件之间的差异',
        actionRestore: '恢复   - 恢复到原始版本',
        actionKeep: '保留    - 保留当前版本（更新 manifest 中的哈希）',
        actionSkip: '跳过    - 暂时跳过此文件',
        actionRestoreMissing: '恢复   - 下载并恢复文件',
        actionRemove: '移除    - 从 manifest 中移除（不再跟踪）',
        followUpPrompt: '您现在想要做什么？',
        keepingCurrent: '✓ 保留当前版本。哈希已更新。',
        removedFromManifest: '✓ 已从 manifest 中移除。',
        skipped: '已跳过。',
        manifestUpdated: '✓ Manifest 已更新。',
        // Restore
        restoringFiles: '正在恢复文件...',
        restoredCount: '✓ 已恢复 {count} 个文件',
        restoreFailedCount: '✗ 恢复 {count} 个文件失败',
        manifestUpdatedShort: 'Manifest 已更新。',
        // File restore messages
        restored: '已恢复',
        couldNotDetermineSource: '无法确定源',
        // Diff display
        couldNotReadFile: '无法读取当前文件。',
        couldNotDetermineSource2: '无法确定原始源路径。',
        fetchingOriginal: '从 GitHub 获取原始文件...',
        couldNotFetchOriginal: '无法获取原始内容。',
        diffOriginal: '--- 原始',
        diffCurrent: '+++ 当前',
        diffTruncated: '...（差异已截断，显示前 20 处更改）',
        diffFor: '差异文件：{file}',
        // Migration
        migratingToHash: '迁移到基于哈希的完整性检查...',
        migratedCount: '✓ 已迁移 {count} 个文件到基于哈希的跟踪',
        manifestUpgraded: 'Manifest 版本已升级到 3.1.0',
        // Tip for migration
        tip: '提示：',
        migrateTip: '执行 `uds check --migrate` 启用基于哈希的完整性检查。',
        migrateTip2: '这将为所有现有文件计算哈希。',
        // Skills status
        skillsStatus: 'Skills 状态：',
        skillsViaMarketplace: '✓ Skills 通过 Plugin Marketplace 安装',
        skillsManaged: '由 Claude Code 插件系统管理',
        skillsNotFileBased: '注意：Marketplace skills 不是基于文件的',
        lastUpdated: '最后更新',
        skillsInstalled: '✓ Skills 已安装',
        skillsGlobal: '全局：~/.claude/skills/',
        skillsProject: '项目：.claude/skills/',
        compatible: '兼容',
        openCodeNote: '注意：OpenCode 自动检测 .claude/skills/',
        considerMigrating: '⚠ 考虑迁移到 Plugin Marketplace',
        marketplaceAutoUpdates: 'Marketplace 提供自动更新和更简便的管理。',
        toMigrate: '要迁移：',
        skillsMarkedNotFound: '⚠ Skills 标记为已安装但未找到',
        recommendedInstall: '建议：通过 Plugin Marketplace 安装',
        skillsNotInstalled: 'Skills 未安装（仅使用参考文档）',
        // Coverage
        coverageSummary: '覆盖率摘要：',
        levelRequires: '等级 {level} 需要 {count} 项标准：',
        withSkills: '{count} 项含 Skills（交互式 AI 协助）',
        referenceDocs: '{count} 项参考文档',
        yourCoverage: '您的覆盖率：',
        viaSkills: '{count} 项通过 Skills',
        viaDocs: '{count} 项通过复制文档',
        // AI tool integration
        aiToolIntegration: 'AI 工具集成状态：',
        fileNotFound: '文件未找到',
        couldNotRead: '无法读取文件',
        standardsIndexPresent: '标准索引存在',
        standardsReferenced: '已引用 {count}/{total} 项标准',
        missingStandardsList: '缺失：{list}',
        usingMinimalMode: '使用最小模式（无标准索引）',
        coreRulesEmbedded: '核心规则已嵌入',
        noAiToolFiles: '未配置 AI 工具集成文件。',
        toFixIntegration: '要修复集成问题：',
        runUpdateToSync: '• 执行 `uds update` 同步所有集成文件',
        runConfigureTools: '• 执行 `uds configure --type ai_tools` 管理 AI 工具',
        // Reference sync
        refSyncStatus: '参考同步状态：',
        noRefsFound: '未找到标准引用',
        refsNotInManifest: 'manifest 中无引用：',
        standardsNotReferenced: '未引用的标准（可选）：',
        refsInSync: '{path}：引用已同步（{count} 个引用）',
        noIntegrationRefs: '未找到包含标准引用的集成文件。',
        runSyncRefs: '执行 `uds update --sync-refs` 修复引用问题。',
        // CLI update
        checkingCliUpdates: '检查 CLI 更新...',
        couldNotCheckUpdates: 'ℹ 无法检查 CLI 更新（离线模式）',
        cliUpdateAvailable: 'CLI 更新可用：',
        currentCli: '当前 CLI',
        latestOnNpm: 'npm 最新版本',
        latestStable: '最新稳定版',
        runNpmUpdate: '执行：npm update -g universal-dev-standards',
        // Final status
        projectCompliant: '✓ 项目符合标准',
        issuesDetected: '⚠ 检测到一些问题。详情请查看上文。',
        // Installation prompts
        offerSkillsInstallation: 'Skills 安装',
        offerCommandsInstallation: '斜线命令安装',
        selectSkillsToInstall: '选择要安装 Skills 的 AI 工具：',
        selectCommandsToInstall: '选择要安装斜线命令的 AI 工具：',
        skipInstallation: '跳过',
        skillsInstalledSuccess: '已为 {count} 个 AI 工具安装 Skills',
        commandsInstalledSuccess: '已为 {count} 个 AI 工具安装斜线命令',
        // Read-only hint
        missingSkillsHint: '提示：执行 `uds update` 安装缺少的 Skills/斜线命令',
        // Summary mode (--summary)
        summary_mode: {
          title: 'UDS 状态摘要',
          notInitialized: '尚未初始化',
          manifestError: 'Manifest 错误',
          version: '版本',
          level: '等级',
          files: '文件',
          skills: 'Skills',
          commands: '斜线命令'
        }
      },

      // update command
      update: {
        title: '通用文档标准 - 更新',
        // CLI update
        cliUpdateAvailable: '⚡ 新 CLI 版本可用！',
        bundledVersion: '您的捆绑版本',
        latestOnNpm: 'npm 最新版本',
        whatToDo: '您想要做什么？',
        updateCliFirst: '先更新 CLI（推荐）',
        continueWithCurrent: '继续使用当前 CLI',
        cancel: '取消',
        operationCancelled: '操作已取消。',
        updatingCli: '正在更新 CLI...',
        cliUpdated: 'CLI 更新成功！',
        rerunUpdate: '✓ 请再次运行 `uds update` 更新标准。',
        cliUpdateFailed: 'CLI 更新失败',
        permissionIssue: '这可能是由于权限问题。',
        tryManually: '请手动尝试：',
        // Version info
        currentVersion: '当前版本',
        latestVersion: '最新版本',
        upToDate: '✓ 标准是最新的。',
        newerVersion: '（您有比注册表更新的版本：{version}）',
        updateAvailable: '有可用更新：{current} → {latest}',
        // Files
        filesToUpdate: '要更新的文件：',
        // Confirmation
        confirmUpdate: '确认更新？这将覆盖现有文件。',
        updateCancelled: '更新已取消。',
        // Spinners
        updatingStandards: '正在更新标准...',
        updatedStandards: '已更新 {count} 个标准文件',
        syncingIntegrations: '正在同步集成文件...',
        syncedIntegrations: '已同步 {count} 个集成文件',
        // Success
        updateSuccess: '✓ 标准更新成功！',
        versionUpdated: '版本：{current} → {latest}',
        integrationsSynced: '集成文件已同步：{count}',
        errorsOccurred: '⚠ {count} 个文件无法更新：',
        // Skills update
        skillsUpdateAvailable: 'Skills 更新可用：',
        skillsCurrent: '当前',
        skillsLatest: '最新',
        updateViaMarketplace: '通过 Plugin Marketplace 更新：',
        autoUpdate: '自动更新：重启 Claude Code（启动时更新）',
        manualUpdate: '手动：运行 /plugin marketplace update anthropic-agent-skills',
        manualInstallDeprecated: '⚠️  手动安装已弃用',
        recommendedMigrate: '建议：迁移到 Plugin Marketplace',
        orUpdateManually: '或手动更新：',
        // Integrations only
        updatingIntegrationsOnly: '仅更新集成文件...',
        noAiToolsConfigured: '⚠ manifest 中未配置 AI 工具。',
        runConfigure: '运行 `uds configure` 添加 AI 工具。',
        regeneratingIntegrations: '正在重新生成集成文件...',
        regeneratedIntegrations: '已重新生成 {count} 个集成文件',
        integrationsSuccess: '✓ 集成文件更新成功！',
        filesUpdatedList: '已更新文件：{files}',
        integrationsErrors: '⚠ {count} 个错误：',
        // Sync refs
        syncingRefs: '正在同步集成引用...',
        noIntegrationConfigs: '⚠ manifest 中未找到集成配置。',
        integrationConfigsRequired: '引用同步需要集成配置。',
        thisHappensWhen: '发生这种情况时：',
        oldVersion: '- 项目使用旧版 UDS 初始化',
        manuallyCopied: '- 集成文件是手动复制，不是生成的',
        toFixThis: '要修复此问题，您可以：',
        reinitialize: '1. 重新初始化项目：uds init（先删除 .standards/）',
        manuallyUpdateFiles: '2. 手动更新集成文件',
        expectedCategories: 'manifest.standards 的预期类别：',
        skipping: '跳过 {path}：文件未找到',
        alreadyInSync: '{path}：已同步',
        unknownTool: '⚠ {path}：未知工具，跳过',
        updated: '✓ 已更新 {path}',
        categoriesChanged: '类别：{old} → {new}',
        failedToUpdate: '✗ 更新 {path} 失败：{error}',
        updatedCount: '✓ 已更新 {count} 个集成文件',
        skippedCount: '跳过 {count} 个文件（已同步或未找到）',
        // New features discovery
        newFeaturesAvailable: '发现新功能',
        newFeaturesAvailableHint: '提示：您的 AI 工具有新功能可用',
        skillsNotInstalledFor: '以下 AI 工具尚未安装 Skills：',
        commandsNotInstalledFor: '以下 AI 工具尚未安装斜线命令：',
        installSkillsNow: '是否要为这些 AI 工具安装 Skills？',
        installCommandsNow: '是否要为这些 AI 工具安装斜线命令？',
        selectSkillsToInstall: '选择要安装 Skills 的 AI 工具：',
        selectCommandsToInstall: '选择要安装斜线命令的 AI 工具：',
        skipSkillsInstallation: '跳过 Skills 安装',
        skipCommandsInstallation: '跳过斜线命令安装',
        skipValidationError: '选择「跳过」时不能同时选择其他选项',
        skillsLevelQuestion: 'Skills 要安装到哪里？',
        projectLevel: '项目级别',
        userLevel: '用户级别',
        installingNewSkills: '正在安装 Skills...',
        installingNewCommands: '正在安装斜线命令...',
        newSkillsInstalled: '已为 {count} 个 AI 工具安装 Skills',
        newSkillsInstalledWithErrors: '安装 Skills 时发生 {errors} 个错误',
        newCommandsInstalled: '已为 {count} 个 AI 工具安装斜线命令',
        newCommandsInstalledWithErrors: '安装斜线命令时发生 {errors} 个错误',
        // Outdated Skills/Commands
        skillsOutdatedFor: '以下 AI 工具有 Skills 更新：',
        commandsOutdatedFor: '以下 AI 工具有斜线命令更新：',
        selectSkillsToUpdate: '选择要更新 Skills 的 AI 工具：',
        selectCommandsToUpdate: '选择要更新斜线命令的 AI 工具：',
        skipSkillsUpdate: '跳过 Skills 更新',
        skipCommandsUpdate: '跳过斜线命令更新',
        updatingSkills: '正在更新 Skills...',
        skillsUpdated: '已为 {count} 个 AI 工具更新 Skills',
        skillsUpdatedWithErrors: '更新 Skills 时发生 {errors} 个错误',
        updatingCommands: '正在更新斜线命令...',
        commandsUpdated: '已为 {count} 个 AI 工具更新斜线命令',
        commandsUpdatedWithErrors: '更新斜线命令时发生 {errors} 个错误',
        // Marketplace detection
        alreadyViaMarketplace: '已通过 Marketplace 安装',
        marketplaceCoexistNote: '注意：文件安装将与 Marketplace 版本并存'
      },

      // configure command
      configure: {
        title: '通用开发标准 - 配置',
        currentConfig: '当前配置：',
        selectOption: '您想要配置什么？',
        // Menu options
        optionFormat: '格式（AI/人工）',
        optionWorkflow: 'Git 工作流策略',
        optionMergeStrategy: '合并策略',
        optionCommitLanguage: 'Commit 消息语言',
        optionTestLevels: '测试级别',
        optionAITools: 'AI 工具 - 添加/删除 AI 集成',
        optionLevel: '采用级别 - 更改级别 1/2/3',
        optionContentMode: '内容模式 - 更改 full/index/minimal',
        optionMethodology: '方法论 - 更改开发方法论',
        optionAll: '所有选项',
        experimental: '[实验性]',
        // Labels
        gitWorkflow: 'Git 工作流',
        mergeStrategy: '合并策略',
        commitLanguage: 'Commit 消息语言',
        testLevels: '测试级别',
        // Spinners
        removingIntegrations: '正在移除集成文件...',
        integrationsRemoved: '集成文件已移除',
        updatingConfig: '正在更新配置...',
        configUpdated: '配置已更新',
        addingStandards: '正在为更高级别添加新标准...',
        standardsAdded: '新标准已添加',
        regeneratingIntegrations: '正在重新生成集成文件...',
        regeneratedIntegrations: '已重新生成 {count} 个集成文件',
        // Messages
        removed: '已移除',
        couldNotRemove: '无法移除',
        noChanges: '未进行更改。',
        newConfig: '新配置：',
        applyChanges: '应用这些更改？',
        configCancelled: '配置已取消。',
        configSuccess: '✓ 配置更新成功！',
        newOptionsCopied: '已复制 {count} 个新选项/标准文件',
        integrationsRegenerated: '已重新生成 {count} 个集成文件',
        errorsOccurred: '⚠ 发生 {count} 个错误：',
        // Skills and Commands configuration
        optionSkills: 'Skills - 管理 Skills 安装',
        optionCommands: '命令 - 管理斜杠命令',
        noAiToolsConfigured: '未配置 AI 工具',
        addAiToolsFirst: '请先添加 AI 工具：uds configure --type ai_tools',
        currentSkillsStatus: '当前 Skills 状态：',
        currentCommandsStatus: '当前命令状态：',
        notInstalled: '未安装',
        skillsAction: '您想对 Skills 做什么？',
        commandsAction: '您想对命令做什么？',
        installSkills: '安装/更新 Skills',
        installCommands: '安装/更新命令',
        viewStatus: '仅查看状态',
        installingSkills: '正在安装 Skills...',
        installingCommands: '正在安装命令...',
        skillsInstallSuccess: 'Skills 安装成功',
        skillsInstallPartial: 'Skills 安装但有部分问题',
        commandsInstallSuccess: '命令安装成功',
        commandsInstallPartial: '命令安装但有部分问题',
        totalInstalled: '总共安装',
        errors: '错误',
        noCommandSupportedTools: '未配置支持命令的 AI 工具',
        commandSupportedList: '支持命令的工具：OpenCode、Copilot、Roo Code、Gemini CLI',
        commandsInstalled: '个命令',
        // Smart apply
        applyChangesNow: '是否立即应用变更？（重新生成集成文件）',
        runUpdateLater: '稍后执行 `uds update --integrations-only` 以应用变更',
        applyingChanges: '正在应用变更...',
        changesApplied: '变更应用成功',
        // Declined features
        previouslyDeclined: '之前已拒绝',
        reinstallDeclinedSkills: '重新安装已拒绝的 Skills',
        reinstallDeclinedCommands: '重新安装已拒绝的斜杠命令',
        skillsLevelQuestion: 'Skills 要安装到哪里？',
        projectLevel: '项目级别',
        userLevel: '用户级别',
        // Marketplace detection
        viaMarketplace: '通过 Marketplace',
        marketplaceOnly: '仅 Marketplace（无本地文件）',
        marketplaceCoexistNote: '注意：文件安装将与 Marketplace 版本并存'
      }
    }
  }
};

// Current language setting (can be changed at runtime)
let currentLang = 'en';

// Track if language was explicitly set by user via --ui-lang flag
let languageExplicitlySet = false;

/**
 * Set the current UI language
 * @param {string} lang - Language code ('en', 'zh-tw' or 'zh-cn')
 */
export function setLanguage(lang) {
  if (messages[lang]) {
    currentLang = lang;
  } else {
    currentLang = 'en';
  }
}

/**
 * Set language explicitly (user provided --ui-lang flag)
 * This marks the language as explicitly set so it won't be overridden
 * @param {string} lang - Language code ('en', 'zh-tw' or 'zh-cn')
 */
export function setLanguageExplicit(lang) {
  setLanguage(lang);
  languageExplicitlySet = true;
}

/**
 * Check if language was explicitly set by user via --ui-lang flag
 * @returns {boolean} True if language was explicitly set
 */
export function isLanguageExplicitlySet() {
  return languageExplicitlySet;
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
  // If locale is explicitly set, use it
  if (locale === 'zh-tw') {
    return 'zh-tw';
  }
  if (locale === 'zh-cn') {
    return 'zh-cn';
  }

  // Check environment variables
  const envLang = process.env.LANG || process.env.LC_ALL || process.env.LC_MESSAGES || '';
  if (envLang.toLowerCase().includes('zh_tw') || envLang.toLowerCase().includes('zh-tw')) {
    return 'zh-tw';
  }
  if (envLang.toLowerCase().includes('zh_cn') || envLang.toLowerCase().includes('zh-cn')) {
    return 'zh-cn';
  }

  // Default to English
  return 'en';
}
