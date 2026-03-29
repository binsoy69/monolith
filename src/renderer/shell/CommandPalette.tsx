import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchResult } from "../../shared/ipc-types";

export type PaletteAction = "add-task" | "log-expense" | "check-habit";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: PaletteAction) => void;
  results: SearchResult[];
  isSearching: boolean;
  onSearchQueryChange: (query: string) => void;
  onSelectResult: (result: SearchResult) => void;
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
  results,
  isSearching,
  onSearchQueryChange,
  onSelectResult,
}: CommandPaletteProps): React.JSX.Element | null {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const filteredActions = ACTIONS.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()),
  );
  const hasSearchQuery = query.trim().length > 0;
  const flattenedItems = useMemo(
    () => [
      ...filteredActions.map((action) => ({ kind: "action" as const, action })),
      ...results.map((result) => ({ kind: "result" as const, result })),
    ],
    [filteredActions, results],
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setActiveIndex(0);
      onSearchQueryChange("");
    }
  }, [isOpen, onSearchQueryChange]);

  useEffect(() => {
    setActiveIndex((index) =>
      Math.min(index, Math.max(flattenedItems.length - 1, 0)),
    );
  }, [flattenedItems.length]);

  function handleResultMeta(result: SearchResult): string {
    if (!result.date) {
      return result.subtitle;
    }

    const [year, month, day] = result.date.split("-").map(Number);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return `${result.subtitle} - ${months[month - 1]} ${day}, ${year}`;
  }

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
      setActiveIndex((i) => Math.min(i + 1, flattenedItems.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter" && flattenedItems.length > 0) {
      e.preventDefault();
      const activeItem = flattenedItems[activeIndex];
      if (activeItem.kind === "action") {
        onAction(activeItem.action.id);
        return;
      }
      onSelectResult(activeItem.result);
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
              onSearchQueryChange(e.target.value);
            }}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Search habits, tasks, expenses, notes..."
            style={{
              borderColor: inputFocused
                ? "var(--color-border-focused)"
                : "var(--color-border)",
            }}
          />

          <div className="command-list">
            <div className="command-section">
              <div className="command-section__label">Actions</div>
              {filteredActions.length > 0 ? (
                filteredActions.map((item, index) => (
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
                <div className="command-empty">No matching actions</div>
              )}
            </div>

            {hasSearchQuery || isSearching || results.length > 0 ? (
              <div className="command-section">
                <div className="command-section__label">Search Results</div>
                {isSearching ? (
                  <div className="command-empty">Searching...</div>
                ) : results.length > 0 ? (
                  results.map((result, index) => {
                    const listIndex = filteredActions.length + index;
                    return (
                      <button
                        key={`${result.type}:${result.id}`}
                        className="command-row"
                        data-active={listIndex === activeIndex}
                        onClick={() => onSelectResult(result)}
                        onMouseEnter={() => setActiveIndex(listIndex)}
                      >
                        <span className="command-row__label">
                          <span className="command-row__title">{result.title}</span>
                          <span className="command-row__meta">
                            {handleResultMeta(result)}
                          </span>
                          {result.snippet ? (
                            <span className="command-row__snippet">
                              {result.snippet}
                            </span>
                          ) : null}
                        </span>
                        <span className="shortcut-key">Enter</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="command-empty">No matching results</div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
