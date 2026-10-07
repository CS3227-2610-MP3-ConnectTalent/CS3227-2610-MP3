# Accounts and roles

Baseline: ProductSpec v0.6, 5 October 2026.

## ACC-001: Public Applicant signup

Public signup MUST create an Applicant account for this company's portal.

Scenario: Given a public signup, when the account is created, then its role is Applicant for this portal.

## ACC-002: Controlled HR assignment

Company HR accounts MUST be assigned only through a controlled administrative step. The access boundary for role assignment is canonical in [SEC-001](security-and-privacy.md); public signup does not grant HR authority. The source baseline does not select a particular administrative mechanism.

Scenario: Given public signup, when a user requests an HR role, then that request cannot confer HR access; assigning HR requires controlled administration.

## ACC-003: Distinct role interfaces and human control

Browser flows MUST demonstrate distinct Applicant and HR interfaces with human-controlled submission and status changes. See [APP-001 / APP-003](applications-and-review.md) and [AID-002](applicant-ai-draft.md). Protected-record and AI endpoint authorization follow [SEC-001 / SEC-002](security-and-privacy.md).

Scenario: Given each role's browser flow, when an Applicant submits final text or HR updates status, then the respective human performs the explicit action in that role's interface.
