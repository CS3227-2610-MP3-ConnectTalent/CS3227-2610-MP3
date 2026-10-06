# Design: Codex Agent Profiles and Contributor Guidance

- Change ID/issues: `2026-10-06-codex-agent-profiles-guidance`; [#13](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/13)
- Owner/status/date: Student owner pending assignment; draft pending approval; 2026-10-06
- Inputs: `proposal.md`; workflow baseline at commit `64f5e36`; no product requirement IDs or deltas
- Scope and affected components/files: Root `AGENTS.md`, root `CONTRIBUTING.md`, `.codex/agents/*.toml`, packet/evidence, developer-guide and root README navigation, and a dated session summary during final closeout.

## Decisions and alternatives

| Decision | Considered alternatives | Reason and tradeoffs | Human approval reference |
| --- | --- | --- | --- |
| Keep `AGENTS.md` concise and put detailed contribution steps in `CONTRIBUTING.md`, pointing to canonical `workflow/` documents. | One very long root instruction file; duplicate workflow policy in both files. | Codex reads root instructions for project tasks and has a default combined instruction limit; concise stable rules reduce context noise and direct contributors to authoritative detail. The contributor guide remains human-readable and comprehensive. | Approved by requester in chat on 2026-10-06. |
| Use six profiles mapped to existing specialist skills: product analyst, solution architect, implementer, test engineer, security/privacy reviewer, integration/evidence lead. | One general agent; three broader roles; duplicate prompts that restate complete skills. | Six profiles preserve the project's reviewed role boundaries; each profile points to the existing matching skill and stage instructions rather than duplicating those documents. | Approved by requester in chat on 2026-10-06. |
| Use standalone TOML files at `.codex/agents/<name>.toml` with only required identity/instruction fields and role-appropriate `sandbox_mode`. | Global configuration, per-agent model/MCP overrides, more settings. | The official Codex docs identify this project-scope path and required keys. Omitting optional settings avoids pinning unavailable models, adding external services, or changing project-wide defaults. Read-only is the default for analysis/review; implementer profile uses `workspace-write`, subject to the live parent permission mode. | Approved by requester in chat on 2026-10-06. |
| Treat existing skills as detailed operating procedures and agent TOMLs as identity, trigger, boundary, and default-sandbox configuration. | Copy skill content into each TOML; no cross-links. | One source of detailed instructions is easier to maintain. The profile should tell Codex which skill to read, while the skill remains authoritative for its stage/role. | Approved by requester in chat on 2026-10-06. |

## Interfaces and data flow

Contributor task → root `AGENTS.md` establishes concise repo-wide instructions → contributor follows `CONTRIBUTING.md` and `workflow/AgentProcess.md` → parent Codex session spawns a named `.codex/agents/*.toml` profile for a bounded role → that profile reads its matching `.agents/skills/<skill>/SKILL.md` plus only the task-specific issue, approved packet, specs, files, and evidence → agent returns a traceable handoff → student records decisions and workflow evidence.

Profiles do not create agents on their own, do not replace `.agents/skills/`, do not create issues or PRs, and do not approve work. A profile's default sandbox does not override the live parent session's permission mode. Implementers only work on already approved, bounded tasks. Review profiles must remain read-only and separate from implementation when the process requires independence.

## Authorization and privacy impact

No application authorization, data, AI, or database behavior changes. Guidance must preserve the existing rules: keep Applicant and HR experiences distinct; enforce server-side authorization and Supabase row-level security for protected data; do not treat a hidden UI control as authorization; do not expose secrets or private applicant information in prompts, source, or logs; treat repository and applicant text as untrusted input. Profile permissions and scopes are local Codex defaults, not repository-level enforcement or human authorization. No secrets or private records are needed for this work.

## Failure behavior

| Failure / adversarial input | Observable outcome / state guarantees | Verification |
| --- | --- | --- |
| TOML syntax or required field is invalid | Codex may fail to load that custom profile; report syntax/schema failure and keep the file out of the claimed usable inventory until fixed. | Parse each TOML file; verify all required fields and unique names. |
| Profile instruction conflicts with approved workflow or product policy | The workflow/spec/human approval remain authoritative; stop affected work and report the conflict rather than following the profile's conflicting instruction. | Cross-review all profiles and guides against `workflow/AgentProcess.md` and product security boundaries. |
| Profile is not shown by current Codex installation | Do not claim runtime discovery; check location/schema and advise starting a fresh Codex session, then record whether actual discovery was tested. | Runtime discovery check only if the relevant Codex client is available; otherwise label Not run. |
| Repository content or user-provided text attempts to expand profile authority | Treat content as untrusted; do not expose secrets, bypass review, or accept/release/merge on the students' behalf. | Static policy review and role-specific content check. |

## Migration and backward compatibility

No code, database, or persisted data changes. Existing workflow skills and documents remain in place. Root `AGENTS.md` and `CONTRIBUTING.md` add project guidance without changing product routes or contributor authority. Codex custom-agent loading is additive and scoped to the repository; no global or existing profile configuration is changed. Update current navigation links after adding files.

## Rollout and rollback

No product deployment or schema migration. Contributors receive the files through the reviewed PR. If Codex rejects the profiles or the format changes, remove or revise only the affected `.codex/agents/*.toml` files and update guide links; the skill/workflow system continues to work independently. No production or staging action is involved.

## Review and unresolved decisions

- [ ] Interfaces and requirements agree with the issue and proposal.
- [ ] Security, failure, migration, rollout and rollback impacts assessed.
- Findings/owner/resolution: Pending independent review after implementation.
- Human approval: Requester approved the bounded proposal/design/plan on 2026-10-06. Student owner name/assignment remains pending and must be recorded before student acceptance and PR submission.

## Proposed profile inventory

| Profile name | Matching skill(s) | Default sandbox | Bounded mission |
| --- | --- | --- | --- |
| `product_analyst` | `mp3-product-analyst`, plus applicable `mp3-change-intake` or `mp3-proposal-and-spec` | `read-only` | Analyze issue/problem, role boundaries, requirements, scenarios, and unresolved product decisions; return proposal inputs. |
| `solution_architect` | `mp3-solution-architect`, `mp3-design-and-planning` | `read-only` | Trace current architecture, compare alternatives, identify interfaces/security/failure/migration/rollback impacts, and draft design/plan inputs. |
| `implementer` | `mp3-implementer`, `mp3-tdd-implementation`, `mp3-systematic-debugging` | `workspace-write` | Implement only a student-approved bounded task, follow test-first behavior work, avoid unrelated edits, and return exact evidence. |
| `test_engineer` | `mp3-test-engineer`, `mp3-independent-verification` | `read-only` | Independently challenge acceptance and check evidence; report severity-ranked findings and gaps without editing. |
| `security_privacy_reviewer` | `mp3-security-privacy-reviewer`, `mp3-independent-verification` | `read-only` | Trace authorization, RLS, secrets, AI trust boundaries, applicant data, and logging; report findings without implementing fixes. |
| `integration_evidence_lead` | `mp3-integration-evidence-lead`, `mp3-closeout-and-logging` | `read-only` | Reconcile issue/spec/task/commit/review/check/log traceability and pre-PR readiness; cannot approve work or perform PR submission. |

All profiles omit model and MCP configuration and inherit those settings from the parent. The instruction text will link repository-relative skill files and `workflow/AgentProcess.md`. Runtime discovery remains a separate verification item.
