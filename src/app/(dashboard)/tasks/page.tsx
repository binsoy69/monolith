import { TaskList } from "@/components/tasks/TaskList";

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-sm text-muted-foreground">
          Manage your to-dos and import from markdown
        </p>
      </div>
      <TaskList />
    </div>
  );
}
