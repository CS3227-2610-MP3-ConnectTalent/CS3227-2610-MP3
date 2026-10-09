# Delta: security and privacy

Issue #39; owner Paul Cheng; approved for implementation on 2026-10-09 via “Approve as written”; separately accepted with recorded limits on 2026-10-09. Canonical: [security and privacy](../../../specs/security-and-privacy.md), baseline v1.1.

## ADDED

None. SEC-001 owner/draft/submitted boundaries continue to cover all application fields.

## MODIFIED

### SEC-005: Job scoping and data minimization

Before: AI requests load selected application/job requirements and exclude HR notes, other applications, secrets and unrelated personal data; AID-001/AIS-001 define narrower inputs.

After: AI requests MUST load only the selected application's job details and requirements (for drafting, the selected published job under AID-001). Model requests MUST exclude HR notes, other applications, secrets and unrelated personal data. Structured application full name, verified email, phone and portfolio fields MUST NOT be selected for AI payload assembly or appended to prompts. AID-001 and AIS-001 define the narrower allowed input sets for each feature. This exclusion does not claim to redact personal information an Applicant independently types into allowed notes/letter text.

Scenario: Given stored contact fields, when Applicant draft or HR summary payloads are assembled, then those structured fields are absent (form39-AC-08); existing selected-job/source restrictions remain.

### SEC-007: Privacy-preserving audit logging

Before: metadata-only submission/status/provider audit events exclude notes, letters, prompts, outputs, tokens and keys; submission audit is transactional, provider audit fails closed, Applicants cannot read audits.

After: Retain every current SEC-007 obligation unchanged. Add: Audit events and server logs MUST NOT include structured application full name, verified email, phone or portfolio values. Validation feedback MAY name the invalid field without logging or echoing sensitive values into URLs. Submitted contact snapshots remain protected application data, not audit metadata.

Scenario: Given contact-bearing submissions and invalid/retried writes, when audit/log output is inspected, then no structured field values appear; required actor/operation/target/time/outcome metadata remains (form39-AC-08).

## REMOVED

None. At accepted sync, append the stated SEC-007 clause to the full canonical rule rather than replacing existing obligations with this delta shorthand.
