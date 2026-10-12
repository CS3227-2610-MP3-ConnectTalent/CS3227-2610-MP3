# Design: HR recruitment dashboard

- Issue: [#68](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/68)
- Owner/status/date: John Wong (Johnwz123); approved for implementation; 2026-10-12
- Inputs: proposal.md, proposed APP-009 delta, ProductSpec v1.8 at 84761e1; APP-003/008, JMG-001/003, SEC-001/002
- Scope: src/app/hr/page.tsx, src/lib/hr-dashboard.ts, src/lib/hr-applications.ts, src/components/account-navigation.tsx, focused unit/E2E tests, package.json, docs/UserGuide.md. Canonical changes wait for acceptance.

## Decisions and alternatives

| Decision                                                                                         | Alternatives                                     | Reason and tradeoff                                                                                                                         | Approval                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Use /hr as the server-rendered dashboard and add an HR-only navigation link                      | /hr/dashboard; keep existing pages separate only | Simple landing route; existing job/review pages stay focused                                                                                | In-chat design and packet approved 2026-10-12 |
| Reuse listHRJobs() and listSubmittedApplications() and aggregate validated rows in a pure helper | Database view/RPC; direct page queries           | Reuse HR authorization/RLS reads, no new SQL/security surface, count rules can be unit tested. Reads full results; revisit if volume grows. | In-chat design and packet approved 2026-10-12 |
| Exclude withdrawn rows from review-status counts and show separately                             | Count old status together with withdrawal        | Withdrawal is terminal and prior review status remains; separate totals avoid double counting                                               | In-chat design and packet approved 2026-10-12 |

## Interfaces and data flow

1. HR uses the /hr link in src/components/account-navigation.tsx.
2. The server page concurrently calls listHRJobs() and listSubmittedApplications(). Both authorize through requireHR() and query with the signed-in Supabase server session subject to RLS.
3. Extend the HR submitted-application list select/schema with job_id. Pass validated rows to a pure src/lib/hr-dashboard.ts aggregation function.
4. Return only job labels/status and counts. Do not return applicant IDs, contact fields, letters, notes, résumé data or file metadata.
5. Render totals, a per-job table and links to /hr/jobs, /hr/jobs/[id], and /hr/applications. No client query, mutation or API route.

## Authorization and privacy impact

Only verified HR may read this page. The existing server data functions enforce requireHR() before queries and use the RLS-scoped session. Navigation is presentation, not authorization. Anonymous users follow the existing sign-in redirect; non-HR users receive the existing not-found denial. Counts remain HR-sensitive. Render only job labels and counts. No public aggregate endpoint, RLS policy or grant change is proposed.

## Failure behavior

| Failure / input                       | Outcome                                                     | Verification                        |
| ------------------------------------- | ----------------------------------------------------------- | ----------------------------------- |
| Anonymous or Applicant request        | Existing redirect/not-found; no aggregates                  | E2E denial cases; HRD-AC-04         |
| Either HR read fails                  | Generic unavailable message; no partial counts/query detail | Page test mock; HRD-AC-05           |
| Duplicate job titles                  | Rows remain distinct by job_id                              | Pure-helper test; HRD-AC-02         |
| Withdrawn row has prior review status | Count only under Withdrawn                                  | Pure-helper test; HRD-AC-01/02      |
| Empty results                         | Zero totals and empty table guidance                        | Unit/page/browser checks; HRD-AC-03 |

## Migration and backward compatibility

No migration, data backfill or persistent state. Existing job/application rows and APP-003/008 rules remain. The existing HR list adds job_id for grouping; no application behavior changes.

## Rollout and rollback

Ordinary application deployment through the issue-linked PR; no migration or environment setting. Revert the page, navigation, helper and job_id read extension if needed. Persisted data is unaffected. Hosted release is separate.

## Review and unresolved decisions

- [x] Interfaces and IDs align with proposed APP-009 and existing HR reads.
- [x] Security, privacy, failure, migration and rollback assessed.
- Findings: none recorded; independent implementation review remains pending.
- Human approval: John Wong approved the design and complete packet in chat on 2026-10-12 (“Looks good, I approve. Please proceed.”).
