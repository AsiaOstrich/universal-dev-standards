import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
  detectLanguage,
  detectFramework,
  detectAITools,
  detectAll
} from '../../../src/utils/detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEST_DIR = join(__dirname, '../../temp/detector-test');

describe('Detector Utils', () => {
  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('detectLanguage', () => {
    it('should detect JavaScript project with package.json', () => {
      writeFileSync(join(TEST_DIR, 'package.json'), '{}');
      const result = detectLanguage(TEST_DIR);
      expect(result.javascript).toBe(true);
    });

    it('should detect TypeScript project with tsconfig.json', () => {
      writeFileSync(join(TEST_DIR, 'tsconfig.json'), '{}');
      const result = detectLanguage(TEST_DIR);
      expect(result.typescript).toBe(true);
    });

    it('should detect PHP project with composer.json', () => {
      writeFileSync(join(TEST_DIR, 'composer.json'), '{}');
      const result = detectLanguage(TEST_DIR);
      expect(result.php).toBe(true);
    });

    it('should detect Python project with requirements.txt', () => {
      writeFileSync(join(TEST_DIR, 'requirements.txt'), '');
      const result = detectLanguage(TEST_DIR);
      expect(result.python).toBe(true);
    });

    it('should detect Python project with pyproject.toml', () => {
      writeFileSync(join(TEST_DIR, 'pyproject.toml'), '');
      const result = detectLanguage(TEST_DIR);
      expect(result.python).toBe(true);
    });

    it('should detect C# project with .cs file', () => {
      writeFileSync(join(TEST_DIR, 'Program.cs'), '');
      const result = detectLanguage(TEST_DIR);
      expect(result.csharp).toBe(true);
    });

    it('should return all false for empty directory', () => {
      const result = detectLanguage(TEST_DIR);
      expect(result.javascript).toBe(false);
      expect(result.typescript).toBe(false);
      expect(result.php).toBe(false);
      expect(result.python).toBe(false);
      expect(result.csharp).toBe(false);
    });

    it('should detect multiple languages', () => {
      writeFileSync(join(TEST_DIR, 'package.json'), '{}');
      writeFileSync(join(TEST_DIR, 'requirements.txt'), '');
      const result = detectLanguage(TEST_DIR);
      expect(result.javascript).toBe(true);
      expect(result.python).toBe(true);
    });
  });

  describe('detectFramework', () => {
    it('should detect React', () => {
      const pkg = { dependencies: { react: '^18.0.0' } };
      writeFileSync(join(TEST_DIR, 'package.json'), JSON.stringify(pkg));
      const result = detectFramework(TEST_DIR);
      expect(result.react).toBe(true);
    });

    it('should detect Vue', () => {
      const pkg = { dependencies: { vue: '^3.0.0' } };
      writeFileSync(join(TEST_DIR, 'package.json'), JSON.stringify(pkg));
      const result = detectFramework(TEST_DIR);
      expect(result.vue).toBe(true);
    });

    it('should detect Angular', () => {
      const pkg = { dependencies: { '@angular/core': '^17.0.0' } };
      writeFileSync(join(TEST_DIR, 'package.json'), JSON.stringify(pkg));
      const result = detectFramework(TEST_DIR);
      expect(result.angular).toBe(true);
    });

    it('should detect Fat-Free Framework', () => {
      const composer = { require: { 'bcosca/fatfree': '*' } };
      writeFileSync(join(TEST_DIR, 'composer.json'), JSON.stringify(composer));
      const result = detectFramework(TEST_DIR);
      expect(result['fat-free']).toBe(true);
    });

    it('should detect .NET with .csproj file', () => {
      writeFileSync(join(TEST_DIR, 'App.csproj'), '');
      const result = detectFramework(TEST_DIR);
      expect(result.dotnet).toBe(true);
    });

    it('should handle malformed JSON gracefully', () => {
      writeFileSync(join(TEST_DIR, 'package.json'), 'not valid json');
      const result = detectFramework(TEST_DIR);
      expect(result.react).toBe(false);
    });
  });

  describe('detectAITools', () => {
    it('should detect Cursor', () => {
      writeFileSync(join(TEST_DIR, '.cursorrules'), '');
      const result = detectAITools(TEST_DIR);
      expect(result.cursor).toBe(true);
    });

    it('should detect Windsurf', () => {
      writeFileSync(join(TEST_DIR, '.windsurfrules'), '');
      const result = detectAITools(TEST_DIR);
      expect(result.windsurf).toBe(true);
    });

    it('should detect Cline', () => {
      writeFileSync(join(TEST_DIR, '.clinerules'), '');
      const result = detectAITools(TEST_DIR);
      expect(result.cline).toBe(true);
    });

    it('should detect GitHub Copilot', () => {
      mkdirSync(join(TEST_DIR, '.github'), { recursive: true });
      writeFileSync(join(TEST_DIR, '.github', 'copilot-instructions.md'), '');
      const result = detectAITools(TEST_DIR);
      expect(result.copilot).toBe(true);
    });

    it('should detect Claude with .claude directory', () => {
      mkdirSync(join(TEST_DIR, '.claude'), { recursive: true });
      const result = detectAITools(TEST_DIR);
      expect(result.claude).toBe(true);
    });

    it('should detect Claude with CLAUDE.md', () => {
      writeFileSync(join(TEST_DIR, 'CLAUDE.md'), '');
      const result = detectAITools(TEST_DIR);
      expect(result.claude).toBe(true);
    });
  });

  describe('detectAll', () => {
    it('should return all detection results', () => {
      writeFileSync(join(TEST_DIR, 'package.json'), JSON.stringify({ dependencies: { react: '^18.0.0' } }));
      writeFileSync(join(TEST_DIR, '.cursorrules'), '');

      const result = detectAll(TEST_DIR);

      expect(result.languages).toBeDefined();
      expect(result.frameworks).toBeDefined();
      expect(result.aiTools).toBeDefined();
      expect(result.languages.javascript).toBe(true);
      expect(result.frameworks.react).toBe(true);
      expect(result.aiTools.cursor).toBe(true);
    });
  });
});
