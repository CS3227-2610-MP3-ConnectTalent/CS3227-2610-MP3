# Spec delta: <capability>

Copy one file per affected capability to `workflow/changes/<YYYY-MM-DD-short-name>/specs/<capability>.md`, for example `specs/public-job-listings.md`. From that location the canonical file is `../../../specs/public-job-listings.md`. Replace example IDs with the actual changed IDs; examples do not propose changes by themselves.

- Change/issues/owner/status: <date-name; linked issues; student; draft / approved / synced>
- Canonical file: <relative link to ../../../specs/<capability>.md>
- Baseline: <version and commit; before requirement/heading link>
- Proposed baseline: <numeric minor version for behavior change>
- Dependencies/cross-capability IDs: <linked deltas; canonical SEC/other rules with one home>
- Approval: <human decision/date/source or pending>

Follow [canonical ID and version rules](../specs/README.md) when preparing the delta (adjust this template link to `../../../specs/README.md` in the copied file). Do not renumber requirements or reuse retired IDs. A defect restoring existing specified behavior may cite that requirement without a delta; documentation/process changes have no invented product delta.

## ADDED

### <new unused ID, e.g. JOB-004; short requirement title>

- Before: <absent in baseline; relevant context reference>
- After: <full proposed MUST / MUST NOT / MAY rule and canonical destination>
- Rationale/acceptance IDs: <why; exact proposal acceptance IDs>
- Scenario: **Given** <actor/state/input>, **When** <action>, **Then** <observable outcome>.
- Denial/failure scenario: **Given** <untrusted/unauthorized state>, **When** <action>, **Then** <safe outcome>; or N/A with reason.

## MODIFIED

### <existing stable ID; short title>

- Before: <baseline commit, canonical file/heading and exact current rule>
- After: <complete replacement rule, same ID and canonical destination>
- Rationale/acceptance IDs: <intended difference and evidence criteria>
- Scenario: **Given** <state>, **When** <action>, **Then** <changed observable outcome>.
- Denial/failure scenario: <Given / When / Then or justified N/A>
- Rule relocation, if any: <old/new location; retain ID and one canonical home>

## REMOVED

### <existing stable ID; short title>

- Before: <baseline commit, canonical file/heading and exact rule>
- After: <removed rule and observable resulting behavior; replacement ID/link if any>
- Retirement rationale: <why; compatibility impact; preserve this ID in history and never reuse it>
- Scenario: **Given** <state>, **When** <action>, **Then** <result after removal>.
- Acceptance IDs: <evidence showing intended removal and boundaries>

## Delta review and sync evidence

Write `None` under unused categories; remove illustrative entries. Do not sync unapproved behavior.

- [ ] Every changed rule and affected capability has a delta with stable IDs and scenarios.
- [ ] Independent analyst/reviewer resolved ambiguity; actual reviewer and findings linked.
- [ ] Human approval recorded before product implementation.
- [ ] Accepted final deltas synced to canonical files and version/date policy applied before archive.
- Sync commit/paths/decision evidence: <actual values or pending>
