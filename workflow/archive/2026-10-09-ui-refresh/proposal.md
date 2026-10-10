# Proposal: careers and role workflow UI refresh

- Issue: [#42](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/42).
- Owner: Paul Cheng; 2026-10-09; status implemented/reviewed locally; accepted with recorded limits on2026-10-09.
- Baseline: current branch `feat/application-form-details`, `1667f2b`, canonical v1.3; PR #41 contains required contact/signup work.
- Classification: presentation refresh of existing functionality; no new product policy, data fields or canonical behavior delta. Preserve JOB-001–003, ACC-001–005, APP-001–005, JMG and SEC boundaries.

## Intent and scope

Use Paul's supplied job-board screenshot as visual inspiration, not copied assets/branding. Improve public listings/detail, auth pages, Applicant list/detail/form and HR job/review screens. Preserve one employer per deployment, neutral Careers branding and simple separate role interfaces. Reuse existing shadcn/ui primitives and focused visual wrappers when they have genuinely shared ownership.

Goals: dark account header; softly tinted background; pastel category accents; responsive category sidebar and cards; consistent typography, spacing, borders, form controls, status/error/empty states and clear primary actions. Existing filter URLs and job/application workflows remain unchanged.

Non-goals: salary, location, work-type filters; bookmarks; fabricated metrics or employer logos; new AI features; schema/auth/SMTP/deployment changes; company-name selection; product scope expansion. Do not introduce controls for unsupported functionality.

## Acceptance criteria

- UI-AC-01: Public listing exposes only actual published jobs/counts; category links preserve existing filtering; card detail links work; draft/closed jobs remain absent.
- UI-AC-02: At mobile 390px and desktop 1440px, pages are readable without horizontal overflow; sidebar stacks and card columns adapt; long titles/URLs do not break layout.
- UI-AC-03: Guest, Applicant and HR account controls remain distinct; signed-in users retain Sign out; public actions remain role-appropriate and server authorization unchanged.
- UI-AC-04: Auth/application/HR forms retain explicit labels, visible keyboard focus, readable contrast, validation/loading/disabled feedback and persistence semantics. Applicant submission and HR status actions remain separate human controls.
- UI-AC-05: Local screenshots and existing public-listing, navigation, application-details and HR workflow browser checks demonstrate unchanged behavior. Independent review inspects changes and evidence; separate student acceptance required.

## Decisions and dependencies

Keep the sample's visual rhythm while using existing product data and actions. Original CSS/layout avoids needing image assets or external downloads. PR #41 is a baseline dependency; new branch authorisation is pending. If unmerged, create an explicitly approved stacked branch from its current head and record dependency; if merged, branch from updated develop. Use [design](design.md), [plan](plan.md), [tasks](tasks.md), [record](record.md).

Paul approved the named proposal/design/plan on2026-10-09 before implementation. Separate acceptance with recorded limits received on2026-10-09; see record.md. This packet authorises no commit, push, PR or hosted operation. Canonical sync is N/A unless implementation reveals a genuine behavioral change, which returns to approval.
