
function EventCard({ event, onSelect }) {
    const when = new Date(event.date).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
    });

    const isFull = event.available_seats === 0;

    return (
        <article className="event-card">
            <h3>{event.title}</h3>

            <p className="event-meta">{when}</p>
            <p className="event-meta">{event.location}</p>

            {event.description && <p>{event.description}</p>}

            <p className={isFull ? "seats seats-full" : "seats"}>
                {isFull
                    ? "Event full"
                    : `${event.available_seats} of ${event.capacity} seats available`}
            </p>

            <button
                type="button"
                className="btn btn-small"
                onClick={() => onSelect(event.id)}
            >
                View details
            </button>
        </article>
    );
}

export default EventCard;
