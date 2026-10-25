
import logging
import threading
import unittest
from datetime import datetime, timedelta, timezone

import requests
from pymongo.errors import PyMongoError
from werkzeug.serving import make_server

import config
from database.mongo import get_db
from services import event_service, registration_service
from tests import DEV_DB_NAME, TEST_DB_NAME, TEST_MONGO_URI


def verify_names():
    if config.MONGO_URI != TEST_MONGO_URI:
        raise RuntimeError(
            "Refusing to run: config.MONGO_URI is not the fixed test URI."
        )
    if config.DB_NAME != TEST_DB_NAME:
        raise RuntimeError(
            "Refusing to run: config.DB_NAME is not the test database."
        )
    if get_db().name != TEST_DB_NAME:
        raise RuntimeError(
            "Refusing to run: the live database handle is not the test database."
        )
    if event_service.events_collection().database.name != TEST_DB_NAME:
        raise RuntimeError(
            "Refusing to run: the events collection is not in the test database."
        )
    if (
        registration_service.registrations_collection().database.name
        != TEST_DB_NAME
    ):
        raise RuntimeError(
            "Refusing to run: the registrations collection is not in the test database."
        )


def verify_server():
    try:
        database_names = get_db().client.list_database_names()
    except PyMongoError:
        raise RuntimeError(
            "Refusing to run: the test MongoDB server on port 27018 is not reachable. "
            "Start it first with the mongod command from the test instructions."
        ) from None

    if DEV_DB_NAME in database_names:
        raise RuntimeError(
            "Refusing to run: this MongoDB server contains the development database."
        )


verify_names()
verify_server()

import app as app_module

logging.getLogger("werkzeug").setLevel(logging.ERROR)


def clear_test_collections():
    verify_names()
    event_service.events_collection().delete_many({})
    registration_service.registrations_collection().delete_many({})


def future_date(days=30):
    moment = datetime.now(timezone.utc) + timedelta(days=days)
    return moment.strftime("%Y-%m-%dT%H:%M:%SZ")


class TestServer:
    def __init__(self, flask_app):
        self._server = make_server("127.0.0.1", 0, flask_app, threaded=True)
        self.port = self._server.server_port
        self._thread = threading.Thread(
            target=self._server.serve_forever,
            daemon=True,
        )

    @property
    def base_url(self):
        return "http://127.0.0.1:" + str(self.port)

    def start(self):
        self._thread.start()

    def stop(self):
        self._server.shutdown()
        self._server.server_close()
        self._thread.join(timeout=5)


class ApiTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        verify_names()
        cls.server = TestServer(app_module.app)
        cls.server.start()
        cls.base_url = cls.server.base_url

    @classmethod
    def tearDownClass(cls):
        cls.server.stop()

    def setUp(self):
        clear_test_collections()

    def url(self, path):
        return self.base_url + path

    def get(self, path):
        return requests.get(self.url(path), timeout=10)

    def post(self, path, payload=None):
        return requests.post(self.url(path), json=payload, timeout=10)

    def delete(self, path):
        return requests.delete(self.url(path), timeout=10)

    def event_payload(self, **overrides):
        payload = {
            "title": "Test Event",
            "description": "Created by automated tests",
            "date": future_date(),
            "location": "Test Room",
            "capacity": 3,
        }
        payload.update(overrides)
        return payload

    def create_event(self, **overrides):
        response = self.post("/api/events", self.event_payload(**overrides))
        self.assertEqual(response.status_code, 201)
        return response.json()

    def register(self, event_id, name, email):
        return self.post(
            "/api/events/" + event_id + "/registrations",
            {"name": name, "email": email},
        )
