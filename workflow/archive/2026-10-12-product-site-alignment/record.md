# #60 review follow-up: product website alignment

Owner: Paul. Date: 12 October 2026. Related PR: #62; issue: #60.

## Accepted closeout

Paul separately replied **“Accept with recorded limits”** on 12 October 2026
after the final checks and independent review. Accepted scope is this static
landing-page repair. Earlier pending gate wording below is historical and
superseded by this decision. No product delta; canonical sync/version change N/A.
Complete one-file packet archived to
`workflow/archive/2026-10-12-product-site-alignment/`.
Hosted workflows and published content remain unverified. Commit, push, merge and
deployment are not authorized by this acceptance. The existing PR #62 needs the
repair and evidence included after a later authorized commit/push.

Archive verification: one-file packet moved with its record SHA-256 unchanged;
archive/session navigation targets resolve and Git whitespace passes. No runtime
checks repeated for evidence-only closeout.

Subsequent publication authorization: Paul explicitly requested **“git commit and
psuh for me”** on 12 October 2026. This authorizes committing and pushing the
accepted repair on the existing documentation branch for PR #62; earlier
non-publication wording describes the preceding gates. No merge or deployment
authorized. Git tool outputs establish actual commit/push results.

## Finding and proposal

The Codex PR reviewer identified stale scaffold/planned-feature claims in
`docs/index.html`, which `.github/workflows/pages.yml` publishes from `docs/`.
Source inspection confirms the contradiction with the rewritten User Guide.

Update the landing page to describe the implemented single-employer portal,
Applicant and HR workflows, and advisory SoCLaaS features. Add the team-supplied
application URL and direct links to the User Guide, Developer Guide and reflection
index. Link Markdown guides through GitHub so they render as documents rather than
assuming GitHub Pages converts raw Markdown to HTML.

Document the distinction between implemented features and verified hosted behavior;
do not claim authenticated hosted testing or release completion. Preserve the
existing responsive layout and accessible section labels.

## Design and scope

Documentation-only; architecture design and canonical product delta are N/A.
Change the static HTML content and associated review/session evidence only. No app
code, schema, deployment configuration or personal reflection edits. Work on the
existing documentation branch. Pages deployment still follows the existing master
push/manual workflow; this repair does not itself publish the site.

## Plan and acceptance checks

1. Replace scaffold/planned claims with a concise implemented-feature overview,
   application link and explicit hosted-verification limit.
2. Include Applicant profile/applications/private PDFs/withdrawal and HR job
   management/review/human status decisions, with AI described as assistance.
3. Check HTML links, required content, formatting and Git whitespace. Application
   suites N/A. Obtain separate read-only review and record findings/rechecks.
4. Request separate human acceptance before closeout/archive. Commit/push require
   a later explicit instruction; update the existing PR rather than opening another.

Approval: Paul replied **“Approve repair plan”** on 12 October 2026 before implementation. This approves the bounded proposal, design omission and plan above. Acceptance and publication are separate gates.

Implementation: `docs/index.html` now describes implemented workflows, links the app and rendered guides on `master` (the Pages publication branch), and retains the hosted-verification limit.

Checks: scoped Prettier and Git whitespace passed. Inline Node assertions passed five HTTPS links, three existing guide targets, current workflow content and explicit hosted-verification limits. Application suites N/A. No published-link or hosted-flow test claimed. Separate reviewer `/root/product_site_followup_review` dispatched; outcome pending. [Session summary](../../../logs/2026-10-12-product-site-alignment.md).

Review correction: default Prettier invocations skipped the ignored HTML file and did not establish a format pass. Reviewer identified this evidence issue; primary ran `corepack pnpm exec prettier --write docs/index.html --ignore-path .gitignore`, then the equivalent `--check` (actual file pass) and Git whitespace (pass). Content/link review found no blocking mismatch; final independent recheck pending.

Final independent recheck: separate read-only execution `/root/product_site_followup_review` reproduced forced scoped formatting, whitespace and five HTTPS/three guide-target checks; no unresolved blocking findings. Content agrees with approved scope and User Guide. Reviewer's initial content assertion needed whitespace normalization after HTML formatting; corrected assertions passed. No edits or hosted requests by reviewer; model/run ID beyond agent name unavailable. Student acceptance, archive and publication remain pending.
