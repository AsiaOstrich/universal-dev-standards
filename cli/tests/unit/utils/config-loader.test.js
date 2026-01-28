import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { ConfigLoader } from '../../../src/utils/config-loader.js';

vi.mock('fs');
vi.mock('os');

describe('ConfigLoader', () => {
  const mockCwd = '/test/project';
  const mockHome = '/home/user';

  beforeEach(() => {
    vi.resetAllMocks();
    os.homedir.mockReturnValue(mockHome);
  });

  it('should return empty object if global file does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    const loader = new ConfigLoader(mockCwd);
    expect(loader.loadGlobal()).toEqual({});
  });

  it('should load global config if file exists', () => {
    const mockContent = 'ui:\n  language: zh-TW';
    fs.existsSync.mockImplementation((p) => p.includes('.udsrc'));
    fs.readFileSync.mockReturnValue(mockContent);
    
    const loader = new ConfigLoader(mockCwd);
    const config = loader.loadGlobal();
    expect(config.ui.language).toBe('zh-TW');
  });

  it('should return empty object if project file does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    const loader = new ConfigLoader(mockCwd);
    expect(loader.loadProject()).toEqual({});
  });

  it('should load project config if file exists', () => {
    const mockContent = 'vibe-coding:\n  enabled: true';
    fs.existsSync.mockImplementation((p) => p.includes('.uds/config.yaml'));
    fs.readFileSync.mockReturnValue(mockContent);
    
    const loader = new ConfigLoader(mockCwd);
    const config = loader.loadProject();
    expect(config['vibe-coding'].enabled).toBe(true);
  });

  it('should handle invalid YAML gracefully', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('invalid: : yaml');
    
    const loader = new ConfigLoader(mockCwd);
    const config = loader.loadProject();
    expect(config).toEqual({});
  });
});
