# Proposal: withdrawal only inside application detail (#50 follow-up)

Issue: [#50](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/50). Owner Paul Cheng. Date 2026-10-10. Proposed; approval pending. Current branch feat/53-unsaved-profile-resume carries accepted uncommitted #49/#50 work and implemented #53; preserve all of it.

Paul requests removing Withdraw application from My applications and keeping it inside each individual application. Source currently renders WithdrawalControl on both list and detail pages.

## Scope and APP-008 clarification

My applications displays job title, lifecycle/review status and View application links, without a withdrawal button or confirmation control. An owned submitted nonwithdrawn application's detail page displays Withdraw application and its existing confirmation. Draft and already-withdrawn details offer no withdrawal. Confirmation, retained data, permissions, idempotency and job-closure eligibility remain unchanged.

Acceptance: (1) submitted list has no withdrawal controls; (2) View opens the correct detail with one withdrawal button; (3) cancellation and confirmed withdrawal still work there; (4) list shows Withdrawn afterward. No database, AI, profile, file or hosted changes.

[Plan](plan.md), [record](record.md).
