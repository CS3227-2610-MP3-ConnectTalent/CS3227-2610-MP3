# Plan: issues #94 and #95

1. Confirm issue scope/baseline, existing controls/test evidence and concrete request/provider/UI omissions. Prepare this proposal, three deltas, design and threat map; obtain actual approval before code/live calls.
2. Capture current offline unit baseline; add focused failing tests for origin/media checks, provider URL/redirect/body/completion guards and draft preview/adoption. Observe failures for intended behavior before implementation.
3. Implement request/provider guards with bounded modules; preserve audit/quotas/failures. Read installed Next.js and SDK guidance. No database migration or credential changes.
4. Implement Applicant preview/adoption with minimal parent wiring and existing form semantics. Test delayed responses/concurrent editing, discard/failure, escaped text and zero implicit persistence. Keep HR status controls separate and tested.
5. Refine prompts and build versioned synthetic corpus/offline harness and redacted reports. Add negative report/verdict/network guards and package/CI commands. Baseline/refined prompt comparison is distinct from runtime contract tests.
6. Run relevant unit/eval/lint/type/build checks, synthetic local browser/role/privacy/withdrawal and existing quota/database/race tests where needed. Do not reset local/hosted data. Record missing infrastructure instead of claiming tests passed.
7. Obtain a separate read-only safety review of the live runner/fixtures/reporting. If Paul approved the live option and local safeguards pass, verify the already configured gateway/model and run at most 24 synthetic completions with the documented throttle/deadline/stop policy. If offline-only is approved, live is Not run. Never substitute a new model/target or increase budget automatically.
8. Record per-layer results/failure cases, semantic review-needed states and the four-question evidence guide. Do not claim the model's self-assessment or agent judgement is student acceptance. Preserve students' personal reflections.
9. Obtain final independent security/quality review and fix/recheck findings. Present actual results/limits for separate student acceptance. Sync accepted deltas/archive only afterward; dated summaries precede any later explicitly authorized commit/push/PR.

Owner: Paul; primary Codex implementation after approval. Separate reviewer executions are required for independent safety/final review. Proposed specialists are not claimed as actual runs. Existing John AI authorship and unrelated #90/#92 work are preserved.
