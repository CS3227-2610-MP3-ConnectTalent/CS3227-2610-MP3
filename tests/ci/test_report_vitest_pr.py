import json
import os
import tempfile
import unittest
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from unittest.mock import Mock

from scripts.ci.report_vitest_pr import (
    GitHubApi,
    GitHubApiError,
    associated_pull_request,
    main,
    make_comment_body,
    pull_request_is_current,
    report_is_newer,
    upsert_report_comment,
)


REPOSITORY = "org/repo"


def workflow_run(**updates):
    event = {
        "name": "CI",
        "path": ".github/workflows/ci.yml@refs/pull/58/merge",
        "event": "pull_request",
        "head_branch": "feature-branch",
        "id": 100,
        "run_attempt": 1,
        "created_at": "2026-10-11T03:00:00Z",
        "head_sha": "a" * 40,
        "head_repository": {"full_name": REPOSITORY},
        "repository": {"full_name": REPOSITORY},
        "pull_requests": [{"number": 58}],
    }
    event.update(updates)
    return event


def pull_request(**updates):
    pr = {
        "number": 58,
        "state": "open",
        "base": {"ref": "develop", "repo": {"full_name": REPOSITORY}},
        "head": {
            "ref": "feature-branch",
            "sha": "a" * 40,
            "repo": {"full_name": REPOSITORY},
        },
    }
    pr.update(updates)
    return pr


def run_metadata(**updates):
    metadata = {
        "run_id": 100,
        "run_attempt": 1,
        "run_created_at": "2026-10-11T03:00:00Z",
        "head_sha": "a" * 40,
    }
    metadata.update(updates)
    return metadata


class FakeApi:
    def __init__(self, comments=None, pull_requests=None):
        self.comments = list(comments or [])
        self.pull_requests = list(pull_requests or [pull_request()])
        self.created = []
        self.updated = []
        self.lookup = None
        self.pull_request_reads = 0

    def list_pull_requests_for_head(self, head_repository, head_branch):
        self.lookup = (head_repository, head_branch)
        return self.pull_requests

    def get_pull_request(self, number):
        self.pull_request_reads += 1
        return next(
            (candidate for candidate in self.pull_requests if candidate.get("number") == number),
            {},
        )

    def list_issue_comments(self, issue_number):
        self.issue_number = issue_number
        return self.comments

    def create_issue_comment(self, issue_number, body):
        comment = {"id": 501, "body": body, "user": {"login": "github-actions[bot]"}}
        self.created.append((issue_number, body))
        self.comments.append(comment)
        return comment

    def update_issue_comment(self, comment_id, body):
        self.updated.append((comment_id, body))
        for comment in self.comments:
            if comment["id"] == comment_id:
                comment["body"] = body
        return {"id": comment_id, "body": body}


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload
        self.headers = {}

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


class ReportVitestPullRequestTests(unittest.TestCase):
    def test_accepts_one_associated_pull_request_from_same_repo_or_fork(self):
        self.assertEqual(associated_pull_request(workflow_run(), REPOSITORY), 58)
        fork_run = workflow_run(head_repository={"full_name": "contributor/repo"})
        fork_pr = pull_request(
            head={"sha": "a" * 40, "repo": {"full_name": "contributor/repo"}}
        )
        self.assertEqual(associated_pull_request(fork_run, REPOSITORY), 58)
        self.assertTrue(pull_request_is_current(fork_run, fork_pr, REPOSITORY))

    def test_rejects_non_pull_request_workflow_and_wrong_workflow(self):
        self.assertIsNone(associated_pull_request(workflow_run(event="push"), REPOSITORY))
        self.assertIsNone(associated_pull_request(workflow_run(name="Other"), REPOSITORY))
        self.assertIsNone(
            associated_pull_request(
                workflow_run(path=".github/workflows/fake-ci.yml@refs/pull/58/merge"),
                REPOSITORY,
            )
        )

    def test_rejects_missing_ambiguous_or_wrong_repository_associations(self):
        self.assertIsNone(associated_pull_request(workflow_run(pull_requests=[]), REPOSITORY))
        self.assertIsNone(
            associated_pull_request(
                workflow_run(pull_requests=[{"number": 58}, {"number": 59}]), REPOSITORY
            )
        )
        self.assertIsNone(
            associated_pull_request(
                workflow_run(repository={"full_name": "someone/else"}), REPOSITORY
            )
        )

    def test_finds_current_pr_when_workflow_run_omits_associations(self):
        run = workflow_run(pull_requests=[])

        self.assertEqual(
            associated_pull_request(run, REPOSITORY, [pull_request()]),
            58,
        )
        self.assertIsNone(
            associated_pull_request(
                run,
                REPOSITORY,
                [pull_request(head={"ref": "feature-branch", "sha": "b" * 40, "repo": {"full_name": REPOSITORY}})],
            )
        )
        self.assertIsNone(
            associated_pull_request(
                run,
                REPOSITORY,
                [pull_request(), pull_request(number=59)],
            )
        )

    def test_main_reports_current_pr_from_realistic_empty_association_payload(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            event_path = root / "event.json"
            run = workflow_run(
                path=".github/workflows/ci.yml",
                pull_requests=[],
                html_url="https://github.com/org/repo/actions/runs/100",
                conclusion="success",
            )
            event_path.write_text(
                json.dumps({"workflow_run": run}), encoding="utf-8"
            )
            report_root = root / "reports"
            (report_root / "test-results").mkdir(parents=True)
            (report_root / "coverage").mkdir()
            (report_root / "test-results" / "vitest-junit.xml").write_text(
                '<testsuite tests="1" failures="0" errors="0" skipped="0" />',
                encoding="utf-8",
            )
            (report_root / "coverage" / "coverage-summary.json").write_text(
                json.dumps(
                    {
                        "total": {
                            metric: {"total": 10, "covered": 9, "pct": 90}
                            for metric in ("lines", "statements", "branches", "functions")
                        }
                    }
                ),
                encoding="utf-8",
            )
            summary_path = root / "summary.md"
            api = FakeApi()
            environment = {
                "GITHUB_EVENT_PATH": str(event_path),
                "GITHUB_REPOSITORY": REPOSITORY,
                "GITHUB_TOKEN": "synthetic-token",
                "GITHUB_API_URL": "https://api.github.com",
                "VITEST_REPORT_PATH": str(report_root),
                "GITHUB_STEP_SUMMARY": str(summary_path),
            }

            with unittest.mock.patch.dict(os.environ, environment):
                with unittest.mock.patch(
                    "scripts.ci.report_vitest_pr.GitHubApi", return_value=api
                ):
                    result = main()

            self.assertEqual(result, 0)
            self.assertEqual(api.lookup, (REPOSITORY, "feature-branch"))
            self.assertEqual(len(api.created), 1)
            self.assertIn("90%", api.created[0][1])
            self.assertIn("Workflow result", summary_path.read_text(encoding="utf-8"))

    def test_accepts_only_open_supported_base_with_the_current_workflow_head(self):
        run = workflow_run()
        self.assertTrue(pull_request_is_current(run, pull_request(), REPOSITORY))
        cases = (
            pull_request(state="closed"),
            pull_request(base={"ref": "feature"}),
            pull_request(head={"sha": "b" * 40, "repo": {"full_name": REPOSITORY}}),
            pull_request(head={"sha": "a" * 40, "repo": {"full_name": "fork/repo"}}),
            pull_request(base={"ref": "develop", "repo": {"full_name": "someone/else"}}),
            pull_request(base=None),
            pull_request(head=None),
            workflow_run(repository={"full_name": "someone/else"}),
        )
        for candidate in cases:
            with self.subTest(candidate=candidate):
                self.assertFalse(pull_request_is_current(run, candidate, REPOSITORY))

    def test_run_order_blocks_older_report_on_same_head_and_allows_newer_attempt(self):
        existing = run_metadata(run_id=120, run_attempt=1)
        self.assertFalse(report_is_newer(run_metadata(run_id=99), existing))
        self.assertTrue(
            report_is_newer(run_metadata(run_id=120, run_attempt=2), existing)
        )
        self.assertFalse(
            report_is_newer(run_metadata(head_sha="b" * 40, run_id=90), existing)
        )
        self.assertTrue(
            report_is_newer(run_metadata(head_sha="b" * 40, run_id=130), existing)
        )

    def test_creates_then_updates_one_bot_marker_comment(self):
        api = FakeApi()
        body = "## Unit test results"
        first = upsert_report_comment(api, 58, body, run_metadata())
        second = upsert_report_comment(
            api, 58, "## Updated unit test results", run_metadata(run_attempt=2)
        )

        self.assertTrue(first)
        self.assertTrue(second)
        self.assertEqual(len(api.created), 1)
        self.assertEqual(len(api.updated), 1)
        self.assertEqual(len(api.comments), 1)
        self.assertIn("vitest-report", api.comments[0]["body"])

    def test_does_not_create_duplicate_or_replace_newer_marker_report(self):
        newer = run_metadata(run_id=200)
        body = make_comment_body("latest", newer)
        api = FakeApi([{"id": 77, "body": body, "user": {"login": "github-actions[bot]"}}])

        updated = upsert_report_comment(api, 58, "older", run_metadata(run_id=100))

        self.assertFalse(updated)
        self.assertEqual(api.created, [])
        self.assertEqual(api.updated, [])
        self.assertEqual(len(api.comments), 1)

    def test_does_not_replace_newer_different_head_with_older_run(self):
        newer = run_metadata(head_sha="b" * 40, run_id=120)
        api = FakeApi(
            [{"id": 78, "body": make_comment_body("latest", newer), "user": {"login": "github-actions[bot]"}}]
        )

        updated = upsert_report_comment(api, 58, "stale", run_metadata(run_id=90))

        self.assertFalse(updated)
        self.assertEqual(api.updated, [])
        self.assertEqual(len(api.comments), 1)

    def test_does_not_write_when_the_pr_head_changes_before_comment_update(self):
        changed_head = pull_request(
            head={"ref": "feature-branch", "sha": "b" * 40, "repo": {"full_name": REPOSITORY}}
        )
        api = FakeApi(pull_requests=[changed_head])

        written = upsert_report_comment(api, 58, "stale report", run_metadata())

        self.assertFalse(written)
        self.assertEqual(api.pull_request_reads, 1)
        self.assertEqual(api.created, [])
        self.assertEqual(api.updated, [])

    def test_does_not_update_existing_comment_when_the_pr_head_changes(self):
        existing = {
            "id": 88,
            "body": make_comment_body("previous report", run_metadata(run_id=99)),
            "user": {"login": "github-actions[bot]"},
        }
        changed_head = pull_request(
            head={"ref": "feature-branch", "sha": "b" * 40, "repo": {"full_name": REPOSITORY}}
        )
        api = FakeApi([existing], pull_requests=[changed_head])

        written = upsert_report_comment(api, 58, "stale replacement", run_metadata(run_id=101))

        self.assertFalse(written)
        self.assertEqual(api.pull_request_reads, 1)
        self.assertEqual(api.created, [])
        self.assertEqual(api.updated, [])
        self.assertIn("previous report", api.comments[0]["body"])

    def test_ignores_same_marker_written_by_another_user(self):
        api = FakeApi([{"id": 90, "body": make_comment_body("user", run_metadata()), "user": {"login": "contributor"}}])

        upsert_report_comment(api, 58, "bot report", run_metadata(run_attempt=2))

        self.assertEqual(len(api.created), 1)
        self.assertEqual(api.updated, [])
        self.assertEqual(len(api.comments), 2)

    def test_github_api_paginates_issue_comments(self):
        pages = [
            [{"id": number} for number in range(100)],
            [{"id": 100}],
        ]
        opener = Mock(side_effect=[FakeResponse(pages[0]), FakeResponse(pages[1])])
        api = GitHubApi("synthetic-token", REPOSITORY, "https://api.github.com", opener)

        comments = api.list_issue_comments(58)

        self.assertEqual(len(comments), 101)
        self.assertEqual(opener.call_count, 2)

    def test_github_api_queries_open_pull_requests_for_the_run_head(self):
        opener = Mock(return_value=FakeResponse([pull_request()]))
        api = GitHubApi("synthetic-token", REPOSITORY, "https://api.github.com", opener)

        result = api.list_pull_requests_for_head("contributor/repo", "feature/topic")

        request = opener.call_args.args[0]
        query = parse_qs(urlparse(request.full_url).query)
        self.assertEqual(result, [pull_request()])
        self.assertEqual(query["state"], ["open"])
        self.assertEqual(query["head"], ["contributor:feature/topic"])

    def test_github_api_failure_is_reported(self):
        opener = Mock(side_effect=OSError("synthetic network failure"))
        api = GitHubApi("synthetic-token", REPOSITORY, "https://api.github.com", opener)

        with self.assertRaises(GitHubApiError):
            api.list_issue_comments(58)


if __name__ == "__main__":
    unittest.main()
