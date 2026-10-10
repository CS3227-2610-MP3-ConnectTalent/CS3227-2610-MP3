# Product specification

Current baseline: **1.8**, dated **10 October 2026** (accepted #53 résumé before Save draft/private profile files; #52 required onboarding and prior withdrawal retained). The v1.4 profile/résumé baseline was dated 9 October 2026. The v1.0 email password recovery, v0.9 signup password usability and v0.8 HR review baselines were dated 8 October 2026; the v0.7 Applicant lifecycle baseline was dated 7 October 2026.

Paul separately accepted #53 via “Accept with recorded limits” on 10 October 2026 and authorized one combined PR for #49/#50/#52/#53. APP-006/007 and SEC-009 now cover optional private profile PDFs, explicit independent snapshot reuse and upload before Save draft without saving typed fields. [Accepted résumé packet](archive/2026-10-10-unsaved-profile-resume/record.md) preserves approval, review, acceptance and hosted/cleanup/accessibility limits. The earlier #53-pending entries below describe historical baselines; #52's required-profile rules remain authoritative.

Paul separately accepted #52 via “Accept with recorded limits” on 10 October 2026 after final independent review. ACC-006 requires profile-only onboarding for incomplete Applicants; ACC-001/005, JOB-001/003 and APP-005/006 define verification routing, navigation, required phone/country input and autofill. [Accepted packet](archive/2026-10-10-required-applicant-profile/record.md) preserves the approved amendment, checks and resolved legacy-withdrawal finding. Hosted rollout, clean-reset rehearsal and full accessibility testing remain pending. #53 remains separately unaccepted and is not synced by this acceptance.

This product is a careers site for one employer per deployment, with external Applicant and company HR roles. The first release supports multiple job openings and one application per applicant per job, with identity/background snapshots and an optional private PDF résumé. AI drafting and summary features use the course-required SoC LLM and retain human control over submission and hiring status.

Paul separately accepted #49/#50 locally with recorded limits on 10 October 2026. APP-002/003/007/008, SEC-001 and AIS-001 now define form/retry controls and terminal confirmed Applicant withdrawal, retaining records while denying further HR processing. The [accepted packet](archive/2026-10-10-application-form-withdrawal/record.md) preserves review, acceptance and verification. Hosted rollout, clean-reset rehearsal and full accessibility audit remain pending; sync/archive is not deployment or release.

Paul separately accepted the #50 placement correction via “Accept correction” on 10 October 2026. APP-008 now puts withdrawal only inside individual submitted application details; My applications keeps status and View. The [archived correction](archive/2026-10-10-withdrawal-placement/record.md) preserves checks and acceptance. #53 remains implemented but separately unaccepted; its proposed rules are not part of this baseline.

The canonical requirements now live in the capability specifications below. The split on 6 October 2026 preserved v0.6 behavior, its nine release acceptance items, role boundaries, and non-goals. The accepted 7 October 2026 change added password confirmation and email verification, persistent private drafts, submitted-letter edits until job closure, and corresponding visibility rules. The locally accepted 8 October 2026 HR change defines controlled HR assignment, submitted-only review, private append-only notes, human status actions and the team's Vercel/Supabase environment mapping. The later accepted signup change retains the email after a password mismatch, adds accessible password visibility controls, and keeps passwords out of server action error state. The accepted recovery change adds a shared Applicant/HR email reset flow with neutral acknowledgement and user-scoped password update. The accepted 9 October 2026 change adds SoCLaaS-assisted Applicant drafting before submission, freezes submitted applications, and constrains HR summaries to validated excerpts from the selected frozen letter and published requirements. The separately accepted #39 change adds private saved identity/contact details, a trusted verified-email snapshot on submission, immutable submitted fields, legacy missing-field display and structured-contact exclusion from AI and logs. This filename remains the entry point for historical references. Specifications describe intended behavior, not evidence that hosted migration or release gates are complete.

| Capability | Canonical specification | IDs |
| --- | --- | --- |
| Product boundary, actors, scope and non-goals | [Product overview](specs/product-overview.md) | OVR |
| Signup and role assignment | [Accounts and roles](specs/accounts-and-roles.md) | ACC |
| Public browsing, category filtering and details | [Public job listings](specs/public-job-listings.md) | JOB |
| HR job lifecycle | [Job management](specs/job-management.md) | JMG |
| Applications and HR review | [Applications and review](specs/applications-and-review.md) | APP |
| Applicant-controlled AI drafting | [Applicant AI draft](specs/applicant-ai-draft.md) | AID |
| HR AI summary | [HR AI summary](specs/hr-ai-summary.md) | AIS |
| Cross-cutting authorization, privacy and AI safeguards | [Security and privacy](specs/security-and-privacy.md) | SEC |
| Environments, operations and release evidence | [Deployment and operations](specs/deployment-and-operations.md) | OPS |

See [specification conventions and the change traces](specs/README.md) for ID rules, version policy and source-to-destination coverage. Applicant process ownership is Paul Cheng; HR process ownership remains unresolved in this index. The application quota is three requests per user and 24 per deployment per rolling minute as specified in SEC-006; the configured provider key may impose a separate limit.

Combined branch integration: accepted #36 ACC-005 navigation and #39 APP-005 contact/privacy requirements coexist in v1.3. The #40 packet records this integration; hosted validation remains separate.

Paul Cheng separately accepted #44 locally with recorded limits on9October2026. APP-006/007 and SEC-009 extend the canonical profile, background and private-attachment rules; OVR-002/003 and APP-001 now permit the optional PDF. [Accepted packet](archive/2026-10-09-profile-resume/record.md) preserves evidence and hosted/cleanup/process limitations. This sync does not establish deployment or release.
