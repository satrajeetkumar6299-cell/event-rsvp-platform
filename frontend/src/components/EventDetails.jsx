import { useCallback, useEffect, useState } from "react";
import { getEvent } from "../api/client.js";
import Loading from "./Loading.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import RegistrationForm from "./RegistrationForm.jsx";

function EventDetails({ eventId, onBack }) {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadEvent = useCallback(() => {
        return getEvent(eventId)
            .then((data) => setEvent(data))
            .catch((err) => setError(err.message));
    }, [eventId]);

    useEffect(() => {
        loadEvent().finally(() => setLoading(false));
    }, [loadEvent]);

    if (loading) return <Loading text="Loading event..." />;

    if (error || !event) {
        return (
            <>
                <button type="button" className="link-btn" onClick={onBack}>
                    Back to events
                </button>
                <ErrorMessage message={error || "Event not found"} />
            </>
        );
    }

    const when = new Date(event.date).toLocaleString([], {
        dateStyle: "full",
        timeStyle: "short",
    });
    const isFull = event.available_seats === 0;

    return (
        <>
            <button type="button" className="link-btn" onClick={onBack}>
                Back to events
            </button>

            <section className="card details">
                <h1>{event.title}</h1>
                <p className="event-meta">{when}</p>
                <p className="event-meta">{event.location}</p>
                {event.description && <p>{event.description}</p>}

                <ul className="seat-summary">
                    <li>
                        Capacity: <strong>{event.capacity}</strong>
                    </li>
                    <li>
                        Registered: <strong>{event.registered_count}</strong>
                    </li>
                    <li>
                        Seats remaining:{" "}
                        <strong className={isFull ? "seats-full" : "seats"}>
                            {event.available_seats}
                        </strong>
                    </li>
                </ul>
            </section>

            <RegistrationForm
                eventId={event.id}
                disabled={isFull}
                onUpdated={setEvent}
                onRefresh={loadEvent}
            />
        </>
    );
}

export default EventDetails;