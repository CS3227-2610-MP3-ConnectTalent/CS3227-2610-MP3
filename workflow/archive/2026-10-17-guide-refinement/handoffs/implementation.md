# Implementation handoff: Guide refinement and developer guide expansion

- Issue: [#103](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/103)
- Author: John Wong
- Date: 17 October 2026

## Work Completed

1. **User Guide (`docs/UserGuide.md`)**:
   - Re-targeted all prose towards Applicants and HR Reviewers.
   - Preserved all content without deletion; relocated developer instructions to Developer Guide Section 2.
   - Documented search, filtering, and pagination in HR application review.
2. **Developer Guide (`docs/DeveloperGuide.md`)**:
   - Added Personas and Prioritized User Stories to Section 3.
   - Authored 12 Formal Use Cases (UC01–UC12) with Actors, Preconditions, Main Success Scenarios, and Extensions.
   - Authored 12 Gherkin Feature Specifications corresponding 1:1 with UC01–UC12.
   - Added Non-Functional Specifications.
   - Expanded Section 5 with an exact Mermaid ERD matching PostgreSQL migrations (`application_status_events`, `application_resume_objects`, `profile_resume_objects`, etc.).
   - Added 4 Sequence Diagrams (Freeze on submit, sandboxed PDF validation via `node:worker_threads` with 5s timeout and memory limits, AI cover letter drafting, HR notes) and 1 State Diagram (`stateDiagram-v2` with direct transitions and terminal Withdrawn state).
   - Documented 6 Architectural Decisions with Alternatives and Trade-offs (including AI service-key usage for quota audit RPCs and operational environment isolation).
   - Expanded Section 7 with Test Pyramid, Test Inventory pointing to `supabase/tests/database/`, High-Risk Coverage Matrix, Quality Verification Gates flowchart showing parallel CI workflows (`ci.yml` and `supabase-checks.yml`), 8 Manual Testing Walkthrough Scenarios, and Developer FAQ.
3. **Docusaurus Config (`website/docusaurus.config.js`)**:
   - Registered `"gherkin"` in `prism.additionalLanguages`.
4. **Code Review Remediation**:
   - Remediated all 26 automated code review comments across `docs/DeveloperGuide.md`, `docs/UserGuide.md`, and workflow documentation.

