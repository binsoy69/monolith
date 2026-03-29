import { useEffect, useRef } from "react";

interface KeyboardShortcutOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = {
  Navigation: [
    { keys: ["Alt", "1"], label: "Dashboard" },
    { keys: ["Alt", "2"], label: "Habits" },
    { keys: ["Alt", "3"], label: "Planner" },
    { keys: ["Alt", "4"], label: "Expenses" },
    { keys: ["Esc"], label: "Close or return to dashboard" },
  ],
  "Module actions": [
    { keys: ["N"], label: "Create a new item in the active module" },
    { keys: ["Left"], label: "Previous day in planner" },
    { keys: ["Right"], label: "Next day in planner" },
    { keys: ["T"], label: "Jump to today in planner" },
  ],
  "Quick add": [
    { keys: ["Ctrl", "K"], label: "Open command palette" },
    { keys: ["?"], label: "Open this overlay" },
    { keys: ["Up", "Down"], label: "Move through palette items" },
    { keys: ["Enter"], label: "Confirm the selected action" },
  ],
};

export function KeyboardShortcutOverlay({
  isOpen,
  onClose,
}: KeyboardShortcutOverlayProps): React.JSX.Element | null {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent): void {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop">
      <div ref={overlayRef} className="dialog-shell">
        <div className="dialog-header">
          <h2 className="dialog-title">Keyboard shortcuts</h2>
          <p className="dialog-description">
            The app is faster when you stay on the keyboard. These are the core
            controls.
          </p>
        </div>

        <div className="shortcut-body">
          <div className="shortcut-grid">
            {Object.entries(SHORTCUTS).map(([section, shortcuts]) => (
              <div key={section} className="shortcut-section">
                <h3 className="shortcut-section__title">{section}</h3>
                {shortcuts.map((shortcut) => (
                  <div key={shortcut.label} className="shortcut-row">
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      {shortcut.label}
                    </span>
                    <div className="shortcut-keys">
                      {shortcut.keys.map((key) => (
                        <kbd key={key} className="shortcut-key">
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
