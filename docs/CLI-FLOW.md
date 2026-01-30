# CLI Command Flows

This document visualizes the interactive flows for the Universal Development Standards (UDS) CLI commands.

## 1. Init Command (`uds init`)

The initialization flow sets up standards in a new project.

```mermaid
flowchart TD
    Start([uds init]) --> CheckInit{Already Initialized?}
    CheckInit -- Yes --> WarnAndExit([Exit])
    CheckInit -- No --> DetectProject[Detect Project Tech & AI Tools]
    DetectProject --> Step1[Q1: Select Display Language]
    
    Step1 --> Step2[Q2: Select AI Tools]
    Step2 --> CheckAITools{AI Tools Selected?}
    CheckAITools -- No --> ExitNoTools([Exit])
    CheckAITools -- Yes --> CheckSkillsSupport{Supports Skills?}
    
    %% Skills & Commands Flow
    CheckSkillsSupport -- No --> Step6
    CheckSkillsSupport -- Yes --> Step4[Q3: Skills Location]
    Step4 --> CheckMarketplace{Marketplace?}
    CheckMarketplace -- Yes --> Step6
    CheckMarketplace -- No --> Step5[Q4: Slash Commands Location]
    
    Step5 --> Step6[Q5: Standards Scope]
    
    %% Standards Configuration
    Step6 --> Step7[Q6: Adoption Level]
    Step7 --> Step8[Q7: Standards Format]
    Step8 --> Step9[Q8: Standard Options]
    
    %% Standard Options (Multi-select)
    Step9 -- If Git Workflow --> Q_Git[Git Workflow Strategy]
    Step9 -- If Merge Strategy --> Q_Merge[Merge Strategy]
    Step9 -- If Commit Lang --> Q_Commit[Commit Language]
    Step9 -- If Test Levels --> Q_Test[Test Levels]
    
    Q_Git --> Step10
    Q_Merge --> Step10
    Q_Commit --> Step10
    Q_Test --> Step10
    Step9 -- None --> Step10
    
    %% Extensions
    Step10[Q9: Language Extensions] --> Step11[Q10: Framework Extensions]
    
    %% Integration Configuration
    Step11 --> Step12[Q11: Integration Configuration]
    Step12 -- Default --> Step13
    Step12 -- Merge --> Step13
    Step12 -- Custom --> CustomConfig[Select Categories / Rules / Exclusions]
    CustomConfig --> Step13
    
    Step13[Q12: Content Mode]
    
    %% Final
    Step13 --> DisplaySummary[Display Configuration Summary]
    DisplaySummary --> Confirm{Proceed?}
    Confirm -- No --> Cancelled([Cancelled])
    Confirm -- Yes --> Install[Install Files]
    Install --> Finish([Done])

    %% Styling
    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style Finish fill:#9f9,stroke:#333,stroke-width:2px
    style Step12 fill:#ff9,stroke:#333,stroke-width:2px
    style CustomConfig fill:#ff9,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

## 2. Update Command (`uds update`)

The update flow keeps standards and integrations in sync.

```mermaid
flowchart TD
    Start([uds update]) --> CheckInit{Initialized?}
    CheckInit -- No --> Error([Error: Not Initialized])
    
    CheckInit -- Yes --> CheckCLI[Check CLI Update]
    CheckCLI --> UpdateAvail{CLI Update?}
    UpdateAvail -- Yes --> PromptCLI{Update CLI First?}
    PromptCLI -- Yes --> RunNpmUpdate([npm update -g])
    PromptCLI -- No --> CheckStandards
    UpdateAvail -- No --> CheckStandards
    
    CheckStandards[Check Standards Version] --> UpdateStandards[Update .standards/ Files]
    UpdateStandards --> CheckIntegrations[Check Integration Files]
    
    CheckIntegrations --> Regenerate{Regenerate Needed?}
    Regenerate -- Yes --> GenIntegrations[Regenerate Configs]
    Regenerate -- No --> SyncRefs
    
    GenIntegrations --> SyncRefs[Sync References]
    
    SyncRefs --> CheckSkills[Check Skills Updates]
    CheckSkills --> SkillsAvail{Skills Update?}
    SkillsAvail -- Yes --> PromptSkills[Prompt: Update Skills?]
    PromptSkills -- Yes --> InstallSkills[Install/Update Skills]
    PromptSkills -- No --> Finish
    SkillsAvail -- No --> Finish
    
    InstallSkills --> Finish([Done])

    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style Finish fill:#9f9,stroke:#333,stroke-width:2px
```

## 3. Check Command (`uds check`)

The check flow verifies file integrity and adoption status.

```mermaid
flowchart TD
    Start([uds check]) --> CheckInit{Initialized?}
    CheckInit -- No --> Error([Error: Not Initialized])
    
    CheckInit -- Yes --> VerifyManifest[Verify Manifest]
    VerifyManifest --> CheckHash{Hash Check}
    
    CheckHash -->|Match| Pass([Pass])
    CheckHash -->|Mismatch| DetectChanges[Detect Modified/Missing]
    
    DetectChanges --> Interactive{Interactive Mode?}
    Interactive -- No --> Report[Report Issues]
    Report --> Fail([Exit with Issues])
    
    Interactive -- Yes --> LoopFiles[Loop Each File]
    LoopFiles --> PromptAction[Prompt: Action?]
    
    PromptAction -- View --> ShowDiff[Show Diff]
    ShowDiff --> PromptAction
    
    PromptAction -- Restore --> RestoreFile[Restore Original]
    PromptAction -- Keep --> UpdateHash[Update Hash (Accept Change)]
    PromptAction -- Skip --> SkipFile[Skip]
    
    RestoreFile --> NextFile{More Files?}
    UpdateHash --> NextFile
    SkipFile --> NextFile
    
    NextFile -- Yes --> LoopFiles
    NextFile -- No --> Finish([Done])

    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style Finish fill:#9f9,stroke:#333,stroke-width:2px
    style Fail fill:#f99,stroke:#333,stroke-width:2px
```

## 4. Configure Command (`uds configure`)

The configure flow allows modifying existing settings.

```mermaid
flowchart TD
    Start([uds configure]) --> CheckInit{Initialized?}
    CheckInit -- No --> Error([Error: Not Initialized])
    
    CheckInit -- Yes --> SelectCategory[Select Configuration Category]
    
    SelectCategory -- AI Tools --> ConfigTools[Add/Remove AI Tools]
    SelectCategory -- Level --> ConfigLevel[Change Adoption Level]
    SelectCategory -- Format --> ConfigFormat[Change Format]
    SelectCategory -- Content Mode --> ConfigMode[Change Content Mode]
    SelectCategory -- Methodology --> ConfigMethod[Change Methodology]
    
    ConfigTools --> UpdateManifest[Update Manifest]
    ConfigLevel --> AddStandards[Copy New Standards]
    ConfigFormat --> UpdateManifest
    ConfigMode --> UpdateManifest
    ConfigMethod --> UpdateManifest
    
    AddStandards --> UpdateManifest
    
    UpdateManifest --> Regenerate{Regenerate Integrations?}
    Regenerate -- Yes --> GenFiles[Regenerate Config Files]
    Regenerate -- No --> Finish
    
    GenFiles --> Finish([Done])

    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style Finish fill:#9f9,stroke:#333,stroke-width:2px
```
