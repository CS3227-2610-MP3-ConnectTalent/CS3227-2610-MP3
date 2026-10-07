# Deployment and operations

Baseline: ProductSpec v0.6, 5 October 2026.

## OPS-001: Separate environments

Staging and production MUST use separate app/database settings.

Scenario: Given staging and production configuration, when reviewed for release, then each uses its separate app/database settings.

## OPS-002: Operational safeguards and audit evidence

Operational evidence MUST demonstrate [SEC-006](security-and-privacy.md) limits, caps, timeouts and retry/error handling, and [SEC-007](security-and-privacy.md) audit fields/privacy. Those requirements have one canonical home in the security specification; exact quota thresholds remain unresolved pending SoC LLM quota review.

Scenario: Given release evidence for model outage/quota errors and audited operations, when reviewed, then it shows the safeguards and audit rules rather than recording sensitive letter text or keys.

## OPS-003: Consistent release and recorded evidence

Before release, the deployed release, guides, tests and reflections MUST describe the same behavior. Tests and observed results MUST be recorded in feature records for all nine release acceptance items in the [migration trace](README.md#release-acceptance-trace). A requirement or scenario in these files is not proof it passed.

Scenario: Given a candidate release, when its feature records and release artifacts are reviewed, then actual tests/observations cover all nine items and the deployed behavior, guides, tests and reflections agree.

The source v0.6 stated that the scaffold had not met these criteria. This migration supplies no new runtime or release verification and does not close pending implementation, independent review or human acceptance work.
