"""Fetch and bound coverage JSON before the privileged report action parses it."""

import io
import json
import os
import re
import stat
import sys
import zipfile
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import HTTPRedirectHandler, Request, build_opener


MAX_ARTIFACT_BYTES = 8 * 1024 * 1024
MAX_METADATA_BYTES = 1024 * 1024
REPORT_FILES = {
    "coverage-summary.json": 2 * 1024 * 1024,
    "coverage-final.json": 2 * 1024 * 1024,
}
ARTIFACT_NAME = "vitest-reports"


class ArtifactError(ValueError):
    """Raised when an artifact is malformed or exceeds its size limits."""


class SafeRedirectHandler(HTTPRedirectHandler):
    """Do not forward the GitHub bearer token to a redirected storage host."""

    def redirect_request(self, request, response, code, message, headers, new_url):
        redirected = super().redirect_request(
            request, response, code, message, headers, new_url
        )
        if redirected is None:
            return None
        origin = urlparse(request.full_url)
        target = urlparse(new_url)
        if target.scheme != "https":
            return None
        if (origin.scheme.casefold(), origin.netloc.casefold()) != (
            target.scheme.casefold(),
            target.netloc.casefold(),
        ):
            redirected.remove_header("Authorization")
        return redirected


def _open_github_request(request, timeout):
    return build_opener(SafeRedirectHandler()).open(request, timeout=timeout)


def _read_response(opener, url, token, maximum):
    request = Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    try:
        with opener(request, timeout=20) as response:
            raw = response.read(maximum + 1)
    except (HTTPError, URLError, OSError, ValueError) as error:
        raise ArtifactError("GitHub artifact request failed") from error
    if len(raw) > maximum:
        raise ArtifactError("GitHub artifact response exceeds the size limit")
    return raw


def _artifact_id(raw, artifact_name):
    try:
        payload = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise ArtifactError("GitHub artifact metadata is malformed") from error
    artifacts = payload.get("artifacts") if isinstance(payload, dict) else None
    if not isinstance(artifacts, list):
        raise ArtifactError("GitHub artifact metadata has an unexpected structure")
    matches = [
        artifact
        for artifact in artifacts
        if isinstance(artifact, dict) and artifact.get("name") == artifact_name
    ]
    if not matches:
        return None
    if len(matches) != 1:
        raise ArtifactError("GitHub returned multiple Vitest report artifacts")
    artifact = matches[0]
    artifact_id = artifact.get("id")
    size = artifact.get("size_in_bytes")
    if isinstance(artifact_id, bool) or not isinstance(artifact_id, int) or artifact_id <= 0:
        raise ArtifactError("GitHub artifact identifier is invalid")
    if isinstance(size, bool) or not isinstance(size, int) or size <= 0:
        raise ArtifactError("GitHub artifact size is invalid")
    if size > MAX_ARTIFACT_BYTES:
        raise ArtifactError("Vitest report artifact exceeds the 8 MiB size limit")
    if artifact.get("expired") is not False:
        raise ArtifactError("Vitest report artifact has expired or invalid status")
    return artifact_id


def _read_archive(archive_bytes):
    try:
        with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
            entries = archive.infolist()
            entry_names = [entry.filename for entry in entries]
            if not entries or len(set(entry_names)) != len(entry_names):
                raise ArtifactError("Vitest artifact has no reports or duplicate paths")
            if set(entry_names) != set(REPORT_FILES):
                raise ArtifactError("Vitest artifact must contain exactly the two coverage JSON reports")

            reports = {}
            for entry in entries:
                if entry.is_dir() or entry.flag_bits & 0x1:
                    raise ArtifactError("Vitest artifact contains an unsupported ZIP entry")
                mode = entry.external_attr >> 16
                if entry.create_system == 3 and stat.S_ISLNK(mode):
                    raise ArtifactError("Vitest artifact must not contain symbolic links")
                maximum = REPORT_FILES[entry.filename]
                if entry.file_size <= 0 or entry.file_size > maximum:
                    raise ArtifactError("Coverage JSON report is empty or exceeds the 2 MiB limit")
                with archive.open(entry) as report_file:
                    content = report_file.read(maximum + 1)
                if len(content) > maximum or len(content) != entry.file_size:
                    raise ArtifactError("Coverage report size does not match its ZIP entry")
                reports[entry.filename] = content
            return reports
    except (zipfile.BadZipFile, zipfile.LargeZipFile, RuntimeError, OSError) as error:
        raise ArtifactError("Vitest artifact archive is malformed") from error


def _write_reports(reports, destination):
    root = Path(destination)
    if root.is_symlink():
        raise ArtifactError("Vitest report destination must not be a symbolic link")
    for name, content in reports.items():
        target = root / name
        parent = target.parent
        if parent.is_symlink():
            raise ArtifactError("Vitest report directory must not be a symbolic link")
        parent.mkdir(parents=True, exist_ok=True)
        if target.is_symlink():
            raise ArtifactError("Vitest report file must not be a symbolic link")
        target.write_bytes(content)


def download_reports(api_url, token, repository, run_id, run_attempt, destination):
    """Fetch one attempt-scoped artifact and write only bounded coverage JSON."""
    parsed = urlparse(api_url or "")
    if parsed.scheme != "https" or not parsed.netloc:
        raise ArtifactError("GitHub API URL must use HTTPS")
    if not isinstance(token, str) or not token:
        raise ArtifactError("GitHub token is required")
    if not isinstance(repository, str) or not re.fullmatch(
        r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository
    ):
        raise ArtifactError("GitHub repository is invalid")
    if isinstance(run_id, bool) or not isinstance(run_id, int) or run_id <= 0:
        raise ArtifactError("GitHub workflow run identifier is invalid")
    if isinstance(run_attempt, bool) or not isinstance(run_attempt, int) or run_attempt <= 0:
        raise ArtifactError("GitHub workflow run attempt is invalid")

    opener = _open_github_request
    base_url = api_url.rstrip("/")
    repository_path = f"/repos/{repository}"
    artifact_name = f"{ARTIFACT_NAME}-{run_attempt}"
    query = urlencode({"name": artifact_name, "per_page": 100})
    metadata_url = f"{base_url}{repository_path}/actions/runs/{run_id}/artifacts?{query}"
    artifact_id = _artifact_id(
        _read_response(opener, metadata_url, token, MAX_METADATA_BYTES), artifact_name
    )
    if artifact_id is None:
        raise ArtifactError("No attempt-scoped Vitest report artifact exists")

    archive_url = f"{base_url}{repository_path}/actions/artifacts/{artifact_id}/zip"
    archive_bytes = _read_response(opener, archive_url, token, MAX_ARTIFACT_BYTES)
    reports = _read_archive(archive_bytes)
    _write_reports(reports, destination)


def main():
    try:
        run_id = int(os.environ.get("VITEST_SOURCE_RUN_ID", ""))
        run_attempt = int(os.environ.get("VITEST_SOURCE_RUN_ATTEMPT", ""))
    except (TypeError, ValueError) as error:
        raise ArtifactError("GitHub workflow run or attempt identifier is invalid") from error
    download_reports(
        os.environ.get("GITHUB_API_URL", "https://api.github.com"),
        os.environ.get("GITHUB_TOKEN", ""),
        os.environ.get("GITHUB_REPOSITORY", ""),
        run_id,
        run_attempt,
        os.environ.get("VITEST_REPORT_PATH", "coverage"),
    )
    print("Downloaded and validated the bounded coverage JSON reports.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ArtifactError, OSError) as error:
        print(f"Vitest artifact download failed: {error}", file=sys.stderr)
        raise SystemExit(1)
