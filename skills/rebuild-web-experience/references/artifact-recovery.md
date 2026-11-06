# Artifact recovery

## Select the shortest supported recovery path

Inventory the selected page's entries, chunks, CSS, fonts, media and dynamic
requests. Follow lazy imports through the in-scope states; an initial-page
download alone can omit most of a feature. Retain resource versions and source
identities so later comparisons use a known reference.

Map visible features to DOM/CSS, canvas/WebGL and any shared scene or scroll
controller. Follow masks, background transitions, screen-space paint, geometry
and postprocessing needed to produce the selected region. Extract or adapt
these dependencies locally; selecting a region does not make its shared
rendering dependencies disappear. Compare an alternative implementation against
the same visible states before accepting it as equivalent.

Follow source maps declared by the resource or supplied with the target. When
none are advertised, make extra probes only to answer a specific recovery
question; absence of a map is not a reason to enumerate unrelated paths or stop.

Choose per feature:

| Available evidence | Useful approach |
| --- | --- |
| Original sources or usable source maps | Recover the relevant source graph, then verify it against the running reference. |
| Readable delivered modules | Extract their required dependencies, adapt their host assumptions, and rebuild. |
| Minified bundle with recognizable boundaries | Parse its AST, identify feature and library ownership, split incrementally, and verify behavior. |
| Observable UI with unsuitable or unavailable code | Implement the specified behavior from observations and document the reconstruction. |
| Opaque runtime such as WASM without sufficient internals | Inspect the boundary, use available specialized analysis if useful, and identify retained opaque dependencies or limits. |

Do not claim a feature's internals are editable if its central implementation
still lives inside an opaque payload. If its behavior can be reimplemented,
do that within scope; otherwise report the precise remaining boundary.

## Bundles and dependencies

AST transformations are preferable to regex replacement for JavaScript
bindings, scope, exports and compiler helpers. Preserve evaluation order,
side effects, property descriptors and live bindings during extraction.
Formatting and renaming alone do not recover module boundaries or interfaces.

Recognize bundler wrappers and library signatures without assuming that one
site's bootstrap table applies to another. Describe dependencies with semantic
names as their role becomes known. Avoid making numeric module IDs the public
architecture of the reconstruction.

Use version strings, licenses, source fingerprints, API shape and behavior to
identify third-party code. When a compatible public package is established,
lock and use it rather than maintaining a copied library implementation.
Do not infer a complete dependency tree from a single marker or upgrade during
reconstruction without checking compatibility. Keep framework singletons such
as React consistent across application and library imports.

Recovered custom code may need semantic reconstruction. Use names inferred
from its responsibilities and record uncertainty. Compiler wrappers that remain
necessary for semantics can be isolated and documented; moving an entire
minified implementation into a different folder is not that transformation.

## Assets and URL handling

Resolve relative resources against the correct originating document/module,
including references inside CSS and content documents. Preserve query-string
versions. Keep asset location configurable for reuse and adapt it to the target
host's supported deployment convention.

When an asset is transformed or replaced with editable generation logic, record
the original URL/content identity and its maintained source or generator. Explain
material changes so the handoff preserves that derivation, not just a pile of
downloaded originals.

Verify fonts, image decoding, dynamic detail media, model/data files and CORS
in the actual host. A successful HTTP response is not enough when decoding or
format negotiation changes the input. Do not ship temporary source-site
credentials, analytics, or a dependency on the original website for resources
that the delivered project is intended to own.

## Scroll and layout semantics

Preserve the meaning of animation inputs before reusing formulas or thresholds:
viewport versus container coordinates, element and viewport dimensions, native
versus transformed scroll, normalized ranges, time units and easing domains.
Trace where each progress value is computed. A similarly named ratio is not
evidence of equivalent inputs.

For interactions whose response depends on input history or time, follow
[Dynamic interactions](dynamic-interactions.md) to connect these values to
persistent state and validate the resulting sequence.

Include layout that provides animation time: spacers, sticky ranges, margins,
pinning and release points. Adapt that geometry to the reusable host while
preserving the intended sequence and room for following content. Verify forward
and reverse motion, resize and requested content edits. When measuring layout,
use stable model dimensions or remove/reset active transforms before measuring;
transformed bounds can feed animation back into its own size calculations.

## Canvas, WebGL and shaders

Separate shader source into editable native files when shaders are in scope.
Build-time conversion to strings is a valid runtime interface. Long SVG paths,
lookup tables and geometry buffers are data; group them by responsibility
rather than inventing a separate module for every datum.

Trace the whole rendering path: geometry, simulation inputs, uniforms,
camera/input, shader programs, compositing and postprocessing. Include dynamic
backgrounds and decorations drawn outside the selected DOM subtree. A draw
shader alone does not account for particle behavior. Preserve numeric texture
encodings; a CDN's lossy image conversion can change an otherwise correct effect.

Check actual WebGL context and required capabilities. Validate positive draws
before comparing images: two empty frames are not proof of equivalent shaders.
Record the tested renderer/context, and distinguish physical hardware from a
software backend. Expand GPU/device checks only for the requested targets or
an observed problem.

## Optional specialized analysis

Use REA, if present, for a bounded question such as an unresolved call chain,
artifact inventory, or recorded scenario. Reuse its existing analysis and
evidence rather than repeatedly requesting whole-program output. Treat static
relationships as candidates until runtime evidence supports a behavioral claim.
Equivalent analysis through other AST/browser tools is valid. Keep tool-specific
evidence out of the application's runtime dependencies.
