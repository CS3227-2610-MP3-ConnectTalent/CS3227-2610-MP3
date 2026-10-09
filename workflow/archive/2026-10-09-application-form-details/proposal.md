# Proposal: application identity and contact details

- Issue: [#39](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/39). Owner: Paul Cheng, non-AI Applicant/HR workflow.
- Date: 2026-10-09. Status: approved for implementation.
- Baseline: [ProductSpec](../../ProductSpec.md) v1.1, develop `089e8bb`.
- Branch: `feat/application-form-details`; explicitly created before intake at Paul's request. PR #38 is independent; no dependency on its merge.
- Classification: behavior/schema change; elevated privacy and migration risk.
- Affected IDs: proposed APP-005, SEC-005/007 clarification; existing APP-001–004, ACC-001, SEC-001/002/004.

## Intent and scope

The current form persists only cover-letter text. Paul selected full name, verified email, optional phone and portfolio URL. This packet proposes their private draft persistence and frozen submitted display for the owner and HR, while retaining existing cover-letter and AI behavior.

Proposed bounds: full name trimmed, at most 120 characters, nonblank at submission (partial draft may be blank); phone optional, trimmed, at most 40 characters with no control characters and no country-specific format requirement; portfolio optional, at most 2,048 characters, absolute HTTP(S) URL without embedded username/password. Name rejects control characters. Blank optional fields become null. Email is read-only from current verified Auth identity and snapshotted only at submission; a browser email parameter cannot override it. Cover letter retains 5,000-character bound.

No uploads, demographics/address, profile editor, HR corrections, email changes, AI redesign, hosted operation or automatic submission. User-generated URLs are shown escaped with safe HTTP(S) linking and never fetched by the app.

## Alternatives and dependencies

| Alternative | Choice and tradeoff |
| --- | --- |
| Keep cover-letter-only form | Rejected for new applications; remains honest legacy display. |
| Put details in account profile | Rejected: application-specific frozen facts and independent drafts are needed. |
| Store application fields | Proposed: one atomic application revision, owner privacy and submitted snapshot. |
| Accept old RPC submissions without name | Rejected: bypasses the new required-field boundary. |

PR #38 may merge independently. Rebase/integrate only with user authorisation when needed; canonical version is determined at final accepted sync (v1.2 if #38 absent, v1.3 if its accepted v1.2 is integrated). Teammate owns AI and SMTP. Keep explicit AI input projection intact; only privacy regression tests touch AI boundaries.

## Acceptance map

| ID | Given / When / Then | Evidence |
| --- | --- | --- |
| form39-AC-01 | Applicant saves a partial draft, returns, and sees the same fields without submission. | Browser + RPC persistence tests. |
| form39-AC-02 | Valid submission stores nonblank name and verified email plus optional fields atomically; forged email cannot change snapshot. | Validation/action units + direct RPC tests. |
| form39-AC-03 | Invalid or oversized fields yield clear safe errors and preserve all entered text; malformed URL cannot execute or be fetched. | Unit/browser validation and escaped rendering tests. |
| form39-AC-04 | Owner and HR read submitted details; HR cannot read draft, another Applicant/guest cannot read any details. | RLS/server denial tests + role browser flow. |
| form39-AC-05 | Submitted fields reject UI/direct/legacy RPC modification; closed jobs reject draft writes/submission. | Database/API + browser denial tests. |
| form39-AC-06 | Lost response, stale revision, simultaneous submit/closure cannot overwrite or claim a mismatched save. | Retry units + database race tests. |
| form39-AC-07 | Old submissions display missing details honestly; old drafts can complete fields before submission. | Migration/fixture tests + browser legacy case. |
| form39-AC-08 | New structured fields never enter AI payloads/audit metadata/logs. | Mocked-provider input projection + audit review/test. |

## Artifacts and approval

[Application delta](specs/applications-and-review.md), [privacy delta](specs/security-and-privacy.md), [design](design.md), [plan](plan.md), [tasks](tasks.md), [record](record.md).

At intake, approval was pending: field selection and “okay do it” authorised issue/packet preparation, not approval of this newly concrete design/plan. Paul must approve proposed bounds, legacy display and coordinated migration cutover before coding. Actual subsequent approval is recorded below. Human acceptance, independent review, spec sync, commit/push/PR and deployment are separate later gates.

Implementation approval: Paul Cheng, 2026-10-09, explicit “Approve as written” reply to the question naming #39 proposal, both deltas, design and plan, including limits, freeze, legacy display and coordinated cutover. Separate acceptance with recorded limits was received on 2026-10-09; see record.md for sync/archive and remaining hosted gates.
