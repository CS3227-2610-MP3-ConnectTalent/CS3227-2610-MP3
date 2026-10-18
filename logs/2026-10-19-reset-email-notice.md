# Reset confirmation notice — 19 October 2026

Paul requested removal of the local Mailpit notice from the password reset confirmation UI, then authorized a new branch, commit, push and PR into develop. Created issue #113 and branch `fix/reset-password-email-notice` from updated develop; master was not modified by a commit or push. Unrelated untracked profile workflow files are excluded.

Removed only the local notice, retaining the neutral acknowledgement and request-another-link navigation. Formatted the page after the scoped formatting warning. Scoped formatting and Git whitespace checks passed. No browser, hosted email, database or deployment operation was performed.

See the [change record](../workflow/archive/2026-10-19-reset-email-notice/record.md) for review and process limits. Independent source review by `/root/reset_notice_review` found no source issue. Initially PR opening waited for acceptance/closeout.

Paul subsequently answered the explicit acceptance question with "create the pr" on 19 October 2026. Recorded acceptance and archived the packet without a canonical requirement delta. PR targets develop; no master commit, merge or deployment is authorized.
