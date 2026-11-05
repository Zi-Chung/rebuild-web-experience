---
name: rebuild-web-experience
description: Reconstruct a website, scoped page, component, interaction, or visual effect from a URL into a runnable, editable, independently reusable frontend project. Use for web reverse engineering and reconstruction from delivered HTML/CSS/JavaScript or observed behavior. Supports existing projects and standalone output; REA is optional. Use ordinary repository workflows for changes already covered by available source.
---

# Rebuild Web Experience

Deliver a frontend the user can run, change, and reuse. Match the requested
appearance and behavior while giving each requested feature an understandable
maintenance entry point. A running copy of an opaque original application is
an intermediate reference, not the finished reconstruction.

## Establish the contract

Accept a URL and a bounded scope: routes, a page region, an effect, interactions,
or a combination. Resolve the scope from the conversation before asking again.
Record these in the project's normal documentation:

- Target URL and included routes/components, with important visible states.
- Behaviors to preserve and aspects the user needs to customize.
- Output location/stack, reuse needs, and target viewport(s).
- External services that need an adapter, local substitute, or further access.

Use an existing project's conventions when integrating. For a new project,
choose the smallest suitable frontend stack if none is requested. A plain DOM
effect need not acquire React; an existing CMS need not be replaced. Infer
reasonable defaults and ask only when a missing decision materially affects
the implementation or access. A region-only request includes its necessary
dependencies, not an unsolicited rebuild of the surrounding site.

The default acceptance level is **usable, customizable, independently reusable**.
Pixel-identical frames across every device, real third-party submissions, and
production publishing are additional tasks only when requested. Preserve the
user's stricter requirements when they explicitly specify them.

Example request:

> 使用 $rebuild-web-experience，网址是 https://example.com/gallery。
> 只重建卡片网格和鼠标交互，允许修改数据、配色、间距和动效，
> 输出独立 ESM，能放进其他页面。

## Choose available tools

Use the environment's supported browser, resource capture, filesystem, AST,
build, and testing tools. These capabilities matter; specific products do not.
Inspect delivered source and any advertised/provided source maps before choosing
a recovery approach. Keep additional map probing bounded by a concrete question.

REA is an optional analysis provider for hard-to-follow artifacts, relationships,
or runtime evidence. When it would answer a concrete unresolved question and
is available, use its advertised capabilities and applicable instructions.
Otherwise continue with ordinary browser/code tools. Neither install REA nor
make readiness checks a prerequisite for this skill. If an indispensable
capability is missing, report that capability rather than claiming REA itself
is required.

## Capture a bounded reference

Observe the specified states: initial and settled views, relevant input,
navigation and responsive changes. Preserve only the resources and dependency
closure needed for the scope. Record original URLs and content identities for
assets used in the reconstruction; keep original artifacts separate from
maintained source and from the final runtime.

Record resource errors before changing behavior so inherited failures can be
distinguished from reconstruction regressions. Request access only for blocked
parts and continue useful work on accessible parts. Inspect only the selected
site/session. Do not acquire unrelated pages or private account data.

For minified bundles, dependency identification, shaders, data textures, or
resource URL failures, read [Artifact recovery](references/artifact-recovery.md).

## Reconstruct a working slice

Start with one complete in-scope feature from source through build to browser.
Use this slice to verify asset resolution, imports, styling and initialization
before expanding. Do not postpone actual runtime integration until all files
have been prettified.

Restore semantic names and normal authoring constructs where supported by
evidence. Separate application logic, third-party dependencies, assets, and
editable data. Match public libraries to verified compatible versions where
possible; identify uncertain/custom implementations honestly. Keep algorithms
whose behavior matters rather than silently replacing a difficult effect with
a visually different approximation.

Expand until all agreed states and features work. Choose recovery or a new
implementation per feature based on available code and observed behavior;
document material substitutions and limitations. Describe inferred names and
structure as reconstructed. Attribute original source only when available
artifacts substantiate it; backend internals need separate evidence.

For feature boundaries, isolated instances, styling and resource ownership,
read [Reusable implementation](references/reusable-implementation.md) before
designing the public interfaces.

## Prove the maintained code is used

Run the reconstructed entry in the actual output context. Trace its imports
and resource requests to the maintained build. Use a representative source
change to prove the rendered result changes, then restore a temporary probe.
A new folder, exported function, or passing import is insufficient evidence.

Verify independently reusable features on a minimal host page without the
original application shell. Keep the full-page composition working when both
deliverables are in scope.

Read [Acceptance and handoff](references/acceptance.md) when validating the
working slice and final delivery. Match test effort to behavior and uncertainty;
investigate differences before adding more checks or accepting a tolerance.

## Finish at the agreed level

Deliver maintained source/assets, appropriate build/start and preview commands,
documented customization locations, public usage examples, and the relevant
verification results. Keep one clear development entry and remove superseded
generated copies only after confirming they are unused and recoverable.

Report the working scope, demonstrated customization/reuse, and material gaps.
Separate reconstructed frontend behavior from simulated or unverified services.
A URL reveals delivered frontend resources and observable behavior; unavailable
server logic needs an explicit implementation or adapter. Finish the agreed
frontend work without turning optional device/service audits into blockers.
