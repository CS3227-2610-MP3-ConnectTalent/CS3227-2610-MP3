# Design: documentation-only Docusaurus integration

## Package and source layout

- `website/package.json` and its own `package-lock.json`: isolated Docusaurus 3.10.2/React dependencies, Node 24, start/build/serve commands. This follows MP2's npm documentation package and does not alter the Next.js package or pnpm lockfile.
- `website/docusaurus.config.js`: ConnectTalent branding, explicit project Pages URL/base path, classic docs preset, no blog, existing Markdown sources outside the package, strict broken-link/image handling and Mermaid support where required by existing guides.
- `website/sidebars.js`: Overview; User Guide with Getting started, Applicant and HR section links; Developer Guide with setup, architecture, process, testing and deployment section links; existing reflections. Keep the full guides in their existing required files.
- `website/src/css/custom.css`: documentation theme only, responsive layout and light/dark readability. No changes to application CSS.
- `website/.gitignore`: documentation build/cache/dependency output. Generated files are not committed.
- `docs/overview.md`: product-site landing document linking the app and guides; replace the old `docs/index.html` entry point after the new site builds.

Publish only selected public documentation, not all repository Markdown. Keep private files, environment values and workflow logs out of the generated artifact. Relative links to published docs become Docusaurus links; links to code, requirements and evidence become GitHub source links. Necessary escaping of JSX-like Markdown text must preserve its rendered meaning. Reflection prose is not rewritten or personally endorsed by this task.

## GitHub Pages

Update the existing Pages workflow to install/build inside `website/`, upload `website/build`, and deploy from `master`. Documentation PRs run the build without deployment permissions/jobs. Manual publication must also require the `master` ref. Configure the project base path `/CS3227-2610-MP3/` and verify assets and navigation at that path; local development may use a configured root path.

The existing deployment remains until an authorized merge/publish. A failing documentation build should prevent replacing the Pages artifact. No Vercel, Supabase, Auth, AI or database operation is needed. Rollback is to restore the prior documentation workflow/site commit; no application data is affected.

## Reuse and verification

Adapt MP2's package separation, classic preset, sidebar categories and build-to-Pages pattern, with explicit acknowledgement. Do not reuse its product wording, roles or deployment status. Check current Docusaurus primary documentation for configuration compatibility. Validate a clean dependency install, production build, internal links/images, representative generated routes, desktop/mobile site navigation, and the final file-scope diff. Application runtime tests are N/A because no application behavior changes.
