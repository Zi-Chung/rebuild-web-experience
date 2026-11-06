# Acceptance and handoff

## Default completion criteria

Judge the requested scope against observable results:

| Criterion | Evidence |
| --- | --- |
| Runs | The delivered entry builds/starts using the documented commands and renders the intended content/effect. |
| Matches the scoped appearance | Compare layout, assets, typography/colors, backgrounds and decorations in relevant animation states at the agreed viewport(s). Material omissions or mismatches remain incomplete; exact pixel equality is required only if requested. |
| Behaves | Relevant input, state changes, navigation and requested responsive states work in the tested host. |
| Is maintained source | The runtime uses the rebuilt implementation; original opaque application fallbacks are accounted for and absent for features claimed as reconstructed. |
| Can be customized | Requested edits are made in their documented source/config location and observed in the browser; affected layout, animation and surrounding content remain correct after the edits. |
| Can be reused | The public feature runs in a minimal host without full-app initialization, and its lifecycle works. |
| Can be handed off | Sources, required assets/dependencies, commands, customization locations and usage examples are supplied. |

Track the visible features identified from the reference in the project's normal
notes. For each, record the original state/input, rebuilt result, comparison
evidence and status: passed, failed, unverified, or explicitly excluded by
the user. Keep this proportional to scope; a small component needs only a short
list. A successful build or a list of files cannot substitute for these results.

An omitted effect, changed animation order, wrong scroll interval, unintended
clipping/overlap or materially different typography/color keeps the relevant
criterion incomplete. Recording a limitation does not pass it. Resolve failures
through the independent review loop; declare completion only after all required
criteria pass on the current candidate. A genuine blocker may end a work session
with an incomplete status, never a completed delivery. Optional device/service
checks outside the agreed scope do not become required completion gates.

Scale evidence to the request. For a data-driven card effect, test requested
addition, deletion and reordering, plus longer text or changed sizing when
editable. Exercise supported counts that change layout, including empty/single
states when allowed. Verify downstream content and animation after changes;
configuration fields alone do not prove customization. A particle effect may
instead need appearance/behavior parameters or a shader change. Keep the
intended final result and restore temporary test edits.

Do not mark a criterion passed because a directory exists or a named export
can be imported. Exercise the path from an authoring change to rendered output.
For reusable features test mount, update and destroy, plus pause, cancellation
or instance isolation when those capabilities are offered.

## Compare behavior without expanding the assignment

For history- or time-dependent interactions, use the observation, mechanism
analysis and sequence comparisons in [Dynamic interactions](dynamic-interactions.md).
Include their observable response in the contract and independent review.

Observe entry, transition, settled and exit states relevant to the feature;
check reverse scroll/input, resizing and responsive changes when they affect
its behavior. Align the reference and reconstruction by component state and
input, with matching viewport and loaded resources. Equal page scroll distances
can represent different animation phases in different hosts.

Check positive visibility and activity before using screenshots as evidence.
An offscreen component, blank overlay, unsupported shader context or duplicate
animation callback key can produce misleading equality. DOM geometry alone
does not establish that a canvas effect renders correctly. If a required state
cannot be reached, record a failure or unverified state rather than comparing
unrelated frames as equivalent.

Use repeatable input and fixed data where helpful. When controlling time or
randomness, first replay the reference against itself. Preserve unique identity
values; changing the random sequence for IDs can change animation subscription
behavior. JavaScript RAF/timer overrides do not automatically control CSS,
video, compositor or GPU clocks.

Inspect differences before changing implementation. Distinguish resource timing,
inherited failures, intentional corrections and actual regressions. Keep original
artifacts intact, and report diagnostic image differences separately from
functional/state assertions. A tolerance is a stated comparison policy, not
proof of original behavior.

Tests should exercise behavior or ownership that could be wrong. Prefer a small
set of relevant integration checks over a large count of source-text matches.
Do not add cross-device frame replay, exhaustive GPU matrices or real service
submissions just to increase test coverage. Add them for the user's contract or
to investigate an observed issue.

## Verify the actual output host

Confirm imports, asset locations, styles and font/image decoding in the project
that will use the feature. A standalone extraction page is useful during
development but does not establish that an existing theme/app uses the new code.
Where stale deployed assets are plausible, compare downloaded content with the
current build or use an equally direct source-change probe.

Exercise the host's normal styles and content before/after the component.
Verify both that the component keeps its intended appearance and that the host
remains intact. For CMS integrations, exercise the relevant add/remove/reload
events without saving unrequested configuration. When access prevents actual
host verification, identify that missing evidence; an isolated preview only
proves the context it ran in.

Keep automated interaction within the selected target and avoid unrequested
real submissions. A mocked backend can validate the frontend integration
contract; label the service as simulated. Access failures for optional account
or device checks do not undo demonstrated frontend reconstruction.

## Handoff

Use the project's existing documentation location. Describe:

- The delivered scope, implemented behavior and material substitutions/gaps.
- How to install dependencies, build if needed, preview and run relevant checks.
  For native modules or static output needing no build, state that explicitly
  and provide the appropriate start/serve command instead of adding a bundler.
- Which files/options control content, styles, animation, rendering and assets.
- How to mount/update/dispose the feature on another page, with asset needs.
- What was actually verified, and which external/device checks were omitted.

Keep current authoring source and generated outputs unambiguous. Preserve a
bounded baseline and concise evidence as appropriate, and clean up owned
temporary servers/browser sessions. Finish when the agreed criteria are met;
retain optional unverified items as limits rather than silently expanding the
completion standard. Apply the final gate in [Independent review loop](review-loop.md)
before claiming completion.
