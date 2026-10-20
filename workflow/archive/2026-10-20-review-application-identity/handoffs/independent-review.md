# Independent source review — #125

- Reviewer: actual separate Codex execution `/root/identity_design_review`; model identifier not independently known.
- Owner: Paul Cheng. Baseline: `09e59a2` plus the uncommitted #125 working tree on `fix/125-review-application-identity`.
- Inputs: approved proposal/design/plan; new identity migration; Applicant form/actions/reconciliation; application-file route/client/state/services; HR parser; guide diff and new regressions.
- Independence: reviewer did not implement changes, edit files, run tests, query a database, call a provider or access hosted data. Coordinator supplied runtime evidence; reviewer did not independently rerun it.

## Finding and disposition

Early P2: a lost first profile-copy response with null application identity could no longer reconcile once its original profile source was replaced or removed. Null identity skipped the completed-operation check, so retry tried to download the missing original source.

Coordinator added a regression that returned 400 before correction, then changed the completed-copy path to require the owned finalized attachment's exact operation ID before returning that application's identity. Any supplied expected application ID must match. This allows a read-only reconciliation without the removed source and does not adopt an arbitrary active application. Focused four-test file passed.

Final reviewer return: prior P2 resolved; no remaining concrete blocking source findings in guards, overload grants, lock ordering, original-record cancellation/cleanup, proxy binding, request metadata, Save/Submit reconciliation, response adoption, strict pagination or guide alignment. Runtime/build/browser results and human acceptance remain separate evidence gates.
