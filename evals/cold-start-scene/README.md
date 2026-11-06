# Cold-start scene maintenance fixture

Northline is an original, fictional observatory. All source, drawings, records
and shaders in this directory were authored for this fixture. It has no external
network dependencies or third-party captures. The fixture is outside the
installable Skill. It is a bounded reference, not a completed reconstruction.

Run from the repository root:

```sh
python3 evals/cold-start-scene/serve.py --port 9381
```

The server binds to loopback and prints the reference URL. It exposes only the
shipped `reference/` at `/reference/` and the designated reconstruction output
at `/reconstruction/`. Authoring, evaluation notes, maps and test directories
are not served. Stop the server with Ctrl+C after the run. A different blank
output directory can be designated with `--output /absolute/path/to/output`.

For a cold start, give a fresh agent the Skill, the URL, the contents of
`request.md`, and a blank writable output directory. If using another port or
output, substitute those two locations in the request. Keep authoring sources,
previous runs and private verification notes out of that agent's starting
packet and filesystem access. The agent may discover the shipped resources
through normal browser requests. Preserve its initial inspection, implementation,
independent review, repair and re-review records. Do not pre-populate the output
with a candidate or hints about the reference's internals.

Review the resulting visible scope, requested customizations, lifecycle and
minimal-host reuse against the actual reference. Use real input through the
relevant transitions and recovery, rather than accepting screenshots of idle
and settled endpoints as evidence of motion equivalence. A stated limitation
does not make a missing required behavior pass. Keep generated implementations,
browser captures and review records out of the public fixture commit.

The maintainable original reference lives in `authoring/`. To regenerate the
shipped, minified ESM chunks, use an existing esbuild installation:

```sh
ESBUILD_PATH=/path/to/node_modules/esbuild node evals/cold-start-scene/build.mjs
```

The helper resolves an existing local `esbuild` package when `ESBUILD_PATH` is
unset; it does not install or modify dependencies. Shipped files have no
source maps. Use native Chrome WebGL for the reference. It uses ordinary RGBA8
textures and does not require float texture extensions. Browser automation is
supplied by the evaluation environment, not by the Skill or this fixture.

This scenario exercises one local scene at desktop and narrow widths. It does
not establish fidelity across all websites, physical touch devices, browsers
or GPU drivers.
