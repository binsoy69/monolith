import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CommandPalette } from "../src/renderer/shell/CommandPalette";
import type { SearchResult } from "../src/shared/ipc-types";

const habitResult: SearchResult = {
  type: "habit",
  id: "habit-1",
  title: "Deep work",
  subtitle: "Habit",
  snippet: null,
  date: null,
};

describe("CommandPalette search", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders action and search result sections in the same palette", () => {
    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        onAction={vi.fn()}
        results={[habitResult]}
        isSearching={false}
        onSearchQueryChange={vi.fn()}
        onSelectResult={vi.fn()}
      />,
    );

    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByText("Search Results")).toBeInTheDocument();
  });

  it("shows an empty search state when the query has no matching results", () => {
    const onSearchQueryChange = vi.fn();

    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        onAction={vi.fn()}
        results={[]}
        isSearching={false}
        onSearchQueryChange={onSearchQueryChange}
        onSelectResult={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText("Search habits, tasks, expenses, notes..."),
      {
        target: { value: "zzzz" },
      },
    );

    expect(onSearchQueryChange).toHaveBeenCalledWith("zzzz");
    expect(screen.getByText("No matching results")).toBeInTheDocument();
  });

  it("submits the active search result when Enter is pressed", () => {
    const onAction = vi.fn();
    const onSelectResult = vi.fn();

    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        onAction={onAction}
        results={[habitResult]}
        isSearching={false}
        onSearchQueryChange={vi.fn()}
        onSelectResult={onSelectResult}
      />,
    );

    const input = screen.getByPlaceholderText(
      "Search habits, tasks, expenses, notes...",
    );

    fireEvent.change(input, {
      target: { value: "deep focus session" },
    });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSelectResult).toHaveBeenCalledWith(habitResult);
    expect(onAction).not.toHaveBeenCalled();
  });
});
