import { useState, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePlannerStore } from "./planner-store";

interface DailyNotesViewProps {
  date: string;
}

export function DailyNotesView({
  date,
}: DailyNotesViewProps): React.JSX.Element {
  const { notesContent, loadNotes, saveNotes } = usePlannerStore(
    useShallow((state) => ({
      notesContent: state.notesContent,
      loadNotes: state.loadNotes,
      saveNotes: state.saveNotes,
    })),
  );
  const [localContent, setLocalContent] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hasChanged = useRef(false);
  const prevDate = useRef<string | null>(null);
  const latestContent = useRef(localContent);

  useEffect(() => {
    latestContent.current = localContent;
  }, [localContent]);

  // Load notes when date changes
  useEffect(() => {
    // Flush any pending save for the previous date before switching
    if (prevDate.current && prevDate.current !== date && hasChanged.current) {
      clearTimeout(timerRef.current);
      void saveNotes(prevDate.current, latestContent.current);
    }

    // Reset change tracking for the new date
    hasChanged.current = false;
    prevDate.current = date;

    void loadNotes(date);
  }, [date, loadNotes, saveNotes]);

  // Sync local content when store notes change (on load)
  useEffect(() => {
    if (!hasChanged.current) {
      // The local draft must mirror the loaded store value until the user edits it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalContent(notesContent);
    }
  }, [notesContent]);

  // Auto-save with 500ms debounce
  useEffect(() => {
    if (!hasChanged.current) return; // skip initial load
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void saveNotes(date, latestContent.current);
    }, 500);
    return () => clearTimeout(timerRef.current);
  }, [date, localContent, saveNotes]);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      if (hasChanged.current && prevDate.current) {
        void saveNotes(prevDate.current, latestContent.current);
      }
    };
  }, [saveNotes]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    hasChanged.current = true;
    setLocalContent(e.target.value);
  }

  return (
    <textarea
      value={localContent}
      onChange={handleChange}
      placeholder="Write anything about today..."
      style={{
        flex: 1,
        width: "100%",
        backgroundColor: "var(--color-bg-base)",
        border: "none",
        color: "var(--color-text-primary)",
        fontSize: "var(--font-size-body)",
        lineHeight: "var(--line-height-normal)",
        padding: "var(--space-4)",
        resize: "none",
        outline: "none",
        fontFamily: "inherit",
        boxSizing: "border-box",
      }}
    />
  );
}
