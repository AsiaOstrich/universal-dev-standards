import { vi, afterEach } from 'vitest';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🔴 語系要由測試自己決定，不能繼承跑測試那台機器的。
//
// `initCommand` 走 `detectLanguage(null)`，而它讀 `UDS_LOCALE` → `LANG` →
// `LC_ALL` → `LC_MESSAGES`，最後才退回 'en'。測試裡好幾處斷言寫死 'en'，
// 所以在英文語系的機器上（含 CI）全綠，在 zh-TW 的機器上紅——
// **同一份程式碼、同一個 commit，結果由環境決定。**
//
// 2026-09-04 實際踩到：`tests/commands/init.test.js` 的
// 「should save standard options to manifest」在本機得到 `display_language: 'zh-tw'`
// 而斷言寫的是 'en'。CI 從來看不到，因為 GitHub runner 是英文語系。
//
// ⚠️ 這裡固定的是**測試的輸入**，不是把斷言改成配合壞掉的行為。
//
// 🔴 做法是**清空**，不是設成 'en'。第一版寫 `process.env.UDS_LOCALE = 'en'`，
//    當場打破 `tests/unit/i18n/messages.test.js` 三支——那幾支正是在測
//    「detectLanguage 讀不讀得到 LANG」，而 UDS_LOCALE 的優先權蓋過它們自己設的 LANG。
//    **一個為了讓環境不影響測試而設的覆寫，反過來覆寫了測試自己的輸入。**
//    清空則是中性的：`detectLanguage` 找不到任何來源就退回 'en'，
//    而要驗語系偵測的測試自己設 LANG，照樣讀得到。
delete process.env.UDS_LOCALE;
delete process.env.LANG;
delete process.env.LC_ALL;
delete process.env.LC_MESSAGES;

// Test fixtures directory
export const TEST_FIXTURES_DIR = join(__dirname, 'fixtures');
export const TEST_TEMP_DIR = join(__dirname, 'temp');

// Ensure temp directory exists at startup
if (!existsSync(TEST_TEMP_DIR)) {
  mkdirSync(TEST_TEMP_DIR, { recursive: true });
}

// Clean up after all tests
afterEach(() => {
  vi.restoreAllMocks();
});

// Helper to restore console for specific tests
export function restoreConsole() {
  vi.mocked(console.log).mockRestore();
}
