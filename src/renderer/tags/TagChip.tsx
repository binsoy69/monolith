import type { Tag } from "../../shared/domain-types";

interface TagChipProps {
  tag: Tag;
  active?: boolean;
  onClick?: () => void;
}

function getTagChipStyle(
  active: boolean,
  clickable: boolean,
): React.CSSProperties {
  return {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    padding: "var(--space-2) var(--space-3)",
    backgroundColor: active ? "var(--color-bg-subtle)" : "transparent",
    border: `1px solid ${active ? "var(--color-border-focused)" : "var(--color-border)"}`,
    borderRadius: "var(--radius-md)",
    color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
    fontSize: "var(--font-size-small)",
    fontFamily: "inherit",
    cursor: clickable ? "pointer" : "default",
    transition:
      "background-color var(--duration-fast) ease-out, border-color var(--duration-fast) ease-out, color var(--duration-fast) ease-out",
  };
}

function TagChipContent({ tag }: { tag: Tag }): React.JSX.Element {
  return (
    <>
      <span
        aria-hidden="true"
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "999px",
          backgroundColor: tag.color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {tag.name}
      </span>
    </>
  );
}

export function TagChip({
  tag,
  active = false,
  onClick,
}: TagChipProps): React.JSX.Element {
  if (!onClick) {
    return (
      <span style={getTagChipStyle(active, false)}>
        <TagChipContent tag={tag} />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      style={getTagChipStyle(active, true)}
      title={tag.name}
      aria-label={tag.name}
    >
      <TagChipContent tag={tag} />
    </button>
  );
}
