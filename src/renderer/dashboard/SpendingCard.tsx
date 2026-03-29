import type { DashboardData } from "../../shared/ipc-types";

interface SpendingCardProps {
  data: DashboardData["spending"] | undefined;
  onClick: () => void;
}

function formatPeso(amount: number): string {
  const pesos = amount / 100;
  if (pesos === Math.floor(pesos)) {
    return `\u20B1${Math.floor(pesos).toLocaleString()}`;
  }
  return `\u20B1${pesos.toFixed(2)}`;
}

export function SpendingCard({
  data,
  onClick,
}: SpendingCardProps): React.JSX.Element {
  const todayTotal = data?.todayTotal ?? 0;
  const topCategories = data?.topCategories ?? [];
  const isEmpty = todayTotal === 0 && topCategories.length === 0;

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
          <div className="dashboard-card__eyebrow">expenses</div>
          <div className="dashboard-card__title">Money out</div>
        </div>
        {!isEmpty && <span className="dashboard-pill">today</span>}
      </div>

      <div>
        <div className="dashboard-card__value numeric">
          {formatPeso(todayTotal)}
        </div>
        <div className="dashboard-card__subvalue">
          recorded across wallets today
        </div>
      </div>

      {isEmpty ? (
        <p className="dashboard-empty">
          Nothing has been logged yet. Open expenses when cash starts moving.
        </p>
      ) : topCategories.length > 0 ? (
        <div className="dashboard-list">
          {topCategories.map((cat) => (
            <div key={cat.name} className="dashboard-list__item">
              <span
                className="dashboard-list__label"
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                {cat.color && (
                  <span
                    aria-hidden="true"
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "999px",
                      background: cat.color,
                      flexShrink: 0,
                    }}
                  />
                )}
                {cat.name}
              </span>
              <span className="dashboard-list__value">
                {formatPeso(cat.amount)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="dashboard-footer">
        <span>
          Wallet analytics stay available inside the expenses surface.
        </span>
        <span className="dashboard-footer__action">Open expenses</span>
      </div>
    </div>
  );
}
