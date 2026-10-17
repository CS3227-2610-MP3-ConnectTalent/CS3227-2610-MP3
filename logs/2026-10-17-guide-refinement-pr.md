# Guide Refinement and Developer Guide Expansion PR Preparation — 17 October 2026

Following the user's explicit instructions ("Looks good, can you create a branch and commit the changes... push these changes first and create a PR", and "There are a lot of review comments in the PR. Can you fetch them, then address and fix them, then commit and push the changes, then resolve the review comments that have been addressed"), this change completes documentation refinements across the User Guide and Developer Guide for Issue #103 and addresses all 26 PR #104 review comments.

Closes #103

- Evidence packet: [workflow/archive/2026-10-17-guide-refinement/record.md](../workflow/archive/2026-10-17-guide-refinement/record.md)
- PR: [#104](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/104)

## Summary of Changes
1. **User Guide Refinement**:
   - Re-targeted the User Guide specifically for end users (Applicants and HR Reviewers).
   - Relocated developer/local environment details (localhost endpoints, Mailpit on port 54324, local HR seed instructions, local vs. hosted database isolation notes, internal test tracking references, evaluator smoke test protocols, and developer troubleshooting entries) into the Developer Guide.
   - Preserved all content without deletion; retitled Section 6 to "Privacy and acceptable use".
   - Documented HR application review search, job/status/withdrawal filters, sorting, and pagination in Section 4.4.
2. **Developer Guide Section 3 Expansion (Product Definition)**:
   - Added Target User Profile and Personas (Guest / Job Seeker, Registered Applicant, HR Specialist / Reviewer, System Administrator / Evaluator).
   - Added Prioritized User Stories across functional areas with explicit priority tiers (`* * *`, `* *`, `*`).
   - Added 12 Formal Use Cases (UC01 through UC12) with Actors, Preconditions, Main Success Scenarios, and Extensions.
   - Added 12 corresponding Gherkin syntax behavioral product specifications matching UC01–UC12 1:1 across all feature areas.
   - Added Non-Functional Specifications (performance, security, data integrity, usability).
   - Added `"gherkin"` to `prism.additionalLanguages` in `website/docusaurus.config.js`.
3. **Developer Guide Section 5 Expansion (Architecture and Data Design)**:
   - Added Mermaid Entity-Relationship Diagram (`erDiagram`) reflecting exact PostgreSQL migration schema tables and columns (`application_status_events`, `application_resume_objects`, `profile_resume_objects`, etc.).
   - Added 4 Sequence Diagrams (Application Submission & Freeze, Sandboxed PDF Résumé Validation via `node:worker_threads` Worker with memory caps and 5s deadline, AI Cover Letter Generation & Explicit Adoption, HR Review & Notes) and 1 State Diagram (`stateDiagram-v2`).
   - Resolved Mermaid syntax formatting by ensuring no unquoted statement-terminating semicolons appear in diagram messages.
   - Added 6 Key Architectural and Design Decisions structured with Decision, Rationale, Alternatives Considered, and Trade-offs (including AI runtime service-key use for quota reservation/audit RPCs in 5.7.6 and operational environment separation practice).
4. **Developer Guide Section 7 Expansion (Testing Strategy)**:
   - Added Test Pyramid flowchart and Automated Test Inventory table pointing to `supabase/tests/database/`.
   - Added High-Risk Coverage Matrix mapping critical failure modes to mitigations (attributing reapplication to pgTAP tests and withdrawal lock enforcement to E2E).
   - Added Quality Verification Gates flowchart depicting parallel CI workflows (`ci.yml` and `supabase-checks.yml`) and numbered gate definitions.
   - Added 8 comprehensive Manual Testing Walkthrough Scenarios and the Hosted Smoke Testing Protocol.
   - Added Developer Troubleshooting and FAQ table.
5. **PR Review Remediation**:
   - Systematically addressed all 33 initial and 8 follow-up review comments on PR #104.
   - Modeled résumé tracking histories as zero-to-many with `resume_id` current pointers in ERD.
   - Documented `Scheduled` as a derived operational display label for `jobs.status = 'published'` with future opening times.
   - Documented all three raw binary PDF body upload paths (`/api/jobs/[id]/resume`, `/api/applications/[id]/resume`, `/api/profile/resume`) with respective storage buckets (`application-resumes` vs `profile-resumes`) and RPCs.
   - Clarified bounded worker thread boundary (`node:worker_threads`) across Gherkin scenarios and non-functional specifications.
   - Described password rules strictly as 8–72 characters length constraints without overstating complexity rules.
   - Described telephony validation accurately as known calling codes plus 7–15-digit international formats.
   - Represented application submission as one database-internal transactional RPC (`submit_application_details_v3`) establishing advisory-lock -> job-row -> application-row lock order.
   - Split AI draft sequence failure paths into 503 (provider error/timeout) and 502 (schema validation failure) with mandatory `finalize_ai_invocation` audit.
   - Removed Dependabot claim and duplicate rows from CI utility test inventory (`tests/ci/`).
   - Kept archive README index entry pending until separate student acceptance decision is recorded.
   - Routed note creation through the protected security-definer RPC `append_hr_application_note` in HR review sequence and decisions.
   - Verified that all use cases, diagrams, endpoints, and schema attributes reflect exact implementation in code, eliminating documentation drift.

## Verification
- Verified code formatting with `pnpm exec prettier --check docs/UserGuide.md docs/DeveloperGuide.md website/docusaurus.config.js` (0 errors).
- Verified documentation build with `npm --prefix website run build` (compiled successfully with 0 broken links and 0 diagram syntax errors).
- Cleaned persistent build caches with `npm --prefix website run clear`.

Target base branch: `develop`
Head branch: `docs/refine-user-and-developer-guides`

