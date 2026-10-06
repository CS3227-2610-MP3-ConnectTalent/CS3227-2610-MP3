# SDD and Multi-Agent SE Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development`. The user approved sequential specialist-agent execution in the current checkout. Steps use checkboxes for tracking.

**Goal:** Set up a project-owned, Codex-accessible SDD and basic Multi-Agent SE workflow with issue-first intake, modular product specifications, focused Codex skills, reviewable change packets, pre-PR session summaries, and PR creation as the final contributor action.

**Architecture:** Keep product policy, canonical specifications, change templates, change packets, process documentation, and the skill catalog in `workflow/`. Add structured GitHub issue forms and a pull-request template in `.github/`. Put actual repo-scoped Codex skill folders under `.agents/skills/<skill-name>/SKILL.md`, where Codex discovers repository skills. Preserve existing product behavior and historical evidence while reorganizing and expanding documentation.

**Tech Stack:** Markdown, Git, repository-local Codex Agent Skills (`.agents/skills/`). No SDD toolkit, plugin, new package, or application-code change.

**Spec:** [Design: Repository-Owned SDD and Multi-Agent Workflow](../design/2026-10-06-sdd-multi-agent-workflow.md)

## Global Constraints

- Preserve ProductSpec v0.6 behavior and scope while splitting requirements into capability files; this organization change does not itself change the product.
- Put repository-local Codex skills at `.agents/skills/<skill-name>/SKILL.md`, use unique `mp3-` names, and keep their catalog/process explanation in `workflow/skills/README.md`.
- Skills provide instructions; they do not register or start subagents, replace student accountability, or authorize release decisions.
- Do not install OpenSpec, Superpowers, plugins, or application dependencies; do not change product UI, APIs, database, authentication, AI endpoints, or deployment code.
- Preserve the current Browse Job Listings record's in-progress review/sign-off status; do not invent past agent runs, approvals, or prompt history.
- Retain existing dated logs and use available evidence only when summarizing earlier development; add an accurate summary for this workflow-setup session.
- Keep sensitive credentials, private applicant content, and hidden model reasoning out of public logs.
- Commit each coherent, locally checked task increment using `type(scope): imperative summary` Conventional Commit subjects; keep corrections separately reviewable. Work on the user's current branch and do not create a worktree.
- Define every future contributor change as issue-first and PR-last: link issue IDs through the change packet, branch, and PR; create the dated session summary during pre-PR closeout and include it in the PR. This setup task itself does not create a live GitHub issue or PR.
- Avoid application test suites because this change is documentation and skill instructions only; validate skill manifests and inspect documentation structure/links instead.

## Review Focus

1. **Requirement drift during extraction:** ProductSpec v0.6 clauses, role boundaries, and acceptance evidence could be dropped or unintentionally altered. Task 1 traces every current section and numbered acceptance item to a named capability file, then manually compares the source and destination.
2. **Codex skill discovery:** Folder names, `SKILL.md` front matter, or placement could prevent repo-local selection. Tasks 6–7 check the root `.agents/skills/` layout against the official Codex guide; Task 8 runs the available skill validator on every folder.
3. **Broken references after moves:** Existing guide, workflow, reflection, and feature-record links could point to the former template/record paths. Tasks 2 and 5 search for references and update current navigation while retaining historical log wording.
4. **False workflow evidence:** The process or template could make planned roles look like completed agent executions. Task 2 preserves the current review-pending label; Tasks 3, 6, and 7 distinguish role skills from actual agent/tool runs.
5. **Incomplete or unsafe session summaries:** Logs could omit substantive prompts or include secrets/private content, or claim transcript completeness without source evidence. Task 4 defines chronological coverage and privacy rules and writes only the current session summary from available conversation evidence.
6. **Issue/PR lifecycle gaps:** A change could start outside issue intake, lose traceability between issue/spec/branch/log, or reach PR without a session summary or truthful verification. Task 3 adds the GitHub forms and PR checklist; Task 5 documents issue-first intake, pre-PR closeout, and PR creation as the final contributor action.

---

### Task 1: Split the canonical ProductSpec into capability specifications

**Files:**
- Modify: `workflow/ProductSpec.md`
- Create: `workflow/specs/README.md`
- Create: `workflow/specs/product-overview.md`
- Create: `workflow/specs/accounts-and-roles.md`
- Create: `workflow/specs/public-job-listings.md`
- Create: `workflow/specs/job-management.md`
- Create: `workflow/specs/applications-and-review.md`
- Create: `workflow/specs/applicant-ai-draft.md`
- Create: `workflow/specs/hr-ai-summary.md`
- Create: `workflow/specs/security-and-privacy.md`
- Create: `workflow/specs/deployment-and-operations.md`

**Interfaces:**
- Consumes: `workflow/ProductSpec.md` version 0.6 as the source baseline.
- Produces: a stable overview/index and capability specs with stable IDs for use in change deltas, task checklists, and feature records.

- [x] **Step 1: Map the existing specification sections to the approved module table** in `workflow/design/2026-10-06-sdd-multi-agent-workflow.md`. Record the source section and target file for scope, each core behavior, each data-access rule, each AI/security rule, and all nine release-acceptance items.
- [x] **Step 2: Create `workflow/specs/README.md`** with the ID format (`OVR`, `ACC`, `JOB`, `JMG`, `APP`, `AID`, `AIS`, `SEC`, `OPS` plus a zero-padded number), normative-language and scenario conventions, cross-spec link rules, baseline/version policy, and change/retirement rules for IDs.
- [x] **Step 3: Create the nine capability specification files** by moving the mapped v0.6 requirements without changing their intended behavior. Add stable IDs and observable scenarios where appropriate; keep one canonical home for cross-cutting authorization/privacy rules and link to it from capability specs.
- [x] **Step 4: Replace the contents of `workflow/ProductSpec.md` with the concise product boundary, current baseline version/date, module index, and a statement that the split preserved v0.6 behavior.** Retain this filename so existing historical references continue to resolve.
- [x] **Step 5: Manually trace every original requirement and acceptance item to its new file and verify the source/destination meaning.** Record unresolved product decisions (including student ownership assignments) as unresolved; do not decide them during migration.

### Task 2: Create change-packet templates and organize existing feature evidence

**Files:**
- Move: `workflow/FeatureRecordTemplate.md` → `workflow/templates/FeatureRecordTemplate.md`
- Move: `workflow/BrowseJobListings.md` → `workflow/records/BrowseJobListings.md`
- Create: `workflow/templates/ProposalTemplate.md`
- Create: `workflow/templates/DesignTemplate.md`
- Create: `workflow/templates/SpecDeltaTemplate.md`
- Create: `workflow/templates/ImplementationPlanTemplate.md`
- Create: `workflow/templates/TasksTemplate.md`
- Create: `workflow/templates/AgentHandoffTemplate.md`
- Create: `workflow/changes/README.md`
- Create: `workflow/archive/README.md`
- Create: `workflow/records/README.md`
- Create: `workflow/records/SDD-Multi-Agent-Workflow.md`

**Interfaces:**
- Consumes: canonical modules from Task 1 and the existing Browse Job Listings record.
- Produces: a repeatable `workflow/changes/<YYYY-MM-DD-short-name>/` packet with proposal, optional design, per-capability deltas, plan, checkbox tasks, and `record.md`; an archive procedure; and an evidence index for the existing feature.

- [x] **Step 1: Move the existing feature record and template to their planned directories.** Preserve all content, status, commands/results, and the statement that independent review and team sign-off are pending.
- [x] **Step 2: Write the proposal template** with intent/problem, motivation, goals, non-goals, users/roles, affected capability IDs, alternatives, assumptions, dependencies, risks, scope boundaries, acceptance evidence, owner, status, and approval record.
- [x] **Step 3: Write the optional design template** with decisions and alternatives, interfaces/data flow, authorization/privacy impact, failure behavior, migration/backward compatibility, rollout/rollback, affected components, and reasons for omitting design on narrow work.
- [x] **Step 4: Write the spec-delta template** with `ADDED`, `MODIFIED`, and `REMOVED` sections, canonical requirement IDs, before/after references, and Given/When/Then scenarios. Show one delta file per affected capability under the active change's `specs/` folder.
- [x] **Step 5: Write plan and tasks templates** with dependency-ordered work, task owner/agent role, affected IDs/files, explicit verification evidence, and checkboxes. Require tests, docs, security, migration, deployment, or rollback tasks only when relevant.
- [x] **Step 6: Expand the feature-record template** as the evidence index: issue numbers/links; metadata and links; approval checklist; exact acceptance IDs; implementation files; agent/tool handoffs; commands and outcomes; security cases; reviewer independence/findings; human decisions; docs/reflection updates; limitations; archive path; and links to every session log.
- [x] **Step 7: Document active-change, archive, and legacy-record rules** in the three directory README files. Require canonical spec sync before archiving accepted behavior and require complete change artifacts to remain intact in the archive.
- [x] **Step 8: Check that moved content is byte-for-byte unchanged where it represents past evidence, and inspect current inbound references.** Update live navigation later in Task 5; leave historical log statements describing past file paths untouched.
- [x] **Step 9: Create a process-setup record** at `workflow/records/SDD-Multi-Agent-Workflow.md` from the expanded feature-record template. Link this approved design and implementation plan; state explicitly that the setup changes development process/documentation, not product behavior, and has no product capability delta.

### Task 3: Add GitHub issue/PR templates and establish workflow policy, skill catalog, and human gates

**Files:**
- Create: `.github/ISSUE_TEMPLATE/config.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/documentation_process.yml`
- Create: `.github/pull_request_template.md`
- Modify: `workflow/README.md`
- Modify: `workflow/AgentProcess.md`
- Create: `workflow/skills/README.md`

**Interfaces:**
- Consumes: spec index and template layout from Tasks 1–2; issue-first/PR-last lifecycle in the approved design; official Codex discovery path.
- Produces: structured GitHub entry/exit templates and the team's process entry points and rules for approvals, roles, skill selection, handoffs, branch/PR/release integration, and evidence.

- [x] **Step 1: Create structured issue forms.** `feature_request.yml` captures user/problem, outcome, goals/non-goals, affected capability IDs, acceptance criteria, scope/dependencies, risk/security/privacy impact, and owner. `bug_report.yml` captures expected/actual behavior, reproducible steps, environment, evidence, affected requirements, impact/security implications, and owner. `documentation_process.yml` captures the target docs/process, proposed change, rationale, affected artifacts, acceptance criteria, and owner. Mark required fields and use form labels only when the corresponding repository labels are confirmed to exist; otherwise omit label metadata and let triage assign configured labels. Forms are intake, not implementation approval.
- [x] **Step 2: Create `.github/ISSUE_TEMPLATE/config.yml`** with blank issues disabled and no invented external contact destinations; verify GitHub form YAML has unique IDs, valid input types, and coherent required/optional fields.
- [x] **Step 3: Create `.github/pull_request_template.md`** with issue closure (`Closes #`), linked change-packet/session-log paths, summary/scope, affected requirement IDs, task/agent evidence, actual checks and `Not run`/`Blocked` status, docs/spec sync, security/privacy review, findings, risks/rollback, and a reviewer checklist. Clarify that opening the PR is the end of the contributor workflow and that review/merge/release happen afterward.
- [x] **Step 4: Rewrite `workflow/README.md` as the entry point** with links to the product index, capability specs, process, templates, Codex skill catalog, active changes, records, archive, and logs; link to issue/PR templates and state that issue creation is the workflow entry point.
- [x] **Step 5: Expand `workflow/AgentProcess.md`** with the ordered issue → change packet → proposal/spec/design/plan → human approval → TDD/implementation → independent review → human acceptance → spec sync/archive → dated log → PR lifecycle; specify issue ID propagation into change record/branch/PR, pre-PR summary timing, `Closes #N`, emergency issue exception, Conventional Commit format and incremental commit boundaries, and the existing later release flow.
- [x] **Step 6: Define the specialist roles and fallback honestly.** Document product analyst, solution architect, implementer, test engineer, security/privacy reviewer, and integration/evidence lead; distinguish role skills from actual separate agent runs; retain student ownership of Applicant/HR product decisions; explain that if independent execution is unavailable, the record must say so rather than claim a multi-agent review.
- [x] **Step 7: Create `workflow/skills/README.md`** as the catalog for the 14 `mp3-` skills in Tasks 6–7. Include each skill's Codex name/path and purpose, `$mp3-skill-name` and `/skills` invocation, description-based implicit selection, repository-root discovery, restart behavior, and the boundary that a skill does not spawn an agent.
- [x] **Step 8: Manually follow each relative link and check that approval gates distinguish proposed, approved, implemented, reviewed, PR-open, merged, and released states.**

### Task 4: Define interaction-log coverage and record this setup session

**Files:**
- Modify: `logs/README.md`
- Create: `logs/SessionSummaryTemplate.md`
- Create: `logs/2026-10-06-sdd-agentic-workflow.md`

**Interfaces:**
- Consumes: user/agent interaction evidence available for the current session and the closeout rules from Task 3.
- Produces: a repeatable dated summary format and an honest current-session record linked from the workflow setup feature record.

- [x] **Step 1: Update `logs/README.md`** to require one dated summary per substantive development session, a chronological summary of every substantive user prompt/follow-up and agent handoff, material tool actions/results, decisions, changed files, actual checks, open work, and student verification. State that logs are concise summaries, not transcripts or hidden reasoning.
- [x] **Step 2: Add privacy and truth rules:** never copy credentials, private applicant data, or sensitive full prompts; do not claim the log reconstructs unavailable historical prompts; distinguish a planned agent role from an actual agent/tool/model run; preserve existing summaries unless correcting a demonstrated factual error.
- [x] **Step 3: Add `SessionSummaryTemplate.md`** with session metadata, issue/PR/change-packet links, chronological interaction table, request summaries, tool/agent role and outcomes, decisions, files, verification status, blockers/limitations, and student verification status. The summary is a required pre-PR artifact, so the open PR can link it.
- [x] **Step 4: Defer the current session log until Task 8** so that it can report the final file, validator, review, and access outcomes accurately.

### Task 5: Update project-facing navigation and the developer guide

**Files:**
- Modify: `docs/DeveloperGuide.md`
- Modify: `README.md`
- Modify: `workflow/templates/TasksTemplate.md` (correct the pre-PR ordering conflict found during Task 5 source review)

**Interfaces:**
- Consumes: the specifications, process rules, catalog, and logging policy from Tasks 1–4.
- Produces: the authoritative developer-facing documentation and a concise project-layout pointer.

- [x] **Step 1: Replace the existing “Spec-driven and agent workflow” section in `docs/DeveloperGuide.md`** with a detailed file map and procedure covering GitHub issue forms and PR template; issue-first and PR-last sequencing; capability specs; all change artifacts/templates; Codex stage and specialist skills, including PR submission; role boundaries; gates/approvals; TDD/debugging; independent verification; task/evidence recording; Conventional Commits; branch/release integration; canonical sync/archive; and pre-PR session logs.
- [x] **Step 2: Explain Codex use precisely:** repository-root `.agents/skills/<name>/SKILL.md` is the supported project scope; Codex can select by description or explicit `$name`/`/skills`; a skill is an instruction pack rather than an agent; skills do not prove that multiple agents were used; restart Codex if a new skill does not appear.
- [x] **Step 3: Explain the current evidence state:** existing Browse Job Listings review/sign-off remains pending; existing summaries are historical summaries rather than complete transcripts; the team's student names/role assignments and verification remain to be supplied; no new agent run is claimed by creating skill files.
- [x] **Step 4: Add official OpenAI Codex skills guide and OpenSpec/Superpowers source links** near the claims they support. State that the project adopts selected concepts without toolkit installation or copied commands.
- [x] **Step 5: Update root `README.md` project layout** to distinguish `workflow/` policy/specs/templates/changes from `.agents/skills/` Codex-discovered instructions and `logs/` session summaries.
- [x] **Step 6: Search current source documents for old workflow/template/record links** and update active navigation. Verify the new skill paths during Task 8; keep old filenames mentioned inside historical logs as historical facts.
- [x] **Step 7: Keep the active task template consistent with the approved lifecycle.** Move canonical spec sync and packet archive from `Post-submission` to the pre-PR task sequence, before session-summary completion and PR creation. Keep only later merge/release decisions under post-submission.

### Task 6: Create Codex skills for the workflow stages

**Files:**
- Create under `.agents/skills/`:
  - `mp3-change-intake/SKILL.md`
  - `mp3-proposal-and-spec/SKILL.md`
  - `mp3-design-and-planning/SKILL.md`
  - `mp3-tdd-implementation/SKILL.md`
  - `mp3-systematic-debugging/SKILL.md`
  - `mp3-independent-verification/SKILL.md`
  - `mp3-closeout-and-logging/SKILL.md`
  - `mp3-pr-submission/SKILL.md`

**Interfaces:**
- Consumes: the process, specs, templates, catalog, and developer-guide conventions from Tasks 1–5.
- Produces: eight Codex-discoverable, instruction-only workflow skills with matching `mp3-` folder/frontmatter names and concise trigger descriptions.

- [ ] **Step 1: Create the eight lifecycle skills.** Define distinct triggers and outputs for change intake, proposal/spec, design/planning, TDD implementation, systematic debugging, independent verification, closeout/logging, and final PR submission. The PR skill checks for completed pre-PR evidence and uses the template but cannot authorize, review, or merge its own PR. Link to canonical workflow files instead of copying templates into the skill folders.
- [ ] **Step 2: Write each `SKILL.md` with its trigger, inputs, task boundaries, ordered actions, output/handoff, quality check, and stop conditions.** Respect the already approved proposal/plan gates; no skill may authorize a release or claim a human decision.
- [ ] **Step 3: Use Codex's documented repo-scope path** `.agents/skills/<name>/SKILL.md`, not the user-wide `~/.codex/skills` location. Preserve default implicit invocation and documented restart guidance.
- [ ] **Step 4: Request the required sandbox write access for `.agents/skills/`** after Tasks 1–5 are complete. If approved, create the seven workflow-skill folders and proceed to Task 7 under the same authorized path. If rejected, record the decision, finish Task 8's unaffected review/log work, and report the exact access block; do not claim the skills are Codex-discoverable.

### Task 7: Create Codex skills for the specialist-agent roles

**Files:**
- Create under `.agents/skills/`:
  - `mp3-product-analyst/SKILL.md`
  - `mp3-solution-architect/SKILL.md`
  - `mp3-implementer/SKILL.md`
  - `mp3-test-engineer/SKILL.md`
  - `mp3-security-privacy-reviewer/SKILL.md`
  - `mp3-integration-evidence-lead/SKILL.md`

**Interfaces:**
- Consumes: role policies in `workflow/AgentProcess.md`, the handoff template, and workflow skills from Task 6.
- Produces: six Codex-discoverable specialist skills with distinct scopes and handoffs that guide work without pretending to create separate agent instances.

- [ ] **Step 1: Define each specialist's bounded mission, minimum input context, prohibited decisions, expected artifact/handoff, and review independence.** The implementer follows approved tasks; reviewers return evidence-based findings and never self-approve.
- [ ] **Step 2: Check names and descriptions against `workflow/skills/README.md`** and ensure the integration/evidence lead cannot approve a release on behalf of the students.

**Access constraint for Tasks 6–7:** `.agents/` is marked read-only by the current workspace permission profile. Finish Tasks 1–5 before attempting the requested repository-scoped write. If the Task 6 access request is approved, use that same approved path for Task 7. If it is rejected, continue Task 8's review/log work, then report the exact rejected operation and ask for access; do not claim Codex discovery succeeded.

### Task 8: Review skills, documents, and complete the setup record

**Files:**
- Review: all Task 1–7 files and `workflow/design/2026-10-06-sdd-multi-agent-workflow.md`
- Update: `workflow/records/SDD-Multi-Agent-Workflow.md`
- Create at final closeout: `logs/2026-10-06-sdd-agentic-workflow.md`

**Interfaces:**
- Consumes: complete workflow assets and recorded findings.
- Produces: a checked process-setup evidence record and the required final session log. This workflow setup has no product-behavior delta to sync or archive; the canonical v0.6 behavior is preserved in Task 1.

- [ ] **Step 1: Inspect the complete diff and `git status --short`.** Confirm no product source, database migration, test, or dependency changed.
- [ ] **Step 2: Run `git diff --check` on each staged unit before committing and run `git diff --check <starting-commit>...HEAD` at final review.** Resolve whitespace errors and inspect the complete commit range.
- [ ] **Step 3: Run the skill validator on every folder from Tasks 6–7 and manually inspect all skill links, frontmatter names, description scope, and approval boundaries.** Do not run the product's application test suites for this documentation-only change.
- [ ] **Step 4: Review the original ProductSpec against the nine resulting modules** and check all original numbered release criteria, role permissions, and explicit non-goals are present.
- [ ] **Step 5: Review `workflow/`, `.agents/skills/`, the active feature record, `docs/DeveloperGuide.md`, root `README.md`, and `logs/` together.** Resolve broken links, status contradictions, or claims without evidence.
- [ ] **Step 6: Record final human acceptance only if the owner has reviewed this exact implementation.** If final review has not yet happened, leave the workflow-setup record pending student review. If independent multi-agent review was not actually performed, state that plainly.
- [ ] **Step 7: Update the process-setup record with actual review/check results and preserve any team/student verification items that remain pending.** Do not invent a product spec delta or completed independent agent review.
- [ ] **Step 8: As the final closeout artifact before PR submission, create the dated interaction-summary log and link it from the setup record and PR template instructions.** Include only interactions and tool outcomes supported by the current conversation. Do not create a live issue or PR for this workflow-setup task; those GitHub templates and lifecycle rules govern future product changes.

## Proposed contributor-flow boundary

For future changes, the ordered flow is: create issue(s) from a repository issue form → triage and create the linked change packet/branch → approve proposal/spec/design/plan → implement and independently verify → sync canonical specs and archive packet → write the dated session summary → open a PR to `develop` with `Closes #N`. The human contributor stops at PR creation; CI/review/merge and later release PR/deployment follow the repository's existing process. For this setup task, authoring the templates does not create or send a live issue or PR.

## Execution note

The user approved specialist-agent execution, directed that work stay in the current branch `chore/setup-sdd`, declined a worktree, and requested regular incremental Conventional Commits. Execute plan tasks sequentially with a fresh implementer and a separate task reviewer per task so shared files are never edited concurrently. The actual role, handoff, report, review verdict, and commit hash must be recorded; a skill file alone is not evidence that an agent ran.
