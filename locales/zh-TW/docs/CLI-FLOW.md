# CLI 指令流程

> **Language**: [English](../../../docs/CLI-FLOW.md) | 繁體中文 | [简体中文](../../zh-CN/docs/CLI-FLOW.md)

本文件呈現 Universal Development Standards (UDS) CLI 指令的互動流程圖。

## 1. 初始化指令 (`uds init`)

初始化流程用於在從未初始化的專案中設定標準。

```mermaid
flowchart TD
    Start([uds init]) --> CheckInit{已初始化?}
    CheckInit -- 是 --> WarnAndExit([結束])
    CheckInit -- 否 --> DetectProject[偵測專案技術與 AI 工具]
    DetectProject --> Step1[Q1: 選擇顯示語言]
    
    Step1 --> Step2[Q2: 選擇 AI 工具]
    Step2 --> CheckAITools{已選擇 AI 工具?}
    CheckAITools -- 否 --> ExitNoTools([結束])
    CheckAITools -- 是 --> CheckSkillsSupport{支援 Skills?}
    
    %% Skills & Commands Flow
    CheckSkillsSupport -- 否 --> Step6
    CheckSkillsSupport -- 是 --> Step4[Q3: Skills 安裝位置]
    Step4 --> CheckMarketplace{Marketplace?}
    CheckMarketplace -- 是 --> Step6
    CheckMarketplace -- 否 --> Step5[Q4: 斜線命令安裝位置]
    
    Step5 --> Step6[Q5: 標準安裝範圍]
    
    %% Standards Configuration
    Step6 --> Step7[Q6: 採用等級]
    Step7 --> Step8[Q7: 標準格式]
    Step8 --> Step9[Q8: 標準選項]
    
    %% Standard Options (Multi-select)
    Step9 -- 若選 Git 工作流程 --> Q_Git[Git 工作流程策略]
    Step9 -- 若選合併策略 --> Q_Merge[合併策略]
    Step9 -- 若選 Commit 語言 --> Q_Commit[Commit 語言]
    Step9 -- 若選測試層級 --> Q_Test[測試層級]
    
    Q_Git --> Step10
    Q_Merge --> Step10
    Q_Commit --> Step10
    Q_Test --> Step10
    Step9 -- 無 --> Step10
    
    %% Extensions
    Step10[Q9: 語言擴充] --> Step11[Q10: 框架擴充]
    
    %% Integration Configuration
    Step11 --> Step12[Q11: 整合設定]
    Step12 -- 預設 --> Step13
    Step12 -- 合併 --> Step13
    Step12 -- 自訂 --> CustomConfig[選擇類別 / 規則 / 排除]
    CustomConfig --> Step13
    
    Step13[Q12: 內容模式]
    
    %% Final
    Step13 --> DisplaySummary[顯示設定摘要]
    DisplaySummary --> Confirm{繼續?}
    Confirm -- 否 --> Cancelled([已取消])
    Confirm -- 是 --> Install[安裝檔案]
    Install --> Finish([完成])

    %% Styling
    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style Finish fill:#9f9,stroke:#333,stroke-width:2px
    style Step12 fill:#ff9,stroke:#333,stroke-width:2px
    style CustomConfig fill:#ff9,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

## 2. 更新指令 (`uds update`)

更新流程用於保持標準與整合檔案同步。

```mermaid
flowchart TD
    Start([uds update]) --> CheckInit{已初始化?}
    CheckInit -- 否 --> Error([錯誤：未初始化])
    
    CheckInit -- 是 --> CheckCLI[檢查 CLI 更新]
    CheckCLI --> UpdateAvail{CLI 有更新?}
    UpdateAvail -- 是 --> PromptCLI{先更新 CLI?}
    PromptCLI -- 是 --> RunNpmUpdate([npm update -g])
    PromptCLI -- 否 --> CheckStandards
    UpdateAvail -- 否 --> CheckStandards
    
    CheckStandards[檢查標準版本] --> UpdateStandards[更新 .standards/ 檔案]
    UpdateStandards --> CheckIntegrations[檢查整合檔案]
    
    CheckIntegrations --> Regenerate{需要重新產生?}
    Regenerate -- 是 --> GenIntegrations[重新產生設定檔]
    Regenerate -- 否 --> SyncRefs
    
    GenIntegrations --> SyncRefs[同步參考]
    
    SyncRefs --> CheckSkills[檢查 Skills 更新]
    CheckSkills --> SkillsAvail{Skills 有更新?}
    SkillsAvail -- 是 --> PromptSkills[提示：更新 Skills?]
    PromptSkills -- 是 --> InstallSkills[安裝/更新 Skills]
    PromptSkills -- 否 --> Finish
    SkillsAvail -- 否 --> Finish
    
    InstallSkills --> Finish([完成])

    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style Finish fill:#9f9,stroke:#333,stroke-width:2px
```

## 3. 檢查指令 (`uds check`)

檢查流程用於驗證檔案完整性與採用狀態。

```mermaid
flowchart TD
    Start([uds check]) --> CheckInit{已初始化?}
    CheckInit -- 否 --> Error([錯誤：未初始化])
    
    CheckInit -- 是 --> VerifyManifest[驗證 Manifest]
    VerifyManifest --> CheckHash{Hash 檢查}
    
    CheckHash -->|相符| Pass([通過])
    CheckHash -->|不符| DetectChanges[偵測 已修改/遺失]
    
    DetectChanges --> Interactive{互動模式?}
    Interactive -- 否 --> Report[報告問題]
    Report --> Fail([結束並顯示問題])
    
    Interactive -- 是 --> LoopFiles[迴圈處理每個檔案]
    LoopFiles --> PromptAction[提示：動作?]
    
    PromptAction -- 檢視 --> ShowDiff[顯示差異]
    ShowDiff --> PromptAction
    
    PromptAction -- 還原 --> RestoreFile[還原原始檔]
    PromptAction -- 保留 --> UpdateHash[更新 Hash (接受變更)]
    PromptAction -- 跳過 --> SkipFile[跳過]
    
    RestoreFile --> NextFile{還有檔案?}
    UpdateHash --> NextFile
    SkipFile --> NextFile
    
    NextFile -- 是 --> LoopFiles
    NextFile -- 否 --> Finish([完成])

    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style Finish fill:#9f9,stroke:#333,stroke-width:2px
    style Fail fill:#f99,stroke:#333,stroke-width:2px
```

## 4. 設定指令 (`uds configure`)

設定流程允許修改現有的設定。

```mermaid
flowchart TD
    Start([uds configure]) --> CheckInit{已初始化?}
    CheckInit -- 否 --> Error([錯誤：未初始化])
    
    CheckInit -- 是 --> SelectCategory[選擇設定類別]
    
    SelectCategory -- AI 工具 --> ConfigTools[新增/移除 AI 工具]
    SelectCategory -- 等級 --> ConfigLevel[變更採用等級]
    SelectCategory -- 格式 --> ConfigFormat[變更格式]
    SelectCategory -- 內容模式 --> ConfigMode[變更內容模式]
    SelectCategory -- 方法論 --> ConfigMethod[變更方法論]
    
    ConfigTools --> UpdateManifest[更新 Manifest]
    ConfigLevel --> AddStandards[複製新標準]
    ConfigFormat --> UpdateManifest
    ConfigMode --> UpdateManifest
    ConfigMethod --> UpdateManifest
    
    AddStandards --> UpdateManifest
    
    UpdateManifest --> Regenerate{重新產生整合檔?}
    Regenerate -- 是 --> GenFiles[重新產生設定檔]
    Regenerate -- 否 --> Finish
    
    GenFiles --> Finish([完成])

    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style Finish fill:#9f9,stroke:#333,stroke-width:2px
```
