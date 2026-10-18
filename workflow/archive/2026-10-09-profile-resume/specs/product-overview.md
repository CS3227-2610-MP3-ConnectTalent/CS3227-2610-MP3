# Delta: product overview

Issue #44; Paul Cheng; 2026-10-09; draft awaiting approval. [Canonical overview](../../../specs/product-overview.md), baseline v1.3 at `1667f2b`; proposed v1.4 subject to baseline reconciliation. [Proposal](../proposal.md). No canonical sync yet.

## MODIFIED

### OVR-002: First-release actors and scope

Before: multiple job openings, one **text-only** application per applicant per job, external Applicant and company HR, course-required SoC LLM; existing role table and human-control links.

After: The first release MUST support multiple job openings and one application per applicant per job, including a cover letter, identity/contact details, optional education/work experience and one optional private PDF résumé. Its two user roles remain external Applicant and company HR staff. Planned AI features MUST use the course-required SoC LLM. Retain the existing role table and human-control references unchanged; add Applicant ownership of their private profile and draft attachment, with file permissions in SEC-009 and lifecycle in APP-006/007.

Scenario: Given an Applicant applying to a published job, when they explicitly submit with or without a valid optional PDF, then one application exists for that Applicant/job and submission remains a human action. Evidence: profile44-AC-03/04/07.

### OVR-003: Non-goals

Before: “Resume upload, email automation and AI hiring decisions MUST NOT be part of the first release.”

After: Email automation and AI hiring decisions MUST NOT be part of the first release. Résumé parsing, AI profile autofill, multiple application attachments and HR access to Applicant profiles MUST NOT be provided by this change. This removal of the résumé-upload exclusion does not alter accepted Auth verification/recovery behavior.

Scenario: Given an uploaded PDF, when an AI feature is invoked, then the PDF is not parsed or added to its inputs; HR still makes status decisions. Evidence: profile44-AC-09.

## ADDED / REMOVED

None; modified IDs remain stable. Retirement N/A. Approval/review/sync pending; version is a proposal, not a release claim.

## Human approval record

Paul Cheng replied 'Approve as written' on 2026-10-09 to the explicit question naming the proposal, three deltas, design and plan. This supersedes pending approval wording above; branch permission and later acceptance remain separate. No implementation or canonical sync has occurred.
