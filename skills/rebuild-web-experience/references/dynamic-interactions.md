# Analyze and compare dynamic interactions

Use this method when the result depends on the path, speed, order or duration
of input, or continues changing after input stops. It applies to DOM/CSS motion,
dragging, gestures, scroll choreography, media-driven effects and simulations
as well as Canvas/WebGL. A static component needs only the ordinary acceptance
checks. Select scenarios that distinguish the scoped behavior; a gesture or
device the reference does not support does not become an extra requirement.

## Observe a sequence, not just its endpoints

Use the trustworthy-reference checkpoint in [Preflight](preflight.md) first.
An interaction observed with rendering hidden or state forced is a diagnostic
probe until clean-page replay establishes the real response.

Start from a known visible state with resources loaded. Separate the component's
input-driven response from autonomous motion. Vary one useful input dimension
at a time to learn which history matters:

| Behavior | Discriminating input and observations |
| --- | --- |
| Position or velocity response | Reach the same point slowly and quickly; compare lag, affected area and direction-dependent response. |
| Accumulation or feedback | Repeat or cross a path, then stop; compare buildup, propagation, persistence and recovery. |
| Drag/release or spring motion | Drag, release at different speeds, reverse, and interrupt settling; compare overshoot, constraints, snapping and which state resumes. |
| Scroll choreography | Advance, pause, reverse across a transition and revisit it; compare order, hysteresis, pin/release and continuity. |
| Gesture/state sequence | Exercise supported press/move/release/cancel or multi-input transitions; compare capture, cancellation, focus and ownership where relevant. |

Record the initial state, coordinate space, input path/order, relative timing,
intermediate response and settling/reset behavior for the selected scenarios.
A short video, timestamped image sequence or browser recording can preserve
the process. Sample densely enough to show the observed change; there is no
universal duration, frame count or sampling frequency.

## Identify the mechanism that explains the response

Locate the input owner, state updates and renderer for each dynamic feature.
Follow the data through the relevant chain:

`input → coordinate/time conversion → persistent state → update → rendered output`

Distinguish observed facts, code-supported explanations and hypotheses. Use a
bounded source/runtime probe to resolve an ambiguity that changes the design.
For example, compare repeated paths to distinguish a current-position highlight
from an accumulating field. Appearance alone does not establish fluid dynamics,
a spring model or a particular graphics API.

Trace the quantities that affect the observed behavior:

- **Coordinates:** page, viewport, container, transformed scroll or texture
  space; offsets, scale, aspect ratio and device-pixel ratio at conversions.
- **Time and state:** event deltas, units, velocity estimation, smoothing,
  integration, decay and reset/initialization. Preserve how updates depend on
  elapsed time or frame cadence; nominal per-frame constants are not universally
  interchangeable with per-second values.
- **Rendering:** geometry/masks, simulation buffers or feedback textures when
  present, pass order, blending, color/alpha and postprocessing. For GPU details
  use [Artifact recovery](artifact-recovery.md#canvas-webgl-and-shaders).
- **Transitions:** input capture/release/cancel, boundaries, route or visibility
  changes, and interruptions that affect subsequent input in the requested scope.

Recover a supported algorithm or implement an editable equivalent that explains
the observed scenarios. Hidden internals may remain uncertain if the observable
behavior is established; an original API or numerical method is not mandatory.
Resolve a material mismatch by investigating the relevant chain rather than
adding unrelated decorative effects. Keep useful tuning parameters in their
documented authoring locations.

## Replay and compare the process

Use matching viewport, component dimensions, loaded assets and initial state.
Reset persistent state between trials unless a scenario intentionally tests
accumulation. Define paths in the feature's coordinate space, then map them to
each host; an identical page coordinate or scroll distance may hit a different
state after extraction.

Replay comparable input order, path, pace, pauses and release conditions on
both versions. Use real browser input routing when hit testing, pointer capture,
wheel handling or gestures matter; direct state assignment or a synthetic DOM
event can bypass the very behavior under test. Record injected input timing and
observed sample timing when automating, since scheduler drift can change speed.

Compare during input, immediately after a transition/release, and through
settling or recovery. Align samples by the input event and elapsed time, or by
an observed animation phase when appropriate. Phase alignment must still expose
latency or duration differences; jumping both versions to a common end state
does not test their transitions. Useful observations depend on the effect:

- Geometry, order, boundaries, lag, speed, overshoot and stopping position.
- Shape, footprint, intensity/color, spread, persistence and decay.
- Continuity and state after reversal, cancellation or interruption.

Use continuous captures or time-indexed frames plus measurements that describe
the behavior. A passing idle screenshot, final position, event listener or
non-empty canvas proves only that limited fact. A numeric assertion complements
visible comparisons; it does not establish a perceptually matching effect.

First replay the reference against itself if timing, randomness or GPU variation
makes differences hard to interpret. Separate natural variation and capture
error from a stable reconstruction mismatch. If clocks or randomness are
controlled, establish that the control preserves reference behavior; JS clock
overrides do not control every CSS, media or GPU clock. Cross-frame-rate/device
experiments are warranted for a suspected dependency or an agreed target, not
as an exhaustive matrix for every effect.

## Carry dynamic evidence into acceptance

For each included complex interaction, put observable sequence expectations in
the acceptance contract. Supply the starting/reset conditions, reproducible
input and timing, reference/candidate captures and relevant measurements for
the reviewed revision. Keep these in the existing QA record; a new schema or
test framework for motion samples is unnecessary. Attach critical-proof approvals
through the shared version-2 acceptance records. Describe the tested conditions and remaining
uncertainty rather than claiming universal equivalence.

The independent reviewer replays the discriminating scenarios and inspects the
dynamic output directly. Matching layout or a generic "behavior passed" record
does not cover an untested complex effect. A material mismatch remains failed;
missing dynamic evidence remains unverified. The record checker verifies hashes
and reported status, not motion fidelity. Repair and re-review follow
[Independent review loop](review-loop.md). User-approved tolerances can bound
comparison; implementation difficulty cannot establish a new tolerance.
