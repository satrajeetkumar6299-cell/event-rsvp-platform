
const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5001";

async function request(path, options = {}) {
    let response;

    try {
        response = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers: options.body
                ? { "Content-Type": "application/json" }
                : {},
        });
    } catch {
        throw new Error(
            "Cannot reach the backend. Is Flask running on port 5001?"
        );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.error || "Something went wrong.");
        error.status = response.status;
        error.details = data.details || {};
        throw error;
    }

    return data;
}

export function checkHealth() {
    return request("/api/health");
}

export function getEvents() {
    return request("/api/events");
}

export function getEvent(eventId) {
    return request(`/api/events/${eventId}`);
}

export function createEvent(payload) {
    return request("/api/events", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function registerForEvent(eventId, payload) {
    return request(`/api/events/${eventId}/registrations`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function getAttendees(eventId) {
    return request(`/api/events/${eventId}/attendees`);
}

export function cancelRegistration(eventId, registrationId) {
    return request(
        `/api/events/${eventId}/registrations/${registrationId}`,
        { method: "DELETE" }
    );
}


export function deleteEvent(eventId) {
    return request(`/api/events/${eventId}`, {
        method: "DELETE",
    });
}
