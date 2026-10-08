# Design: Supabase agent skills and shadcn registry

- Change ID/issues: `2026-10-08-supabase-agent-skills-registry`; [#23](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/23)
- Owner/status/date: Issue unassigned; retrospective evidence packet / 2026-10-08
- Inputs: `proposal.md`; no capability delta; ProductSpec v0.7
- Scope and affected components/files: Vendored developer guidance, skills lock metadata, shadcn registry mapping, associated lockfile update.

## Decisions and alternatives

| Decision | Considered alternatives | Reason and tradeoffs | Human approval reference |
| --- | --- | --- | --- |
| Keep the two requested Supabase skills under `.agents/skills/` and track their upstream source/hash in `skills-lock.json`. | Refer contributors to remote instructions only. | Repository copies provide local agent guidance; upstream refreshes require a deliberate update. | Original direct setup request, 2026-10-07. |
| Add the `@supabase` registry URL in `components.json`. | Use full registry URLs for every add operation or omit the registry. | The alias is the shadcn registry convention and does not install anything until a command is run. | Original direct setup request, 2026-10-07. |
| Preserve upstream skill files byte-for-byte during closeout. | Trim one imported trailing whitespace occurrence. | Avoid changing vendored content or invalidating recorded hash metadata; the warning is isolated and documented. | Closeout disposition, 2026-10-08. |

## Interfaces and data flow

Coding tools read the local skills as guidance. The shadcn CLI reads `components.json` and maps the `@supabase` alias to the configured Supabase registry. No runtime request, database operation, applicant data, credential, or hosted Supabase project is involved in this configuration.

## Authorization and privacy impact

No application authorization or privacy behavior changes. Skills are developer-facing text. No secret values are needed or included. The lockfile update is dependency metadata only; no production deployment target is affected.

## Failure behavior

| Failure / adversarial input | Observable outcome / state guarantees | Verification |
| --- | --- | --- |
| Registry URL or JSON syntax is invalid | shadcn registry configuration cannot be read; no app runtime behavior changes. | Parse `components.json` and inspect the mapping. |
| Skill files drift from lock metadata | Skills update tooling may report a mismatch or update unexpectedly. | Inspect source metadata and hashes; preserve imported bytes. |

## Migration and backward compatibility

No app, schema, data, API, or user-session migration. This only affects contributor tooling configuration.

## Rollout and rollback

No runtime rollout. Rollback removes the registry mapping, skill files, lock metadata, and associated dependency-lock changes in the original setup commit.

## Review and unresolved decisions

- [x] No product interface, authorization, migration, or runtime behavior is introduced.
- Findings/owner/resolution: One upstream trailing-whitespace line is preserved and documented; issue owner remains unassigned.
- Human approval: Original user setup request (2026-10-07); archive/PR authorization (2026-10-08). User identity/role is not independently recorded.
