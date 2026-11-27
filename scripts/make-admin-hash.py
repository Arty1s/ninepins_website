"""Generate ADMIN_PASSWORD_SALT + ADMIN_PASSWORD_HASH for backend/.env.

Usage (from repo root):
    python scripts/make-admin-hash.py
Prompts for the admin password twice (hidden input), then prints
three lines ready to paste into backend/.env.

Parameters match backend/app/auth.py: PBKDF2-SHA256, 100 000 iterations.
"""

import getpass
import hashlib
import secrets

SALT_BYTES = 16
ITERATIONS = 100_000


def main() -> None:
    first = getpass.getpass("Admin password: ")
    if len(first) < 12:
        raise SystemExit("Password must be at least 12 characters.")
    second = getpass.getpass("Admin password again: ")
    if first != second:
        raise SystemExit("Passwords do not match.")
    salt = secrets.token_hex(SALT_BYTES)
    digest = hashlib.pbkdf2_hmac("sha256", first.encode("utf-8"), salt.encode("utf-8"), ITERATIONS, dklen=32).hex()
    print()
    print("Paste into backend/.env:")
    print(f"ADMIN_PASSWORD_SALT={salt}")
    print(f"ADMIN_PASSWORD_HASH={digest}")


if __name__ == "__main__":
    main()
