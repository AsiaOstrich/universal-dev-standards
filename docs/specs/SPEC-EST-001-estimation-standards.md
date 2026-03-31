# [SPEC-EST-001] Feature: Estimation Standards

- **Status**: Draft
- **Created**: 2026-04-01
- **Author**: AI-assisted
- **Priority**: High (P1)
- **Scope**: universal
- **Related**: `core/estimation-standards.md`

## Overview

定義軟體工程估算標準，涵蓋三種估算方法、校準機制、反模式識別、信心等級定義、重新估算觸發條件，以及估算與承諾的明確區分。

## Motivation

### 問題陳述

1. **估算方法不一致** — 團隊缺乏標準化的估算方法，導致估算結果差異過大
2. **無校準機制** — 團隊未定期回顧估算準確度，無法持續改善
3. **常見反模式** — 開發者常落入錨定效應、規劃謬誤等陷阱
4. **信心等級未定義** — 估算缺乏不確定性範圍，利害關係人無法正確解讀
5. **估算與承諾混淆** — 將估算直接視為交付承諾，導致不健康的開發文化

## Requirements

### REQ-1: 估算方法

系統 SHALL 定義至少三種估算方法，並說明各自適用場景。

#### Acceptance Criteria

**AC-1**: 標準 SHALL 定義至少三種估算方法（如 Planning Poker、T-Shirt Sizing、Three-Point Estimation），包含適用場景與優缺點比較。

### REQ-2: 校準機制

系統 SHALL 定義估算校準機制，幫助團隊持續改善準確度。

#### Acceptance Criteria

**AC-2**: 標準 SHALL 定義估算校準機制，包含回顧頻率、準確度追蹤方式（如 Estimation Accuracy Ratio）、以及改善行動的制定流程。

### REQ-3: 估算反模式

系統 SHALL 識別常見的估算反模式並提供避免策略。

#### Acceptance Criteria

**AC-3**: 標準 SHALL 列出至少 5 個估算反模式（如 Anchoring Bias、Planning Fallacy、Scope Creep Blindness、Student Syndrome、Parkinson's Law），並提供每個反模式的辨識方式與緩解策略。

### REQ-4: 信心等級

系統 SHALL 定義信心等級與對應的變異範圍。

#### Acceptance Criteria

**AC-4**: 標準 SHALL 定義信心等級，包含 High（±20%）、Medium（±50%）、Low（±100%）三個等級，以及各等級的適用情境與溝通方式。

### REQ-5: 重新估算觸發

系統 SHALL 定義何時需要重新估算。

#### Acceptance Criteria

**AC-5**: 標準 SHALL 定義重新估算的觸發條件（如需求變更、技術發現、外部依賴變化、時間超過閾值），並提供重新估算流程。

### REQ-6: 估算 vs 承諾

系統 SHALL 明確區分估算與承諾。

#### Acceptance Criteria

**AC-6**: 標準 SHALL 明確定義估算（Estimate）與承諾（Commitment）的差異，包含溝通方式、責任歸屬、以及如何將估算轉化為合理承諾的流程。

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.2.0 | 2026-04-01 | 新增完整 Requirements 與 Motivation |
| 0.1.0 | 2026-04-01 | 初始草稿 |
