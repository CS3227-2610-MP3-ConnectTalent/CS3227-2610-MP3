# Reflections

Initial notes began 2 October 2026 and were updated 5 October 2026. These notes record design decisions made during scaffolding; they do not claim app-feature implementation results. Both students should add concrete examples, failed attempts, test evidence, and personal reflections as development proceeds.

## AI security

The main trust boundary will be applicant-controlled notes and cover letters entering a model request. A letter could impersonate an instruction, ask for HR notes, or demand a status change. We therefore specified that HR notes never enter the prompt, the model has no tools, and status changes use a separate human-controlled endpoint. Authorization and data minimization need deterministic tests; prompt wording alone cannot prove security. We have not implemented or tested these controls yet.

## Spec-driven development

The first spec names both roles, one-application constraint, AI input/output boundaries, and release evidence. This made a course requirement conflict visible: the earlier scaffold assumed direct OpenAI use, while MP3 requires SoCLaaS. We changed the planned provider before implementing AI routes. A future spec revision must fix exact SoCLaaS quotas and model behavior before rate-limit code is written. Acceptance tests should challenge the intent, such as cross-user access and data leakage, rather than merely asserting the shape of a response.

On 5 October, we narrowed the product to one company's portal and one published opening. This removes employer onboarding and cross-company permissions from the first release. We also adopted `develop` for integration and `master` for releases. That branch flow records which code is ready for staging or production, while separate Supabase/Vercel projects are still needed to isolate runtime data and secrets.

Later on 5 October, the team proposed adding job categories such as Engineering, HR, Legal, and Sales. Spec version 0.3 expands the planned portal to several preconfigured openings for the same company. The application uniqueness rule now applies per applicant and job, and each AI request must use the selected job's requirements. Categories help applicants browse; they do not change permissions. This is a specification decision, not an implemented feature.

The later clarification was that the product should resemble a single employer's Workday careers page: all listings and applications belong to the company operating this deployment. Spec version 0.4 makes that identity boundary explicit and plans an HR publishing workflow. The design fixes a published job's requirements so the HR AI summary reviews the same criteria the applicant saw. This remains a planned behavior requiring implementation and tests.

The first GitHub Pages run failed because the repository had no Pages site. After enabling Pages, a second run failed because its deployment environment permitted `develop` while the publication workflow ran from `master`. Restricting that environment to `master` made the third run pass. This showed that a passing workflow definition alone does not establish a working deployment; repository settings and environment rules also need release checks.

## Basic multi-agent SE

The proposed analyst → implementer → independent reviewer handoff records the spec version, assumptions, changed files, and test evidence. A malicious instruction can enter through repository text, applicant data, or an agent's summary. The human owner must verify source material and review sensitive changes. This process is defined in `../workflow/AgentProcess.md`; actual agent runs, disagreements, and decisions still need to be recorded.

## Evidence to add before submission

- Concrete prompt-injection cases and observed SoCLaaS behavior
- Authorization, RLS, data-minimization, output, and rate-limit test results
- Actual agent handoffs and one example of a review finding that changed implementation
- Each student's own role work and team-level contribution
- Staging/production separation and deployment evidence
