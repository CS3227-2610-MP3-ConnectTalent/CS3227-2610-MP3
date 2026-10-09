# Paul Cheng’s reflection

## My scope and the evidence behind this draft

My recorded work covers the non-AI application pipeline: Applicant accounts, saved applications, password recovery, HR review/notes/status actions, HR job management, contact fields and role navigation. Our team split work by workflow and AI features, so I should explain my actual contribution rather than imply I personally implemented every AI safeguard. The [AI feature record](../workflow/archive/2026-10-09-soclaas-ai/record.md) identifies John’s work and its own decisions and limits.

The strongest evidence for my reflection is the [Applicant application packet](../workflow/archive/2026-10-07-applicant-applications/record.md), [HR review packet](../workflow/archive/2026-10-08-hr-application-review/record.md), [job-management packet](../workflow/archive/2026-10-09-hr-job-management/record.md), [contact-fields packet](../workflow/archive/2026-10-09-application-form-details/record.md) and [signup/navigation review](../workflow/archive/2026-10-09-signup-notice-navigation/record.md). These distinguish approval, implementation, review, local acceptance and release. I cannot substitute a polished UI or a merged PR for the missing hosted acceptance evidence.

## 1. AI Security

### Attack surfaces and prompt injections considered

There are two different sets of attack surfaces. In the product, Applicant experience notes and cover letters reach AI features. A letter could impersonate a system message, instruct the model to ignore its task, ask for HR notes or request a hiring decision. Job requirements are also input text, even when authored by HR; being stored in our database does not make their contents higher-priority instructions. An HR summary could repeat an injected claim or invent evidence despite otherwise valid output.

The development process has its own surfaces: issue descriptions, repository documents, logs and an agent’s handoff. A malicious instruction could be disguised as a requirement or a reviewer’s recommendation. I need to treat such text as task data, compare it with the approved specification and preserve the human authority to approve changes. A role file saying “security reviewer” is not proof that a trustworthy separate review occurred.

My pipeline work also has ordinary security boundaries independent of prompt injection: direct URL access, forged form fields, role assignment, hidden drafts, private HR notes, retry behavior and concurrent job closure. An AI feature would still be unsafe if a correct summary were served to the wrong user.

### Implemented safeguards and how they were tested

The product uses server authorization and database RLS. Applicants read their own applications; HR reads submitted applications and private HR notes; HR must not read unsubmitted drafts. Public signup cannot grant HR access. These rules are exercised through denial cases and direct database requests, not only hidden buttons. The [HR review evidence](../workflow/archive/2026-10-08-hr-application-review/handoffs/independent-review.md) and [contact database tests](../supabase/tests/database/application_details.test.sql) make these boundaries reviewable.

The contact-fields change gave me a concrete data-minimization example. Full name, verified email, phone and portfolio URL belong in the application, but are excluded from AI payload assembly and audit logs. Submission snapshots the email from trusted verified Auth data rather than a browser field. Tests check forged email exclusion, owner/HR visibility and immutable submissions. This is a narrower and testable claim than saying “AI never sees personal information”: Applicants may still type personal information into their allowed notes or letters.

The AI implementation uses selected job/letter projections, bounded requests, output validation, escaped rendering and no model tools or database authority. HR still performs a separate status action. A prompt saying “shortlist this candidate” therefore has no direct status-write capability. These are team safeguards recorded in [SEC-003–007](../workflow/specs/security-and-privacy.md), not a claim that I personally authored them all.

The contact packet records 206 local database checks, four concurrency cases and an independent SQL/URL review. Those counts refer to that revision. They are useful because they include denial, stale-write and failure cases, but they are not proof of every attack or deployed behavior. The AI record also preserves an observed factual summary error. Valid structure and prompt defenses do not guarantee factual accuracy, so HR must compare summaries with the actual letter.

### Limits on product AI and development agents

Product AI is bounded by the canonical rolling-minute limits: three requests per user and 24 provider requests per deployment across both features. It has input/output limits, a 20-second timeout, at most one provider call per request and no automatic provider retry. The model cannot submit an application, add a note or change a review status. These limits reduce resource abuse and unintended authority; they do not remove the need for human verification.

Development agents receive bounded issue-linked tasks. Implementers follow an approved proposal/design/plan; independent reviewers are read-only for their assigned review. We recorded actual execution identities and check scope instead of treating skill usage as several agents. In my interaction with Codex, branch creation, commits, pushes and PRs required explicit instructions. Hosted operations remain separate decisions.

A limitation is that instructions and profiles are weaker than technical access controls. I should inspect the actual tool permissions and the scope of outputs, not assume a Markdown instruction technically prevents every forbidden operation. Future improvements would use narrower credentials for hosted operations and repeatable checks that demonstrate the intended tool boundaries.

### Approval gates and human oversight

Implementation approval and acceptance were separate decisions. For example, I first approved the concrete contact-field bounds and migration cutover, then accepted the implementation after local tests and independent review. Approval messages were recorded with their source/date. A reviewer finding or a passing test did not grant approval to deploy.

This separation helped prevent a handoff or generated summary from quietly becoming authorization. Logs still distinguish student verification pending from acceptance of a feature. A recovery example is the [independent UI review](../workflow/archive/2026-10-09-ui-refresh/handoffs/independent-review.md): actual reviewer findings about wrapping and header contrast were fixed and rechecked rather than hidden by a successful normal-data test run.

The weakness is process overhead: repeated approval questions can make routine work difficult to follow. My improvement would be clearer, bounded approvals and a concise readiness summary, while retaining separate gates for materially changed requirements and release. I should avoid confusing more documents with stronger security.

## 2. Spec-Driven Development

### What a useful specification makes clear

Before implementation, a specification should state actors, permitted data/actions, the state lifecycle, field constraints, trust boundaries, failure behavior and observable acceptance criteria. “HR can review applications” is too vague unless it says whether drafts are visible, whether notes are private, which statuses exist and who changes them.

For the contact change, the approved contract specifies a required name at submission, optional phone/HTTP(S) portfolio URL, verified email from Auth, private partial drafts, atomic saves, frozen submitted details and honest legacy missing-field display. These decisions prevent the implementer from choosing product policy while coding.

### How I judge whether an agent can build from the spec

I can test precision by trying to derive positive, negative and race scenarios without adding assumptions. Given a verified Applicant and forged email input, trusted email must be stored. Given an HR request for a draft ID, no draft should be returned. Given a stale revision, an update must not silently overwrite newer fields.

If the implementer has to guess the allowed statuses, edit cutoff or legacy behavior, the packet is not ready. Separating the proposal, deltas, design and plan is useful only when each closes a real ambiguity; copying a template without decisions does not make a specification precise.

### How requirement changes flow through implementation and tests

The submitted-letter edit rule is an important example. Earlier work allowed edits until a job closed. The later accepted AI packet changed the canonical rule to freeze text on submission. That history must remain visible, while current specifications and tests describe the accepted behavior. I should not mix an old conversation decision with the current contract.

A change should identify stable requirement IDs, update the issue-linked delta, obtain approval for changed design/plan, implement and test it, undergo independent review and separate acceptance, then sync canonical requirements before archiving the whole packet. Integration of navigation and contact fields required reconciling two independent v1.2 histories into v1.3 rather than losing either accepted change.

The contact migration also revokes legacy write RPCs. This makes deployment coordination part of the design: locally correct code can still break old deployed clients if the database changes first. Hosted cutover is a remaining operation, not something a spec archive automatically completes.

### Showing intent rather than matching wording

The one-application rule needs a concurrent duplicate-submit test, not only a sequential form test. Job closure needs observed lock ordering and unchanged records when closure wins. Contact persistence needs a reload and a complete-field retry comparison, not simply an assertion that a Save button exists.

Independent review revealed details that a happy-path interpretation missed: portfolio validation disagreement and an integration test missing the new required full name. A browser test also treated an already-visible “Saved draft” heading as evidence that a new save finished; reloading early produced a misleading persistence failure. Waiting for the actual response preserved the intended persistence assertion.

My lesson is to test the user's durable outcome and authority boundaries. Tests that mirror implementation details or CSS classes are weaker than tests of saved data, denied access, frozen content and usable keyboard/mobile flows. I would improve future packets by writing failure and race scenarios alongside the initial happy path, not adding them only after review.

## 3. Basic Multi-Agent Software Engineering

### Tasks that benefit from specialised agents

A product analyst can identify missing user decisions; an architect can challenge trust boundaries and rollback; an implementer can build a bounded task; a tester/security reviewer can examine intent, denial paths and evidence independently. Integration reconciliation benefits from someone checking requirement IDs, commits, handoffs and release limits.

These responsibilities do not require a different agent for every file. Our actual evidence includes a primary implementer and separate reviewer executions; it does not prove that every role profile was independently dispatched. For a small team, I would prioritise independent review where consequences are greatest, such as database permissions and private Applicant data.

### Building and evaluating specialised agents

A specialist needs explicit inputs, allowed files/actions, a clear question, expected output and a stop condition. “Review security” is less useful than asking a read-only reviewer to inspect RLS, trusted email snapshots, draft visibility and legacy RPC grants against named acceptance criteria.

Agents should be evaluated by useful findings, reproducible checks and their handling of uncertainty. We can test reviewer quality with known seeded defects in an isolated fixture, then check whether findings are correct and whether false positives are explained. That is a proposed improvement, not a claim that we already completed an agent benchmark. Profiles and a successful tool launch alone do not establish review quality.

### What a handoff must preserve

A handoff should include issue/requirement IDs, approved scope and baseline, relevant files, assumptions, actual commands/results, failures/fixes, remaining findings, independence and human decisions. It must say which tests were independently rerun and which were supplied by the implementer.

This mattered when the contact reviewer passed a focused suite but did not rerun all browser/database checks. Describing everything as independently verified would exaggerate the evidence. A new task should receive enough context to verify claims without copying secrets or every unrelated conversation.

### Where errors or malicious instructions can enter

An analyst can omit a denial case; an implementer can broaden permissions to make a test pass; a reviewer can rely on the implementer's summary; an integration agent can overwrite one spec version with another. Untrusted repository text or a letter can also masquerade as an instruction during any handoff.

The SQL schema-permission collision recorded in the contact packet illustrates a concrete risk: a local implementation initially affected an existing HR private schema. Database regression tests exposed it, and the new helpers were isolated in a separate private schema. A specialised label did not prevent the mistake; observable checks and review did.

My mitigation is to compare handoffs with original requirements and actual diffs, keep uncertainty visible and require explicit human decisions for changed scope. Independent agents can repeat the same mistake if they all trust the same incomplete summary, so diversity of evidence is more useful than simply increasing agent count.

### Evidence a person should be able to verify

Each execution should leave bounded task ownership, actual identity/tool details when known, changed files/commits, exact checks and outputs, findings with severity/fix/recheck, and honest limits. Final records should link the canonical sync, complete archive and dated summaries. A PR then carries that evidence into repository review; it does not establish merge or deployment.

I would improve our evidence by making logs shorter and easier to navigate, ensuring student verification actually happens, and maintaining a clear hosted smoke-test/release checklist. The aim is for another person to reproduce or challenge a claim without trusting the agent’s confidence.
