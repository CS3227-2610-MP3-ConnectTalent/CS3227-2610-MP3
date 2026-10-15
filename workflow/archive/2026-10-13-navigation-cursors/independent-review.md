# Independent review: #74

Reviewer: separate read-only execution `/root/navigation_cursors_review`; model
unknown. Baseline `736ba4842982b589bd783facfb86a608988dd342` plus uncommitted repair.
Reviewer did not implement code or tests.

Source coverage: shared return link first on job detail, My profile and Manage jobs,
including HR load failure. Duplicate removed. Existing server/proxy/HR checks remain
unchanged, so incomplete Applicants still redirect to profile. CSS covers enabled
actions, native choice/file controls, disabled fieldsets and ARIA/data-disabled
button-like controls; text inputs are unaffected. User Guide matches the repair.

Actual independent checks: scoped Prettier and Git whitespace exit 0. Follow-up
reproduced new test formatting/whitespace after reviewing the added selector-family
scenario. No unresolved blocking findings.

Initial coverage observation: no computed-cursor checks for choice/file/ARIA
controls. Primary added an isolated native-control browser case without submitting
data. Reviewer rechecked its source and confirmed it meaningfully covers the
selector families. Primary executed that final case successfully; this browser run
is primary evidence, not independently reproduced.

Primary results: initial two intended red browser cases, four passing workflow/UI
cases after implementation, then all three focused cursor/link cases passed after
coverage addition. Typecheck and scoped lint passed. Five distinct browser scenarios
across these green runs, not one five-test run.

Limits: HR load-error link is source-reviewed only; isolated cursor fixtures do not
represent every real page widget. Hosted verification, full accessibility audit,
build and broad application/database suites not run for this presentation repair.
Human acceptance and publication remain separate gates.
