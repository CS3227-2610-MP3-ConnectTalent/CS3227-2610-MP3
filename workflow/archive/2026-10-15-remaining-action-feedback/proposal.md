# Proposal: remaining request-action feedback

- Change/issue: `2026-10-15-remaining-action-feedback`, [#84](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/84)
- Owner/status/date: Paul Cheng; approved for implementation and separate branch on 15 October 2026 via “Approve plan and branch”.
- Baseline: fetched `origin/develop` `f65f699ff2de76466e6cf374011119aec2414a91`; `feat/84-action-feedback` created from it in `.worktrees/84-action-feedback` after Paul's authorization. PR #82 (#81) remains open, and #83 is uncommitted on a separate branch.
- Affected rule: proposed OVR-006; existing application, résumé, Auth, HR and server authorization rules remain authoritative.

## Problem and boundary

The hosted site can take several seconds per action. An audit found Applicant Save draft and Submit application disable via a fieldset but share only a generic “Saving your application…” notice; résumé Upload/Replace/Remove/Use profile/Retry disable during requests but keep their idle labels and show a generic “Saving résumé…” notice. The error-page Try again button invokes route reset without a pending state. By contrast, profile save, withdrawal, Applicant/HR AI and #81's Auth/HR actions already have pending labels or states. #83 separately addresses Search and selected navigation links.

Add prompt, action-specific visible and accessible pending feedback only to the remaining network-backed controls. Keep the active button unavailable for repeat activation and conflicting résumé actions disabled. Keep native form validation, keyboard submission, server-side role/data checks and all existing retry behavior. Do not add artificial delay or loading UI to instant local controls such as password visibility, category selection or opening withdrawal confirmation.

## Acceptance

| ID         | Given / when / then                                                                                                                                                                                                                                          | Evidence                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| UI84-AC-01 | Given an Applicant saves a draft over a delayed request, Save draft visibly says “Saving draft…” and cannot be activated twice; Submit application remains unavailable until the request settles. On error, controls recover without losing typed content.   | Delayed form browser test and focused component branch tests.          |
| UI84-AC-02 | Given an Applicant submits over a delayed request, Submit visibly says “Submitting…” and cannot be activated twice; Save draft remains unavailable. Native validity and keyboard Enter behavior stay correct; server submission guards remain authoritative. | Delayed/invalid/keyboard tests and source review.                      |
| UI84-AC-03 | Given a résumé upload, replace, remove, profile copy or retry, the active action shows its own pending label, other conflicting file actions are disabled, and a failed request restores a usable retry/action state without exposing file data.             | Focused per-intent component tests and selected delayed browser paths. |
| UI84-AC-04 | Given Try again on the error page triggers route recovery, it shows local pending feedback while a transition is actually waiting and permits another attempt after an application-handled failure.                                                          | Focused delay/recovery test.                                           |
| UI84-AC-05 | The audit records already-covered and immediate controls; the full unit coverage command passes, and branch coverage is reported from before/after runs without treating a percentage alone as acceptance.                                                   | Coverage summary, audit table, regression run.                         |

## Dependencies and non-goals

No backend, schema, RLS, AI, secret or deployment change. #84 must not duplicate #81 or #83. If either PR merges during work, update the feature branch from reviewed `develop` and reconcile file/spec versions before acceptance. Paul approved this packet and expressly authorized the separate branch on 15 October 2026. Commit, push, PR and hosted changes need later instructions.
