# Legacy and process evidence records

This directory holds evidence that predates dated change packets and lightweight process records. New product changes use [active change packets](../changes/README.md) and their record.md; accepted packets follow [sync-before-archive rules](../archive/README.md).

| Record | Scope and actual state |
| --- | --- |
| [Browse Job Listings](BrowseJobListings.md) | Historical ProductSpec v0.6 implementation/check evidence; independent review and human sign-off pending; not deployed |
| [SDD Multi-Agent Workflow setup](SDD-Multi-Agent-Workflow.md) | Current process/documentation setup; approved design/plan, implementation and review progressing; no product behavior or capability delta |

Preserve legacy content, source version, status, exact commands/counts/results, failures, limitations and pending decisions. Repair only navigation broken by a move. The historical ProductSpec v0.6 clauses now map to [canonical source trace](../specs/README.md); a stable ProductSpec link resolves to the current index, not an unchanged copy of the original prose. Do not retrofit stable IDs or claim historical independent review in the old record. Link subsequent evidence separately, retaining the original context.

Use the expanded [feature-record template](../templates/FeatureRecordTemplate.md) for process records; explain N/A product criteria/deltas, and distinguish document checks from app tests, deployment or student acceptance. List actual approvals, agent/tool handoffs, every session log and missing evidence. Never edit dated logs merely to modernize past paths, invent runs or fill unresolved student ownership assignments.
