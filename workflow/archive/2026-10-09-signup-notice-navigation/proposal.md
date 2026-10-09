# Proposal: signup notice and existing navigation integration

- Issue: [#40](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/40); related [#36](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/36) / [PR #38](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/38).
- Owner: Paul Cheng; 2026-10-09.
- Baseline: `feat/application-form-details`, `cfcb4c1`, canonical v1.2.
- Status: approved and implemented locally; independent review complete; separately accepted with recorded limits on 2026-10-09. No new branch authorised.

## Problem and scope

The careers header on this branch unconditionally displays Sign in. The accepted #36 implementation already fixes this, but PR #38 is still open and this branch does not contain it. Signup also shows a local-only testing/Mailpit box that the user requested removed.

Reuse #36's reviewed navigation implementation by integrating its commit `ad49995` into this working branch, retaining #39 contact fields. Remove the signup local-testing box and its local-environment conditional, and show the existing neutral email-verification sentence in every environment. Keep Mailpit instructions in development documentation.

No new auth policy, role, schema, SMTP configuration or deployment. No commit, push, PR or new branch is authorised by this repair request. Sign-in behavior beyond the unconditional navigation symptom is not yet proven defective.

## Design and alternatives

Reuse the approved #36 shared account navigation and server-verified role lookup; do not create duplicate auth logic in the careers page. Preserve sign-out error feedback. Resolve combined spec history as v1.3 containing both ACC-005 navigation and APP-005 contact requirements; neither accepted feature is discarded. Preserve unrelated student reflection edits through bounded integration. A new authentication architecture design is unnecessary: #36's [archived design](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/blob/ad499951c749ce973e73629af65283c6ee042fff/workflow/archive/2026-10-09-role-navigation-logout/design.md) supplies it on its branch and commit. Signup notice removal is a narrow presentation edit, with no data/trust-boundary change.

## Acceptance criteria

- AC-01: Signed-in verified Applicant/HR sees Sign out and role-appropriate links on careers; no Sign in link. Guest sees Sign in. Reuse #36/ACC-005 tests and acceptance.
- AC-02: Signup in local and hosted configurations has no Local testing box or mail-viewer URL; neutral verification guidance and form remain. ACC-001 signup behavior unchanged.
- AC-03: Sign out completes to guest navigation; failures remain visible; #39 contact form remains intact.

## Approval

Existing #36 approval/acceptance remains valid for that implementation. Paul approved this bounded integration, presentation removal and [plan](plan.md) via “Approve as written” on 2026-10-09 before implementation. Separate acceptance with recorded limits was received on 2026-10-09; see record.md. No additional product delta: reuse accepted ACC-005 and preserve ACC-001/APP-005; reconcile versions when integrating.
