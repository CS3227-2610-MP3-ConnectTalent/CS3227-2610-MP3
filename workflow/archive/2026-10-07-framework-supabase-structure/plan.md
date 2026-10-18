# Implementation plan: Framework and Supabase integration structure cleanup

- Change/issues: `2026-10-07-framework-supabase-structure`; [#16](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/16)
- Owner/status/date: Requesting contributor; approved / in progress / 2026-10-07. Student owner assignment remains pending.
- Approved inputs: `proposal.md`, `design.md`, no product delta.
- Baseline and affected IDs: ProductSpec v0.7; OPS-003 is operational context only; acceptance IDs in proposal.
- Constraints: Preserve user edits in `next-env.d.ts` on disk; do not alter runtime auth semantics, product behavior, database files, or secrets. Verify static application checks; no dedicated session behavior change or behavior-specific test was planned.

## Dependency-ordered work

| Task ID / order | Depends on | Owner / agent role | Requirement and acceptance IDs | Exact files / expected change | Verification command or review / expected evidence |
| --- | --- | --- | --- | --- | --- |
| T00 | User request | Requesting contributor | All acceptance IDs | Record human scope/design/plan approval in the packet. | Conversation source and date recorded; completed. |
| T01 | T00 | Implementer | AC-01 | Add `src/lib/supabase/proxy.ts`, make `src/proxy.ts` a thin delegator, remove unreferenced `src/lib/client.ts`, `src/lib/server.ts`, and `src/lib/middleware.ts`. | Import search, `pnpm typecheck`, `pnpm lint`, and focused diff review; no behavior tests. |
| T02 | T00 | Implementer | AC-02 | Add `next-env.d.ts` to `.gitignore`, untrack it without deleting local contents, and add `pnpm exec next typegen` before typecheck in `.github/workflows/ci.yml`. | Type generation and typecheck commands; verify file remains on disk, is ignored, and is absent from the Git index. |
| T03 | T00 | Implementer | AC-03 | Update the project implementation status paragraph in `CONTRIBUTING.md`. | Content review and `git diff --check`. |
| T04 | T01-T03 | Implementer | All acceptance IDs | Record actual evidence, limitations, and final scope in `record.md`. | Inspect final diff and packet consistency; independent review remains separate. |

## Integration and handoffs

No parallel implementation. Preserve the exact existing cookie/session behavior while moving the proxy helper. The active branch is `chore/setup-deployment`; do not alter the branch or disturb the pre-existing generated `next-env.d.ts` contents.

## Approval and completion evidence

- [x] Requesting user approved the reviewed Supabase cleanup and Next.js generated-file handling before implementation.
- [x] `tasks.md` maps the implementation to the acceptance criteria.
- [x] Initial independent review and user's archive/PR authorization are recorded separately from implementation.
- [ ] Final independent artifact recheck, dated closeout and archive remain pending; PR is the final contributor action.
- Approval/date/source: Direct user requests in this conversation, 2026-10-07; approver's name and student role not supplied.
- Changes to this plan: None.
