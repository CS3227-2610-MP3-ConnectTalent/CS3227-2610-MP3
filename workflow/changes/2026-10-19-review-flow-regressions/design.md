# Design: application and HR review regressions

- Change ID/issues: 2026-10-19-review-flow-regressions; #120–#123
- Owner/status/date: Student owner pending; approved scope, implementation pending; 2026-10-19
- Inputs: `proposal.md`; no capability deltas; ProductSpec v1.18, APP-002/003/004/005/007/008/010
- Scope and affected components/files: `src/components/application-form.tsx`, `src/components/resume-panel-response.ts`, `src/app/api/applications/[id]/resume/route.ts`, `src/app/applications/[id]/page.tsx`, `src/components/hr-application-filters.tsx`, `src/components/use-hr-application-navigation.ts` and focused unit tests.

## Decisions and alternatives

| Decision                                                                                                                                                                                                                    | Considered alternatives                                                                   | Reason and tradeoffs                                                                                                                                        | Human approval reference                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Keep application values and expected revision as one coherent snapshot; an attachment-only response may update the revision only when it proves that revision is still for the displayed application data.                  | Accept every server revision; clear/reload all fields on every response.                  | Avoids silent overwrite while retaining user input and current optimistic locking. Exact behavior to be checked against action reconciliation tests.        | Direct user request, 2026-10-19; restores APP-005/form39-AC-06. |
| Cancel a pending search when browser history restores a URL; synchronize input state to the restored query.                                                                                                                 | Allow timer to run; introduce a broader navigation coordinator.                           | Small fix to existing debounce lifecycle and URL/history contract.                                                                                          | Direct user request, 2026-10-19; restores APP-010.              |
| The application résumé URL rejects the legacy `cancel` intent because that route contract carries no application or operation identity and no UI caller uses it. Internal cleanup keeps its operation-scoped database path. | Keep job-wide cancel for compatibility; add an application-aware cancellation RPC.        | Rejecting the unused, unscoped route intent prevents an old application URL from cancelling the current application without changing the database contract. | Direct user request, 2026-10-19; restores APP-007/008.          |
| Applicant detail displays the current frozen letter and conditionally the original snapshot.                                                                                                                                | Continue showing only the original; replace the original display with the current letter. | APP-002 requires current letter visibility; preserving both avoids losing history context.                                                                  | Direct user request, 2026-10-19; restores APP-002/004.          |

## Interfaces and data flow

Applicant form state carries editable values and expected revision to the server action. Résumé route validates current actor/ownership; its unscoped cancellation intent is rejected, while existing upload/removal mutations retain their revision checks. Successful résumé responses update local revision state; rejected responses cannot advance it. HR search query state is debounced into URL navigation; history restoration cancels the old timer and takes URL state as current. Applicant detail reads owner-authorized application fields and renders the current frozen letter, with original snapshot when distinct.

## Authorization and privacy impact

No new data access or role is introduced. Applicant routes remain owner-scoped by `requireApplicant` and RLS. Résumé mutation remains same-origin and authenticated and will reject withdrawn, submitted, or foreign records. The Applicant page continues to exclude HR notes/status history. HR list authorization and data selection remain unchanged. No new applicant data is logged or sent externally.

## Failure behavior

| Failure / adversarial input                    | Observable outcome / state guarantees                                                                                | Verification |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------ |
| Concurrent Applicant draft update              | Stale fields do not commit against the newer revision; the user receives retry/reload feedback and keeps local text. | review-AC-01 |
| Unscoped résumé cancel for any application URL | Denied safely; no pending operation or attachment on another application is changed.                                 | review-AC-02 |
| Back/Forward while search debounce is pending  | Restored query/filter state remains authoritative; abandoned query is not navigated.                                 | review-AC-03 |
| Legacy current/original letters differ         | Both render under distinct labels; Applicant still cannot read HR-only data.                                         | review-AC-04 |

## Migration and backward compatibility

No database migration or data rewrite is expected. The unused unscoped route cancellation intent is rejected; internal operation-scoped cleanup remains unchanged. Preserve current and original letter compatibility for new and legacy rows. Verify existing database and API tests. Local Supabase currently lacks migrations `20261015000000` and `20261016000000`; do not persistently reset or migrate it as part of this task.

## Rollout and rollback

Deploy via the issue-linked PR to `develop` after review and required checks. Rollback is code rollback; no schema/data recovery is expected. Verify CI and, when a current local schema is available, run the application lifecycle and résumé tests. Hosted behavior remains unclaimed unless directly smoke-tested.

## Review and unresolved decisions

- [x] Interfaces and requirement IDs agree with proposal and canonical requirements.
- [x] Security, failure, migration, rollout and rollback impacts assessed.
- Findings/owner/resolution: implementation and separate review pending.
- Human approval: user requested the four bounded fixes and PR preparation in current chat on 2026-10-19. Student acceptance remains pending.
