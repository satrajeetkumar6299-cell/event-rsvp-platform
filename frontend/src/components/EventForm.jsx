import { useState } from "react";
import { createEvent } from "../api/client.js";
import ErrorMessage from "./ErrorMessage.jsx";

const emptyForm = {
    title: "",
    description: "",
    date: "",
    location: "",
    capacity: "",
};

function EventForm({ onCreated }) {
    const [form, setForm] = useState(emptyForm);
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    function handleChange(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setFieldErrors({});
        setSubmitting(true);

        const payload = {
            title: form.title,
            description: form.description,
            location: form.location,
            date: form.date
                ? new Date(form.date).toISOString().replace(".000Z", "Z")
                : "",
            capacity: form.capacity === "" ? null : Number(form.capacity),
        };

        try {
            const created = await createEvent(payload);
            setForm(emptyForm);
            onCreated(created);
        } catch (err) {
            setError(err.message);
            setFieldErrors(err.details || {});
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="card form" onSubmit={handleSubmit} noValidate>
            <h2>Create a new event</h2>
            <ErrorMessage message={error} />

            <label htmlFor="title">Event title</label>
            <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
            />
            {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}

            <label htmlFor="description">Description</label>
            <textarea
                id="description"
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
            />
            {fieldErrors.description && (
                <span className="field-error">{fieldErrors.description}</span>
            )}

            <label htmlFor="date">Date and time</label>
            <input
                id="date"
                name="date"
                type="datetime-local"
                value={form.date}
                onChange={handleChange}
            />
            {fieldErrors.date && <span className="field-error">{fieldErrors.date}</span>}

            <label htmlFor="location">Location</label>
            <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
            />
            {fieldErrors.location && (
                <span className="field-error">{fieldErrors.location}</span>
            )}

            <label htmlFor="capacity">Maximum attendees</label>
            <input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={form.capacity}
                onChange={handleChange}
            />
            {fieldErrors.capacity && (
                <span className="field-error">{fieldErrors.capacity}</span>
            )}

            <button type="submit" className="btn" disabled={submitting}>
                {submitting ? "Creating..." : "Create event"}
            </button>
        </form>
    );
}

export default EventForm;