/**
 * Hook 遙測上傳器
 *
 * 雙重守衛設計：
 *   - telemetryUpload === true（明確 opt-in）
 *   - telemetryApiKey 非空字串
 * 兩個條件都通過才執行上傳。任何失敗靜默捕捉，不阻斷 hook。
 *
 * Privacy：
 *   - user_id 使用 SHA256(hostname:platform:arch) 的前 16 hex chars
 *   - Payload 不含原始碼、檔案路徑、使用者名稱
 *   - 使用 SDK redactObject 脫敏
 *
 * @module utils/telemetry-uploader
 * @see docs/specs/SPEC-TELEMETRY-002-hook-upload.md
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { hostname, platform, arch } from 'os';

const CONFIG_FILE = '.uds/config.json';
const DEFAULT_SERVER = 'https://asiaostrich-telemetry-server.asiaostrich-telemetry.workers.dev';

/**
 * 讀取 .uds/config.json 並回傳遙測設定。
 * @param {string} projectPath
 * @returns {{ telemetryUpload: boolean, telemetryServer: string, telemetryApiKey: string }}
 */
function readTelemetryConfig(projectPath) {
  const configPath = join(projectPath, CONFIG_FILE);
  try {
    if (!existsSync(configPath)) {
      return { telemetryUpload: false, telemetryServer: DEFAULT_SERVER, telemetryApiKey: '' };
    }
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    return {
      telemetryUpload: config.telemetryUpload === true,
      telemetryServer: config.telemetryServer || DEFAULT_SERVER,
      telemetryApiKey: config.telemetryApiKey || '',
    };
  } catch {
    return { telemetryUpload: false, telemetryServer: DEFAULT_SERVER, telemetryApiKey: '' };
  }
}

/**
 * 雙重守衛：判斷是否應上傳遙測數據。
 * 條件 1：telemetryUpload === true
 * 條件 2：telemetryApiKey 非空字串
 *
 * @param {string} projectPath
 * @returns {boolean}
 */
export function shouldUpload(projectPath) {
  const config = readTelemetryConfig(projectPath);
  return config.telemetryUpload === true
    && typeof config.telemetryApiKey === 'string'
    && config.telemetryApiKey.length > 0;
}

/**
 * 產生匿名 user_id（SHA256 of hostname:platform:arch，取前 16 hex chars）。
 * 不可逆，不含個人識別資訊。
 * @returns {string} 16-char hex string
 */
function getAnonymousUserId() {
  const raw = `${hostname()}:${platform()}:${arch()}`;
  return createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

/**
 * 建立上傳 payload（不含敏感資訊）。
 * @param {{ standard_id: string, hook_type: string, exitCode: number, duration_ms: number, project?: string }} entry
 * @returns {{ project: string, event_type: string, standard_id: string, pass: boolean, duration_ms: number, user_id: string }}
 */
export function buildPayload(entry) {
  return {
    project: entry.project || 'uds',
    event_type: entry.hook_type || 'unknown',
    standard_id: entry.standard_id || 'unknown',
    pass: entry.exitCode === 0,
    duration_ms: entry.duration_ms || 0,
    user_id: getAnonymousUserId(),
  };
}

/**
 * 上傳 hook 執行結果到遙測伺服器（opt-in，靜默失敗）。
 *
 * @param {string} projectPath - 專案根目錄
 * @param {{ standard_id: string, hook_type: string, exitCode: number, duration_ms: number }} entry
 * @param {{ upload: (payload: object) => Promise<void> } | null} [uploaderOverride] - 測試用注入
 * @returns {Promise<void>}
 */
export async function uploadHookTelemetry(projectPath, entry, uploaderOverride = null) {
  try {
    // 雙重守衛
    if (!shouldUpload(projectPath)) {
      return;
    }

    const config = readTelemetryConfig(projectPath);
    const rawPayload = buildPayload(entry);

    let safePayload = rawPayload;

    // 使用 SDK redactObject 脫敏（如果可用）
    try {
      const { redactObject } = await import('@asiaostrich/telemetry-client');
      safePayload = redactObject(rawPayload);
    } catch {
      // SDK 不可用時使用原始 payload（已是安全內容）
    }

    // 使用注入的 uploader 或建立 SDK uploader
    const uploader = uploaderOverride || await (async () => {
      const { TelemetryUploader } = await import('@asiaostrich/telemetry-client');
      return new TelemetryUploader({
        serverUrl: config.telemetryServer,
        apiKey: config.telemetryApiKey,
      });
    })();

    await uploader.upload(safePayload);
  } catch {
    // AC-4: 任何失敗（網路、伺服器錯誤、SDK 錯誤）靜默捕捉，不阻斷 hook
  }
}
