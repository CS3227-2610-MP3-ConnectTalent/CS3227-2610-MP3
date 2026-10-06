# Scope and branching summary — 5 October 2026

Verification status: **team review pending**.

The team asked whether MP3 should cover one company rather than a general job marketplace and requested a `develop` integration branch with periodic promotion to `master`. Codex recommended one company, one opening, and two roles (Applicant and that company's HR). This keeps the intended first release consistent with the earlier scope and reduces authorization paths that would need implementation and testing.

After fetching the remote, Codex found that `origin/develop` and `origin/master` already existed at the merged scaffold commit and that the remote default branch was `develop`. It created local tracking branches, then created `docs/single-company-scope` from `develop` for the spec, guide, UI copy, and workflow changes. CI now targets `develop` and `master`; the product website workflow targets `master`.

No staging or production service has been configured by this branch change. The team should verify this summary, protect both long-lived branches, and record future release PRs and deployment evidence.

## GitHub Pages incident

The initial product website run on `master` failed at `actions/configure-pages@v5` because the repository had no GitHub Pages site. Codex enabled Pages with `build_type=workflow` through the authenticated GitHub API. The first rerun then failed because the `github-pages` environment allowed only `develop`; the workflow publishes from `master`. Codex changed the environment allowlist to `master` only and reran the job. Attempt 3 passed, and the published HTTPS URL returned HTTP 200. No Next.js app deployment was made.
