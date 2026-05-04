# 伺服器操作安全標準

> **標準 ID**: server-ops-security
> **版本**: 1.0.0
> **更新日期**: 2026-05-04
> **AI 優化格式**: `ai/standards/server-ops-security.ai.yaml`

---

## 1. 概述

### 為什麼 AI 自主運維需要伺服器操作安全？

AI 自主運維系統（如 VibeOps）在生產環境中以自動化方式執行高權限操作——部署服務、管理容器、調用外部 API、存取資料庫。這些能力若缺乏適當的基礎設施安全防護，將帶來遠超傳統 Web 應用的風險：

- **攻擊面擴大**：AI Agent 持續運行，攻擊者只需一個進入點即可橫向移動
- **自動化即武器**：被入侵的 AI Agent 可自動執行大規模破壞（刪除資料、外洩機密）
- **責任追溯困難**：若 AI Agent 以 root 身份運行，事後難以區分系統行為與攻擊者行為

本標準涵蓋六大安全域，與 `secure-op.ai.yaml`（AI Agent 決策安全）形成互補：
- `secure-op` 管控「AI Agent 決策層的安全性」
- `server-ops-security` 管控「AI Agent 所在基礎設施的安全性」

---

## 2. 六大安全域

### 2.1 SSH 強化（SSH Hardening）

**核心原則**：SSH 服務只允許金鑰認證，禁止密碼登入與 root 直接登入。

#### 必要的 `/etc/ssh/sshd_config` 設定

```
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
Port 2222                    # 改為非預設 Port
MaxAuthTries 3
LoginGraceTime 30
AllowUsers deploy vibeops    # 明確白名單
ClientAliveInterval 300
ClientAliveCountMax 2
```

套用後重載：
```bash
sudo systemctl reload sshd
# 驗證設定生效
sshd -T | grep -E "passwordauthentication|permitrootlogin|port"
```

#### fail2ban 安裝與設定

```bash
sudo apt install fail2ban
```

`/etc/fail2ban/jail.local`：
```ini
[sshd]
enabled  = true
maxretry = 5
findtime = 600
bantime  = 3600   # 1 小時，建議生產環境設為 86400（24 小時）
```

#### 金鑰管理規範

| 項目 | 規範 |
|------|------|
| 演算法 | Ed25519（禁用 RSA-1024） |
| 私鑰保護 | 必須設定 passphrase |
| 輪替週期 | 每年或懷疑洩漏時立即輪替 |
| 授權金鑰 | `~/.ssh/authorized_keys` 定期審計，刪除離職人員 |

**常見陷阱**：
- 修改 sshd_config 後忘記 reload，設定不生效
- 將 `AllowUsers` 留空（等同不限制）
- 用 RSA-2048 金鑰但未停用 RSA-1024 的相容性

**ISO 對映**：ISO/IEC 27001:2022 A.8.5（安全認證）、A.8.20（網路安全）

---

### 2.2 主機強化（Host Hardening）

**核心原則**：最小化安裝，僅保留必要服務，遵循 CIS Benchmark Level 1。

#### 停用不必要的服務

```bash
# 停用常見不必要服務
sudo systemctl disable --now avahi-daemon cups bluetooth
# 確認已停用
systemctl list-unit-files --state=enabled | grep -E "avahi|cups|bluetooth"
```

#### 啟用防火牆（UFW）

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp    # SSH（非預設 Port）
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
sudo ufw status verbose
```

#### 啟用 auditd（系統呼叫審計）

```bash
sudo apt install auditd
sudo systemctl enable --now auditd

# 加入關鍵審計規則 /etc/audit/rules.d/hardening.rules
-w /etc/passwd -p wa -k identity
-w /etc/sudoers -p wa -k sudo_changes
-w /etc/ssh/sshd_config -p wa -k sshd_config
-a always,exit -F arch=b64 -S execve -k exec_commands
```

#### sysctl 強化參數

`/etc/sysctl.d/99-hardening.conf`：
```
kernel.dmesg_restrict = 1
kernel.randomize_va_space = 2
net.ipv4.ip_forward = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.tcp_syncookies = 1
fs.suid_dumpable = 0
```

套用：`sudo sysctl -p /etc/sysctl.d/99-hardening.conf`

#### Lynis 合規評分

```bash
sudo apt install lynis
sudo lynis audit system
# 目標：Hardening index >= 75
```

**常見陷阱**：
- 安裝 Docker 時自動修改 iptables 規則，繞過 UFW
- auditd 未設定 `-f 2`（發生審計失敗時停機），在高安全環境應啟用

**ISO 對映**：ISO/IEC 27001:2022 A.8.9（組態管理）、NIST SP 800-123

---

### 2.3 特權管理（Privilege Management）

**核心原則**：最小特權原則，服務帳號不具 shell 或 sudo 全權。

#### AI Agent 服務帳號建立

```bash
# 建立無 shell 的服務帳號
sudo useradd -r -s /sbin/nologin -d /opt/vibeops vibeops
sudo mkdir -p /opt/vibeops
sudo chown vibeops:vibeops /opt/vibeops
sudo chmod 750 /opt/vibeops

# 驗證：不可切換到此帳號
sudo -u vibeops /bin/bash  # 應拒絕
```

#### sudo 設定（最小授權）

`/etc/sudoers.d/vibeops`：
```
# 允許 vibeops 重啟特定服務（明確命令）
vibeops ALL=(ALL) NOPASSWD: /bin/systemctl restart vibeops-agent
# 禁止 NOPASSWD ALL 寫法
```

驗證 sudo 設定：`sudo visudo -c`

#### PAM 帳號鎖定（pam_faillock）

`/etc/security/faillock.conf`：
```
deny = 5
fail_interval = 300
unlock_time = 900   # 15 分鐘鎖定
```

`/etc/pam.d/common-auth` 加入：
```
auth required pam_faillock.so preauth
auth [default=die] pam_faillock.so authfail
auth sufficient pam_faillock.so authsucc
```

#### 季度特權帳號審計

```bash
# 列出所有有 sudo 權限的帳號
grep -r "ALL=" /etc/sudoers /etc/sudoers.d/
# 列出最近 30 天有 sudo 紀錄的使用者
last | grep -v reboot | awk '{print $1}' | sort -u
```

**常見陷阱**：
- `/etc/sudoers.d/` 下檔案不必要地設定 `NOPASSWD ALL`
- 服務帳號被開發者臨時加入 sudo 後忘記移除

**ISO 對映**：ISO/IEC 27001:2022 A.8.2（特權存取權利）、A.8.18

---

### 2.4 堡壘機模式（Bastion Pattern）

**核心原則**：生產環境只能透過 Bastion Host 存取，禁止直接 SSH 到 prod 節點。

#### 架構設計

```
管理者
  │ SSH + MFA
  ▼
Bastion Host（獨立 VM，對外唯一 SSH 入口）
  │ SSH（金鑰）
  ▼
Prod 節點（僅接受來自 Bastion 的 SSH）
```

#### Prod 節點防火牆規則

```bash
# 僅允許來自 Bastion IP 的 SSH
BASTION_IP="10.0.1.5"
sudo iptables -A INPUT -p tcp --dport 22 -s $BASTION_IP -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 22 -j DROP
# 持久化
sudo apt install iptables-persistent
sudo netfilter-persistent save
```

#### Bastion 上的 MFA 設定（TOTP）

```bash
sudo apt install libpam-google-authenticator
# 每位使用者執行
google-authenticator -t -d -f -r 3 -R 30 -w 3
```

`/etc/pam.d/sshd` 加入：
```
auth required pam_google_authenticator.so
```

`/etc/ssh/sshd_config` 設定：
```
AuthenticationMethods publickey,keyboard-interactive
```

#### Session 記錄

**方案一：script + tmux**
```bash
# 自動記錄所有 session
cat >> /etc/profile.d/session-recording.sh << 'EOF'
if [ -n "$SSH_TTY" ]; then
  SESSION_LOG="/var/log/sessions/$(date +%Y%m%d-%H%M%S)-$(whoami).log"
  mkdir -p /var/log/sessions
  script -q -a "$SESSION_LOG"
fi
EOF
```

**方案二：Teleport（企業環境推薦）**
- 提供完整的 session 錄製、playback 與審計查詢

**常見陷阱**：
- Staging 環境未要求 Bastion，開發者習慣後在 Prod 也直連
- Bastion 本身未定期更新，成為攻擊跳板

**ISO 對映**：ISO/IEC 27001:2022 A.8.3（資訊存取限制）、NIST SP 800-207（零信任架構）

---

### 2.5 Patch 管理（Patch Management）

**核心原則**：定期更新系統與套件，CVE 修補有明確 SLA。

#### CVE 修補 SLA

| 嚴重等級 | SLA | 逾期處理 |
|---------|-----|---------|
| Critical | 24 小時內修補或隔離 | 立即下線 / 網路隔離 |
| High | 72 小時內修補 | 記錄豁免申請（max 7 天） |
| Medium | 7 天內修補 | Backlog + 追蹤 |
| Low | 下次維護視窗（≤ 30 天） | 定期維護週期 |

#### Ubuntu/Debian 自動安全更新

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

`/etc/apt/apt.conf.d/50unattended-upgrades`：
```
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::Remove-Unused-Packages "true";
Unattended-Upgrade::Automatic-Reboot "false";  # 維護視窗手動重啟
```

#### 容器映像掃描（Trivy）

```bash
# 每次 build 後執行
trivy image --severity HIGH,CRITICAL myapp:latest

# CI 整合（阻擋 HIGH/CRITICAL）
trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:latest
```

#### AI Agent 容器映像更新規範

- 使用官方 base image（`ubuntu:22.04-minimal`、`gcr.io/distroless/nodejs`）
- 每 30 天（最多 90 天）重新 build，即使無程式碼變更
- Guardian OPA Sidecar 映像遵循相同 SLA

```bash
# 查看映像建立日期
docker inspect <image> | jq '.[0].Created'
# 超過 90 天的映像應強制更新
```

**常見陷阱**：
- 以為 `unattended-upgrades` 包含所有更新（實際上預設只包含 security）
- 未將 Critical CVE SLA 觸發器整合到告警系統

**ISO 對映**：ISO/IEC 27001:2022 A.8.8（技術漏洞管理）

---

### 2.6 網路隔離（Network Isolation）

**核心原則**：服務間網路最小化，AI Agent 出站流量使用明確白名單。

#### 防火牆分層設計

```
Internet
  │
Load Balancer / API Gateway（唯一對外入口）
  │
Internal VPC / Overlay Network
  │
┌──────────────────────────────────────┐
│  VibeOps Agent  │  Database  │  Monitoring │
│  (port: 3000)   │ (port: 5432)│ (port: 9090) │
└──────────────────────────────────────┘
所有節點均不直接對外
```

#### AI Agent 出站白名單設定

`/etc/vibeops/outbound-allowlist.conf`（範例）：
```
# VibeOps Agent 出站流量白名單
ALLOW api.openai.com:443          # OpenAI API
ALLOW registry.npmjs.org:443      # npm registry
ALLOW api.github.com:443          # GitHub API
ALLOW telemetry.asiaostrich.com:443  # 遙測上傳
# 預設拒絕所有其他出站
DENY *:*
```

使用 iptables 實作出站白名單：
```bash
# 允許 DNS
sudo iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
# 允許白名單 IP（事先解析域名）
sudo iptables -A OUTPUT -d <api.openai.com_IP> -p tcp --dport 443 -j ACCEPT
# 預設拒絕所有出站
sudo iptables -A OUTPUT -j DROP
```

#### 資料庫與監控端口保護

```bash
# 確認資料庫端口未對外
sudo iptables -A INPUT -p tcp --dport 5432 -s 10.0.0.0/8 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5432 -j DROP

# Prometheus / Grafana 僅內網
sudo iptables -A INPUT -p tcp --dport 9090 -s 10.0.0.0/8 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 9090 -j DROP
sudo iptables -A INPUT -p tcp --dport 3000 -s 10.0.0.0/8 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3000 -j DROP
```

**常見陷阱**：
- Docker 網路模式 `--net=host` 繞過所有 iptables 規則
- Prometheus exporter 監聽 `0.0.0.0` 而非 `127.0.0.1`

**ISO 對映**：ISO/IEC 27001:2022 A.8.20（網路安全）、A.8.22（Web 過濾）

---

## 3. AI Agent 環境特殊考量

### Guardian 整合

Guardian OPA Sidecar（XSPEC-146/147）作為 AI Agent 的決策閘道，其所在主機必須滿足本標準的全部要求：

| Guardian 元件 | 對應安全域 |
|--------------|----------|
| OPA Sidecar 容器 | 2.5 Patch Management（映像需定期更新） |
| Guardian 服務帳號 | 2.3 Privilege Management（non-root, no shell） |
| Guardian API 端口 | 2.6 Network Isolation（僅允許 Agent 存取） |
| Guardian 審計日誌 | 2.2 Host Hardening（auditd 監控寫入） |

### 服務帳號矩陣

| 服務 | Unix 帳號 | Shell | Sudo | 說明 |
|------|----------|-------|------|------|
| VibeOps Agent | `vibeops` | /sbin/nologin | 限定指令 | 主要 AI 執行帳號 |
| Guardian OPA | `guardian` | /sbin/nologin | 無 | OPA 決策引擎 |
| Prometheus | `prometheus` | /sbin/nologin | 無 | 監控收集 |
| 部署腳本 | `deployer` | /bin/bash | 限定指令 | CI/CD 用途 |

### 出站白名單文件模板

每個 AI Agent 部署必須隨附出站白名單文件，記錄：

```
端點: api.openai.com:443
用途: 大型語言模型 API 呼叫
負責人: VibeOps 核心團隊
最後審查: 2026-05-04
```

---

## 4. 標準對映表

| 安全域 | ISO/IEC 27001:2022 | NIST | CIS |
|-------|-------------------|------|-----|
| SSH 強化 | A.8.5, A.8.20 | SP 800-52 | Benchmark 5.x |
| 主機強化 | A.8.9 | SP 800-123 | Benchmark Level 1 |
| 特權管理 | A.8.2, A.8.18 | SP 800-53 AC-6 | Benchmark 5.1-5.4 |
| 堡壘機模式 | A.8.3 | SP 800-207 (ZTA) | - |
| Patch 管理 | A.8.8 | SP 800-40 | - |
| 網路隔離 | A.8.20, A.8.22 | SP 800-41 | Benchmark 3.x |

---

## 5. 部署前快速 Checklist

### 通用（所有環境）

- [ ] `PasswordAuthentication no` 已設定並生效
- [ ] `PermitRootLogin no` 已設定並生效
- [ ] SSH Port 已改為非 22
- [ ] fail2ban 已啟用，jailtime >= 1 小時
- [ ] UFW / iptables 防火牆已啟用，預設 deny inbound
- [ ] unattended-upgrades（security）已啟用
- [ ] auditd 已啟用並有基本規則
- [ ] AI Agent 服務帳號：non-root, /sbin/nologin
- [ ] 無 `NOPASSWD ALL` 的 sudo 設定

### 生產環境額外項目

- [ ] Bastion Host 已部署
- [ ] Bastion 上 MFA 已強制（TOTP 或 YubiKey）
- [ ] Prod 節點防火牆只允許來自 Bastion 的 SSH
- [ ] Session 記錄已啟用
- [ ] 所有 Critical CVE 已修補
- [ ] AI Agent 出站白名單已設定並文件化
- [ ] DB/監控端口（5432, 3306, 6379, 9090, 3000）未對外暴露
- [ ] Guardian OPA Sidecar 映像在 90 天有效期內
- [ ] Lynis 評分 >= 75

---

## 相關標準

- `secure-op.ai.yaml` — AI Agent 決策層安全（Veto pipeline、SOBR 評分、HITL 機制）
- `security-standards.ai.yaml` — 應用層安全架構
- `security-testing.ai.yaml` — SAST、DAST、相依套件審計
- `secret-management-standards.ai.yaml` — 機密管理與憑證衛生
- `container-image-standards.ai.yaml` — 容器映像安全基準
