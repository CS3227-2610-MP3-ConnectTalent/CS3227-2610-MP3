# Tasks: signup password usability (#20)

- [x] #20 created with the exact issue body; it was created after implementation, and the process deviation is recorded.
- [x] Existing ACC-001 boundary and proposed delta documented. Pre-implementation packet approval did not occur.
- [x] Local source and tests implemented. The first client test attempt was blocked by `spawn EPERM`; the focused server action test failed on the old signature then passed.
- [x] Full local browser (7), unit (30), lint, typecheck and build checks passed.
- [x] Separate read-only reviewer inspected the final diff, reported the no-JavaScript gap, and rechecked its correction. See [handoff](handoffs/independent-review.md).
- [ ] Student owner separately accepts/rejects #20 after reviewing evidence and deviation.
- [ ] On acceptance, sync the proposed ACC-001 delta to canonical specs and archive the packet; update logs/record for the final path.
- [ ] PR to `develop`, hosted migration/preview smoke, merge and release remain separate.
