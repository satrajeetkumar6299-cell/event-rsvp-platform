from flask import Blueprint, jsonify, request

from services import event_service

events_bp = Blueprint("events", __name__)


@events_bp.route("/api/events", methods=["POST"])
def create_event():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be valid JSON."}), 400

    clean, errors = event_service.validate_event_data(data)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    event = event_service.create_event(clean)
    return jsonify(event_service.serialize_event(event)), 201


@events_bp.route("/api/events", methods=["GET"])
def list_events():
    events = event_service.list_upcoming_events()
    items = [event_service.serialize_event(e) for e in events]
    return jsonify({"events": items, "count": len(items)}), 200


@events_bp.route("/api/events/<event_id>", methods=["GET"])
def get_event(event_id):
    event = event_service.get_event_by_id(event_id)
    if event is None:
        return jsonify({"error": "Event not found"}), 404
    return jsonify(event_service.serialize_event(event)), 200


@events_bp.route("/api/events/<event_id>", methods=["DELETE"])
def delete_event(event_id):
    success, status, message = event_service.delete_event_by_id(event_id)

    if not success:
        return jsonify({"error": message}), status

    return jsonify({"message": message}), status
