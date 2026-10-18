# Proposed spec delta: Job management schedule timezone

- Change/issues/owner/status: `2026-10-18-scheduled-job-timezone`; [#111](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/111); John (Johnwz123); approved for implementation
- Canonical file: [job-management.md](../../../specs/job-management.md)
- Baseline: ProductSpec v1.17; canonical JMG-004
- Proposed baseline: v1.18 if accepted
- Dependencies/cross-capability IDs: JOB-001 in `public-job-listings.md`
- Approval: approved by John in chat on 2026-10-18; canonical sync remains gated on implementation review and separate acceptance

## MODIFIED JMG-004 — Scheduled opening and closing windows

### Before

JMG-004 defines optional `opens_at` and `closes_at` values and the operational behavior of scheduled jobs, but does not define the timezone used to interpret timezone-less HR input or render schedule values.

### Proposed after (recommended contract; pending approval)

When JavaScript is available, HR's opening and closing date/time inputs MUST be interpreted in the HR user's browser-local timezone and converted to UTC instants before submission. The database MUST continue to store those instants as UTC. When schedule values are shown, HR and public job-detail views MUST display the instant in the current viewer's browser-local timezone and identify that timezone. Server process timezone MUST NOT affect parsing, persistence, edit-form values, or displayed schedule times. Native HR forms MUST remain usable without JavaScript: the server MUST render schedule inputs in UTC, label that fallback, and interpret no-JavaScript submissions explicitly as UTC. Empty no-JavaScript schedule fields MUST continue to clear optional values. Existing ordering, publication, application, and closure rules remain unchanged; `closes_at` MUST be strictly after `opens_at` after conversion.

### Scenarios

- **sched-tz-AC-01:** Given HR enters a valid local schedule in the HR browser, when the server is configured for a different timezone, then the stored UTC instant is the one represented by the HR browser's local timezone.
- **sched-tz-AC-02:** Given a job already stores a UTC opening/closing instant, when HR opens the editor and saves without changing it, then the browser-local field round-trips without shifting the stored instant.
- **sched-tz-AC-03:** Given the same UTC closing instant, when viewers in different browser timezones see it, then each sees the equivalent wall-clock value and timezone identifier for their own browser timezone.
- **sched-tz-AC-04:** Given malformed, impossible, or reversed schedule values, when HR saves, then the existing invalid-form behavior prevents persistence.
- **sched-tz-AC-05:** Given JavaScript is disabled, when HR creates, edits, or clears an optional schedule and submits the native form, then the UTC fallback value is preserved and interpreted independently of the server timezone.
