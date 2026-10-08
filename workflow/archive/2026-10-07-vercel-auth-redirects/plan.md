# Implementation plan: Vercel-aware Supabase Auth redirects

- Change/issues: [2026-10-07-vercel-auth-redirects; #17](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/17)
- Owner/status/date: John Wong / @Johnwz123 (requester and issue assignee; student role not separately verified); approved scope in progress; 2026-10-07
- Inputs: [proposal.md](proposal.md), [design.md](design.md), no product delta proposed
- Baseline and affected IDs: ProductSpec v0.7; ACC-001, OPS-001; SEC-001 trust boundary
- Constraints: only approved source/helper, env example and guide files; no `.env.local`, Supabase Dashboard, Vercel settings, database, credentials, or access-policy changes. Do not add or run tests in this session; record verification limitation.

## Dependency-ordered work

| Task ID / order | Depends on | Owner / role | Requirement and acceptance IDs | Exact files / expected change | Verification command or review / expected evidence |
| --- | --- | --- | --- | --- | --- |
| T00 | none | Requesting human / project owner | All | Approve bounded origin resolution and retain current team-only preview protection. | Direct user approval recorded in proposal.md and record.md; student role not independently verified |
| T01 | T00 | Implementer | AC-01 to AC-04 | Add server-only origin helper; update signup and callback to use it. | Focused unit checks and source review are planned by repository process; do not run tests under this session's governing instruction; record as pending |
| T02 | T00 | Implementer | AC-05 | Update `.env.example`, `README.md`, and `docs/DeveloperGuide.md` for optional override, Vercel environment variables, Supabase allowlist and protection constraint. | Manual content/source review; pending |
| T03 | T01, T02 | Independent reviewer | AC-01 to AC-05 | Review final diff and redirect trust boundary; no code ownership overlap. | Separate reviewer handoff with findings; pending |
| T04 | T03 | Human student owner | AC-01 to AC-05 | Record acceptance or requested changes. | Separate dated decision; pending |

## Integration and handoffs

The helper owns environment selection and normalization. Both handlers call it; neither reconstructs origins. Documentation names operator-controlled Supabase Auth URLs and makes preview protection limits visible. No concurrent file ownership is planned. No independent reviewer has run yet.

## Approval and completion evidence

- [x] User approved the proposal, no-delta decision, design and plan; preview remains team-only under existing protection.
- [ ] Tasks match the approved scope; verification and test limitations are accurately recorded.
- [ ] Independent review and human acceptance remain separate gates.
- [ ] Before PR, add a dated log, finish closeout and retain PR as the final contributor action.
- Approval/date/source: user direction on 2026-10-07 to follow Supabase/Vercel guidance; see proposal.md. No public preview access or protection change is authorized by this plan.
- Changes to plan: if the user later asks for public preview access, return to a separate security approval before changing Vercel settings.

## N/A and limits

Database migration, canonical product-spec delta, applicant data changes, and hosted configuration edits are N/A because only deployment-origin resolution and operator documentation are in scope. Application tests are not run or added in this session under the governing instruction; acceptance evidence is incomplete until allowed and performed by an authorized contributor.
