# Reflections

Initial notes began 2 October 2026 and were updated 5 October 2026. These notes record design decisions made during scaffolding; they do not claim app-feature implementation results. Both students should add concrete examples, failed attempts, test evidence, and personal reflections as development proceeds.

## AI security

The main trust boundary will be applicant-controlled notes and cover letters entering a model request. A letter could impersonate an instruction, ask for HR notes, or demand a status change. We therefore specified that HR notes never enter the prompt, the model has no tools, and status changes use a separate human-controlled endpoint. Authorization and data minimization need deterministic tests; prompt wording alone cannot prove security. We have not implemented or tested these controls yet.

The first job-browsing slice has no AI call. It still introduces a data boundary: public visitors should read published jobs but never drafts or closed jobs. The implementation uses both a filtered query and PostgreSQL row-level security. Seven local database checks passed for public visibility and write permissions, and three browser flows passed for filtering, details, invalid categories, and direct hidden-job URLs. This is evidence for the local stack; independent review and deployed verification are still pending.

The issue #6 Applicant implementation adds a useful pre-AI boundary: a saved cover letter is private even from HR until submission. The database grants no direct application write access to browser roles; three narrow functions check verified Applicant identity and the selected job's current state. A local pgTAP suite exercised other-user reads, HR draft denial, duplicate submission and edit denial after closure. The first submitted letter is stored separately from later edits so HR can compare versions. This is local authorization evidence, not a prompt-injection test; AI endpoints and independent review are still pending.

## Spec-driven development

The first spec names both roles, one-application constraint, AI input/output boundaries, and release evidence. This made a course requirement conflict visible: the earlier scaffold assumed direct OpenAI use, while MP3 requires SoCLaaS. We changed the planned provider before implementing AI routes. A future spec revision must fix exact SoCLaaS quotas and model behavior before rate-limit code is written. Acceptance tests should challenge the intent, such as cross-user access and data leakage, rather than merely asserting the shape of a response.

For job browsing, the feature record translated ProductSpec v0.6 into observable cases: published jobs appear, category filtering works, details show the required fields, and direct draft/closed URLs reveal no unpublished content. The first browser run caught a missing semantic heading on job cards; fixing that markup made the browser suite pass. The record keeps independent review and human approval separate from passing automated checks.

For issue #6, the user decided that unfinished letters persist, submitted letters can be edited until job closure, the first submitted version stays available to HR, the limit is 5,000 characters, and signup requires email verification. Those choices were recorded in the proposal and deltas before coding. A focused validation test failed on a placeholder parser and passed after implementation. A separate browser test exposed an environment mismatch: the running Auth container still had confirmation disabled even though the config file was changed. Restarting the preserved local stack made the intended denial observable. The DB test did not have a captured red-first run, which remains a process evidence gap.

After trying the site, the user requested a confirmation-password field and reported no Gmail message. The new browser test first failed because the field was absent, then passed after a server-side match check was added. The configured Supabase URL showed a local stack, so the expected message location was the local mail viewer. The UI and guide now state that directly. This example shows why user testing can reveal both missing input checks and confusing environment expectations even when the original automated flow passes.

On 5 October, we narrowed the product to one company's portal and one published opening. This removes employer onboarding and cross-company permissions from the first release. We also adopted `develop` for integration and `master` for releases. That branch flow records which code is ready for staging or production, while separate Supabase/Vercel projects are still needed to isolate runtime data and secrets.

Later on 5 October, the team proposed adding job categories such as Engineering, HR, Legal, and Sales. Spec version 0.3 expands the planned portal to several preconfigured openings for the same company. The application uniqueness rule now applies per applicant and job, and each AI request must use the selected job's requirements. Categories help applicants browse; they do not change permissions. This is a specification decision, not an implemented feature.

The later clarification was that the product should resemble a single employer's Workday careers page: all listings and applications belong to the company operating this deployment. Spec version 0.4 makes that identity boundary explicit and plans an HR publishing workflow. The design fixes a published job's requirements so the HR AI summary reviews the same criteria the applicant saw. This remains a planned behavior requiring implementation and tests.

The team then clarified that naming a fictional company is unnecessary. Spec version 0.5 treats the product as a reusable careers portal with neutral branding. Each deployment still serves one employer; supporting several employers in one deployment would need separate requirements and access controls.

The first GitHub Pages run failed because the repository had no Pages site. After enabling Pages, a second run failed because its deployment environment permitted `develop` while the publication workflow ran from `master`. Restricting that environment to `master` made the third run pass. This showed that a passing workflow definition alone does not establish a working deployment; repository settings and environment rules also need release checks.

## Basic multi-agent SE

The proposed analyst → implementer → independent reviewer handoff records the spec version, assumptions, changed files, and test evidence. A malicious instruction can enter through repository text, applicant data, or an agent's summary. The human owner must verify source material and review sensitive changes. This process is defined in `../workflow/AgentProcess.md`; actual agent runs, disagreements, and decisions still need to be recorded.

The issue #6 planning and implementation occurred in successive Codex turns, without a separate reviewer. The implementer handoff records exact local checks and open risks, but cannot count as an independent review. A separate reviewer should now challenge the SQL function privileges, RLS and stale-write handling against the approved scenarios; any findings and corrections need their own evidence before the student acceptance gate.

## Evidence to add before submission

- Concrete prompt-injection cases and observed SoCLaaS behavior
- Authorization, RLS, data-minimization, output, and rate-limit test results
- Actual agent handoffs and one example of a review finding that changed implementation
- Each student's own role work and team-level contribution
- Staging/production separation and deployment evidence
