
from bson import ObjectId

from database.mongo import get_db
from tests.base import ApiTestCase


class EventApiTests(ApiTestCase):
    def test_create_event_success(self):
        response = self.post("/api/events", self.event_payload())
        self.assertEqual(response.status_code, 201)
        self.assertIn("id", response.json())

    def test_create_event_invalid_json_body(self):
        response = requests_post_invalid_json(self)
        self.assertEqual(response.status_code, 400)

    def test_list_events(self):
        self.create_event(title="Automated Test Event")
        response = self.get("/api/events")
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(response.json()["count"], 1)

    def test_get_event_not_found(self):
        response = self.get("/api/events/" + str(ObjectId()))
        self.assertEqual(response.status_code, 404)

    def test_delete_event_success(self):
        event = self.create_event()
        response = self.delete("/api/events/" + event["id"])
        self.assertEqual(response.status_code, 200)

    def test_delete_event_not_found(self):
        response = self.delete("/api/events/" + str(ObjectId()))
        self.assertEqual(response.status_code, 404)


def requests_post_invalid_json(test_case):
    import requests

    return requests.post(
        test_case.url("/api/events"),
        data="not-json",
        headers={"Content-Type": "application/json"},
        timeout=10,
    )
