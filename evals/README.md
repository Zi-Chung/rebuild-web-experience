# Behavioral evaluation

These synthetic, locally served pages exercise the reconstruction workflow.
They are maintenance fixtures, outside the installable skill. They contain no
captured merchant data or third-party website code.

## Graphics in an existing host

Run `python3 evals/graphics-host/serve.py` from the repository root. The first
output line is the local port. The server binds only to `127.0.0.1`; stop it
with Ctrl+C after the evaluation.

Give a fresh agent the skill, [the request](graphics-host/request.md), the
reference URL with that port, and the read-only host file. Choose a new output
directory under `evals/graphics-host/` so the same server can preview its files.
The agent may inspect the shipped reference artifacts but should not receive
earlier implementations, diagnoses, or this review guidance. Keep evaluation
outputs out of the commit.

Review the actual result and evidence:

- The reference's visible list, card motion and drawn background are retained
  through their relevant states, including reverse input and pointer response.
- Scroll progress and pin/release geometry remain meaningful after extraction.
- Existing host styles/content survive, and host defaults do not change the
  reconstructed component's typography or geometry.
- Requested data additions, deletion, reordering, text/color edits and supported
  empty/single states work without breaking animation or following content.
- The maintained feature runs without the original page boot; offered lifecycle
  operations dispose owned work and support remounting.
- Conclusions distinguish passed, incomplete and unverified criteria. A missing
  rendering path or an unreachable required state cannot receive a passing mark.

Use loaded, visible states for comparisons. Inspect a difference before setting
a tolerance. The page is deterministic apart from input/render timing, but a
software GPU and physical hardware are still different test environments.

For a negative control, evaluate a separate candidate with an included effect
removed or a scroll input changed while its old thresholds remain. The reviewer
should identify an incomplete result even if the candidate documents that
substitution. Keep this control out of the reconstructing agent's context.

This fixture covers ordinary DOM, scroll-driven animation, WebGL, host CSS and
data changes. It does not establish success on every site, CMS, device or GPU.
Use a real, scoped delivery to check CMS/block behavior when that branch changes;
do not publish private captures as test data.
