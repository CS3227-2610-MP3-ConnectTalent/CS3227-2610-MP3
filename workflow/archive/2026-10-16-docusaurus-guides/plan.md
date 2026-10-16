# Plan: issue #92

1. Record issue/reference inspection and create a documentation branch from current `origin/develop`; preserve unrelated untracked work.
2. Obtain Paul's approval of this proposal, design and plan before implementing the site.
3. Add the isolated `website/` package/configuration/style and deterministic dependency lockfile; wire the existing guide sources and grouped sidebar.
4. Add the documentation overview and necessary frontmatter/Markdown/link adaptations; preserve guide instructions and reflection prose. Document local site commands and MP2 acknowledgement in the Developer Guide.
5. Update only the Pages workflow to build on documentation PRs and publish the generated site from `master`; preserve the app's CI/deployment settings.
6. Install/build the documentation package, check strict links/images and the project base URL, inspect desktop/mobile navigation, review the text and file-scope diff. Record failures and corrections. Application tests are N/A.
7. Request a separate read-only review of site configuration, built links, content preservation, deployment conditions and scope; fix and recheck findings.
8. Present results/limits for Paul's separate acceptance. Product sync is N/A; archive only after acceptance, update session evidence, and wait for explicit commit/push/PR instructions.

No hosted publication, release PR, application change or database operation is authorized by this plan.
