
from tests.base import ApiTestCase


class RegistrationApiTests(ApiTestCase):
    def test_register_attendee_success(self):
        event = self.create_event()
        response = self.register(
            event["id"], "Test Attendee", "test@example.com"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            response.json()["registration"]["email"],
            "test@example.com",
        )

    def test_duplicate_email_registration_rejected(self):
        event = self.create_event()
        first = self.register(
            event["id"], "First Person", "same@example.com"
        )
        second = self.register(
            event["id"], "Second Person", "same@example.com"
        )
        self.assertEqual(first.status_code, 201)
        self.assertIn(second.status_code, (400, 409))

    def test_attendees_count_and_remaining_capacity(self):
        event = self.create_event(capacity=3)
        response = self.register(
            event["id"], "First Person", "first@example.com"
        )
        self.assertEqual(response.status_code, 201)

        attendees = self.get("/api/events/" + event["id"] + "/attendees")
        self.assertEqual(attendees.status_code, 200)
        self.assertEqual(attendees.json()["count"], 1)
        self.assertEqual(attendees.json()["remaining_capacity"], 2)

    def test_registration_rejected_when_event_is_full(self):
        event = self.create_event(capacity=1)
        first = self.register(
            event["id"], "First Person", "first@example.com"
        )
        second = self.register(
            event["id"], "Second Person", "second@example.com"
        )
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 422)

    def test_attendees_for_missing_event(self):
        response = self.get(
            "/api/events/000000000000000000000000/attendees"
        )
        self.assertEqual(response.status_code, 404)

    def test_cancel_registration_updates_attendee_count_and_capacity(self):
        event = self.create_event(capacity=2)
        registration = self.register(
            event["id"], "Test Attendee", "cancel@example.com"
        )
        self.assertEqual(registration.status_code, 201)

        registration_id = registration.json()["registration"]["id"]

        response = self.delete(
            "/api/events/"
            + event["id"]
            + "/registrations/"
            + registration_id
        )
        self.assertEqual(response.status_code, 200)

        attendees = self.get("/api/events/" + event["id"] + "/attendees")
        self.assertEqual(attendees.status_code, 200)
        self.assertEqual(attendees.json()["count"], 0)
        self.assertEqual(attendees.json()["remaining_capacity"], 2)
