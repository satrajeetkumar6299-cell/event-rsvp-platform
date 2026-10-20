import { useState } from "react";
import EventList from "./components/EventList.jsx";
import EventForm from "./components/EventForm.jsx";
import EventDetails from "./components/EventDetails.jsx";
import SuccessMessage from "./components/SuccessMessage.jsx";
import "./App.css";

function App() {
  const [page, setPage] = useState("events");
  const [selectedId, setSelectedId] = useState(null);
  const [success, setSuccess] = useState("");

  function showPage(name) {
    setSuccess("");
    setPage(name);
  }

  function openDetails(eventId) {
    setSuccess("");
    setSelectedId(eventId);
    setPage("details");
  }

  function handleCreated(event) {
    setSuccess(`Event "${event.title}" was created successfully.`);
    setPage("events");
  }

  const eventsActive = page === "events" || page === "details";

  return (
    <div className="app">
      <header className="navbar">
        <span className="brand">Corporate Events</span>
        <nav className="nav-links" aria-label="Main">
          <button
            type="button"
            className={eventsActive ? "nav-btn active" : "nav-btn"}
            onClick={() => showPage("events")}
          >
            Events
          </button>
          <button
            type="button"
            className={page === "create" ? "nav-btn active" : "nav-btn"}
            onClick={() => showPage("create")}
          >
            Create Event
          </button>
        </nav>
      </header>

      <main className="content">
        {page === "events" && (
          <>
            <h1>Upcoming events</h1>
            <SuccessMessage message={success} />
            <EventList onSelect={openDetails} />
          </>
        )}
        {page === "details" && (
          <EventDetails
            key={selectedId}
            eventId={selectedId}
            onBack={() => showPage("events")}
          />
        )}
        {page === "create" && <EventForm onCreated={handleCreated} />}
      </main>

      <footer className="footer">
        Corporate Event Management &amp; RSVP Platform
      </footer>
    </div>
  );
}

export default App;