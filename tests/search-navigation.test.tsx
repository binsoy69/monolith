import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@phosphor-icons/react", () => {
  const Icon = () => null;
  return {
    Checks: Icon,
    ForkKnife: Icon,
    Pulse: Icon,
    SlidersHorizontal: Icon,
    SquaresFour: Icon,
    Wallet: Icon,
  };
});

import { handleSearchSelect } from "../src/renderer/App";
import { useExpensesStore } from "../src/renderer/expenses/expenses-store";
import { usePlannerStore } from "../src/renderer/planner/planner-store";
import type { SearchResult } from "../src/shared/ipc-types";

const initialPlannerState = usePlannerStore.getState();
const initialExpensesState = useExpensesStore.getState();
let setPlannerTab: ReturnType<typeof vi.fn>;
let setPlannerDate: ReturnType<typeof vi.fn>;
let setExpenseFilters: ReturnType<typeof vi.fn>;

describe("handleSearchSelect", () => {
  beforeEach(() => {
    setPlannerTab = vi.fn();
    setPlannerDate = vi.fn();
    setExpenseFilters = vi.fn();

    usePlannerStore.setState({
      ...initialPlannerState,
      setActiveTab: setPlannerTab,
      setViewDate: setPlannerDate,
    });
    useExpensesStore.setState({
      ...initialExpensesState,
      setFilters: setExpenseFilters,
    });
  });

  afterEach(() => {
    usePlannerStore.setState(initialPlannerState);
    useExpensesStore.setState(initialExpensesState);
    vi.restoreAllMocks();
  });

  it("routes task results to the planner tasks tab for the matching date", () => {
    const setActiveModule = vi.fn();
    const setHighlightHabitId = vi.fn();
    const setHighlightTaskId = vi.fn();
    const setHighlightExpenseId = vi.fn();
    const result: SearchResult = {
      type: "task",
      id: "task-1",
      title: "Review plan",
      subtitle: "Task",
      snippet: null,
      date: "2026-03-29",
    };

    handleSearchSelect(
      result,
      setActiveModule,
      setHighlightHabitId,
      setHighlightTaskId,
      setHighlightExpenseId,
    );

    expect(setActiveModule).toHaveBeenCalledWith("planner");
    expect(setPlannerTab).toHaveBeenCalledWith("tasks");
    expect(setPlannerDate).toHaveBeenCalledWith("2026-03-29");
    expect(setHighlightHabitId).toHaveBeenCalledWith(undefined);
    expect(setHighlightTaskId).toHaveBeenLastCalledWith("task-1");
    expect(setHighlightExpenseId).toHaveBeenCalledWith(undefined);
  });

  it("routes daily-note results to the planner notes tab for the matching date", () => {
    const setActiveModule = vi.fn();
    const setHighlightHabitId = vi.fn();
    const setHighlightTaskId = vi.fn();
    const setHighlightExpenseId = vi.fn();
    const result: SearchResult = {
      type: "daily_note",
      id: "2026-03-28",
      title: "Daily note",
      subtitle: "Notes",
      snippet: "Captured a decision about search.",
      date: "2026-03-28",
    };

    handleSearchSelect(
      result,
      setActiveModule,
      setHighlightHabitId,
      setHighlightTaskId,
      setHighlightExpenseId,
    );

    expect(setActiveModule).toHaveBeenCalledWith("planner");
    expect(setPlannerTab).toHaveBeenCalledWith("notes");
    expect(setPlannerDate).toHaveBeenCalledWith("2026-03-28");
    expect(setHighlightHabitId).toHaveBeenCalledWith(undefined);
    expect(setHighlightTaskId).toHaveBeenCalledWith(undefined);
    expect(setHighlightExpenseId).toHaveBeenCalledWith(undefined);
  });

  it("applies same-day expense filters before highlighting the matched expense", () => {
    const setActiveModule = vi.fn();
    const setHighlightHabitId = vi.fn();
    const setHighlightTaskId = vi.fn();
    const setHighlightExpenseId = vi.fn();
    const result: SearchResult = {
      type: "expense",
      id: "expense-1",
      title: "Coffee",
      subtitle: "Expense",
      snippet: "Food",
      date: "2026-03-27",
    };

    handleSearchSelect(
      result,
      setActiveModule,
      setHighlightHabitId,
      setHighlightTaskId,
      setHighlightExpenseId,
    );

    expect(setActiveModule).toHaveBeenCalledWith("expenses");
    expect(setExpenseFilters).toHaveBeenCalledWith({
      startDate: "2026-03-27",
      endDate: "2026-03-27",
      categoryId: undefined,
    });
    expect(setHighlightExpenseId).toHaveBeenLastCalledWith("expense-1");

    const filterOrder = setExpenseFilters.mock.invocationCallOrder[0];
    const highlightOrder =
      setHighlightExpenseId.mock.invocationCallOrder[
        setHighlightExpenseId.mock.invocationCallOrder.length - 1
      ];

    expect(filterOrder).toBeLessThan(highlightOrder);
  });
});
