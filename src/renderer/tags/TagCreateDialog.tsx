import { useEffect, useRef, useState } from "react";

interface TagCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export function TagCreateDialog({
  isOpen,
  onClose,
  onCreate,
}: TagCreateDialogProps): React.JSX.Element | null {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setIsSaving(false);
      return;
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(): Promise<void> {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    await onCreate(name);
    setIsSaving(false);
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.46)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1500,
      }}
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "360px",
          backgroundColor: "var(--color-bg-overlay)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
          padding: "var(--space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "var(--font-size-body)",
            color: "var(--color-text-primary)",
          }}
        >
          Create tag
        </h3>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleSubmit();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              onClose();
            }
          }}
          placeholder="New tag name"
          style={{
            width: "100%",
            backgroundColor: "var(--color-bg-base)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-3)",
            color: "var(--color-text-primary)",
            fontSize: "var(--font-size-body)",
            fontFamily: "inherit",
            outline: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--space-2)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              fontSize: "var(--font-size-body)",
              fontFamily: "inherit",
              padding: "var(--space-1) var(--space-2)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSaving}
            style={{
              backgroundColor: "var(--color-accent)",
              border: "none",
              borderRadius: "var(--radius-md)",
              color: "white",
              cursor: isSaving ? "wait" : "pointer",
              fontSize: "var(--font-size-body)",
              fontFamily: "inherit",
              padding: "var(--space-2) var(--space-3)",
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            Create tag
          </button>
        </div>
      </div>
    </div>
  );
}
