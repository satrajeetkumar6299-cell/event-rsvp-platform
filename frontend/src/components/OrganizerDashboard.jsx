
import { useEffect, useState } from "react";
import { getEvents } from "../api/client.js";
import AttendeeList from "./AttendeeList.jsx";
import Loading from "./Loading.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import "../styles/dashboard.css";

function OrganizerDashboard() {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getEvents()
            .then((data) => {
                const items = data.events || [];
                setEvents(items);

                if (items.length > 0) {
                    setSelectedEventId(items[0].id);
                }
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <Loading text="Loading organizer dashboard..." />;
    }

    const totalRegistrations = events.reduce(
        (total, event) => total + (event.registered_count ?? 0),
        0
    );

    const totalSeatsRemaining = events.reduce(
        (total, event) => total + (event.available_seats ?? 0),
        0
    );

    return (
        <section className="organizer-dashboard">
            <h1>Organizer Dashboard</h1>
            <p>Manage event registrations and attendee lists.</p>

            {error && <ErrorMessage message={error} />}

            {events.length === 0 ? (
                <p className="empty">No events available. Create an event first.</p>
            ) : (
                <>
                    <label htmlFor="organizer-event">Select event</label>
                    <select
                        id="organizer-event"
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                        {events.map((event) => (
                            <option key={event.id} value={event.id}>
                                {event.title}
                            </option>
                        ))}
                    </select>

                    {selectedEventId && (
                        <AttendeeList
                            key={selectedEventId}
                            eventId={selectedEventId}
                        />
                    )}

                    <section className="dashboard-summary">
                        <h2>Dashboard Summary</h2>

                        <div className="summary-grid">
                            <article className="summary-card summary-events">
                                <span className="summary-icon">▦</span>
                                <p>Total Events</p>
                                <strong>{events.length}</strong>
                            </article>

                            <article className="summary-card summary-registrations">
                                <span className="summary-icon">♙</span>
                                <p>Total Registrations</p>
                                <strong>{totalRegistrations}</strong>
                            </article>

                            <article className="summary-card summary-seats">
                                <span className="summary-icon">✓</span>
                                <p>Seats Remaining</p>
                                <strong>{totalSeatsRemaining}</strong>
                            </article>
                        </div>
                    </section>
                </>
            )}
        </section>
    );
}

export default OrganizerDashboard;
