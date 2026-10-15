## Problem

Paul requests consistent return navigation and clickable cursors. Job details have
both All roles and Back to open roles; My profile and Manage jobs lack a consistent
top return link. Some enabled buttons retain the default arrow cursor.

## Scope and acceptance

- Job detail has one Back to open roles link at the top of its page content,
  replacing duplicate All roles/return links.
- My profile and Manage jobs use the same top link to `/`, including relevant
  load-error states. Incomplete Applicant onboarding remains enforced.
- Enabled buttons and actionable links/controls show the hand cursor (`pointer` in
  CSS); disabled controls remain visibly disabled and text inputs retain text cursors.
- Audit existing Applicant/HR/auth controls for overriding cursor styles.
- Focused browser checks show link targets, duplicate removal, computed cursors and
  preserved profile gating; independent review and separate human acceptance.

Owner: Paul. Presentation repair under ACC-005; no new authorization or application
policy. AI/provider configuration, hosted operations and unrelated UI redesign are
outside scope.
