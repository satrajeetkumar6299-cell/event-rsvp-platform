from pymongo import MongoClient
from pymongo.errors import PyMongoError

import config

_client = MongoClient(config.MONGO_URI, serverSelectionTimeoutMS=3000)


def get_db():
    return _client[config.DB_NAME]


def ping_database():
    try:
        _client.admin.command("ping")
        return True
    except PyMongoError:
        return False
