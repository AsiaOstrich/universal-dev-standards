/**
 * ATDD 測試 — Hook 遙測上傳
 * [Source: docs/specs/SPEC-TELEMETRY-002-hook-upload.md]
 *
 * AC-1: telemetryUpload=false（預設）時，零 HTTP 請求
 * AC-2: telemetryUpload=true + apiKey 非空時，hook 結果上傳
 * AC-3: Payload 不含原始碼、檔案路徑、使用者名稱
 * AC-4: 伺服器不可用時，hook 正常完成，不影響 CI
 * AC-5: telemetryApiKey="" 時視同 disabled，不上傳
 *
 * 設計原則：依賴注入（uploaderOverride 參數）取代模組 mock，
 * 完全避開 vi.mock + ESM symlink 解析問題。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { shouldUpload, buildPayload, uploadHookTelemetry } from '../../../src/utils/telemetry-uploader.js';

describe('SPEC-TELEMETRY-002: TelemetryUploader', () => {
  let testDir;

  beforeEach(() => {
    testDir = join(tmpdir(), `uds-telemetry-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  // ============================================================
  // AC-1: telemetryUpload=false（預設）時，零 HTTP 請求
  // ============================================================

  describe('AC-1: 預設關閉 — telemetryUpload=false', () => {
    it('should return false when .uds/config.json does not exist', () => {
      // Arrange: 無 config 檔
      // Act
      const result = shouldUpload(testDir);
      // Assert
      expect(result).toBe(false);
    });

    it('should return false when telemetryUpload is not set', () => {
      // Arrange
      mkdirSync(join(testDir, '.uds'), { recursive: true });
      writeFileSync(
        join(testDir, '.uds', 'config.json'),
        JSON.stringify({ hookStats: true })
      );
      // Act
      const result = shouldUpload(testDir);
      // Assert
      expect(result).toBe(false);
    });

    it('should return false when telemetryUpload=false', () => {
      // Arrange
      mkdirSync(join(testDir, '.uds'), { recursive: true });
      writeFileSync(
        join(testDir, '.uds', 'config.json'),
        JSON.stringify({ telemetryUpload: false, telemetryApiKey: 'some-key' })
      );
      // Act
      const result = shouldUpload(testDir);
      // Assert
      expect(result).toBe(false);
    });

    it('should NOT call uploader.upload when telemetryUpload=false', async () => {
      // Arrange
      mkdirSync(join(testDir, '.uds'), { recursive: true });
      writeFileSync(
        join(testDir, '.uds', 'config.json'),
        JSON.stringify({ telemetryUpload: false, telemetryApiKey: 'some-key' })
      );
      const mockUploader = { upload: vi.fn().mockResolvedValue(undefined) };
      const entry = { standard_id: 'commit-message', hook_type: 'UserPromptSubmit', exitCode: 0, duration_ms: 85 };

      // Act
      await uploadHookTelemetry(testDir, entry, mockUploader);

      // Assert: 零 HTTP 請求
      expect(mockUploader.upload).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // AC-5: telemetryApiKey="" 時視同 disabled，不上傳
  // ============================================================

  describe('AC-5: apiKey 為空時不上傳', () => {
    it('should return false when telemetryApiKey is empty string', () => {
      // Arrange
      mkdirSync(join(testDir, '.uds'), { recursive: true });
      writeFileSync(
        join(testDir, '.uds', 'config.json'),
        JSON.stringify({ telemetryUpload: true, telemetryApiKey: '' })
      );
      // Act
      const result = shouldUpload(testDir);
      // Assert
      expect(result).toBe(false);
    });

    it('should return false when telemetryApiKey is missing', () => {
      // Arrange
      mkdirSync(join(testDir, '.uds'), { recursive: true });
      writeFileSync(
        join(testDir, '.uds', 'config.json'),
        JSON.stringify({ telemetryUpload: true })
      );
      // Act
      const result = shouldUpload(testDir);
      // Assert
      expect(result).toBe(false);
    });

    it('should NOT call upload when apiKey is empty string', async () => {
      // Arrange
      mkdirSync(join(testDir, '.uds'), { recursive: true });
      writeFileSync(
        join(testDir, '.uds', 'config.json'),
        JSON.stringify({ telemetryUpload: true, telemetryApiKey: '' })
      );
      const mockUploader = { upload: vi.fn().mockResolvedValue(undefined) };
      const entry = { standard_id: 'commit-message', hook_type: 'UserPromptSubmit', exitCode: 0, duration_ms: 85 };

      // Act
      await uploadHookTelemetry(testDir, entry, mockUploader);

      // Assert
      expect(mockUploader.upload).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // AC-2: telemetryUpload=true + apiKey 非空時，hook 結果上傳
  // ============================================================

  describe('AC-2: 雙重守衛通過時，upload 被呼叫', () => {
    it('should return true when both flags are valid', () => {
      // Arrange
      mkdirSync(join(testDir, '.uds'), { recursive: true });
      writeFileSync(
        join(testDir, '.uds', 'config.json'),
        JSON.stringify({ telemetryUpload: true, telemetryApiKey: 'valid-api-key' })
      );
      // Act
      const result = shouldUpload(testDir);
      // Assert
      expect(result).toBe(true);
    });

    it('should call uploader.upload once when both flags enabled', async () => {
      // Arrange
      mkdirSync(join(testDir, '.uds'), { recursive: true });
      writeFileSync(
        join(testDir, '.uds', 'config.json'),
        JSON.stringify({
          telemetryUpload: true,
          telemetryApiKey: 'valid-api-key',
          telemetryServer: 'https://example.com'
        })
      );
      const mockUploader = { upload: vi.fn().mockResolvedValue(undefined) };
      const entry = { standard_id: 'commit-message', hook_type: 'UserPromptSubmit', exitCode: 0, duration_ms: 85 };

      // Act
      await uploadHookTelemetry(testDir, entry, mockUploader);

      // Assert
      expect(mockUploader.upload).toHaveBeenCalledTimes(1);
    });

    it('should include pass=true in payload when exitCode=0', async () => {
      // Arrange
      mkdirSync(join(testDir, '.uds'), { recursive: true });
      writeFileSync(
        join(testDir, '.uds', 'config.json'),
        JSON.stringify({ telemetryUpload: true, telemetryApiKey: 'valid-key' })
      );
      const mockUploader = { upload: vi.fn().mockResolvedValue(undefined) };
      const entry = { standard_id: 'commit-message', hook_type: 'UserPromptSubmit', exitCode: 0, duration_ms: 100 };

      // Act
      await uploadHookTelemetry(testDir, entry, mockUploader);

      // Assert
      expect(mockUploader.upload).toHaveBeenCalledTimes(1);
      const payload = mockUploader.upload.mock.calls[0][0];
      expect(payload.pass).toBe(true);
    });

    it('should include pass=false in payload when exitCode=1', async () => {
      // Arrange
      mkdirSync(join(testDir, '.uds'), { recursive: true });
      writeFileSync(
        join(testDir, '.uds', 'config.json'),
        JSON.stringify({ telemetryUpload: true, telemetryApiKey: 'valid-key' })
      );
      const mockUploader = { upload: vi.fn().mockResolvedValue(undefined) };
      const entry = { standard_id: 'security-standards', hook_type: 'PreToolUse', exitCode: 1, duration_ms: 42 };

      // Act
      await uploadHookTelemetry(testDir, entry, mockUploader);

      // Assert
      expect(mockUploader.upload).toHaveBeenCalledTimes(1);
      const payload = mockUploader.upload.mock.calls[0][0];
      expect(payload.pass).toBe(false);
      expect(payload.standard_id).toBe('security-standards');
      expect(payload.duration_ms).toBe(42);
    });
  });

  // ============================================================
  // AC-3: Payload 不含原始碼、檔案路徑、使用者名稱
  // ============================================================

  describe('AC-3: Payload 隱私保護', () => {
    it('should build payload with only allowed fields', () => {
      // Arrange
      const entry = { standard_id: 'commit-message', hook_type: 'UserPromptSubmit', exitCode: 0, duration_ms: 85 };

      // Act
      const payload = buildPayload(entry);

      // Assert — 允許的欄位
      expect(payload).toHaveProperty('standard_id');
      expect(payload).toHaveProperty('event_type');
      expect(payload).toHaveProperty('pass');
      expect(payload).toHaveProperty('duration_ms');
      expect(payload).toHaveProperty('user_id');
    });

    it('should NOT include file paths in payload', () => {
      // Arrange
      const entry = { standard_id: 'commit-message', hook_type: 'UserPromptSubmit', exitCode: 0, duration_ms: 85 };

      // Act
      const payload = buildPayload(entry);
      const payloadStr = JSON.stringify(payload);

      // Assert
      expect(payloadStr).not.toMatch(/\/Users\//);
      expect(payloadStr).not.toMatch(/\/home\//);
      expect(payloadStr).not.toMatch(/C:\\Users\\/);
    });

    it('should contain only allowed payload keys', () => {
      // Arrange
      const entry = { standard_id: 'commit-message', hook_type: 'UserPromptSubmit', exitCode: 0, duration_ms: 85 };

      // Act
      const payload = buildPayload(entry);

      // Assert — payload 欄位只有已定義的 keys
      const allowedKeys = ['project', 'event_type', 'standard_id', 'pass', 'duration_ms', 'user_id'];
      const payloadKeys = Object.keys(payload);
      expect(payloadKeys.every(k => allowedKeys.includes(k))).toBe(true);
    });

    it('should produce anonymized user_id of 16 hex chars', () => {
      // Arrange
      const entry = { standard_id: 'commit-message', hook_type: 'UserPromptSubmit', exitCode: 0, duration_ms: 85 };

      // Act
      const payload = buildPayload(entry);

      // Assert — user_id 是 16 字元 hex（SHA256 截斷，不可逆）
      expect(payload.user_id).toBeDefined();
      expect(payload.user_id).toMatch(/^[0-9a-f]{16}$/);
    });
  });

  // ============================================================
  // AC-4: 伺服器不可用時，hook 正常完成，不影響 CI
  // ============================================================

  describe('AC-4: 伺服器失敗不阻斷 Hook', () => {
    it('should NOT throw when server returns 500', async () => {
      // Arrange
      const mockUploader = { upload: vi.fn().mockRejectedValue(new Error('HTTP 500 Internal Server Error')) };
      mkdirSync(join(testDir, '.uds'), { recursive: true });
      writeFileSync(
        join(testDir, '.uds', 'config.json'),
        JSON.stringify({ telemetryUpload: true, telemetryApiKey: 'valid-key' })
      );
      const entry = { standard_id: 'commit-message', hook_type: 'UserPromptSubmit', exitCode: 0, duration_ms: 85 };

      // Act & Assert — 不應 throw
      await expect(uploadHookTelemetry(testDir, entry, mockUploader)).resolves.toBeUndefined();
    });

    it('should NOT throw when server times out', async () => {
      // Arrange
      const mockUploader = { upload: vi.fn().mockRejectedValue(new Error('ETIMEDOUT: connection timed out')) };
      mkdirSync(join(testDir, '.uds'), { recursive: true });
      writeFileSync(
        join(testDir, '.uds', 'config.json'),
        JSON.stringify({ telemetryUpload: true, telemetryApiKey: 'valid-key' })
      );
      const entry = { standard_id: 'security-standards', hook_type: 'PreToolUse', exitCode: 1, duration_ms: 200 };

      // Act & Assert — 不應 throw
      await expect(uploadHookTelemetry(testDir, entry, mockUploader)).resolves.toBeUndefined();
    });

    it('should NOT throw when network is unavailable', async () => {
      // Arrange
      const mockUploader = { upload: vi.fn().mockRejectedValue(new Error('ECONNREFUSED')) };
      mkdirSync(join(testDir, '.uds'), { recursive: true });
      writeFileSync(
        join(testDir, '.uds', 'config.json'),
        JSON.stringify({ telemetryUpload: true, telemetryApiKey: 'valid-key' })
      );
      const entry = { standard_id: 'logging', hook_type: 'PostToolUse', exitCode: 0, duration_ms: 30 };

      // Act & Assert
      await expect(uploadHookTelemetry(testDir, entry, mockUploader)).resolves.toBeUndefined();
    });

    it('should complete gracefully even when config is malformed JSON', async () => {
      // Arrange
      mkdirSync(join(testDir, '.uds'), { recursive: true });
      writeFileSync(join(testDir, '.uds', 'config.json'), 'not-valid-json');
      const mockUploader = { upload: vi.fn().mockResolvedValue(undefined) };
      const entry = { standard_id: 'commit-message', hook_type: 'UserPromptSubmit', exitCode: 0, duration_ms: 85 };

      // Act & Assert
      await expect(uploadHookTelemetry(testDir, entry, mockUploader)).resolves.toBeUndefined();
      expect(mockUploader.upload).not.toHaveBeenCalled();
    });
  });
});
