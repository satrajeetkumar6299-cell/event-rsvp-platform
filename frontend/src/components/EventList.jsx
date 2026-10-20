import { useEffect, useState } from "react";
import { getEvents } from "../api/client.js";
import EventCard from "./EventCard.jsx";
import Loading from "./Loading.jsx";
import ErrorMessage from "./ErrorMessage.jsx";

function EventList({ onSelect }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getEvents()
            .then((data) => setEvents(data.events))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Loading text="Loading events..." />;
    if (error) return <ErrorMessage message={error} />;

    if (events.length === 0) {
        return (
            <p className="empty">
                No upcoming events yet. Use "Create Event" to add the first one.
            </p>
        );
    }

    return (
        <div className="event-grid">
            {events.map((event) => (
                <EventCard key={event.id} event={event} onSelect={onSelect} />
            ))}
        </div>
    );
}

export default EventList;