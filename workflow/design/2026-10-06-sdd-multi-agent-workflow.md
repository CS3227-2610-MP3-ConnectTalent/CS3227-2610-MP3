# Design: Repository-Owned SDD and Multi-Agent Workflow

Date: 2026-10-06

Status: user-approved design; revised to include issue-first, PR-last flow on 2026-10-06

## 1. Intent

Set up a project-owned development workflow for the CS3227 MP3 careers portal. The workflow must make specification-first development and basic multi-agent software engineering visible in repository artifacts, be practical for a two-student team, and remain usable without installing or invoking OpenSpec, Superpowers, or another SDD toolkit.

The workflow will build on the files already present in `workflow/`, start every change with one or more GitHub issues, split the current product specification into smaller capability specifications, add repository-local skill instructions for workflow stages and specialist agents, improve change and feature evidence templates, require a dated interaction-summary log during pre-PR closeout, and end the contributor workflow by opening a pull request. The developer guide will describe the complete process and file map.

## 2. User goals and constraints

### Goals

- Agree and record what a change must do before implementation begins.
- Keep requirements modular and traceable to tests, implementation tasks, reviews, and release evidence.
- Define repeatable agent responsibilities and handoffs so the team can demonstrate actual specialized-agent work.
- Use test-first implementation, independent review, explicit human decisions, and honest verification evidence.
- Keep implementation history reviewable with small Conventional Commits scoped to coherent work units.
- Keep workflow policy, specifications, templates, the skill catalog, and change history in `workflow/`. Place the actual Codex-discoverable skill folders in repository-root `.agents/skills/`; keep session summaries and their template in the existing `logs/` location.
- Make GitHub issue creation the entry point and opening a PR the last contributor action; keep post-submission review, merge, and release steps clearly distinguished.
- Expand the existing developer guide instead of creating a competing guide.

### Constraints

- The workflow is authored and maintained by this project. It must not depend on OpenSpec or Superpowers being installed, configured, or invoked.
- Codex scans repository-root `.agents/skills/` for project skills. Each skill is an instruction pack selected by its description or explicitly invoked; a skill does not itself spawn a separate agent.
- Existing implementation evidence, logs, and unresolved reviews must remain accurate. No historical agent run, approval, plan, prompt, test, or security review may be invented.
- The current `BrowseJobListings.md` evidence says implementation checks completed while independent review and human sign-off remain pending. That status must be preserved.
- The existing product baseline is ProductSpec version 0.6, dated 5 October 2026. Splitting it into capability files is a documentation reorganization that preserves behavior; requirement IDs and formatting may be added, but must not silently change scope.
- The team still needs to fill in student ownership assignments and verify all existing historical summaries.

## 3. Options considered

### Option A: Expand the current flat set of workflow documents

Keep one product-spec file and one agent-process file, adding detail and several templates. This is the smallest change, but it leaves the product requirements difficult to review by capability and makes parallel work and change history less clear.

### Option B: Mirror an SDD toolkit directory and command model

Reproduce the full layout, lifecycle, and commands of an existing toolkit. This provides familiar concepts but risks creating a toolkit clone that the team has to maintain and could conflict with the assignment's requirement to build its own process.

### Option C: Use a small project-owned set of modular specs, change packets, and skill playbooks (recommended)

Keep a short product-spec index, organize canonical requirements by capability, and keep each proposed change's artifacts together in a dated folder. Write Markdown skill playbooks for the lifecycle and specialist roles. Use manual checklists, human approval gates, Git history, repository tests, and PR review as the enforcement mechanism. This retains useful SDD and TDD ideas while leaving structure, wording, and decisions owned by the team.

## 4. Proposed repository organization

```text
.github/
  ISSUE_TEMPLATE/
    config.yml                      # direct users to structured issue forms
    feature_request.yml             # feature/change intake
    bug_report.yml                  # defect intake
    documentation_process.yml       # docs/workflow change intake
  pull_request_template.md          # change evidence and Closes #N checklist

workflow/
  README.md                         # entry point and navigation
  ProductSpec.md                    # product overview and capability-spec index
  AgentProcess.md                   # roles, gates, assignment, and handoff rules
  specs/
    README.md                       # authoring, IDs, and cross-spec rules
    product-overview.md             # product boundary, actors, release scope
    accounts-and-roles.md           # registration, authentication, role assignment
    public-job-listings.md          # published listing, category filter, detail view
    job-management.md               # HR draft/edit/publish/close lifecycle
    applications-and-review.md      # submit-once, ownership, HR review and notes
    applicant-ai-draft.md           # applicant-controlled cover-letter drafting
    hr-ai-summary.md                # constrained, non-decision HR summary
    security-and-privacy.md         # cross-cutting authorization and data limits
    deployment-and-operations.md    # environment separation, auditing, operations
  skills/
    README.md                       # catalog, Codex use, and skill conventions
  templates/
    ProposalTemplate.md
    DesignTemplate.md
    SpecDeltaTemplate.md
    ImplementationPlanTemplate.md
    TasksTemplate.md
    FeatureRecordTemplate.md
    AgentHandoffTemplate.md
  changes/
    README.md                       # active-change rules
    <YYYY-MM-DD-short-name>/
      proposal.md
      design.md                     # required for architectural/risky changes
      specs/<capability>.md         # one delta for each changed canonical spec
      plan.md
      tasks.md
      record.md
  records/
    BrowseJobListings.md            # existing evidence, status unchanged
    SDD-Multi-Agent-Workflow.md     # setup record for this process change
  archive/
    README.md                       # sync and archive rules
    <YYYY-MM-DD-short-name>/        # completed packets, preserved intact
  design/
    2026-10-06-sdd-multi-agent-workflow.md
  plans/
    2026-10-06-sdd-multi-agent-workflow.md

.agents/
  skills/
    mp3-change-intake/SKILL.md
    mp3-proposal-and-spec/SKILL.md
    mp3-design-and-planning/SKILL.md
    mp3-tdd-implementation/SKILL.md
    mp3-systematic-debugging/SKILL.md
    mp3-independent-verification/SKILL.md
    mp3-closeout-and-logging/SKILL.md
    mp3-pr-submission/SKILL.md
    mp3-product-analyst/SKILL.md
    mp3-solution-architect/SKILL.md
    mp3-implementer/SKILL.md
    mp3-test-engineer/SKILL.md
    mp3-security-privacy-reviewer/SKILL.md
    mp3-integration-evidence-lead/SKILL.md

logs/
  README.md                         # per-session coverage and privacy rules
  SessionSummaryTemplate.md         # prompt/interaction summary template
  YYYY-MM-DD-topic.md               # dated session summaries
```

`workflow/ProductSpec.md` remains as a stable entry point for existing links, but becomes a concise overview and index rather than holding every requirement. `workflow/AgentProcess.md` remains the team-level policy. The existing feature record moves under `workflow/records/` so it is clearly distinguished from future change packets. The old `workflow/FeatureRecordTemplate.md` moves into `workflow/templates/` and is expanded; internal links are updated as part of implementation. The repo-root `.agents/skills/` path is an intentional location exception: Codex scans it for project skills, so placing the actual `SKILL.md` files there makes them discoverable without copying or installing a toolkit.

The change folder is the unit of work and review. Capability deltas go under `changes/<id>/specs/` so a change can update more than one canonical specification without mixing domains. A small change may omit a technical design document when the proposal explains why it is unnecessary, but it still has a reviewed requirement delta and implementation checklist whenever product behavior changes.

## 5. Canonical specification split

The 0.6 baseline will be moved without intended behavior changes into these files:

| Canonical file | Requirement area |
| --- | --- |
| `product-overview.md` | One employer per deployment, users, first-release boundary, non-goals |
| `accounts-and-roles.md` | Applicant signup, controlled HR account assignment, role permissions |
| `public-job-listings.md` | Published-only browsing, category filtering, job detail fields |
| `job-management.md` | HR draft creation/editing, publication, closing, immutable published content |
| `applications-and-review.md` | One application per applicant/job, applicant ownership, HR status and notes |
| `applicant-ai-draft.md` | Allowed inputs, editable output, explicit applicant submission |
| `hr-ai-summary.md` | Allowed inputs/outputs, follow-up questions, no score/rank/status decision |
| `security-and-privacy.md` | Authorization order, RLS, untrusted text, data minimization, logging and limits |
| `deployment-and-operations.md` | Separate environments, audit evidence, operational and release expectations |

Each normative requirement receives a stable capability-prefixed identifier (for example, `JOB-001` or `APP-003`) and at least one observable scenario where appropriate. IDs are never reused; retired IDs remain noted in change history. Requirements use clear normative language and define role, input, outcome, and denial behavior for security-sensitive paths. Cross-cutting rules have one canonical home and are linked from capability specs instead of duplicated with potentially conflicting wording.

The specification index records the baseline version and links to each module. A future behavior change increments the product-spec version according to a documented rule in `specs/README.md`. A pure reorganization retains version 0.6 and explicitly says that no product behavior changed.

## 6. Change lifecycle and approval gates

The contributor workflow begins with GitHub issue intake and ends when the contributor opens a pull request. Use one issue per independently deliverable change; create linked/dependent issues when work should be split. A dated change folder is created after issue triage and before implementation. A documentation-only change may use a lightweight record without inventing a product requirement delta. A defect fix references the existing requirement it restores or proposes a `MODIFIED` delta if expected behavior itself must change.

1. **Create issue(s) — workflow entry point.** Start through the matching GitHub issue form (`feature_request.yml`, `bug_report.yml`, or `documentation_process.yml`). State the user/problem, desired outcome, evidence or reproduction, scope, acceptance criteria, affected capability IDs when known, risk/data/security impact, dependencies, and student owner. Split independent deliverables into separate issues and link dependencies. Triage and clarify the issue before creating its change packet; an issue is intake, not implementation approval.
2. **Create change packet and classify.** Assign the issue number(s) to the change ID and `workflow/changes/<date-name>/` packet; record issue links in its record and use an issue-linked branch such as `issue-<number>-<short-name>`. Read the overview and affected canonical specs; inspect current implementation/tests; record change size/risk, affected capabilities, and whether a behavior delta is required.
3. **Proposal.** Explain the problem, user/stakeholder, motivation, scope, exclusions, assumptions, dependencies, alternatives, and observable success criteria. Ensure the proposal resolves the issue's acceptance criteria or records open decisions.
4. **Spec delta.** Before implementation, describe each requirement change using `ADDED`, `MODIFIED`, or `REMOVED` sections, stable IDs, and testable Given/When/Then scenarios. Identify the canonical file and existing requirement for every modification/removal. The product owner and an independent analyst/reviewer resolve ambiguity before approval.
5. **Design.** For changes affecting architecture, authorization, schema, AI boundaries, integrations, or multiple modules, document decisions, alternatives, data flow, interfaces, migration and failure behavior, privacy/security impact, and files or components likely affected. State why a design file is omitted for a narrow change.
6. **Plan and task checklist.** Create small ordered tasks with requirement IDs, dependencies, owner role, expected files/layers, and verification evidence. Include tests, documentation, security review, migration, deployment, and rollback tasks when relevant. Tasks use checkboxes and are checked only after the stated evidence exists.
7. **Human approval to start implementation.** Do not begin product implementation until the owner agrees to the proposal, spec delta, design (when required), and plan. Record approval, approver, and date in the change record. GitHub issue creation alone does not grant this approval.
8. **Specialized implementation.** Assign bounded tasks to agents using the matching role skill. Follow TDD for behavior: write a focused failing test, run it and confirm it fails for the intended reason, implement the smallest change, rerun to green, then refactor while keeping checks green. Record actual commands, results, and environmental blockers. Never claim a test passed if it was not run. Save each coherent, locally checked unit in a scoped Conventional Commit using `type(scope): imperative summary`; keep unrelated work separate, and add corrective commits for review findings.
9. **Independent verification.** A test engineer checks acceptance-criteria coverage and reruns relevant gates. A security/privacy reviewer examines authorization, RLS, prompt/data boundaries, secrets, and logging when in scope. A reviewer must not approve their own implementation. Findings are recorded with severity, evidence, disposition, and follow-up owner.
10. **Human acceptance and integration.** The student owner reviews the final diff and evidence, resolves or explicitly accepts findings, verifies requirement-to-test links, and updates user/developer documentation and reflection when relevant. Keep this feature branch targeted to the issue and prepare it for a reviewed PR to `develop`; the later reviewed release PR to `master` remains the existing release process.
11. **Canonical spec sync and packet archive.** Before PR creation, apply each approved behavior delta to its canonical capability spec; compare the updated text with the delta and implementation. Preserve the completed packet, proposal, deltas, plan, task outcomes, review decisions, and evidence under `workflow/archive/` with its date/name. Do not discard the delta or rationale.
12. **Session summary (last closeout artifact).** Before opening the PR, add a dated `logs/` summary that accounts chronologically for substantive user prompts, agent prompts/handoffs, material tools/interactions and actions, decisions, changed files, actual checks, and unresolved items. Link it from the change record and PR. Keep credentials, private applicant data, sensitive full prompts, and hidden reasoning out of the log.
13. **Create the PR — final contributor action.** Open a PR to `develop` using `.github/pull_request_template.md`. Include `Closes #<issue-number>` for every issue completed by the PR, link the change packet and session summary, identify affected requirement IDs, report actual check results and `Not run`/`Blocked` items, and complete the human review checklist. If one PR resolves multiple issues, list each closure explicitly. The contributor workflow ends at PR creation; automated checks, reviewer feedback, merge, a later release PR to `master`, and deployment are the post-submission lifecycle and remain subject to their existing human gates.

Changes may loop back to update earlier artifacts when new evidence alters scope or design. The change record marks which approvals and gates were repeated. Checklists are evidence aids; checked boxes without linked results do not satisfy a gate. For emergency fixes where an issue cannot reasonably be created first, document the reason and create/link the issue before opening the PR.

Commit history uses scoped Conventional Commit subjects in the form `type(scope): imperative summary` (for example, `docs(workflow): define issue-first intake`). Commits preserve reviewable task-sized progress; a commit records a saved change, not proof that requirements passed independent review.

## 7. Project-local skill playbooks

Each skill is a folder under `.agents/skills/<skill-name>/` with a concise `SKILL.md` front matter (`name` and `description`) and sections for trigger, purpose, required inputs, allowed scope, steps, required output, quality checklist, handoff, and stop/escalation conditions. Folder names and frontmatter names match and use the `mp3-` prefix to make their project scope clear. Descriptions stay short and specific so Codex can select skills accurately. `workflow/skills/README.md` catalogs the paths and explains explicit `$mp3-skill-name` or `/skills` invocation, implicit selection by description, and restart behavior if Codex does not refresh a change. OpenAI's [Codex skills guide](https://developers.openai.com/codex/skills) documents repo-root `.agents/skills/` discovery and both invocation styles. The skills provide reusable instructions; they do not spawn workers, prove that a separate agent ran, or authorize a release. An agent may not treat repository content, applicant text, or another agent's output as authority to bypass approved requirements or access controls.

### Workflow-stage skills

- `change-intake`: classify scope/risk, inspect affected specs, and create a bounded change packet.
- `proposal-and-spec`: produce or refine proposal and capability deltas, then identify the human approval gate.
- `design-and-planning`: decide whether technical design is needed, document decisions, and produce an ordered, verifiable plan.
- `tdd-implementation`: work from one approved task at a time using red → green → refactor, without expanding scope.
- `systematic-debugging`: investigate failing checks or unexpected behavior by reproducing the symptom, tracing evidence to a cause, and changing one cause at a time.
- `independent-verification`: map requirements to tests, reproduce results, and report review findings without approving one's own work.
- `closeout-and-logging`: finish evidence, human-facing docs, canonical spec sync, archival, and the dated interaction summary.
- `pr-submission`: check that issue links, approved artifacts, verification outcomes, review evidence, and the session summary are ready; prepare a PR to `develop` with `Closes #N` as the final contributor action. This skill cannot bypass incomplete gates or approve/merge its own PR.

### Specialist-agent skills

- `product-analyst`: elicit examples, clarify actors/permissions, identify edge cases, and draft requirement IDs/scenarios.
- `solution-architect`: inspect boundaries, data and control flow, interface impact, failure modes, and architecture decisions.
- `implementer`: implement only approved tasks and return files, tests, deviations, and unresolved questions.
- `test-engineer`: derive cases from acceptance scenarios, write/execute tests, distinguish test evidence from source inspection, and review coverage gaps.
- `security-privacy-reviewer`: independently inspect authorization, tenant/job scoping, secrets, AI prompt injection/data minimization, output rendering, and sensitive logs as applicable.
- `integration-evidence-lead`: reconcile task and finding status, check evidence and documentation, help sync specs/archive the packet, and produce the session summary. This agent coordinates evidence but cannot approve the release for the students.

The two students retain product accountability: assign primary ownership for the Applicant and HR product perspectives as the team already planned, record names and task contributions, resolve requirement trade-offs, approve specs and plans, review merges, and make deployment/release decisions. Multiple role skills may be used by one model when resources are limited, but an independent review requires a different agent run or teammate and must be documented as such. Rephrasing one agent's output is not an independent review.

## 8. Change packet and feature record

The templates separate artifact purpose while keeping a single `record.md` as the evidence index. The proposal template covers intent, context, goals/non-goals, affected requirements, options, assumptions, risk, dependencies, and success criteria. The design template covers decisions, interfaces, data flow, privacy/security, failure behavior, migration, rollout, and alternatives. The spec-delta template covers requirement operations and acceptance scenarios. The plan and task templates cover ordered work, ownership, verification, and checkboxes.

The issue number/link is recorded in the change packet and feature record so that issue, branch, commit, change artifacts, session logs, and PR remain traceable. GitHub issue forms capture structured intake; the PR template is a final submission checklist, not a substitute for approved change artifacts. The expanded feature record records:

- status, change ID, owner/product role, dates, branch/PR/release links, and affected spec baseline/IDs;
- proposal, design, spec delta, plan, and task checklist links;
- exact acceptance scenarios and a requirement-to-test/evidence map;
- agent role, actual agent/model/tool, task/input context, output, changed files, assumptions, and human verification per handoff;
- command, environment, result, test/security cases, and links to reports or CI, distinguishing passed, failed, not run, and blocked;
- review findings, evidence/severity, disposition/fix, and reviewer independence;
- human approval names/dates; guide/reflection updates; deployment/rollback evidence if applicable;
- known limitations, unresolved items, archive location, and links to all session logs for the change.

The actual Browse Job Listings record is moved into `workflow/records/` and remains marked as implemented with independent review and sign-off pending. It is not retroactively converted into a completed change packet.

## 9. Interaction-summary logging

One dated log is created for each substantive development session, and the relevant change record links to it. Each log contains an ordered interaction summary with one entry for every substantive user request/follow-up and agent handoff, plus the material tool actions and outcomes. It records prompt intent and constraints in concise paraphrase, not hidden reasoning or sensitive full prompt text. The log also contains decisions, alternatives accepted/rejected, files changed, actual verification commands/results, blockers, known limitations, and student verification status.

Existing log files remain historical evidence. This setup adds a current-session summary and strengthens `logs/README.md` and `logs/SessionSummaryTemplate.md` for future sessions. Historical summaries may only be expanded from evidence that is actually available; the team must not invent missing prompt details or mark an incomplete recollection as a full transcript. The workflow and developer guide will state this limitation clearly.

## 10. Developer-guide integration

The current “Spec-driven and agent workflow” section in `docs/DeveloperGuide.md` will be replaced with a detailed explanation of the design: product-spec index and capability map; every workflow/skills/templates/change/archive/log file; entry conditions and approval gates; TDD and independent review; agent skill invocation and responsibilities; multi-agent evidence; feature-record fields; session-summary requirements; branching/release integration; and current evidence limitations. Other architecture, local development, security, deployment, and acknowledgement sections remain accurate and are updated only where links or names change.

## 11. Scope boundaries and non-goals

- Do not change the product UI, application behavior, database, authentication, AI integration, or deployment architecture as part of workflow setup.
- Do not add dependencies, execute toolkit initialization, or claim that Markdown checklists mechanically enforce approval.
- Do not claim that workflow templates or Codex skill files prove that separate agents were run. Each real use needs an honest handoff and interaction record.
- Do not reconstruct unavailable historic prompts as facts. Keep and link the six existing dated summaries; add accurate summaries for new sessions.
- Do not change the current product specification's behavior while splitting it into capability modules.

## 12. Inspiration and attribution

This design adapts ideas, not toolkit files or commands:

- OpenSpec's primary documentation describes per-change proposal/design/task artifacts, capability-level delta specifications using `ADDED`/`MODIFIED`/`REMOVED`, checkable tasks, and syncing deltas into canonical specs before preserving the change in an archive. See [OpenSpec concepts](https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md) and [OpenSpec getting started](https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md).
- Superpowers' TDD skill makes test-first implementation operational through a failing test, minimal passing implementation, and refactoring. This project will adapt that cycle to its own stack and quality gates without installing or invoking Superpowers. See [Superpowers test-driven-development skill](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md).

The project's terms, role boundaries, templates, acceptance rules, and implementation choices are authored here for this course project.

Codex skill packaging and discovery follow the official [Codex skills guide](https://developers.openai.com/codex/skills); no plugin, per-user skill installation, or `~/.codex` configuration change is planned.

## 13. Review checklist

- [ ] Product requirements stay behaviorally equivalent to ProductSpec v0.6 during the split.
- [ ] Every workflow skill has a defined trigger, input, steps, output, handoff, and stop conditions.
- [ ] PR submission has its own final-stage skill and checks that pre-PR closeout is complete before using the PR template.
- [ ] The commit policy uses scoped Conventional Commit subjects and keeps corrective work reviewable.
- [ ] Every specialist role has a bounded responsibility and cannot self-approve its implementation.
- [ ] Product behavior cannot enter implementation before spec and plan approval.
- [ ] TDD, independent verification, human review, and truthful evidence are explicit.
- [ ] The change record links proposal/design/specs/plan/tasks/reviews/tests/logs and distinguishes results from claims.
- [ ] The final closeout includes a dated interaction-summary log without sensitive data.
- [ ] Each change starts with a structured GitHub issue and the contributor lifecycle ends by opening a linked PR; the log is ready before PR creation.
- [ ] The developer-guide update and preservation of existing history are in scope.
- [ ] The process uses no OpenSpec/Superpowers installation, CLI, copied toolkit, or hidden automation.
- [ ] All open team-specific assignments and historical verification limits are represented honestly.
