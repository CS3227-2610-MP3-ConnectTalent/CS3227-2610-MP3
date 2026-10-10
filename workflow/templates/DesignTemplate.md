# Design: <short name>

Copy to `workflow/changes/<YYYY-MM-DD-short-name>/design.md` when architecture, authorization, schema, AI boundaries, integrations, risk, or multiple modules warrant a design. For narrow work, record the reason for omission in proposal.md and record.md instead.

- Change ID/issues: <date-name; #numbers and URLs>
- Owner/status/date: <student; draft / approved / pending; YYYY-MM-DD>
- Inputs: <proposal.md; per-capability deltas; baseline version and exact IDs>
- Scope and affected components/files: <allowed edits and component responsibilities>

## Decisions and alternatives

| Decision          | Considered alternatives               | Reason and tradeoffs           | Human approval reference   |
| ----------------- | ------------------------------------- | ------------------------------ | -------------------------- |
| <chosen approach> | <options, including current approach> | <evidence, constraints, risks> | <decision/date or pending> |

## Interfaces and data flow

<Trace actor → UI/API → authorization → database/service/AI → response. Identify inputs, validation, contracts, outputs, storage and trust boundaries. Link affected canonical IDs rather than copying unrelated requirements.>

## Authorization and privacy impact

<Who may act/read/write? Which checks run before data loads or external calls? What data crosses boundaries, is retained, logged, or redacted? Include denial cases and affected SEC IDs, or N/A with reason.>

## Failure behavior

| Failure / adversarial input                                                    | Observable outcome / state guarantees           | Verification                 |
| ------------------------------------------------------------------------------ | ----------------------------------------------- | ---------------------------- |
| <timeout, quota, invalid input, partial write, unauthorized actor as relevant> | <error handling, retry/idempotency, safe state> | <acceptance ID and evidence> |

## Migration and backward compatibility

<Schema/config/API compatibility, existing data, migration order and validation, dependencies; N/A with reason where absent.>

## Rollout and rollback

<Release prerequisites, owner, deployment order, monitoring, rollback trigger, exact recovery approach and data limitations; N/A with reason for documentation-only work.>

## Review and unresolved decisions

- [ ] Interfaces and requirement IDs agree with the deltas and proposal.
- [ ] Security, failure, migration, rollout and rollback impacts assessed or justified N/A.
- Findings/owner/resolution: <actual findings, evidence and outstanding questions>
- Human approval: <name, decision, date and source; pending until recorded>
