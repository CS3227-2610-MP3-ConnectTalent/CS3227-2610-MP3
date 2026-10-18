# Proposal: HR application review and human status actions

- Change ID: `2026-10-08-hr-application-review`
- Issue: [#9 — HR: review applications, notes, and status changes](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/9), read with `gh issue view 9` on 2026-10-08. Dependency: Applicant workflow from [PR #15](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/15), merged into `develop`.
- Owner: Paul Cheng for the full application workflow, per this conversation; the teammate owns AI features. Issue #9 currently has no GitHub assignee.
- Status/date: **approved for implementation, then locally accepted with recorded limits**, 2026-10-08. Paul Cheng approved the complete proposal, four deltas, design and plan, then separately accepted the local feature after independent review.
- Baseline: [ProductSpec v0.7](../../ProductSpec.md), `develop` commit `551da67` after fetch on 2026-10-08. Branch: `feat/9-hr-application-review`, created from that commit.
- Classification: behavior change and implementation of APP-003/SEC-001 with clarifications to ACC-002, APP-002/003, SEC-001 and OPS-001. Medium/high risk because authorization, private notes, schema and shared preview database change.

## Intent, problem, and scope

HR currently has no review interface, private notes or status action. Issue #9 requires authorized HR to read submitted applications and original letters, keep notes private, update status through a separate human action, and let each Applicant see only their own application and status. Build this as the second half of the application workflow for one employer per deployment.

**Goals:** HR list of submitted applications, detail with original and current letter, append-only HR notes with author/time, separate status action, Applicant-visible current status, controlled HR assignment and role-aware sign-in routing. Retain submitted applications after job closure. Show only the data required by each role.

**Non-goals:** HR job posting/publishing (#8), SoCLaaS or HR AI summary (#10), AI-generated decisions, Applicant access to HR notes or other Applicants, public HR signup, employer tenancy, resume uploads, automatic emails, and production deployment in this feature PR.

**Boundaries:** User-facing HR pages and server actions under `src/app/hr/`; focused HR data/auth modules under `src/lib/`; additive Supabase migration/tests. Existing Applicant form/save/submit behavior must continue. The teammate's AI files are excluded. A later HR summary may consume a submitted application's current letter, revision and published job requirements, but never notes and never mutate status.

## Product choices and proposed policy

The user selected on 2026-10-08: `Submitted`, `In review`, `Shortlisted`, `Rejected`; add-only HR notes with author/time; and manual administrator assignment of HR after verified signup. The approved policy further specifies that `Submitted` is the initial status set only by explicit Applicant submission. Authorized HR may change it to one of the other three statuses and may change among those three to correct a decision. HR cannot set it back to `Submitted`. Every change is a separate, explicit form action with a recorded actor and time.

## Alternatives, dependencies and risk

| Choice | Alternative | Reason / consequence |
| --- | --- | --- |
| Add-only notes table | One editable note field on applications | Separate rows preserve author/time and avoid exposing notes through the Applicant's application row. |
| Nullable review status on applications plus separate status events | Store status only in UI or in a private notes table | Applicant needs own current status; one constrained column plus narrow HR mutation is simplest. Events preserve human status changes. |
| Manual admin promotion after verified Applicant signup | Public HR signup or a service-role key in app code | Controlled admin promotion prevents self-granted HR role; no privileged key reaches the app/browser. |
| Additive, backward-compatible migration | Replace application schema destructively or require per-PR database branch | The team's Vercel previews share Development Supabase. Additive migration and old-app compatibility permit a reviewed development migration before preview smoke tests. |

- Deployment architecture supplied by the user: Vercel **production from `master`** uses a separate Production Supabase project; Vercel **previews from all other branches, including `develop`**, use the Development Supabase project. A Supabase *project* is intended, not a Git branch. `getAppSiteOrigin()` already uses Vercel-provided URLs for production/preview Auth callbacks; this change does not replace it with a fixed URL.
- Preview limitation: before the Development Supabase migration is applied, a PR preview containing HR pages may not work against its shared database. The PR must label this state honestly. Apply the migration only after local tests and SQL/security review, through a coordinated team-controlled operation; then run preview smoke tests. Production migration belongs to the later `develop` → `master` release sequence and precedes the production app needing the schema.
- Risks: Applicant seeing notes, HR seeing drafts, role escalation, cross-user data leaks, unverified HR access, stale writes/status races, job closure, migration drift between preview app and shared database, and status actions accidentally triggered by AI. [Design](design.md) and [plan](plan.md) address these.
- Approved decision: no status-change reason is required; `Submitted` is initial-only, HR can change among the other three statuses, and HR promotion uses a verified account with no Applicant applications in this release.

## Acceptance criteria and evidence targets

| ID | Issue/requirements | Given / when / then | Required evidence |
| --- | --- | --- | --- |
| `hr9-AC-01` | #9; ACC-002, SEC-001/002 | Verified user promoted by an administrator reaches HR routes; ordinary signup remains Applicant and cannot self-promote. A promoted account cannot use former Applicant ownership to read an old draft. | DB role/grant tests plus browser HR/Applicant route checks. |
| `hr9-AC-02` | #9; APP-003, SEC-001 | HR list/detail shows only submitted applications, job/title and original/current letters; drafts stay invisible even by direct ID. | pgTAP RLS and browser direct-URL cases. |
| `hr9-AC-03` | #9; APP-003, SEC-001 | HR adds a note; author/time appear to HR, while Applicant and anonymous reads return none. | DB denial and browser owner/cross-user cases. |
| `hr9-AC-04` | #9; APP-002/003, SEC-001 | HR separately changes status to an allowed value; Applicant sees only their own current status, not notes; Applicant/anonymous/other users cannot change status. | DB function/grant, unit action and browser tests. |
| `hr9-AC-05` | #9; APP-003/004, JMG-003 | Closing a job preserves submitted records, original/current letters, HR notes and status under the same access rules. | DB and browser closed-job cases. |
| `hr9-AC-06` | #9; SEC-002/007 | Invalid/stale/duplicate status submissions do not silently overwrite state; audit records contain actor, operation, target, time and outcome without letters/notes. | DB transaction and sanitized log/event review; record partial SEC-007 coverage honestly. |
| `hr9-AC-07` | #9; OPS-001/003 | Old `develop` Applicant flow works with the additive migration; PR preview smoke is run only after Development Supabase migration is recorded; no Production Supabase change during this PR. | Migration compatibility check, environment/config review and actual preview evidence or explicit pending state. |

Packet: [APP delta](specs/applications-and-review.md), [ACC delta](specs/accounts-and-roles.md), [SEC delta](specs/security-and-privacy.md), [OPS delta](specs/deployment-and-operations.md), [design](design.md), [plan](plan.md), [tasks](tasks.md), [record](record.md).

## Approval record

- [x] User selected statuses, add-only notes and manual HR assignment on 2026-10-08 in this conversation.
- [x] Student owner reviewed and approved the complete proposal, four deltas, design and plan, including status transitions and shared database rollout.
- Approver/decision/source: Paul Cheng, 2026-10-08, explicit conversation reply “Approve as written (Recommended)” to the question naming all packet artifacts and policy choices. This is implementation approval, not feature acceptance or shared database migration authorization.
- [x] Paul Cheng separately accepted the local implementation on 2026-10-08 with incomplete SEC-007 audit and shared Development Supabase/preview smoke recorded as limits. See [record](record.md). No commit, PR, hosted migration or release was authorized by this decision.
