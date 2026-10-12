import io
import json
import tempfile
import unittest
import zipfile
from email.message import Message
from pathlib import Path
from unittest.mock import patch
from urllib.request import Request

import scripts.ci.download_vitest_artifact as downloader
from scripts.ci.download_vitest_artifact import (
    ArtifactError,
    MAX_ARTIFACT_BYTES,
    download_reports,
)


def make_archive(entries):
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, content in entries:
            archive.writestr(name, content)
    return stream.getvalue()


class FakeResponse:
    def __init__(self, body):
        self.body = body

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self, size=-1):
        if size < 0:
            return self.body
        return self.body[:size]


class FakeOpener:
    def __init__(self, responses):
        self.responses = list(responses)
        self.requests = []

    def __call__(self, request, timeout):
        self.requests.append((request, timeout))
        return self.responses.pop(0)


class DownloadVitestArtifactTests(unittest.TestCase):
    def artifact_list(self, size=100):
        return json.dumps(
            {
                "total_count": 1,
                "artifacts": [
                    {
                        "id": 23,
                        "name": "vitest-reports",
                        "expired": False,
                        "size_in_bytes": size,
                    }
                ],
            }
        ).encode("utf-8")

    def test_downloads_and_extracts_only_the_two_expected_reports(self):
        junit = b'<testsuite tests="0" failures="0" />'
        coverage = b'{"total":{}}'
        archive = make_archive(
            [
                ("test-results/vitest-junit.xml", junit),
                ("coverage/coverage-summary.json", coverage),
            ]
        )
        opener = FakeOpener([FakeResponse(self.artifact_list(len(archive))), FakeResponse(archive)])

        with tempfile.TemporaryDirectory() as temp_dir:
            destination = Path(temp_dir)
            downloaded = download_reports(
                "https://api.github.com", "synthetic-token", "org/repo", 42, destination, opener
            )

            self.assertTrue(downloaded)
            self.assertEqual(
                (destination / "test-results" / "vitest-junit.xml").read_bytes(), junit
            )
            self.assertEqual(
                (destination / "coverage" / "coverage-summary.json").read_bytes(), coverage
            )
        self.assertEqual(len(opener.requests), 2)

    def test_rejects_oversized_archive_before_requesting_its_contents(self):
        opener = FakeOpener([FakeResponse(self.artifact_list(MAX_ARTIFACT_BYTES + 1))])

        with self.assertRaises(ArtifactError):
            download_reports(
                "https://api.github.com", "synthetic-token", "org/repo", 42, Path("reports"), opener
            )

        self.assertEqual(len(opener.requests), 1)

    def test_rejects_archives_with_unexpected_files(self):
        archive = make_archive(
            [
                ("test-results/vitest-junit.xml", b"<testsuite />"),
                ("coverage/coverage-summary.json", b"{}"),
                ("coverage/lcov.info", b"untrusted extra file"),
            ]
        )
        opener = FakeOpener([FakeResponse(self.artifact_list(len(archive))), FakeResponse(archive)])

        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaises(ArtifactError):
                download_reports(
                    "https://api.github.com", "synthetic-token", "org/repo", 42, Path(temp_dir), opener
                )
            self.assertEqual(list(Path(temp_dir).iterdir()), [])

    def test_rejects_report_entries_that_exceed_their_decompressed_size_limit(self):
        archive = make_archive(
            [
                ("test-results/vitest-junit.xml", b"<testsuite />"),
                ("coverage/coverage-summary.json", b"{" * (2 * 1024 * 1024 + 1)),
            ]
        )
        opener = FakeOpener([FakeResponse(self.artifact_list(len(archive))), FakeResponse(archive)])

        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaises(ArtifactError):
                download_reports(
                    "https://api.github.com", "synthetic-token", "org/repo", 42, Path(temp_dir), opener
                )
            self.assertEqual(list(Path(temp_dir).iterdir()), [])

    def test_rejects_paths_that_do_not_match_the_exact_report_names(self):
        archive = make_archive(
            [
                ("../test-results/vitest-junit.xml", b"<testsuite />"),
                ("coverage/coverage-summary.json", b"{}"),
            ]
        )
        opener = FakeOpener([FakeResponse(self.artifact_list(len(archive))), FakeResponse(archive)])

        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaises(ArtifactError):
                download_reports(
                    "https://api.github.com", "synthetic-token", "org/repo", 42, Path(temp_dir), opener
                )
            self.assertEqual(list(Path(temp_dir).iterdir()), [])

    def test_rejects_a_dangling_destination_symlink_before_writing(self):
        destination = Path("vitest-reports")
        with (
            patch.object(Path, "exists", return_value=False),
            patch.object(Path, "is_symlink", return_value=True),
            patch.object(Path, "mkdir") as mkdir,
            patch.object(Path, "write_bytes") as write_bytes,
        ):
            with self.assertRaises(ArtifactError):
                downloader._write_reports(
                    {"coverage/coverage-summary.json": b"{}"}, destination
                )

        mkdir.assert_not_called()
        write_bytes.assert_not_called()

    def test_cross_host_redirect_removes_the_github_bearer_token(self):
        handler_type = getattr(downloader, "SafeRedirectHandler", None)
        self.assertIsNotNone(handler_type, "artifact redirects must use a safe handler")
        request = Request("https://api.github.com/repos/org/repo/actions/artifacts/23/zip")
        request.add_header("Authorization", "Bearer synthetic-token")

        redirected = handler_type().redirect_request(
            request,
            None,
            302,
            "Found",
            Message(),
            "https://objects.example.test/artifact.zip",
        )

        self.assertIsNone(redirected.get_header("Authorization"))


if __name__ == "__main__":
    unittest.main()
