# CLI 命令流程

> **Language**: [English](../../../docs/CLI-FLOW.md) | [繁體中文](../../zh-TW/docs/CLI-FLOW.md) | 简体中文

本文档呈现 Universal Development Standards (UDS) CLI 命令的交互流程图。

## 1. 初始化命令 (`uds init`)

初始化流程用于在从未初始化的项目中设定标准。

```mermaid
flowchart TD
    Start([uds init]) --> CheckInit{已初始化?}
    CheckInit -- 是 --> WarnAndExit([结束])
    CheckInit -- 否 --> DetectProject[检测项目技术与 AI 工具]
    DetectProject --> Step1[Q1: 选择显示语言]
    
    Step1 --> Step2[Q2: 选择 AI 工具]
    Step2 --> CheckAITools{已选择 AI 工具?}
    CheckAITools -- 否 --> ExitNoTools([结束])
    CheckAITools -- 是 --> CheckSkillsSupport{支持 Skills?}
    
    %% Skills & Commands Flow
    CheckSkillsSupport -- 否 --> Step6
    CheckSkillsSupport -- 是 --> Step4[Q3: Skills 安装位置]
    Step4 --> CheckMarketplace{Marketplace?}
    CheckMarketplace -- 是 --> Step6
    CheckMarketplace -- 否 --> Step5[Q4: 斜杠命令安装位置]
    
    Step5 --> Step6[Q5: 标准安装范围]
    
    %% Standards Configuration
    Step6 --> Step7[Q6: 采用等级]
    Step7 --> Step8[Q7: 标准格式]
    Step8 --> Step9[Q8: 标准选项]
    
    %% Standard Options (Multi-select)
    Step9 -- 若选 Git 工作流 --> Q_Git[Git 工作流策略]
    Step9 -- 若选合并策略 --> Q_Merge[合并策略]
    Step9 -- 若选 Commit 语言 --> Q_Commit[Commit 语言]
    Step9 -- 若选测试级别 --> Q_Test[测试级别]
    
    Q_Git --> Step10
    Q_Merge --> Step10
    Q_Commit --> Step10
    Q_Test --> Step10
    Step9 -- 无 --> Step10
    
    %% Extensions
    Step10[Q9: 语言扩展] --> Step11[Q10: 框架扩展]
    
    %% Integration Configuration
    Step11 --> Step12[Q11: 集成配置]
    Step12 -- 默认 --> Step13
    Step12 -- 合并 --> Step13
    Step12 -- 自定义 --> CustomConfig[选择类别 / 规则 / 排除]
    CustomConfig --> Step13
    
    Step13[Q12: 内容模式]
    
    %% Final
    Step13 --> DisplaySummary[显示配置摘要]
    DisplaySummary --> Confirm{继续?}
    Confirm -- 否 --> Cancelled([已取消])
    Confirm -- 是 --> Install[安装文件]
    Install --> Finish([完成])

    %% Styling
    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style Finish fill:#9f9,stroke:#333,stroke-width:2px
    style Step12 fill:#ff9,stroke:#333,stroke-width:2px
    style CustomConfig fill:#ff9,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
```

## 2. 更新命令 (`uds update`)

更新流程用于保持标准与集成文件同步。

```mermaid
flowchart TD
    Start([uds update]) --> CheckInit{已初始化?}
    CheckInit -- 否 --> Error([错误：未初始化])
    
    CheckInit -- 是 --> CheckCLI[检查 CLI 更新]
    CheckCLI --> UpdateAvail{CLI 有更新?}
    UpdateAvail -- 是 --> PromptCLI{先更新 CLI?}
    PromptCLI -- 是 --> RunNpmUpdate([npm update -g])
    PromptCLI -- 否 --> CheckStandards
    UpdateAvail -- 否 --> CheckStandards
    
    CheckStandards[检查标准版本] --> UpdateStandards[更新 .standards/ 文件]
    UpdateStandards --> CheckIntegrations[检查集成文件]
    
    CheckIntegrations --> Regenerate{需要重新生成?}
    Regenerate -- 是 --> GenIntegrations[重新生成配置文件]
    Regenerate -- 否 --> SyncRefs
    
    GenIntegrations --> SyncRefs[同步引用]
    
    SyncRefs --> CheckSkills[检查 Skills 更新]
    CheckSkills --> SkillsAvail{Skills 有更新?}
    SkillsAvail -- 是 --> PromptSkills[提示：更新 Skills?]
    PromptSkills -- 是 --> InstallSkills[安装/更新 Skills]
    PromptSkills -- 否 --> Finish
    SkillsAvail -- 否 --> Finish
    
    InstallSkills --> Finish([完成])

    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style Finish fill:#9f9,stroke:#333,stroke-width:2px
```

## 3. 检查命令 (`uds check`)

检查流程用于验证文件完整性与采用状态。

```mermaid
flowchart TD
    Start([uds check]) --> CheckInit{已初始化?}
    CheckInit -- 否 --> Error([错误：未初始化])
    
    CheckInit -- 是 --> VerifyManifest[验证 Manifest]
    VerifyManifest --> CheckHash{Hash 检查}
    
    CheckHash -->|相符| Pass([通过])
    CheckHash -->|不符| DetectChanges[检测 已修改/缺失]
    
    DetectChanges --> Interactive{交互模式?}
    Interactive -- 否 --> Report[报告问题]
    Report --> Fail([结束并显示问题])
    
    Interactive -- 是 --> LoopFiles[循环处理每个文件]
    LoopFiles --> PromptAction[提示：动作?]
    
    PromptAction -- 查看 --> ShowDiff[显示差异]
    ShowDiff --> PromptAction
    
    PromptAction -- 还原 --> RestoreFile[还原原始文件]
    PromptAction -- 保留 --> UpdateHash[更新 Hash (接受变更)]
    PromptAction -- 跳过 --> SkipFile[跳过]
    
    RestoreFile --> NextFile{还有文件?}
    UpdateHash --> NextFile
    SkipFile --> NextFile
    
    NextFile -- 是 --> LoopFiles
    NextFile -- 否 --> Finish([完成])

    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style Finish fill:#9f9,stroke:#333,stroke-width:2px
    style Fail fill:#f99,stroke:#333,stroke-width:2px
```

## 4. 配置命令 (`uds configure`)

配置流程允许修改现有的配置。

```mermaid
flowchart TD
    Start([uds configure]) --> CheckInit{已初始化?}
    CheckInit -- 否 --> Error([错误：未初始化])
    
    CheckInit -- 是 --> SelectCategory[选择配置类别]
    
    SelectCategory -- AI 工具 --> ConfigTools[新增/移除 AI 工具]
    SelectCategory -- 等级 --> ConfigLevel[变更采用等级]
    SelectCategory -- 格式 --> ConfigFormat[变更格式]
    SelectCategory -- 内容模式 --> ConfigMode[变更内容模式]
    SelectCategory -- 方法论 --> ConfigMethod[变更方法论]
    
    ConfigTools --> UpdateManifest[更新 Manifest]
    ConfigLevel --> AddStandards[复制新标准]
    ConfigFormat --> UpdateManifest
    ConfigMode --> UpdateManifest
    ConfigMethod --> UpdateManifest
    
    AddStandards --> UpdateManifest
    
    UpdateManifest --> Regenerate{重新生成集成文件?}
    Regenerate -- 是 --> GenFiles[重新生成配置文件]
    Regenerate -- 否 --> Finish
    
    GenFiles --> Finish([完成])

    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style Finish fill:#9f9,stroke:#333,stroke-width:2px
```

## 5. 未来架构 (SPEC-009)

提议简化流程，以规则选择取代采用等级。

```mermaid
flowchart TD
    Start([uds init]) --> DetectProject[检测项目技术与 AI 工具]
    DetectProject --> Step1[Q1: 选择显示语言]

    Step1 --> Step2[Q2: 选择 AI 工具]
    Step2 --> CheckAITools{已选择 AI 工具?}
    CheckAITools -- 否 --> ExitNoTools([结束])
    CheckAITools -- 是 --> CheckSkillsSupport{支持 Skills?}

    %% Skills & Commands Flow (不变)
    CheckSkillsSupport -- 否 --> Step6
    CheckSkillsSupport -- 是 --> Step4[Q3: Skills 安装位置]
    Step4 --> CheckMarketplace{Marketplace?}
    CheckMarketplace -- 是 --> Step6
    CheckMarketplace -- 否 --> Step5[Q4: 斜杠命令安装位置]

    %% 新核心：规则选择（取代等级）
    Step5 --> Step6[Q5: 选择标准规则]
    Step6 --> RuleConfig{检查已选规则}

    %% 动态规则配置
    RuleConfig -- 已选 Git 工作流 --> Q_Git[Q6a: Git 策略]
    RuleConfig -- 已选测试 --> Q_Test[Q6b: 测试级别]
    RuleConfig -- 已选 Commit 消息 --> Q_Commit[Q6c: Commit 语言]
    RuleConfig -- 其他 --> Q_Scope

    Q_Git --> Q_Scope
    Q_Test --> Q_Scope
    Q_Commit --> Q_Scope

    %% 简化的生成流程
    Q_Scope[Q7: 标准范围] --> DisplaySummary

    %% 隐式决策（对用户隐藏）
    DisplaySummary --> ImplicitConfig[[隐式：内容模式 = 标准]]
    ImplicitConfig --> ImplicitInteg[[隐式：集成 = 默认]]

    ImplicitInteg --> Confirm{继续?}
    Confirm -- 是 --> Install[安装文件并生成配置]
    Install --> Finish([完成])

    %% Styling
    style Step6 fill:#f96,stroke:#333,stroke-width:2px
    style ImplicitConfig fill:#ddd,stroke:#999,stroke-dasharray: 5 5
    style ImplicitInteg fill:#ddd,stroke:#999,stroke-dasharray: 5 5
```
