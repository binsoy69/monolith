import { useState, useCallback, useEffect } from "react";
import { Sidebar } from "./shell/Sidebar";
import { WindowChrome } from "./shell/WindowChrome";
import { ModuleHeader } from "./shell/ModuleHeader";
import { SettingsView } from "./settings/SettingsView";
import { UpdateBanner } from "./shell/UpdateBanner";
import { KeyboardRouter } from "./shell/KeyboardRouter";
import { KeyboardShortcutOverlay } from "./shell/KeyboardShortcutOverlay";
import { CommandPalette } from "./shell/CommandPalette";
import type { PaletteAction } from "./shell/CommandPalette";
import { ErrorBoundary } from "./shared/ErrorBoundary";
import { ToastContainer } from "./shared/ToastContainer";
import { HabitsView } from "./habits/HabitsView";
import { PlannerView } from "./planner/PlannerView";
import { ExpensesView } from "./expenses/ExpensesView";
import { DashboardView } from "./dashboard/DashboardView";
import { TagsView } from "./tags/TagsView";
import { usePlannerStore } from "./planner/planner-store";
import { useExpensesStore } from "./expenses/expenses-store";
import type { ShellModuleId } from "../shared/domain-types";
import type { SearchResult, UpdateStatus } from "../shared/ipc-types";

export type ModuleId = ShellModuleId;
type NewItemModuleId = Extract<ModuleId, "habits" | "planner" | "expenses">;

interface NewItemRequest {
  id: number;
  module: NewItemModuleId;
}

export function handleSearchSelect(
  result: SearchResult,
  setActiveModule: (module: ModuleId) => void,
  setHighlightHabitId: (id: string | undefined) => void,
  setHighlightTaskId: (id: string | undefined) => void,
  setHighlightExpenseId: (id: string | undefined) => void,
): void {
  setHighlightHabitId(undefined);
  setHighlightTaskId(undefined);
  setHighlightExpenseId(undefined);

  switch (result.type) {
    case "habit":
      setActiveModule("habits");
      setHighlightHabitId(result.id);
      break;
    case "task":
      setActiveModule("planner");
      usePlannerStore.getState().setActiveTab("tasks");
      usePlannerStore.getState().setViewDate(result.date!);
      setHighlightTaskId(result.id);
      break;
    case "daily_note":
      setActiveModule("planner");
      usePlannerStore.getState().setActiveTab("notes");
      usePlannerStore.getState().setViewDate(result.date!);
      break;
    case "expense":
      setActiveModule("expenses");
      useExpensesStore.getState().setFilters({
        startDate: result.date!,
        endDate: result.date!,
        categoryId: undefined,
      });
      setHighlightExpenseId(result.id);
      break;
  }
}

export default function App(): React.JSX.Element {
  const [activeModule, setActiveModule] = useState<ModuleId>("dashboard");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [newItemRequest, setNewItemRequest] = useState<NewItemRequest | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightHabitId, setHighlightHabitId] = useState<string>();
  const [highlightTaskId, setHighlightTaskId] = useState<string>();
  const [highlightExpenseId, setHighlightExpenseId] = useState<string>();
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    state: "idle",
  });

  const plannerNavigateDay = usePlannerStore((s) => s.navigateDay);
  const plannerGoToToday = usePlannerStore((s) => s.goToToday);

  const closeCommandPalette = useCallback(() => {
    setShowCommandPalette(false);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  const handleEscape = useCallback(() => {
    if (showCommandPalette) {
      closeCommandPalette();
      return;
    }
    if (showShortcuts) {
      setShowShortcuts(false);
      return;
    }
    if (activeModule !== "dashboard") {
      setActiveModule("dashboard");
    }
  }, [showCommandPalette, showShortcuts, activeModule, closeCommandPalette]);

  const requestNewItem = useCallback((module: NewItemModuleId) => {
    setNewItemRequest((current) => ({
      id: (current?.id ?? 0) + 1,
      module,
    }));
  }, []);

  const handleNewItem = useCallback(() => {
    if (
      activeModule === "habits" ||
      activeModule === "planner" ||
      activeModule === "expenses"
    ) {
      requestNewItem(activeModule);
    }
  }, [activeModule, requestNewItem]);

  const handleNewItemHandled = useCallback((requestId: number) => {
    setNewItemRequest((current) =>
      current?.id === requestId ? null : current,
    );
  }, []);

  const handlePaletteAction = useCallback((action: PaletteAction) => {
    closeCommandPalette();
    switch (action) {
      case "add-task":
        setActiveModule("planner");
        requestNewItem("planner");
        break;
      case "log-expense":
        setActiveModule("expenses");
        requestNewItem("expenses");
        break;
      case "check-habit":
        setActiveModule("habits");
        requestNewItem("habits");
        break;
    }
  }, [closeCommandPalette, requestNewItem]);

  const onSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const onSelectSearchResult = useCallback(
    (result: SearchResult) => {
      handleSearchSelect(
        result,
        setActiveModule,
        setHighlightHabitId,
        setHighlightTaskId,
        setHighlightExpenseId,
      );
      closeCommandPalette();
    },
    [closeCommandPalette],
  );

  useEffect(() => {
    return window.api.shell.onNavigate((payload) => {
      if (payload.module === "habits") {
        setActiveModule("habits");
      }
    });
  }, []);

  useEffect(() => {
    return window.api.shell.onUpdateStatus((payload) => {
      setUpdateStatus(payload);
    });
  }, []);

  useEffect(() => {
    if (!showCommandPalette || searchQuery.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setIsSearching(true);
      void window.api.search
        .query({ query: searchQuery, limit: 8 })
        .then((results) => {
          if (!cancelled) {
            setSearchResults(results);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setSearchResults([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsSearching(false);
          }
        });
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery, showCommandPalette]);

  useEffect(() => {
    if (!highlightHabitId) {
      return;
    }
    const timer = window.setTimeout(() => setHighlightHabitId(undefined), 1500);
    return () => window.clearTimeout(timer);
  }, [highlightHabitId]);

  useEffect(() => {
    if (!highlightTaskId) {
      return;
    }
    const timer = window.setTimeout(() => setHighlightTaskId(undefined), 1500);
    return () => window.clearTimeout(timer);
  }, [highlightTaskId]);

  useEffect(() => {
    if (!highlightExpenseId) {
      return;
    }
    const timer = window.setTimeout(() => setHighlightExpenseId(undefined), 1500);
    return () => window.clearTimeout(timer);
  }, [highlightExpenseId]);

  return (
    <div className="app-shell">
      <a className="app-skip-link" href="#app-main">
        Skip to content
      </a>

      <KeyboardRouter
        onNavigate={setActiveModule}
        onShowShortcuts={() => setShowShortcuts(true)}
        onEscape={handleEscape}
        activeModule={activeModule}
        onNewItem={handleNewItem}
        onNavigateDay={plannerNavigateDay}
        onGoToToday={plannerGoToToday}
        onCommandPalette={() => setShowCommandPalette(true)}
      />

      {updateStatus.state !== "idle" && updateStatus.state !== "not-available" ? (
        <UpdateBanner
          status={updateStatus}
          onInstall={() => void window.api.shell.installUpdate()}
        />
      ) : null}

      <div className="app-frame">
        <WindowChrome activeModule={activeModule} />
        <div className="app-layout">
          <Sidebar activeModule={activeModule} onNavigate={setActiveModule} />
          <div className="app-main">
            <div className="app-main-panel">
              {activeModule === "settings" ? (
                <>
                  <ModuleHeader moduleId={activeModule} />
                  <main id="app-main" style={{ flex: 1, overflow: "auto" }}>
                    <SettingsView />
                  </main>
                </>
              ) : activeModule === "habits" ? (
                <ErrorBoundary moduleName="Habits">
                  <main
                    id="app-main"
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <HabitsView
                      newItemRequestId={
                        newItemRequest?.module === "habits"
                          ? newItemRequest.id
                          : undefined
                      }
                      onNewItemHandled={handleNewItemHandled}
                      highlightHabitId={highlightHabitId}
                    />
                  </main>
                </ErrorBoundary>
              ) : activeModule === "planner" ? (
                <ErrorBoundary moduleName="Planner">
                  <main
                    id="app-main"
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <PlannerView
                      newItemRequestId={
                        newItemRequest?.module === "planner"
                          ? newItemRequest.id
                          : undefined
                      }
                      onNewItemHandled={handleNewItemHandled}
                      highlightTaskId={highlightTaskId}
                    />
                  </main>
                </ErrorBoundary>
              ) : activeModule === "expenses" ? (
                <ErrorBoundary moduleName="Expenses">
                  <main
                    id="app-main"
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <ExpensesView
                      newItemRequestId={
                        newItemRequest?.module === "expenses"
                          ? newItemRequest.id
                          : undefined
                      }
                      onNewItemHandled={handleNewItemHandled}
                      highlightExpenseId={highlightExpenseId}
                    />
                  </main>
                </ErrorBoundary>
              ) : activeModule === "tags" ? (
                <ErrorBoundary moduleName="Tags">
                  <main
                    id="app-main"
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <TagsView />
                  </main>
                </ErrorBoundary>
              ) : (
                <ErrorBoundary moduleName="Dashboard">
                  <main
                    id="app-main"
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <DashboardView onNavigate={setActiveModule} />
                  </main>
                </ErrorBoundary>
              )}
            </div>
          </div>
        </div>
      </div>

      {showShortcuts ? (
        <KeyboardShortcutOverlay
          isOpen={showShortcuts}
          onClose={() => setShowShortcuts(false)}
        />
      ) : null}
      {showCommandPalette ? (
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={closeCommandPalette}
          onAction={handlePaletteAction}
          results={searchResults}
          isSearching={isSearching}
          onSearchQueryChange={onSearchQueryChange}
          onSelectResult={onSelectSearchResult}
        />
      ) : null}
      <ToastContainer />
    </div>
  );
}
