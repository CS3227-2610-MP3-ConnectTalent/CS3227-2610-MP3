# Reset confirmation notice — 19 October 2026

Paul requested removal of the local Mailpit notice from the password reset confirmation UI, then authorized a new branch, commit, push and PR into develop. Created issue #113 and branch `fix/reset-password-email-notice` from updated develop; master was not modified by a commit or push. Unrelated untracked profile workflow files are excluded.

Removed only the local notice, retaining the neutral acknowledgement and request-another-link navigation. Formatted the page after the scoped formatting warning. Scoped formatting and Git whitespace checks passed. No browser, hosted email, database or deployment operation was performed.

See the [change record](../workflow/changes/2026-10-19-reset-email-notice/record.md) for review and process limits. Independent source review by `/root/reset_notice_review` found no source issue. No separate formal acceptance gate is claimed; PR opening waits for the repository's acceptance/closeout gate.
