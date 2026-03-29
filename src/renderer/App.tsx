import { useState, useCallback } from "react";
import { Sidebar } from "./shell/Sidebar";
import { WindowChrome } from "./shell/WindowChrome";
import { ModuleHeader } from "./shell/ModuleHeader";
import { SettingsView } from "./settings/SettingsView";
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
import { usePlannerStore } from "./planner/planner-store";

export type ModuleId =
  | "dashboard"
  | "habits"
  | "planner"
  | "expenses"
  | "settings";

export default function App(): React.JSX.Element {
  const [activeModule, setActiveModule] = useState<ModuleId>("dashboard");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [newItemTrigger, setNewItemTrigger] = useState(0);

  const plannerNavigateDay = usePlannerStore((s) => s.navigateDay);
  const plannerGoToToday = usePlannerStore((s) => s.goToToday);

  const handleEscape = useCallback(() => {
    if (showCommandPalette) {
      setShowCommandPalette(false);
      return;
    }
    if (showShortcuts) {
      setShowShortcuts(false);
      return;
    }
    if (activeModule !== "dashboard") {
      setActiveModule("dashboard");
    }
  }, [showCommandPalette, showShortcuts, activeModule]);

  const handleNewItem = useCallback(() => {
    setNewItemTrigger((n) => n + 1);
  }, []);

  const handlePaletteAction = useCallback((action: PaletteAction) => {
    setShowCommandPalette(false);
    switch (action) {
      case "add-task":
        setActiveModule("planner");
        setNewItemTrigger((n) => n + 1);
        break;
      case "log-expense":
        setActiveModule("expenses");
        setNewItemTrigger((n) => n + 1);
        break;
      case "check-habit":
        setActiveModule("habits");
        setNewItemTrigger((n) => n + 1);
        break;
    }
  }, []);

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
                    <HabitsView newItemTrigger={newItemTrigger} />
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
                    <PlannerView newItemTrigger={newItemTrigger} />
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
                    <ExpensesView newItemTrigger={newItemTrigger} />
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
          onClose={() => setShowCommandPalette(false)}
          onAction={handlePaletteAction}
        />
      ) : null}
      <ToastContainer />
    </div>
  );
}
