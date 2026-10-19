
from flask import Blueprint, jsonify, request

from services import event_service, registration_service


registrations_bp = Blueprint("registrations", __name__)


@registrations_bp.route(
    "/api/events/<event_id>/registrations",
    methods=["POST"],
)
def register(event_id):
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be valid JSON."}), 400

    clean, errors = registration_service.validate_registration_data(data)

    if errors:
        return jsonify({
            "error": "Validation failed",
            "details": errors,
        }), 400

    registration, problem = registration_service.register_attendee(
        event_id,
        clean,
    )

    if problem:
        status, message = problem
        return jsonify({"error": message}), status

    event = event_service.get_event_by_id(event_id)

    return jsonify({
        "registration": registration_service.serialize_registration(
            registration
        ),
        "event": event_service.serialize_event(event),
    }), 201
