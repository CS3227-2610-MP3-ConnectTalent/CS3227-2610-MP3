# Technical Design: Documentation architecture and specifications alignment

- Issue: [#103](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/103)

## Structure & Architecture

1. **User Guide (`docs/UserGuide.md`)**:
   - Section 1: Overview & Scope (Applicant & HR roles)
   - Section 2: Account Onboarding & Verification
   - Section 3: Applicant Journey (Job search, filtering, application drafting, optional AI drafting, submission, withdrawal & reapplication)
   - Section 4: HR Reviewer Journey (Job management, scheduling, candidate application review, filtering, notes, status changes, grounded AI summary)
   - Section 5: Security & Privacy
   - Section 6: Privacy and acceptable use

2. **Developer Guide (`docs/DeveloperGuide.md`)**:
   - Section 1: Introduction & System Purpose
   - Section 2: Local Development Setup & Environment Variables
   - Section 3: Product Definition (Personas, User Stories, Formal Use Cases UC01–UC12, Gherkin Feature Specifications, Non-Functional Requirements)
   - Section 4: Core Domain Concepts & Data Flow
   - Section 5: Architecture and Data Design (Mermaid ERD, Sequence Diagrams for submission freeze, PDF worker thread validation, AI cover letter drafting, HR review notes, State Machine diagram, and 6 Architectural Decisions)
   - Section 6: Software Engineering Process (Spec-driven development, conventional commits, workflow catalogs)
   - Section 7: Testing Strategy (Test Pyramid, Automated Test Inventory, High-Risk Coverage Matrix, Quality Verification Gates flowchart, 8 Manual Walkthrough Scenarios, Developer Troubleshooting FAQ)

3. **Docusaurus (`website/docusaurus.config.js`)**:
   - Add `"gherkin"` to `prism.additionalLanguages` for Gherkin code block syntax highlighting.

