# Independent review, repair and re-review

This loop applies to scoped pages, components, interactions and visual effects
in existing or standalone projects. Derive checks from the current request;
site names, fixed item counts and a particular host are not universal standards.

## Establish the acceptance contract

Preserve the original request verbatim and propose required outcomes from
this Skill and applicable project instructions. Complete the reference/scope
checkpoints in [Preflight](preflight.md) before accepting the implementation plan.
Give each criterion a stable ID, observable expectation and basis. Distinguish
optional checks from obligations.
Use the project's QA location or a temporary review workspace, outside deployment
configuration when the user leaves installation/configuration for later.

The original request remains authoritative. A reviewer must flag missing required
coverage and obtain an amended contract/re-review if the proposal overlooks it.
"Do not edit the contract" limits file writes, not the authority to fail incomplete
coverage. Preserve existing criterion IDs and
standards through repairs; only an actual user scope change can remove or relax
an included obligation. Record the change and its basis before reviewing again.

## Independent review

Use a separate agent/session that did not implement the candidate. Give it:

- The original request verbatim, this Skill and applicable project instructions.
- The acceptance contract, reference URL/artifacts and relevant baseline data.
- Current source/build locations, a file-hash revision manifest, runtime/preview
  instructions and the permitted access boundaries.

Follow [Preflight's dispatch method](preflight.md#checkpoint-records-and-dispatch)
so the reviewer can challenge scope independently. Pass user-supported exclusions
with their basis; an implementer's narrowed brief cannot replace the request.

Ask it to determine whether the candidate meets the contract, not to endorse
the implementer's conclusion. Supply raw artifacts and commands as needed;
the implementer's success summary is not acceptance evidence. The reviewer
reopens the rules, inspects the current output, runs relevant checks and compares
the reference directly. Verify scope coverage as well as individual criteria.

When complex interactions are included, use the scenarios and evidence in
[Dynamic interactions](dynamic-interactions.md#carry-dynamic-evidence-into-acceptance).
Reproduce the input sequence and inspect its evolving output; endpoint images
and a passing record checker do not establish that the transition matches.

For an existing project, exercise the existing instance/configuration or a
faithful copy preserving its identifiers and data. A fresh default instance
does not establish compatibility with existing content. Label simulated platform
events and isolated checks accurately; preserve authorization boundaries.

If no independent agent/session or external reviewer is accessible, perform
available self-checks and prepare the review packet. Mark independent review
pending and report the limitation. Do not relabel self-review as independent
or declare the final gate passed. Do not require a particular model/provider.

## Failure and repair cycle

1. The reviewer records each criterion as `passed`, `failed`, `unverified` or
   `excluded`. Required `failed` or `unverified` items block completion. Exclusions
   must follow the recorded scope; an implementation gap is not an exclusion.
2. For every failed required item, provide the expected and observed result,
   reproduction input/viewport, current revision and concrete evidence. For an
   unverified item, identify the missing access/capability or unperformed check.
3. Return actionable findings to the implementer. Repair the implementation or
   missing verification within the authorized scope, preserving the baseline.
4. Any source, build or relevant configuration change invalidates approval of
   the previous candidate. Record the new revision and return it for independent
   review. Recheck failures and affected regressions; retain unaffected evidence
   only after the reviewer explicitly confirms it still applies. Review the full
   contract for omissions before approving the new candidate.
5. Repeat while actionable required items remain. Do not substitute elapsed
   effort, a fixed round count, new tolerances or "mostly usable" for acceptance.
   On an actual external blocker or user interruption, report incomplete status,
   remaining IDs and what is needed to resume. Never retry unauthorized external
   actions or fabricate passing evidence to close the loop.

## Executable completion check

Use the bundled checker with Node.js 18+; it uses only built-in modules:

```sh
node <skill-directory>/scripts/check-acceptance.mjs \
  --root <review-workspace> \
  --contract qa/contract.json \
  --report qa/review.json
```

Paths in the records are relative to `--root`. Include all scoped maintained
source, runtime build outputs and relevant configuration in `revision.files`.
The reviewer verifies that this manifest covers the actual candidate. Store
evidence as local files, including captured results with source URLs where
needed. The reviewer owns the final results and revision hashes.

Contract shape (add the other criteria required by the actual request):

```json
{
  "schema_version": 2,
  "mode": "audit",
  "request": "The original user request, including constraints.",
  "criteria": [
    {
      "id": "interaction",
      "required": true,
      "expectation": "The scoped interaction matches the observed reference states.",
      "basis": "Original request and Skill behavior criterion."
    }
  ]
}
```

Use `mode: "audit"` for an authorized read-only comparison or checkpoint, not
for a finished reconstruction. A complete delivery uses `mode: "rebuild"` and
also includes the following fields. Retain the same verbatim `request` and all
required final criteria:

```json
{
  "preflight": {
    "contract": { "path": "qa/preflight/contract.json", "sha256": "contract SHA-256" },
    "report": { "path": "qa/preflight/review.json", "sha256": "report SHA-256" }
  },
  "critical_features": ["rendering"],
  "proofs": [
    {
      "id": "rendering",
      "contract": { "path": "qa/proofs/rendering-contract.json", "sha256": "contract SHA-256" },
      "report": { "path": "qa/proofs/rendering-review.json", "sha256": "report SHA-256" }
    }
  ]
}
```

The preflight contract has `schema_version: 2`, `mode: "audit"`, required
`reference.validity` and `scope.coverage` criteria and its independently reviewed
`critical_features` list. A proof contract is an audit with required
`critical.<id>`. Every child contract repeats the parent's exact original request.
The child's implementer identity matches the final implementer; its reviewer is
distinct. Declare one proof per critical ID; an independently justified empty
list has `proofs: []`. Source/build changes affecting a proof require review
again and updated child and parent hashes. Audit records do not chain prerequisites.

Review shape:

```json
{
  "contract_sha256": "SHA-256 of the contract file bytes",
  "round": 1,
  "implementer": "implementer agent/session ID",
  "reviewer": { "id": "separate reviewer agent/session ID", "independent": true },
  "revision": {
    "files": [{ "path": "src/feature.js", "sha256": "current file SHA-256" }]
  },
  "results": [
    {
      "id": "interaction",
      "status": "passed",
      "notes": "Observed result and any retained-evidence justification.",
      "evidence": [{ "path": "qa/interaction.json", "sha256": "evidence SHA-256" }]
    }
  ]
}
```

The checker rejects missing/duplicate criteria, required non-passes, missing or
changed evidence, a changed contract/candidate, and records without a distinct
independent reviewer. For rebuilds it also validates the pinned preflight and
every critical proof, their required checks, consistent request/identities and
current source/evidence hashes. Missing or stale checkpoint approvals block
handoff even when the final result list is green. Version-1 records need migration
and the newly required verification; adding a version field alone is insufficient.
Optional failures/unverified checks remain visible without
blocking the required scope. Its JSON `ready` result and exit code are usable
by an outer agent runner or CI: only exit 0 permits a completed handoff.

This is a record/freshness gate. It does not determine visual equivalence, prove
the reviewer's identity or actual checkpoint order, or detect an intentionally
incomplete source/critical-feature manifest;
the independent reviewer must establish those facts. Re-run it after the last
change. If execution is unavailable, report the final gate pending, not passed.
