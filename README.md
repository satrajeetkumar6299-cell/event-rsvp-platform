# Event RSVP Platform

A full-stack Event RSVP Platform built using **React, Flask, and MongoDB**. Users can create events, view event details, register attendees, manage registrations, and track event capacity.

## Features

- Create and list events
- View event details
- Register attendees
- Prevent duplicate registrations for the same event and email
- View attendee lists and remaining capacity
- Cancel registrations
- Delete events when permitted
- Backend and database health check
- Automated backend API tests

## Tech Stack

- **Frontend:** React, JavaScript, Vite, CSS
- **Backend:** Python, Flask, REST API
- **Database:** MongoDB with PyMongo
- **Testing:** Python `unittest`
- **Version Control:** Git and GitHub

## Project Structure

```text
event-rsvp-platform/
├── backend/
│   ├── database/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   ├── app.py
│   ├── config.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── index.html
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the project:

- Python 3
- Node.js and npm
- MongoDB
- Git

## MongoDB Configuration

Make sure MongoDB is running locally and your application is configured to connect to it.

The development database used by this project is `event_rsvp`.

The backend configuration supports environment variables for database settings. Configure the MongoDB URI and database name according to your local setup.

Do not commit `.env` files, passwords, database credentials, or other secrets to GitHub.

## Run the Backend

From the project root, open a terminal and run:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The backend runs at:

http://127.0.0.1:5001

Health endpoint:

http://127.0.0.1:5001/api/health

## Run the Frontend

Open a **second terminal** from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

http://localhost:5173

Keep both the backend and frontend terminals running while using the application.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend and database health |
| POST | `/api/events` | Create an event |
| GET | `/api/events` | List upcoming events |
| GET | `/api/events/<event_id>` | Get event details |
| DELETE | `/api/events/<event_id>` | Delete an eligible event |
| POST | `/api/events/<event_id>/registrations` | Register an attendee |
| GET | `/api/events/<event_id>/attendees` | List attendees and capacity details |
| DELETE | `/api/events/<event_id>/registrations/<registration_id>` | Cancel a registration |

## Run Automated Backend Tests

Automated tests cover event endpoints, registration behaviour, database configuration, health checks, and database index setup.

First, make sure the separate test MongoDB instance is running at `127.0.0.1:27018`. The test setup uses the `event_rsvp_test` database.

From the backend directory, activate the virtual environment and run:

```bash
cd backend
source .venv/bin/activate
python -m unittest discover -s . -t . -p 'test_*.py' -v
```

The current test suite contains **15 automated tests**, all of which passed in the latest local run.

## Security Notes

- Keep credentials and `.env` files out of version control.
- Use the dedicated test database for automated tests.
- Never point automated tests at the development database.
- Do not expose database credentials in source code or screenshots.

## Project Status

The project includes event and registration APIs, a React frontend, MongoDB integration, and automated backend tests. Development and further verification may continue as needed.

## Author

Satrajeet Kumar
