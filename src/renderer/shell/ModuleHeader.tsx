import React from "react";
import type { ModuleId } from "../App";

interface ModuleHeaderProps {
  moduleId: ModuleId;
  left?: React.ReactNode;
  right?: React.ReactNode;
}

const MODULE_NAMES: Record<ModuleId, string> = {
  dashboard: "Dashboard",
  habits: "Habits",
  planner: "Planner",
  expenses: "Expenses",
  settings: "Settings",
};

export function ModuleHeader({
  moduleId,
  left,
  right,
}: ModuleHeaderProps): React.JSX.Element {
  return (
    <div className="module-header">
      <div className="module-header__title">
        <span className="module-header__eyebrow">workspace</span>
        <div className="module-header__row">
          <span className="module-header__name">{MODULE_NAMES[moduleId]}</span>
          {left}
        </div>
      </div>
      {right && <div className="module-header__actions">{right}</div>}
    </div>
  );
}
