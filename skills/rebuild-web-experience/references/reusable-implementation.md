# Reusable implementation

## Design around the agreed feature

Use the user's output stack or the existing project's conventions. Organize
source by responsibilities that correspond to likely edits: appearance/data,
interaction, animation, rendering and host integration. The quantity and names
of original chunks do not determine the maintained module structure.

Keep one implementation for a feature that appears both in the complete page
and as a reusable component. Supply page-specific state, navigation and content
through an adapter. Avoid copying a second animation or renderer that can drift
from the first.

Expose only the interfaces the feature needs. For a DOM/canvas effect, a useful
shape is `mount(target, options)` returning `update(...)` and `destroy()`, with
`pause()`, `resume()`, `resize()` or a readiness promise where warranted. React
components may use props/effects and unmount for the same ownership contract.
These are examples, not a mandatory API for every type of frontend.

## Prove isolation

A reusable module should:

- Import without mounting UI, starting routing or requiring the full app boot.
- Mount on an arbitrary supported host without unrelated page IDs or globals.
- Own its mutable state, input subscriptions, active work and allocated resources.
- Take content, resource locations and navigation callbacks from the host.
- Dispose its work without stopping or altering other mounted instances.

Declare the supported host baseline and supply its required styles/assets or
platform adapter. A minimal reuse host includes those declared prerequisites
and excludes the original application boot. Verify platform-specific output in
a representative platform fixture as well; a generic DOM mock cannot prove CMS
block rendering or editor integration.

Shared immutable code, data and framework dependencies are normal. A shared
mutable cache, animation scheduler or renderer needs explicit ownership rules.
Multiple-instance tests are relevant when the public API allows multiple mounts.
If a feature intentionally permits only one global owner, document that limit
instead of promising independent instances.

Verify style isolation in both directions. Scope component rules and establish
the inherited defaults it relies on: font/line height, margins, box sizing,
colors and stacking/overflow behavior. A selector prefix prevents some outward
leaks but does not prevent host styles from changing the component. Exercise
the actual host's defaults, not only an otherwise empty page.
Establish display/visibility for intentionally empty decorative nodes when host
rules would otherwise hide them.

A global stylesheet, pointer listener, wheel preventDefault or document-level
scroll reset can make a module appear independent while still taking over
other pages. Listen at the appropriate scope and remove owned listeners on
destruction.

## Preserve lifecycle semantics

Input handling often has a per-frame lifecycle: sampling, update and clearing
transient deltas. Preserve all phases when extracting a frame loop. Verify that
one input ends and that input during pause does not accumulate into an unwanted
jump after resume.

For animation, inspect existing active controllers as well as newly created
ones. Pause/resume must reach the controllers already running. State or parent
render changes can restart loops even when values appear unchanged; compare
the intended interaction and avoid unrelated rerenders changing its phase.

Asynchronous mounts need cancellation and late-result handling. Cleanup must
cover an instance removed before an asset, SDK, permission or other promise
completes. Readiness must reflect real resources and initialization. A failed
request or timeout should produce an observable failure and appropriate retry
behavior, not synthetic success.

Cleanup applies to owned RAF/timers, subscriptions, observers, pending requests,
temporary URLs, DOM/style nodes, and GPU/media resources as applicable. Verify
cleanup by continuing another instance or remounting; checking that one DOM
element disappeared does not establish that work stopped.

## Separate customization from host integration

Expose the user's requested routine edits as data, CSS variables, props or
options when this simplifies use. Keep deeper algorithms as readable source.
Document both kinds of customization; editable source does not imply every
parameter needs a visual settings panel.

Requested content edits must preserve the effect. Recompute derived geometry,
scroll ranges and animation ownership after relevant content/size changes.
Handle supported counts and ordering rather than retaining original fixed-item
assumptions. State real supported limits and verify them against the requested
operations. For CMS/block output, verify the supplied blocks and lifecycle in
the host convention; adding a public JavaScript API is not a substitute.

Use a build system that fits the output. If using ESM/import maps, provide the
map before consumers and verify imports in the real host. Generated assets
may be bundled or minified; keep authoring sources and build steps distinct.
Changing one feature should have a clear maintenance entry even when a build
legitimately updates shared outputs.

Keep backend calls and platform integration in explicit adapters. Use fixtures
or mocks for unrequested external submissions and state their scope. Publishing,
payments, subscription submissions or changes to live account settings are
separate actions requiring the user's authorization; local reconstruction does
not require those actions to prove the feature works.
