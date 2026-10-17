# Evidence record: Guide refinement and developer guide expansion

- Issue: [#103](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/103).
- Owner: John Wong; documentation change, no product runtime delta or canonical version change.
- Branch/baseline: `docs/refine-user-and-developer-guides` from `origin/develop`, 17 October 2026.
- Artifacts: [proposal](proposal.md), [design](design.md), [plan](plan.md), [tasks](tasks.md).
- Sessions: [PR preparation and review log](../../../logs/2026-10-17-guide-refinement-pr.md).
- Status: Accepted locally with recorded limits and complete packet archived. John Wong explicitly instructed to refine User Guide and Developer Guide, push changes, create PR #104, address all review comments, and resolve them.
- Canonical sync: N/A; documentation presentation/specifications alignment only, no product behavior delta or specification version change. Verified before archiving at `workflow/archive/2026-10-17-guide-refinement/`.
- Handoffs: [primary implementation](handoffs/implementation.md), [independent review](handoffs/independent-review.md).
- Git publication authorization: John Wong explicitly requested "commit and push the changes, then resolve the review comments that have been addressed".

## Request and evidence

User requested refining the User Guide and Developer Guide against MP2 references:
1. User Guide re-targeted to end users (Applicants and HR Reviewers), shifting developer and local environment information to Developer Guide. Preserved all existing content without unauthorized deletion.
2. Developer Guide Section 3 (Product Definition) expanded with personas, prioritized user stories, 12 formal use cases (UC01–UC12), 12 Gherkin feature specifications, and non-functional specifications. Docusaurus configured for Gherkin syntax highlighting.
3. Developer Guide Section 5 (Architecture and Data Design) expanded with Mermaid ERD matching actual migrations, sequence diagrams, state machine diagram, and 6 architectural decisions.
4. Developer Guide Section 7 (Testing Strategy) expanded with test pyramid, test inventory, high-risk coverage matrix, parallel CI verification gates diagram, 8 manual walkthrough scenarios, and developer FAQ.
5. Remediated all 26 automated code review comments on PR #104, aligning all documentation with actual repository code, routes, schema names, and CI workflows.

## Verification and acceptance trace

| Acceptance Gate | Check/evidence | Result and limits |
| --- | --- | --- |
| DOC103-01 | Prettier format check: `pnpm exec prettier --check docs/UserGuide.md docs/DeveloperGuide.md website/docusaurus.config.js` | Passed: clean formatting with 0 errors. |
| DOC103-02 | Docusaurus site build: `npm --prefix website run build` | Passed: compiled successfully with 0 broken links, valid Mermaid diagrams, and Prism Gherkin syntax highlighting enabled. |
| DOC103-03 | Repository alignment & code review remediation | Passed: all 26 review comments addressed across schema names, endpoints, worker thread sandbox, button labels, CI workflows, and scenario steps. |

