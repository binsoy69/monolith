import type { DashboardData } from "../../shared/ipc-types";

interface TasksCardProps {
  data: DashboardData["tasks"] | undefined;
  onClick: () => void;
}

export function TasksCard({
  data,
  onClick,
}: TasksCardProps): React.JSX.Element {
  const todayIncomplete = data?.todayIncomplete ?? [];
  const totalIncomplete = data?.totalIncomplete ?? 0;
  const overdueCount = data?.overdueCount ?? 0;

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      className="surface-panel surface-panel--interactive dashboard-card focus-ring"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="dashboard-card__header">
        <div>
          <div className="dashboard-card__eyebrow">planner</div>
          <div className="dashboard-card__title">Open loops</div>
        </div>
        {overdueCount > 0 && (
          <span className="dashboard-pill dashboard-pill--warning numeric">
            {overdueCount} overdue
          </span>
        )}
      </div>

      {totalIncomplete === 0 ? (
        <p className="dashboard-empty">
          The planner is clear for today. Use the module to add work before
          anything slips.
        </p>
      ) : (
        <>
          <div>
            <div className="dashboard-card__value numeric">
              {totalIncomplete}
            </div>
            <div className="dashboard-card__subvalue">
              remaining items across today and carry-forward work
            </div>
          </div>

          <div className="dashboard-list">
            {todayIncomplete.slice(0, 5).map((task) => (
              <div key={task.id} className="dashboard-list__item">
                <span className="dashboard-list__label">{task.title}</span>
                <span className="dashboard-pill">today</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="dashboard-footer">
        <span>
          {todayIncomplete.length > 0
            ? `${todayIncomplete.length} visible on this surface.`
            : "Planner is waiting for input."}
        </span>
        <span className="dashboard-footer__action">Open planner</span>
      </div>
    </div>
  );
}
