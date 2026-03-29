import { useEffect, useRef, useState } from "react";

export type PaletteAction = "add-task" | "log-expense" | "check-habit";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: PaletteAction) => void;
}

const ACTIONS: Array<{ id: PaletteAction; label: string }> = [
  { id: "add-task", label: "Add task" },
  { id: "log-expense", label: "Log expense" },
  { id: "check-habit", label: "Check habit" },
];

export function CommandPalette({
  isOpen,
  onClose,
  onAction,
}: CommandPaletteProps): React.JSX.Element | null {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const filtered = ACTIONS.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

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

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      onAction(filtered[activeIndex].id);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog-shell" ref={overlayRef} onKeyDown={handleKeyDown}>
        <div className="dialog-header">
          <h2 className="dialog-title">Command palette</h2>
          <p className="dialog-description">
            Jump to a fast action without leaving the current surface.
          </p>
        </div>

        <div className="command-body">
          <input
            className="command-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="What do you want to do?"
            style={{
              borderColor: inputFocused
                ? "var(--color-border-focused)"
                : "var(--color-border)",
            }}
          />

          <div className="command-list">
            {filtered.length > 0 ? (
              filtered.map((item, index) => (
                <button
                  key={item.id}
                  className="command-row"
                  data-active={index === activeIndex}
                  onClick={() => onAction(item.id)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="command-row__label">
                    <span className="command-row__title">{item.label}</span>
                    <span className="command-row__caption">
                      Instant module action
                    </span>
                  </span>
                  <span className="shortcut-key">Enter</span>
                </button>
              ))
            ) : (
              <div
                style={{
                  padding: "var(--space-5)",
                  textAlign: "center",
                  fontSize: "var(--font-size-body)",
                  color: "var(--color-text-muted)",
                }}
              >
                No matching actions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
