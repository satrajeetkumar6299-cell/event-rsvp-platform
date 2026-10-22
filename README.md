
# Event RSVP Platform

A full-stack Event RSVP Platform built using Flask, MongoDB, React, and Vite. This project is currently under development.

## Tech Stack

- Frontend: React, JavaScript, Vite, CSS
- Backend: Python, Flask, REST API
- Database: MongoDB
- Version Control: Git and GitHub

## Features

- Create and view events
- View event details
- Register attendees
- View attendee lists
- Cancel registrations
- Delete eligible events
- Backend and database health check
- Event management dashboard

## Project Structure

```text
event-rsvp-platform/
├── backend/
├── frontend/
├── .gitignore
└── README.md
```

## Prerequisites

- Python 3
- Node.js and npm
- MongoDB
- Git

## Run the Backend

From the project root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend URL: http://127.0.0.1:5001

## Run the Frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown in the terminal, usually http://localhost:5173.

## Environment Configuration

Configure the MongoDB connection and other required settings using your local environment variables. Never commit `.env` files, database credentials, or secret API keys.

## Project Status

This project is under active development. Features, testing, and documentation will be updated as development progresses.

## Author

Satrajeet Kumar
