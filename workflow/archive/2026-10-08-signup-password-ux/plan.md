# Implementation/check plan record: #20

This plan was documented after implementation. It records task order and evidence; it does not claim a pre-implementation human approval.

| Task | Scope | Required check | Actual state |
| --- | --- | --- | --- |
| T01 | Confirm baseline redirect/email loss and ACC-001 boundary. | Source inspection, synthetic reproduction. | Baseline source inspected; no account creation on mismatch remains required. |
| T02 | Test and implement email retention and visibility. | Focused browser test, server unit test, no-JavaScript browser test. | Client test initially blocked by sandbox; server unit test failed on old signature then passed; focused browser tests passed. |
| T03 | Verify Applicant/HR flows and static quality. | Full local browser/unit, lint, typecheck, build. | 7 browser, 30 unit, lint/typecheck/build passed locally. |
| T04 | Independent review and corrections. | Separate reviewer, findings and recheck. | `/root/final_diff_review` identified no-JavaScript gap; corrected and rechecked. |
| T05 | Student acceptance, canonical sync/archive and PR readiness. | Actual separate student decision, then sync/archive and complete logs. | Pending; do not infer acceptance from checks or commit. |

The #20 work currently shares the explicitly authorized checkout `feat/9-hr-application-review`; no new branch was created. Its commit should remain separate from the #9 commit. Hosted rollout and PR are outside this local plan.
