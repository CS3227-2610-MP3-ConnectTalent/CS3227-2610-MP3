import io
import json
import stat
import tempfile
import unittest
import warnings
import zipfile
from email.message import Message
from pathlib import Path
from unittest.mock import patch
from urllib.request import Request

from scripts.ci import download_vitest_artifact as downloader
from scripts.ci.download_vitest_artifact import (
    MAX_ARTIFACT_BYTES,
    REPORT_FILES,
    ArtifactError,
    download_reports,
)


def make_archive(entries):
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, content, *mode in entries:
            entry = zipfile.ZipInfo(name)
            entry.compress_type = zipfile.ZIP_DEFLATED
            if mode:
                entry.create_system = 3
                entry.external_attr = mode[0] << 16
            archive.writestr(entry, content)
    return stream.getvalue()


def artifact_metadata(*artifacts):
    return json.dumps({"total_count": len(artifacts), "artifacts": artifacts}).encode()


class FakeResponse:
    def __init__(self, body):
        self.body = body
        self.read_sizes = []

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self, size=-1):
        self.read_sizes.append(size)
        return self.body if size < 0 else self.body[:size]


class FakeOpener:
    def __init__(self, *responses):
        self.responses = list(responses)
        self.requests = []

    def __call__(self, request, timeout):
        self.requests.append((request, timeout))
        return self.responses.pop(0)


class DownloadVitestArtifactTests(unittest.TestCase):
    def report_archive(self, reports=None):
        reports = reports or {
            "coverage-summary.json": b'{"total":{}}',
            "coverage-final.json": b'{"src/index.ts":{}}',
        }
        return make_archive(list(reports.items()))

    def download(self, opener, destination, run_attempt=3):
        return download_reports(
            "https://api.github.com",
            "synthetic-token",
            "org/repo",
            42,
            run_attempt,
            destination,
            opener=opener,
        )

    def test_downloads_only_the_exact_artifact_for_the_current_run_attempt(self):
        archive = self.report_archive()
        opener = FakeOpener(
            FakeResponse(
                artifact_metadata(
                    {
                        "id": 22,
                        "name": "vitest-reports-2",
                        "expired": False,
                        "size_in_bytes": 100,
                    },
                    {
                        "id": 23,
                        "name": "vitest-reports-3",
                        "expired": False,
                        "size_in_bytes": len(archive),
                    },
                )
            ),
            FakeResponse(archive),
        )

        with tempfile.TemporaryDirectory() as temp_dir:
            destination = Path(temp_dir)
            self.download(opener, destination)

            for name, content in {
                "coverage-summary.json": b'{"total":{}}',
                "coverage-final.json": b'{"src/index.ts":{}}',
            }.items():
                self.assertEqual((destination / name).read_bytes(), content)
            self.assertEqual(
                sorted(path.name for path in destination.iterdir()),
                sorted(REPORT_FILES),
            )

        self.assertEqual(len(opener.requests), 2)
        metadata_request, archive_request = (request for request, _ in opener.requests)
        self.assertIn("/actions/runs/42/artifacts?", metadata_request.full_url)
        self.assertIn("name=vitest-reports-3", metadata_request.full_url)
        self.assertIn("/actions/artifacts/23/zip", archive_request.full_url)
        for request, timeout in opener.requests:
            self.assertEqual(request.get_header("Authorization"), "Bearer synthetic-token")
            self.assertEqual(timeout, 20)

    def test_rejects_when_only_another_attempts_artifact_exists(self):
        opener = FakeOpener(
            FakeResponse(
                artifact_metadata(
                    {
                        "id": 22,
                        "name": "vitest-reports-2",
                        "expired": False,
                        "size_in_bytes": 100,
                    }
                )
            )
        )

        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaisesRegex(ArtifactError, "attempt-scoped"):
                self.download(opener, Path(temp_dir))
            self.assertEqual(list(Path(temp_dir).iterdir()), [])
        self.assertEqual(len(opener.requests), 1)

    def test_rejects_artifact_metadata_over_the_compressed_size_limit(self):
        opener = FakeOpener(
            FakeResponse(
                artifact_metadata(
                    {
                        "id": 23,
                        "name": "vitest-reports-3",
                        "expired": False,
                        "size_in_bytes": MAX_ARTIFACT_BYTES + 1,
                    }
                )
            )
        )

        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaisesRegex(ArtifactError, "8 MiB"):
                self.download(opener, Path(temp_dir))
        self.assertEqual(len(opener.requests), 1)

    def test_rejects_oversized_download_body_when_metadata_underreports_it(self):
        metadata = artifact_metadata(
            {
                "id": 23,
                "name": "vitest-reports-3",
                "expired": False,
                "size_in_bytes": 100,
            }
        )
        oversized_body = b"x" * (MAX_ARTIFACT_BYTES + 1)
        response = FakeResponse(oversized_body)
        opener = FakeOpener(FakeResponse(metadata), response)

        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaisesRegex(ArtifactError, "response exceeds the size limit"):
                self.download(opener, Path(temp_dir))
        self.assertEqual(response.read_sizes, [MAX_ARTIFACT_BYTES + 1])
        self.assertEqual(len(opener.requests), 2)

    def test_rejects_oversized_metadata_response(self):
        response = FakeResponse(b" " * (downloader.MAX_METADATA_BYTES + 1))
        opener = FakeOpener(response)

        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaisesRegex(ArtifactError, "response exceeds the size limit"):
                self.download(opener, Path(temp_dir))
        self.assertEqual(response.read_sizes, [downloader.MAX_METADATA_BYTES + 1])
        self.assertEqual(len(opener.requests), 1)

    def test_rejects_paths_outside_the_exact_coverage_file_allowlist(self):
        unexpected_names = (
            "../coverage-final.json",
            "nested/coverage-final.json",
            "extra.txt",
        )
        for unexpected_name in unexpected_names:
            with self.subTest(unexpected_name=unexpected_name):
                malformed = make_archive(
                    [
                        ("coverage-summary.json", b"{}"),
                        (unexpected_name, b"{}"),
                    ]
                )
                self.assertLess(len(malformed), MAX_ARTIFACT_BYTES)
                with self.assertRaises(ArtifactError):
                    downloader._read_archive(malformed)

    def test_rejects_duplicate_paths(self):
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            archive = make_archive(
                [
                    ("coverage-summary.json", b"{}"),
                    ("coverage-summary.json", b"{\"overwritten\":true}"),
                    ("coverage-final.json", b"{}"),
                ]
            )

        with self.assertRaisesRegex(ArtifactError, "duplicate paths"):
            downloader._read_archive(archive)

    def test_rejects_a_symlink_even_when_its_name_is_allowlisted(self):
        symlink_mode = stat.S_IFLNK | 0o777
        archive = make_archive(
            [
                ("coverage-summary.json", b"{}", symlink_mode),
                ("coverage-final.json", b"{}"),
            ]
        )

        with self.assertRaisesRegex(ArtifactError, "symbolic links"):
            downloader._read_archive(archive)

    def test_rejects_a_symlinked_destination_before_creating_files(self):
        with (
            patch.object(Path, "is_symlink", return_value=True),
            patch.object(Path, "mkdir") as mkdir,
            patch.object(Path, "write_bytes") as write_bytes,
        ):
            with self.assertRaisesRegex(ArtifactError, "destination"):
                downloader._write_reports(
                    {"coverage-summary.json": b"{}"}, Path("coverage")
                )

        mkdir.assert_not_called()
        write_bytes.assert_not_called()

    def test_rejects_a_symlinked_report_target_before_writing(self):
        with (
            patch.object(Path, "is_symlink", side_effect=[False, False, True]),
            patch.object(Path, "mkdir") as mkdir,
            patch.object(Path, "write_bytes") as write_bytes,
        ):
            with self.assertRaisesRegex(ArtifactError, "report file"):
                downloader._write_reports(
                    {"coverage-summary.json": b"{}"}, Path("coverage")
                )

        mkdir.assert_called_once_with(parents=True, exist_ok=True)
        write_bytes.assert_not_called()

    def test_rejects_decompressed_report_over_its_per_file_limit(self):
        oversized_report = b"x" * (REPORT_FILES["coverage-summary.json"] + 1)
        archive = self.report_archive(
            {
                "coverage-summary.json": oversized_report,
                "coverage-final.json": b"{}",
            }
        )
        self.assertLess(len(archive), MAX_ARTIFACT_BYTES)

        with self.assertRaisesRegex(ArtifactError, "2 MiB"):
            downloader._read_archive(archive)

    def test_cross_host_redirect_drops_the_bearer_token(self):
        request = Request("https://api.github.com/repos/org/repo/actions/artifacts/23/zip")
        request.add_header("Authorization", "Bearer synthetic-token")

        redirected = downloader.SafeRedirectHandler().redirect_request(
            request,
            None,
            302,
            "Found",
            Message(),
            "https://objects.example.test/artifact.zip",
        )

        self.assertIsNone(redirected.get_header("Authorization"))

    def test_same_host_redirect_keeps_the_bearer_token(self):
        request = Request("https://api.github.com/repos/org/repo/actions/artifacts/23/zip")
        request.add_header("Authorization", "Bearer synthetic-token")

        redirected = downloader.SafeRedirectHandler().redirect_request(
            request,
            None,
            302,
            "Found",
            Message(),
            "https://api.github.com/storage/artifact.zip",
        )

        self.assertEqual(redirected.get_header("Authorization"), "Bearer synthetic-token")


if __name__ == "__main__":
    unittest.main()
