#!/usr/bin/env node
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const digest = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const detail = (value) => String(value).slice(0, 300);

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: node check-acceptance.mjs --root DIR --contract FILE --report FILE');
    return;
  }
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    if (!['--root', '--contract', '--report'].includes(key) || !args[index + 1] || key in options) {
      throw new Error('Expected --root DIR --contract FILE --report FILE, once each.');
    }
    options[key] = args[index + 1];
  }
  if (!options['--root'] || !options['--contract'] || !options['--report']) {
    throw new Error('Expected --root DIR --contract FILE --report FILE.');
  }
  const root = path.resolve(options['--root']);
  const local = (name) => {
    if (!nonempty(name) || path.isAbsolute(name)) throw new Error('Record paths must be relative to --root.');
    const resolved = path.resolve(root, name);
    const relative = path.relative(root, resolved);
    if (relative === '..' || relative.startsWith(`..${path.sep}`)) throw new Error('Record path leaves --root.');
    return resolved;
  };
  const blockers = [];
  let omitted = 0;
  const block = (message) => {
    if (blockers.length < 50) blockers.push(detail(message));
    else omitted += 1;
  };
  const require = (condition, message) => { if (!condition) block(message); };

  async function readRecord(name, label, expectedHash) {
    try {
      const resolved = local(name);
      if (!(await stat(resolved)).isFile()) throw new Error('not a regular file');
      const bytes = await readFile(resolved);
      if (expectedHash !== undefined) require(hash(bytes) === expectedHash, `${label}: changed file ${name}`);
      const value = JSON.parse(bytes.toString('utf8'));
      if (!isObject(value)) throw new Error('must be a JSON object');
      return { bytes, value };
    } catch (error) {
      block(`${label}: unavailable or invalid record ${detail(name)} (${detail(error.message)})`);
      return null;
    }
  }

  async function verifyFiles(entries, label) {
    require(Array.isArray(entries) && entries.length > 0, `${label}: file evidence is missing.`);
    const seen = new Set();
    for (const file of Array.isArray(entries) ? entries : []) {
      if (!isObject(file) || !nonempty(file.path) || !digest(file.sha256)) {
        block(`${label}: each file needs a path and SHA-256.`);
        continue;
      }
      try {
        const resolved = local(file.path);
        require(!seen.has(resolved), `${label}: duplicate file ${file.path}`);
        seen.add(resolved);
        if (!(await stat(resolved)).isFile()) throw new Error('not a regular file');
        require(hash(await readFile(resolved)) === file.sha256, `${label}: changed file ${file.path}`);
      } catch (error) {
        block(`${label}: unavailable file ${detail(file.path)} (${detail(error.message)})`);
      }
    }
  }

  async function verifyReview(contractRecord, reportRecord, label) {
    const { bytes: contractBytes, value: contract } = contractRecord;
    const { value: report } = reportRecord;
    require(contract.schema_version === 2, `${label}: contract schema_version must be 2.`);
    require(['rebuild', 'audit'].includes(contract.mode), `${label}: contract mode must be rebuild or audit.`);
    require(nonempty(contract.request), `${label}: contract must retain the original request.`);
    if (contract.mode === 'audit') {
      require(!Object.hasOwn(contract, 'preflight') && !Object.hasOwn(contract, 'proofs'),
        `${label}: audit contracts cannot chain preflight or proofs.`);
    }
    require(report.contract_sha256 === hash(contractBytes), `${label}: contract changed or contract hash is missing.`);
    require(Number.isInteger(report.round) && report.round > 0, `${label}: review round must be a positive integer.`);
    require(nonempty(report.implementer), `${label}: implementer identity is missing.`);
    require(isObject(report.reviewer) && nonempty(report.reviewer.id) && report.reviewer.independent === true,
      `${label}: independent reviewer record is missing.`);
    require(report.reviewer?.id !== report.implementer, `${label}: reviewer and implementer must be distinct.`);

    const criteria = new Map();
    require(Array.isArray(contract.criteria) && contract.criteria.length > 0, `${label}: contract criteria are missing.`);
    for (const criterion of Array.isArray(contract.criteria) ? contract.criteria : []) {
      if (!isObject(criterion) || !nonempty(criterion.id)) { block(`${label}: criterion ID is missing.`); continue; }
      require(!criteria.has(criterion.id), `${label}: duplicate contract criterion: ${criterion.id}`);
      require(typeof criterion.required === 'boolean', `${label}: required flag missing: ${criterion.id}`);
      require(nonempty(criterion.expectation) && nonempty(criterion.basis), `${label}: expectation/basis missing: ${criterion.id}`);
      criteria.set(criterion.id, criterion);
    }
    const required = [...criteria.values()].filter((criterion) => criterion.required === true);
    require(required.length > 0, `${label}: contract needs at least one required criterion.`);

    await verifyFiles(report.revision?.files, `${label} candidate revision`);
    const results = new Map();
    require(Array.isArray(report.results), `${label}: review results are missing.`);
    for (const result of Array.isArray(report.results) ? report.results : []) {
      if (!isObject(result) || !nonempty(result.id)) { block(`${label}: result ID is missing.`); continue; }
      require(!results.has(result.id), `${label}: duplicate review result: ${result.id}`);
      require(criteria.has(result.id), `${label}: unknown review criterion: ${result.id}`);
      require(['passed', 'failed', 'unverified', 'excluded'].includes(result.status), `${label}: invalid status: ${result.id}`);
      require(nonempty(result.notes), `${label}: result notes are missing: ${result.id}`);
      results.set(result.id, result);
      if (result.status === 'passed' || result.status === 'failed') {
        await verifyFiles(result.evidence, `${label} criterion ${result.id}`);
      }
    }
    for (const criterion of criteria.values()) {
      const result = results.get(criterion.id);
      require(Boolean(result), `${label}: missing review result: ${criterion.id}`);
      if (criterion.required) require(result?.status === 'passed', `${label}: required criterion has not passed: ${criterion.id}`);
    }
    return { criteria, required, results };
  }

  function featureIds(value, label) {
    require(Array.isArray(value), `${label}: critical_features must be an array.`);
    const ids = new Set();
    for (const id of Array.isArray(value) ? value : []) {
      if (!nonempty(id)) { block(`${label}: critical feature IDs must be nonempty strings.`); continue; }
      require(!ids.has(id), `${label}: duplicate critical feature: ${id}`);
      ids.add(id);
    }
    return ids;
  }

  async function verifyPrerequisite(record, label, expectedCriteria, parentContract, parentReport) {
    if (!isObject(record)) { block(`${label}: prerequisite contract/report records are missing.`); return null; }
    const loaded = {};
    for (const kind of ['contract', 'report']) {
      const entry = record[kind];
      if (!isObject(entry) || !nonempty(entry.path) || !digest(entry.sha256)) {
        block(`${label}: ${kind} needs a path and SHA-256.`);
        continue;
      }
      loaded[kind] = await readRecord(entry.path, `${label} ${kind}`, entry.sha256);
    }
    if (!loaded.contract || !loaded.report) return null;
    const contract = loaded.contract.value;
    const report = loaded.report.value;
    const review = await verifyReview(loaded.contract, loaded.report, label);
    require(contract.mode === 'audit', `${label}: prerequisite contract must use audit mode.`);
    require(contract.request === parentContract.request, `${label}: original request differs from rebuild contract.`);
    require(report.implementer === parentReport.implementer, `${label}: implementer differs from final implementer.`);
    require(report.reviewer?.id !== parentReport.implementer, `${label}: reviewer must differ from final implementer.`);
    for (const id of expectedCriteria) {
      require(review.criteria.get(id)?.required === true, `${label}: required criterion is missing or optional: ${id}`);
    }
    return contract;
  }

  const contractRecord = await readRecord(options['--contract'], 'Final contract');
  const reportRecord = await readRecord(options['--report'], 'Final report');
  let review;
  if (contractRecord && reportRecord) {
    const contract = contractRecord.value;
    const report = reportRecord.value;
    review = await verifyReview(contractRecord, reportRecord, 'Final review');
    if (contract.mode === 'rebuild') {
      const ids = featureIds(contract.critical_features, 'Rebuild contract');
      const preflight = await verifyPrerequisite(contract.preflight, 'Preflight',
        ['reference.validity', 'scope.coverage'], contract, report);
      if (preflight) {
        const preflightIds = featureIds(preflight.critical_features, 'Preflight contract');
        require(ids.size === preflightIds.size && [...ids].every((id) => preflightIds.has(id)),
          'Rebuild critical_features differ from independent preflight.');
      }
      require(Array.isArray(contract.proofs), 'Rebuild contract: proofs must be an array.');
      const seen = new Set();
      for (const proof of Array.isArray(contract.proofs) ? contract.proofs : []) {
        if (!isObject(proof) || !nonempty(proof.id)) { block('Proof: ID must be a nonempty string.'); continue; }
        require(!seen.has(proof.id), `Duplicate proof: ${proof.id}`);
        seen.add(proof.id);
        require(ids.has(proof.id), `Proof is not listed in critical_features: ${proof.id}`);
        await verifyPrerequisite(proof, `Proof ${proof.id}`, [`critical.${proof.id}`], contract, report);
      }
      for (const id of ids) require(seen.has(id), `Missing critical-feature proof: ${id}`);
    }
  }
  if (omitted) blockers.push(`${omitted} additional blockers omitted.`);
  const ready = blockers.length === 0;
  console.log(JSON.stringify({ ready, mode: contractRecord?.value.mode, round: reportRecord?.value.round,
    required: review?.required.length ?? 0,
    passedRequired: review?.required.filter((criterion) => review.results.get(criterion.id)?.status === 'passed').length ?? 0,
    blockers }, null, 2));
  process.exitCode = ready ? 0 : 1;
}

main().catch((error) => {
  console.log(JSON.stringify({ ready: false, blockers: [detail(error.message)] }, null, 2));
  process.exitCode = 1;
});
