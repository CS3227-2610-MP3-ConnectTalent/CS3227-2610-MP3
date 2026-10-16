# Deployment and operations delta

## ADDED OPS-004: Reproducible AI security and quality evaluation

The project MUST maintain a versioned synthetic evaluation corpus covering both AI features, benign controls, direct/indirect prompt injection and relevant authorization, output, resource and human-control failures. Every case MUST identify its feature/input surface, attack category, expected checks or human rubric, and limitations. Offline CI evaluations MUST make no live provider calls, even if credentials happen to be present, and MUST distinguish application contract results from model-behavior evidence.

Live evaluation MUST be explicitly enabled by a human for a named model/target/dataset and bounded total/rate budget. This change's proposed comparison is limited to `llama3.1:8b` at the configured SoCLaaS gateway, 12 synthetic cases across two prompt variants, at most 24 sequential completion calls at six/minute, 20-second deadlines, no retry, and stop on throttling/configuration failure. It MUST use no real applicant records, hosted app endpoint or database credential. Automatic CI/live provider fallback is forbidden.

Reports MUST distinguish structural/ID correctness, attack/fabrication indicators and human semantic review; they MUST NOT accept a model-supplied pass/approval verdict. Unreviewed quality results remain pending. Committed/CI reports MUST contain only schema-validated case/version/category/variant/check/timing/safe-error metadata, without raw prompts, outputs, private records or secrets. Optional raw synthetic review files MUST remain local ignored artifacts. Failed, blocked and skipped runs MUST remain visible and cannot be reported as successful model resistance. A small live comparison MUST NOT be described as statistical proof of safety or factual accuracy.

Scenario: Given an ordinary CI run with synthetic fixtures, when evaluations execute, then no network model call occurs and a metadata-only contract report is produced. A deliberately forged model verdict cannot mark a failed case passed.

Denial/failure scenario: Given missing authorization, an unapproved target, quota/throttling, unsafe configuration, malformed provider content, a failed case or incomplete human rubric, when evaluating, then the runner stops or records the real failure/review state without disclosing raw sensitive content or granting release acceptance.
