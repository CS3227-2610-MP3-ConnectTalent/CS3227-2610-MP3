# Plan: #40 and navigation integration

1. Record human approval of proposal, design reuse/omission and plan.
2. Integrate existing #36 changes without committing, preserving #39 and student reflection files; reconcile combined canonical baseline to v1.3 and keep both acceptance traces.
3. Read installed Next.js guides before code edits. Add a focused signup presentation regression, observe it fail on the existing local notice, remove the conditional/notice, then verify.
4. Run existing navigation/sign-out tests, signup presentation test and typecheck; use local synthetic browser navigation checks if available. Test scope is the changed UI/auth integration, not new database behavior.
5. Have a separate reviewer assess integration, tests and privacy/auth boundaries. Record failures/fixes and truthful limits, then obtain separate acceptance.
6. Close out evidence/logs and archive; commit/push/PR only after explicit user instruction.

Primary owns integration and signup page/test changes; no workers assigned. Exclude user reflection files, secrets, hosted settings and teammate AI changes. Rollback removes this bounded integration/notice change while preserving #39. This plan does not authorise Git history rewriting, merge to develop or deployment.
