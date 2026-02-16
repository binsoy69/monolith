import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { JournalCalendar } from "@/components/journal/JournalCalendar";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Mock modules that might cause render issues in JSDOM environment if complex
// But try without mocking react-day-picker first as it should work in JSDOM

describe("JournalCalendar", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("renders the calendar", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    });

    render(<JournalCalendar />);

    // Check if calendar is present (by checking for days or month name)
    // Since month name depends on current date, we look for a generic calendar element or structure
    // Or specific text like "New Entry" button which is always there
    expect(screen.getByText("New Entry")).toBeTruthy();
  });

  it("fetches month entries on mount", async () => {
    const mockEntries = [
      {
        id: 1,
        entryDate: new Date().toISOString(),
        title: "Test Entry",
        tags: [],
      },
    ];

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: mockEntries }),
    });

    // Second call for the selected day (today)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entries: mockEntries }),
    });

    render(<JournalCalendar />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    // Verify the API call for month entries
    // Just checking if called with correct params structure is enough
    // URLSearchParams order might differ, so we can check if it contains startDate
    const calls = fetchMock.mock.calls;
    const urlCall1 = calls[0][0]; // First call usually month fetch
    expect(urlCall1).toContain("/api/journal?");
    expect(urlCall1).toContain("startDate=");
    expect(urlCall1).toContain("endDate=");
  });

  it("fetches day entries when a day is selected (default today)", async () => {
    const mockEntries = [
      {
        id: 1,
        entryDate: new Date().toISOString(),
        title: "Today Entry",
        content: "Content",
        tags: [],
      },
    ];

    // Mock both calls (month and day)
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ entries: mockEntries }),
    });

    render(<JournalCalendar />);

    await waitFor(() => {
      expect(screen.getByText("Today Entry")).toBeTruthy();
    });
  });
});
