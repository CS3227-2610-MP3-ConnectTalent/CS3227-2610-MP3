# Synthetic encrypted PDFs

Generated from a blank page using `generate.py`, pypdf 6.1.1 and cryptography
46.0.3. No applicant data or third-party documents are included. The script
asserts encryption and whether an empty opening password succeeds. AES-128 and
AES-256 each have an empty-password and a password-required fixture. Test-only
passwords are public synthetic values in the generator. These Python packages
are generation tools, not application or CI dependencies. Encryption uses random
salts, so regenerating produces equivalent behavior, not byte-identical files.
