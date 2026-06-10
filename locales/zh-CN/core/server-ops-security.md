---
source: ../../../core/server-ops-security.md
source_version: 1.0.0
translation_version: 1.0.0
last_synced: 2026-06-10
source_hash: 5d929d539853
status: current
---

# 服务器操作安全标准

> **语言**：[English](../../../core/server-ops-security.md) | [繁體中文](../../zh-TW/core/server-ops-security.md) | 简体中文

> **标准 ID**: server-ops-security
> **版本**: 1.0.0
> **更新日期**: 2026-05-04
> **AI 优化格式**: `ai/standards/server-ops-security.ai.yaml`

---

## 1. 概述

### 为什么 AI 自主运维需要服务器操作安全？

AI 自主运维系统（如 AI Agent / pipeline runtime）在生产环境中以自动化方式执行高权限操作——部署服务、管理容器、调用外部 API、访问数据库。这些能力若缺乏适当的基础设施安全防护，将带来远超传统 Web 应用的风险：

- **攻击面扩大**：AI Agent 持续运行，攻击者只需一个进入点即可横向移动
- **自动化即武器**：被入侵的 AI Agent 可自动执行大规模破坏（删除数据、泄露机密）
- **责任追溯困难**：若 AI Agent 以 root 身份运行，事后难以区分系统行为与攻击者行为

本标准涵盖六大安全域，与 `secure-op.ai.yaml`（AI Agent 决策安全）形成互补：
- `secure-op` 管控「AI Agent 决策层的安全性」
- `server-ops-security` 管控「AI Agent 所在基础设施的安全性」

---

## 2. 六大安全域

### 2.1 SSH 强化（SSH Hardening）

**核心原则**：SSH 服务只允许密钥认证，禁止密码登录与 root 直接登录。

#### 必要的 `/etc/ssh/sshd_config` 设定

```
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
Port 2222                    # 改为非默认 Port
MaxAuthTries 3
LoginGraceTime 30
AllowUsers deploy ai-agent    # 明确白名单
ClientAliveInterval 300
ClientAliveCountMax 2
```

套用后重载：
```bash
sudo systemctl reload sshd
# 验证设定生效
sshd -T | grep -E "passwordauthentication|permitrootlogin|port"
```

#### fail2ban 安装与设定

```bash
sudo apt install fail2ban
```

`/etc/fail2ban/jail.local`：
```ini
[sshd]
enabled  = true
maxretry = 5
findtime = 600
bantime  = 3600   # 1 小时，建议生产环境设为 86400（24 小时）
```

#### 密钥管理规范

| 项目 | 规范 |
|------|------|
| 算法 | Ed25519（禁用 RSA-1024） |
| 私钥保护 | 必须设定 passphrase |
| 轮换周期 | 每年或怀疑泄漏时立即轮换 |
| 授权密钥 | `~/.ssh/authorized_keys` 定期审计，删除离职人员 |

**常见陷阱**：
- 修改 sshd_config 后忘记 reload，设定不生效
- 将 `AllowUsers` 留空（等同不限制）
- 用 RSA-2048 密钥但未停用 RSA-1024 的兼容性

**ISO 对照**：ISO/IEC 27001:2022 A.8.5（安全认证）、A.8.20（网络安全）

---

### 2.2 主机强化（Host Hardening）

**核心原则**：最小化安装，仅保留必要服务，遵循 CIS Benchmark Level 1。

#### 停用不必要的服务

```bash
# 停用常见不必要服务
sudo systemctl disable --now avahi-daemon cups bluetooth
# 确认已停用
systemctl list-unit-files --state=enabled | grep -E "avahi|cups|bluetooth"
```

#### 启用防火墙（UFW）

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp    # SSH（非默认 Port）
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
sudo ufw status verbose
```

#### 启用 auditd（系统调用审计）

```bash
sudo apt install auditd
sudo systemctl enable --now auditd

# 加入关键审计规则 /etc/audit/rules.d/hardening.rules
-w /etc/passwd -p wa -k identity
-w /etc/sudoers -p wa -k sudo_changes
-w /etc/ssh/sshd_config -p wa -k sshd_config
-a always,exit -F arch=b64 -S execve -k exec_commands
```

#### sysctl 强化参数

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

#### Lynis 合规评分

```bash
sudo apt install lynis
sudo lynis audit system
# 目标：Hardening index >= 75
```

**常见陷阱**：
- 安装 Docker 时自动修改 iptables 规则，绕过 UFW
- auditd 未设定 `-f 2`（发生审计失败时停机），在高安全环境应启用

**ISO 对照**：ISO/IEC 27001:2022 A.8.9（配置管理）、NIST SP 800-123

---

### 2.3 特权管理（Privilege Management）

**核心原则**：最小特权原则，服务账号不具 shell 或 sudo 全权。

#### AI Agent 服务账号建立

```bash
# 建立无 shell 的服务账号
sudo useradd -r -s /sbin/nologin -d /opt/ai-agent ai-agent
sudo mkdir -p /opt/ai-agent
sudo chown ai-agent:ai-agent /opt/ai-agent
sudo chmod 750 /opt/ai-agent

# 验证：不可切换到此账号
sudo -u ai-agent /bin/bash  # 应拒绝
```

#### sudo 设定（最小授权）

`/etc/sudoers.d/ai-agent`：
```
# 允许 ai-agent 重启特定服务（明确命令）
ai-agent ALL=(ALL) NOPASSWD: /bin/systemctl restart ai-agent-agent
# 禁止 NOPASSWD ALL 写法
```

验证 sudo 设定：`sudo visudo -c`

#### PAM 账号锁定（pam_faillock）

`/etc/security/faillock.conf`：
```
deny = 5
fail_interval = 300
unlock_time = 900   # 15 分钟锁定
```

`/etc/pam.d/common-auth` 加入：
```
auth required pam_faillock.so preauth
auth [default=die] pam_faillock.so authfail
auth sufficient pam_faillock.so authsucc
```

#### 季度特权账号审计

```bash
# 列出所有有 sudo 权限的账号
grep -r "ALL=" /etc/sudoers /etc/sudoers.d/
# 列出最近 30 天有 sudo 记录的用户
last | grep -v reboot | awk '{print $1}' | sort -u
```

**常见陷阱**：
- `/etc/sudoers.d/` 下文件不必要地设定 `NOPASSWD ALL`
- 服务账号被开发者临时加入 sudo 后忘记移除

**ISO 对照**：ISO/IEC 27001:2022 A.8.2（特权访问权利）、A.8.18

---

### 2.4 堡垒机模式（Bastion Pattern）

**核心原则**：生产环境只能透过 Bastion Host 访问，禁止直接 SSH 到 prod 节点。

#### 架构设计

```
管理者
  │ SSH + MFA
  ▼
Bastion Host（独立 VM，对外唯一 SSH 入口）
  │ SSH（密钥）
  ▼
Prod 节点（仅接受来自 Bastion 的 SSH）
```

#### Prod 节点防火墙规则

```bash
# 仅允许来自 Bastion IP 的 SSH
BASTION_IP="10.0.1.5"
sudo iptables -A INPUT -p tcp --dport 22 -s $BASTION_IP -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 22 -j DROP
# 持久化
sudo apt install iptables-persistent
sudo netfilter-persistent save
```

#### Bastion 上的 MFA 设定（TOTP）

```bash
sudo apt install libpam-google-authenticator
# 每位用户执行
google-authenticator -t -d -f -r 3 -R 30 -w 3
```

`/etc/pam.d/sshd` 加入：
```
auth required pam_google_authenticator.so
```

`/etc/ssh/sshd_config` 设定：
```
AuthenticationMethods publickey,keyboard-interactive
```

#### Session 记录

**方案一：script + tmux**
```bash
# 自动记录所有 session
cat >> /etc/profile.d/session-recording.sh << 'EOF'
if [ -n "$SSH_TTY" ]; then
  SESSION_LOG="/var/log/sessions/$(date +%Y%m%d-%H%M%S)-$(whoami).log"
  mkdir -p /var/log/sessions
  script -q -a "$SESSION_LOG"
fi
EOF
```

**方案二：Teleport（企业环境推荐）**
- 提供完整的 session 录制、playback 与审计查询

**常见陷阱**：
- Staging 环境未要求 Bastion，开发者习惯后在 Prod 也直连
- Bastion 本身未定期更新，成为攻击跳板

**ISO 对照**：ISO/IEC 27001:2022 A.8.3（信息访问限制）、NIST SP 800-207（零信任架构）

---

### 2.5 Patch 管理（Patch Management）

**核心原则**：定期更新系统与软件包，CVE 修补有明确 SLA。

#### CVE 修补 SLA

| 严重等级 | SLA | 逾期处理 |
|---------|-----|---------|
| Critical | 24 小时内修补或隔离 | 立即下线 / 网络隔离 |
| High | 72 小时内修补 | 记录豁免申请（max 7 天） |
| Medium | 7 天内修补 | Backlog + 追踪 |
| Low | 下次维护窗口（≤ 30 天） | 定期维护周期 |

#### Ubuntu/Debian 自动安全更新

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
Unattended-Upgrade::Automatic-Reboot "false";  # 维护窗口手动重启
```

#### 容器镜像扫描（Trivy）

```bash
# 每次 build 后执行
trivy image --severity HIGH,CRITICAL myapp:latest

# CI 集成（阻止 HIGH/CRITICAL）
trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:latest
```

#### AI Agent 容器镜像更新规范

- 使用官方 base image（`ubuntu:22.04-minimal`、`gcr.io/distroless/nodejs`）
- 每 30 天（最多 90 天）重新 build，即使无代码变更
- Guardian OPA Sidecar 镜像遵循相同 SLA

```bash
# 查看镜像创建日期
docker inspect <image> | jq '.[0].Created'
# 超过 90 天的镜像应强制更新
```

**常见陷阱**：
- 以为 `unattended-upgrades` 包含所有更新（实际上默认只包含 security）
- 未将 Critical CVE SLA 触发器集成到告警系统

**ISO 对照**：ISO/IEC 27001:2022 A.8.8（技术漏洞管理）

---

### 2.6 网络隔离（Network Isolation）

**核心原则**：服务间网络最小化，AI Agent 出站流量使用明确白名单。

#### 防火墙分层设计

```
Internet
  │
Load Balancer / API Gateway（唯一对外入口）
  │
Internal VPC / Overlay Network
  │
┌──────────────────────────────────────┐
│  AI Agent       │  Database  │  Monitoring │
│  (port: 3000)   │ (port: 5432)│ (port: 9090) │
└──────────────────────────────────────┘
所有节点均不直接对外
```

#### AI Agent 出站白名单设定

`/etc/ai-agent/outbound-allowlist.conf`（示例）：
```
# AI Agent 出站流量白名单
ALLOW api.openai.com:443          # OpenAI API
ALLOW registry.npmjs.org:443      # npm registry
ALLOW api.github.com:443          # GitHub API
ALLOW telemetry.asiaostrich.com:443  # 遥测上传
# 默认拒绝所有其他出站
DENY *:*
```

使用 iptables 实现出站白名单：
```bash
# 允许 DNS
sudo iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
# 允许白名单 IP（事先解析域名）
sudo iptables -A OUTPUT -d <api.openai.com_IP> -p tcp --dport 443 -j ACCEPT
# 默认拒绝所有出站
sudo iptables -A OUTPUT -j DROP
```

#### 数据库与监控端口保护

```bash
# 确认数据库端口未对外
sudo iptables -A INPUT -p tcp --dport 5432 -s 10.0.0.0/8 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5432 -j DROP

# Prometheus / Grafana 仅内网
sudo iptables -A INPUT -p tcp --dport 9090 -s 10.0.0.0/8 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 9090 -j DROP
sudo iptables -A INPUT -p tcp --dport 3000 -s 10.0.0.0/8 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3000 -j DROP
```

**常见陷阱**：
- Docker 网络模式 `--net=host` 绕过所有 iptables 规则
- Prometheus exporter 监听 `0.0.0.0` 而非 `127.0.0.1`

**ISO 对照**：ISO/IEC 27001:2022 A.8.20（网络安全）、A.8.22（Web 过滤）

---

## 3. AI Agent 环境特殊考量

### Guardian 集成

Guardian OPA Sidecar（XSPEC-146/147）作为 AI Agent 的决策网关，其所在主机必须满足本标准的全部要求：

| Guardian 组件 | 对应安全域 |
|--------------|----------|
| OPA Sidecar 容器 | 2.5 Patch Management（镜像需定期更新） |
| Guardian 服务账号 | 2.3 Privilege Management（non-root, no shell） |
| Guardian API 端口 | 2.6 Network Isolation（仅允许 Agent 访问） |
| Guardian 审计日志 | 2.2 Host Hardening（auditd 监控写入） |

### 服务账号矩阵

| 服务 | Unix 账号 | Shell | Sudo | 说明 |
|------|----------|-------|------|------|
| AI Agent | `ai-agent` | /sbin/nologin | 限定命令 | 主要 AI 执行账号 |
| Guardian OPA | `guardian` | /sbin/nologin | 无 | OPA 决策引擎 |
| Prometheus | `prometheus` | /sbin/nologin | 无 | 监控收集 |
| 部署脚本 | `deployer` | /bin/bash | 限定命令 | CI/CD 用途 |

### 出站白名单文档模板

每个 AI Agent 部署必须随附出站白名单文档，记录：

```
端点: api.openai.com:443
用途: 大型语言模型 API 调用
负责人: AI 平台运维团队
最后审查: 2026-05-04
```

---

## 4. 标准对照表

| 安全域 | ISO/IEC 27001:2022 | NIST | CIS |
|-------|-------------------|------|-----|
| SSH 强化 | A.8.5, A.8.20 | SP 800-52 | Benchmark 5.x |
| 主机强化 | A.8.9 | SP 800-123 | Benchmark Level 1 |
| 特权管理 | A.8.2, A.8.18 | SP 800-53 AC-6 | Benchmark 5.1-5.4 |
| 堡垒机模式 | A.8.3 | SP 800-207 (ZTA) | - |
| Patch 管理 | A.8.8 | SP 800-40 | - |
| 网络隔离 | A.8.20, A.8.22 | SP 800-41 | Benchmark 3.x |

---

## 5. 部署前快速 Checklist

### 通用（所有环境）

- [ ] `PasswordAuthentication no` 已设定并生效
- [ ] `PermitRootLogin no` 已设定并生效
- [ ] SSH Port 已改为非 22
- [ ] fail2ban 已启用，jailtime >= 1 小时
- [ ] UFW / iptables 防火墙已启用，默认 deny inbound
- [ ] unattended-upgrades（security）已启用
- [ ] auditd 已启用并有基本规则
- [ ] AI Agent 服务账号：non-root, /sbin/nologin
- [ ] 无 `NOPASSWD ALL` 的 sudo 设定

### 生产环境额外项目

- [ ] Bastion Host 已部署
- [ ] Bastion 上 MFA 已强制（TOTP 或 YubiKey）
- [ ] Prod 节点防火墙只允许来自 Bastion 的 SSH
- [ ] Session 记录已启用
- [ ] 所有 Critical CVE 已修补
- [ ] AI Agent 出站白名单已设定并文档化
- [ ] DB/监控端口（5432, 3306, 6379, 9090, 3000）未对外暴露
- [ ] Guardian OPA Sidecar 镜像在 90 天有效期内
- [ ] Lynis 评分 >= 75

---

## 相关标准

- `secure-op.ai.yaml` — AI Agent 决策层安全（Veto pipeline、SOBR 评分、HITL 机制）
- `security-standards.ai.yaml` — 应用层安全架构
- `security-testing.ai.yaml` — SAST、DAST、依赖软件包审计
- `secret-management-standards.ai.yaml` — 机密管理与凭证卫生
- `container-image-standards.ai.yaml` — 容器镜像安全基准


**Scope**: universal
