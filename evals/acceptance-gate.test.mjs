import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const checker = fileURLToPath(new URL('../skills/rebuild-web-experience/scripts/check-acceptance.mjs', import.meta.url));
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');

async function fixture(run) {
  const root = await mkdtemp(path.join(tmpdir(), 'web-acceptance-gate-'));
  try {
    await mkdir(path.join(root, 'src'));
    await mkdir(path.join(root, 'qa'));
    await writeFile(path.join(root, 'src/widget.js'), 'export const enabled = true;\n');
    await writeFile(path.join(root, 'qa/browser.json'), '{"observed":"interaction rendered"}\n');
    const contract = { request: 'Rebuild the selected interaction as an editable reusable component.', criteria: [
      { id: 'interaction', required: true, expectation: 'Reference input changes the visible state.', basis: 'Original request.' },
      { id: 'additional-device', required: false, expectation: 'Additional device sample.', basis: 'Optional coverage.' },
    ] };
    const contractFile = path.join(root, 'qa/contract.json');
    await writeFile(contractFile, JSON.stringify(contract));
    const report = { contract_sha256: sha(await readFile(contractFile)), round: 1, implementer: 'builder',
      reviewer: { id: 'reviewer', independent: true },
      revision: { files: [{ path: 'src/widget.js', sha256: sha(await readFile(path.join(root, 'src/widget.js'))) }] },
      results: [
        { id: 'interaction', status: 'passed', notes: 'Actual input and visible output observed.',
          evidence: [{ path: 'qa/browser.json', sha256: sha(await readFile(path.join(root, 'qa/browser.json'))) }] },
        { id: 'additional-device', status: 'unverified', notes: 'Outside required coverage.' },
      ] };
    const check = async () => {
      await writeFile(path.join(root, 'qa/review.json'), JSON.stringify(report));
      const result = spawnSync(process.execPath, [checker, '--root', root, '--contract', 'qa/contract.json', '--report', 'qa/review.json'], { encoding: 'utf8' });
      assert.equal(result.error, undefined);
      const output = JSON.parse(result.stdout);
      assert.equal(output.ready, result.status === 0);
      return { status: result.status, output };
    };
    await run({ root, contract, contractFile, report, check });
  } finally { await rm(root, { recursive: true, force: true }); }
}

test('all required checks pass while optional unverified coverage remains nonblocking', () => fixture(async ({ check }) => {
  assert.equal((await check()).status, 0);
}));
test('required failure blocks handoff and repaired independent re-review permits it', () => fixture(async ({ report, check }) => {
  report.results[0].status = 'failed';
  assert.equal((await check()).status, 1);
  report.round = 2;
  report.reviewer.id = 'reviewer-round-2';
  report.results[0].status = 'passed';
  assert.equal((await check()).status, 0);
}));
for (const status of ['unverified', 'excluded']) {
  test(`required ${status} cannot be treated as complete`, () => fixture(async ({ report, check }) => {
    report.results[0].status = status;
    assert.equal((await check()).status, 1);
  }));
}
test('a required criterion cannot disappear from the report', () => fixture(async ({ report, check }) => {
  report.results.shift();
  assert.equal((await check()).status, 1);
}));
test('duplicate or invented criterion results block acceptance', () => fixture(async ({ report, check }) => {
  report.results.push({ ...report.results[0] });
  assert.equal((await check()).status, 1);
  report.results.at(-1).id = 'not-in-contract';
  assert.equal((await check()).status, 1);
}));
test('self-review and matching reviewer/implementer identities block acceptance', () => fixture(async ({ report, check }) => {
  report.reviewer.independent = false;
  assert.equal((await check()).status, 1);
  report.reviewer.independent = true;
  report.reviewer.id = report.implementer;
  assert.equal((await check()).status, 1);
}));
test('source edits invalidate the previous approval until re-reviewed', () => fixture(async ({ root, report, check }) => {
  await writeFile(path.join(root, 'src/widget.js'), 'export const enabled = false;\n');
  assert.equal((await check()).status, 1);
  report.round = 2;
  report.reviewer.id = 'new-reviewer';
  report.revision.files[0].sha256 = sha(await readFile(path.join(root, 'src/widget.js')));
  assert.equal((await check()).status, 0);
}));
test('changed contract is detected before adopting a new approved scope', () => fixture(async ({ contract, contractFile, report, check }) => {
  contract.criteria[0].expectation = 'A user-authorized revised interaction.';
  await writeFile(contractFile, JSON.stringify(contract));
  assert.equal((await check()).status, 1);
  report.contract_sha256 = sha(await readFile(contractFile));
  report.round = 2;
  assert.equal((await check()).status, 0);
}));
test('missing, absent or changed passed evidence blocks acceptance', () => fixture(async ({ root, report, check }) => {
  const saved = report.results[0].evidence;
  delete report.results[0].evidence;
  assert.equal((await check()).status, 1);
  report.results[0].evidence = saved;
  await writeFile(path.join(root, 'qa/browser.json'), 'different observations');
  assert.equal((await check()).status, 1);
  await rm(path.join(root, 'qa/browser.json'));
  assert.equal((await check()).status, 1);
}));
test('empty revision and malformed report do not pass', () => fixture(async ({ report, check }) => {
  report.revision.files = [];
  assert.equal((await check()).status, 1);
  report.results = null;
  assert.equal((await check()).status, 1);
}));
test('paths outside the chosen workspace do not pass', () => fixture(async ({ report, check }) => {
  report.revision.files[0].path = '../outside.js';
  assert.equal((await check()).status, 1);
}));
