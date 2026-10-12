# Spec delta: applications and HR review

- Change/issues/owner/status: `2026-10-12-hr-dashboard`; [#68](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/68); John Wong (`Johnwz123`); approved for implementation
- Canonical file: [applications-and-review.md](../../../specs/applications-and-review.md)
- Baseline: ProductSpec v1.8, commit `84761e1`; APP-003 and APP-008
- Accepted baseline: v1.9, synced on 2026-10-13
- Dependencies/cross-capability IDs: [JMG-001/JMG-003](../../../specs/job-management.md), [SEC-001/SEC-002](../../../specs/security-and-privacy.md)
- Approval: John Wong approved the packet in chat on 2026-10-12 (“Looks good, I approve. Please proceed.”). On 2026-10-12 he confirmed it was fully approved and directed sync/archive/PR after being shown the known check results.

## ADDED

### APP-009: HR recruitment overview

- Before: ProductSpec v1.8 defines HR submitted-application review and job lifecycle management, but has no HR overview/dashboard requirement.
- After: Verified HR MUST be able to view a read-only overview of this employer's jobs and submitted applications at `/hr`. The overview MUST show job counts by Draft, Published and Closed state; active submitted-application counts by Submitted, In review, Shortlisted and Rejected review status; and a separate Withdrawn count. Withdrawn applications MUST NOT be included in active review-status counts, although their stored prior review status remains unchanged. The overview MUST show active submitted and withdrawn counts per job, grouped by job ID, and MUST include jobs with no applications and closed jobs. It MUST provide links to the existing HR job-management and application-review pages. It MUST NOT expose applicant identity/contact data, application text, HR notes, résumé contents, or file metadata. Dashboard reads MUST use the existing authorized HR server-side data path; anonymous visitors and Applicants MUST receive no aggregate data. The dashboard MUST NOT change jobs, applications, notes, files, review states or withdrawal state.
- Rationale/acceptance IDs: #68; HRD-AC-01 through HRD-AC-05.
- Scenario: **Given** a verified HR user and existing jobs/submitted applications, **When** the user opens `/hr`, **Then** the page shows lifecycle/status totals and per-job active/withdrawn counts, including zero rows and closed jobs, with links to the existing HR lists.
- Denial/failure scenario: **Given** an anonymous visitor or Applicant, **When** they request `/hr`, **Then** existing HR authorization denies access and no counts render. **Given** either source read fails, **When** HR opens `/hr`, **Then** the page displays a generic unavailable message and no partial or query-detail response.

## MODIFIED

None.

## REMOVED

None.

## Delta review and sync evidence

- [x] APP-009 is unused in the v1.8 canonical file; no existing ID is renumbered or retired.
- [x] Every proposed rule and scenario approved by John Wong on 2026-10-12 before product implementation.
- [ ] Independent review execution evidence: not supplied; no reviewer identity, run, scope or findings are claimed.
- [x] John Wong accepted the change for sync/archive on 2026-10-12 by stating it was fully approved after the known check results were presented.
- [x] Synced APP-009 to canonical `applications-and-review.md`; ProductSpec/spec index updated to v1.9 on 2026-10-13; IDs and links verified before complete packet archive.
- Sync commit/paths/decision evidence: closeout change is included in the `docs(workflow): sync and archive HR dashboard change` commit on `feat/68-hr-dashboard`; canonical destinations are listed above.
