# Tasks: Vercel-aware Supabase Auth redirects

- Change/issues: [2026-10-07-vercel-auth-redirects; #17](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/17)
- Plan/record: [plan.md](plan.md); [record.md](record.md)
- Status/owner: implementation and closeout complete; John Wong / @Johnwz123 is requester and issue assignee; student role not separately verified; PR pending

## Before implementation

- [x] T00 — Requesting human approves dynamic origins and keeps existing team-only preview protection. Evidence: direct user request dated 2026-10-07 in record.md. Student role is not separately verified.

## Ordered implementation

- [x] T01 — Implement the shared server-only deployment-origin resolver, update signup/callback consumers, and add resolver/call-site unit tests. Depends on T00. IDs: ACC-001; AUTH-REDIRECT-AC-01 through AC-04. Files: `src/lib/supabase/site-url.ts`, `src/app/auth/actions.ts`, `src/app/auth/callback/route.ts`, `tests/unit/supabase-site-url.test.ts`, `tests/unit/auth-redirects.test.ts`, `vitest.config.ts`. Evidence: all 25 unit tests passed after adding the production signup coverage from independent review; see exact commands and limitations in record.md.
- [x] T02 — Update local/deployment setup guidance and env example. Depends on T00. IDs: OPS-001; AUTH-REDIRECT-AC-05. Files: `.env.example`, `README.md`, `docs/DeveloperGuide.md`. Evidence: manual content review in this session; hosted settings remain unmodified.

## Review and closeout

- [x] T03 — Independent reviewer inspects implementation, acceptance criteria, and deployment/auth boundary. Depends on T01-T02. Evidence: [independent review handoff](../2026-10-08-conventional-pr-titles/handoffs/independent-review.md); one low coverage finding was fixed and rechecked.
- [x] T04 — Human requester accepts the scoped changes and directs closeout after tests. Evidence: direct user decision dated 2026-10-08 in record.md; student role is not independently verified.
- [x] T05 — Owner adds dated session summary, completes closeout, and archives only after accepted sync decision; no canonical delta is expected. Evidence: [session summary](../../../logs/2026-10-08-supabase-auth-and-pr-title-closeout.md), archived record, archive index and final link/whitespace checks.
- [ ] T06 — Authorized contributor opens issue-linked PR as final contributor action. Evidence: PR URL and `Closes #17`.

## Post-submission

- [ ] T07 — Human records merge/release decisions and actual checks separately.
