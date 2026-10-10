# Proposal: private Applicant profile and PDF résumé

- Issue: [#44](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/44).
- Owner/date: Paul Cheng, 2026-10-09. Status: approved for implementation; explicit branch permission pending; no implementation.
- Baseline: [ProductSpec v1.3](../../ProductSpec.md), current branch base `1667f2b`. PR #41 merged as `ee79065f08ef03df3936a76942f0984ec674072c`; this working branch has not yet integrated that merge commit.
- Affected IDs: MODIFIED OVR-002/003 and APP-001; ADDED APP-006/007 and SEC-009. Proposed next baseline v1.4, subject to reconciliation with changes merged before implementation.
- Classification: product extension with private data, database and Storage changes. Design required.

## Intent and boundaries

Applicants currently re-enter contact details per job and cannot attach a résumé. Paul selected a proposal scope of saved name, phone, portfolio, education and work experience, ordinary profile-field autofill and an optional private PDF capped at 1 MiB. That scope selection is not approval of this packet.

Propose an Applicant-only **My profile** page. Verified email is read-only from Auth. Saved fields are optional: full name 120 characters, phone 40, HTTP(S) portfolio URL 2,048, education and work experience 2,000 characters each. Reuse existing contact validation; reject control characters in free text except normal line breaks/tabs in the two multiline fields. Application submission still requires a full name. Education/work experience are optional application fields and become immutable submitted snapshots.

Prefill only a new application with no saved draft. Existing drafts win; profile changes do not overwrite drafts or submissions. Autofill is ordinary copying of saved fields, with no AI call. Provide one optional PDF per application, maximum 1,048,576 bytes; Applicant can replace/remove it only before submission while the job is published. Keep files private, downloadable by the owner and by HR only after submission. No profile content or file bytes/metadata are added to AI inputs.

Non-goals: résumé parsing, AI autofill, multiple attachments, HR browsing profiles, changes to AI prompts/status decisions, automatic submission, hosted account provisioning, SMTP work and hosted migration without separate authorization. This is separate from the current uncommitted #42/#43 work. A new issue-linked implementation branch needs explicit permission and a clean preserved baseline.

## Alternatives, dependencies and risks

| Alternative | Decision/tradeoff |
| --- | --- |
| Keep contact form only | Lowest complexity, but does not deliver selected résumé/profile scope. |
| Public bucket or browser upload without server validation | Rejected: exposes applicant data or permits bypass of PDF/size checks. |
| Parse résumé to autofill with AI | Excluded: more data disclosure and unnecessary model dependence. |
| Private objects, authorized download route and staged upload | Proposed: checks access for each download; handles DB/Storage non-atomicity with reservation/finalization and cleanup evidence. |

Dependencies: accepted contact/snapshot and role-navigation code, Supabase Storage in local tests, a PDF parser chosen during implementation from maintained official documentation, and independent security review. New schema must be tested against old contact clients before a deployment decision. No automatic hosted cutover.

Risks: PDFs can carry malicious content even if structurally valid; parsing is validation, not malware scanning. Force attachment download, no inline rendering/execution and no AI processing. Add no antivirus claim. Storage/DB writes are separate operations; failure must preserve previous attachments and leave tracked cleanup candidates. Shared development schema rollout may affect previews. Public URLs and personal values must not enter logs or generated summaries.

## Acceptance criteria (expected evidence, not observed results)

| ID | Requirement | Observable success, denial or failure | Required evidence |
| --- | --- | --- | --- |
| profile44-AC-01 | APP-006, SEC-009 | Verified Applicant saves/reopens own bounded profile; anonymous, HR and another Applicant cannot read/write it; verified email is never accepted from form input. | Unit, RLS/direct API and browser cases. |
| profile44-AC-02 | APP-006 | A new form prefills saved values; existing draft remains unchanged; profile editing leaves submitted snapshots unchanged; no AI call occurs. | Browser and data/service tests. |
| profile44-AC-03 | APP-006, APP-004/005 | Education/work experience save with a draft and freeze on submit with existing details/letter. Invalid/stale writes retain entered values without partial persistence. | Unit, RPC and browser cases; retry reconciliation. |
| profile44-AC-04 | APP-007 | Optional valid PDF at or below 1 MiB uploads/downloads; oversized, non-PDF, spoofed or unparseable/encrypted PDF is rejected without replacing existing file. | Boundary/content cases and real Storage integration. |
| profile44-AC-05 | SEC-009 | Owner can download own draft/submitted file; HR can download submitted only; other Applicant, guest and guessed object paths return no private bytes. | Server route and direct Storage/RLS denial tests. |
| profile44-AC-06 | APP-007, SEC-009 | Submitted/closed-job file changes, direct upload/overwrite/delete bypasses and invalid-role mutations are denied. Closing retains authorized existing downloads. | DB, Storage and role tests. |
| profile44-AC-07 | APP-001/007 | Save/upload/replace/remove racing submission or closure cannot mutate a frozen attachment or finalize after closure; retries never create a second application or falsely report mismatched saved data. | Deterministic race and lost-response tests. |
| profile44-AC-08 | APP-007, SEC-009 | Failed upload/finalization leaves previous attached file usable; unreferenced staged files remain tracked and can be cleaned without deleting another application's file. | Fault injection and scoped cleanup checks. |
| profile44-AC-09 | SEC-009, SEC-005/007 | AI payloads/logs contain no structured profile values, education/work experience, filename or PDF bytes; private file responses are attachment/no-store. | Provider-boundary, logging and response-header checks. |
| profile44-AC-10 | APP-006/007 | Legacy records show absent optional data/file honestly; profile/forms/upload/download work at 390px and 1440px with keyboard/error feedback. | Migration compatibility and browser checks. |

Artifacts: [overview delta](specs/product-overview.md), [application delta](specs/applications-and-review.md), [security delta](specs/security-and-privacy.md), [design](design.md), [plan](plan.md), [tasks](tasks.md), [record](record.md).

## Approval

Paul Cheng replied “Approve as written” on2026-10-09 to the explicit question naming this proposal, all three deltas, design and plan. The proposed limits, encrypted-PDF rejection, draft-only replacement, new-form-only autofill and cleanup design are approved for implementation. [Decision evidence](record.md). Explicit branch permission remains pending. No implementation acceptance, commit, push, PR or hosted action is inferred.
