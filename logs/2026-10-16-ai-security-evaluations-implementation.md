# Session summary: 16 October 2026 — AI security and evaluations

## Metadata and links

- Owner: Paul Cheng; primary Codex implementation. Original Applicant/HR AI authored by John remains attributed to him.
- Issues: [#94](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/94), [#95](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/95).
- Branch: `feat/94-95-ai-security-evals`, baseline `2a56ba1`. Changes remain uncommitted; PR/merge/release not authorized.
- [Packet/record](../workflow/archive/2026-10-16-ai-security-evaluations/record.md), [intake summary](2026-10-16-ai-security-evaluations-intake.md), [evidence guide](../docs/AISecurityEvaluations.md).
- Date/time: 16 October, Asia/Singapore; visible command times include implementation tests from 20:48 and live run starting 20:59. Full interaction timing is not reconstructed.

## Chronological interactions and actual handoffs

1. Paul replied **Approve implementation and bounded live evals** to the concrete #94/#95 packet question. Recorded the actual reply as approval of implementation and the fixed twelve-case, two-variant, maximum-24-call option. Separate acceptance remains pending.
2. Primary observed failing request/provider assertions and automatic draft-replacement behavior, implemented explicit guards and preview/adoption, and checked focused tests. Tests added after implementation for supplemental edge cases are not claimed as their own observed RED cycles.
3. Created a 48-case synthetic offline corpus and real-SDK/mocked-fetch harness. Initial config merging unintentionally included the unit suite; missing mocked JSON content type also broke the harness. Corrected config/fixture, then 48/48 passed. The failed attempt remains disclosed.
4. Docker initially unavailable; Paul replied he would start Docker Desktop. Once running, the agent used local synthetic browser/database fixtures; no reset, hosted migration or hosted account changes.
5. Separate read-only `/root/ai_pre_live_safety` reviewed runner, inputs, reports, transport and scope. It identified ambient SDK debug error logging. Primary reproduced the leak using a synthetic plaintext error and fixed `logLevel: "off"`; reviewer rechecked. [Handoff](../workflow/archive/2026-10-16-ai-security-evaluations/handoffs/pre-live-safety.md).
6. Primary ran exactly 24 approved synthetic completion calls against the configured SoCLaaS gateway/model with the bounded runner. No rate/configuration block; seven deterministic case/variant checks failed and remain in safe metadata. No replacement run or extra call was made. Human semantic review remains pending.
7. Full unit run initially failed on missing already-declared PDF.js dependency. `corepack pnpm install --frozen-lockfile` installed the existing locked package without a manifest/lockfile upgrade; full unit suite then passed. This was dependency setup, not a résumé feature repair.
8. Initial preview browser run found a test selector matching both the application's error and Next's route announcer. Narrowed the assertion to the error paragraph; preview and existing Applicant journeys passed on rerun. Contact snapshot/HR review and anonymous AI denial passed separately.
9. Existing AI database and quota race checks passed locally. Production build passed. A broad formatting check traversed unrelated local worktrees and encountered Windows line-ending warnings; it was stopped. Scoped formatting/lint checks are used for this change; unrelated worktrees and files are preserved.
10. Separate `/root/ai_final_review` completed final security/evaluation review. It found missing hostile job-title coverage; primary added the focused provider regression, and reviewer rechecked. Its final recommendation has no unresolved blocking finding. [Final handoff](../workflow/archive/2026-10-16-ai-security-evaluations/handoffs/final-review.md). Separate student acceptance remains pending.

## Actual checks and limits

- Unchanged intake baseline: 11 files/53 focused AI tests passed.
- Main RED examples: cross-origin accepted (200), arbitrary provider endpoint accepted, unsupported completion accepted, generation immediately invoked adoption callback. These failed before their fixes.
- Focused AI tests, 48 offline cases, full unit suite, local browser journeys, existing 52 database checks, 25-actor quota race, production build and scoped static checks have individual results in the record; later counts supersede earlier runs rather than being added together.
- Live model checks: baseline 9/12, refined 8/12; this is not an aggregate improvement or proof of injection immunity. Safe per-case metadata retained; raw synthetic review is ignored and not included here. The runner's green execution check does not claim all model outputs passed.
- No provider keys, real applicant content, raw provider errors, credentials, hidden reasoning or full prompts are included in this summary. The public synthetic corpus carries test prompts separately.
- Hosted deployment/latency, full accessibility, statistical model quality and student semantic review remain pending. No personal reflection prose was rewritten.

## Student verification

Implementation/live scope approval is recorded from Paul's actual reply. Final acceptance, personal verification of this generated summary and publication remain pending. Checks and separate reviewers cannot supply those human decisions.
