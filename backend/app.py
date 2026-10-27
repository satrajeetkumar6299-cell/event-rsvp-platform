
from flask import Flask, jsonify
from pymongo.errors import PyMongoError
from werkzeug.exceptions import HTTPException

import config
from database.mongo import ping_database
from routes.events import events_bp
from routes.registrations import registrations_bp
from services import event_service, registration_service


def create_app():
    app = Flask(__name__)

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = config.FRONTEND_ORIGIN
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Methods"] = (
            "GET, POST, DELETE, OPTIONS"
        )
        return response

    app.register_blueprint(events_bp)
    app.register_blueprint(registrations_bp)

    try:
        event_service.ensure_indexes()
        registration_service.ensure_indexes()
    except PyMongoError:
        app.logger.warning(
            "Could not create indexes: MongoDB is not reachable."
        )

    @app.route("/api/health", methods=["GET"])
    def health():
        db_ok = ping_database()
        return jsonify({
            "status": "ok",
            "message": "Event RSVP API is running",
            "database": "connected" if db_ok else "unavailable",
        }), 200

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"error": "Method not allowed"}), 405

    @app.errorhandler(Exception)
    def server_error(error):
        if isinstance(error, HTTPException):
            return jsonify({"error": error.description}), error.code

        app.logger.exception("Unexpected error")
        return jsonify({"error": "Internal server error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=config.PORT, use_reloader=False)
