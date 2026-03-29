// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DailyNotesView } from "../src/renderer/planner/DailyNotesView";
import { usePlannerStore } from "../src/renderer/planner/planner-store";

describe("DailyNotesView", () => {
  beforeEach(() => {
    usePlannerStore.setState({
      notesContent: "",
      loadNotes: vi.fn().mockResolvedValue(undefined),
      saveNotes: vi.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("flushes unsaved notes when the view unmounts before the debounce completes", () => {
    const saveNotes = vi.fn().mockResolvedValue(undefined);
    usePlannerStore.setState({ saveNotes });

    const { unmount } = render(<DailyNotesView date="2026-03-29" />);

    fireEvent.change(
      screen.getByPlaceholderText("Write anything about today..."),
      {
        target: { value: "Capture this before leaving the page." },
      },
    );

    unmount();

    expect(saveNotes).toHaveBeenCalledWith(
      "2026-03-29",
      "Capture this before leaving the page.",
    );
  });
});
