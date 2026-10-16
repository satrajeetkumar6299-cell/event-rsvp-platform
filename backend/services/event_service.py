from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from database.mongo import get_db


def events_collection():
    return get_db()["events"]


def ensure_indexes():
    """Make date searches fast."""
    events_collection().create_index("date")


def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def parse_event_date(value):
    if not isinstance(value, str) or not value.strip():
        return None
    text = value.strip()
    if text.endswith("Z") or text.endswith("z"):
        text = text[:-1] + "+00:00"
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc).replace(tzinfo=None)


def validate_event_data(data):
    clean = {}
    errors = {}

    title = data.get("title")
    if not isinstance(title, str) or not title.strip():
        errors["title"] = "Title is required."
    elif len(title.strip()) > 120:
        errors["title"] = "Title must be 120 characters or fewer."
    else:
        clean["title"] = title.strip()

    description = data.get("description", "")
    if description is None:
        description = ""
    if not isinstance(description, str):
        errors["description"] = "Description must be text."
    elif len(description.strip()) > 2000:
        errors["description"] = "Description must be 2000 characters or fewer."
    else:
        clean["description"] = description.strip()

    location = data.get("location")
    if not isinstance(location, str) or not location.strip():
        errors["location"] = "Location is required."
    elif len(location.strip()) > 200:
        errors["location"] = "Location must be 200 characters or fewer."
    else:
        clean["location"] = location.strip()

    event_date = parse_event_date(data.get("date"))
    if event_date is None:
        errors["date"] = "Date is required in ISO format, for example 2026-12-20T18:30:00Z."
    elif event_date <= utc_now():
        errors["date"] = "Event date must be in the future."
    else:
        clean["date"] = event_date

    capacity = data.get("capacity")
    if isinstance(capacity, bool) or not isinstance(capacity, int):
        errors["capacity"] = "Capacity must be a whole number."
    elif capacity < 1:
        errors["capacity"] = "Capacity must be at least 1."
    elif capacity > 100000:
        errors["capacity"] = "Capacity must be 100000 or fewer."
    else:
        clean["capacity"] = capacity

    return clean, errors


def create_event(clean):
    doc = {**clean, "registered_count": 0, "created_at": utc_now()}
    result = events_collection().insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def list_upcoming_events():
    cursor = events_collection().find({"date": {"$gt": utc_now()}}).sort("date", 1)
    return list(cursor)


def get_event_by_id(event_id):
    try:
        object_id = ObjectId(event_id)
    except (InvalidId, TypeError):
        return None
    return events_collection().find_one({"_id": object_id})


def serialize_event(doc):
    registered = doc.get("registered_count", 0)
    return {
        "id": str(doc["_id"]),
        "title": doc["title"],
        "description": doc.get("description", ""),
        "date": doc["date"].isoformat() + "Z",
        "location": doc["location"],
        "capacity": doc["capacity"],
        "registered_count": registered,
        "available_seats": doc["capacity"] - registered,
    }
