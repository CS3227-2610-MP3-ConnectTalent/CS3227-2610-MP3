import os
from pathlib import Path

if __package__:
    from .vitest_reports import (
        ReportError,
        read_coverage_metrics,
        read_test_counts,
        render_markdown,
    )
else:
    from vitest_reports import (
        ReportError,
        read_coverage_metrics,
        read_test_counts,
        render_markdown,
    )


def _read_report(reader, path):
    try:
        return reader(path), False
    except ReportError:
        return None, True


test_counts, test_report_error = _read_report(
    read_test_counts, Path("test-results/vitest-junit.xml")
)
coverage_metrics, coverage_report_error = _read_report(
    read_coverage_metrics, Path("coverage/coverage-summary.json")
)
run_url = ""
server_url = os.environ.get("GITHUB_SERVER_URL", "https://github.com").rstrip("/")
repository = os.environ.get("GITHUB_REPOSITORY", "")
run_id = os.environ.get("GITHUB_RUN_ID", "")
if server_url == "https://github.com" and repository and run_id.isdigit():
    run_url = f"{server_url}/{repository}/actions/runs/{run_id}"

markdown = render_markdown(
    test_counts,
    coverage_metrics,
    os.environ.get("WORKFLOW_STATUS", "unknown"),
    run_url,
    test_report_error,
    coverage_report_error,
)
summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
if summary_path:
    with Path(summary_path).open("a", encoding="utf-8") as summary_file:
        summary_file.write(markdown + "\n")
else:
    print(markdown)
