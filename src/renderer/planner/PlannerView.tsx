import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ModuleHeader } from "../shell/ModuleHeader";
import { usePlannerStore } from "./planner-store";
import { DateNav } from "./DateNav";
import { QuickAddInput } from "./QuickAddInput";
import { TaskList } from "./TaskList";
import { DailyNotesView } from "./DailyNotesView";
import { ContextMenu } from "../shared/ContextMenu";
import { useContextMenu } from "../shared/useContextMenu";
import { CalendarPopup } from "../shared/CalendarPopup";
import type { ContextMenuItem } from "../shared/ContextMenu";
import { TagCreateDialog } from "../tags/TagCreateDialog";
import { useTagsStore } from "../tags/tags-store";

interface PlannerViewProps {
  newItemRequestId?: number;
  onNewItemHandled?: (requestId: number) => void;
  highlightTaskId?: string;
}

export function PlannerView({
  newItemRequestId,
  onNewItemHandled,
  highlightTaskId,
}: PlannerViewProps): React.JSX.Element {
  const quickAddRef = useRef<HTMLInputElement>(null);

  const {
    tasks,
    isLoaded,
    viewDate,
    activeTab,
    loadTasks,
    createTask,
    toggleComplete,
    updateTask,
    deleteTask,
    reorderTasks,
    navigateDay,
    setActiveTab,
    loadNotes,
  } = usePlannerStore(
    useShallow((state) => ({
      tasks: state.tasks,
      isLoaded: state.isLoaded,
      viewDate: state.viewDate,
      activeTab: state.activeTab,
      loadTasks: state.loadTasks,
      createTask: state.createTask,
      toggleComplete: state.toggleComplete,
      updateTask: state.updateTask,
      deleteTask: state.deleteTask,
      reorderTasks: state.reorderTasks,
      navigateDay: state.navigateDay,
      setActiveTab: state.setActiveTab,
      loadNotes: state.loadNotes,
    })),
  );

  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskEditorInitialFocus, setTaskEditorInitialFocus] = useState<
    "title" | "notes"
  >("title");
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [movePickerTaskId, setMovePickerTaskId] = useState<string | null>(null);
  const [movePickerPos, setMovePickerPos] = useState({ x: 0, y: 0 });
  const [tagDialogTaskId, setTagDialogTaskId] = useState<string | null>(null);
  const ensureItemTags = useTagsStore((state) => state.ensureItemTags);
  const setTagAssignment = useTagsStore((state) => state.setTagAssignment);
  const createTag = useTagsStore((state) => state.createTag);

  useEffect(() => {
    void loadTasks(viewDate);
  }, [loadTasks, viewDate]);

  // Load notes when switching to notes tab or when date changes while on notes tab
  useEffect(() => {
    if (activeTab === "notes") {
      void loadNotes(viewDate);
    }
  }, [activeTab, loadNotes, viewDate]);

  useEffect(() => {
    if (typeof newItemRequestId !== "number") {
      return;
    }
    setActiveTab("tasks");
    const frameId = window.requestAnimationFrame(() => {
      quickAddRef.current?.focus();
    });
    onNewItemHandled?.(newItemRequestId);
    return () => window.cancelAnimationFrame(frameId);
  }, [newItemRequestId, onNewItemHandled, setActiveTab]);

  const tasksDone = tasks.filter((t) => t.completed).length;
  const tasksTotal = tasks.length;

  const tabStyle = (tab: "tasks" | "notes"): React.CSSProperties =>
    ({
      fontSize: "var(--font-size-body)",
      color:
        activeTab === tab
          ? "var(--color-text-primary)"
          : "var(--color-text-secondary)",
      paddingLeft: "var(--space-2)",
      paddingRight: "var(--space-2)",
      paddingTop: "0",
      paddingBottom: "0",
      height: "40px",
      cursor: "pointer",
      background: "transparent",
      border: "none",
      borderBottom:
        activeTab === tab
          ? "2px solid var(--color-accent)"
          : "2px solid transparent",
      fontFamily: "inherit",
      display: "flex",
      alignItems: "center",
      transition: `color var(--duration-fast) ease-out, border-color var(--duration-fast) ease-out`,
    }) as React.CSSProperties;

  function handleClickTask(taskId: string): void {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  }

  function openTaskEditor(
    taskId: string,
    focusField: "title" | "notes" = "title",
  ): void {
    setDeletingTaskId(null);
    setTaskEditorInitialFocus(focusField);
    setEditingTaskId(taskId);
  }

  function handleOpenNotesEditor(taskId: string): void {
    setExpandedTaskId(taskId);
    openTaskEditor(taskId, "notes");
  }

  async function handleTaskContextMenu(
    e: React.MouseEvent,
    taskId: string,
  ): Promise<void> {
    const assignedTags = await ensureItemTags("task", taskId);
    const assignedTagIds = new Set(assignedTags.map((tag) => tag.id));
    const tags = useTagsStore.getState().tags;
    const tagChildren: ContextMenuItem[] = [
      ...tags.map((tag) => ({
        label: tag.name,
        checked: assignedTagIds.has(tag.id),
        closeOnClick: false,
        onClick: () => {
          void (async () => {
            const latestAssigned = await useTagsStore
              .getState()
              .ensureItemTags("task", taskId);
            const isAssigned = latestAssigned.some(
              (entry) => entry.id === tag.id,
            );
            await useTagsStore
              .getState()
              .setTagAssignment("task", taskId, tag.id, !isAssigned);
          })();
        },
      })),
      {
        label: "New tag...",
        onClick: () => setTagDialogTaskId(taskId),
      },
    ];

    showContextMenu(e, [
      {
        label: "Edit",
        onClick: () => {
          setExpandedTaskId(null);
          openTaskEditor(taskId);
        },
      },
      {
        label: "Move to date",
        onClick: () => {
          setMovePickerTaskId(taskId);
          setMovePickerPos({ x: e.clientX, y: e.clientY });
        },
      },
      {
        label: "Set P1 priority",
        onClick: () => {
          void updateTask(taskId, { priority: 1 });
        },
      },
      {
        label: "Set P2 priority",
        onClick: () => {
          void updateTask(taskId, { priority: 2 });
        },
      },
      {
        label: "Set P3 priority",
        onClick: () => {
          void updateTask(taskId, { priority: 3 });
        },
      },
      {
        label: "Clear priority",
        onClick: () => {
          void updateTask(taskId, { priority: 0 });
        },
      },
      {
        label: "Tags",
        onClick: () => {},
        children: tagChildren,
      },
      {
        label: "Delete",
        onClick: () => {
          setEditingTaskId(null);
          setDeletingTaskId(taskId);
        },
        destructive: true,
      },
    ]);
  }

  function handleSaveEdit(
    id: string,
    data: { title: string; notes: string },
  ): void {
    void updateTask(id, { title: data.title, notes: data.notes });
    setEditingTaskId(null);
    setTaskEditorInitialFocus("title");
  }

  function handleConfirmDelete(id: string): void {
    void deleteTask(id);
    setDeletingTaskId(null);
  }

  async function handleMoveToDate(newDate: string): Promise<void> {
    if (!movePickerTaskId || !newDate) return;
    await updateTask(movePickerTaskId, { date: newDate });
    setMovePickerTaskId(null);
  }

  function handleCancelEdit(): void {
    setEditingTaskId(null);
    setTaskEditorInitialFocus("title");
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <ModuleHeader
        moduleId="planner"
        left={
          <DateNav
            viewDate={viewDate}
            onPrev={() => navigateDay(-1)}
            onNext={() => navigateDay(1)}
            tasksDone={tasksDone}
            tasksTotal={tasksTotal}
            onDateSelect={(date) =>
              usePlannerStore.getState().setViewDate(date)
            }
          />
        }
        right={
          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              style={tabStyle("tasks")}
              onClick={() => setActiveTab("tasks")}
            >
              Tasks
            </button>
            <button
              style={tabStyle("notes")}
              onClick={() => setActiveTab("notes")}
            >
              Notes
            </button>
          </div>
        }
      />

      <div
        style={{
          flex: 1,
          overflow: activeTab === "notes" ? "hidden" : "auto",
          padding: activeTab === "notes" ? "0" : "var(--space-4)",
          display: activeTab === "notes" ? "flex" : "block",
          flexDirection: "column",
        }}
      >
        {activeTab === "tasks" ? (
          <>
            <QuickAddInput
              date={viewDate}
              onAdd={createTask}
              inputRef={quickAddRef}
            />
            {isLoaded && (
              <TaskList
                tasks={tasks}
                onToggleComplete={toggleComplete}
                onContextMenu={handleTaskContextMenu}
                onReorder={reorderTasks}
                editingTaskId={editingTaskId}
                deletingTaskId={deletingTaskId}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                editFocusField={taskEditorInitialFocus}
                onConfirmDelete={handleConfirmDelete}
                onCancelDelete={() => setDeletingTaskId(null)}
                viewDate={viewDate}
                expandedTaskId={expandedTaskId}
                onClickTask={handleClickTask}
                onOpenNotesEditor={handleOpenNotesEditor}
                highlightTaskId={highlightTaskId}
              />
            )}
          </>
        ) : (
          <DailyNotesView date={viewDate} />
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          items={contextMenu.items}
          position={contextMenu.position}
          onClose={hideContextMenu}
        />
      )}

      {/* Move to date — CalendarPopup positioned at context menu click location */}
      {movePickerTaskId && (
        <CalendarPopup
          selectedDate={viewDate}
          onSelect={(date) => {
            handleMoveToDate(date);
          }}
          onClose={() => setMovePickerTaskId(null)}
          position={movePickerPos}
          showTaskDots={false}
        />
      )}

      <TagCreateDialog
        isOpen={tagDialogTaskId !== null}
        onClose={() => setTagDialogTaskId(null)}
        onCreate={async (name) => {
          const tag = await createTag(name);
          if (tag && tagDialogTaskId) {
            await setTagAssignment("task", tagDialogTaskId, tag.id, true);
          }
          setTagDialogTaskId(null);
        }}
      />
    </div>
  );
}
