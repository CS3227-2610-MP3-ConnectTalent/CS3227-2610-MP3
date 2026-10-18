# #98 — MP3 quality follow-up using MP2 feedback

Issue: [#98](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/98). Owner: Paul Cheng. Status: Paul approved the concrete proposal/design omission/plan and branch on 16 October 2026 via “Approve plan and branch” (`call_yvNnzYDvvMdwN32QUSPsu6z2`). Independent review and corrections are complete; Paul separately accepted with recorded limits on 16 October (`call_2jvZyYY6hRfjzEwlzm0IZkmf`).

## Context and goal

Paul provided the MP2 grade feedback and asked that MP3 avoid its mistakes and retain its strengths, using MP2 as a quality template rather than copying its clinic features or Java architecture. The audit is of MP3 source/evidence at `8ae7343` (PR #96), compared with develop `700b273`; it does not certify the hosted product. No private grade-report identity details are copied here.

Confirmed current guide drift: User Guide 3.2 allows reapplication, while 3.6 and the lifecycle table deny it; Developer Guide lists it as a non-goal despite APP-001/008 and #91. User Guide omits scheduled job controls and repeats heading 4.2. Developer Guide references stale baseline v1.8; CONTRIBUTING describes implemented HR jobs/AI as future work.

## Scope and acceptance

1. **DQ-01:** Correct User/Developer Guides and CONTRIBUTING against the selected branch's actual code and canonical requirements, including reapplication, scheduled job times and current section navigation. Use the product index for evolving versions rather than another stale hardcoded baseline.
2. **DQ-02:** Add a compact release-quality checklist with MP3-specific tests/evidence: unsaved values across adjacent résumé/AI actions, explicit saves/reloads, required submission fields, frozen submitted records, server/RLS role denial, job timing, guide/screen parity, exact deployed revision/migration/environment and evaluator workflows. Separate observed passes from remaining checks.
3. **DQ-03:** Retain strengths: distinct roles, focused server/data/validation modules, transactional/race tests, accessible responsive UI checks, practical guides, grounded personal reflections and discoverable committed workflow instructions. Describe coverage accurately as informational; do not introduce a new threshold policy.
4. **DQ-04:** Record the actual audit evidence, 23 passing existing focused unit tests, current CI/PR limits, and a source-linked findings matrix. Include the broad-commit habit as a process improvement; do not claim MP3 has already eliminated it.
5. **DQ-05:** Markdown links, scoped formatting and the Docusaurus production build pass. Application tests for this documentation-only change are N/A; existing runs remain distinct evidence, not newly executed hosted tests.

## Boundaries and decisions

No application behavior, database schema/data, credentials, environment files, hosted accounts/deployments, branch protection or coverage thresholds change. No rewrite of Paul's first-person reflections, completion of John's reflection on his behalf, copying MP2 clinic features, or installation of OpenSpec/Superpowers. MP3 uses its own handmade SDD; the MP2 suggestion to retain toolkit files does not override MP3's toolkit restriction.

Design omission: presentation/evidence correction only, with no interface or architecture change; the existing Docusaurus site renders the guides directly. The additional checklist can be linked as repository evidence without expanding the site document set. Implementation follows approval and explicit branch permission. Commit/push/PR/merge remain separately authorized.
