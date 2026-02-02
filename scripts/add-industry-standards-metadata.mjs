#!/usr/bin/env node

/**
 * Add industry standards metadata to core/*.md files
 *
 * Usage: node scripts/add-industry-standards-metadata.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const CORE_DIR = join(process.cwd(), 'core');

// Industry standards mapping from STANDARDS-REFERENCE.md
const STANDARDS_MAP = {
  'anti-hallucination.md': {
    industry: 'None (UDS original)',
    references: []
  },
  'commit-message-guide.md': {
    industry: 'Conventional Commits 1.0.0',
    references: ['https://www.conventionalcommits.org/']
  },
  'checkin-standards.md': {
    industry: 'SWEBOK v4.0 Chapter 6',
    references: ['https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4']
  },
  'spec-driven-development.md': {
    industry: 'None (Emerging 2025+ methodology)',
    references: ['https://specmatic.io/']
  },
  'security-standards.md': {
    industry: 'OWASP Top 10 (2021), OWASP ASVS v4.0, NIST SP 800-53',
    references: ['https://owasp.org/Top10/', 'https://owasp.org/www-project-application-security-verification-standard/']
  },
  'code-review-checklist.md': {
    industry: 'SWEBOK v4.0 Chapter 10',
    references: ['https://google.github.io/eng-practices/review/']
  },
  'git-workflow.md': {
    industry: 'None (Industry common practice)',
    references: ['https://www.atlassian.com/git/tutorials']
  },
  'versioning.md': {
    industry: 'Semantic Versioning 2.0.0',
    references: ['https://semver.org/']
  },
  'changelog-standards.md': {
    industry: 'Keep a Changelog 1.1.0',
    references: ['https://keepachangelog.com/']
  },
  'testing-standards.md': {
    industry: 'ISTQB CTFL v4.0, ISO/IEC/IEEE 29119',
    references: ['https://istqb.org/']
  },
  'ai-instruction-standards.md': {
    industry: 'None (Emerging AI tool practice)',
    references: []
  },
  'ai-friendly-architecture.md': {
    industry: 'None (Emerging AI collaboration practice)',
    references: []
  },
  'error-code-standards.md': {
    industry: 'RFC 7807, RFC 9457',
    references: ['https://datatracker.ietf.org/doc/html/rfc7807']
  },
  'logging-standards.md': {
    industry: 'RFC 5424, OpenTelemetry, W3C Trace Context',
    references: ['https://opentelemetry.io/']
  },
  'test-completeness-dimensions.md': {
    industry: 'ISTQB AI Testing Syllabus',
    references: ['https://istqb.org/certifications/certified-tester-ai-testing-ct-ai/']
  },
  'test-driven-development.md': {
    industry: 'None (Kent Beck practice, 1999)',
    references: []
  },
  'behavior-driven-development.md': {
    industry: 'None (Dan North practice, 2006)',
    references: []
  },
  'acceptance-test-driven-development.md': {
    industry: 'None (2003-2006 practice)',
    references: []
  },
  'reverse-engineering-standards.md': {
    industry: 'IEEE 830-1998, SWEBOK v4.0 Chapter 9',
    references: []
  },
  'forward-derivation-standards.md': {
    industry: 'JSON Schema 2020-12',
    references: ['https://specmatic.io/']
  },
  'ai-agreement-standards.md': {
    industry: 'ISO 12207 §6.1',
    references: ['https://www.iso.org/standard/63712.html']
  },
  'refactoring-standards.md': {
    industry: 'ISO/IEC 25010 Maintainability',
    references: []
  },
  'requirement-engineering.md': {
    industry: 'IEEE 830-1998, IEEE 29148-2018, SWEBOK v4.0',
    references: ['https://www.computer.org/education/bodies-of-knowledge/software-engineering/v4']
  },
  'performance-standards.md': {
    industry: 'ISO/IEC 25010 Performance Efficiency',
    references: ['https://sre.google/books/']
  },
  'accessibility-standards.md': {
    industry: 'WCAG 2.1/2.2, WAI-ARIA 1.2, Section 508',
    references: ['https://www.w3.org/WAI/WCAG21/quickref/']
  },
  'documentation-structure.md': {
    industry: 'None (Industry convention)',
    references: ['https://diataxis.fr/']
  },
  'documentation-writing-standards.md': {
    industry: 'OpenAPI 3.1, AsyncAPI 2.6, JSON Schema 2020-12',
    references: ['https://www.openapis.org/']
  },
  'project-structure.md': {
    industry: 'Maven Standard Directory Layout',
    references: ['https://github.com/golang-standards/project-layout']
  },
  'virtual-organization-standards.md': {
    industry: 'ISO 12207 §6.2',
    references: ['https://www.iso.org/standard/63712.html']
  }
};

function addMetadataToFile(filePath, filename) {
  const mapping = STANDARDS_MAP[filename];
  if (!mapping) {
    console.log(`⚠ No mapping for ${filename}, skipping`);
    return false;
  }

  let content = readFileSync(filePath, 'utf8');

  // Check if already has Industry Standards
  if (content.includes('**Industry Standards**:')) {
    console.log(`✓ ${filename} already has metadata`);
    return false;
  }

  // Find the **Scope**: line and add after it
  const scopeRegex = /(\*\*Scope\*\*:\s*\w+)\n/;
  const match = content.match(scopeRegex);

  if (!match) {
    console.log(`⚠ ${filename} has no Scope field, skipping`);
    return false;
  }

  // Build new metadata lines
  let newMetadata = `${match[1]}\n**Industry Standards**: ${mapping.industry}\n`;

  if (mapping.references.length > 0) {
    const refs = mapping.references.map(url => {
      const domain = new URL(url).hostname.replace('www.', '');
      return `[${domain}](${url})`;
    }).join(', ');
    newMetadata += `**References**: ${refs}\n`;
  }

  content = content.replace(scopeRegex, newMetadata);

  writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Updated ${filename}`);
  return true;
}

function main() {
  console.log('Adding industry standards metadata to core/*.md files...\n');

  const files = readdirSync(CORE_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('README'));

  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = join(CORE_DIR, file);
    if (addMetadataToFile(filePath, file)) {
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
}

main();
