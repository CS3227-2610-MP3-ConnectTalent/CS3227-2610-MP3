# Plan: required profile (#52)

Proposed; primary implementer ownership only after concrete approval and branch permission. Preparation baseline v1.5/current uncommitted #49/#50 branch. No agent execution implied by role labels.

| Task | Dependency / owned files | Expected evidence |
| --- | --- | --- |
| T00 | Issue/packet and branch choice; preserve all #49/#50 work | Actual student approval and explicit branch authorization; no commit authorization inferred. |
| T01 | T00; tests/unit plus profile validation/readiness modules | Focused intended failures for required fields and readiness, then bounded fixes. |
| T02 | T01; new CLI-created migration and tests/database | SQL save-profile validation, readiness on write/submit, frozen legacy compatibility; direct denial and race regression, history recorded through CLI. |
| T03 | T01/02; Auth callback/actions, listing/detail/apply guards, profile UI/actions, application input/form | Signup/sign-in onboarding, required field labels and safe completion redirect; no loops/guest/HR regression. |
| T04 | T01/02; Applicant AI authorization boundary and tests only | No provider/quota call for incomplete Applicant; no contact fields in AI payload. Exclude provider prompts/model/HR summary. |
| T05 | T01–04; focused browser/unit/SQL regression and relevant lock cases | Valid completion, direct URL/RPC denial, history/withdrawal preserved, mobile/focus, typecheck/lint/build; log all failures and limits. |
| T06 | T05; separate readonly review handoff | Actual reviewer execution and findings disposition; review skills alone are not runs. |
| T07 | T06; guides/logs/record; separate Paul acceptance | Record acceptance distinct from implementation approval; hosted limits explicit. |
| T08 | T07; canonical deltas then whole packet archive | ID/version equivalence and links; archive not release. |
| T09 | T08 plus explicit authorization | Commit/push/PR into develop using template, PR-last. |

Excluded: hosted config/data, SMTP, provider credentials/prompts, unrelated #49/#50 edits, blanket guest authentication, rewriting legacy submission fields, required resume/background. If scope changes, return to approval.
