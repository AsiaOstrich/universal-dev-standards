/**
 * A .NET Framework project was handed four commands, three of which cannot run.
 *
 * Reported 2026-09-16 on a .NET Framework 4.8 Web App (non-SDK-style `.csproj`,
 * `packages.config`). `uds.project.yaml` was generated with `dotnet build`,
 * which fails with `MSB4019: 找不到 Import 專案 …\Microsoft.WebApplication
 * .targets`, and `dotnet list package --vulnerable`, which reports nothing at
 * all for a `packages.config` project because it only reads `PackageReference`.
 *
 * The detector keyed on the presence of any `.csproj` or `.sln`. That extension
 * has meant two incompatible build systems since 2017: an SDK-style project
 * (`<Project Sdk="…">`, `<TargetFramework>`) builds with the `dotnet` CLI; an
 * old-style one (`<TargetFrameworkVersion>`, no Sdk attribute) needs MSBuild.
 *
 * Where a command would fail, this emits nothing rather than something — the
 * unknown-ecosystem branch already does exactly that, "so user fills them in",
 * and a blank a human completes is worth more than a command that looks
 * authoritative and errors on first use.
 */
import { describe, it, expect } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { suggestCommands } from '../../../src/prompts/init.js';

function projectWith(files) {
  const dir = mkdtempSync(join(tmpdir(), 'uds-csharp-'));
  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(join(dir, name), contents);
  }
  return dir;
}

const SDK_STYLE = '<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <TargetFramework>net8.0</TargetFramework>\n  </PropertyGroup>\n</Project>\n';

const OLD_STYLE = '<?xml version="1.0" encoding="utf-8"?>\n<Project ToolsVersion="15.0" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">\n  <PropertyGroup>\n    <TargetFrameworkVersion>v4.8</TargetFrameworkVersion>\n  </PropertyGroup>\n</Project>\n';

describe('suggestCommands for C# projects', () => {
  it('gives dotnet commands to an SDK-style project', () => {
    const dir = projectWith({ 'App.csproj': SDK_STYLE });
    try {
      expect(suggestCommands(dir)).toEqual({
        test: 'dotnet test',
        lint: 'dotnet format --verify-no-changes',
        build: 'dotnet build',
        security: 'dotnet list package --vulnerable'
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('gives msbuild to an old-style project, and nothing where nothing works', () => {
    const dir = projectWith({ 'WebApp.csproj': OLD_STYLE, 'packages.config': '<packages />' });
    try {
      const commands = suggestCommands(dir);

      expect(commands.build).toMatch(/msbuild/i);
      expect(commands.build).not.toMatch(/dotnet/);
      expect(commands.lint).toBe('');
      expect(commands.security).toBe('');
      expect(commands.test).toBe('');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('treats a solution with an old-style project as old-style', () => {
    const dir = projectWith({
      'App.sln': 'Microsoft Visual Studio Solution File, Format Version 12.00\n',
      'WebApp.csproj': OLD_STYLE
    });
    try {
      expect(suggestCommands(dir).build).toMatch(/msbuild/i);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('falls back to dotnet when only a .sln is present and nothing says otherwise', () => {
    const dir = projectWith({ 'App.sln': 'Microsoft Visual Studio Solution File\n' });
    try {
      expect(suggestCommands(dir).build).toBe('dotnet build');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does not let an unreadable project file change the answer', () => {
    const dir = projectWith({ 'Broken.csproj': '' });
    try {
      expect(suggestCommands(dir).build).toBe('dotnet build');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
