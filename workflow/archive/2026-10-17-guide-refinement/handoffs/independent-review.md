# Independent review handoff: Guide refinement and developer guide expansion

- Issue: [#103](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/103)
- Reviewer: Independent Reviewer (`mp3-independent-verification` role)
- Date: 17 October 2026

## Review Scope & Findings

Conducted independent verification of `docs/DeveloperGuide.md`, `docs/UserGuide.md`, and `workflow/archive/2026-10-17-guide-refinement/` against repository code in `src/`, `supabase/migrations/`, `tests/`, and `.github/workflows/`.

### Verified Invariants

1. **Schema & Database Model**:
   - Table names match migrations: `application_status_events`, `application_resume_objects`, `profile_resume_objects`.
   - Cardinalities in Mermaid ERD correctly represent zero-to-many tracking histories (`applications ||--o{ application_resume_objects`, `applicant_profiles ||--o{ profile_resume_objects`) and zero-to-one current object pointers via `resume_id`.
   - Note creation in Diagram 5.6.4 and Decision 5.7.5 correctly routes through the security-definer RPC `append_hr_application_note(applicationId, text)`, acknowledging that direct `INSERT` on `application_notes` is revoked from authenticated clients.
2. **Runtime Endpoints & Execution Boundaries**:
   - Upload sequence Diagram 5.6.2 and UC06 reflect raw binary body upload (`Content-Type: application/pdf`, `x-resume-intent`, `x-resume-filename`) consumed by `readResumeFile` without `multipart/form-data` parsing.
   - PDF validation is documented as an isolated Node worker thread (`node:worker_threads`) with strict V8 heap limits ($64\text{ MiB}$ old gen / $16\text{ MiB}$ young gen) and a 5-second termination timer.
   - AI draft route Diagram 5.6.3 documents mandatory audit finalization (`finalize_ai_invocation(..., 'success')` on valid output, and `finalize_ai_invocation(..., 'failed')` on provider error or schema validation failure) prior to returning responses.
   - Operational label `Scheduled` is correctly documented as a derived display state from `jobs.status = 'published'` with future `opens_at`.
3. **CI Workflows & Test Inventory**:
   - Test inventory includes always-run CI utility tests under `tests/ci/`.
   - Quality verification gates diagram accurately illustrates two independent GitHub Actions workflows (`ci.yml` and `supabase-checks.yml`) with parallel sibling jobs (`database-checks`, `integration-checks`, `browser-tests`).
4. **Static Verification**:
   - Prettier formatting verified: exit code 0.
   - Docusaurus site build verified: exit code 0, 0 broken links, 0 diagram syntax errors.
