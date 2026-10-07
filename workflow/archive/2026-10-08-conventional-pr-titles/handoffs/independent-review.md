# Independent verification handoff: Supabase Auth redirects and PR titles

- Reviewer/run: separate read-only test-engineer execution `/root/independent_auth_review`; the reviewer did not author implementation or tests and made no edits.
- Date: 2026-10-08
- Reviewed revision: baseline `2fad6ed815df1b06c8de678c3e2b70bc0f085d57` plus the current worktree diff, including final test coverage correction; no commit existed at review time.
- Inputs: #17 and #18 packets, canonical requirements/acceptance criteria, source/tests/docs, repository process and test evidence supplied by the implementer.
- Scope: #17 auth origin selection and signup/callback use; #18 Conventional Commit PR-title guidance and related skills/profile; security boundary, failure behavior, test coverage, docs and check evidence.

## Acceptance coverage

| Criterion | Review result |
| --- | --- |
| #17 AUTH-REDIRECT-AC-01 | Preview signup and HTTPS origin are covered by `tests/unit/auth-redirects.test.ts` and `tests/unit/supabase-site-url.test.ts`. Standard Deployment Protection is a read-only setting observation; no deployed flow was tested. |
| #17 AUTH-REDIRECT-AC-02 | Production origin selection is covered by resolver, signup call-site and callback tests. The initial review found signup lacked a production call-site case; the corrected test below closes it. |
| #17 AUTH-REDIRECT-AC-03 | Helper tests cover the localhost default, local override and insecure remote override rejection. |
| #17 AUTH-REDIRECT-AC-04 | `site-url.ts` is server-only; both handlers call it. The callback test supplies an attacker origin and confirms configured destinations are used. Source does not use request `Host`. |
| #17 AUTH-REDIRECT-AC-05 | README and Developer Guide document redirect allowlist entries and preview protection. This was manual review; hosted settings and live callbacks were not tested. |
| #18 PR-TITLE-AC-01/02 | Root and contributor guidance, Developer Guide, agent process, PR template, readiness/closeout/submission skills and evidence-lead profile specify `type[optional scope][!]: description`; commit subjects remain separately described. |
| #18 PR-TITLE-AC-03 | No product-spec changes were observed for the process-only policy. The #17 auth behavior is separately traced in its own packet. |

## Finding and recheck

- **Low, resolved:** initial review of `tests/unit/auth-redirects.test.ts` found signup had preview call-site coverage but no production call-site assertion. Added a production signup case with `VERCEL_PROJECT_PRODUCTION_URL=careers.example.com` and conflicting `VERCEL_URL=preview-123.vercel.app`; it asserts the production `/auth/callback` URL and post-signup redirect.
- Recheck: reviewer read the updated test and confirmed the finding is closed and #17 AC-02 now has production signup call-site coverage. The reviewer did not rerun tests; the implementer reported the focused auth suite passed 4 tests and full Vitest passed 25 tests across 6 files.
- No remaining review findings were reported.

## Checks and limitations

The implementer reported: focused resolver tests 10 passed; focused Auth redirect tests 4 passed; full Vitest 25 passed across 6 files; ESLint exit 0; TypeScript `--noEmit` exit 0; Next.js 16.3.8 production build passed. The reviewer ran `git diff --check` with exit 0 and line-ending warnings; that command excludes untracked files.

No E2E, local Supabase, deployed Vercel/Supabase Auth, or email verification flow was tested. Authorization/RLS behavior is unchanged and outside this change's scope. Tests were added after the implementation existed, so there was no intended-behavior red result. GitHub issue pages were not retrievable by the reviewer; issue criteria were read from the approved packets.

The reviewer made no student acceptance decision. That remains the requesting human's gate.
