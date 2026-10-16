# Evidence record: Docusaurus guides

- Issue: [#92](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/92).
- Owner: Paul Cheng; documentation/process change, no product delta or canonical version change.
- Branch/baseline: `docs/92-docusaurus-guides` from fetched `origin/develop` `2a56ba1`, 16 October 2026.
- Artifacts: [proposal](proposal.md), [design](design.md), [plan](plan.md), [tasks](tasks.md).
- Sessions: [intake](../../../logs/2026-10-16-docusaurus-guides-intake.md), [implementation/review](../../../logs/2026-10-16-docusaurus-guides-implementation.md), [acceptance/closeout](../../../logs/2026-10-16-docusaurus-guides-closeout.md), [PR preparation](../../../logs/2026-10-16-docusaurus-guides-pr.md).
- Status: accepted locally with recorded limits and complete packet archived. Paul answered “Approve plan and implement” before implementation, then separately answered “Accept with recorded limits” after the final checks/independent review, in this conversation on 16 October 2026. Neither decision authorizes commit, push, PR or publication.
- Canonical sync: N/A; documentation presentation/build only, no product behavior delta or specification version change. Verified before archiving at `workflow/archive/2026-10-16-docusaurus-guides/`.
- Handoffs: [primary implementation](handoffs/implementation.md), [separate independent review](handoffs/independent-review.md).
- Git publication authorization: Paul subsequently requested “create a pr , git add and commit” on 16 October 2026. In context this authorizes staging/committing the accepted documentation changes, pushing their branch and opening its PR into `develop`. The actual commit/PR identifiers belong to Git/PR history; no merge or Pages publication is authorized.

## Request and evidence

Paul requested Docusaurus User/Developer guides on the product website, following the MP2 structure, with application code/content files excluded and a new branch as needed. MP2 was inspected through a temporary sparse checkout at `249162a37445ed5f725474cc151a904c8f29a0f7`; its `website/` package consumes `docs/` Markdown, groups guide sections in a sidebar and builds an artifact for Pages.

The initial web-tool fetch could not access the MP2 links; Git inspection succeeded outside the sandbox. GitHub CLI authentication fails in the restricted sandbox but works using the existing logged-in account outside it. No token was copied into repository files. Issue #92 was created before this packet. The root's existing untracked `workflow/changes/2026-10-09-profile-resume/` was preserved.

## Gates and limits

Implementation approval, independent review and separate student acceptance are recorded above. OPS-003 applies to documentation consistency; product behavior/auth/AI/security requirements are unchanged. Application runtime tests are N/A for the docs-only scope; root TypeScript was checked specifically for isolation compatibility. Hosted publication and live-site verification remain later operations. No human personal-reflection verification is inferred.

## Verification and acceptance trace

| Acceptance  | Check/evidence                                                                                                                          | Result and limits                                                                                                                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOC92-01/03 | `npm --prefix website run build`; [browser/link script](verify-site.mjs) against production output served on port 3002                  | Passed: six document routes, 84 local links/anchors, Mermaid SVG and desktop/mobile navigation. Independent reviewer also verified seven HTML files and 201 references. Full accessibility/live-site checks not run. |
| DOC92-02    | Compare User Guide with `origin/develop` after removing frontmatter; inspect Developer Guide/content diff and excluded reflection files | Passed: User Guide prose identical; Developer Guide changes bounded to site instructions/attribution; reflection documents unchanged.                                                                                |
| DOC92-04    | `npm --prefix website ci --no-audit --no-fund` on Node 24.14.0/npm 11.9.0; documentation build; root `tsc --noEmit`                     | Passed. Initial certificate/install and build failures plus repairs are in the implementation handoff. Root package/lockfiles unchanged.                                                                             |
| DOC92-05    | Parse Pages YAML and assert trigger/permissions/master deploy guard/artifact path; independent source review                            | Passed statically; GitHub Actions execution and publication pending. No hosted setting changed.                                                                                                                      |
| DOC92-06    | Git scope/whitespace diff; scoped ESLint/Prettier; separate read-only reviewer                                                          | Passed checks and independent review. Paul separately accepted with recorded limits; packet archived. Git publication remains pending.                                                                               |

Commands used the installed formatter/linter/TypeScript Node entry points after the sandbox's pnpm store-lock restriction. The documentation browser check can be repeated with `node workflow/archive/2026-10-16-docusaurus-guides/verify-site.mjs` while `npm --prefix website run serve` runs. Generated output and screenshots are ignored. No product spec sync is required; the complete packet was archived after separate acceptance. Local acceptance does not establish hosted publication.

## Publication and rollback

After authorized PR review and merge, Pages publishes on a `master` documentation change. A `develop` merge alone does not update the live product website. Publication success must be checked separately. Restore the prior documentation workflow/site commit to roll back; do not change application deployment or database state for this documentation change.
