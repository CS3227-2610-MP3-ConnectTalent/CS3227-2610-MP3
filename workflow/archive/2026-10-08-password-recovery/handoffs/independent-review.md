# Independent security/privacy review: #27 password recovery

- Date: 8 October 2026; reviewer: separate read-only Codex `security_privacy_reviewer` execution `/root/password_recovery_review` (model not reported)
- Inputs: issue #27, approved proposal/ACC-004 delta/design/plan, canonical ACC/SEC/OPS rules and uncommitted `feat/27-password-reset` diff
- Independence: reviewer did not implement, edit, stage, commit or accept the feature; this was separate from the implementer execution

## Findings and recheck

1. **Medium, fixed:** `src/app/auth/actions.ts` initially allowed thrown Supabase email transport errors to become a server error. Returned provider errors and unknown addresses already shared the neutral response, but the reviewer found the failure path unclear. A focused transport test failed before the fix; the action now catches throws and sends every valid request to the same neutral acknowledgement with retry guidance. The returned-error and thrown-error unit cases pass. The reviewer rechecked the final source and found no account-existence disclosure in its visible response.
2. **Low, fixed:** the password update initially redirected to sign-in success even if `auth.signOut()` returned an error. A focused test failed first. The action now checks returned and thrown sign-out failures and gives an explicit warning that the password changed but automatic sign-out did not finish. The reviewer rechecked this. A real sign-out failure was not induced in the browser; unit mocks cover it.
3. **Adjacent failure, fixed by implementer:** a rejected `auth.updateUser` promise initially escaped as a server error. A focused test failed first; the action now returns a safe generic error without the password. This was not a separate reviewer finding.

The reviewer found no remaining blocking code issue in its final static review. It noted the trusted origin, user-scoped password update, continued HR server/RLS checks, no role write and no privileged key in the #27 source. Its `git diff --check` passed. The reviewer attempted focused Vitest but sandbox process spawning failed with `spawn EPERM`; it did not independently run unit or browser checks. The implementer-run final checks are in [record.md](../record.md). Hosted SMTP/redirect allowlist and runtime sign-out failure remain unverified. This review is neither student acceptance nor deployment approval.
