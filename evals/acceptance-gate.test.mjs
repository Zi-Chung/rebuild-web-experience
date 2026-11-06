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
    const contract = { schema_version: 2, mode: 'audit',
      request: 'Rebuild the selected interaction as an editable reusable component.', criteria: [
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

test('legacy contracts without an explicit v2 schema and mode fail closed', () => fixture(async ({ contract, contractFile, report, check }) => {
  delete contract.schema_version;
  delete contract.mode;
  await writeFile(contractFile, JSON.stringify(contract));
  report.contract_sha256 = sha(await readFile(contractFile));
  const { status, output } = await check();
  assert.equal(status, 1);
  assert.ok(output.blockers.some((blocker) => blocker.includes('schema_version')));
}));

test('audit records cannot chain prerequisites, including empty or null fields', () => fixture(async ({ contract, contractFile, report, check }) => {
  for (const [key, value] of [['preflight', null], ['proofs', []]]) {
    contract[key] = value;
    await writeFile(contractFile, JSON.stringify(contract));
    report.contract_sha256 = sha(await readFile(contractFile));
    assert.equal((await check()).status, 1);
    delete contract[key];
  }
}));

async function rebuildFixture(run, ids = ['warp']) {
  return fixture(async (context) => {
    const { root, contract, contractFile, report, check } = context;
    await writeFile(path.join(root, 'qa/reference.json'), '{"reference":"direct observation"}\n');
    await writeFile(path.join(root, 'src/proof-input.js'), 'export const displacement = 0.5;\n');
    await writeFile(path.join(root, 'qa/proof.json'), '{"proof":"critical output observed"}\n');
    const file = async (name) => ({ path: name, sha256: sha(await readFile(path.join(root, name))) });
    async function audit(name, criteria, criticalFeatures) {
      const childContract = { schema_version: 2, mode: 'audit', request: contract.request,
        criteria: criteria.map((id) => ({ id, required: true, expectation: 'Observed behavior meets the scoped request.', basis: 'Direct reference evidence.' })) };
      if (criticalFeatures !== undefined) childContract.critical_features = criticalFeatures;
      const childReport = { contract_sha256: '', round: 1, implementer: report.implementer,
        reviewer: { id: 'independent-stage-reviewer', independent: true },
        revision: { files: [await file(name === 'preflight' ? 'qa/reference.json' : 'src/proof-input.js')] },
        results: await Promise.all(criteria.map(async (id) => ({ id, status: 'passed', notes: 'The required observation is recorded.',
          evidence: [await file(name === 'preflight' ? 'qa/reference.json' : 'qa/proof.json')] }))) };
      const descriptor = { contract: { path: `qa/${name}-contract.json`, sha256: '' },
        report: { path: `qa/${name}-report.json`, sha256: '' } };
      async function save({ approveContract = true, pin = true } = {}) {
        const contractBytes = JSON.stringify(childContract);
        await writeFile(path.join(root, descriptor.contract.path), contractBytes);
        if (approveContract) childReport.contract_sha256 = sha(contractBytes);
        const reportBytes = JSON.stringify(childReport);
        await writeFile(path.join(root, descriptor.report.path), reportBytes);
        if (pin) {
          descriptor.contract.sha256 = sha(contractBytes);
          descriptor.report.sha256 = sha(reportBytes);
        }
      }
      await save();
      return { contract: childContract, report: childReport, descriptor, save };
    }
    const preflight = await audit('preflight', ['reference.validity', 'scope.coverage'], [...ids]);
    const proofs = await Promise.all(ids.map((id, index) => audit(`proof-${index}`, [`critical.${id}`])));
    contract.mode = 'rebuild';
    contract.preflight = preflight.descriptor;
    contract.critical_features = [...ids];
    contract.proofs = proofs.map((proof, index) => ({ id: ids[index], ...proof.descriptor }));
    const checkRebuild = async () => {
      await writeFile(contractFile, JSON.stringify(contract));
      report.contract_sha256 = sha(await readFile(contractFile));
      return check();
    };
    await run({ ...context, preflight, proofs, file, check: checkRebuild });
  });
}

function blocked(result, fragment) {
  assert.equal(result.status, 1);
  assert.ok(result.output.blockers.some((blocker) => blocker.includes(fragment)), JSON.stringify(result.output));
}

test('a complete independently reviewed rebuild chain passes with one shared stage reviewer', () => rebuildFixture(async ({ check }) => {
  const { status, output } = await check();
  assert.equal(status, 0);
  assert.equal(output.mode, 'rebuild');
  assert.deepEqual(output.blockers, []);
}));

test('critical feature classification compares IDs without imposing array order', () => rebuildFixture(async ({ preflight, check }) => {
  preflight.contract.critical_features.reverse();
  await preflight.save();
  assert.equal((await check()).status, 0);
}, ['warp', 'reveal']));

test('an independently approved empty critical feature classification needs no proofs', () => rebuildFixture(async ({ check }) => {
  assert.equal((await check()).status, 0);
}, []));

for (const prerequisite of ['preflight', 'critical_features', 'proofs']) {
  test(`rebuild cannot omit ${prerequisite}`, () => rebuildFixture(async ({ contract, check }) => {
    delete contract[prerequisite];
    blocked(await check(), prerequisite === 'preflight' ? 'Preflight' : prerequisite);
  }));
}

test('missing prerequisite files and missing hash descriptors block a rebuild', () => rebuildFixture(async ({ root, preflight, check }) => {
  const reportPath = preflight.descriptor.report.path;
  preflight.descriptor.report.path = 'qa/absent-preflight.json';
  blocked(await check(), 'Preflight report');
  preflight.descriptor.report.path = reportPath;
  delete preflight.descriptor.contract.sha256;
  blocked(await check(), 'Preflight: contract needs');
  await rm(path.join(root, reportPath));
  blocked(await check(), 'Preflight report');
}));

for (const criterionId of ['reference.validity', 'scope.coverage']) {
  for (const status of ['failed', 'unverified', 'excluded', 'missing']) {
    test(`preflight ${criterionId} ${status} blocks the completed rebuild`, () => rebuildFixture(async ({ preflight, check }) => {
      const result = preflight.report.results.find((entry) => entry.id === criterionId);
      if (status === 'missing') preflight.report.results = preflight.report.results.filter((entry) => entry !== result);
      else result.status = status;
      await preflight.save();
      blocked(await check(), `required criterion has not passed: ${criterionId}`);
    }));
  }
  for (const mutation of ['absent', 'optional']) {
    test(`preflight cannot make ${criterionId} ${mutation}`, () => rebuildFixture(async ({ preflight, check }) => {
      if (mutation === 'absent') {
        preflight.contract.criteria = preflight.contract.criteria.filter((entry) => entry.id !== criterionId);
        preflight.report.results = preflight.report.results.filter((entry) => entry.id !== criterionId);
      } else preflight.contract.criteria.find((entry) => entry.id === criterionId).required = false;
      await preflight.save();
      blocked(await check(), `required criterion is missing or optional: ${criterionId}`);
    }));
  }
}

for (const stage of ['preflight', 'proof']) {
  test(`${stage} must preserve the exact request string, including whitespace`, () => rebuildFixture(async ({ preflight, proofs, check }) => {
    const child = stage === 'preflight' ? preflight : proofs[0];
    child.contract.request += '\n';
    await child.save();
    blocked(await check(), 'original request differs');
  }));

  for (const kind of ['contract', 'report']) {
    test(`changed raw ${stage} ${kind} bytes invalidate their parent pin`, () => rebuildFixture(async ({ root, preflight, proofs, check }) => {
      const child = stage === 'preflight' ? preflight : proofs[0];
      const target = path.join(root, child.descriptor[kind].path);
      await writeFile(target, `${await readFile(target, 'utf8')}\n`);
      blocked(await check(), `${stage === 'preflight' ? 'Preflight' : 'Proof warp'} ${kind}: changed file`);
    }));
  }

  test(`${stage} contract changes also require a fresh child report contract hash`, () => rebuildFixture(async ({ preflight, proofs, check }) => {
    const child = stage === 'preflight' ? preflight : proofs[0];
    child.contract.criteria[0].basis = 'New reference detail.';
    await child.save({ approveContract: false });
    blocked(await check(), 'contract changed or contract hash is missing');
  }));

  for (const mutation of ['schema', 'mode', 'nested-preflight', 'nested-proofs']) {
    test(`${stage} rejects ${mutation} child records`, () => rebuildFixture(async ({ preflight, proofs, check }) => {
      const child = stage === 'preflight' ? preflight : proofs[0];
      if (mutation === 'schema') child.contract.schema_version = 1;
      if (mutation === 'mode') child.contract.mode = 'rebuild';
      if (mutation === 'nested-preflight') child.contract.preflight = child.descriptor;
      if (mutation === 'nested-proofs') child.contract.proofs = [];
      await child.save();
      blocked(await check(), mutation === 'schema' ? 'schema_version' : mutation === 'mode' ? 'must use audit mode' : 'cannot chain');
    }));
  }
}

test('changing the parent request leaves all previously reviewed prerequisites stale', () => rebuildFixture(async ({ contract, check }) => {
  contract.request = ` ${contract.request}`;
  blocked(await check(), 'original request differs');
}));

test('critical classification mismatch and an omitted preflight classification both block', () => rebuildFixture(async ({ contract, preflight, check }) => {
  contract.critical_features = [];
  contract.proofs = [];
  blocked(await check(), 'critical_features differ');
  delete preflight.contract.critical_features;
  await preflight.save();
  blocked(await check(), 'Preflight contract: critical_features must be an array');
}));

for (const stage of ['parent', 'preflight']) {
  for (const mutation of ['duplicate', 'empty', 'nonstring']) {
    test(`${stage} critical feature IDs reject ${mutation} entries`, () => rebuildFixture(async ({ contract, preflight, check }) => {
      const target = stage === 'parent' ? contract : preflight.contract;
      target.critical_features.push(mutation === 'duplicate' ? 'warp' : mutation === 'empty' ? ' ' : null);
      if (stage === 'preflight') await preflight.save();
      blocked(await check(), mutation === 'duplicate' ? 'duplicate critical feature' : 'critical feature IDs');
    }));
  }
}

test('every critical feature needs exactly one matching proof', () => rebuildFixture(async ({ contract, check }) => {
  const proof = contract.proofs[0];
  contract.proofs = [];
  blocked(await check(), 'Missing critical-feature proof: warp');
  contract.proofs = [proof, proof];
  blocked(await check(), 'Duplicate proof: warp');
  contract.proofs = [proof, { ...proof, id: 'unlisted' }];
  blocked(await check(), 'Proof is not listed in critical_features: unlisted');
  contract.proofs = [{ ...proof, id: '' }];
  blocked(await check(), 'Proof: ID must be a nonempty string');
}));

for (const status of ['failed', 'unverified', 'excluded', 'missing']) {
  test(`critical proof ${status} cannot pass the rebuild`, () => rebuildFixture(async ({ proofs, check }) => {
    if (status === 'missing') proofs[0].report.results = [];
    else proofs[0].report.results[0].status = status;
    await proofs[0].save();
    blocked(await check(), 'required criterion has not passed: critical.warp');
  }));
}

test('proof criterion must match its feature ID and remain required', () => rebuildFixture(async ({ proofs, check }) => {
  const proof = proofs[0];
  proof.contract.criteria[0].required = false;
  await proof.save();
  blocked(await check(), 'required criterion is missing or optional: critical.warp');
  proof.contract.criteria[0].required = true;
  proof.contract.criteria[0].id = 'critical.other';
  proof.report.results[0].id = 'critical.other';
  await proof.save();
  blocked(await check(), 'required criterion is missing or optional: critical.warp');
}));

for (const stage of ['preflight', 'proof']) {
  test(`${stage} stale source hashes block even when the final candidate hash is current`, () => rebuildFixture(async ({ root, check }) => {
    await writeFile(path.join(root, stage === 'preflight' ? 'qa/reference.json' : 'src/proof-input.js'), 'changed source');
    blocked(await check(), `${stage === 'preflight' ? 'Preflight' : 'Proof warp'} candidate revision: changed file`);
  }));

  test(`${stage} stale evidence hashes block even when parent pins match`, () => rebuildFixture(async ({ root, check }) => {
    await writeFile(path.join(root, stage === 'preflight' ? 'qa/reference.json' : 'qa/proof.json'), 'changed evidence');
    blocked(await check(), `${stage === 'preflight' ? 'Preflight' : 'Proof warp'} criterion`);
  }));

  for (const mutation of ['different-implementer', 'self-review', 'not-independent']) {
    test(`${stage} identity ${mutation} blocks the final handoff`, () => rebuildFixture(async ({ preflight, proofs, report, check }) => {
      const child = stage === 'preflight' ? preflight : proofs[0];
      if (mutation === 'different-implementer') child.report.implementer = 'another-builder';
      if (mutation === 'self-review') child.report.reviewer.id = report.implementer;
      if (mutation === 'not-independent') child.report.reviewer.independent = false;
      await child.save();
      blocked(await check(), mutation === 'different-implementer' ? 'implementer differs' : mutation === 'self-review' ? 'reviewer must differ from final implementer' : 'independent reviewer record is missing');
    }));
  }
}

test('malformed records produce bounded JSON blockers rather than an exception trace', () => fixture(async ({ report, check }) => {
  report.results = Array.from({ length: 100 }, () => ({ id: 'x'.repeat(1000), status: 'invalid' }));
  const { status, output } = await check();
  assert.equal(status, 1);
  assert.ok(output.blockers.length <= 51);
  assert.ok(output.blockers.every((blocker) => blocker.length <= 300));
}));
