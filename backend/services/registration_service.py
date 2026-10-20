import re

from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import DuplicateKeyError

from database.mongo import get_db
from services import event_service

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def registrations_collection():
    return get_db()["registrations"]


def ensure_indexes():
    registrations_collection().create_index(
        [("event_id", 1), ("email", 1)], unique=True
    )


def validate_registration_data(data):
    clean = {}
    errors = {}

    name = data.get("name")
    if not isinstance(name, str) or not name.strip():
        errors["name"] = "Name is required."
    elif len(name.strip()) > 100:
        errors["name"] = "Name must be 100 characters or fewer."
    else:
        clean["name"] = name.strip()

    email = data.get("email")
    if not isinstance(email, str) or not email.strip():
        errors["email"] = "Email is required."
    else:
        normalized = email.strip().lower()
        if len(normalized) > 254 or not EMAIL_PATTERN.match(normalized):
            errors["email"] = "Enter a valid email address."
        else:
            clean["email"] = normalized

    return clean, errors


def release_seat(event_object_id):
    event_service.events_collection().update_one(
        {"_id": event_object_id, "registered_count": {"$gt": 0}},
        {"$inc": {"registered_count": -1}},
    )


def register_attendee(event_id, clean):
    event = event_service.get_event_by_id(event_id)
    if event is None:
        return None, (404, "Event not found")

    if event["date"] <= event_service.utc_now():
        return None, (400, "Registration is closed because this event has already started.")

    event_object_id = event["_id"]

    existing = registrations_collection().find_one(
        {"event_id": event_object_id, "email": clean["email"]}
    )
    if existing:
        return None, (409, "This email is already registered for this event.")

    claimed = event_service.events_collection().update_one(
        {
            "_id": event_object_id,
            "$expr": {"$lt": ["$registered_count", "$capacity"]},
        },
        {"$inc": {"registered_count": 1}},
    )
    if claimed.matched_count == 0:
        return None, (422, "This event is full. No seats are available.")

    doc = {
        "event_id": event_object_id,
        "name": clean["name"],
        "email": clean["email"],
        "registered_at": event_service.utc_now(),
    }

    try:
        result = registrations_collection().insert_one(doc)
    except DuplicateKeyError:
        release_seat(event_object_id)
        return None, (409, "This email is already registered for this event.")
    except Exception:
        release_seat(event_object_id)
        raise

    doc["_id"] = result.inserted_id
    return doc, None


def list_attendees(event_id):
    event = event_service.get_event_by_id(event_id)
    if event is None:
        return None, []
    cursor = registrations_collection().find({"event_id": event["_id"]}).sort(
        "registered_at", 1
    )
    return event, list(cursor)


def cancel_registration(event_id, registration_id):
    event = event_service.get_event_by_id(event_id)
    if event is None:
        return (404, "Event not found")

    try:
        registration_object_id = ObjectId(registration_id)
    except (InvalidId, TypeError):
        return (404, "Registration not found")

    result = registrations_collection().delete_one(
        {"_id": registration_object_id, "event_id": event["_id"]}
    )
    if result.deleted_count == 0:
        return (404, "Registration not found. It may already be cancelled.")

    release_seat(event["_id"])
    return None


def serialize_registration(doc):
    return {
        "id": str(doc["_id"]),
        "event_id": str(doc["event_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "registered_at": doc["registered_at"].isoformat() + "Z",
    }