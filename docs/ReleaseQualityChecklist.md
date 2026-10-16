# MP3 release quality checklist

Use this for a specific release candidate, with synthetic Applicant and HR data. It adapts MP2's quality lessons to this careers portal; it does not import clinic workflows, Java tooling or an SDD toolkit. Unchecked items are work to do, not claims of product defects or completed tests.

## Candidate and evidence

Record these before ticking hosted checks:

- Candidate commit and release tag, if any:
- Development/Production application URLs and actual deployed commit for each:
- Supabase project/environment and applied migration identifiers (no keys):
- GitHub Pages build/deploy run and documentation commit:
- Tester, date/time zone, browser and desktop/mobile viewport:
- Synthetic Applicant/HR fixture references (no passwords or personal data):
- Findings, fixes, rerun results and outstanding accepted limits:

A branch name, successful build, merged PR or Vercel deployment status does not prove a hosted workflow works. Different branch hashes/commit counts can reflect squash history; inspect deployed source and behavior rather than inferring missing features from ancestry alone. Check the production deployment, database and guide revision together.

## 1. Preserve in-progress work

MP2's most serious bug lost unsaved consultation fields after a related action. The MP3 equivalents are application/profile text, résumé actions, AI requests and HR review forms.

- [ ] Enter distinct unsaved name, phone, portfolio, education, experience and letter values; upload/replace a valid résumé. Confirm the text remains and the upload has not silently saved it.
- [ ] Try an invalid replacement and an interrupted first upload. Retry without refreshing; verify typed values and the prior finalized file survive, with one active draft and an understandable outcome.
- [ ] Use a profile résumé in an application, then replace/remove the profile file. Confirm application text remains and its submitted/file snapshot is independent.
- [ ] Save a draft explicitly; wait for actual completion, refresh and verify every saved field. Test stale/failed saves and repeat clicks without interpreting an already-visible heading as proof of a new save.
- [ ] Refresh/navigate away with unsaved text only after copying it. Confirm the guide describes the actual explicit-save contract; do not expect autosave merely because a file was uploaded.
- [ ] Generate AI text with a delayed response while typing in the letter. The current development source includes merged PR #96's separate preview, discard and explicit Use/Replace adoption; generation must leave the typed letter unchanged. Verify the actual deployed candidate and matching guide before release: a merged PR alone does not establish hosted parity.
- [ ] Leave an unsaved HR note while performing another review action; record whether it survives or whether a warning is needed. Do not claim this sequence is covered by generic HR happy-path tests. Escalate silent loss as an issue and obtain a bounded repair decision.

Source/evidence: [résumé-first browser journey](../tests/e2e/support/resume-first-profile-journey.ts), [contact workflow](../tests/e2e/application-details.spec.ts), [profile/file workflow](../tests/e2e/profile-resume.spec.ts), [accepted résumé-first record](../workflow/archive/2026-10-10-unsaved-profile-resume/record.md), and [PR #96](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/96). These are source/previous-revision evidence; rerun against the candidate before marking hosted checks passed.

## 2. Enforce lifecycle and permission rules

- [ ] Confirm unverified/incomplete Applicants cannot bypass onboarding through direct page/action/file requests. Public signup must not grant HR.
- [ ] Submit with missing required details, mismatched trusted email, invalid phone/portfolio and blank/oversized letters. Confirm denial and retained values, then submit a valid application exactly once.
- [ ] Attempt to edit submitted text/contacts/background/files through UI and direct requests. Records must remain frozen; hiding an edit button is insufficient.
- [ ] Confirm Applicant B cannot read Applicant A's drafts, submitted records or files; Applicants cannot read HR notes or perform status actions. HR cannot read private drafts or mutable profiles/profile files.
- [ ] Publish a future-scheduled job; confirm it is hidden before opening, opens at the intended displayed time and stops accepting writes at closing. Check actual time zone handling, boundary times, manual closure and concurrent submission/closure. Do not apply MP2's appointment-date policy to job timestamps without an MP3 requirement.
- [ ] Withdraw a submitted record, including after job closure. Confirm its history/files remain and HR cannot add notes, change status or summarize it. Reapply to the same job only while active; confirm a separate new application and at most one non-withdrawn application. Closed-job reapplication must fail.
- [ ] Exercise duplicate/stale requests and storage/audit/provider failures. Confirm no partial application/file/status state or accidental role escalation; use actual transaction/race evidence.

Source/evidence: [canonical applications](../workflow/specs/applications-and-review.md), [job scheduling](../workflow/specs/job-management.md), [security](../workflow/specs/security-and-privacy.md), [database tests](../supabase/tests/database), [race suites](../tests/integration). Use disposable local fixtures for destructive tests; never reset a shared hosted project as part of this checklist.

## 3. Match guides, screens and implementation

- [ ] Walk the complete Applicant journey and HR journey using only the User Guide. Compare labels, validation, schedules, statuses, reapplication and failure/retry instructions with the candidate.
- [ ] Verify responsive navigation, role badges, pending/disabled controls, keyboard focus, empty/error states and long text on desktop and a narrow viewport. Do not infer a full accessibility audit from a few browser cases.
- [ ] If screenshots are added, capture the actual candidate with synthetic data; label role, page and viewport. Check every image belongs to the section it illustrates. No borrowed/template screenshots or private data.
- [ ] Check Developer Guide module/function names, schema, client privilege boundaries, commands, architecture diagrams and requirement IDs against real source. Link checks alone cannot establish that a method or description is accurate.
- [ ] Build the Docusaurus site; open rendered guides and their local/external navigation. Verify the published Pages revision after release. A PR build does not publish Pages, which is configured from `master`.

Source/evidence: [User Guide](UserGuide.md), [Developer Guide](DeveloperGuide.md), [Pages workflow](../.github/workflows/pages.yml), [Docusaurus configuration](../website/docusaurus.config.js).

## 4. Retain useful engineering strengths

- [ ] Keep Applicant/HR presentation distinct, with server-side role/ownership checks and database RLS. Review UI → action/service → persistence responsibilities, not only folder names.
- [ ] Retain full workflow, denial, stale-write, concurrency, rollback and asynchronous ordering tests. For each discovered data-loss sequence, add a focused regression demonstrating the user's outcome after the repair is approved.
- [ ] Verify format, lint, typecheck, unit tests, database replay/lint/tests, race suites and browser checks for the candidate. Report failures/skips and exact revisions. Coverage is currently an informational 90% reporting target, not an enforced minimum or proof of test quality.
- [ ] With authorized commits, separate independent runtime guards, UI behavior, tests/evaluations and documentation where each forms a coherent review unit. Keep generated lockfile churn identifiable; file/line count alone is not a quality metric. Do not rewrite published history without explicit authorization.
- [ ] Keep operative repo skills/profiles tracked and linked from AGENTS, CONTRIBUTING and the workflow catalogs. Distinguish a skill's instructions from an actual separate agent execution; verify any additional procedures named in reflections/logs are inspectable and acknowledged. MP3 uses handmade SDD; do not copy MP2's OpenSpec toolkit.

Source/evidence: [AGENTS](../AGENTS.md), [CONTRIBUTING](../CONTRIBUTING.md), [skills catalog](../workflow/skills/README.md), [profiles catalog](../workflow/agents/README.md), [CI](../.github/workflows/ci.yml), [Supabase CI](../.github/workflows/supabase-checks.yml), [coverage reporting](../.github/workflows/test-report.yml).

## 5. Finish student-owned evidence and release

- [ ] Paul personally verifies his reflection's factual claims, feelings and contribution ownership. John writes/verifies his own reflection; an outline is not a completed submission. Retain concrete prompts/mistakes/corrections/checks and AI acknowledgements without fabricating experiences.
- [ ] Verify every substantive development session is summarized, linked and checked by its student owner. Keep implementation approval, independent review, acceptance, PR, merge, staging and production evidence distinct.
- [ ] Before AI testing, check the specific feature packet and live-call authorization. PR #96's 24-call evaluation budget is exhausted; do not rerun it under the old approval. Deterministic/schema passes and model self-assessment cannot replace human quality review.
- [ ] Record a human release decision, promote the reviewed candidate through the team's release process, and check Production Supabase migrations/settings before the app depends on them. Recheck the deployed commit, authenticated workflows, SMTP/recovery, private downloads and published guides.
- [ ] Record unresolved issues, rollback owner/procedure and final evaluator access instructions. Retain old submission/file history and separate environments. Never publish private account passwords or keys as release evidence.

Source/evidence: [individual reflection index](Reflections.md), [session policy](../logs/README.md), [agent process](../workflow/AgentProcess.md), [operations specification](../workflow/specs/deployment-and-operations.md). This checklist and its local documentation build do not tick any hosted or personal-verification box above.
