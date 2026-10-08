# Product specification

Current baseline: **1.0**, dated **8 October 2026** (email password recovery). The v0.9 signup password usability and v0.8 HR review baselines were also dated 8 October 2026; the v0.7 Applicant lifecycle baseline was dated 7 October 2026.

This product is a careers site for one employer per deployment, with external Applicant and company HR roles. The first release supports multiple job openings and one text-only application per applicant per job. AI drafting and summary features use the course-required SoC LLM and retain human control over submission and hiring status.

The canonical requirements now live in the capability specifications below. The split on 6 October 2026 preserved v0.6 behavior, its nine release acceptance items, role boundaries, and non-goals. The accepted 7 October 2026 change added password confirmation and email verification, persistent private drafts, submitted-letter edits until job closure, and corresponding visibility rules. The locally accepted 8 October 2026 HR change defines controlled HR assignment, submitted-only review, private append-only notes, human status actions and the team's Vercel/Supabase environment mapping. The later accepted signup change retains the email after a password mismatch, adds accessible password visibility controls, and keeps passwords out of server action error state. The accepted recovery change adds a shared Applicant/HR email reset flow with neutral acknowledgement and user-scoped password update. This filename remains the entry point for historical references. Specifications describe intended behavior, not evidence that hosted migration or release gates are complete.

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

See [specification conventions and the v0.6 migration trace](specs/README.md) for ID rules, version policy and source-to-destination coverage. Applicant process ownership is Paul Cheng; HR process ownership and SoC LLM quota thresholds remain unresolved in this index.
