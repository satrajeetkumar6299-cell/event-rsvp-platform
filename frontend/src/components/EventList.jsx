
import { useEffect, useState } from "react";
import { getEvents, deleteEvent } from "../api/client.js";
import EventCard from "./EventCard.jsx";
import Loading from "./Loading.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import SuccessMessage from "./SuccessMessage.jsx";

function EventList({ onSelect }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadEvents() {
        setError("");

        try {
            const data = await getEvents();
            setEvents(data.events || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadEvents();
    }, []);

    async function handleDelete(eventId) {
        const event = events.find((item) => item.id === eventId);
        if (!event) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${event.title}"?`
        );

        if (!confirmed) return;

        setDeletingId(eventId);
        setError("");
        setSuccess("");

        try {
            const result = await deleteEvent(eventId);
            setEvents((current) =>
                current.filter((item) => item.id !== eventId)
            );
            setSuccess(result.message || "Event deleted successfully.");
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId("");
        }
    }

    if (loading) return <Loading text="Loading events..." />;

    if (error && events.length === 0) {
        return <ErrorMessage message={error} />;
    }

    return (
        <>
            {success && <SuccessMessage message={success} />}
            {error && <ErrorMessage message={error} />}

            {events.length === 0 ? (
                <p className="empty">
                    No upcoming events yet. Use "Create Event" to add the first one.
                </p>
            ) : (
                <div className="event-grid">
                    {events.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onSelect={onSelect}
                            onDelete={handleDelete}
                            deleting={deletingId === event.id}
                        />
                    ))}
                </div>
            )}
        </>
    );
}

export default EventList;
