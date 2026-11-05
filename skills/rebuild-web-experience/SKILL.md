---
name: rebuild-web-experience
description: Reconstruct a website, scoped page, component, interaction, or visual effect from a URL into a frontend project that preserves its appearance and behavior and is runnable, editable, and independently reusable. Use for web reverse engineering and reconstruction from delivered HTML/CSS/JavaScript or observed behavior. Supports existing projects and standalone output; REA is optional. Use ordinary repository workflows for changes already covered by available source.
---

# Rebuild Web Experience

Deliver a frontend that preserves the scoped appearance and behavior and that
the user can run, change, and reuse. Give each requested feature an understandable
maintenance entry point. A running copy of an opaque original application is
an intermediate reference, not the finished reconstruction.

## Establish the contract

Accept a URL and a bounded scope: routes, a page region, an effect, interactions,
or a combination. Resolve the scope from the conversation before asking again.
Record these in the project's normal documentation:

- Target URL and included routes/components, with important visible states and
  explicit exclusions.
- Behaviors to preserve and aspects the user needs to customize.
- Output location/stack, reuse needs, and target viewport(s).
- Delivery constraints, such as files to supply and host configuration to leave
  for the user.
- External services that need an adapter, local substitute, or further access.

When viewports are unspecified, choose representative sizes from the reference's
layouts and record them as test assumptions rather than blocking on a reply.

Use an existing project's conventions when integrating. For a new project,
choose the smallest suitable frontend stack if none is requested. A plain DOM
effect need not acquire React; an existing CMS need not be replaced. Infer
reasonable defaults and ask only when a missing decision materially affects
the implementation or access. A region-only request includes its necessary
dependencies, not an unsolicited rebuild of the surrounding site.

The default acceptance level requires **scoped visual and behavioral fidelity,
working execution, customization, and independent reuse** together. A selected
region includes its visible backgrounds, decorations, transitions and input
responses even when the user names only its endpoints. Discover these from the
reference; the user need not enumerate them. Keep the surrounding page outside
the deliverable except for dependencies needed to preserve the selected effect.

Read [Acceptance and handoff](references/acceptance.md) before implementation.
Use its feature checks to guide the working slice and final comparison. Read
[Independent review loop](references/review-loop.md) to prepare the acceptance
contract and arrange independent review before starting the final candidate.
Exact pixel equality across devices, real third-party submissions and production
publishing remain additional tasks only when requested. That distinction does
not permit missing effects, different motion or visibly different layouts.

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

Observe entry, transition, settled and exit states relevant to the feature,
including reverse input and responsive changes where they affect it. Record a
compact feature list linking each visible result to its rendering owner and
needed dependencies. A DOM outline can be a placeholder for canvas output;
identify which layer actually draws the effect before choosing an approach.

Preserve only the resources and dependency closure needed for the scope. Record
original URLs and content identities for assets used in the reconstruction;
keep original artifacts separate from maintained source and the final runtime.

Record resource errors before changing behavior so inherited failures can be
distinguished from reconstruction regressions. Request access only for blocked
parts and continue useful work on accessible parts. Inspect only the selected
site/session. Do not acquire unrelated pages or private account data.

For minified bundles, dependency identification, canvas/WebGL, scroll-driven
effects, shaders, data textures or resource URL failures, read
[Artifact recovery](references/artifact-recovery.md) before extracting the effect.

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

Expand until the in-scope features pass their visual and behavioral checks.
Choose recovery or a new implementation per feature based on available code
and observed behavior. Implementation changes may preserve the same result;
material visual or behavioral differences keep the feature incomplete even
when documented. Continue resolving them, and report any remaining gap plainly.
Only a user-approved scope change removes an included effect from acceptance.

Describe inferred names and structure as reconstructed. Attribute original
source only when available artifacts substantiate it; backend internals need
separate evidence.

For feature boundaries, isolated instances, styling and resource ownership,
read [Reusable implementation](references/reusable-implementation.md) before
designing the public interfaces.

## Prove the maintained code is used

Honor the delivery constraints when choosing a preview. If installation or host
configuration is left to the user, use an isolated host or authorized preview
and keep preview scaffolding outside the delivered host configuration.
Run the reconstructed entry in the actual output context. Trace its imports
and resource requests to the maintained build; matching downloaded content can
establish runtime identity. Verify customization separately with a representative
requested source/config edit and observe the rendered change, then restore any
temporary probe. In a read-only audit, preserve files and mark unexercised edit
paths unverified. Runtime identity alone does not establish editability.
A new folder, exported function, or passing import is insufficient evidence.

Verify independently reusable features on a minimal host page without the
original application shell. Keep the full-page composition working when both
deliverables are in scope.

Apply the acceptance checks to the working slice and final delivery. Match test
effort to behavior and uncertainty; investigate differences before adding more
checks or accepting a tolerance.

## Close the acceptance loop

Submit the current candidate to a separate reviewer agent/session using the
original request, this Skill, applicable project instructions and actual runtime.
The reviewer checks the full required scope and gathers evidence directly.
Return failed or unverified required items to implementation, fix them, then
obtain independent re-review of the changed candidate and affected regressions.
Repeat until every required criterion passes; preserve the agreed standards.

Follow [Independent review loop](references/review-loop.md) for the review packet,
failure records, revision tracking and executable completion check. If independent
review or a required check is unavailable, continue useful authorized work and
report the remaining blocker as incomplete. Self-review is useful preparation;
it cannot satisfy the independent-review gate.

## Deliver after acceptance

Declare completion and hand off a finished reconstruction only after independent
review and the completion check pass for the current candidate. A progress or
blocked report may describe existing artifacts, but must retain failed/unverified
items and must not claim the reconstruction is complete.

Deliver maintained source/assets, appropriate build/start and preview commands,
documented customization locations, public usage examples, and the relevant
verification results. Keep one clear development entry and remove superseded
generated copies only after confirming they are unused and recoverable.

Report the accepted scope, demonstrated customization/reuse, and review result.
Separate reconstructed frontend behavior from simulated or unverified services.
A URL reveals delivered frontend resources and observable behavior; unavailable
server logic needs an explicit implementation or adapter. Finish the agreed
frontend work without turning optional device/service audits into blockers.
