# Proposal: Docusaurus product documentation

- Issue: [#92](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/92)
- Owner: Paul Cheng; documentation/process only; no canonical product delta.
- Baseline: `origin/develop` at `2a56ba1`; branch `docs/92-docusaurus-guides`.
- Reference: MP2 repository at `249162a37445ed5f725474cc151a904c8f29a0f7`, inspected on 16 October 2026. MP2 isolates Docusaurus in `website/`, reads Markdown in `docs/`, groups guides in a sidebar, and publishes `website/build` through Pages.

## Outcome and boundaries

Publish the existing ConnectTalent User Guide and Developer Guide as a rendered Docusaurus site using the MP2 directory structure and navigation conventions. Retain the current guides as the single source of their content, with section links under User Guide and Developer Guide rather than duplicating prose into separate pages. Include a product overview and navigation to the existing reflection documents.

Allowed changes: `website/**`, documentation frontmatter/Markdown/link compatibility in `docs/**`, the documentation-site instructions in `docs/DeveloperGuide.md`, `.github/workflows/pages.yml`, and this change's workflow/log evidence. Replace the old HTML landing page only as part of the documentation migration. Preserve instructions and personal reflection prose; acknowledge reused MP2 configuration structure. Application `src/**`, tests of the application, Supabase, environment files, app package/lockfiles, and product functionality are excluded.

## Acceptance criteria

| ID       | Observable outcome and evidence                                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOC92-01 | Overview, User Guide and Developer Guide render under the repository Pages base path, with sidebar groups, section navigation and a table of contents. Inspect the built site at desktop/mobile widths. |
| DOC92-02 | Guide text remains substantively unchanged except documentation-site setup, attribution, frontmatter and necessary Markdown/link repairs. Review the content diff.                                      |
| DOC92-03 | Internal guide/reflection links resolve to rendered documentation; source/workflow references point to the GitHub repository. Build fails on broken internal links/images.                              |
| DOC92-04 | An isolated Node 24 Docusaurus package builds reproducibly; no root app package/lockfile changes. Record installation and production build.                                                             |
| DOC92-05 | Pages validates docs on relevant PRs and publishes only the built documentation artifact from `master`; no deployment occurs during local implementation. Inspect workflow conditions and base URL.     |
| DOC92-06 | Final source diff excludes application/database/environment files, and independent review plus separate student acceptance are recorded.                                                                |

## Alternatives and decisions

Keep raw HTML/Markdown: does not provide the requested MP2 Docusaurus site. Copy guides into `website/docs`: rejected because it creates duplicate sources. Split/rewrite all guide sections: deferred to preserve current guide content and existing references. Selected design keeps MP2's independent npm documentation package and leaves the app's pnpm setup untouched.

See [design](design.md), [plan](plan.md), [tasks](tasks.md), and [record](record.md). OPS-003 is relevant to documentation consistency; product specification version remains unchanged.

Approval: Paul answered “Approve plan and implement” to this concrete proposal/design/plan in the conversation on 16 October 2026, before site implementation. Commit/push/PR/publication are excluded from that decision.
