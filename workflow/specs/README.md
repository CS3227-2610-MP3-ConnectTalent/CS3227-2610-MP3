# Capability specification conventions

## Canonical baseline and index

These files are the canonical product requirements for [ProductSpec](../ProductSpec.md) **v0.9, 8 October 2026**. The split dated 6 October 2026 preserved v0.6 behavior; the accepted Applicant change dated 7 October added ACC-001, APP-004 and SEC-001 clarifications. The locally accepted HR review change dated 8 October modified ACC-002, APP-002/003, SEC-001 and OPS-001. The later accepted signup change modified ACC-001. Neither version nor the split certifies hosted migration or release acceptance. [ProductSpec](../ProductSpec.md) indexes the nine modules.

## IDs and normative language

Each normative requirement has a stable ID: capability prefix, hyphen, zero-padded number of at least three digits (for example, JOB-001). Prefixes are OVR (overview), ACC (accounts), JOB (public listings), JMG (job management), APP (applications), AID (Applicant draft), AIS (HR summary), SEC (security/privacy), and OPS (operations). Numbers are unique within a prefix and assigned in increasing order. Allocate a new unused number when adding a requirement; do not renumber existing IDs during edits or reorganization.

MUST and MUST NOT express required behavior and prohibitions. MAY expresses an option, not a release requirement. Descriptive context and unresolved decisions are labeled separately. Scenarios use Given (actor/state/input), When (action), Then (observable outcome). Include denial outcomes for security-sensitive paths where appropriate. A scenario is a specification example, not a test result. Do not infer unlisted product decisions from examples.

## Cross-spec links and changes

Give each rule one canonical home. Cross-cutting authorization, access tables, privacy and AI safeguards belong in [security-and-privacy.md](security-and-privacy.md); capability specs link there. Link using a relative file path and cite the stable ID in the link text or nearby prose. Optional heading anchors must match the target heading. Links and illustrative scenarios do not create another independently editable copy of a rule. Changes affecting several capabilities must identify every affected file and ID.

An approved product behavior change increments the numeric minor baseline (for example, 0.6 to 0.7) and updates the version/date in ProductSpec and affected specs together. Pure wording, link repair or reorganization with no intended behavior change retains the version and records the documentation date separately. Use an approved change delta with ADDED, MODIFIED or REMOVED entries before syncing canonical specs. Modified requirements retain their IDs. Removed requirements record their IDs and retirement rationale in preserved change history; never reuse retired IDs. If a rule moves, retain its ID and record the old/new canonical location rather than silently assigning a replacement ID.

## v0.9 accepted change trace

On 8 October 2026, Paul Cheng accepted the local issue #20 signup password usability fix in this conversation. The [archived change packet](../archive/2026-10-08-signup-password-ux/record.md) records the retrospective issue/packet sequence, independent review, local checks and distinct acceptance. Its accepted delta was synced before archive:

| Delta | Canonical destination | Change |
| --- | --- | --- |
| Modified ACC-001 | [Accounts and roles](accounts-and-roles.md) | Retain signup email on mismatch with or without JavaScript; accessible non-submitting password visibility controls; no password in server action error state |

The missing pre-implementation packet approval cannot be recreated. This local acceptance does not certify PR, merge, hosted validation or release.

## v0.8 accepted change trace

On 8 October 2026, the Applicant/application workflow owner accepted the **local** issue #9 HR review feature with recorded limits. The complete [archived change packet](../archive/2026-10-08-hr-application-review/record.md) records the implementation approval, separate review, local checks and student acceptance. Its accepted deltas were synced before archive:

| Delta | Canonical destination | Change |
| --- | --- | --- |
| Modified ACC-002 | [Accounts and roles](accounts-and-roles.md) | Verified, no-application manual HR promotion and role-aware sign-in |
| Modified APP-002/003 | [Applications and review](applications-and-review.md) | Applicant own status; submitted-only HR review, private append-only notes and separate human status actions |
| Modified SEC-001 | [Security and privacy](security-and-privacy.md) | Applicant/HR draft, status, note/history and promoted-owner boundaries |
| Modified OPS-001 | [Deployment and operations](deployment-and-operations.md) | `master` production vs non-`master` previews with separate Supabase projects and a shared-development migration gate |

Full SEC-007 audit coverage, the Development Supabase migration/preview smoke and production release remain open; local acceptance does not certify them.

## v0.7 accepted change trace

On 7 October 2026, the Applicant owner accepted the local issue #6 flow. The complete [archived change packet](../archive/2026-10-07-applicant-applications/record.md) records the decision, independent review, verification and remaining release limits. Its accepted deltas were synced before archive:

| Delta | Canonical destination | Change |
| --- | --- | --- |
| Modified ACC-001 | [Accounts and roles](accounts-and-roles.md) | Password confirmation and required email verification |
| Added APP-004 | [Applications and review](applications-and-review.md) | Persistent private draft, immutable first submission and current-letter edits until closure |
| Modified SEC-001 | [Security and privacy](security-and-privacy.md) | Separate draft/submitted access and original/current text boundaries |

The original v0.6 migration and release trace below remains historical. Local feature acceptance does not complete the nine release acceptance items.

## v0.6 source-to-destination trace

This migration trace covers the original ProductSpec v0.6 section by section. Destination IDs locate the canonical meaning; repeated source statements map to the same rule rather than introduce duplicates. The original nine acceptance statements are retained verbatim below as migration/release trace entries, with normative rules residing in the linked modules. This is source review, not runtime evidence.

| Original source section/item | Preserved requirement/context | Destination |
| --- | --- | --- |
| Version heading | v0.6, job listing detail, 5 October 2026 | [ProductSpec](../ProductSpec.md), module baseline headers |
| Scope paragraph 1 | One company's vacancies/applicants/HR per deployment | [OVR-001](product-overview.md) |
| Scope paragraph 1 | Multiple openings, one text-only application/applicant/job; external Applicant and HR; course-required SoC LLM | [OVR-002](product-overview.md), [APP-001](applications-and-review.md) |
| Scope paragraph 1 | Intended behavior; source scaffold only a placeholder home page | [Historical implementation context](product-overview.md#unresolved-ownership-and-implementation-evidence), [OPS-003](deployment-and-operations.md) |
| Scope paragraph 2 | Reusable neutral Careers branding; one employer; no employer signup/switching/cross-company search/multi-tenant company table; new design needed for several employers | [OVR-001](product-overview.md) |
| Scope paragraph 3 | Title, team, description, requirements; required controlled category with all five values | [JOB-002 / JOB-003](public-job-listings.md) |
| Scope paragraph 3 | HR draft/published/closed lifecycle, draft editing, fixed published content and same review requirements | [JMG-001 / JMG-002 / JMG-003](job-management.md) |
| Scope paragraph 3 | Published browsing, optional category filter, published-job detail; category grants neither access nor hiring decisions | [JOB-001 / JOB-002 / JOB-003](public-job-listings.md) |
| Scope role table: Applicant | Own application/final letter; notes+published-job draft; edit and explicitly submit | [OVR-002](product-overview.md), [APP-001 / APP-002](applications-and-review.md), [AID-001 / AID-002](applicant-ai-draft.md) |
| Scope role table: HR | Company jobs/review/status; submitted-letter summary against published requirements; publish/read original/decide | [OVR-002](product-overview.md), [JMG-002](job-management.md), [APP-003](applications-and-review.md), [AIS-001 / AIS-002](hr-ai-summary.md) |
| Scope ownership paragraph | One student primary owner per role; team work/reviews in feature records; names unresolved | [Unresolved ownership](product-overview.md#unresolved-ownership-and-implementation-evidence) |
| Core behavior 1 | Public signup creates Applicant; HR assignment through controlled administration | [ACC-001 / ACC-002](accounts-and-roles.md), [SEC-001](security-and-privacy.md) |
| Core behavior 2 | HR create/edit draft, explicit publish/close; only published list/accept; closing preserves existing applications | [JMG-001 / JMG-002 / JMG-003](job-management.md), [JOB-001](public-job-listings.md), [APP-001](applications-and-review.md) |
| Core behavior 3 | Browse/filter/read selected job, draft/edit letter, at most one submission per job | [JOB-001 / JOB-002 / JOB-003](public-job-listings.md), [APP-001](applications-and-review.md) |
| Core behavior 4 | Own application read only; no Applicant HR-status change | [APP-002](applications-and-review.md), [SEC-001](security-and-privacy.md) |
| Core behavior 5 | HR reads submitted applications, HR-only notes, separate authorized status action | [APP-003](applications-and-review.md), [SEC-001](security-and-privacy.md) |
| Core behavior 6 | Draft inputs only applicant's notes/selected published job; draft never submits | [AID-001 / AID-002](applicant-ai-draft.md) |
| Core behavior 7 | Summary only selected submitted letter/job published requirements; evidence/gaps/questions; no score/rank/reject/status change | [AIS-001 / AIS-002](hr-ai-summary.md) |
| Core behavior non-goals paragraph | No resume upload, email automation or AI hiring decision | [OVR-003](product-overview.md) |
| Data/access row: published jobs | Applicant read; HR read/close | [SEC-001 access table](security-and-privacy.md) |
| Data/access row: drafts | Applicant none; HR read/write/publish | [SEC-001 access table](security-and-privacy.md) |
| Data/access row: closed jobs | Applicant title on existing application; HR read | [SEC-001 access table](security-and-privacy.md) |
| Data/access row: application/letter | Applicant own record only; HR read for review | [SEC-001 access table](security-and-privacy.md) |
| Data/access row: HR notes | Applicant none; authorized HR read/write | [SEC-001 access table](security-and-privacy.md) |
| Data/access row: role assignment | Applicant cannot set/change; controlled administration only | [SEC-001 access table](security-and-privacy.md), [ACC-002](accounts-and-roles.md) |
| Data/access row: audit events | Applicant none; HR read as authorized | [SEC-001 access table](security-and-privacy.md) |
| Data/access enforcement paragraph | RLS in addition to server authorization | [SEC-002](security-and-privacy.md) |
| Data/access enforcement paragraph | Only HR creates/edits drafts/publishes/closes; published and closed content immutable | [SEC-001](security-and-privacy.md), [JMG-002](job-management.md) |
| Data/access enforcement paragraph | No new draft/closed-job applications; database uniqueness constraint; selected-job reference | [APP-001](applications-and-review.md) |
| Data/access enforcement paragraph | AI loads only selected job details/requirements; browser receives neither RLS bypass nor SoC key | [SEC-005 / SEC-002](security-and-privacy.md) |
| AI/security bullet 1 | Authenticate/authorize before loading data or calling model | [SEC-002](security-and-privacy.md) |
| AI/security bullet 2 | Untrusted notes/letters, including system impersonation/ignore-instruction text | [SEC-003](security-and-privacy.md) |
| AI/security bullet 3 | No tools/database access; text/structured data only; no status mutation | [SEC-003](security-and-privacy.md) |
| AI/security bullet 4 | Zod input lengths/structured output; escaped text, never raw HTML | [SEC-004](security-and-privacy.md) |
| AI/security bullet 5 | Exclude HR notes, other applications, secrets, unrelated personal data | [SEC-005](security-and-privacy.md) |
| AI/security bullet 6 | Per-user limits/output caps/timeouts/retry/error handling; exact thresholds after quota review | [SEC-006](security-and-privacy.md), [OPS-002](deployment-and-operations.md) |
| AI/security bullet 7 | Actor/operation/target/timestamp/outcome logs; no letter text/API keys | [SEC-007](security-and-privacy.md), [OPS-002](deployment-and-operations.md) |
| AI/security bullet 8 | Synthetic applicant records for development/security tests | [SEC-008](security-and-privacy.md) |
| Acceptance closing paragraph | Record tests and observed results in feature records; criteria not met by source scaffold | [OPS-003](deployment-and-operations.md), [Historical implementation context](product-overview.md#unresolved-ownership-and-implementation-evidence) |

## Release acceptance trace

The statements in this table are the original v0.6 release acceptance items. Each must have actual evidence before release under [OPS-003](deployment-and-operations.md); the split does not mark any item passed.

| Original item | Original acceptance statement | Canonical destinations |
| --- | --- | --- |
| 1 | The UI and data expose only this company's published openings to the public. Every job has a valid category, applicants can filter published jobs by category, and a published job's detail page shows its title, team, description, and requirements; there is no employer registration or cross-company browsing flow. | [OVR-001](product-overview.md), [JOB-001 / JOB-002 / JOB-003](public-job-listings.md) |
| 2 | HR can create a draft, edit it, publish it, and close a published job. Published requirements stay fixed. Applicants cannot perform those actions, see draft jobs, or submit to draft or closed jobs. Category filters never expose unpublished jobs, invalid categories are rejected, and an applicant can submit at most one application for each selected job. | [JMG-001 / JMG-002 / JMG-003](job-management.md), [SEC-001](security-and-privacy.md), [JOB-002](public-job-listings.md), [APP-001](applications-and-review.md) |
| 3 | Anonymous users cannot access protected records or AI endpoints. | [SEC-001 / SEC-002](security-and-privacy.md) |
| 4 | Applicant A cannot read Applicant B's application or AI draft; an Applicant cannot invoke the HR summary. | [SEC-001](security-and-privacy.md) |
| 5 | AI requests use only the selected application's job details. HR summary requests contain only the selected letter and that job's published requirements; adversarial letters cannot expose HR notes or change status. | [SEC-003 / SEC-005](security-and-privacy.md), [AID-001](applicant-ai-draft.md), [AIS-001 / AIS-002](hr-ai-summary.md) |
| 6 | Malformed AI output is rejected safely; script-like output is displayed as text. | [SEC-004](security-and-privacy.md) |
| 7 | Oversized and repeated AI requests are limited, including behavior when the SoC LLM is unavailable or returns a quota error. | [SEC-006](security-and-privacy.md), [OPS-002](deployment-and-operations.md) |
| 8 | Browser flows demonstrate distinct Applicant and HR interfaces and human-controlled submission/status changes. | [ACC-003](accounts-and-roles.md), [APP-001 / APP-003](applications-and-review.md), [AID-002](applicant-ai-draft.md) |
| 9 | Staging and production use separate app/database settings. The deployed release, guides, tests, and reflections describe the same behavior. | [OPS-001 / OPS-003](deployment-and-operations.md) |

## Unresolved decisions retained

This historical v0.6 trace left student names/role ownership and exact SoC LLM limits unresolved. The later issue #6 and #9 packets record Paul Cheng as the Applicant/application workflow owner; HR AI and job-management ownership and exact SoC LLM limits remain unresolved in this index. The v0.8 change selected a controlled manual HR assignment method and four review statuses. The v0.6 source did not specify reopening/editing policy beyond immutable published/closed job content; v0.7 added the letter-edit cutoff. Multi-employer hosting remains outside this release and would require a new spec and authorization design.
