import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { ModuleId } from "../App";
import { HabitsCard } from "./HabitsCard";
import { TasksCard } from "./TasksCard";
import { SpendingCard } from "./SpendingCard";

function getTodayDateStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

interface DashboardViewProps {
  onNavigate: (module: ModuleId) => void;
}

export function DashboardView({
  onNavigate,
}: DashboardViewProps): React.JSX.Element {
  const todayStr = getTodayDateStr();

  const { data, isError, isPending } = useQuery({
    queryKey: ["dashboard", todayStr],
    queryFn: () => window.api.dashboard.getToday(todayStr),
    staleTime: 0,
    placeholderData: keepPreviousData,
  });

  const dateHeader = new Date(`${todayStr}T12:00:00`).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    },
  );

  if (isError) {
    return (
      <div className="dashboard-shell">
        <div
          className="surface-panel"
          style={{ padding: "28px", maxWidth: "560px" }}
        >
          <div className="dashboard-eyebrow">dashboard</div>
          <h1
            className="dashboard-title"
            style={{ fontSize: "36px", maxWidth: "none" }}
          >
            Today&apos;s summary is unavailable
          </h1>
          <p
            className="dashboard-description"
            style={{ marginTop: "var(--space-4)" }}
          >
            The dashboard request failed. Restart the app if the problem keeps
            showing up.
          </p>
        </div>
      </div>
    );
  }

  if (isPending && !data) {
    return (
      <div className="dashboard-shell">
        <section className="dashboard-hero">
          <div className="surface-panel dashboard-hero__copy">
            <div
              className="loading-skeleton"
              style={{ width: "120px", height: "14px" }}
            />
            <div
              className="loading-skeleton"
              style={{ width: "70%", height: "110px" }}
            />
            <div
              className="loading-skeleton"
              style={{ width: "88%", height: "54px" }}
            />
          </div>
          <div className="surface-panel dashboard-hero__pulse">
            <div className="dashboard-pulse-grid">
              <div className="loading-skeleton" style={{ height: "98px" }} />
              <div className="loading-skeleton" style={{ height: "98px" }} />
              <div className="loading-skeleton" style={{ height: "98px" }} />
            </div>
          </div>
        </section>
        <section className="dashboard-grid">
          <div className="dashboard-grid__stack">
            <div className="loading-skeleton" style={{ height: "260px" }} />
            <div className="loading-skeleton" style={{ height: "240px" }} />
          </div>
          <div className="loading-skeleton" style={{ height: "520px" }} />
        </section>
      </div>
    );
  }

  const habits = data?.habits;
  const tasks = data?.tasks;
  const spending = data?.spending;
  const food = data?.food;
  const tasksTotal = tasks?.totalIncomplete ?? 0;
  const habitsCompleted = habits?.completed ?? 0;
  const habitsTotal = habits?.total ?? 0;
  const spendingTotal = spending?.todayTotal ?? 0;
  const mealsToday = food?.mealsToday ?? 0;
  const topFoodThisWeek = food?.mostEatenThisWeek[0];

  return (
    <div className="dashboard-shell">
      <section className="dashboard-hero">
        <div className="surface-panel dashboard-hero__copy">
          <div>
            <div className="dashboard-eyebrow">daily control surface</div>
            <h1 className="dashboard-title">{dateHeader}</h1>
          </div>
          <p className="dashboard-description">
            Scan the day once, then move directly into the part of the system
            that needs attention.
          </p>
          <div className="dashboard-actions">
            <button
              className="dashboard-action dashboard-action--primary"
              onClick={() => onNavigate("planner")}
            >
              Open planner
            </button>
            <button
              className="dashboard-action"
              onClick={() => onNavigate("habits")}
            >
              Check habits
            </button>
            <button
              className="dashboard-action"
              onClick={() => onNavigate("expenses")}
            >
              Review spending
            </button>
            <button
              className="dashboard-action"
              onClick={() => onNavigate("food")}
            >
              Log meal
            </button>
          </div>
        </div>

        <div className="surface-panel dashboard-hero__pulse">
          <div className="dashboard-eyebrow">today at a glance</div>
          <div className="dashboard-pulse-grid" style={{ marginTop: "18px" }}>
            <div className="dashboard-pulse-stat">
              <span className="dashboard-pulse-label">habits</span>
              <span className="dashboard-pulse-value">
                {habitsCompleted}/{habitsTotal}
              </span>
            </div>
            <div className="dashboard-pulse-stat">
              <span className="dashboard-pulse-label">open tasks</span>
              <span className="dashboard-pulse-value">{tasksTotal}</span>
            </div>
            <div className="dashboard-pulse-stat">
              <span className="dashboard-pulse-label">spent</span>
              <span className="dashboard-pulse-value">
                P{(spendingTotal / 100).toLocaleString()}
              </span>
            </div>
            <div className="dashboard-pulse-stat">
              <span className="dashboard-pulse-label">meals</span>
              <span className="dashboard-pulse-value">{mealsToday}</span>
            </div>
          </div>
          <p className="dashboard-pulse-foot">
            Keep the daily loops visible: consistency, commitments, cash
            outflow, and food rhythm.
          </p>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-grid__stack">
          <HabitsCard data={habits} onClick={() => onNavigate("habits")} />
          <SpendingCard
            data={spending}
            onClick={() => onNavigate("expenses")}
          />
          <button
            className="surface-panel surface-panel--interactive dashboard-card"
            onClick={() => onNavigate("food")}
            style={{ textAlign: "left", border: "1px solid var(--color-border)" }}
          >
            <div className="dashboard-card__header">
              <div>
                <div className="dashboard-card__eyebrow">food</div>
                <div className="dashboard-card__title">Food rhythm</div>
              </div>
              <span className="dashboard-pill">{mealsToday} today</span>
            </div>
            <div>
              <div className="dashboard-card__value" style={{ fontSize: 30 }}>
                {topFoodThisWeek?.name ?? "No meals"}
              </div>
              <div className="dashboard-card__subvalue">
                {topFoodThisWeek
                  ? `${topFoodThisWeek.count} this week`
                  : "Log meals to build a weekly signal"}
              </div>
            </div>
          </button>
        </div>
        <TasksCard data={tasks} onClick={() => onNavigate("planner")} />
      </section>
    </div>
  );
}
