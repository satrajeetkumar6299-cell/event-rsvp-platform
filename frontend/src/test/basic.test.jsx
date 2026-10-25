
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EventCard from "../components/EventCard";

const event = {
    id: "event-1",
    title: "React Workshop",
    date: "2026-12-20T10:00:00",
    location: "Puducherry",
    description: "Learn React fundamentals",
    available_seats: 5,
    capacity: 20,
};

describe("EventCard", () => {
    it("displays event details and available seats", () => {
        render(
            <EventCard
                event={event}
                onSelect={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(
            screen.getByRole("heading", { name: "React Workshop" })
        ).toBeInTheDocument();

        expect(screen.getByText("Puducherry")).toBeInTheDocument();
        expect(
            screen.getByText("Learn React fundamentals")
        ).toBeInTheDocument();
        expect(
            screen.getByText("5 of 20 seats available")
        ).toBeInTheDocument();
    });

    it("shows Event full when no seats are available", () => {
        render(
            <EventCard
                event={{ ...event, available_seats: 0 }}
                onSelect={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(screen.getByText("Event full")).toBeInTheDocument();
    });

    it("calls onSelect with the event ID", () => {
        const onSelect = vi.fn();

        render(
            <EventCard
                event={event}
                onSelect={onSelect}
                onDelete={vi.fn()}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: "View details" })
        );

        expect(onSelect).toHaveBeenCalledWith("event-1");
    });

    it("calls onDelete with the event ID", () => {
        const onDelete = vi.fn();

        render(
            <EventCard
                event={event}
                onSelect={vi.fn()}
                onDelete={onDelete}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Delete Event" })
        );

        expect(onDelete).toHaveBeenCalledWith("event-1");
    });

    it("disables the delete button while deleting", () => {
        render(
            <EventCard
                event={event}
                onSelect={vi.fn()}
                onDelete={vi.fn()}
                deleting={true}
            />
        );

        expect(
            screen.getByRole("button", { name: "Deleting..." })
        ).toBeDisabled();
    });
});
