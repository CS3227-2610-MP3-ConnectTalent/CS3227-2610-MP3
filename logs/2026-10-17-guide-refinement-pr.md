# Guide Refinement and Developer Guide Expansion PR Preparation — 17 October 2026

Following the user's explicit instructions ("Looks good, can you create a branch and commit the changes... push these changes first and create a PR"), this change completes documentation refinements across the User Guide and Developer Guide.

## Summary of Changes
1. **User Guide Refinement**:
   - Re-targeted the User Guide specifically for end users (Applicants and HR Reviewers).
   - Relocated developer/local environment details (localhost endpoints, Mailpit on port 54324, local HR seed instructions, local vs. hosted database isolation notes, internal test tracking references, evaluator smoke test protocols, and developer troubleshooting entries) into the Developer Guide.
   - Preserved all content without deletion; retitled Section 6 to "Privacy and acceptable use".
2. **Developer Guide Section 3 Expansion (Product Definition)**:
   - Added Target User Profile and Personas (Guest / Job Seeker, Registered Applicant, HR Specialist / Reviewer, System Administrator / Evaluator).
   - Added Prioritized User Stories across functional areas with explicit priority tiers (`* * *`, `* *`, `*`).
   - Added Formal Use Cases (UC01 through UC12) with Actors, Preconditions, Main Success Scenarios, and Extensions.
   - Added Gherkin syntax behavioral product specifications across 10 feature areas.
   - Added Non-Functional Specifications (performance, security, data integrity, usability).
   - Added `"gherkin"` to `prism.additionalLanguages` in `website/docusaurus.config.js`.
3. **Developer Guide Section 5 Expansion (Architecture and Data Design)**:
   - Added Mermaid Entity-Relationship Diagram (`erDiagram`) for PostgreSQL tables.
   - Added 4 Sequence Diagrams (Application Submission & Freeze, Sandboxed PDF Résumé Validation, AI Cover Letter Generation & Explicit Adoption, HR Review & Notes) and 1 State Diagram (`stateDiagram-v2`).
   - Resolved Mermaid syntax formatting by ensuring no unquoted statement-terminating semicolons appear in diagram messages.
   - Added 6 Key Architectural and Design Decisions structured with Decision, Rationale, Alternatives Considered, and Trade-offs.
4. **Developer Guide Section 7 Expansion (Testing Strategy)**:
   - Added Test Pyramid flowchart and Automated Test Inventory table.
   - Added High-Risk Coverage Matrix mapping critical failure modes to mitigations.
   - Added Quality Verification Gates flowchart and numbered gate definitions.
   - Added 8 comprehensive Manual Testing Walkthrough Scenarios and the Hosted Smoke Testing Protocol.
   - Added Developer Troubleshooting and FAQ table.

## Verification
- Verified code formatting with `pnpm exec prettier --check docs/UserGuide.md docs/DeveloperGuide.md website/docusaurus.config.js` (0 errors).
- Verified documentation build with `npm --prefix website run build` (compiled successfully in 1.12m server / 3.82m client, 0 broken links, 0 diagram syntax errors).
- Cleaned persistent build caches with `npm --prefix website run clear`.

Target base branch: `develop`
Head branch: `docs/refine-user-and-developer-guides`
