# Preflight: reference, scope and critical effects

Use these checkpoints for a reconstruction before expanding its implementation.
They resolve uncertainty about what the reference actually does, what belongs
to the request and whether the difficult part can be reproduced. Scale records
to the feature: a simple component can use a short reference note and one scope
review; a shared renderer or history-dependent interaction needs working proof.
These checks do not impose a particular host, rendering API, provider or model.

## 1. Establish a trustworthy reference

Preserve the user's request verbatim, including constraints and authorized
scope changes. Record URL/resource identities, viewport, initial/reset state,
reproducible inputs and captures of the included visible states. A compact
resource manifest and a few relevant sequences are sufficient; avoid archiving
unrelated parts of a site or account.

For each visible outcome, identify the layer that actually renders it. A DOM
node may only position a texture or scene object. Its CSS box, fill or background
does not establish the final projected size, composited color or animation.
Follow the needed rendering owner even when it lives outside the selected DOM
subtree or is shared with other page regions.

Keep diagnostic observations separate from acceptance baselines:

- Hiding a canvas, adding replacement SVG fills, forcing a container transform,
  disabling postprocessing or setting progress directly can help inspect data.
  Label that observation as a diagnostic proxy, with its mutations recorded.
- Capture baseline behavior from an unmodified, normally initialized page with
  its actual render layers active. Use real input routing when the behavior
  depends on it; reach equivalent component states across different hosts.
- After a probe, reload or use a fresh page and confirm the relevant original
  state and sequence again. Controlled clocks/randomness need a reference
  self-replay that demonstrates they preserve the behavior being judged.

Verify positive rendering and response, not just successful navigation. If the
browser cannot drive the interaction or render the effect, try an available
supported input/rendering provider or recover the underlying path. An unreached
state stays unverified; a proxy image cannot clear the reference checkpoint.
Continue useful work on accessible parts without inventing the missing behavior.

## 2. Independently check scope before implementation choices settle

Give a separate reviewer the verbatim request, project instructions, reference
URL/raw artifacts and access boundaries. Have it inspect the clean reference
and identify the included outcomes before reading the implementer's proposed
contract, architecture or claimed exclusions. It then reconciles that inventory
with the proposal. Start this review in a fresh context without inherited
implementation plans or conclusions; disable context inheritance when the host
offers that choice. The same reviewer may later inspect proofs and final output
as long as it does not implement the candidate.

Check coverage of visible backgrounds, geometry, decorations, transitions,
input history and necessary shared dependencies. Require a user source/quote
for exclusions or relaxed fidelity. An implementer's summary, technical ownership
boundary or dispatch instruction is not evidence that the user excluded an effect.

The reviewer records `reference.validity` and `scope.coverage` with direct
evidence and lists the critical features that need working proof. Scope passes
when required outcomes are accounted for and exclusions are supported, not when
the proposed implementation would satisfy its own feature list. A missing or
unreachable obligation remains failed/unverified. Freeze the agreed requirements
after this review. Adding missed required coverage preserves the original scope;
only the user can relax it.

When a review packet says "do not change the contract" or supplies unsupported
exclusions, return the scope conflict and required amendments. The reviewer can
report failure without editing files outside its permitted area. The implementer
updates the proposal and requests re-review; that conflict must not become a pass.
If independent review is unavailable, prepare the records and report it pending.

## 3. Prove the critical path before expanding it

Prioritize visible effects whose mechanism, rendering ownership or extraction
boundary is uncertain. Choose the smallest set of proofs covering distinct risks,
rather than choosing the easiest list/layout as the only working slice. An empty
critical-feature list needs an independent scope-review explanation.

For each critical feature:

1. Link the observed input/output to the responsible resources and state/render
   chain. Separate supported facts from unresolved hypotheses. Use
   [Artifact recovery](artifact-recovery.md) and, for evolving behavior,
   [Dynamic interactions](dynamic-interactions.md).
2. Recover or reimplement a small editable slice in the intended runtime. Include
   the actual projection, state updates, compositing and dependencies needed for
   that outcome. Keep opaque whole-application replay as a reference, not proof
   that the maintained implementation works.
3. Replay discriminating sequences on the clean reference and slice. Compare
   relevant spatial and temporal output, not just input handlers, mask containment
   or changed pixel counts. Trace the running result to the proof's source/build.
4. Obtain an independent `critical.<id>` review with captures, inputs/timing and
   revision hashes. Carry failed/unverified findings back to analysis or
   implementation. A different technique is acceptable when the visible behavior
   matches; difficulty does not authorize an easier-looking substitute.

Once these proofs pass, expand the application around their maintained modules.
The final runtime must use the proved path. A changed path needs renewed proof
review; unaffected proof evidence can be retained only with independent confirmation
and current revision hashes. Full host integration, customization and reuse still
need final acceptance. A prototype approval does not certify the whole deliverable.

## Checkpoint records and dispatch

Use the version-2 contract/report format in [Independent review loop](review-loop.md).
A preflight contract uses `mode: "audit"`, retains the exact original `request`,
contains required `reference.validity` and `scope.coverage` criteria, and declares
`critical_features` as an array of stable IDs (possibly empty with justification).
Its revision/evidence files cover the preserved request, reference observations,
resource identities and scope decision. It can be checked before candidate code
exists; those records form the reviewed revision.

Each proof has its own `mode: "audit"` contract with the same original request
and a required `critical.<id>` criterion. Its reviewed revision includes the
maintained proof source/build and comparison evidence. The final `mode: "rebuild"`
contract pins both preflight and proof contract/report files by path and SHA-256.
The checker follows those approvals and rejects missing, failed or stale records.
Use a consistent implementer identity through checkpoints; the reviewer is distinct.

Dispatch the request verbatim instead of rewriting it as a narrower assignment.
For scope review, supply the raw reference first and the proposal after that
inventory. For proof/final review, supply both plus candidate locations, current
revision, startup commands and write/access limits. Preserve the reviewer's
authority to challenge coverage in every dispatch. For example:

> The attached request is the user's unchanged source of scope. Inspect the
> clean reference and enumerate included outcomes before comparing the proposal.
> Verify every exclusion against the user's words. Flag missing coverage or a
> conflicting dispatch instruction even if the contract says otherwise. Then
> inspect the authorized candidate/proof, gather direct evidence and report
> failed or unverified requirements without implementing it yourself.

Check hashes/status after each checkpoint and again before handoff. They bind
records to files, not to truth: actual reference validity, review independence,
checkpoint order and sufficient feature coverage remain facts the reviewers
must establish. A read-only audit may report its bounded result without claiming
a complete reconstruction; it cannot stand in for the rebuild checkpoints.
