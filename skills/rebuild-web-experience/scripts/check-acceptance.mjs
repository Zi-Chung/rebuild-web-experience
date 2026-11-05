#!/usr/bin/env node
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const nonempty = (value) => typeof value === 'string' && value.trim().length > 0;
const digest = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

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
  const contractBytes = await readFile(local(options['--contract']));
  const contract = JSON.parse(contractBytes.toString('utf8'));
  const report = JSON.parse(await readFile(local(options['--report']), 'utf8'));
  const blockers = [];
  const require = (condition, message) => { if (!condition) blockers.push(message); };
  if (!isObject(contract) || !isObject(report)) throw new Error('Contract and report must be JSON objects.');
  require(nonempty(contract.request), 'Contract must retain the original request.');
  require(report.contract_sha256 === hash(contractBytes), 'Contract changed or contract hash is missing.');
  require(Number.isInteger(report.round) && report.round > 0, 'Review round must be a positive integer.');
  require(nonempty(report.implementer), 'Implementer identity is missing.');
  require(isObject(report.reviewer) && nonempty(report.reviewer.id) && report.reviewer.independent === true,
    'Independent reviewer record is missing.');
  require(report.reviewer?.id !== report.implementer, 'Reviewer and implementer must be distinct.');

  const criteria = new Map();
  require(Array.isArray(contract.criteria) && contract.criteria.length > 0, 'Contract criteria are missing.');
  for (const criterion of Array.isArray(contract.criteria) ? contract.criteria : []) {
    if (!isObject(criterion) || !nonempty(criterion.id)) { blockers.push('Criterion ID is missing.'); continue; }
    require(!criteria.has(criterion.id), `Duplicate contract criterion: ${criterion.id}`);
    require(typeof criterion.required === 'boolean', `Required flag missing: ${criterion.id}`);
    require(nonempty(criterion.expectation) && nonempty(criterion.basis), `Expectation/basis missing: ${criterion.id}`);
    criteria.set(criterion.id, criterion);
  }
  const required = [...criteria.values()].filter((criterion) => criterion.required === true);
  require(required.length > 0, 'Contract needs at least one required criterion.');

  async function verifyFiles(entries, label) {
    require(Array.isArray(entries) && entries.length > 0, `${label}: file evidence is missing.`);
    const seen = new Set();
    for (const file of Array.isArray(entries) ? entries : []) {
      if (!isObject(file) || !nonempty(file.path) || !digest(file.sha256)) {
        blockers.push(`${label}: each file needs a path and SHA-256.`);
        continue;
      }
      try {
        const resolved = local(file.path);
        require(!seen.has(resolved), `${label}: duplicate file ${file.path}`);
        seen.add(resolved);
        if (!(await stat(resolved)).isFile()) throw new Error('not a regular file');
        require(hash(await readFile(resolved)) === file.sha256, `${label}: changed file ${file.path}`);
      } catch (error) {
        blockers.push(`${label}: unavailable file ${file.path} (${error.message})`);
      }
    }
  }
  await verifyFiles(report.revision?.files, 'Candidate revision');
  const results = new Map();
  require(Array.isArray(report.results), 'Review results are missing.');
  for (const result of Array.isArray(report.results) ? report.results : []) {
    if (!isObject(result) || !nonempty(result.id)) { blockers.push('Result ID is missing.'); continue; }
    require(!results.has(result.id), `Duplicate review result: ${result.id}`);
    require(criteria.has(result.id), `Unknown review criterion: ${result.id}`);
    require(['passed', 'failed', 'unverified', 'excluded'].includes(result.status), `Invalid status: ${result.id}`);
    require(nonempty(result.notes), `Result notes are missing: ${result.id}`);
    results.set(result.id, result);
    if (result.status === 'passed' || result.status === 'failed') {
      await verifyFiles(result.evidence, `Criterion ${result.id}`);
    }
  }
  for (const criterion of criteria.values()) {
    const result = results.get(criterion.id);
    require(Boolean(result), `Missing review result: ${criterion.id}`);
    if (criterion.required) require(result?.status === 'passed', `Required criterion has not passed: ${criterion.id}`);
  }
  const ready = blockers.length === 0;
  console.log(JSON.stringify({ ready, round: report.round, required: required.length,
    passedRequired: required.filter((criterion) => results.get(criterion.id)?.status === 'passed').length,
    blockers }, null, 2));
  process.exitCode = ready ? 0 : 1;
}

main().catch((error) => {
  console.log(JSON.stringify({ ready: false, blockers: [error.message] }, null, 2));
  process.exitCode = 1;
});
