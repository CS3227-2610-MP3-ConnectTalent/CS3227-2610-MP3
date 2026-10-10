# Plan: #53 résumé-first workflow

Proposed; primary ownership after actual packet approval and explicit branch permission. Preserve all accepted uncommitted #49/#50 and the approved deferred #52 proposal. No implementation or separate reviewer run claimed.

| Task | Dependencies / owned scope | Planned verification |
| --- | --- | --- |
| T00 | Issue, proposal/deltas/design/plan approval and branch permission | Record exact source/date; inspect branch/staging scope without committing. |
| T01 | T00; tests/unit, reusable PDF/request modules under src/lib | Observe enabled first-upload/composition/typing preservation failures before fixes; maintain current PDF limits. |
| T02 | T00; CLI-created migration and SQL/race tests | Profile lifecycle/bucket/grants; atomic first-draft allocation/reservation; exact-operation retry, current-state locks/freeze and profile-source version. Record history through CLI. |
| T03 | T01/02; focused application/profile file services and API routes | Shared validation, distinct authorization, read-only owner download, safe rollback/reconciliation/cleanup; negative direct-API tests. |
| T04 | T03; ApplicationForm/ResumePanel/apply/detail/profile pages | Upload before Save; résumé after work experience/before AI; profile upload and explicit reuse; preserve unsaved values and one-form/type=button controls. |
| T05 | T01–04; local synthetic browser/DB/races | Limits/foreign/HR/unverified denial, source snapshot immutability, upload/save/submit/closure races, mobile/focus, relevant unit/lint/type/build. |
| T06 | T05; separate readonly security/test handoff | Actual independent review and fix/recheck evidence; no invented agent execution. |
| T07 | T06; guides/logs/record + student acceptance | Distinct human acceptance; deployed state/operational gaps truthful. |
| T08 | T07; canonical sync then full archive | Reconcile pending #52 deltas without implementing/inventing acceptance; verify IDs/paths. |
| T09 | T08 plus explicit authorization | Commit/push/template PR into develop; PR-last. |

No hosted/SMTP/provider credentials/model/prompt edits, unconditional data reset, blanket soft deletion or personal reflection conclusions. Changed contracts require approval before coding.
