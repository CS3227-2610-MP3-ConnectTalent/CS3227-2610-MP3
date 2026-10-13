"""Update one safe, artifact-only Vitest report comment on a pull request."""

import json
import os
import re
import sys
from datetime import datetime
from http.client import IncompleteRead
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

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


COMMENT_MARKER = "<!-- vitest-report -->"
METADATA_PREFIX = "<!-- vitest-report-meta:"
BOT_LOGIN = "github-actions[bot]"
SUPPORTED_BASES = {"develop", "master"}
TRUSTED_CI_WORKFLOW_PATH = ".github/workflows/ci.yml"
HEX_SHA = re.compile(r"^[0-9a-f]{40}(?:[0-9a-f]{24})?$", re.IGNORECASE)
MAX_GITHUB_ERROR_BODY_BYTES = 8192
MAX_GITHUB_ERROR_MESSAGE_CHARS = 240


class GitHubApiError(RuntimeError):
    """Raised when a GitHub API read or comment write fails."""


def _safe_github_error_message(error, token):
    """Return only a short, redacted GitHub error message from an HTTP error."""
    try:
        raw = error.read(MAX_GITHUB_ERROR_BODY_BYTES + 1)
    except (IncompleteRead, OSError, ValueError):
        raw = b""
    try:
        payload = json.loads(raw[:MAX_GITHUB_ERROR_BODY_BYTES].decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return "GitHub returned an error response"
    if not isinstance(payload, dict) or not isinstance(payload.get("message"), str):
        return "GitHub returned an error response"

    message = re.sub(r"[\x00-\x1f\x7f-\x9f]+", " ", payload["message"])
    message = " ".join(message.split())
    if token:
        message = message.replace(token, "[redacted]")
    if not message:
        return "GitHub returned an error response"
    if len(message) > MAX_GITHUB_ERROR_MESSAGE_CHARS:
        message = f"{message[:MAX_GITHUB_ERROR_MESSAGE_CHARS].rstrip()}..."
    return message


def _positive_integer(value):
    return isinstance(value, int) and not isinstance(value, bool) and value > 0


def _parse_timestamp(value):
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return None
    return parsed.timestamp()


def _valid_metadata(metadata):
    return (
        isinstance(metadata, dict)
        and _positive_integer(metadata.get("run_id"))
        and _positive_integer(metadata.get("run_attempt"))
        and _parse_timestamp(metadata.get("run_created_at")) is not None
        and isinstance(metadata.get("head_sha"), str)
        and HEX_SHA.fullmatch(metadata["head_sha"]) is not None
    )


def run_metadata(workflow_run):
    """Return validated report ordering metadata from the GitHub event."""
    metadata = {
        "run_id": workflow_run.get("id"),
        "run_attempt": workflow_run.get("run_attempt"),
        "run_created_at": workflow_run.get("created_at"),
        "head_sha": workflow_run.get("head_sha"),
    }
    if not _valid_metadata(metadata):
        return None
    return metadata


def _full_name(repository):
    if not isinstance(repository, dict):
        return None
    return repository.get("full_name")


def associated_pull_request(workflow_run, repository, candidate_pull_requests=None):
    """Return the unique current PR number associated with this CI run."""
    if not isinstance(workflow_run, dict):
        return None
    if workflow_run.get("name") != "CI" or workflow_run.get("event") != "pull_request":
        return None
    workflow_path = workflow_run.get("path")
    if not isinstance(workflow_path, str) or workflow_path.split("@", 1)[0] != TRUSTED_CI_WORKFLOW_PATH:
        return None
    if not _valid_metadata(run_metadata(workflow_run)):
        return None
    if not isinstance(repository, str) or not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository):
        return None
    if _full_name(workflow_run.get("repository")) != repository:
        return None
    head_repository = _full_name(workflow_run.get("head_repository"))
    if not isinstance(head_repository, str) or not re.fullmatch(
        r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", head_repository
    ):
        return None
    if candidate_pull_requests is None:
        pull_requests = workflow_run.get("pull_requests")
        if not isinstance(pull_requests, list) or len(pull_requests) != 1:
            return None
        number = pull_requests[0].get("number") if isinstance(pull_requests[0], dict) else None
        return number if _positive_integer(number) else None

    if not isinstance(candidate_pull_requests, list):
        return None

    head_repository = _full_name(workflow_run.get("head_repository"))
    head_branch = workflow_run.get("head_branch")
    matching_numbers = []
    for pull_request in candidate_pull_requests:
        if not isinstance(pull_request, dict):
            continue
        base = pull_request.get("base")
        head = pull_request.get("head")
        if not isinstance(base, dict) or not isinstance(head, dict):
            continue
        number = pull_request.get("number")
        if (
            pull_request.get("state") == "open"
            and _positive_integer(number)
            and base.get("ref") in SUPPORTED_BASES
            and _full_name(base.get("repo")) == repository
            and head.get("sha") == workflow_run.get("head_sha")
            and head.get("ref") == head_branch
            and _full_name(head.get("repo")) == head_repository
        ):
            matching_numbers.append(number)
    return matching_numbers[0] if len(matching_numbers) == 1 else None


def pull_request_is_current(workflow_run, pull_request, repository):
    """Check that the fetched open PR still matches the CI run's exact head."""
    if not isinstance(workflow_run, dict) or not isinstance(pull_request, dict):
        return False
    if pull_request.get("state") != "open":
        return False
    base = pull_request.get("base")
    head = pull_request.get("head")
    if not isinstance(base, dict) or not isinstance(head, dict):
        return False
    if base.get("ref") not in SUPPORTED_BASES:
        return False
    if _full_name(base.get("repo")) != repository:
        return False
    if head.get("sha") != workflow_run.get("head_sha"):
        return False
    return (
        _full_name(head.get("repo"))
        == _full_name(workflow_run.get("head_repository"))
        and _full_name(workflow_run.get("repository")) == repository
    )


def _comment_metadata(body):
    if not isinstance(body, str) or COMMENT_MARKER not in body:
        return None
    for line in body.splitlines():
        if not line.startswith(METADATA_PREFIX) or not line.endswith(" -->"):
            continue
        encoded = line[len(METADATA_PREFIX) : -4]
        try:
            metadata = json.loads(encoded)
        except json.JSONDecodeError:
            return None
        return metadata if _valid_metadata(metadata) else None
    return None


def make_comment_body(markdown, metadata):
    if not _valid_metadata(metadata):
        raise ValueError("report metadata is invalid")
    encoded = json.dumps(metadata, separators=(",", ":"), sort_keys=True)
    return f"{COMMENT_MARKER}\n{METADATA_PREFIX}{encoded} -->\n\n{markdown}"


def report_is_newer(incoming, existing):
    """Decide whether a run can replace the current PR report."""
    if not _valid_metadata(incoming):
        return False
    if not _valid_metadata(existing):
        return True
    incoming_order = (
        _parse_timestamp(incoming["run_created_at"]),
        incoming["run_id"],
        incoming["run_attempt"],
    )
    existing_order = (
        _parse_timestamp(existing["run_created_at"]),
        existing["run_id"],
        existing["run_attempt"],
    )
    return incoming_order > existing_order


def upsert_report_comment(api, issue_number, markdown, metadata):
    """Create or update the reporter's marked comment; return whether written."""
    if not _valid_metadata(metadata):
        raise ValueError("report metadata is invalid")
    body = make_comment_body(markdown, metadata)
    comments = api.list_issue_comments(issue_number)
    own_comments = [
        comment
        for comment in comments
        if isinstance(comment, dict)
        and isinstance(comment.get("user"), dict)
        and comment["user"].get("login") == BOT_LOGIN
        and isinstance(comment.get("body"), str)
        and COMMENT_MARKER in comment["body"]
    ]
    if own_comments:
        comment = own_comments[0]
        existing = _comment_metadata(comment.get("body"))
        if existing and not report_is_newer(metadata, existing):
            return False
    current_pull_request = api.get_pull_request(issue_number)
    current_head = (
        current_pull_request.get("head")
        if isinstance(current_pull_request, dict)
        else None
    )
    if (
        not isinstance(current_head, dict)
        or current_pull_request.get("state") != "open"
        or current_head.get("sha") != metadata["head_sha"]
    ):
        return False
    if own_comments:
        api.update_issue_comment(comment["id"], body)
        return True
    api.create_issue_comment(issue_number, body)
    return True


class GitHubApi:
    """Small REST client limited to pull-request reads and issue comments."""

    def __init__(self, token, repository, api_url, opener=None):
        if not isinstance(token, str) or not token:
            raise ValueError("GitHub token is required")
        if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository or ""):
            raise ValueError("GitHub repository is invalid")
        parsed = urlparse(api_url or "")
        if parsed.scheme != "https" or not parsed.netloc:
            raise ValueError("GitHub API URL must use HTTPS")
        self._token = token
        self._repository = repository
        self._api_url = api_url.rstrip("/")
        self._opener = opener or urlopen

    def request(self, method, path, payload=None):
        data = None if payload is None else json.dumps(payload).encode("utf-8")
        request = Request(
            f"{self._api_url}{path}",
            data=data,
            headers={
                "Accept": "application/vnd.github+json",
                "Authorization": f"Bearer {self._token}",
                "X-GitHub-Api-Version": "2022-11-28",
                "Content-Type": "application/json",
            },
            method=method,
        )
        try:
            with self._opener(request, timeout=20) as response:
                raw = response.read()
        except HTTPError as error:
            try:
                message = _safe_github_error_message(error, self._token)
            finally:
                error.close()
            raise GitHubApiError(
                f"GitHub API {method} request failed (HTTP {error.code}): {message}"
            ) from error
        except (URLError, OSError, ValueError) as error:
            raise GitHubApiError(f"GitHub API {method} request failed") from error
        if not raw:
            return {}
        try:
            return json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise GitHubApiError("GitHub API returned invalid JSON") from error

    def get_pull_request(self, number):
        if not _positive_integer(number):
            raise ValueError("pull request number is invalid")
        return self.request("GET", f"/repos/{self._repository}/pulls/{number}")

    def list_pull_requests_for_head(self, head_repository, head_branch):
        """Find open PRs for the run's source branch; callers verify its SHA/base."""
        if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", head_repository or ""):
            raise ValueError("pull request head repository is invalid")
        if (
            not isinstance(head_branch, str)
            or not head_branch
            or len(head_branch) > 250
            or any(ord(character) < 32 for character in head_branch)
        ):
            raise ValueError("pull request head branch is invalid")
        head_owner = head_repository.split("/", 1)[0]
        query = urlencode(
            {
                "state": "open",
                "head": f"{head_owner}:{head_branch}",
                "per_page": 100,
            }
        )
        result = self.request("GET", f"/repos/{self._repository}/pulls?{query}")
        if not isinstance(result, list):
            raise GitHubApiError("GitHub pull requests response has an unexpected shape")
        if len(result) == 100:
            raise GitHubApiError("GitHub pull request association reached its result limit")
        return result

    def list_issue_comments(self, issue_number):
        if not _positive_integer(issue_number):
            raise ValueError("issue number is invalid")
        comments = []
        page = 1
        while page <= 100:
            result = self.request(
                "GET",
                f"/repos/{self._repository}/issues/{issue_number}/comments?per_page=100&page={page}",
            )
            if not isinstance(result, list):
                raise GitHubApiError("GitHub comments response has an unexpected shape")
            comments.extend(result)
            if len(result) < 100:
                return comments
            page += 1
        raise GitHubApiError("GitHub comments pagination exceeded its limit")

    def create_issue_comment(self, issue_number, body):
        if not _positive_integer(issue_number):
            raise ValueError("issue number is invalid")
        return self.request(
            "POST",
            f"/repos/{self._repository}/issues/{issue_number}/comments",
            {"body": body},
        )

    def update_issue_comment(self, comment_id, body):
        if not _positive_integer(comment_id):
            raise ValueError("comment id is invalid")
        return self.request(
            "PATCH",
            f"/repos/{self._repository}/issues/comments/{comment_id}",
            {"body": body},
        )


def _read_report(reader, path):
    try:
        return reader(path), False
    except ReportError:
        return None, True


def _write_summary(markdown):
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_path:
        with Path(summary_path).open("a", encoding="utf-8") as summary_file:
            summary_file.write(markdown + "\n")
    else:
        print(markdown)


def main():
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    repository = os.environ.get("GITHUB_REPOSITORY")
    if not event_path or not repository:
        raise RuntimeError("GitHub workflow event metadata is unavailable")
    event = json.loads(Path(event_path).read_text(encoding="utf-8"))
    workflow_run = event.get("workflow_run", {})
    api = GitHubApi(
        os.environ.get("GITHUB_TOKEN", ""),
        repository,
        os.environ.get("GITHUB_API_URL", ""),
    )
    pr_number = associated_pull_request(workflow_run, repository)
    if pr_number is None and workflow_run.get("pull_requests") == []:
        head_repository = _full_name(workflow_run.get("head_repository"))
        head_branch = workflow_run.get("head_branch")
        if head_repository and isinstance(head_branch, str):
            candidates = api.list_pull_requests_for_head(head_repository, head_branch)
            pr_number = associated_pull_request(workflow_run, repository, candidates)
    if pr_number is None:
        print("No unique current pull request is associated with this CI run; no comment was written.")
        return 0

    pull_request = api.get_pull_request(pr_number)
    if not pull_request_is_current(workflow_run, pull_request, repository):
        print("The pull request is closed, targets an unsupported branch, or does not match this workflow run; no comment was written.")
        return 0

    artifact_root = Path(os.environ.get("VITEST_REPORT_PATH", "vitest-reports"))
    test_counts, test_report_error = _read_report(
        read_test_counts, artifact_root / "test-results" / "vitest-junit.xml"
    )
    coverage_metrics, coverage_report_error = _read_report(
        read_coverage_metrics, artifact_root / "coverage" / "coverage-summary.json"
    )
    markdown = render_markdown(
        test_counts,
        coverage_metrics,
        workflow_run.get("conclusion") or "unknown",
        workflow_run.get("html_url", ""),
        test_report_error,
        coverage_report_error,
    )
    metadata = run_metadata(workflow_run)
    if not metadata:
        print("Workflow run ordering metadata is invalid; no comment was written.")
        return 0
    _write_summary(markdown)
    written = upsert_report_comment(api, pr_number, markdown, metadata)
    if not written:
        print("A newer report already exists for the current pull request head; comment was left unchanged.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (GitHubApiError, OSError, ValueError, json.JSONDecodeError) as error:
        print(f"Vitest PR report failed: {error}", file=sys.stderr)
        raise SystemExit(1)
