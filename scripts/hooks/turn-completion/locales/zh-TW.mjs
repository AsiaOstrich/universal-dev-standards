/**
 * Traditional Chinese locale pack for the turn-completion check.
 *
 * Ported from a Python implementation that ran for two weeks on two machines
 * and was defeated five times by its own lesson before settling:
 *   1. enumerated phrases      -> missed a phrase
 *   2. enumerated verbs        -> missed a verb
 *   3. matched its own comment -> comments stripped
 *   4. matched its own backticked examples -> quoting stripped (shared layer)
 *   5. matched a negated clause -> judgement moved to sentence scope
 *
 * The patterns below are the fifth version. Three of the five defects were
 * caught by the corpus before shipping; the two that shipped were the ones no
 * case covered. That asymmetry is the argument for R7.
 *
 * Deliberately NOT ported: a detector for the phrase "要你決定什麼 / 沒有"
 * ("what you need to decide / nothing"). That keys on one project's report
 * template, not on any language, and shipping it would fire never or wrongly
 * for everyone else.
 *
 * @see core/turn-completion-integrity.md
 */

// A request to REPORT BACK is also a request: "tell me when it's done and I will
// verify" is conditional, and its precondition is the human's action. Measured
// 2026-09-09 — the guard blocked exactly that sentence because it only knew how
// to spot requests for information.
//
// Widening this is the dangerous direction (it misses real unkept commitments),
// so the pattern is narrow: a completion word immediately followed by a
// report-back word. A bare "tell me" does not qualify.
const ASKING = new RegExp(
  '(告訴我|給我|貼一段|貼上|提供|你是在哪|在哪裡看到|哪一個|是哪|需要知道' +
  '|請你|麻煩你|等你(裁決|回覆|決定|確認)|要你自己|要你.{0,6}(動手|執行|跑|做)|由你' +
  '|(做完|跑完|試完|裝完|驗完|改完|弄完|完成後|好了|有結果|通了)' +
  '[，,]?.{0,6}(跟我說|告訴我|回報|讓我知道|再說))'
);

// First person + future marker + action verb, within one sentence.
// The window between marker and verb is 24 characters: Chinese objects can be
// long, and a 6-character window (chosen by feel) missed a real commitment
// whose verb sat 11 characters away.
const FUTURE = '(接著|接下來|繼續|下一步|等一下|待會|再|會|要|來|去|先)';
const ACTION =
  '(做|辦|處理|推進|接手|進行|查|修|補|寫|跑|建|驗|測|實作|落地|完成|開始|送出|合併|部署' +
  '|走|看|讀|確認|釐清|整理|標|記|盤|清|接|換|補上|收尾|重跑|重寫)';
const COMMIT = new RegExp(`我(.{0,4})${FUTURE}.{0,24}${ACTION}`, 'g');

// Between "我" and the future marker: a reporting verb means the sentence
// describes a commitment ("我說了下一步"), a negation means it declares the
// opposite ("我不會做").
const REPORTING = /(說|寫|講|提|記|標|引用|舉例|回報|報告)/;
const NEGATION = /(不|沒|未|別|無需|毋須|無須)/;

export function isCommitment(sentence) {
  COMMIT.lastIndex = 0;
  let m;
  while ((m = COMMIT.exec(sentence)) !== null) {
    const gap = m[1];
    if (!REPORTING.test(gap) && !NEGATION.test(gap)) return true;
  }
  return false;
}

export function isAsking(text) {
  return ASKING.test(text);
}

/**
 * The human asking for the turn to end. Kept narrow on purpose: a false
 * positive disables the check for the rest of the session.
 */
const STOP_REQUEST =
  // 🔴 `先停` 曾寫成裸的，而語料當場抓到「先**停用**那份硬編碼清單」——
  // 一句要求做事的指令被讀成叫我停。這個方向的誤判會把守衛整場關掉，
  // 所以 `停` 後面接得出動詞的字一律排除。
  /(先暫停|暫停一下|先停(?![用止掉住])|停一下|先不要(做|動)|不用繼續|今天(先)?到這|先這樣|收工|下班|我要回家|明天再(說|弄|做)|改天再|先擱著|睡了|晚安)/;

export function isStopRequest(text) {
  return STOP_REQUEST.test(text);
}

export const id = 'zh-TW';
export const label = '繁體中文';

export const corpus = [
  [true, '我接著做兩件不需要你的',
    '我接著做兩件不需要你的：先把那幾格作廢的數字在規格裡逐一標掉，再回去處理那份硬編碼的清單。'],
  [true, '動詞在表外：走',
    '我接著往同一個類別的下一個走：那支腳本裡有一行硬編碼的清單，pre-commit 自己就在警告它漏掉兩個。'],
  [true, '受詞很長，動詞隔了 11 個字',
    '我接著把今天這一輪的三個記憶寫進記憶檔——這三個今天各自撞了不只一次。'],
  [true, '否定句旁邊仍有真承諾',
    '那一項我不會動它。我接著把剩下那份清單整理好，然後回報。'],
  [false, '條件式承諾：要資訊才動得了',
    '我需要知道你是在哪一頁看到那個數字的。給我檔名或貼一段，我去查。'],
  [false, '談論承諾，不是做出承諾',
    '本 session 的守衛不用手動重設就已經恢復。下一次我說了下一步卻沒做，它會擋。'],
  [false, '否定句：宣告不做',
    '那個數字會因為引擎自己恢復而變動，與任何改動無關。我不會拿它做任何判斷。'],
  [false, '合法的停止：事情在使用者手上',
    '只剩那一跑要你自己在終端機跑，探測 repo 和判定腳本都備好了。'],
  // 🔴 條件式承諾的第二種形狀：要求回報。前提在使用者手上，所以不是未兌現的承諾。
  [false, '做完跟我說，我再驗',
    'reload 之後不要關掉那個視窗。做完跟我說，我這邊會再獨立驗一次。'],
  [false, '弄完讓我知道',
    '第二行印出 no 才算數。弄完讓我知道，我接著把設定寫回 repo。'],
  [true, '沒有要求回報的承諾（仍必須擋）',
    '設定檔已經改好了。我接著把驗證結果寫進規格，然後回報。'],
];

/**
 * 使用者的訊息，以及它是不是「叫我停」。
 * 標 true 必須豁免；標 false 必須不豁免——**提到停止不等於叫我停止**。
 */
export const stopCorpus = [
  [true, '直接叫停', '先暫停, 我要回家了. 我不會退出程式. 就先暫停'],
  [true, '今天到這', '今天先到這，明天再弄。'],
  [true, '收工', '收工吧，我下班了。'],
  [false, '提到停止但不是叫停', '解釋一下這支 hook 為什麼會擋下回合。'],
  [false, '要求做事而句中有停', '先停用那份硬編碼清單，改成走訪註冊表。'],
  [false, '一般指令', '把偵測器修好然後推上去。'],
];
