import type { ShellModuleId } from "../../shared/domain-types";

const isMac = navigator.platform.toLowerCase().includes("mac");

interface WindowChromeProps {
  activeModule: ShellModuleId;
}

const MODULE_COPY: Record<WindowChromeProps["activeModule"], string> = {
  dashboard: "daily brief",
  habits: "habit tracking",
  planner: "planner flow",
  expenses: "expense control",
  settings: "workspace settings",
  tags: "tag browser",
};

const controlButtonStyle = (color: string): React.CSSProperties =>
  ({
    backgroundColor: color,
    WebkitAppRegion: "no-drag",
  }) as React.CSSProperties;

export function WindowChrome({
  activeModule,
}: WindowChromeProps): React.JSX.Element {
  return (
    <div className="chrome-surface">
      <div className="chrome-brand">
        <div className="chrome-brand-mark">M</div>
        <div className="chrome-brand-copy">
          <span className="chrome-brand-title">Monolith</span>
          <span className="chrome-brand-subtitle">
            personal operations console
          </span>
        </div>
      </div>

      <div className="chrome-current">
        <span className="chrome-current-label">active surface</span>
        <span className="chrome-current-value">
          {MODULE_COPY[activeModule]}
        </span>
      </div>

      {!isMac && (
        <div className="window-controls">
          <button
            className="control-button"
            onClick={() => window.api.window.minimize()}
            title="Minimize"
            aria-label="Minimize window"
            style={controlButtonStyle("#d4a05f")}
          />
          <button
            className="control-button"
            onClick={() => window.api.window.maximize()}
            title="Maximize"
            aria-label="Maximize window"
            style={controlButtonStyle("#78aa86")}
          />
          <button
            className="control-button"
            onClick={() => window.api.window.close()}
            title="Close"
            aria-label="Close window"
            style={controlButtonStyle("#cd6d68")}
          />
        </div>
      )}
    </div>
  );
}
