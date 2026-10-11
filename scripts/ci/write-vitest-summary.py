import json
import os
import xml.etree.ElementTree as ElementTree
from pathlib import Path


def read_test_counts(report_path):
    if not report_path.exists():
        return None

    root = ElementTree.parse(report_path).getroot()
    suites = [root] if root.tag == "testsuite" else root.findall(".//testsuite")
    return {
        name: sum(int(suite.attrib.get(name, 0)) for suite in suites)
        for name in ("tests", "failures", "errors", "skipped")
    }


def read_line_coverage(summary_path):
    if not summary_path.exists():
        return None

    summary = json.loads(summary_path.read_text(encoding="utf-8"))
    return summary.get("total", {}).get("lines", {}).get("pct")


test_counts = read_test_counts(Path("test-results/vitest-junit.xml"))
line_coverage = read_line_coverage(Path("coverage/coverage-summary.json"))
lines = ["## Vitest unit test results"]

if test_counts is None:
    lines.append("JUnit results were not produced (the test command may have failed before reporting).")
else:
    lines.append(
        "| Tests | Failures | Errors | Skipped |\n"
        "| ---: | ---: | ---: | ---: |\n"
        f"| {test_counts['tests']} | {test_counts['failures']} | "
        f"{test_counts['errors']} | {test_counts['skipped']} |"
    )

if line_coverage is None:
    lines.append("Line coverage was not produced.")
else:
    lines.append(f"Line coverage: **{line_coverage:.2f}%** (report only; no threshold).")

lines.append("Download the `vitest-reports` artifact for JUnit XML, HTML, lcov and JSON reports.")
summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
if summary_path:
    with Path(summary_path).open("a", encoding="utf-8") as summary_file:
        summary_file.write("\n".join(lines) + "\n")
else:
    print("\n".join(lines))
