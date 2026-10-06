# Product specification

Current baseline: **0.6**, dated **5 October 2026** (job listing detail).

This product is a careers site for one employer per deployment, with external Applicant and company HR roles. The first release supports multiple job openings and one text-only application per applicant per job. AI drafting and summary features use the course-required SoC LLM and retain human control over submission and hiring status.

The canonical requirements now live in the capability specifications below. This split on 6 October 2026 preserves v0.6 behavior, its nine release acceptance items, role boundaries, and non-goals. This filename remains the entry point for historical references. Specifications describe intended behavior, not evidence that implementation or release gates are complete.

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

See [specification conventions and the v0.6 migration trace](specs/README.md) for ID rules, version policy and source-to-destination coverage. Student ownership assignments and SoC LLM quota thresholds remain unresolved.
