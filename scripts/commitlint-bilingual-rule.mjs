/**
 * commitlint-bilingual-rule.mjs — custom commitlint rules enforcing the
 * bilingual commit format defined in ai/standards/options/bilingual.ai.yaml
 * (`<type>(<scope>): <English subject>. <Chinese subject>.` header +
 * English paragraph(s) then Chinese paragraph(s) in the body).
 *
 * Exemption (XSPEC-324 R2/AC-3): exemption is decided ONCE, from the
 * subject line only. A commit whose subject contains no CJK character at
 * all is treated as a pure-English/automated commit (e.g. dependabot
 * `chore(deps): bump X from 1 to 2`) and both the subject and body checks
 * are skipped. This mirrors real UDS repo history — dependabot commits are
 * plain English, hand-written commits are bilingual — without having to
 * name-match specific bot authors.
 *
 * Deciding the body's exemption from the body's OWN CJK content (instead of
 * the subject's) would be wrong: an author who writes a bilingual subject
 * but then forgets the Chinese body paragraph entirely produces a body with
 * zero CJK characters — exactly the "missing Chinese body" case this rule
 * exists to catch, not a case to wave through as "must be automated".
 *
 * The mixed-language-paragraph heuristic intentionally only flags a
 * paragraph that contains BOTH a run of 4+ consecutive Latin words AND a
 * run of 4+ consecutive Hanzi characters. This matches the literal
 * bad_example in bilingual.ai.yaml ("Add login form and 新增登入表單 for
 * better UX.") while NOT flagging legitimate bilingual paragraphs that keep
 * a technical term in English inside an otherwise-Chinese sentence (e.g.
 * "整合 Google OAuth2 SDK" — 3 Latin tokens, below the 4-word threshold),
 * consistent with the user's own preference to keep terms like Docker/NVIDIA
 * untranslated. It is a heuristic, not full language detection — see the
 * bats tests for the exact boundary it draws.
 */

// CJK Unified Ideographs (Hanzi), matching scripts/split-bilingual.ts.
const HANZI_RE = /[一-鿿]/;
const HANZI_RE_GLOBAL = /[一-鿿]/g;
// Japanese kana + Korean hangul — non-target-language contamination signal,
// reused by self-review-protocol category 7 (XSPEC-324 R1).
const OTHER_CJK_RE = /[぀-ヿ가-힣]/;
const ANY_CJK_RE = /[一-鿿぀-ヿ가-힣]/;
const LATIN_WORD_RUN_RE = /(?:[A-Za-z]+[ \t]+){3,}[A-Za-z]+/;
const HANZI_RUN_RE = /[一-鿿]{4,}/;

/** True if `text` contains no CJK (target or otherwise) character at all. */
function isPureNonCjk(text) {
  return !ANY_CJK_RE.test(text ?? '');
}

/** Mirrors split-bilingual.ts's isChineseLine, applied to a paragraph. */
function isChineseParagraph(text) {
  const chineseChars = (text.match(HANZI_RE_GLOBAL) ?? []).length;
  const totalChars = text.replace(/\s/g, '').length;
  if (totalChars === 0) return false;
  return chineseChars / totalChars > 0.3;
}

/** True if the subject signals bilingual intent (contains any CJK character). */
export function isBilingualSubject(subject) {
  return !isPureNonCjk(subject ?? '');
}

/**
 * Validates the commit subject follows `<English>. <Chinese>[.|。]`.
 * Exempt (passes) when the subject has no CJK character at all — that
 * signals a pure-English/automated commit, not a bilingual one.
 */
export function checkBilingualSubject(subject) {
  const text = subject ?? '';
  if (isPureNonCjk(text)) {
    return { ok: true };
  }
  if (OTHER_CJK_RE.test(text) && !HANZI_RE.test(text)) {
    return { ok: false, reason: 'subject contains non-target-language (kana/hangul) characters with no Chinese' };
  }
  const firstCjkIdx = text.search(HANZI_RE);
  const enPart = text.slice(0, firstCjkIdx);
  const zhPart = text.slice(firstCjkIdx);
  if (!/\.[ \t]+$/.test(enPart)) {
    return { ok: false, reason: 'bilingual subject must separate the English and Chinese segments with ". " (e.g. "Add login form. 新增登入表單.")' };
  }
  if (!zhPart.trim()) {
    return { ok: false, reason: 'bilingual subject is missing its Chinese segment' };
  }
  return { ok: true };
}

/**
 * Validates the commit body has English paragraph(s) then Chinese
 * paragraph(s), with no single paragraph mixing both languages.
 *
 * `subjectIsBilingual` MUST come from {@link isBilingualSubject} applied to
 * this same commit's subject — see the module doc for why the body's own
 * (possibly zero) CJK content cannot be used to decide its own exemption.
 * Exempt (passes) when the subject wasn't bilingual, or there is no body.
 */
export function checkBilingualBody(body, subjectIsBilingual) {
  if (!subjectIsBilingual) {
    return { ok: true };
  }
  const text = (body ?? '').trim();
  if (!text) {
    return { ok: true };
  }
  const paragraphs = text
    .split(/\n[ \t]*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Mixed-paragraph detection runs BEFORE the missing-Chinese-paragraph
  // check: a paragraph like "Add login form and 新增登入表單 for better UX."
  // is English-dominant by character count (fails the 30% isChineseParagraph
  // threshold) even though it clearly contains an inline Chinese sentence —
  // checking mixing first reports the real defect instead of the misleading
  // "missing Chinese paragraph".
  const mixed = paragraphs.filter((p) => LATIN_WORD_RUN_RE.test(p) && HANZI_RUN_RE.test(p));
  if (mixed.length > 0) {
    return { ok: false, reason: 'bilingual body has a paragraph mixing English and Chinese sentences — keep English and Chinese in separate paragraphs' };
  }

  if (!paragraphs.some(isChineseParagraph)) {
    return { ok: false, reason: 'bilingual body is missing a Chinese paragraph (English body found, no Chinese translation)' };
  }

  return { ok: true };
}
