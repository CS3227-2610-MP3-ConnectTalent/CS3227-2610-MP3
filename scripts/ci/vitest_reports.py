"""Bounded parsers and Markdown rendering for untrusted Vitest artifacts."""

import json
import math
import re
import xml.etree.ElementTree as ElementTree
from pathlib import Path


MAX_JUNIT_BYTES = 5 * 1024 * 1024
MAX_COVERAGE_BYTES = 2 * 1024 * 1024
MAX_TEST_COUNT = 10_000_000
COVERAGE_TARGET = 90.0
METRICS = ("lines", "statements", "branches", "functions")


class ReportError(ValueError):
    """Raised when a test report is malformed or outside the accepted schema."""


def _read_bounded(path, maximum):
    report_path = Path(path)
    try:
        with report_path.open("rb") as report_file:
            raw = report_file.read(maximum + 1)
    except FileNotFoundError:
        return None
    except OSError as error:
        raise ReportError("report file could not be read") from error
    if len(raw) > maximum:
        raise ReportError("report file exceeds the size limit")
    return raw


def _count(value, name):
    if isinstance(value, bool) or not isinstance(value, int):
        raise ReportError(f"JUnit {name} count must be an integer")
    if value < 0 or value > MAX_TEST_COUNT:
        raise ReportError(f"JUnit {name} count is outside the accepted range")
    return value


def _suite_count(suite, name, derived):
    if name not in suite.attrib:
        return derived
    raw_value = suite.attrib[name]
    if not re.fullmatch(r"[0-9]{1,8}", raw_value):
        raise ReportError(f"JUnit {name} count must be a non-negative integer")
    count = _count(int(raw_value), name)
    if count != derived:
        raise ReportError(f"JUnit {name} count does not match its test cases")
    return count


def _suite_counts(suite):
    cases = suite.findall("testcase")
    derived = {
        "tests": len(cases),
        "failures": sum(bool(case.findall("failure")) for case in cases),
        "errors": sum(bool(case.findall("error")) for case in cases),
        "skipped": sum(bool(case.findall("skipped")) for case in cases),
    }
    counts = {
        name: _suite_count(suite, name, derived[name])
        for name in ("tests", "failures", "errors", "skipped")
    }
    if counts["failures"] + counts["errors"] + counts["skipped"] > counts["tests"]:
        raise ReportError("JUnit result counts exceed the test count")
    return counts


def read_test_counts(report_path):
    """Return aggregate JUnit counts, None if absent, or raise ReportError."""
    raw = _read_bounded(report_path, MAX_JUNIT_BYTES)
    if raw is None:
        return None
    try:
        xml_text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as error:
        raise ReportError("JUnit XML must use UTF-8 encoding") from error
    if re.search(r"<!\s*(?:DOCTYPE|ENTITY)\b", xml_text, re.IGNORECASE):
        raise ReportError("JUnit DTD and entity declarations are not accepted")
    try:
        root = ElementTree.fromstring(xml_text)
    except (ElementTree.ParseError, ValueError) as error:
        raise ReportError("JUnit XML is malformed") from error

    if root.tag == "testsuite":
        suites = [root]
    elif root.tag == "testsuites":
        if any(child.tag != "testsuite" for child in root):
            raise ReportError("JUnit XML contains an unexpected element")
        suites = list(root)
    else:
        raise ReportError("JUnit XML has an unexpected root element")
    if not suites:
        raise ReportError("JUnit XML contains no test suites")

    totals = {name: 0 for name in ("tests", "failures", "errors", "skipped")}
    for suite in suites:
        # Nested suites and foreign data are not emitted by Vitest and make
        # aggregate counts ambiguous, so fail closed instead of double-counting.
        if any(
            child.tag not in {"testcase", "properties", "system-out", "system-err"}
            for child in suite
        ):
            raise ReportError("JUnit suite contains an unexpected structure")
        counts = _suite_counts(suite)
        for name, count in counts.items():
            totals[name] += count
            if totals[name] > MAX_TEST_COUNT:
                raise ReportError("aggregate JUnit counts exceed the accepted range")
    if root.tag == "testsuites":
        for name, count in totals.items():
            _suite_count(root, name, count)
    return totals


def _reject_json_constants(value):
    raise ReportError(f"coverage JSON contains unsupported value {value}")


def read_coverage_metrics(summary_path):
    """Return all four global coverage percentages or None if absent."""
    raw = _read_bounded(summary_path, MAX_COVERAGE_BYTES)
    if raw is None:
        return None
    try:
        summary = json.loads(
            raw.decode("utf-8"),
            parse_constant=_reject_json_constants,
        )
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise ReportError("coverage JSON is malformed") from error
    if not isinstance(summary, dict) or not isinstance(summary.get("total"), dict):
        raise ReportError("coverage JSON has an unexpected structure")

    metrics = {}
    for name in METRICS:
        item = summary["total"].get(name)
        if not isinstance(item, dict):
            raise ReportError(f"coverage JSON is missing {name}")
        total = item.get("total")
        covered = item.get("covered")
        for field, value in (("total", total), ("covered", covered)):
            if isinstance(value, bool) or not isinstance(value, int) or value < 0:
                raise ReportError(f"coverage {name} {field} count must be a non-negative integer")
        if covered > total:
            raise ReportError(f"coverage {name} covered count exceeds its total")
        percentage = item.get("pct")
        if isinstance(percentage, bool) or not isinstance(percentage, (int, float)):
            raise ReportError(f"coverage {name} percentage must be numeric")
        percentage = float(percentage)
        if not math.isfinite(percentage) or not 0 <= percentage <= 100:
            raise ReportError(f"coverage {name} percentage is outside 0–100")
        # Istanbul's summary reporter truncates percentages to two decimals.
        expected = 100.0 if total == 0 else (covered * 10_000 // total) / 100
        if percentage != expected:
            raise ReportError(f"coverage {name} percentage does not match its counts")
        metrics[name] = percentage
    return metrics


def _safe_run_link(run_url):
    if not isinstance(run_url, str) or not re.fullmatch(
        r"https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+/actions/runs/[0-9]+",
        run_url,
    ):
        return ""
    return f"[View workflow run]({run_url})"


def render_markdown(
    test_counts,
    coverage_metrics,
    workflow_status,
    run_url="",
    test_report_error=False,
    coverage_report_error=False,
):
    """Render a report without embedding values from artifact markup."""
    status = (
        workflow_status
        if isinstance(workflow_status, str)
        and re.fullmatch(r"[a-z_]{1,32}", workflow_status)
        else "unknown"
    )
    lines = ["## Unit test and coverage report", f"**Workflow result:** `{status}`"]
    lines.append(
        "Report source: test counts and coverage are from artifacts supplied by this "
        "PR's CI run; they are not independently attested."
    )
    link = _safe_run_link(run_url)
    if link:
        lines.append(link)

    if test_counts is None:
        state = "Invalid or rejected" if test_report_error else "Unavailable"
        lines.append(f"JUnit test results: **{state}**.")
    else:
        passed = max(
            test_counts["tests"]
            - test_counts["failures"]
            - test_counts["errors"]
            - test_counts["skipped"],
            0,
        )
        lines.extend(
            [
                "| Tests | Passed | Failed | Errors | Skipped |",
                "| ---: | ---: | ---: | ---: | ---: |",
                f"| {test_counts['tests']} | {passed} | {test_counts['failures']} | "
                f"{test_counts['errors']} | {test_counts['skipped']} |",
            ]
        )

    lines.append("Coverage target: **90% for each metric; report only, no CI threshold.**")
    if coverage_metrics is None:
        state = "Invalid or rejected" if coverage_report_error else "Unavailable"
        lines.append(f"Coverage results: **{state}**.")
    else:
        labels = {"lines": "Lines", "statements": "Statements", "branches": "Branches", "functions": "Functions"}
        lines.extend(
            [
                "| Metric | Coverage | Target status |",
                "| --- | ---: | --- |",
            ]
        )
        for name in METRICS:
            percentage = coverage_metrics[name]
            target_status = "Meets target" if percentage >= COVERAGE_TARGET else "Below target"
            lines.append(f"| {labels[name]} | {percentage:.2f}% | {target_status} |")

    if status != "success":
        lines.append("The workflow did not complete successfully; this report does not indicate a passing test run.")
    return "\n".join(lines)
