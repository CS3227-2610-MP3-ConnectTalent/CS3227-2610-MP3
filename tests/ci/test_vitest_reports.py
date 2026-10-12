import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

from scripts.ci.vitest_reports import (
    MAX_JUNIT_BYTES,
    ReportError,
    read_coverage_metrics,
    read_test_counts,
    render_markdown,
)


class VitestReportsTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        self.root = Path(self.temp_dir.name)

    def write(self, name, content):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def test_reads_suite_counts_from_testsuites_root(self):
        path = self.write(
            "junit.xml",
            '<testsuites tests="4" failures="1" errors="1" skipped="1">'
            '<testsuite tests="2" failures="1" errors="0" skipped="0">'
            '<testcase><failure /></testcase><testcase /></testsuite>'
            '<testsuite tests="2" failures="0" errors="1" skipped="1">'
            '<testcase><error /></testcase><testcase><skipped /></testcase>'
            "</testsuite>"
            "</testsuites>",
        )

        self.assertEqual(
            read_test_counts(path),
            {"tests": 4, "failures": 1, "errors": 1, "skipped": 1},
        )

    def test_reads_suite_counts_from_testsuite_root(self):
        path = self.write(
            "junit.xml",
            '<testsuite tests="4" failures="1" errors="0" skipped="2">'
            '<testcase><failure /></testcase><testcase><skipped /></testcase>'
            '<testcase><skipped /></testcase><testcase />'
            "</testsuite>",
        )

        self.assertEqual(
            read_test_counts(path),
            {"tests": 4, "failures": 1, "errors": 0, "skipped": 2},
        )

    def test_missing_junit_is_unavailable(self):
        self.assertIsNone(read_test_counts(self.root / "missing.xml"))

    def test_rejects_empty_malformed_and_unexpected_junit(self):
        for content in ("", "<testsuite", "<report />"):
            with self.subTest(content=content):
                path = self.write("junit.xml", content)
                with self.assertRaises(ReportError):
                    read_test_counts(path)

    def test_rejects_dtd_and_entity_declarations(self):
        payloads = (
            '<!DOCTYPE testsuite [<!ENTITY x "expanded">]>'
            '<testsuite tests="1" failures="0" errors="0" skipped="0">'
            "&x;</testsuite>",
            '<!ENTITY x SYSTEM "file:///secret">'
            '<testsuite tests="1" failures="0" errors="0" skipped="0" />',
        )
        for content in payloads:
            with self.subTest(content=content):
                path = self.write("junit.xml", content)
                with self.assertRaises(ReportError):
                    read_test_counts(path)

    def test_rejects_oversized_report_files(self):
        junit = self.root / "large.xml"
        junit.write_bytes(b" " * (5 * 1024 * 1024 + 1))
        coverage = self.root / "large.json"
        coverage.write_bytes(b" " * (2 * 1024 * 1024 + 1))
        with self.assertRaises(ReportError):
            read_test_counts(junit)
        with self.assertRaises(ReportError):
            read_coverage_metrics(coverage)

    def test_oversized_report_read_is_limited_to_cap_plus_one_byte(self):
        report = self.root / "large.xml"
        report.touch()
        file_handle = MagicMock()
        file_handle.__enter__.return_value = file_handle
        file_handle.read.return_value = b" " * (MAX_JUNIT_BYTES + 1)

        with patch.object(Path, "open", return_value=file_handle):
            with self.assertRaises(ReportError):
                read_test_counts(report)

        file_handle.read.assert_called_once_with(MAX_JUNIT_BYTES + 1)

    def test_rejects_invalid_or_inconsistent_junit_counts(self):
        for attrs in (
            'tests="-1" failures="0" errors="0" skipped="0"',
            'tests="1" failures="1" errors="1" skipped="0"',
            'tests="one" failures="0" errors="0" skipped="0"',
        ):
            with self.subTest(attrs=attrs):
                path = self.write("junit.xml", f"<testsuite {attrs} />")
                with self.assertRaises(ReportError):
                    read_test_counts(path)

    def test_rejects_declared_junit_counts_that_contradict_test_cases(self):
        path = self.write(
            "junit.xml",
            '<testsuite tests="1" failures="0">'
            "<testcase><failure /></testcase>"
            "</testsuite>",
        )

        with self.assertRaises(ReportError):
            read_test_counts(path)

    def test_rejects_testsuites_aggregate_counts_that_contradict_child_suites(self):
        path = self.write(
            "junit.xml",
            '<testsuites tests="1" failures="0">'
            '<testsuite tests="1" failures="1">'
            "<testcase><failure /></testcase>"
            "</testsuite></testsuites>",
        )

        with self.assertRaises(ReportError):
            read_test_counts(path)

    def test_reads_all_four_finite_coverage_metrics(self):
        summary = {
            "total": {
                "lines": {"total": 1618, "covered": 1534, "pct": 94.8},
                "statements": {"total": 1784, "covered": 1675, "pct": 93.89},
                "branches": {"total": 1367, "covered": 1231, "pct": 90.05},
                "functions": {"total": 485, "covered": 459, "pct": 94.63},
            }
        }
        path = self.write("coverage-summary.json", json.dumps(summary))

        self.assertEqual(
            read_coverage_metrics(path),
            {"lines": 94.8, "statements": 93.89, "branches": 90.05, "functions": 94.63},
        )

    def test_missing_coverage_is_unavailable(self):
        self.assertIsNone(read_coverage_metrics(self.root / "missing.json"))

    def test_rejects_malformed_or_unexpected_coverage_json(self):
        for content in ("{", "[]", '{"total": {}}'):
            with self.subTest(content=content):
                path = self.write("coverage.json", content)
                with self.assertRaises(ReportError):
                    read_coverage_metrics(path)

    def test_rejects_non_finite_and_out_of_range_coverage(self):
        for percentage in ("NaN", "Infinity", -0.01, 100.01, None):
            with self.subTest(percentage=percentage):
                value = json.dumps(percentage) if isinstance(percentage, str) else percentage
                summary = {
                    "total": {
                        metric: {"total": 10, "covered": 9, "pct": 90}
                        for metric in ("lines", "statements", "branches", "functions")
                    }
                }
                summary["total"]["branches"]["pct"] = value
                path = self.write("coverage.json", json.dumps(summary))
                with self.assertRaises(ReportError):
                    read_coverage_metrics(path)

    def test_rejects_coverage_metrics_with_invalid_counts_or_mismatched_percentages(self):
        invalid_metrics = (
            {"total": 100, "covered": 0, "pct": 100},
            {"total": 10, "covered": 11, "pct": 100},
            {"total": -1, "covered": 0, "pct": 0},
            {"total": 10, "covered": True, "pct": 100},
            {"total": 3, "covered": 1, "pct": 50},
        )
        for invalid_metric in invalid_metrics:
            with self.subTest(metric=invalid_metric):
                summary = {
                    "total": {
                        metric: {"total": 10, "covered": 9, "pct": 90}
                        for metric in ("lines", "statements", "branches", "functions")
                    }
                }
                summary["total"]["lines"] = invalid_metric
                path = self.write("coverage.json", json.dumps(summary))
                with self.assertRaises(ReportError):
                    read_coverage_metrics(path)

    def test_render_marks_target_boundary_and_never_calls_failed_runs_successful(self):
        markdown = render_markdown(
            {"tests": 3, "failures": 1, "errors": 0, "skipped": 1},
            {"lines": 90, "statements": 89.99, "branches": 90, "functions": 100},
            "failure",
            "https://github.com/org/repo/actions/runs/10",
        )

        self.assertIn("| 3 | 1 | 1 | 0 | 1 |", markdown)
        self.assertIn("Lines | 90.00% | Meets target", markdown)
        self.assertIn("Statements | 89.99% | Below target", markdown)
        self.assertIn("report only", markdown.lower())
        self.assertIn("artifacts supplied by this PR's CI run", markdown)
        self.assertIn("not independently attested", markdown)
        self.assertIn("90%", markdown)
        self.assertIn("failure", markdown.lower())

    def test_render_shows_unavailable_instead_of_false_green(self):
        markdown = render_markdown(
            None,
            None,
            "failure",
            "https://github.com/org/repo/actions/runs/11",
        )

        self.assertIn("unavailable", markdown.lower())
        self.assertNotIn("0 failed", markdown)
        self.assertNotIn("Meets target", markdown)


if __name__ == "__main__":
    unittest.main()
