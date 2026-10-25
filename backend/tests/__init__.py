import os
import sys

TEST_DB_NAME = "event_rsvp_test"
DEV_DB_NAME = "event_rsvp"
TEST_MONGO_URI = "mongodb://127.0.0.1:27018"

for module_name in ("config", "database.mongo", "app"):
    if module_name in sys.modules:
        raise RuntimeError(
            "Refusing to run: '"
            + module_name
            + "' was imported before the test setup."
        )

os.environ["DB_NAME"] = TEST_DB_NAME
os.environ["MONGO_URI"] = TEST_MONGO_URI
os.environ["FRONTEND_ORIGIN"] = "http://localhost:5173"