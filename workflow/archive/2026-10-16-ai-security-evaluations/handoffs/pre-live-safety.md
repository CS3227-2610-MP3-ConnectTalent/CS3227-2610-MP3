# Separate pre-live safety review — 16 October 2026

- Reviewer: separate Codex execution `/root/ai_pre_live_safety`, security/privacy reviewer profile; no implementation edits or live calls. Scope: uncommitted #94/#95 changes against `2a56ba1`.
- Reviewed corpus, baseline/refined prompts, live runner/budget/reports/configuration, provider transport/policy/client, offline CI wiring and relevant authorization/data minimization source paths.
- Finding P2: ambient `OPENAI_LOG=debug` could cause the SDK to log plaintext provider errors. Primary reproduced with a synthetic error body, added explicit `logLevel: "off"`, and rechecked. Reviewer verified the source and passing real-SDK/mocked-fetch regression. No unresolved blocking finding remains.
- Reproduced checks: report/budget 8 passed; provider/routes/privacy 32 passed; final logging/provider/report/budget 21 passed. These overlapping runs are not additive counts of unique tests. Ignored synthetic-review path checked with Git.
- Recommendation: suitable for the already approved bounded live evaluation: fixed twelve synthetic cases, baseline/refined prompts only, model `llama3.1:8b`, known SoCLaaS gateway, at most 24 attempts, sequential starts at least 10 seconds apart, 20-second timeout, zero retries and stop on rate/configuration errors.
- No Supabase/real applicant data used by runner. Allowlisted reports retain human semantic review as pending; raw synthetic review stays ignored. CI is offline only.
- Limits: source review and mocked checks do not establish hosted behavior, model quality, student acceptance or release approval. Final implementation review remains separate.
