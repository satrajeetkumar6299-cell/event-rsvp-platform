
import requests
from bson import ObjectId

import config
from database.mongo import get_db
from tests import DEV_DB_NAME, TEST_DB_NAME, TEST_MONGO_URI
from tests.base import ApiTestCase


class SmokeTest(ApiTestCase):
    def test_config_points_to_test_database(self):
        self.assertEqual(config.DB_NAME, TEST_DB_NAME)
        self.assertEqual(get_db().name, TEST_DB_NAME)
        self.assertNotEqual(get_db().name, DEV_DB_NAME)
        self.assertEqual(config.MONGO_URI, TEST_MONGO_URI)

    def test_health_endpoint(self):
        response = self.get("/api/health")
        self.assertEqual(response.status_code, 200)

        body = response.json()
        self.assertEqual(body["status"], "ok")
        self.assertEqual(body["database"], "connected")

    def test_created_event_is_stored_in_test_database_only(self):
        event = self.create_event(title="Smoke Test Event")
        events = get_db()["events"]

        stored = events.find_one({"_id": ObjectId(event["id"])})

        self.assertIsNotNone(stored)
        self.assertEqual(stored["title"], "Smoke Test Event")
        self.assertEqual(events.database.name, TEST_DB_NAME)
        self.assertEqual(events.count_documents({}), 1)

    def test_unique_registration_index_exists(self):
        indexes = get_db()["registrations"].index_information()
        found = False

        for info in indexes.values():
            keys = [name for name, _ in info["key"]]
            if info.get("unique") and keys == ["event_id", "email"]:
                found = True

        self.assertTrue(found)

    def test_cors_allows_configured_frontend_origin(self):
        response = requests.get(
            self.url("/api/health"),
            headers={"Origin": config.FRONTEND_ORIGIN},
            timeout=10,
        )

        self.assertEqual(
            response.headers.get("Access-Control-Allow-Origin"),
            config.FRONTEND_ORIGIN,
        )

    def test_cors_preflight_headers(self):
        response = requests.options(
            self.url("/api/health"),
            headers={
                "Origin": config.FRONTEND_ORIGIN,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            },
            timeout=10,
        )

        self.assertEqual(
            response.headers.get("Access-Control-Allow-Origin"),
            config.FRONTEND_ORIGIN,
        )
        self.assertIn(
            "POST",
            response.headers.get("Access-Control-Allow-Methods", ""),
        )
        self.assertIn(
            "Content-Type",
            response.headers.get("Access-Control-Allow-Headers", ""),
        )

    def test_cors_does_not_allow_unknown_origin(self):
        response = requests.get(
            self.url("/api/health"),
            headers={"Origin": "https://untrusted.example"},
            timeout=10,
        )

        self.assertNotEqual(
            response.headers.get("Access-Control-Allow-Origin"),
            "https://untrusted.example",
        )
