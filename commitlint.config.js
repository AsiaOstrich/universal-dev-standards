import { checkBilingualSubject, checkBilingualBody, isBilingualSubject } from './scripts/commitlint-bilingual-rule.mjs';

// XSPEC-324 R2: self-adoption (dogfood) of the bilingual commit format
// defined in ai/standards/options/bilingual.ai.yaml. Exempt when the
// subject has no Chinese at all (see commitlint-bilingual-rule.mjs).
const bilingualPlugin = {
  rules: {
    'bilingual-subject-format': (parsed) => {
      const { ok, reason } = checkBilingualSubject(parsed.subject);
      return [ok, reason];
    },
    'bilingual-body-language-split': (parsed) => {
      const { ok, reason } = checkBilingualBody(parsed.body, isBilingualSubject(parsed.subject));
      return [ok, reason];
    }
  }
};

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [bilingualPlugin],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'test',
        'chore',
        'revert',
        'perf',
        'build',
        'ci'
      ]
    ],
    'subject-case': [0], // Project standards are flexible on case
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'scope-case': [2, 'always', 'lower-case'],
    'bilingual-subject-format': [2, 'always'],
    'bilingual-body-language-split': [2, 'always'],
    // @commitlint/config-conventional defaults both to 100, sized for
    // English-only commits. This repo's real bilingual headers/body lines
    // run far longer (measured over the last 300 commits: header p50=134,
    // p95=192, max=243 chars; body-line p50=75, p95=110 chars) because each
    // line repeats the same content in English then Chinese. 100 was never
    // actually enforced (no git hook wired it in) — raising it here to a
    // realistic ceiling, not disabling the check.
    'header-max-length': [2, 'always', 250],
    'body-max-line-length': [2, 'always', 200]
  }
};
