import { JournalList } from "@/components/journal/JournalList";

export default function JournalPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
        <p className="text-sm text-muted-foreground">Your thoughts and reflections</p>
      </div>
      <JournalList />
    </div>
  );
}
