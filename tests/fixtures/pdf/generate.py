"""Synthetic blank-page fixtures; run with pypdf 6.1.1 + cryptography 46.0.3."""
from pathlib import Path
from pypdf import PdfWriter, PdfReader

root = Path(__file__).parent
for algorithm in ("AES-128", "AES-256"):
    for protected in (False, True):
        writer = PdfWriter()
        writer.add_blank_page(width=612, height=792)
        password = "synthetic-opening-password" if protected else ""
        writer.encrypt(password, "synthetic-owner-password", algorithm=algorithm)
        name = f"{algorithm.lower()}-{'password' if protected else 'open'}.pdf"
        with (root / name).open("wb") as output:
            writer.write(output)
        reader = PdfReader(root / name)
        assert reader.is_encrypted
        assert bool(reader.decrypt("")) == (not protected)
        assert reader.decrypt(password)
        assert len(reader.pages) == 1
