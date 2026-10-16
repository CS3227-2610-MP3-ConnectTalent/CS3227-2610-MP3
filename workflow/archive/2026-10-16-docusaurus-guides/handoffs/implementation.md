# Implementation handoff: issue #92

- Execution: primary `/root` Codex execution; implemented the site and ran the checks below. Applying implementer/debugging skills does not create additional agents.
- Input/approval: [proposal](../proposal.md), [design](../design.md), [plan](../plan.md); Paul answered “Approve plan and implement” on 16 October 2026 before implementation.
- Revision: uncommitted documentation diff on `docs/92-docusaurus-guides`, baseline `2a56ba1`.
- Ownership: `website/**`, guide metadata/site instructions, overview, Pages workflow and this packet/log. Application source, root dependencies, Supabase, environment files and reflection prose excluded.

## Result

Created an isolated Docusaurus 3.10.2 package reading the existing guide/reflection Markdown. The sidebar groups guide section links without copying their content. A remark plugin validates repository targets and converts source links into GitHub URLs; GitHub Actions builds pin them to the public build commit. Added a product overview, responsive light/dark theme, Markdown metadata, documentation commands and MP2 attribution. Replaced the old HTML landing source. Pages builds relevant PRs with read-only permissions and publishes only the built artifact from `master`.

## Checks and repairs

- Initial npm install was stopped after certificate-chain errors. A process-local `NODE_USE_SYSTEM_CA=1` retry succeeded without disabling certificate verification. After adding Mermaid's ELK layout dependency, a clean `npm --prefix website ci --no-audit --no-fund` installed 1,390 packages in 39 seconds. No root lockfile/package change.
- First production build failed on missing `@mermaid-js/layout-elk`, which the MP2 reference also declares. Added that documentation dependency.
- Second build compiled but failed during page generation with `require.resolveWeak is not a function`. Traced the generated registry's mixed import/require calls and the package's explicit `type: module`. The Docusaurus maintainer documents this incompatibility in [discussion #11326](https://github.com/facebook/docusaurus/discussions/11326). Removing only that setting, matching MP2, made `npm --prefix website run build` succeed with strict document/link/image checks.
- Scoped ESLint, scoped Prettier and `git diff --check` passed. The sandbox's `corepack pnpm exec` could not open its store-operation lock, so the installed formatter/linter binaries were invoked directly through Node. Root `tsc --noEmit` passed with documentation dependencies/output present.
- A content comparison verified User Guide text is exactly the baseline after stripping only new frontmatter. Git diff confirms no changes to application source/tests, Supabase, environment examples, root package/lockfile or reflection documents.
- Served built output at `http://127.0.0.1:3002/CS3227-2610-MP3/`. [verify-site.mjs](../verify-site.mjs) checks six rendered routes, 84 local links/anchors, Mermaid SVG, desktop navigation, mobile menu navigation and viewport overflow, and fails on browser page errors. Final run passed.
- The first browser run selected the offscreen primary menu in Docusaurus's two-pane mobile sidebar. DOM rectangles confirmed that the second matching link belonged to the visible docs pane. Corrected the selector; assertions pass without force-click. Added a closed-menu assertion and disabled screenshot animations to avoid capturing its closing transition. Desktop/mobile screenshots in ignored `test-results/docs92/` were visually inspected.
- Parsed the Pages YAML and asserted PR targets, read-only build permissions, master-only deploy condition, deployment permissions and `website/build` upload path.

## Limits and next owner

No hosted publication, live Pages verification or full accessibility audit. Application runtime tests are N/A; no application behavior changed. The guide documents clearing generated docs before app-wide lint/format to avoid traversing build output without changing app configuration. Separate review, student acceptance and later explicit commit/push/PR remain distinct gates.
