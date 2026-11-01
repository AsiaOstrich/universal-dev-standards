// A tiny program that asks two yes/no questions in the order given on its command line and writes what it
// was answered to answers.json (XSPEC-516 R1: the fixture the prompt-answering helper is checked against).
//   node prompt-order-cli.mjs ask A,B     (or B,A: the same questions, the other way round)
// It draws its prompts the way @inquirer/prompts does: a line that starts with `? ` while it waits, rewritten
// as `✔ ` once answered. Enter alone takes the default (A: yes, B: no).
import { createInterface } from 'node:readline';
import { writeFileSync } from 'node:fs';

const QUESTIONS = {
  A: { text: 'Install the extras?', hint: '(Y/n)', byDefault: true },
  B: { text: 'Delete everything?', hint: '(y/N)', byDefault: false }
};
const order = (process.argv[3] ?? 'A,B').split(',');
const answers = {};
let asked = 0;

const rl = createInterface({ input: process.stdin });
const ask = () => {
  if (asked >= order.length) {
    writeFileSync('answers.json', JSON.stringify(answers));
    rl.close();
    // stdin is a pipe the test keeps open, so the process would not end by itself.
    process.stdout.write('done\n', () => process.exit(0));
    return;
  }
  const q = QUESTIONS[order[asked]];
  process.stdout.write(`? ${q.text} ${q.hint} `);
};
rl.on('line', (line) => {
  const key = order[asked];
  const q = QUESTIONS[key];
  const typed = line.trim().toLowerCase();
  answers[key] = typed === '' ? q.byDefault : typed.startsWith('y');
  process.stdout.write(`${typed}\n✔ ${q.text} ${answers[key] ? 'Yes' : 'No'}\n`);
  asked += 1;
  ask();
});
ask();
