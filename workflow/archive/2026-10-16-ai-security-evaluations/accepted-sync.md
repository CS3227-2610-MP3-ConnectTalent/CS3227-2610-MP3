# Accepted canonical sync — 16 October 2026

Paul separately accepted #94/#95 through **Accept with recorded limits**, replying to `call_6fmXyc10HkLOmFRJ9yZu55wW` after local checks, actual live results and final independent review were presented. This is distinct from initial implementation/live approval (`call_4qylDMjIOpM4D8HWsbQogBkj`).

## Reconciliation

| Accepted delta     | Canonical destination                                 | Equivalence                                                                                                                                                                                                                                                       |
| ------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modified AID-002   | `workflow/specs/applicant-ai-draft.md`                | Separate editable preview, explicit Use/Replace, unchanged letter until adoption, discard/failure/stale/concurrent typing protection, no save/submit authority and fixed human controls. Before/proposal labels are not normative clauses.                        |
| Added SEC-010      | `workflow/specs/security-and-privacy.md`              | Same-origin/media checks before reads, approved gateway, loopback exception outside production, no redirects, streamed 65,536-byte envelope, complete assistant/no tools/refusal and safe failure. Only the proposed-only footer is excluded.                     |
| Added OPS-004      | `workflow/specs/deployment-and-operations.md`         | Synthetic corpus, offline-only CI, bounded human-approved live option, metadata reports, pending human semantics and retained failures. “Proposed comparison” is relabeled the approved #95 comparison; its target/model/dataset/rate/total budget are unchanged. |
| Version/navigation | `workflow/ProductSpec.md`, `workflow/specs/README.md` | v1.16, 16 October 2026; prior accepted role/pipeline/PDF/schedule/loading rules retained.                                                                                                                                                                         |

Canonical sync occurred before moving the complete packet to `workflow/archive/2026-10-16-ai-security-evaluations/`. Files are uncommitted; no sync commit hash exists or is invented. Links and packet preservation are checked during archive closeout.

Acceptance retains seven failed deterministic model checks (baseline 9/12, refined 8/12), no aggregate prompt-improvement claim, pending human semantic quality review, hosted verification and full accessibility. All 24 authorized live calls are consumed. Acceptance grants no further live run, commit, push, PR, migration, deployment or release.

## Pre-PR integration

After the accepted AI commit `ea85872`, develop advanced to `700b273` with PRs #93 and #91. Its independently accepted #90 baseline also used v1.16. The integration retains both accepted histories and publishes the combined canonical baseline as v1.17. No accepted behavior is reversed: APP-001/008 reapplication and AID-002/SEC-010/OPS-004 coexist. The original v1.16 sync-before-archive evidence above remains historical evidence, not a claim that upstream #90 was absent forever.
