# Design: action-specific pending controls

- Issue/status: [#84](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/84), approved for implementation on 15 October 2026.
- Inputs: [proposal](proposal.md), [OVR-006 delta](specs/product-overview.md).
- Scope: Applicant application form/action buttons, résumé panel/action state and error-page reset control; focused tests, audit, docs/evidence. No persistence or authorization module changes.

## Data flow and choices

| Area                     | Proposed approach                                                                                                                                                                                          | Boundary                                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Application form         | Use one form-scoped pending source and submitter intent to render “Saving draft…” or “Submitting…”. Keep the existing disabled fieldset and generic status as an accessible fallback; clear on settlement. | Do not infer intent from a fixed timer or change the `save`/`submit` server contract. Check Enter and native validation before finalizing. |
| Résumé actions           | Keep the existing `pending` state in `useResumePanelActions`, add the active operation identity, and render action-specific labels while disabling all conflicting file buttons.                           | Preserve revision/retry/storage behavior and file privacy. Do not create duplicate upload state sources.                                   |
| Error retry              | Use React transition pending around `reset()` only if the route reset is actually transition-tracked; otherwise retain a truthful status rather than a false spinner.                                      | Error-page recovery is separate from #83 link status and cannot promise browser-held total-network-failure recovery.                       |
| Already-covered controls | Source audit #81, profile, withdrawal and AI states.                                                                                                                                                       | Do not duplicate or rewrite teammate-owned AI logic. Local-only toggles stay immediate.                                                    |

## Test and rollout

Before product edits, run focused checks that fail for the missing active-action label/disable semantics. Add meaningful delay, duplicate activation, failure/retry and keyboard cases. Run full unit coverage and report branches before/after; target relevant untested decision paths (for example résumé panel and application form) without a blanket percentage gate. Run typecheck, scoped lint/format, production build and independent review. No migration or hosted setting is expected. Rollback is a UI-only revert; existing server checks remain.

PR #82 and #83 are open/uncommitted dependencies; implementation should start from a separately authorized updated-`develop` branch, then reconcile their merged changes before PR. If #81/#83 changes overlap, revise the packet/plan before coding that overlap.
