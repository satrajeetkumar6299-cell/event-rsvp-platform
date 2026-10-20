import { useState } from "react";
import { registerForEvent } from "../api/client.js";
import ErrorMessage from "./ErrorMessage.jsx";
import SuccessMessage from "./SuccessMessage.jsx";

function RegistrationForm({ eventId, disabled, onUpdated, onRefresh }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");
        setFieldErrors({});
        setSubmitting(true);

        try {
            const result = await registerForEvent(eventId, { name, email });
            setSuccess(`${result.registration.name} is registered. See you at the event!`);
            setName("");
            setEmail("");
            onUpdated(result.event);
        } catch (err) {
            setError(err.message);
            setFieldErrors(err.details || {});
            if (err.status === 422 || err.status === 409) {
                onRefresh();
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="card form" onSubmit={handleSubmit} noValidate>
            <h2>Register for this event</h2>
            <SuccessMessage message={success} />
            <ErrorMessage message={error} />

            {disabled && (
                <p className="message message-error" role="status">
                    This event is full. Registration is closed.
                </p>
            )}

            <label htmlFor="reg-name">Full name</label>
            <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={disabled}
            />
            {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}

            <label htmlFor="reg-email">Email address</label>
            <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={disabled}
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}

            <button type="submit" className="btn" disabled={disabled || submitting}>
                {submitting ? "Registering..." : "Register"}
            </button>
        </form>
    );
}

export default RegistrationForm;