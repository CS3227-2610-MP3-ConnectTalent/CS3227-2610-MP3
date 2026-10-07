# Applicant application change planning — 7 October 2026

Verification status: **student review pending**. This is a summary of the available conversation, not a transcript or an implementation result.

The user asked what to do after creating `feat/6-applicant-applications`, then asked Codex to prepare the next SDD step. Codex read issue #6, the v0.6 capability specs, the project process/templates, and the existing public jobs data path. It drafted a change packet under `workflow/changes/2026-10-07-applicant-applications/` with proposal, proposed APP-004 and SEC-001 deltas, design, plan, tasks and record. No implementation, test, commit, push or PR was performed.

The user chose that unfinished cover letters must be saved between visits and that submitted letters may be edited until the job closes. The question stated that the original submitted version would remain available to HR. The packet proposes a private draft/submitted lifecycle, an immutable original snapshot, current text with a revision, and an explicit textarea interface for the teammate's AI feature. Those technical choices and the 5,000-character proposal still need student/teammate review. The full proposal/design/plan has not been approved.

One Codex execution produced the packet; no separate agent handoff or independent review occurred. Official Supabase SSR, RLS and database-function guides were consulted for design boundaries. `git diff --check` passed for the tracked change; a local script found no broken relative links in 9 Markdown files and no trailing whitespace in the 8 new Markdown files. The acceptance IDs were reviewed against the proposal and plan. The packet records tests and security cases to run after approval but claims no passing application checks.
