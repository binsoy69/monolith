// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExpensesView } from "../src/renderer/expenses/ExpensesView";
import { useExpensesStore } from "../src/renderer/expenses/expenses-store";

function installMatchMedia(): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function createApiMock(): typeof window.api {
  return {
    settings: { get: vi.fn(), set: vi.fn() },
    window: { minimize: vi.fn(), maximize: vi.fn(), close: vi.fn() },
    habits: {
      getToday: vi.fn(),
      listArchived: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      archive: vi.fn(),
      complete: vi.fn(),
      uncomplete: vi.fn(),
      getHistory: vi.fn(),
      reorder: vi.fn(),
      incrementCount: vi.fn(),
      setCount: vi.fn(),
      resetCount: vi.fn(),
    },
    planner: {
      listForDate: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      reorder: vi.fn(),
      getNotes: vi.fn(),
      saveNotes: vi.fn(),
      getDatesWithTasks: vi.fn(),
    },
    expenses: {
      listExpenses: vi.fn().mockResolvedValue([]),
      createExpense: vi.fn(),
      updateExpense: vi.fn(),
      deleteExpense: vi.fn(),
      listCategories: vi.fn().mockResolvedValue([]),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
      listWallets: vi.fn().mockResolvedValue([]),
      createWallet: vi.fn(),
      updateWallet: vi.fn(),
      adjustWalletBalance: vi.fn(),
      deleteWallet: vi.fn(),
      listWalletTransactions: vi.fn(),
      getAnalytics: vi.fn().mockResolvedValue({
        month: "2026-03",
        monthLabel: "March 2026",
        monthTotal: 0,
        categoryBreakdown: [],
        trend: [],
      }),
    },
    dashboard: {
      getToday: vi.fn(),
    },
    tags: {
      list: vi.fn(),
      create: vi.fn(),
      listForItem: vi.fn(),
      setAssignment: vi.fn(),
      getItemsByTag: vi.fn(),
    },
    search: {
      query: vi.fn().mockResolvedValue([]),
    },
  };
}

describe("ExpensesView", () => {
  beforeEach(() => {
    installMatchMedia();
    useExpensesStore.setState({
      wallets: [],
      categories: [],
      expenses: [],
      walletsLoaded: false,
      categoriesLoaded: false,
      expensesLoaded: false,
      analytics: null,
      analyticsLoaded: false,
      trendMonths: 6,
      filters: {},
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("loads wallets, categories, expenses, and analytics once on initial render", async () => {
    const api = createApiMock();
    window.api = api as typeof window.api;

    render(<ExpensesView />);

    await waitFor(() => {
      expect(api.expenses.listWallets).toHaveBeenCalledTimes(1);
      expect(api.expenses.listCategories).toHaveBeenCalledTimes(1);
      expect(api.expenses.listExpenses).toHaveBeenCalledTimes(1);
      expect(api.expenses.getAnalytics).toHaveBeenCalledTimes(1);
    });
  });
});
