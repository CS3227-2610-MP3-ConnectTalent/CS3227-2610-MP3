# Plan: User Guide UI workflow screenshots

- Issue: [#127](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/127)

## Execution Steps

1. **Intake & Issue Setup**:
   - Create issue #127 on GitHub (`docs(user-guide): add UI workflow screenshots to user guide`).
   - Create issue-linked branch `docs/127-user-guide-screenshots` from `develop`.

2. **Asset Placement & Image Validation**:
   - Add 7 desktop screenshot captures to `docs/assets/user-guide/`.
   - Embed screenshots in `docs/UserGuide.md` across sections 1.2, 1.3, 3.1, 3.2, 4.2, 4.3, and 4.4.
   - Refine HR evaluator access copy in Section 4.1.

3. **PR Creation & Automated Review**:
   - Commit staged documentation and asset changes.
   - Record change evidence in `record.md`, session summary in `logs/`, and update archive index.
   - Push branch and create PR #128.

4. **Review Feedback Remediation**:
   - Replace `application-form.png` to remove personal identification (full name and phone number).
   - Add explicit role, page, and viewport labels to all 7 screenshots in `docs/UserGuide.md`.
   - Restore complete change packet (`proposal.md`, `design.md`, `plan.md`, `tasks.md`, `handoffs/independent-review.md`).
   - Update `record.md` with verifiable independent review evidence, reviewer identity, and remediation trace.
   - Run Prettier and Docusaurus build verification.
   - Commit, push, and resolve PR #128 review threads.
