Use `$rebuild-web-experience` from this repository.

URL: `http://127.0.0.1:<port>/reference/index.html`

Scope: from the Publications heading through the end of the Our studio card
region. Preserve the scoped appearance and interactions. Leave the surrounding
header/footer outside the feature.

Customization: add, remove and reorder data; edit text and colors.

Output: independently reusable JavaScript/CSS, integrated into a copy of the
existing host at `evals/graphics-host/host/index.html`. Keep the original host
file read-only. Preserve its existing global styles and content. Use a fresh
output directory chosen by the evaluator; do not load the original application
as the reconstructed runtime or deploy anything.

Run browser verification and document the supported customization, usage and
actual verification results.
