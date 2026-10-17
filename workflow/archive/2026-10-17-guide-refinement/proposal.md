# Proposal: User Guide and Developer Guide refinement

- Issue: [#103](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/103)
- Author: John Wong
- Date: 17 October 2026

## Motivation & Scope

The existing User Guide and Developer Guide contained developer-facing local environment details mixed into the user-facing documentation, and the Developer Guide lacked detailed product definitions, architectural diagrams, key design decisions, and testing strategy models referencing MP2 structures.

This change aims to:
1. Re-target the User Guide strictly for end users (Applicants and HR Reviewers), shifting local setup and evaluator smoke testing to the Developer Guide.
2. Expand Developer Guide Section 3 with target personas, prioritized user stories, 12 formal use cases (UC01–UC12), 12 Gherkin product specifications, and non-functional specifications.
3. Enable Gherkin syntax highlighting in Docusaurus.
4. Expand Developer Guide Section 5 with an exact Mermaid ERD matching PostgreSQL migrations, 4 sequence diagrams, 1 state diagram, and 6 structured architectural decisions.
5. Expand Developer Guide Section 7 with a test pyramid, automated test inventory, high-risk coverage matrix, parallel CI gates diagram, 8 manual walkthrough scenarios, and developer troubleshooting FAQ.
6. Address all 26 PR code review comments to guarantee strict consistency with the actual repository implementation without documentation drift.

