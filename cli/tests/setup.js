import { vi, afterEach, afterAll } from 'vitest';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { isolatedHome } from '../../scripts/lib/isolated-home.mjs';

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

// 🔴 HOME 要由測試自己決定，不能是跑測試那個人的。
//
// 2026-09-29：`bash scripts/pre-release-check.sh` 把 54 個技能資料夾與
// `.manifest.json` 寫進維護者真實的 `~/.claude/skills/`——使用者層技能會遮蔽專案層，
// 他的繁中專案於是靜默地跑英文測試版。實測分兩個來源，測試套件是其中一個：
// `update-language-fidelity.test.js` 與 `update-agents-md-generator-fidelity.test.js`
// 呼叫真的 `updateCommand({ yes: true })`，後者把技能裝進使用者層
// （`~/.claude/skills`，115 個檔案）；`check.test.js` 讓 `~/.uds/update-check.json` 被寫入。
// 它們都 `process.chdir(暫存目錄)`——那隔離的是專案，不是使用者。
//
// 做法是套件層的，不是逐檔修：每個測試檔（每個 worker）在載入任何測試碼之前，
// 先把 HOME／USERPROFILE／XDG_* 換成一個拋棄式目錄。逐檔修就是等下一支新測試
// 再出一次事。真實 HOME 記在 UDS_TEST_REAL_HOME，供 home-isolation.test.js 斷言
// 「現在的 HOME 不是它」——那是這段被拿掉時會紅的東西。
//
// 需要真實 HOME 的測試（極少）應明示地去讀 UDS_TEST_REAL_HOME，而不是靠沒隔離。
if (!process.env.UDS_TEST_REAL_HOME) {
  process.env.UDS_TEST_REAL_HOME = process.env.HOME || process.env.USERPROFILE || '';
}
const isolated = isolatedHome({ prefix: 'uds-test-home-' });
for (const [k, v] of Object.entries(isolated.env)) process.env[k] = v;
afterAll(() => isolated.cleanup());

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
