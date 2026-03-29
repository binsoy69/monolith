import { useEffect } from "react";
import type { TaggedItemSummary } from "../../shared/domain-types";
import { ModuleHeader } from "../shell/ModuleHeader";
import { TagChip } from "./TagChip";
import { useTagsStore } from "./tags-store";

function formatItemDate(date: string | null): string | null {
  if (!date) {
    return null;
  }

  const [year, month, day] = date.split("-").map(Number);
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

  return `${months[month - 1]} ${day}, ${year}`;
}

function GroupSection({
  title,
  emptyCopy,
  items,
}: {
  title: string;
  emptyCopy: string;
  items: TaggedItemSummary[];
}): React.JSX.Element {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: "var(--font-size-small)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--color-text-secondary)",
        }}
      >
        {title}
      </h3>

      {items.length === 0 ? (
        <div
          style={{
            padding: "var(--space-3)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-muted)",
            fontSize: "var(--font-size-body)",
          }}
        >
          {emptyCopy}
        </div>
      ) : (
        items.map((item) => (
          <div
            key={`${item.itemType}:${item.itemId}`}
            style={{
              padding: "var(--space-3)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-bg-elevated)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <span
                style={{
                  fontSize: "var(--font-size-body)",
                  color: "var(--color-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.title}
              </span>
              <span
                style={{
                  fontSize: "var(--font-size-small)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {item.subtitle}
              </span>
            </div>

            {item.date ? (
              <span
                style={{
                  flexShrink: 0,
                  fontSize: "var(--font-size-small)",
                  color: "var(--color-text-muted)",
                }}
              >
                {formatItemDate(item.date)}
              </span>
            ) : null}
          </div>
        ))
      )}
    </section>
  );
}

export function TagsView(): React.JSX.Element {
  const tags = useTagsStore((state) => state.tags);
  const selectedTagId = useTagsStore((state) => state.selectedTagId);
  const items = useTagsStore((state) => state.items);
  const isLoaded = useTagsStore((state) => state.isLoaded);
  const loadTags = useTagsStore((state) => state.loadTags);

  useEffect(() => {
    if (!isLoaded) {
      void loadTags();
    }
  }, [isLoaded, loadTags]);

  const selectedTag = tags.find((tag) => tag.id === selectedTagId) ?? null;
  const habits = items.filter((item) => item.itemType === "habit");
  const tasks = items.filter((item) => item.itemType === "task");
  const expenses = items.filter((item) => item.itemType === "expense");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <ModuleHeader
        moduleId="tags"
        right={selectedTag ? <TagChip tag={selectedTag} active /> : undefined}
      />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "var(--space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        {!selectedTag ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-muted)",
              fontSize: "var(--font-size-body)",
              textAlign: "center",
            }}
          >
            Select a tag from the sidebar
          </div>
        ) : (
          <>
            <GroupSection
              title="Habits"
              emptyCopy="No habits tagged"
              items={habits}
            />
            <GroupSection
              title="Tasks"
              emptyCopy="No tasks tagged"
              items={tasks}
            />
            <GroupSection
              title="Expenses"
              emptyCopy="No expenses tagged"
              items={expenses}
            />
          </>
        )}
      </div>
    </div>
  );
}
