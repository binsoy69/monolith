// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "../src/renderer/shell/Sidebar";
import { TagsView } from "../src/renderer/tags/TagsView";
import { useTagsStore } from "../src/renderer/tags/tags-store";

const workTag = {
  id: "tag-work",
  name: "Work",
  color: "#5b8def",
  createdAt: "2026-03-29T00:00:00.000Z",
};

function installApiMock(): void {
  window.api = {
    tags: {
      list: vi.fn().mockResolvedValue([workTag]),
      create: vi.fn(),
      listForItem: vi.fn().mockResolvedValue([]),
      setAssignment: vi.fn(),
      getItemsByTag: vi.fn().mockResolvedValue([]),
    },
  } as typeof window.api;
}

describe("Tag sidebar and view", () => {
  beforeEach(() => {
    installApiMock();
    useTagsStore.setState({
      tags: [],
      selectedTagId: null,
      items: [],
      isLoaded: true,
      assignmentCache: {},
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders a Tags section in the sidebar when tags exist", () => {
    useTagsStore.setState({
      tags: [workTag],
      selectedTagId: null,
      items: [],
      isLoaded: true,
      assignmentCache: {},
    });

    render(<Sidebar activeModule="dashboard" onNavigate={vi.fn()} />);

    expect(screen.getByText("Tags")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Work" })).toBeInTheDocument();
  });

  it("clicking a tag routes to the tags module", async () => {
    const onNavigate = vi.fn();
    useTagsStore.setState({
      tags: [workTag],
      selectedTagId: null,
      items: [],
      isLoaded: true,
      assignmentCache: {},
    });

    render(<Sidebar activeModule="dashboard" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole("button", { name: "Work" }));

    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith("tags");
      expect(useTagsStore.getState().selectedTagId).toBe("tag-work");
    });
  });

  it("renders grouped section headings in TagsView", () => {
    useTagsStore.setState({
      tags: [workTag],
      selectedTagId: "tag-work",
      items: [
        {
          itemType: "habit",
          itemId: "habit-1",
          title: "Morning walk",
          subtitle: "Habit",
          date: null,
        },
        {
          itemType: "task",
          itemId: "task-1",
          title: "Draft roadmap",
          subtitle: "Task",
          date: "2026-03-29",
        },
        {
          itemType: "expense",
          itemId: "expense-1",
          title: "Coffee",
          subtitle: "Expense",
          date: "2026-03-28",
        },
      ],
      isLoaded: true,
      assignmentCache: {},
    });

    render(<TagsView />);

    expect(screen.getByText("Habits")).toBeInTheDocument();
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Expenses")).toBeInTheDocument();
  });

  it("shows the empty state when no tag is selected", () => {
    useTagsStore.setState({
      tags: [workTag],
      selectedTagId: null,
      items: [],
      isLoaded: true,
      assignmentCache: {},
    });

    render(<TagsView />);

    expect(screen.getByText("Select a tag from the sidebar")).toBeInTheDocument();
  });
});
