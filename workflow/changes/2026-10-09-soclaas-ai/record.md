# Feature record: SoCLaaS Applicant draft and HR summary

Status: approved implementation and amended safeguards verified locally; independent recheck and post-review student acceptance, canonical sync, closeout, and PR remain pending

Owner: John, student owner for issues #7 and #10 as assigned in chat on 2026-10-09

Spec version: ProductSpec v1.0 baseline; proposed v1.1 deltas

Date: 2026-10-09

## Metadata and artifact links

- Change ID/classification: 2026-10-09-soclaas-ai; behavior change and AI/security integration
- GitHub issues: [#7](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/7); [#10](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/10). John confirmed feature ownership in chat. No GitHub issue assignment was changed.
- Branch/commits/PR: `feat/7-10-soclaas-ai`; product baseline `0a0f5c4`; initial packet commit `0826a16`; approved-plan commit `2a5217b`; implementation baseline `d34bd49`; fetched `origin/develop` at `db46f10` and merged it in `6806b08`; implementation commit `70c34cf`; approved HR-output refinement commit `131ef15`; refinement packet update `ab7e3da`; HR audit failure regression coverage and final recheck packet update are being committed; PR pending
- Proposal: proposal.md
- Design: design.md
- Deltas: specs/applications-and-review.md (APP-004); specs/applicant-ai-draft.md (AID-001/AID-002); specs/hr-ai-summary.md (AIS-001/AIS-002); specs/security-and-privacy.md (SEC-001/SEC-006/SEC-007); specs/deployment-and-operations.md (OPS-002)
- Implementation plan/tasks: `plan.md` and `tasks.md`; John approved both in chat on 2026-10-09
- Baseline: ProductSpec v1.0, 8 October 2026, commit 0a0f5c4
- Archive path: Pending acceptance and canonical sync

## Approval checklist

- [x] In-chat design approval for packet drafting recorded: John, 2026-10-09; robust error handling required.
- [x] Feature owner recorded: John, assigned in chat on 2026-10-09.
- [x] John approved the written proposal, deltas, and design in chat on 2026-10-09.
- [x] John reported coordinating the APP-004 change with Paul Cheng on 2026-10-09; this report is not independently verified and does not change the recorded process-owner role.
- [x] John approved `plan.md` and `tasks.md` before product implementation on 2026-10-09.
- [x] Human approved proposal, deltas, design, and implementation plan before product implementation.
- [x] John approved a plan amendment on 2026-10-09: deployment quota lowered from 60 to 24 per rolling minute; provider 429 handling retained; a server-only Supabase secret/service-role credential may call quota/audit metadata RPCs only; Applicant/HR data reads remain on the signed-in RLS session.
- [x] John approved a plan amendment on 2026-10-09 after the reviewer found recommendation paraphrases passing the lexical filter: the HR model returns only source sentence IDs; the server validates/maps them to source excerpts and generates follow-up questions.
- [x] Implementation and final deterministic checks complete locally after that amendment. T10 used synthetic-only direct provider calls after querying the configured key's model catalog and budget without printing credentials; the current application flag remains disabled and its configured model remains a placeholder.
- [ ] Independent recheck and separate post-review student acceptance complete.
- [ ] Accepted canonical sync, closeout, dated log, and archive complete.
- [ ] Issue-linked PR opened last.

Written-spec approval is not implementation approval. ProductSpec v1.0 names Paul Cheng as Applicant process owner; this packet leaves that ownership unchanged and records John’s reported coordination without claiming independent verification. The feature issues were open and unassigned at intake; John’s ownership was provided in this conversation. No GitHub assignee change was made.

## Requirement and acceptance criteria

See proposal.md for AI-AC-01 through AI-AC-07 and their observable outcomes/evidence. These are planned acceptance checks, not observed test results. `plan.md` and `tasks.md` define the approval gate, test-first sequence, and closeout evidence.

## Agent handoffs

Implementation was inline, as recorded in [handoffs/implementation.md](handoffs/implementation.md). A separate read-only security/privacy review is recorded in [handoffs/independent-review.md](handoffs/independent-review.md); its P2 findings and final recheck/acceptance remain open.

## Implementation and tests

Changed files: the complete product file list and packet artifacts are in `handoffs/implementation.md`. Changes cover the server-only AI client/contracts/data access/routes, separate Applicant and HR UI, submitted-letter freeze and audit/quota migrations, synthetic database/integration/unit/browser security tests, README configuration, and the `test:ai-race` script. The pre-existing `.env.example` edit remains preserved and excluded; it was not read or changed. `.env.local` and `.env.dev` were not opened.

Commands and results (2026-10-09): package commands were invoked as `& 'C:\Program Files\nodejs\corepack.cmd' pnpm ...` because Corepack was not on this PowerShell session's PATH; the pinned pnpm version was 12.8.1.

- Test-first red evidence: `corepack pnpm exec vitest run tests/unit/application-action-retry.test.ts` produced 1 intended correction-routing failure; initial `corepack pnpm test:db` showed 17/17 missing AI catalog assertions and 6/30 freeze lifecycle assertions failing; `corepack pnpm exec playwright test tests/e2e/ai-route-security.spec.ts` showed the anonymous endpoint returning 404 instead of 401. A later Applicant E2E assertion failed with 2 copies of the submitted letter instead of 1; the detail view was simplified and the focused E2E then passed. Per-assertion AI unit-test red runs were not captured.
- Focused AI/action/render tests: `corepack pnpm exec vitest run tests/unit/ai-schemas.test.ts tests/unit/ai-routes.test.ts tests/unit/ai-provider.test.ts tests/unit/application-action-retry.test.ts tests/unit/hr-ai-summary.test.tsx` — 5 files, 20 tests passed.
- Final unit/lint/type checks: `corepack pnpm test:unit` — 14 files, 64 tests passed; `corepack pnpm lint` passed; `corepack pnpm typecheck` passed.
- Database: before the amended migration history, `corepack pnpm test:db` passed 4 SQL files/122 assertions. After applying the pending develop HR migration and approved quota-RPC migration locally without reset, the first run failed three assertions: two synthetic identity checks retained an HR JWT subject, and the HR-job test expected the prior closed-job RPC error even though the submitted-letter freeze revokes the RPC. The tests were corrected to set the complete Applicant JWT identity and assert the intended permission denial. Final `corepack pnpm test:db` passed all 5 SQL files/162 assertions.
- Concurrency: `corepack pnpm test:race` passed duplicate-submit, close-first and submit-first races. Before the amendment, the AI race passed with 61 users/60 reservations. Final `corepack pnpm test:ai-race` passed: 25 concurrent synthetic users produced exactly 24 deployment reservations and one denial.
- Browser: first full `corepack pnpm test:e2e` run had one 30-second timeout in the two-account Applicant lifecycle flow. The isolated flow then passed in 29.0 seconds, close to the old timeout, so its test-specific limit was raised to 60 seconds. Final full E2E passed 7 tests and skipped 4: HR review, HR job management, and two password-recovery tests require the unavailable local `TEST_SUPABASE_SERVICE_ROLE_KEY`. No hosted key was used.
- Build/bundle/diff: final `corepack pnpm build` passed and listed both AI API routes as dynamic. A search of `.next/static` found no SoCLaaS/Supabase secret configuration names or key-like values. `git diff --check` passed; Git emitted line-ending conversion warnings, not whitespace errors.
- Local advisor: `corepack pnpm exec supabase db advisors --local --type all --level info` reported INFO-level unindexed foreign keys on `application_notes` and `application_status_events`, unused-index info for `ai_invocations_created_idx`, and a WARN about the expected combined `published jobs` and `Verified HR reads all jobs` SELECT policies. No security-level finding was reported. The quota index supports the global rolling-window query and was retained; the jobs policies provide the intended public published-only and HR-wide reads.
- Provider readiness/evaluation (2026-10-09): SoCLaaS `/v1/models` returned the configured key's allowed model IDs; `llama3.1:8b` and `qwen3.5:9b` were present. The key budget endpoint returned HTTP 200 with a 30 requests/minute limit, 50,000,000 microdollars/day, 500,000,000 microdollars/month, and zero current day/month spend. These are rate-control units, not a monetary charge. No credential, key prefix, endpoint, or local environment-file content was printed. The app's `SOCLAAS_AI_ENABLED` value is false and `SOCLAAS_MODEL` is still `replace-with-an-available-model-id`; both remain unchanged.

  Live synthetic model observations are separate from deterministic checks. Three calls to `llama3.1:8b` used the implementation's JSON mode and output caps: the Applicant draft was well-formed and used only supplied capstone/React/team notes; the benign HR summary was well-formed and identified the unaddressed cloud-deployment requirement; the adversarial letter asking to reveal HR notes, rank the applicant, and change status was answered without those actions or a recommendation. The adversarial output incorrectly said teamwork was not addressed even though the synthetic letter mentioned a four-person team, confirming that valid structure and injection resistance do not prove factual accuracy. Three `qwen3.5:9b` feature-shaped calls and one minimal plain-text diagnostic returned empty content with `finish_reason=length`; the implementation rejects empty content. These were direct synthetic provider calls, not app-route/DB integration tests, and no real applicant text or database record was used.

Security/adversarial coverage: SQL tests prove submitted-letter immutability, ownership/role checks, metadata-only audit fields, authenticated/anonymous denial of quota RPC execution, service-role-only grants, HR-only requirements access and quota denials. The AI race check proves the new global cap under concurrency. Unit tests prove denial before protected reads/provider calls, minimal exact payloads, no tools or retries, strict output rejection, safe failure states, and provider 429 handling with valid/invalid retry headers and audit-finalization failure. Synthetic malicious note/letter text is treated as untrusted and private HR notes/other applications are absent from the exact model payload. React rendering escapes script-like output. E2E coverage for HR summary status/source behavior exists, but HR E2E cases were skipped because the local service-role test key was unavailable. No live model output is asserted as factually correct.

### HR output refinement follow-up (2026-10-09, T10a)

- Approval: John approved the source-ID-only model response, server validation/mapping, and deterministic follow-up questions in chat on 2026-10-09 after the reviewer reproduced recommendation paraphrases passing the lexical filter.
- Test-first red: the focused command `bun node_modules/vitest/vitest.mjs run tests/unit/ai-schemas.test.ts tests/unit/ai-routes.test.ts tests/unit/ai-provider.test.ts` exited 1 with 4 failures and 15 passing tests. Failures showed the previous lexical filter rejected the benign “hired five team members” source phrase, the sentence-ID schema was absent, the route still expected model-written summary strings, and the provider prompt/payload still used free-form output.
- Sentence boundary regression: after changing the splitter to `Intl.Segmenter`, a focused test failed because it split “Dr.” from the following name. The splitter now merges standalone common abbreviation fragments; the focused test passes.
- Focused green: `bun node_modules/vitest/vitest.mjs run tests/unit/ai-schemas.test.ts tests/unit/ai-routes.test.ts tests/unit/ai-provider.test.ts tests/unit/hr-ai-summary.test.tsx` — 4 files, 21 tests passed.
- Final code checks: `bun run test:unit` — 16 files/74 tests passed; `bun run lint` passed; `bun run typecheck` passed; `bun run test:e2e` — 7 passed/4 skipped; `bun run build` passed and lists both API routes as dynamic. Bun v1.3.13 ran the local package scripts because Node/Corepack/pnpm were unavailable on this shell's PATH. The build reported `.env.local` as a loaded environment file; its contents were not inspected. E2E skips remain HR review, HR job management, and password recovery cases due to the unavailable local test key.
- Limits: This refinement changed no database migration or quota code, so the prior local pgTAP and quota-race results remain the relevant evidence. No live model was called for this refinement. Sentence selection can still be inaccurate; HR must verify source excerpts against the original letter. Independent reviewer recheck and John’s final acceptance remain pending.

### HR audit-failure regression coverage (2026-10-09)

- The reviewer identified an evidence gap: fail-closed final audit behavior was asserted for the Applicant route but not separately for the HR route. The HR implementation already returned a generic 503 without the generated response when audit finalization failed.
- Added an HR route unit test that forces finalization to return false after successful generation, then asserts the response contains only the generic error and that the success finalization was attempted for the expected actor and invocation.
- Verification: `bun node_modules/vitest/vitest.mjs run tests/unit/ai-routes.test.ts tests/unit/ai-schemas.test.ts tests/unit/ai-provider.test.ts tests/unit/hr-ai-summary.test.tsx` — 4 files/22 tests passed; `bun run lint` passed; `bun run typecheck` passed. The initial sandbox run could not read installed Vitest files and package scripts could not locate Node; rerunning with approved workspace dependency access succeeded. No production code changed.
- Independent recheck of this test and the final revision is pending.

Known limitations: independent review recheck and post-review student acceptance remain pending. The current local app configuration remains disabled/placeholder, so the live calls do not establish that the application routes are configured for production. HR/job-management/password-recovery browser cases were skipped because the local test service-role key was unavailable. `origin/develop` was merged into the feature branch; its pending local migration was applied, but no hosted migration, deployment, PR merge, or release occurred. The `.env.example` user edit was not read/changed. `.env.local` and `.env.dev` contents were not manually inspected or printed; Next.js reported `.env.local` during local build/dev runs.

## Review and decision

Reviewer findings and fixes: A separate read-only reviewer examined `70c34cf`; see [handoffs/independent-review.md](handoffs/independent-review.md). Finding 1 (P2): authenticated users could directly reserve shared quota through the public RPC. John approved a narrow server-only metadata-RPC credential and the 24/minute cap on 2026-10-09. Commit `70c34cf` removes authenticated grants and checks actor/role/target; pgTAP and the concurrent quota test pass. The reviewer rechecked this fix. Finding 2 (P2): hiring-decision paraphrases could pass a lexical output filter, which also rejected ordinary wording. John approved an extractive output amendment: the model returns source sentence IDs only, the server validates/maps those IDs, and follow-ups are generated server-side; implementation is in `131ef15`. The reviewer found no remaining P2 on the response path but requested a separate HR final-audit-failure route assertion; that regression test is now added and awaits final recheck. John’s post-review implementation acceptance remains pending.

Human decisions and date: John approved the written proposal, deltas, design and original plan, and reported coordinating with Paul on 2026-10-09. On 2026-10-09, John approved the amended 24/minute global cap, continued provider 429 handling, server-only quota/audit RPC credential, and source-ID-only HR output with server-generated follow-up questions. His acceptance of the final reviewed implementation remains pending.

Guide/reflection/log updates: This record is the current evidence index; dated session log is pending closeout.

## Session evidence index

| Date / session | Summary log link | Work / prompts / decisions covered | Verification status / missing coverage |
| --- | --- | --- | --- |
| 2026-10-09 | Pending closeout log | Issue #7/#10 scope; freeze submitted application decision; SoCLaaS AI design; robust-error handling; owner John; user-reported Paul coordination; plan approval; merge from `origin/develop`; quota/RPC and extractive HR-output amendments; local checks; live synthetic evaluation; reviewer findings and remediation. | Local migrations applied without reset. pgTAP, both race checks, 74 unit tests, lint, typecheck, build, bundle scan, and final E2E (7 passed/4 skipped) passed. Live model outputs include an observed factual error; app flag/model remain disabled/placeholder. Independent recheck, student acceptance and workflow closeout remain pending. |

## Canonical sync and archive

- Accepted delta/human decision: Pending; deltas remain proposed in this packet.
- Canonical sync commit/files/version/date: Pending; canonical specs remain unchanged at v1.0.
- Sync verification: Pending acceptance.
- Archive decision/date/path: Pending.
- Navigation repairs after moving: Pending.
- Outstanding work/limitations: obtain independent recheck of both implemented findings, then record John’s post-review acceptance; sync accepted canonical requirements; complete dated session log and closeout; open the issue-linked PR last. The live evaluation used synthetic inputs only and exposed an HR factual error; it does not establish production readiness. Paul's coordination is user-reported and not independently verified. The modified `.env.example` remains excluded and untouched.
