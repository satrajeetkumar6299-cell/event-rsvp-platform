
import { useEffect, useState } from "react";
import { getAttendees, cancelRegistration } from "../api/client.js";
import ErrorMessage from "./ErrorMessage.jsx";
import Loading from "./Loading.jsx";

function AttendeeList({ eventId, onChanged }) {
    const [attendees, setAttendees] = useState([]);
    const [event, setEvent] = useState(null);
    const [count, setCount] = useState(0);
    const [remainingCapacity, setRemainingCapacity] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyId, setBusyId] = useState("");

    async function loadAttendees() {
        setError("");

        try {
            const data = await getAttendees(eventId);
            setAttendees(data.attendees || []);
            setEvent(data.event || null);
            setCount(data.count ?? data.attendees?.length ?? 0);
            setRemainingCapacity(data.remaining_capacity ?? 0);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAttendees();
    }, [eventId]);

    async function handleCancel(attendee) {
        const confirmed = window.confirm(
            `Cancel registration for ${attendee.name}?`
        );

        if (!confirmed) return;

        setBusyId(attendee.id);
        setError("");

        try {
            await cancelRegistration(eventId, attendee.id);
            await loadAttendees();

            if (onChanged) {
                onChanged();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setBusyId("");
        }
    }

    if (loading) {
        return <Loading text="Loading attendees..." />;
    }

    return (
        <section className="card attendee-panel">
            <div className="attendee-heading">
                <div>
                    <h2>Attendee List</h2>
                    <p>
                        {event?.title || "Event"} · {count} registered ·{" "}
                        {remainingCapacity} seats remaining
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-small"
                    onClick={loadAttendees}
                >
                    Refresh
                </button>
            </div>

            {error && <ErrorMessage message={error} />}

            {attendees.length === 0 ? (
                <p className="empty">No attendees registered yet.</p>
            ) : (
                <div className="attendee-table-wrap">
                    <table className="attendee-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Registered at</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {attendees.map((attendee) => (
                                <tr key={attendee.id}>
                                    <td>{attendee.name}</td>
                                    <td>{attendee.email}</td>
                                    <td>
                                        {attendee.registered_at
                                            ? new Date(attendee.registered_at).toLocaleString()
                                            : "—"}
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-small"
                                            disabled={busyId === attendee.id}
                                            onClick={() => handleCancel(attendee)}
                                        >
                                            {busyId === attendee.id
                                                ? "Cancelling..."
                                                : "Cancel"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

export default AttendeeList;
