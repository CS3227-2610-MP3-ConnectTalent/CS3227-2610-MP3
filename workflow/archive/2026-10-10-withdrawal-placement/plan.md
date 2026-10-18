# Design and plan: #50 placement follow-up

Design omission: no architectural, authorization, storage or schema change. Reuse existing detail WithdrawalControl and withdraw action. Remove only list import/render; preserve View/status.

After concrete student approval: extend the existing local synthetic withdrawal browser flow to assert no list withdrawal controls and one on its linked detail. Observe the list assertion fail before repair. Remove list control, recheck the scoped flow and lint/typecheck. Obtain separate read-only review of the final small diff and evidence, update guide/log/record, then request separate acceptance. Sync APP-008 placement clarification and archive only after acceptance.

No new branch, commit, push, PR, deployment or database operation is authorized by this plan. Work on current branch preserves other uncommitted features. Rollback restores the list rendering only; retained withdrawal state is unaffected.
