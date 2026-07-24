---
source: ../../../core/container-image-standards.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-07-23
source_hash: 6bf9872a3d26
status: current
---

# 容器映像建構與安全標準

> **Language**: [English](../../../core/container-image-standards.md) | 繁體中文

> **版本**: 1.0.0 | **狀態**: Active | **更新日期**: 2026-06-17
> **AI 最佳化版本**: `ai/standards/container-image-standards.ai.yaml`
> **規格**: XSPEC-065（cross-project/specs/XSPEC-065-uds-infrastructure-pack.md）

## 概觀

本標準定義容器映像建構管線的安全與合規要求。涵蓋五項 Dockerfile 撰寫原則（多階段
建構、非 root 執行、最小基底映像、無秘密的 build args、SBOM metadata）、使用 `syft`
或 `trivy` 進行 SBOM 生成與嵌入，以及封鎖 Critical／High CVE 的映像掃描政策。

本標準屬於 **IaC 標準包**（XSPEC-065），並透過聚焦於供應鏈安全與合規認證
（attestation）來補足既有的 `containerization-standards`（layer 排序與標記）。

> **範圍**：本標準定義生產映像必須保證的事項（rootless、最小化、已掃描、SBOM
> 認證）以及 CVE 的*嚴重度政策*。具體的 SBOM 工具（`syft`／`trivy`）、掃描器與
> registry 屬採用者的選擇，不在本標準範圍內。

## 需求

| ID | 規則 | 等級 |
|----|------|------|
| REQ-001 | Dockerfile 五原則（多階段、非 root、最小基底、無秘密、SBOM label） | MUST |
| REQ-002 | SBOM 嵌入（於 CI 生成、嵌入或認證、保留 ≥12 個月） | MUST |
| REQ-003 | 映像掃描（Critical／High 封鎖；Medium 開單；自動基底更新） | MUST |

### REQ-001 — Dockerfile 五原則

每個生產 Dockerfile MUST 遵循五項原則：(1) **多階段建構**——分離 builder 與 runtime
階段，以最小化最終映像大小與攻擊面；(2) **非 root 最終使用者**——runtime 階段 MUST
設定非 root `USER`（UID ≥ 1000）；生產容器中以 root 執行為禁止；(3) **Distroless 或
Alpine 基底**——最終階段使用 distroless（`gcr.io/distroless`）或 Alpine 基底映像以
最小化 CVE 曝險；除非有正當理由並文件化，否則避免完整 Debian／Ubuntu；(4) **無硬
編碼秘密**——build ARGs 與 ENV 變數 MUST NOT 含秘密；秘密於執行期透過 volume mount
或 secret manager 注入（見 `secret-management-standards`）；(5) **SBOM metadata
label**——最終映像 MUST 包含 OCI label `org.opencontainers.image.source` 及含 git
commit SHA 的建構期 label `org.opencontainers.image.revision`。

### REQ-002 — SBOM 嵌入

每個生產容器映像 MUST 在 CI 建構步驟生成軟體物料清單（SBOM），使用 `syft` 或
`trivy` 以 CycloneDX 或 SPDX 格式產出。SBOM MUST 為以下其一：(a) 嵌入為 OCI 映像
annotation（OCI 相容 registry 的首選），或 (b) 以 `cosign` attestation 附加於映像
digest。SBOM 產物 MUST 與映像一同儲存於容器 registry，並至少保留 12 個月供合規稽核。

### REQ-003 — 映像掃描

所有容器映像在推送至生產 registry 前 MUST 掃描已知 CVE，使用整合於 CI 管線的
`trivy`、`grype` 或同等工具。嚴重度政策：**Critical 與 High** CVE MUST 封鎖建構並
阻止晉升至生產；**Medium** CVE MUST 產生警告並建立追蹤工單；**Low 與 Negligible**
CVE 僅供參考。當上游映像收到 CVE 修補時，基底映像更新 MUST 自動觸發（例如以
Dependabot 或 Renovate 處理 Dockerfile 基底映像 pin）。

## 反模式

- 在生產 Dockerfile 對基底映像使用 `latest` 標籤（不可重現建構）。
- 在最終 runtime 階段以 root（UID 0）執行容器程序。
- 將秘密嵌入會殘留於映像 layer 的 Docker build ARGs 或 ENV 變數。
- 為節省 CI 時間而略過 SBOM 生成，喪失供應鏈可追溯性。
- 未經 CVE 掃描結果即推送映像至生產。

## 與既有標準的整合

- **`containerization-standards`**——涵蓋 layer 排序與標記；本標準在其上加上供應鏈
  安全與認證層。
- **`secret-management-standards`**——執行期秘密注入取代任何 ARGs／ENV 中的建構期
  秘密（REQ-001 原則 4）。
- **`supply-chain-security-standards`**——此處的 SBOM 與 CVE 掃描政策是更廣供應鏈
  態勢的容器映像面向。
- **`iac-design-principles`**——映像建構／晉升本身即是版本化、可重現的基礎設施。

## 相關規格

- XSPEC-065 — UDS 基礎設施（IaC）標準包（本標準來源）
- DEC-043 — UDS 覆蓋完整性路線圖（Wave 4 範圍）

## 變更紀錄

| 版本 | 日期 | 變更 |
|------|------|------|
| v1.0.0 | 2026-06-17 | 初版——REQ-001~003：Dockerfile 五原則、SBOM 嵌入、映像掃描（XSPEC-065） |
