# Implementation plan: complete collection reads

- Issue: [#70](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/70)
- Related review fix: PR #69 / issue #68 (APP-009)
- Owner: John Wong; request authorizes using the existing `feat/68-hr-dashboard` branch
- Baseline: `18a022e` (`docs(workflow): record HR dashboard branch publication`)
- Product sync: N/A; behavior restores complete results and leaves contracts unchanged

| Task                                | Dependency       | Files                                                                                                                              | Verification                                                                                                                |
| ----------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| T01 test-first                      | Authorized scope | `tests/unit/data-access.test.ts`                                                                                                   | Test HR jobs beyond one page; observe incomplete result before implementation.                                              |
| T02 helper and collection readers   | T01              | `src/lib/supabase/pagination.ts`, `src/lib/jobs.ts`, `src/lib/applications.ts`, `src/lib/hr-jobs.ts`, `src/lib/hr-applications.ts` | 500-row UUID keyset pages for all six collection readers; later-page errors reject.                                         |
| T03 helper and integration coverage | T02              | `tests/unit/supabase-pagination.test.ts`, `tests/unit/data-access.test.ts`, `tests/unit/jobs.test.ts`                              | Multiple pages, exact boundary, inter-page insert, restored display order, errors, all filters, and no partial results.     |
| T04 endpoint audit and evidence     | T02/T03          | `workflow/changes/2026-10-13-collection-pagination/api-audit.md`, packet record/tasks, PR body                                     | Reconcile all route handlers and list queries; record checks and risks.                                                     |
| T05 review and push                 | T04              | final diff and PR #69                                                                                                              | Independent review provenance remains distinct; run checks, commit, push, reply to and resolve the addressed review thread. |

Tests use synthetic rows only. No database schema, RLS policy, environment, or production configuration changes are planned. Before completion, run focused unit tests and repository checks available in the current environment; record unavailable/failed checks honestly.
