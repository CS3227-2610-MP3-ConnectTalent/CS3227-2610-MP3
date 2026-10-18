# Design: Scheduled job timezone handling

- Change ID/issues: `2026-10-18-scheduled-job-timezone`; [#111](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/111)
- Owner/status/date: John (Johnwz123); approved; 2026-10-18
- Inputs: [proposal.md](proposal.md); JMG-004 and JOB-001; ProductSpec v1.17
- Scope and affected components/files: `src/lib/hr-job-input.ts`, `src/app/hr/jobs/job-editor.tsx`, `src/app/hr/jobs/[id]/page.tsx`, `src/app/jobs/[id]/page.tsx`, their focused unit tests, and a proposed JMG-004 delta.

## Decisions and alternatives

| Decision            | Considered alternatives                                                                                                                                              | Reason and tradeoffs                                                                                                                                         | Human approval reference                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Schedule timezone   | HR-browser local timezone for entry; each viewer's browser timezone for display                                                                                      | Matches each user's local clock. The same event is shown as different local wall-clock values but remains one UTC instant.                                   | Approved by John in chat on 2026-10-18                       |
| Conversion boundary | Convert the HR browser's `datetime-local` wall-clock value to a UTC ISO instant in a client component; send that explicit instant through the existing Server Action | The server receives an offset-bearing ISO instant and never interprets a timezone-less wall-clock value.                                                     | Approved by John in chat on 2026-10-18                       |
| Rendering           | Browser-local date/time plus the browser's IANA timezone identifier; deterministic UTC fallback before hydration                                                     | The client is the only runtime with the viewer's timezone. The UTC fallback remains accurate without JavaScript and avoids server/client hydration mismatch. | Approved by John in chat on 2026-10-18                       |
| No-JavaScript form  | Preserve native date/time controls and explicitly interpret their UTC-rendered values as UTC                                                                         | Keeps create/edit/clear submission available without JavaScript while ensuring the server timezone cannot change the instant.                                | John selected the labeled UTC fallback in chat on 2026-10-18 |

## Interfaces and data flow

1. The server renders the native schedule controls with existing UTC instants represented as UTC wall-clock values. This is the labeled fallback when JavaScript is unavailable.
2. With JavaScript, the component presents values in the HR browser's local timezone and converts edits to explicit UTC ISO instants in the named hidden fields. It marks the enhanced submission so a missing or invalid converted value cannot fall back to the UTC no-JavaScript path.
3. Without JavaScript, the visible, named local controls and blank hidden UTC fields are submitted natively. The server parses that fallback as UTC wall time, never as process-local time. Empty fields still clear schedules.
4. The Server Action validates either the enhanced offset-bearing instant or the explicitly selected no-JavaScript UTC fallback, then passes a UTC ISO value through existing ordering validation and persistence.
5. The database/RPC path continues to receive UTC instants. Existing ordering checks and schedule-window comparisons remain unchanged.
6. On edit, the hydrated client component converts the UTC instant back to the HR browser's local datetime value. HR and public schedule displays render each UTC instant in the current viewer's browser timezone and identify that IANA timezone. Before hydration or without JavaScript, they render a clearly labeled UTC fallback.

No server-side formatting or parsing may use `process.env.TZ` or server-local getters. Client conversion uses the browser's current timezone, surfaced in the UI. The instant stored in UTC remains stable if a user's timezone changes.

## Authorization and privacy impact

N/A for authorization/data access: the change does not alter server-action authorization, Supabase policies, roles, or data retention. HR continues to edit drafts only through existing authorized actions; public details continue to use the existing published/open job query. The timezone label reveals no additional personal data.

## Failure behavior

| Failure / adversarial input                                            | Observable outcome / state guarantees                                                                                        | Verification                                    |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Malformed or impossible wall-clock value                               | Reject input through the existing safe invalid-form path; no write                                                           | sched-tz-AC-04                                  |
| Local wall time falls inside a daylight-saving gap                     | Detect that local construction normalized to a different wall time; show a field error and do not submit an invalid instant  | sched-tz-AC-04                                  |
| Local wall time repeats during a daylight-saving overlap               | JavaScript's local `Date` chooses the earlier occurrence; display the selected timezone and retain the resulting UTC instant | Documented limitation; focused test if feasible |
| Closing instant not after opening instant after timezone conversion    | Keep the existing validation error; no write                                                                                 | sched-tz-AC-04                                  |
| Server timezone differs from HR/viewer browser timezone                | Input conversion and UTC persistence follow the HR browser; rendering follows the viewer browser                             | sched-tz-AC-01 / 02 / 03                        |
| Browser cannot expose an IANA timezone identifier                      | Continue using browser-local Date/Intl behavior and label the value "your local time"                                        | Local component test or code review             |
| JavaScript unavailable during HR form submission                       | Show UTC wall-clock values in named native inputs; interpret edits or clears explicitly as UTC and keep the form usable      | sched-tz-AC-05                                  |
| JavaScript is enabled but cannot convert an entered browser-local time | Reject the enhanced submission instead of treating the local wall time as the no-JavaScript UTC fallback                     | sched-tz-AC-04                                  |

## Migration and backward compatibility

No migration. Existing timestamps are UTC instants and remain unchanged. The UI presents those instants in each viewer's browser-local timezone. Existing optional schedule fields, action contracts, RPC arguments and database constraints remain unchanged.

## Rollout and rollback

No data migration or job-window backfill is required. Rollback is an application revert; the database continues to store/read UTC instants. Pre-release verification must confirm HR entry uses the HR browser timezone and both HR/public displays identify the viewer's timezone.

## Review and unresolved decisions

- [x] Interfaces, no-schema-change scope, security impact, failure cases and rollback are assessed.
- Findings/owner/resolution: John selected browser-local input/display with UTC storage on 2026-10-18; daylight-saving overlap behavior is documented above.
- Human approval: John approved the browser-local/UTC contract in chat on 2026-10-18 and selected the labeled UTC native-form fallback after review on the same date.
