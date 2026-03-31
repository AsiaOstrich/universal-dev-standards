import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const STANDARD_PATH = resolve(import.meta.dirname, '../../../../core/supply-chain-security-standards.md');

describe('SPEC-SCS-001: Supply Chain Security Standards', () => {
  let content;
  beforeAll(() => {
    if (!existsSync(STANDARD_PATH)) { content = ''; return; }
    content = readFileSync(STANDARD_PATH, 'utf-8');
  });

  describe('AC-1: SBOM formats (SPDX and CycloneDX)', () => {
    it('should define SPDX format', () => { expect(content).toMatch(/SPDX/i); });
    it('should define CycloneDX format', () => { expect(content).toMatch(/CycloneDX/i); });
    it('should provide comparison or selection guide', () => { expect(content).toMatch(/compar|select|選型/i); });
  });

  describe('AC-2: Dependency audit 4 dimensions', () => {
    it('should check known vulnerabilities', () => { expect(content).toMatch(/vulnerabilit|漏洞/i); });
    it('should check license compliance', () => { expect(content).toMatch(/license|授權/i); });
    it('should check maintenance status', () => { expect(content).toMatch(/maintenance|維護/i); });
    it('should check version currency', () => { expect(content).toMatch(/outdated|過時|version/i); });
  });

  describe('AC-3: SLSA levels L1-L4', () => {
    it('should define SLSA concept', () => { expect(content).toMatch(/SLSA/); });
    it('should define L1 level', () => { expect(content).toMatch(/L1|Level 1/); });
    it('should define L2 level', () => { expect(content).toMatch(/L2|Level 2/); });
    it('should define L3 level', () => { expect(content).toMatch(/L3|Level 3/); });
    it('should define L4 level', () => { expect(content).toMatch(/L4|Level 4/); });
  });

  describe('AC-4: License compliance matrix', () => {
    it('should define Permissive licenses', () => { expect(content).toMatch(/permissive|MIT|Apache/i); });
    it('should define Copyleft licenses', () => { expect(content).toMatch(/copyleft|GPL/i); });
    it('should define AGPL', () => { expect(content).toMatch(/AGPL/); });
    it('should include compatibility guidance', () => { expect(content).toMatch(/compatib|相容/i); });
  });

  describe('AC-5: Dependency update strategy', () => {
    it('should define patch update strategy', () => { expect(content).toMatch(/patch/i); });
    it('should define minor/major strategy', () => { expect(content).toMatch(/minor|major/i); });
    it('should define lock strategy', () => { expect(content).toMatch(/lock|鎖定/i); });
  });

  describe('AC-6: CI/CD integration', () => {
    it('should define pipeline gate', () => { expect(content).toMatch(/pipeline|CI.*CD/i); });
    it('should block on Critical', () => { expect(content).toMatch(/critical.*block|block.*critical|阻斷/i); });
  });

  describe('AC-7: Dependency health metrics', () => {
    it('should check last update date', () => { expect(content).toMatch(/last.*update|最後.*更新/i); });
    it('should check CVE count', () => { expect(content).toMatch(/CVE/); });
    it('should check maintainer count', () => { expect(content).toMatch(/maintainer|維護者/i); });
  });
});
