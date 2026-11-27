import os

# Dummy secrets so importing the app (which validates required secrets
# at startup) works in tests. Never used in production.
os.environ.setdefault("ADMIN_PASSWORD_SALT", "test-salt-0123456789")
os.environ.setdefault(
    "ADMIN_PASSWORD_HASH",
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
)
os.environ.setdefault("SESSION_SECRET", "test-session-secret-0123456789abcdef")
