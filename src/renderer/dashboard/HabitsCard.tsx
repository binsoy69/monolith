import type { DashboardData } from "../../shared/ipc-types";

interface HabitsCardProps {
  data: DashboardData["habits"] | undefined;
  onClick: () => void;
}

export function HabitsCard({
  data,
  onClick,
}: HabitsCardProps): React.JSX.Element {
  const total = data?.total ?? 0;
  const completed = data?.completed ?? 0;
  const streakHighlights = data?.streakHighlights ?? [];
  const percentage = total > 0 ? (completed / total) * 100 : 0;

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
          <div className="dashboard-card__eyebrow">habits</div>
          <div className="dashboard-card__title">Consistency loop</div>
        </div>
        {total > 0 && (
          <span className="dashboard-pill numeric">
            {completed}/{total} closed
          </span>
        )}
      </div>

      {total === 0 ? (
        <p className="dashboard-empty">
          Nothing is scheduled here today. Add a habit to keep the daily
          baseline visible.
        </p>
      ) : (
        <>
          <div>
            <div className="dashboard-card__value numeric">
              {Math.round(percentage)}%
            </div>
            <div className="dashboard-card__subvalue">
              scheduled habits completed today
            </div>
          </div>

          <div className="dashboard-progress">
            <div className="dashboard-progress__track">
              <div
                className="dashboard-progress__bar"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {streakHighlights.length > 0 && (
            <div className="dashboard-list">
              {streakHighlights.slice(0, 3).map((h) => (
                <div key={h.name} className="dashboard-list__item">
                  <span className="dashboard-list__label">{h.name}</span>
                  <span className="dashboard-list__value">
                    {h.currentStreak}d
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="dashboard-footer">
        <span>Drag order and count habits live in the module view.</span>
        <span className="dashboard-footer__action">Open habits</span>
      </div>
    </div>
  );
}
