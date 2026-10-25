import { useEffect, useState } from "react";
import { getAttendees, cancelRegistration } from "../api/client.js";
import ErrorMessage from "./ErrorMessage.jsx";
import Loading from "./Loading.jsx";

function AttendeeList({ eventId, onChanged }) {
    const [view, setView] = useState(null);
    const [reloadToken, setReloadToken] = useState(0);
    const [busyId, setBusyId] = useState("");
    const [actionError, setActionError] = useState(null);

    useEffect(() => {
        let ignore = false;

        getAttendees(eventId)
            .then((data) => {
                if (!ignore) {
                    setView({ eventId, data, error: "" });
                }
            })
            .catch((err) => {
                if (!ignore) {
                    setView((previous) => ({
                        eventId,
                        data:
                            previous && previous.eventId === eventId
                                ? previous.data
                                : null,
                        error: err.message,
                    }));
                }
            });

        return () => {
            ignore = true;
        };
    }, [eventId, reloadToken]);

    function refresh() {
        setActionError(null);
        setReloadToken((token) => token + 1);
    }

    async function handleCancel(attendee) {
        const confirmed = window.confirm(
            `Cancel registration for ${attendee.name}?`
        );

        if (!confirmed) return;

        setBusyId(attendee.id);
        setActionError(null);

        try {
            await cancelRegistration(eventId, attendee.id);
            setReloadToken((token) => token + 1);

            if (onChanged) {
                onChanged();
            }
        } catch (err) {
            setActionError({ eventId, message: err.message });
        } finally {
            setBusyId("");
        }
    }

    const current = view && view.eventId === eventId ? view : null;

    if (!current) {
        return <Loading text="Loading attendees..." />;
    }

    const data = current.data;
    const attendees = data ? data.attendees || [] : [];
    const event = data ? data.event : null;
    const count = data ? data.count ?? attendees.length : 0;
    const remainingCapacity = data ? data.remaining_capacity ?? 0 : 0;
    const message =
        actionError && actionError.eventId === eventId
            ? actionError.message
            : current.error;

    return (
        <section className="card attendee-panel">
            <div className="attendee-heading">
                <div>
                    <h2>Attendee List</h2>
                    <p>
                        {data
                            ? `${event?.title || "Event"} · ${count} registered · ${remainingCapacity} seats remaining`
                            : "Attendees could not be loaded."}
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-small"
                    onClick={refresh}
                >
                    Refresh
                </button>
            </div>

            {message && <ErrorMessage message={message} />}

            {data && attendees.length === 0 && (
                <p className="empty">No attendees registered yet.</p>
            )}

            {data && attendees.length > 0 && (
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
