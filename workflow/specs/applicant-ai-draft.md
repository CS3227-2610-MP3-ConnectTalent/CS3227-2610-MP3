# Applicant AI draft

Baseline: ProductSpec v0.6, 5 October 2026.

Every draft endpoint follows the canonical [security and privacy contract](security-and-privacy.md), including authorization before loading data, input/output validation and usage limits.

## AID-001: Selected published-job inputs

The Applicant AI draft MUST accept only that applicant's notes and the selected published job text. Requests MUST load only the selected job's details and requirements, as scoped in [SEC-005](security-and-privacy.md).

Scenario: Given an authorized Applicant and a selected published job, when a draft request is made, then model input contains only that applicant's notes and that job's text, without other applications, HR notes or unrelated data.

## AID-002: Editable draft and explicit submission

The Applicant MUST retain ownership of the final cover letter, be able to edit the draft and explicitly submit final text through [APP-001](applications-and-review.md). Generating a draft MUST never submit an application.

Scenario: Given an AI-generated draft, when the Applicant receives it, then it remains editable and no application has been submitted; submission requires the Applicant's explicit final action.
