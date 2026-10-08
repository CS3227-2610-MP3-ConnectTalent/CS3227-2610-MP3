# Design: Framework and Supabase integration structure cleanup

- Change ID/issues: `2026-10-07-framework-supabase-structure`; [#16](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/16)
- Owner/status/date: Issue owner unassigned for triage; approved scope / in progress / 2026-10-07
- Inputs: `proposal.md`; no capability delta; ProductSpec v0.7, OPS-003 context only.
- Scope and affected components/files: Supabase client/session helper files, Next.js generated type file tracking, app CI type generation, and contributor project-status text.

## Decisions and alternatives

| Decision | Considered alternatives | Reason and tradeoffs | Human approval reference |
| --- | --- | --- | --- |
| Keep `src/proxy.ts` as the Next.js entry point and delegate its current session behavior to `src/lib/supabase/proxy.ts`. | Leave provider code inline; rename the Next.js entry point to `middleware.ts`; move the framework entry point into `lib`. | Next.js 16 requires the `proxy.ts` convention beside `src/app`; Supabase's current guide groups its reusable proxy/session helper under `lib/supabase`. The moved behavior remains the same. | Direct user approval of the reviewed structure, 2026-10-07. |
| Remove unused generic Supabase client templates and keep no browser helper until needed. | Move every generated helper even when unused. | No Client Component currently uses the Supabase browser client; unused boilerplate adds duplicate setup paths. | Direct user approval of the reviewed cleanup, 2026-10-07. |
| Ignore and untrack `next-env.d.ts`; run `next typegen` before CI typecheck. | Track changing generated output; remove the file without adding type generation. | Next.js manages this file and recommends ignoring it. CI currently typechecks before build, so typegen must run first. The generated local file will remain on disk. | Direct user request to follow Next.js guidance, 2026-10-07. |

## Interfaces and data flow

Request → `src/proxy.ts` → `src/lib/supabase/proxy.ts` → existing Supabase SSR cookie/session logic → unchanged Next response. Server Actions and Route Handlers continue to use `src/lib/supabase/server.ts`. Domain authorization and queries remain in `src/lib/auth.ts`, `src/lib/applications.ts`, and `src/lib/jobs.ts`. CI runs `pnpm exec next typegen` before TypeScript checks. There is no data or API contract change.

## Authorization and privacy impact

No authorization behavior changes. Existing session code and `getUser()` call are preserved exactly during extraction; `requireApplicant` and RLS are unaffected. No secret values are read or changed. Generated type files contain no applicant data or credentials.

## Failure behavior

| Failure / adversarial input | Observable outcome / state guarantees | Verification |
| --- | --- | --- |
| `next typegen` fails in CI | Workflow stops before typecheck and reports a failed job. | CI workflow order and typecheck command. |
| A stale Supabase helper remains imported | Typecheck or import search exposes the unresolved or duplicate path. | Repository-wide import search and typecheck. |
| Session helper extraction changes cookie behavior | Out of scope; implementation must move the existing code without changing it. | Final diff review; no behavior test run is claimed. |

## Migration and backward compatibility

No database or user data migration. The tracked `next-env.d.ts` entry is removed while its current local file remains present and ignored. CI generates the file and route types before typechecking.

## Rollout and rollback

No deployment configuration changes. Rollback can restore the previous helper imports, generated-file tracking, and CI step. No database recovery is required.

## Review and unresolved decisions

- [x] Interfaces and requirements agree with the proposal; there is no product behavior delta.
- [x] Security, failure, migration, rollout, and rollback impacts assessed.
- Findings/owner/resolution: Independent review pending; issue owner assignment pending triage.
- Human approval: Requesting user approved scope in this conversation, 2026-10-07; name and student role not stated.
